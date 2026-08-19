/**
 * Per-API-key rate limiting for the B2B /v1/catalog/* surface.
 *
 * Algorithm: token bucket. Each key has a bucket of size
 * `rate_limit_per_minute` (the per-key limit from `api_keys` row,
 * default 100). Tokens refill continuously at
 * `rate_limit_per_minute / 60` per second. Each request consumes 1
 * token. If the bucket is empty, return 429.
 *
 * Why token bucket over fixed window?
 *   - Fixed window allows 2× burst at window edges (last second of
 *     minute N + first second of minute N+1 = 200 req in 2s for a
 *     100/min limit). Token bucket smooths this.
 *   - Standard for B2B APIs (Stripe, GitHub, etc. all use it).
 *
 * State: in-memory Map<apiKeyId, { tokens, lastRefillAt }>. Same
 * process-local pattern as v1-catalog-cache. If we scale to
 * multiple containers, swap for Redis. The interface is the
 * only contract that matters.
 *
 * Concurrency: Node.js is single-threaded for the JS event loop,
 * so read-then-write on a Map entry is safe — no locking needed.
 *
 * LRU: hard cap of 5000 keys. When full, evict the oldest entry.
 * The oldest is least likely to be a hot consumer, so the eviction
 * cost is minimal.
 */

import type { ApiKeyRow } from './api-auth';

interface BucketState {
  tokens: number;
  lastRefillAt: number; // Date.now() ms
}

const MAX_BUCKETS = 5000;

const buckets = new Map<string, BucketState>();

export type RateLimitResult =
  | {
      ok: true;
      limit: number;
      remaining: number;
      resetAt: number; // Unix seconds — when the bucket is full
    }
  | {
      ok: false;
      limit: number;
      remaining: 0;
      resetAt: number;
      retryAfter: number; // seconds until next token
    };

/**
 * Consume 1 token from the key's bucket. Returns the result + the
 * headers the route should set (X-RateLimit-*). On overflow, the
 * route should return 429 with `Retry-After: result.retryAfter`.
 */
export function consumeToken(key: ApiKeyRow): RateLimitResult {
  const limit = key.rate_limit_per_minute;
  const now = Date.now();
  let state = buckets.get(key.id);

  if (!state) {
    // First request from this key. Initialize the bucket full.
    if (buckets.size >= MAX_BUCKETS) {
      // LRU eviction: drop the oldest entry (Map iteration is in
      // insertion order in JS).
      const firstKey = buckets.keys().next().value;
      if (firstKey !== undefined) buckets.delete(firstKey);
    }
    state = { tokens: limit, lastRefillAt: now };
    buckets.set(key.id, state);
  } else {
    // Refill: add (elapsed_ms / 1000) * (limit / 60) tokens, capped
    // at `limit`. Float math is fine here — we floor the result.
    const elapsedSec = (now - state.lastRefillAt) / 1000;
    const refill = elapsedSec * (limit / 60);
    state.tokens = Math.min(limit, state.tokens + refill);
    state.lastRefillAt = now;
  }

  if (state.tokens >= 1) {
    state.tokens -= 1;
    const remaining = Math.floor(state.tokens);
    // Reset = time when the bucket is fully replenished. If the
    // bucket is currently at `remaining` and we add (limit - remaining)
    // tokens at (limit / 60) per second, that takes
    // (limit - remaining) / (limit / 60) = 60 * (limit - remaining) / limit
    // seconds. The bucket can never refill faster than that.
    const secondsToFull = (limit - remaining) / (limit / 60);
    const resetAt = Math.ceil((now + secondsToFull * 1000) / 1000);
    return { ok: true, limit, remaining, resetAt };
  }

  // Bucket empty. Compute Retry-After: how long until the bucket
  // has 1 full token? Refill rate is limit/60 per second, so 1 token
  // takes 60/limit seconds.
  const retryAfter = Math.max(1, Math.ceil(60 / limit));
  // Reset = same as retry-after, since the bucket is at 0.
  const resetAt = Math.ceil((now + retryAfter * 1000) / 1000);
  return { ok: false, limit, remaining: 0, resetAt, retryAfter };
}

/** Build the X-RateLimit-* response headers from a result. */
export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(r.limit),
    'X-RateLimit-Remaining': String(r.remaining),
    'X-RateLimit-Reset': String(r.resetAt),
  };
}

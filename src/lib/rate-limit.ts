/**
 * Tiny in-memory rate limiter (sliding window).
 *
 * Not a substitute for a real Redis-backed limiter at scale — this
 * lives in the Node process and resets on deploy/restart, so a
 * determined attacker hitting multiple replicas would still slip
 * through. But for abuse-from-inside (a logged-in owner hammering
 * the team invite endpoint to spam emails at the same address or
 * drain the Resend quota) it's plenty.
 *
 * Keyed by a caller-supplied identifier (typically the owner's
 * auth.uid() + the action name) so each owner has their own bucket.
 *
 * If you need cross-process limiting later, swap the Map for a
 * Redis/Upstash adapter behind the same `check()` signature.
 */

interface Bucket {
  /** Timestamps of recent hits within the window, oldest first. */
  hits: number[];
}

const buckets = new Map<string, Bucket>();

interface RateLimitOptions {
  /** Action key — combine with the caller id to form the bucket key. */
  action: string;
  /** Caller identifier (auth.uid, IP, etc). */
  key: string;
  /** Max hits allowed within `windowMs`. */
  max: number;
  /** Sliding window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  /** Hits remaining in the current window (0 when blocked). */
  remaining: number;
  /** Seconds until the bucket can accept another hit. */
  retryAfterSec: number;
}

export function checkRateLimit({
  action,
  key,
  max,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  const bucketKey = `${action}:${key}`;
  const now = Date.now();
  const cutoff = now - windowMs;

  let bucket = buckets.get(bucketKey);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(bucketKey, bucket);
  }

  // Drop hits that fell out of the window.
  while (bucket.hits.length > 0 && bucket.hits[0] <= cutoff) {
    bucket.hits.shift();
  }

  if (bucket.hits.length >= max) {
    const oldest = bucket.hits[0];
    const retryAfterMs = oldest + windowMs - now;
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  bucket.hits.push(now);
  return { ok: true, remaining: max - bucket.hits.length, retryAfterSec: 0 };
}

/**
 * Test-only: clear all buckets. Used by integration tests that
 * exercise rate-limited paths in sequence.
 */
export function _resetRateLimits(): void {
  buckets.clear();
}

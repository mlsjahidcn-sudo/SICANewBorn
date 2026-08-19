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

// ---------------------------------------------------------------------------
// Public write-endpoint guards (Track 1.1)
// ---------------------------------------------------------------------------
//
// The public intake endpoints (/api/leads, /api/assessments,
// /api/leads/chat, /api/upload/transcript, /api/chat/session) take
// anonymous POSTs and several of them spend real money per call
// (Resend email, WABPO WhatsApp, drip scheduling). Two buckets per
// request:
//
//   per-IP  — the standard abuse guard (first x-forwarded-for hop)
//   global  — one shared bucket per action, blunts rotating-IP
//             floods that would otherwise sail past per-IP limits
//
// The global cap is intentionally generous (real users share NAT
// exits); it exists to cap worst-case quota spend, not to shape
// legit traffic.

/**
 * Extract the originating client IP from common proxy headers.
 * First `x-forwarded-for` entry wins (every hop appends, so the
 * first is the original client). Headerless callers share the
 * 'unknown' bucket — almost certainly localhost / dev tooling.
 */
export function extractClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

export interface PublicRateLimitResult {
  blocked: boolean;
  remaining: number;
  retryAfterSec: number;
}

/**
 * Per-IP + global sliding-window check for anonymous write
 * endpoints. Call BEFORE parsing the body so even malformed
 * requests count (a bot looping on a 400 path still burns quota).
 */
export function checkPublicRateLimit({
  action,
  request,
  maxPerIp,
  maxGlobal,
  windowMs,
}: {
  /** Action key, e.g. 'public-leads'. */
  action: string;
  request: Request;
  maxPerIp: number;
  /** Shared bucket across all IPs. Pass a generous cap. */
  maxGlobal: number;
  windowMs: number;
}): PublicRateLimitResult {
  const ip = extractClientIp(request);
  const perIp = checkRateLimit({ action, key: ip, max: maxPerIp, windowMs });
  if (!perIp.ok) {
    return { blocked: true, remaining: 0, retryAfterSec: perIp.retryAfterSec };
  }
  const global = checkRateLimit({ action, key: '__global__', max: maxGlobal, windowMs });
  if (!global.ok) {
    return { blocked: true, remaining: 0, retryAfterSec: global.retryAfterSec };
  }
  return { blocked: false, remaining: perIp.remaining, retryAfterSec: 0 };
}

/**
 * Honeypot check for public forms. The form renders a visually
 * hidden `website` input that humans never fill; bots that
 * auto-complete every field give themselves away. Caller should
 * respond with a FAKE success (200) rather than an error — an
 * obvious rejection just teaches the bot which field to drop.
 */
export function isHoneypotFilled(body: Record<string, unknown>): boolean {
  const value = body.website;
  return typeof value === 'string' && value.trim().length > 0;
}

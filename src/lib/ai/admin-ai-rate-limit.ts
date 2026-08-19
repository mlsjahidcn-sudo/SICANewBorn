import { NextResponse } from 'next/server';
import { checkRateLimit, extractClientIp } from '@/lib/rate-limit';

/**
 * Per-admin AI rate limiter (Phase 36).
 *
 * The four admin AI endpoints share the same provider quota
 * (Doubao + DeepSeek free tiers) and there's no admin gate
 * between them — an admin could loop "Suggest 5 universities"
 * 200x in a row and burn the entire monthly token allowance.
 *
 * Each admin AI action gets a per-admin bucket keyed by their
 * Supabase auth.uid(). Limits are tuned to "sensible admin
 * power use" (not paranoid-paranoid):
 *
 *   - generate-university  10 / 15 min  (single-row AI; ~2-4K tokens per call)
 *   - bulk-suggest-names    5 / 15 min  (~1.5K tokens each — 5x the cheaper step)
 *   - generate-blog         3 / 15 min  (long output; ~3-6K tokens)
 *   - run-automation        5 / 15 min  (kicks off a Phase 41 news run)
 *
 * The `checkRateLimit` primitive from Phase 14 is shared with
 * the partner team-invite limiter. It uses an in-memory Map +
 * 15-minute sliding window; resets on deploy/restart. Good
 * enough for "abuse-from-inside" — a coordinated multi-replica
 * DDoS isn't the threat we're protecting against here.
 *
 * Returns either `{ blocked: false, remaining }` for the caller
 * to continue, or `{ blocked: true, response }` — a NextResponse
 * with status 429 and `Retry-After` header that the caller should
 * return immediately.
 */

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

// Centralized limit table. Bumping these is a one-liner; bumping
// the window is also a single place.
const ADMIN_AI_LIMITS = {
  'generate-university': 10,
  'bulk-suggest-names': 5,
  'generate-blog': 3,
  'run-automation': 5,
} as const;

export type AdminAIAction = keyof typeof ADMIN_AI_LIMITS;

export type AdminAIRateLimitResult =
  | { blocked: false; remaining: number }
  | { blocked: true; response: NextResponse };

/**
 * Returns a discriminated result — the caller checks `.blocked`.
 * When `true`, `.response` is a fully-formed NextResponse with
 * 429 status + `Retry-After` header.
 */
export function checkAdminAIRateLimit(
  userId: string,
  action: AdminAIAction,
): AdminAIRateLimitResult {
  const max = ADMIN_AI_LIMITS[action];
  const rl = checkRateLimit({
    action: `admin-ai-${action}`,
    key: userId,
    max,
    windowMs: FIFTEEN_MINUTES_MS,
  });
  if (rl.ok) {
    return { blocked: false, remaining: rl.remaining };
  }
  return {
    blocked: true,
    response: NextResponse.json(
      {
        error: `Too many AI requests. Try again in ${rl.retryAfterSec}s.`,
        code: 'AI_RATE_LIMITED',
        retryAfterSec: rl.retryAfterSec,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfterSec) },
      },
    ),
  };
}

// ---------------------------------------------------------------------------
// Public chatbot (per-IP)
// ---------------------------------------------------------------------------
//
// The SICA chatbot is the only public-facing AI surface — no login,
// no admin token, just an open SSE stream. Per-IP limiting prevents
// a single user (or a bot net of one) from draining the provider quota
// through the chatbot endpoint specifically.
//
// Limit matches the admin rate for the cheap per-message case: 10
// messages per 15 minutes per IP. Excludes only obvious internal
// proxies (Railway-injected `x-forwarded-for` is the source of truth).

const CHATBOT_LIMIT = 10;
const CHATBOT_WINDOW_MS = FIFTEEN_MINUTES_MS;

export type ChatbotRateLimitResult =
  | { blocked: false; remaining: number }
  | { blocked: true; response: NextResponse };

/**
 * The caller passes the request; we extract the IP from the standard
 * `x-forwarded-for` header chain (the first hop in the comma-separated
 * list is the original client). Falls back to 'unknown' so all
 * headerless callers share one bucket — not perfect but defensible
 * (they're almost certainly localhost / dev tooling).
 */
export function checkChatbotRateLimit(
  request: Request,
): ChatbotRateLimitResult {
  const ip = extractClientIp(request);
  const rl = checkRateLimit({
    action: 'public-chatbot',
    key: ip,
    max: CHATBOT_LIMIT,
    windowMs: CHATBOT_WINDOW_MS,
  });
  if (rl.ok) {
    return { blocked: false, remaining: rl.remaining };
  }
  return {
    blocked: true,
    response: NextResponse.json(
      {
        error: `You're sending messages too quickly. Please wait ${rl.retryAfterSec}s before trying again.`,
        code: 'CHATBOT_RATE_LIMITED',
        retryAfterSec: rl.retryAfterSec,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfterSec) },
      },
    ),
  };
}

/**
 * IP extraction moved to `extractClientIp` in @/lib/rate-limit
 * (Track 1.1) — shared with the public write-endpoint guards.
 */

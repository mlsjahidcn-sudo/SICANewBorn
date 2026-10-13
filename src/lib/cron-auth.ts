import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Shared auth for the cron-triggered endpoints
 * (/api/cron/generate-news, /api/cron/chatbot-faqs,
 * /api/email/drip-cron).
 *
 * Contract:
 *  - Secret set   → caller must send it in the `x-cron-secret` header
 *                   (timing-safe compare via fixed-length SHA-256 digests).
 *  - Secret unset → allowed ONLY outside production (dev-friendly). In
 *                   production the endpoint fails closed with 503 — these
 *                   endpoints trigger AI generation and mass email sends,
 *                   so an open trigger is a real spend vector, and a
 *                   silently-open endpoint is indistinguishable from a
 *                   correctly-configured one until someone notices the bill.
 */

export type CronAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; error: string };

export function verifyCronSecret(
  request: Request,
  envVar: 'NEWS_CRON_SECRET' | 'DRIP_CRON_SECRET' | 'STUDENT_FEES_CRON_SECRET' | 'FAQ_CRON_SECRET',
): CronAuthResult {
  const expected = process.env[envVar];
  if (!expected) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, status: 503, error: `${envVar} is not configured` };
    }
    return { ok: true };
  }
  const got = request.headers.get('x-cron-secret') ?? '';
  const gotDigest = createHash('sha256').update(got).digest();
  const expectedDigest = createHash('sha256').update(expected).digest();
  if (!timingSafeEqual(gotDigest, expectedDigest)) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }
  return { ok: true };
}

/**
 * Tiny shared helpers for the B2B /v1/catalog/* route handlers.
 *
 * Why a separate file?
 *   - The 429 (rate-limit-exceeded) response shape is identical
 *     across all 4 routes. Centralizing keeps the rate-limit
 *     contract in one place.
 *   - The `requireApiKey` + `hasScope` + `consumeToken` triplet is
 *     called in the same order by every route. The route itself
 *     just needs the key + rate-limit result to do its work; the
 *     boilerplate is noise.
 */

import { NextRequest, NextResponse } from 'next/server';
import { hasScope, requireApiKey, type ApiKeyRow } from './api-auth';
import { getServerEnv } from './supabase-auth';
import {
  consumeToken,
  rateLimitHeaders,
  type RateLimitResult,
} from './v1-rate-limit';

export { rateLimitHeaders };

export type V1SetupResult =
  | {
      ok: true;
      key: ApiKeyRow;
      rate: RateLimitResult;
    }
  | { ok: false; response: NextResponse };

/**
 * Standard prelude every /v1/* GET runs:
 *   1. Auth (Bearer sk_live_…)
 *   2. Scope check (read:catalog)
 *   3. Service env check (Supabase configured)
 *   4. Rate limit (per-key token bucket)
 *
 * On failure, returns `{ ok: false, response }` — the route returns
 * that response directly. On success, returns `{ ok: true, key, rate }`
 * — the route uses the rate result to set X-RateLimit-* headers on
 * its successful response.
 */
export async function setupV1Request(
  request: NextRequest,
): Promise<V1SetupResult> {
  const auth = await requireApiKey(request);
  if (!auth.ok) {
    return { ok: false, response: NextResponse.json({ error: auth.error }, { status: auth.status }) };
  }
  if (!hasScope(auth.key, 'read:catalog')) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'API key missing required scope: read:catalog' },
        { status: 403 },
      ),
    };
  }
  if (!getServerEnv().serviceKey) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Service not configured' }, { status: 503 }),
    };
  }
  const rate = consumeToken(auth.key);
  if (!rate.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: { ...rateLimitHeaders(rate), 'Retry-After': String(rate.retryAfter) },
        },
      ),
    };
  }
  return { ok: true, key: auth.key, rate };
}

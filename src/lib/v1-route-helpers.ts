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
import { corsHeadersFor } from './v1-cors';

export { rateLimitHeaders, corsHeadersFor };

/**
 * Combine the rate-limit, CORS, and any route-specific response headers
 * into one object. Routes spread this into their `NextResponse.json(...,
 * { headers })` call. The order matters: extra headers first (X-Cache
 * etc.) so they aren't accidentally overwritten.
 */
export function v1ResponseHeaders(
  rate: RateLimitResult,
  cors: Record<string, string>,
  extra: Record<string, string> = {},
): Record<string, string> {
  return { ...extra, ...rateLimitHeaders(rate), ...cors };
}

export type V1SetupResult =
  | {
      ok: true;
      key: ApiKeyRow;
      rate: RateLimitResult;
      cors: Record<string, string>;
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
 *
 * CORS: the response (success or failure) includes CORS headers iff
 * the request's Origin is in the calling key's `cors_origins` array
 * (or the key has `'*'`). Routes spread `corsHeadersFor(request, key)`
 * into the success path's headers. For the error paths inside this
 * function, the key is known so the same check runs and the headers
 * are attached inline.
 */
export async function setupV1Request(
  request: NextRequest,
): Promise<V1SetupResult> {
  const auth = await requireApiKey(request);
  if (!auth.ok) {
    // Auth failed — we don't know which key (if any) the request
    // is for, so no per-key CORS. The OPTIONS handler is the
    // path that handles preflights; this 401 has no CORS by design
    // (the browser will read the body and show the error regardless
    // of CORS state).
    return { ok: false, response: NextResponse.json({ error: auth.error }, { status: auth.status }) };
  }
  const cors = corsHeadersFor(request, auth.key.cors_origins);
  if (!hasScope(auth.key, 'read:catalog')) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'API key missing required scope: read:catalog' },
        { status: 403, headers: cors },
      ),
    };
  }
  if (!getServerEnv().serviceKey) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Service not configured' }, { status: 503, headers: cors }),
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
          headers: { ...rateLimitHeaders(rate), ...cors, 'Retry-After': String(rate.retryAfter) },
        },
      ),
    };
  }
  return { ok: true, key: auth.key, rate, cors };
}

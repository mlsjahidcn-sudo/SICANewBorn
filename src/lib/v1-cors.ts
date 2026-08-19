/**
 * CORS handling for the B2B /v1/* surface.
 *
 * Browser-side consumers (e.g. a partner's marketing site calling
 * SICA from client-side JS) need CORS headers to make cross-origin
 * requests. The policy is per-key: the API key's `cors_origins`
 * column is the source of truth.
 *
 * Two layers of defense:
 *   1. Preflight (OPTIONS): trust the Origin header alone. Any
 *      origin that looks valid (https://, or http://localhost for
 *      dev) gets the preflight response. The actual request
 *      below is what enforces the per-key allowlist.
 *   2. Actual request: the route looks up the API key, then
 *      checks if the request's Origin is in the key's
 *      `cors_origins` array. If not, no `Access-Control-Allow-Origin`
 *      header is attached — the browser will block the response
 *      client-side. The route still returns the data (so curl
 *      and server-side consumers keep working), but a browser
 *      that didn't get the header can't read it.
 *
 * Why not a global allowlist or `*`? Per-key CORS is the safest
 * default: a partner who leaks their key only exposes their own
 * origin-allowlisted surface, not the whole catalog. A future
 * sandbox product (Phase 73) will be where wildcard keys live.
 *
 * What about the actual security model? CORS is browser-enforced,
 * not server-enforced. It stops an honest user's browser from
 * sending the Authorization header to an attacker's site. It does
 * NOT stop a determined attacker — the API key is what stops
 * them. CORS is defense-in-depth, not the primary gate.
 */

import type { NextRequest } from 'next/server';

export const CORS_ALLOWED_METHODS = 'GET, POST, PATCH, DELETE, OPTIONS';
export const CORS_ALLOWED_HEADERS = 'Authorization, Content-Type, X-SICA-Requested-With';
export const CORS_MAX_AGE_SECONDS = '86400'; // 24h — browsers cache preflights

/**
 * Validate that a string looks like a usable CORS origin.
 * https://, or http://localhost / 127.0.0.1 (dev only).
 * Returns true if the origin is well-formed and safe to echo.
 */
export function isValidCorsOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (origin === '*') return true;
  try {
    const u = new URL(origin);
    if (u.protocol === 'https:') return true;
    if (u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Decide if the given request's Origin is allowed by the key.
 * The key's `cors_origins` is an array. Empty array = no CORS
 * (current behavior). '*' as a single-element array = wildcard
 * (sandbox-only — the admin UI should warn or block this for
 * production keys).
 *
 * Returns the origin string to echo in the response header
 * (which is the Origin itself, or '*' for wildcard), or null if
 * the request should NOT have CORS headers attached.
 */
export function originAllowedForKey(
  requestOrigin: string | null,
  keyCorsOrigins: string[] | null | undefined,
): string | null {
  if (!requestOrigin) return null;
  if (!keyCorsOrigins || keyCorsOrigins.length === 0) return null;
  if (keyCorsOrigins.includes('*')) return '*';
  if (keyCorsOrigins.includes(requestOrigin)) return requestOrigin;
  return null;
}

/**
 * Build the CORS response headers for an authenticated /v1/*
 * response. Returns {} when the origin isn't allowed (so the
 * caller can spread it unconditionally).
 */
export function corsHeadersFor(
  request: NextRequest,
  keyCorsOrigins: string[] | null | undefined,
): Record<string, string> {
  const origin = request.headers.get('origin');
  const allowed = originAllowedForKey(origin, keyCorsOrigins);
  if (!allowed) return {};
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': CORS_ALLOWED_METHODS,
    'Access-Control-Allow-Headers': CORS_ALLOWED_HEADERS,
    'Vary': 'Origin',
  };
}

/**
 * Build the CORS preflight response (for OPTIONS requests).
 *
 * The preflight is the part the browser sends BEFORE the real
 * request, to ask "can I do this?". It does NOT carry the
 * Authorization header, so we don't know which key is calling.
 * Standard approach: echo the Origin back if it looks valid
 * (https or localhost), and let the real request below enforce
 * the per-key allowlist.
 *
 * Returns null if the Origin is missing or invalid (in which
 * case the route should return a 403 — browsers won't even
 * send a preflight without an Origin header, but belt + braces).
 */
export function corsPreflightHeaders(request: NextRequest): Record<string, string> | null {
  const origin = request.headers.get('origin');
  if (!isValidCorsOrigin(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin!,
    'Access-Control-Allow-Methods': CORS_ALLOWED_METHODS,
    'Access-Control-Allow-Headers': CORS_ALLOWED_HEADERS,
    'Access-Control-Max-Age': CORS_MAX_AGE_SECONDS,
    'Vary': 'Origin',
  };
}

import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * POST /api/admin/check-invite
 *
 * INTENTIONALLY PUBLIC — does NOT use requireAdmin().
 *
 * Why public: this endpoint gates the /admin/register form. The user
 * trying to register an admin account is, by definition, NOT logged in
 * yet. There is no admin session to validate. Instead, the route
 * checks a single shared secret (ADMIN_INVITE_TOKEN) sent in the
 * request body. Anyone hitting the endpoint without the right token
 * gets { valid: false, reason: 'invalid' } and the registration form
 * stays hidden.
 *
 * Security properties:
 *  - The token never leaves the server (only the boolean verdict does).
 *  - Constant-time comparison to prevent timing-based token extraction.
 *    The previous length-mismatch early-return leaked a single bit of
 *    length per attempt; we now hash both sides to fixed-length digests
 *    and compare those, so the comparator's runtime doesn't depend on
 *    the input length or content.
 *  - The actual user-creation flow (/admin/register POST) also
 *    re-validates the token before creating an auth.users row, so
 *    exposing this endpoint does not let an attacker create accounts.
 *  - If ADMIN_INVITE_TOKEN is unset, the endpoint returns 404 — the
 *    registration form is effectively disabled.
 *
 * This route lives under /api/admin/ purely as an organizational
 * convention; the auth scoping in supabase-auth.ts does NOT apply.
 *
 * S144: the token moved from the query string to the request body.
 * Query strings end up in reverse-proxy access logs, browser history,
 * CDN edge logs, and the Referer header when navigating cross-origin.
 * None of those are a leak in isolation, but the body is the
 * standard place for credentials.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_INVITE_TOKEN;
  if (!expected) {
    // Invite system not configured — refuse all registrations.
    return NextResponse.json({ valid: false, reason: 'invite_disabled' }, { status: 404 });
  }

  let body: { token?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false, reason: 'missing' }, { status: 400 });
  }

  const token = typeof body.token === 'string' ? body.token : '';
  if (!token || token.length < 8) {
    return NextResponse.json({ valid: false, reason: 'missing' }, { status: 400 });
  }

  // Constant-time comparison. We hash both sides to fixed-length
  // (32 bytes) so the comparison time doesn't depend on the input
  // length (the previous implementation's `if (a.length !== b.length)
  // return false;` leaked one bit of length information per
  // attempt). Hashing the expected token once up front is also
  // fine — it's server-controlled and never leaves the process.
  const expectedDigest = createHash('sha256').update(expected).digest();
  const gotDigest = createHash('sha256').update(token).digest();
  if (!timingSafeEqual(expectedDigest, gotDigest)) {
    return NextResponse.json({ valid: false, reason: 'invalid' }, { status: 403 });
  }

  return NextResponse.json({ valid: true });
}
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/check-invite?token=...
 *
 * INTENTIONALLY PUBLIC — does NOT use requireAdmin().
 *
 * Why public: this endpoint gates the /admin/register form. The user
 * trying to register an admin account is, by definition, NOT logged in
 * yet. There is no admin session to validate. Instead, the route
 * checks a single shared secret (ADMIN_INVITE_TOKEN) sent as a query
 * param. Anyone hitting the endpoint without the right token gets
 * { valid: false, reason: 'invalid' } and the registration form stays
 * hidden.
 *
 * Security properties:
 *  - The token never leaves the server (only the boolean verdict does).
 *  - Constant-time comparison to prevent timing-based token extraction.
 *  - The actual user-creation flow (/admin/register POST) also
 *    re-validates the token before creating an auth.users row, so
 *    exposing this endpoint does not let an attacker create accounts.
 *  - If ADMIN_INVITE_TOKEN is unset, the endpoint returns 404 — the
 *    registration form is effectively disabled.
 *
 * This route lives under /api/admin/ purely as an organizational
 * convention; the auth scoping in supabase-auth.ts does NOT apply.
 */
export async function GET(request: NextRequest) {
  const expected = process.env.ADMIN_INVITE_TOKEN;
  if (!expected) {
    // Invite system not configured — refuse all registrations.
    return NextResponse.json({ valid: false, reason: 'invite_disabled' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token || token.length < 8) {
    return NextResponse.json({ valid: false, reason: 'missing' }, { status: 400 });
  }

  // Constant-time comparison to avoid timing attacks.
  if (!constantTimeEqual(token, expected)) {
    return NextResponse.json({ valid: false, reason: 'invalid' }, { status: 403 });
  }

  return NextResponse.json({ valid: true });
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

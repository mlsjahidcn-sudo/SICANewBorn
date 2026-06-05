/**
 * Partner: accept invite (public).
 *
 * POST /api/partner/accept-invite
 * Body: { token: string, password?: string }
 *
 * - Validates the token (partner_id, user_id, exp, etc.)
 * - If the auth user doesn't exist yet (shouldn't happen — we created
 *   them at invite time), fails
 * - If the team row's user_id matches the JWT (caller is the invitee)
 *   OR no JWT is provided and the team row is for this email, flip
 *   status from 'pending_invite' to 'active' and set joined_at
 * - Optionally sets a new password (for new users created at invite time)
 *
 * The frontend flow:
 *  1. User clicks the email link → /partner/accept-invite?token=...
 *  2. The page shows "Welcome! Sign in to continue" with a sign-in form
 *  3. After sign-in, the page calls POST /api/partner/accept-invite with
 *     the token to flip the team row active
 *  4. For NEW users (token has setup=1), the page ALSO shows a "set
 *     password" step BEFORE sign-in. We can use Supabase's
 *     `updateUserById` admin API to set a password for the new user.
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

interface AcceptBody {
  token?: string;
  password?: string;
}

interface InviteToken {
  partner_id: string;
  email: string;
  user_id: string;
  invited_by: string;
  exp: number; // ms epoch
}

function decodeToken(token: string): InviteToken | null {
  try {
    const json = Buffer.from(token, 'base64url').toString('utf-8');
    const parsed = JSON.parse(json);
    if (
      typeof parsed.partner_id === 'string' &&
      typeof parsed.email === 'string' &&
      typeof parsed.user_id === 'string' &&
      typeof parsed.invited_by === 'string' &&
      typeof parsed.exp === 'number'
    ) {
      return parsed as InviteToken;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  let body: AcceptBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!body.token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 });
  }

  const token = decodeToken(body.token);
  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
  if (token.exp < Date.now()) {
    return NextResponse.json({ error: 'This invite has expired' }, { status: 410 });
  }

  const service = buildServiceClient();

  // 1. Find the team_members row by (partner_id, user_id)
  const { data: member, error: mErr } = await service
    .from('partner_team_members')
    .select('id, status, partner_id, user_id')
    .eq('partner_id', token.partner_id)
    .eq('user_id', token.user_id)
    .maybeSingle();
  if (mErr) {
    return NextResponse.json({ error: mErr.message }, { status: 500 });
  }
  if (!member) {
    return NextResponse.json(
      { error: 'This invite was not found. Ask your partner admin for a new one.' },
      { status: 404 },
    );
  }
  const m = member as { id: string; status: string };

  if (m.status === 'active') {
    return NextResponse.json({ member, alreadyActive: true });
  }
  if (m.status !== 'pending_invite') {
    return NextResponse.json(
      { error: `Cannot accept invite in status: ${m.status}` },
      { status: 409 },
    );
  }

  // 2. Optionally set a new password (for new users)
  if (body.password) {
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }
    const { error: pwErr } = await service.auth.admin.updateUserById(token.user_id, {
      password: body.password,
    });
    if (pwErr) {
      return NextResponse.json({ error: pwErr.message }, { status: 500 });
    }
  }

  // 3. Flip the team_members row to active
  const { data: updated, error: uErr } = await service
    .from('partner_team_members')
    .update({
      status: 'active',
      joined_at: new Date().toISOString(),
    })
    .eq('id', m.id)
    .select('*')
    .single();
  if (uErr) {
    return NextResponse.json({ error: uErr.message }, { status: 500 });
  }

  return NextResponse.json({ member: updated });
}

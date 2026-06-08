import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, requireTeamMember, getServerEnv } from '@/lib/supabase-auth';

/**
 * Phase 8: POST /api/partner/team/[id]/reset-password
 *
 * Owner-only. Sets a new password for a team member's auth account.
 *
 * The owner types (or generates) a new password; we call
 * Supabase's auth.admin.updateUserById to set it on the
 * auth.users row directly. No email is sent (the member can
 * sign in immediately with the new password). The new password
 * is returned in the response so the UI can show it once for
 * the owner to copy + hand to the member.
 *
 * Why this exists: the team page has "Remove" but no "Reset
 * password". A member who forgot their password is stuck —
 * they can't trigger a Supabase recovery email (they don't
 * know which address to type into the recovery form, and
 * the recovery email would land in their own inbox anyway).
 * The owner steps in, picks a new password, hands it to
 * the member out-of-band, done.
 *
 * Difference from POST /api/partner/team/create-with-password:
 *   - Doesn't create a new auth.users row (the existing one
 *     gets a new password)
 *   - Doesn't touch the partner_team_members row at all
 *     (status, role, etc. unchanged)
 *   - The owner passes the new password (not a UUID) and we
 *     apply it via updateUserById
 *
 * Auth: requireTeamMember with role='owner'. We also verify
 * the team_members row's partner_id matches the caller's
 * partner_id so an owner of partner A can't reset a member
 * of partner B even if they somehow knew the [id].
 *
 * We refuse to reset the owner's own password here (the
 * owner can use Supabase's reset-password email flow for
 * themselves; resetting via the team page would create a
 * chicken-and-egg lockout scenario).
 */
const MIN_PASSWORD_LEN = 8;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.role !== 'owner') {
    return NextResponse.json({ error: 'Only owners can reset team passwords' }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const password = (body.password || '').trim();
  if (password.length < MIN_PASSWORD_LEN) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LEN} characters` },
      { status: 400 },
    );
  }

  const service = buildServiceClient();

  // 1. Find the team_members row, scoped to the caller's partner
  // so cross-partner attacks fail. We also pull user_id + role
  // so we can refuse to reset the owner's own password.
  const { data: member, error: mErr } = await service
    .from('partner_team_members')
    .select('id, user_id, role, status, partner_id')
    .eq('id', id)
    .eq('partner_id', auth.partnerId)
    .maybeSingle();
  if (mErr) {
    return NextResponse.json({ error: mErr.message }, { status: 500 });
  }
  if (!member) {
    return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
  }
  if (member.role === 'owner') {
    return NextResponse.json(
      { error: "Use Supabase's password recovery to reset the owner's own password" },
      { status: 400 },
    );
  }
  if (member.status === 'pending_invite') {
    return NextResponse.json(
      { error: 'This member has not accepted the invite yet — no password to reset' },
      { status: 400 },
    );
  }

  // 2. Apply the new password via Supabase's auth.admin API.
  // This updates auth.users.encrypted_password server-side;
  // the next signIn() call uses the new value.
  const { error: updErr } = await service.auth.admin.updateUserById(
    member.user_id as string,
    { password },
  );
  if (updErr) {
    console.error('[partner/team/:id/reset-password] supabase updateUserById error:', updErr);
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  // 3. Look up the email to return alongside the new password,
  // so the UI can show "member@x.com — copy the password below".
  const { data: userData } = await service.auth.admin.getUserById(member.user_id as string);
  const email = userData?.user?.email || null;

  return NextResponse.json(
    {
      member: { id: member.id, email, role: member.role, status: member.status },
      email,
      password,
    },
    { status: 200 },
  );
}

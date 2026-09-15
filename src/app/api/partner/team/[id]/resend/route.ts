/**
 * Partner: resend a pending invite (owner only).
 *
 * POST /api/partner/team/[id]/resend
 *
 * Refuses if the team member isn't in `pending_invite` status
 * (cancelling a non-invite row should go through DELETE).
 * Regenerates the invite token, refreshes invited_at, and
 * re-sends the accept-invite email via the centralized
 * sendTemplatedEmail pipeline (notification.partner_invite).
 *
 * Phase 84: the inline HTML+text body was dropped — the
 * email_templates row is the single source of truth for
 * invite copy (the seeded copy uses {{contactName}} etc.
 * for both first-time invites and resends; differentiation
 * between the two flows lives in the subject/body copy
 * editable in /admin/emails).
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, requireTeamMember, getServerEnv } from '@/lib/supabase-auth';
import { sendTemplatedEmail, isEmailConfigured } from '@/lib/email/index';
import { SITE_URL } from '@/lib/site-url';
import { signInviteToken } from '@/lib/invite-token';

export const dynamic = 'force-dynamic';

const INVITE_TTL_DAYS = 7;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  if (!isEmailConfigured()) {
    return NextResponse.json({ error: 'Email not configured' }, { status: 503 });
  }

  const { id } = await context.params;
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.role !== 'owner') {
    return NextResponse.json({ error: 'Only owners can resend invites' }, { status: 403 });
  }

  const service = buildServiceClient();
  const { data: member } = await service
    .from('partner_team_members')
    .select('id, status, user_id')
    .eq('id', id)
    .eq('partner_id', auth.partnerId)
    .maybeSingle();
  if (!member) {
    return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
  }
  const m = member as { status: string; user_id: string };
  if (m.status !== 'pending_invite') {
    return NextResponse.json(
      { error: `Cannot resend — member is ${m.status}, not pending_invite` },
      { status: 400 },
    );
  }

  // Look up the email for the user
  const { data: userData } = await service.auth.admin.getUserById(m.user_id);
  const email = userData?.user?.email;
  if (!email) {
    return NextResponse.json({ error: 'Member email not found' }, { status: 404 });
  }

  // Determine if this is a new user (never signed in) — the accept-invite
  // page uses &setup=1 to ask for a password instead of just signing in.
  // Heuristic: if the user has no `last_sign_in_at`, they're a new user.
  const isNewUser = !userData?.user?.last_sign_in_at;

  // Regenerate the invite token (the previous one might be expired).
  // HMAC-signed — see src/lib/invite-token.ts.
  const token = signInviteToken({
    partner_id: auth.partnerId,
    email,
    user_id: m.user_id,
    invited_by: auth.user.id,
    exp: Date.now() + INVITE_TTL_DAYS * 86400 * 1000,
  });

  // Refresh invited_at so the team table shows the resend
  await service
    .from('partner_team_members')
    .update({ invited_at: new Date().toISOString() })
    .eq('id', id);

  const setupParam = isNewUser ? '&setup=1' : '';
  const acceptUrl = `${SITE_URL}/partner/accept-invite?token=${token}${setupParam}`;
  const companyName = (auth.partner as { company_name?: string }).company_name || 'a SICA partner';
  const contactName = (auth.partner as { contact_person?: string }).contact_person || 'Your partner admin';

  const sent = await sendTemplatedEmail({
    to: email,
    slug: 'notification.partner_invite',
    locale: 'en',
    variables: {
      contactName,
      companyName,
      acceptUrl,
      ttlDays: INVITE_TTL_DAYS,
      isNewUser: isNewUser ? 'true' : 'false',
    },
    replyTo: process.env.ADMIN_EMAIL,
  });
  if (!sent) {
    return NextResponse.json(
      { error: 'Failed to send invite email. Try again.', resent: false },
      { status: 502 },
    );
  }

  return NextResponse.json({ resent: true, email });
}

/**
 * Partner: resend a pending invite (owner only).
 *
 * POST /api/partner/team/[id]/resend
 *
 * Refuses if the team member isn't in `pending_invite` status
 * (cancelling a non-invite row should go through DELETE).
 * Regenerates the invite token, refreshes invited_at, and
 * re-sends the accept-invite email via Resend.
 */
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { buildServiceClient, requireTeamMember, getServerEnv } from '@/lib/supabase-auth';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

const FROM = 'SICA <noreply@sica.com.cn>';
const INVITE_TTL_DAYS = 7;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Resend not configured' }, { status: 503 });
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

  // Regenerate the invite token (the previous one might be expired)
  const token = Buffer.from(
    JSON.stringify({
      partner_id: auth.partnerId,
      email,
      user_id: m.user_id,
      invited_by: auth.user.id,
      exp: Date.now() + INVITE_TTL_DAYS * 86400 * 1000,
    }),
    'utf-8',
  ).toString('base64url');

  // Refresh invited_at so the team table shows the resend
  await service
    .from('partner_team_members')
    .update({ invited_at: new Date().toISOString() })
    .eq('id', id);

  const setupParam = isNewUser ? '&setup=1' : '';
  const acceptUrl = `${SITE_URL}/partner/accept-invite?token=${token}${setupParam}`;
  const companyName = (auth.partner as { company_name?: string }).company_name || 'a SICA partner';
  const contactName = (auth.partner as { contact_person?: string }).contact_person || 'Your partner admin';

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: process.env.ADMIN_EMAIL,
    subject: `${contactName} re-invited you to the ${companyName} partner portal`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#FAFAF8;color:#1F2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:24px 0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #E5E7EB">
<tr><td style="background:#1B2A4A;padding:16px 24px;color:#fff;font-weight:800;font-size:18px;letter-spacing:0.05em">SICA</td></tr>
<tr><td style="padding:32px;font-size:15px;line-height:1.6;color:#374151">
<p>Hi,</p>
<p>${contactName} is following up on the earlier invitation to join <strong>${companyName}</strong>&apos;s SICA partner portal as a team member.</p>
<p>${isNewUser ? '<strong>Action needed:</strong> click the link below to set your password and accept the invitation.' : '<strong>Action needed:</strong> click the link below to sign in and accept the invitation.'}</p>
<p style="margin:24px 0 0 0">
  <a href="${acceptUrl}" style="background:#9B1B30;color:#ffffff;padding:12px 24px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">Accept invitation</a>
</p>
<p style="font-size:13px;color:#6B7280;margin-top:24px">This link expires in ${INVITE_TTL_DAYS} days. If you weren&apos;t expecting this email, you can safely ignore it.</p>
</td></tr>
<tr><td style="padding:16px 32px;background:#FAFAF8;border-top:1px solid #E5E7EB;font-size:12px;color:#6B7280">
<p style="margin:0">SICA · Guangzhou, China · <a href="mailto:mlsjahid@qq.com" style="color:#9B1B30;text-decoration:none">mlsjahid@qq.com</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`,
    text: `${contactName} is following up on the invitation to join ${companyName}'s SICA partner portal.\n\nAccept: ${acceptUrl}\n\nThis link expires in ${INVITE_TTL_DAYS} days.`,
  });

  return NextResponse.json({ resent: true, email });
}

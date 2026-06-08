import { SITE_URL } from '@/lib/site-url';
/**
 * Partner: team management (owner only).
 *
 * GET    /api/partner/team              — list team members
 * POST   /api/partner/team              — invite a new member
 * DELETE /api/partner/team/[id]        — remove a member
 *
 * Auth: requireTeamMember with role='owner'. Members cannot manage
 * the team (they can only see their partner org's data, which is
 * enforced by RLS on partner_team_members).
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, requireTeamMember, getServerEnv } from '@/lib/supabase-auth';
import { Resend } from 'resend';
import { findUserIdByEmail, hydrateUserEmails, primeEmailToUserIdCache } from '@/lib/partner-user-lookup';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const FROM = 'SICA <noreply@sica.com.cn>';
const INVITE_TTL_DAYS = 7;
// Abuse guard: an owner can hammer this endpoint to spam invites at
// the same address (or any address) and burn the Resend quota. Cap
// each owner to 5 invites per 15 minutes. Returns 429 when exceeded.
const INVITE_RATE_MAX = 5;
const INVITE_RATE_WINDOW_MS = 15 * 60 * 1000;

export async function GET(_request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireTeamMember(_request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.role !== 'owner') {
    return NextResponse.json({ error: 'Only owners can manage the team' }, { status: 403 });
  }

  const service = buildServiceClient();
  const { data: team, error } = await service
    .from('partner_team_members')
    .select('id, user_id, role, status, invited_by, invited_at, joined_at, suspended_at, suspension_reason, created_at')
    .eq('partner_id', auth.partnerId)
    .order('role', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Hydrate email + lastSignInAt for the team via the partner-scoped
  // helper (one getUserById per user, parallel, with a 60s in-memory
  // cache). Replaces the old listUsers({perPage: 200}) approach which
  // silently truncated at 201+ users and pulled every project user
  // into the partner server's memory. See src/lib/partner-user-lookup.ts.
  const userIds = (team || []).map((t) => (t as { user_id: string }).user_id);
  const hydrated = await hydrateUserEmails(service, userIds);
  const teamWithEmails = (team || []).map((t) => {
    const r = t as { user_id: string };
    const h = hydrated.get(r.user_id);
    return {
      ...t,
      email: h?.email ?? null,
      lastSignInAt: h?.lastSignInAt ?? null,
    };
  });

  return NextResponse.json({ team: teamWithEmails });
}

interface InviteBody {
  email?: string;
  role?: 'member';
}

/**
 * Invite a new team member.
 * - Creates (or reuses) an auth.users row
 * - Inserts a partner_team_members row with status='pending_invite'
 * - Sends a Resend email with an accept-invite link
 */
export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.role !== 'owner') {
    return NextResponse.json({ error: 'Only owners can invite members' }, { status: 403 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Resend not configured' }, { status: 503 });
  }

  // Per-owner rate limit: 5 invites / 15 min. Each invite creates
  // an auth.users row (free, but it does spam the auth.users table)
  // AND fires a Resend email (not free on the production tier), so
  // this guard is mostly to protect the Resend quota.
  const rl = checkRateLimit({
    action: 'partner-team-invite',
    key: auth.user.id,
    max: INVITE_RATE_MAX,
    windowMs: INVITE_RATE_WINDOW_MS,
  });
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: `Too many invites. Try again in ${rl.retryAfterSec} seconds.`,
        code: 'RATE_LIMITED',
        retryAfterSec: rl.retryAfterSec,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfterSec) },
      },
    );
  }

  let body: InviteBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = (body.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }
  const role = body.role || 'member';
  if (role !== 'member') {
    return NextResponse.json({ error: 'Only role=member is currently supported' }, { status: 400 });
  }

  const service = buildServiceClient();

  // 1. Look up the auth.users row by email. The Supabase JS admin
  // API (2.95.x) doesn't expose getUserByEmail, and the underlying
  // GoTrue admin HTTP endpoint ignores the ?email= filter. So we
  // paginate listUsers ourselves via the partner-user-lookup
  // helper — bounded at 2000 users, stops early on match, cached
  // for 60s. Replaces the old listUsers({perPage: 200}) + JS
  // filter which silently truncated at 201+ users (an email at
  // the bottom of the alphabet was just "not found", no error
  // surfaced).
  let userId: string | null = await findUserIdByEmail(service, email);
  let isNewUser = false;
  if (!userId) {
    // Create with a temp password — the user will set their own at
    // /partner/accept-invite?token=...&setup=1
    const tempPw = crypto.randomUUID();
    const { data: created, error: createErr } = await service.auth.admin.createUser({
      email,
      password: tempPw,
      email_confirm: true,
      user_metadata: { full_name: email.split('@')[0], role: 'partner' },
    });
    if (createErr || !created?.user) {
      return NextResponse.json(
        { error: createErr?.message || 'Failed to create auth user' },
        { status: 500 },
      );
    }
    userId = created.user.id;
    isNewUser = true;
    // Update the cache: this email is now taken. Without this, a
    // follow-up call (within the 60s TTL) would hit the cache's
    // "not found" entry and try to createUser again — which would
    // fail with "A user with this email address has already been
    // registered" (a 500) instead of cleanly returning the
    // existing user's id.
    primeEmailToUserIdCache(email, userId);
  }

  // 2. Refuse if they're already a member of any partner
  const { data: existing } = await service
    .from('partner_team_members')
    .select('id, partner_id, status')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing) {
    const e = existing as { partner_id: string; status: string };
    if (e.partner_id === auth.partnerId) {
      return NextResponse.json(
        { error: `${email} is already a team member` },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: `${email} is already a member of another partner organization` },
      { status: 409 },
    );
  }

  // 3. Generate invite token
  const token = Buffer.from(
    JSON.stringify({
      partner_id: auth.partnerId,
      email,
      user_id: userId,
      invited_by: auth.user.id,
      exp: Date.now() + INVITE_TTL_DAYS * 86400 * 1000,
    }),
    'utf-8',
  ).toString('base64url');

  // 4. Insert team_members row with status='pending_invite'
  const { data: member, error: mErr } = await service
    .from('partner_team_members')
    .insert({
      partner_id: auth.partnerId,
      user_id: userId,
      role: 'member',
      status: 'pending_invite',
      invited_by: auth.user.id,
      invited_at: new Date().toISOString(),
      joined_at: null,
    })
    .select('*')
    .single();
  if (mErr) {
    // Roll back the auth.users creation if we just made it
    if (isNewUser) {
      await service.auth.admin.deleteUser(userId);
    }
    return NextResponse.json({ error: mErr.message }, { status: 500 });
  }

  // 5. Send the invite email
  const setupParam = isNewUser ? '&setup=1' : '';
  const acceptUrl = `${SITE_URL}/partner/accept-invite?token=${token}${setupParam}`;
  const companyName = (auth.partner as { company_name?: string }).company_name || 'a SICA partner';
  const contactName = (auth.partner as { contact_person?: string }).contact_person || 'Your partner admin';

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: process.env.ADMIN_EMAIL,
    subject: `${contactName} invited you to the ${companyName} partner portal`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#FAFAF8;color:#1F2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:24px 0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #E5E7EB">
<tr><td style="background:#1B2A4A;padding:16px 24px;color:#fff;font-weight:800;font-size:18px;letter-spacing:0.05em">SICA</td></tr>
<tr><td style="padding:32px;font-size:15px;line-height:1.6;color:#374151">
<p>Hi,</p>
<p>${contactName} has invited you to join <strong>${companyName}</strong>&apos;s SICA partner portal as a team member.</p>
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
    text: `${contactName} invited you to join ${companyName}'s SICA partner portal.\n\nAccept: ${acceptUrl}\n\nThis link expires in ${INVITE_TTL_DAYS} days.`,
  });

  return NextResponse.json({ member, inviteSentTo: email, isNewUser });
}

import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, requireTeamMember, getServerEnv } from '@/lib/supabase-auth';
import { findUserIdByEmail, primeEmailToUserIdCache } from '@/lib/partner-user-lookup';

/**
 * Phase 5: POST /api/partner/team/create-with-password
 *
 * Create a partner team member by setting their email + password
 * directly, skipping the email-invite round-trip.
 *
 * The owner types the email + password in the team page, hits
 * Create, and the new member can immediately log in at
 * /partner/login with those credentials. The owner hands the
 * password to the member out-of-band (Slack, in person, etc.)
 *
 * Use cases:
 *   - The Resend free tier is exhausted and the owner can't
 *     send invite emails today
 *   - Small internal team where the owner already knows who's
 *     joining and just wants to set them up in 10 seconds
 *   - The owner's MUA eats the invite email and the team
 *     member is sitting next to them anyway
 *
 * Difference from POST /api/partner/team (the email-invite flow):
 *   - Skips the Resend email entirely (and the 503 if Resend
 *     isn't configured)
 *   - Sets the auth.users password to what the owner typed
 *     (not a UUID)
 *   - Sets status='active' immediately (no pending_invite)
 *   - Returns the password the owner typed back in the
 *     response so the UI can show it once (in case the owner
 *     mis-typed and needs to verify)
 *
 * Auth: requireTeamMember with role='owner'. The partner_id
 * is server-derived from the caller's session, never trusted
 * from the body. Email is normalized to lowercase before
 * lookup. Password is min 8 chars (we don't enforce uppercase
 * or symbols — let the owner pick something they'll actually
 * remember and share).
 */
interface CreateBody {
  email?: string;
  password?: string;
  fullName?: string;
  role?: 'member';
}

const MIN_PASSWORD_LEN = 8;

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.role !== 'owner') {
    return NextResponse.json({ error: 'Only owners can create team members' }, { status: 403 });
  }

  let body: CreateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = (body.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }
  const password = body.password || '';
  if (password.length < MIN_PASSWORD_LEN) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LEN} characters` },
      { status: 400 },
    );
  }
  const role = body.role || 'member';
  if (role !== 'member') {
    return NextResponse.json({ error: 'Only role=member is currently supported' }, { status: 400 });
  }
  const fullName = (body.fullName || '').trim() || email.split('@')[0];

  const service = buildServiceClient();

  // 1. Refuse if the email is already a user — we don't want to
  // overwrite someone's existing Supabase password, and we don't
  // want to silently create a duplicate account. Direct
  // single-user lookup via the partner-user-lookup helper
  // (paginated + cached, see the helper for the why). Replaces the
  // old listUsers({perPage: 200}) approach which silently
  // truncated at 201+ users.
  const userId: string | null = await findUserIdByEmail(service, email);
  if (userId) {
    return NextResponse.json(
      { error: `${email} already has a SICA account. Use "Send invite email" to add them to your team instead.` },
      { status: 409 },
    );
  }

  // 2. Create the auth.users row with the owner's chosen password.
  // email_confirm: true so the member doesn't have to click a
  // confirmation email before they can log in.
  const { data: created, error: createErr } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: 'partner' },
  });
  if (createErr || !created?.user) {
    return NextResponse.json(
      { error: createErr?.message || 'Failed to create auth user' },
      { status: 500 },
    );
  }
  const createdUserId = created.user.id;
  // Update the email→userId cache so a follow-up invite / create
  // with the same email within the 60s TTL doesn't re-scan the
  // user list (and, more importantly, doesn't try to createUser
  // again, which Supabase rejects with a 500).
  primeEmailToUserIdCache(email, createdUserId);

  // 3. Refuse if they're already on a partner team. The auth.users
  // row was just created so this should be impossible, but check
  // anyway as a safety net.
  const { data: existingMember } = await service
    .from('partner_team_members')
    .select('id, partner_id')
    .eq('user_id', createdUserId)
    .maybeSingle();
  if (existingMember) {
    // Roll back the auth.users row we just created
    await service.auth.admin.deleteUser(createdUserId);
    return NextResponse.json(
      { error: `${email} is already a member of another partner organization` },
      { status: 409 },
    );
  }

  // 4. Insert the partner_team_members row with status='active'
  // and joined_at=now. No invite token, no expiry, no email —
  // the owner already has the credentials.
  const { data: member, error: mErr } = await service
    .from('partner_team_members')
    .insert({
      partner_id: auth.partnerId,
      user_id: createdUserId,
      role: 'member',
      status: 'active',
      invited_by: auth.user.id,
      invited_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
    })
    .select('id, user_id, role, status, invited_by, invited_at, joined_at, created_at')
    .single();

  if (mErr || !member) {
    // Roll back the auth.users row
    await service.auth.admin.deleteUser(createdUserId);
    return NextResponse.json(
      { error: mErr?.message || 'Failed to create team member row' },
      { status: 500 },
    );
  }

  // 5. Return the email + the password the owner typed so the UI
  // can show it once ("Make sure to copy this password — it won't
  // be shown again"). This isn't a security leak because the
  // password was just chosen by the owner in this same request
  // and they already know it.
  return NextResponse.json(
    {
      member: {
        ...(member as Record<string, unknown>),
        email,
      },
      email,
      password,
    },
    { status: 201 },
  );
}

/**
 * Public: partner self-signup (Phase 3, partner portal v2).
 *
 * POST /api/partner/signup
 * Body: {
 *   auth_user_id: string,        // Supabase auth.users.id from the client
 *                                //   signUp() call. We DON'T create the user
 *                                //   here — the client already did.
 *   company_name: string,
 *   contact_person: string,
 *   phone: string,
 *   country: string,
 *   notes?: string,
 * }
 *
 * Behavior:
 *  1. Verify auth_user_id is real and not already bound to a partner.
 *  2. Insert a `partners` row with status='pending' and the user_id set
 *     (1:1 back-compat with old data; team_members table is the new
 *     authoritative binding).
 *  3. Insert a `partner_team_members` row with role='owner' and
 *     status='pending_approval'. Until the admin flips this to 'active',
 *     the partner can't use the portal.
 *  4. Return { partner, teamMember } so the client can show the right
 *     "pending" UI.
 *
 * Auth: public (no JWT required). We trust the auth_user_id from the
 * body because the caller just completed a Supabase signUp — the email
 * is verified before they can sign in anyway.
 *
 * Idempotency: if a `partners` row OR a `partner_team_members` row
 * already exists for this user_id, we return that state. (Retry-safe,
 * and refuses to create a second team_members row even if the partners
 * row is missing — defense in depth against the orphan-state that
 * triggered the Phase 10 PGRST116.)
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

interface SignupBody {
  auth_user_id?: string;
  company_name?: string;
  contact_person?: string;
  phone?: string;
  country?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  let body: SignupBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (
    !body.auth_user_id ||
    !body.company_name ||
    !body.contact_person ||
    !body.phone ||
    !body.country
  ) {
    return NextResponse.json(
      { error: 'auth_user_id, company_name, contact_person, phone, country are required' },
      { status: 400 },
    );
  }

  const service = buildServiceClient();

  // 1. Verify the auth user exists. If not, the client signUp didn't
  //    actually complete — fail loudly.
  const { data: authUser, error: auErr } = await service.auth.admin.getUserById(
    body.auth_user_id,
  );
  if (auErr || !authUser?.user) {
    return NextResponse.json(
      { error: 'auth_user_id does not match a real Supabase user' },
      { status: 400 },
    );
  }
  const userEmail = authUser.user.email;
  if (!userEmail) {
    return NextResponse.json({ error: 'auth user has no email' }, { status: 400 });
  }

  // 2. Idempotency: if a partners row OR a team_members row already
  //    exists for this user, return the existing state. (Phase 10:
  //    we also check team_members directly — the partners check alone
  //    misses the "user was invited to another org but their partners
  //    row never got created" orphan case, and a fresh INSERT here
  //    would create a second team_members row that the
  //    .single()-based two-path lookup can't handle.)
  const { data: existing } = await service
    .from('partners')
    .select('*')
    .eq('user_id', body.auth_user_id)
    .maybeSingle();
  if (existing) {
    const { data: existingMember } = await service
      .from('partner_team_members')
      .select('*')
      .eq('partner_id', existing.id)
      .eq('user_id', body.auth_user_id)
      .maybeSingle();
    return NextResponse.json({ partner: existing, teamMember: existingMember, idempotent: true });
  }

  // 2b. Defense in depth: even if no partners row exists, the user
  //     might already be a team member of another org (e.g. they were
  //     email-invited and the partner row got deleted out from under
  //     them, or a previous direct-DB recovery insert left a stray
  //     team_members row). Refuse to silently create a second one.
  const { data: strayMember } = await service
    .from('partner_team_members')
    .select('id, partner_id, role, status')
    .eq('user_id', body.auth_user_id)
    .maybeSingle();
  if (strayMember) {
    return NextResponse.json(
      {
        error:
          'A partner team membership already exists for this user. Sign in via the partner portal — do not re-register.',
        code: 'TEAM_MEMBERSHIP_EXISTS',
        teamMember: strayMember,
      },
      { status: 409 },
    );
  }

  // 3. Create the partners row, status='pending'.
  const { data: partner, error: pErr } = await service
    .from('partners')
    .insert({
      user_id: body.auth_user_id,
      email: userEmail,
      company_name: body.company_name.trim(),
      contact_person: body.contact_person.trim(),
      phone: body.phone.trim(),
      country: body.country.trim(),
      notes: body.notes?.trim() || null,
      status: 'pending',
      commission_rate: null,
    })
    .select('*')
    .single();
  if (pErr || !partner) {
    return NextResponse.json(
      { error: pErr?.message || 'Failed to create partner record' },
      { status: 500 },
    );
  }

  // 4. Create the team_members row, role='owner', status='pending_approval'.
  const { data: teamMember, error: mErr } = await service
    .from('partner_team_members')
    .insert({
      partner_id: partner.id,
      user_id: body.auth_user_id,
      role: 'owner',
      status: 'pending_approval',
      invited_by: null,
      invited_at: null,
      joined_at: null,
    })
    .select('*')
    .single();
  if (mErr || !teamMember) {
    // Roll back the partner insert (best-effort)
    await service.from('partners').delete().eq('id', partner.id);
    return NextResponse.json(
      { error: mErr?.message || 'Failed to create team membership' },
      { status: 500 },
    );
  }

  return NextResponse.json({ partner, teamMember });
}

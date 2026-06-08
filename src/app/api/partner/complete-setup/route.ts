import { NextRequest, NextResponse } from 'next/server';
import { getRequestAuth, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

/**
 * Phase 6: POST /api/partner/complete-setup
 *
 * Recovery flow for half-finished partner signups.
 *
 * Background: /partner/register does the signup in two steps —
 *   1. Supabase signUp() creates the auth.users row
 *   2. /api/partner/signup creates the partners + partner_team_members rows
 *
 * If step 1 succeeds but step 2 fails (network error, validation
 * error, user closes the tab mid-form, etc.), the user ends up
 * with an auth account that has role='partner' in metadata but
 * no partner/team row. They can sign in, but every partner API
 * 403s them with "No partner account bound to your user" and
 * the login page signs them out. They're stuck in limbo.
 *
 * This endpoint is the recovery hatch:
 *   - Auth: any logged-in user
 *   - Validates they have role='partner' in user_metadata and
 *     have NO existing partner or team_members row
 *   - Creates the partners row (status='Active' — same end state
 *     as the normal signup + admin approval flow, just skipping
 *     the pending gate since the user is already authed and clearly
 *     wants in)
 *   - Creates the team_members row (role='owner', status='active')
 *   - Returns the partner record so the UI can route to /partner
 *
 * Idempotency: refuses with 409 if the user already has a partner
 * or team row (use the normal login + /partner/settings flow
 * instead).
 */
interface CompleteSetupBody {
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

  const auth = await getRequestAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Sanity check: the user must be a "partner" by metadata. If
  // they're a student or admin trying to use this endpoint,
  // refuse — they should use the right portal instead.
  const role = (auth.user.user_metadata?.role as string | undefined) ?? '';
  if (role !== 'partner') {
    return NextResponse.json(
      { error: 'This endpoint is only for partner accounts. Sign in via the right portal.' },
      { status: 403 },
    );
  }

  let body: CompleteSetupBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const company_name = (body.company_name || '').trim();
  const contact_person = (body.contact_person || '').trim();
  const phone = (body.phone || '').trim();
  const country = (body.country || '').trim();
  if (!company_name || !contact_person || !phone || !country) {
    return NextResponse.json(
      { error: 'company_name, contact_person, phone, country are required' },
      { status: 400 },
    );
  }
  const notes = (body.notes || '').trim() || null;

  const service = buildServiceClient();

  // 1. Idempotency check: if a partner row OR a team_members row
  // already exists for this user, refuse. The normal flow should
  // apply, not the recovery hatch.
  const { data: existingPartner } = await service
    .from('partners')
    .select('id')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (existingPartner) {
    return NextResponse.json(
      { error: 'A partner organization already exists for this user. Sign in normally.' },
      { status: 409 },
    );
  }
  const { data: existingMember } = await service
    .from('partner_team_members')
    .select('id, partner_id')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (existingMember) {
    return NextResponse.json(
      { error: 'A team membership already exists for this user. Sign in normally.' },
      { status: 409 },
    );
  }

  const userEmail = auth.user.email;
  if (!userEmail) {
    return NextResponse.json({ error: 'Auth user has no email' }, { status: 400 });
  }

  // 2. Create the partners row. status='Active' to match the
  // end state of the normal signup+approve flow. The user has
  // already completed signUp (which is the more important
  // trust signal) — the admin-approval gate only exists because
  // the original signup form is a "cold apply" surface where
  // strangers can hit it. Recovery means "I already started
  // this, let me finish", so we skip the pending gate.
  const { data: partner, error: pErr } = await service
    .from('partners')
    .insert({
      user_id: auth.user.id,
      email: userEmail,
      company_name,
      contact_person,
      phone,
      country,
      notes,
      status: 'Active',
      commission_rate: 0,
    })
    .select('id, email, company_name, contact_person, status, created_at, updated_at')
    .single();
  if (pErr || !partner) {
    return NextResponse.json(
      { error: pErr?.message || 'Failed to create partner record' },
      { status: 500 },
    );
  }

  // 3. Create the team_members row. role='owner' because this
  // user is the first (and so far only) member of the new
  // org — there is no one to be a "member" of. status='active'
  // for the same reason as above.
  const { data: teamMember, error: mErr } = await service
    .from('partner_team_members')
    .insert({
      partner_id: partner.id as string,
      user_id: auth.user.id,
      role: 'owner',
      status: 'active',
      invited_by: null,
      invited_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
    })
    .select('id, role, status')
    .single();
  if (mErr || !teamMember) {
    // Roll back the partner insert (best-effort)
    await service.from('partners').delete().eq('id', partner.id as string);
    return NextResponse.json(
      { error: mErr?.message || 'Failed to create team membership' },
      { status: 500 },
    );
  }

  return NextResponse.json({ partner, teamMember }, { status: 201 });
}

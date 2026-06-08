import { NextResponse } from 'next/server';
import { getRequestAuth, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

/**
 * Returns the partner record bound to the caller's auth.users.id.
 * Used by the partner portal to verify the logged-in user is actually a partner
 * (vs. a student/admin who somehow landed on the partner login page).
 *
 * Two valid paths (mirrors requireTeamMember / requirePartner):
 *  1. Caller is the org owner — partners.user_id = auth.uid()
 *  2. Caller is a team member — partner_team_members.user_id = auth.uid()
 *     joins to the partner org via partner_team_members.partner_id
 *
 * Without Path 2, a team member with no partners row would get
 * 403 "No partner account bound to your user" — exactly the
 * message Phase 5's direct-create team-member flow surfaced
 * when the new member tried to log in. Adding Path 2 fixes it.
 */
export async function GET(request: Request) {
  const { serviceKey } = getServerEnv();
  if (!serviceKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const auth = await getRequestAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const service = buildServiceClient();

  // Path 1: org owner — direct link via partners.user_id
  const { data: partnerAsOwner, error: ownerErr } = await service
    .from('partners')
    .select('id, email, company_name, contact_person, status, commission_rate, created_at, updated_at')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (ownerErr) {
    return NextResponse.json({ error: ownerErr.message }, { status: 500 });
  }
  if (partnerAsOwner) {
    return NextResponse.json({ partner: partnerAsOwner });
  }

  // Path 2: team member — join via partner_team_members
  const { data: member, error: memberErr } = await service
    .from('partner_team_members')
    .select('id, role, status, partner:partners!partner_id (id, email, company_name, contact_person, status, commission_rate, created_at, updated_at)')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (memberErr) {
    return NextResponse.json({ error: memberErr.message }, { status: 500 });
  }
  if (!member) {
    // Phase 6: detect the "half-finished signup" state — auth
    // user has role='partner' in metadata but no partner/team
    // row was ever created. Return a 409 with a specific code
    // so the login page can offer a recovery form instead of
    // just signing the user out.
    const metadataRole = (auth.user.user_metadata?.role as string | undefined) ?? '';
    if (metadataRole === 'partner') {
      return NextResponse.json(
        {
          code: 'PARTNER_SETUP_INCOMPLETE',
          error: 'Your partner registration is not complete. Fill in your organization details to finish setting up your account.',
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: 'No partner account bound to your user' },
      { status: 403 },
    );
  }
  const partner = Array.isArray(member.partner) ? member.partner[0] : member.partner;
  if (!partner) {
    return NextResponse.json(
      { error: 'Team member has no associated partner org' },
      { status: 500 },
    );
  }
  // Phase 11: include the teamMember status so callers (the
  // login page + the partner layout) can detect "this user is
  // a suspended team member" without a second round-trip. The
  // partner is returned as-is — the data layer endpoints
  // (/api/partner/students, /applications, /notifications)
  // are the ones that 403 for suspended members via
  // requirePartner's new status check. /me and /login-status
  // stay 200 so the UI can show the right message instead of
  // a generic "not linked" error.
  return NextResponse.json({
    partner,
    teamMember: {
      id: (member as { id: string }).id,
      role: (member as { role: string }).role,
      status: (member as { status: string }).status,
    },
  });
}

/**
 * PATCH /api/partner/me
 *
 * Update the calling partner's own profile. Allowed fields:
 *   - company_name : string
 *   - contact_person : string
 *
 * NOT allowed (server-enforced):
 *   - email (would need a separate verification flow)
 *   - user_id / id (sensitive)
 *   - commission_rate (admin-controlled, not partner-self-editable)
 *   - status (admin-controlled)
 *
 * Auth: any logged-in user. The partners.user_id must match auth.uid().
 */
export async function PATCH(request: Request) {
  const { serviceKey } = getServerEnv();
  if (!serviceKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const auth = await getRequestAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Whitelist — strip everything else to prevent privilege escalation
  const updates: Record<string, unknown> = {};
  if (typeof body.company_name === 'string' && body.company_name.trim()) {
    updates.company_name = body.company_name.trim();
  }
  if (typeof body.contact_person === 'string' && body.contact_person.trim()) {
    updates.contact_person = body.contact_person.trim();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 });
  }

  const service = buildServiceClient();
  const { data, error } = await service
    .from('partners')
    .update(updates)
    .eq('user_id', auth.user.id)
    .select('id, email, company_name, contact_person, status, commission_rate, created_at, updated_at')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json(
      { error: 'No partner account bound to your user' },
      { status: 404 },
    );
  }

  return NextResponse.json({ partner: data });
}

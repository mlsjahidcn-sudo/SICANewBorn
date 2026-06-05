/**
 * Public: partner portal login-status check.
 *
 * GET /api/partner/login-status
 *
 * Returns the partner's current status + a friendly explanation. Used
 * by /partner/layout.tsx to decide whether to show:
 *  - the normal portal (status='active')
 *  - a "pending" page (status='pending' on partners)
 *  - a "rejected" page (status='rejected' on partners)
 *  - a "suspended" page (status='suspended' on partners)
 *
 * Auth: requires a valid Supabase JWT (any logged-in user). Returns
 * 403 if the user has no partner record.
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getRequestAuth, getServerEnv } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const auth = await getRequestAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const service = buildServiceClient();
  const { data: partner, error: pErr } = await service
    .from('partners')
    .select('id, status, company_name, contact_person, email, created_at')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }
  if (!partner) {
    return NextResponse.json({ error: 'No partner record for this user' }, { status: 403 });
  }

  const { data: member } = await service
    .from('partner_team_members')
    .select('id, role, status, joined_at')
    .eq('partner_id', partner.id)
    .eq('user_id', auth.user.id)
    .maybeSingle();

  return NextResponse.json({
    partner: {
      id: partner.id,
      company_name: partner.company_name,
      contact_person: partner.contact_person,
      email: partner.email,
      status: partner.status,
      created_at: partner.created_at,
    },
    teamMember: member
      ? {
          id: member.id,
          role: member.role,
          status: member.status,
          joined_at: member.joined_at,
        }
      : null,
  });
}

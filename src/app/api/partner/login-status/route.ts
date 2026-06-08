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
 * Phase 5b: this endpoint originally only looked up via
 * `partners.user_id = auth.uid()` — the org-owner path. Team members
 * (who only have a `partner_team_members` row) hit 403, which
 * crashed the partner layout for them (the layout calls this
 * endpoint on every page load to decide which layout shell to show).
 *
 * Now uses the same two-path lookup as requireTeamMember /
 * requirePartner: try org-owner first (back-compat), fall back to
 * team-member-via-partner_id. The 403 only fires for users who
 * genuinely have no business in the partner portal (no role in
 * either table).
 *
 * Auth: requires a valid Supabase JWT (any logged-in user).
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

  // Path 1: org owner (partners.user_id = auth.uid())
  interface PartnerRow {
    id: string;
    company_name: string;
    contact_person: string;
    email: string;
    status: string;
    created_at: string;
  }
  interface MemberRow {
    id: string;
    role: string;
    status: string;
    joined_at: string;
  }
  let partner: PartnerRow | null = null;
  let member: MemberRow | null = null;

  const { data: partnerAsOwner, error: pErr } = await service
    .from('partners')
    .select('id, status, company_name, contact_person, email, created_at')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }
  if (partnerAsOwner) {
    partner = partnerAsOwner as PartnerRow;
  } else {
    // Path 2: team member — join via partner_team_members
    const { data: tm, error: tmErr } = await service
      .from('partner_team_members')
      .select('id, role, status, joined_at, partner:partners!partner_id (id, status, company_name, contact_person, email, created_at)')
      .eq('user_id', auth.user.id)
      .maybeSingle();
    if (tmErr) {
      return NextResponse.json({ error: tmErr.message }, { status: 500 });
    }
    if (tm) {
      const tmPartnerRaw = (tm as { partner?: unknown }).partner;
      const tmPartner = Array.isArray(tmPartnerRaw) ? tmPartnerRaw[0] : tmPartnerRaw;
      if (tmPartner) {
        partner = tmPartner as PartnerRow;
        member = {
          id: (tm as { id: string }).id,
          role: (tm as { role: string }).role,
          status: (tm as { status: string }).status,
          joined_at: (tm as { joined_at: string }).joined_at,
        };
      }
    }
  }

  if (!partner) {
    return NextResponse.json({ error: 'No partner record for this user' }, { status: 403 });
  }

  // If we got here via Path 1 (org owner), the second query
  // (member) hasn't been run yet — do it now so the response
  // shape is consistent regardless of which path we took.
  if (!member) {
    const { data: tm } = await service
      .from('partner_team_members')
      .select('id, role, status, joined_at')
      .eq('partner_id', partner.id)
      .eq('user_id', auth.user.id)
      .maybeSingle();
    if (tm) {
      member = {
        id: tm.id as string,
        role: tm.role as string,
        status: tm.status as string,
        joined_at: tm.joined_at as string,
      };
    }
  }

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

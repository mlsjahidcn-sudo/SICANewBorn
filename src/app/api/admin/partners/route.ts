/**
 * Admin: list all partner orgs.
 *
 * GET /api/admin/partners?status=pending|active|rejected|suspended|all
 *
 * Each row includes a team_count (number of partner_team_members) and
 * the owner's email. Pending partners are sorted to the top so the
 * admin sees what needs approval first.
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv, requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const STATUSES = ['pending', 'active', 'rejected', 'suspended', 'all'] as const;

export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get('status') || 'all').toLowerCase();
  if (!(STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${STATUSES.join(', ')}` },
      { status: 400 },
    );
  }

  const service = buildServiceClient();
  let q = service
    .from('partners')
    .select('id, user_id, email, company_name, contact_person, country, status, commission_rate, notes, created_at, updated_at')
    .order('created_at', { ascending: false });
  if (status !== 'all') {
    q = q.eq('status', status);
  }

  const { data: partners, error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Annotate each partner with team_count
  const partnerIds = (partners || []).map((p) => p.id);
  const { data: teamRows, error: teamErr } = partnerIds.length
    ? await service
        .from('partner_team_members')
        .select('partner_id, status, role')
        .in('partner_id', partnerIds)
    : { data: [], error: null };
  if (teamErr) {
    return NextResponse.json({ error: teamErr.message }, { status: 500 });
  }

  const teamByPartner = new Map<string, { total: number; active: number; pending: number }>();
  for (const t of teamRows || []) {
    const r = t as { partner_id: string; status: string; role: string };
    const cur = teamByPartner.get(r.partner_id) || { total: 0, active: 0, pending: 0 };
    cur.total++;
    if (r.status === 'active') cur.active++;
    if (r.status === 'pending_approval' || r.status === 'pending_invite') cur.pending++;
    teamByPartner.set(r.partner_id, cur);
  }

  // Sort: pending first, then by created_at desc
  const enriched = (partners || []).map((p) => {
    const r = p as { id: string };
    const team = teamByPartner.get(r.id) || { total: 0, active: 0, pending: 0 };
    return { ...p, team_count: team.total, team_active: team.active, team_pending: team.pending };
  });
  enriched.sort((a, b) => {
    const aStatus = (a as { status: string }).status;
    const bStatus = (b as { status: string }).status;
    if (aStatus === 'pending' && bStatus !== 'pending') return -1;
    if (bStatus === 'pending' && aStatus !== 'pending') return 1;
    return (b as { created_at: string }).created_at.localeCompare(
      (a as { created_at: string }).created_at,
    );
  });

  return NextResponse.json({ partners: enriched });
}

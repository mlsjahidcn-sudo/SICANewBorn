import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient } from '@/lib/supabase-auth';

/**
 * GET /api/admin/applications/counts
 *
 * S28: per-source application counts, now including the partner CRM
 * surface. Returns:
 *   { total, online, partner, partnerCrm, offline }
 *
 * `partner` = student_applications where the joined student's
 *             source='Partner' (a partner-sourced student)
 * `partnerCrm` = partner_applications rows (the partner's own
 *             tracking entries, distinct from above)
 *
 * The admin UI's "Partner" tab adds these two together.
 */
export async function GET(_request: NextRequest) {
  const auth = await requireAdmin(_request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const service = buildServiceClient();

    const totalQuery = service
      .from('student_applications')
      .select('id', { count: 'exact', head: true });

    const offlineQuery = service
      .from('student_applications')
      .select('id', { count: 'exact', head: true })
      .is('student_id', null);

    // Online/Partner: count students by source. We could also count
    // applications via a JOIN, but Supabase's PostgREST layer doesn't
    // expose that as a simple count() query, and an RPC adds a
    // migration dependency. Counting students is correct for v1.
    const onlineQuery = service
      .from('student_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('source', 'Online');

    const partnerQuery = service
      .from('student_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('source', 'Partner');

    // S28: partner CRM surface (partner_applications table) is a
    // separate count. The admin UI's "Partner" tab blends
    // `partner + partnerCrm`.
    const partnerCrmQuery = service
      .from('partner_applications')
      .select('id', { count: 'exact', head: true });

    const [total, offline, online, partner, partnerCrm] = await Promise.all([
      totalQuery,
      offlineQuery,
      onlineQuery,
      partnerQuery,
      partnerCrmQuery,
    ]);

    if (total.error) return NextResponse.json({ error: total.error.message }, { status: 500 });
    if (offline.error) return NextResponse.json({ error: offline.error.message }, { status: 500 });
    if (online.error) return NextResponse.json({ error: online.error.message }, { status: 500 });
    if (partner.error) return NextResponse.json({ error: partner.error.message }, { status: 500 });
    if (partnerCrm.error) return NextResponse.json({ error: partnerCrm.error.message }, { status: 500 });

    return NextResponse.json({
      total: (total.count || 0) + (partnerCrm.count || 0),
      online: online.count || 0,
      partner: (partner.count || 0) + (partnerCrm.count || 0),
      partnerCrm: partnerCrm.count || 0,
      offline: offline.count || 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient } from '@/lib/supabase-auth';

/**
 * GET /api/admin/applications/counts
 *
 * S28: per-source application counts, now including the partner CRM
 * surface.
 *
 * Phase 32: also returns per-status and per-priority counts so the
 * admin list can render the at-a-glance stat cards (Awaiting
 * Review / In Review / Urgent) without a second roundtrip. The
 * per-status counts respect the cross-taxonomy mapping (student
 * 'Under Review' + partner 'In Review' both count as "In Review"
 * for the headline number).
 *
 * Returns:
 *   {
 *     total, online, partner, partnerCrm, offline,
 *     submitted, inReview, urgent,
 *     // per-status / per-priority breakdowns for finer UIs
 *     byStatus: { [status: string]: number },
 *     byPriority: { [priority: string]: number },
 *   }
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

    // Phase 32: per-status + per-priority breakdowns. We select
    // only the columns we care about (no `head: true` — we need
    // the actual values to bucket into byStatus / byPriority).
    // Capped at 5000 rows server-side; for an admin with more
    // than 5000 apps, the per-status counts become a lower bound
    // (we surface a hint in the UI — see page.tsx). 5K is well
    // above the realistic scale for v1.
    const studentStatusQuery = service
      .from('student_applications')
      .select('status, priority')
      .range(0, 4999);
    const partnerStatusQuery = service
      .from('partner_applications')
      .select('status, priority')
      .range(0, 4999);

    const [total, offline, online, partner, partnerCrm, studentStatus, partnerStatus] =
      await Promise.all([
        totalQuery,
        offlineQuery,
        onlineQuery,
        partnerQuery,
        partnerCrmQuery,
        studentStatusQuery,
        partnerStatusQuery,
      ]);

    if (total.error) return NextResponse.json({ error: total.error.message }, { status: 500 });
    if (offline.error) return NextResponse.json({ error: offline.error.message }, { status: 500 });
    if (online.error) return NextResponse.json({ error: online.error.message }, { status: 500 });
    if (partner.error) return NextResponse.json({ error: partner.error.message }, { status: 500 });
    if (partnerCrm.error) return NextResponse.json({ error: partnerCrm.error.message }, { status: 500 });
    if (studentStatus.error)
      return NextResponse.json({ error: studentStatus.error.message }, { status: 500 });
    if (partnerStatus.error)
      return NextResponse.json({ error: partnerStatus.error.message }, { status: 500 });

    // Phase 32: bucket the per-status + per-priority rows in JS.
    // Two surfaces — student and partner — both feed into the
    // same byStatus / byPriority maps so the headline numbers
    // reflect the full pipeline regardless of which tab the
    // admin is on. Status keys keep their native spelling so
    // the UI can look up the bucket it cares about without
    // cross-taxonomy gymnastics; the headline `submitted` /
    // `inReview` / `urgent` numbers below do the mapping once.
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    for (const row of studentStatus.data || []) {
      const s = (row as { status?: string | null }).status || 'Unknown';
      const p = (row as { priority?: string | null }).priority || 'Normal';
      byStatus[s] = (byStatus[s] || 0) + 1;
      byPriority[p] = (byPriority[p] || 0) + 1;
    }
    for (const row of partnerStatus.data || []) {
      const s = (row as { status?: string | null }).status || 'Unknown';
      const p = (row as { priority?: string | null }).priority || 'Normal';
      byStatus[s] = (byStatus[s] || 0) + 1;
      byPriority[p] = (byPriority[p] || 0) + 1;
    }

    // Headline cross-taxonomy numbers:
    //   submitted = any row with status='Submitted' (both taxonomies)
    //   inReview  = student 'Under Review' + partner 'In Review'
    //   urgent    = priority='Urgent' OR priority='High' (both surfaces)
    const submitted = byStatus['Submitted'] || 0;
    const inReview = (byStatus['Under Review'] || 0) + (byStatus['In Review'] || 0);
    const urgent = (byPriority['Urgent'] || 0) + (byPriority['High'] || 0);

    return NextResponse.json({
      total: (total.count || 0) + (partnerCrm.count || 0),
      online: online.count || 0,
      partner: (partner.count || 0) + (partnerCrm.count || 0),
      partnerCrm: partnerCrm.count || 0,
      offline: offline.count || 0,
      submitted,
      inReview,
      urgent,
      byStatus,
      byPriority,
      // Flag: when the pipeline exceeds 5000 rows on either
      // surface, the per-status / per-priority breakdowns are a
      // lower bound. The UI uses this to render a small "5000+"
      // hint on the stat cards. Not exposed on `total` / the
      // per-source counts — those use PostgREST `count: 'exact'`
      // and are accurate regardless of row count.
      perStatusCapped:
        (studentStatus.data?.length || 0) >= 5000 ||
        (partnerStatus.data?.length || 0) >= 5000,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

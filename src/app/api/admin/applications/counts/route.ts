import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient } from '@/lib/supabase-auth';

/**
 * GET /api/admin/applications/counts
 *
 * Returns per-source application counts:
 *   { total, online, partner, offline }
 *
 * Why this is its own endpoint: the main /api/admin/applications
 * endpoint can't easily compute a `count(*)` per source because
 * `source` is derived from the joined student_profiles row. We
 * could call the main endpoint 4 times, but in dev mode each call
 * triggers a cold compile of the route handler — 4 parallel calls
 * queue up and take 10+ seconds. So we do the counts in raw SQL
 * via the service-role client instead.
 *
 * Strategy: 4 parallel small queries.
 *   - total    : SELECT count(*) FROM student_applications
 *   - offline  : SELECT count(*) FROM student_applications WHERE student_id IS NULL
 *   - online   : SELECT count(*) FROM student_profiles WHERE source = 'Online'
 *                (one application per student; matches reality for v1)
 *   - partner  : SELECT count(*) FROM student_profiles WHERE source = 'Partner'
 *
 * The online/partner counts use student_profiles because PostgREST
 * doesn't let us filter a count(*) by a joined column directly
 * (`.eq('student.source', X)` silently returns the unfiltered count).
 * For v1, where each student typically has one application at a time,
 * counting students-by-source is a good enough proxy. When students
 * can have multiple in-flight applications, swap this for an RPC.
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

    const [total, offline, online, partner] = await Promise.all([
      totalQuery,
      offlineQuery,
      onlineQuery,
      partnerQuery,
    ]);

    if (total.error) return NextResponse.json({ error: total.error.message }, { status: 500 });
    if (offline.error) return NextResponse.json({ error: offline.error.message }, { status: 500 });
    if (online.error) return NextResponse.json({ error: online.error.message }, { status: 500 });
    if (partner.error) return NextResponse.json({ error: partner.error.message }, { status: 500 });

    return NextResponse.json({
      total: total.count || 0,
      online: online.count || 0,
      partner: partner.count || 0,
      offline: offline.count || 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

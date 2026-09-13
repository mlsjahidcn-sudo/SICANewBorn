import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv, requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/students/stats
 * Returns real DB counts for the /admin/students dashboard cards.
 *
 * Six parallel `count: 'exact', head: true` queries against
 * `student_profiles` — each one is an index scan (no row data ships).
 * No SQL RPC needed; counts are cheap at SICA's current scale.
 *
 * Returns: { total, active, pending, suspended, inactive, offline }
 *   - total/active/pending/suspended/inactive are status-bucket counts.
 *   - offline is the count of `source='Admin'` rows (these are the
 *     "offline student" entries created by admins, not necessarily
 *     a strict subset of any single status bucket).
 *
 * Auth: requireAdmin. Service-role client (RLS would otherwise hide
 * rows from the admin session-bound client).
 */
export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const service = buildServiceClient();

  const [totalRes, activeRes, pendingRes, suspendedRes, inactiveRes, offlineRes] = await Promise.all([
    service.from('student_profiles').select('id', { count: 'exact', head: true }),
    service.from('student_profiles').select('id', { count: 'exact', head: true }).eq('status', 'Active'),
    service.from('student_profiles').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
    service.from('student_profiles').select('id', { count: 'exact', head: true }).eq('status', 'Suspended'),
    service.from('student_profiles').select('id', { count: 'exact', head: true }).eq('status', 'Inactive'),
    service.from('student_profiles').select('id', { count: 'exact', head: true }).eq('source', 'Admin'),
  ]);

  return NextResponse.json({
    total: totalRes.count ?? 0,
    active: activeRes.count ?? 0,
    pending: pendingRes.count ?? 0,
    suspended: suspendedRes.count ?? 0,
    inactive: inactiveRes.count ?? 0,
    offline: offlineRes.count ?? 0,
  });
}

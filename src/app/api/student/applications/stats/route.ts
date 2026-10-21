import { NextResponse } from 'next/server';
import { buildServiceClient, getRequestAuth, getServerEnv } from '@/lib/supabase-auth';
import { STUDENT_PENDING_STATUSES, type StudentApplicationStats } from '@/lib/dashboard-stats';

export const dynamic = 'force-dynamic';

/** Exact counts across all pages. Service-role queries must always bind the verified student ID. */
export async function GET(request: Request): Promise<NextResponse> {
  const auth = await getRequestAuth(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { url, serviceKey } = getServerEnv();
  if (!url || !serviceKey) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });

  try {
    const service = buildServiceClient();
    const base = () => service.from('student_applications')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', auth.user.id);
    const results = await Promise.all([
      base(),
      base().in('status', [...STUDENT_PENDING_STATUSES]),
      base().eq('status', 'Accepted'),
      base().eq('status', 'Documents Requested'),
      base().eq('status', 'Draft'),
    ]);
    if (results.some((result) => result.error)) {
      console.error('[student/applications/stats] count failed:', results.find((result) => result.error)?.error);
      return NextResponse.json({ error: 'Failed to load application statistics' }, { status: 500 });
    }
    const stats: StudentApplicationStats = {
      total: results[0].count ?? 0,
      pending: results[1].count ?? 0,
      accepted: results[2].count ?? 0,
      documentsRequested: results[3].count ?? 0,
      drafts: results[4].count ?? 0,
    };
    return NextResponse.json(stats);
  } catch (error) {
    console.error('[student/applications/stats]', error);
    return NextResponse.json({ error: 'Failed to load application statistics' }, { status: 500 });
  }
}

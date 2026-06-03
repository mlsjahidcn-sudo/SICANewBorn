import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { mapApplicationFromDb, type RawApp } from '@/lib/application-mapper';

/**
 * GET /api/admin/dashboard
 *
 * One-shot summary endpoint that powers the admin dashboard.
 * Returns:
 *   - stats: counts of students, applications, universities, programs,
 *     scholarships, leads (unlinked applications), and 7d deltas
 *   - recentApplications: last 6 applications (newest first)
 *   - recentActivity: last 6 events (merged application_timeline +
 *     new-student signups), newest first
 *
 * Why a single endpoint: the dashboard is one screen, refreshed
 * infrequently, and 5 separate round-trips would be slower than one
 * call returning a compact payload. We do all queries in parallel.
 *
 * Auth: any admin (requireAdmin). Service-role client.
 */
export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const service = buildServiceClient();

    // 7-day cutoff for "this week" deltas
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // All queries in parallel. Each one uses count: 'exact' to get the
    // real count from the row headers (cheap; no row data transferred).
    const [
      uniRes, progRes, scholRes,
      studentsTotalRes, studentsRecentRes,
      appsTotalRes, appsRecentRes, appsLeadsRes, appsActiveRes,
      recentAppsRes,
      recentTimelineRes,
      recentStudentsRes,
    ] = await Promise.all([
      service.from('universities').select('id', { count: 'exact', head: true }),
      service.from('programs').select('id', { count: 'exact', head: true }),
      service.from('scholarships').select('id', { count: 'exact', head: true }),

      service.from('student_profiles').select('id', { count: 'exact', head: true }),
      service
        .from('student_profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),

      service.from('student_applications').select('id', { count: 'exact', head: true }),
      service
        .from('student_applications')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
      // "Leads" = unlinked applications (no student account yet)
      service
        .from('student_applications')
        .select('id', { count: 'exact', head: true })
        .is('student_id', null),
      // "Active" = in-progress status (Submitted, Under Review, Documents Requested)
      service
        .from('student_applications')
        .select('id', { count: 'exact', head: true })
        .in('status', ['Submitted', 'Under Review', 'Documents Requested']),

      // Last 6 applications (newest first)
      service
        .from('student_applications')
        .select(
          `*,
           student:student_profiles!student_id (id, first_name, last_name, email, source, status)`,
        )
        .order('created_at', { ascending: false })
        .limit(6),

      // Last 6 application timeline events
      service
        .from('application_timeline')
        .select('id, application_id, status, notes, created_at, created_by')
        .order('created_at', { ascending: false })
        .limit(6),

      // Last 6 new student_profiles (newest first)
      service
        .from('student_profiles')
        .select('id, first_name, last_name, email, source, created_at')
        .order('created_at', { ascending: false })
        .limit(6),
    ]);

    // Normalize the recent applications to the AdminApplication shape
    const recentApplications = ((recentAppsRes.data || []) as RawApp[]).map(
      mapApplicationFromDb,
    );

    type TimelineRow = {
      id: string;
      application_id: string;
      status: string;
      notes: string | null;
      created_at: string;
    };
    type StudentRow = {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      source: string;
      created_at: string;
    };

    // Merge timeline + new students into a unified activity feed
    type ActivityEvent = {
      id: string;
      type: 'application' | 'student';
      message: string;
      timestamp: string;
      meta?: Record<string, unknown>;
    };
    const events: ActivityEvent[] = [];
    for (const t of (recentTimelineRes.data || []) as TimelineRow[]) {
      events.push({
        id: t.id,
        type: 'application',
        message: t.notes || `Application status: ${t.status}`,
        timestamp: t.created_at,
        meta: { application_id: t.application_id, status: t.status },
      });
    }
    for (const s of (recentStudentsRes.data || []) as StudentRow[]) {
      const name = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email || 'New student';
      events.push({
        id: s.id,
        type: 'student',
        message: `New ${s.source.toLowerCase()} registration: ${name}`,
        timestamp: s.created_at,
        meta: { student_id: s.id, source: s.source },
      });
    }
    events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const recentActivity = events.slice(0, 6);

    return NextResponse.json({
      stats: {
        universities: uniRes.count ?? 0,
        programs: progRes.count ?? 0,
        scholarships: scholRes.count ?? 0,
        students: studentsTotalRes.count ?? 0,
        studentsLast7d: studentsRecentRes.count ?? 0,
        applications: appsTotalRes.count ?? 0,
        applicationsLast7d: appsRecentRes.count ?? 0,
        leads: appsLeadsRes.count ?? 0, // unlinked apps (no student account)
        activeApplications: appsActiveRes.count ?? 0,
      },
      recentApplications,
      recentActivity,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/dashboard GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

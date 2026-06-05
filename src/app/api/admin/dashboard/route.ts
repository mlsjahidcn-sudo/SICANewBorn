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
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // All queries in parallel. Each one uses count: 'exact' to get the
    // real count from the row headers (cheap; no row data transferred).
    const [
      uniRes, progRes, scholRes,
      studentsTotalRes, studentsRecentRes,
      appsTotalRes, appsRecentRes, appsLeadsRes, appsActiveRes,
      recentAppsRes,
      recentTimelineRes,
      recentStudentsRes,
      // Lead workflow metrics
      leadContactTotalRes, leadContactRecentRes,
      leadChatTotalRes, leadChatRecentRes,
      leadAssessTotalRes, leadAssessRecentRes,
      leadUnassignedRes,
      leadNeedsFollowupRes,
      recentLeadHistoryRes,
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

      // ---- Lead workflow ----
      // Contact form: total + 7d
      service.from('contact_submissions').select('id', { count: 'exact', head: true }),
      service
        .from('contact_submissions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
      // Chat: total + 7d
      service.from('chat_leads').select('id', { count: 'exact', head: true }),
      service
        .from('chat_leads')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
      // Assessment: total + 7d
      service.from('student_assessments').select('id', { count: 'exact', head: true }),
      service
        .from('student_assessments')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),

      // Unassigned leads across all 3 sources
      Promise.all([
        service
          .from('contact_submissions')
          .select('id', { count: 'exact', head: true })
          .is('assigned_to', null)
          .neq('status', 'Resolved')
          .neq('status', 'Spam'),
        service
          .from('chat_leads')
          .select('id', { count: 'exact', head: true })
          .is('assigned_to', null)
          .neq('status', 'Unqualified'),
        service
          .from('student_assessments')
          .select('id', { count: 'exact', head: true })
          .is('assigned_to', null)
          .neq('status', 'Rejected'),
      ]).then((rs) => rs.reduce((a, r) => a + (r.count ?? 0), 0)),

      // Needs follow-up: lead exists, status not 'Resolved'/'Spam'/'Accepted'/'Rejected'/'Qualified',
      // AND (last_contacted_at is null OR last_contacted_at < 1 day ago)
      // AND created_at is older than 1 day
      Promise.all([
        service
          .from('contact_submissions')
          .select('id', { count: 'exact', head: true })
          .in('status', ['New', 'In Progress'])
          .or(`last_contacted_at.is.null,last_contacted_at.lt.${oneDayAgo}`)
          .lt('created_at', oneDayAgo),
        service
          .from('chat_leads')
          .select('id', { count: 'exact', head: true })
          .in('status', ['New', 'Contacted'])
          .or(`last_contacted_at.is.null,last_contacted_at.lt.${oneDayAgo}`)
          .lt('created_at', oneDayAgo),
        service
          .from('student_assessments')
          .select('id', { count: 'exact', head: true })
          .in('status', ['Pending', 'Reviewed', 'Contacted'])
          .or(`last_contacted_at.is.null,last_contacted_at.lt.${oneDayAgo}`)
          .lt('created_at', oneDayAgo),
      ]).then((rs) => rs.reduce((a, r) => a + (r.count ?? 0), 0)),

      // Last 6 lead_history events (any action, any lead)
      service
        .from('lead_history')
        .select('id, lead_type, lead_id, action, admin_id, note, created_at')
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

    // Merge timeline + new students + lead history into a unified activity feed
    type ActivityEvent = {
      id: string;
      type: 'application' | 'student' | 'lead';
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
    type LeadHistoryRow = {
      id: string;
      lead_type: string;
      lead_id: string;
      action: string;
      admin_id: string | null;
      note: string | null;
      created_at: string;
    };
    const LEAD_ACTION_LABEL: Record<string, string> = {
      created: 'Lead created',
      status_changed: 'Lead status changed',
      notes_updated: 'Lead notes updated',
      assigned: 'Lead assigned',
      unassigned: 'Lead unassigned',
      contacted: 'Lead contacted',
    };
    for (const h of (recentLeadHistoryRes.data || []) as LeadHistoryRow[]) {
      const verb = LEAD_ACTION_LABEL[h.action] || h.action;
      const channel = h.note ? ` (${h.note})` : '';
      events.push({
        id: h.id,
        type: 'lead',
        message: `${verb} — ${h.lead_type}${channel}`,
        timestamp: h.created_at,
        meta: { lead_type: h.lead_type, lead_id: h.lead_id, action: h.action },
      });
    }
    events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const recentActivity = events.slice(0, 6);

    // leadUnassignedRes and leadNeedsFollowupRes are already numbers (Promise.all resolved values)
    const unassignedTotal = Number(leadUnassignedRes) || 0;
    const needsFollowupTotal = Number(leadNeedsFollowupRes) || 0;

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
        // Lead workflow (Phase 2.1)
        leadsContact: leadContactTotalRes.count ?? 0,
        leadsContactLast7d: leadContactRecentRes.count ?? 0,
        leadsChat: leadChatTotalRes.count ?? 0,
        leadsChatLast7d: leadChatRecentRes.count ?? 0,
        leadsAssessment: leadAssessTotalRes.count ?? 0,
        leadsAssessmentLast7d: leadAssessRecentRes.count ?? 0,
        leadsUnassigned: unassignedTotal,
        leadsNeedsFollowup: needsFollowupTotal,
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

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

/**
 * GET /api/admin/students/[id]/activity
 *
 * Returns a unified activity feed for a student by merging:
 *   - student_profiles.created_at + updated_at (profile changes)
 *   - application_timeline rows (application status changes)
 *   - student_notifications rows (system events)
 *
 * Each event has a normalized shape: { type, message, timestamp, meta? }
 * Sorted newest-first.
 *
 * Auth: any admin (requireAdmin). Service-role client.
 *
 * NOTE: this is a v1 implementation. It does a 3-query merge in JS.
 * For 1000+ students with 100+ events each, we'd push this down to
 * a single SQL UNION ALL or a materialized view.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Set COZE_SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    );
  }

  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing student id' }, { status: 400 });
  }

  try {
    const service = buildServiceClient();

// Fetch all three sources. The timeline needs application_ids, so we
    // fetch applications first, then the timeline in a 2nd round.
    // Phase 62 (Bug 2): also pull partner_applications linked via
    // the bridge column so partner-side status changes (which write
    // application_timeline rows with partner_application_id set)
    // appear in the activity feed.
    const [profileRes, appsRes, partnerAppsRes, notifRes] = await Promise.all([
      service
        .from('student_profiles')
        .select('id, created_at, updated_at, status, source, first_name, last_name, email')
        .eq('id', id)
        .maybeSingle(),
      service
        .from('student_applications')
        .select('id')
        .eq('student_id', id),
      service
        .from('partner_applications')
        .select('id')
        .eq('linked_student_profile_id', id),
      service
        .from('student_notifications')
        .select('id, title, body, type, created_at, read')
        .eq('student_id', id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    // Now fetch the timeline for those applications (only if there are any)
    // Phase 62 (Bug 2): fetch timeline rows for BOTH the student-app
    // and partner-app sets in parallel, then merge. The
    // application_timeline table has a CHECK constraint that exactly
    // one of (application_id, partner_application_id) is set (see
    // database/2026-06-06_partner_app_timeline_and_notifications.sql).
    const applicationIds = (appsRes.data || []).map((a) => a.id);
    const partnerApplicationIds = (partnerAppsRes.data || []).map((a) => a.id);

    const [studentTimelineRes, partnerTimelineRes] = await Promise.all([
      applicationIds.length > 0
        ? service
            .from('application_timeline')
            .select('id, application_id, partner_application_id, status, notes, created_at')
            .in('application_id', applicationIds)
            .order('created_at', { ascending: false })
            .limit(50)
        : Promise.resolve({ data: [], error: null }),
      partnerApplicationIds.length > 0
        ? service
            .from('application_timeline')
            .select('id, application_id, partner_application_id, status, notes, created_at')
            .in('partner_application_id', partnerApplicationIds)
            .order('created_at', { ascending: false })
            .limit(50)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const profile = profileRes.data;
    const timeline = [
      ...((studentTimelineRes.data || []) as Array<{
        id: string;
        application_id: string | null;
        partner_application_id: string | null;
        status: string;
        notes: string | null;
        created_at: string;
      }>),
      ...((partnerTimelineRes.data || []) as Array<{
        id: string;
        application_id: string | null;
        partner_application_id: string | null;
        status: string;
        notes: string | null;
        created_at: string;
      }>),
    ];
    const notifications = (notifRes.data || []) as Array<{
      id: string;
      title: string;
      body: string;
      type: string;
      created_at: string;
      read: boolean;
    }>;

    // Normalize to a common shape
    type Activity = {
      id: string;
      type: 'profile' | 'application' | 'notification';
      message: string;
      timestamp: string;
      meta?: Record<string, unknown>;
    };

    const events: Activity[] = [];

    if (profile) {
      events.push({
        id: `${profile.id}-created`,
        type: 'profile',
        message: 'Student profile created',
        timestamp: profile.created_at,
        meta: { source: profile.source, status: profile.status },
      });
      if (profile.updated_at && profile.updated_at !== profile.created_at) {
        events.push({
          id: `${profile.id}-updated`,
          type: 'profile',
          message: 'Student profile updated',
          timestamp: profile.updated_at,
        });
      }
    }

    for (const t of timeline) {
      events.push({
        id: t.id,
        type: 'application',
        message: t.notes || t.status || 'Application event',
        timestamp: t.created_at,
        meta: {
          // Phase 62 (Bug 2): one of these is null per the
          // application_timeline CHECK constraint. Surface both so
          // the UI can tell which surface the event came from.
          application_id: t.application_id,
          partner_application_id: t.partner_application_id,
          surface: t.partner_application_id ? 'partner' : 'student',
          status: t.status,
        },
      });
    }

    for (const n of notifications) {
      events.push({
        id: n.id,
        type: 'notification',
        message: n.title || n.body || n.type,
        timestamp: n.created_at,
        meta: { type: n.type, read: n.read },
      });
    }

    // Sort newest first
    events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    return NextResponse.json({ activity: events });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/students/:id/activity GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

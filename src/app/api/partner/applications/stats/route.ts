import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, getServerEnv } from '@/lib/supabase-auth';

/**
 * GET /api/partner/applications/stats
 *
 * Server-side breakdown for the partner's applications.
 * Returns exact counts (no row cap):
 *   { total, inReview, submitted, accepted, urgent, archived }
 *
 * Auth: requireTeamMember. Uses the per-request authed client (RLS
 * scopes to this partner).
 */
export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Set COZE_SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    );
  }

  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    // Fetch active rows' status + priority, plus an exact archived count.
    // Phase 1: scope to the calling partner (and member if applicable).
    let activeQ = auth.supabase
      .from('partner_applications')
      .select('status,priority')
      .is('archived_at', null)
      .eq('partner_id', auth.partnerId);
    let archivedQ = auth.supabase
      .from('partner_applications')
      .select('id', { count: 'exact', head: true })
      .not('archived_at', 'is', null)
      .eq('partner_id', auth.partnerId);

    if (auth.role === 'member') {
      activeQ = activeQ.eq('created_by_user_id', auth.user.id);
      archivedQ = archivedQ.eq('created_by_user_id', auth.user.id);
    }

    const [activeRes, archivedCountRes] = await Promise.all([activeQ, archivedQ]);

    if (activeRes.error) {
      console.error('[partner/applications/stats GET] active rows error:', activeRes.error);
      return NextResponse.json({ error: activeRes.error.message }, { status: 500 });
    }
    if (archivedCountRes.error) {
      console.error('[partner/applications/stats GET] archived count error:', archivedCountRes.error);
      return NextResponse.json({ error: archivedCountRes.error.message }, { status: 500 });
    }

    const rows = (activeRes.data || []) as Array<{ status?: string | null; priority?: string | null }>;
    const archived = archivedCountRes.count || 0;
    const counts = {
      total: rows.length + archived,
      inReview: 0,
      submitted: 0,
      accepted: 0,
      urgent: 0,
      archived,
    };

    for (const row of rows) {
      if (row.status === 'Submitted' || row.status === 'In Review') {
        counts.inReview++;
      }
      if (row.status === 'Submitted') {
        counts.submitted++;
      }
      if (row.status === 'Accepted') {
        counts.accepted++;
      }
      if (row.priority === 'High' || row.priority === 'Urgent') {
        counts.urgent++;
      }
    }

    return NextResponse.json(counts);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/applications/stats GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

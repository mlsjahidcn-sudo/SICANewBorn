import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, getServerEnv } from '@/lib/supabase-auth';

/**
 * GET /api/partner/students/stats
 *
 * Server-side status breakdown for the partner's students.
 * Returns exact counts (no row cap):
 *   { total, new, inProgress, applied, accepted, rejected, archived }
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
    // We need counts for active (non-archived) rows by status and a
    // separate archived count. Supabase doesn't support GROUP BY in
    // the JS client, so we issue two cheap count queries + one status
    // breakdown fetch. For partners with very large student lists,
    // fetching all rows to count in JS is expensive; we instead fetch
    // only the status column for active rows.
    const [activeStatusesRes, archivedCountRes] = await Promise.all([
      auth.supabase
        .from('partner_students')
        .select('status')
        .is('archived_at', null),
      auth.supabase
        .from('partner_students')
        .select('id', { count: 'exact', head: true })
        .not('archived_at', 'is', null),
    ]);

    if (activeStatusesRes.error) {
      console.error('[partner/students/stats GET] active statuses error:', activeStatusesRes.error);
      return NextResponse.json({ error: activeStatusesRes.error.message }, { status: 500 });
    }
    if (archivedCountRes.error) {
      console.error('[partner/students/stats GET] archived count error:', archivedCountRes.error);
      return NextResponse.json({ error: archivedCountRes.error.message }, { status: 500 });
    }

    const rows = (activeStatusesRes.data || []) as { status?: string | null }[];
    const counts = {
      total: rows.length + (archivedCountRes.count || 0),
      new: 0,
      inProgress: 0,
      applied: 0,
      accepted: 0,
      rejected: 0,
      archived: archivedCountRes.count || 0,
    };

    for (const row of rows) {
      switch (row.status) {
        case 'New': counts.new++; break;
        case 'In Progress': counts.inProgress++; break;
        case 'Applied': counts.applied++; break;
        case 'Accepted': counts.accepted++; break;
        case 'Rejected': counts.rejected++; break;
      }
    }

    return NextResponse.json(counts);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/students/stats GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

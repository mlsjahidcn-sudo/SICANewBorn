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
    // Phase 111d: was selecting all active rows' `status` column and
    // counting in JS. For a 10k-row partner this is a 10k-row network
    // payload to count 6 buckets. Replaced with per-bucket `count:
    // 'exact'` queries — same answer, 0-byte payload for the JS side.
    // 7 buckets in parallel.
    const archivedQ = auth.supabase
      .from('partner_students')
      .select('id', { count: 'exact', head: true })
      .not('archived_at', 'is', null);

    const newQ = auth.supabase
      .from('partner_students')
      .select('id', { count: 'exact', head: true })
      .is('archived_at', null)
      .eq('status', 'New');

    const inProgressQ = auth.supabase
      .from('partner_students')
      .select('id', { count: 'exact', head: true })
      .is('archived_at', null)
      .eq('status', 'In Progress');

    const appliedQ = auth.supabase
      .from('partner_students')
      .select('id', { count: 'exact', head: true })
      .is('archived_at', null)
      .eq('status', 'Applied');

    const acceptedQ = auth.supabase
      .from('partner_students')
      .select('id', { count: 'exact', head: true })
      .is('archived_at', null)
      .eq('status', 'Accepted');

    const rejectedQ = auth.supabase
      .from('partner_students')
      .select('id', { count: 'exact', head: true })
      .is('archived_at', null)
      .eq('status', 'Rejected');

    const [archivedRes, newRes, inProgressRes, appliedRes, acceptedRes, rejectedRes] =
      await Promise.all([archivedQ, newQ, inProgressQ, appliedQ, acceptedQ, rejectedQ]);

    const firstError = [archivedRes, newRes, inProgressRes, appliedRes, acceptedRes, rejectedRes]
      .find((r) => r.error);
    if (firstError?.error) {
      console.error('[partner/students/stats GET] count error:', firstError.error.message);
      return NextResponse.json({ error: firstError.error.message }, { status: 500 });
    }

    const total = (newRes.count || 0) + (inProgressRes.count || 0) + (appliedRes.count || 0) +
      (acceptedRes.count || 0) + (rejectedRes.count || 0) + (archivedRes.count || 0);
    return NextResponse.json({
      total,
      new: newRes.count || 0,
      inProgress: inProgressRes.count || 0,
      applied: appliedRes.count || 0,
      accepted: acceptedRes.count || 0,
      rejected: rejectedRes.count || 0,
      archived: archivedRes.count || 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/students/stats GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

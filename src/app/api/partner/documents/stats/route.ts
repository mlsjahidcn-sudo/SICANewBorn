import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, getServerEnv } from '@/lib/supabase-auth';
import { PARTNER_DOC_STATUSES, type PartnerDocStatus } from '@/lib/partner-doc-mapper';

/**
 * GET /api/partner/documents/stats
 *
 * Exact per-status counts for the partner's document library.
 * Returns:
 *   { all: number, Pending: number, Verified: number, Rejected: number }
 *
 * Auth: requireTeamMember. Uses the per-request authed client (RLS
 * scopes to this partner's rows).
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
    const baseQuery = auth.supabase
      .from('student_documents')
      .select('id', { count: 'exact', head: true })
      .not('partner_student_id', 'is', null);

    const statusQueries = (PARTNER_DOC_STATUSES as readonly PartnerDocStatus[]).map((status) =>
      auth.supabase
        .from('student_documents')
        .select('id', { count: 'exact', head: true })
        .not('partner_student_id', 'is', null)
        .eq('status', status),
    );

    const [totalRes, ...statusRes] = await Promise.all([baseQuery, ...statusQueries]);

    if (totalRes.error) {
      console.error('[partner/documents/stats GET] total count error:', totalRes.error);
      return NextResponse.json({ error: totalRes.error.message }, { status: 500 });
    }
    for (let i = 0; i < statusRes.length; i++) {
      const r = statusRes[i];
      if (r.error) {
        console.error(`[partner/documents/stats GET] ${PARTNER_DOC_STATUSES[i]} count error:`, r.error);
        return NextResponse.json({ error: r.error.message }, { status: 500 });
      }
    }

    const counts: Record<PartnerDocStatus | 'all', number> = {
      all: totalRes.count || 0,
      Pending: statusRes[0]?.count || 0,
      Verified: statusRes[1]?.count || 0,
      Rejected: statusRes[2]?.count || 0,
    };

    return NextResponse.json(counts);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/documents/stats GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

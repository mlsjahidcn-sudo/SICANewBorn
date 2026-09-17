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
    // Phase 111d: was selecting active rows (status + priority) and
    // counting in JS. For a partner with 10k rows this is a 10k-row
    // network payload to count a single bucket. Replaced with
    // per-bucket `count: 'exact'` queries — same answer, 0-byte
    // payload for the JS side. 6 buckets in parallel.
    //
    // Buckets:
    //   inReview = Submitted + In Review (cross-taxonomy)
    //   submitted = Submitted only
    //   accepted = Accepted
    //   urgent = priority IN (High, Urgent)
    //   archived = archived_at NOT NULL
    //   total = archived + (active rows in any status)
    //
    // Phase 1: scope to the calling partner (and member if applicable).
    // The Supabase builder type narrows on each .eq() call, so we
    // build each query inline with a fresh chain (no shared helper).
    const basePartner = () =>
      auth.supabase
        .from('partner_applications')
        .select('id', { count: 'exact', head: true })
        .eq('partner_id', auth.partnerId)
        .is('archived_at', null);
    const basePartnerArchived = () =>
      auth.supabase
        .from('partner_applications')
        .select('id', { count: 'exact', head: true })
        .eq('partner_id', auth.partnerId)
        .not('archived_at', 'is', null);

    const totalActiveQ = basePartner();
    const archivedQ = basePartnerArchived();
    const inReviewQ = auth.supabase
      .from('partner_applications')
      .select('id', { count: 'exact', head: true })
      .eq('partner_id', auth.partnerId)
      .is('archived_at', null)
      .in('status', ['Submitted', 'In Review']);
    const submittedQ = auth.supabase
      .from('partner_applications')
      .select('id', { count: 'exact', head: true })
      .eq('partner_id', auth.partnerId)
      .is('archived_at', null)
      .eq('status', 'Submitted');
    const acceptedQ = auth.supabase
      .from('partner_applications')
      .select('id', { count: 'exact', head: true })
      .eq('partner_id', auth.partnerId)
      .is('archived_at', null)
      .eq('status', 'Accepted');
    const urgentQ = auth.supabase
      .from('partner_applications')
      .select('id', { count: 'exact', head: true })
      .eq('partner_id', auth.partnerId)
      .is('archived_at', null)
      .in('priority', ['High', 'Urgent']);

    // Phase 1 continued: team members only see rows they created.
    if (auth.role === 'member') {
      totalActiveQ.eq('created_by_user_id', auth.user.id);
      archivedQ.eq('created_by_user_id', auth.user.id);
      inReviewQ.eq('created_by_user_id', auth.user.id);
      submittedQ.eq('created_by_user_id', auth.user.id);
      acceptedQ.eq('created_by_user_id', auth.user.id);
      urgentQ.eq('created_by_user_id', auth.user.id);
    }

    const [totalRes, archivedRes, inReviewRes, submittedRes, acceptedRes, urgentRes] =
      await Promise.all([totalActiveQ, archivedQ, inReviewQ, submittedQ, acceptedQ, urgentQ]);

    const firstError = [totalRes, archivedRes, inReviewRes, submittedRes, acceptedRes, urgentRes]
      .find((r) => r.error);
    if (firstError?.error) {
      console.error('[partner/applications/stats GET] count error:', firstError.error.message);
      return NextResponse.json({ error: firstError.error.message }, { status: 500 });
    }

    const total = (totalRes.count || 0) + (archivedRes.count || 0);
    return NextResponse.json({
      total,
      inReview: inReviewRes.count || 0,
      submitted: submittedRes.count || 0,
      accepted: acceptedRes.count || 0,
      urgent: urgentRes.count || 0,
      archived: archivedRes.count || 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/applications/stats GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

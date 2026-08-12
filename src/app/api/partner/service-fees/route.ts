import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember } from '@/lib/supabase-auth';
import { mapPartnerFeeFromDb } from '@/lib/partner-fee-mapper';
import { createPartnerFeeProofDownloadUrl } from '@/lib/storage';

/**
 * GET /api/partner/service-fees — list the signed-in partner's service fees.
 * Auth: team member (owner or active member).
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTeamMember(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    let query = auth.supabase
      .from('partner_fees')
      .select('*')
      .eq('partner_id', auth.partnerId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const { data, error } = await query;

    if (error) {
      console.error('[partner/service-fees GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const fees = (data || []).map((row) => mapPartnerFeeFromDb(row as unknown as Parameters<typeof mapPartnerFeeFromDb>[0]));

    // Mint short-lived download URLs for any payment proofs so the partner
    // can view their own screenshots in the portal.
    const feesWithUrls = await Promise.all(
      fees.map(async (fee) => {
        if (!fee.paymentProofUrl) return fee;
        return {
          ...fee,
          paymentProofDownloadUrl: await createPartnerFeeProofDownloadUrl(fee.paymentProofUrl),
        };
      }),
    );

    return NextResponse.json(feesWithUrls);
  } catch (error) {
    console.error('[partner/service-fees GET] error:', error);
    return NextResponse.json({ error: 'Failed to fetch service fees' }, { status: 500 });
  }
}

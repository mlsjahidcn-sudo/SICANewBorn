import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember } from '@/lib/supabase-auth';
import { mapPartnerFeeFromDb } from '@/lib/partner-fee-mapper';

/**
 * PATCH /api/partner/service-fees/[id]
 *
 * Partners can only submit payment proof (paymentProofUrl + paymentNotes)
 * on their own Pending or Rejected fees. Status flips to PendingVerification.
 *
 * Auth: team member (owner or active member).
 */
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireTeamMember(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Fetch current fee to enforce state machine.
    const { data: current, error: fetchError } = await auth.supabase
      .from('partner_fees')
      .select('id, status')
      .eq('id', id)
      .eq('partner_id', auth.partnerId)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
    }

    if (!['Pending', 'Rejected'].includes(current.status as string)) {
      return NextResponse.json(
        { error: 'This fee cannot be updated. It may already be paid or awaiting verification.' },
        { status: 409 },
      );
    }

    if (!body.paymentProofUrl || typeof body.paymentProofUrl !== 'string') {
      return NextResponse.json({ error: 'paymentProofUrl is required' }, { status: 400 });
    }

    const update = {
      payment_proof_url: body.paymentProofUrl,
      payment_notes: typeof body.paymentNotes === 'string' ? body.paymentNotes : null,
      status: 'PendingVerification',
    };

    const { data, error } = await auth.supabase
      .from('partner_fees')
      .update(update)
      .eq('id', id)
      .eq('partner_id', auth.partnerId)
      .select('*')
      .single();

    if (error) {
      console.error('[partner/service-fees PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ fee: mapPartnerFeeFromDb(data) });
  } catch (error) {
    console.error('[partner/service-fees PATCH] error:', error);
    return NextResponse.json({ error: 'Failed to submit payment proof' }, { status: 500 });
  }
}

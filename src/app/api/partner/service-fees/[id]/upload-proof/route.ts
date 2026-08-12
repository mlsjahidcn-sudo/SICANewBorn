import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember } from '@/lib/supabase-auth';
import { createPartnerFeeProofUploadUrl } from '@/lib/storage';

/**
 * POST /api/partner/service-fees/[id]/upload-proof
 *
 * Issues a signed upload URL for a payment proof screenshot. The partner
 * must own the fee and the fee must be in a state that allows upload
 * (Pending or Rejected). After uploading to the signed URL, the client
 * PATCHes the fee record with the storage path.
 *
 * Body: { originalFileName, contentType, size }
 * Response (201): { uploadUrl, storagePath, token }
 */
export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(
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

    const originalFileName = typeof body.originalFileName === 'string' ? body.originalFileName : '';
    const contentType = typeof body.contentType === 'string' ? body.contentType : '';
    const size = typeof body.size === 'number' ? body.size : 0;

    if (!originalFileName || !contentType) {
      return NextResponse.json(
        { error: 'originalFileName and contentType are required' },
        { status: 400 },
      );
    }
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: 'File type not allowed. Use PNG, JPG, WEBP, or PDF.' },
        { status: 400 },
      );
    }
    if (size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Verify the fee belongs to this partner and is payable.
    const { data: fee, error: feeError } = await auth.supabase
      .from('partner_fees')
      .select('id, status')
      .eq('id', id)
      .eq('partner_id', auth.partnerId)
      .single();

    if (feeError || !fee) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
    }

    if (!['Pending', 'Rejected'].includes(fee.status as string)) {
      return NextResponse.json(
        { error: 'Payment proof can only be uploaded for Pending or Rejected fees' },
        { status: 409 },
      );
    }

    const result = await createPartnerFeeProofUploadUrl(auth.partnerId, id, originalFileName);
    if (!result) {
      return NextResponse.json(
        { error: 'Failed to issue upload URL. Storage may not be configured.' },
        { status: 503 },
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[partner/service-fees upload-proof] error:', error);
    return NextResponse.json({ error: 'Failed to issue upload URL' }, { status: 500 });
  }
}

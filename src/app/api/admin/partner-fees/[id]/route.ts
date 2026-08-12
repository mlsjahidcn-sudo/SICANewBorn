import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { mapPartnerFeeFromDb } from '@/lib/partner-fee-mapper';

/**
 * GET    /api/admin/partner-fees/[id]  — single fee details
 * PATCH  /api/admin/partner-fees/[id]  — update amount/due date/description or verify/reject
 * DELETE /api/admin/partner-fees/[id]  — remove fee
 *
 * Auth: admin only.
 */
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const service = buildServiceClient();
  const { data, error } = await service
    .from('partner_fees')
    .select('*, partner:partner_id (id, company_name, email)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
  }

  const mapped = mapPartnerFeeFromDb(data as unknown as Parameters<typeof mapPartnerFeeFromDb>[0]);
  const partner = (data as Record<string, unknown>).partner as
    | { company_name?: string | null; email?: string | null }
    | null
    | undefined;

  return NextResponse.json({
    fee: {
      ...mapped,
      partnerName: partner?.company_name || partner?.email || '—',
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  try {
    const body = await request.json();
    const service = buildServiceClient();

    const update: Record<string, unknown> = {};
    if (body.studentName !== undefined) update.student_name = String(body.studentName).trim();
    if (body.amount !== undefined) {
      if (typeof body.amount !== 'number' || body.amount <= 0) {
        return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
      }
      update.amount = body.amount;
    }
    if (body.currency !== undefined) update.currency = String(body.currency).trim();
    if (body.description !== undefined) update.description = body.description || null;
    if (body.dueDate !== undefined) update.due_date = body.dueDate || null;

    // Verification actions
    if (body.status === 'Paid') {
      update.status = 'Paid';
      update.paid_at = new Date().toISOString();
      update.verified_at = new Date().toISOString();
      update.verified_by = auth.user.id;
    } else if (body.status === 'Rejected') {
      update.status = 'Rejected';
      // Keep payment proof so partner can re-upload after rejection.
    } else if (body.status !== undefined) {
      update.status = body.status;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await service
      .from('partner_fees')
      .update(update)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[admin/partner-fees PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data) return NextResponse.json({ error: 'Fee not found' }, { status: 404 });

    return NextResponse.json({ fee: mapPartnerFeeFromDb(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const service = buildServiceClient();
  const { error } = await service.from('partner_fees').delete().eq('id', id);

  if (error) {
    console.error('[admin/partner-fees DELETE] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

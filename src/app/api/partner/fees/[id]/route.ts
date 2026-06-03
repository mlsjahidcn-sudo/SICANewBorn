import { NextRequest, NextResponse } from 'next/server';
import { requirePartner } from '@/lib/supabase-auth';
import {
  mapPartnerFeeFromDb,
  mapPartnerFeeToDb,
  parsePartnerFeeStatus,
} from '@/lib/partner-fee-mapper';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requirePartner(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const { data, error } = await auth.supabase
      .from('partner_fees')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[partner/fees/:id GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
    }

    return NextResponse.json({ fee: mapPartnerFeeFromDb(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/fees/:id GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requirePartner(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const body = await request.json();

    if (body.status !== undefined && !parsePartnerFeeStatus(body.status)) {
      return NextResponse.json(
        { error: "status must be 'Pending' | 'Paid' | 'Overdue' | 'Refunded'" },
        { status: 400 },
      );
    }
    if (body.amount !== undefined && (isNaN(Number(body.amount)) || Number(body.amount) < 0)) {
      return NextResponse.json({ error: 'amount must be a non-negative number' }, { status: 400 });
    }

    const updates = mapPartnerFeeToDb(body);
    delete (updates as Record<string, unknown>).partner_id;
    delete (updates as Record<string, unknown>).id;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await auth.supabase
      .from('partner_fees')
      .update(updates)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('[partner/fees/:id PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
    }

    return NextResponse.json({ fee: mapPartnerFeeFromDb(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/fees/:id PATCH] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requirePartner(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const { error, count } = await auth.supabase
      .from('partner_fees')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) {
      console.error('[partner/fees/:id DELETE] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!count) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/fees/:id DELETE] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

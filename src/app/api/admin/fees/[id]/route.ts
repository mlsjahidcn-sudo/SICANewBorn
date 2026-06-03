import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

/**
 * PATCH  /api/admin/fees/[id]  — update a fee (mark as paid, change amount, etc.)
 * DELETE /api/admin/fees/[id]  — hard delete (use sparingly; prefer marking Cancelled)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing fee id' }, { status: 400 });

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
      if (['id', 'student_id', 'created_at'].includes(k)) continue;
      updates[k] = v;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updatable fields' }, { status: 400 });
    }

    // If amount_paid is being set, auto-derive status:
    //   paid >= amount → 'Paid' + paid_date = now
    //   paid > 0 and < amount → 'Partial'
    // We need the existing `amount` to do the compare, so we may need
    // to read the row first.
    if (typeof updates.amount_paid === 'number') {
      const service = buildServiceClient();
      const { data: existing } = await service
        .from('student_fees')
        .select('amount, status')
        .eq('id', id)
        .maybeSingle();
      if (existing) {
        const total = Number(existing.amount);
        if (updates.amount_paid >= total) {
          updates.status = 'Paid';
          updates.paid_date = new Date().toISOString().slice(0, 10);
        } else if (updates.amount_paid > 0) {
          // Only auto-set to Partial if the current status isn't already
          // something stricter (don't downgrade a Paid fee to Partial
          // because of a typo in a follow-up PATCH)
          if (existing.status === 'Pending' || existing.status === 'Overdue') {
            updates.status = 'Partial';
          }
        }
      }
    }

    const service = buildServiceClient();
    const { data, error } = await service
      .from('student_fees')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[admin/fees/:id PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ fee: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing fee id' }, { status: 400 });

  try {
    const service = buildServiceClient();
    // Prefer cancel over delete to preserve audit
    const { data, error } = await service
      .from('student_fees')
      .update({ status: 'Cancelled' })
      .eq('id', id)
      .select('id, status')
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, fee: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

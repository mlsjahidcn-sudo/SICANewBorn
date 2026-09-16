import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * Phase 108 Batch 7: GET /api/admin/fees/[id]/events
 *
 * Returns the audit-trail events for a single student_fee. Capped at
 * 200 rows (newest first) so the timeline tab can render without
 * paging. Admin-only.
 *
 * Response: { events: StudentFeeEvent[] }
 *
 * StudentFeeEvent shape (all from the student_fee_events table):
 *   id, fee_id, event_type, actor_id, actor_email,
 *   from_status, to_status, amount_paid_at_event, note, created_at
 */
const MAX_EVENTS = 200;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing fee id' }, { status: 400 });

  try {
    const service = buildServiceClient();
    // First verify the fee exists — return 404 instead of an empty
    // array so the UI can distinguish "no fee" from "fee with no events".
    const { data: fee, error: feeErr } = await service
      .from('student_fees')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    if (feeErr) {
      return NextResponse.json({ error: feeErr.message }, { status: 500 });
    }
    if (!fee) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
    }

    const { data: events, error } = await service
      .from('student_fee_events')
      .select(
        'id, fee_id, event_type, actor_id, actor_email, from_status, to_status, amount_paid_at_event, note, created_at',
      )
      .eq('fee_id', id)
      .order('created_at', { ascending: false })
      .limit(MAX_EVENTS);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      events: events || [],
      maxEvents: MAX_EVENTS,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
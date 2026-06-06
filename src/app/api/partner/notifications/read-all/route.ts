import { NextRequest, NextResponse } from 'next/server';
import { requirePartner, getServerEnv } from '@/lib/supabase-auth';

/**
 * POST /api/partner/notifications/read-all
 *
 * Mark all the partner's unread notifications as read. Returns
 * the number of rows updated so the UI can show a toast
 * "Marked 3 as read".
 *
 * Implementation note: Supabase JS doesn't have a `.update()`
 * with a "limit" — we use the same eq(user_id) + eq(is_read,
 * false) pattern the list endpoint uses for the unread filter.
 * For very large inboxes this could become a background job,
 * but for v1 the table is small (low hundreds of rows per
 * partner) and the update is bounded by the index on user_id.
 */
export async function POST(_request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 },
    );
  }
  const auth = await requirePartner(_request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    // First read the IDs so we can return the count. We could
    // rely on the affected-rows count from the UPDATE instead,
    // but PostgREST's count semantics with RLS UPDATE are
    // inconsistent across versions. Pre-reading is more
    // predictable for the UI toast.
    const { data: ids, error: readErr } = await auth.supabase
      .from('partner_notifications')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('is_read', false);
    if (readErr) {
      console.error('[partner/notifications/read-all POST] read error:', readErr);
      return NextResponse.json({ error: readErr.message }, { status: 500 });
    }
    if (!ids || ids.length === 0) {
      return NextResponse.json({ marked: 0 });
    }
    const { error: updateErr } = await auth.supabase
      .from('partner_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', auth.user.id)
      .eq('is_read', false);
    if (updateErr) {
      console.error('[partner/notifications/read-all POST] update error:', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }
    return NextResponse.json({ marked: ids.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/notifications/read-all POST] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requirePartner, getServerEnv } from '@/lib/supabase-auth';

/**
 * PATCH /api/partner/notifications/[id]
 *
 * Mark a single notification as read. Idempotent — calling twice
 * is fine. Returns the updated row so the UI can update its
 * in-memory state without a refetch.
 *
 * Auth: requirePartner. The RLS UPDATE policy checks user_id =
 * auth.uid(), so a partner can only mark their own rows. We
 * also add a defensive `.eq('user_id', auth.user.id)` so a
 * future RLS change can't accidentally expose this to other
 * partners.
 */
export async function PATCH(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    const { data, error } = await auth.supabase
      .from('partner_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', auth.user.id)
      .select('id, is_read, read_at')
      .maybeSingle();
    if (error) {
      console.error('[partner/notifications/:id PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json(
        { error: 'Notification not found or not yours' },
        { status: 404 },
      );
    }
    return NextResponse.json({ notification: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/notifications/:id PATCH] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

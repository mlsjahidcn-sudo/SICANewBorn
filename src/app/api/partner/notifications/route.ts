import { NextRequest, NextResponse } from 'next/server';
import { requirePartner, getServerEnv } from '@/lib/supabase-auth';

/**
 * GET /api/partner/notifications
 *
 * List this partner's notifications. Optional filters:
 *   - unread : 'true' to filter to is_read=false only (default false)
 *   - type   : exact match on the type column ('status_change', 'team', etc.)
 *   - page, limit
 *
 * The user's auth.uid() scopes the SELECT (RLS policy
 * "Partners can view their own notifications") — we don't need
 * a manual user_id filter, but we add one anyway for defense in
 * depth so a future RLS change can't leak rows.
 *
 * Response: { notifications, total, page, limit, totalPages, unreadCount }
 *
 * S30: pairs with the /partner/notifications inbox page and the
 * sidebar bell badge (which polls /unread-count separately every 30s).
 */
export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 },
    );
  }
  const auth = await requirePartner(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const unread = searchParams.get('unread') === 'true';
    const type = searchParams.get('type');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)));

    // Use the per-request authed client so RLS scopes the SELECT.
    // The user_id check on partner_notifications is enforced by the
    // RLS policy + we add a defensive `.eq('user_id', auth.user.id)`.
    let query = auth.supabase
      .from('partner_notifications')
      .select('id, user_id, partner_application_id, title, message, type, is_read, read_at, link_url, created_at', { count: 'exact' })
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false });

    if (unread) query = query.eq('is_read', false);
    if (type) query = query.eq('type', type);

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      console.error('[partner/notifications GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Unread count is cheap and the bell badge needs it on every
    // page load — return it alongside the list so the UI doesn't
    // need a second round-trip.
    const { count: unreadCount, error: unreadErr } = await auth.supabase
      .from('partner_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', auth.user.id)
      .eq('is_read', false);
    if (unreadErr) {
      console.error('[partner/notifications GET] unread count error:', unreadErr);
    }

    return NextResponse.json({
      notifications: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
      unreadCount: unreadCount || 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/notifications GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getRequestAuth, getServerEnv } from '@/lib/supabase-auth';

/**
 * GET /api/student/notifications
 *
 * List the authed student's own notifications. Optional filters:
 *   - unread : 'true' to filter to is_read=false only (default false)
 *   - type   : exact match on the type column
 *   - page, limit
 *
 * S32: mirrors /api/partner/notifications for the student
 * portal. The student's identity comes from the JWT (auth.user.id);
 * RLS on student_notifications scopes the SELECT so even a
 * hand-crafted query can't escape. We add a defensive
 * `.eq('student_id', user.id)` so a future RLS edit can't leak
 * rows.
 *
 * Response: { notifications, total, page, limit, totalPages, unreadCount }
 */
export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }
  const auth = await getRequestAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { supabase, user } = auth;

  try {
    const { searchParams } = new URL(request.url);
    const unread = searchParams.get('unread') === 'true';
    const type = searchParams.get('type');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)));

    let query = supabase
      .from('student_notifications')
      .select('id, student_id, title, message, type, is_read, read_at, created_at', { count: 'exact' })
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    if (unread) query = query.eq('is_read', false);
    if (type) query = query.eq('type', type);

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      console.error('[student/notifications GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Unread count in a second round-trip — same RLS scope, head:true
    // so no row payload. Returned alongside the list so the bell
    // badge doesn't need a second fetch.
    const { count: unreadCount, error: unreadErr } = await supabase
      .from('student_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', user.id)
      .eq('is_read', false);
    if (unreadErr) {
      console.error('[student/notifications GET] unread count error:', unreadErr);
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
    console.error('[student/notifications GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getRequestAuth, getServerEnv } from '@/lib/supabase-auth';

/**
 * GET /api/student/notifications/unread-count
 *
 * Just the unread count for the student sidebar bell badge.
 * Cheap: head:true count(*) under RLS. Polled every 30s by
 * the student layout (and on focus / route change).
 *
 * Response: { count: number }
 */
export async function GET(_request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }
  const auth = await getRequestAuth(_request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { supabase, user } = auth;
  try {
    const { count, error } = await supabase
      .from('student_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', user.id)
      .eq('is_read', false);
    if (error) {
      console.error('[student/notifications/unread-count GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ count: count || 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[student/notifications/unread-count GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

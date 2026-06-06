import { NextRequest, NextResponse } from 'next/server';
import { getRequestAuth, getServerEnv } from '@/lib/supabase-auth';

/**
 * POST /api/student/notifications/read-all
 *
 * Mark all the student's unread notifications as read.
 * Returns the count of rows updated so the UI can show a
 * "Marked N as read" toast.
 */
export async function POST(_request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }
  const auth = await getRequestAuth(_request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { supabase, user } = auth;
  try {
    const { data: ids, error: readErr } = await supabase
      .from('student_notifications')
      .select('id')
      .eq('student_id', user.id)
      .eq('is_read', false);
    if (readErr) {
      console.error('[student/notifications/read-all POST] read error:', readErr);
      return NextResponse.json({ error: readErr.message }, { status: 500 });
    }
    if (!ids || ids.length === 0) {
      return NextResponse.json({ marked: 0 });
    }
    const { error: updateErr } = await supabase
      .from('student_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('student_id', user.id)
      .eq('is_read', false);
    if (updateErr) {
      console.error('[student/notifications/read-all POST] update error:', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }
    return NextResponse.json({ marked: ids.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[student/notifications/read-all POST] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

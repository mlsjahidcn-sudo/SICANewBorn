import { NextRequest, NextResponse } from 'next/server';
import { getRequestAuth, getServerEnv } from '@/lib/supabase-auth';

/**
 * PATCH /api/student/notifications/[id]
 *
 * Mark a single notification as read. Idempotent. Returns the
 * updated row.
 *
 * Auth: getRequestAuth — any logged-in user. RLS UPDATE policy
 * on student_notifications restricts to student_id = auth.uid(),
 * so a student can only mark their own rows. We add a defensive
 * .eq('student_id', user.id) to make the constraint explicit
 * in the SQL too.
 */
export async function PATCH(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }
  const auth = await getRequestAuth(_request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { supabase, user } = auth;
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    const { data, error } = await supabase
      .from('student_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('student_id', user.id)
      .select('id, is_read, read_at')
      .maybeSingle();
    if (error) {
      console.error('[student/notifications/:id PATCH] supabase error:', error);
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
    console.error('[student/notifications/:id PATCH] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/student/notifications/[id]
 *
 * Remove a single notification from the student's inbox.
 * RLS DELETE policy on student_notifications restricts to
 * student_id = auth.uid(). We add a defensive .eq() here too.
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }
  const auth = await getRequestAuth(_request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { supabase, user } = auth;
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    const { error, count } = await supabase
      .from('student_notifications')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('student_id', user.id);
    if (error) {
      console.error('[student/notifications/:id DELETE] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!count) {
      return NextResponse.json(
        { error: 'Notification not found or not yours' },
        { status: 404 },
      );
    }
    return NextResponse.json({ deleted: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[student/notifications/:id DELETE] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

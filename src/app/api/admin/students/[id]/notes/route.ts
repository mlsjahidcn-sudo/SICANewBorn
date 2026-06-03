import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

/**
 * GET  /api/admin/students/[id]/notes  — list notes for a student
 * POST /api/admin/students/[id]/notes  — add a note
 *
 * Auth: any admin (requireAdmin). Service-role client.
 *
 * The note is attributed to the admin who wrote it (from the
 * authed session) — `author_id` and `author_name` are auto-filled,
 * not taken from the body.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing student id' }, { status: 400 });

  try {
    const service = buildServiceClient();
    const { data, error } = await service
      .from('student_notes')
      .select('*')
      .eq('student_id', id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[admin/notes GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ notes: data || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing student id' }, { status: 400 });

  try {
    const body = await request.json();
    if (!body.body || typeof body.body !== 'string' || body.body.trim() === '') {
      return NextResponse.json({ error: 'body is required' }, { status: 400 });
    }

    // Best-effort author name from the admin's user_metadata
    const authorName =
      (auth.user.user_metadata?.full_name as string | undefined) ||
      (auth.user.user_metadata?.name as string | undefined) ||
      auth.user.email?.split('@')[0] ||
      'Admin';

    const service = buildServiceClient();
    const { data, error } = await service
      .from('student_notes')
      .insert({
        student_id: id,
        author_id: auth.user.id,
        author_name: authorName,
        body: body.body.trim(),
        is_pinned: !!body.is_pinned,
      })
      .select('*')
      .single();

    if (error) {
      console.error('[admin/notes POST] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ note: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

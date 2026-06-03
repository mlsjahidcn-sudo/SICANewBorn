import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

/**
 * DELETE /api/admin/students/[id]/notes/[noteId]
 * PATCH  /api/admin/students/[id]/notes/[noteId]
 *
 * Auth: any admin. Service-role client.
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; noteId: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { noteId } = await context.params;
  if (!noteId) return NextResponse.json({ error: 'Missing note id' }, { status: 400 });

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (typeof body.body === 'string' && body.body.trim() !== '') updates.body = body.body.trim();
    if (typeof body.is_pinned === 'boolean') updates.is_pinned = body.is_pinned;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updatable fields' }, { status: 400 });
    }

    const service = buildServiceClient();
    const { data, error } = await service
      .from('student_notes')
      .update(updates)
      .eq('id', noteId)
      .select('*')
      .single();

    if (error) {
      console.error('[admin/notes/:id PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ note: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; noteId: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { noteId } = await context.params;
  if (!noteId) return NextResponse.json({ error: 'Missing note id' }, { status: 400 });

  try {
    const service = buildServiceClient();
    const { error } = await service.from('student_notes').delete().eq('id', noteId);

    if (error) {
      console.error('[admin/notes/:id DELETE] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

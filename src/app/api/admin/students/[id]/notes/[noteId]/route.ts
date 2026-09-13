import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * DELETE /api/admin/students/[id]/notes/[noteId]
 * PATCH  /api/admin/students/[id]/notes/[noteId]
 *
 * Auth: any admin. Service-role client.
 *
 * Phase 86 hardening:
 *   - 60/15min rate limit per admin (M3).
 *   - URL :id scopes every UPDATE/DELETE on student_notes so an
 *     admin can never mutate a note belonging to a different
 *     student by guessing its UUID (M4 — previously the `:id`
 *     was destructured but never applied to the WHERE clause).
 *   - 404 when the note doesn't belong to the student (vs the
 *     old behavior where PATCH returned 200 with no rows changed
 *     and DELETE returned { success: true } even when no row
 *     existed).
 */

const NOTES_BODY_MAX_LENGTH = 4000;
const NOTES_RATE_MAX = 60;
const NOTES_RATE_WINDOW_MS = 15 * 60 * 1000;

function rateLimitOrThrow(
  auth: { ok: true; user: { id: string } },
  endpoint: string,
): NextResponse | null {
  const rl = checkRateLimit({
    action: 'admin-student-notes',
    key: `${auth.user.id}:${endpoint}`,
    max: NOTES_RATE_MAX,
    windowMs: NOTES_RATE_WINDOW_MS,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many note operations. Please slow down.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfterSec) },
      },
    );
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; noteId: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: studentId, noteId } = await context.params;
  if (!studentId) return NextResponse.json({ error: 'Missing student id' }, { status: 400 });
  if (!noteId) return NextResponse.json({ error: 'Missing note id' }, { status: 400 });

  const rlResp = rateLimitOrThrow(auth, 'patch');
  if (rlResp) return rlResp;

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (typeof body.body === 'string' && body.body.trim() !== '') {
      const trimmed = body.body.trim();
      if (trimmed.length > NOTES_BODY_MAX_LENGTH) {
        return NextResponse.json(
          { error: `body too long (max ${NOTES_BODY_MAX_LENGTH} characters)` },
          { status: 400 },
        );
      }
      updates.body = trimmed;
    }
    if (typeof body.is_pinned === 'boolean') updates.is_pinned = body.is_pinned;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updatable fields' }, { status: 400 });
    }

    const service = buildServiceClient();

    // M4: scope by studentId AND noteId. Without the studentId clause
    // an admin could PATCH any note in the system by guessing the UUID.
    // Use a single chained .eq() so Supabase returns exactly one row.
    const { data, error } = await service
      .from('student_notes')
      .update(updates)
      .eq('id', noteId)
      .eq('student_id', studentId)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('[admin/notes/:id PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
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

  const { id: studentId, noteId } = await context.params;
  if (!studentId) return NextResponse.json({ error: 'Missing student id' }, { status: 400 });
  if (!noteId) return NextResponse.json({ error: 'Missing note id' }, { status: 400 });

  const rlResp = rateLimitOrThrow(auth, 'delete');
  if (rlResp) return rlResp;

  try {
    const service = buildServiceClient();

    // M4: scope by studentId so the admin can't delete a note
    // belonging to a different student. Use a count check + delete
    // so we can 404 instead of returning { success: true } on a
    // miss (the old behavior silently succeeded on bogus IDs).
    const { data: rows, error: lookupErr } = await service
      .from('student_notes')
      .select('id')
      .eq('id', noteId)
      .eq('student_id', studentId);
    if (lookupErr) {
      console.error('[admin/notes/:id DELETE] lookup error:', lookupErr);
      return NextResponse.json({ error: lookupErr.message }, { status: 500 });
    }
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const { error } = await service
      .from('student_notes')
      .delete()
      .eq('id', noteId)
      .eq('student_id', studentId);

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
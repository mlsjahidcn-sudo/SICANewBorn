import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * GET  /api/admin/students/[id]/notes  — list notes for a student
 * POST /api/admin/students/[id]/notes  — add a note
 *
 * Auth: any admin (requireAdmin). Service-role client.
 *
 * The note is attributed to the admin who wrote it (from the
 * authed session) — `author_id` and `author_name` are auto-filled,
 * not taken from the body.
 *
 * Phase 86 hardening:
 *   - 60/15min rate limit per admin (M3 — abuse-from-inside).
 *   - 4000-char body cap matching the partner_student_notes
 *     CHECK constraint (defense in depth — H6).
 *   - POST 404s when the student doesn't exist instead of
 *     silently inserting an orphan note (M5).
 */

const NOTES_BODY_MAX_LENGTH = 4000;
const NOTES_RATE_MAX = 60;
const NOTES_RATE_WINDOW_MS = 15 * 60 * 1000;

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

  // M3: rate limit. 60 writes/15min per admin caps abuse-from-inside.
  const rl = checkRateLimit({
    action: 'admin-student-notes',
    key: auth.user.id,
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

  try {
    const body = await request.json();
    const noteBody = typeof body.body === 'string' ? body.body.trim() : '';
    if (!noteBody) {
      return NextResponse.json({ error: 'body is required' }, { status: 400 });
    }
    if (noteBody.length > NOTES_BODY_MAX_LENGTH) {
      return NextResponse.json(
        { error: `body too long (max ${NOTES_BODY_MAX_LENGTH} characters)` },
        { status: 400 },
      );
    }

    // Best-effort author name from the admin's user_metadata
    const authorName =
      (auth.user.user_metadata?.full_name as string | undefined) ||
      (auth.user.user_metadata?.name as string | undefined) ||
      auth.user.email?.split('@')[0] ||
      'Admin';

    const service = buildServiceClient();

    // M5: verify the student exists before inserting. Without this,
    // a POST with a bogus `:id` either silently inserts an orphan
    // note (FK ON DELETE SET NULL) or 23503s (FK CASCADE) — both
    // produce confusing behavior. Now we return 404 cleanly.
    const { data: studentRow, error: studentErr } = await service
      .from('student_profiles')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    if (studentErr) {
      console.error('[admin/notes POST] student lookup error:', studentErr);
      return NextResponse.json({ error: studentErr.message }, { status: 500 });
    }
    if (!studentRow) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const { data, error } = await service
      .from('student_notes')
      .insert({
        student_id: id,
        author_id: auth.user.id,
        author_name: authorName,
        body: noteBody,
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
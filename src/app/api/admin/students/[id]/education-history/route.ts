/**
 * GET  /api/admin/students/[id]/education-history
 * PUT  /api/admin/students/[id]/education-history
 *
 * Phase 183: the repeatable education history behind the new
 * `student_education_history` table.
 *
 * ── Why PUT (replace-all) and not POST/DELETE ────────────────────────
 * The editor is a small ordered list an admin edits as a unit: add a
 * row, remove one, reorder. Sending N-1 diffs for that is fiddly and
 * racy — two rapid saves can interleave and resurrect a deleted row.
 * A single transaction that replaces the student's rows is simpler to
 * reason about and impossible to interleave.
 *
 * The payload is validated in full BEFORE any write, so a bad row
 * rejects the whole request rather than half-applying.
 *
 * Auth: requireAdmin. Same bearer-token contract as every other admin
 * route — clients must use apiFetch(), not bare fetch() (Phase 182
 * found three pages that got that wrong).
 */
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import { sanitizeEducationRows, MAX_EDUCATION_ROWS } from '@/lib/student-education';

export const maxDuration = 30;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(_request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { data, error } = await supabaseServer
    .from('student_education_history')
    .select('*')
    .eq('student_id', id)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[education-history GET]', error);
    return NextResponse.json({ error: 'Could not load education history' }, { status: 500 });
  }

  return NextResponse.json({ rows: data ?? [] });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const rawRows = (body as { rows?: unknown })?.rows;
  const { rows, issues } = sanitizeEducationRows(rawRows);
  if (issues.length > 0) {
    // Validate-then-write: a rejected request must not half-apply.
    return NextResponse.json({ error: 'Invalid education history', issues }, { status: 400 });
  }
  if (rows.length > MAX_EDUCATION_ROWS) {
    return NextResponse.json(
      { error: `At most ${MAX_EDUCATION_ROWS} qualifications per student.`, issues: [] },
      { status: 400 },
    );
  }

  // Confirm the student exists first, so a typo'd id returns 404 rather
  // than silently succeeding with zero rows.
  const { data: student } = await supabaseServer
    .from('student_profiles')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  // Replace-all. Delete first, then insert — both scoped to this
  // student_id, and ON DELETE CASCADE on the table means a deleted
  // student cleans up here for free.
  const { error: delErr } = await supabaseServer
    .from('student_education_history')
    .delete()
    .eq('student_id', id);
  if (delErr) {
    console.error('[education-history PUT] delete failed:', delErr);
    return NextResponse.json({ error: 'Could not replace education history' }, { status: 500 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ rows: [] });
  }

  const payload = rows.map((r, i) => ({
    student_id: id,
    institution: r.institution,
    country: r.country,
    qualification: r.qualification,
    subject: r.subject,
    start_date: r.startDate,
    end_date: r.endDate,
    grade: r.grade,
    grading_scale: r.gradingScale,
    is_current: r.isCurrent,
    sort_order: i,
  }));

  const { data, error } = await supabaseServer
    .from('student_education_history')
    .insert(payload)
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[education-history PUT] insert failed:', error);
    return NextResponse.json({ error: 'Could not save education history' }, { status: 500 });
  }

  return NextResponse.json({ rows: data ?? [] });
}

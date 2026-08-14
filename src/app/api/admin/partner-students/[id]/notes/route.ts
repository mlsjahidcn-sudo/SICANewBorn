import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import {
  mapPartnerStudentNoteFromDb,
  type RawPartnerStudentNote,
} from '@/lib/partner-student-note-mapper';

/**
 * GET /api/admin/partner-students/[id]/notes
 *
 * Phase 62 (UX gap 2): surface the partner_student_notes activity
 * feed to admins so they can see what partner staff have written
 * about this student. Read-only — admin cannot write/edit/delete
 * (those go through the partner-side endpoints, gated on team
 * membership).
 *
 * Auth: any admin. Service-role client. The route verifies the
 * partner_student exists before returning — returns 404 if not, to
 * keep the contract consistent with the parent resource.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Set COZE_SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    );
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const service = buildServiceClient();

    // Verify the parent row exists. Cheaper than doing a join
    // and lets us return a clean 404 vs a silently empty array.
    const { data: parent, error: parentErr } = await service
      .from('partner_students')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    if (parentErr) {
      return NextResponse.json({ error: parentErr.message }, { status: 500 });
    }
    if (!parent) {
      return NextResponse.json({ error: 'Partner student not found' }, { status: 404 });
    }

    const { data: rows, error } = await service
      .from('partner_student_notes')
      // joined email hydration is best-effort; if author_user_id is
      // null (orphaned user) the join returns null and the mapper
      // returns author_email: null — that's the documented behavior.
      .select('id, partner_student_id, partner_id, author_user_id, body, pinned, created_at, updated_at, author:auth.users!author_user_id (email)')
      .eq('partner_student_id', id)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const notes = (rows || []).map((row) => {
      const r = row as unknown as Record<string, unknown>;
      // author may be an object (1:1) or an array — normalize.
      const authorRel = r.author;
      const authorObj = Array.isArray(authorRel) ? authorRel[0] : authorRel;
      const authorEmail =
        (authorObj as { email?: string | null } | null)?.email || null;
      return mapPartnerStudentNoteFromDb({
        ...(r as unknown as RawPartnerStudentNote),
        author_email: authorEmail,
      });
    });

    return NextResponse.json({ notes });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/partner-students/:id/notes GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
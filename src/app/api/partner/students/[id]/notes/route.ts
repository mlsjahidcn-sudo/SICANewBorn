/**
 * /api/partner/students/[id]/notes
 *
 * Phase 50c: per-event notes attached to a partner_students row.
 * Replaces the read-only `notes` field on the student detail
 * page with a queryable activity feed. Each note is one event:
 * who wrote it, when, and the body text.
 *
 *   GET    /api/partner/students/[id]/notes     — list
 *   POST   /api/partner/students/[id]/notes     — create
 *
 * The PATCH / DELETE on individual notes live at
 * /api/partner/student-notes/[id] (sibling route, mirrors
 * the partner_students/{id}/notes pattern).
 *
 * Auth: requireTeamMember. RLS on partner_student_notes
 * already scopes to is_partner_member(partner_id) — so the
 * RLS check happens on every query. The student must belong
 * to the partner org (verified below via a HEAD select on
 * partner_students before any list/insert).
 *
 * Response: { notes: PartnerStudentNote[] }
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, getServerEnv, buildServiceClient } from '@/lib/supabase-auth';
import {
  mapPartnerStudentNoteFromDb,
  mapPartnerStudentNoteToDb,
  PARTNER_STUDENT_NOTE_MAX_BODY,
} from '@/lib/partner-student-note-mapper';
import { hydrateUserEmails } from '@/lib/partner-user-lookup';

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
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    // Verify the student belongs to this partner org before
    // touching the notes table. RLS would also catch this
    // (notes.partner_id must match is_partner_member()), but
    // a fast-fail here gives a clean 404 instead of a silent
    // empty list.
    const { data: student, error: studentErr } = await auth.supabase
      .from('partner_students')
      .select('id, partner_id, created_by_user_id')
      .eq('id', id)
      .maybeSingle();
    if (studentErr) {
      console.error('[partner/students/:id/notes GET] student lookup:', studentErr);
      return NextResponse.json({ error: studentErr.message }, { status: 500 });
    }
    // Phase 71: team members are scoped to students they created
    // (same rule as the students list API).
    if (
      !student ||
      student.partner_id !== auth.partnerId ||
      (auth.role === 'member' && student.created_by_user_id !== auth.user.id)
    ) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Notes: pinned first (oldest pinned at the top of the
    // pinned block), then by created_at desc. Same shape the
    // partner-user-lookup helper expects so we can hydrate
    // author_email in a single pass.
    const { data, error } = await auth.supabase
      .from('partner_student_notes')
      .select('*')
      .eq('partner_student_id', id)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[partner/students/:id/notes GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const userIds = Array.from(
      new Set(
        (data || [])
          .map((r) => (r as { author_user_id?: string | null }).author_user_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const emailMap = userIds.length
      ? await hydrateUserEmails(buildServiceClient(), userIds)
      : new Map();
    const notes = (data || []).map((r) => {
      const authorId = (r as { author_user_id?: string | null }).author_user_id;
      const hydrated = authorId ? emailMap.get(authorId) : undefined;
      return mapPartnerStudentNoteFromDb({
        ...(r as unknown as Parameters<typeof mapPartnerStudentNoteFromDb>[0]),
        author_email: hydrated?.email ?? null,
      });
    });

    return NextResponse.json({ notes });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/students/:id/notes GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Set COZE_SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    );
  }
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Server-side validation: body is required, ≤ 4000 chars.
    // Phase 47's per-field validation pattern.
    if (typeof body.body !== 'string' || !body.body.trim()) {
      return NextResponse.json({ error: 'body is required' }, { status: 400 });
    }
    if (body.body.length > PARTNER_STUDENT_NOTE_MAX_BODY) {
      return NextResponse.json(
        { error: `body must be at most ${PARTNER_STUDENT_NOTE_MAX_BODY} characters` },
        { status: 400 },
      );
    }

    // Verify the student belongs to this partner org.
    const { data: student, error: studentErr } = await auth.supabase
      .from('partner_students')
      .select('id, partner_id, created_by_user_id')
      .eq('id', id)
      .maybeSingle();
    if (studentErr) {
      console.error('[partner/students/:id/notes POST] student lookup:', studentErr);
      return NextResponse.json({ error: studentErr.message }, { status: 500 });
    }
    // Phase 71: team members are scoped to students they created
    // (same rule as the students list API).
    if (
      !student ||
      student.partner_id !== auth.partnerId ||
      (auth.role === 'member' && student.created_by_user_id !== auth.user.id)
    ) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    let dbRow: Record<string, unknown>;
    try {
      dbRow = mapPartnerStudentNoteToDb(body);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Invalid field value' },
        { status: 400 },
      );
    }
    // Server-derived fields: the partner_student_id is the URL
    // param (we already verified the partner_id matches), the
    // partner_id is server-derived, and author_user_id is the
    // caller — never trust the client.
    dbRow.partner_student_id = id;
    dbRow.partner_id = auth.partnerId;
    dbRow.author_user_id = auth.user.id;
    // pinned defaults to FALSE in the DB schema; the client
    // can set it via the mapper.

    const { data, error } = await auth.supabase
      .from('partner_student_notes')
      .insert(dbRow)
      .select('*')
      .single();

    if (error) {
      console.error('[partner/students/:id/notes POST] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { note: mapPartnerStudentNoteFromDb(data) },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/students/:id/notes POST] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

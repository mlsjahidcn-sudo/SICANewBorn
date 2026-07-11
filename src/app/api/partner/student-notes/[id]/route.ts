/**
 * /api/partner/student-notes/[id]
 *
 * Phase 50c: per-note PATCH / DELETE. The list + create live
 * at /api/partner/students/[id]/notes (sibling route). This
 * route handles individual-note operations.
 *
 *   PATCH   /api/partner/student-notes/[id]   — update body / pinned
 *   DELETE  /api/partner/student-notes/[id]   — remove the note
 *
 * Auth: requireTeamMember. RLS gates via is_partner_member().
 *
 * Response: { note } on PATCH, 204 on DELETE.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, getServerEnv, buildServiceClient } from '@/lib/supabase-auth';
import {
  mapPartnerStudentNoteFromDb,
  mapPartnerStudentNoteToDb,
} from '@/lib/partner-student-note-mapper';
import { hydrateUserEmails } from '@/lib/partner-user-lookup';

export async function PATCH(
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

    // Reject updates to fields the client cannot set: the
    // partner_id, partner_student_id, author_user_id, created_at
    // are all server-derived. Same S27 pattern as the partner
    // application PATCH.
    const partnerForbiddenFields = [
      'partner_id',
      'partnerId',
      'partner_student_id',
      'partnerStudentId',
      'author_user_id',
      'authorUserId',
      'created_at',
      'createdAt',
    ];
    for (const key of partnerForbiddenFields) {
      if (body[key] !== undefined) {
        return NextResponse.json(
          {
            error: `Field '${key}' is server-derived. Only body and pinned are editable.`,
          },
          { status: 403 },
        );
      }
    }

    let updates: Record<string, unknown>;
    try {
      updates = mapPartnerStudentNoteToDb(body);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Invalid field value' },
        { status: 400 },
      );
    }
    // Strip server-derived fields as a belt-and-suspenders
    // safety net (the 403 above is the user-facing error).
    for (const key of [
      'partner_id',
      'partner_student_id',
      'author_user_id',
      'created_at',
    ]) {
      delete (updates as Record<string, unknown>)[key];
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await auth.supabase
      .from('partner_student_notes')
      .update(updates)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('[partner/student-notes/:id PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Hydrate author_email for the response (the same way the
    // list endpoint does it).
    const authorId = (data as { author_user_id?: string | null }).author_user_id;
    const emailMap = authorId
      ? await hydrateUserEmails(buildServiceClient(), [authorId])
      : new Map();
    const hydrated = authorId ? emailMap.get(authorId) : undefined;
    return NextResponse.json({
      note: mapPartnerStudentNoteFromDb({
        ...(data as unknown as Parameters<typeof mapPartnerStudentNoteFromDb>[0]),
        author_email: hydrated?.email ?? null,
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/student-notes/:id PATCH] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
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
    // RLS scopes the DELETE to is_partner_member(partner_id);
    // if the note belongs to a different org the row is just
    // not affected, which the .single() below surfaces as 404.
    const { data, error } = await auth.supabase
      .from('partner_student_notes')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('[partner/student-notes/:id DELETE] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/student-notes/:id DELETE] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

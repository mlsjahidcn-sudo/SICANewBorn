import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember } from '@/lib/supabase-auth';
import {
  mapPartnerApplicationFromDb,
  mapPartnerApplicationToDb,
} from '@/lib/partner-application-mapper';
import {
  validatePartnerApplicationPayload,
  MIN_NOTES_WHEN_UNASSIGNED,
} from '@/lib/partner-application-validation';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    let q = auth.supabase
      .from('partner_applications')
      .select('*')
      .eq('id', id);
    if (auth.role === 'member') {
      q = q.eq('created_by_user_id', auth.user.id);
    }
    const { data, error } = await q.maybeSingle();

    if (error) {
      console.error('[partner/applications/:id GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ application: mapPartnerApplicationFromDb(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/applications/:id GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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

    // S27: the partner portal can no longer change status, decision,
    // submitted_at, or application_number. These are admin-only — the
    // partner's job is intake (fill in the form) and the admin team
    // drives the workflow from there. We strip these fields at the
    // API gate, *before* they ever reach the mapper / DB, so a
    // tampered request body can't sneak a status flip through.
    //
    // Phase 47: studentId is also server-derived. The DB has
    // `student_id` (FK → partner_students.id) AND a denormalized
    // `student_name` for query performance. Partners can create an
    // app with a studentId at create time (the new form's "Pick
    // from your students" helper sets it), but the link between
    // an application and its student is set at create time only —
    // re-linking would orphan the application and could let a
    // partner point an app at another org's student via a guessed
    // UUID (RLS prevents the read but a blank 200 would still be
    // a confusing failure mode).
    //
    // For the camelCase→snake_case translation, the key sent by the
    // client is the camelCase form (matches our mapper input). We
    // check both `status` and the rest explicitly.
    const partnerForbiddenFields: Array<{ key: string; snakeKey: string }> = [
      { key: 'status', snakeKey: 'status' },
      { key: 'decision', snakeKey: 'decision' },
      { key: 'submittedAt', snakeKey: 'submitted_at' },
      { key: 'submitted_at', snakeKey: 'submitted_at' },
      { key: 'studentId', snakeKey: 'student_id' },
      { key: 'student_id', snakeKey: 'student_id' },
    ];
    for (const { key } of partnerForbiddenFields) {
      if (body[key] !== undefined) {
        return NextResponse.json(
          {
            error: `Field '${key}' is admin-only. SICA's admin team sets the application status and decision.`,
          },
          { status: 403 },
        );
      }
    }

    // Phase A: server-side field validation before mapping. PATCH can
    // be a single-field update, so only fields present in the body are
    // validated.
    const validationErrors = validatePartnerApplicationPayload(body, 'update');
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors[0].message, errors: validationErrors },
        { status: 400 },
      );
    }

    let updates: Record<string, unknown>;
    try {
      updates = mapPartnerApplicationToDb(body);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Invalid field value' },
        { status: 400 },
      );
    }
    delete (updates as Record<string, unknown>).partner_id;
    delete (updates as Record<string, unknown>).id;

    // Phase 54: if the partner is clearing university/program, notes
    // must still describe the desired school/program. We read the
    // existing row so we can fall back to existing notes when the
    // request only touches one of the two fields.
    const clearingUniversity = updates.university === '';
    const clearingProgram = updates.program === '';
    if (clearingUniversity || clearingProgram) {
      let existingQ = auth.supabase
        .from('partner_applications')
        .select('university, program, notes')
        .eq('id', id);
      if (auth.role === 'member') {
        existingQ = existingQ.eq('created_by_user_id', auth.user.id);
      }
      const { data: existing, error: existingErr } = await existingQ.maybeSingle();
      if (existingErr) {
        console.error('[partner/applications/:id PATCH] pre-read error:', existingErr);
        return NextResponse.json({ error: existingErr.message }, { status: 500 });
      }
      if (!existing) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      const effectiveUniversity = clearingUniversity
        ? ''
        : String(existing.university ?? '').trim();
      const effectiveProgram = clearingProgram
        ? ''
        : String(existing.program ?? '').trim();
      const effectiveNotes = String(
        updates.notes !== undefined ? updates.notes : (existing.notes ?? ''),
      ).trim();
      if (!effectiveUniversity || !effectiveProgram) {
        if (!effectiveNotes) {
          return NextResponse.json(
            { error: 'notes is required when university or program is not selected from the catalog' },
            { status: 400 },
          );
        }
        if (effectiveNotes.length < MIN_NOTES_WHEN_UNASSIGNED) {
          return NextResponse.json(
            { error: `notes must be at least ${MIN_NOTES_WHEN_UNASSIGNED} characters when university or program is not selected` },
            { status: 400 },
          );
        }
      }
    }

    // Phase C: partners can archive/restore their own rows. The
    // DELETE handler already performs soft-delete; this lets the
    // UI offer a Restore action via PATCH { archived: false }.
    if (body.archived === true) {
      updates.archived_at = new Date().toISOString();
      updates.archived_by_user_id = auth.user.id;
    } else if (body.archived === false) {
      updates.archived_at = null;
      updates.archived_by_user_id = null;
    }

    // Belt-and-suspenders: even if a future code path added one of
    // the snake_case admin-only keys to the mapper output, drop it
    // here. The earlier 403 check is the user-facing error; this is
    // the safety net.
    for (const { snakeKey } of partnerForbiddenFields) {
      delete (updates as Record<string, unknown>)[snakeKey];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    let q = auth.supabase
      .from('partner_applications')
      .update(updates)
      .eq('id', id);
    if (auth.role === 'member') {
      q = q.eq('created_by_user_id', auth.user.id);
    }
    const { data, error } = await q.select('*').maybeSingle();

    if (error) {
      console.error('[partner/applications/:id PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ application: mapPartnerApplicationFromDb(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/applications/:id PATCH] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    // Phase 50b: soft delete. Mirrors the partner_students/[id]
    // DELETE — PATCH archived_at = NOW() instead of hard delete.
    // The list page hides archived rows by default; an admin can
    // restore an archived row via a single PATCH (archived_at =
    // NULL) from a future "Show archived" toggle on the admin
    // side. For partners, restore is a support request — we
    // don't expose the SQL surface to them.
    let updQ = auth.supabase
      .from('partner_applications')
      .update({
        archived_at: new Date().toISOString(),
        archived_by_user_id: auth.user.id,
      })
      .eq('id', id);
    if (auth.role === 'member') {
      updQ = updQ.eq('created_by_user_id', auth.user.id);
    }
    const { data, error } = await updQ.select('id').maybeSingle();

    if (error) {
      console.error('[partner/applications/:id DELETE] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/applications/:id DELETE] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

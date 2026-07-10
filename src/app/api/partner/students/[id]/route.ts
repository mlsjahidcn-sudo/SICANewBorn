import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember } from '@/lib/supabase-auth';
import {
  mapPartnerStudentFromDb,
  mapPartnerStudentToDb,
  parsePartnerStudentStatus,
} from '@/lib/partner-student-mapper';
import { validatePartnerStudentPayload } from '@/lib/partner-validation';

/**
 * GET /api/partner/students/[id]
 * PATCH /api/partner/students/[id]
 * DELETE /api/partner/students/[id]
 *
 * Single-student operations. RLS on `partner_students` already filters
 * by partner_id, so a partner can never read/update/delete a student
 * that isn't theirs — the SELECT/UPDATE/DELETE will return 0 affected
 * rows and we surface a 404.
 */
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
      .from('partner_students')
      .select('*')
      .eq('id', id);
    // Phase 3: member can only see/edit their own rows
    if (auth.role === 'member') {
      q = q.eq('created_by_user_id', auth.user.id);
    }
    const { data, error } = await q.maybeSingle();

    if (error) {
      console.error('[partner/students/:id GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student: mapPartnerStudentFromDb(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/students/:id GET] unhandled:', err);
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

    // Phase 47: full field validation. PATCH is partial — studentName
    // is required only if the client includes it (so partners can
    // update a single field). But if it's included it must not be
    // empty. Same email-format + length caps as create. The
    // validator returns the first error as a 400; partner forms are
    // short and the partner only needs the next thing to fix.
    const fieldErrors = validatePartnerStudentPayload(body, 'update');
    if (fieldErrors.length > 0) {
      return NextResponse.json(
        { error: fieldErrors[0].message, field: fieldErrors[0].field },
        { status: 400 },
      );
    }

    if (body.status !== undefined && !parsePartnerStudentStatus(body.status)) {
      return NextResponse.json(
        { error: "status must be 'New' | 'In Progress' | 'Applied' | 'Accepted' | 'Rejected'" },
        { status: 400 },
      );
    }

    const updates = mapPartnerStudentToDb(body);
    // Strip partner_id — partners cannot reassign students to another partner.
    delete (updates as Record<string, unknown>).partner_id;
    // Strip id — clients cannot change the primary key.
    delete (updates as Record<string, unknown>).id;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    let q = auth.supabase
      .from('partner_students')
      .update(updates)
      .eq('id', id);
    if (auth.role === 'member') {
      q = q.eq('created_by_user_id', auth.user.id);
    }
    const { data, error } = await q.select('*').maybeSingle();

    if (error) {
      console.error('[partner/students/:id PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      // RLS filtered the row out — either it doesn't exist or it
      // belongs to another partner. Surface a uniform 404 (don't
      // leak existence).
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student: mapPartnerStudentFromDb(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/students/:id PATCH] unhandled:', err);
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
    // Phase 50b: soft delete. The old hard-delete would orphan
    // any partner_applications with student_id = id (FK to
    // partner_students). A partner with one bad click could lose
    // 3 applications silently. Now we PATCH archived_at = NOW()
    // and require a future "Show archived" toggle on the list
    // to even see archived rows. Restoring an archived row is
    // a single PATCH (archived_at = NULL) — admin or owner can
    // do it from the partner list page in a follow-up.
    let updQ = auth.supabase
      .from('partner_students')
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
      console.error('[partner/students/:id DELETE] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/students/:id DELETE] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requirePartner } from '@/lib/supabase-auth';
import {
  mapPartnerStudentFromDb,
  mapPartnerStudentToDb,
  parsePartnerStudentStatus,
} from '@/lib/partner-student-mapper';

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
  const auth = await requirePartner(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const { data, error } = await auth.supabase
      .from('partner_students')
      .select('*')
      .eq('id', id)
      .maybeSingle();

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
  const auth = await requirePartner(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const body = await request.json();

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

    const { data, error } = await auth.supabase
      .from('partner_students')
      .update(updates)
      .eq('id', id)
      .select('*')
      .maybeSingle();

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
  const auth = await requirePartner(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    // We do a soft-delete (status='Rejected' is the closest, but
    // `partner_students` doesn't have a generic 'Archived' state
    // matching the SICA design). Use hard delete for now — partners
    // shouldn't accidentally delete their students, but if they do,
    // the action is reversible only by re-creating. Document this.
    const { error, count } = await auth.supabase
      .from('partner_students')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) {
      console.error('[partner/students/:id DELETE] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!count) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/students/:id DELETE] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

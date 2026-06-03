import { NextResponse } from 'next/server';
import { getRequestAuth } from '@/lib/supabase-auth';
import { mapApplicationForStudent } from '@/lib/application-mapper';
import { insertTimelineEvent } from '@/lib/timeline';

/**
 * GET   /api/student/applications/[id] — student views their own application
 * PUT   /api/student/applications/[id] — student can only update personal_statement
 *         or additional_notes (NOT status, NOT admin_notes). Status is admin-controlled.
 * DELETE — students don't delete; they go to "Withdrawn" via the admin.
 *
 * All queries are filtered by student_id = user.id so a student can NEVER
 * see or modify another student's application.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  try {
    const auth = await getRequestAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, user } = auth;

    const { data: application, error } = await supabase
      .from('student_applications')
      .select('*')
      .eq('id', params.id)
      .eq('student_id', user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Also fetch related documents + timeline (for the detail page)
    const [docsRes, timelineRes] = await Promise.all([
      supabase
        .from('student_documents')
        .select('*')
        .eq('application_id', params.id)
        .order('uploaded_at', { ascending: false }),
      supabase
        .from('application_timeline')
        .select('id, application_id, status, notes, created_at, created_by')
        .eq('application_id', params.id)
        .order('created_at', { ascending: false }),
    ]);

    return NextResponse.json({
      application: mapApplicationForStudent(application),
      documents: docsRes.data || [],
      timeline: timelineRes.data || [],
    });
  } catch (error) {
    console.error('[Student Application GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT — student can update their application, but ONLY:
 *   - personal_statement
 *   - additional_notes
 *   - status (can be Draft or Submitted; admin handles the rest)
 * Blocked fields (id, student_id, university_*, program_*, degree, intake,
 * application_number, submitted_at, reviewed_at, decision_*, admin_notes, etc.)
 * are silently stripped before the UPDATE.
 */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  try {
    const auth = await getRequestAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, user } = auth;

    const body = await request.json();

    // Only allow specific fields to be updated by the student
    const allowed: Record<string, unknown> = {};
    if (typeof body.personalStatement === 'string') {
      allowed.personal_statement = body.personalStatement;
    }
    if (typeof body.additionalNotes === 'string') {
      allowed.additional_notes = body.additionalNotes;
    }
    if (typeof body.status === 'string' && ['Draft', 'Submitted'].includes(body.status)) {
      allowed.status = body.status;
      if (body.status === 'Submitted') {
        // First time submitting — stamp submitted_at
        allowed.submitted_at = new Date().toISOString();
      }
    }

    // Detect status changes BEFORE the update (we need the old value)
    // for the timeline note. Read the existing row first.
    const { data: existingRow } = await supabase
      .from('student_applications')
      .select('status, application_number')
      .eq('id', params.id)
      .eq('student_id', user.id)
      .maybeSingle();
    const statusChanged = !!existingRow && existingRow.status !== allowed.status && allowed.status;
    if (Object.keys(allowed).length === 0) {
      return NextResponse.json(
        { error: 'No editable fields provided. Students can update: personal_statement, additional_notes, status (Draft|Submitted)' },
        { status: 400 },
      );
    }

    const { data: row, error } = await supabase
      .from('student_applications')
      .update(allowed)
      .eq('id', params.id)
      .eq('student_id', user.id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!row) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // If status flipped to Submitted, write a timeline event
    if (statusChanged && typeof allowed.status === 'string') {
      const fromStatus = existingRow?.status || 'unknown';
      const toStatus = allowed.status;
      await insertTimelineEvent(supabase, {
        application_id: params.id,
        status: toStatus,
        notes:
          toStatus === 'Submitted'
            ? `Application ${existingRow?.application_number || ''} submitted by student.`
            : `Status changed by student: ${fromStatus} → ${toStatus}.`,
        created_by: user.id,
      });
    }

    return NextResponse.json({ application: mapApplicationForStudent(row) });
  } catch (error) {
    console.error('[Student Application PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

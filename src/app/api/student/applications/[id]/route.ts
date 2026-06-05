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
 * PUT — student can update their application, but ONLY in a controlled way.
 *
 * Editable fields (always allowed for any status):
 *   - personal_statement
 *   - additional_notes
 *
 * Editable fields (Drafts only — Phase 1: student is shaping a draft
 * that hasn't been submitted yet, so they can still pick a different
 * university/program/degree/intake. Once submitted, the only path
 * to change these is admin contact):
 *   - university_id, university_name, university_name_cn
 *   - program_id,   program_name,   program_name_cn
 *   - degree, intake
 *
 * Status transitions the student can drive (Phase 1 enhancements):
 *   - Draft           → Withdrawn            (give up on a draft)
 *   - Submitted       → Withdrawn            (withdraw after submit)
 *   - Rejected        → Submitted            (resubmit after rejection)
 *   - Documents Requested → Under Review     (after student uploads missing docs)
 *
 * Terminal (no transitions out):
 *   - Accepted, Decision Made, Withdrawn (admin-only or final)
 *
 * Submitted → Submitted is treated as a no-op (no-op check below).
 * Blocked fields (id, student_id, application_number, submitted_at,
 * reviewed_at, decision_*, admin_notes, etc.) are silently stripped
 * before the UPDATE.
 */
const STUDENT_STATUS_TRANSITIONS: Record<string, string[]> = {
  Draft: ['Draft', 'Withdrawn'], // Draft → Draft is a no-op but allowed
  Submitted: ['Submitted', 'Withdrawn'],
  'Documents Requested': ['Documents Requested', 'Under Review'],
  Rejected: ['Rejected', 'Submitted'],
  // Terminal — student cannot transition out:
  'Under Review': ['Under Review'],
  'Decision Made': ['Decision Made'],
  Accepted: ['Accepted'],
  Withdrawn: ['Withdrawn'],
};

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

    // 1. Fetch the existing row first so we can validate the transition
    const { data: existingRow } = await supabase
      .from('student_applications')
      .select('status, application_number, personal_statement, additional_notes')
      .eq('id', params.id)
      .eq('student_id', user.id)
      .maybeSingle();
    if (!existingRow) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    const currentStatus = existingRow.status as string;

    // 2. Only allow specific fields to be updated by the student
    const allowed: Record<string, unknown> = {};
    if (typeof body.personalStatement === 'string') {
      allowed.personal_statement = body.personalStatement;
    }
    if (typeof body.additionalNotes === 'string') {
      allowed.additional_notes = body.additionalNotes;
    }
    // Phase 1: shape the draft. University / program / degree / intake
    // are still mutable while the row is a Draft — the student can
    // pick a different school or fix typos before submitting. Once
    // the row leaves Draft, these fields are admin-controlled.
    if (currentStatus === 'Draft') {
      if (typeof body.universityId === 'string') {
        allowed.university_id = body.universityId;
      }
      if (typeof body.universityName === 'string' && body.universityName.trim()) {
        allowed.university_name = body.universityName.trim();
      }
      if (typeof body.universityNameCn === 'string') {
        allowed.university_name_cn = body.universityNameCn || null;
      }
      if (typeof body.programId === 'string') {
        allowed.program_id = body.programId || null;
      }
      if (typeof body.programName === 'string' && body.programName.trim()) {
        allowed.program_name = body.programName.trim();
      }
      if (typeof body.programNameCn === 'string') {
        allowed.program_name_cn = body.programNameCn || null;
      }
      if (typeof body.degree === 'string' && body.degree.trim()) {
        const ALLOWED_DEGREES = ['Bachelor', 'Master', 'PhD', 'Chinese Language'];
        if (!ALLOWED_DEGREES.includes(body.degree)) {
          return NextResponse.json(
            { error: `degree must be one of: ${ALLOWED_DEGREES.join(', ')}` },
            { status: 400 },
          );
        }
        allowed.degree = body.degree;
      }
      if (typeof body.intake === 'string' && body.intake.trim()) {
        allowed.intake = body.intake.trim();
      }
    }
    if (typeof body.status === 'string') {
      const allowedNext = STUDENT_STATUS_TRANSITIONS[currentStatus] || [];
      if (!allowedNext.includes(body.status)) {
        return NextResponse.json(
          {
            error: `Cannot move from ${currentStatus} to ${body.status} as a student. Allowed next states: ${allowedNext.join(', ')}.`,
          },
          { status: 400 },
        );
      }
      // No-op transition (e.g. Submitted → Submitted) — don't update
      // the row, don't write a timeline event, just return current.
      if (body.status === currentStatus) {
        return NextResponse.json({ application: mapApplicationForStudent({
          ...(existingRow as Record<string, unknown>),
          personal_statement: allowed.personal_statement ?? existingRow.personal_statement,
          additional_notes: allowed.additional_notes ?? existingRow.additional_notes,
        } as Parameters<typeof mapApplicationForStudent>[0]) });
      }
      allowed.status = body.status;
      if (body.status === 'Submitted') {
        // First submit OR resubmit after rejection — stamp fresh submitted_at
        allowed.submitted_at = new Date().toISOString();
      }
    }

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json(
        { error: 'No editable fields provided. Students can update: personal_statement, additional_notes, status (within the allowed transition set for the current status).' },
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

    // 3. Write a timeline event for the status flip
    if (typeof allowed.status === 'string' && allowed.status !== currentStatus) {
      const fromStatus = currentStatus;
      const toStatus = allowed.status as string;
      const note = timelineNoteForTransition(
        fromStatus,
        toStatus,
        existingRow.application_number as string | null,
      );
      await insertTimelineEvent(supabase, {
        application_id: params.id,
        status: toStatus,
        notes: note,
        created_by: user.id,
      });
    }

    return NextResponse.json({ application: mapApplicationForStudent(row) });
  } catch (error) {
    console.error('[Student Application PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Phase 1: human-readable timeline note for each student-driven transition.
 * Kept here so the wording is consistent across the detail page UI and
 * the audit log.
 */
function timelineNoteForTransition(
  from: string,
  to: string,
  applicationNumber: string | null,
): string {
  const ref = applicationNumber || '';
  if (to === 'Withdrawn') return `Application ${ref} withdrawn by student.`;
  if (from === 'Rejected' && to === 'Submitted')
    return `Application ${ref} resubmitted by student after rejection.`;
  if (from === 'Documents Requested' && to === 'Under Review')
    return `Requested documents uploaded by student; ready for review.`;
  return `Status changed by student: ${from} → ${to}.`;
}

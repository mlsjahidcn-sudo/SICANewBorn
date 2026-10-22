import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { insertTimelineEvent } from '@/lib/timeline';
import { mapApplicationFromDb, leadAttributionIsValid, type StudentLeadType } from '@/lib/application-mapper';
import { ALLOWED_STUDENT_STATUSES } from '@/lib/application-status';
import {
  PARTNER_APPLICATION_DEGREES,
  PARTNER_APPLICATION_PRIORITIES,
} from '@/lib/partner-application-mapper';


import { loadAdminApplications, filterAdminApplications, paginateAdminApplications, ApplicationQueryError } from '@/lib/admin-application-query';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const params = new URL(request.url).searchParams;
    const rows = filterAdminApplications(await loadAdminApplications(buildServiceClient()), params);
    return NextResponse.json(paginateAdminApplications(rows, params));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load applications' }, { status: error instanceof ApplicationQueryError ? 400 : 500 });
  }
}

/**
 * POST /api/admin/applications — create a new application
 *
 * Body can be one of:
 *   A) { studentId, universityId, universityName, programId, programName, degree, intake, ... }
 *      — linked application: the student is already in the system
 *   B) { applicantName, applicantEmail, applicantPhone?, applicantNationality?,
 *        universityName, programName, degree, intake, ... }
 *      — unlinked application: the person hasn't signed up yet (a "lead")
 *
 * The DB CHECK constraint `student_applications_must_have_party` ensures
 * exactly one of (student_id, applicant_email) is set. The validation
 * here is the API-level mirror of that constraint.
 *
 * Generates application_number via the SQL function (S5 fix) and writes
 * a timeline event (S12.6) so the audit trail is complete.
 */
const ALLOWED_STATUSES = ALLOWED_STUDENT_STATUSES;

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();

    // Required fields
    if (!body.universityName) return NextResponse.json({ error: 'universityName is required' }, { status: 400 });
    if (!body.programName) return NextResponse.json({ error: 'programName is required' }, { status: 400 });
    if (!body.degree) return NextResponse.json({ error: 'degree is required' }, { status: 400 });
    if (!body.intake) return NextResponse.json({ error: 'intake is required' }, { status: 400 });

    // Phase 19: validate `degree` against the closed taxonomy. The
    // student + partner POSTs already enforce this; the admin POST
    // was missing it (relying on a DB CHECK constraint the user
    // pointed out may or may not exist). 400 early with a clear
    // list. We reuse the partner constants — same enum, single
    // source of truth.
    if (
      typeof body.degree === 'string' &&
      !(PARTNER_APPLICATION_DEGREES as readonly string[]).includes(body.degree)
    ) {
      return NextResponse.json(
        { error: `degree must be one of: ${PARTNER_APPLICATION_DEGREES.join(', ')}` },
        { status: 400 },
      );
    }
    // Validate `priority` against the same enum the partner side uses.
    // Missing priority is fine (defaults to 'Medium' below); an
    // explicit invalid value is a 400.
    if (
      body.priority !== undefined &&
      body.priority !== null &&
      !(PARTNER_APPLICATION_PRIORITIES as readonly string[]).includes(String(body.priority))
    ) {
      return NextResponse.json(
        { error: `priority must be one of: ${PARTNER_APPLICATION_PRIORITIES.join(', ')}` },
        { status: 400 },
      );
    }

    // Must have either a student link or an applicant email
    const hasStudent = typeof body.studentId === 'string' && body.studentId.length > 0;
    const hasApplicant =
      typeof body.applicantEmail === 'string' && body.applicantEmail.length > 0;
    if (!hasStudent && !hasApplicant) {
      return NextResponse.json(
        { error: 'Either studentId or applicantEmail is required (admin can add applications for non-registered leads)' },
        { status: 400 },
      );
    }
    if (hasStudent && hasApplicant) {
      return NextResponse.json(
        { error: 'Provide either studentId OR applicantEmail, not both' },
        { status: 400 },
      );
    }
    if (hasApplicant && (!body.applicantName || body.applicantName.trim() === '')) {
      return NextResponse.json(
        { error: 'applicantName is required when applicantEmail is provided' },
        { status: 400 },
      );
    }

    // Phase 107 Batch 5: lead attribution. If leadId + leadType are
    // both set, validate the pair and persist it on the new row so
    // the admin list surfaces a "From <type>" chip and so the eventual
    // /admin/leads/[id] page can find its reverse-link. Either
    // studentId OR applicantEmail is still required (the lead is the
    // SOURCE — it doesn't replace the application payload).
    const leadId = typeof body.leadId === 'string' ? body.leadId.trim() : '';
    const leadTypeRaw = typeof body.leadType === 'string' ? body.leadType.trim() : '';
    const hasLead = !!leadId && !!leadTypeRaw;
    const attribution = leadAttributionIsValid({
      studentId: hasStudent ? body.studentId : null,
      applicantName: body.applicantName,
      applicantEmail: body.applicantEmail,
      leadId: leadId || null,
      leadType: leadTypeRaw || null,
    });
    if (!attribution.ok) {
      return NextResponse.json({ error: attribution.reason }, { status: 400 });
    }
    const leadType = (leadTypeRaw || null) as StudentLeadType | null;

    // Validate status if provided
    const requestedStatus = body.status || 'Submitted';
    if (!(ALLOWED_STATUSES as readonly string[]).includes(requestedStatus)) {
      return NextResponse.json(
        { error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }

    const service = buildServiceClient();

    // Phase 109 Batch 5: duplicate-application guard. Refuses to
    // create a second non-terminal application for the same
    // (student OR applicant_email) + (university_id OR
    // university_name) + (program_id OR program_name) + intake
    // tuple. The wizard surfaces this as a 409 with the existing
    // application's number + a "View it?" deep link.
    //
    // Why "non-terminal": a student who's already Withdrawn /
    // Rejected can absolutely re-apply for the same cohort
    // (e.g., re-applied after improving their IELTS). Terminal
    // statuses (Rejected / Withdrawn) are excluded from the
    // check; everything else (Submitted, Under Review,
    // Documents Requested, Decision Made, Accepted) blocks a
    // second row.
    //
    // Match keys are intentionally loose on identifiers
    // (university_id OR university_name, program_id OR
    // program_name) because the wizard writes both (the live
    // catalog from /api/universities populates university_id;
    // manual entries only have university_name). Same for
    // program.
    {
      const dupQuery = service
        .from('student_applications')
        .select('id, application_number, status')
        .eq('intake', body.intake)
        .not('status', 'in', '("Rejected","Withdrawn")')
        .limit(1);
      if (hasStudent) {
        dupQuery.eq('student_id', body.studentId as string);
      } else if (hasApplicant) {
        dupQuery.eq('applicant_email', body.applicantEmail as string);
      }
      if (body.universityId) {
        dupQuery.eq('university_id', body.universityId);
      } else {
        dupQuery.eq('university_name', body.universityName as string);
      }
      if (body.programId) {
        dupQuery.eq('program_id', body.programId);
      } else {
        dupQuery.eq('program_name', body.programName as string);
      }
      const { data: existing } = await dupQuery.maybeSingle();
      if (existing) {
        return NextResponse.json(
          {
            error: 'A non-terminal application already exists for this student/cohort.',
            code: 'DUPLICATE_APPLICATION',
            existingId: (existing as { id: string }).id,
            existingApplicationNumber: (existing as { application_number?: string | null })
              .application_number,
            existingStatus: (existing as { status: string }).status,
          },
          { status: 409 },
        );
      }
    }

    // Generate application_number atomically (S5 fix)
    const { data: rpcData, error: rpcError } = await service.rpc('generate_application_number');
    if (rpcError || !rpcData) {
      return NextResponse.json({ error: 'Failed to generate application number' }, { status: 500 });
    }

    const insert: Record<string, unknown> = {
      university_id: body.universityId || 'manual',
      university_name: body.universityName,
      university_name_cn: body.universityNameCn,
      program_id: body.programId,
      program_name: body.programName,
      program_name_cn: body.programNameCn,
      degree: body.degree,
      degree_level: body.degreeLevel || body.degree,
      intake: body.intake,
      status: requestedStatus,
      priority: body.priority || 'Medium',
      application_number: rpcData as string,
      personal_statement: body.personalStatement,
      additional_notes: body.additionalNotes,
      admin_notes: body.adminNotes,
    };
    // Link to existing student OR capture applicant details
    if (hasStudent) insert.student_id = body.studentId;
    if (hasApplicant) {
      insert.applicant_name = body.applicantName;
      insert.applicant_email = body.applicantEmail;
      insert.applicant_phone = body.applicantPhone || null;
      insert.applicant_nationality = body.applicantNationality || null;
    }
    // Phase 107 Batch 5: lead attribution columns (polymorphic FK).
    if (hasLead && leadId && leadType) {
      insert.lead_id = leadId;
      insert.lead_type = leadType;
    }

    const { data, error } = await service
      .from('student_applications')
      .insert(insert)
      .select('*')
      .single();

    if (error) {
      console.error('[admin/applications POST] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Phase 107 Batch 5: atomic lead.status=Converted flip. We don't
    // want to fail the application POST if the lead update fails —
    // the application is the source of truth for the admin's intent
    // and the lead row is best-effort housekeeping. Logged so the
    // admin can re-trigger from /admin/leads/[id] if needed.
    if (hasLead && leadId && leadType) {
      try {
        await flipLeadToConverted(service, leadType, leadId);
      } catch (leadErr) {
        console.error('[admin/applications POST] lead.status flip failed:', leadErr);
      }
    }

    // Audit trail: write a timeline event
    await insertTimelineEvent(service, {
      application_id: data.id,
      status: requestedStatus,
      notes: hasStudent
        ? `Application created by admin for student ${body.studentId}.`
        : `Application created by admin for lead ${body.applicantEmail} (no student account yet).`,
      created_by: auth.user.id,
    });

    return NextResponse.json({ application: mapApplicationFromDb(data) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Phase 107 Batch 5: mark a lead row as converted when an
 * application is created from it. The "Converted" status value
 * doesn't exist on every lead surface — the function picks the
 * best equivalent per table:
 *   - chat_leads.status:        'Converted' (already exists)
 *   - student_assessments.status: 'Accepted' (no 'Converted' enum
 *                                  value; 'Accepted' semantically
 *                                  means "moved to next stage")
 *   - contact_submissions.status: 'Resolved' (no 'Converted' enum
 *                                  value; 'Resolved' is the closest
 *                                  closed state).
 *
 * Errors are thrown so the caller can log + continue — the application
 * is already created and is the source of truth.
 */
async function flipLeadToConverted(
  service: ReturnType<typeof buildServiceClient>,
  leadType: StudentLeadType,
  leadId: string,
): Promise<void> {
  if (leadType === 'chat_lead') {
    const { error } = await service
      .from('chat_leads')
      .update({ status: 'Converted' })
      .eq('id', leadId);
    if (error) throw error;
    return;
  }
  if (leadType === 'student_assessment') {
    const { error } = await service
      .from('student_assessments')
      .update({ status: 'Accepted' })
      .eq('id', leadId);
    if (error) throw error;
    return;
  }
  // contact_submission
  const { error } = await service
    .from('contact_submissions')
    .update({ status: 'Resolved' })
    .eq('id', leadId);
  if (error) throw error;
}

import { NextResponse } from 'next/server';
import { getRequestAuth } from '@/lib/supabase-auth';
import { mapApplicationForStudent } from '@/lib/application-mapper';
import { insertTimelineEvent } from '@/lib/timeline';

/**
 * GET  /api/student/applications — list the authed student's own applications
 * POST /api/student/applications — student self-service create
 *
 * The student's identity is derived from the JWT (auth.user.id), NEVER
 * from the body. The student can only see/create their own applications.
 *
 * S14: now uses the shared application-mapper so the response shape
 * matches what the student UI expects (no internal fields leaked).
 */
export async function GET(request: Request) {
  try {
    const auth = await getRequestAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, user } = auth;

    // Phase 1.1: pagination. Default page=1, limit=20. The
    // student UI uses the same shape as the admin/partner
    // endpoints so the Load-more pattern just works.
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: rows, error, count } = await supabase
      .from('student_applications')
      .select('*', { count: 'exact' })
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const total = count || 0;
    return NextResponse.json({
      applications: (rows || []).map(mapApplicationForStudent),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error('[Student Applications GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getRequestAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, user } = auth;

    const body = await request.json();

    // Required fields for a student application. Trim before checking so
    // whitespace-only inputs ("   ") don't bypass the validation.
    const trimmedUniversity = typeof body.universityName === 'string' ? body.universityName.trim() : '';
    const trimmedProgram = typeof body.programName === 'string' ? body.programName.trim() : '';
    const trimmedDegree = typeof body.degree === 'string' ? body.degree.trim() : '';
    const trimmedIntake = typeof body.intake === 'string' ? body.intake.trim() : '';

    // Phase 1: parse requested status early so we know whether the
    // student is actually submitting (degree + intake required) or
    // saving a partial draft (looser requirements).
    const validStatuses = ['Draft', 'Submitted'];
    const requestedStatus = body.status || 'Submitted';
    if (!validStatuses.includes(requestedStatus)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 },
      );
    }
    const isDraft = requestedStatus === 'Draft';

    if (!trimmedUniversity) {
      return NextResponse.json({ error: 'universityName is required' }, { status: 400 });
    }
    if (!trimmedProgram) {
      return NextResponse.json({ error: 'programName is required' }, { status: 400 });
    }
    if (!trimmedDegree && !isDraft) {
      return NextResponse.json({ error: 'degree is required' }, { status: 400 });
    }
    if (!trimmedIntake && !isDraft) {
      return NextResponse.json({ error: 'intake is required' }, { status: 400 });
    }

    // Degree must be one of the 4 known values (mirrors the DB intent;
    // the schema accepts any string but we want to reject garbage).
    // Phase 1: skipped for Drafts — student can save partial and fill
    // degree in later.
    const ALLOWED_DEGREES = ['Bachelor', 'Master', 'PhD', 'Chinese Language'];
    if (trimmedDegree && !ALLOWED_DEGREES.includes(trimmedDegree)) {
      return NextResponse.json(
        { error: `degree must be one of: ${ALLOWED_DEGREES.join(', ')}` },
        { status: 400 },
      );
    }

    // (Status validation done above. The other statuses — Under Review,
    // Documents Requested, Decision Made, Accepted, Rejected, Withdrawn
    // — are admin-set, not student-driven.)

    // Generate application_number atomically (S5 fix)
    const { data: rpcData, error: rpcError } = await supabase.rpc('generate_application_number');
    if (rpcError || !rpcData) {
      console.error('[Student Applications POST] generate_application_number failed:', rpcError);
      return NextResponse.json(
        { error: 'Failed to generate application number' },
        { status: 500 },
      );
    }

    // Explicit snake_case mapping (don't `...body` — Supabase silently
    // drops unknown column names, so camelCase keys would be lost).
    // Uses the TRIMMED versions of the required text fields.
    const applicationData = {
      student_id: user.id,
      university_id: body.universityId || 'manual',
      university_name: trimmedUniversity,
      university_name_cn: body.universityNameCn || null,
      program_id: body.programId || null,
      program_name: trimmedProgram,
      program_name_cn: body.programNameCn || null,
      degree: trimmedDegree,
      degree_level: body.degreeLevel || trimmedDegree,
      intake: trimmedIntake,
      status: requestedStatus,
      priority: body.priority || 'Medium',
      application_number: rpcData as string,
      personal_statement: body.personalStatement || null,
      additional_notes: body.additionalNotes || null,
      submitted_at: requestedStatus === 'Submitted' ? new Date().toISOString() : null,
    };

    const { data: row, error } = await supabase
      .from('student_applications')
      .insert(applicationData)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Audit trail: timeline event
    await insertTimelineEvent(supabase, {
      application_id: row.id,
      status: requestedStatus,
      notes: 'Application created by student.',
      created_by: user.id,
    });

    return NextResponse.json({ application: mapApplicationForStudent(row) }, { status: 201 });
  } catch (error) {
    console.error('[Student Applications POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

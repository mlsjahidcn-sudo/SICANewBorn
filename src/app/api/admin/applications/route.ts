import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { insertTimelineEvent } from '@/lib/timeline';
import { mapApplicationFromDb, RawApp } from '@/lib/application-mapper';

/**
 * GET  /api/admin/applications  — list all applications
 * POST /api/admin/applications  — create a new application
 *
 * GET query params:
 *   - student  : filter by student_id
 *   - status   : exact match (Draft | Submitted | Under Review | ...)
 *   - source   : derived from the student's `source` (Admin/Partner/Online)
 *   - search   : free-text on program_name / university_name / application_number
 *   - page     : 1-indexed (default 1)
 *   - limit    : 1..100 (default 20)
 *
 * Auth: any admin (requireAdmin). Service-role client.
 *
 * Response: { applications, total, page, limit, totalPages }
 */
export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(request.url);
    const student = searchParams.get('student');
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const service = buildServiceClient();
    // Join student_profiles to get the student's source + name for filtering/display
    let query = service
      .from('student_applications')
      .select(
        `*,
         student:student_profiles!student_id (id, first_name, last_name, email, source, status)`,
        { count: 'exact' },
      )
      .order('created_at', { ascending: false });

    if (student) query = query.eq('student_id', student);
    if (status) query = query.eq('status', status);
    if (search) {
      const safe = search.replace(/[%_]/g, '\\$&');
      query = query.or(
        `program_name.ilike.%${safe}%,university_name.ilike.%${safe}%,application_number.ilike.%${safe}%`,
      );
    }

    // For the Admin (offline) source we can push the filter into SQL —
    // those rows have student_id IS NULL. For Online/Partner we have
    // to filter in JS after mapping, because the `source` lives on
    // the joined student_profiles row and PostgREST doesn't let you
    // filter on a nullable LEFT JOIN relationship the way we'd want.
    const isOfflineFilter = source === 'Admin';
    if (isOfflineFilter) {
      query = query.is('student_id', null);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    // When filtering by Online/Partner, over-fetch by 2x so the JS
    // filter still has a chance of returning `limit` rows. For small
    // data this is a non-issue; for large tables we'd want to push
    // the filter into SQL via a stored procedure.
    const fetchLimit = source && !isOfflineFilter ? Math.min(100, limit * 2) : limit;
    query = query.range(from, from + fetchLimit - 1);

    const { data, count, error } = await query;
    if (error) {
      console.error('[admin/applications GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let applications = ((data || []) as RawApp[]).map(mapApplicationFromDb);

    // Apply source filter in JS for Online/Partner. The mapper
    // already resolved the source from the join, so this is a simple
    // equality check.
    if (source && !isOfflineFilter) {
      applications = applications.filter((a) => a.source === source);
      // Re-slice to the requested page size after filtering
      applications = applications.slice(0, limit);
    }

    // When JS-side filtering, the SQL `count` is the unfiltered total.
    // We report the filtered count instead so pagination is correct.
    const reportedTotal = source && !isOfflineFilter ? applications.length : (count || 0);

    return NextResponse.json({
      applications,
      total: reportedTotal,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(reportedTotal / limit)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
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
const ALLOWED_STATUSES = [
  'Draft', 'Submitted', 'Under Review', 'Documents Requested',
  'Decision Made', 'Accepted', 'Rejected', 'Withdrawn',
] as const;

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

    // Validate status if provided
    const requestedStatus = body.status || 'Submitted';
    if (!(ALLOWED_STATUSES as readonly string[]).includes(requestedStatus)) {
      return NextResponse.json(
        { error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }

    const service = buildServiceClient();

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

    const { data, error } = await service
      .from('student_applications')
      .insert(insert)
      .select('*')
      .single();

    if (error) {
      console.error('[admin/applications POST] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
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

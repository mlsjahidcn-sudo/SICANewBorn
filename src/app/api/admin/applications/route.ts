import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { insertTimelineEvent } from '@/lib/timeline';
import { mapApplicationFromDb, RawApp } from '@/lib/application-mapper';

/**
 * GET  /api/admin/applications  — list all applications
 * POST /api/admin/applications  — create a new application
 *
 * GET query params:
 *   - student   : filter by student_id
 *   - status    : exact match (Draft | Submitted | Under Review | ...)
 *   - source    : derived from the student's `source` (Admin/Partner/Online).
 *                 Setting `source=Partner` returns BOTH the student_applications
 *                 rows where student.source='Partner' AND the partner_applications
 *                 CRM rows.
 *   - search    : free-text on program_name / university_name / application_number
 *   - page      : 1-indexed (default 1)
 *   - limit     : 1..100 (default 20)
 *
 * S28: the response is a *unified* list across `student_applications` AND
 * `partner_applications`. Each row carries a `surface` field
 * ('student' | 'partner') so the page knows which detail URL to link to
 * and how to render the row. Partner CRM rows are the partner's own
 * tracking entries (mlsjahid.cn+partner@gmail.com's pipeline) — they
 * live in a separate table but the admin needs them visible in the
 * same workflow view.
 *
 * Auth: any admin (requireAdmin). Service-role client.
 *
 * Response: { applications, total, page, limit, totalPages }
 */
export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
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

    // S28: decide which surfaces to query. By default we return
    // BOTH student_applications and partner_applications so the
    // admin sees the full pipeline in one view. Setting
    // `surface=student` or `surface=partner` narrows to one.
    const surface = searchParams.get('surface');
    const wantStudent = !surface || surface === 'student';
    const wantPartner = !surface || surface === 'partner';

    // S28: a tab on the page can also force a specific source. Map
    // the existing source= filter to the right surfaces:
    //   source=Online  → student_applications where student.source=Online
    //   source=Admin   → student_applications where student_id IS NULL
    //   source=Partner → student_applications where student.source=Partner
    //                    PLUS partner_applications (the partner CRM)
    //   no source      → both tables, all sources
    const sourceOnly =
      source && (source === 'Online' || source === 'Admin') ? source : null;

    const service = buildServiceClient();

    // S28: run the two queries in parallel.
    const studentP = wantStudent
      ? fetchStudentApplications(service, {
          student,
          status: status ?? null,
          source: sourceOnly,
          search: search ?? null,
          // Over-fetch when we'll JS-filter on the source so the
          // paginated slice still has `limit` rows after filter.
          fetchLimit: sourceOnly ? Math.min(100, limit * 2) : limit,
        })
      : Promise.resolve<{ data: RawApp[]; count: number | null; error?: undefined }>({
          data: [],
          count: 0,
        });
    const partnerP = wantPartner
      ? fetchPartnerApplications(service, {
          status: status ?? null,
          search: search ?? null,
          // Partners have no SQL-side `source` filter (the column
          // doesn't exist on partner_applications) — over-fetch
          // so we can JS-side filter to source='Partner' later.
          fetchLimit: source === 'Partner' ? Math.min(100, limit * 2) : limit,
        })
      : Promise.resolve<{ rows: UnifiedPartnerRow[]; error?: undefined }>({ rows: [] });

    const [studentRes, partnerRes] = await Promise.all([studentP, partnerP]);

    if (studentRes.error) {
      console.error('[admin/applications GET] supabase error:', studentRes.error);
      return NextResponse.json({ error: studentRes.error.message }, { status: 500 });
    }
    if (partnerRes.error) {
      console.error('[admin/applications GET] partner supabase error:', partnerRes.error);
      return NextResponse.json({ error: partnerRes.error.message }, { status: 500 });
    }

    // Map student rows to the unified shape.
    const studentApps = (studentRes.data || [])
      .map(mapApplicationFromDb)
      .map((a) => ({ ...a, surface: 'student' as const }));

    // Map partner rows to a similar shape.
    const partnerApps = (partnerRes.rows || [])
      .map(mapPartnerAppForUnifiedList)
      .map((a) => ({ ...a, surface: 'partner' as const }));

    // S28: when filtering by source=Partner, the student query
    // also returned source=Partner rows; the partner query
    // returned CRM rows. Both go in.
    // When filtering by source=Online or source=Admin, only
    // student rows are in scope.
    // When no source filter, both go in.
    let combined: UnifiedAppRow[] = [...studentApps, ...partnerApps];

    if (source === 'Partner') {
      combined = combined.filter((a) => a.source === 'Partner' || a.source === 'Partner CRM');
    } else if (source === 'Online') {
      combined = combined.filter((a) => a.source === 'Online');
    } else if (source === 'Admin') {
      combined = combined.filter((a) => a.source === 'Admin');
    }

    // Sort newest first (created_at desc). Partner rows may have
    // null createdAt — push them to the bottom.
    combined.sort((a, b) => {
      const aT = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bT = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bT - aT;
    });

    const total = combined.length;
    const from = (page - 1) * limit;
    const applications = combined.slice(from, from + limit);

    return NextResponse.json({
      applications,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/applications GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ----- helpers -----------------------------------------------------------

/**
 * Fetches student_applications joined with student_profiles. Returns
 * the raw rows + the exact count so the page can paginate.
 */
async function fetchStudentApplications(
  service: ReturnType<typeof buildServiceClient>,
  opts: {
    student: string | null;
    status: string | null;
    source: string | null; // 'Online' | 'Admin' (Partner goes via Partner tab)
    search: string | null;
    fetchLimit: number;
  },
): Promise<{ data: RawApp[]; count: number | null; error?: { message: string } }> {
  // For the Admin (offline) source we can push the filter into SQL —
  // those rows have student_id IS NULL. For Online/Partner we have
  // to filter in JS after mapping, because the `source` lives on
  // the joined student_profiles row and PostgREST doesn't let you
  // filter on a nullable LEFT JOIN relationship the way we'd want.
  const isOfflineFilter = opts.source === 'Admin';

  let query = service
    .from('student_applications')
    .select(
      `*,
       student:student_profiles!student_id (id, first_name, last_name, email, source, status)`,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false });

  if (opts.student) query = query.eq('student_id', opts.student);
  if (opts.status) query = query.eq('status', opts.status);
  if (isOfflineFilter) query = query.is('student_id', null);
  if (opts.search) {
    const safe = opts.search.replace(/[%_]/g, '\\$&');
    query = query.or(
      `program_name.ilike.%${safe}%,university_name.ilike.%${safe}%,application_number.ilike.%${safe}%`,
    );
  }

  // Over-fetch when JS-side source filtering is happening.
  const fetchLimit = opts.source && !isOfflineFilter ? Math.min(100, opts.fetchLimit) : opts.fetchLimit;
  query = query.range(0, fetchLimit - 1);

  const { data, count, error } = await query;
  if (error) return { data: [], count: 0, error: { message: error.message } };
  return { data: (data || []) as RawApp[], count };
}

/**
 * S28: fetches partner_applications for the unified list. The
 * partner table doesn't have a `source` column — every row is
 * "Partner CRM" by definition.
 */
async function fetchPartnerApplications(
  service: ReturnType<typeof buildServiceClient>,
  opts: {
    status: string | null;
    search: string | null;
    fetchLimit: number;
  },
): Promise<{ rows: UnifiedPartnerRow[]; error?: { message: string } }> {
  let query = service
    .from('partner_applications')
    .select(
      'id, student_name, student_email, student_phone, nationality, university, program, intake, degree, status, decision, priority, application_number, created_at, updated_at, partner_id, created_by_user_id',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false });

  // Map partner's status names (Submitted / In Review / Accepted /
  // Rejected / Withdrawn / Draft) onto the student status taxonomy
  // is not 1:1 — the admin's filter is on the partner column.
  if (opts.status) query = query.eq('status', opts.status);

  if (opts.search) {
    const safe = opts.search.replace(/[%_]/g, '\\$&');
    query = query.or(
      `student_name.ilike.%${safe}%,university.ilike.%${safe}%,program.ilike.%${safe}%,application_number.ilike.%${safe}%`,
    );
  }
  query = query.range(0, opts.fetchLimit - 1);

  const { data, error } = await query;
  if (error) return { rows: [], error: { message: error.message } };
  return { rows: (data || []) as UnifiedPartnerRow[] };
}

/**
 * S28: minimal shape for a partner_applications row in the unified
 * list. Mirrors the AdminApplication fields the list table cares
 * about; the rest stays in the detail page.
 */
interface UnifiedPartnerRow {
  id: string;
  partner_id: string;
  student_name: string | null;
  student_email: string | null;
  student_phone: string | null;
  nationality: string | null;
  university: string;
  program: string;
  intake: string | null;
  degree: string | null;
  status: string;
  decision: string | null;
  priority: string | null;
  application_number: string | null;
  created_at: string;
  updated_at: string;
  created_by_user_id: string | null;
}

interface UnifiedAppRow {
  id: string;
  surface: 'student' | 'partner';
  studentId: string | null;
  studentName: string;
  studentEmail: string;
  isLinked: boolean;
  university: string;
  universityNameCn?: string | null;
  program: string;
  programNameCn?: string | null;
  degree: string;
  intake: string;
  status: string;
  source: 'Admin' | 'Partner' | 'Online' | 'Partner CRM';
  applicationNumber: string | null;
  createdAt: string;
  updatedAt: string;
  personalStatement?: string | null;
  additionalNotes?: string | null;
  adminNotes?: string | null;
}

/**
 * S28: shape a partner row into the same shape a student row has
 * so the list page can render both without branching. The fields
 * that don't exist on partner_applications (personal statement,
 * etc.) come back as null — the partner CRM doesn't track those.
 */
function mapPartnerAppForUnifiedList(row: UnifiedPartnerRow): Omit<UnifiedAppRow, 'surface'> {
  return {
    id: row.id,
    studentId: null,
    studentName: row.student_name || '—',
    studentEmail: row.student_email || '',
    isLinked: false,
    university: row.university,
    program: row.program,
    degree: row.degree || '',
    intake: row.intake || '',
    status: row.status,
    // S28: new 'Partner CRM' source. The student table only had
    // 'Online' | 'Partner' | 'Admin' — partner_applications is
    // a separate concept (the partner's own tracking) so we
    // distinguish it visually. The existing source filter still
    // works: 'Partner' selects both 'Partner' and 'Partner CRM'.
    source: 'Partner CRM',
    applicationNumber: row.application_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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

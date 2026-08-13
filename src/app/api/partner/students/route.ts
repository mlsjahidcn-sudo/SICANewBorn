import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, getServerEnv } from '@/lib/supabase-auth';
import { mapPartnerStudentFromDb, mapPartnerStudentToDb, parsePartnerStudentStatus } from '@/lib/partner-student-mapper';
import { validatePartnerStudentPayload } from '@/lib/partner-validation';

/**
 * GET /api/partner/students
 *
 * List the calling partner's students (i.e. rows in `partner_students`
 * where partner_id = caller's partner_id). Optional filters:
 *   - search : free-text on student_name + student_email + student_phone
 *   - status : exact match (New | In Progress | Applied | Accepted | Rejected)
 *   - sort   : created_at | updated_at | student_name  (default created_at)
 *   - order  : asc | desc                             (default desc)
 *   - page   : 1-indexed                              (default 1)
 *   - limit  : 1..100                                  (default 20)
 *
 * Response: { students, total, page, limit, totalPages }
 *
 * Auth: requirePartner (verifies the caller is a partner AND looks up
 * their partner_id). Uses the per-request authed client — RLS on
 * partner_students already filters by auth.uid()→partners.user_id, so
 * the partner can never see another partner's rows even if the query
 * string is tampered with.
 */
export async function GET(request: NextRequest) {
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

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = parsePartnerStudentStatus(searchParams.get('status'));
    const sortRaw = searchParams.get('sort') || 'created_at';
    const orderRaw = searchParams.get('order') || 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    // Phase 50b: ?archived=true includes soft-deleted rows in
    // the result. Default (no param) hides them — the partner's
    // "active" view. ?archived=only returns ONLY archived rows
    // (the dedicated "Show archived" toggle on the list page).
    const archivedParam = searchParams.get('archived') || 'false';

    const allowedSort = ['created_at', 'updated_at', 'student_name'];
    const sort = allowedSort.includes(sortRaw) ? sortRaw : 'created_at';
    const ascending = orderRaw === 'asc';

    let query = auth.supabase
      .from('partner_students')
      .select('*', { count: 'exact' })
      .order(sort, { ascending });

    // Phase 50b: soft-delete filter. The 'active' index is the
    // partial index on (partner_id, created_at DESC) WHERE
    // archived_at IS NULL — fast for the default view.
    if (archivedParam === 'only') {
      query = query.not('archived_at', 'is', null);
    } else if (archivedParam !== 'true') {
      query = query.is('archived_at', null);
    }

    // Phase 3: role='member' sees ONLY rows they created.
    // role='owner' sees everything for the partner org (back-compat).
    if (auth.role === 'member') {
      query = query.eq('created_by_user_id', auth.user.id);
    }

    if (status) query = query.eq('status', status);

    if (search) {
      const safe = search.replace(/[%_]/g, '\\$&');
      query = query.or(
        `student_name.ilike.%${safe}%,student_email.ilike.%${safe}%,student_phone.ilike.%${safe}%`,
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('[partner/students GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Phase 3: hydrate created_by_email via the partner-scoped
    // helper (one getUserById per unique user_id, parallel, with a
    // 60s in-memory cache). Replaces the old listUsers({perPage: 200})
    // approach which silently truncated at 201+ users and pulled
    // every project user into the partner server's memory. See
    // src/lib/partner-user-lookup.ts.
    const userIds = Array.from(
      new Set(
        (data || [])
          .map((r) => (r as { created_by_user_id?: string | null }).created_by_user_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const emailMap = new Map<string, string | null>();
    if (userIds.length) {
      const { buildServiceClient, getServerEnv: gse } = await import('@/lib/supabase-auth');
      if (gse().serviceKey) {
        const { hydrateUserEmails } = await import('@/lib/partner-user-lookup');
        const hydrated = await hydrateUserEmails(buildServiceClient(), userIds);
        for (const [id, h] of hydrated) emailMap.set(id, h.email);
      }
    }
    // Phase E: count non-archived applications linked to each
    // returned student. The auth-bound client is already scoped to
    // this partner by RLS; we just filter by the student ids in the
    // current page and aggregate in JS.
    const studentIds = (data || []).map((r) => (r as { id?: string | null }).id).filter((id): id is string => Boolean(id));
    const countMap = new Map<string, number>();
    if (studentIds.length) {
      const { data: appRows, error: countError } = await auth.supabase
        .from('partner_applications')
        .select('student_id')
        .in('student_id', studentIds)
        .is('archived_at', null);
      if (countError) {
        console.error('[partner/students GET] application count error:', countError);
      } else {
        for (const row of appRows || []) {
          const sid = (row as { student_id?: string | null }).student_id;
          if (!sid) continue;
          countMap.set(sid, (countMap.get(sid) || 0) + 1);
        }
      }
    }

    const students = (data || []).map((r) => {
      const id = (r as { created_by_user_id?: string | null }).created_by_user_id;
      const sid = (r as { id?: string | null }).id;
      return mapPartnerStudentFromDb({
        ...(r as Record<string, unknown>),
        created_by_email: id ? emailMap.get(id) ?? null : null,
        application_count: sid ? countMap.get(sid) ?? 0 : 0,
      } as Parameters<typeof mapPartnerStudentFromDb>[0]);
    });
    const total = count || 0;

    return NextResponse.json({
      students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/students GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/partner/students
 *
 * Create a new student in this partner's CRM. Body (camelCase):
 *   - studentName (required)
 *   - studentEmail (optional, but recommended — we don't validate uniqueness
 *                   at the DB level so partners can have multiple records
 *                   for the same email)
 *   - studentPhone, nationality, targetUniversity, targetProgram (optional)
 *   - status (optional, default 'New')
 *   - notes (optional)
 *
 * Response: { student }
 *
 * Auth: requirePartner. The partner_id is server-derived from the
 * caller; the client cannot spoof it. The per-request authed client
 * is used so RLS scopes the insert to this partner.
 */
export async function POST(request: NextRequest) {
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();

    // Phase 47: full field validation (length + email format).
    // Returns the first error to the partner with a 400. Partner
    // forms are short — they only need to know the next thing to
    // fix. The validator lives in src/lib/partner-validation.ts so
    // the same rules apply to the PATCH route below.
    const fieldErrors = validatePartnerStudentPayload(body, 'create');
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

    const dbRow = mapPartnerStudentToDb(body);
    dbRow.partner_id = auth.partnerId;
    // Phase 3: server-derived created_by_user_id — never trust client
    dbRow.created_by_user_id = auth.user.id;
    // Default status to 'New' for new entries
    if (!dbRow.status) dbRow.status = 'New';

    const { data, error } = await auth.supabase
      .from('partner_students')
      .insert(dbRow)
      .select('*')
      .single();

    if (error) {
      console.error('[partner/students POST] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ student: mapPartnerStudentFromDb(data) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/students POST] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

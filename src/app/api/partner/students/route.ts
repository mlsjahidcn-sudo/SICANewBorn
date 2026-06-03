import { NextRequest, NextResponse } from 'next/server';
import { requirePartner, getServerEnv } from '@/lib/supabase-auth';
import { mapPartnerStudentFromDb, mapPartnerStudentToDb, parsePartnerStudentStatus } from '@/lib/partner-student-mapper';

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

  const auth = await requirePartner(request);
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

    const allowedSort = ['created_at', 'updated_at', 'student_name'];
    const sort = allowedSort.includes(sortRaw) ? sortRaw : 'created_at';
    const ascending = orderRaw === 'asc';

    let query = auth.supabase
      .from('partner_students')
      .select('*', { count: 'exact' })
      .order(sort, { ascending });

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

    const students = (data || []).map(mapPartnerStudentFromDb);
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
  const auth = await requirePartner(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();

    if (!body.studentName || typeof body.studentName !== 'string' || !body.studentName.trim()) {
      return NextResponse.json(
        { error: 'studentName is required' },
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

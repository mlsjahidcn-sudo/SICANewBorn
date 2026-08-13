import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { mapPartnerStudentFromDb, parsePartnerStudentStatus } from '@/lib/partner-student-mapper';

/**
 * GET /api/admin/partner-students
 *
 * List all partner-created students with optional filters:
 *   - search   : free-text on student_name, student_email, student_phone
 *   - status   : exact match (New | In Progress | Applied | Accepted | Rejected)
 *   - archived : 'false' (default, active only) | 'true' (include archived) | 'only' (archived only)
 *   - partnerId: filter by partner organization
 *   - linked   : 'true' (linked to a student profile) | 'false' (not linked) | 'all' (default)
 *   - sort     : created_at | updated_at | student_name  (default created_at)
 *   - order    : asc | desc                             (default desc)
 *   - page     : 1-indexed                              (default 1)
 *   - limit    : 1..100                                  (default 20)
 *
 * Response: { students, total, page, limit, totalPages }
 *
 * Auth: any admin or super_admin. Uses service-role client.
 */
export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Set COZE_SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    );
  }

  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = parsePartnerStudentStatus(searchParams.get('status'));
    const partnerId = searchParams.get('partnerId')?.trim() || '';
    const archivedParam = searchParams.get('archived') || 'false';
    const linkedRaw = searchParams.get('linked')?.trim() || 'all';
    const linked = linkedRaw === 'true' ? true : linkedRaw === 'false' ? false : null;
    const sortRaw = searchParams.get('sort') || 'created_at';
    const orderRaw = searchParams.get('order') || 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const allowedSort = ['created_at', 'updated_at', 'student_name'];
    const sort = allowedSort.includes(sortRaw) ? sortRaw : 'created_at';
    const ascending = orderRaw === 'asc';

    const service = buildServiceClient();

    // Base select with partner join + aggregated counts.
    let query = service
      .from('partner_students')
      .select(
        `*,
        partner:partners!partner_id (id, company_name),
        application_count:partner_applications!id(count),
        document_count:student_documents!id(count)`,
        { count: 'exact' },
      )
      .order(sort, { ascending });

    if (archivedParam === 'only') {
      query = query.not('archived_at', 'is', null);
    } else if (archivedParam !== 'true') {
      query = query.is('archived_at', null);
    }

    if (status) query = query.eq('status', status);
    if (partnerId) query = query.eq('partner_id', partnerId);
    if (linked === true) query = query.not('linked_student_profile_id', 'is', null);
    if (linked === false) query = query.is('linked_student_profile_id', null);

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
      console.error('[admin/partner-students GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const students = (data || []).map((row: Record<string, unknown>) => {
      const partner = row.partner as Record<string, unknown> | undefined;
      const appCount = Array.isArray(row.application_count)
        ? row.application_count[0]?.count
        : (row.application_count as { count?: number } | undefined)?.count;
      const docCount = Array.isArray(row.document_count)
        ? row.document_count[0]?.count
        : (row.document_count as { count?: number } | undefined)?.count;
      return mapPartnerStudentFromDb({
        ...row,
        partner_name: (partner?.company_name as string) || null,
        application_count: typeof appCount === 'number' ? appCount : 0,
        document_count: typeof docCount === 'number' ? docCount : 0,
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
    console.error('[admin/partner-students GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

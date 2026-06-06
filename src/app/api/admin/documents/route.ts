import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

/**
 * Phase 2: GET /api/admin/documents
 *
 * Admin review queue for student-uploaded documents. The
 * `student_documents` table has `status`, `verified_at`,
 * `verified_by`, `rejection_reason` columns but no UI path
 * to actually flip them — the only writer is the student's
 * own PATCH. This endpoint is the admin's read view of the
 * queue.
 *
 * Filters (all optional, all AND-combined):
 *   - status  : 'Pending' | 'Verified' | 'Rejected'
 *               (default: 'Pending' — the active review queue)
 *   - search  : free-text on document name (case-insensitive)
 *   - studentId : exact UUID match
 *   - applicationId : exact UUID match
 *   - sort    : uploaded_at | name | status | category (default uploaded_at)
 *   - order   : asc | desc (default desc — newest first)
 *   - page, limit : 1-indexed pagination (default 1, 20; max 100)
 *
 * Each row is joined with the student profile (first_name, last_name,
 * email) so the list can render the student name without a second
 * roundtrip. Auth: requireAdmin — student/partner get 403.
 *
 * Response: { documents, total, page, limit, totalPages }
 */
const ALLOWED_STATUSES = ['Pending', 'Verified', 'Rejected'] as const;
type AdminDocStatus = (typeof ALLOWED_STATUSES)[number];
const ALLOWED_SORTS = ['uploaded_at', 'name', 'status', 'category'] as const;

export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(request.url);
    const statusRaw = searchParams.get('status');
    const status: AdminDocStatus | null =
      statusRaw && (ALLOWED_STATUSES as readonly string[]).includes(statusRaw)
        ? (statusRaw as AdminDocStatus)
        : null;
    const search = searchParams.get('search')?.trim() || '';
    const studentId = searchParams.get('studentId') || '';
    const applicationId = searchParams.get('applicationId') || '';
    const sortRaw = searchParams.get('sort') || 'uploaded_at';
    const sort = (ALLOWED_SORTS as readonly string[]).includes(sortRaw) ? sortRaw : 'uploaded_at';
    const ascending = (searchParams.get('order') || 'desc') === 'asc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const service = buildServiceClient();
    let query = service
      .from('student_documents')
      .select(
        `
          *,
          student:student_profiles!student_id (id, first_name, last_name, email)
        `,
        { count: 'exact' },
      )
      .order(sort, { ascending });

    if (status) query = query.eq('status', status);
    if (studentId) query = query.eq('student_id', studentId);
    if (applicationId) query = query.eq('application_id', applicationId);
    if (search) {
      // Escape LIKE special chars so partner-typed % doesn't open a hole
      const safe = search.replace(/[%_]/g, '\\$&');
      query = query.ilike('name', `%${safe}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error('[admin/documents GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      documents: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/documents GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

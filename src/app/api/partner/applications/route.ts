import { NextRequest, NextResponse } from 'next/server';
import { requirePartner, getServerEnv } from '@/lib/supabase-auth';
import {
  mapPartnerApplicationFromDb,
  mapPartnerApplicationToDb,
  parsePartnerApplicationStatus,
} from '@/lib/partner-application-mapper';

/**
 * GET /api/partner/applications
 *
 * List this partner's applications. Optional filters:
 *   - search : free-text on student_name + university + program
 *   - status : exact match (Draft | Submitted | In Review | Accepted | Rejected | Withdrawn)
 *   - decision: exact match
 *   - sort   : created_at | updated_at | student_name  (default created_at)
 *   - order  : asc | desc                             (default desc)
 *   - page, limit
 *
 * Response: { applications, total, page, limit, totalPages }
 *
 * Auth: requirePartner. Per-request authed client (RLS scopes it).
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
    const status = parsePartnerApplicationStatus(searchParams.get('status'));
    const decision = searchParams.get('decision')?.trim() || '';
    const sortRaw = searchParams.get('sort') || 'created_at';
    const orderRaw = searchParams.get('order') || 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const allowedSort = ['created_at', 'updated_at', 'student_name'];
    const sort = allowedSort.includes(sortRaw) ? sortRaw : 'created_at';
    const ascending = orderRaw === 'asc';

    let query = auth.supabase
      .from('partner_applications')
      .select('*', { count: 'exact' })
      .order(sort, { ascending });

    if (status) query = query.eq('status', status);
    if (decision) query = query.eq('decision', decision);
    if (search) {
      const safe = search.replace(/[%_]/g, '\\$&');
      query = query.or(
        `student_name.ilike.%${safe}%,university.ilike.%${safe}%,program.ilike.%${safe}%`,
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('[partner/applications GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const applications = (data || []).map(mapPartnerApplicationFromDb);
    const total = count || 0;

    return NextResponse.json({
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/applications GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/partner/applications
 *
 * Create a new application in the partner's pipeline. Body (camelCase):
 *   - studentName (required)
 *   - university (required)
 *   - program (required)
 *   - status, submittedAt, decision, notes (optional)
 *
 * Response: { application }
 */
export async function POST(request: NextRequest) {
  const auth = await requirePartner(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();

    if (!body.studentName || !String(body.studentName).trim()) {
      return NextResponse.json({ error: 'studentName is required' }, { status: 400 });
    }
    if (!body.university || !String(body.university).trim()) {
      return NextResponse.json({ error: 'university is required' }, { status: 400 });
    }
    if (!body.program || !String(body.program).trim()) {
      return NextResponse.json({ error: 'program is required' }, { status: 400 });
    }
    if (body.status !== undefined && !parsePartnerApplicationStatus(body.status)) {
      return NextResponse.json(
        {
          error:
            "status must be 'Draft' | 'Submitted' | 'In Review' | 'Accepted' | 'Rejected' | 'Withdrawn'",
        },
        { status: 400 },
      );
    }

    const dbRow = mapPartnerApplicationToDb(body);
    dbRow.partner_id = auth.partnerId;
    if (!dbRow.status) dbRow.status = 'Draft';
    if (!dbRow.decision) dbRow.decision = 'Pending';

    const { data, error } = await auth.supabase
      .from('partner_applications')
      .insert(dbRow)
      .select('*')
      .single();

    if (error) {
      console.error('[partner/applications POST] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { application: mapPartnerApplicationFromDb(data) },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/applications POST] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requirePartner, getServerEnv } from '@/lib/supabase-auth';
import {
  mapPartnerFeeFromDb,
  mapPartnerFeeToDb,
  parsePartnerFeeStatus,
} from '@/lib/partner-fee-mapper';

/**
 * GET /api/partner/fees
 *
 * List this partner's fees with optional filters:
 *   - search : free-text on student_name + description
 *   - status : exact match (Pending | Paid | Overdue | Refunded)
 *   - sort   : created_at | updated_at | due_date | amount | student_name  (default created_at)
 *   - order, page, limit
 *
 * Auth: requirePartner. RLS scopes it to the caller's partner_id.
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
    const status = parsePartnerFeeStatus(searchParams.get('status'));
    const sortRaw = searchParams.get('sort') || 'created_at';
    const orderRaw = searchParams.get('order') || 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const allowedSort = ['created_at', 'updated_at', 'due_date', 'amount', 'student_name'];
    const sort = allowedSort.includes(sortRaw) ? sortRaw : 'created_at';
    const ascending = orderRaw === 'asc';

    let query = auth.supabase
      .from('partner_fees')
      .select('*', { count: 'exact' })
      .order(sort, { ascending });

    if (status) query = query.eq('status', status);
    if (search) {
      const safe = search.replace(/[%_]/g, '\\$&');
      query = query.or(
        `student_name.ilike.%${safe}%,description.ilike.%${safe}%`,
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('[partner/fees GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const fees = (data || []).map(mapPartnerFeeFromDb);
    const total = count || 0;

    return NextResponse.json({
      fees,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/fees GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/partner/fees
 *
 * Create a new fee record. Body (camelCase):
 *   - studentName (required)
 *   - amount (required, number)
 *   - currency (optional, default 'CNY')
 *   - status, description, dueDate, paidAt (optional)
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
    if (body.amount === undefined || body.amount === null || isNaN(Number(body.amount))) {
      return NextResponse.json(
        { error: 'amount is required and must be a number' },
        { status: 400 },
      );
    }
    if (Number(body.amount) < 0) {
      return NextResponse.json({ error: 'amount must be >= 0' }, { status: 400 });
    }
    if (body.status !== undefined && !parsePartnerFeeStatus(body.status)) {
      return NextResponse.json(
        { error: "status must be 'Pending' | 'Paid' | 'Overdue' | 'Refunded'" },
        { status: 400 },
      );
    }

    const dbRow = mapPartnerFeeToDb(body);
    dbRow.partner_id = auth.partnerId;
    if (!dbRow.status) dbRow.status = 'Pending';

    const { data, error } = await auth.supabase
      .from('partner_fees')
      .insert(dbRow)
      .select('*')
      .single();

    if (error) {
      console.error('[partner/fees POST] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ fee: mapPartnerFeeFromDb(data) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/fees POST] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

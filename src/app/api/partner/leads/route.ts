import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, getServerEnv } from '@/lib/supabase-auth';
import {
  mapPartnerLeadFromDb,
  mapPartnerLeadToDb,
  parsePartnerLeadStatus,
} from '@/lib/partner-lead-mapper';

/**
 * GET /api/partner/leads
 *
 * List this partner's leads (incoming inquiries). Filters:
 *   - search : free-text on lead_name + lead_email + lead_phone + interested_program
 *   - status : exact match (New | Contacted | Qualified | Converted | Lost)
 *   - sort, order, page, limit
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
    const status = parsePartnerLeadStatus(searchParams.get('status'));
    const sortRaw = searchParams.get('sort') || 'created_at';
    const orderRaw = searchParams.get('order') || 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const allowedSort = ['created_at', 'updated_at', 'lead_name'];
    const sort = allowedSort.includes(sortRaw) ? sortRaw : 'created_at';
    const ascending = orderRaw === 'asc';

    let query = auth.supabase
      .from('partner_leads')
      .select('*', { count: 'exact' })
      .eq('partner_id', auth.partnerId)
      .order(sort, { ascending });

    // Phase 3: role='member' sees ONLY rows they created.
    if (auth.role === 'member') {
      query = query.eq('created_by_user_id', auth.user.id);
    }

    if (status) query = query.eq('status', status);
    if (search) {
      const safe = search.replace(/[%_]/g, '\\$&');
      query = query.or(
        `lead_name.ilike.%${safe}%,lead_email.ilike.%${safe}%,lead_phone.ilike.%${safe}%,interested_program.ilike.%${safe}%`,
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('[partner/leads GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const leads = (data || []).map(mapPartnerLeadFromDb);
    const total = count || 0;

    return NextResponse.json({
      leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/leads GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/partner/leads
 *
 * Create a new lead. Body (camelCase):
 *   - leadName (required)
 *   - leadEmail, leadPhone, interestedProgram, status, notes (optional)
 */
export async function POST(request: NextRequest) {
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();

    if (!body.leadName || !String(body.leadName).trim()) {
      return NextResponse.json({ error: 'leadName is required' }, { status: 400 });
    }
    if (body.status !== undefined && !parsePartnerLeadStatus(body.status)) {
      return NextResponse.json(
        { error: "status must be 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost'" },
        { status: 400 },
      );
    }

    const dbRow = mapPartnerLeadToDb(body);
    dbRow.partner_id = auth.partnerId;
    // Phase 3: server-derived created_by_user_id — never trust client
    dbRow.created_by_user_id = auth.user.id;
    if (!dbRow.status) dbRow.status = 'New';

    const { data, error } = await auth.supabase
      .from('partner_leads')
      .insert(dbRow)
      .select('*')
      .single();

    if (error) {
      console.error('[partner/leads POST] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lead: mapPartnerLeadFromDb(data) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/leads POST] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

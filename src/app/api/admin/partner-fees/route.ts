import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { mapPartnerFeeFromDb } from '@/lib/partner-fee-mapper';

/**
 * GET  /api/admin/partner-fees  — list partner service fees
 * POST /api/admin/partner-fees  — create a service fee for a partner's student
 *
 * Auth: admin only.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(request.url);
    const partner = searchParams.get('partner');
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const service = buildServiceClient();
    let query = service
      .from('partner_fees')
      .select(
        `*,
         partner:partner_id (id, company_name, email)`,
        { count: 'exact' },
      )
      .order('created_at', { ascending: false });

    if (partner) query = query.eq('partner_id', partner);
    if (status) query = query.eq('status', status);
    if (search) {
      const safe = search.replace(/[%_]/g, '\\$&');
      query = query.or(`student_name.ilike.%${safe}%,description.ilike.%${safe}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error('[admin/partner-fees GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    type RawPartner = { id: string; company_name?: string | null; email?: string | null } | null;
    const fees = ((data || []) as (Record<string, unknown> & { partner?: RawPartner })[]).map((row) => {
      const mapped = mapPartnerFeeFromDb(row as unknown as Parameters<typeof mapPartnerFeeFromDb>[0]);
      return {
        ...mapped,
        partnerName: row.partner?.company_name || row.partner?.email || '—',
      };
    });

    return NextResponse.json({
      fees,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    if (!body.partnerId) return NextResponse.json({ error: 'partnerId is required' }, { status: 400 });
    if (!body.studentName || typeof body.studentName !== 'string' || !body.studentName.trim()) {
      return NextResponse.json({ error: 'studentName is required' }, { status: 400 });
    }
    const amount = typeof body.amount === 'string' ? parseFloat(body.amount) : Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
    }

    const service = buildServiceClient();
    const { data, error } = await service
      .from('partner_fees')
      .insert({
        partner_id: body.partnerId,
        student_name: body.studentName.trim(),
        amount,
        currency: body.currency || 'CNY',
        description: body.description || null,
        due_date: body.dueDate || null,
        status: 'Pending',
        promotion_id: body.promotionId || null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('[admin/partner-fees POST] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ fee: mapPartnerFeeFromDb(data) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

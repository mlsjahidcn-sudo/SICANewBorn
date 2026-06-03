import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

/**
 * GET  /api/admin/fees  — list fees with filters
 * POST /api/admin/fees  — create a new fee
 *
 * Auth: any admin (requireAdmin). Service-role client.
 *
 * Response shape for GET: { fees, total, page, limit, totalPages }
 * (matches the pattern used by other admin list endpoints)
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
    const feeType = searchParams.get('feeType');
    const search = searchParams.get('search')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const service = buildServiceClient();
    let query = service
      .from('student_fees')
      .select(
        `*,
         student:student_profiles!student_id (id, first_name, last_name, email, source)`,
        { count: 'exact' },
      )
      .order('created_at', { ascending: false });

    if (student) query = query.eq('student_id', student);
    if (status) query = query.eq('status', status);
    if (feeType) query = query.eq('fee_type', feeType);
    if (search) {
      const safe = search.replace(/[%_]/g, '\\$&');
      query = query.or(`description.ilike.%${safe}%,notes.ilike.%${safe}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error('[admin/fees GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Normalize: snake_case → camelCase + flatten the joined student
    type RawFee = {
      id: string;
      student_id: string;
      application_id?: string;
      fee_type: string;
      description?: string;
      amount: number;
      currency: string;
      amount_paid: number;
      due_date?: string;
      paid_date?: string;
      status: string;
      payment_method?: string;
      notes?: string;
      created_at: string;
      updated_at: string;
      student?: { id: string; first_name: string; last_name: string; email: string; source: string } | null;
    };

    const fees = ((data || []) as RawFee[]).map((f) => ({
      id: f.id,
      studentId: f.student_id,
      studentName: `${f.student?.first_name || ''} ${f.student?.last_name || ''}`.trim() || '—',
      studentEmail: f.student?.email || '',
      applicationId: f.application_id,
      feeType: f.fee_type,
      description: f.description,
      amount: Number(f.amount),
      currency: f.currency,
      amountPaid: Number(f.amount_paid),
      dueDate: f.due_date,
      paidDate: f.paid_date,
      status: f.status,
      paymentMethod: f.payment_method,
      notes: f.notes,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));

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
    if (!body.studentId) return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
    if (!body.feeType) return NextResponse.json({ error: 'feeType is required' }, { status: 400 });
    if (typeof body.amount !== 'number' || body.amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
    }

    const service = buildServiceClient();
    const { data, error } = await service
      .from('student_fees')
      .insert({
        student_id: body.studentId,
        application_id: body.applicationId,
        fee_type: body.feeType,
        description: body.description,
        amount: body.amount,
        currency: body.currency || 'CNY',
        amount_paid: body.amountPaid || 0,
        due_date: body.dueDate,
        status: body.status || 'Pending',
        payment_method: body.paymentMethod,
        notes: body.notes,
      })
      .select('*')
      .single();

    if (error) {
      console.error('[admin/fees POST] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ fee: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

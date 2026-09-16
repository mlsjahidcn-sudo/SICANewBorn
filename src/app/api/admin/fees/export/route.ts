import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * Phase 108 Batch 6: GET /api/admin/fees/export
 *
 * CSV export of the admin's fees list. Same filter shape as
 * GET /api/admin/fees (no pagination) so the export and the
 * on-screen table show the same data.
 *
 * Query params (same as list):
 *   - ids     : comma-separated list of row ids. When present,
 *               exports only those rows and ignores the other
 *               filters (matches applications/export behavior).
 *   - status  : exact match.
 *   - feeType : exact match.
 *   - student : student_id filter.
 *   - search  : free-text on description / notes.
 *
 * Capped at 1000 rows. With >1000 the API still emits what it
 * has and sets `X-Truncated: true`.
 *
 * Response: text/csv with UTF-8 BOM (Excel friendliness) +
 * Content-Disposition: attachment. Filename: sica-fees-YYYY-MM-DD.csv.
 */
const MAX_EXPORT_ROWS = 1000;

const CSV_COLUMNS = [
  'Fee ID',
  'Student Name',
  'Student Email',
  'Application #',
  'Fee Type',
  'Description',
  'Amount',
  'Currency',
  'Amount Paid',
  'Remaining',
  'Status',
  'Due Date',
  'Paid Date',
  'Payment Method',
  'Created At',
  'Notes',
] as const;

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsvRow(values: unknown[]): string {
  return values.map(csvEscape).join(',');
}

export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids')?.trim() || '';
    const ids = idsParam ? idsParam.split(',').filter((s) => s.length > 0) : [];
    const status = searchParams.get('status');
    const feeType = searchParams.get('feeType');
    const student = searchParams.get('student');
    const search = searchParams.get('search')?.trim();

    const service = buildServiceClient();
    let query = service
      .from('student_fees')
      .select(
        `*,
         student:student_profiles!student_id (first_name, last_name, email),
         application:student_applications!application_id (application_number)`,
      )
      .order('created_at', { ascending: false })
      .limit(MAX_EXPORT_ROWS + 1);

    if (ids.length > 0) {
      query = query.in('id', ids);
    } else {
      if (status) query = query.eq('status', status);
      if (feeType) query = query.eq('fee_type', feeType);
      if (student) query = query.eq('student_id', student);
      if (search) {
        const safe = search.replace(/[%_]/g, '\\$&');
        query = query.or(`description.ilike.%${safe}%,notes.ilike.%${safe}%`);
      }
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = data || [];
    const truncated = rows.length > MAX_EXPORT_ROWS;
    const emit = truncated ? rows.slice(0, MAX_EXPORT_ROWS) : rows;

    const header = toCsvRow([...CSV_COLUMNS]);
    const body = emit
      .map((row) => {
        const r = row as {
          id: string;
          amount?: number | string | null;
          currency?: string | null;
          amount_paid?: number | string | null;
          fee_type?: string | null;
          description?: string | null;
          due_date?: string | null;
          paid_date?: string | null;
          status?: string | null;
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string | null;
          student?: {
            first_name?: string | null;
            last_name?: string | null;
            email?: string | null;
          } | null;
          application?: { application_number?: string | null } | null;
        };
        const amount =
          typeof r.amount === 'string' ? parseFloat(r.amount) : r.amount || 0;
        const paid =
          typeof r.amount_paid === 'string'
            ? parseFloat(r.amount_paid)
            : r.amount_paid || 0;
        const remaining = Math.max(0, amount - paid);
        const studentName =
          `${r.student?.first_name || ''} ${r.student?.last_name || ''}`.trim() || '—';
        return toCsvRow([
          r.id,
          studentName,
          r.student?.email || '',
          r.application?.application_number || '',
          r.fee_type || '',
          r.description || '',
          amount,
          r.currency || '',
          paid,
          remaining,
          r.status || '',
          r.due_date || '',
          r.paid_date || '',
          r.payment_method || '',
          r.created_at || '',
          r.notes || '',
        ]);
      })
      .join('\r\n');

    // UTF-8 BOM (Excel on Windows mojibake fix).
    const csv = '\uFEFF' + header + '\r\n' + body + '\r\n';
    const today = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sica-fees-${today}.csv"`,
        'X-Row-Count': String(emit.length),
        'X-Max-Rows': String(MAX_EXPORT_ROWS),
        'X-Truncated': truncated ? 'true' : 'false',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember } from '@/lib/supabase-auth';
import { parsePartnerStudentStatus } from '@/lib/partner-student-mapper';
import { sanitizeOrTerm } from '@/lib/postgrest';

export const dynamic = 'force-dynamic';

/**
 * Phase 122c: GET /api/partner/students/export
 *
 * CSV export of the partner's students list. Mirrors the filter
 * surface of GET /api/partner/students (search / status / archived /
 * sort / order) but ignores pagination. Capped at 1000 rows; the
 * server flags truncation via `X-Truncated: true` so the UI can warn
 * the partner to narrow the filters (same contract as the partner
 * applications export from Phase 111b).
 *
 * This replaces the old client-side export on /partner/students,
 * which rebuilt the CSV in the browser from a `limit=1000` JSON fetch
 * and silently truncated with no banner — and counted applications
 * only for the rows it happened to fetch.
 *
 * Response: text/csv (UTF-8 BOM) with Content-Disposition: attachment;
 * filename sica-partner-students-YYYY-MM-DD.csv.
 */
const MAX_EXPORT_ROWS = 1000;

const CSV_COLUMNS = [
  'Name',
  'Email',
  'Phone',
  'Nationality',
  'Target University',
  'Target Program',
  'Status',
  'Archived',
  'Applications',
  'Documents',
  'Created At',
] as const;

// RFC 4180-compliant CSV escape — mirrors the helper in
// /api/partner/applications/export.
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
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = parsePartnerStudentStatus(searchParams.get('status'));
    const archivedParam = searchParams.get('archived') || 'false';
    const sortRaw = searchParams.get('sort') || 'created_at';
    const orderRaw = searchParams.get('order') || 'desc';
    const allowedSort = ['created_at', 'updated_at', 'student_name'];
    const sort = allowedSort.includes(sortRaw) ? sortRaw : 'created_at';
    const ascending = orderRaw === 'asc';

    let query = auth.supabase
      .from('partner_students')
      .select('*')
      .order(sort, { ascending })
      .limit(MAX_EXPORT_ROWS);

    if (archivedParam === 'only') {
      query = query.not('archived_at', 'is', null);
    } else if (archivedParam !== 'true') {
      query = query.is('archived_at', null);
    }

    // Phase 3: member-role sees only rows they created (same rule as
    // the list endpoint).
    if (auth.role === 'member') {
      query = query.eq('created_by_user_id', auth.user.id);
    }

    if (status) query = query.eq('status', status);

    if (search) {
      const safe = sanitizeOrTerm(search);
      query = query.or(
        `student_name.ilike.%${safe}%,student_email.ilike.%${safe}%,student_phone.ilike.%${safe}%`,
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error('[partner/students/export] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data || []) as Array<{
      id: string;
      student_name: string;
      student_email: string | null;
      student_phone: string | null;
      nationality: string | null;
      target_university: string | null;
      target_program: string | null;
      status: string | null;
      archived_at: string | null;
      created_at: string | null;
    }>;

    // Application + document counts for the exported slice — batched
    // IN queries (the auth-bound client is already RLS-scoped to this
    // partner). Both are best-effort; a failure leaves the column at 0.
    const ids = rows.map((r) => r.id);
    const appCounts = new Map<string, number>();
    const docCounts = new Map<string, number>();
    if (ids.length > 0) {
      const [appsRes, docsRes] = await Promise.all([
        auth.supabase
          .from('partner_applications')
          .select('student_id')
          .in('student_id', ids)
          .is('archived_at', null),
        auth.supabase
          .from('student_documents')
          .select('partner_student_id')
          .in('partner_student_id', ids),
      ]);
      if (appsRes.error) {
        console.error('[partner/students/export] app count error:', appsRes.error);
      } else {
        for (const row of appsRes.data || []) {
          const sid = (row as { student_id?: string | null }).student_id;
          if (sid) appCounts.set(sid, (appCounts.get(sid) || 0) + 1);
        }
      }
      if (docsRes.error) {
        console.error('[partner/students/export] doc count error:', docsRes.error);
      } else {
        for (const row of docsRes.data || []) {
          const sid = (row as { partner_student_id?: string | null }).partner_student_id;
          if (sid) docCounts.set(sid, (docCounts.get(sid) || 0) + 1);
        }
      }
    }

    const truncated = rows.length > MAX_EXPORT_ROWS;
    const exportRows = truncated ? rows.slice(0, MAX_EXPORT_ROWS) : rows;

    const header = toCsvRow([...CSV_COLUMNS]);
    const body = exportRows.map((r) =>
      toCsvRow([
        r.student_name,
        r.student_email,
        r.student_phone,
        r.nationality,
        r.target_university,
        r.target_program,
        r.status,
        r.archived_at ? 'Yes' : 'No',
        appCounts.get(r.id) || 0,
        docCounts.get(r.id) || 0,
        r.created_at,
      ]),
    );

    const csv = '\uFEFF' + [header, ...body].join('\r\n');
    const today = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sica-partner-students-${today}.csv"`,
        'Cache-Control': 'no-store',
        'X-Row-Count': String(exportRows.length),
        'X-Max-Rows': String(MAX_EXPORT_ROWS),
        'X-Truncated': truncated ? 'true' : 'false',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/students/export] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

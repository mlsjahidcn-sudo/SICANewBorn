import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { mapStudentFromDb, parseSource, parseStatus, STUDENT_SORTABLE_FIELDS } from '@/lib/student-mapper';
import { sanitizeOrTerm } from '@/lib/postgrest';

export const dynamic = 'force-dynamic';

/**
 * Phase 122a: GET /api/admin/students/export
 *
 * CSV export of the admin students list. Mirrors the row shape and
 * the filter surface of GET /api/admin/students (search / status /
 * source / isOffline / sort / order) but ignores pagination — exports
 * are always one response. Capped at 1000 rows; the server flags
 * truncation via `X-Truncated: true` so the UI can warn the admin to
 * narrow the filters.
 *
 * Response: text/csv (UTF-8 BOM so Excel opens it cleanly) with
 * Content-Disposition: attachment; filename sica-students-YYYY-MM-DD.csv.
 */
const MAX_EXPORT_ROWS = 1000;

const CSV_COLUMNS = [
  'Student Name',
  'Email',
  'Phone',
  'Nationality',
  'Date of Birth',
  'Gender',
  'Target Degree',
  'Target Field',
  'Target Intake',
  'Preferred Universities',
  'Source',
  'Status',
  'Applications', // student_applications + partner_applications (linked profile)
  'Created At',
  'Updated At',
] as const;

// RFC 4180-compliant CSV escape — mirrors the helper in
// /api/admin/applications/export.
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
    const status = parseStatus(searchParams.get('status'));
    const source = parseSource(searchParams.get('source'));
    const isOfflineRaw = searchParams.get('isOffline');
    const sortRaw = searchParams.get('sort') || 'created_at';
    const orderRaw = searchParams.get('order') || 'desc';
    const sort = (STUDENT_SORTABLE_FIELDS as readonly string[]).includes(sortRaw)
      ? sortRaw
      : 'created_at';
    const ascending = orderRaw === 'asc';

    const service = buildServiceClient();
    let query = service
      .from('student_profiles')
      .select('*')
      .order(sort, { ascending })
      .limit(MAX_EXPORT_ROWS);

    if (status) query = query.eq('status', status);
    if (source) query = query.eq('source', source);
    if (isOfflineRaw === 'true') query = query.eq('source', 'Admin');
    if (isOfflineRaw === 'false') query = query.neq('source', 'Admin');

    if (search) {
      const safe = sanitizeOrTerm(search);
      query = query.or(
        `first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%,nationality.ilike.%${safe}%,target_degree.ilike.%${safe}%,target_field.ilike.%${safe}%`,
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error('[admin/students/export] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const students = (data || []).map(mapStudentFromDb);
    const studentIds = students.map((s) => s.id);

    // Application counts for the exported slice — student applications
    // by student_id, partner CRM applications by the Phase A bridge
    // column (linked_student_profile_id). Two batched IN queries cover
    // up to 1000 students; both are best-effort (a failure leaves the
    // Applications column at 0 rather than failing the download).
    const studentAppCounts = new Map<string, number>();
    const partnerAppCounts = new Map<string, number>();
    if (studentIds.length > 0) {
      const [studentAppsRes, partnerAppsRes] = await Promise.all([
        service.from('student_applications').select('student_id').in('student_id', studentIds),
        service
          .from('partner_applications')
          .select('linked_student_profile_id')
          .in('linked_student_profile_id', studentIds),
      ]);
      if (studentAppsRes.error) {
        console.error('[admin/students/export] student app count error:', studentAppsRes.error);
      } else {
        for (const row of studentAppsRes.data || []) {
          const sid = (row as { student_id?: string | null }).student_id;
          if (sid) studentAppCounts.set(sid, (studentAppCounts.get(sid) || 0) + 1);
        }
      }
      if (partnerAppsRes.error) {
        console.error('[admin/students/export] partner app count error:', partnerAppsRes.error);
      } else {
        for (const row of partnerAppsRes.data || []) {
          const sid = (row as { linked_student_profile_id?: string | null }).linked_student_profile_id;
          if (sid) partnerAppCounts.set(sid, (partnerAppCounts.get(sid) || 0) + 1);
        }
      }
    }

    const truncated = students.length > MAX_EXPORT_ROWS;
    const rows = truncated ? students.slice(0, MAX_EXPORT_ROWS) : students;

    const header = toCsvRow([...CSV_COLUMNS]);
    const body = rows.map((s) =>
      toCsvRow([
        [s.firstName, s.lastName].filter(Boolean).join(' ').trim() || s.email,
        s.email,
        s.phone,
        s.nationality,
        s.dateOfBirth,
        s.gender ?? '',
        s.targetDegree,
        s.targetField,
        s.targetIntake,
        s.preferredUniversities.join('; '),
        s.source,
        s.status,
        (studentAppCounts.get(s.id) || 0) + (partnerAppCounts.get(s.id) || 0),
        s.createdAt,
        s.updatedAt,
      ]),
    );

    const csv = '\uFEFF' + [header, ...body].join('\r\n');
    const today = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sica-students-${today}.csv"`,
        'Cache-Control': 'no-store',
        'X-Row-Count': String(rows.length),
        'X-Max-Rows': String(MAX_EXPORT_ROWS),
        'X-Truncated': truncated ? 'true' : 'false',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/students/export] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

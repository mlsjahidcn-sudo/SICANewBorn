import { loadAdminStudentList, loadAdminStudentApplicationCounts } from '@/lib/admin-student-list';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * Phase 122a: GET /api/admin/students/export
 *
 * CSV export of the admin students list. Mirrors the row shape and
 * the filter surface of GET /api/admin/students (search / status /
 * source / isOffline / servicePaid / sort / order) but ignores
 * pagination — exports are always one response. Capped at 1000 rows;
 * the server flags truncation via `X-Truncated: true` so the UI can
 * warn the admin to narrow the filters.
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
  'Service Paid', // Phase 182: student_profiles.service_paid triage
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
    const service = buildServiceClient();
    const students = await loadAdminStudentList(service, searchParams);
    const truncated = students.length > MAX_EXPORT_ROWS;
    const rows = students.slice(0, MAX_EXPORT_ROWS);
    const counts = await loadAdminStudentApplicationCounts(service, rows);

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
        s.surface === 'partner' ? '' : s.servicePaid ? 'Yes' : 'No',
        counts.get(`${s.surface}:${s.id}`) || 0,
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

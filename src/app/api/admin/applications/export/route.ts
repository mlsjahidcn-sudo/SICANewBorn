import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { normalizeIntake, parseIntakeFilter } from '@/lib/intake-normalize';

export const dynamic = 'force-dynamic';

/**
 * S33: GET /api/admin/applications/export
 *
 * Unified CSV export of the admin's applications list. Mirrors the
 * row shape returned by GET /api/admin/applications so the export
 * and the on-screen table show the same data.
 *
 * Query params (same shape as the list endpoint, but no pagination):
 *   - ids      : comma-separated list of row ids. When present,
 *                exports only those rows (and ignores the other
 *                filters — the ids are authoritative). Used by
 *                the S31 bulk "Export selected" action.
 *   - source   : filter by source (Online|Partner|Admin). Partner
 *                matches both student.source=Partner and
 *                partner_applications (Partner CRM).
 *   - status   : exact match on status.
 *   - search   : free-text on university / program / app number /
 *                student name.
 *
 * Capped at 1000 rows. With >1000 the API still emits what it has
 * and sets `X-Truncated: true` so the UI can warn the admin.
 *
 * Response: text/csv with Content-Disposition: attachment.
 * Filename: sica-applications-YYYY-MM-DD.csv
 *
 * Schema reminder (S28):
 *   - student_applications + student_profiles join
 *   - partner_applications (no profile join, has its own fields)
 * Each row is normalized into a common CSV shape. Fields that
 * only one surface has are left blank for the other.
 */
const MAX_EXPORT_ROWS = 1000;

const CSV_COLUMNS = [
  'Application #',     // STU-APP-2026-NNNN or PA-2026-NNNN
  'Surface',           // 'Student' | 'Partner CRM'
  'Student Name',
  'Student Email',
  'Student Phone',
  'Nationality',
  'Date of Birth',
  'Gender',
  'University',
  'Program',
  'Degree',
  'Intake',
  'Status',
  'Decision',
  'Priority',
  'Source',            // Online / Partner / Admin
  'Submitted At',
  'Created At',
  'Updated At',
  'Notes',
] as const;

// RFC 4180-compliant CSV escape. Quotes any field that contains
// a comma, double-quote, CR, or LF, and doubles any internal
// quotes. Mirrors the helper in /api/partner/applications/export.
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
    const source = searchParams.get('source');
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim();
    // S34: cohort filter (slug "YYYY-season" or "none"). Mirrors
    // the list endpoint so the cohort card's "View applications"
    // link can hit "Export CSV" and get the same cohort in the
    // download. Applied JS-side because intake is freeform.
    const intakeFilter = parseIntakeFilter(searchParams.get('intake'));

    const service = buildServiceClient();

    // Each row in the unified list. Built from one of the two
    // underlying tables depending on surface.
    interface CsvRow {
      surface: 'Student' | 'Partner CRM';
      application_number: string | null;
      student_name: string | null;
      student_email: string | null;
      student_phone: string | null;
      nationality: string | null;
      date_of_birth: string | null;
      gender: string | null;
      university: string;
      program: string;
      degree: string | null;
      intake: string | null;
      status: string;
      decision: string | null;
      priority: string | null;
      source: string;
      submitted_at: string | null;
      created_at: string;
      updated_at: string;
      notes: string | null;
    }

    const rows: CsvRow[] = [];

    // Helper to apply a JS-side search filter (lowercase
    // contains on the same fields the list endpoint uses).
    const matchesSearch = (r: CsvRow): boolean => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        (r.student_name?.toLowerCase().includes(s) ?? false) ||
        (r.student_email?.toLowerCase().includes(s) ?? false) ||
        r.university.toLowerCase().includes(s) ||
        r.program.toLowerCase().includes(s) ||
        (r.application_number?.toLowerCase().includes(s) ?? false)
      );
    };

    // --- 1. Pull student_applications + student_profiles join ---
    // Skip entirely when the caller asked for an ids set and
    // none of those ids is from this table — we have no way to
    // know which surface an id belongs to without probing, so
    // we always probe both and dedupe at the end.
    let studentRows: Array<{
      id: string;
      application_number: string | null;
      university_name: string;
      program_name: string;
      degree: string | null;
      intake: string | null;
      status: string;
      priority: string | null;
      submitted_at: string | null;
      created_at: string;
      updated_at: string;
      notes: string | null;
      student_id: string | null;
      applicant_name: string | null;
      applicant_email: string | null;
      applicant_phone: string | null;
      applicant_nationality: string | null;
      student?: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        source: string;
        status: string;
        nationality: string | null;
        date_of_birth: string | null;
      } | null;
    }> = [];

    {
      let q = service
        .from('student_applications')
        .select(
          `*,
           student:student_profiles!student_id (id, first_name, last_name, email, source, status, nationality, date_of_birth)`,
        )
        .order('created_at', { ascending: false })
        .limit(MAX_EXPORT_ROWS);

      if (status) q = q.eq('status', status);
      if (ids.length > 0) q = q.in('id', ids);
      if (search) {
        const safe = search.replace(/[%_]/g, '\\$&');
        q = q.or(
          `program_name.ilike.%${safe}%,university_name.ilike.%${safe}%,application_number.ilike.%${safe}%`,
        );
      }

      const { data, error } = await q;
      if (error) {
        console.error('[admin/applications/export] student query error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      studentRows = (data || []) as typeof studentRows;
    }

    for (const r of studentRows) {
      const isLinked = !!r.student_id && !!r.student;
      const studentName = isLinked
        ? `${r.student!.first_name || ''} ${r.student!.last_name || ''}`.trim() || '—'
        : r.applicant_name || '—';
      const studentEmail = isLinked ? r.student!.email || '' : r.applicant_email || '';
      const studentPhone = r.applicant_phone || '';
      const nationality = r.student?.nationality || r.applicant_nationality || '';
      const source = isLinked
        ? (r.student!.source as 'Online' | 'Partner' | 'Admin') || 'Online'
        : 'Admin';
      rows.push({
        surface: 'Student',
        application_number: r.application_number || '',
        student_name: studentName,
        student_email: studentEmail || '',
        student_phone: studentPhone || '',
        nationality: nationality || '',
        date_of_birth: r.student?.date_of_birth || '',
        gender: '', // student_profiles has no gender column
        university: r.university_name,
        program: r.program_name,
        degree: r.degree,
        intake: r.intake,
        status: r.status,
        decision: '', // student table has no decision column
        priority: r.priority,
        source,
        submitted_at: r.submitted_at,
        created_at: r.created_at,
        updated_at: r.updated_at,
        notes: r.notes,
      });
    }

    // --- 2. Pull partner_applications ---
    let partnerRows: Array<{
      id: string;
      application_number: string | null;
      student_name: string | null;
      student_email: string | null;
      student_phone: string | null;
      nationality: string | null;
      date_of_birth: string | null;
      gender: string | null;
      university: string;
      program: string;
      degree: string | null;
      intake: string | null;
      status: string;
      decision: string | null;
      priority: string | null;
      submitted_at: string | null;
      created_at: string;
      updated_at: string;
      notes: string | null;
    }> = [];

    {
      let q = service
        .from('partner_applications')
        .select(
          'id, application_number, student_name, student_email, student_phone, nationality, date_of_birth, gender, university, program, degree, intake, status, decision, priority, submitted_at, created_at, updated_at, notes',
        )
        .order('created_at', { ascending: false })
        .limit(MAX_EXPORT_ROWS);

      if (status) q = q.eq('status', status);
      if (ids.length > 0) q = q.in('id', ids);
      if (search) {
        const safe = search.replace(/[%_]/g, '\\$&');
        q = q.or(
          `student_name.ilike.%${safe}%,university.ilike.%${safe}%,program.ilike.%${safe}%,application_number.ilike.%${safe}%`,
        );
      }

      const { data, error } = await q;
      if (error) {
        console.error('[admin/applications/export] partner query error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      partnerRows = (data || []) as typeof partnerRows;
    }

    for (const r of partnerRows) {
      rows.push({
        surface: 'Partner CRM',
        application_number: r.application_number || '',
        student_name: r.student_name,
        student_email: r.student_email,
        student_phone: r.student_phone,
        nationality: r.nationality,
        date_of_birth: r.date_of_birth,
        gender: r.gender,
        university: r.university,
        program: r.program,
        degree: r.degree,
        intake: r.intake,
        status: r.status,
        decision: r.decision,
        priority: r.priority,
        // Partner rows are always 'Partner' source. We display
        // 'Partner CRM' in the surface column to distinguish the
        // table; the Source column is reserved for the
        // student-side taxonomy (Online / Partner / Admin).
        source: 'Partner',
        submitted_at: r.submitted_at,
        created_at: r.created_at,
        updated_at: r.updated_at,
        notes: r.notes,
      });
    }

    // Sort combined rows by created_at desc (the per-table
    // queries already returned sorted, but a UNION-style merge
    // loses that ordering).
    rows.sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0));

    // --- 3. Apply the post-merge filters ---
    let filtered = rows;
    if (source) {
      // 'Partner' as the source filter covers BOTH student.source=Partner
      // AND the partner_applications rows. 'Admin' covers
      // student_id IS NULL. 'Online' covers student.source=Online.
      if (source === 'Partner') {
        filtered = filtered.filter((r) => r.source === 'Partner');
      } else if (source === 'Admin') {
        filtered = filtered.filter((r) => r.source === 'Admin');
      } else if (source === 'Online') {
        filtered = filtered.filter((r) => r.source === 'Online');
      }
    }
    // JS-side search narrowing (the per-table queries already did
    // their own narrow via OR; this catches rows that don't match
    // the SQL predicate but slip through because of column name
    // mismatches). Cheap, runs once.
    filtered = filtered.filter(matchesSearch);
    // S34: cohort filter — same JS-side normalization as the
    // list endpoint so the cohort card's deep link works
    // uniformly.
    if (intakeFilter) {
      filtered = filtered.filter((r) => {
        const norm = normalizeIntake(r.intake);
        if (intakeFilter.kind === 'none') return norm === null;
        return norm !== null && norm.cohort === intakeFilter.cohort;
      });
    }
    const truncated = filtered.length > MAX_EXPORT_ROWS;
    if (truncated) filtered = filtered.slice(0, MAX_EXPORT_ROWS);

    // --- 4. Build CSV ---
    const header = toCsvRow([...CSV_COLUMNS]);
    const body = filtered.map((r) =>
      toCsvRow([
        r.application_number,
        r.surface,
        r.student_name,
        r.student_email,
        r.student_phone,
        r.nationality,
        r.date_of_birth,
        r.gender,
        r.university,
        r.program,
        r.degree,
        r.intake,
        r.status,
        r.decision,
        r.priority,
        r.source,
        r.submitted_at,
        r.created_at,
        r.updated_at,
        r.notes,
      ]),
    );

    // Prepend BOM so Excel opens UTF-8 properly (otherwise the
    // Chinese name column shows mojibake on Windows).
    const csv = '\uFEFF' + [header, ...body].join('\r\n');
    const today = new Date().toISOString().slice(0, 10);
    const filename = `sica-applications-${today}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
        'X-Row-Count': String(filtered.length),
        'X-Max-Rows': String(MAX_EXPORT_ROWS),
        'X-Truncated': truncated ? 'true' : 'false',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/applications/export] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

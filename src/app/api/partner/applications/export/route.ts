import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, getServerEnv } from '@/lib/supabase-auth';
import {
  mapPartnerApplicationFromDb,
  parsePartnerApplicationStatus,
} from '@/lib/partner-application-mapper';

/**
 * GET /api/partner/applications/export
 *
 * Returns the partner's filtered applications as a CSV download.
 * Mirrors the same query semantics as GET /api/partner/applications
 * (search / status / priority), but ignores pagination — exports are
 * always a single big response. Capped at 1000 rows for safety; if
 * the partner has more, they should narrow the filters.
 *
 * Response: text/csv with a Content-Disposition: attachment header.
 * Filename is auto-generated as sica-partner-applications-YYYY-MM-DD.csv.
 */
const MAX_EXPORT_ROWS = 1000;

// RFC 4180-compliant CSV escape. Quotes any field that contains a
// comma, double-quote, CR, or LF, and doubles any internal quotes.
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

  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = parsePartnerApplicationStatus(searchParams.get('status'));
    const priority = searchParams.get('priority')?.trim() || '';
    const validPriorities = ['Low', 'Normal', 'High', 'Urgent'];

    let query = auth.supabase
      .from('partner_applications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(MAX_EXPORT_ROWS);

    if (auth.role === 'member') {
      query = query.eq('created_by_user_id', auth.user.id);
    }
    if (status) query = query.eq('status', status);
    if (priority && validPriorities.includes(priority)) {
      query = query.eq('priority', priority);
    }
    if (search) {
      const safe = search.replace(/[%_]/g, '\\$&');
      query = query.or(
        `student_name.ilike.%${safe}%,university.ilike.%${safe}%,program.ilike.%${safe}%`,
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error('[partner/applications/export GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Hydrate created_by_email the same way the list endpoint does
    const userIds = Array.from(
      new Set(
        (data || [])
          .map((r) => (r as { created_by_user_id?: string | null }).created_by_user_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const emailMap = new Map<string, string>();
    if (userIds.length) {
      const { buildServiceClient } = await import('@/lib/supabase-auth');
      const { data: usersPage } = await buildServiceClient().auth.admin.listUsers({
        perPage: 200,
      });
      for (const u of usersPage?.users || []) {
        if (userIds.includes(u.id)) emailMap.set(u.id, u.email || '');
      }
    }

    const rows = (data || []).map((r) => {
      const id = (r as { created_by_user_id?: string | null }).created_by_user_id;
      return mapPartnerApplicationFromDb({
        ...(r as Record<string, unknown>),
        created_by_email: id ? emailMap.get(id) || null : null,
      } as Parameters<typeof mapPartnerApplicationFromDb>[0]);
    });

    // Build the CSV. Column order is deliberate: identity first, then
    // the program context, then workflow state, then admin/meta.
    const headers = [
      'Application #',
      'Student Name',
      'Student Email',
      'Student Phone',
      'Nationality',
      'University',
      'Program',
      'Intake',
      'Degree',
      'Status',
      'Priority',
      'Decision',
      'Submitted At',
      'Created At',
      'Updated At',
      'Submitted By',
      'Notes',
    ];

    const lines: string[] = [toCsvRow(headers)];
    for (const a of rows) {
      lines.push(
        toCsvRow([
          a.applicationNumber || '',
          a.studentName,
          a.studentEmail || '',
          a.studentPhone || '',
          a.nationality || '',
          a.university,
          a.program,
          a.intake || '',
          a.degree || '',
          a.status,
          a.priority,
          a.decision,
          a.submittedAt || '',
          a.createdAt,
          a.updatedAt,
          a.createdByEmail || '',
          a.notes || '',
        ]),
      );
    }

    const csv = lines.join('\r\n') + '\r\n';
    // BOM at the start so Excel on Windows opens the file with UTF-8
    // encoding correctly. Harmless for other tools.
    const body = '\ufeff' + csv;
    const filename = `sica-partner-applications-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
        'X-Row-Count': String(rows.length),
        'X-Max-Rows': String(MAX_EXPORT_ROWS),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/applications/export GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

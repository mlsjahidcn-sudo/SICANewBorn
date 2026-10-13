import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const MAX_ROWS = 1000;

/** RFC 4180 field escaping. */
function csvField(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvRow(fields: (string | number | null | undefined)[]): string {
  return fields.map(csvField).join(',');
}

/**
 * Phase 161: CSV export for the admin webinar audience tabs.
 *
 * `?view=` registered (default) — webinar_signups rows
 *            waitlist          — webinar_waitlist rows (webinarId required)
 *            attended          — signups with status Attended/No-Show
 * `?webinarId=` scopes to one webinar (required for waitlist; optional
 *  for the signup views — omitted = all webinars).
 *
 * Mirrors the Phase S33 admin-applications export: RFC 4180, UTF-8
 * BOM for Excel, X-Row-Count / X-Truncated headers, capped at 1000
 * rows, filename sica-webinar-<view>-YYYY-MM-DD.csv.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const view = (searchParams.get('view') ?? 'registered').trim();
  if (!['registered', 'waitlist', 'attended'].includes(view)) {
    return NextResponse.json({ error: 'view must be registered|waitlist|attended' }, { status: 400 });
  }
  const rawWebinarId = searchParams.get('webinarId')?.trim() || null;
  const webinarId =
    rawWebinarId && /^[0-9a-f-]{36}$/i.test(rawWebinarId) ? rawWebinarId : null;
  if (view === 'waitlist' && !webinarId) {
    return NextResponse.json({ error: 'webinarId is required for the waitlist view' }, { status: 400 });
  }

  const header = csvRow([
    'First Name',
    'Last Name',
    'Email',
    'WhatsApp',
    'Country',
    'Program Interests',
    'Status',
    'Source Page',
    'UTM Source',
    'UTM Campaign',
    'Created At',
  ]);
  const lines: string[] = [header];
  let truncated = false;

  if (view === 'waitlist') {
    const { data, error } = await auth.supabase
      .from('webinar_waitlist')
      .select('first_name, last_name, email, whatsapp, country, notes, source_page, utm_source, utm_campaign, created_at')
      .eq('session_id', webinarId as string)
      .order('created_at', { ascending: true })
      .limit(MAX_ROWS);
    if (error) {
      console.error('[GET /api/admin/webinar-signups/export] waitlist query failed:', error);
      return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
    for (const row of data ?? []) {
      lines.push(
        csvRow([
          row.first_name as string,
          row.last_name as string,
          row.email as string,
          (row.whatsapp as string | null) ?? '',
          (row.country as string | null) ?? '',
          'waitlist',
          'Waitlist',
          (row.source_page as string | null) ?? '',
          (row.utm_source as string | null) ?? '',
          (row.utm_campaign as string | null) ?? '',
          row.created_at as string,
        ]),
      );
    }
    truncated = (data ?? []).length >= MAX_ROWS;
  } else {
    let query = auth.supabase
      .from('webinar_signups')
      .select('first_name, last_name, email, whatsapp, country, program_interests, status, source_page, utm_source, utm_campaign, created_at')
      .order('created_at', { ascending: false })
      .limit(MAX_ROWS);
    if (webinarId) query = query.eq('webinar_session_id', webinarId);
    if (view === 'attended') query = query.in('status', ['Attended', 'No-Show']);

    const { data, error } = await query;
    if (error) {
      console.error('[GET /api/admin/webinar-signups/export] signups query failed:', error);
      return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
    for (const row of data ?? []) {
      lines.push(
        csvRow([
          row.first_name as string,
          row.last_name as string,
          row.email as string,
          row.whatsapp as string,
          (row.country as string | null) ?? '',
          ((row.program_interests as string[] | null) ?? []).join('; '),
          row.status as string,
          (row.source_page as string | null) ?? '',
          (row.utm_source as string | null) ?? '',
          (row.utm_campaign as string | null) ?? '',
          row.created_at as string,
        ]),
      );
    }
    truncated = (data ?? []).length >= MAX_ROWS;
  }

  const today = new Date().toISOString().slice(0, 10);
  const body = `\uFEFF${lines.join('\r\n')}\r\n`;
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="sica-webinar-${view}-${today}.csv"`,
      'X-Row-Count': String(lines.length - 1),
      'X-Truncated': truncated ? '1' : '0',
    },
  });
}

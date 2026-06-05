/**
 * Admin: CSV export of leads.
 *
 * GET /api/admin/leads/export?type=contact|chat|assessment|all
 *                                  &status=...&country=...
 *
 * Returns text/csv. Same filters as /api/admin/leads, but always
 * returns ALL matching rows (no limit) since the admin's whole
 * point of CSV is to grab everything.
 *
 * We use the same unified shape as the list endpoint, then format
 * it as a CSV. Headers are pre-defined so the column order is
 * stable for spreadsheet apps.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

type LeadType = 'contact' | 'chat' | 'assessment';

const COLUMNS = [
  'lead_type',
  'name',
  'email',
  'phone',
  'whatsapp',
  'country',
  'program',
  'subject',
  'message',
  'status',
  'notes',
  'assigned_to',
  'contact_attempts',
  'last_contacted_at',
  'source_page',
  'referrer',
  'created_at',
  'updated_at',
] as const;

function tableFor(t: LeadType): string {
  switch (t) {
    case 'contact':
      return 'contact_submissions';
    case 'chat':
      return 'chat_leads';
    case 'assessment':
      return 'student_assessments';
  }
}

function isLeadType(s: string): s is LeadType {
  return s === 'contact' || s === 'chat' || s === 'assessment';
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const typeParam = (searchParams.get('type') || 'all').toLowerCase();
  const type: LeadType | 'all' =
    typeParam === 'contact' || typeParam === 'chat' || typeParam === 'assessment'
      ? (typeParam as LeadType)
      : 'all';
  const status = searchParams.get('status') || '';
  const country = (searchParams.get('country') || '').trim();

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const callTables: LeadType[] = type === 'all' ? ['contact', 'chat', 'assessment'] : [type];

  const tasks = callTables.map(async (t) => {
    const builder = supabase.from(tableFor(t)).select('*');
    if (status) builder.eq('status', status);
    if (country) builder.ilike('country', `%${country}%`);
    const { data, error } = await builder;
    if (error) throw new Error(`[${t}] ${error.message}`);
    return data || [];
  });

  let rows: Array<{ leadType: LeadType; row: Record<string, unknown> }>;
  try {
    const arrays = await Promise.all(tasks);
    rows = [];
    for (let i = 0; i < callTables.length; i++) {
      const t = callTables[i];
      for (const r of arrays[i] as Array<Record<string, unknown>>) {
        rows.push({ leadType: t, row: r });
      }
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Query failed' },
      { status: 500 },
    );
  }

  // Build CSV
  const csvLines: string[] = [];
  csvLines.push(COLUMNS.join(','));
  for (const { leadType, row } of rows) {
    const name = pickString(row, ['name'])
      || [
        pickString(row, ['first_name']),
        pickString(row, ['last_name']),
      ]
        .filter(Boolean)
        .join(' ')
        .trim();
    const program =
      pickString(row, ['interested_program']) ||
      pickString(row, ['interested_degree']) ||
      pickString(row, ['intended_major']);
    const values: Record<string, string> = {
      lead_type: leadType,
      name: name || '',
      email: pickString(row, ['email']) || '',
      phone: pickString(row, ['phone']) || '',
      whatsapp: pickString(row, ['whatsapp']) || '',
      country: pickString(row, ['country']) || '',
      program: program || '',
      subject: pickString(row, ['subject']) || '',
      message: pickString(row, ['message']) || '',
      status: pickString(row, ['status']) || '',
      notes: pickString(row, ['notes']) || '',
      assigned_to: pickString(row, ['assigned_to']) || '',
      contact_attempts: String(pickNumber(row, ['contact_attempts']) || 0),
      last_contacted_at: pickString(row, ['last_contacted_at']) || '',
      source_page: pickString(row, ['source_page']) || '',
      referrer: pickString(row, ['referrer']) || '',
      created_at: pickString(row, ['created_at']) || '',
      updated_at: pickString(row, ['updated_at']) || '',
    };
    csvLines.push(COLUMNS.map((c) => csvEscape(values[c] || '')).join(','));
  }

  const csv = csvLines.join('\n');
  const filename = `sica-leads-${typeParam}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

function pickString(row: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return null;
}

function pickNumber(row: Record<string, unknown>, keys: string[]): number {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'number') return v;
  }
  return 0;
}

function csvEscape(s: string): string {
  if (s == null) return '';
  // Quote if contains comma, quote, newline, or carriage return
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

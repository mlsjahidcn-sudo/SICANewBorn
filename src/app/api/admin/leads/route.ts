/**
 * Admin: unified leads listing across 3 sources.
 *
 * Phase 2.1 lead workflow upgrade — we now capture leads from:
 *   - contact form  → contact_submissions
 *   - chat assistant → chat_leads
 *   - public assessment → student_assessments
 *
 * Previously each had its own admin UI fragment or none at all. This
 * route merges them into one paginated, filterable list. The detail
 * page (PATCH) takes a `?type=...` so the caller can pick the source.
 *
 * Filters (all optional):
 *   ?type=contact|chat|assessment|all  (default all)
 *   ?status=New|In Progress|...        (per-type value list, see below)
 *   ?country=...                       (case-insensitive partial match)
 *   ?assignee=me|unassigned|<uuid>     (defaults to all)
 *   ?from=YYYY-MM-DD&to=YYYY-MM-DD     (created_at range, inclusive)
 *   ?q=...                              (name/email/whatsapp/program search)
 *   ?limit=N&offset=N                   (default 50, max 200)
 *
 * Per-type status values (we don't normalize to one enum yet — would
 * need a migration + admin UI audit):
 *   contact_submissions:  'New' | 'In Progress' | 'Resolved' | 'Spam'
 *   chat_leads:           'New' | 'Contacted' | 'Qualified' | 'Unqualified'
 *   student_assessments:  'Pending' | 'Reviewed' | 'Contacted' | 'Accepted' | 'Rejected'
 *
 * Response shape:
 *   {
 *     leads: UnifiedLead[],
 *     total: number,
 *     counts: { contact: N, chat: N, assessment: N, total: N },
 *     filters: { applied: {...}, options: {...} }
 *   }
 *
 * Each UnifiedLead has:
 *   - lead_type:        one of 'contact' | 'chat' | 'assessment'
 *   - lead_id:          the table row id (same as `id`)
 *   - name, email, phone, whatsapp, country
 *   - program:          interested_program | intended_major | subject
 *   - subject / message
 *   - status, notes, assigned_to, last_contacted_at, contact_attempts
 *   - source_page, referrer
 *   - created_at, updated_at
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

type LeadType = 'contact' | 'chat' | 'assessment';

interface UnifiedLead {
  lead_type: LeadType;
  lead_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  country: string | null;
  program: string | null;
  subject: string | null;
  message: string | null;
  status: string | null;
  notes: string | null;
  assigned_to: string | null;
  last_contacted_at: string | null;
  contact_attempts: number;
  source_page: string | null;
  referrer: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string | null;
}

const MAX_LIMIT = 200;

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
  const assignee = (searchParams.get('assignee') || '').trim();
  const from = (searchParams.get('from') || '').trim();
  const to = (searchParams.get('to') || '').trim();
  const q = (searchParams.get('q') || '').trim();
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, MAX_LIMIT);
  const offset = parseInt(searchParams.get('offset') || '0', 10) || 0;

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Resolve assignee filter to a uuid (or 'unassigned' sentinel).
  // 'me' → caller's id. anything else → trust as uuid.
  let assigneeFilter: string | null | 'me' | 'unassigned' = null;
  if (assignee) {
    if (assignee === 'me') assigneeFilter = 'me';
    else if (assignee === 'unassigned') assigneeFilter = 'unassigned';
    else assigneeFilter = assignee;
  }

  const callTables: LeadType[] =
    type === 'all' ? ['contact', 'chat', 'assessment'] : [type];

  // 3 parallel queries (or 1 if filtered by type)
  const tasks = callTables.map(async (t) => {
    const builder = supabase
      .from(tableFor(t))
      .select('*')
      .order('created_at', { ascending: false });

    if (status) builder.eq('status', status);
    if (country) builder.ilike('country', `%${country}%`);
    if (assigneeFilter === 'unassigned') {
      builder.is('assigned_to', null);
    } else if (assigneeFilter === 'me') {
      builder.eq('assigned_to', auth.user.id);
    } else if (assigneeFilter) {
      builder.eq('assigned_to', assigneeFilter);
    }
    if (from) builder.gte('created_at', `${from}T00:00:00Z`);
    if (to) builder.lte('created_at', `${to}T23:59:59Z`);

    // q is applied post-merge (unified search across 3 fields per row) — skip here
    // to avoid 3 different ILIKE expressions.
    const { data, error } = await builder.range(offset, offset + limit - 1);
    if (error) throw new Error(`[${t}] ${error.message}`);
    return { type: t, rows: data || [] };
  });

  let results: { type: LeadType; rows: unknown[] }[];
  try {
    results = await Promise.all(tasks);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Query failed' },
      { status: 500 },
    );
  }

  // Convert to unified shape
  const all: UnifiedLead[] = [];
  const counts = { contact: 0, chat: 0, assessment: 0, total: 0 };
  for (const { type: t, rows } of results) {
    counts[t] = rows.length;
    for (const r of rows as Array<Record<string, unknown>>) {
      all.push(toUnified(t, r));
    }
  }
  counts.total = all.length;

  // Merge sort by created_at desc
  all.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  // Apply unified text search client-side
  const filtered = q
    ? all.filter((l) => {
        const needle = q.toLowerCase();
        return (
          (l.name && l.name.toLowerCase().includes(needle)) ||
          (l.email && l.email.toLowerCase().includes(needle)) ||
          (l.whatsapp && l.whatsapp.toLowerCase().includes(needle)) ||
          (l.phone && l.phone.toLowerCase().includes(needle)) ||
          (l.program && l.program.toLowerCase().includes(needle)) ||
          (l.subject && l.subject.toLowerCase().includes(needle)) ||
          (l.message && l.message.toLowerCase().includes(needle))
        );
      })
    : all;

  return NextResponse.json({
    leads: filtered,
    total: filtered.length,
    counts,
    filters: { applied: { type, status, country, assignee, from, to, q } },
  });
}

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

function toUnified(type: LeadType, row: Record<string, unknown>): UnifiedLead {
  // Field normalization per lead type
  let name: string | null = null;
  let program: string | null = null;
  let subject: string | null = null;

  if (type === 'contact') {
    name = pickString(row, ['name']);
    program = null; // contact_submissions has no program
    subject = pickString(row, ['subject']);
  } else if (type === 'chat') {
    name = pickString(row, ['name']);
    program = pickString(row, ['interested_program', 'interested_degree']);
  } else {
    // assessment
    const first = pickString(row, ['first_name']) || '';
    const last = pickString(row, ['last_name']) || '';
    name = `${first} ${last}`.trim() || null;
    program = pickString(row, ['intended_major']);
  }

  return {
    lead_type: type,
    lead_id: String(row.id),
    name,
    email: pickString(row, ['email']),
    phone: pickString(row, ['phone']),
    whatsapp: pickString(row, ['whatsapp']),
    country: pickString(row, ['country']),
    program,
    subject,
    message: pickString(row, ['message']),
    status: pickString(row, ['status']),
    notes: pickString(row, ['notes']),
    assigned_to: pickString(row, ['assigned_to']),
    last_contacted_at: pickString(row, ['last_contacted_at']),
    contact_attempts: pickNumber(row, ['contact_attempts']),
    source_page: pickString(row, ['source_page']),
    referrer: pickString(row, ['referrer']),
    resolved_at: pickString(row, ['resolved_at']),
    created_at: pickString(row, ['created_at']) || new Date().toISOString(),
    updated_at: pickString(row, ['updated_at']),
  };
}

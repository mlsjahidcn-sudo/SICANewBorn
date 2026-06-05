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
  // Phase 2.4 — derived lead score (0-100). See scoreLead() for the
  // heuristic. Same row can have a different score in different
  // snapshots; we recompute every request so the latest fields
  // (e.g. contact_attempts going up) reflect.
  score: number;
  score_tier: 'cold' | 'warm' | 'hot';
  score_reasons: string[];
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

  const { score, reasons } = scoreLead(type, row, { program });

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
    score,
    score_tier: scoreToTier(score),
    score_reasons: reasons,
  };
}

// ============================================================================
// Lead scoring (Phase 2.4)
//
// Pure derived score 0-100. We surface three reasons per lead so the
// admin can see WHY a lead is hot (not just that it is). The
// heuristic rewards signal-rich leads — phone/WhatsApp, program
// clarity, transcript upload, multiple target universities,
// engaged chat. It penalizes inactivity (lead sits uncontacted >48h)
// and the closed statuses.
//
// Buckets (returned as score_tier):
//   0-30  cold
//   31-65 warm
//   66-100 hot
// ============================================================================

function scoreToTier(s: number): 'cold' | 'warm' | 'hot' {
  if (s >= 66) return 'hot';
  if (s >= 31) return 'warm';
  return 'cold';
}

function scoreLead(
  type: LeadType,
  row: Record<string, unknown>,
  derived: { program: string | null },
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // -- Contact info (reaches multiple channels = serious) --
  const hasPhone = !!pickString(row, ['phone']);
  const hasWhatsapp = !!pickString(row, ['whatsapp']);
  if (hasPhone && hasWhatsapp) {
    score += 20;
    reasons.push('Phone + WhatsApp provided');
  } else if (hasPhone || hasWhatsapp) {
    score += 12;
    reasons.push(hasPhone ? 'Phone provided' : 'WhatsApp provided');
  }

  // -- Country (geographic signal — they care enough to specify) --
  if (pickString(row, ['country'])) {
    score += 8;
    reasons.push('Country specified');
  }

  // -- Program / major (knows what they want) --
  if (derived.program) {
    score += 12;
    reasons.push('Program / major specified');
  }

  // -- Type-specific signals --
  if (type === 'contact') {
    const msg = pickString(row, ['message']) || '';
    if (msg.length > 200) {
      score += 10;
      reasons.push('Detailed message (>200 chars)');
    } else if (msg.length > 60) {
      score += 5;
    }
  } else if (type === 'chat') {
    // conversation_context is a JSON array of {role, content} msgs
    const ctx = pickString(row, ['conversation_context']);
    if (ctx) {
      try {
        const parsed = JSON.parse(ctx);
        if (Array.isArray(parsed) && parsed.length >= 5) {
          score += 15;
          reasons.push('Engaged in 5+ chat messages');
        } else if (Array.isArray(parsed) && parsed.length >= 2) {
          score += 6;
        }
      } catch {
        // ignore
      }
    }
    if (pickString(row, ['interested_university'])) {
      score += 8;
      reasons.push('Named a target university');
    }
  } else if (type === 'assessment') {
    if (pickString(row, ['has_transcript']) === 'true' || pickString(row, ['transcript_file_name'])) {
      score += 20;
      reasons.push('Transcript uploaded');
    }
    if (pickString(row, ['date_of_birth'])) {
      score += 3; // completed full form
    }
    if (pickString(row, ['current_education'])) {
      score += 5;
      reasons.push('Current education specified');
    }
    const targets = pickString(row, ['target_universities']);
    if (targets) {
      // Could be JSON array or comma-separated
      let count = 0;
      try {
        const parsed = JSON.parse(targets);
        if (Array.isArray(parsed)) count = parsed.length;
      } catch {
        count = targets.split(',').filter((s) => s.trim()).length;
      }
      if (count >= 3) {
        score += 15;
        reasons.push(`${count} target universities`);
      } else if (count >= 1) {
        score += 7;
      }
    }
  }

  // -- Inactivity penalty (open lead, no contact in 48h) --
  const status = pickString(row, ['status']);
  const isClosed =
    status === 'Resolved' ||
    status === 'Spam' ||
    status === 'Qualified' ||
    status === 'Unqualified' ||
    status === 'Accepted' ||
    status === 'Rejected';
  if (!isClosed) {
    const lastContact = pickString(row, ['last_contacted_at']);
    const createdAt = pickString(row, ['created_at']);
    if (createdAt) {
      const ageHours = (Date.now() - new Date(createdAt).getTime()) / 36e5;
      if (ageHours > 168 && !lastContact) {
        score -= 15;
        reasons.push('Stale: >7d old, never contacted');
      } else if (ageHours > 48 && !lastContact) {
        score -= 8;
        reasons.push('Aging: >48h, no contact yet');
      }
    }
    // Open lead with several contact attempts but still 'New' = friction
    const attempts = pickNumber(row, ['contact_attempts']);
    if (attempts >= 3 && status === 'New') {
      score -= 10;
      reasons.push(`${attempts} contact attempts, still New`);
    }
  }

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));
  return { score, reasons };
}

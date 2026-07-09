/**
 * Phase 46: admin bulk-send WhatsApp campaign.
 *
 * POST /api/admin/leads/bulk-send-whatsapp
 * Body:
 *   {
 *     sources: ('contact' | 'chat' | 'assessment')[],
 *     filters: {
 *       country?: string,         // ISO 2-letter (e.g. 'NG')
 *       startDate?: string,       // ISO date, inclusive
 *       endDate?: string,         // ISO date, inclusive
 *       targetIntake?: string,    // assessment-only — matches target_intake
 *     },
 *     templateName: string,        // WABPO template name, e.g. 'sica_scholarship_urgency'
 *     limit?: number,              // safety cap, default 1000
 *   }
 *
 * Response (after all sends complete — may take seconds-to-minutes for
 * large sends):
 *   {
 *     matched: number,            // total leads matching the filter
 *     sent: number,               // successfully fired
 *     skipped: number,            // no phone / do_not_contact / template pending
 *     failed: number,             // WABPO returned an error
 *     results: Array<{
 *       leadType, leadId, leadName, phone,
 *       status: 'sent' | 'skipped' | 'failed',
 *       skipReason?, messageId?, error?,
 *     }>,
 *   }
 *
 * Rate-limited at 5 leads/sec to stay under Meta's throttle. The route
 * is admin-only and `maxDuration` is set to 5 min so up to ~1500 leads
 * fit in one call; larger campaigns should be split.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import { fireAndForget } from '@/lib/wabpo-fire';
import { captureAIError } from '@/lib/ai/with-capture';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const ALLOWED_SOURCES = ['contact', 'chat', 'assessment'] as const;
type Source = (typeof ALLOWED_SOURCES)[number];

interface BulkFilters {
  country?: string;
  startDate?: string;
  endDate?: string;
  targetIntake?: string;
}

interface BulkBody {
  sources?: Source[];
  filters?: BulkFilters;
  templateName?: string;
  limit?: number;
  /**
   * When true, the route returns the matched leads + a 3-lead
   * sample (no sends, no rate limit, no WABPO calls). Used by the
   * admin UI to live-update "N leads match" as filters change.
   */
  dryRun?: boolean;
}

const RATE_LIMIT_PER_SEC = 5;

function isSource(s: string): s is Source {
  return (ALLOWED_SOURCES as readonly string[]).includes(s);
}

/** Sleep helper. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Query one source table with the filter set. Returns an array of
 * `{ leadType, row }` so the caller can fire sends with full context.
 */
async function querySource(
  source: Source,
  filters: BulkFilters,
  limit: number,
): Promise<Array<{ leadType: Source; row: Record<string, unknown> }>> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];

  const table =
    source === 'contact'
      ? 'contact_submissions'
      : source === 'chat'
      ? 'chat_leads'
      : 'student_assessments';

  // Always filter out do_not_contact=true leads. Other filters
  // are ANDed.
  let q = supabase
    .from(table)
    .select('*')
    .eq('do_not_contact', false)
    .limit(limit);

  if (filters.country) {
    q = q.eq('country', filters.country);
  }
  if (filters.startDate) {
    q = q.gte('created_at', filters.startDate);
  }
  if (filters.endDate) {
    q = q.lte('created_at', filters.endDate);
  }
  if (filters.targetIntake && source === 'assessment') {
    q = q.eq('target_intake', filters.targetIntake);
  }

  const { data, error } = await q;
  if (error) {
    console.error(`[bulk-send] query ${table} failed:`, error);
    return [];
  }
  return (data ?? []).map((row) => ({ leadType: source, row: row as Record<string, unknown> }));
}

function pickPhone(row: Record<string, unknown>): string | null {
  const v = row.phone ?? row.whatsapp;
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function pickName(row: Record<string, unknown>): string | null {
  if (typeof row.name === 'string' && row.name.trim()) return row.name;
  const first = typeof row.first_name === 'string' ? row.first_name : '';
  const last = typeof row.last_name === 'string' ? row.last_name : '';
  return [first, last].filter(Boolean).join(' ') || null;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: BulkBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // ---- Validate ----
  if (!body.sources || !Array.isArray(body.sources) || body.sources.length === 0) {
    return NextResponse.json(
      { error: 'sources required: array of "contact" | "chat" | "assessment"' },
      { status: 400 },
    );
  }
  const sources: Source[] = [];
  for (const s of body.sources) {
    if (typeof s !== 'string' || !isSource(s)) {
      return NextResponse.json(
        { error: `invalid source: ${String(s)}` },
        { status: 400 },
      );
    }
    if (!sources.includes(s)) sources.push(s);
  }
  if (!body.templateName || typeof body.templateName !== 'string') {
    return NextResponse.json({ error: 'templateName required' }, { status: 400 });
  }
  const limit = Math.min(body.limit ?? 1000, 5000);
  const filters: BulkFilters = body.filters ?? {};
  const isDryRun = body.dryRun === true;

  // ---- Query all sources in parallel ----
  const queries = await Promise.all(
    sources.map((s) => querySource(s, filters, limit)),
  );
  const matched = queries.flat();

  // ---- Pre-flight: count leads with phone, drop those without ----
  // (fireAndForget also drops them, but skipping here avoids the rate
  // limit slot for leads that have no chance of sending.)
  const recipients = matched
    .map(({ leadType, row }) => ({
      leadType,
      leadId: row.id as string,
      leadRow: row,
      phone: pickPhone(row),
      leadName: pickName(row),
    }))
    .filter((r) => r.leadId);

  const preSkipped = recipients.filter((r) => !r.phone).length;
  const sendable = recipients.filter((r) => r.phone);

  // ---- Dry run: return count + sample, no sends ----
  if (isDryRun) {
    const sample = sendable.slice(0, 3).map((r) => ({
      leadType: r.leadType,
      leadId: r.leadId,
      leadName: r.leadName,
      phone: r.phone,
      country:
        (r.leadRow.country as string | null) ||
        (r.leadRow.nationality as string | null) ||
        null,
    }));
    return NextResponse.json({
      dryRun: true,
      matched: matched.length,
      sendable: sendable.length,
      preSkipped,
      sample,
    });
  }

  // ---- Rate-limited send ----
  // 5 leads/sec = 200ms between sends. Simple sequential loop with
  // sleep — keeps the per-recipient error handling obvious.
  const results: Array<{
    leadType: Source;
    leadId: string;
    leadName: string | null;
    phone: string;
    status: 'sent' | 'skipped' | 'failed';
    skipReason?: string;
    messageId?: string;
    error?: string;
  }> = [];

  for (let i = 0; i < sendable.length; i++) {
    const r = sendable[i];
    // Pace: 1 every (1000 / RATE_LIMIT_PER_SEC) ms
    if (i > 0 && i % RATE_LIMIT_PER_SEC === 0) {
      await sleep(1000);
    }
    try {
      const out = await fireAndForget({
        leadType: r.leadType,
        leadId: r.leadId,
        leadRow: r.leadRow,
        templateName: body.templateName!,
        historyAction: 'whatsapp_promo_sent',
        historyNote: `bulk-send | template=${body.templateName} | filter=${JSON.stringify(filters)}`,
      });
      if (out.ok) {
        results.push({
          leadType: r.leadType,
          leadId: r.leadId,
          leadName: r.leadName,
          phone: r.phone!,
          status: 'sent',
          messageId: out.messageId,
        });
      } else if (out.skipped) {
        results.push({
          leadType: r.leadType,
          leadId: r.leadId,
          leadName: r.leadName,
          phone: r.phone!,
          status: 'skipped',
          skipReason: out.skipReason,
        });
      } else {
        results.push({
          leadType: r.leadType,
          leadId: r.leadId,
          leadName: r.leadName,
          phone: r.phone!,
          status: 'failed',
          error: out.error,
        });
        captureAIError('admin/leads/bulk-send-whatsapp', new Error(out.error), {
          stage: 'fire-failed',
          leadId: r.leadId,
          templateName: body.templateName,
        });
      }
    } catch (err) {
      // fireAndForget is no-throw, but defensive
      const message = err instanceof Error ? err.message : 'unknown';
      results.push({
        leadType: r.leadType,
        leadId: r.leadId,
        leadName: r.leadName,
        phone: r.phone!,
        status: 'failed',
        error: message,
      });
      captureAIError('admin/leads/bulk-send-whatsapp', err, {
        stage: 'fire-throw',
        leadId: r.leadId,
        templateName: body.templateName,
      });
    }
  }

  const sent = results.filter((r) => r.status === 'sent').length;
  const skipped = results.filter((r) => r.status === 'skipped').length + preSkipped;
  const failed = results.filter((r) => r.status === 'failed').length;

  return NextResponse.json({
    matched: matched.length,
    sent,
    skipped,
    failed,
    results,
  });
}

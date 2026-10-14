import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['Registered', 'Attended', 'No-Show', 'Cancelled'] as const;
type WebinarStatus = (typeof VALID_STATUSES)[number];

/**
 * Phase 165e: admin stats endpoint for /admin/webinar-signups.
 *
 * Restored from Phase 143 (which Phase 165 deleted when the
 * webinar system went static). Same shape — 4-card strip
 * (total, today, last7Days, last30Days) + 4 breakdown panels
 * (status / country / interest / source).
 *
 * Mirrors /api/admin/assessments/stats (Phase 126) pattern:
 * parallel `head: true, count: 'exact'` aggregates for the 4
 * cards; client-side group-by JS for the breakdowns (the
 * Supabase JS client doesn't expose rpc-style GROUP BY).
 *
 * Polled every 30s by the admin page. Stats errors are best-effort
 * (the list page keeps working — same swallow-and-render-empty
 * pattern as the Phase 143 widget).
 */
interface WebinarStats {
  total: number;
  today: number;
  last7Days: number;
  last30Days: number;
  byStatus: { status: WebinarStatus; count: number }[];
  byCountry: { label: string; count: number }[];
  byInterest: { label: string; count: number }[];
  bySource: { label: string; count: number }[];
  generatedAt: string;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const EMPTY_STATS: WebinarStats = {
  total: 0,
  today: 0,
  last7Days: 0,
  last30Days: 0,
  byStatus: VALID_STATUSES.map((status) => ({ status, count: 0 })),
  byCountry: [],
  byInterest: [],
  bySource: [],
  generatedAt: new Date().toISOString(),
};

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const now = Date.now();
    const startOfToday = new Date(
      Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate()),
    ).toISOString();
    const sevenDaysAgo = new Date(now - 7 * ONE_DAY_MS).toISOString();
    const thirtyDaysAgo = new Date(now - 30 * ONE_DAY_MS).toISOString();

    // Parallel head-count aggregates for the 4 stat cards. Each
    // query is scoped to the same admin's data (auth.supabase is
    // session-bound + RLS-gated). Errors are swallowed so the
    // breakdowns + list page keep working.
    const [
      totalRes,
      todayRes,
      sevenRes,
      thirtyRes,
      statusRows,
      countryRows,
      interestRows,
      sourceRows,
    ] = await Promise.all([
      auth.supabase.from('webinar_signups').select('id', { count: 'exact', head: true }),
      auth.supabase
        .from('webinar_signups')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfToday),
      auth.supabase
        .from('webinar_signups')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
      auth.supabase
        .from('webinar_signups')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo),
      auth.supabase.from('webinar_signups').select('status'),
      auth.supabase.from('webinar_signups').select('country'),
      auth.supabase.from('webinar_signups').select('program_interests'),
      auth.supabase.from('webinar_signups').select('utm_source'),
    ]);

    return NextResponse.json({
      total: totalRes.count ?? 0,
      today: todayRes.count ?? 0,
      last7Days: sevenRes.count ?? 0,
      last30Days: thirtyRes.count ?? 0,
      byStatus: groupBy(statusRows.data ?? [], (r) => r.status as WebinarStatus | null, VALID_STATUSES),
      byCountry: groupByText(countryRows.data ?? [], 'country'),
      byInterest: groupByTextArray(interestRows.data ?? [], 'program_interests'),
      bySource: groupByText(sourceRows.data ?? [], 'utm_source'),
      generatedAt: new Date().toISOString(),
    } satisfies WebinarStats);
  } catch (err) {
    console.error('[GET /api/admin/webinar-signups/stats] failed:', err);
    return NextResponse.json(EMPTY_STATS);
  }
}

/**
 * Group a flat array of rows by a string field, returning
 * [{ label, count }] sorted descending. Skips null + empty
 * string values. Same helper as Phase 126/143 used for
 * assessments.
 */
function groupByText(
  rows: Array<Record<string, unknown>>,
  field: string,
): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const v = r[field];
    if (typeof v !== 'string' || v.length === 0) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Same as groupByText but for text[] fields (program_interests).
 * Expands each row's array into per-element counts.
 */
function groupByTextArray(
  rows: Array<Record<string, unknown>>,
  field: string,
): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const v = r[field];
    if (!Array.isArray(v)) continue;
    for (const item of v) {
      if (typeof item !== 'string' || item.length === 0) continue;
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Group by a known-enum field (status), returning ALL values
 * even when count is 0 (so the UI pills always show every
 * status, including Cancelled with 0).
 */
function groupBy<K extends string>(
  rows: Array<Record<string, unknown>>,
  pick: (r: Record<string, unknown>) => K | null,
  allKeys: readonly K[],
): { status: K; count: number }[] {
  const counts = new Map<K, number>();
  for (const k of allKeys) counts.set(k, 0);
  for (const r of rows) {
    const k = pick(r);
    if (k !== null) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return allKeys.map((status) => ({ status, count: counts.get(status) ?? 0 }));
}

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['Registered', 'Attended', 'No-Show', 'Cancelled'] as const;
type WebinarStatus = (typeof VALID_STATUSES)[number];

/**
 * Phase 143: admin stats endpoint for /admin/webinar-signups.
 *
 * Mirrors /api/admin/assessments/stats (Phase 126) shape —
 * parallel `head: true, count: 'exact'` aggregates. The
 * Registrations tab polls this every 30s and renders 4 stat
 * cards + 3 breakdown panels (status / country / interest /
 * source).
 *
 * All queries are scoped to the active session (or all
 * sessions — see below) — but the V1 endpoint returns the
 * global signup count since that's the funnel metric the
 * staff cares about at a glance. Per-session scoping is a
 * Phase 144+ follow-up if the user wants it.
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

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Phase 161: optional per-webinar scoping (the admin page's webinar
  // selector). Every aggregate below threads this through.
  const url = new URL(request.url);
  const rawWebinarId = url.searchParams.get('webinarId')?.trim() || null;
  const webinarId =
    rawWebinarId && /^[0-9a-f-]{36}$/i.test(rawWebinarId) ? rawWebinarId : null;

  const now = new Date();
  // Start of "today" in UTC. Same convention as assessments/stats.
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const sevenDaysAgo = new Date(now.getTime() - 7 * ONE_DAY_MS);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * ONE_DAY_MS);

  try {
    // Phase 161 scope factories — each starts a fresh builder and
    // applies the optional webinar filter. `.eq()` returns the same
    // builder type, so the declared return types hold.
    const scopedHead = () => {
      const q = auth.supabase.from('webinar_signups').select('id', { count: 'exact', head: true });
      return webinarId ? q.eq('webinar_session_id', webinarId) : q;
    };
    const scopedCountry = () => {
      const q = auth.supabase.from('webinar_signups').select('country').not('country', 'is', null);
      return webinarId ? q.eq('webinar_session_id', webinarId) : q;
    };
    const scopedSource = () => {
      const q = auth.supabase.from('webinar_signups').select('utm_source').not('utm_source', 'is', null);
      return webinarId ? q.eq('webinar_session_id', webinarId) : q;
    };
    const scopedInterests = () => {
      const q = auth.supabase.from('webinar_signups').select('program_interests');
      return webinarId ? q.eq('webinar_session_id', webinarId) : q;
    };

    // Run the base aggregates in parallel — each is a cheap
    // `head: true, count: 'exact'` query against the indexed
    // created_at column.
    const [totalRes, todayRes, weekRes, monthRes, countryRes, sourceRes] = await Promise.all([
      scopedHead(),
      scopedHead().gte('created_at', startOfToday.toISOString()),
      scopedHead().gte('created_at', sevenDaysAgo.toISOString()),
      scopedHead().gte('created_at', thirtyDaysAgo.toISOString()),
      scopedCountry(),
      scopedSource(),
    ]);

    // byStatus — counts per closed enum value, IN-clause so the
    // server doesn't need to know the open set.
    const statusRows = await Promise.all(
      VALID_STATUSES.map(async (status) => {
        const { count } = await scopedHead().eq('status', status);
        return { status, count: count ?? 0 };
      }),
    );

    // Country aggregation — `.not('country','is',null)` already
    // filtered in the country query, then JS groups + sorts +
    // truncates to top 10 (Postgres GROUP BY would be nicer
    // but Supabase JS client doesn't expose rpc-style GROUP BY
    // directly; this stays cheap since most campaigns have
    // <500 unique countries).
    const countryMap = new Map<string, number>();
    for (const row of countryRes.data ?? []) {
      const c = (row.country as string | null) ?? '';
      if (!c) continue;
      countryMap.set(c, (countryMap.get(c) ?? 0) + 1);
    }
    const byCountry = Array.from(countryMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Source aggregation — same pattern as country.
    const sourceMap = new Map<string, number>();
    for (const row of sourceRes.data ?? []) {
      const s = ((row.utm_source as string | null) ?? '').trim();
      if (!s) continue;
      sourceMap.set(s, (sourceMap.get(s) ?? 0) + 1);
    }
    const bySource = Array.from(sourceMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Interest aggregation — `program_interests` is text[], so
    // we fetch the rows + unnest client-side. Same JS-group
    // pattern.
    const interestsRes = await scopedInterests();
    const interestMap = new Map<string, number>();
    for (const row of interestsRes.data ?? []) {
      const arr = (row.program_interests as string[] | null) ?? [];
      for (const interest of arr) {
        if (!interest) continue;
        interestMap.set(interest, (interestMap.get(interest) ?? 0) + 1);
      }
    }
    const byInterest = Array.from(interestMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      total: totalRes.count ?? 0,
      today: todayRes.count ?? 0,
      last7Days: weekRes.count ?? 0,
      last30Days: monthRes.count ?? 0,
      byStatus: statusRows,
      byCountry,
      byInterest,
      bySource,
      generatedAt: new Date().toISOString(),
    } satisfies WebinarStats);
  } catch (err) {
    console.error('[GET /api/admin/webinar-signups/stats] failed:', err);
    return NextResponse.json({ ...EMPTY_STATS, error: 'Failed to load stats' });
  }
}
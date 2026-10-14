import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['Registered', 'Attended', 'No-Show', 'Cancelled'] as const;
type WebinarStatus = (typeof VALID_STATUSES)[number];

interface FeaturedUniversity {
  id: string;
  name: string;
  nameZh: string;
  slug: string;
  topicCount: number;
}

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
  // Phase 162: the 5 (or fewer) featured universities bound to
  // the active session's university-kind topics, plus their
  // topic counts. Used by the admin's "University spotlight"
  // panel — there is no signup attribution per university
  // (signups don't bind to a university_id), so the panel just
  // surfaces the topic count to confirm coverage.
  featuredUniversities: FeaturedUniversity[];
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
  featuredUniversities: [],
  generatedAt: new Date().toISOString(),
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const now = new Date();
  // Start of "today" in UTC. Same convention as assessments/stats.
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const sevenDaysAgo = new Date(now.getTime() - 7 * ONE_DAY_MS);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * ONE_DAY_MS);

  try {
    // Phase 164: featured universities from the next-upcoming
    // session's university-kind topics, plus their topic counts.
    // Best-effort — non-fatal failures just render an empty
    // `featuredUniversities` panel. We do the lookup inline so
    // TypeScript keeps the auth.ok narrowing (threading the
    // typed supabase client through a helper function would cost
    // us that). Auto-rollover query — earliest future-dated,
    // non-cancelled session.
    const featuredUniversities: FeaturedUniversity[] = await (async () => {
      try {
        const { data: sessionRow, error: sessionErr } = await auth.supabase
          .from('webinar_sessions')
          .select('id')
          .gt('session_date', new Date().toISOString())
          .neq('status', 'Cancelled')
          .order('session_date', { ascending: true })
          .limit(1)
          .maybeSingle();
        if (sessionErr || !sessionRow) return [];
        const sessionId = (sessionRow as { id: string }).id;

        const { data: topicRows, error: topicsErr } = await auth.supabase
          .from('webinar_topics')
          .select(
            'university_id, university:universities!university_id (id, name, name_cn, slug)',
          )
          .eq('session_id', sessionId)
          .not('university_id', 'is', null);
        if (topicsErr) return [];

        const seen = new Map<string, FeaturedUniversity>();
        for (const row of topicRows ?? []) {
          const uid = (row as { university_id: string | null }).university_id;
          if (!uid) continue;
          const existing = seen.get(uid);
          if (existing) {
            existing.topicCount += 1;
            continue;
          }
          // PostgREST embedded relationship shape — `row.university`
          // is either an object or an array (one-to-one joins
          // usually return an object, but the type reflects the FK
          // cardinality).
          const raw = (row as { university: unknown }).university as
            | { name?: string; name_cn?: string; slug?: string; id?: string }
            | { name?: string; name_cn?: string; slug?: string; id?: string }[]
            | null;
          const u = Array.isArray(raw) ? raw[0] : raw;
          if (!u) continue;
          seen.set(uid, {
            id: uid,
            name: (u.name as string) ?? '',
            nameZh: (u.name_cn as string) ?? '',
            slug: (u.slug as string) ?? '',
            topicCount: 1,
          });
        }
        return Array.from(seen.values()).sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      } catch {
        return [];
      }
    })();

    // Run all 9 aggregates in parallel — each is a cheap
    // `head: true, count: 'exact'` query against the indexed
    // created_at column.
    const [totalRes, todayRes, weekRes, monthRes, countryRes, sourceRes] = await Promise.all([
      auth.supabase
        .from('webinar_signups')
        .select('id', { count: 'exact', head: true }),
      auth.supabase
        .from('webinar_signups')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfToday.toISOString()),
      auth.supabase
        .from('webinar_signups')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString()),
      auth.supabase
        .from('webinar_signups')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString()),
      auth.supabase
        .from('webinar_signups')
        .select('country')
        .not('country', 'is', null),
      auth.supabase
        .from('webinar_signups')
        .select('utm_source')
        .not('utm_source', 'is', null),
    ]);

    // byStatus — counts per closed enum value, IN-clause so the
    // server doesn't need to know the open set.
    const statusRows = await Promise.all(
      VALID_STATUSES.map(async (status) => {
        const { count } = await auth.supabase
          .from('webinar_signups')
          .select('id', { count: 'exact', head: true })
          .eq('status', status);
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
    // pattern. Phase 157 removed the max_attendees cap, so the
    // signup count is bounded only by real demand.
    const interestsRes = await auth.supabase
      .from('webinar_signups')
      .select('program_interests');
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
      featuredUniversities,
      generatedAt: new Date().toISOString(),
    } satisfies WebinarStats);
  } catch (err) {
    console.error('[GET /api/admin/webinar-signups/stats] failed:', err);
    return NextResponse.json({ ...EMPTY_STATS, error: 'Failed to load stats' });
  }
}

/**
 * Phase 162: loadFeaturedUniversitiesInline helper removed —
 * the lookup is now inlined inside the try block above so
 * TypeScript keeps the `auth.ok` narrowing. Hoisting the lookup
 * into a helper required either threading a complex generic
 * type through or losing narrowing; the inline IIFE is simpler.
 */
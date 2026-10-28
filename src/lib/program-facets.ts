/**
 * program-facets.ts
 *
 * PF-1: the filter vocabulary + per-option counts for the public
 * program finder, read from the live `programs` table.
 *
 * ## Why this exists
 *
 * The finder used to build its filter options from three hardcoded
 * arrays in `src/lib/data.ts` (`degreeTypes`, `languages`,
 * `programDisciplines`). Those arrays came from a 45-row static seed
 * and had drifted badly from production:
 *
 *   - degree:    6 live values  vs  6 static  → in sync
 *   - language:  4 live values  vs  4 static  → in sync
 *   - discipline: 82 live values vs  8 static → 73 values unreachable
 *     (Dentistry, Nursing, Civil Engineering, AI, Journalism …) and
 *     1,977 of 2,513 rows have `discipline = NULL`.
 *
 * A filter that can only express 8 of 82 real values is not a filter,
 * it is a suggestion. The vocabulary has to come from the data.
 *
 * ## How it reads the table
 *
 * PostgREST caps a response at `max-rows` (1,000 by default on this
 * project) — the sitemap's un-limited `.select('slug, updated_at')`
 * silently truncates at 1,000 program rows today, which is exactly
 * the bug this module is written to avoid. So the read is PAGED in
 * 1,000-row chunks until a short page comes back.
 *
 * Counts are computed in TS rather than with a Postgres `GROUP BY`
 * RPC on purpose:
 *   - no migration / manual DB apply step, so the finder improves the
 *     moment it deploys;
 *   - a missing RPC is exactly the failure mode that took down
 *     `/admin/reports` in Phase 128 (an optional RPC error was
 *     treated as fatal), and this module cannot have that class of
 *     bug because it has no RPC to be missing;
 *   - the result is cached (10 min, in-process) and invalidated
 *     explicitly on admin writes, so the per-request cost is zero
 *     for all but the first visitor.
 */
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { programs as staticPrograms } from '@/lib/data';
import { DURATION_BANDS, TUITION_BANDS } from '@/lib/program-facet-bands';

/** One filter option + how many live programs carry it. */
export interface ProgramFacet {
  /**
   * The raw DB value. Empty string means "not published" (the NULL
   * bucket) — see `PROGRAM_FACET_NONE` for how that travels through
   * the URL.
   */
  value: string;
  count: number;
  /**
   * Chinese label when the catalogue has one for this value. Absent
   * (or empty) means "fall back to the English value" — 337 of the
   * 875 rows that have a discipline have no `discipline_cn`, and some
   * disciplines map to several CN strings, so this is best-effort.
   */
  labelCn?: string;
}

export interface ProgramFacets {
  degree: ProgramFacet[];
  language: ProgramFacet[];
  discipline: ProgramFacet[];
  /** `value` is a university SLUG (join to the name client-side). */
  university: ProgramFacet[];
  /**
   * City facet — the site's biggest missing intent ("study in
   * Beijing/Shanghai"). `value` is the EN city name; the count is the
   * number of programs at the universities in that city.
   */
  city: ProgramFacet[];
  /** Scholarship availability split — drives the toggle's count hint. */
  scholarship: { yes: number; no: number };
  /**
   * PF-2: the normalized facets. `available` is false until
   * `database/2026-10-21_program_facets_normalization.sql` has been
   * applied — the finder hides these controls until then.
   */
  normalized: {
    available: boolean;
    /**
     * The columns exist, but did the BACKFILL actually run? The first
     * version of the migration extracted the regex capture group
     * instead of the whole match, so `tuition_amount` stayed empty and
     * `duration_years` was written wrong. A facet whose band counts
     * are all zero is exactly that symptom, so the control is hidden
     * rather than shown as a filter that can never match anything.
     */
    tuitionAvailable: boolean;
    durationAvailable: boolean;
    /** Intake season: September / March / Both / Unknown. */
    intakeSeason: ProgramFacet[];
    /** Intake year: 2026, 2027, … */
    intakeYear: ProgramFacet[];
    /** Tuition bands (value = the band key). */
    tuition: ProgramFacet[];
    /** Duration bands (value = the band key). */
    duration: ProgramFacet[];
  };
  /** Total number of live programs the counts were computed over. */
  total: number;
  /** Epoch ms when this snapshot was computed. */
  generatedAt: number;
  /** True when the counts came from the static seed, not the DB. */
  fromFallback: boolean;
}

/**
 * Sentinel for the "not published" (NULL) bucket.
 *
 * The URL can not carry an empty value (`useUrlState` deletes empty
 * params), so the NULL bucket needs a non-empty token. `__none__`
 * follows the existing repo convention (`NATIONALITY_NONE`,
 * `NATIONALITY_CUSTOM` in `src/lib/common-countries.ts`).
 */
export const PROGRAM_FACET_NONE = '__none__';

/** PostgREST's default row cap. Read in chunks of this size. */
const PAGE_SIZE = 1000;

/** Facet snapshot lifetime. Admin writes invalidate it explicitly. */
const FACET_CACHE_TTL_MS = 10 * 60 * 1000;

export interface FacetRow {
  degree: string | null;
  language: string | null;
  discipline: string | null;
  discipline_cn: string | null;
  university_slug: string | null;
  scholarship_available: boolean | null;
  // PF-2 (only present once the normalization migration has been applied)
  intake_season?: string | null;
  intake_year?: number | null;
  tuition_amount?: number | null;
  duration_years?: number | null;
}

let cache: { at: number; value: ProgramFacets } | null = null;
let inflight: Promise<ProgramFacets> | null = null;

/**
 * Drop the cached snapshot. Call after any admin write to the
 * programs table so the filter counts follow the catalogue.
 */
export function invalidateProgramFacetsCache(): void {
  cache = null;
  inflight = null;
}

/** Does the `programs` table have the Phase 128a status columns? */
async function hasStatusColumns(): Promise<boolean> {
  if (!isSupabaseServerConfigured() || !supabaseServer) return false;
  try {
    const { error } = await supabaseServer.from('programs').select('is_featured').limit(1);
    return !error;
  } catch {
    return false;
  }
}

/**
 * PF-2: has the normalization migration been applied? Until it has,
 * the intake / tuition / duration facets do not exist and the finder
 * does not offer them.
 */
async function hasNormalizedColumns(): Promise<boolean> {
  if (!isSupabaseServerConfigured() || !supabaseServer) return false;
  try {
    const { error } = await supabaseServer.from('programs').select('tuition_amount').limit(1);
    return !error;
  } catch {
    return false;
  }
}

/** Read every live program row's facet columns, in PostgREST-sized pages. */
async function fetchFacetRows(): Promise<FacetRow[]> {
  const rows: FacetRow[] = [];
  if (!isSupabaseServerConfigured() || !supabaseServer) return rows;

  const [withStatus, withNormalized] = await Promise.all([
    hasStatusColumns(),
    hasNormalizedColumns(),
  ]);
  const columns = [
    'degree',
    'language',
    'discipline',
    'discipline_cn',
    'university_slug',
    'scholarship_available',
    ...(withNormalized
      ? ['intake_season', 'intake_year', 'tuition_amount', 'duration_years']
      : []),
    ...(withStatus ? ['is_published', 'archived_at'] : []),
  ];
  const select = columns.join(', ');

  for (let offset = 0; ; offset += PAGE_SIZE) {
    let query = supabaseServer
      .from('programs')
      .select(select)
      .range(offset, offset + PAGE_SIZE - 1);
    // Match `queryPrograms`'s visibility rule exactly, otherwise the
    // counts would disagree with the result totals.
    if (withStatus) {
      query = query.is('archived_at', null).eq('is_published', true);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) break;
    rows.push(...(data as unknown as FacetRow[]));
    if (data.length < PAGE_SIZE) break;
  }
  return rows;
}

/**
 * Count a column into a facet list, sorted by count desc then value asc.
 *
 * `pickCn` (optional) supplies the Chinese label for a value. A value
 * can map to several CN strings in the catalogue (e.g. "Engineering" →
 * NULL and "工程学"), so the most frequent non-empty one wins.
 */
export function countFacetValues(
  rows: FacetRow[],
  pick: (r: FacetRow) => string | null,
  pickCn?: (r: FacetRow) => string | null,
): ProgramFacet[] {
  const counts = new Map<string, number>();
  const cnTally = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const raw = pick(row);
    // NULL / '' both land in the "not published" bucket.
    const value = raw && raw.trim() ? raw.trim() : '';
    counts.set(value, (counts.get(value) ?? 0) + 1);
    if (pickCn) {
      const cn = pickCn(row);
      if (cn && cn.trim()) {
        const tally = cnTally.get(value) ?? new Map<string, number>();
        tally.set(cn.trim(), (tally.get(cn.trim()) ?? 0) + 1);
        cnTally.set(value, tally);
      }
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => {
      const tally = cnTally.get(value);
      let labelCn: string | undefined;
      if (tally && tally.size > 0) {
        labelCn = [...tally.entries()].sort((a, b) => b[1] - a[1])[0][0];
      }
      return { value, count, ...(labelCn ? { labelCn } : {}) };
    })
    // The "not published" bucket always sorts last — it is a fallback,
    // not a discipline a student would pick on purpose.
    .sort(
      (a, b) =>
        (a.value === '' ? 1 : 0) - (b.value === '' ? 1 : 0) ||
        b.count - a.count ||
        a.value.localeCompare(b.value),
    );
}

/** Facets derived from the static seed (offline / no-DB fallback). */
function staticFacets(): ProgramFacets {
  const rows: FacetRow[] = staticPrograms.map((p) => ({
    degree: p.degree ?? null,
    language: p.language ?? null,
    discipline: p.discipline ?? null,
    discipline_cn: p.disciplineCn ?? null,
    university_slug: p.universitySlug ?? null,
    scholarship_available: p.scholarshipAvailable ?? null,
  }));
  return {
    degree: countFacetValues(rows, (r) => r.degree),
    language: countFacetValues(rows, (r) => r.language),
    discipline: countFacetValues(rows, (r) => r.discipline, (r) => r.discipline_cn),
    university: countFacetValues(rows, (r) => r.university_slug),
    city: [],
    scholarship: scholarshipSplit(rows),
    normalized: normalizedFacets(rows),
    total: rows.length,
    generatedAt: Date.now(),
    fromFallback: true,
  };
}

/**
 * PF-4b: the city facet.
 *
 * `programs` has no city column — a program inherits its university's
 * city. So the count for a city is the sum of the program counts of
 * the universities in it, which we already have from the university
 * facet. The universities table (152 rows) supplies the city mapping.
 */
async function cityFacets(universityCounts: ProgramFacet[]): Promise<ProgramFacet[]> {
  if (!isSupabaseServerConfigured() || !supabaseServer) return [];
  try {
    const { data, error } = await supabaseServer
      .from('universities')
      .select('slug, city, city_cn')
      .not('city', 'is', null);
    if (error || !data || data.length === 0) return [];

    const counts = new Map<string, number>();
    const labels = new Map<string, Map<string, number>>();
    const bySlug = new Map(universityCounts.map((f) => [f.value, f.count]));
    for (const u of data as { slug: string; city: string | null; city_cn: string | null }[]) {
      const city = (u.city ?? '').trim();
      if (!city) continue;
      const n = bySlug.get(u.slug) ?? 0;
      counts.set(city, (counts.get(city) ?? 0) + n);
      const cn = (u.city_cn ?? '').trim();
      if (cn) {
        const tally = labels.get(city) ?? new Map<string, number>();
        tally.set(cn, (tally.get(cn) ?? 0) + 1);
        labels.set(city, tally);
      }
    }
    return [...counts.entries()]
      .map(([value, count]) => {
        const tally = labels.get(value);
        const labelCn = tally && tally.size > 0
          ? [...tally.entries()].sort((a, b) => b[1] - a[1])[0][0]
          : undefined;
        return { value, count, ...(labelCn ? { labelCn } : {}) };
      })
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  } catch {
    return [];
  }
}
function scholarshipSplit(rows: FacetRow[]): { yes: number; no: number } {
  let yes = 0;
  for (const row of rows) if (row.scholarship_available) yes += 1;
  return { yes, no: rows.length - yes };
}

/** Count how many rows fall into each numeric band. */
function countBands(
  rows: FacetRow[],
  pick: (r: FacetRow) => number | null | undefined,
  bands: readonly { value: string; min: number | null; max: number | null }[],
): ProgramFacet[] {
  return bands.map((band) => {
    let count = 0;
    for (const row of rows) {
      const v = pick(row);
      if (v == null) continue;
      if (band.min !== null && v < band.min) continue;
      if (band.max !== null && v > band.max) continue;
      count += 1;
    }
    return { value: band.value, count };
  });
}

/** The PF-2 normalized facets, or the "not available" shape. */
function normalizedFacets(rows: FacetRow[]): ProgramFacets['normalized'] {
  const available = rows.some((r) => r.tuition_amount !== undefined);
  if (!available) {
    return {
      available: false,
      tuitionAvailable: false,
      durationAvailable: false,
      intakeSeason: [],
      intakeYear: [],
      tuition: [],
      duration: [],
    };
  }
  const tuition = countBands(rows, (r) => r.tuition_amount, TUITION_BANDS);
  const duration = countBands(rows, (r) => r.duration_years, DURATION_BANDS);
  const tuitionAvailable = tuition.some((f) => f.count > 0);
  return {
    available: true,
    // A facet with no rows in any band means the backfill did not run
    // (or ran wrong) — do not offer a filter that can never match.
    tuitionAvailable,
    // The tuition + duration backfills come from the SAME statement
    // block, and the broken first version wrote a wrong duration for
    // the rows it did touch (0.5 for "2.5 years"). So the duration
    // facet waits for the tuition one: when the tuition backfill has
    // produced nothing, the duration values cannot be trusted either.
    durationAvailable: tuitionAvailable && duration.some((f) => f.count > 0),
    intakeSeason: countFacetValues(rows, (r) => r.intake_season ?? null),
    intakeYear: countFacetValues(rows, (r) =>
      r.intake_year == null ? null : String(r.intake_year),
    ),
    tuition,
    duration,
  };
}

function asFacetList(raw: unknown): ProgramFacet[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const value = typeof row.value === 'string' ? row.value : '';
      const count = typeof row.count === 'number' ? row.count : Number(row.count) || 0;
      const labelCn = typeof row.labelCn === 'string' ? row.labelCn : undefined;
      return { value, count, ...(labelCn ? { labelCn } : {}) };
    })
    .filter((f): f is ProgramFacet => f != null);
}

/** Prefer the SQL aggregate RPC; fall back to paged PostgREST scan. */
async function fetchFacetsFromRpc(): Promise<ProgramFacets | null> {
  if (!isSupabaseServerConfigured() || !supabaseServer) return null;
  const { data, error } = await supabaseServer.rpc('program_facets_aggregate_v1');
  if (error || !data || typeof data !== 'object') return null;
  const raw = data as Record<string, unknown>;
  const normalizedRaw =
    raw.normalized && typeof raw.normalized === 'object'
      ? (raw.normalized as Record<string, unknown>)
      : null;
  const scholarshipRaw =
    raw.scholarship && typeof raw.scholarship === 'object'
      ? (raw.scholarship as Record<string, unknown>)
      : { yes: 0, no: 0 };
  const tuition = asFacetList(normalizedRaw?.tuition);
  const duration = asFacetList(normalizedRaw?.duration);
  const tuitionAvailable = Boolean(normalizedRaw?.tuitionAvailable) && tuition.some((f) => f.count > 0);
  return {
    degree: asFacetList(raw.degree),
    language: asFacetList(raw.language),
    discipline: asFacetList(raw.discipline),
    university: asFacetList(raw.university),
    city: asFacetList(raw.city),
    scholarship: {
      yes: Number(scholarshipRaw.yes) || 0,
      no: Number(scholarshipRaw.no) || 0,
    },
    normalized: {
      available: Boolean(normalizedRaw?.available),
      tuitionAvailable,
      durationAvailable:
        tuitionAvailable && Boolean(normalizedRaw?.durationAvailable) && duration.some((f) => f.count > 0),
      intakeSeason: asFacetList(normalizedRaw?.intakeSeason),
      intakeYear: asFacetList(normalizedRaw?.intakeYear),
      tuition,
      duration,
    },
    total: Number(raw.total) || 0,
    generatedAt: Date.now(),
    fromFallback: false,
  };
}

/**
 * The live facet snapshot. Cached for 10 minutes; call
 * `invalidateProgramFacetsCache()` after an admin write.
 */
export async function getProgramFacets(): Promise<ProgramFacets> {
  const now = Date.now();
  if (cache && now - cache.at < FACET_CACHE_TTL_MS) return cache.value;
  if (inflight) return inflight;

  inflight = (async () => {
    let value: ProgramFacets;
    try {
      const fromRpc = await fetchFacetsFromRpc();
      if (fromRpc && fromRpc.total > 0) {
        value = fromRpc;
      } else {
        const rows = await fetchFacetRows();
        if (rows.length > 0) {
          const university = countFacetValues(rows, (r) => r.university_slug);
          value = {
            degree: countFacetValues(rows, (r) => r.degree),
            language: countFacetValues(rows, (r) => r.language),
            discipline: countFacetValues(rows, (r) => r.discipline, (r) => r.discipline_cn),
            university,
            city: await cityFacets(university),
            scholarship: scholarshipSplit(rows),
            normalized: normalizedFacets(rows),
            total: rows.length,
            generatedAt: Date.now(),
            fromFallback: false,
          };
        } else {
          value = staticFacets();
        }
      }
    } catch {
      value = staticFacets();
    }
    cache = { at: Date.now(), value };
    inflight = null;
    return value;
  })();

  return inflight;
}

/**
 * Look up one facet option's count. Returns 0 for an unknown value so
 * a stale URL param can not crash a render.
 */
export function facetCount(facets: ProgramFacet[], value: string | null | undefined): number {
  if (!value) return 0;
  const needle = value === PROGRAM_FACET_NONE ? '' : value;
  return facets.find((f) => f.value === needle)?.count ?? 0;
}

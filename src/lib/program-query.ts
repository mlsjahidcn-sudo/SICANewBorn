/**
 * program-query.ts
 *
 * Phase 173: the single implementation of "which programs match these
 * filters".
 *
 * ## Why this exists
 *
 * Before Phase 173 the public `/programs` page filtered entirely in the
 * browser (a `useMemo` over the whole catalogue) while
 * `/api/programs` independently implemented the same filters
 * server-side. They had already drifted — the client also searched
 * `description`, and `sort=default` existed only on the client. Every
 * filter fix therefore had to be written twice, and the two silently
 * disagreed.
 *
 * This module is the one place both callers go through:
 *
 *   - `src/app/api/programs/route.ts`  → thin HTTP adapter
 *   - `src/app/programs/page.tsx`      → RSC first paint (also HTTP-free)
 *
 * It preserves the existing fallback contract exactly: DB first, static
 * seed only when the DB is unconfigured/empty AND no filters were
 * applied (Track 1.3 U3 #1 — a filter matching nothing must return `[]`,
 * never silently fall back to the unfiltered list).
 */
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { programs as staticPrograms, universities as staticUniversities } from '@/lib/data';
import { sanitizeOrTerm, parseIntParam } from '@/lib/postgrest';
import { mapProgramFromDb } from '@/lib/catalog-mappers';
import {
  UNIVERSITY_SLUG_MATCH_CAP,
  buildProgramsSearchOr,
  matchUniversitySlugs,
  programMatchesSearch,
  rankByRelevance,
} from '@/lib/program-search';
import { PROGRAM_FACET_NONE } from '@/lib/program-facets';
import { DURATION_BANDS, TUITION_BANDS, findBand } from '@/lib/program-facet-bands';
import type { Program } from '@/lib/data';

export interface ProgramQueryParams {
  degree?: string | null;
  language?: string | null;
  discipline?: string | null;
  /** University SLUG (exact match), not a name. */
  university?: string | null;
  /**
   * PF-4b: city name. `programs` has no city column — a program
   * inherits its university's — so the city is resolved to university
   * slugs first and then filtered with `in.()`.
   */
  city?: string | null;
  search?: string | null;
  sort?: string | null;
  /**
   * Only programs offering scholarships. The public page had this as a
   * client-side filter only, which silently fought server-side paging —
   * a "scholarship only" page 3 could show a different set each time.
   * Phase 173 moves it server-side so it composes with pagination.
   */
  scholarshipOnly?: boolean;
  featured?: boolean;
  includeArchived?: boolean;
  onlyArchived?: boolean;
  page?: number | null;
  limit?: number | null;
  /**
   * PF-2: the normalized facets. These only exist after
   * `database/2026-10-21_program_facets_normalization.sql` has been
   * applied; the code probes for the columns and skips these filters
   * (and the finder hides the controls) until they do.
   */
  intakeSeason?: string | null;
  intakeYear?: number | null;
  tuitionMin?: number | null;
  tuitionMax?: number | null;
  durationMin?: number | null;
  durationMax?: number | null;
}

export interface ProgramQueryResult {
  programs: Program[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  /** Universities matched by `search` — empty when none did. */
  matchedUniversitySlugs: string[];
}

export const DEFAULT_PROGRAM_PAGE_SIZE = 24;

/**
 * How many matching rows the `relevance` sort ranks in TS before
 * slicing the page. PostgREST caps a response at 1,000 rows, so this
 * is also the largest candidate window we can pull in one round trip.
 * A term matching more than this many programs falls back to the
 * database's name order for the rows beyond the window.
 */
const RELEVANCE_CANDIDATE_CAP = 1000;

/**
 * Probe for the Phase 128a status columns (`is_featured`,
 * `is_published`, `archived_at`, `featured_rank`). Memoized per process
 * so the whole route stays deploy-safe BEFORE the user runs
 * `database/2026-09-26_programs_status.sql` manually: until the columns
 * exist every status filter is skipped and behaviour matches pre-128a.
 */
let statusColumnsCheck: Promise<boolean> | null = null;
export function hasProgramsStatusColumns(): Promise<boolean> {
  if (statusColumnsCheck) return statusColumnsCheck;
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    statusColumnsCheck = Promise.resolve(false);
    return statusColumnsCheck;
  }
  statusColumnsCheck = (async () => {
    try {
      const { error } = await supabaseServer.from('programs').select('is_featured').limit(1);
      return !error;
    } catch {
      return false;
    }
  })();
  return statusColumnsCheck;
}

/**
 * PF-2: has `database/2026-10-21_program_facets_normalization.sql` been
 * applied? Until it has, the intake / tuition / duration facets and
 * filters are simply absent — the finder degrades to the filters it
 * always had, and the new controls are not rendered.
 */
let normalizedFacetColumnsCheck: Promise<boolean> | null = null;
export function hasProgramsNormalizedFacetColumns(): Promise<boolean> {
  if (normalizedFacetColumnsCheck) return normalizedFacetColumnsCheck;
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    normalizedFacetColumnsCheck = Promise.resolve(false);
    return normalizedFacetColumnsCheck;
  }
  normalizedFacetColumnsCheck = (async () => {
    try {
      const { error } = await supabaseServer.from('programs').select('tuition_amount').limit(1);
      return !error;
    } catch {
      return false;
    }
  })();
  return normalizedFacetColumnsCheck;
}

/**
 * Memo for university-slug resolution. The public page debounces search
 * at 250ms, so without this every keystroke re-scans the universities
 * table. Size-guarded so random-term crawling can't grow it unbounded.
 */
const uniSlugMemo = new Map<string, string[]>();
const UNI_SLUG_MEMO_MAX = 100;

async function resolveUniversitySlugs(term: string): Promise<string[]> {
  if (!term) return [];
  const memoized = uniSlugMemo.get(term);
  if (memoized) return memoized;

  let slugs: string[] = [];
  if (isSupabaseServerConfigured() && supabaseServer) {
    try {
      const { data, error } = await supabaseServer
        .from('universities')
        .select('slug')
        .or(`name.ilike.%${term}%,name_cn.ilike.%${term}%`)
        .order('slug', { ascending: true })
        .limit(UNIVERSITY_SLUG_MATCH_CAP);
      if (!error && data) {
        slugs = data.map((r) => String((r as { slug?: unknown }).slug ?? '')).filter(Boolean);
      }
    } catch {
      // Non-fatal: a failed resolution degrades this query to name-only
      // search, which is the pre-Phase-173 behaviour.
      slugs = [];
    }
  }

  if (uniSlugMemo.size >= UNI_SLUG_MEMO_MAX) uniSlugMemo.clear();
  uniSlugMemo.set(term, slugs);
  return slugs;
}

/**
 * PF-4b: resolve a city to the slugs of the universities in it.
 *
 * Same two-step shape as the university-name search: `programs` has no
 * city column and no FK to universities, so the city is resolved to
 * slugs first and then applied with `in.()`.
 */
async function resolveCitySlugs(city: string): Promise<string[]> {
  if (!city) return [];
  if (!isSupabaseServerConfigured() || !supabaseServer) return [];
  try {
    const { data, error } = await supabaseServer
      .from('universities')
      .select('slug')
      .eq('city', city)
      .limit(UNIVERSITY_SLUG_MATCH_CAP);
    if (error || !data) return [];
    return data.map((r) => String((r as { slug?: unknown }).slug ?? '')).filter(Boolean);
  } catch {
    return [];
  }
}

/** Parse `URLSearchParams` into `ProgramQueryParams`. Shared by the API
 *  route and the RSC page so both derive params identically.
 *
 *  Language/discipline accept BOTH the long API param names
 *  (`language` / `discipline`) and the short public-page aliases
 *  (`lang` / `disc`). The aliases matter: programs-client.tsx binds those
 *  to the URL via `useUrlState`, so a *shared or reloaded* link carries
 *  `?lang=…&disc=…`. Reading only the long names meant the RSC rendered
 *  page 1 unfiltered while the URL said otherwise — and because the
 *  client deliberately skips its mount fetch, nothing corrected it. */
export function parseProgramQueryParams(sp: URLSearchParams): Required<
  Pick<ProgramQueryParams, 'degree' | 'language' | 'discipline' | 'university' | 'search' | 'sort'>
> &
  ProgramQueryParams & {
    featured: boolean;
    includeArchived: boolean;
    onlyArchived: boolean;
  } {
  return {
    degree: sp.get('degree'),
    language: sp.get('language') ?? sp.get('lang'),
    discipline: sp.get('discipline') ?? sp.get('disc'),
    university: sp.get('university') ?? sp.get('uni'),
    city: sp.get('city'),
    search: sp.get('search') ?? sp.get('q'),
    // PF-3: `sort=default` is now a REAL ordering (featured programs
    // first, then name) instead of silently meaning "name". A missing
    // sort param therefore resolves to `default` — the best default
    // for a catalogue listing. `sort=name` stays available for a
    // strictly alphabetical view.
    sort: sp.get('sort') || 'default',
    scholarshipOnly: sp.get('scholarship') === '1',
    featured: sp.get('featured') === 'true',
    includeArchived: sp.get('include_archived') === 'true',
    onlyArchived: sp.get('only_archived') === 'true',
    page: parseIntParam(sp.get('page'), 1, { min: 1 }),
    limit: parseIntParam(sp.get('limit'), DEFAULT_PROGRAM_PAGE_SIZE, { min: 1, max: 500 }),
    // PF-2: the normalized facets. `intake` is the season
    // (September / March / Both / Unknown). The tuition + duration
    // travel as a BAND KEY (`tuition=0-20000`) — the same value the
    // client puts in the URL — and are mapped to numeric bounds here,
    // so the server and the client can not disagree about a band.
    // The raw `tuition_min` / `tuition_max` params are still accepted
    // for programmatic callers.
    intakeSeason: sp.get('intake'),
    intakeYear: parseIntParam(sp.get('year'), 0, { min: 0, max: 2100 }) || null,
    tuitionMin:
      findBand(TUITION_BANDS, sp.get('tuition'))?.min ??
      (parseIntParam(sp.get('tuition_min'), 0, { min: 0 }) || null),
    tuitionMax:
      findBand(TUITION_BANDS, sp.get('tuition'))?.max ??
      (parseIntParam(sp.get('tuition_max'), 0, { min: 0 }) || null),
    durationMin:
      findBand(DURATION_BANDS, sp.get('duration'))?.min ??
      (parseIntParam(sp.get('duration_min'), 0, { min: 0 }) || null),
    durationMax:
      findBand(DURATION_BANDS, sp.get('duration'))?.max ??
      (parseIntParam(sp.get('duration_max'), 0, { min: 0 }) || null),
  };
}

/**
 * Run the programs query. DB first; static fallback only when the DB has
 * nothing AND no filters were applied.
 */
/**
 * PF-8: an in-process memo for the result set.
 *
 * The finder page is dynamic (it reads `searchParams`), so every
 * request used to hit Supabase. A 5-minute memo keyed by the filter
 * combination removes that repeat cost; each admin write invalidates
 * it explicitly, so an edit lands immediately rather than waiting out
 * the TTL.
 *
 * An in-process map (not `unstable_cache`) on purpose: the module is
 * imported by the API route, the RSC page AND the unit tests, and
 * `unstable_cache` needs a Next request context — it throws outside
 * one. The same pattern as the facet snapshot in program-facets.ts.
 */
const queryCache = new Map<string, { at: number; value: ProgramQueryResult }>();
const QUERY_CACHE_TTL_MS = 5 * 60 * 1000;
const QUERY_CACHE_MAX = 200;

/** Drop the memoized result sets (called by the admin write paths). */
export function invalidateProgramQueryCache(): void {
  queryCache.clear();
}

export async function queryPrograms(params: ProgramQueryParams): Promise<ProgramQueryResult> {
  // PF-8: memoize the DB path per filter combination.
  const cacheKey = JSON.stringify([
    params.degree ?? null,
    params.language ?? null,
    params.discipline ?? null,
    params.university ?? null,
    params.city ?? null,
    params.search ?? null,
    params.sort ?? null,
    params.scholarshipOnly ?? false,
    params.featured ?? false,
    params.includeArchived ?? false,
    params.onlyArchived ?? false,
    params.intakeSeason ?? null,
    params.intakeYear ?? null,
    params.tuitionMin ?? null,
    params.tuitionMax ?? null,
    params.durationMin ?? null,
    params.durationMax ?? null,
    params.page ?? 1,
    params.limit ?? DEFAULT_PROGRAM_PAGE_SIZE,
  ]);
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.at < QUERY_CACHE_TTL_MS) {
    return cached.value;
  }

  const result = await runQueryPrograms(params);
  if (queryCache.size >= QUERY_CACHE_MAX) queryCache.clear();
  queryCache.set(cacheKey, { at: Date.now(), value: result });
  return result;
}

async function runQueryPrograms(params: ProgramQueryParams): Promise<ProgramQueryResult> {
  const degree = params.degree ?? null;
  const language = params.language ?? null;
  const discipline = params.discipline ?? null;
  const universitySlug = params.university ?? null;
  const city = params.city ?? null;
  const scholarshipOnly = params.scholarshipOnly ?? false;
  const sort = params.sort || 'name';
  const featured = params.featured ?? false;
  const includeArchived = params.includeArchived ?? false;
  const onlyArchived = params.onlyArchived ?? false;
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(500, Math.max(1, params.limit ?? DEFAULT_PROGRAM_PAGE_SIZE));

  const term = params.search ? sanitizeOrTerm(params.search) : '';

  // PF-2: are the normalized facets being filtered on?
  const normalizedFilterRequested =
    !!params.intakeSeason ||
    !!params.intakeYear ||
    params.tuitionMin != null ||
    params.tuitionMax != null ||
    params.durationMin != null ||
    params.durationMax != null;

  if (isSupabaseServerConfigured() && supabaseServer) {
    let query = supabaseServer.from('programs').select('*', { count: 'exact' });
    const hasStatus = await hasProgramsStatusColumns();

    if (degree) {
      query =
        degree === PROGRAM_FACET_NONE
          ? query.is('degree', null)
          : query.eq('degree', degree);
    }
    if (language) {
      query =
        language === PROGRAM_FACET_NONE
          ? query.is('language', null)
          : language === 'To be confirmed'
            ? query.or('language.is.null,language.eq.,language.eq.To be confirmed')
            : query.eq('language', language);
    }
    if (discipline) {
      query =
        discipline === PROGRAM_FACET_NONE
          ? query.is('discipline', null)
          : query.eq('discipline', discipline);
    }
    if (universitySlug) query = query.eq('university_slug', universitySlug);
    if (city) {
      const citySlugs = await resolveCitySlugs(city);
      // A city with no universities in the catalogue matches nothing —
      // returning the unfiltered list would be a lie.
      if (citySlugs.length === 0) {
        return { programs: [], total: 0, page, limit, totalPages: 0, matchedUniversitySlugs: [] };
      }
      query = query.in('university_slug', citySlugs);
    }
    if (scholarshipOnly) query = query.eq('scholarship_available', true);

    // PF-2: the normalized facets. Only applied when the columns exist
    // (the migration has been applied) — otherwise the finder behaves
    // exactly as it did before PF-2.
    const hasNormalized = await hasProgramsNormalizedFacetColumns();
    if (normalizedFilterRequested && !hasNormalized) {
      // The filter was asked for but the derived columns do not exist
      // yet (migration not applied). Ignoring it would return rows the
      // user explicitly filtered out — return nothing instead.
      return { programs: [], total: 0, page, limit, totalPages: 0, matchedUniversitySlugs: [] };
    }
    if (hasNormalized) {
      const season = params.intakeSeason ?? null;
      if (season) {
        if (season === 'September') {
          query = query.in('intake_season', ['September', 'Both']);
        } else if (season === 'March') {
          query = query.in('intake_season', ['March', 'Both']);
        } else {
          query = query.eq('intake_season', season);
        }
      }
      const intakeYear = params.intakeYear ?? null;
      if (intakeYear) query = query.eq('intake_year', intakeYear);
      const tuitionMin = params.tuitionMin ?? null;
      if (tuitionMin !== null) query = query.gte('tuition_amount', tuitionMin);
      const tuitionMax = params.tuitionMax ?? null;
      if (tuitionMax !== null) query = query.lte('tuition_amount', tuitionMax);
      const durationMin = params.durationMin ?? null;
      if (durationMin !== null) query = query.gte('duration_years', durationMin);
      const durationMax = params.durationMax ?? null;
      if (durationMax !== null) query = query.lte('duration_years', durationMax);
    }

    if (hasStatus) {
      if (onlyArchived) {
        query = query.not('archived_at', 'is', null);
      } else if (includeArchived) {
        // explicit no-op — show every row including archived
      } else {
        query = query.is('archived_at', null);
        if (!featured) query = query.eq('is_published', true);
      }
      if (featured) query = query.eq('is_featured', true);
    }

    // Phase 73: university slugs are resolved first and folded into the
    // SAME .or() group as the name matches, so "Tsinghua" finds programs
    // by the school they belong to. See src/lib/program-search.ts.
    const uniSlugs = term ? await resolveUniversitySlugs(term) : [];
    if (term) query = query.or(buildProgramsSearchOr(term, uniSlugs));

    // PF-3: `relevance` ranks in TS over a bounded candidate window, so
    // it needs the whole candidate set before slicing the page. Every
    // other sort is done by the database.
    const relevance = sort === 'relevance' && !!term;

    if (sort === 'tuition') {
      if (hasNormalized) {
        // PF-2: sort on the numeric column, not on a string→int parse
        // of free text. NULLs (no published fee) sort last.
        query = query.order('tuition_amount', { ascending: true, nullsFirst: false });
        query = query.order('name', { ascending: true });
      } else {
        query = query.order('tuition', { ascending: true });
      }
    } else if (sort === 'intake' && hasNormalized) {
      query = query.order('intake_year', { ascending: false, nullsFirst: false });
      query = query.order('name', { ascending: true });
    } else if (sort === 'featured_rank' && hasStatus) {
      query = query.order('featured_rank', { ascending: true, nullsFirst: false });
      query = query.order('name', { ascending: true });
    } else if (sort === 'default' && hasStatus) {
      // "Default" = featured programs first, then alphabetical. Before
      // PF-3 this option silently meant "name", so the control lied.
      query = query.order('is_featured', { ascending: false });
      query = query.order('featured_rank', { ascending: true, nullsFirst: false });
      query = query.order('name', { ascending: true });
    } else {
      query = query.order('name', { ascending: true });
    }

    const from = (page - 1) * limit;

    if (relevance) {
      const { data, count, error } = await query.range(0, RELEVANCE_CANDIDATE_CAP - 1);
      if (!error && data) {
        const mapped = data.map((r) => mapProgramFromDb(r) as unknown as Program);
        const ranked = rankByRelevance(mapped, term, uniSlugs);
        return {
          programs: ranked.slice(from, from + limit),
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
          matchedUniversitySlugs: uniSlugs,
        };
      }
    } else {
      query = query.range(from, from + limit - 1);
    }

    const { data, count, error } = await query;

    if (!error && data) {
      const hasFilters =
        !!degree ||
        !!language ||
        !!discipline ||
        !!universitySlug ||
        !!city ||
        !!term ||
        scholarshipOnly ||
        featured ||
        onlyArchived ||
        normalizedFilterRequested;
      if (data.length > 0 || hasFilters) {
        return {
          programs: data.map((r) => mapProgramFromDb(r) as unknown as Program),
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
          matchedUniversitySlugs: uniSlugs,
        };
      }
      // data.length === 0 && !hasFilters → fall through to static
    }
  }

  // Static fallback. The seed has no archived/unpublished concept (every
  // static row is implicitly live), so status filters are not applied
  // here — same as the pre-Phase-173 behaviour.
  //
  // PF-2: the normalized facets (intake / tuition / duration) only exist
  // as derived columns, so a filter on them cannot be satisfied by the
  // static seed. Returning the unfiltered list would be a lie (and the
  // Track 1.3 U3 #1 contract says a filter that matches nothing returns
  // `[]`), so we return nothing.
  if (normalizedFilterRequested || city) {
    return {
      programs: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
      matchedUniversitySlugs: [],
    };
  }

  let filtered = [...staticPrograms];
  if (degree) filtered = filtered.filter((p) => p.degree === degree);
  if (language) filtered = filtered.filter((p) => p.language === language);
  if (discipline) filtered = filtered.filter((p) => p.discipline === discipline);
  if (universitySlug) filtered = filtered.filter((p) => p.universitySlug === universitySlug);
  if (scholarshipOnly) filtered = filtered.filter((p) => p.scholarshipAvailable);

  const staticUniSlugs = term ? matchUniversitySlugs(term, staticUniversities) : [];
  if (term) filtered = filtered.filter((p) => programMatchesSearch(p, term, staticUniSlugs));

  if (sort === 'tuition') {
    filtered.sort((a, b) => tuitionNumber(a) - tuitionNumber(b));
  } else if (sort === 'relevance' && term) {
    filtered = rankByRelevance(filtered, term, staticUniSlugs);
  } else {
    // "default" for the static seed = name order (no static row is
    // featured), matching the DB path's tie-break.
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  const total = filtered.length;
  const from = (page - 1) * limit;

  return {
    programs: filtered.slice(from, from + limit),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    matchedUniversitySlugs: staticUniSlugs,
  };
}

/** Tuition is stored as free text ("¥38,000/year", "To be confirmed"),
 *  mirroring the old client-side sort in programs-client.tsx. */
function tuitionNumber(p: { tuition: string }): number {
  const n = parseInt(p.tuition.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

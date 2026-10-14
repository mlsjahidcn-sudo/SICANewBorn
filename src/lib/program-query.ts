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
} from '@/lib/program-search';
import type { Program } from '@/lib/data';

export interface ProgramQueryParams {
  degree?: string | null;
  language?: string | null;
  discipline?: string | null;
  /** University SLUG (exact match), not a name. */
  university?: string | null;
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
  const sort = sp.get('sort');
  return {
    degree: sp.get('degree'),
    language: sp.get('language') ?? sp.get('lang'),
    discipline: sp.get('discipline') ?? sp.get('disc'),
    university: sp.get('university') ?? sp.get('uni'),
    search: sp.get('search') ?? sp.get('q'),
    // Page uses `sort=default`; the API historically omitted it. Treat a
    // missing/empty sort as "name" server-side (matching the old API
    // default) — that is the closest stable ordering for a paginated set.
    sort: sp.get('sort') || 'name',
    scholarshipOnly: sp.get('scholarship') === '1',
    featured: sp.get('featured') === 'true',
    includeArchived: sp.get('include_archived') === 'true',
    onlyArchived: sp.get('only_archived') === 'true',
    page: parseIntParam(sp.get('page'), 1, { min: 1 }),
    limit: parseIntParam(sp.get('limit'), DEFAULT_PROGRAM_PAGE_SIZE, { min: 1, max: 500 }),
  };
}

/**
 * Run the programs query. DB first; static fallback only when the DB has
 * nothing AND no filters were applied.
 */
export async function queryPrograms(params: ProgramQueryParams): Promise<ProgramQueryResult> {
  const degree = params.degree ?? null;
  const language = params.language ?? null;
  const discipline = params.discipline ?? null;
  const universitySlug = params.university ?? null;
  const scholarshipOnly = params.scholarshipOnly ?? false;
  const sort = params.sort || 'name';
  const featured = params.featured ?? false;
  const includeArchived = params.includeArchived ?? false;
  const onlyArchived = params.onlyArchived ?? false;
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(500, Math.max(1, params.limit ?? DEFAULT_PROGRAM_PAGE_SIZE));

  const term = params.search ? sanitizeOrTerm(params.search) : '';

  if (isSupabaseServerConfigured() && supabaseServer) {
    let query = supabaseServer.from('programs').select('*', { count: 'exact' });

    if (degree) query = query.eq('degree', degree);
    if (language) {
      query =
        language === 'To be confirmed'
          ? query.or('language.is.null,language.eq.,language.eq.To be confirmed')
          : query.eq('language', language);
    }
    if (discipline) query = query.eq('discipline', discipline);
    if (universitySlug) query = query.eq('university_slug', universitySlug);
    if (scholarshipOnly) query = query.eq('scholarship_available', true);

    if (await hasProgramsStatusColumns()) {
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

    if (sort === 'tuition') {
      query = query.order('tuition', { ascending: true });
    } else if (sort === 'featured_rank' && (await hasProgramsStatusColumns())) {
      query = query.order('featured_rank', { ascending: true, nullsFirst: false });
      query = query.order('name', { ascending: true });
    } else {
      query = query.order('name', { ascending: true });
    }

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, count, error } = await query;

    if (!error && data) {
      const hasFilters =
        !!degree ||
        !!language ||
        !!discipline ||
        !!universitySlug ||
        !!term ||
        scholarshipOnly ||
        featured ||
        onlyArchived;
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

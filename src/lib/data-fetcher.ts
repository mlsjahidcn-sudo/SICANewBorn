/**
 * Server-side data fetchers used by RSC pages.
 *
 * These functions hit the live Supabase database at render time and
 * fall back to the static seed data in src/lib/data.ts when the
 * database is unconfigured or returns nothing. They return the same
 * shape as the static arrays, so existing component code that
 * destructures `name`, `slug`, `nameCn`, etc. continues to work.
 *
 * Why a separate module?
 * - The mappers (mapUniversityFromDb, mapProgramFromDb,
 *   mapScholarshipFromDb) live inside their respective API route
 *   files, but those route files are 'use server' Node handlers and
 *   can't be safely imported into RSC. Duplicating the mapper logic
 *   here keeps the data shape consistent without cross-coupling.
 * - One place to add a new column (e.g. when the schema gains a new
 *   field, every RSC page picks it up).
 *
 * Memoization (S59): every export is wrapped in React's `cache()`,
 * so the 3× per-page calls in compare routes (generateStaticParams +
 * generateMetadata + page body) collapse to a single DB query per
 * page render. On top of that, the raw table loads sit behind a
 * process-level TTL cache (`cachedProcess` below) — React's cache is
 * request-scoped, so without it each of the ~6,074 statically
 * generated pages still fired its own full-table query, and 4 build
 * workers hammering Supabase at once pushed individual pages past
 * staticPageGenerationTimeout (Cloudflare Pages build failures).
 * The 60s TTL matches the ISR `revalidate` the consuming pages
 * already declare, so runtime staleness is unchanged.
 */
import { cache } from 'react';
import { fetchProgramRows } from './program-rows';
import { hasProgramsStatusColumns } from './program-query';
import { supabaseServer, isSupabaseServerConfigured } from './supabase-server';
import {
  universities as staticUniversities,
  programs as staticPrograms,
  scholarships as staticScholarships,
  type University,
  type Program,
  type Scholarship,
} from './data';

// Re-export the data types so RSC pages can import them from the
// same module that provides the fetchers, instead of reaching into
// @/lib/data separately.
export type { University, Program, Scholarship };

/**
 * Process-level TTL cache for the raw table loads. One entry per
 * cache key, shared by every page render in the same worker process
 * (build) or server isolate (runtime). The promise itself is cached
 * so concurrent callers share one in-flight query; failures evict
 * immediately so a transient error during one page's build doesn't
 * poison the other pages.
 */
const PROCESS_CACHE_TTL_MS = 60_000;
const processCache = new Map<string, { expires: number; promise: Promise<unknown> }>();

function cachedProcess<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const hit = processCache.get(key);
  if (hit && hit.expires > Date.now()) {
    return hit.promise as Promise<T>;
  }
  const promise = loader();
  const entry = { expires: Date.now() + PROCESS_CACHE_TTL_MS, promise };
  processCache.set(key, entry);
  promise.catch(() => {
    if (processCache.get(key) === entry) processCache.delete(key);
  });
  return promise;
}

function mapUniversity(row: Record<string, unknown>): University {
  // Highlights is a JSON column of shape { en: string[], zh: string[] }.
  // Older rows may store it as a plain array of strings; accept both.
  const rawHighlights = (row.highlights as unknown) ?? null;
  let highlights: { en: string[]; zh: string[] } = { en: [], zh: [] };
  if (Array.isArray(rawHighlights)) {
    // Legacy shape: flat string array. Put it in en for now.
    highlights = { en: rawHighlights as string[], zh: [] };
  } else if (
    rawHighlights &&
    typeof rawHighlights === 'object' &&
    'en' in (rawHighlights as object)
  ) {
    const h = rawHighlights as { en?: string[]; zh?: string[] };
    highlights = { en: h.en ?? [], zh: h.zh ?? [] };
  }
  return {
    slug: row.slug as string,
    name: row.name as string,
    nameCn: (row.name_cn as string) ?? '',
    city: (row.city as string) ?? '',
    cityCn: (row.city_cn as string) ?? '',
    ranking: (row.ranking as number) ?? 0,
    rating:
      row.rating !== null && row.rating !== undefined
        ? Number(row.rating)
        : 0,
    type: (row.type as string) ?? '',
    typeCn: (row.type_cn as string) ?? '',
    established: (row.established as number) ?? 0,
    students: (row.students as string) ?? '',
    intlStudents: (row.intl_students as string) ?? '',
    description: (row.description as string) ?? '',
    descriptionCn: (row.description_cn as string) ?? '',
    popularPrograms: (row.popular_programs as string[]) ?? [],
    popularProgramsCn: (row.popular_programs_cn as string[]) ?? [],
    tuitionUndergrad: (row.tuition_undergrad as string) ?? '',
    tuitionGraduate: (row.tuition_graduate as string) ?? '',
    intake: (row.intake as string) ?? '',
    intakeCn: (row.intake_cn as string) ?? '',
    disciplines: (row.disciplines as string[]) ?? [],
    image: (row.image as string) ?? '',
    logo: (row.logo as string) ?? '',
    qsRanking: (row.qs_ranking as string) ?? '',
    qsWorldRanking:
      row.qs_world_ranking !== null && row.qs_world_ranking !== undefined
        ? Number(row.qs_world_ranking)
        : 0,
    tags: (row.tags as string[]) ?? [],
    tagsCn: (row.tags_cn as string[]) ?? [],
    accommodation: (row.accommodation as string) ?? '',
    accommodationCn: (row.accommodation_cn as string) ?? '',
    accommodationCost: (row.accommodation_cost as string) ?? '',
    accommodationCostCn: (row.accommodation_cost_cn as string) ?? '',
    accommodationTypes: (row.accommodation_types as string[]) ?? [],
    accommodationTypesCn: (row.accommodation_types_cn as string[]) ?? [],
    gallery: (row.gallery as string[]) ?? [],
    highlights,
    scholarshipInfo: (row.scholarship_info as string) ?? undefined,
    scholarshipInfoCn: (row.scholarship_info_cn as string) ?? undefined,
    applicationDeadline: (row.application_deadline as string) ?? undefined,
  };
}

function mapProgram(row: Record<string, unknown>, slug: string): Program {
  // Cn-field fallback: if a DB row pre-dates the Cn columns, pull
  // them from the matching static row so the page renders in
  // Chinese. Same pattern as the /api/programs mapper.
  const staticRow = staticPrograms.find((p) => p.slug === slug);
  return {
    slug,
    name: row.name as string,
    nameCn: String(row.name_cn || row.name || ''),
    universitySlug: (row.university_slug as string) ?? '',
    degree: row.degree as Program['degree'],
    discipline: (row.discipline as string) ?? '',
    disciplineCn:
      (row.discipline_cn as string) ?? staticRow?.disciplineCn ?? '',
    language: (row.language || 'To be confirmed') as Program['language'],
    duration: (row.duration as string) ?? '',
    durationCn: (row.duration_cn as string) || staticRow?.durationCn || String(row.duration ?? ''),
    tuition: (row.tuition as string) ?? '',
    description: (row.description as string) ?? '',
    descriptionCn: String(row.description_cn || row.description || ''),
    requirements: (row.requirements as string[]) ?? [],
    requirementsCn: (row.requirements_cn as string[]) ?? [],
    curriculum: (row.curriculum as string[]) ?? [],
    curriculumCn: (row.curriculum_cn as string[]) ?? [],
    scholarshipAvailable: (row.scholarship_available as boolean | null) ?? null,
    intake: (row.intake as string) ?? '',
    intakeCn: (row.intake_cn as string) || staticRow?.intakeCn || String(row.intake ?? ''),
    // Phase 128a: round-trip the status surface. Defaults match the
    // DB column defaults (not featured, published, not archived,
    // rank NULL) so old DB rows that pre-date the migration render
    // identically to before.
    isFeatured: (row.is_featured as boolean) ?? false,
    isPublished: (row.is_published as boolean) ?? true,
    archivedAt: (row.archived_at as string | null) ?? null,
    featuredRank: (row.featured_rank as number | null) ?? null,
  };
}

function mapScholarship(row: Record<string, unknown>): Scholarship {
  // The DB row's `type` is a free-form string; the static type
  // narrows it to 'Full' | 'Partial'. Validate at the boundary
  // — default to 'Full' when the DB stores something we don't
  // recognize, so a typo on the admin side never crashes the
  // page render.
  const rawType = (row.type as string) ?? 'Full';
  const type: 'Full' | 'Partial' =
    rawType === 'Partial' ? 'Partial' : 'Full';

  // DB stores coverage as a single text blob; static splits it
  // into a string[]. Split on newlines / commas / semicolons so
  // a DB row that says "Tuition\nAccommodation\nStipend" still
  // renders correctly downstream. (No-op when the DB already
  // stores an array — future schema change.)
  const rawCoverage = (row.coverage as unknown) ?? [];
  const coverage: string[] = Array.isArray(rawCoverage)
    ? (rawCoverage as string[])
    : String(rawCoverage)
        .split(/[\n,;|]/)
        .map((s) => s.trim())
        .filter(Boolean);

  return {
    slug: row.slug as string,
    name: row.name as string,
    nameCn: (row.name_cn as string) ?? '',
    type,
    typeCn: (row.type_cn as string) ?? '',
    coverage,
    coverageCn: (row.coverage_cn as string[]) ?? [],
    degreeLevels: (row.degree_levels as string[]) ?? [],
    degreeLevelsCn: (row.degree_levels_cn as string[]) ?? [],
    eligibleRegions: (row.eligible_regions as string) ?? '',
    eligibleRegionsCn: (row.eligible_regions_cn as string) ?? '',
    duration: (row.duration as string) ?? '',
    durationCn: (row.duration_cn as string) ?? '',
    deadline: (row.deadline as string) ?? '',
    deadlineCn: (row.deadline_cn as string) ?? '',
    description: (row.description as string) ?? '',
    descriptionCn: (row.description_cn as string) ?? '',
    requirements: (row.requirements as string[]) ?? [],
    requirementsCn: (row.requirements_cn as string[]) ?? [],
    applicationMethod: (row.application_method as string) ?? '',
    applicationMethodCn: (row.application_method_cn as string) ?? '',
    benefits: (row.benefits as string[]) ?? [],
    benefitsCn: (row.benefits_cn as string[]) ?? [],
    officialLink: (row.official_link as string) ?? '',
  };
}

/** All universities, DB first, static fallback.
 *  S59: wrapped in React `cache()` so the 3× calls in the compare
 *  route's generateStaticParams + generateMetadata + Page body
 *  collapse to a single DB query per page. Request-scoped — each
 *  static-generated page still gets its own query, but the 3
 *  per-page calls collapse to 1, cutting the build's Supabase
 *  load by ~3x. */
export const getAllUniversities = cache(
  async (): Promise<University[]> => {
    return cachedProcess('universities:all', async () => {
      if (isSupabaseServerConfigured() && supabaseServer) {
        const { data, error } = await supabaseServer
          .from('universities')
          .select('*')
          .order('ranking', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map(mapUniversity);
        }
      }
      return staticUniversities;
    });
  },
);

/**
 * Merged-static-plus-DB helper used by the SEO city pages
 * (`/study-in-china` hub + `/study-in-china/[city]` details).
 *
 * The previous design read only from `staticUniversities` (the 9-row
 * seed in `src/lib/data.ts`), which silently hid every
 * admin-imported university from the city pages — Beijing showed
 * the 1 static "Peking University" row while the DB actually
 * contains dozens more universities with that city. This helper
 * merges: DB rows take precedence on slug (richer data, fresher
 * edits), static rows fill the gap in dev when Supabase is
 * unconfigured.
 *
 * Returns DB-only when Supabase is reachable and returns rows; falls
 * back to the static seed otherwise (so dev / offline still render).
 *
 * Cached at the React layer (`cache()`) + process layer
 * (`cachedProcess` with 60s TTL) — same pattern as the rest of the
 * data fetchers. Per-page revalidation on the city pages is what
 * gives the SEO pages their freshness; the 60s TTL is the
 * safety net against stampedes when many pages render in the same
 * worker.
 */
export const getAllUniversitiesMerged = cache(
  async (): Promise<University[]> => {
    return cachedProcess('universities:all:merged', async () => {
      const staticBySlug = new Map<string, University>(
        staticUniversities.map((u: University) => [u.slug, u]),
      );
      // If Supabase is reachable, the DB is the authoritative source
      // for the cities aggregation. Merge in any static rows whose
      // slugs don't appear in the DB — preserves dev seed (which
      // has rows like the original 9 founding universities) when the
      // DB has been seeded with admin imports that don't overlap.
      if (isSupabaseServerConfigured() && supabaseServer) {
        const { data, error } = await supabaseServer
          .from('universities')
          .select('*')
          .order('ranking', { ascending: true });
        if (!error && data && data.length > 0) {
          const merged: University[] = data.map(mapUniversity);
          // Add static-only rows that the DB hasn't replaced.
          const dbSlugs = new Set(merged.map((u) => u.slug));
          for (const [slug, u] of staticBySlug) {
            if (!dbSlugs.has(slug)) merged.push(u);
          }
          return merged;
        }
      }
      return staticUniversities;
    });
  },
);

/**
 * Lightweight featured-university fetcher for the home page.
 *
 * The home page only renders the top-N ranked universities (hero
 * cards + logo strip). Selecting every column and every row via
 * getAllUniversities() was a major source of the homepage loading
 * bar: heavy JSON columns (gallery, highlights, etc.) and large
 * row counts slow the RSC render before the first byte.
 *
 * This helper selects only the columns the home page needs and
 * hard-limits the result set so the query stays fast regardless
 * of table growth.
 */
export const getFeaturedUniversities = cache(
  async (limit = 8): Promise<University[]> => {
    return cachedProcess(`universities:featured:${limit}`, async () => {
      if (isSupabaseServerConfigured() && supabaseServer) {
      const { data, error } = await supabaseServer
        .from('universities')
        .select(
          'slug, name, name_cn, city, city_cn, ranking, qs_world_ranking, logo',
        )
        .order('ranking', { ascending: true })
        .limit(limit);
      if (!error && data && data.length > 0) {
        return data.map((row) =>
          mapUniversity({
            ...row,
            // mapUniversity expects these optional fields; provide
            // defaults so the returned University shape is complete
            // without bloating the SELECT.
            rating: 0,
            type: '',
            type_cn: '',
            established: 0,
            students: '',
            intl_students: '',
            description: '',
            description_cn: '',
            popular_programs: [],
            popular_programs_cn: [],
            tuition_undergrad: '',
            tuition_graduate: '',
            intake: '',
            intake_cn: '',
            disciplines: [],
            image: '',
            qs_ranking: '',
            tags: [],
            tags_cn: [],
            accommodation: '',
            accommodation_cn: '',
            accommodation_cost: '',
            accommodation_cost_cn: '',
            accommodation_types: [],
            accommodation_types_cn: [],
            gallery: [],
            highlights: { en: [], zh: [] },
          } as Record<string, unknown>),
        );
      }
      }
      return staticUniversities.slice(0, limit);
    });
  },
);

/** All programs, DB first, static fallback. Memoized per-request —
 *  most pages read this at most once, but the program-scholarships
 *  and study-in-china/[city] routes use it in both generateMetadata
 *  and the page body. */
export const getAllPrograms = cache(
  async (): Promise<Program[]> => {
    return cachedProcess('programs:all', async () => {
      if (isSupabaseServerConfigured() && supabaseServer) {
        const { data, error } = await fetchProgramRows(supabaseServer);
        if (!error && data && data.length > 0) {
          return data.map((row) =>
            mapProgram(row, row.slug as string),
          );
        }
      }
      return staticPrograms;
    });
  },
);

/**
 * Live row counts for the three public catalog tables.
 *
 * Why this exists: the homepage "By the Numbers" band and the
 * footer's trust micro-stats used to show a HARDCODED "200+ programs"
 * while the live catalog actually held ~2,075 programs and 152
 * universities. The comment in `src/app/page.tsx` claimed the number
 * was "derived from the live DB count at render time" — it was not.
 * The number was a stale guess, and the other four stats were blank
 * strings, so the band collapsed to a single lonely stat.
 *
 * These three counts are FACTS about the catalogue, not marketing
 * claims: they cannot be wrong, because they are counted from the
 * same tables the catalogue pages read. That is why they are derived
 * rather than curated.
 *
 * The genuinely marketing figures — students helped, admission rate,
 * visa rate, countries served — stay in `src/lib/site-stats.ts` and
 * stay hidden until a human supplies a verified number. The rule from
 * Phase 148 holds: never show a guess; show a count or show nothing.
 *
 * `head: true` + `count: 'exact'` means PostgREST returns the row
 * count without transferring a single row. Three of those per minute
 * (the 60s process cache) is the entire cost of this helper.
 */
export interface CatalogCounts {
  universities: number;
  programs: number;
  scholarships: number;
}

export const getCatalogCounts = cache(
  async (): Promise<CatalogCounts> => {
    // Static seed fallback — used when Supabase is unconfigured
    // (e.g. a fresh clone with no .env) so the band still renders
    // with real, if smaller, numbers.
    const fallback: CatalogCounts = {
      universities: staticUniversities.length,
      programs: staticPrograms.length,
      scholarships: staticScholarships.length,
    };

    return cachedProcess('catalog:counts', async () => {
      if (!isSupabaseServerConfigured() || !supabaseServer) return fallback;
      try {
        // Programs: count the same rows the public catalogue shows —
        // published and not archived — so the stat matches what a
        // visitor can actually browse. The status columns only exist
        // after the Phase 128a migration, so the same probe the
        // catalogue query uses decides whether to filter.
        let programQuery = supabaseServer
          .from('programs')
          .select('id', { count: 'exact', head: true });
        if (await hasProgramsStatusColumns()) {
          programQuery = programQuery.eq('is_published', true).is('archived_at', null);
        }

        const [u, p, s] = await Promise.all([
          supabaseServer.from('universities').select('id', { count: 'exact', head: true }),
          programQuery,
          supabaseServer.from('scholarships').select('id', { count: 'exact', head: true }),
        ]);
        return {
          universities: u.count ?? fallback.universities,
          programs: p.count ?? fallback.programs,
          scholarships: s.count ?? fallback.scholarships,
        };
      } catch {
        // A transient DB failure must not blank the band — fall back
        // to the static seed counts rather than rendering nothing.
        return fallback;
      }
    });
  },
);

/**
 * Slim home-page program card. The parent university name and city
 * travel with the row so the card does not guess from the top-ranked
 * university list.
 *
 * `programs.university_slug` is a bare string with no foreign key, so
 * PostgREST cannot embed `universities`. The fetcher loads the program
 * rows, then one follow-up select for those slugs only.
 */
export interface HomeFeaturedProgram {
  slug: string;
  name: string;
  nameCn: string;
  universitySlug: string;
  universityName: string;
  universityNameCn: string;
  city: string;
  cityCn: string;
  degree: string;
  discipline: string;
  disciplineCn: string;
  duration: string;
  durationCn: string;
  tuition: string;
  scholarshipAvailable: boolean | null;
}

interface UniversityLabel {
  name: string;
  nameCn: string;
  city: string;
  cityCn: string;
}

function labelFromStatic(slug: string): UniversityLabel | undefined {
  const uni = staticUniversities.find((row) => row.slug === slug);
  if (!uni) return undefined;
  return {
    name: uni.name,
    nameCn: uni.nameCn,
    city: uni.city,
    cityCn: uni.cityCn,
  };
}

function toHomeFeaturedProgram(
  row: {
    slug: string;
    name: string;
    nameCn: string;
    universitySlug: string;
    degree: string;
    discipline: string;
    disciplineCn: string;
    duration: string;
    durationCn: string;
    tuition: string;
    scholarshipAvailable: boolean | null;
  },
  labels: Map<string, UniversityLabel>,
): HomeFeaturedProgram {
  const label = labels.get(row.universitySlug);
  return {
    slug: row.slug,
    name: row.name,
    nameCn: row.nameCn,
    universitySlug: row.universitySlug,
    universityName: label?.name ?? '',
    universityNameCn: label?.nameCn ?? '',
    city: label?.city ?? '',
    cityCn: label?.cityCn ?? '',
    degree: row.degree,
    discipline: row.discipline,
    disciplineCn: row.disciplineCn,
    duration: row.duration,
    durationCn: row.durationCn,
    tuition: row.tuition,
    scholarshipAvailable: row.scholarshipAvailable,
  };
}

function featuredProgramsFromStatic(limit: number): HomeFeaturedProgram[] {
  const labels = new Map<string, UniversityLabel>();
  for (const program of staticPrograms.slice(0, limit)) {
    const label = labelFromStatic(program.universitySlug);
    if (label) labels.set(program.universitySlug, label);
  }
  return staticPrograms.slice(0, limit).map((program) =>
    toHomeFeaturedProgram(
      {
        slug: program.slug,
        name: program.name,
        nameCn: program.nameCn,
        universitySlug: program.universitySlug,
        degree: program.degree,
        discipline: program.discipline,
        disciplineCn: program.disciplineCn,
        duration: program.duration,
        durationCn: program.durationCn,
        tuition: program.tuition,
        scholarshipAvailable: program.scholarshipAvailable,
      },
      labels,
    ),
  );
}

async function loadUniversityLabels(slugs: string[]): Promise<Map<string, UniversityLabel>> {
  const unique = [...new Set(slugs.filter((slug) => slug.length > 0))];
  const labels = new Map<string, UniversityLabel>();
  for (const slug of unique) {
    const label = labelFromStatic(slug);
    if (label) labels.set(slug, label);
  }
  if (unique.length === 0 || !isSupabaseServerConfigured() || !supabaseServer) {
    return labels;
  }
  const { data, error } = await supabaseServer
    .from('universities')
    .select('slug, name, name_cn, city, city_cn')
    .in('slug', unique);
  if (error || !data) return labels;
  for (const row of data) {
    const slug = String(row.slug ?? '');
    if (!slug) continue;
    labels.set(slug, {
      name: String(row.name ?? ''),
      nameCn: String(row.name_cn ?? ''),
      city: String(row.city ?? ''),
      cityCn: String(row.city_cn ?? ''),
    });
  }
  return labels;
}

/**
 * Phase 128a: featured-program fetcher for the home page "Popular
 * programs" widget.
 *
 * Same shape as getFeaturedUniversities — light column SELECT, hard
 * limit, server-side ordering by featured_rank NULLS LAST so the
 * widget's order is stable across requests. The partial index
 * `idx_programs_featured_live` (migration
 * database/2026-09-26_programs_status.sql) keeps the query fast even
 * as the programs table grows.
 *
 * Deploy safety: if the migration isn't applied yet, the
 * is_featured / is_published / archived_at / featured_rank columns
 * don't exist and the query 427s. We fall back to the static
 * top-N so the widget renders cleanly even pre-migration. Once the
 * migration runs, the next render fetches real featured rows.
 *
 * If no rows are featured in the DB AND there's no live data, fall
 * back to the top-N static rows by name — keeps the widget visually
 * populated during the early-build / dev phase before any admin has
 * flipped a row featured.
 */
export const getFeaturedPrograms = cache(
  async (limit = 4): Promise<HomeFeaturedProgram[]> => {
    return cachedProcess(`programs:featured:home:${limit}`, async () => {
      if (isSupabaseServerConfigured() && supabaseServer) {
        const { data, error } = await supabaseServer
          .from('programs')
          .select(
            'slug, name, name_cn, university_slug, degree, discipline, discipline_cn, language, duration, duration_cn, tuition, scholarship_available, is_featured, is_published, archived_at, featured_rank',
          )
          .eq('is_featured', true)
          .eq('is_published', true)
          .is('archived_at', null)
          .order('featured_rank', { ascending: true, nullsFirst: false })
          .order('name', { ascending: true })
          .limit(limit);
        if (!error && data && data.length > 0) {
          const labels = await loadUniversityLabels(
            data.map((row) => String(row.university_slug ?? '')),
          );
          return data.map((row) =>
            toHomeFeaturedProgram(
              {
                slug: String(row.slug ?? ''),
                name: String(row.name ?? ''),
                nameCn: String(row.name_cn ?? row.name ?? ''),
                universitySlug: String(row.university_slug ?? ''),
                degree: String(row.degree ?? ''),
                discipline: String(row.discipline ?? ''),
                disciplineCn: String(row.discipline_cn ?? ''),
                duration: String(row.duration ?? ''),
                durationCn: String(row.duration_cn ?? row.duration ?? ''),
                tuition: String(row.tuition ?? ''),
                scholarshipAvailable:
                  typeof row.scholarship_available === 'boolean'
                    ? row.scholarship_available
                    : null,
              },
              labels,
            ),
          );
        }
        // PGRST / 427 = status columns missing (migration not yet
        // applied). Fall through to the static-fallback block below
        // — the home widget renders the top-N static rows until the
        // admin applies the migration.
        if (
          error &&
          (error.code === '42703' /* undefined_column */ ||
            error.code === 'PGRST204' /* column not in schema cache */)
        ) {
          return featuredProgramsFromStatic(limit);
        }
      }
      // No featured rows yet — top-N static by name so the widget
      // still renders something useful during pre-launch / dev.
      return featuredProgramsFromStatic(limit);
    });
  },
);

/** All scholarships, DB first, static fallback. Memoized per-request. */
export const getAllScholarships = cache(
  async (): Promise<Scholarship[]> => {
    return cachedProcess('scholarships:all', async () => {
      if (isSupabaseServerConfigured() && supabaseServer) {
        const { data, error } = await supabaseServer
          .from('scholarships')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map(mapScholarship);
        }
      }
      return staticScholarships;
    });
  },
);

/** DB-only scholarship + program getters for subpages that need a
 *  single source. Returned Promise resolves to [] if the DB is
 *  empty / unconfigured — callers can then fall back to the static
 *  list themselves if they want.
 *  S59: also memoized. `getScholarshipsForUniversity` ignores its
 *  slug (the schema has no direct link), so without cache() the
 *  same no-op query fires 3× per page. */
export const getScholarshipsForUniversity = cache(
  async (_universitySlug: string): Promise<Scholarship[]> => {
    // Keyed WITHOUT the slug: the schema has no direct link, so the
    // query is the same full-table read for every university. During
    // SSG this turns ~105 identical queries into 1 per worker.
    return cachedProcess('scholarships:db-only', async () => {
      if (!isSupabaseServerConfigured() || !supabaseServer) return [];
      const { data, error } = await supabaseServer
        .from('scholarships')
        .select('*')
        .order('name', { ascending: true });
      if (error || !data) return [];
      return data.map(mapScholarship);
    });
  },
);

export const getProgramsForUniversity = cache(
  async (universitySlug: string): Promise<Program[]> => {
    return cachedProcess(`programs:uni:${universitySlug}`, async () => {
      if (!isSupabaseServerConfigured() || !supabaseServer) return [];
      const { data, error } = await supabaseServer
        .from('programs')
        .select('*')
        .eq('university_slug', universitySlug)
        .order('name', { ascending: true });
      if (error || !data) return [];
      return data.map((row) => mapProgram(row, row.slug as string));
    });
  },
);

export const getProgramsForDiscipline = cache(
  async (discipline: string): Promise<Program[]> => {
    return cachedProcess(`programs:disc:${discipline}`, async () => {
      if (!isSupabaseServerConfigured() || !supabaseServer) return [];
      const { data, error } = await supabaseServer
        .from('programs')
        .select('*')
        .eq('discipline', discipline)
        .order('name', { ascending: true });
      if (error || !data) return [];
      return data.map((row) => mapProgram(row, row.slug as string));
    });
  },
);

export const getScholarshipsForProgram = cache(
  async (programSlug: string): Promise<Scholarship[]> => {
    void programSlug; // ignored — no direct link in the schema (see below)
    // Same full-table read for every program — share one cache entry.
    return cachedProcess('scholarships:db-only', async () => {
      if (!isSupabaseServerConfigured() || !supabaseServer) return [];
      const { data, error } = await supabaseServer
        .from('scholarships')
        .select('*')
        .order('name', { ascending: true });
      if (error || !data) return [];
      return data.map(mapScholarship);
    });
  },
);

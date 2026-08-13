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
 * generateMetadata + page body) collapse to a single DB query. The
 * cache is request-scoped — it dedups within a single page render,
 * not across pages. Each static-generated page still does ≥1 query,
 * but the per-page DB pressure drops dramatically (3× → 1× on the
 * compare route, which is the worst offender at 5,460 pairs).
 *
 * Trade-off: each static-generated page does at least one DB query.
 * For SICA's traffic profile (a few hundred RPS at peak) this is fine
 * — Supabase connection pooling + Postgres reads of 8-26 rows are
 * sub-10ms. If volume ever justifies it, add `export const revalidate
 * = 60` to the consuming page to cache the result. (Beware:
 * `unstable_cache` returns stale data after direct DB writes — see
 * the cross-project hard rules in the user-memory tail for details.)
 */
import { cache } from 'react';
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
    nameCn: (row.name_cn as string) ?? '',
    universitySlug: (row.university_slug as string) ?? '',
    degree: row.degree as 'Bachelor' | 'Master' | 'PhD',
    discipline: (row.discipline as string) ?? '',
    disciplineCn:
      (row.discipline_cn as string) ?? staticRow?.disciplineCn ?? '',
    language: row.language as 'English' | 'Chinese' | 'Bilingual',
    duration: (row.duration as string) ?? '',
    durationCn: (row.duration_cn as string) ?? staticRow?.durationCn ?? '',
    tuition: (row.tuition as string) ?? '',
    description: (row.description as string) ?? '',
    descriptionCn: (row.description_cn as string) ?? '',
    requirements: (row.requirements as string[]) ?? [],
    requirementsCn: (row.requirements_cn as string[]) ?? [],
    curriculum: (row.curriculum as string[]) ?? [],
    curriculumCn: (row.curriculum_cn as string[]) ?? [],
    scholarshipAvailable: (row.scholarship_available as boolean) ?? false,
    intake: (row.intake as string) ?? '',
    intakeCn: (row.intake_cn as string) ?? staticRow?.intakeCn ?? '',
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
  },
);

/** All programs, DB first, static fallback. Memoized per-request —
 *  most pages read this at most once, but the program-scholarships
 *  and study-in-china/[city] routes use it in both generateMetadata
 *  and the page body. */
export const getAllPrograms = cache(
  async (): Promise<Program[]> => {
    if (isSupabaseServerConfigured() && supabaseServer) {
      const { data, error } = await supabaseServer
        .from('programs')
        .select('*')
        .order('name', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((row) =>
          mapProgram(row, row.slug as string),
        );
      }
    }
    return staticPrograms;
  },
);

/** All scholarships, DB first, static fallback. Memoized per-request. */
export const getAllScholarships = cache(
  async (): Promise<Scholarship[]> => {
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
    if (!isSupabaseServerConfigured() || !supabaseServer) return [];
    // Scholarships are not directly linked to a university in the
    // schema. The closest relation is via the scholarship's
    // eligible_regions. For now return the full list — pages that
    // need filtering can do it client-side.
    const { data, error } = await supabaseServer
      .from('scholarships')
      .select('*')
      .order('name', { ascending: true });
    if (error || !data) return [];
    return data.map(mapScholarship);
  },
);

export const getProgramsForUniversity = cache(
  async (universitySlug: string): Promise<Program[]> => {
    if (!isSupabaseServerConfigured() || !supabaseServer) return [];
    const { data, error } = await supabaseServer
      .from('programs')
      .select('*')
      .eq('university_slug', universitySlug)
      .order('name', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => mapProgram(row, row.slug as string));
  },
);

export const getProgramsForDiscipline = cache(
  async (discipline: string): Promise<Program[]> => {
    if (!isSupabaseServerConfigured() || !supabaseServer) return [];
    const { data, error } = await supabaseServer
      .from('programs')
      .select('*')
      .eq('discipline', discipline)
      .order('name', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => mapProgram(row, row.slug as string));
  },
);

export const getScholarshipsForProgram = cache(
  async (programSlug: string): Promise<Scholarship[]> => {
    if (!isSupabaseServerConfigured() || !supabaseServer) return [];
    // Programs don't have a direct link to scholarships. Return the
    // full list for now — the page can filter client-side if needed.
    const { data, error } = await supabaseServer
      .from('scholarships')
      .select('*')
      .order('name', { ascending: true });
    if (error || !data) return [];
    return data.map(mapScholarship);
  },
);

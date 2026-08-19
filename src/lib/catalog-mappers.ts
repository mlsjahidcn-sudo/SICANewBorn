import { universities as staticUniversities, programs as staticPrograms } from '@/lib/data';

/**
 * Track 1.3 U2: canonical DB ↔ API mappers for the admin catalog
 * routes (/api/universities, /api/programs, /api/scholarships and
 * their [slug]/bulk siblings). These used to be copy-pasted into
 * every route file; they now live here so behavior can't drift.
 *
 * Note: src/lib/data-fetcher.ts (RSC) and src/lib/*-queries.ts keep
 * their own mappers with different column sets — intentionally
 * separate, do not merge into this module.
 */

/**
 * For fields the DB doesn't have yet (because the migration hasn't
 * been applied), fall back to the static-data row with the same slug
 * if it exists. Lets the page render useful values for legacy DB
 * rows while the migration is in flight. Once the migration is
 * applied and rows are backfilled, this fallback becomes a no-op.
 */
export function withStaticFallback<T>(
  slug: string,
  key: keyof (typeof staticUniversities)[number],
  value: T,
): T {
  if (value !== undefined && value !== null) return value;
  const staticRow = staticUniversities.find((u) => u.slug === slug);
  return (staticRow?.[key] as T) ?? value;
}

export function mapUniversityFromDb(row: Record<string, unknown>) {
  return {
    slug: row.slug,
    name: row.name,
    nameCn: row.name_cn,
    city: row.city,
    cityCn: row.city_cn,
    ranking: row.ranking,
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : undefined,
    type: row.type,
    typeCn: row.type_cn,
    established: row.established,
    students: row.students,
    intlStudents: row.intl_students,
    description: row.description,
    descriptionCn: row.description_cn,
    popularPrograms: row.popular_programs ?? [],
    popularProgramsCn: row.popular_programs_cn ?? [],
    tuitionUndergrad: row.tuition_undergrad,
    tuitionGraduate: row.tuition_graduate,
    intake: row.intake,
    intakeCn: row.intake_cn,
    disciplines: row.disciplines ?? [],
    image: row.image,
    logo: row.logo,
    qsRanking: row.qs_ranking,
    qsWorldRanking: row.qs_world_ranking,
    tags: row.tags ?? [],
    tagsCn: row.tags_cn ?? [],
    accommodation: row.accommodation,
    accommodationCn: row.accommodation_cn,
    accommodationCost: row.accommodation_cost,
    accommodationCostCn: row.accommodation_cost_cn,
    accommodationTypes: row.accommodation_types ?? [],
    accommodationTypesCn: row.accommodation_types_cn ?? [],
    gallery: row.gallery ?? [],
    highlights: {
      en: row.highlights_en ?? [],
      zh: row.highlights_zh ?? [],
    },
    scholarshipInfo: row.scholarship_info ?? row.scholarshipInfo,
    scholarshipInfoCn: row.scholarship_info_cn ?? row.scholarshipInfoCn,
    // Canonical behavior from /api/universities/[slug]: fall back to
    // the static-data row when the DB column is missing.
    applicationDeadline: withStaticFallback(
      row.slug as string,
      'applicationDeadline',
      (row.application_deadline ?? row.applicationDeadline) as string | undefined,
    ),
  };
}

export function mapUniversityToDb(u: Record<string, unknown>) {
  return {
    slug: u.slug,
    name: u.name,
    name_cn: u.nameCn,
    city: u.city,
    city_cn: u.cityCn,
    ranking: u.ranking,
    rating: u.rating,
    type: u.type,
    type_cn: u.typeCn,
    established: u.established,
    students: u.students,
    intl_students: u.intlStudents,
    description: u.description,
    description_cn: u.descriptionCn,
    popular_programs: u.popularPrograms,
    popular_programs_cn: u.popularProgramsCn,
    tuition_undergrad: u.tuitionUndergrad,
    tuition_graduate: u.tuitionGraduate,
    intake: u.intake,
    intake_cn: u.intakeCn,
    disciplines: u.disciplines,
    image: u.image,
    logo: u.logo,
    qs_ranking: u.qsRanking,
    qs_world_ranking: u.qsWorldRanking,
    tags: u.tags,
    tags_cn: u.tagsCn,
    accommodation: u.accommodation,
    accommodation_cn: u.accommodationCn,
    accommodation_cost: u.accommodationCost,
    accommodation_cost_cn: u.accommodationCostCn,
    accommodation_types: u.accommodationTypes,
    accommodation_types_cn: u.accommodationTypesCn,
    gallery: u.gallery,
    // Highlights: AI used to return a flat array. The new prompt asks
    // for {en, zh} but we accept both shapes so existing generations
    // and any future ones with the old shape still work.
    highlights_en: extractHighlightArray(u.highlights, 'en'),
    highlights_zh: extractHighlightArray(u.highlights, 'zh'),
    // University-specific scholarship narrative (optional). Read
    // from either camelCase (the new AI prompt shape) or snake_case
    // (DB column name) so it works on both sides of the boundary.
    scholarship_info: u.scholarshipInfo ?? u.scholarship_info,
    scholarship_info_cn: u.scholarshipInfoCn ?? u.scholarship_info_cn,
    application_deadline: u.applicationDeadline ?? u.application_deadline,
  };
}

/**
 * Pull the `en` (or `zh`) sub-array out of a highlights value that
 * may be either:
 *  - the canonical {en: string[], zh: string[]} object (new AI prompt)
 *  - a flat string[] (legacy AI prompt)
 *  - a single string with bullet separators (defensive)
 * Returns an empty array for null/undefined.
 */
export function extractHighlightArray(
  value: unknown,
  lang: 'en' | 'zh',
): string[] {
  if (Array.isArray(value)) {
    // Flat array — same content for both languages (legacy shape).
    return value.map((v) => String(v));
  }
  if (value && typeof value === 'object' && lang in (value as Record<string, unknown>)) {
    const arr = (value as Record<string, unknown>)[lang];
    if (Array.isArray(arr)) return arr.map((v) => String(v));
  }
  if (typeof value === 'string') {
    // Bullet-separated string — split and trim.
    return value
      .split(/[\n•·]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

// Fall back to the matching static row for any bilingual (Cn) field
// the DB row doesn't carry — keeps the page rendering in Chinese for
// legacy rows that pre-date the Cn columns. Same pattern as
// withStaticFallback above.
export function cnFallback(
  slug: string,
  key: 'disciplineCn' | 'durationCn' | 'intakeCn',
): string | undefined {
  const row = staticPrograms.find((p) => p.slug === slug);
  return (row?.[key] as string | undefined) ?? undefined;
}

export function mapProgramFromDb(row: Record<string, unknown>) {
  const slug = row.slug as string;
  return {
    slug,
    name: row.name,
    nameCn: row.name_cn,
    universitySlug: row.university_slug,
    degree: row.degree,
    discipline: row.discipline,
    disciplineCn: row.discipline_cn ?? cnFallback(slug, 'disciplineCn'),
    language: row.language,
    duration: row.duration,
    durationCn: row.duration_cn ?? cnFallback(slug, 'durationCn'),
    tuition: row.tuition,
    description: row.description,
    descriptionCn: row.description_cn,
    requirements: row.requirements,
    requirementsCn: row.requirements_cn,
    curriculum: row.curriculum,
    curriculumCn: row.curriculum_cn,
    scholarshipAvailable: row.scholarship_available,
    intake: row.intake,
    intakeCn: row.intake_cn ?? cnFallback(slug, 'intakeCn'),
  };
}

export function mapProgramToDb(p: Record<string, unknown>) {
  return {
    slug: p.slug,
    name: p.name,
    name_cn: p.nameCn,
    university_slug: p.universitySlug,
    degree: p.degree,
    discipline: p.discipline,
    discipline_cn: p.disciplineCn,
    language: p.language,
    duration: p.duration,
    duration_cn: p.durationCn,
    tuition: p.tuition,
    description: p.description,
    description_cn: p.descriptionCn,
    requirements: p.requirements,
    requirements_cn: p.requirementsCn,
    curriculum: p.curriculum,
    curriculum_cn: p.curriculumCn,
    scholarship_available: p.scholarshipAvailable,
    intake: p.intake,
    intake_cn: p.intakeCn,
  };
}

/** Slugify a string the way the rest of the app does. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function mapScholarshipFromDb(row: Record<string, unknown>) {
  return {
    slug: row.slug,
    name: row.name,
    nameCn: row.name_cn,
    type: row.type,
    degreeLevels: row.degree_levels,
    eligibleRegions: row.eligible_regions,
    duration: row.duration,
    description: row.description,
    descriptionCn: row.description_cn,
    coverage: row.coverage,
    coverageCn: row.coverage_cn,
    requirements: row.requirements,
    requirementsCn: row.requirements_cn,
    applicationProcess: row.application_process,
    applicationProcessCn: row.application_process_cn,
    deadline: row.deadline,
    applicationMethod: row.application_method,
    applicationMethodCn: row.application_method_cn,
  };
}

export function mapScholarshipToDb(s: Record<string, unknown>) {
  return {
    slug: s.slug,
    name: s.name,
    name_cn: s.nameCn,
    type: s.type,
    degree_levels: s.degreeLevels,
    eligible_regions: s.eligibleRegions,
    duration: s.duration,
    description: s.description,
    description_cn: s.descriptionCn,
    coverage: s.coverage,
    coverage_cn: s.coverageCn,
    requirements: s.requirements,
    requirements_cn: s.requirementsCn,
    application_process: s.applicationProcess,
    application_process_cn: s.applicationProcessCn,
    deadline: s.deadline,
    application_method: s.applicationMethod,
    application_method_cn: s.applicationMethodCn,
  };
}

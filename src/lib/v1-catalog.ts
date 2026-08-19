/**
 * Public schema + response shaping for the B2B /v1/catalog/* endpoints.
 *
 * Why a separate schema from the admin mappers?
 *   - Admin mappers expose all DB columns (internal notes, raw English
 *     titles, soft-delete flags, etc.). B2B consumers don't need any
 *     of that and we don't want to leak it.
 *   - The public schema is the API contract — changes here are breaking.
 *   - Centralized here so the OpenAPI spec (Phase C-4) and the
 *     response shape always agree.
 *
 * Language handling:
 *   - Default response includes BOTH en + zh fields (name + nameCn,
 *     city + cityCn, etc.) so consumers can pick the one they need
 *     without a second call.
 *   - `?language=en` strips the `*Cn` fields. `?language=zh` swaps
 *     the primary name to the Chinese version + drops the en-only
 *     fields. `?language=both` (default) returns both.
 *
 * Pagination: standard { page, limit, total, totalPages } envelope.
 * Limit is capped at 100 to protect the DB.
 */

import { mapProgramFromDb, mapUniversityFromDb } from './catalog-mappers';
import type { Program, University } from './data';

export type CatalogLanguage = 'en' | 'zh' | 'both';

export interface CatalogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CatalogResponse<T> {
  data: T[];
  pagination: CatalogPagination;
  meta: { language: CatalogLanguage };
}

export interface CatalogSingleResponse<T> {
  data: T;
  meta: { language: CatalogLanguage };
}

/** Public university shape. Excludes admin-only fields like
 *  `internal_notes`, `created_at`, `updated_at`. Field order in the
 *  JSON response is the order here — stable for consumers diffing. */
export interface PublicUniversity {
  slug: string;
  name: string;
  name_cn: string | null;
  city: string;
  city_cn: string | null;
  ranking: number;
  rating: number;
  type: string;
  type_cn: string | null;
  established: number;
  students: string;
  intl_students: string;
  description: string;
  description_cn: string;
  popular_programs: string[];
  popular_programs_cn: string[];
  tuition_undergrad: string;
  tuition_graduate: string;
  intake: string;
  intake_cn: string;
  disciplines: string[];
  logo: string;
  image: string;
  qs_world_ranking: number;
  tags: string[];
  tags_cn: string[];
  accommodation: string;
  accommodation_cn: string;
  accommodation_cost: string;
  accommodation_cost_cn: string;
  application_deadline: string | null;
}

export interface PublicProgram {
  slug: string;
  name: string;
  name_cn: string;
  university_slug: string;
  degree: 'Bachelor' | 'Master' | 'PhD';
  discipline: string;
  discipline_cn: string;
  language: 'English' | 'Chinese' | 'Bilingual';
  duration: string;
  duration_cn: string;
  tuition: string;
  description: string;
  description_cn: string;
  requirements: string[];
  requirements_cn: string[];
  curriculum: string[];
  curriculum_cn: string[];
  scholarship_available: boolean;
  intake: string;
  intake_cn: string;
}

export function toPublicUniversity(u: University, language: CatalogLanguage): PublicUniversity {
  const base: PublicUniversity = {
    slug: u.slug,
    name: u.name,
    name_cn: u.nameCn || null,
    city: u.city,
    city_cn: u.cityCn || null,
    ranking: u.ranking,
    rating: u.rating,
    type: u.type,
    type_cn: u.typeCn || null,
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
    logo: u.logo,
    image: u.image,
    qs_world_ranking: u.qsWorldRanking,
    tags: u.tags,
    tags_cn: u.tagsCn,
    accommodation: u.accommodation,
    accommodation_cn: u.accommodationCn,
    accommodation_cost: u.accommodationCost,
    accommodation_cost_cn: u.accommodationCostCn,
    application_deadline: u.applicationDeadline || null,
  };
  if (language === 'en') {
    // Keep the full PublicUniversity shape, but null out the Chinese
    // fields so the consumer doesn't accidentally render them.
    return {
      ...base,
      name_cn: null,
      city_cn: null,
      type_cn: null,
      description_cn: '',
      popular_programs_cn: [],
      intake_cn: '',
      tags_cn: [],
      accommodation_cn: '',
      accommodation_cost_cn: '',
    };
  }
  if (language === 'zh') {
    return {
      ...base,
      // Swap primary fields to Chinese (consumer wants zh-first UI)
      name: u.nameCn || u.name,
      city: u.cityCn || u.city,
      type: u.typeCn || u.type,
      intake: u.intakeCn || u.intake,
      description: u.descriptionCn || u.description,
      accommodation: u.accommodationCn || u.accommodation,
      accommodation_cost: u.accommodationCostCn || u.accommodationCost,
    };
  }
  return base;
}

export function toPublicProgram(p: Program, language: CatalogLanguage): PublicProgram {
  const base: PublicProgram = {
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
  if (language === 'en') {
    return {
      ...base,
      name_cn: '',
      discipline_cn: '',
      duration_cn: '',
      description_cn: '',
      requirements_cn: [],
      curriculum_cn: [],
      intake_cn: '',
    };
  }
  if (language === 'zh') {
    return {
      ...base,
      name: p.nameCn || p.name,
      discipline: p.disciplineCn || p.discipline,
      duration: p.durationCn || p.duration,
      description: p.descriptionCn || p.description,
      intake: p.intakeCn || p.intake,
    };
  }
  return base;
}

/** Map a raw DB row (from `select('*')`) into the public shape. Pulled
 *  out so the route file doesn't have to re-implement the mapping. */
export function publicUniversityFromRow(row: Record<string, unknown>, language: CatalogLanguage): PublicUniversity {
  return toPublicUniversity(mapUniversityFromDb(row) as unknown as University, language);
}

export function publicProgramFromRow(row: Record<string, unknown>, language: CatalogLanguage): PublicProgram {
  // mapProgramFromDb reads the slug from the row directly.
  return toPublicProgram(mapProgramFromDb(row) as unknown as Program, language);
}

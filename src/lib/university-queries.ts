import { readCatalogVerification } from '@/lib/validators/catalog-verification';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { universities as staticUniversities, type University } from '@/lib/data';
import { CACHE_TAGS } from '@/lib/cache';
import { UNIVERSITY_LIST_COLUMNS } from '@/lib/catalog-list-columns';

export interface GetUniversitiesOptions {
  limit?: number;
}

async function fetchUniversityBySlug(slug: string): Promise<University | null> {
  if (isSupabaseServerConfigured() && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('universities')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw new Error('Unable to load this university');
    return data ? mapUniversityFromDb(data) : null;
  }

  return staticUniversities.find((u) => u.slug === slug) ?? null;
}

/**
 * Server-only helper for fetching a single university by slug.
 * Tries Supabase first, then falls back to the curated static data.
 * Cached per slug so repeated RSC/API calls avoid hitting the DB.
 *
 * Phase 67: added `revalidate: 3600` so the cache expires after 1
 * hour instead of staying stale forever. Admin actions that need
 * fresh data should still call `revalidateTag(CACHE_TAGS.universities)`
 * explicitly — this is the safety net.
 */
export const getUniversityBySlug = cache(unstable_cache(
  fetchUniversityBySlug,
  ['university-by-slug'],
  {
    tags: [CACHE_TAGS.universities],
    revalidate: 3600,
  },
));

async function fetchUniversities(options: GetUniversitiesOptions = {}): Promise<University[]> {
  const { limit = 1000 } = options;

  if (isSupabaseServerConfigured() && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('universities')
      .select(UNIVERSITY_LIST_COLUMNS)
      .order('ranking', { ascending: true })
      .limit(limit);

    if (error) throw new Error('Unable to load universities');
    const rows = (data ?? []) as unknown as Record<string, unknown>[];
    return rows.map((row) => mapUniversityFromDb(row));
  }

  return staticUniversities.slice(0, limit);
}

/**
 * Server-only helper for fetching the university list.
 * Tries Supabase first, then falls back to the curated static data.
 * Used by the listing API and by the /universities server page so the
 * initial HTML already contains the grid (no client-side fetch delay).
 *
 * Phase 67: added `revalidate: 3600` so the cache expires after 1
 * hour instead of staying stale forever. Admin actions that need
 * fresh data should still call `revalidateTag(CACHE_TAGS.universities)`
 * explicitly — this is the safety net.
 */
export const getUniversities = unstable_cache(
  fetchUniversities,
  ['universities-list'],
  {
    tags: [CACHE_TAGS.universities],
    revalidate: 3600,
  },
);

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return value.split(/[\n•·]+/).map((s) => s.trim()).filter(Boolean);
  return [];
}

function mapUniversityFromDb(row: Record<string, unknown>): University {
  return {
    detailVerification: readCatalogVerification(row.detail_verification),
    slug: String(row.slug ?? ''),
    name: String(row.name ?? ''),
    nameCn: String(row.name_cn ?? ''),
    city: String(row.city ?? ''),
    cityCn: String(row.city_cn ?? ''),
    ranking: Number(row.ranking),
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : 0,
    type: String(row.type ?? ''),
    typeCn: String(row.type_cn ?? ''),
    established: Number(row.established),
    students: String(row.students ?? ''),
    intlStudents: String(row.intl_students ?? ''),
    description: String(row.description ?? ''),
    descriptionCn: String(row.description_cn ?? ''),
    popularPrograms: Array.isArray(row.popular_programs)
      ? row.popular_programs.map(String)
      : [],
    popularProgramsCn: Array.isArray(row.popular_programs_cn)
      ? row.popular_programs_cn.map(String)
      : [],
    tuitionUndergrad: String(row.tuition_undergrad ?? ''),
    tuitionGraduate: String(row.tuition_graduate ?? ''),
    intake: String(row.intake ?? ''),
    intakeCn: String(row.intake_cn ?? ''),
    disciplines: Array.isArray(row.disciplines) ? row.disciplines.map(String) : [],
    image: String(row.image ?? ''),
    logo: row.logo ? String(row.logo ?? '') : '',
    qsRanking: String(row.qs_ranking ?? ''),
    qsWorldRanking: Number(row.qs_world_ranking),
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    tagsCn: Array.isArray(row.tags_cn) ? row.tags_cn.map(String) : [],
    accommodation: String(row.accommodation ?? ''),
    accommodationCn: String(row.accommodation_cn ?? ''),
    accommodationCost: String(row.accommodation_cost ?? ''),
    accommodationCostCn: String(row.accommodation_cost_cn ?? ''),
    accommodationTypes: Array.isArray(row.accommodation_types)
      ? row.accommodation_types.map(String)
      : [],
    accommodationTypesCn: Array.isArray(row.accommodation_types_cn)
      ? row.accommodation_types_cn.map(String)
      : [],
    gallery: Array.isArray(row.gallery) ? row.gallery.map(String) : [],
    highlights:
      row.highlights && typeof row.highlights === 'object'
        ? {
            en: toStringArray((row.highlights as { en?: unknown }).en),
            zh: toStringArray((row.highlights as { zh?: unknown }).zh),
          }
        : { en: toStringArray(row.highlights_en), zh: toStringArray(row.highlights_zh) },
    scholarshipInfo: row.scholarship_info ? String(row.scholarship_info ?? '') : undefined,
    scholarshipInfoCn: row.scholarship_info_cn ? String(row.scholarship_info_cn ?? '') : undefined,
    applicationDeadline: row.application_deadline ? String(row.application_deadline) : undefined,
  };
}

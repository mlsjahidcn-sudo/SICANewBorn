/**
 * Narrow PostgREST SELECT lists for public catalog cards / pickers.
 * Detail and admin edit paths keep select('*').
 */

/** University directory / card fields (no description, gallery, highlights). */
export const UNIVERSITY_LIST_COLUMNS = [
  'slug',
  'name',
  'name_cn',
  'city',
  'city_cn',
  'ranking',
  'rating',
  'type',
  'type_cn',
  'disciplines',
  'image',
  'logo',
  'qs_ranking',
  'qs_world_ranking',
  'tags',
  'tags_cn',
  'accommodation_cost',
  'accommodation_cost_cn',
].join(', ');

/** Program finder / card fields (no description, requirements, curriculum). */
export const PROGRAM_LIST_COLUMNS = [
  'slug',
  'name',
  'name_cn',
  'university_slug',
  'degree',
  'discipline',
  'discipline_cn',
  'language',
  'duration',
  'duration_cn',
  'tuition',
  'scholarship_available',
  'intake',
  'intake_cn',
  'is_featured',
  'is_published',
  'archived_at',
  'featured_rank',
  'intake_season',
  'intake_year',
  'tuition_amount',
  'duration_years',
].join(', ');

/** Auth portal typeahead — minimal columns for SearchableSelect rows. */
export const UNIVERSITY_OPTION_COLUMNS = 'slug, name, name_cn, city, logo';
export const PROGRAM_OPTION_COLUMNS =
  'slug, name, name_cn, university_slug, degree, language, discipline';

/** Short CDN cache for idempotent public catalog GETs. */
export const CATALOG_CACHE_CONTROL =
  'public, s-maxage=60, stale-while-revalidate=300';

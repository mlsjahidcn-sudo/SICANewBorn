import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';
import { mapProgramFromDb, mapUniversityFromDb } from '@/lib/catalog-mappers';
import { catalogQueryString, catalogQueryTerms, normalizeCatalogText, catalogHref, type CatalogQuery, type CatalogRow, type CatalogFacet, type CatalogFilterKey, type CatalogSearchResult, type CatalogSuggestion } from '@/lib/catalog-search';

interface RpcResult {
  version: number;
  rows: Record<string, unknown>[];
  total: number;
  facets: Partial<Record<CatalogFilterKey, CatalogFacet[]>>;
}
export interface PublicCatalogResult extends CatalogSearchResult {
  /** Original mapped records preserve the existing API contract for other callers. */
  programs?: ReturnType<typeof mapProgramFromDb>[];
  universities?: ReturnType<typeof mapUniversityFromDb>[];
  matchedUniversitySlugs: string[];
}

const cache = new Map<string, { at: number; value: PublicCatalogResult }>();
const suggestionCache = new Map<string, { at: number; value: CatalogSuggestion[] }>();
let capability: { at: number; ready: boolean } | undefined;
const inFlight = new Map<string, Promise<PublicCatalogResult>>();
let generation = 0;

/** Off by default. Missing migration or server credentials keeps the original finder available. */
export async function isCatalogSearchEnabled(): Promise<boolean> {
  if (process.env.CATALOG_SEARCH_V2 !== 'true' || !isSupabaseServerConfigured()) return false;
  if (capability && Date.now() - capability.at < 60000) return capability.ready;
  try {
    const { data, error } = await supabaseServer.rpc('catalog_search_version_v2');
    capability = { at: Date.now(), ready: !error && data === 2 };
  } catch {
    capability = { at: Date.now(), ready: false };
  }
  return capability.ready;
}

export function invalidateCatalogSearchCache(): void {
  generation += 1;
  cache.clear();
  suggestionCache.clear();
  // Don't let a query started before a write refill the cache after invalidation.
  inFlight.clear();
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
function numberValue(value: unknown): number | null {
  return value != null && Number.isFinite(Number(value)) ? Number(value) : null;
}

function toCatalogRow(row: Record<string, unknown>): CatalogRow {
  const reason = row.match_reason;
  return {
    slug: stringValue(row.slug), name: stringValue(row.name), nameCn: stringValue(row.name_cn),
    universitySlug: stringValue(row.university_slug), universityName: stringValue(row.university_name),
    universityNameCn: stringValue(row.university_name_cn), logo: stringValue(row.logo),
    city: stringValue(row.city), cityCn: stringValue(row.city_cn), degree: stringValue(row.degree),
    language: stringValue(row.language), duration: stringValue(row.duration), durationCn: stringValue(row.duration_cn),
    tuition: stringValue(row.tuition), intake: stringValue(row.intake), intakeCn: stringValue(row.intake_cn),
    scholarshipAvailable: typeof row.scholarship_available === 'boolean' ? row.scholarship_available : null,
    ranking: numberValue(row.ranking), qsWorldRanking: numberValue(row.qs_world_ranking),
    matchingProgramCount: numberValue(row.matching_program_count) ?? undefined,
    matchReason: reason === 'title' || reason === 'subject' || reason === 'location' || reason === 'university' ? reason : undefined,
  };
}

async function fetchCatalog(query: CatalogQuery, locale: 'en' | 'zh', includeFacets: boolean): Promise<PublicCatalogResult> {
  const { data, error } = await supabaseServer.rpc('catalog_search_v2', {
    catalog_kind: query.kind, terms: catalogQueryTerms(query.q), phrase: normalizeCatalogText(query.q),
    filters: query.filters, sort_key: query.sort, page_number: query.page, page_size: query.limit, include_facets: includeFacets,
  });
  if (error || !data || data.version !== 2) throw new Error('Catalog search is temporarily unavailable');
  const raw = data as RpcResult;
  let suggestions: string[] = [];
  if (raw.total === 0 && query.q.length >= 3 && includeFacets) {
    const spelling = await supabaseServer.rpc('catalog_spellings_v2', { query: query.q, catalog_kind: query.kind, locale });
    if (!spelling.error && Array.isArray(spelling.data)) suggestions = spelling.data.filter((value: unknown): value is string => typeof value === 'string' && normalizeCatalogText(value) !== normalizeCatalogText(query.q)).slice(0, 3);
  }
  return {
    kind: query.kind, rows: raw.rows.map(toCatalogRow), total: raw.total, page: query.page, limit: query.limit,
    totalPages: Math.ceil(raw.total / query.limit), facets: raw.facets, suggestions,
    ...(query.kind === 'programs' ? { programs: raw.rows.map(mapProgramFromDb) } : { universities: raw.rows.map(mapUniversityFromDb) }),
    matchedUniversitySlugs: [...new Set(raw.rows.filter((row) => row.match_reason === 'university').map((row) => stringValue(row.university_slug)).filter(Boolean))],
  };
}

export async function searchPublicCatalog(query: CatalogQuery, locale: 'en' | 'zh' = 'en', includeFacets = true): Promise<PublicCatalogResult> {
  const key = `${query.kind}:${locale}:${includeFacets}:${catalogQueryString(query)}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < 60000) return cached.value;
  const pending = inFlight.get(key);
  if (pending) return pending;
  const promise = fetchCatalog(query, locale, includeFacets);
  inFlight.set(key, promise);
  try {
    const value = await promise;
    if (inFlight.get(key) === promise) {
      if (cache.size >= 200) cache.delete(cache.keys().next().value ?? '');
      cache.set(key, { at: Date.now(), value });
    }
    return value;
  } finally {
    if (inFlight.get(key) === promise) inFlight.delete(key);
  }
}

export async function getCatalogSuggestions(q: string, locale: 'en' | 'zh'): Promise<CatalogSuggestion[]> {
  if (q.trim().length < 2) return [];
  const key = `${locale}:${q.trim().toLowerCase()}`;
  const cached = suggestionCache.get(key);
  if (cached && Date.now() - cached.at < 30000) return cached.value;
  const base = { q: q.trim().slice(0, 200), filters: {}, sort: 'relevance', page: 1, limit: 4 };
  const startedGeneration = generation;
  const [programs, universities] = await Promise.all([
    searchPublicCatalog({ ...base, kind: 'programs' }, locale, false),
    searchPublicCatalog({ ...base, kind: 'universities' }, locale, false),
  ]);
  const localized = (en: string | undefined, zh: string | undefined): string => locale === 'zh' && zh ? zh : en ?? '';
  const value: CatalogSuggestion[] = [
    ...programs.rows.map((row) => ({
      kind: 'programs' as const, label: localized(row.name, row.nameCn),
      sublabel: [localized(row.universityName, row.universityNameCn), row.degree, row.language].filter(Boolean).join(' · '),
      // A program suggestion is a search, so the student can compare other offerings.
      href: catalogHref({ kind: 'programs', q: localized(row.name, row.nameCn), filters: { university: row.universitySlug ?? '' }, sort: 'relevance', page: 1, limit: 24 }),
    })),
    ...universities.rows.map((row) => ({
      kind: 'universities' as const, label: localized(row.name, row.nameCn),
      sublabel: localized(row.city, row.cityCn), href: `/universities/${encodeURIComponent(row.slug)}`,
    })),
  ];
  if (suggestionCache.size >= 100) suggestionCache.delete(suggestionCache.keys().next().value ?? '');
  if (startedGeneration === generation) suggestionCache.set(key, { at: Date.now(), value });
  return value;
}

export function catalogClientResult(result: PublicCatalogResult): CatalogSearchResult {
  const { kind, rows, total, page, limit, totalPages, facets, suggestions } = result;
  return { kind, rows, total, page, limit, totalPages, facets, suggestions };
}

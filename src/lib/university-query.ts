/**
 * Server-side university list/filter/paginate — mirrors program-query
 * so the legacy (CATALOG_SEARCH_V2=off) /universities path never ships
 * the full catalogue into HTML for client-side filtering.
 */
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { universities as staticUniversities, type University } from '@/lib/data';
import { sanitizeOrTerm, parseIntParam } from '@/lib/postgrest';
import { mapUniversityFromDb } from '@/lib/catalog-mappers';
import { UNIVERSITY_LIST_COLUMNS } from '@/lib/catalog-list-columns';

export const DEFAULT_UNIVERSITY_PAGE_SIZE = 24;

export interface UniversityQueryParams {
  search?: string | null;
  city?: string | null;
  discipline?: string | null;
  tag?: string | null;
  type?: string | null;
  /** Minimum rating (e.g. 4.5). 0 / unset = no filter. */
  minRating?: number | null;
  sort?: string | null;
  page?: number | null;
  limit?: number | null;
}

export interface UniversityQueryResult {
  universities: University[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function parseUniversityQueryParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): UniversityQueryParams {
  const get = (key: string): string | null => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key);
    }
    const raw = searchParams[key];
    if (Array.isArray(raw)) return raw[0] ?? null;
    return raw ?? null;
  };

  const ratingRaw = get('rating') ?? get('minRating');
  const minRating = ratingRaw ? Number.parseFloat(ratingRaw) : 0;

  return {
    search: get('q') ?? get('search'),
    city: get('city'),
    discipline: get('discipline') ?? get('disc'),
    tag: get('tag'),
    type: get('type'),
    minRating: Number.isFinite(minRating) && minRating > 0 ? minRating : null,
    sort: get('sort') || 'ranking',
    page: parseIntParam(get('page'), 1, { min: 1 }),
    limit: parseIntParam(get('limit'), DEFAULT_UNIVERSITY_PAGE_SIZE, { min: 1, max: 500 }),
  };
}

function applyStaticFilters(
  rows: University[],
  params: UniversityQueryParams,
): University[] {
  let filtered = [...rows];
  const term = (params.search ?? '').trim().toLowerCase();
  if (term) {
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.nameCn.includes(term) ||
        u.city.toLowerCase().includes(term) ||
        u.cityCn.includes(term),
    );
  }
  if (params.city) {
    filtered = filtered.filter((u) => u.city === params.city || u.cityCn === params.city);
  }
  if (params.discipline) {
    filtered = filtered.filter((u) => u.disciplines.includes(params.discipline!));
  }
  if (params.tag) {
    filtered = filtered.filter((u) => u.tags.includes(params.tag!));
  }
  if (params.type) {
    filtered = filtered.filter((u) =>
      params.type === 'Public'
        ? u.type === 'Public University'
        : u.type !== 'Public University',
    );
  }
  if (params.minRating && params.minRating > 0) {
    filtered = filtered.filter((u) => u.rating >= params.minRating!);
  }
  const sort = params.sort || 'ranking';
  if (sort === 'ranking') filtered.sort((a, b) => a.ranking - b.ranking);
  else if (sort === 'qsWorld') filtered.sort((a, b) => a.qsWorldRanking - b.qsWorldRanking);
  else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else filtered.sort((a, b) => a.name.localeCompare(b.name));
  return filtered;
}

export async function queryUniversities(
  params: UniversityQueryParams,
): Promise<UniversityQueryResult> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(500, Math.max(1, params.limit ?? DEFAULT_UNIVERSITY_PAGE_SIZE));
  const sort = params.sort || 'ranking';
  const term = params.search ? sanitizeOrTerm(params.search) : '';
  const hasFilters =
    !!term ||
    !!params.city ||
    !!params.discipline ||
    !!params.tag ||
    !!params.type ||
    (params.minRating != null && params.minRating > 0);

  if (isSupabaseServerConfigured() && supabaseServer) {
    let query = supabaseServer
      .from('universities')
      .select(UNIVERSITY_LIST_COLUMNS, { count: 'exact' });

    if (params.city) query = query.eq('city', params.city);
    if (params.discipline) query = query.contains('disciplines', [params.discipline]);
    if (params.tag) query = query.contains('tags', [params.tag]);
    if (params.type === 'Public') query = query.ilike('type', 'public%');
    else if (params.type === 'Private') query = query.ilike('type', 'private%');
    if (params.minRating != null && params.minRating > 0) {
      query = query.gte('rating', params.minRating);
    }
    if (term) {
      query = query.or(`name.ilike.%${term}%,name_cn.ilike.%${term}%,city.ilike.%${term}%`);
    }

    if (sort === 'name') query = query.order('name', { ascending: true });
    else if (sort === 'rating') query = query.order('rating', { ascending: false });
    else if (sort === 'qsWorld') query = query.order('qs_world_ranking', { ascending: true });
    else query = query.order('ranking', { ascending: true });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count, error } = await query.range(from, to);

    if (!error && data) {
      if (data.length > 0 || hasFilters) {
        const rows = data as unknown as Record<string, unknown>[];
        return {
          universities: rows.map((row) => mapUniversityFromDb(row) as unknown as University),
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        };
      }
    }
  }

  const filtered = applyStaticFilters(staticUniversities, params);
  const total = filtered.length;
  const from = (page - 1) * limit;
  return {
    universities: filtered.slice(from, from + limit),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

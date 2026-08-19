// Phase 71: when changing this route, update openapi/v1.yaml so the B2B docs stay in sync.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildServiceClient } from '@/lib/supabase-auth';
import {
  CatalogLanguage,
  CatalogResponse,
  PublicUniversity,
  publicUniversityFromRow,
} from '@/lib/v1-catalog';
import { cacheGet, cacheKey, cacheSet } from '@/lib/v1-catalog-cache';
import { setupV1Request, v1ResponseHeaders } from '@/lib/v1-route-helpers';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const CACHE_TTL_SECONDS = 600; // 10 min

const QuerySchema = z.object({
  q: z.string().min(1).max(120).optional(),
  city: z.string().min(1).max(80).optional(),
  tag: z.string().min(1).max(40).optional(),
  type: z.string().min(1).max(40).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  language: z.enum(['en', 'zh', 'both']).default('both'),
  sort: z.enum(['ranking', 'rating', 'name', 'created_at']).default('ranking'),
  order: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

/**
 * GET /v1/catalog/universities
 *
 * Auth: Bearer sk_live_… with scope read:catalog.
 *
 * Query params (all optional):
 *   q          : free-text search on name + city + nameCn + cityCn
 *   city       : exact match (e.g. "Beijing")
 *   tag        : tag filter, e.g. "985" / "211" / "DFC"
 *   type       : "Public" | "Private" (case-sensitive to match the DB)
 *   minRating  : 0–5, inclusive
 *   language   : "en" | "zh" | "both" (default "both")
 *   sort       : ranking | rating | name | created_at (default ranking)
 *   order      : asc | desc (default asc — top-ranked first)
 *   page       : 1-based (default 1)
 *   limit      : 1–100 (default 20)
 *
 * Response: { data: PublicUniversity[], pagination: {...}, meta: {...} }
 *
 * Caching: 10-min in-memory TTL per (api_key_id, query_string). Admin
 * edits appear within 10 min. Use ?nocache=1 to bypass.
 */
export async function GET(request: NextRequest) {
  // 1. Auth + scope + rate limit + CORS (shared across all /v1/* routes)
  const setup = await setupV1Request(request);
  if (!setup.ok) return setup.response;
  const { key, rate, cors } = setup;

  // 2. Parse + validate query
  const { searchParams } = new URL(request.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', issues: parsed.error.flatten() },
      { status: 400, headers: v1ResponseHeaders(rate, cors) },
    );
  }
  const q = parsed.data;
  const language: CatalogLanguage = q.language;
  const bypassCache = searchParams.get('nocache') === '1';

  // 3. Cache lookup (per-key, per-query)
  const ck = cacheKey(key.id, searchParams.toString());
  if (!bypassCache) {
    const hit = cacheGet<CatalogResponse<PublicUniversity>>(ck);
    if (hit) {
      return NextResponse.json(hit, {
        headers: v1ResponseHeaders(rate, cors, {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=60',
        }),
      });
    }
  }

  // 4. Build Supabase query
  const service = buildServiceClient();
  let query = service
    .from('universities')
    .select('*', { count: 'exact' });

  if (q.q) {
    // Postgres full-text-ish search across name + city. We use ilike on
    // the Latin fields; the Chinese fields also get the same substring
    // (Postgres can match CJK with ilike when the column collation is C).
    const term = `%${q.q.replace(/[%_]/g, '\\$&')}%`;
    query = query.or(
      `name.ilike.${term},name_cn.ilike.${term},city.ilike.${term},city_cn.ilike.${term}`,
    );
  }
  if (q.city) {
    query = query.or(`city.ilike.${q.city},city_cn.ilike.${q.city}`);
  }
  if (q.tag) {
    query = query.contains('tags', [q.tag]);
  }
  if (q.type) {
    query = query.eq('type', q.type);
  }
  if (q.minRating !== undefined) {
    query = query.gte('rating', q.minRating);
  }

  // 5. Sort + paginate
  query = query.order(q.sort, { ascending: q.order === 'asc' });
  const from = (q.page - 1) * q.limit;
  query = query.range(from, from + q.limit - 1);

  const { data, count, error } = await query;
  if (error) {
    console.error('[v1/catalog/universities] query error:', error);
    return NextResponse.json(
      { error: 'Query failed' },
      { status: 500, headers: v1ResponseHeaders(rate, cors) },
    );
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const items = rows.map((row) => publicUniversityFromRow(row, language));
  const total = count ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(total / q.limit));

  const response: CatalogResponse<PublicUniversity> = {
    data: items,
    pagination: {
      page: q.page,
      limit: q.limit,
      total,
      totalPages,
    },
    meta: { language },
  };

  // 6. Cache + return
  cacheSet(ck, response, CACHE_TTL_SECONDS);
  return NextResponse.json(response, {
    headers: v1ResponseHeaders(rate, cors, {
      'X-Cache': bypassCache ? 'BYPASS' : 'MISS',
      'Cache-Control': 'public, max-age=60',
    }),
  });
}

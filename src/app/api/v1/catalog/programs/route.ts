import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildServiceClient } from '@/lib/supabase-auth';
import {
  CatalogLanguage,
  CatalogResponse,
  PublicProgram,
  publicProgramFromRow,
} from '@/lib/v1-catalog';
import { cacheGet, cacheKey, cacheSet } from '@/lib/v1-catalog-cache';
import { rateLimitHeaders, setupV1Request } from '@/lib/v1-route-helpers';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const CACHE_TTL_SECONDS = 600;

const QuerySchema = z.object({
  q: z.string().min(1).max(120).optional(),
  university: z.string().min(1).max(120).optional(), // slug of the parent uni
  degree: z.enum(['Bachelor', 'Master', 'PhD']).optional(),
  discipline: z.string().min(1).max(80).optional(),
  language: z.enum(['English', 'Chinese', 'Bilingual']).optional(), // instruction language
  scholarship: z.coerce.boolean().optional(),
  pageLanguage: z.enum(['en', 'zh', 'both']).default('both'),
  sort: z.enum(['name', 'tuition', 'created_at']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

/**
 * GET /v1/catalog/programs
 *
 * Auth: Bearer sk_live_… with scope read:catalog.
 *
 * Query params (all optional):
 *   q            : free-text search on name + nameCn
 *   university   : parent university slug
 *   degree       : "Bachelor" | "Master" | "PhD"
 *   discipline   : e.g. "Engineering", "Business"
 *   language     : "English" | "Chinese" | "Bilingual" (instruction language)
 *   scholarship  : true to filter only scholarship-available programs
 *   pageLanguage : response field shaping — "en" | "zh" | "both" (default "both")
 *   sort         : name | tuition | created_at (default name)
 *   order        : asc | desc
 *   page, limit  : standard pagination
 */
export async function GET(request: NextRequest) {
  const setup = await setupV1Request(request);
  if (!setup.ok) return setup.response;
  const { key, rate } = setup;

  const { searchParams } = new URL(request.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', issues: parsed.error.flatten() },
      { status: 400, headers: rateLimitHeaders(rate) },
    );
  }
  const q = parsed.data;
  const language: CatalogLanguage = q.pageLanguage;
  const bypassCache = searchParams.get('nocache') === '1';

  const ck = cacheKey(key.id, searchParams.toString());
  if (!bypassCache) {
    const hit = cacheGet<CatalogResponse<PublicProgram>>(ck);
    if (hit) {
      return NextResponse.json(hit, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=60',
          ...rateLimitHeaders(rate),
        },
      });
    }
  }

  const service = buildServiceClient();
  let query = service.from('programs').select('*', { count: 'exact' });

  if (q.q) {
    const term = `%${q.q.replace(/[%_]/g, '\\$&')}%`;
    query = query.or(`name.ilike.${term},name_cn.ilike.${term},discipline.ilike.${term},discipline_cn.ilike.${term}`);
  }
  if (q.university) {
    query = query.eq('university_slug', q.university);
  }
  if (q.degree) {
    query = query.eq('degree', q.degree);
  }
  if (q.discipline) {
    query = query.or(`discipline.ilike.${q.discipline},discipline_cn.ilike.${q.discipline}`);
  }
  if (q.language) {
    query = query.eq('language', q.language);
  }
  if (q.scholarship !== undefined) {
    query = query.eq('scholarship_available', q.scholarship);
  }

  query = query.order(q.sort, { ascending: q.order === 'asc' });
  const from = (q.page - 1) * q.limit;
  query = query.range(from, from + q.limit - 1);

  const { data, count, error } = await query;
  if (error) {
    console.error('[v1/catalog/programs] query error:', error);
    return NextResponse.json(
      { error: 'Query failed' },
      { status: 500, headers: rateLimitHeaders(rate) },
    );
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const items = rows.map((row) => publicProgramFromRow(row, language));
  const total = count ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(total / q.limit));

  const response: CatalogResponse<PublicProgram> = {
    data: items,
    pagination: { page: q.page, limit: q.limit, total, totalPages },
    meta: { language },
  };

  cacheSet(ck, response, CACHE_TTL_SECONDS);
  return NextResponse.json(response, {
    headers: {
      'X-Cache': bypassCache ? 'BYPASS' : 'MISS',
      'Cache-Control': 'public, max-age=60',
      ...rateLimitHeaders(rate),
    },
  });
}

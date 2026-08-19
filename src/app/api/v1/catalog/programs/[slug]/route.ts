// Phase 71: when changing this route, update openapi/v1.yaml so the B2B docs stay in sync.
import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient } from '@/lib/supabase-auth';
import {
  CatalogLanguage,
  CatalogSingleResponse,
  PublicProgram,
  publicProgramFromRow,
} from '@/lib/v1-catalog';
import { cacheGet, cacheKey, cacheSet } from '@/lib/v1-catalog-cache';
import { rateLimitHeaders, setupV1Request, v1ResponseHeaders } from '@/lib/v1-route-helpers';

export const dynamic = 'force-dynamic';

const CACHE_TTL_SECONDS = 600;

/**
 * GET /v1/catalog/programs/[slug]
 *
 * Single program by slug. 404 if not found.
 * `?pageLanguage=en|zh|both` controls response field shaping.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const setup = await setupV1Request(request);
  if (!setup.ok) return setup.response;
  const { key, rate, cors } = setup;

  const { slug } = await context.params;
  if (!slug || typeof slug !== 'string') {
    return NextResponse.json(
      { error: 'Missing slug' },
      { status: 400, headers: v1ResponseHeaders(rate, cors) },
    );
  }

  const { searchParams } = new URL(request.url);
  const language = (searchParams.get('pageLanguage') ?? 'both') as CatalogLanguage;
  const bypassCache = searchParams.get('nocache') === '1';

  const ck = cacheKey(key.id, `program:${slug}:${searchParams.toString()}`);
  if (!bypassCache) {
    const hit = cacheGet<CatalogSingleResponse<PublicProgram>>(ck);
    if (hit) {
      return NextResponse.json(hit, {
        headers: v1ResponseHeaders(rate, cors, {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=60',
        }),
      });
    }
  }

  const service = buildServiceClient();
  const { data, error } = await service
    .from('programs')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[v1/catalog/programs/:slug] query error:', error);
    return NextResponse.json(
      { error: 'Query failed' },
      { status: 500, headers: v1ResponseHeaders(rate, cors) },
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: 'Program not found' },
      { status: 404, headers: v1ResponseHeaders(rate, cors) },
    );
  }

  const response: CatalogSingleResponse<PublicProgram> = {
    data: publicProgramFromRow(data as Record<string, unknown>, language),
    meta: { language },
  };

  cacheSet(ck, response, CACHE_TTL_SECONDS);
  return NextResponse.json(response, {
    headers: v1ResponseHeaders(rate, cors, {
      'X-Cache': bypassCache ? 'BYPASS' : 'MISS',
      'Cache-Control': 'public, max-age=60',
    }),
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { requireApiKey, hasScope } from '@/lib/api-auth';
import {
  CatalogLanguage,
  CatalogSingleResponse,
  PublicUniversity,
  publicUniversityFromRow,
} from '@/lib/v1-catalog';
import { cacheGet, cacheKey, cacheSet } from '@/lib/v1-catalog-cache';

export const dynamic = 'force-dynamic';

const CACHE_TTL_SECONDS = 600;

/**
 * GET /v1/catalog/universities/[slug]
 *
 * Single university by slug. Public schema (no admin fields).
 * 404 if the slug doesn't exist. `?language=en|zh|both` controls
 * which fields are returned (default both).
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await requireApiKey(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!hasScope(auth.key, 'read:catalog')) {
    return NextResponse.json(
      { error: 'API key missing required scope: read:catalog' },
      { status: 403 },
    );
  }
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 503 });
  }

  const { slug } = await context.params;
  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const language = (searchParams.get('language') ?? 'both') as CatalogLanguage;
  const bypassCache = searchParams.get('nocache') === '1';

  const ck = cacheKey(auth.key.id, `university:${slug}:${searchParams.toString()}`);
  if (!bypassCache) {
    const hit = cacheGet<CatalogSingleResponse<PublicUniversity>>(ck);
    if (hit) {
      return NextResponse.json(hit, {
        headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=60' },
      });
    }
  }

  const service = buildServiceClient();
  const { data, error } = await service
    .from('universities')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[v1/catalog/universities/:slug] query error:', error);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'University not found' }, { status: 404 });
  }

  const response: CatalogSingleResponse<PublicUniversity> = {
    data: publicUniversityFromRow(data as Record<string, unknown>, language),
    meta: { language },
  };

  cacheSet(ck, response, CACHE_TTL_SECONDS);
  return NextResponse.json(response, {
    headers: { 'X-Cache': bypassCache ? 'BYPASS' : 'MISS', 'Cache-Control': 'public, max-age=60' },
  });
}

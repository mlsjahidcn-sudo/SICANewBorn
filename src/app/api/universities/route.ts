import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { CACHE_TAGS } from '@/lib/cache';
import { universitySchema } from '@/lib/validators/university';
import { validationErrorResponse } from '@/lib/validators/shared';
import { requireAdmin } from '@/lib/supabase-auth';
import { mapUniversityFromDb, mapUniversityToDb } from '@/lib/catalog-mappers';
import { invalidateLiveCatalogCache } from '@/lib/ai/live-data-context';
import { importUniversityMediaFields } from '@/lib/university-media';
import { parseCatalogQuery } from '@/lib/catalog-search';
import { isCatalogSearchEnabled, searchPublicCatalog, invalidateCatalogSearchCache } from '@/lib/catalog-search-server';
import { getServerLocale } from '@/lib/server-t';
import { parseUniversityQueryParams, queryUniversities } from '@/lib/university-query';
import { CATALOG_CACHE_CONTROL } from '@/lib/catalog-list-columns';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (await isCatalogSearchEnabled()) {
    try {
      const started = performance.now();
      const params = new URLSearchParams(searchParams);
      // Existing API consumers default to eight; the public finder explicitly requests 24.
      if (!params.has('limit')) params.set('limit', '8');
      const locale = searchParams.get('locale');
      const result = await searchPublicCatalog(parseCatalogQuery('universities', params), locale === 'en' || locale === 'zh' ? locale : await getServerLocale());
      return NextResponse.json(result, {
        headers: {
          'Cache-Control': CATALOG_CACHE_CONTROL,
          'Server-Timing': `search;dur=${(performance.now() - started).toFixed(1)}`,
        },
      });
    } catch {
      return NextResponse.json({ error: 'Catalog search is temporarily unavailable' }, { status: 503 });
    }
  }

  const started = performance.now();
  const result = await queryUniversities(parseUniversityQueryParams(searchParams));
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': CATALOG_CACHE_CONTROL,
      'Server-Timing': `search;dur=${(performance.now() - started).toFixed(1)}`,
    },
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const raw = await request.json();
    const parsed = universitySchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const media = await importUniversityMediaFields({
      slug: parsed.data.slug,
      logo: parsed.data.logo,
      image: parsed.data.image,
      gallery: parsed.data.gallery,
    });
    const withMedia = {
      ...parsed.data,
      logo: media.logo ?? parsed.data.logo,
      image: media.image ?? parsed.data.image,
      gallery: media.gallery ?? parsed.data.gallery,
    };

    const dbRecord = mapUniversityToDb(withMedia);
    const { data, error } = await supabaseServer
      .from('universities')
      .insert(dbRecord)
      .select()
      .single();

    if (error) {
      console.error('[universities POST] supabase error:', error);
      return NextResponse.json({ error: 'Failed to create university' }, { status: 400 });
    }
    revalidateTag(CACHE_TAGS.universities, 'default');
    revalidateTag(CACHE_TAGS.university(String(data.slug)), 'default');
    invalidateLiveCatalogCache();
    invalidateCatalogSearchCache();
    return NextResponse.json(
      { university: mapUniversityFromDb(data), mediaImport: media.report },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

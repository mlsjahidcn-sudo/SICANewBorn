import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { CACHE_TAGS } from '@/lib/cache';
import { programSchema } from '@/lib/validators/program';
import { validationErrorResponse } from '@/lib/validators/shared';
import { requireAdmin } from '@/lib/supabase-auth';
// Phase 173: all filtering/search/paging lives in one shared module so
// this route and the /programs RSC can't drift apart again (they had —
// the client searched `description` too, and `sort=default` only existed
// client-side). This route is now a thin HTTP adapter over it.
import { parseProgramQueryParams, queryPrograms, invalidateProgramQueryCache } from '@/lib/program-query';
// Track 1.3 U2: DB mappers consolidated into src/lib/catalog-mappers.ts.
import { mapProgramFromDb, mapProgramToDb } from '@/lib/catalog-mappers';
import { invalidateLiveCatalogCache } from '@/lib/ai/live-data-context';
import { invalidateProgramFacetsCache } from '@/lib/program-facets';
import { parseCatalogQuery } from '@/lib/catalog-search';
import { isCatalogSearchEnabled, searchPublicCatalog, invalidateCatalogSearchCache } from '@/lib/catalog-search-server';
import { getServerLocale } from '@/lib/server-t';
import { CATALOG_CACHE_CONTROL } from '@/lib/catalog-list-columns';

/**
 * GET /api/programs — public catalogue query.
 *
 * Supports `degree`, `language`, `discipline`, `university` (slug),
 * `search` (program name EN/CN **or** university name EN/CN — Phase 173),
 * `sort` (`name` | `tuition` | `featured_rank`), `page`, `limit`, plus the
 * Phase 128a admin-only status flags `featured` / `include_archived` /
 * `only_archived`.
 *
 * `matchedUniversitySlugs` is returned so the UI can explain *why* a row
 * matched ("6 programs at Tsinghua University") instead of silently
 * widening the search.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const administrative = ['featured', 'include_archived', 'only_archived'].some((key) => searchParams.get(key) === 'true');
  if (administrative) {
    const auth = await requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  } else if (await isCatalogSearchEnabled()) {
    try {
      const started = performance.now();
      const locale = searchParams.get('locale');
      const result = await searchPublicCatalog(parseCatalogQuery('programs', searchParams), locale === 'en' || locale === 'zh' ? locale : await getServerLocale());
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
  const result = await queryPrograms(parseProgramQueryParams(searchParams));
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': CATALOG_CACHE_CONTROL,
      'Server-Timing': `search;dur=${(performance.now() - started).toFixed(1)}`,
    },
  });
}

export async function POST(request: Request) {
  // Phase 71: catalog mutations are admin-only (service-role client,
  // RLS bypass — see /api/universities/[slug]).
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const raw = await request.json();
    const parsed = programSchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const dbRecord = mapProgramToDb(parsed.data);
    const { data, error } = await supabaseServer
      .from('programs')
      .insert(dbRecord)
      .select()
      .single();

    if (error) {
      console.error('[programs POST] supabase error:', error);
      return NextResponse.json({ error: 'Failed to create program' }, { status: 400 });
    }
    revalidateTag(CACHE_TAGS.programs, 'default');
    revalidateTag(CACHE_TAGS.program(String(data.slug)), 'default');
    // Phase 121: the chatbot's RAG catalog has its own 5-min cache.
    invalidateLiveCatalogCache();
    invalidateCatalogSearchCache();
    invalidateProgramFacetsCache();
    invalidateProgramQueryCache();
    // Phase 72: fire program.created webhook
    return NextResponse.json({ program: mapProgramFromDb(data) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache';
import { buildLanguageAlternates } from '@/lib/alternates';
import { buildPageOpenGraph } from '@/lib/page-opengraph';
import { getServerT } from '@/lib/server-t';
import UniversitiesClient from './_components/universities-client';
import { buildItemListSchema, buildBreadcrumbSchema } from '@/lib/catalog-schema';
import { parseCatalogQuery, type CatalogQuery } from '@/lib/catalog-search';
import { catalogClientResult, isCatalogSearchEnabled, searchPublicCatalog } from '@/lib/catalog-search-server';
import { CatalogClient } from '@/components/catalog/catalog-client';
import { getServerLocale } from '@/lib/server-t';
import { documentTitle } from '@/lib/document-title';
import {
  DEFAULT_UNIVERSITY_PAGE_SIZE,
  parseUniversityQueryParams,
  queryUniversities,
} from '@/lib/university-query';

// Cache public data, not cookie-localized HTML. Catalog writes invalidate both tags.
const getUniversityDirectory = unstable_cache(
  async (query: CatalogQuery, locale: 'en' | 'zh', releaseFlag: string) => {
    if (releaseFlag !== 'true' || !await isCatalogSearchEnabled()) return { enabled: false, result: null };
    return { enabled: true, result: catalogClientResult(await searchPublicCatalog(query, locale)) };
  },
  ['university-directory'],
  { tags: [CACHE_TAGS.universities, CACHE_TAGS.programs], revalidate: 300 },
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: documentTitle(t('seo.universitiesTitle')),
    description: t('seo.universitiesDescription'),
    alternates: await buildLanguageAlternates('/universities'),
    ...buildPageOpenGraph({ title: t('seo.universitiesTitle'), description: t('seo.universitiesDescription'), path: '/universities' }),
  };
}

export default async function UniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string') sp.set(key, value);
  }

  const query = parseCatalogQuery('universities', sp);
  const directory = await getUniversityDirectory(query, await getServerLocale(), process.env.CATALOG_SEARCH_V2 ?? 'false')
    .catch(() => ({ enabled: true, result: null }));
  if (directory.enabled) {
    const result = directory.result;
    const schema = buildItemListSchema(
      'Chinese universities for international students',
      (result?.rows ?? []).map((row) => ({ name: row.name, url: `/universities/${row.slug}` })),
    );
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
        />
        <CatalogClient initialQuery={query} initialResult={result} />
      </>
    );
  }

  if (!sp.has('limit')) sp.set('limit', String(DEFAULT_UNIVERSITY_PAGE_SIZE));
  const initialResult = await queryUniversities(parseUniversityQueryParams(sp));

  const itemListSchema = buildItemListSchema(
    'Chinese universities for international students',
    initialResult.universities.map((u) => ({ name: String(u.name ?? ''), url: `/universities/${u.slug}` })),
  );
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Universities', path: '/universities' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <UniversitiesClient initialResult={initialResult} />
    </>
  );
}

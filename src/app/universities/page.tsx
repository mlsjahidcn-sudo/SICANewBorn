import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import { buildPageOpenGraph } from '@/lib/page-opengraph';
import { getServerT } from '@/lib/server-t';
import UniversitiesClient from './_components/universities-client';
import { buildItemListSchema, buildBreadcrumbSchema } from '@/lib/catalog-schema';
import { parseCatalogQuery } from '@/lib/catalog-search';
import { catalogClientResult, isCatalogSearchEnabled, searchPublicCatalog } from '@/lib/catalog-search-server';
import { CatalogClient } from '@/components/catalog/catalog-client';
import { getServerLocale } from '@/lib/server-t';
import { documentTitle } from '@/lib/document-title';
import {
  DEFAULT_UNIVERSITY_PAGE_SIZE,
  parseUniversityQueryParams,
  queryUniversities,
} from '@/lib/university-query';

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

  if (await isCatalogSearchEnabled()) {
    const query = parseCatalogQuery('universities', sp);
    const result = await searchPublicCatalog(query, await getServerLocale())
      .then(catalogClientResult)
      .catch(() => null);
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

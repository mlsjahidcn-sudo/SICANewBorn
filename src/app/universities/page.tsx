import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import { buildPageOpenGraph } from '@/lib/page-opengraph';
import { getUniversities } from '@/lib/university-queries';
import { getServerT } from '@/lib/server-t';
import UniversitiesClient from './_components/universities-client';
import { buildItemListSchema, buildBreadcrumbSchema } from '@/lib/catalog-schema';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('seo.universitiesTitle'),
    description: t('seo.universitiesDescription'),
    alternates: await buildLanguageAlternates('/universities'),
    ...buildPageOpenGraph({ title: t('seo.universitiesTitle'), description: t('seo.universitiesDescription'), path: '/universities' }),
  };
}

export default async function UniversitiesPage() {
  // Fetch on the server so the first paint already contains the grid
  // instead of waiting for a client-side /api/universities round-trip.
  const universities = await getUniversities({ limit: 1000 });

  // ItemList is built from the SAME array handed to the client, so the
  // markup can never drift from what the page actually offers.
  const itemListSchema = buildItemListSchema(
    'Chinese universities for international students',
    universities.map((u) => ({ name: u.name, url: `/universities/${u.slug}` }))
  );
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Universities', path: '/universities' },
  ]);

  return (
    <>
      {/* JSON-LD inlined in the initial HTML so crawlers and answer
          engines need no JS execution. No AggregateRating: `rating`
          is an editorial SICA value, not a review aggregate. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <UniversitiesClient initialUniversities={universities} />
    </>
  );
}

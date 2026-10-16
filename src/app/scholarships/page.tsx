import { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import { buildPageOpenGraph } from '@/lib/page-opengraph';
import { getScholarships } from '@/lib/scholarship-queries';
import { buildItemListSchema } from '@/lib/catalog-schema';
import { getServerT } from '@/lib/server-t';
import ScholarshipsClient from './_components/scholarships-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('seo.scholarshipsTitle'),
    description: t('seo.scholarshipsDescription'),
    alternates: await buildLanguageAlternates('/scholarships'),
    ...buildPageOpenGraph({ title: t('seo.scholarshipsTitle'), description: t('seo.scholarshipsDescription'), path: '/scholarships' }),
  };
}

export default async function ScholarshipsPage() {
  const scholarships = await getScholarships({ limit: 200 });

  const itemListSchema = buildItemListSchema(
    'Scholarships in China for international students',
    scholarships
      .filter((sch) => sch.slug)
      .map((sch) => ({ name: sch.name, url: `/scholarships/${sch.slug}` }))
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <ScholarshipsClient initialScholarships={scholarships} />
    </>
  );
}

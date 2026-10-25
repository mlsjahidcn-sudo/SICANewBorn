import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HomeCatalog, HomeCatalogSkeleton } from '@/app/_components/home-catalog';
import { HomeHero, HomeHeroFallback } from '@/app/_components/home-hero';
import { HomeProof, HomeProofSkeleton } from '@/app/_components/home-proof';
import { buildLanguageAlternates } from '@/lib/alternates';
import { getServerT } from '@/lib/server-t';
import { getServiceSchema } from '@/lib/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('seo.homeTitle'),
    description: t('seo.homeDescription'),
    alternates: await buildLanguageAlternates('/'),
  };
}

export const revalidate = 60;

async function HomeServiceSchema() {
  const serviceSchema = await getServiceSchema();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <link rel="preload" as="image" href="/hero-bg.avif" fetchPriority="high" />
      <Suspense fallback={null}>
        <HomeServiceSchema />
      </Suspense>
      <Suspense fallback={<HomeHeroFallback />}>
        <HomeHero />
      </Suspense>
      <Suspense fallback={<HomeCatalogSkeleton />}>
        <HomeCatalog />
      </Suspense>
      <Suspense fallback={<HomeProofSkeleton />}>
        <HomeProof />
      </Suspense>
    </>
  );
}

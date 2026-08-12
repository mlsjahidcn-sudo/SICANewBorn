import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import { getUniversities } from '@/lib/university-queries';
import { getServerT } from '@/lib/server-t';
import UniversitiesClient from './_components/universities-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('seo.universitiesTitle'),
    description: t('seo.universitiesDescription'),
    alternates: buildLanguageAlternates('/universities'),
  };
}

export default async function UniversitiesPage() {
  // Fetch on the server so the first paint already contains the grid
  // instead of waiting for a client-side /api/universities round-trip.
  const universities = await getUniversities({ limit: 1000 });

  return <UniversitiesClient initialUniversities={universities} />;
}

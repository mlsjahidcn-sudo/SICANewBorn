import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import { getUniversities } from '@/lib/university-queries';
import UniversitiesClient from './_components/universities-client';

export const metadata: Metadata = {
  title: 'Universities in China | SICA',
  description: 'Explore top universities in China for international students. Filter by city, discipline, ranking, and more.',
  alternates: buildLanguageAlternates('/universities'),
};

export default async function UniversitiesPage() {
  // Fetch on the server so the first paint already contains the grid
  // instead of waiting for a client-side /api/universities round-trip.
  const universities = await getUniversities({ limit: 1000 });

  return <UniversitiesClient initialUniversities={universities} />;
}

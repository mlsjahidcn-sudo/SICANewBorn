import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import { getPrograms } from '@/lib/program-queries';
import { getUniversities } from '@/lib/university-queries';
import ProgramsClient from './_components/programs-client';

export const metadata: Metadata = {
  title: 'Programs in China | SICA',
  description: 'Explore degree programs at Chinese universities for international students. Filter by degree, language, discipline, and university.',
  alternates: buildLanguageAlternates('/programs'),
};

export default async function ProgramsPage() {
  // Fetch on the server so the first paint already contains the grid
  // instead of waiting for client-side /api round-trips.
  const [programs, universities] = await Promise.all([
    getPrograms({ limit: 2000 }),
    getUniversities({ limit: 1000 }),
  ]);

  return (
    <ProgramsClient
      initialPrograms={programs}
      initialUniversities={universities}
    />
  );
}

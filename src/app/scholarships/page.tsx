import { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import { getScholarships } from '@/lib/scholarship-queries';
import ScholarshipsClient from './_components/scholarships-client';

export const metadata: Metadata = {
  title: 'Scholarships in China for International Students | SICA',
  description: 'Explore Chinese Government Scholarship (CSC), provincial, university, and Confucius Institute scholarships for international students. Filter by type, degree level, and deadline.',
  alternates: buildLanguageAlternates('/scholarships'),
};

export default async function ScholarshipsPage() {
  const scholarships = await getScholarships({ limit: 200 });

  return <ScholarshipsClient initialScholarships={scholarships} />;
}

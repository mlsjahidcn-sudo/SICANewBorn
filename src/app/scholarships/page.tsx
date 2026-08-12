import { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import { getScholarships } from '@/lib/scholarship-queries';
import { getServerT } from '@/lib/server-t';
import ScholarshipsClient from './_components/scholarships-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('seo.scholarshipsTitle'),
    description: t('seo.scholarshipsDescription'),
    alternates: buildLanguageAlternates('/scholarships'),
  };
}

export default async function ScholarshipsPage() {
  const scholarships = await getScholarships({ limit: 200 });

  return <ScholarshipsClient initialScholarships={scholarships} />;
}

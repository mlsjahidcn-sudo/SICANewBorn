import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getScholarshipBySlug } from '@/lib/scholarship-queries';
import { getServerLocale, t } from '@/lib/server-t';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';
import ScholarshipDetailClient from './scholarship-detail-client';

interface ScholarshipPageProps {
  params: Promise<{ slug: string }>;
}

// Render on-demand rather than statically generating every scholarship
// detail page at build time — same tradeoff as /universities/[slug].
// The page still ships with server-fetched data in the initial HTML.
export const dynamic = 'force-dynamic';

/**
 * Phase 92: this page used to be a single 'use client' component that
 * imported the full static scholarship catalog from data.ts (~101KB
 * module) just to find one slug. The data now comes from the cached
 * server query and only the interactive island ships to the browser.
 */
export async function generateMetadata({ params }: ScholarshipPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [scholarship, locale] = await Promise.all([
    getScholarshipBySlug(slug),
    getServerLocale(),
  ]);
  if (!scholarship) {
    return { title: t(locale, 'seo.dynamic.notFoundTitle') };
  }

  const name = locale === 'zh' ? scholarship.nameCn : scholarship.name;
  const description = (locale === 'zh' ? scholarship.descriptionCn : scholarship.description).slice(0, 160);

  return {
    title: t(locale, 'seo.dynamic.scholarshipTitle', { name }),
    description,
    alternates: buildLanguageAlternates(`/scholarships/${slug}`),
    openGraph: {
      title: t(locale, 'seo.dynamic.scholarshipTitle', { name }),
      description,
      type: 'website',
      url: `${SITE_URL}/scholarships/${slug}`,
    },
  };
}

export default async function ScholarshipDetailPage({ params }: ScholarshipPageProps) {
  const { slug } = await params;
  const scholarship = await getScholarshipBySlug(slug);
  if (!scholarship) notFound();

  return <ScholarshipDetailClient scholarship={scholarship} />;
}

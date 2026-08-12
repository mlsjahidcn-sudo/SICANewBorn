/**
 * Server layout for /scholarships/[slug] — sets the canonical URL and
 * locale-aware title / description.
 *
 * Page is 'use client', so metadata can only be set server-side.
 * See src/app/universities/[slug]/layout.tsx for the same pattern.
 */
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site-url';
import { scholarships } from '@/lib/data';
import { getServerLocale, t } from '@/lib/server-t';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const scholarship = scholarships.find((s) => s.slug === slug);
  if (!scholarship) {
    return { title: t(locale, 'seo.dynamic.notFoundTitle') };
  }

  const name = locale === 'zh' && scholarship.nameCn ? scholarship.nameCn : scholarship.name;
  const rawDescription = locale === 'zh' && scholarship.descriptionCn
    ? scholarship.descriptionCn
    : scholarship.description;
  const title = t(locale, 'seo.dynamic.scholarshipTitle', { name });
  const description = rawDescription.slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/scholarships/${slug}` },
    openGraph: {
      title,
      description,
    },
  };
}

export default function ScholarshipSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

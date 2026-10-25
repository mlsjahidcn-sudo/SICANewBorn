import { buildUniversityFaqItems, faqSchema as buildFaqSchema } from '@/lib/program-faq';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getUniversityBySlug, getUniversities } from '@/lib/university-queries';
import { getUniversityProgramPage, getUniversityProgramSummary } from '@/lib/university-programs';
import { getServerLocale, t } from '@/lib/server-t';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';
import UniversityDetailClient from './_components/university-detail-client';
import { safeCatalogReturnQuery } from '@/lib/catalog-search';

interface UniversityPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// Render on-demand rather than statically generating every university
// detail page at build time. The page still ships with server-fetched
// data in the initial HTML, but we avoid thousands of Supabase queries
// during static generation.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: UniversityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [uni, locale] = await Promise.all([
    getUniversityBySlug(slug),
    getServerLocale(),
  ]);
  if (!uni) {
    return { title: t(locale, 'seo.dynamic.notFoundTitle') };
  }

  const name = locale === 'zh' && uni.nameCn ? uni.nameCn : uni.name;
  const rawDescription = locale === 'zh' && uni.descriptionCn ? uni.descriptionCn : uni.description;
  const description = rawDescription.slice(0, 160);
  const title = t(locale, 'seo.dynamic.universityTitle', { name });

  return {
    title,
    description,
    alternates: await buildLanguageAlternates(`/universities/${slug}`),
    openGraph: {
      title,
      description,
      images: uni.image ? [uni.image] : [],
    },
  };
}

function pickRelated(all: Awaited<ReturnType<typeof getUniversities>>, currentSlug: string, limit: number) {
  const others = all.filter((u) => u.slug !== currentSlug);
  const target = all.find((u) => u.slug === currentSlug);
  if (!target) return others.slice(0, limit);

  const sameCity = others.filter((u) => u.city === target.city);
  const similarRank = others.filter(
    (u) => u.city !== target.city && Math.abs((u.ranking ?? 999) - (target.ranking ?? 999)) <= 15,
  );
  const rest = others.filter(
    (u) => u.city !== target.city && Math.abs((u.ranking ?? 999) - (target.ranking ?? 999)) > 15,
  );
  const restShuffled = [...rest].sort((a, b) => a.slug.localeCompare(b.slug));

  return [...sameCity, ...similarRank, ...restShuffled].slice(0, limit);
}

export default async function UniversityDetailPage({ params, searchParams }: UniversityPageProps) {
  const sp = (await searchParams) ?? {};
  const fromQuery = typeof sp.from === 'string' ? safeCatalogReturnQuery(sp.from) : '';
  const { slug } = await params;
  const locale = await getServerLocale();
  const [uni, allUniversities, programPage, programSummary] = await Promise.all([
    getUniversityBySlug(slug),
    getUniversities({ limit: 100 }),
    getUniversityProgramPage(slug, sp, locale),
    getUniversityProgramSummary(slug),
  ]);

  if (!uni) {
    notFound();
  }

  const related = pickRelated(allUniversities, slug, 6);
  const faqSchema = buildFaqSchema(buildUniversityFaqItems(uni, programSummary.total, locale));

  const displayName = locale === 'zh' && uni.nameCn ? uni.nameCn : uni.name;
  const displayDescription =
    locale === 'zh' && uni.descriptionCn ? uni.descriptionCn : uni.description;

  const universitySchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['CollegeOrUniversity', 'EducationalOrganization'],
    '@id': `${SITE_URL}/universities/${slug}#university`,
    name: displayName,
    description: displayDescription,
    url: `${SITE_URL}/universities/${slug}`,
    logo: {
      '@type': 'ImageObject',
      url: uni.logo || `${SITE_URL}/logo.png`,
    },
    location: {
      '@type': 'Place',
      name: uni.city,
      address: {
        '@type': 'PostalAddress',
        addressLocality: uni.city,
        addressCountry: 'CN',
      },
    },
  };
  if (uni.image) {
    universitySchema.image = uni.image;
  }
  // ─────────────────────────────────────────────────────────────────
  // NO AggregateRating — deliberately removed 2026-10-16.
  // ─────────────────────────────────────────────────────────────────
  // This used to emit:
  //
  //     aggregateRating: { ratingValue: uni.rating, bestRating: 5, reviewCount: 1 }
  //
  // `universities.rating` is a SEEDED EDITORIAL value — 4.9 Tsinghua,
  // 4.7 SJTU, 4.8 Fudan, hand-written in the seed SQL. There are no
  // reviews anywhere in this system, so `reviewCount: 1` was invented,
  // and presenting an editorial score as an aggregated review count is
  // exactly the pattern Google's structured-data policy treats as
  // review-snippet abuse. The penalty is a MANUAL ACTION that can strip
  // rich results site-wide.
  //
  // The value itself is legitimate editorial content and stays: it
  // drives filtering, sorting and the compare view in the UI, and it is
  // labelled there as a SICA rating rather than a student one. Only the
  // schema costume comes off.
  //
  // The genuinely-citable external signal — QS World Ranking — is
  // already carried as its own property on the same schema object.

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Universities',
        item: `${SITE_URL}/universities`,
      },
      { '@type': 'ListItem', position: 3, name: displayName },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(universitySchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />
      <UniversityDetailClient university={uni} programPage={programPage} programSummary={programSummary} related={related} fromQuery={fromQuery} />
    </>
  );
}

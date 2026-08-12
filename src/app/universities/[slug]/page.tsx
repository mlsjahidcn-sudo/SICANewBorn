import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getUniversityBySlug, getUniversities } from '@/lib/university-queries';
import { getProgramsByUniversity } from '@/lib/program-queries';
import { getServerLocale, t } from '@/lib/server-t';
import { buildLanguageAlternates } from '@/lib/alternates';
import UniversityDetailClient from './_components/university-detail-client';

interface UniversityPageProps {
  params: Promise<{ slug: string }>;
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
    alternates: buildLanguageAlternates(`/universities/${slug}`),
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

function buildFaqSchema(uni: NonNullable<Awaited<ReturnType<typeof getUniversityBySlug>>>, programCount: number) {
  const uniName = uni.name;
  const tuitionText = uni.tuitionUndergrad
    ? `Undergraduate tuition at ${uniName} is ${uni.tuitionUndergrad} per year; graduate tuition is ${uni.tuitionGraduate || uni.tuitionUndergrad} per year.`
    : `Tuition at ${uniName} varies by program and degree level. SICA provides a precise quote per program.`;
  const rankingText = uni.ranking
    ? `${uniName} is ranked #${uni.ranking} in China${uni.qsWorldRanking ? ` (QS World #${uni.qsWorldRanking})` : ''}.`
    : `${uniName} is a recognized Chinese university${uni.type ? ` (${uni.type})` : ''}.`;
  const programsCountText = programCount > 0
    ? `${uniName} offers ${programCount}+ international programs (Bachelor's, Master's, PhD, Chinese Language) through SICA's network.`
    : `${uniName} hosts international Bachelor's, Master's, and PhD programs in partnership with SICA.`;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${uniName} known for?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${uniName} is a leading Chinese university. ${rankingText} Known for strengths in ${(uni.disciplines || []).slice(0, 3).join(', ') || 'engineering, business, and sciences'}.`,
        },
      },
      {
        '@type': 'Question',
        name: `How much is tuition at ${uniName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: tuitionText,
        },
      },
      {
        '@type': 'Question',
        name: `What programs are available at ${uniName} for international students?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: programsCountText,
        },
      },
      {
        '@type': 'Question',
        name: `Does ${uniName} offer scholarships for international students?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. ${uniName} participates in the Chinese Government Scholarship (CSC) program and offers its own university-specific scholarships for international students. SICA helps you identify the right scholarship for your profile and handles the application end-to-end.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do I apply to ${uniName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Apply through SICA's network. Submit a free academic assessment at https://studyinchina.academy/assessment — SICA's admissions team will confirm your eligibility for ${uniName}, prepare your application, and submit on your behalf.`,
        },
      },
    ],
  };
}

export default async function UniversityDetailPage({ params }: UniversityPageProps) {
  const { slug } = await params;
  const [uni, allUniversities, programs] = await Promise.all([
    getUniversityBySlug(slug),
    getUniversities({ limit: 100 }),
    getProgramsByUniversity(slug, 50),
  ]);

  if (!uni) {
    notFound();
  }

  const related = pickRelated(allUniversities, slug, 6);
  const faqSchema = buildFaqSchema(uni, programs.length);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <UniversityDetailClient university={uni} programs={programs} related={related} />
    </>
  );
}

import { buildProgramFaqSchema } from '@/lib/program-faq';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProgramBySlug } from '@/lib/program-queries';
import { getUniversityBySlug } from '@/lib/university-queries';
import { getServerLocale, t } from '@/lib/server-t';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';
import ProgramDetailClient from './_components/program-detail-client';

export const dynamic = 'force-dynamic';

interface ProgramPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProgramPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [program, locale] = await Promise.all([
    getProgramBySlug(slug),
    getServerLocale(),
  ]);
  if (!program) {
    return { title: t(locale, 'seo.dynamic.notFoundTitle') };
  }

  const name = locale === 'zh' && program.nameCn ? program.nameCn : program.name;
  const rawDescription = locale === 'zh' && program.descriptionCn ? program.descriptionCn : program.description;
  const description = rawDescription.slice(0, 160);
  const title = t(locale, 'seo.dynamic.programTitle', { name, degree: program.degree });

  return {
    title,
    description,
    alternates: await buildLanguageAlternates(`/programs/${slug}`),
    openGraph: {
      title,
      description,
    },
  };
}

export default async function ProgramDetailPage({ params }: ProgramPageProps) {
  const { slug } = await params;
  const [program, locale] = await Promise.all([
    getProgramBySlug(slug),
    getServerLocale(),
  ]);

  if (!program) {
    notFound();
  }

  const university = program.universitySlug
    ? await getUniversityBySlug(program.universitySlug)
    : null;
  const universityName = university ? university.name : 'the partner university';
  const faqSchema = buildProgramFaqSchema(program, universityName);

  const displayName =
    locale === 'zh' && program.nameCn ? program.nameCn : program.name;
  const displayDescription =
    locale === 'zh' && program.descriptionCn
      ? program.descriptionCn
      : program.description;

  const courseSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Course', 'EducationalOccupationalProgram'],
    '@id': `${SITE_URL}/programs/${slug}#program`,
    name: displayName,
    description: displayDescription,
    provider: {
      '@id': university
        ? `${SITE_URL}/universities/${program.universitySlug}#university`
        : `${SITE_URL}/#organization`,
    },
    educationalLevel: program.degree,
    ...(program.language !== 'To be confirmed' ? { inLanguage: program.language } : {}),
    timeToComplete: program.duration,
    about: program.discipline,
  };

  // Source fee strings may contain ranges, multiple units and catalogue years.
  // Keep them in the FAQ instead of deriving an unreliable numeric offer.

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Programs',
        item: `${SITE_URL}/programs`,
      },
      { '@type': 'ListItem', position: 3, name: displayName },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ProgramDetailClient program={program} university={university} />
    </>
  );
}

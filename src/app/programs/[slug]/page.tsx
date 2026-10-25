import { serializeJsonLd } from '@/lib/json-ld';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProgramBySlug } from '@/lib/program-queries';
import { getUniversityBySlug } from '@/lib/university-queries';
import { queryPrograms } from '@/lib/program-query';
import { getServerLocale, t } from '@/lib/server-t';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';
import ProgramDetailClient from './_components/program-detail-client';
import type { Program } from '@/lib/data';
import { safeCatalogReturnQuery } from '@/lib/catalog-search';
import { safeUniversityReturn } from '@/lib/detail-content';

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

export default async function ProgramDetailPage({
  params,
  searchParams,
}: ProgramPageProps & {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const [program, locale, sp] = await Promise.all([
    getProgramBySlug(slug),
    getServerLocale(),
    searchParams,
  ]);

  if (!program) {
    notFound();
  }

  const university = program.universitySlug
    ? await getUniversityBySlug(program.universitySlug)
    : null;

  // PF-6: the listing passes its filter query along, so the detail page
  // can send the visitor back to the exact result set they came from
  // instead of the unfiltered directory.
  const rawFrom = sp.from;
  const fromQuery = typeof rawFrom === 'string' ? safeCatalogReturnQuery(rawFrom) : '';
  const universityReturn = safeUniversityReturn(sp.returnTo, program.universitySlug);

  // PF-6: related programs (same university first, then same
  // discipline). 2,513 program pages had no links to each other.
  const relatedPrograms = await getRelatedPrograms(program);

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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
      <ProgramDetailClient
        program={program}
        university={university}
        relatedPrograms={relatedPrograms}
        fromQuery={fromQuery}
        universityReturn={universityReturn}
      />
    </>
  );
}

/**
 * PF-6: related programs for the detail page.
 *
 * Same university first (the strongest signal — a student looking at
 * "BSc Computer Science, Tsinghua" usually wants a sibling program at
 * the same school), then the same discipline anywhere. Both come
 * through `queryPrograms`, the one query module the finder and the API
 * share, so the related list obeys exactly the same visibility rules
 * (no archived, no unpublished rows).
 */
async function getRelatedPrograms(program: Program): Promise<(Program & { universityName: string; universityNameCn: string })[]> {
  const [sameUni, sameDiscipline] = await Promise.all([
    program.universitySlug
      ? queryPrograms({ university: program.universitySlug, limit: 6 })
      : Promise.resolve({ programs: [] as Program[] }),
    program.discipline
      ? queryPrograms({ discipline: program.discipline, degree: program.degree, limit: 8 })
      : Promise.resolve({ programs: [] as Program[] }),
  ]);

  const seen = new Set<string>([program.slug]);
  const out: Program[] = [];
  const candidates = [...sameUni.programs, ...sameDiscipline.programs].sort((a, b) => {
    const score = (item: Program): number => Number(item.universitySlug === program.universitySlug) * 4 + Number(item.degree === program.degree) * 3 + Number(item.discipline === program.discipline) * 2 + Number(item.language === program.language);
    return score(b) - score(a);
  });
  for (const p of candidates) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    out.push(p);
    if (out.length >= 4) break;
  }
  return Promise.all(out.map(async (item) => {
    const institution = await getUniversityBySlug(item.universitySlug);
    return { ...item, universityName: institution?.name || item.universitySlug.replace(/-/g, ' '), universityNameCn: institution?.nameCn || institution?.name || item.universitySlug.replace(/-/g, ' ') };
  }));
}

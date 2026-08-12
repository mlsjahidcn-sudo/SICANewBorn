import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { ChevronRight, ArrowRight, MapPin, Trophy, GraduationCap, Clock, Banknote, Globe, Award } from 'lucide-react';
import { getAllUniversities, getAllPrograms } from '@/lib/data-fetcher';

import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';
// Render on demand with ISR — reads the live DB so newly-added
// universidades (post-build) show up automatically, and the
// per-university program list stays current with admin edits.
// Cached at the edge for 60s to keep response time fast.
export const revalidate = 60;

// S59: wrapped in React's `cache()` so the 3× calls in
// generateStaticParams + generateMetadata + page body collapse to
// a single fetch + filter + sort per page.
const getRankedUnis = cache(async () => {
  const unis = await getAllUniversities();
  return unis
    .filter((u) => u.ranking > 0)
    .sort((a, b) => a.ranking - b.ranking);
});

export async function generateStaticParams() {
  const unis = await getRankedUnis();
  return unis.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const unis = await getRankedUnis();
  const uni = unis.find((u) => u.slug === slug);
  if (!uni) return { title: 'Not Found' };

  const title = `Programs at ${uni.name} for International Students (2026)`;
  const description = `Bachelor's, Master's, and PhD programs at ${uni.name} for international students. Tuition, duration, language of instruction, and scholarship availability for each.`;

  return {
    title,
    description,
    alternates: buildLanguageAlternates(`/universities/${slug}/programs`),
    openGraph: { title, description, type: 'article' },
  };
}

const DEGREE_COLOR: Record<string, string> = {
  Bachelor: 'bg-blue-50 text-blue-800 border-blue-200',
  Master: 'bg-purple-50 text-purple-800 border-purple-200',
  PhD: 'bg-amber-50 text-amber-800 border-amber-200',
};

export default async function UniversityProgramsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [unis, allPrograms] = await Promise.all([
    getRankedUnis(),
    getAllPrograms(),
  ]);
  const uni = unis.find((u) => u.slug === slug);
  if (!uni) notFound();

  const programs = allPrograms.filter((p) => p.universitySlug === slug);

  // Group by degree level
  const byDegree = {
    Bachelor: programs.filter((p) => p.degree === 'Bachelor'),
    Master: programs.filter((p) => p.degree === 'Master'),
    PhD: programs.filter((p) => p.degree === 'PhD'),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Universities', item: `${SITE_URL}/universities` },
      { '@type': 'ListItem', position: 3, name: uni.name, item: `${SITE_URL}/universities/${slug}` },
      { '@type': 'ListItem', position: 4, name: 'Programs' },
    ],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Programs at ${uni.name}`,
    numberOfItems: programs.length,
    itemListElement: programs.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${SITE_URL}/programs/${p.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <main className="min-h-screen bg-[#FAFAF8]">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#9B1B30] transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/universities" className="hover:text-[#9B1B30] transition-colors">Universities</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/universities/${slug}`} className="hover:text-[#9B1B30] transition-colors truncate">{uni.name}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-[#1B2A4A] font-medium">Programs</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-[#1B2A4A] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4A853] mb-3">
              <GraduationCap className="h-4 w-4" />
              Programs
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Programs at {uni.name}
            </h1>
            <p className="mt-3 text-lg text-gray-300 max-w-3xl">
              {programs.length === 0
                ? `Browse all program types offered at ${uni.name} for international students.`
                : `Browse all ${programs.length} programs offered at ${uni.name} for international students — Bachelor's, Master's, and PhD in English, Chinese, and bilingual tracks.`}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-300">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{uni.city}, China</span>
              <span className="flex items-center gap-1.5"><Trophy className="h-4 w-4 fill-[#D4A853] text-[#D4A853]" />QS #{uni.qsWorldRanking}</span>
              <span className="flex items-center gap-1.5">{programs.length} programs</span>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Last updated: {new Date().toISOString().slice(0, 10)} · SICA Editorial Team
            </p>
          </div>
        </section>

        {/* Programs grouped by degree */}
        {programs.length === 0 ? (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white border-2 border-gray-200 p-8 text-center">
              <p className="text-gray-600">
                Program list for {uni.name} is being updated. In the meantime,{' '}
                <Link href="/programs" className="text-[#9B1B30] hover:underline font-semibold">
                  browse all programs across SICA partner universities
                </Link>
                .
              </p>
            </div>
          </section>
        ) : (
          (['Bachelor', 'Master', 'PhD'] as const).map((deg) => {
            const list = byDegree[deg];
            if (list.length === 0) return null;
            return (
              <section
                key={deg}
                className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10"
              >
                <h2 className="text-2xl font-bold text-[#1B2A4A] mb-5 flex items-center gap-3">
                  <span
                    className={`inline-block border px-3 py-1 text-sm font-semibold ${DEGREE_COLOR[deg]}`}
                  >
                    {deg === 'Bachelor' ? "Bachelor's" : deg === 'Master' ? "Master's" : 'PhD'}
                  </span>
                  <span className="text-sm text-gray-500 font-normal">{list.length} programs</span>
                </h2>
                <div className="grid lg:grid-cols-2 gap-3">
                  {list.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/programs/${p.slug}`}
                      className="group block bg-white border-2 border-gray-200 hover:border-[#9B1B30] p-5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors">
                            {p.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {p.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Banknote className="h-3.5 w-3.5" />
                              {p.tuition}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="h-3.5 w-3.5" />
                              {p.language}
                            </span>
                            {p.scholarshipAvailable && (
                              <span className="flex items-center gap-1 text-[#9B1B30] font-semibold">
                                <Award className="h-3.5 w-3.5" />
                                Scholarship available
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#9B1B30] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })
        )}

        {/* CTA */}
        <section className="bg-[#1B2A4A] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Apply to {uni.name}
            </h2>
            <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
              SICA's team helps you with application prep, document review, and scholarship
              matching for {uni.name}. Get a free assessment within 48 hours.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/assessment?major=${encodeURIComponent(uni.name + ' program')}`}
                className="inline-flex items-center gap-2 bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold px-6 py-2.5 text-sm transition-colors"
              >
                Get free assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/universities/${slug}/scholarships`}
                className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                See scholarships
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

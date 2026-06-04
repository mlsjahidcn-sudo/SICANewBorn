import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, GraduationCap, ChevronRight, MapPin, Clock, Banknote, Globe, Award } from 'lucide-react';
import { universities as staticUniversities, programs as staticPrograms, type Program } from '@/lib/data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sica.com.cn';

// URL slug ↔ discipline. Slugs are URL-safe variants of the
// `discipline` field on each program. The mapping is generated at
// build time (see slugifyDiscipline).
const slugifyDiscipline = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

const ALL_DISCIPLINES = Array.from(
  new Set(staticPrograms.map((p) => p.discipline)),
).sort();

const DISCIPLINE_SLUGS = ALL_DISCIPLINES.map(slugifyDiscipline);

export const dynamic = 'force-static';

export function generateStaticParams() {
  return DISCIPLINE_SLUGS.map((d) => ({ discipline: d }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ discipline: string }>;
}): Promise<Metadata> {
  const { discipline: disciplineSlug } = await params;
  const discipline = ALL_DISCIPLINES.find((d) => slugifyDiscipline(d) === disciplineSlug);
  if (!discipline) return { title: 'Not Found' };

  const title = `${discipline} Programs in China for International Students (2026)`;
  const description = `Study ${discipline} at top Chinese universities. ${discipline} bachelor's, master's, and PhD programs with English and Chinese tracks, tuition, duration, and scholarship info.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/majors/${disciplineSlug}` },
    openGraph: { title, description, type: 'article' },
  };
}

const DEGREE_COLOR: Record<string, string> = {
  Bachelor: 'bg-blue-50 text-blue-800 border-blue-200',
  Master: 'bg-purple-50 text-purple-800 border-purple-200',
  PhD: 'bg-amber-50 text-amber-800 border-amber-200',
};

export default async function MajorPage({
  params,
}: {
  params: Promise<{ discipline: string }>;
}) {
  const { discipline: disciplineSlug } = await params;
  const discipline = ALL_DISCIPLINES.find((d) => slugifyDiscipline(d) === disciplineSlug);
  if (!discipline) notFound();

  // All programs in this discipline, with the parent university
  // resolved so we can show uni context.
  const programsInMajor: Array<{ program: Program; uni: (typeof staticUniversities)[number] | undefined }> =
    staticPrograms
      .filter((p) => p.discipline === discipline)
      .map((p) => ({
        program: p,
        uni: staticUniversities.find((u) => u.slug === p.universitySlug),
      }));

  // Unique universities offering this major
  const uniqueUnis = Array.from(
    new Set(programsInMajor.map((p) => p.program.universitySlug)),
  )
    .map((slug) => staticUniversities.find((u) => u.slug === slug))
    .filter((u): u is (typeof staticUniversities)[number] => Boolean(u))
    .sort((a, b) => a.ranking - b.ranking);

  // Quick aggregate stats
  const withScholarship = programsInMajor.filter((p) => p.program.scholarshipAvailable).length;
  const englishPrograms = programsInMajor.filter((p) => p.program.language === 'English').length;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Majors', item: `${SITE_URL}/majors` },
      { '@type': 'ListItem', position: 3, name: discipline },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="min-h-screen bg-[#FAFAF8]">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#9B1B30] transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/majors" className="hover:text-[#9B1B30] transition-colors">Majors</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-[#1B2A4A] font-medium">{discipline}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-[#1B2A4A] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4A853] mb-3">
              <GraduationCap className="h-4 w-4" />
              Major
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Study {discipline} in China
            </h1>
            <p className="mt-3 text-lg text-gray-300 max-w-3xl">
              {programsInMajor.length} {discipline} program{programsInMajor.length === 1 ? '' : 's'} available at {uniqueUnis.length} top Chinese
              universities for international students — undergraduate, graduate, and doctoral
              tracks, taught in English, Chinese, and bilingual.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                {programsInMajor.length} programs
              </span>
              <span className="flex items-center gap-1.5">
                {uniqueUnis.length} universities
              </span>
              {withScholarship > 0 && (
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-[#D4A853]" />
                  {withScholarship} with scholarships
                </span>
              )}
              {englishPrograms > 0 && (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  {englishPrograms} in English
                </span>
              )}
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Last updated: {new Date().toISOString().slice(0, 10)} · SICA Editorial Team
            </p>
          </div>
        </section>

        {/* Programs list */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-5">
            All {discipline} programs in China
          </h2>
          {programsInMajor.length === 0 ? (
            <div className="bg-white border-2 border-gray-200 p-8 text-center">
              <p className="text-gray-600">
                No {discipline} programs found in the SICA catalog yet.{' '}
                <Link href="/programs" className="text-[#9B1B30] hover:underline font-semibold">
                  Browse all programs
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-3">
              {programsInMajor.map(({ program: p, uni }) => (
                <Link
                  key={p.slug}
                  href={`/programs/${p.slug}`}
                  className="group block bg-white border-2 border-gray-200 hover:border-[#9B1B30] p-5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span
                          className={`inline-block border px-2 py-0.5 text-[10px] font-semibold ${DEGREE_COLOR[p.degree]}`}
                        >
                          {p.degree}
                        </span>
                        {p.scholarshipAvailable && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#9B1B30]">
                            <Award className="h-3 w-3" />
                            Scholarship
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors">
                        {p.name}
                      </h3>
                      {uni && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {uni.name} · {uni.city}, China
                          {uni.ranking > 0 && (
                            <span className="ml-1 text-xs text-[#9B1B30] font-semibold">
                              #{uni.ranking} CN
                            </span>
                          )}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
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
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#9B1B30] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Universities offering this major */}
        {uniqueUnis.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
            <h2 className="text-2xl font-bold text-[#1B2A4A] mb-5">
              Universities offering {discipline}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {uniqueUnis.map((u) => (
                <Link
                  key={u.slug}
                  href={`/universities/${u.slug}`}
                  className="group flex items-center gap-3 bg-white border border-gray-200 hover:border-[#9B1B30] p-3 transition-colors"
                >
                  <div className="h-10 w-10 bg-white border border-gray-100 flex items-center justify-center shrink-0">
                    {u.logo && u.logo.startsWith('http') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.logo} alt={u.name} className="h-8 w-8 object-contain" />
                    ) : (
                      <GraduationCap className="h-5 w-5 text-[#1B2A4A]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors text-sm truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      #{u.ranking} CN · {u.city}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-[#1B2A4A] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Ready to study {discipline} in China?
            </h2>
            <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
              SICA helps you choose the right program at the right university, apply for
              scholarships, and navigate the visa process. Free initial consultation.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/assessment?major=${encodeURIComponent(discipline)}`}
                className="inline-flex items-center gap-2 bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold px-6 py-2.5 text-sm transition-colors"
              >
                Get free assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Browse all programs
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Award, ChevronRight, ArrowRight, GraduationCap, MapPin, Banknote, Globe } from 'lucide-react';
import {
  programs as staticPrograms,
  universities as staticUniversities,
  scholarships as staticScholarships,
} from '@/lib/data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sica.com.cn';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return staticPrograms.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = staticPrograms.find((p) => p.slug === slug);
  if (!program) return { title: 'Not Found' };

  const uni = staticUniversities.find((u) => u.slug === program.universitySlug);
  const uniName = uni?.name || 'this university';

  const title = `Scholarships for ${program.name} at ${uniName} (2026)`;
  const description = `Scholarships available for ${program.name} at ${uniName}: Chinese Government Scholarship, Confucius Institute, university-specific awards, and external programs. Updated 2026.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/programs/${slug}/scholarships` },
    openGraph: { title, description, type: 'article' },
  };
}

export default async function ProgramScholarshipsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = staticPrograms.find((p) => p.slug === slug);
  if (!program) notFound();

  const uni = staticUniversities.find((u) => u.slug === program.universitySlug);

  // All 10 scholarships — these are national scholarships open to
  // any SICA partner university. SICA helps with the application
  // for each.
  const allScholarships = staticScholarships.filter((s) =>
    s.slug.includes('scholarship') || s.slug.startsWith('csc-'),
  );

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Programs', item: `${SITE_URL}/programs` },
      { '@type': 'ListItem', position: 3, name: program.name, item: `${SITE_URL}/programs/${slug}` },
      { '@type': 'ListItem', position: 4, name: 'Scholarships' },
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
              <Link href="/programs" className="hover:text-[#9B1B30] transition-colors">Programs</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/programs/${slug}`} className="hover:text-[#9B1B30] transition-colors truncate max-w-[200px]">{program.name}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-[#1B2A4A] font-medium">Scholarships</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-[#1B2A4A] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4A853] mb-3">
              <Award className="h-4 w-4" />
              Scholarships
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Scholarships for {program.name}
            </h1>
            {uni && (
              <Link
                href={`/universities/${uni.slug}`}
                className="mt-3 inline-flex items-center gap-1.5 text-lg text-gray-300 hover:text-white transition-colors"
              >
                <MapPin className="h-4 w-4" />
                {uni.name} · {uni.city}, China
              </Link>
            )}
            <p className="mt-4 text-base text-gray-300 max-w-3xl">
              All scholarships you can apply for as a {program.name} student at{' '}
              {uni?.name || 'this university'}. Includes Chinese Government Scholarship,
              Confucius Institute, and {uni?.name || 'university'}-specific awards.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                {program.degree}
              </span>
              <span className="flex items-center gap-1.5">
                <Banknote className="h-4 w-4" />
                {program.tuition}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                {program.language}
              </span>
              {program.scholarshipAvailable && (
                <span className="flex items-center gap-1.5 text-[#D4A853]">
                  <Award className="h-4 w-4" />
                  Scholarship-friendly program
                </span>
              )}
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Last updated: {new Date().toISOString().slice(0, 10)} · SICA Editorial Team
            </p>
          </div>
        </section>

        {/* All scholarships */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-5">
            {allScholarships.length} scholarships available
          </h2>
          <div className="grid lg:grid-cols-2 gap-4">
            {allScholarships.map((s) => (
              <Link
                key={s.slug}
                href={`/scholarships/${s.slug}`}
                className="group block bg-white border-2 border-gray-200 hover:border-[#9B1B30] p-5 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors">
                      {s.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={[
                          'px-2 py-0.5 font-semibold',
                          s.type === 'Full'
                            ? 'bg-[#9B1B30] text-white'
                            : 'bg-[#D4A853]/15 text-[#9B1B30]',
                        ].join(' ')}
                      >
                        {s.type}
                      </span>
                      <span className="text-gray-500">Deadline: {s.deadline}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#9B1B30] group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* University-specific scholarship narrative */}
        {uni?.scholarshipInfo && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
            <h2 className="text-2xl font-bold text-[#1B2A4A] mb-4">
              {uni.name}'s scholarship program
            </h2>
            <div className="bg-white border-2 border-gray-200 p-6">
              <p className="text-[#374151] leading-relaxed whitespace-pre-line">
                {uni.scholarshipInfo}
              </p>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-[#1B2A4A] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Apply for {program.name} with a scholarship
            </h2>
            <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
              SICA's team helps you match the right scholarship to your profile, prepare
              documents, and submit before the deadline. Free initial consultation.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/assessment?major=${encodeURIComponent(program.name)}`}
                className="inline-flex items-center gap-2 bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold px-6 py-2.5 text-sm transition-colors"
              >
                Get free assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              {uni && (
                <Link
                  href={`/universities/${uni.slug}/scholarships`}
                  className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  {uni.name} scholarships
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

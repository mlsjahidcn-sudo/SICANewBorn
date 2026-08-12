import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { Award, ChevronRight, ArrowRight, MapPin, Trophy, GraduationCap } from 'lucide-react';
import {
  getAllUniversities,
  getAllScholarships,
  getAllPrograms,
} from '@/lib/data-fetcher';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

// Render on demand with ISR — reads the live DB so newly-added
// universidades and admin-curated programs show up automatically.
// Cached at the edge for 60s.
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

  const title = `${uni.name} Scholarships for International Students (2026)`;
  const description = `Scholarships available for international students at ${uni.name}: CSC, Confucius Institute, university-specific awards, and application tips. Updated 2026.`;

  return {
    title,
    description,
    alternates: buildLanguageAlternates(`/universities/${slug}/scholarships`),
    openGraph: { title, description, type: 'article' },
  };
}

export default async function UniversityScholarshipsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [unis, allScholarshipsList, allPrograms] = await Promise.all([
    getRankedUnis(),
    getAllScholarships(),
    getAllPrograms(),
  ]);
  const uni = unis.find((u) => u.slug === slug);
  if (!uni) notFound();

  // Programs at this university with scholarshipAvailable=true
  const programsWithScholarship = allPrograms.filter(
    (p) => p.universitySlug === slug && p.scholarshipAvailable,
  );

  // All scholarships (the per-uni filtering would be too narrow
  // — most scholarships are national and applicable to any uni).
  // Show all of them, with a callout that "applies to all SICA
  // partner universities including [this one]."
  const allScholarships = allScholarshipsList.filter((s) =>
    s.slug.includes('scholarship') || s.slug.startsWith('csc-') || s.slug === 'mofcom-scholarship',
  );

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Universities', item: `${SITE_URL}/universities` },
      { '@type': 'ListItem', position: 3, name: uni.name, item: `${SITE_URL}/universities/${slug}` },
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
              <Link href="/universities" className="hover:text-[#9B1B30] transition-colors">Universities</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/universities/${slug}`} className="hover:text-[#9B1B30] transition-colors truncate">{uni.name}</Link>
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
              {uni.name} Scholarships for International Students
            </h1>
            <p className="mt-3 text-lg text-gray-300 max-w-3xl">
              Complete list of scholarships available to international students at {uni.name} —
              including Chinese Government Scholarship, Confucius Institute, university-specific
              awards, and external programs.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-300">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{uni.city}, China</span>
              <span className="flex items-center gap-1.5"><Trophy className="h-4 w-4 fill-[#D4A853] text-[#D4A853]" />QS #{uni.qsWorldRanking}</span>
              <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" />Top #{uni.ranking} in China</span>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Last updated: {new Date().toISOString().slice(0, 10)} · SICA Editorial Team
            </p>
          </div>
        </section>

        {/* Programs at this uni with scholarships */}
        {programsWithScholarship.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
            <h2 className="text-2xl font-bold text-[#1B2A4A] mb-4">
              Programs with scholarships at {uni.name}
            </h2>
            <p className="text-sm text-gray-600 mb-6 max-w-3xl">
              The following programs at {uni.name} offer scholarship opportunities for international
              students. Click into each to see coverage, eligibility, and how to apply.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {programsWithScholarship.map((p) => (
                <Link
                  key={p.slug}
                  href={`/programs/${p.slug}`}
                  className="group block bg-white border-2 border-gray-200 hover:border-[#9B1B30] p-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors text-sm">
                        {p.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{p.degree} · {p.language}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.tuition}</p>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 bg-[#D4A853]/15 text-[#9B1B30] text-[10px] font-bold px-1.5 py-0.5">
                      <Award className="h-3 w-3" />
                      Scholarship
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All scholarships — applicable to this uni */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-4">
            All scholarships you can apply for at {uni.name}
          </h2>
          <p className="text-sm text-gray-600 mb-6 max-w-3xl">
            These scholarships are open to international students at {uni.name} and other SICA
            partner universities. Most are administered by the Chinese government, the Confucius
            Institute, or {uni.name} itself.
          </p>
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

        {/* University-specific narrative (if any) */}
        {uni.scholarshipInfo && (
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
              Need help applying for a {uni.name} scholarship?
            </h2>
            <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
              SICA's team can help you identify the right scholarship for your profile, prepare
              the application, and submit before the deadline. Free initial consultation.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/assessment?major=${encodeURIComponent(uni.name + ' scholarship')}`}
                className="inline-flex items-center gap-2 bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold px-6 py-2.5 text-sm transition-colors"
              >
                Get free assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/universities/${slug}`}
                className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Back to {uni.name}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

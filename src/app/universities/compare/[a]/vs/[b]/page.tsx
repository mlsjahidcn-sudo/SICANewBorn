import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import {
  ArrowRight,
  MapPin,
  Star,
  Trophy,
  Check,
  GraduationCap,
  Award,
  Building2,
  Wallet,
  Globe2,
  Users,
  Calendar,
} from 'lucide-react';
import { getAllUniversities } from '@/lib/data-fetcher';
import { getServerLocale, t } from '@/lib/server-t';
import { SITE_URL } from '@/lib/site-url';

// All ranked universities, sorted. The picker and the slug validation
// both pull from this list, so the compare page never produces a 404
// for a known pair. Reads the live DB at render time (with static
// fallback) so newly-added AI-generated or admin-imported
// universidades are picked up automatically.
//
// S59: wrapped in React's `cache()` so the 3× calls in
// generateStaticParams + generateMetadata + page body collapse to a
// single fetch + filter + sort per page. Combined with the
// memoization inside `getAllUniversities` itself, the entire
// per-page DB work is now a single SELECT.
const getRankedUnis = cache(async () => {
  const unis = await getAllUniversities();
  return unis
    .filter((u) => u.ranking > 0)
    .sort((a, b) => a.ranking - b.ranking);
});

// Pre-render every valid pair. 8 ranked universidades → 28 unique
// pairs; 9 → 36; etc. Reads the live list at build time so newly
// added universidades (post-build) can be visited directly without
// waiting for the next deploy.
export async function generateStaticParams() {
  const unis = await getRankedUnis();
  const slugs = unis.map((u) => u.slug);
  const pairs: Array<{ a: string; b: string }> = [];
  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      pairs.push({ a: slugs[i], b: slugs[j] });
    }
  }
  return pairs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}): Promise<Metadata> {
  const { a, b } = await params;
  const [unis, locale] = await Promise.all([
    getRankedUnis(),
    getServerLocale(),
  ]);
  const uniA = unis.find((u) => u.slug === a);
  const uniB = unis.find((u) => u.slug === b);
  if (!uniA || !uniB) {
    return { title: t(locale, 'seo.dynamic.notFoundTitle') };
  }

  const nameA = locale === 'zh' && uniA.nameCn ? uniA.nameCn : uniA.name;
  const nameB = locale === 'zh' && uniB.nameCn ? uniB.nameCn : uniB.name;
  const title = t(locale, 'seo.dynamic.compareTitle', { a: nameA, b: nameB });
  const description = t(locale, 'seo.dynamic.compareDescription', { a: nameA, b: nameB });

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/universities/compare/${a}/vs/${b}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
    },
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}) {
  const { a, b } = await params;
  const unis = await getRankedUnis();
  const uniA = unis.find((u) => u.slug === a);
  const uniB = unis.find((u) => u.slug === b);
  if (!uniA || !uniB) notFound();

  // Build a one-row-per-attribute comparison table. Using arrays of
  // rows makes the data shape uniform and easy to map over.
  type Row = {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    a: React.ReactNode;
    b: React.ReactNode;
    /** "a" = first value wins, "b" = second value wins, null = draw/equal. */
    winner?: 'a' | 'b' | null;
  };

  const lowerRankingWins = (a: number, b: number): 'a' | 'b' | null => {
    if (a === b) return null;
    return a < b ? 'a' : 'b';
  };

  const rows: Row[] = [
    {
      label: 'Ranking in China',
      icon: Trophy,
      a: `#${uniA.ranking}`,
      b: `#${uniB.ranking}`,
      winner: lowerRankingWins(uniA.ranking, uniB.ranking),
    },
    {
      label: 'QS World Ranking',
      icon: Globe2,
      a: `#${uniA.qsWorldRanking}`,
      b: `#${uniB.qsWorldRanking}`,
      winner: lowerRankingWins(uniA.qsWorldRanking, uniB.qsWorldRanking),
    },
    {
      label: 'SICA Rating',
      icon: Star,
      a: `${uniA.rating} / 5`,
      b: `${uniB.rating} / 5`,
      winner: uniA.rating > uniB.rating ? 'a' : uniB.rating > uniA.rating ? 'b' : null,
    },
    {
      label: 'Location',
      icon: MapPin,
      a: `${uniA.city}, China`,
      b: `${uniB.city}, China`,
    },
    {
      label: 'Type',
      icon: Building2,
      a: uniA.type,
      b: uniB.type,
    },
    {
      label: 'Established',
      icon: Calendar,
      a: uniA.established,
      b: uniB.established,
      winner: uniA.established < uniB.established ? 'a' : uniA.established > uniB.established ? 'b' : null,
    },
    {
      label: 'Total students',
      icon: Users,
      a: uniA.students,
      b: uniB.students,
    },
    {
      label: 'International students',
      icon: GraduationCap,
      a: uniA.intlStudents,
      b: uniB.intlStudents,
    },
    {
      label: 'Undergraduate tuition',
      icon: Wallet,
      a: uniA.tuitionUndergrad || '—',
      b: uniB.tuitionUndergrad || '—',
    },
    {
      label: 'Graduate tuition',
      icon: Wallet,
      a: uniA.tuitionGraduate || '—',
      b: uniB.tuitionGraduate || '—',
    },
    {
      label: 'Application deadline',
      icon: Calendar,
      a: uniA.applicationDeadline
        ? new Date(uniA.applicationDeadline).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'See website',
      b: uniB.applicationDeadline
        ? new Date(uniB.applicationDeadline).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'See website',
    },
  ];

  // Program tags — show top 5 popular programs at each.
  const programsA = uniA.popularPrograms?.slice(0, 5) ?? [];
  const programsB = uniB.popularPrograms?.slice(0, 5) ?? [];

  // Disciplines — list at each.
  const discA = uniA.disciplines ?? [];
  const discB = uniB.disciplines ?? [];

  // Build the JSON-LD: Article + BreadcrumbList + FAQPage. Strong
  // GEO/AEO signal — comparison content is one of the most
  // commonly cited patterns by ChatGPT/Perplexity.
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${uniA.name} vs ${uniB.name}: A side-by-side comparison`,
    description: `Compare ${uniA.name} and ${uniB.name} on rankings, tuition, scholarships, programs, and location.`,
    author: { '@id': `${SITE_URL}/#editorial-team` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    dateModified: new Date().toISOString().slice(0, 10),
    inLanguage: 'en',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/universities/compare/${a}/vs/${b}`,
    },
  };

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
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Compare',
        item: `${SITE_URL}/universities/compare`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `${uniA.name} vs ${uniB.name}`,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Is ${uniA.name} better than ${uniB.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `It depends on your goals. ${uniA.name} is ranked #${uniA.ranking} in China (QS World #${uniA.qsWorldRanking}); ${uniB.name} is ranked #${uniB.ranking} in China (QS World #${uniB.qsWorldRanking}). Both are top-tier. Use the comparison table above to decide which is the better fit for your program of interest, location preference, and scholarship eligibility.`,
        },
      },
      {
        '@type': 'Question',
        name: `Which is more expensive, ${uniA.name} or ${uniB.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${uniA.name} charges ${uniA.tuitionUndergrad || '—'} for undergraduates and ${uniA.tuitionGraduate || '—'} for graduate students. ${uniB.name} charges ${uniB.tuitionUndergrad || '—'} for undergraduates and ${uniB.tuitionGraduate || '—'} for graduate students. Tuition varies by program.`,
        },
      },
      {
        '@type': 'Question',
        name: `Do both ${uniA.name} and ${uniB.name} offer scholarships to international students?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. International students at both ${uniA.name} and ${uniB.name} can apply for the Chinese Government Scholarship (CSC), Confucius Institute Scholarship, and their own university-specific scholarships. SICA's team can help you identify and apply for the right scholarship for your profile.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I apply to both ${uniA.name} and ${uniB.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes — most international students apply to multiple universities in parallel. SICA helps coordinate applications to both ${uniA.city}-based and ${uniB.city}-based programs, so you can maximize your chances without doubling your workload.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="min-h-screen bg-[#FAFAF8]">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#9B1B30] transition-colors">Home</Link>
              <span className="text-gray-300">/</span>
              <Link href="/universities" className="hover:text-[#9B1B30] transition-colors">Universities</Link>
              <span className="text-gray-300">/</span>
              <Link href="/universities/compare" className="hover:text-[#9B1B30] transition-colors">Compare</Link>
              <span className="text-gray-300">/</span>
              <span className="text-[#1B2A4A] font-medium truncate">
                {uniA.name} vs {uniB.name}
              </span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-[#1B2A4A] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4A853] mb-3">
              University Comparison
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              {uniA.name} vs {uniB.name}
            </h1>
            <p className="mt-3 text-lg text-gray-300 max-w-3xl">
              A side-by-side comparison of two of China's top universities. Use the data below
              to pick the right fit for your program, location, and budget.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Last updated: {new Date().toISOString().slice(0, 10)} · SICA Editorial Team
            </p>
          </div>
        </section>

        {/* Side-by-side Hero Cards */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-4">
            {[uniA, uniB].map((u, idx) => (
              <Link
                key={u.slug}
                href={`/universities/${u.slug}`}
                className="group bg-white border-2 border-gray-200 hover:border-[#9B1B30] p-5 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 bg-white border border-gray-100 flex items-center justify-center shrink-0">
                    {u.logo && u.logo.startsWith('http') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.logo} alt={u.name} className="h-12 w-12 object-contain" />
                    ) : (
                      <GraduationCap className="h-8 w-8 text-[#1B2A4A]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#9B1B30] mb-1">
                      Option {idx === 0 ? 'A' : 'B'}
                    </p>
                    <h2 className="text-lg font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors truncate">
                      {u.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {u.city}, China
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 bg-[#9B1B30] text-white px-2 py-0.5 font-semibold">
                        #{u.ranking} China
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#1B2A4A] font-semibold">
                        <Trophy className="h-3 w-3 fill-[#D4A853] text-[#D4A853]" />
                        QS #{u.qsWorldRanking}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#1B2A4A] font-semibold">
                        <Star className="h-3 w-3 fill-[#D4A853] text-[#D4A853]" />
                        {u.rating}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#9B1B30] group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-6">Key facts</h2>
          <div className="bg-white border-2 border-gray-200">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_2fr_2fr] border-b-2 border-gray-200 bg-[#FAFAF8]">
              <div className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Attribute
              </div>
              <div className="p-4 text-sm font-bold text-[#1B2A4A] border-l-2 border-gray-200">
                {uniA.name}
              </div>
              <div className="p-4 text-sm font-bold text-[#1B2A4A] border-l-2 border-gray-200">
                {uniB.name}
              </div>
            </div>

            {/* Data rows */}
            {rows.map((row, idx) => {
              const Icon = row.icon;
              const aIsWinner = row.winner === 'a';
              const bIsWinner = row.winner === 'b';
              return (
                <div
                  key={row.label}
                  className={[
                    'grid grid-cols-[1fr_2fr_2fr] border-b border-gray-100 last:border-b-0',
                    idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]/40',
                  ].join(' ')}
                >
                  <div className="p-4 text-sm font-semibold text-[#1B2A4A] flex items-center gap-2">
                    <Icon className="h-4 w-4 text-[#1B2A4A]/60" />
                    {row.label}
                  </div>
                  <div
                    className={[
                      'p-4 text-sm border-l-2 border-gray-200 flex items-center gap-2',
                      aIsWinner ? 'bg-[#D4A853]/10 font-semibold' : '',
                    ].join(' ')}
                  >
                    {aIsWinner && <Check className="h-4 w-4 text-[#9B1B30] shrink-0" />}
                    {row.a}
                  </div>
                  <div
                    className={[
                      'p-4 text-sm border-l-2 border-gray-200 flex items-center gap-2',
                      bIsWinner ? 'bg-[#D4A853]/10 font-semibold' : '',
                    ].join(' ')}
                  >
                    {bIsWinner && <Check className="h-4 w-4 text-[#9B1B30] shrink-0" />}
                    {row.b}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Programs at each */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-6">Popular programs</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { uni: uniA, programs: programsA },
              { uni: uniB, programs: programsB },
            ].map(({ uni, programs }) => (
              <div key={uni.slug} className="bg-white border-2 border-gray-200 p-5">
                <h3 className="text-sm font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Top 5 at {uni.name}
                </h3>
                {programs.length > 0 ? (
                  <ul className="space-y-2">
                    {programs.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <Check className="h-4 w-4 text-[#9B1B30] mt-0.5 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Program list coming soon.</p>
                )}
                <Link
                  href={`/universities/${uni.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#9B1B30] hover:underline"
                >
                  See all programs <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Disciplines */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-6">Disciplines offered</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { uni: uniA, disc: discA },
              { uni: uniB, disc: discB },
            ].map(({ uni, disc }) => (
              <div key={uni.slug} className="bg-white border-2 border-gray-200 p-5">
                <h3 className="text-sm font-bold text-[#1B2A4A] mb-3">
                  {uni.name} disciplines
                </h3>
                {disc.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {disc.map((d) => (
                      <span
                        key={d}
                        className="text-xs font-medium px-2.5 py-1 bg-[#1B2A4A]/10 text-[#1B2A4A]"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">—</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-6">FAQ</h2>
          <div className="space-y-3">
            {faqSchema.mainEntity.map((f) => (
              <details
                key={f.name}
                className="group bg-white border-2 border-gray-200 hover:border-[#1B2A4A] transition-colors"
              >
                <summary className="cursor-pointer p-4 sm:p-5 font-semibold text-[#1B2A4A] flex items-start gap-3 list-none">
                  <span className="shrink-0 w-7 h-7 bg-[#1B2A4A] text-white text-xs font-bold flex items-center justify-center">
                    Q
                  </span>
                  <span className="flex-1">{f.name}</span>
                  <span className="shrink-0 text-gray-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pl-14 text-sm text-[#4B5563] leading-relaxed">
                  {f.acceptedAnswer.text}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Apply CTA */}
        <section className="bg-[#1B2A4A] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
            <Award className="h-10 w-10 text-[#D4A853] mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              Ready to apply to {uniA.name} or {uniB.name}?
            </h2>
            <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
              SICA's team helps you with everything — application prep, scholarship matching,
              visa documents, and pre-departure. Get a free assessment within 48 hours.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/assessment?major=${encodeURIComponent(uniA.name + ' / ' + uniB.name)}`}
                className="inline-flex items-center gap-2 bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold px-6 py-2.5 text-sm transition-colors"
              >
                Get free assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/universities/compare"
                className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Compare other pairs
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

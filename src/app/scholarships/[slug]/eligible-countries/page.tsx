import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Award, ChevronRight, ArrowRight, Globe, Users, Calendar, Banknote } from 'lucide-react';
import { scholarships as staticScholarships } from '@/lib/data';
import { COUNTRIES } from '@/lib/seo-data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sica.com.cn';

const REAL_SCHOLARSHIPS = staticScholarships.filter(
  (s) => s.slug.includes('scholarship') || s.slug.startsWith('csc-'),
);

export const dynamic = 'force-static';

export function generateStaticParams() {
  return REAL_SCHOLARSHIPS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const scholarship = REAL_SCHOLARSHIPS.find((s) => s.slug === slug);
  if (!scholarship) return { title: 'Not Found' };

  const title = `${scholarship.name} — Eligible Countries and Application Guide (2026)`;
  const description = `${scholarship.name} eligibility: which countries and regions can apply, application requirements, coverage, deadlines, and how to apply. Updated 2026.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/scholarships/${slug}/eligible-countries` },
    openGraph: { title, description, type: 'article' },
  };
}

export default async function EligibleCountriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scholarship = REAL_SCHOLARSHIPS.find((s) => s.slug === slug);
  if (!scholarship) notFound();

  // Heuristic eligibility: most CSC scholarships are open to all
  // countries (with some bilateral restrictions). Confucius Institute
  // is open globally. MOFCOM / Belt-and-Road focus on developing
  // countries. Provincial scholarships are open to all.
  //
  // We show all 35 countries in our SEO index, and the
  // scholarship's `eligibleRegions` field surfaces the formal
  // wording. This page is a deep-dive on eligibility, not a
  // narrow list of "approved" countries.
  const isOpenGlobally = scholarship.slug.startsWith('csc-') ||
    scholarship.slug === 'confucius-institute-scholarship' ||
    scholarship.slug === 'beijing-government-scholarship' ||
    scholarship.slug === 'shanghai-government-scholarship';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Scholarships', item: `${SITE_URL}/scholarships` },
      { '@type': 'ListItem', position: 3, name: scholarship.name, item: `${SITE_URL}/scholarships/${slug}` },
      { '@type': 'ListItem', position: 4, name: 'Eligible countries' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Who can apply for the ${scholarship.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: scholarship.eligibleRegions || 'All international students are eligible to apply.',
        },
      },
      {
        '@type': 'Question',
        name: `Is the ${scholarship.name} open to students from my country?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${scholarship.name} accepts applications from ${isOpenGlobally ? 'students of all nationalities, with priority given to applicants from' : 'applicants from'} ${scholarship.eligibleRegions || 'all countries'}. Submit your application through SICA and we will confirm eligibility for your specific case.`,
        },
      },
      {
        '@type': 'Question',
        name: `What does the ${scholarship.name} cover?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${scholarship.name} is a ${scholarship.type.toLowerCase()} scholarship. Coverage: ${scholarship.coverage.join('; ')}.`,
        },
      },
    ],
  };

  return (
    <>
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
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/scholarships" className="hover:text-[#9B1B30] transition-colors">Scholarships</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/scholarships/${slug}`} className="hover:text-[#9B1B30] transition-colors truncate max-w-[200px]">{scholarship.name}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-[#1B2A4A] font-medium">Eligible countries</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-[#1B2A4A] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4A853] mb-3">
              <Award className="h-4 w-4" />
              Eligible Countries
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              {scholarship.name} — Eligible Countries
            </h1>
            <p className="mt-3 text-lg text-gray-300 max-w-3xl">
              {scholarship.eligibleRegions}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300">
              <span
                className={[
                  'inline-flex items-center gap-1.5 px-2.5 py-1 font-semibold',
                  scholarship.type === 'Full' ? 'bg-[#9B1B30] text-white' : 'bg-[#D4A853]/15 text-[#D4A853]',
                ].join(' ')}
              >
                {scholarship.type} scholarship
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Deadline: {scholarship.deadline}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                {isOpenGlobally ? 'Open to all countries' : 'Restricted regions'}
              </span>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Last updated: {new Date().toISOString().slice(0, 10)} · SICA Editorial Team
            </p>
          </div>
        </section>

        {/* Country grid — all 35 SICA SEO countries. SICA can help
            students from any of these apply; eligibility is per
            scholarship rules, not per country. */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-3">
            Apply from your country
          </h2>
          <p className="text-sm text-gray-600 mb-6 max-w-3xl">
            SICA helps students from {COUNTRIES.length}+ countries apply for the {scholarship.name}.
            Select your country to see country-specific guidance and start your application.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {COUNTRIES.map((c) => (
              <Link
                key={c.slug}
                href={`/scholarships-for/${c.slug}`}
                className="group flex items-center justify-between gap-2 bg-white border border-gray-200 hover:border-[#9B1B30] p-3 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors text-sm">
                    {c.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    SICA available
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#9B1B30] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* Key facts */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-5">
            {scholarship.name} at a glance
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Banknote, label: 'Type', value: scholarship.type },
              { icon: Users, label: 'Degree levels', value: scholarship.degreeLevels.join(', ') },
              { icon: Calendar, label: 'Duration', value: scholarship.duration },
              { icon: Globe, label: 'Eligible regions', value: scholarship.eligibleRegions },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="bg-white border-2 border-gray-200 p-4">
                  <Icon className="h-5 w-5 text-[#1B2A4A] mb-2" />
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{f.label}</p>
                  <p className="text-sm font-semibold text-[#1B2A4A] mt-1">{f.value}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#1B2A4A] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Ready to apply for the {scholarship.name}?
            </h2>
            <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
              SICA helps you confirm eligibility for your specific country, prepare documents,
              and submit before the deadline. Free initial consultation.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/assessment?major=${encodeURIComponent(scholarship.name)}`}
                className="inline-flex items-center gap-2 bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold px-6 py-2.5 text-sm transition-colors"
              >
                Get free assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/scholarships/${slug}`}
                className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Scholarship details
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

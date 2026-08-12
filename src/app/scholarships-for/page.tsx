import { Metadata } from 'next';
import Link from 'next/link';
import { Gift, ArrowRight, Globe } from 'lucide-react';
import { COUNTRIES, getScholarshipsForCountry } from '@/lib/seo-data';
import { getServerT } from '@/lib/server-t';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

/**
 * /scholarships-for — SEO hub page. Lists the curated set of source
 * countries we target for scholarship pages. Each card links to the
 * /scholarships-for/[country] detail page.
 *
 * Built for queries like "scholarships for [country] students in
 * China" — see the page H1 below.
 */
export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('seo.scholarships.hubTitle'),
    description: t('seo.scholarships.hubDescription'),
    alternates: buildLanguageAlternates('/scholarships-for'),
    openGraph: {
      title: t('seo.scholarships.hubTitle'),
      description: t('seo.scholarships.hubDescription'),
      url: `${SITE_URL}/scholarships-for`,
      type: 'website',
    },
  };
}

export default async function ScholarshipsForHub() {
  const t = await getServerT();

  // Group countries by region for the hub
  const byRegion = COUNTRIES.reduce<Record<string, typeof COUNTRIES>>(
    (acc, c) => {
      (acc[c.region] = acc[c.region] || []).push(c);
      return acc;
    },
    {},
  );
  const regionOrder: Array<keyof typeof byRegion> = [
    'Asia', 'Africa', 'Middle East', 'Europe', 'Americas', 'Oceania',
  ];
  const regionLabels: Record<string, { en: string; zh: string }> = {
    'Asia':         { en: 'Asia & Central Asia', zh: '亚洲与中亚' },
    'Africa':       { en: 'Africa',              zh: '非洲' },
    'Middle East':  { en: 'Middle East',         zh: '中东' },
    'Europe':       { en: 'Europe',              zh: '欧洲' },
    'Americas':     { en: 'Americas',            zh: '美洲' },
    'Oceania':      { en: 'Oceania',             zh: '大洋洲' },
  };

  // Total scholarship count (any country with at least one match)
  const countriesWithScholarships = COUNTRIES.filter(
    (c) => getScholarshipsForCountry(c.slug).length > 0,
  ).length;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1B2A4A] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,#D4A853_0%,transparent_50%),radial-gradient(circle_at_70%_80%,#9B1B30_0%,transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 mb-6">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {t('seo.scholarships.eyebrow')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              {t('seo.scholarships.hubTitle')}
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              {t('seo.scholarships.hubDescription')}
            </p>
            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#D4A853]" />
                <span><strong className="text-white">{countriesWithScholarships}</strong> {t('seo.scholarships.countriesListed')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Countries grouped by region */}
      {regionOrder.map((region) => {
        const countries = byRegion[region];
        if (!countries || countries.length === 0) return null;
        return (
          <section
            key={region}
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10 border-b border-gray-200 last:border-b-0"
          >
            <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">
              {regionLabels[region]?.en || region}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {countries.map((c) => {
                const count = getScholarshipsForCountry(c.slug).length;
                return (
                  <Link
                    key={c.slug}
                    href={`/scholarships-for/${c.slug}`}
                    className="group flex items-center justify-between gap-2 bg-white border border-gray-200 hover:border-[#9B1B30] px-3 py-2.5 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#1B2A4A] group-hover:text-[#9B1B30] truncate transition-colors">
                        {c.name}
                      </div>
                      <div className="text-xs text-[#6B7280]">{c.nameCn}</div>
                    </div>
                    {count > 0 && (
                      <div className="shrink-0 text-xs text-[#6B7280]">
                        {count}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              {t('seo.scholarships.ctaTitle')}
            </h2>
            <p className="text-gray-300 mb-6">
              {t('seo.scholarships.ctaDescription')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/scholarships"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#9B1B30] hover:bg-[#7A1526] text-white text-sm font-semibold uppercase tracking-wider transition-colors"
              >
                {t('seo.scholarships.ctaBrowseAll')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 hover:border-white text-white text-sm font-semibold uppercase tracking-wider transition-colors"
              >
                {t('seo.scholarships.ctaApply')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

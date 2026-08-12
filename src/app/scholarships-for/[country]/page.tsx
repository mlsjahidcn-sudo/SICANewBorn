import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Gift, Globe, Calendar, CheckCircle, ArrowRight, Clock, BookOpen } from 'lucide-react';
import { COUNTRIES, getCountryBySlug, getScholarshipsForCountry } from '@/lib/seo-data';
import { getServerT } from '@/lib/server-t';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from "@/lib/site-url";

/**
 * /scholarships-for/[country] — pre-rendered detail page that lists
 * every scholarship available to students from a given country who
 * want to study in China.
 *
 * The H1 explicitly says "to study in China" so search engines and
 * visitors can never mistake this for "scholarships for citizens of
 * [country] to study elsewhere".
 */
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return COUNTRIES.map((c) => ({ country: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country: slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) return { title: 'Not Found' };

  const t = await getServerT();
  const title = t('seo.scholarships.detailTitle', { country: country.name });
  const description = t('seo.scholarships.detailDescription', {
    country: country.name,
    count: getScholarshipsForCountry(slug).length,
  });

  return {
    title,
    description,
    alternates: buildLanguageAlternates(`${SITE_URL}/scholarships-for/${country.slug}`),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/scholarships-for/${country.slug}`,
      type: 'website',
    },
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) notFound();

  const t = await getServerT();
  const matching = getScholarshipsForCountry(slug);
  // Other countries for cross-linking (same region first, then global)
  const sameRegion = COUNTRIES.filter(
    (c) => c.slug !== country.slug && c.region === country.region,
  );
  const otherRegions = COUNTRIES.filter(
    (c) => c.slug !== country.slug && c.region !== country.region,
  );
  const related = [...sameRegion, ...otherRegions].slice(0, 8);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1B2A4A] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_30%,#D4A853_0%,transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-300">
            <Link href="/scholarships-for" className="hover:text-white transition-colors">
              {t('seo.scholarships.eyebrow')}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{country.name}</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 mb-4">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {t('seo.scholarships.eyebrowFor')}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              {t('seo.scholarships.detailH1', {
                country: country.name,
                countryCn: country.nameCn,
              })}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-300">
              {t('seo.scholarships.detailIntro', { country: country.name })}
            </p>
          </div>
        </div>
      </section>

      {/* Scholarship list */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              {t('seo.scholarships.scholarshipsAvailable', { country: country.name })}
            </h2>
            <p className="text-[#4B5563] mt-1">
              {t('seo.scholarships.scholarshipsAvailableSubtitle', { count: matching.length })}
            </p>
          </div>
        </div>

        {matching.length === 0 ? (
          <div className="bg-white border border-gray-200 p-8 text-center">
            <p className="text-[#4B5563]">
              {t('seo.scholarships.noMatch', { country: country.name })}
            </p>
            <Link
              href="/scholarships"
              className="inline-flex items-center gap-1 mt-4 text-[#9B1B30] font-medium hover:underline"
            >
              {t('seo.scholarships.viewAllScholarships')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {matching.map((s) => (
              <Link
                key={s.slug}
                href={`/scholarships/${s.slug}`}
                className="group block bg-white border-2 border-gray-200 hover:border-[#9B1B30] p-6 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="shrink-0">
                    <div className="w-14 h-14 bg-[#D4A853] flex items-center justify-center">
                      <Gift className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2 mb-1">
                      <h3 className="text-lg font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors">
                        {s.name}
                      </h3>
                      <span className="text-sm text-[#6B7280]">{s.nameCn}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3 text-xs">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D4A853]/10 text-[#9B1B30] font-medium">
                        {s.type === 'Full' ? t('seo.scholarships.fullFunded') : t('seo.scholarships.partialFunded')}
                      </span>
                      {s.degreeLevels.slice(0, 3).map((d) => (
                        <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-[#1B2A4A]">
                          <BookOpen className="w-3 h-3" />{d}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-[#4B5563] line-clamp-2 mb-3">{s.description}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#4B5563]">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {t('seo.scholarships.deadline')}: {s.deadline}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t('seo.scholarships.duration')}: {s.duration}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm text-[#9B1B30] font-medium flex items-center gap-1 group-hover:gap-2 transition-all md:justify-end">
                      {t('seo.scholarships.viewDetails')}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Cross-link: other countries */}
      <section className="bg-white border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">
            {t('seo.scholarships.exploreOtherCountries')}
          </h2>
          <p className="text-sm text-[#4B5563] mb-6">
            {t('seo.scholarships.exploreOtherCountriesSubtitle')}
          </p>
          <div className="flex flex-wrap gap-2">
            {related.map((rc) => (
              <Link
                key={rc.slug}
                href={`/scholarships-for/${rc.slug}`}
                className="px-4 py-2 bg-white border-2 border-gray-200 hover:border-[#9B1B30] hover:text-[#9B1B30] text-sm font-medium text-[#1B2A4A] transition-colors"
              >
                {rc.name}
                <span className="ml-1 text-xs text-[#6B7280]">({rc.nameCn})</span>
              </Link>
            ))}
            <Link
              href="/scholarships-for"
              className="px-4 py-2 bg-[#1B2A4A] text-white text-sm font-medium hover:bg-[#0F1B33] transition-colors"
            >
              {t('seo.scholarships.viewAllCountries')} →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#9B1B30] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            {t('seo.scholarships.finalCtaTitle', { country: country.name })}
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            {t('seo.scholarships.finalCtaSubtitle')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#9B1B30] hover:bg-gray-100 text-sm font-semibold uppercase tracking-wider transition-colors"
            >
              {t('seo.scholarships.ctaApply')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 hover:border-white text-white text-sm font-semibold uppercase tracking-wider transition-colors"
            >
              {t('seo.scholarships.ctaContact')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, GraduationCap, ArrowRight, MapPin } from 'lucide-react';
import { cities } from '@/lib/seo-data';
import { universities } from '@/lib/data';
import { getServerT } from '@/lib/server-t';

/**
 * /study-in-china — SEO hub page listing all Chinese cities with
 * SICA partner universities. Built for queries like "study in China"
 * and "[city] universities for international students".
 *
 * Page is server-rendered (RSC). City data is derived at module load
 * time from src/lib/data.ts via src/lib/seo-data.ts.
 */
export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('seo.cities.hubTitle'),
    description: t('seo.cities.hubDescription'),
    alternates: {
      canonical: 'https://sica.com.cn/study-in-china',
    },
    openGraph: {
      title: t('seo.cities.hubTitle'),
      description: t('seo.cities.hubDescription'),
      url: 'https://sica.com.cn/study-in-china',
      type: 'website',
    },
  };
}

export default async function StudyInChinaHub() {
  const t = await getServerT();
  const totalUniversities = universities.length;
  const totalCities = cities.length;
  const totalPrograms = cities.reduce((acc, c) => acc + c.programCount, 0);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1B2A4A] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,#D4A853_0%,transparent_50%),radial-gradient(circle_at_70%_80%,#9B1B30_0%,transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 mb-6">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {t('seo.cities.eyebrow')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              {t('seo.cities.hubTitle')}
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              {t('seo.cities.hubDescription')}
            </p>
            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#D4A853]" />
                <span><strong className="text-white">{totalUniversities}</strong> {t('seo.cities.universities')}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4A853]" />
                <span><strong className="text-white">{totalCities}</strong> {t('seo.cities.cities')}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#D4A853]" />
                <span><strong className="text-white">{totalPrograms}+</strong> {t('seo.cities.programs')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* City grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <h2 className="text-2xl font-bold text-[#1B2A4A] mb-2">
          {t('seo.cities.chooseCity')}
        </h2>
        <p className="text-[#4B5563] mb-8">
          {t('seo.cities.chooseCitySubtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/study-in-china/${city.slug}`}
              className="group bg-white border-2 border-gray-200 hover:border-[#9B1B30] p-6 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-sm text-[#6B7280] mt-0.5">{city.nameCn}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold text-[#1B2A4A]">
                    {city.universityCount}
                  </div>
                  <div className="text-xs text-[#6B7280]">
                    {city.universityCount === 1 ? t('seo.cities.university') : t('seo.cities.universities')}
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#4B5563] leading-relaxed mb-4">
                {city.tagline}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-xs text-[#6B7280]">
                  {city.programCount}+ {t('seo.cities.programsAvailable')}
                </div>
                <div className="text-sm font-medium text-[#9B1B30] flex items-center gap-1 group-hover:gap-2 transition-all">
                  {t('seo.cities.exploreCity')}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              {t('seo.cities.ctaTitle')}
            </h2>
            <p className="text-gray-300 mb-6">
              {t('seo.cities.ctaDescription')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#9B1B30] hover:bg-[#7A1526] text-white text-sm font-semibold uppercase tracking-wider transition-colors"
              >
                {t('seo.cities.ctaApply')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 hover:border-white text-white text-sm font-semibold uppercase tracking-wider transition-colors"
              >
                {t('seo.cities.ctaContact')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

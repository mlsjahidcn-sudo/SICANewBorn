import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, GraduationCap, Star, Building, ArrowRight, Award, Globe } from 'lucide-react';
import UniversityLogo from '@/components/university-logo';
import { cities, getCityBySlug, getUniversitiesByCity } from '@/lib/seo-data';
import { getServerT } from '@/lib/server-t';

/**
 * /study-in-china/[city] — pre-rendered detail page for one Chinese
 * city. Lists all SICA partner universidades in the city with key
 * facts (ranking, type, popular programs, tuition), and a strong
 * "Apply to study in [City]" CTA.
 *
 * URL slugs: lowercased English city name (e.g. "beijing"). Chinese
 * search traffic is captured by the alternate URLs we publish in
 * the sitemap.
 */
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) return { title: 'Not Found' };

  const t = await getServerT();
  const title = t('seo.cities.detailTitle', { city: city.name });
  const description = t('seo.cities.detailDescription', {
    city: city.name,
    count: city.universityCount,
  });

  return {
    title,
    description,
    alternates: { canonical: `https://sica.com.cn/study-in-china/${city.slug}` },
    openGraph: {
      title,
      description,
      url: `https://sica.com.cn/study-in-china/${city.slug}`,
      type: 'website',
    },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) notFound();

  const t = await getServerT();
  const cityUniversities = getUniversitiesByCity(city.slug);
  // Other cities for cross-linking
  const otherCities = cities.filter((c) => c.slug !== city.slug).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1B2A4A] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_30%,#D4A853_0%,transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-300">
            <Link href="/study-in-china" className="hover:text-white transition-colors">
              {t('seo.cities.eyebrow')}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{city.name}</span>
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 mb-4">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {t('seo.cities.studyIn')}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                {t('seo.cities.detailH1', { city: city.name })}
              </h1>
              <p className="mt-2 text-lg text-gray-300">{city.nameCn}</p>
              <p className="mt-4 text-base text-gray-200 leading-relaxed">
                {city.tagline}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 border border-white/20 px-4 py-3 min-w-[100px]">
                <div className="text-2xl font-bold text-white">{city.universityCount}</div>
                <div className="text-xs uppercase tracking-wider text-gray-300 mt-0.5">
                  {city.universityCount === 1 ? t('seo.cities.university') : t('seo.cities.universities')}
                </div>
              </div>
              <div className="bg-white/10 border border-white/20 px-4 py-3 min-w-[100px]">
                <div className="text-2xl font-bold text-white">{city.programCount}+</div>
                <div className="text-xs uppercase tracking-wider text-gray-300 mt-0.5">
                  {t('seo.cities.programs')}
                </div>
              </div>
              <div className="bg-white/10 border border-white/20 px-4 py-3 min-w-[100px]">
                <div className="text-2xl font-bold text-white">{cityUniversities[0]?.established ?? '—'}</div>
                <div className="text-xs uppercase tracking-wider text-gray-300 mt-0.5">
                  {t('seo.cities.established')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why study in this city */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <h2 className="text-2xl font-bold text-[#1B2A4A] mb-2">
          {t('seo.cities.whyTitle', { city: city.name })}
        </h2>
        <p className="text-[#4B5563] mb-6">
          {t('seo.cities.whySubtitle', { city: city.name })}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 p-5">
            <Globe className="w-7 h-7 text-[#9B1B30] mb-2" />
            <h3 className="font-semibold text-[#1B2A4A] mb-1">{t('seo.cities.why1Title')}</h3>
            <p className="text-sm text-[#4B5563]">{t('seo.cities.why1Desc', { city: city.name })}</p>
          </div>
          <div className="bg-white border border-gray-200 p-5">
            <Award className="w-7 h-7 text-[#9B1B30] mb-2" />
            <h3 className="font-semibold text-[#1B2A4A] mb-1">{t('seo.cities.why2Title')}</h3>
            <p className="text-sm text-[#4B5563]">{t('seo.cities.why2Desc', { city: city.name })}</p>
          </div>
          <div className="bg-white border border-gray-200 p-5">
            <Building className="w-7 h-7 text-[#9B1B30] mb-2" />
            <h3 className="font-semibold text-[#1B2A4A] mb-1">{t('seo.cities.why3Title')}</h3>
            <p className="text-sm text-[#4B5563]">{t('seo.cities.why3Desc', { city: city.name })}</p>
          </div>
        </div>
      </section>

      {/* Universities list */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h2 className="text-2xl font-bold text-[#1B2A4A] mb-2">
          {t('seo.cities.universitiesIn', { city: city.name })}
        </h2>
        <p className="text-[#4B5563] mb-6">
          {t('seo.cities.universitiesInSubtitle')}
        </p>

        <div className="space-y-4">
          {cityUniversities.map((u) => (
            <Link
              key={u.slug}
              href={`/universities/${u.slug}`}
              className="group block bg-white border-2 border-gray-200 hover:border-[#9B1B30] p-6 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="shrink-0">
                  <div className="w-20 h-20 bg-white border border-gray-200 flex items-center justify-center">
                    <UniversityLogo src={u.logo} variant="card" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <h3 className="text-xl font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors">
                      {u.name}
                    </h3>
                    <span className="text-sm text-[#6B7280]">{u.nameCn}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#4B5563] mb-3">
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#D4A853]" />
                      #{u.ranking} {t('seo.cities.ranking')}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {u.type}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {t('seo.cities.establishedShort')} {u.established}
                    </span>
                  </div>
                  <p className="text-sm text-[#4B5563] line-clamp-2 mb-3">{u.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {u.popularPrograms?.slice(0, 4).map((p) => (
                      <span
                        key={p}
                        className="text-xs bg-gray-100 text-[#1B2A4A] px-2 py-0.5"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm text-[#9B1B30] font-medium flex items-center gap-1 group-hover:gap-2 transition-all md:justify-end">
                    {t('seo.cities.viewProfile')}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Cross-link: other cities */}
      <section className="bg-white border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">
            {t('seo.cities.exploreOtherCities')}
          </h2>
          <p className="text-sm text-[#4B5563] mb-6">
            {t('seo.cities.exploreOtherCitiesSubtitle')}
          </p>
          <div className="flex flex-wrap gap-2">
            {otherCities.map((oc) => (
              <Link
                key={oc.slug}
                href={`/study-in-china/${oc.slug}`}
                className="px-4 py-2 bg-white border-2 border-gray-200 hover:border-[#9B1B30] hover:text-[#9B1B30] text-sm font-medium text-[#1B2A4A] transition-colors"
              >
                {oc.name}
                <span className="ml-1 text-xs text-[#6B7280]">({oc.universityCount})</span>
              </Link>
            ))}
            <Link
              href="/study-in-china"
              className="px-4 py-2 bg-[#1B2A4A] text-white text-sm font-medium hover:bg-[#0F1B33] transition-colors"
            >
              {t('seo.cities.viewAllCities')} →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#9B1B30] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            {t('seo.cities.finalCtaTitle', { city: city.name })}
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            {t('seo.cities.finalCtaSubtitle')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#9B1B30] hover:bg-gray-100 text-sm font-semibold uppercase tracking-wider transition-colors"
            >
              {t('seo.cities.ctaApply')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 hover:border-white text-white text-sm font-semibold uppercase tracking-wider transition-colors"
            >
              {t('seo.cities.ctaContact')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

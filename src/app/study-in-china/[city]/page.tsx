import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArrowRight, Building2, CloudSun, MapPin } from 'lucide-react';
import { getCityCatalog, getCityBySlugAsync, seedCities } from '@/lib/city-catalog';
import { cityPageHref, cityPageNumber, citySlug, CITY_PAGE_SIZE, findCityUniversities } from '@/lib/city-index';
import { cityProfiles } from '@/lib/city-profiles';
import { getServerLocale, getServerT } from '@/lib/server-t';
import { isSupabaseServerConfigured } from '@/lib/supabase-server';
import { buildLanguageAlternates } from '@/lib/alternates';
import { buildBreadcrumbSchema, buildItemListSchema } from '@/lib/catalog-schema';
import { SITE_URL } from '@/lib/site-url';
import { documentTitle } from '@/lib/document-title';
import { CityLogo } from '@/components/cities/city-logo';
import { CityConsultation, CityDataNotice, CityEmpty, CityPagination, CityPhoto, CitySearch, CityStats, cityContainer, cityFocus, cityName } from '@/components/cities/city-ui';

export const revalidate = 60;
type SearchParams = Record<string, string | string[] | undefined>;
export function generateStaticParams(): { city: string }[] { return seedCities.map((city) => ({ city: city.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const city = await getCityBySlugAsync((await params).city);
  if (!city) return { title: 'Not Found' };
  const [t, locale] = await Promise.all([getServerT(), getServerLocale()]);
  const name = cityName(city, locale);
  const title = t('seo.cities.detailTitle', { city: name });
  const description = t('seo.cities.detailDescription', { city: name, count: city.universityCount });
  return { title: documentTitle(title), description, alternates: await buildLanguageAlternates(`/study-in-china/${city.slug}`), openGraph: { title, description, url: `${SITE_URL}/study-in-china/${city.slug}`, type: 'website' } };
}

export default async function CityPage({ params, searchParams }: { params: Promise<{ city: string }>; searchParams: Promise<SearchParams> }): Promise<React.JSX.Element> {
  const [route, query, catalog, t, locale] = await Promise.all([params, searchParams, getCityCatalog(), getServerT(), getServerLocale()]);
  const city = catalog.cities.find((item) => item.slug === citySlug(route.city));
  if (!city) {
    // An outage must not turn a valid live-only city into a cached 404.
    if (catalog.source !== 'live' && isSupabaseServerConfigured()) throw new Error('City catalog temporarily unavailable');
    notFound();
  }
  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 200) : '';
  const sort = query.sort === 'name' ? 'name' : 'ranking';
  const lang = locale === 'zh' ? 'zh' : undefined;
  const path = `/study-in-china/${city.slug}`;
  if (route.city !== city.slug) permanentRedirect(cityPageHref(path, q, sort, cityPageNumber(typeof query.page === 'string' ? query.page : undefined, city.universityCount), lang));
  const name = cityName(city, locale);
  const matches = findCityUniversities(city, q, sort);
  const page = cityPageNumber(typeof query.page === 'string' ? query.page : undefined, matches.length);
  const visible = matches.slice((page - 1) * CITY_PAGE_SIZE, page * CITY_PAGE_SIZE);
  const profile = cityProfiles[city.slug];
  const summary = profile?.summary[locale] ?? t('cityFinder.citySummary', { city: name, universities: city.universities.slice(0, 2).map((u) => locale === 'zh' && u.nameCn ? u.nameCn : u.name).join(locale === 'zh' ? '、' : ', ') });
  const programParams = new URLSearchParams({ city: city.name });
  const programHref = `/programs?${programParams}`;
  const context = new URLSearchParams({ city: city.name }).toString();
  const breadcrumb = buildBreadcrumbSchema([{ name: t('cityFinder.allCities'), path: '/study-in-china' }, { name, path }]);
  const list = buildItemListSchema(t('seo.cities.universitiesIn', { city: name }), visible.map((u) => ({ name: locale === 'zh' && u.nameCn ? u.nameCn : u.name, url: `${SITE_URL}/universities/${u.slug}` })));
  return <div className="bg-[#FAFAF8] text-[#1B2A4A]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumb, list]).replace(/</g, '\\u003c') }} />
    <section className="border-b border-gray-200 bg-white">
      <div className={`${cityContainer} py-5`}>
        <nav aria-label={t('cityFinder.allCities')} className="mb-4 flex flex-wrap gap-2 text-xs text-gray-500"><Link href={`/study-in-china${lang ? '?lang=zh' : ''}`} className={`underline hover:text-[#9B1B30] ${cityFocus}`}>{t('cityFinder.allCities')}</Link><span aria-hidden="true">/</span><span aria-current="page">{name}</span></nav>
        <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_260px] lg:grid-cols-[minmax(0,1fr)_340px]"><div><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('seo.cities.detailH1', { city: name })}</h1><p className="mt-1 text-sm text-gray-500">{locale === 'zh' ? city.name : city.nameCn}</p><p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">{summary}</p><CityStats universityCount={city.universityCount} programCount={city.programCount} englishCount={city.englishProgramCount} t={t} /></div><div className="hidden sm:block"><CityPhoto slug={city.slug} name={name} priority /></div></div>
      </div>
    </section>
    <nav aria-label={t('seo.cities.studyIn')} className="border-b border-gray-200 bg-white"><div className={`${cityContainer} flex flex-wrap gap-x-6 gap-y-2 py-3 text-sm font-medium`}><Link href="#universities" className={cityFocus}>{t('seo.cities.universities')}</Link><Link href={programHref} className={`text-[#9B1B30] ${cityFocus}`}>{t('cityFinder.browsePrograms', { city: name })}</Link><Link href="#city-guide" className={cityFocus}>{t('cityFinder.cityGuide')}</Link></div></nav>
    <section id="universities" aria-labelledby="universities-title" className={`${cityContainer} scroll-mt-20 py-6`}>
      <CityDataNotice catalog={catalog} t={t} />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 id="universities-title" className="text-xl font-semibold">{t('seo.cities.universitiesIn', { city: name })}</h2><p className="mt-1 text-sm text-gray-600">{t('seo.cities.universitiesInSubtitle', { city: name })}</p></div><Link href={`/universities?city=${encodeURIComponent(city.name)}`} className={`text-sm text-[#9B1B30] underline ${cityFocus}`}>{t('cityFinder.allUniversitiesCity')}</Link></div>
      <CitySearch path={path} q={q} sort={sort} lang={lang} label={t('cityFinder.searchUniversities')} placeholder={t('cityFinder.searchUniversitiesHint')} t={t} options={[{ value: 'ranking', label: t('cityFinder.sortRanking') }, { value: 'name', label: t('cityFinder.sortName') }]} />
      <div className="my-4 flex flex-wrap justify-between gap-2 text-sm text-gray-600"><p role="status">{t('cityFinder.universityResults', { city: name, count: matches.length })}</p>{q && <Link href={`${path}${lang ? '?lang=zh' : ''}`} className={`text-[#9B1B30] underline ${cityFocus}`}>{t('cityFinder.clear')}</Link>}</div>
      {visible.length ? <div className="flex flex-col gap-3">{visible.map((u) => {
        const universityName = locale === 'zh' && u.nameCn ? u.nameCn : u.name;
        const description = locale === 'zh' && u.descriptionCn ? u.descriptionCn : u.description;
        const programs = new URLSearchParams({ city: city.name, uni: u.slug });
        const href = `/universities/${u.slug}?from=${encodeURIComponent(context)}`;
        return <article key={u.slug} className="flex gap-4 border border-gray-200 bg-white p-4 sm:p-5">
          <CityLogo src={u.logo} name={universityName} />
          <div className="min-w-0 flex-1"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div className="min-w-0"><h3 className="break-words text-lg font-semibold"><Link href={href} prefetch={false} className={`hover:text-[#9B1B30] ${cityFocus}`}>{universityName}</Link></h3><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">{u.ranking > 0 && <span>#{u.ranking} {t('seo.cities.ranking')}</span>}{u.type && <span>{locale === 'zh' && u.typeCn ? u.typeCn : u.type}</span>}{u.established > 0 && <span>{t('seo.cities.establishedShort')} {u.established}</span>}</div></div><Link href={`/programs?${programs}`} className={`inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-[#9B1B30] ${cityFocus}`}>{t('cityFinder.viewPrograms')}<ArrowRight className="size-4 text-[#1B2A4A]" aria-hidden="true" /></Link></div>{description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{description}</p>}{(u.tuitionUndergrad || u.tuitionGraduate) && <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs">{u.tuitionUndergrad && <div><dt className="text-gray-500">{t('cityFinder.tuitionUndergrad')}</dt><dd className="mt-1">{u.tuitionUndergrad}</dd></div>}{u.tuitionGraduate && <div><dt className="text-gray-500">{t('cityFinder.tuitionGraduate')}</dt><dd className="mt-1">{u.tuitionGraduate}</dd></div>}</dl>}</div>
        </article>;
      })}</div> : <CityEmpty path={`${path}${lang ? '?lang=zh' : ''}`} t={t} />}
      <CityPagination path={path} q={q} sort={sort} page={page} totalPages={Math.ceil(matches.length / CITY_PAGE_SIZE)} lang={lang} t={t} />
      <p className="mt-5 text-xs leading-5 text-gray-500">{t('cityFinder.countsNote')}</p>
    </section>
    <section id="city-guide" className={`${cityContainer} scroll-mt-20 py-8`} aria-labelledby="city-guide-title"><h2 id="city-guide-title" className="text-2xl font-semibold">{t('cityFinder.cityGuide')}</h2><p className="mt-2 text-sm text-gray-600">{t('cityFinder.guideIntro', { city: name })}</p><div className="mt-5 grid gap-4 md:grid-cols-3">
      {profile && <article className="border border-gray-200 bg-white p-5"><CloudSun className="mb-3 size-5 text-[#1B2A4A]" aria-hidden="true" /><h3 className="font-semibold">{t('cityFinder.climate')}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{profile.climate[locale]}</p><a href={profile.climateSource} target="_blank" rel="noreferrer" className={`mt-3 inline-block text-xs text-[#9B1B30] underline ${cityFocus}`}>{t('cityFinder.source')}</a></article>}
      <article className="border border-gray-200 bg-white p-5"><MapPin className="mb-3 size-5 text-[#1B2A4A]" aria-hidden="true" /><h3 className="font-semibold">{t('cityFinder.transport')}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{profile?.transport[locale] ?? t('cityFinder.planningNote')}</p>{profile?.transportSource && <a href={profile.transportSource} target="_blank" rel="noreferrer" className={`mt-3 inline-block text-xs text-[#9B1B30] underline ${cityFocus}`}>{t('cityFinder.source')}</a>}</article>
      <article className="border border-gray-200 bg-white p-5"><Building2 className="mb-3 size-5 text-[#1B2A4A]" aria-hidden="true" /><h3 className="font-semibold">{t('cityFinder.housing')}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{t('cityFinder.housingDescription', { city: name })}</p><div className="mt-3 flex flex-col gap-2 text-xs text-[#9B1B30]"><Link href="/guides/accommodation" className={`underline ${cityFocus}`}>{t('cityFinder.housingGuide')}</Link><Link href="/cost-of-living-china-by-city" className={`underline ${cityFocus}`}>{t('cityFinder.costGuide')}</Link></div></article>
    </div></section>
    <section className={`${cityContainer} pb-8`}><h2 className="mb-4 text-lg font-semibold">{t('seo.cities.exploreOtherCities')}</h2><div className="flex flex-wrap gap-2">{catalog.cities.filter((c) => c.slug !== city.slug).sort((a, b) => b.universityCount - a.universityCount || a.name.localeCompare(b.name)).slice(0, 6).map((other) => <Link key={other.slug} href={`/study-in-china/${other.slug}${lang ? '?lang=zh' : ''}`} prefetch={false} className={`border border-gray-200 bg-white px-3 py-2 text-sm hover:border-[#9B1B30] ${cityFocus}`}>{cityName(other, locale)} <span className="text-gray-500">({other.universityCount})</span></Link>)}<Link href={`/study-in-china${lang ? '?lang=zh' : ''}`} className={`border border-[#1B2A4A] px-3 py-2 text-sm font-semibold ${cityFocus}`}>{t('cityFinder.allCities')}</Link></div></section>
    <CityConsultation city={name} t={t} />
  </div>;
}

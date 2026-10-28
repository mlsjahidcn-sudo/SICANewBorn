import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCityCatalog } from '@/lib/city-catalog';
import { cityPageNumber, CITY_PAGE_SIZE, findCities } from '@/lib/city-index';
import { cityProfiles } from '@/lib/city-profiles';
import { getServerLocale, getServerT } from '@/lib/server-t';
import { buildLanguageAlternates } from '@/lib/alternates';
import { buildBreadcrumbSchema, buildItemListSchema } from '@/lib/catalog-schema';
import { documentTitle } from '@/lib/document-title';
import { SITE_URL } from '@/lib/site-url';
import { CityConsultation, CityDataNotice, CityEmpty, CityPagination, CityPhoto, CitySearch, CityStats, cityContainer, cityFocus, cityName } from '@/components/cities/city-ui';

export const revalidate = 60;
type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: documentTitle(t('seo.cities.hubTitle')),
    description: t('seo.cities.hubDescription'),
    alternates: await buildLanguageAlternates('/study-in-china'),
    openGraph: { title: t('seo.cities.hubTitle'), description: t('seo.cities.hubDescription'), url: `${SITE_URL}/study-in-china`, type: 'website' },
  };
}

export default async function StudyInChinaHub({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<React.JSX.Element> {
  const [catalog, t, locale, params] = await Promise.all([getCityCatalog(), getServerT(), getServerLocale(), searchParams]);
  const q = typeof params.q === 'string' ? params.q.trim().slice(0, 200) : '';
  const sort = params.sort === 'name' || params.sort === 'programs' ? params.sort : 'universities';
  const lang = locale === 'zh' ? 'zh' : undefined;
  const matches = findCities(catalog.cities, q, sort);
  const page = cityPageNumber(typeof params.page === 'string' ? params.page : undefined, matches.length);
  const visible = matches.slice((page - 1) * CITY_PAGE_SIZE, page * CITY_PAGE_SIZE);
  const totalUniversities = catalog.cities.reduce((sum, c) => sum + c.universityCount, 0);
  const totalPrograms = catalog.programsAvailable ? catalog.cities.reduce((sum, c) => sum + (c.programCount ?? 0), 0) : null;
  const itemList = buildItemListSchema(t('cityFinder.hubTitle'), visible.map((city) => ({ name: cityName(city, locale), url: `${SITE_URL}/study-in-china/${city.slug}` })));
  const breadcrumb = buildBreadcrumbSchema([{ name: t('cityFinder.allCities'), path: '/study-in-china' }]);
  return <div className="bg-[#FAFAF8] text-[#1B2A4A]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumb, itemList]).replace(/</g, '\\u003c') }} />
    <section className="border-b border-gray-200 bg-white">
      <div className={`${cityContainer} grid items-center gap-5 py-7 sm:grid-cols-[minmax(0,1fr)_260px] lg:grid-cols-[minmax(0,1fr)_340px]`}>
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#9B1B30]">{t('seo.cities.eyebrow')}</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('cityFinder.hubTitle')}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">{t('cityFinder.hubIntro')}</p><CityStats universityCount={totalUniversities} cityCount={catalog.cities.length} programCount={totalPrograms} t={t} /></div>
        <div className="hidden sm:block"><CityPhoto slug="beijing" name={locale === 'zh' ? '北京城市景观' : 'Beijing cityscape'} priority /></div>
      </div>
    </section>
    <section className={`${cityContainer} py-6 sm:py-8`} aria-labelledby="city-directory">
      <h2 id="city-directory" className="sr-only">{t('seo.cities.chooseCity')}</h2>
      <CityDataNotice catalog={catalog} t={t} />
      <CitySearch path="/study-in-china" q={q} sort={sort} lang={lang} label={t('cityFinder.searchCities')} placeholder={t('cityFinder.searchCitiesHint')} t={t} options={[{ value: 'name', label: t('cityFinder.sortName') }, { value: 'universities', label: t('cityFinder.sortUniversities') }, { value: 'programs', label: t('cityFinder.sortPrograms') }]} />
      <div className="my-5 flex flex-wrap items-center justify-between gap-2 text-sm"><p role="status" className="text-gray-600">{t(matches.length === 1 ? 'cityFinder.cityResultOne' : 'cityFinder.cityResults', { count: matches.length })}</p>{q && <Link href={`/study-in-china${lang ? '?lang=zh' : ''}`} className={`text-[#9B1B30] underline ${cityFocus}`}>{t('cityFinder.clear')}</Link>}</div>
      {visible.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visible.map((city) => {
        const name = cityName(city, locale);
        const href = `/study-in-china/${city.slug}${lang ? '?lang=zh' : ''}`;
        const profile = cityProfiles[city.slug];
        const summary = profile?.summary[locale] ?? t('cityFinder.citySummary', { city: name, universities: city.universities.slice(0, 2).map((u) => locale === 'zh' && u.nameCn ? u.nameCn : u.name).join(locale === 'zh' ? '、' : ', ') });
        return <article key={city.slug} className="flex min-w-0 flex-col border border-gray-200 bg-white transition-colors duration-150 hover:border-[#9B1B30]">
          <CityPhoto slug={city.slug} name={name} href={href} compact />
          <div className="flex flex-1 flex-col gap-3 p-5"><div className="flex flex-wrap items-baseline gap-2"><h3 className="text-xl font-semibold"><Link href={href} prefetch={false} className={`hover:text-[#9B1B30] ${cityFocus}`}>{name}</Link></h3><span className="text-sm text-gray-500">{locale === 'zh' ? city.name : city.nameCn}</span></div><p className="min-h-10 text-sm leading-5 text-gray-600">{summary}</p><dl className="mt-auto grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-xs"><div><dd className="text-lg font-semibold tabular-nums">{city.universityCount}</dd><dt className="text-gray-500">{t(city.universityCount === 1 ? 'seo.cities.university' : 'seo.cities.universities')}</dt></div><div><dd className="text-lg font-semibold tabular-nums">{city.programCount ?? '—'}</dd><dt className="text-gray-500">{t('cityFinder.publishedPrograms')}</dt></div></dl><Link href={href} prefetch={false} className={`inline-flex items-center gap-2 text-sm font-semibold text-[#9B1B30] ${cityFocus}`}>{t('cityFinder.viewUniversities')}<ArrowRight className="size-4 text-[#1B2A4A]" aria-hidden="true" /></Link></div>
        </article>;
      })}</div> : <CityEmpty path={`/study-in-china${lang ? '?lang=zh' : ''}`} t={t} />}
      <CityPagination path="/study-in-china" q={q} sort={sort} page={page} totalPages={Math.ceil(matches.length / CITY_PAGE_SIZE)} lang={lang} t={t} />
      <p className="mt-5 text-xs leading-5 text-gray-500">{t('cityFinder.countsNote')}</p>
    </section>
    <CityConsultation t={t} />
  </div>;
}

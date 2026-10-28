import Image from 'next/image';
import Link from 'next/link';
import Form from 'next/form';
import { Building2, GraduationCap, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import type { getServerT, Locale } from '@/lib/server-t';
import type { CityCatalog } from '@/lib/city-catalog';
import { cityPageHref, type CityInfo } from '@/lib/city-index';
import credits from '@/lib/city-photo-credits.json';

export type CityT = Awaited<ReturnType<typeof getServerT>>;
interface PhotoCredit { path: string; title: string; author: string; source: string; license: string; licenseUrl: string }
const photos: Record<string, PhotoCredit> = credits;
export const cityContainer = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';
export const cityFocus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B2A4A]';
export function cityName(city: Pick<CityInfo, 'name' | 'nameCn'>, locale: Locale): string {
  return locale === 'zh' && city.nameCn ? city.nameCn : city.name;
}
export function CityPhoto({ slug, name, priority = false, href, compact = false }: { slug: string; name: string; priority?: boolean; href?: string; compact?: boolean }): React.JSX.Element {
  const photo = photos[slug];
  const visual = <div className={`relative overflow-hidden bg-[#F3F4F6] ${compact ? 'h-32' : 'h-40 sm:h-44'}`}>
    {photo ? <Image src={photo.path} alt={name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" priority={priority} className="object-cover" /> : <div className="flex h-full items-center justify-center gap-3 text-[#1B2A4A]"><MapPin className="size-7" aria-hidden="true" /><span className="text-2xl font-semibold">{name}</span></div>}
  </div>;
  return <figure className={compact ? 'min-h-[152px] min-w-0' : 'min-w-0'}>
    {href ? <Link href={href} className={`block ${cityFocus}`} prefetch={false}>{visual}</Link> : visual}
    {photo && <figcaption className="truncate px-2 py-1 text-[10px] text-gray-500"><a href={photo.source} target="_blank" rel="noreferrer" className={`underline hover:text-[#1B2A4A] ${cityFocus}`}>{photo.author}</a>{' · '}<a href={photo.licenseUrl} target="_blank" rel="noreferrer" className={`underline ${cityFocus}`}>{photo.license}</a></figcaption>}
  </figure>;
}

export function CityStats({ universityCount, programCount, englishCount, cityCount, t }: { universityCount: number; programCount: number | null; englishCount?: number | null; cityCount?: number; t: CityT }): React.JSX.Element {
  const stats = [
    { value: universityCount, label: t(universityCount === 1 ? 'seo.cities.university' : 'seo.cities.universities'), icon: Building2 },
    ...(cityCount !== undefined ? [{ value: cityCount, label: t('seo.cities.cities'), icon: MapPin }] : []),
    { value: programCount, label: t('cityFinder.publishedPrograms'), icon: GraduationCap },
    ...(englishCount !== undefined ? [{ value: englishCount, label: t('cityFinder.englishPrograms'), icon: GraduationCap }] : []),
  ];
  return <dl className="flex flex-wrap gap-x-7 gap-y-3 py-4 text-sm">{stats.map(({ value, label, icon: Icon }) => <div key={label} className="flex items-center gap-2"><Icon className="size-4 shrink-0 text-[#1B2A4A]" aria-hidden="true" /><dd className="font-semibold tabular-nums text-[#1B2A4A]">{value ?? '—'}</dd><dt className="text-gray-600">{label}</dt></div>)}</dl>;
}

export function CityDataNotice({ catalog, t }: { catalog: CityCatalog; t: CityT }): React.JSX.Element | null {
  if (catalog.source === 'live' && catalog.programsAvailable) return null;
  return <Alert className="my-4 rounded-none border-gray-200 bg-white text-[#1B2A4A]"><AlertDescription role="status">{t(catalog.source === 'fallback' ? 'cityFinder.fallback' : catalog.source === 'stale' ? 'cityFinder.stale' : 'cityFinder.countsUnavailable')}</AlertDescription></Alert>;
}

export function CitySearch({ path, q, sort, options, label, placeholder, t, lang }: { path: string; q: string; sort: string; options: { value: string; label: string }[]; label: string; placeholder: string; t: CityT; lang?: string }): React.JSX.Element {
  return <Form key={`${path}:${q}:${sort}:${lang ?? ''}`} action={path} className="border border-gray-200 bg-white p-4">
    {lang && <input type="hidden" name="lang" value={lang} />}
    <FieldGroup className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px_auto] sm:items-end">
      <Field className="min-w-0 gap-2"><FieldLabel htmlFor="city-search">{label}</FieldLabel><Input id="city-search" name="q" defaultValue={q} placeholder={placeholder} type="search" maxLength={200} /></Field>
      <Field className="min-w-0 gap-2"><FieldLabel htmlFor="city-sort">{t('cityFinder.sort')}</FieldLabel><select id="city-sort" name="sort" defaultValue={sort} className={`h-9 w-full rounded-none border border-gray-300 bg-white px-3 text-sm text-[#1B2A4A] ${cityFocus}`}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
      <Button type="submit" className="bg-[#9B1B30] text-white hover:bg-[#7A1526]">{t('cityFinder.search')}</Button>
    </FieldGroup>
  </Form>;
}

export function CityPagination({ path, q, sort, page, totalPages, lang, t }: { path: string; q: string; sort: string; page: number; totalPages: number; lang?: string; t: CityT }): React.JSX.Element | null {
  if (totalPages <= 1) return null;
  const visible = [...new Set([1, page - 1, page, page + 1, totalPages])].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  return <Pagination aria-label={t('cityFinder.pagination')} className="mt-7"><PaginationContent className="flex-wrap">
    {page > 1 && <PaginationItem><PaginationLink href={cityPageHref(path, q, sort, page - 1, lang)} size="default">{t('cityFinder.previous')}</PaginationLink></PaginationItem>}
    {visible.map((p, index) => <PaginationItem key={p} className="flex items-center">{index > 0 && p - visible[index - 1] > 1 && <span className="px-2" aria-hidden="true">…</span>}<PaginationLink href={cityPageHref(path, q, sort, p, lang)} isActive={p === page} aria-label={t('cityFinder.page', { page: p })}>{p}</PaginationLink></PaginationItem>)}
    {page < totalPages && <PaginationItem><PaginationLink href={cityPageHref(path, q, sort, page + 1, lang)} size="default">{t('cityFinder.next')}</PaginationLink></PaginationItem>}
  </PaginationContent></Pagination>;
}
export function CityEmpty({ path, t }: { path: string; t: CityT }): React.JSX.Element {
  return <Empty className="rounded-none border border-gray-200 bg-white"><EmptyHeader><EmptyTitle>{t('cityFinder.noResults')}</EmptyTitle><EmptyDescription>{t('cityFinder.noResultsHint')}</EmptyDescription></EmptyHeader><EmptyContent><Button asChild variant="outline"><Link href={path}>{t('cityFinder.clear')}</Link></Button></EmptyContent></Empty>;
}
export function CityConsultation({ city, t }: { city?: string; t: CityT }): React.JSX.Element {
  return <section className="border-t border-gray-200 bg-white"><div className={`${cityContainer} flex flex-col justify-between gap-5 py-9 sm:flex-row sm:items-center`}><div><h2 className="text-xl font-semibold text-[#1B2A4A]">{city ? t('cityFinder.helpCity', { city }) : t('cityFinder.helpChoose')}</h2><p className="mt-2 max-w-2xl text-sm text-gray-600">{t('cityFinder.helpDescription')}</p></div><Button asChild className="bg-[#9B1B30] text-white hover:bg-[#7A1526]"><Link href={`/counselling${city ? `?city=${encodeURIComponent(city)}` : ''}`}>{t('nav.admissions.counselling')}</Link></Button></div></section>;
}

'use client';

import Link from 'next/link';
import { ArrowRight, Award, MapPin } from 'lucide-react';
import type { ReactElement } from 'react';
import UniversityLogo from '@/components/university-logo';
import { useI18n } from '@/lib/i18n';
import { track } from '@/lib/analytics';
import { catalogHref, catalogQueryString, type CatalogQuery, type CatalogRow } from '@/lib/catalog-search';
import { catalogValueLabel } from './catalog-filters';

export function CatalogResultRow({ row, query, position }: { row: CatalogRow; query: CatalogQuery; position: number }): ReactElement {
  const { t, locale } = useI18n();
  const local = (en: string | undefined, zh?: string): string => locale === 'zh' && zh ? zh : en || '';
  const name = local(row.name, row.nameCn);
  const from = catalogQueryString(query);
  const href = `/${query.kind}/${encodeURIComponent(row.slug)}${from ? `?from=${encodeURIComponent(from)}` : ''}`;
  const click = (): void => track(query.kind === 'programs' ? 'program_click' : 'university_click', { slug: row.slug, position, locale });
  return <article className="group border border-gray-200 bg-white px-4 py-5 transition-colors hover:border-[#1B2A4A]/40 sm:px-6">
    <div className="flex min-w-0 gap-3 sm:gap-4">
      <div className="hidden shrink-0 sm:block"><UniversityLogo src={row.logo ?? ''} variant="sidebar" className="!rounded-none" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
          {query.kind === 'programs' && <span className="font-medium text-[#1B2A4A]">{row.degree ? catalogValueLabel('degree', row.degree, t) : t('catalog.notPublished')}</span>}
          {row.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[#1B2A4A]" aria-hidden="true" />{local(row.city, row.cityCn)}</span>}
          {query.kind === 'universities' && row.qsWorldRanking != null && row.qsWorldRanking > 0 && <span className="border border-[#D4A853]/50 bg-[#D4A853]/10 px-2 py-0.5 text-[#1B2A4A]">QS #{row.qsWorldRanking}</span>}
          {query.kind === 'universities' && row.ranking != null && row.ranking > 0 && <span>{t('catalog.chinaRank', { rank: row.ranking })}</span>}
        </div>
        <h2 className="mt-1.5 break-words text-lg font-semibold leading-snug tracking-tight text-[#1B2A4A] sm:text-xl"><Link href={href} prefetch={false} onClick={click} className="outline-none hover:text-[#9B1B30] hover:underline focus-visible:ring-2 focus-visible:ring-[#9B1B30]">{name}</Link></h2>
        {query.kind === 'programs' ? <>
          <Link href={`/universities/${encodeURIComponent(row.universitySlug ?? '')}`} className="mt-1 inline-block break-words text-sm text-gray-600 underline-offset-2 hover:text-[#9B1B30] hover:underline">{local(row.universityName, row.universityNameCn) || t('catalog.notPublished')}</Link>
          <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 text-sm sm:flex sm:flex-wrap sm:gap-x-7">
            {[
              [t('catalog.filter.language'), row.language ? catalogValueLabel('language', row.language, t) : t('catalog.notPublished')],
              [t('catalog.filter.duration'), local(row.duration, row.durationCn) || t('catalog.notPublished')],
              [t('prog.tuition'), row.tuition || t('catalog.notPublished')],
              [t('catalog.filter.intake'), local(row.intake, row.intakeCn) || t('catalog.notPublished')],
            ].map(([label, value]) => <div key={label} className="min-w-0 sm:flex sm:items-baseline sm:gap-1.5"><dt className="text-xs text-gray-500">{label}</dt><dd className="mt-0.5 break-words text-[#1B2A4A]">{value}</dd></div>)}
          </dl>
          {row.scholarshipAvailable === true && <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#1B2A4A]"><Award className="h-4 w-4" aria-hidden="true" />{t('filter.scholarship')}</p>}
        </> : <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          {query.q && <span className="text-gray-600">{t(row.matchingProgramCount === 1 ? 'catalog.matchingProgramOne' : 'catalog.matchingPrograms', { count: row.matchingProgramCount ?? 0 })}</span>}
          <Link href={catalogHref({ kind: 'programs', q: query.q, filters: { university: row.slug, ...(query.filters.city ? { city: query.filters.city } : {}) }, sort: query.q ? 'relevance' : 'default', page: 1, limit: 24 })} className="inline-flex items-center gap-1.5 font-semibold text-[#9B1B30] underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-[#9B1B30]">{t('catalog.viewPrograms')}<ArrowRight className="h-4 w-4 text-[#1B2A4A]" aria-hidden="true" /></Link>
        </div>}
        {query.q && row.matchReason && row.matchReason !== 'title' && <p className="mt-3 text-xs text-gray-500">{t(`catalog.match.${row.matchReason}`)}</p>}
      </div>
    </div>
  </article>;
}

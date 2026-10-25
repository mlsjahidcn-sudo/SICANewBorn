'use client';

import type { ReactElement } from 'react';

import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { catalogLabel, localizedDetail } from '@/lib/detail-content';
import type { UniversityProgramPage } from '@/lib/university-programs';
import { detailLink, detailPanel } from './detail-ui';
import { PROGRAM_DEGREES, PROGRAM_LANGUAGES } from '@/lib/program-types';

export function UniversityPrograms({ slug, result, fromQuery, totalPrograms }: { slug: string; result: UniversityProgramPage; fromQuery: string; totalPrograms: number }): ReactElement {
  const { t, locale } = useI18n();
  const base = new URLSearchParams({ section: 'programs' });
  if (fromQuery) base.set('from', fromQuery);
  if (result.search) base.set('programQ', result.search);
  if (result.degree) base.set('programDegree', result.degree);
  if (result.language) base.set('programLanguage', result.language);
  const pageHref = (page: number): string => {
    const params = new URLSearchParams(base);
    if (page > 1) params.set('programPage', String(page));
    return `/universities/${slug}?${params}#detail-section-nav`;
  };
  const returnTo = pageHref(result.page);
  const resetHref = `/universities/${slug}?${new URLSearchParams({ section: 'programs', ...(fromQuery ? { from: fromQuery } : {}) })}#detail-section-nav`;
  const finderHref = `/programs?university=${encodeURIComponent(slug)}`;
  const filtered = Boolean(result.search || result.degree || result.language);
  const missing = t('catalog.notPublished');
  const input = 'h-11 min-w-0 w-full rounded-none border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#9B1B30] focus:ring-2 focus:ring-[#9B1B30]/15';
  const degrees = result.degreeOptions.length ? result.degreeOptions : PROGRAM_DEGREES.map((value) => ({ value, count: null }));
  const languages = result.languageOptions.length ? result.languageOptions : PROGRAM_LANGUAGES.map((value) => ({ value, count: null }));
  return <section className={detailPanel}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-xl font-bold">{t('uni.availablePrograms')}</h2>{!result.error && <p role="status" className="mt-2 text-sm text-gray-500">{t('detail.programResults', { count: result.total })}</p>}</div>
      <Link href={finderHref} className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[#9B1B30] hover:underline">{t('detail.openFinder')}<ArrowRight className="h-3.5 w-3.5 text-[#1B2A4A]" /></Link>
    </div>
    <form action={`/universities/${slug}#detail-section-nav`} method="get" className="my-6 border-y border-gray-100 py-5">
      <input type="hidden" name="section" value="programs" />{fromQuery && <input type="hidden" name="from" value={fromQuery} />}
      <label className="block text-xs font-semibold text-gray-500">{t('detail.searchUniversityPrograms')}<span className="relative mt-2 block"><Search className="absolute left-3 top-3.5 h-4 w-4 text-[#1B2A4A]" aria-hidden /><input key={result.search} name="programQ" defaultValue={result.search} placeholder={t('detail.programSearchPlaceholder')} className={`${input} pl-9`} /></span></label>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <label className="min-w-0 text-xs font-semibold text-gray-500">{t('prog.degree')}<select key={result.degree} name="programDegree" defaultValue={result.degree} className={`${input} mt-2`}><option value="">{t('filter.all')}</option>{degrees.map((option) => <option key={option.value} value={option.value}>{catalogLabel(option.value, locale)}{option.count != null ? ` (${option.count})` : ''}</option>)}</select></label>
        <label className="min-w-0 text-xs font-semibold text-gray-500">{t('prog.language')}<select key={result.language} name="programLanguage" defaultValue={result.language} className={`${input} mt-2`}><option value="">{t('filter.all')}</option>{languages.map((option) => <option key={option.value} value={option.value}>{catalogLabel(option.value, locale)}{option.count != null ? ` (${option.count})` : ''}</option>)}</select></label>
        <button className={`${detailLink} col-span-2 self-end sm:col-span-1`} type="submit">{t('catalog.search')}</button>
      </div>
      {filtered && <div className="mt-3 flex flex-wrap items-center gap-2">{[result.search, result.degree, result.language].filter(Boolean).map((value) => <span key={value} className="break-words border border-gray-200 px-2 py-1 text-xs text-[#1B2A4A]">{catalogLabel(value, locale)}</span>)}<Link href={resetHref} className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-[#9B1B30] underline">{t('catalog.clearAll')}</Link></div>}
    </form>
    {result.error ? <div role="alert" className="border border-gray-200 p-5"><h3 className="font-semibold">{t('detail.loadError')}</h3><p className="mt-2 text-sm text-gray-600">{t('detail.loadErrorHelp')}</p><Link href={pageHref(result.page)} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#9B1B30] underline">{t('common.retry')}</Link></div> : result.rows.length ? <div className="space-y-3">{result.rows.map((program) => {
      const href = `/programs/${program.slug}?returnTo=${encodeURIComponent(returnTo)}`;
      return <article key={program.slug} className="min-w-0 border border-gray-200 bg-[#FAFAF8] p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500"><span className="bg-white px-2 py-1 text-[#1B2A4A]">{catalogLabel(program.degree || '', locale)}</span><span>{catalogLabel(program.language || '', locale) || missing}</span>{program.scholarshipAvailable === true && <span className="text-[#9B1B30]">{t('detail.fundingListed')}</span>}</div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h3 className="min-w-0 break-words text-base font-semibold leading-6"><Link href={href} className="hover:text-[#9B1B30] hover:underline">{localizedDetail(program.name, program.nameCn, locale)}</Link></h3>
          <Link href={href} className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-[#9B1B30] hover:underline">{t('prog.viewDetails')}<ArrowRight className="h-4 w-4 text-[#1B2A4A]" /></Link>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">{[
          { label: t('prog.duration'), value: localizedDetail(program.duration, program.durationCn, locale) || missing },
          { label: t('prog.tuitionLabel'), value: program.tuition || missing },
          { label: t('detail.recordedIntake'), value: localizedDetail(program.intake, program.intakeCn, locale) || missing },
        ].map((fact) => <div className="min-w-0" key={fact.label}><dt className="text-gray-500">{fact.label}</dt><dd className="mt-1 break-words font-medium leading-5 text-[#1B2A4A]">{fact.value}</dd></div>)}</dl>
      </article>;
    })}</div> : <div className="border border-dashed border-gray-300 px-4 py-8 text-center"><h3 className="font-semibold">{t(totalPrograms === 0 ? 'detail.noPublishedPrograms' : 'detail.noProgramsTitle')}</h3><p className="mt-2 text-sm leading-6 text-gray-500">{t(totalPrograms === 0 ? 'detail.noPublishedProgramsHelp' : 'detail.noProgramsHelp')}</p><Link href={filtered ? resetHref : finderHref} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#9B1B30] underline">{t(filtered ? 'catalog.clearAll' : 'detail.openFinder')}</Link></div>}
    {result.totalPages > 1 && <nav aria-label={t('catalog.pagination')} className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5">
      {result.page > 1 ? <Link href={pageHref(result.page - 1)} className="min-h-11 border border-gray-300 px-4 py-2.5 text-sm hover:border-[#9B1B30]">{t('catalog.previous')}</Link> : <span />}
      <span className="text-xs tabular-nums text-gray-500">{t('detail.pageOf', { page: result.page, pages: result.totalPages })}</span>
      {result.page < result.totalPages ? <Link href={pageHref(result.page + 1)} className="min-h-11 border border-gray-300 px-4 py-2.5 text-sm hover:border-[#9B1B30]">{t('catalog.next')}</Link> : <span />}
    </nav>}
  </section>;
}

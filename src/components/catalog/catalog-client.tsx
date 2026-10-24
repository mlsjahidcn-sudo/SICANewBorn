'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Search, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { track } from '@/lib/analytics';
import { pageNumbers } from '@/lib/pagination';
import { catalogHref, catalogQueryString, parseCatalogQuery, type CatalogQuery, type CatalogSearchResult, type CatalogFilterKey } from '@/lib/catalog-search';
import { CatalogSearchBox } from './catalog-search-box';
import { CatalogFiltersPanel, catalogValueLabel } from './catalog-filters';
import { CatalogResultRow } from './catalog-results';

interface Props {
  initialQuery: CatalogQuery;
  initialResult: CatalogSearchResult | null;
}

export function CatalogClient({ initialQuery, initialResult }: Props): ReactElement {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.toString();
  const query = useMemo(() => parseCatalogQuery(initialQuery.kind, new URLSearchParams(rawQuery)), [initialQuery.kind, rawQuery]);
  const key = catalogQueryString(query);
  const initialKey = catalogQueryString(initialQuery);
  const [result, setResult] = useState(initialResult);
  const [displayQuery, setDisplayQuery] = useState(initialQuery);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(initialResult === null);
  const [retry, setRetry] = useState(0);
  const serial = useRef(0);
  const kind = initialQuery.kind;
  useEffect(() => {
    if (result) track('catalog_results_view', { kind, result_count: result.total, query_length: displayQuery.q.length, locale });
  }, [result, displayQuery, kind, locale]);

  useEffect(() => {
    const controller = new AbortController();
    const version = ++serial.current;
    if (key === initialKey && retry === 0) {
      setResult(initialResult); setDisplayQuery(initialQuery); setError(initialResult === null); setPending(false);
      return () => controller.abort();
    }
    setPending(true);
    setError(false);
    const started = performance.now();
    void (async (): Promise<void> => {
      try {
        const sp = new URLSearchParams(key);
        sp.set('locale', locale);
        sp.set('limit', String(query.limit));
        const response = await fetch(`/api/${kind}?${sp}`, { signal: controller.signal });
        if (!response.ok) throw new Error('search unavailable');
        const next = await response.json() as CatalogSearchResult;
        if (!Array.isArray(next.rows)) throw new Error('catalog search is not enabled');
        if (controller.signal.aborted || serial.current !== version) return;
        setResult(next); setDisplayQuery(query);
        track('catalog_search_complete', { kind, result_count: next.total, query_length: query.q.length, duration_ms: Math.round(performance.now() - started), locale });
      } catch {
        if (!controller.signal.aborted && serial.current === version) {
          setError(true); track('catalog_search_error', { kind, locale });
        }
      } finally {
        if (!controller.signal.aborted && serial.current === version) setPending(false);
      }
    })();
    return () => controller.abort();
    // The canonical URL key, rather than transient draft state, controls requests.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initialKey, initialResult, retry, kind, locale]);

  const commit = useCallback((next: CatalogQuery): void => {
    const href = catalogHref(next);
    if (href === catalogHref(query)) return;
    window.history.pushState(null, '', href);
  }, [query]);
  const search = (q: string): void => {
    track('search_performed', { surface: kind, term: q, locale });
    commit({ ...query, q, page: 1, sort: searchParams.has('sort') ? query.sort : q ? 'relevance' : kind === 'programs' ? 'default' : 'ranking' });
  };
  const clear = (): void => commit({ ...query, q: '', filters: {}, page: 1, sort: kind === 'programs' ? 'default' : 'ranking' });
  const facets = result?.facets ?? {};
  const active = Object.entries(query.filters) as [CatalogFilterKey, string][];
  const isProgram = kind === 'programs';
  const sorts = isProgram ? ['default', ...(query.q ? ['relevance'] : []), 'tuition', 'name', 'intake'] : ['ranking', ...(query.q ? ['relevance'] : []), 'qsWorld', 'rating', 'name'];

  return <div className="min-h-screen bg-[#FAFAF8] text-[#1B2A4A]">
    <section className="relative isolate overflow-hidden bg-[#1B2A4A]">
      <div className="absolute inset-0 -z-10 bg-cover bg-center opacity-25" style={{ backgroundImage: 'url(/hero-bg.avif)' }} />
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 sm:px-6 lg:px-8">
        <div><h1 className="text-2xl font-bold text-white sm:text-3xl">{t(isProgram ? 'catalog.programTitle' : 'catalog.universityTitle')}</h1><p className="mt-1 text-sm text-white/80">{t('catalog.subtitle')}</p></div>
        {!isProgram && <Link href="/universities/compare" className="border border-white/40 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">{t('uni.compareCta')}</Link>}
      </div>
    </section>
    <section className="sticky top-16 z-30 border-b border-gray-200 bg-white shadow-sm" aria-label={t('catalog.searchLabel')}>
      <div className="mx-auto max-w-7xl px-4 pb-0 pt-4 sm:px-6 lg:px-8"><CatalogSearchBox query={query} onSearch={search} /></div>
    </section>
    <CatalogFiltersPanel kind={kind} filters={query.filters} facets={facets} onChange={(filters) => {
      const keys = new Set([...Object.keys(filters), ...Object.keys(query.filters)] as CatalogFilterKey[]);
      for (const filter of keys) if (filters[filter] !== query.filters[filter]) track('filter_change', { surface: kind, filter, value: filters[filter] ?? null, locale });
      commit({ ...query, filters, page: 1 });
    }} />
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      {(query.q || active.length > 0) && <div aria-label={t('filter.activeFilters')} className="mb-5 flex flex-wrap items-center gap-2 border-l-2 border-[#9B1B30] bg-white px-3 py-3">
        {query.q && <button type="button" onClick={() => search('')} aria-label={t('catalog.removeQuery', { value: query.q })} className="flex max-w-full items-center gap-2 border border-gray-300 px-2.5 py-1.5 text-xs font-medium focus-visible:ring-2 focus-visible:ring-[#9B1B30]"><span className="break-all">{query.q}</span><X className="h-3.5 w-3.5 shrink-0" /></button>}
        {active.map(([filter, value]) => {
          const facet = facets[filter]?.find((option) => option.value === value);
          const translated = catalogValueLabel(filter, value, t);
          const label = translated !== value ? translated : locale === 'zh' ? facet?.labelCn || facet?.label || value : facet?.label || value;
          return <button key={filter} type="button" onClick={() => { const filters = { ...query.filters }; delete filters[filter]; commit({ ...query, filters, page: 1 }); }} aria-label={t('catalog.removeFilter', { name: t(`catalog.filter.${filter}`), value: label })} className="flex max-w-full items-center gap-2 border border-gray-300 px-2.5 py-1.5 text-xs focus-visible:ring-2 focus-visible:ring-[#9B1B30]"><span className="break-words"><span className="text-gray-500">{t(`catalog.filter.${filter}`)}: </span>{label}</span><X className="h-3.5 w-3.5 shrink-0" /></button>;
        })}
        <button type="button" onClick={clear} className="px-2 py-1 text-xs font-semibold text-[#9B1B30] underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-[#9B1B30]">{t('filter.clearAll')}</button>
      </div>}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-sm text-gray-600">{pending ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-[#1B2A4A]" />{t('catalog.updating')}</span> : result ? t(isProgram ? result.total === 1 ? 'catalog.programCountOne' : 'catalog.programCount' : result.total === 1 ? 'catalog.universityCountOne' : 'catalog.universityCount', { count: result.total }) : ''}</p>
        <label className="flex items-center gap-2 text-xs text-gray-600"><span>{t('catalog.sort')}</span><select value={query.sort} onChange={(event) => commit({ ...query, sort: event.target.value, page: 1 })} className="h-10 max-w-[180px] rounded-none border border-gray-300 bg-white px-2.5 text-sm text-[#1B2A4A] outline-none focus:ring-2 focus:ring-[#9B1B30]/30">
          {[...new Set([...sorts, query.sort])].map((sort) => <option key={sort} value={sort}>{t(`catalog.sort.${sort}`)}</option>)}
        </select></label>
      </div>
      {error && <div role="alert" className="mb-4 border border-[#9B1B30]/30 bg-white p-4 text-sm"><p>{t(result ? 'catalog.errorPrevious' : 'catalog.error')}</p><button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-2 font-semibold text-[#9B1B30] underline focus-visible:ring-2 focus-visible:ring-[#9B1B30]">{t('catalog.retry')}</button></div>}
      <section aria-label={t('catalog.results')} aria-busy={pending} className={pending ? 'opacity-60' : ''}>
        {result?.rows.length ? <div className="space-y-3">{result.rows.map((row, position) => <CatalogResultRow key={row.slug} row={row} query={displayQuery} position={(displayQuery.page - 1) * displayQuery.limit + position} />)}</div> : !pending && !error && <div className="border border-gray-200 bg-white px-5 py-12 text-center">
          <Search className="mx-auto h-8 w-8 text-[#1B2A4A]" aria-hidden="true" /><h2 className="mt-4 text-xl font-semibold">{t(result && result.total > 0 ? 'catalog.pageMissing' : 'catalog.noResults')}</h2><p className="mx-auto mt-2 max-w-lg text-sm text-gray-600">{t(result && result.total > 0 ? 'catalog.pageMissingHint' : 'catalog.emptyHint')}</p>
          {!!result?.suggestions.length && <div className="mt-4"><p className="text-sm font-medium">{t('catalog.didYouMean')}</p><div className="mt-2 flex flex-wrap justify-center gap-2">{result.suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => search(suggestion)} className="border border-gray-300 px-3 py-2 text-sm text-[#9B1B30] hover:border-[#9B1B30] focus-visible:ring-2 focus-visible:ring-[#9B1B30]">{suggestion}</button>)}</div></div>}
          <button type="button" onClick={result && result.total > 0 ? () => commit({ ...query, page: 1 }) : clear} className="mt-5 border border-[#1B2A4A] px-4 py-2 text-sm font-semibold hover:bg-[#FAFAF8] focus-visible:ring-2 focus-visible:ring-[#9B1B30]">{t(result && result.total > 0 ? 'catalog.firstPage' : 'filter.resetFilters')}</button>
        </div>}
      </section>
      {result && result.totalPages > 1 && displayQuery.page <= result.totalPages && <nav aria-label={t('catalog.pagination')} className="mt-7 flex flex-wrap justify-center gap-1.5">
        {pageNumbers(displayQuery.page, result.totalPages).map((page, index) => page === '…' ? <span key={`gap-${index}`} className="px-2 py-2">…</span> : <a key={page} href={catalogHref({ ...query, page })} onClick={(event) => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); commit({ ...query, page }); }} aria-current={page === displayQuery.page ? 'page' : undefined} aria-label={t('catalog.page', { page })} className={`min-w-10 border px-3 py-2 text-center text-sm focus-visible:ring-2 focus-visible:ring-[#9B1B30] ${page === displayQuery.page ? 'border-[#9B1B30] bg-[#9B1B30] text-white' : 'border-gray-300 bg-white hover:border-[#9B1B30]'} ${pending ? 'pointer-events-none' : ''}`}>{page}</a>)}
      </nav>}
    </div>
  </div>;
}

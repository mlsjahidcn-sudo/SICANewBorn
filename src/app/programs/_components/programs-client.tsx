'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import {
  degreeTypes,
  languages,
  programDisciplines,
  degreeTypesCn,
  languagesCn,
  programDisciplinesCn,
  type Program,
} from '@/lib/data';
import {
  Search,
  Filter,
  Globe,
  Clock,
  Banknote,
  ArrowRight,
  Award,
  X,
  Building2,
  Loader2,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useUrlState } from '@/hooks/use-url-state';
import { track } from '@/lib/analytics';
import { GetStartedCta } from '@/components/GetStartedCta';
import type { ProgramQueryResult } from '@/lib/program-query';

/**
 * Lightweight university shape for the filter dropdown + card labels.
 *
 * Phase 173: the page previously received full `University` objects
 * (30+ fields, including `description`, `gallery[]`, `highlights{}` and
 * `scholarshipInfo`) purely to render a `<option>` label and a card
 * line. Shipping all of that for every visitor was a large part of the
 * page weight; this carries only what is actually displayed.
 */
export interface UniversityOption {
  slug: string;
  name: string;
  nameCn: string;
}

type SortKey = 'default' | 'tuition' | 'name';

interface ProgramsClientProps {
  initialResult: ProgramQueryResult;
  universityOptions: UniversityOption[];
  pageSize: number;
}

export default function ProgramsClient({
  initialResult,
  universityOptions,
  pageSize,
}: ProgramsClientProps) {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();

  // ── URL-synced filter state ────────────────────────────────────────────
  // Every filter is bound to a query param so links are shareable and a
  // reload restores the exact view. useUrlState writes with
  // history.replaceState (deliberately — pushing an entry per keystroke
  // would flood the back button), so back/forward returns to the
  // previous PAGE, not the previous filter state. Reload restores.
  const [searchQuery, setSearchQuery] = useUrlState('q', '' as string, {
    searchParams,
  });
  const [degreeFilter, setDegreeFilter] = useUrlState('degree', '' as string, { searchParams });
  const [languageFilter, setLanguageFilter] = useUrlState('lang', '' as string, { searchParams });
  const [disciplineFilter, setDisciplineFilter] = useUrlState('disc', '' as string, { searchParams });
  const [universityFilter, setUniversityFilter] = useUrlState('uni', '' as string, { searchParams });
  const [scholarshipOnly, setScholarshipOnly] = useUrlState('scholarship', '' as string, {
    searchParams,
    coerce: (raw) => (raw === '1' ? '1' : ''),
  });
  const [sortBy, setSortBy] = useUrlState<SortKey>('sort', 'default' as SortKey, { searchParams });
  const [pageParam, setPageParam] = useUrlState('page', '' as string, { searchParams });

  const currentPage = Math.max(1, parseInt(pageParam || '1', 10) || 1);

  // ── Server data ────────────────────────────────────────────────────────
  // Phase 173: filtering + pagination now happen server-side (this page
  // used to pull the ENTIRE catalogue and filter in a useMemo, which
  // also meant the API and the UI could silently disagree).
  const [result, setResult] = useState<ProgramQueryResult>(initialResult);
  const [isPending, setIsPending] = useState(false);

  // Skip the mount fetch — the RSC already rendered this exact query.
  const skipFirstFetch = useRef(true);

  const buildQuery = useCallback(() => {
    const sp = new URLSearchParams();
    if (searchQuery) sp.set('search', searchQuery);
    if (degreeFilter) sp.set('degree', degreeFilter);
    if (languageFilter) sp.set('language', languageFilter);
    if (disciplineFilter) sp.set('discipline', disciplineFilter);
    if (universityFilter) sp.set('university', universityFilter);
    if (scholarshipOnly === '1') sp.set('scholarship', '1');
    if (sortBy && sortBy !== 'default') sp.set('sort', sortBy);
    if (currentPage > 1) sp.set('page', String(currentPage));
    return sp.toString();
  }, [searchQuery, degreeFilter, languageFilter, disciplineFilter, universityFilter, scholarshipOnly, sortBy, currentPage]);

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }

    const qs = buildQuery();
    const controller = new AbortController();
    // Debounce so a burst of keystrokes is one request, not one per key.
    const timer = setTimeout(async () => {
      setIsPending(true);
      try {
        const res = await fetch(`/api/programs?${qs}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`programs fetch failed: ${res.status}`);
        const json = (await res.json()) as ProgramQueryResult;
        // Ignore a response that lost the race to a newer request.
        setResult(json);
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        // Leave the previous results on screen rather than blanking the
        // grid — a transient network blip shouldn't destroy the view.
        console.error('[programs] fetch failed:', err);
      } finally {
        setIsPending(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [buildQuery]);

  // Any filter change invalidates the current page — page 7 of the old
  // result set is meaningless against the new one.
  const resetPage = useCallback(() => setPageParam(''), [setPageParam]);

  const { programs, total, totalPages, matchedUniversitySlugs } = result;

  const uniBySlug = useMemo(() => {
    const m = new Map<string, UniversityOption>();
    for (const u of universityOptions) m.set(u.slug, u);
    return m;
  }, [universityOptions]);

  const localDegrees = locale === 'zh' ? degreeTypesCn : degreeTypes;
  const localLanguages = locale === 'zh' ? languagesCn : languages;
  const localDisciplines = locale === 'zh' ? programDisciplinesCn : programDisciplines;

  const degreeColor = (degree: string) => {
    switch (degree) {
      case 'Bachelor':
        return 'bg-blue-50 text-blue-800';
      case 'Master':
        return 'bg-purple-50 text-purple-800';
      case 'PhD':
        return 'bg-amber-50 text-amber-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  // ── Active filter pills ────────────────────────────────────────────────
  const activeFilters: { key: string; label: string; clear: () => void }[] = [];
  if (searchQuery) {
    activeFilters.push({
      key: 'q',
      label: `${locale === 'zh' ? '搜索' : 'Search'}: "${searchQuery}"`,
      clear: () => setSearchQuery(''),
    });
  }
  if (degreeFilter) {
    const idx = degreeTypes.indexOf(degreeFilter as (typeof degreeTypes)[number]);
    const label = idx >= 0 ? (locale === 'zh' ? degreeTypesCn[idx] : degreeFilter) : degreeFilter;
    activeFilters.push({ key: 'degree', label: `${t('prog.degree')}: ${label}`, clear: () => setDegreeFilter('') });
  }
  if (languageFilter) {
    const idx = languages.indexOf(languageFilter as (typeof languages)[number]);
    const label = idx >= 0 ? (locale === 'zh' ? languagesCn[idx] : languageFilter) : languageFilter;
    activeFilters.push({ key: 'lang', label: `${t('prog.language')}: ${label}`, clear: () => setLanguageFilter('') });
  }
  if (disciplineFilter) {
    const idx = programDisciplines.indexOf(disciplineFilter as (typeof programDisciplines)[number]);
    const label = idx >= 0 ? (locale === 'zh' ? programDisciplinesCn[idx] : disciplineFilter) : disciplineFilter;
    activeFilters.push({
      key: 'disc',
      label: `${t('prog.allDisciplines').replace('All ', '').replace('所有', '')}: ${label}`,
      clear: () => setDisciplineFilter(''),
    });
  }
  if (universityFilter) {
    const uni = uniBySlug.get(universityFilter);
    const label = uni ? (locale === 'zh' ? uni.nameCn : uni.name) : universityFilter;
    activeFilters.push({ key: 'uni', label: `${t('prog.university')}: ${label}`, clear: () => setUniversityFilter('') });
  }
  if (scholarshipOnly === '1') {
    activeFilters.push({ key: 'scholarship', label: t('filter.scholarship'), clear: () => setScholarshipOnly('') });
  }

  const clearAll = useCallback(() => {
    setSearchQuery('');
    setDegreeFilter('');
    setLanguageFilter('');
    setDisciplineFilter('');
    setUniversityFilter('');
    setScholarshipOnly('');
    setPageParam('');
  }, [setSearchQuery, setDegreeFilter, setLanguageFilter, setDisciplineFilter, setUniversityFilter, setScholarshipOnly, setPageParam]);

  const hasAnyFilter = activeFilters.length > 0;

  // Universities the term hit — drives the "N programs at X" hint so the
  // user can tell WHY a row appeared instead of guessing.
  const matchedUniLabels = useMemo(
    () =>
      matchedUniversitySlugs
        .map((s) => uniBySlug.get(s))
        .filter((u): u is UniversityOption => Boolean(u))
        .map((u) => (locale === 'zh' ? u.nameCn : u.name)),
    [matchedUniversitySlugs, uniBySlug, locale],
  );

  const goToPage = useCallback(
    (p: number) => {
      setPageParam(p > 1 ? String(p) : '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setPageParam],
  );

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/hero-bg.avif)' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A] via-[#1B2A4A]/80 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{t('prog.title')}</h1>
          <p className="mt-3 text-lg text-gray-300 max-w-xl">{t('prog.subtitle')}</p>
          <div className="mt-5">
            <GetStartedCta
              variant="banner"
              location="programs_list_hero"
              className="!border-white/40 !text-white hover:!bg-white hover:!text-[#9B1B30]"
            />
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-200 py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  resetPage();
                }}
                placeholder={t('prog.searchProgramsOrUniversities')}
                aria-label={t('prog.searchProgramsOrUniversities')}
                className="w-full rounded-none border border-gray-200 bg-[#FAFAF8] py-2.5 pl-10 pr-4 text-sm focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
              />
              {isPending && (
                <Loader2
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#9B1B30]"
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={degreeFilter}
                onChange={(e) => {
                  setDegreeFilter(e.target.value);
                  resetPage();
                }}
                className="rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
              >
                <option value="">{t('prog.allDegrees')}</option>
                {degreeTypes.map((d, i) => (
                  <option key={d} value={d}>
                    {localDegrees[i]}
                  </option>
                ))}
              </select>
              <select
                value={languageFilter}
                onChange={(e) => {
                  setLanguageFilter(e.target.value);
                  resetPage();
                }}
                className="rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
              >
                <option value="">{t('prog.allLanguages')}</option>
                {languages.map((l, i) => (
                  <option key={l} value={l}>
                    {localLanguages[i]}
                  </option>
                ))}
              </select>
              <select
                value={disciplineFilter}
                onChange={(e) => {
                  setDisciplineFilter(e.target.value);
                  resetPage();
                }}
                className="rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
              >
                <option value="">{t('prog.allDisciplines')}</option>
                {programDisciplines.map((d, i) => (
                  <option key={d} value={d}>
                    {localDisciplines[i]}
                  </option>
                ))}
              </select>
              <select
                value={universityFilter}
                onChange={(e) => {
                  setUniversityFilter(e.target.value);
                  resetPage();
                }}
                className="rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none max-w-[180px]"
                title={t('filter.allUniversities')}
              >
                <option value="">{t('filter.allUniversities')}</option>
                {universityOptions.map((u) => (
                  <option key={u.slug} value={u.slug}>
                    {locale === 'zh' ? u.nameCn : u.name}
                  </option>
                ))}
              </select>
              <label
                className="inline-flex items-center gap-2 px-3 py-2.5 border border-gray-200 bg-white text-sm cursor-pointer hover:border-[#9B1B30] transition-colors rounded-none"
                title={t('filter.scholarshipOnly')}
              >
                <input
                  type="checkbox"
                  checked={scholarshipOnly === '1'}
                  onChange={(e) => {
                    setScholarshipOnly(e.target.checked ? '1' : '');
                    resetPage();
                  }}
                  className="h-4 w-4 accent-[#9B1B30]"
                />
                <Award className="h-4 w-4 text-[#9B1B30]" />
                <span className="text-[#1B2A4A] font-medium">{t('prog.scholarshipOnly')}</span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortKey);
                  resetPage();
                }}
                className="rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
              >
                <option value="default">{t('prog.sortBy')}: {t('prog.default')}</option>
                <option value="tuition">{t('prog.sortBy')}: {t('prog.tuition')}</option>
                <option value="name">{t('prog.sortBy')}: {t('prog.name')}</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <span>
              {total} {t('prog.results')}
            </span>
            {/* Phase 173: tell the user a university matched, so a widened
                result set doesn't look like a broken filter. */}
            {matchedUniLabels.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[#9B1B30]">
                <Building2 className="h-3.5 w-3.5" />
                {t('prog.matchedUniversities', { names: matchedUniLabels.join(', ') })}
              </span>
            )}
          </div>

          {hasAnyFilter && (
            <div className="mt-3 flex items-center gap-2 flex-wrap" role="region" aria-label={t('filter.activeFilters')}>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t('filter.activeFilters')}:
              </span>
              {activeFilters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    f.clear();
                    resetPage();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[#9B1B30]/10 text-[#9B1B30] border border-[#9B1B30]/30 rounded-none hover:bg-[#9B1B30]/20 transition-colors"
                  title={t('filter.clear')}
                >
                  {f.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-semibold text-[#1B2A4A] hover:text-[#9B1B30] underline underline-offset-2"
              >
                {t('filter.clearAll')}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {programs.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-gray-200 bg-white">
            <Filter className="mx-auto h-10 w-10 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-[#1B2A4A]">{t('prog.noResults')}</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{t('filter.suggestion')}</p>
            {hasAnyFilter && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-none bg-[#1B2A4A] hover:bg-[#26345A] text-white font-semibold h-10 px-6 text-sm"
                >
                  {t('filter.resetFilters')}
                </button>
                <Link
                  href="/programs"
                  onClick={(e) => {
                    e.preventDefault();
                    clearAll();
                  }}
                  className="text-sm text-gray-600 hover:text-[#9B1B30] underline underline-offset-2"
                >
                  {t('prog.orClickHere')}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 150ms ease' }}
          >
            {programs.map((program: Program, idx) => {
              const uni = uniBySlug.get(program.universitySlug);
              // Did this row match because of the university, or the
              // program name? Only meaningful while a term is active.
              const matchedViaUniversity =
                searchQuery !== '' &&
                matchedUniversitySlugs.length > 0 &&
                matchedUniversitySlugs.includes(program.universitySlug) &&
                !program.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !(program.nameCn ?? '').toLowerCase().includes(searchQuery.toLowerCase());

              return (
                <Link
                  key={program.slug}
                  href={`/programs/${program.slug}`}
                  onClick={() =>
                    track('program_click', { slug: program.slug, position: idx, locale })
                  }
                  className="group flex flex-col border border-gray-200 bg-white transition-all duration-150 hover:border-[#9B1B30]/40 hover:shadow-lg"
                >
                  <div className="h-1 bg-[#9B1B30]" />

                  <div className="flex flex-1 flex-col p-4">
                    {/* University first: it is now a primary search axis
                        (Phase 173) and was previously buried under the
                        program name where nobody scanned for it. */}
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#1B2A4A]/70">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-[#1B2A4A]" />
                      <span className="truncate">{uni ? (locale === 'zh' ? uni.nameCn : uni.name) : program.universitySlug}</span>
                    </p>

                    <h3 className="mt-1.5 text-base font-bold leading-snug text-[#1B2A4A] transition-colors group-hover:text-[#9B1B30]">
                      {locale === 'zh' ? program.nameCn : program.name}
                    </h3>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold ${degreeColor(program.degree)}`}>
                        {locale === 'zh'
                          ? degreeTypesCn[degreeTypes.indexOf(program.degree)]
                          : program.degree}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-gray-600 bg-gray-50">
                        <Globe className="h-3 w-3 text-[#1B2A4A]" />
                        {locale === 'zh'
                          ? languagesCn[languages.indexOf(program.language)]
                          : program.language}
                      </span>
                      {program.scholarshipAvailable && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-[#9B1B30] bg-[#9B1B30]/10">
                          <Award className="h-3 w-3" />
                          {t('prog.scholarship')}
                        </span>
                      )}
                    </div>

                    {matchedViaUniversity && (
                      <p className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-[#9B1B30]">
                        <Search className="h-3 w-3 shrink-0" />
                        {t('prog.matchedViaUniversity')}
                      </p>
                    )}

                    {/* Dense single meta line replaces the previous
                        three-icon block — same facts, ~40% less height. */}
                    <dl className="mt-auto grid grid-cols-3 gap-1 border-t border-gray-100 pt-2.5 text-[11px] text-gray-600">
                      <div>
                        <dt className="flex items-center gap-1 text-gray-400">
                          <Clock className="h-3 w-3 shrink-0 text-[#1B2A4A]" />
                          {t('prog.duration')}
                        </dt>
                        <dd className="mt-0.5 truncate font-medium">
                          {locale === 'zh' ? program.durationCn : program.duration}
                        </dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1 text-gray-400">
                          <Banknote className="h-3 w-3 shrink-0 text-[#1B2A4A]" />
                          {t('prog.tuition')}
                        </dt>
                        <dd className="mt-0.5 truncate font-medium">{program.tuition || '—'}</dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1 text-gray-400">
                          <Globe className="h-3 w-3 shrink-0 text-[#1B2A4A]" />
                          {t('prog.intake')}
                        </dt>
                        <dd className="mt-0.5 truncate font-medium">
                          {locale === 'zh' ? program.intakeCn : program.intake}
                        </dd>
                      </div>
                    </dl>

                    <span className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-sm font-semibold text-[#9B1B30] transition-all group-hover:gap-1">
                      {t('prog.viewDetails')}
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-1" aria-label={t('prog.pagination')}>
            <button
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isPending}
              className="rounded-none border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 hover:border-[#9B1B30] hover:text-[#9B1B30] transition-colors"
            >
              &larr;
            </button>
            {pageNumbers(currentPage, totalPages).map((p, i) =>
              p === '…' ? (
                <span key={`gap-${i}`} className="px-2 text-sm text-gray-400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p as number)}
                  disabled={isPending}
                  aria-current={p === currentPage ? 'page' : undefined}
                  className={`rounded-none border px-3 py-2 text-sm transition-colors ${
                    p === currentPage
                      ? 'border-[#9B1B30] bg-[#9B1B30] text-white'
                      : 'border-gray-200 hover:border-[#9B1B30] hover:text-[#9B1B30]'
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || isPending}
              className="rounded-none border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 hover:border-[#9B1B30] hover:text-[#9B1B30] transition-colors"
            >
              &rarr;
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}

/**
 * Windowed page list with ellipses. The catalogue is large enough that
 * rendering one button per page is wasteful once `totalPages` climbs.
 */
function pageNumbers(current: number, total: number, window = 2): (number | '…')[] {
  const out: (number | '…')[] = [];
  const from = Math.max(1, current - window);
  const to = Math.min(total, current + window);
  if (from > 1) {
    out.push(1);
    if (from > 2) out.push('…');
  }
  for (let p = from; p <= to; p++) out.push(p);
  if (to < total) {
    if (to < total - 1) out.push('…');
    out.push(total);
  }
  return out;
}

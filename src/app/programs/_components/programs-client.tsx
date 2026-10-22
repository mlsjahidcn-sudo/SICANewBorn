'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import {
  degreeTypes,
  languages,
  degreeTypesCn,
  languagesCn,
  type Program,
} from '@/lib/data';
import {
  Search,
  Filter,
  Globe,
  Clock,
  Banknote,
  CalendarDays,
  Award,
  X,
  Building2,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useUrlState } from '@/hooks/use-url-state';
import { track } from '@/lib/analytics';
import { GetStartedCta } from '@/components/GetStartedCta';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { ProgramQueryResult } from '@/lib/program-query';
import {
  PROGRAM_FACET_NONE,
  type ProgramFacet,
  type ProgramFacets,
} from '@/lib/program-facets';
import { DURATION_BANDS, TUITION_BANDS, findBand } from '@/lib/program-facet-bands';

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

type SortKey = 'default' | 'relevance' | 'tuition' | 'name';

interface ProgramsClientProps {
  initialResult: ProgramQueryResult;
  universityOptions: UniversityOption[];
  pageSize: number;
  /** PF-1: the filter vocabulary + counts, read from the live table. */
  facets: ProgramFacets;
}

export default function ProgramsClient({
  initialResult,
  universityOptions,
  pageSize,
  facets,
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
    // PF-8: the URL write is debounced to match the fetch debounce, so
    // the address bar and the request land together instead of the URL
    // churning on every keystroke.
    debounceMs: 250,
  });
  const [degreeFilter, setDegreeFilter] = useUrlState('degree', '' as string, { searchParams });
  const [languageFilter, setLanguageFilter] = useUrlState('lang', '' as string, { searchParams });
  const [disciplineFilter, setDisciplineFilter] = useUrlState('disc', '' as string, { searchParams });
  const [universityFilter, setUniversityFilter] = useUrlState('uni', '' as string, { searchParams });
  // PF-4b: the city filter — the site's biggest missing intent.
  const [cityFilter, setCityFilter] = useUrlState('city', '' as string, { searchParams });
  const [scholarshipOnly, setScholarshipOnly] = useUrlState('scholarship', '' as string, {
    searchParams,
    coerce: (raw) => (raw === '1' ? '1' : ''),
  });
  const [sortBy, setSortBy] = useUrlState<SortKey>('sort', 'default' as SortKey, { searchParams });
  const [pageParam, setPageParam] = useUrlState('page', '' as string, { searchParams });
  // PF-2: the normalized facets. Only rendered when the catalogue has
  // the derived columns (the migration has been applied).
  const [intakeFilter, setIntakeFilter] = useUrlState('intake', '' as string, { searchParams });
  const [intakeYearFilter, setIntakeYearFilter] = useUrlState('year', '' as string, { searchParams });
  const [tuitionFilter, setTuitionFilter] = useUrlState('tuition', '' as string, { searchParams });
  const [durationFilter, setDurationFilter] = useUrlState('duration', '' as string, { searchParams });

  const currentPage = Math.max(1, parseInt(pageParam || '1', 10) || 1);

  // ── Server data ────────────────────────────────────────────────────────
  // Phase 173: filtering + pagination now happen server-side (this page
  // used to pull the ENTIRE catalogue and filter in a useMemo, which
  // also meant the API and the UI could silently disagree).
  const [result, setResult] = useState<ProgramQueryResult>(initialResult);
  const [isPending, setIsPending] = useState(false);

  // PF-5: "Load more" accumulates pages. `rows` holds everything loaded
  // so far; a filter change replaces it with page 1, "Load more" appends
  // the next page. The RSC renders the first page, so there is no
  // mount fetch.
  const [rows, setRows] = useState<Program[]>(initialResult.programs);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const skipFirstFetch = useRef(true);

  const buildQuery = useCallback(
    (page: number) => {
      const sp = new URLSearchParams();
      if (searchQuery) sp.set('search', searchQuery);
      if (degreeFilter) sp.set('degree', degreeFilter);
      if (languageFilter) sp.set('language', languageFilter);
      if (disciplineFilter) sp.set('discipline', disciplineFilter);
      if (universityFilter) sp.set('university', universityFilter);
      if (cityFilter) sp.set('city', cityFilter);
      if (scholarshipOnly === '1') sp.set('scholarship', '1');
      if (intakeFilter) sp.set('intake', intakeFilter);
      if (intakeYearFilter) sp.set('year', intakeYearFilter);
      // PF-2: the bands travel as numeric bounds, not as a band key, so
      // the server never has to know the band table.
      const tuition = findBand(TUITION_BANDS, tuitionFilter);
      if (tuition) {
        if (tuition.min !== null) sp.set('tuition_min', String(tuition.min));
        if (tuition.max !== null) sp.set('tuition_max', String(tuition.max));
      }
      const duration = findBand(DURATION_BANDS, durationFilter);
      if (duration) {
        if (duration.min !== null) sp.set('duration_min', String(duration.min));
        if (duration.max !== null) sp.set('duration_max', String(duration.max));
      }
      // PF-3: always send the sort. "default" is a real ordering now
      // (featured first, then name) — it used to be silently "name",
      // which made the control lie about what it did.
      if (sortBy) sp.set('sort', sortBy);
      if (page > 1) sp.set('page', String(page));
      sp.set('limit', String(pageSize));
      return sp.toString();
    },
    [
      searchQuery,
      degreeFilter,
      languageFilter,
      disciplineFilter,
      universityFilter,
      cityFilter,
      scholarshipOnly,
      intakeFilter,
      intakeYearFilter,
      tuitionFilter,
      durationFilter,
      sortBy,
      pageSize,
    ],
  );

  // The filter set without the page — a change here invalidates every
  // loaded page, so the effect below resets to page 1.
  const filterKey = useMemo(
    () =>
      [
        searchQuery,
        degreeFilter,
        languageFilter,
        disciplineFilter,
        universityFilter,
        cityFilter,
        scholarshipOnly,
        intakeFilter,
        intakeYearFilter,
        tuitionFilter,
        durationFilter,
        sortBy,
      ].join('|'),
    [
      searchQuery,
      degreeFilter,
      languageFilter,
      disciplineFilter,
      universityFilter,
      cityFilter,
      scholarshipOnly,
      intakeFilter,
      intakeYearFilter,
      tuitionFilter,
      durationFilter,
      sortBy,
    ],
  );

  const fetchPage = useCallback(
    async (page: number, append: boolean, signal: AbortSignal) => {
      const res = await fetch(`/api/programs?${buildQuery(page)}`, { signal });
      if (!res.ok) throw new Error(`programs fetch failed: ${res.status}`);
      const json = (await res.json()) as ProgramQueryResult;
      setResult(json);
      setRows((prev) => (append ? [...prev, ...json.programs] : json.programs));
      return json;
    },
    [buildQuery],
  );

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }

    const controller = new AbortController();
    // Debounce so a burst of keystrokes is one request, not one per key.
    const timer = setTimeout(async () => {
      setIsPending(true);
      try {
        // A filter change invalidates every loaded page — page 7 of the
        // old result set is meaningless against the new one — so the
        // list restarts at page 1.
        await fetchPage(1, false, controller.signal);
        setPageParam('');
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
  }, [filterKey, fetchPage, setPageParam]);

  const total = result.total;
  const totalPages = result.totalPages;
  const hasMore = currentPage < totalPages;

  // ── PF-1: facet vocabulary ─────────────────────────────────────────────
  // The options come from the live table (with counts), not from the
  // hardcoded seed arrays. The seed arrays survive only as the
  // Chinese label lookup for degree/language (those two vocabularies
  // are in sync with the DB) and as the no-DB fallback.
  const facetToUrl = useCallback(
    (v: string) => (v === '' ? PROGRAM_FACET_NONE : v),
    [],
  );

  const facetLabel = useCallback(
    (f: ProgramFacet, kind: 'degree' | 'language' | 'discipline') => {
      if (f.value === '') return t('prog.notPublished');
      if (locale !== 'zh') return f.value;
      if (kind === 'discipline') return f.labelCn || f.value;
      const list = kind === 'degree' ? degreeTypes : languages;
      const cn = kind === 'degree' ? degreeTypesCn : languagesCn;
      const idx = (list as readonly string[]).indexOf(f.value);
      return idx >= 0 ? cn[idx] : f.value;
    },
    [locale, t],
  );

  const uniBySlug = useMemo(() => {
    const m = new Map<string, UniversityOption>();
    for (const u of universityOptions) m.set(u.slug, u);
    return m;
  }, [universityOptions]);

  const universityFacetCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of facets.university) m.set(f.value, f.count);
    return m;
  }, [facets]);

  const universitySearchOptions = useMemo(
    () =>
      universityOptions.map((u) => ({
        value: u.slug,
        label: locale === 'zh' ? u.nameCn : u.name,
        sublabel: `${universityFacetCount.get(u.slug) ?? 0} ${t('prog.programs')}`,
      })),
    [universityOptions, universityFacetCount, locale, t],
  );

  const selectedUniversityLabel = useMemo(() => {
    if (!universityFilter) return '';
    const u = uniBySlug.get(universityFilter);
    if (!u) return universityFilter;
    return locale === 'zh' ? u.nameCn : u.name;
  }, [universityFilter, uniBySlug, locale]);

  /** PF-2: the intake season label (the DB value is a fixed enum). */
  const intakeSeasonLabel = useCallback(
    (value: string) => {
      if (value === 'September') return t('prog.intakeSeptember');
      if (value === 'March') return t('prog.intakeMarch');
      if (value === 'Both') return t('prog.intakeBoth');
      return t('prog.notPublished');
    },
    [t],
  );

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
    const f = facets.degree.find((x) => facetToUrl(x.value) === degreeFilter);
    activeFilters.push({
      key: 'degree',
      label: `${t('prog.degree')}: ${f ? facetLabel(f, 'degree') : degreeFilter}`,
      clear: () => setDegreeFilter(''),
    });
  }
  if (languageFilter) {
    const f = facets.language.find((x) => facetToUrl(x.value) === languageFilter);
    activeFilters.push({
      key: 'lang',
      label: `${t('prog.language')}: ${f ? facetLabel(f, 'language') : languageFilter}`,
      clear: () => setLanguageFilter(''),
    });
  }
  if (disciplineFilter) {
    const f = facets.discipline.find((x) => facetToUrl(x.value) === disciplineFilter);
    activeFilters.push({
      key: 'disc',
      label: `${t('prog.discipline')}: ${f ? facetLabel(f, 'discipline') : disciplineFilter}`,
      clear: () => setDisciplineFilter(''),
    });
  }
  if (universityFilter) {
    activeFilters.push({
      key: 'uni',
      label: `${t('prog.university')}: ${selectedUniversityLabel}`,
      clear: () => setUniversityFilter(''),
    });
  }
  if (cityFilter) {
    const f = facets.city.find((x) => x.value === cityFilter);
    activeFilters.push({
      key: 'city',
      label: `${t('prog.city')}: ${f ? (locale === 'zh' ? f.labelCn || f.value : f.value) : cityFilter}`,
      clear: () => setCityFilter(''),
    });
  }
  if (scholarshipOnly === '1') {
    activeFilters.push({ key: 'scholarship', label: t('filter.scholarship'), clear: () => setScholarshipOnly('') });
  }
  if (intakeFilter) {
    activeFilters.push({
      key: 'intake',
      label: `${t('prog.intakeSeason')}: ${intakeSeasonLabel(intakeFilter)}`,
      clear: () => setIntakeFilter(''),
    });
  }
  if (intakeYearFilter) {
    activeFilters.push({
      key: 'year',
      label: `${t('prog.intakeYear')}: ${intakeYearFilter}`,
      clear: () => setIntakeYearFilter(''),
    });
  }
  if (tuitionFilter) {
    const band = findBand(TUITION_BANDS, tuitionFilter);
    activeFilters.push({
      key: 'tuition',
      label: `${t('prog.tuitionBand')}: ${band ? t(band.labelKey) : tuitionFilter}`,
      clear: () => setTuitionFilter(''),
    });
  }
  if (durationFilter) {
    const band = findBand(DURATION_BANDS, durationFilter);
    activeFilters.push({
      key: 'duration',
      label: `${t('prog.durationBand')}: ${band ? t(band.labelKey) : durationFilter}`,
      clear: () => setDurationFilter(''),
    });
  }

  const clearAll = useCallback(() => {
    setSearchQuery('');
    setDegreeFilter('');
    setLanguageFilter('');
    setDisciplineFilter('');
    setUniversityFilter('');
    setCityFilter('');
    setScholarshipOnly('');
    setIntakeFilter('');
    setIntakeYearFilter('');
    setTuitionFilter('');
    setDurationFilter('');
    setPageParam('');
  }, [
    setSearchQuery,
    setDegreeFilter,
    setLanguageFilter,
    setDisciplineFilter,
    setUniversityFilter,
    setCityFilter,
    setScholarshipOnly,
    setIntakeFilter,
    setIntakeYearFilter,
    setTuitionFilter,
    setDurationFilter,
    setPageParam,
  ]);

  const hasAnyFilter = activeFilters.length > 0;

  // Universities the term hit — drives the "N programs at X" hint so the
  // user can tell WHY a row appeared instead of guessing.
  const matchedUniLabels = useMemo(
    () =>
      result.matchedUniversitySlugs
        .map((s) => uniBySlug.get(s))
        .filter((u): u is UniversityOption => Boolean(u))
        .map((u) => (locale === 'zh' ? u.nameCn : u.name)),
    [result.matchedUniversitySlugs, uniBySlug, locale],
  );

  // ── PF-6: the filter query the detail page should return to ──────────
  // Same short param names the URL already uses (the server accepts
  // both spellings), minus the paging params.
  const fromQuery = useMemo(() => {
    const sp = new URLSearchParams();
    if (searchQuery) sp.set('q', searchQuery);
    if (degreeFilter) sp.set('degree', degreeFilter);
    if (languageFilter) sp.set('lang', languageFilter);
    if (disciplineFilter) sp.set('disc', disciplineFilter);
    if (universityFilter) sp.set('uni', universityFilter);
    if (cityFilter) sp.set('city', cityFilter);
    if (scholarshipOnly === '1') sp.set('scholarship', '1');
    if (intakeFilter) sp.set('intake', intakeFilter);
    if (intakeYearFilter) sp.set('year', intakeYearFilter);
    if (tuitionFilter) sp.set('tuition', tuitionFilter);
    if (durationFilter) sp.set('duration', durationFilter);
    if (sortBy) sp.set('sort', sortBy);
    return sp.toString();
  }, [
    searchQuery,
    degreeFilter,
    languageFilter,
    disciplineFilter,
    universityFilter,
    cityFilter,
    scholarshipOnly,
    intakeFilter,
    intakeYearFilter,
    tuitionFilter,
    durationFilter,
    sortBy,
  ]);

  const goToPage = useCallback(
    async (p: number) => {
      setPageParam(p > 1 ? String(p) : '');
      setIsPending(true);
      try {
        await fetchPage(p, false, new AbortController().signal);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        console.error('[programs] page change failed:', err);
      } finally {
        setIsPending(false);
      }
    },
    [fetchPage, setPageParam],
  );

  const loadMore = useCallback(async () => {
    const next = currentPage + 1;
    setIsPending(true);
    try {
      await fetchPage(next, true, new AbortController().signal);
      setPageParam(String(next));
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (err) {
      console.error('[programs] load more failed:', err);
    } finally {
      setIsPending(false);
    }
  }, [currentPage, fetchPage, setPageParam]);

  // ── PF-7: filter + search analytics ────────────────────────────────────
  // The event map already had `search_performed` / `filter_change` with
  // `surface: 'programs'`, but the page never fired them — so the one
  // surface that needs funnel data had none.
  const fireFilterChange = useCallback(
    (filter: string, value: string | null) => {
      track('filter_change', { surface: 'programs', filter, value, locale });
    },
    [locale],
  );

  const onSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      track('search_performed', { surface: 'programs', term: value.trim().toLowerCase(), locale });
    },
    [setSearchQuery, locale],
  );

  // ── Filter controls (shared by the desktop row + the mobile sheet) ────
  const filterControls = (
    /* A compact grid, not six stacked rows: the desktop filter panel
       used to push the first result row ~600px down the page. */
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label htmlFor="prog-degree" className="mb-1 block text-xs font-medium text-gray-500">
          {t('prog.degree')}
        </label>
          <select
            id="prog-degree"
            value={degreeFilter}
            onChange={(e) => {
              setDegreeFilter(e.target.value);
              fireFilterChange('degree', e.target.value || null);
            }}
            className="w-full rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
          >
            <option value="">{t('prog.allDegrees')}</option>
            {facets.degree.map((f) => (
              <option key={f.value} value={facetToUrl(f.value)}>
                {facetLabel(f, 'degree')} ({f.count})
              </option>
            ))}
          </select>
        </div>
      <div>
        <label htmlFor="prog-language" className="mb-1 block text-xs font-medium text-gray-500">
          {t('prog.language')}
        </label>
          <select
            id="prog-language"
            value={languageFilter}
            onChange={(e) => {
              setLanguageFilter(e.target.value);
              fireFilterChange('language', e.target.value || null);
            }}
            className="w-full rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
          >
            <option value="">{t('prog.allLanguages')}</option>
            {facets.language.map((f) => (
              <option key={f.value} value={facetToUrl(f.value)}>
                {facetLabel(f, 'language')} ({f.count})
              </option>
            ))}
          </select>
      </div>

      <div>
        <label htmlFor="prog-discipline" className="mb-1 block text-xs font-medium text-gray-500">
          {t('prog.discipline')}
        </label>
        <select
          id="prog-discipline"
          value={disciplineFilter}
          onChange={(e) => {
            setDisciplineFilter(e.target.value);
            fireFilterChange('discipline', e.target.value || null);
          }}
          className="w-full rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
        >
          <option value="">{t('prog.allDisciplines')}</option>
          {facets.discipline.map((f) => (
            <option key={f.value} value={facetToUrl(f.value)}>
              {facetLabel(f, 'discipline')} ({f.count})
            </option>
          ))}
        </select>
      </div>

      {/* PF-4b: the city filter. A program inherits its university's
          city, so the server resolves the city to university slugs. */}
      {facets.city.length > 0 && (
        <div>
          <label htmlFor="prog-city" className="mb-1 block text-xs font-medium text-gray-500">
            {t('prog.city')}
          </label>
          <select
            id="prog-city"
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              fireFilterChange('city', e.target.value || null);
            }}
            className="w-full rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
          >
            <option value="">{t('prog.allCities')}</option>
            {facets.city.map((f) => (
              <option key={f.value} value={f.value}>
                {locale === 'zh' ? f.labelCn || f.value : f.value} ({f.count})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-gray-500">{t('prog.university')}</label>
        <SearchableSelect
          value={universityFilter}
          onChange={(value) => {
            setUniversityFilter(value);
            fireFilterChange('university', value || null);
          }}
          options={universitySearchOptions}
          placeholder={t('filter.allUniversities')}
          emptyText={t('prog.noMatches')}
          searchPlaceholder={t('prog.searchUniversities')}
          clearValue=""
          clearLabel={t('filter.allUniversities')}
          locale={locale}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
        <label
          className="inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-2.5 text-sm cursor-pointer hover:border-[#9B1B30] transition-colors rounded-none"
          title={t('filter.scholarshipOnly')}
        >
          <input
            type="checkbox"
            checked={scholarshipOnly === '1'}
            onChange={(e) => {
              setScholarshipOnly(e.target.checked ? '1' : '');
              fireFilterChange('scholarship', e.target.checked ? '1' : null);
            }}
            className="h-4 w-4 accent-[#9B1B30]"
          />
          <Award className="h-4 w-4 text-[#9B1B30]" />
          <span className="text-[#1B2A4A] font-medium">{t('prog.scholarshipOnly')}</span>
          <span className="text-xs text-gray-500">({facets.scholarship.yes})</span>
        </label>

        {/* PF-4b: a one-click "English-taught" toggle — the single most
            asked question on the site, and one click instead of two
            dropdowns (language + a manual read of the label). */}
        <label
          className="inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-2.5 text-sm cursor-pointer hover:border-[#9B1B30] transition-colors rounded-none"
          title={t('prog.englishTaught')}
        >
          <input
            type="checkbox"
            checked={languageFilter === 'English'}
            onChange={(e) => {
              setLanguageFilter(e.target.checked ? 'English' : '');
              fireFilterChange('englishTaught', e.target.checked ? '1' : null);
            }}
            className="h-4 w-4 accent-[#9B1B30]"
          />
          <Globe className="h-4 w-4 text-[#1B2A4A]" />
          <span className="text-[#1B2A4A] font-medium">{t('prog.englishTaught')}</span>
          <span className="text-xs text-gray-500">
            ({facets.language.find((f) => f.value === 'English')?.count ?? 0})
          </span>
        </label>
      </div>

      {/* PF-2: the normalized facets. Rendered only when the catalogue
          has the derived columns — before the migration these controls
          would be filters that silently do nothing. */}
      {facets.normalized.available && (
        <>
          <div>
            <label htmlFor="prog-intake" className="mb-1 block text-xs font-medium text-gray-500">
              {t('prog.intakeSeason')}
            </label>
              <select
                id="prog-intake"
                value={intakeFilter}
                onChange={(e) => {
                  setIntakeFilter(e.target.value);
                  fireFilterChange('intake', e.target.value || null);
                }}
                className="w-full rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
              >
                <option value="">{t('prog.allIntakes')}</option>
                {facets.normalized.intakeSeason.map((f) => (
                  <option key={f.value} value={f.value}>
                    {intakeSeasonLabel(f.value)} ({f.count})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="prog-intake-year" className="mb-1 block text-xs font-medium text-gray-500">
                {t('prog.intakeYear')}
              </label>
              <select
                id="prog-intake-year"
                value={intakeYearFilter}
                onChange={(e) => {
                  setIntakeYearFilter(e.target.value);
                  fireFilterChange('year', e.target.value || null);
                }}
                className="w-full rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
              >
                <option value="">{t('prog.allIntakes')}</option>
                {facets.normalized.intakeYear.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.value} ({f.count})
                  </option>
                ))}
              </select>
            </div>

            {facets.normalized.tuitionAvailable && (
            <div>
              <label htmlFor="prog-tuition" className="mb-1 block text-xs font-medium text-gray-500">
                {t('prog.tuitionBand')}
              </label>
              <select
                id="prog-tuition"
                value={tuitionFilter}
                onChange={(e) => {
                  setTuitionFilter(e.target.value);
                  fireFilterChange('tuition', e.target.value || null);
                }}
                className="w-full rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
              >
                <option value="">{t('prog.allTuitionBands')}</option>
                {TUITION_BANDS.map((band) => {
                  const f = facets.normalized.tuition.find((x) => x.value === band.value);
                  return (
                    <option key={band.value} value={band.value}>
                      {t(band.labelKey)} ({f?.count ?? 0})
                    </option>
                  );
                })}
              </select>
            </div>
            )}
            {facets.normalized.durationAvailable && (
            <div>
              <label htmlFor="prog-duration" className="mb-1 block text-xs font-medium text-gray-500">
                {t('prog.durationBand')}
              </label>
              <select
                id="prog-duration"
                value={durationFilter}
                onChange={(e) => {
                  setDurationFilter(e.target.value);
                  fireFilterChange('duration', e.target.value || null);
                }}
                className="w-full rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
              >
                <option value="">{t('prog.allDurations')}</option>
                {DURATION_BANDS.map((band) => {
                  const f = facets.normalized.duration.find((x) => x.value === band.value);
                  return (
                    <option key={band.value} value={band.value}>
                      {t(band.labelKey)} ({f?.count ?? 0})
                    </option>
                  );
                })}
              </select>
            </div>
            )}
        </>
      )}
    </div>
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

      <section className="sticky top-16 z-30 bg-white border-b border-gray-200 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Row 1 — search, mobile filter trigger, sort, view toggle */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
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

            <div className="flex items-center gap-2">
              {/* PF-4a: on mobile the controls live in a sheet — six
                  wrapping selects used to become a tall stack. */}
              <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-none border-gray-200 lg:hidden"
                    aria-label={t('prog.filters')}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {t('prog.filters')}
                    {hasAnyFilter && (
                      <span className="ml-1 bg-[#9B1B30] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {activeFilters.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{t('prog.filters')}</SheetTitle>
                  </SheetHeader>
                  <div className="px-4 pb-6">{filterControls}</div>
                </SheetContent>
              </Sheet>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                aria-label={t('prog.sortBy')}
                className="rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
              >
                <option value="default">
                  {t('prog.sortBy')}: {t('prog.default')}
                </option>
                <option value="relevance">
                  {t('prog.sortBy')}: {t('prog.sortRelevance')}
                </option>
                <option value="tuition">
                  {t('prog.sortBy')}: {t('prog.tuition')}
                </option>
                <option value="name">
                  {t('prog.sortBy')}: {t('prog.name')}
                </option>
                {facets.normalized.available && (
                  <option value="intake">
                    {t('prog.sortBy')}: {t('prog.sortIntake')}
                  </option>
                )}
              </select>

            </div>
          </div>

          {/* Row 2 — the filter controls, desktop only */}
          <div className="mt-3 hidden lg:block">{filterControls}</div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <span>
              {total} {t('prog.results')}
            </span>
            {rows.length > 0 && total > rows.length && (
              <span className="text-xs">{t('prog.showing', { shown: rows.length, total })}</span>
            )}
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
        {rows.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-gray-200 bg-white">
            <Filter className="mx-auto h-10 w-10 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-[#1B2A4A]">{t('prog.noResults')}</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{t('filter.suggestion')}</p>
            {hasAnyFilter && (
              <>
                {/* PF-4b: the filters are the problem, so offer them
                    back one at a time — the only honest suggestion when
                    the counts are global rather than per-combination. */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {activeFilters.map((f) => (
                    <button
                      key={`empty-${f.key}`}
                      type="button"
                      onClick={() => f.clear()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[#9B1B30]/10 text-[#9B1B30] border border-[#9B1B30]/30 rounded-none hover:bg-[#9B1B30]/20 transition-colors"
                    >
                      {f.label}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
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
              </>
            )}
          </div>
        ) : (
          /* The card grid. Compact on purpose: the old card was ~260px
             tall (a university line, a 3-icon meta block and a footer
             bar), which turned a 24-row page into 24 screens of
             scrolling. This one is ~150px and carries the same facts. */
          <div
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 150ms ease' }}
          >
            {rows.map((program: Program, idx) => {
              const uni = uniBySlug.get(program.universitySlug);
              const duration = locale === 'zh' ? program.durationCn : program.duration;
              const intake = locale === 'zh' ? program.intakeCn : program.intake;
              // Did this row match because of the university, or the
              // program name? Only meaningful while a term is active.
              const matchedViaUniversity =
                searchQuery !== '' &&
                result.matchedUniversitySlugs.length > 0 &&
                result.matchedUniversitySlugs.includes(program.universitySlug) &&
                !program.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !(program.nameCn ?? '').toLowerCase().includes(searchQuery.toLowerCase());

              return (
                <Link
                  key={program.slug}
                  href={`/programs/${program.slug}${fromQuery ? `?from=${encodeURIComponent(fromQuery)}` : ''}`}
                  onClick={() =>
                    track('program_click', { slug: program.slug, position: idx, locale })
                  }
                  className="group flex flex-col border border-gray-200 bg-white transition-all duration-150 hover:border-[#9B1B30]/40 hover:shadow-md"
                >
                  <div className="h-0.5 bg-[#9B1B30]" />
                  <div className="flex flex-1 flex-col p-3.5">
                    {/* Degree + discipline on one line — the two facts a
                        student scans for first. */}
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className={`inline-block shrink-0 px-1.5 py-0.5 text-[10px] font-semibold leading-4 ${degreeColor(program.degree)}`}>
                        {locale === 'zh'
                          ? degreeTypesCn[degreeTypes.indexOf(program.degree)]
                          : program.degree}
                      </span>
                      {program.discipline && (
                        <span className="truncate text-[11px] text-gray-500">
                          {locale === 'zh' ? program.disciplineCn || program.discipline : program.discipline}
                        </span>
                      )}
                      {program.scholarshipAvailable && (
                        <Award className="ml-auto h-3.5 w-3.5 shrink-0 text-[#9B1B30]" aria-label={t('prog.scholarship')} />
                      )}
                    </div>

                    <h3 className="mt-1.5 line-clamp-2 min-w-0 text-sm font-bold leading-snug text-[#1B2A4A] transition-colors group-hover:text-[#9B1B30]">
                      {locale === 'zh' ? program.nameCn : program.name}
                    </h3>

                    <p className="mt-1 flex min-w-0 items-center gap-1 text-[11px] text-gray-500">
                      <Building2 className="h-3 w-3 shrink-0 text-[#1B2A4A]" />
                      <span className="min-w-0 truncate">
                        {uni ? (locale === 'zh' ? uni.nameCn : uni.name) : program.universitySlug}
                      </span>
                    </p>

                    {matchedViaUniversity && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#9B1B30]">
                        <Search className="h-3 w-3 shrink-0" />
                        {t('prog.matchedViaUniversity')}
                      </p>
                    )}

                    {/* One wrapped meta line instead of the old 3-icon
                        block + footer bar. */}
                    <dl className="mt-auto flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-gray-100 pt-2 text-[11px] text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Globe className="h-3 w-3 shrink-0 text-[#1B2A4A]" />
                        {locale === 'zh'
                          ? languagesCn[languages.indexOf(program.language)] || program.language
                          : program.language}
                      </span>
                      {duration && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0 text-[#1B2A4A]" />
                          {locale === 'zh' ? program.durationCn : program.duration}
                        </span>
                      )}
                      {program.tuition && (
                        <span className="inline-flex items-center gap-1">
                          <Banknote className="h-3 w-3 shrink-0 text-[#1B2A4A]" />
                          {compactTuition(program.tuition)}
                        </span>
                      )}
                      {intake && (
                        <span className="inline-flex items-center gap-1" title={intake}>
                          <CalendarDays className="h-3 w-3 shrink-0 text-[#1B2A4A]" />
                          {shortenIntake(intake, locale)}
                        </span>
                      )}
                    </dl>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* PF-5: load more instead of 105 page buttons. The page count
            is kept as an escape hatch for power users. */}
        {rows.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3">
            {hasMore && (
              <button
                type="button"
                onClick={loadMore}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-none border border-[#1B2A4A] px-6 py-3 text-sm font-semibold text-[#1B2A4A] transition-colors hover:bg-[#1B2A4A] hover:text-white disabled:opacity-40"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {t('prog.loadMore')}
              </button>
            )}
            {!hasMore && <p className="text-xs text-gray-400">{t('prog.noMoreResults')}</p>}
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-1" aria-label={t('prog.pagination')}>
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
          </div>
        )}
      </section>
    </main>
  );
}

/** Degree badge colour. */
function degreeColor(degree: string) {
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
}

/**
 * The tuition column is free text ("CNY 31,000/year (2026)", "¥16,000-24,000
 * /year"). The card shows the currency + the first figure; the full string
 * stays in the tooltip.
 */
function compactTuition(value: string): string {
  const coded = value.match(/(CNY|RMB|USD|EUR)\s*([\d,]+(?:\.\d+)?)/i);
  if (coded) return `${coded[1].toUpperCase()} ${coded[2]}`;
  const symbol = value.match(/[¥$€]\s*([\d,]+(?:\.\d+)?)/);
  if (symbol) return symbol[0].replace(/\s+/g, '');
  return value.length > 18 ? `${value.slice(0, 17)}…` : value;
}

/** "September 2027 (2026 catalogue)" → "Sep 2027" — the card has no room
 *  for the catalogue suffix. */
function shortenIntake(value: string, locale: 'en' | 'zh'): string {
  if (locale === 'zh') return value;
  const shortened = value
    .replace(/September/gi, 'Sep')
    .replace(/March/gi, 'Mar')
    .replace(/Autumn/gi, 'Fall');
  return shortened.length > 22 ? `${shortened.slice(0, 21)}…` : shortened;
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

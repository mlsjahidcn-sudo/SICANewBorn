'use client';

import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { cities, citiesCn, disciplines, disciplinesCn, type University } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Star, MapPin, ChevronLeft, ChevronRight, ArrowRight, Globe, Award, X, Filter as FilterIcon } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import UniversityLogo from '@/components/university-logo';
import { useUrlState } from '@/hooks/use-url-state';
import { track } from '@/lib/analytics';

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/universities` },
};

// Phase: filter enhancements
//   - URL sync (refresh-survives, shareable links)
//   - Active filter pills with X-to-remove
//   - Type filter (Public / Private + the 985/211/DFC tags)
//   - Min rating filter (4+ / 4.5+ / 4.7+)
//   - Reset all button + empty-state suggestions
//   - Dead "Search" button removed (filters already fire on every keystroke)
const RATING_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 4.5, label: '4.5★+' },
  { value: 4.6, label: '4.6★+' },
  { value: 4.7, label: '4.7★+' },
  { value: 4.8, label: '4.8★+' },
  { value: 4.9, label: '4.9★' },
] as const;

const TAG_OPTIONS = ['985', '211', 'Double First Class'] as const;
const TYPE_OPTIONS = [
  { value: 'Public', en: 'Public', zh: '公立' },
  { value: 'Private', en: 'Private', zh: '私立' },
] as const;

export default function UniversidadesPage() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const perPage = 6;
  // Start empty — data is fetched on mount from the API (server-side, no client
  // bundle bloat from the 2300-line static fallback).
  const [universities, setUniversities] = useState<University[]>([]);

  // URL-bound filter state. 250ms debounce on the search box so we
  // don't write to history on every keystroke. Each `as` cast widens
  // the inferred type so the setter accepts both the empty string
  // AND the valid filter values.
  const [searchQuery, setSearchQuery] = useUrlState('q', '' as string, {
    searchParams, debounceMs: 250,
  });
  const [selectedCity, setSelectedCity] = useUrlState('city', '' as string, { searchParams });
  const [selectedDiscipline, setSelectedDiscipline] = useUrlState('discipline', '' as string, { searchParams });
  const [selectedTag, setSelectedTag] = useUrlState('tag', '' as string, { searchParams });
  const [selectedType, setSelectedType] = useUrlState('type', '' as string, { searchParams });
  const [minRating, setMinRating] = useUrlState('rating', '0' as string, {
    searchParams,
    coerce: (raw) => (RATING_OPTIONS.find((o) => String(o.value) === raw)?.value ?? 0).toString(),
  });
  const [sortBy, setSortBy] = useUrlState<'ranking' | 'name' | 'qsWorld' | 'rating'>(
    'sort',
    'ranking' as 'ranking' | 'name' | 'qsWorld' | 'rating',
    { searchParams },
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch('/api/universities?limit=100')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.universities?.length) {
          setUniversities(data.universities);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let result = [...universities];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.nameCn.includes(q) ||
          u.city.toLowerCase().includes(q) ||
          u.cityCn.includes(q)
      );
    }

    if (selectedCity) {
      result = result.filter((u) => u.city === selectedCity || u.cityCn === selectedCity);
    }

    if (selectedDiscipline) {
      result = result.filter((u) => u.disciplines.includes(selectedDiscipline));
    }

    if (selectedTag) {
      result = result.filter((u) => u.tags.includes(selectedTag));
    }

    if (selectedType) {
      result = result.filter((u) =>
        selectedType === 'Public' ? u.type === 'Public University' : u.type !== 'Public University',
      );
    }

    const minRatingNum = parseFloat(minRating || '0');
    if (minRatingNum > 0) {
      result = result.filter((u) => u.rating >= minRatingNum);
    }

    if (sortBy === 'ranking') {
      result.sort((a, b) => a.ranking - b.ranking);
    } else if (sortBy === 'qsWorld') {
      result.sort((a, b) => a.qsWorldRanking - b.qsWorldRanking);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [searchQuery, selectedCity, selectedDiscipline, selectedTag, selectedType, minRating, sortBy, universities]);

  // Reset to page 1 when any filter changes. Without this the user can
  // land on an empty page because the previous page no longer exists.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, selectedDiscipline, selectedTag, selectedType, minRating, sortBy]);

  // Phase 29: fire search_performed when the user types
  // something into the search box. 600ms debounce so we
  // don't spam GA on every keystroke — by the time the
  // event fires the user has paused typing. We don't
  // fire on empty strings (a "cleared" search is a
  // different intent that we don't currently track; the
  // results render and the user moves on).
  useEffect(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return;
    const id = window.setTimeout(() => {
      track('search_performed', {
        surface: 'universities',
        term,
        locale,
      });
    }, 600);
    return () => window.clearTimeout(id);
  }, [searchQuery, locale]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const cityList = locale === 'zh' ? citiesCn : cities;
  const disciplineList = locale === 'zh' ? disciplinesCn : disciplines;

  /**
   * Phase: list of currently-active filters rendered as removable
   * pills. Each pill has a label and a click-to-remove handler. We
   * also expose a "Clear all" link that resets every filter.
   */
  const activeFilters: { key: string; label: string; clear: () => void }[] = [];
  if (searchQuery) {
    activeFilters.push({
      key: 'q',
      label: `${locale === 'zh' ? '搜索' : 'Search'}: "${searchQuery}"`,
      clear: () => setSearchQuery(''),
    });
  }
  if (selectedCity) {
    const cityLabel = cities.includes(selectedCity)
      ? (locale === 'zh' ? citiesCn[cities.indexOf(selectedCity)] : selectedCity)
      : selectedCity;
    activeFilters.push({
      key: 'city',
      label: `${t('uni.allCities').replace('All ', '').replace('所有', '')}: ${cityLabel}`,
      clear: () => setSelectedCity(''),
    });
  }
  if (selectedDiscipline) {
    const discLabel = disciplines.includes(selectedDiscipline)
      ? (locale === 'zh' ? disciplinesCn[disciplines.indexOf(selectedDiscipline)] : selectedDiscipline)
      : selectedDiscipline;
    activeFilters.push({
      key: 'discipline',
      label: `${t('uni.allDisciplines').replace('All ', '').replace('所有', '')}: ${discLabel}`,
      clear: () => setSelectedDiscipline(''),
    });
  }
  if (selectedTag) {
    activeFilters.push({
      key: 'tag',
      label: `Tag: ${selectedTag}`,
      clear: () => setSelectedTag(''),
    });
  }
  if (selectedType) {
    const typeLabel = TYPE_OPTIONS.find((o) => o.value === selectedType);
    activeFilters.push({
      key: 'type',
      label: `${t('uni.type')}: ${typeLabel ? (locale === 'zh' ? typeLabel.zh : typeLabel.en) : selectedType}`,
      clear: () => setSelectedType(''),
    });
  }
  if (parseFloat(minRating || '0') > 0) {
    activeFilters.push({
      key: 'rating',
      label: `${t('filter.minRating')}: ${minRating}★+`,
      clear: () => setMinRating('0'),
    });
  }

  const clearAll = useCallback(() => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedDiscipline('');
    setSelectedTag('');
    setSelectedType('');
    setMinRating('0');
  }, [setSearchQuery, setSelectedCity, setSelectedDiscipline, setSelectedTag, setSelectedType, setMinRating]);

  const hasAnyFilter = activeFilters.length > 0;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(/hero-bg.avif)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A] via-[#1B2A4A]/80 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{t('uni.title')}</h1>
          <p className="mt-3 text-gray-300 max-w-xl">{t('uni.subtitle')}</p>
          <div className="mt-5">
            <Link
              href="/universities/compare"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Compare two universities side by side
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('uni.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="h-10 rounded-none border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
            >
              <option value="">{t('uni.allCities')}</option>
              {cityList.map((city, i) => (
                <option key={cities[i]} value={cities[i]}>
                  {city}
                </option>
              ))}
            </select>
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="h-10 rounded-none border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
            >
              <option value="">{t('uni.allDisciplines')}</option>
              {disciplineList.map((disc, i) => (
                <option key={disciplines[i]} value={disciplines[i]}>
                  {disc}
                </option>
              ))}
            </select>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="h-10 rounded-none border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
              title={locale === 'zh' ? '院校标签' : 'Classification tag'}
            >
              <option value="">Tags: {locale === 'zh' ? '全部' : 'All'}</option>
              {TAG_OPTIONS.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-10 rounded-none border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
            >
              <option value="">{t('filter.allTypes')}</option>
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {locale === 'zh' ? o.zh : o.en}
                </option>
              ))}
            </select>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="h-10 rounded-none border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
            >
              {RATING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value.toString()}>
                  {o.value === 0 ? t('filter.allRatings') : o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-gray-500">
              {filtered.length} {locale === 'en' ? 'universities found' : '所大学'}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'ranking' | 'name' | 'qsWorld' | 'rating')}
              className="text-sm text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="ranking">
                {t('uni.sortBy')}: {t('uni.ranking')}
              </option>
              <option value="qsWorld">
                {t('uni.sortBy')}: {t('uni.qsWorldRanking')}
              </option>
              <option value="rating">
                {t('uni.sortBy')}: {locale === 'zh' ? '评分' : 'Rating'}
              </option>
              <option value="name">
                {t('uni.sortBy')}: {t('uni.name')}
              </option>
            </select>
          </div>

          {/* Active filter pills (click X to remove a single filter) */}
          {hasAnyFilter && (
            <div className="mt-3 flex items-center gap-2 flex-wrap" role="region" aria-label={t('filter.activeFilters')}>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t('filter.activeFilters')}:
              </span>
              {activeFilters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={f.clear}
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

      {/* University Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {paginated.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((uni, idx) => (
              <Link
                key={uni.slug}
                href={`/universities/${uni.slug}`}
                onClick={() => {
                  // Phase 29: track which university cards drive
                  // clicks + their position in the visible list
                  // (0-indexed). The position is the rank in the
                  // current page (top-left = 0), which is a
                  // useful signal for "do users click the
                  // top-ranked schools, or do they scroll?"
                  track('university_click', {
                    slug: uni.slug,
                    position: idx,
                    locale,
                  });
                }}
                className="group isolate rounded-none border border-gray-200 bg-white shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 hover:border-[#9B1B30]/30"
              >
                {/* Image + Logo */}
                <div className="relative">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={uni.image}
                      alt={uni.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  {/* University Logo */}
                  <UniversityLogo src={uni.logo || ''} variant="directory" />
                </div>

                {/* Ranking & QS Row */}
                <div className="flex items-center justify-between px-5 py-2.5 bg-[#FAFAF8] border-b border-gray-100">
                  <div className={`flex items-center gap-2 ${uni.logo && uni.logo.startsWith('http') ? 'pl-24' : ''}`}>
                    <span className="inline-flex items-center gap-1.5 bg-[#9B1B30] text-white text-xs font-bold px-2.5 py-1 rounded-none">
                      #{uni.ranking} {locale === 'en' ? 'in China' : '中国'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B2A4A]">
                      <Globe className="h-3.5 w-3.5" />
                      QS #{uni.qsWorldRanking}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-[#D4A853] text-[#D4A853]" />
                    <span className="font-semibold text-[#1B2A4A]">{uni.rating}</span>
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors leading-tight">
                    {locale === 'en' ? uni.name : uni.nameCn}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 text-[#1B2A4A]" />
                    {locale === 'en' ? uni.city : uni.cityCn}
                  </div>
                  {/* Classification Tags */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(locale === 'en' ? uni.tags : uni.tagsCn).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-none border border-[#1B2A4A]/20 bg-[#1B2A4A]/5 text-[#1B2A4A]"
                      >
                        <Award className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* Accommodation Cost */}
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="font-medium text-[#1B2A4A]">{locale === 'en' ? uni.accommodationCost : uni.accommodationCostCn}</span>
                    <span>{locale === 'en' ? 'accommodation' : '住宿'}</span>
                  </div>

                  {/* Divider + CTA */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9B1B30] group-hover:gap-2.5 transition-all">
                      {locale === 'en' ? 'View Details' : '查看详情'}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-gray-200 bg-white">
            <FilterIcon className="mx-auto h-10 w-10 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-[#1B2A4A]">
              {locale === 'en' ? 'No universities match your filters' : '没有符合筛选条件的大学'}
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              {t('filter.suggestion')}
            </p>
            {hasAnyFilter && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button
                  onClick={clearAll}
                  className="rounded-none bg-[#1B2A4A] hover:bg-[#26345A] text-white"
                >
                  {t('filter.resetFilters')}
                </Button>
                <Link
                  href="/universities"
                  onClick={(e) => { e.preventDefault(); clearAll(); }}
                  className="text-sm text-gray-600 hover:text-[#9B1B30] underline underline-offset-2"
                >
                  {locale === 'en' ? 'or click here' : '或点击此处'}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-none border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-9 w-9 items-center justify-center rounded-none text-sm font-medium ${
                  currentPage === page
                    ? 'bg-[#9B1B30] text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-none border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>
    </>
  );
}

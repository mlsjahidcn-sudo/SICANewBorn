'use client';

import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import {
  scholarshipTypes,
  scholarshipTypesCn,
  scholarshipDegreeLevels,
  scholarshipDegreeLevelsCn,
  type Scholarship,
} from '@/lib/data';
import { Search, Filter, Clock, Globe, GraduationCap, ArrowRight, ChevronLeft, ChevronRight, Gift, CheckCircle } from 'lucide-react';
import { track } from '@/lib/analytics';

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/scholarships` },
};

const ITEMS_PER_PAGE = 6;

export default function ScholarshipsPage() {
  const { t, locale } = useI18n();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  // Fetched on mount — keeps the heavy data out of the client bundle.
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);

  useEffect(() => {
    fetch('/api/scholarships?limit=200')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.scholarships?.length) setScholarships(data.scholarships);
      })
      .catch(() => {});
  }, []);

  const types = locale === 'zh' ? scholarshipTypesCn : scholarshipTypes;
  const levels = locale === 'zh' ? scholarshipDegreeLevelsCn : scholarshipDegreeLevels;

  const filtered = useMemo(() => {
    let result = [...scholarships];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.nameCn.includes(search) ||
          s.description.toLowerCase().includes(q) ||
          s.descriptionCn.includes(search)
      );
    }

    if (typeFilter !== 'all') {
      const typeEn = typeFilter;
      result = result.filter((s) => s.type === typeEn);
    }

    if (levelFilter !== 'all') {
      const levelEn = levelFilter;
      result = result.filter((s) =>
        s.degreeLevels.some((dl) => dl.includes(levelEn))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'deadline') return a.deadline.localeCompare(b.deadline);
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [search, typeFilter, levelFilter, sortBy, scholarships]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
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
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{t('schol.title')}</h1>
          <p className="mt-3 text-lg text-gray-300 max-w-xl">{t('schol.subtitle')}</p>
          <div className="mt-6 flex flex-wrap gap-8">
            <div>
              <div className="text-3xl font-bold text-white">10+</div>
              <div className="text-sm text-gray-400">National Scholarships</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">Full &amp; Partial</div>
              <div className="text-sm text-gray-400">Coverage Options</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">All Levels</div>
              <div className="text-sm text-gray-400">Bachelor / Master / PhD</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="border-b border-gray-200 bg-white py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('schol.search')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-none bg-white text-sm focus:outline-none focus:border-[#9B1B30]"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 border border-gray-300 rounded-none bg-white text-sm focus:outline-none focus:border-[#9B1B30]"
          >
            <option value="all">{t('schol.allTypes')}</option>
            {scholarshipTypes.map((type, i) => (
              <option key={type} value={type}>
                {locale === 'zh' ? scholarshipTypesCn[i] : type}
              </option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(e) => { setLevelFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 border border-gray-300 rounded-none bg-white text-sm focus:outline-none focus:border-[#9B1B30]"
          >
            <option value="all">{t('schol.allLevels')}</option>
            {scholarshipDegreeLevels.map((level, i) => (
              <option key={level} value={level}>
                {locale === 'zh' ? scholarshipDegreeLevelsCn[i] : level}
              </option>
            ))}
          </select>

          {/* Phase 1 fix: removed the dead "Search" Button. The search
              input + selects above all filter on every onChange (the
              list re-renders as the user types/picks), so there was
              nothing for the button to submit. It was rendering as a
              crimson CTA that did nothing — a misleading conversion
              trap. The i18n key schol.searchBtn is now orphaned but
              left in place so existing translations don't have to be
              re-translated if a future form-submit pattern is added. */}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-500">{t('schol.sortBy')}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-none bg-white text-sm focus:outline-none"
            >
              <option value="name">{t('schol.name')}</option>
              <option value="deadline">{t('schol.deadline')}</option>
            </select>
          </div>
        </div>
      </section>

      {/* Results Count */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-2">
        <p className="text-sm text-gray-500">
          {filtered.length} {t('schol.results')}
        </p>
      </section>

      {/* Scholarship Cards */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginated.map((scholarship, idx) => (
            <div
              key={scholarship.slug}
              className="bg-white border border-gray-200 hover:border-[#9B1B30]/40 hover:shadow-lg transition-all duration-150 group"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      scholarship.type === 'Full'
                        ? 'bg-[#9B1B30] text-white'
                        : 'bg-[#1B2A4A] text-white'
                    }`}
                  >
                    <Gift className="w-3 h-3" />
                    {locale === 'zh' ? scholarship.typeCn : scholarship.type}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-[#1B2A4A]" />
                    {locale === 'zh' ? scholarship.deadlineCn : scholarship.deadline}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#1F2937] mb-2 group-hover:text-[#9B1B30] transition-colors">
                  {locale === 'zh' ? scholarship.nameCn : scholarship.name}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {locale === 'zh' ? scholarship.descriptionCn : scholarship.description}
                </p>
              </div>

              {/* Coverage Tags */}
              <div className="px-6 pb-4">
                <div className="flex flex-wrap gap-1.5">
                  {(locale === 'zh' ? scholarship.coverageCn : scholarship.coverage).map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-[#1B2A4A10] text-[#1B2A4A]"
                    >
                      <CheckCircle className="w-3 h-3" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Degree Levels + Regions */}
              <div className="px-6 pb-4 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#1B2A4A]" />
                  <span>
                    {(locale === 'zh' ? scholarship.degreeLevelsCn : scholarship.degreeLevels).slice(0, 3).join(', ')}
                    {scholarship.degreeLevels.length > 3 && '...'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#1B2A4A]" />
                  <span className="truncate">
                    {locale === 'zh' ? scholarship.eligibleRegionsCn : scholarship.eligibleRegions}
                  </span>
                </div>
              </div>

              {/* Divider + CTA */}
              <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {locale === 'zh' ? scholarship.durationCn : scholarship.duration}
                </span>
                <Link
                  href={`/scholarships/${scholarship.slug}`}
                  onClick={() => {
                    track('scholarship_click', {
                      slug: scholarship.slug,
                      position: idx,
                      locale,
                    });
                  }}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#9B1B30] hover:text-[#7A1526] transition-colors group/link"
                >
                  {t('schol.viewDetails')}
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {paginated.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No scholarships found matching your criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-10">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-none disabled:opacity-40 hover:border-[#9B1B30] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 text-sm border rounded-none transition-colors ${
                  currentPage === page
                    ? 'bg-[#9B1B30] text-white border-[#9B1B30]'
                    : 'border-gray-300 hover:border-[#9B1B30] text-gray-600'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-none disabled:opacity-40 hover:border-[#9B1B30] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

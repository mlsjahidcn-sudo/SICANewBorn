'use client';

import { useState, useMemo, useEffect } from 'react';
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
  type University,
} from '@/lib/data';
import { Search, Filter, GraduationCap, Globe, Clock, Banknote, ArrowRight, Award, BookOpen } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export default function ProgramsPage() {
  const { t, locale } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [currentPage, setCurrentPage] = useState(1);
  // Fetched on mount — keeps the ~2,300-line data.ts out of the client bundle.
  const [programs, setPrograms] = useState<Program[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/programs?limit=200').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/universities?limit=100').then((r) => (r.ok ? r.json() : null)),
    ]).then(([p, u]) => {
      if (p?.programs?.length) setPrograms(p.programs);
      if (u?.universities?.length) setUniversities(u.universities);
    }).catch(() => {});
  }, []);

  const filteredPrograms = useMemo(() => {
    let result = [...programs];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameCn.includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.descriptionCn.includes(q)
      );
    }

    // Filters
    if (degreeFilter) result = result.filter((p) => p.degree === degreeFilter);
    if (languageFilter) result = result.filter((p) => p.language === languageFilter);
    if (disciplineFilter) result = result.filter((p) => p.discipline === disciplineFilter);

    // Sort
    if (sortBy === 'tuition') {
      result.sort((a, b) => parseInt(a.tuition.replace(/[^\d]/g, '')) - parseInt(b.tuition.replace(/[^\d]/g, '')));
    }

    return result;
  }, [searchQuery, degreeFilter, languageFilter, disciplineFilter, sortBy, programs]);

  const totalPages = Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE);
  const paginatedPrograms = filteredPrograms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getUniversity = (slug: string) => universities.find((u) => u.slug === slug);

  const degreeColor = (degree: string) => {
    switch (degree) {
      case 'Bachelor': return 'bg-blue-50 text-blue-800';
      case 'Master': return 'bg-purple-50 text-purple-800';
      case 'PhD': return 'bg-amber-50 text-amber-800';
      default: return 'bg-gray-50 text-gray-800';
    }
  };

  const localDegrees = locale === 'zh' ? degreeTypesCn : degreeTypes;
  const localLanguages = locale === 'zh' ? languagesCn : languages;
  const localDisciplines = locale === 'zh' ? programDisciplinesCn : programDisciplines;

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
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{t('prog.title')}</h1>
          <p className="mt-3 text-lg text-gray-300 max-w-xl">{t('prog.subtitle')}</p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="bg-white border-b border-gray-200 py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder={t('prog.search')}
                className="w-full rounded-none border border-gray-200 bg-[#FAFAF8] py-2.5 pl-10 pr-4 text-sm focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={degreeFilter}
                onChange={(e) => { setDegreeFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
              >
                <option value="">{t('prog.allDegrees')}</option>
                {degreeTypes.map((d, i) => (
                  <option key={d} value={d}>{localDegrees[i]}</option>
                ))}
              </select>
              <select
                value={languageFilter}
                onChange={(e) => { setLanguageFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
              >
                <option value="">{t('prog.allLanguages')}</option>
                {languages.map((l, i) => (
                  <option key={l} value={l}>{localLanguages[i]}</option>
                ))}
              </select>
              <select
                value={disciplineFilter}
                onChange={(e) => { setDisciplineFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
              >
                <option value="">{t('prog.allDisciplines')}</option>
                {programDisciplines.map((d, i) => (
                  <option key={d} value={d}>{localDisciplines[i]}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-none border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#9B1B30] focus:outline-none"
              >
                <option value="popularity">{t('prog.popularity')}</option>
                <option value="tuition">{t('prog.tuition')}</option>
              </select>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            {filteredPrograms.length} {t('prog.results')}
          </p>
        </div>
      </section>

      {/* Program Cards Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {paginatedPrograms.length === 0 ? (
          <div className="py-20 text-center">
            <Filter className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">
              {locale === 'en' ? 'No programs found. Try adjusting your filters.' : '未找到项目，请调整筛选条件。'}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedPrograms.map((program) => {
              const uni = getUniversity(program.universitySlug);
              return (
                <Link
                  key={program.slug}
                  href={`/programs/${program.slug}`}
                  className="group border border-gray-200 bg-white transition-all duration-150 hover:border-[#9B1B30]/40 hover:shadow-lg"
                >
                  {/* Top colored bar */}
                  <div className="h-1.5 bg-[#9B1B30]" />

                  <div className="p-5">
                    {/* Degree badge + Language */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold ${degreeColor(program.degree)}`}>
                        {locale === 'zh'
                          ? degreeTypesCn[degreeTypes.indexOf(program.degree)]
                          : program.degree}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Globe className="h-3.5 w-3.5 text-[#1B2A4A]" />
                        {locale === 'zh'
                          ? languagesCn[languages.indexOf(program.language)]
                          : program.language}
                      </span>
                    </div>

                    {/* Program Name */}
                    <h3 className="text-base font-bold text-[#1B2A4A] leading-snug mb-1.5 group-hover:text-[#9B1B30] transition-colors">
                      {locale === 'zh' ? program.nameCn : program.name}
                    </h3>

                    {/* University */}
                    {uni && (
                      <p className="text-sm text-gray-500 mb-3">
                        {t('prog.at')} {locale === 'zh' ? uni.nameCn : uni.name}
                      </p>
                    )}

                    {/* Key Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-[#1B2A4A] shrink-0" />
                        <span>{locale === 'zh' ? program.durationCn : program.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Banknote className="h-4 w-4 text-[#1B2A4A] shrink-0" />
                        <span>{program.tuition}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <GraduationCap className="h-4 w-4 text-[#1B2A4A] shrink-0" />
                        <span>{locale === 'zh' ? program.intakeCn : program.intake}</span>
                      </div>
                    </div>

                    {/* Scholarship indicator */}
                    {program.scholarshipAvailable && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[#9B1B30] mb-3">
                        <Award className="h-3.5 w-3.5" />
                        {t('prog.scholarship')}
                      </div>
                    )}

                    {/* Divider + CTA */}
                    <div className="border-t border-gray-100 pt-3">
                      <span className="flex items-center gap-1 text-sm font-semibold text-[#9B1B30] group-hover:gap-2 transition-all">
                        {t('prog.viewDetails')}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-none border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 hover:border-[#9B1B30] hover:text-[#9B1B30] transition-colors"
            >
              &larr;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-none border px-3 py-2 text-sm transition-colors ${
                  currentPage === page
                    ? 'border-[#9B1B30] bg-[#9B1B30] text-white'
                    : 'border-gray-200 hover:border-[#9B1B30] hover:text-[#9B1B30]'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-none border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 hover:border-[#9B1B30] hover:text-[#9B1B30] transition-colors"
            >
              &rarr;
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

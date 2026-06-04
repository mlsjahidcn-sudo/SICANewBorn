'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { cities, citiesCn, disciplines, disciplinesCn, type University } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Star, MapPin, ChevronLeft, ChevronRight, ArrowRight, Globe, Award } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import UniversityLogo from '@/components/university-logo';

export default function UniversidadesPage() {
  const { t, locale } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [sortBy, setSortBy] = useState<'ranking' | 'name' | 'qsWorld'>('ranking');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;
  // Start empty — data is fetched on mount from the API (server-side, no client
  // bundle bloat from the 2300-line static fallback).
  const [universities, setUniversities] = useState<University[]>([]);

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

    if (sortBy === 'ranking') {
      result.sort((a, b) => a.ranking - b.ranking);
    } else if (sortBy === 'qsWorld') {
      result.sort((a, b) => a.qsWorldRanking - b.qsWorldRanking);
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [searchQuery, selectedCity, selectedDiscipline, sortBy, universities]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const cityList = locale === 'zh' ? citiesCn : cities;
  const disciplineList = locale === 'zh' ? disciplinesCn : disciplines;

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
        </div>
      </section>

      {/* Search & Filters */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('uni.search')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-10"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setCurrentPage(1);
              }}
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
              onChange={(e) => {
                setSelectedDiscipline(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-none border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
            >
              <option value="">{t('uni.allDisciplines')}</option>
              {disciplineList.map((disc, i) => (
                <option key={disciplines[i]} value={disciplines[i]}>
                  {disc}
                </option>
              ))}
            </select>
            <Button className="bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold h-10 px-6">
              {t('uni.searchBtn')}
            </Button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {filtered.length} {locale === 'en' ? 'universities found' : '所大学'}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'ranking' | 'name' | 'qsWorld')}
              className="text-sm text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="ranking">
                {t('uni.sortBy')}: {t('uni.ranking')}
              </option>
              <option value="qsWorld">
                {t('uni.sortBy')}: {t('uni.qsWorldRanking')}
              </option>
              <option value="name">
                {t('uni.sortBy')}: {t('uni.name')}
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* University Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {paginated.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((uni) => (
              <Link
                key={uni.slug}
                href={`/universities/${uni.slug}`}
                className="group rounded-none border border-gray-200 bg-white shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 hover:border-[#9B1B30]/30"
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
          <div className="text-center py-16">
            <p className="text-gray-500">
              {locale === 'en'
                ? 'No universities found matching your criteria.'
                : '没有找到符合条件的大学。'}
            </p>
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

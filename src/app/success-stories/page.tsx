'use client';

/**
 * /success-stories — Public Success Stories page.
 *
 * Phase 51: showcases SICA's admitted students via watermarked
 * images of real admission notices. Each card shows the
 * watermarked image (loaded directly from the public storage
 * URL — the file already has the watermark baked in, so any
 * browser download includes it).
 *
 * Layout:
 *   - Hero with heading + subhead + count
 *   - Filter chips: country, degree
 *   - Card grid: 1 col mobile, 2 col tablet, 3 col desktop
 *   - Lightbox: click a card to open the full image
 *   - Download button in lightbox (uses <a download> on the
 *     public storage URL — file has watermark baked in)
 *
 * The "real" proof of admission is the visible text content
 * of the notice (university name, student name, program,
 * scholarship). The card surfaces the metadata so visitors
 * can see the meta at a glance and click through to read
 * the full image.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, X, GraduationCap, MapPin, Award, Filter } from 'lucide-react';
import type { AdmissionDegree } from '@/lib/admission-notices/types';
import { ADMISSION_DEGREES } from '@/lib/admission-notices/types';

interface AdmissionNotice {
  id: string;
  studentName: string;
  universityName: string;
  program: string | null;
  degree: AdmissionDegree | null;
  intake: string | null;
  scholarship: string | null;
  country: string | null;
  imagePath: string;
  publicImageUrl: string | null;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
}

interface ApiResponse {
  notices: AdmissionNotice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

export default function SuccessStoriesPage() {
  const { t } = useI18n();
  const [notices, setNotices] = useState<AdmissionNotice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [degree, setDegree] = useState<AdmissionDegree | null>(null);
  const [lightbox, setLightbox] = useState<AdmissionNotice | null>(null);

  const fetchNotices = useCallback(
    async (pageNum: number, countryFilter: string | null, degreeFilter: AdmissionDegree | null, append: boolean) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('page', String(pageNum));
        params.set('limit', String(PAGE_SIZE));
        if (countryFilter) params.set('country', countryFilter);
        if (degreeFilter) params.set('degree', degreeFilter);
        const res = await fetch(`/api/admission-notices?${params.toString()}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Could not load success stories');
        }
        const data = (await res.json()) as ApiResponse;
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setNotices((prev) => (append ? [...prev, ...data.notices] : data.notices));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    setNotices([]);
    setPage(1);
    void fetchNotices(1, country, degree, false);
  }, [country, degree, fetchNotices]);

  // Build the filter dropdowns from the loaded data (no extra API call).
  const countryOptions = useMemo(() => {
    const set = new Set<string>();
    notices.forEach((n) => n.country && set.add(n.country));
    return Array.from(set).sort();
  }, [notices]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    void fetchNotices(next, country, degree, true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hero */}
      <section className="bg-[#1B2A4A] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-3 text-[#D4A853]">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm uppercase tracking-wider font-semibold">
              {t('successStories.eyebrow')}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {t('successStories.title')}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            {t('successStories.subtitle')}
          </p>
          {total > 0 && (
            <p className="text-sm text-white/60 mt-4">
              {t('successStories.countLabel', { count: total })}
            </p>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-[#1B2A4A]">
              <Filter className="h-4 w-4" />
              <span className="font-semibold">{t('successStories.filterLabel')}</span>
            </div>
            <select
              className="text-sm border border-gray-300 rounded-none px-3 py-1.5 bg-white"
              value={degree || ''}
              onChange={(e) => setDegree((e.target.value || null) as AdmissionDegree | null)}
            >
              <option value="">{t('successStories.filterAllDegrees')}</option>
              {ADMISSION_DEGREES.map((d) => (
                <option key={d} value={d}>
                  {t(`successStories.degree.${d}`)}
                </option>
              ))}
            </select>
            <select
              className="text-sm border border-gray-300 rounded-none px-3 py-1.5 bg-white"
              value={country || ''}
              onChange={(e) => setCountry(e.target.value || null)}
            >
              <option value="">{t('successStories.filterAllCountries')}</option>
              {countryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {(country || degree) && (
              <button
                onClick={() => { setCountry(null); setDegree(null); }}
                className="text-sm text-[#9B1B30] hover:underline"
              >
                {t('successStories.filterClear')}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 mb-6 rounded-none">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isLoading && notices.length === 0 ? (
          <div className="text-center py-12 text-[#4B5563]">{t('successStories.loading')}</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 text-[#4B5563]">
            <p>{t('successStories.empty')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {notices.map((n) => (
                <Card
                  key={n.id}
                  className="rounded-none border-[#1B2A4A]/10 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setLightbox(n)}
                >
                  <div className="relative aspect-[3/4] bg-gray-100">
                    {n.publicImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={n.publicImageUrl}
                        alt={`${n.studentName} — ${n.universityName}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        {t('successStories.noImage')}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-[#1B2A4A] text-sm leading-tight line-clamp-2">
                        {n.universityName}
                      </h3>
                      {n.degree && (
                        <Badge variant="outline" className="rounded-none text-[10px] flex-shrink-0 ml-2">
                          {t(`successStories.degree.${n.degree}`)}
                        </Badge>
                      )}
                    </div>
                    {n.program && (
                      <p className="text-xs text-[#4B5563] mb-2 line-clamp-1">{n.program}</p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#4B5563]">
                      {n.country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {n.country}
                        </span>
                      )}
                      {n.intake && <span>{n.intake}</span>}
                    </div>
                    {n.scholarship && (
                      <p className="text-[11px] text-[#9B1B30] mt-2 flex items-center gap-1 line-clamp-1">
                        <Award className="h-3 w-3 flex-shrink-0" /> {n.scholarship}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {page < totalPages && (
              <div className="text-center mt-10">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="rounded-none bg-[#1B2A4A] hover:bg-[#15243f] text-white"
                >
                  {isLoading ? t('successStories.loading') : t('successStories.loadMore')}
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="bg-white max-w-4xl w-full max-h-[90vh] overflow-auto rounded-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-bold text-[#1B2A4A]">{lightbox.universityName}</h2>
                <p className="text-sm text-[#4B5563]">{lightbox.studentName}</p>
              </div>
              <button
                onClick={() => setLightbox(null)}
                className="text-[#4B5563] hover:text-[#1B2A4A]"
                aria-label={t('successStories.close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              {lightbox.publicImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lightbox.publicImageUrl}
                  alt={`${lightbox.studentName} — ${lightbox.universityName}`}
                  className="w-full h-auto"
                />
              ) : (
                <div className="text-center py-12 text-gray-400">
                  {t('successStories.noImage')}
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {lightbox.program && (
                  <div>
                    <p className="text-[#4B5563] text-xs">{t('successStories.fieldProgram')}</p>
                    <p className="text-[#1B2A4A] font-semibold">{lightbox.program}</p>
                  </div>
                )}
                {lightbox.degree && (
                  <div>
                    <p className="text-[#4B5563] text-xs">{t('successStories.fieldDegree')}</p>
                    <p className="text-[#1B2A4A] font-semibold">
                      {t(`successStories.degree.${lightbox.degree}`)}
                    </p>
                  </div>
                )}
                {lightbox.intake && (
                  <div>
                    <p className="text-[#4B5563] text-xs">{t('successStories.fieldIntake')}</p>
                    <p className="text-[#1B2A4A] font-semibold">{lightbox.intake}</p>
                  </div>
                )}
                {lightbox.country && (
                  <div>
                    <p className="text-[#4B5563] text-xs">{t('successStories.fieldCountry')}</p>
                    <p className="text-[#1B2A4A] font-semibold">{lightbox.country}</p>
                  </div>
                )}
                {lightbox.scholarship && (
                  <div className="col-span-2">
                    <p className="text-[#4B5563] text-xs">{t('successStories.fieldScholarship')}</p>
                    <p className="text-[#1B2A4A] font-semibold">{lightbox.scholarship}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t flex gap-3 sticky bottom-0 bg-white">
              {lightbox.publicImageUrl && (
                <a
                  href={lightbox.publicImageUrl}
                  download={`SICA-success-${lightbox.universityName.replace(/\s+/g, '-')}.jpg`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#9B1B30] text-white text-sm font-semibold hover:bg-[#7a1626] rounded-none"
                >
                  <Download className="h-4 w-4" />
                  {t('successStories.download')}
                </a>
              )}
              <Button
                variant="outline"
                onClick={() => setLightbox(null)}
                className="rounded-none"
              >
                {t('successStories.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

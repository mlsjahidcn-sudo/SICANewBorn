'use client';

/**
 * AdmissionCards — sales-page rendering of admission notice
 * images. Smaller subset than /success-stories: just the image
 * grid + lightbox. No filters, no "Load more" — the page
 * wrapper (page.tsx) pre-fetches the top 6 by display_order
 * server-side and passes them in.
 *
 * Reuses the data shape from src/lib/admission-notices/types.ts
 * (the same shape /success-stories consumes). The image is
 * served from the public/ folder in the Supabase Storage
 * bucket — we render a public URL the same way the home-page
 * Success Stories block does.
 */

import { useState } from 'react';
import { X, GraduationCap, MapPin, Calendar, Award } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import type { AdmissionNotice } from '@/lib/admission-notices/types';

interface AdmissionCardsProps {
  initialNotices: AdmissionNotice[];
}

export function AdmissionCards({ initialNotices }: AdmissionCardsProps) {
  const { t } = useI18n();
  const [lightboxNotice, setLightboxNotice] = useState<AdmissionNotice | null>(null);

  if (initialNotices.length === 0) {
    return (
      <p className="text-center text-[#4B5563] py-8">{t('sales.noticesEmpty')}</p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialNotices.slice(0, 6).map((n) => (
          <button
            key={n.id}
            onClick={() => setLightboxNotice(n)}
            className="text-left bg-white border border-gray-200 hover:border-[#1B2A4A] transition-colors group"
          >
            <div className="relative aspect-[3/4] bg-[#F3F4F6] overflow-hidden">
              {n.imagePath ? (
                <img
                  src={n.imagePath}
                  alt={`${n.studentName} — ${n.universityName}`}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#4B5563]">
                  <GraduationCap className="w-12 h-12" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-[#1B2A4A] text-sm line-clamp-1">{n.studentName}</h3>
              <p className="text-xs text-[#4B5563] mt-1 line-clamp-1">{n.universityName}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-[#4B5563]">
                <span className="flex items-center gap-0.5">
                  <GraduationCap className="w-3 h-3" />
                  {n.degree}
                </span>
                {n.intake && (
                  <span className="flex items-center gap-0.5">
                    <Calendar className="w-3 h-3" />
                    {n.intake}
                  </span>
                )}
                {n.country && (
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    {n.country}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      {lightboxNotice && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxNotice(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setLightboxNotice(null)}
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxNotice.imagePath && (
              <img
                src={lightboxNotice.imagePath}
                alt={lightboxNotice.studentName}
                className="w-full max-h-[80vh] object-contain bg-white"
              />
            )}
            <div className="bg-white p-4 text-sm">
              <h3 className="font-bold text-[#1B2A4A] mb-2">{lightboxNotice.studentName}</h3>
              <div className="grid grid-cols-2 gap-2 text-[#4B5563]">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">
                    University
                  </span>
                  <p className="text-[#1F2937]">{lightboxNotice.universityName}</p>
                </div>
                {lightboxNotice.program && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">
                      Program
                    </span>
                    <p className="text-[#1F2937]">{lightboxNotice.program}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#9CA3AF]">Degree</span>
                  <p className="text-[#1F2937]">{lightboxNotice.degree}</p>
                </div>
                {lightboxNotice.intake && (
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#9CA3AF]">Intake</span>
                    <p className="text-[#1F2937]">{lightboxNotice.intake}</p>
                  </div>
                )}
                {lightboxNotice.scholarship && (
                  <div className="col-span-2">
                    <span className="text-xs uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Scholarship
                    </span>
                    <p className="text-[#1F2937]">{lightboxNotice.scholarship}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

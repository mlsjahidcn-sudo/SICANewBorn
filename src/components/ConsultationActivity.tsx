'use client';

import Image from 'next/image';
import { Video as VideoIcon, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

/**
 * ConsultationActivity — "live activity in progress" social proof.
 *
 * Renders two real screenshots from recent SICA consultation calls
 * (Carlos De Avila Bravo onboarding + deep-dive sessions, Oct 2026)
 * as static image cards with captions. No video, no playback — the
 * point is to show the visitor that SICA is running real 1:1 video
 * calls this week, not just templated outreach.
 *
 * Mounted on:
 *   - /counselling (the consultation page) — full-width section
 *     between "how it works" and the booking wizard
 *   - / (homepage) — compact 2-image strip at the end of the
 *     social-proof section so it doesn't push LCP
 *
 * Why native images (not `<video>` or animated):
 *   - The images carry enough proof: a real video call in progress
 *     with names + faces visible. Animation would add weight + risk.
 *   - Static images load instantly with `next/image` priority hints
 *     on the consultation page, lazy on the homepage.
 *   - The two JPGs are 460KB + 580KB (resized from 3600×2096 to
 *     1600×931 / 815). Next/image re-encodes to AVIF/WebP on the
 *     fly at the requested `sizes` — actual payload drops ~70%.
 *
 * Why a single component used on both pages (instead of two):
 *   - The styling is identical (card + caption + verification
 *     badge). `variant: 'compact' | 'full'` swaps the heading +
 *     subtitle + grid sizing — no copy-paste duplication.
 *   - When more activity shots land, add a new entry to
 *     CONSULTATIONS + drop one i18n pair. One file.
 */

interface ConsultationShot {
  id: 'onboarding' | 'deep-dive';
  /** Alt text + caption key — single string, surfaced in alt and card. */
  captionKey:
    | 'consultationActivity.onboardingCaption'
    | 'consultationActivity.deepDiveCaption';
  /** Display the date the call happened, for the "live activity" trust signal. */
  date: string;
  /** Resized JPG in /public/consultation/. */
  src: string;
  /** 1600x{height} source — preserved so next/image can compute sizes. */
  width: number;
  height: number;
  /** Person initials overlay on the bottom-right card (2-3 letters). */
  initials: string;
  /** Person full name (caption shows this). */
  personName: string;
}

const CONSULTATIONS: ConsultationShot[] = [
  {
    id: 'onboarding',
    captionKey: 'consultationActivity.onboardingCaption',
    date: '2026-10-09',
    src: '/consultation/carlos-onboarding-session.jpg',
    width: 1600,
    height: 931,
    initials: 'CD',
    personName: 'Carlos De Avila Bravo',
  },
  {
    id: 'deep-dive',
    captionKey: 'consultationActivity.deepDiveCaption',
    date: '2026-10-13',
    src: '/consultation/carlos-deep-dive-session.jpg',
    width: 1600,
    height: 815,
    initials: 'JA',
    personName: 'Jahid Abdullah',
  },
];

export interface ConsultationActivityProps {
  /** `full` (consultation page) shows eyebrow + section title + 2-up grid.
   *  `compact` (homepage) hides the header and uses a tighter grid. */
  variant?: 'full' | 'compact';
}

export function ConsultationActivity({
  variant = 'full',
}: ConsultationActivityProps) {
  const { t } = useI18n();
  const isFull = variant === 'full';

  return (
    <section
      aria-label={t('consultationActivity.eyebrow')}
      className={
        isFull
          ? 'bg-[#FAFAF8] border-y border-gray-200 py-14 lg:py-20'
          : 'bg-white border-t border-gray-200 py-12 lg:py-16'
      }
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {isFull && (
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9B1B30] mb-3">
              <Sparkles className="h-4 w-4" />
              {t('consultationActivity.eyebrow')}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B2A4A]">
              {t('consultationActivity.title')}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#4B5563] leading-relaxed">
              {t('consultationActivity.subtitle')}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#1B2A4A] bg-white border border-gray-200 px-3 py-1.5">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#D4A853] text-white">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.42 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              {t('consultationActivity.statsBadge')}
            </div>
          </div>
        )}

        <div
          className={
            isFull
              ? 'mt-10 grid md:grid-cols-2 gap-6 lg:gap-8'
              : 'mt-6 grid sm:grid-cols-2 gap-4'
          }
        >
          {CONSULTATIONS.map((shot) => (
            <ConsultationCard
              key={shot.id}
              shot={shot}
              compact={!isFull}
              caption={t(shot.captionKey)}
              personName={shot.personName}
              initials={shot.initials}
              eyebrowText={t('consultationActivity.cardEyebrow')}
              dateLabel={t('consultationActivity.dateLabel', { date: shot.date })}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * One activity card. Renders the screenshot as `next/image` (responsive
 * + lazy after the first card) with a gradient overlay at the bottom
 * for the caption + initials badge + date. The whole card is wrapped
 * in a `<figure>` so screen readers announce it as a captioned image.
 */
function ConsultationCard({
  shot,
  compact,
  caption,
  personName,
  initials,
  eyebrowText,
  dateLabel,
}: {
  shot: ConsultationShot;
  compact: boolean;
  caption: string;
  personName: string;
  initials: string;
  eyebrowText: string;
  dateLabel: string;
}) {
  // 16:9 aspect for both cards (matches the resized JPGs at 1600×931
  // and 1600×815 after cropping). Cards stretch to the same height via
  // the parent grid; the caption area below the image always lands at
  // the same Y across the row.
  const aspectClass = 'aspect-[16/9]';

  return (
    <figure
      className={
        compact
          ? 'group relative bg-white border border-gray-200 hover:border-[#9B1B30] transition-all duration-200 hover:shadow-md'
          : 'group relative bg-white border border-gray-200 hover:border-[#9B1B30] transition-all duration-200 hover:shadow-lg'
      }
    >
      <div className={`relative w-full overflow-hidden bg-black ${aspectClass}`}>
        <Image
          src={shot.src}
          alt={`${personName} — ${caption}`}
          fill
          sizes={
            compact
              ? '(max-width: 640px) 100vw, 50vw'
              : '(max-width: 768px) 100vw, 50vw'
          }
          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          priority={!compact}
        />

        {/* Bottom gradient — keeps the date + initials badge legible
            against any screenshot content. Stronger on the bottom-left
            where both pills sit. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/15 pointer-events-none" />

        {/* Live badge — top-left. Small gold pill on a dark scrim so
            visitors immediately read "this happened recently". */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
          <VideoIcon className="h-3 w-3 text-[#D4A853]" />
          {eyebrowText}
        </span>

        {/* Initials badge — bottom-right. Anchors the screenshot to a
            real person + their initials. Sits over the gradient so
            it's legible regardless of screenshot content. */}
        <span className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#9B1B30] text-white text-sm font-bold ring-2 ring-white/40">
          {initials}
        </span>
      </div>

      <figcaption className={compact ? 'p-3' : 'p-5 sm:p-6'}>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p
              className={
                compact
                  ? 'text-xs text-[#4B5563] leading-snug'
                  : 'text-sm text-[#4B5563] leading-relaxed'
              }
            >
              {caption}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.15em] font-semibold text-[#1B2A4A]/60">
              {dateLabel}
            </p>
          </div>
        </div>
      </figcaption>
    </figure>
  );
}

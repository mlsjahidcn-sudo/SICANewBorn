import Image from 'next/image';
import { Video as VideoIcon, Sparkles } from 'lucide-react';
import { getServerT } from '@/lib/server-t';
import { getActiveConsultationShots } from '@/lib/consultation-activity';
import type { Locale } from '@/lib/i18n-translations';
import { cookies } from 'next/headers';
import { ConsultationActivityCarousel } from '@/components/ConsultationActivityCarousel';

/**
 * ConsultationActivity — admin-managed "live activity in progress"
 * social proof section.
 *
 * Phase 160: now server-rendered. Reads the active shot list from
 * the `consultation_activity_shots` table via getActiveConsultationShots
 * (which signs the storage URLs with a 24h expiry). The list is
 * rendered in `display_order ASC` order; rows where `is_active=false`
 * are filtered out before signing. Renders nothing when there are 0
 * active shots — the consultation page + homepage just omit the
 * section rather than showing an empty grid.
 *
 * Mounted on:
 *   - /counselling (the consultation page) — full-width section
 *     between "how it works" and the booking wizard
 *   - / (homepage) — compact auto-advancing carousel
 *
 * The whole point of moving this out of a hardcoded array (Phase 158
 * mistake) is so admins can upload + caption + toggle shots without
 * shipping code. Schema in `database/2026-10-12_consultation_activity.sql`,
 * admin CRUD at /admin/consultation-activity (Phase 160), storage
 * bucket policy at `consultation/<shotId>/<filename>`.
 */

export interface ConsultationActivityProps {
  /** `full` (consultation page) shows eyebrow + section title + 2-up grid.
   *  `compact` (homepage) shows a small auto-advancing carousel. */
  variant?: 'full' | 'compact';
}

export async function ConsultationActivity({
  variant = 'full',
}: ConsultationActivityProps) {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const t = await getServerT();
  const isFull = variant === 'full';

  const shots = await getActiveConsultationShots(locale);

  // No active shots — hide the section rather than show an empty
  // grid. Both the consultation page + the homepage render this
  // component; either can decide to expose it or not, but the
  // component itself stays the same.
  if (shots.length === 0) return null;

  if (!isFull) {
    return (
      <ConsultationActivityCarousel
        shots={shots}
        labels={{
          eyebrow: t('consultationActivity.compactEyebrow'),
          title: t('consultationActivity.compactTitle'),
          book: t('consultationCta.ctaPrimary'),
          session: t('consultationActivity.sessionType'),
          previous: t('consultationActivity.previous'),
          next: t('consultationActivity.next'),
          pause: t('consultationActivity.pause'),
          play: t('consultationActivity.play'),
        }}
      />
    );
  }

  const eyebrowText = t('consultationActivity.eyebrow');
  const title = t('consultationActivity.title');
  const subtitle = t('consultationActivity.subtitle');
  const statsBadge = t('consultationActivity.statsBadge');
  const cardEyebrow = t('consultationActivity.cardEyebrow');
  const dateLabelTemplate = t('consultationActivity.dateLabel');

  return (
    <section
      aria-label={eyebrowText}
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
              {eyebrowText}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B2A4A]">
              {title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#4B5563] leading-relaxed">
              {subtitle}
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
              {statsBadge}
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
          {shots.map((shot) => (
            <ConsultationCard
              key={shot.id}
              shot={shot}
              compact={!isFull}
              caption={shot.caption}
              personName={shot.personName}
              initials={shot.initials}
              eyebrowText={cardEyebrow}
              // dateLabel uses the {{date}} placeholder; we pass the
              // server-formatted shot date (YYYY-MM-DD or null).
              dateLabel={
                shot.shotDate
                  ? dateLabelTemplate.replace('{{date}}', shot.shotDate)
                  : null
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ResolvedShot {
  id: string;
  /** Signed URL from `createSignedReadUrl(shot.imageUrl, 24 * 3600)`. */
  imageSrc: string;
  caption: string;
  personName: string;
  initials: string;
  shotDate: string | null;
}

/**
 * One activity card. Renders the screenshot as `next/image`
 * (responsive + lazy after the first card) with a gradient overlay
 * at the bottom for the date + initials badge, a "Live" pill at
 * top-left, and a caption below. `figure` + `figcaption` keep the
 * markup accessible to screen readers.
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
  shot: ResolvedShot;
  compact: boolean;
  caption: string;
  personName: string;
  initials: string;
  eyebrowText: string;
  dateLabel: string | null;
}) {
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
          src={shot.imageSrc}
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/15 pointer-events-none" />

        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
          <VideoIcon className="h-3 w-3 text-[#D4A853]" />
          {eyebrowText}
        </span>

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
            {dateLabel && (
              <p className="mt-2 text-[11px] uppercase tracking-[0.15em] font-semibold text-[#1B2A4A]/60">
                {dateLabel}
              </p>
            )}
          </div>
        </div>
      </figcaption>
    </figure>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Play, X, Video as VideoIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { track } from '@/lib/analytics';

/**
 * VideoTestimonials — student review videos for the SICA
 * Admission service. Mounted on the home page (full-width
 * hero-style section) AND on every university detail page
 * (same shape, with a university-context eyebrow + subtitle).
 *
 * Design:
 * - Two video cards side-by-side on lg+, stacked on mobile.
 * - Each card shows a poster image (instant load, ~50–260KB
 *   each — total under 310KB) with a play-button overlay.
 * - Click → opens a fixed fullscreen modal with the actual
 *   `<video controls autoplay>`. The video uses
 *   `preload="none"` so the 25MB of MP4 payload only loads
 *   when the user opts in. Modal traps ESC + backdrop click
 *   to close. Body scroll is locked while the modal is open.
 * - Videos are tracked via the existing analytics helper:
 *   `video_play` event with `videoId` + `location`. Keeps
 *   the GA schema consistent with the other SICA events.
 *
 * Why native `<video controls>` (no custom player):
 * - i18n has zero audio tracks — no caption toggle complexity.
 * - Native controls are keyboard-accessible by default and
 *   look identical on every browser.
 * - Avoids shipping a 30KB player library for two videos.
 *
 * Why modal (not inline autoplay):
 * - Autoplay videos on every university page would tank the
 *   Largest Contentful Paint. Mobile browsers also block
 *   autoplay-with-sound anyway. The poster+click pattern
 *   keeps perceived load fast and respects user intent.
 */
export interface VideoTestimonialsProps {
  /**
   * Optional university name. When provided, the section
   * eyebrow + subtitle swap to a university-specific copy so
   * the trust signal reads as "students who applied to THIS
   * university" rather than generic social proof.
   */
  universityName?: string;
  /**
   * Where this section is mounted — used in GA tracking and
   * aria-label so screen readers + analytics know whether
   * the play came from the home page or a specific
   * university detail page.
   */
  location?: 'home' | 'university';
  /**
   * Visual variant. `compact` is reserved for future use
   * (e.g. embedding in a sidebar); today both surfaces use
   * the full-width layout.
   */
  variant?: 'full' | 'compact';
}

interface VideoCard {
  id: 'review-1' | 'review-2' | 'review-3';
  titleKey: string;
  descriptionKey: string;
  poster: string;
  src: string;
  /** Display duration in seconds (rounded). */
  durationSec: number;
  /** Whether the source video is portrait or landscape — drives poster aspect. */
  aspect: 'portrait' | 'landscape';
}

const VIDEOS: VideoCard[] = [
  {
    id: 'review-1',
    titleKey: 'videoTestimonials.review1.title',
    descriptionKey: 'videoTestimonials.review1.description',
    poster: '/videos/review-1-poster.jpg',
    src: '/videos/review-1.mp4',
    durationSec: 53,
    aspect: 'portrait',
  },
  {
    id: 'review-2',
    titleKey: 'videoTestimonials.review2.title',
    descriptionKey: 'videoTestimonials.review2.description',
    poster: '/videos/review-2-poster.jpg',
    src: '/videos/review-2-720p.mp4',
    durationSec: 48,
    aspect: 'landscape',
  },
  {
    id: 'review-3',
    titleKey: 'videoTestimonials.review3.title',
    descriptionKey: 'videoTestimonials.review3.description',
    poster: '/videos/review-3-poster.jpg',
    src: '/videos/review-3.mp4',
    durationSec: 80,
    aspect: 'landscape',
  },
];

export function VideoTestimonials({
  universityName,
  location = 'home',
  variant = 'full',
}: VideoTestimonialsProps) {
  const { t, locale } = useI18n();
  const [openVideo, setOpenVideo] = useState<VideoCard | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // Section title + subtitle swap based on whether this is the
  // home page (generic) or a university page (contextualized).
  const sectionTitle = universityName
    ? t('videoTestimonials.universityContext', { university: universityName })
    : t('videoTestimonials.title');
  const sectionSubtitle = universityName
    ? t('videoTestimonials.universityContextDesc', { university: universityName })
    : t('videoTestimonials.subtitle');
  const eyebrowText = t('videoTestimonials.eyebrow');

  const close = useCallback(() => {
    setOpenVideo(null);
  }, []);

  // ESC + scroll lock + focus restoration. Effect re-runs when
  // `openVideo` flips so cleanup runs on close.
  useEffect(() => {
    if (!openVideo) return;

    // Remember what had focus so we can restore it on close.
    lastFocusedRef.current = document.activeElement as HTMLElement | null;

    // Lock body scroll while the modal is open. Saving the
    // previous overflow value lets us restore it cleanly even
    // if the body was already in a non-default state.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    }
    document.addEventListener('keydown', onKey);

    // Move focus into the dialog so keyboard users land inside.
    // requestAnimationFrame avoids fighting React's render cycle.
    const raf = requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(raf);
      // Restore focus to whatever was focused before the modal
      // opened (the play button they clicked, usually).
      lastFocusedRef.current?.focus?.();
    };
  }, [openVideo, close]);

  function handlePlay(video: VideoCard) {
    track('video_play', {
      videoId: video.id,
      location,
      locale,
      universitySlug: universityName ?? null,
    });
    setOpenVideo(video);
  }

  const isCompact = variant === 'compact';

  return (
    <>
      <section
        aria-label={eyebrowText}
        className={
          isCompact
            ? 'bg-white border-t border-gray-200 py-10'
            : 'bg-[#FAFAF8] border-y border-gray-200 py-16 lg:py-20'
        }
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header — only on full variant. Compact mode is meant
              to drop into a parent that already has its own header. */}
          {!isCompact && (
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9B1B30] mb-3">
                <VideoIcon className="h-4 w-4" />
                {eyebrowText}
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B2A4A]">
                {sectionTitle}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#4B5563] leading-relaxed">
                {sectionSubtitle}
              </p>
              {/* Stats badge — a single trust strip with a small
                  verified-check icon. Sits between the subtitle
                  and the cards so the reader's eye catches the
                  "real students" claim before the visual proof. */}
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
                {t('videoTestimonials.statsBadge')}
              </div>
            </div>
          )}

          <div
            className={
              isCompact
                ? 'mt-0 grid sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch'
            }
          >
            {VIDEOS.map((video) => (
              <VideoCardButton
                key={video.id}
                video={video}
                onPlay={() => handlePlay(video)}
                compact={isCompact}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modal — only mounted when a video is open. Native
          <video controls> handles play/pause/seek/volume/fullscreen
          with zero JS. We `autoPlay` once on open; the native
          pause button stops it. The element is fully unmounted on
          close, so the video buffer is freed back to the browser. */}
      {openVideo && (
        <VideoModal
          video={openVideo}
          onClose={close}
          dialogRef={dialogRef}
        />
      )}
    </>
  );
}

/**
 * One clickable video card. Renders the poster as a `<Image>`
 * (responsive + lazy after the first card) plus a centred play
 * button. The whole card is a button so keyboard users can
 * Tab + Enter to open the modal.
 *
 * Uses `unoptimized` because:
 *   1. The posters are pre-encoded JPEGs at the right size —
 *      Next's image optimizer would re-encode them into AVIF
 *      and lose subtle poster detail without measurable win.
 *   2. Matches the QR code fix from earlier today (unoptimized
 *      sharp-edged assets should never go through the optimizer).
 */
function VideoCardButton({
  video,
  onPlay,
  compact,
}: {
  video: VideoCard;
  onPlay: () => void;
  compact: boolean;
}) {
  const { t } = useI18n();
  const title = t(video.titleKey);
  const description = t(video.descriptionKey);

  // Uniform 3:4 aspect for both cards. The two source posters
  // are different shapes (Telia is 9:16 portrait, the campus
  // video is 16:9 landscape), so forcing both into the same
  // 3:4 container with `object-cover` keeps the cards the same
  // size and avoids the lopsided feel of one card stretching
  // taller than the other. The crop is gentle on both:
  //   - Telia (9:16 source → 3:4 target): trims the side
  //     margins, keeps her full vertical (talking head stays
  //     recognizable).
  //   - Campus (16:9 source → 3:4 target): trims the top/bottom
  //     margins (sky + pavement), keeps the student centered
  //     (still recognizable as a person on campus).
  // The `object-position` keeps the subject in frame for each
  // card even after the crop. Cards are stretched to the same
  // height via the parent grid's `items-stretch` so the title
  // + description area below the poster lines up across the row.
  const aspectClass = compact ? 'aspect-[3/4]' : 'aspect-[3/4] sm:aspect-[3/4]';
  const objectPosition =
    video.id === 'review-2'
      ? 'object-[center_35%]'
      : video.id === 'review-3'
        ? 'object-center'
        : 'object-center';

  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`${t('videoTestimonials.playLabel')}: ${title}`}
      className="group relative flex h-full w-full flex-col bg-white border border-gray-200 hover:border-[#9B1B30] transition-all duration-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9B1B30] focus-visible:ring-offset-2"
    >
      <div className={`relative w-full overflow-hidden bg-black ${aspectClass}`}>
        <Image
          src={video.poster}
          alt={title}
          fill
          sizes={compact ? '(max-width: 640px) 100vw, 50vw' : '(max-width: 768px) 100vw, 50vw'}
          className={`${objectPosition} object-cover group-hover:scale-[1.03] transition-transform duration-500`}
          unoptimized
          priority={!compact}
        />

        {/* Bottom gradient — keeps duration badge + verified
            pill legible against any poster content. Stronger on
            the bottom-left because that's where both badges sit. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/15 pointer-events-none" />

        {/* Verified badge — top-left. Small gold pill on a dark
            scrim says "SICA Student" so the reader knows these
            are SICA-vouched testimonials, not stock footage.
            Positioned above the play button (which is centred)
            and the duration badge (top-right). */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-[#D4A853]">
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.42 0z"
              clipRule="evenodd"
            />
          </svg>
          {t('videoTestimonials.verifiedBadge')}
        </span>

        {/* Duration badge — top-right. Mirror of the verified
            badge on the opposite side so the poster corners
            visually balance. */}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
          <VideoIcon className="h-3 w-3" />
          {Math.round(video.durationSec)} {t('videoTestimonials.durationSec')}
        </span>

        {/* Play button — centred. Triangle icon inside a crimson
            circle with white ring. Slight scale-up on group-hover
            for an obvious affordance. The ring+shadow keep it
            legible against any poster content. */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="relative inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#9B1B30] text-white shadow-2xl ring-4 ring-white/40 group-hover:scale-110 group-hover:bg-[#7A1526] transition-all duration-200">
            <Play className="h-7 w-7 sm:h-8 sm:w-8 fill-white ml-1" aria-hidden />
          </span>
        </div>
      </div>

      {/* Content area — `flex-1` so this block fills whatever
          vertical space is left in the card. The grid parent
          sets `items-stretch` so both cards have the same outer
          height; this content area always reaches the bottom
          of the card, so the CTA link is always at the same
          Y-position across both cards. */}
      <div className={`flex flex-1 flex-col ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
        <h3
          className={
            compact
              ? 'text-sm font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors line-clamp-2'
              : 'text-base sm:text-lg font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors line-clamp-2'
          }
        >
          {title}
        </h3>
        <p
          className={
            compact
              ? 'mt-1.5 text-xs text-gray-600 leading-relaxed line-clamp-3'
              : 'mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3'
          }
        >
          {description}
        </p>

        {/* "Watch the story →" CTA — pushed to the bottom of
            the card with `mt-auto` so it sits flush at the
            same Y across both cards regardless of how long
            the description is. Doubles as a hover affordance
            in addition to the play button. */}
        <span
          className={
            compact
              ? 'mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] group-hover:underline'
              : 'mt-auto pt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#9B1B30] group-hover:underline'
          }
        >
          {t('videoTestimonials.watchCta')}
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5">
            <path
              fillRule="evenodd"
              d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    </button>
  );
}

/**
 * Fullscreen modal. Backdrop click closes (but clicks inside
 * the dialog itself don't, otherwise the video controls would
 * be unclickable). ESC is handled by the parent's keydown
 * listener.
 *
 * `role="dialog"` + `aria-modal="true"` + `aria-label` make it
 * announce correctly to screen readers. `tabIndex={-1}` +
 * manual focus in the parent effect lets keyboard users enter
 * the dialog.
 */
function VideoModal({
  video,
  onClose,
  dialogRef,
}: {
  video: VideoCard;
  onClose: () => void;
  dialogRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { t } = useI18n();
  const title = t(video.titleKey);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        // Backdrop click closes; clicks inside the dialog do not.
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative w-full max-w-4xl bg-black shadow-2xl outline-none"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Close button — top-right, sits over the video. White
            pill on dark backdrop so it's visible against any
            frame. ESC keyboard shortcut also works. */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t('videoTestimonials.closeAria')}
          className="absolute -top-2 -right-2 sm:top-3 sm:right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1B2A4A] hover:bg-gray-100 shadow-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9B1B30] focus-visible:ring-offset-2"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        <video
          src={video.src}
          poster={video.poster}
          controls
          autoPlay
          playsInline
          preload="auto"
          className="w-full h-auto max-h-[calc(100vh-4rem)] bg-black"
          // Pre-load is "auto" here (not "none") because the
          // user has explicitly opted in by clicking the
          // poster. Stream starts immediately on open.
        >
          {t('videoTestimonials.playLabel')}
        </video>
      </div>
    </div>
  );
}
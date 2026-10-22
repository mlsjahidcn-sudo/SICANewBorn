'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight, Pause, Play, Video } from 'lucide-react';
import type { ResolvedConsultationShot } from '@/lib/consultation-activity';

interface CarouselLabels {
  eyebrow: string;
  title: string;
  book: string;
  session: string;
  previous: string;
  next: string;
  pause: string;
  play: string;
}

interface ConsultationActivityCarouselProps {
  shots: ResolvedConsultationShot[];
  labels: CarouselLabels;
}

const CONTROL_CLASS = 'inline-flex size-9 shrink-0 items-center justify-center rounded-none border border-[#1B2A4A]/15 bg-white text-[#1B2A4A] transition-colors hover:border-[#1B2A4A] hover:bg-[#1B2A4A]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1B30] disabled:cursor-default disabled:opacity-35';

export function ConsultationActivityCarousel({
  shots,
  labels,
}: ConsultationActivityCarouselProps): React.JSX.Element | null {
  const id = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const [viewportRef, api] = useEmblaCarousel({ align: 'start', loop: true, duration: 35 });
  const [selected, setSelected] = useState(0);
  const [scrollable, setScrollable] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [motionAllowed, setMotionAllowed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = (): void => setMotionAllowed(!preference.matches);
    const updateVisibility = (): void => setPageVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    preference.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      preference.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!api) return;
    const update = (): void => {
      setSelected(api.selectedScrollSnap());
      setScrollable(api.canScrollNext() || api.canScrollPrev());
    };
    const startDrag = (): void => setDragging(true);
    const stopDrag = (): void => setDragging(false);
    update();
    api.on('select', update).on('reInit', update).on('pointerDown', startDrag).on('pointerUp', stopDrag);
    return () => {
      api.off('select', update).off('reInit', update).off('pointerDown', startDrag).off('pointerUp', stopDrag);
    };
  }, [api]);

  useEffect(() => {
    if (!api || !scrollable || paused || hovered || dragging || !inView || !pageVisible || !motionAllowed) return;
    const timer = window.setTimeout(() => {
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [api, selected, scrollable, paused, hovered, dragging, inView, pageVisible, motionAllowed]);

  if (shots.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="home-consultations"
      aria-labelledby={`${id}-title`}
      aria-roledescription="carousel"
      className="border-t border-gray-200 bg-[#FAFAF8] py-9 sm:py-11"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={(event) => {
        // Keyboard browsing stops rotation until the visitor chooses Play.
        if (event.target.matches(':focus-visible')) setPaused(true);
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9B1B30]">
              <Video aria-hidden="true" className="size-3.5 text-[#1B2A4A]" />
              {labels.eyebrow}
            </p>
            <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight text-[#1B2A4A] sm:text-2xl">
              {labels.title}
            </h2>
          </div>
          <div className="flex items-center justify-between gap-5 sm:justify-end">
            <Link href="/counselling" className="inline-flex items-center gap-2 text-xs font-semibold text-[#1B2A4A] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B1B30]">
              {labels.book}
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
            {shots.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span aria-live="off" className="mr-2 min-w-10 text-[11px] tabular-nums text-gray-500">
                  {String(selected + 1).padStart(2, '0')} / {String(shots.length).padStart(2, '0')}
                </span>
                {motionAllowed && (
                  <button type="button" aria-label={paused ? labels.play : labels.pause} aria-controls={`${id}-viewport`} className={CONTROL_CLASS} disabled={!scrollable} onClick={() => setPaused(!paused)}>
                    {paused ? <Play aria-hidden="true" className="size-3.5" /> : <Pause aria-hidden="true" className="size-3.5" />}
                  </button>
                )}
                <button type="button" aria-label={labels.previous} aria-controls={`${id}-viewport`} className={CONTROL_CLASS} disabled={!scrollable} onClick={() => api?.scrollPrev(!motionAllowed)}>
                  <ArrowLeft aria-hidden="true" className="size-4" />
                </button>
                <button type="button" aria-label={labels.next} aria-controls={`${id}-viewport`} className={CONTROL_CLASS} disabled={!scrollable} onClick={() => api?.scrollNext(!motionAllowed)}>
                  <ArrowRight aria-hidden="true" className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          id={`${id}-viewport`}
          ref={viewportRef}
          tabIndex={0}
          role="group"
          aria-label={labels.eyebrow}
          className="overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B1B30]"
          onKeyDown={(event) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();
            setPaused(true);
            if (event.key === 'ArrowLeft') api?.scrollPrev(!motionAllowed);
            else api?.scrollNext(!motionAllowed);
          }}
        >
          <div className="-ml-3 flex touch-pan-y">
            {shots.map((shot, index) => (
              <div key={shot.id} role="group" aria-roledescription="slide" aria-label={`${index + 1} / ${shots.length}`} className="min-w-0 shrink-0 grow-0 basis-[78%] pl-3 sm:basis-[45%] md:basis-1/3 lg:basis-1/4">
                <figure className="overflow-hidden rounded-none border border-[#1B2A4A]/15 bg-white">
                  <div className="relative aspect-video bg-[#14171D]">
                    <Image src={shot.imageSrc} alt={shot.caption} fill sizes="(max-width: 639px) 78vw, (max-width: 767px) 45vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 295px" className="object-contain" />
                  </div>
                  <figcaption className="px-3 py-2.5">
                    <p className="truncate text-xs font-semibold text-[#1B2A4A]" title={shot.personName}>{shot.personName}</p>
                    <p className="mt-1 text-[10px] text-gray-500">{labels.session}</p>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

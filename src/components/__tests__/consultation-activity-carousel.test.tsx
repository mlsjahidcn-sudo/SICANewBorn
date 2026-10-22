import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsultationActivityCarousel } from '../ConsultationActivityCarousel';

const carousel = vi.hoisted(() => {
  const listeners = new Map<string, () => void>();
  const api = {
    selectedScrollSnap: vi.fn(() => 0),
    canScrollNext: vi.fn(() => true),
    canScrollPrev: vi.fn(() => true),
    scrollNext: vi.fn(),
    scrollPrev: vi.fn(),
    scrollTo: vi.fn(),
    on(event: string, callback: () => void) {
      listeners.set(event, callback);
      return api;
    },
    off(event: string) {
      listeners.delete(event);
      return api;
    },
  };
  return { api, listeners, viewport: vi.fn() };
});

vi.mock('embla-carousel-react', () => ({ default: () => [carousel.viewport, carousel.api] }));
vi.mock('next/image', () => ({
  // Browser layout/image optimization is checked in the real preview.
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const labels = {
  eyebrow: 'Consultation activities', title: 'Real conversations with SICA',
  book: 'Book a free consultation', session: 'Online consultation',
  previous: 'Previous consultation', next: 'Next consultation',
  pause: 'Pause slideshow', play: 'Play slideshow',
};
const shots = Array.from({ length: 7 }, (_, index) => ({
  id: String(index), imageSrc: `/shot-${index}.png`, caption: `Consultation ${index}`,
  personName: `Student ${index}`, initials: 'S', shotDate: null,
}));
let reducedMotion = false;
let setInView: (visible: boolean) => void;

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  reducedMotion = false;
  carousel.api.selectedScrollSnap.mockReturnValue(0);
  carousel.api.canScrollNext.mockReturnValue(true);
  carousel.api.canScrollPrev.mockReturnValue(true);
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  vi.stubGlobal('matchMedia', () => ({
    matches: reducedMotion, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void) {
      setInView = (isIntersecting: boolean): void => callback([{ isIntersecting }]);
    }
    observe(): void { setInView(true); }
    disconnect(): void {}
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function advance(): void { act(() => vi.advanceTimersByTime(4000)); }

describe('ConsultationActivityCarousel', () => {
  it('includes every managed screenshot and a working booking link', () => {
    render(<ConsultationActivityCarousel shots={shots} labels={labels} />);
    expect(screen.getAllByRole('img')).toHaveLength(7);
    expect(screen.getByRole('link', { name: labels.book })).toHaveAttribute('href', '/counselling');
    advance();
    expect(carousel.api.scrollNext).toHaveBeenCalledOnce();
    act(() => {
      carousel.api.selectedScrollSnap.mockReturnValue(1);
      carousel.listeners.get('select')?.();
    });
    expect(screen.getByText('02 / 07')).toBeInTheDocument();
    advance();
    expect(carousel.api.scrollNext).toHaveBeenCalledTimes(2);
  });

  it('only rotates when the carousel is on screen', () => {
    render(<ConsultationActivityCarousel shots={shots} labels={labels} />);
    act(() => setInView(false));
    advance();
    expect(carousel.api.scrollNext).not.toHaveBeenCalled();
    act(() => setInView(true));
    advance();
    expect(carousel.api.scrollNext).toHaveBeenCalledOnce();
  });

  it('pauses on hover and resumes after the pointer leaves', () => {
    render(<ConsultationActivityCarousel shots={shots} labels={labels} />);
    const region = screen.getByRole('region', { name: labels.title });
    fireEvent.mouseEnter(region);
    advance();
    expect(carousel.api.scrollNext).not.toHaveBeenCalled();
    fireEvent.mouseLeave(region);
    advance();
    expect(carousel.api.scrollNext).toHaveBeenCalledOnce();
  });

  it('keeps an explicit pause until the visitor chooses play', () => {
    render(<ConsultationActivityCarousel shots={shots} labels={labels} />);
    fireEvent.click(screen.getByRole('button', { name: labels.pause }));
    advance();
    expect(carousel.api.scrollNext).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: labels.play }));
    advance();
    expect(carousel.api.scrollNext).toHaveBeenCalledOnce();
  });

  it('stops rotation for keyboard navigation while allowing manual movement', () => {
    render(<ConsultationActivityCarousel shots={shots} labels={labels} />);
    fireEvent.keyDown(screen.getByRole('group', { name: labels.eyebrow }), { key: 'ArrowRight' });
    expect(carousel.api.scrollNext).toHaveBeenCalledWith(false);
    advance();
    expect(carousel.api.scrollNext).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: labels.play })).toBeInTheDocument();
  });

  it('respects reduced motion and keeps the arrows usable without animation', () => {
    reducedMotion = true;
    render(<ConsultationActivityCarousel shots={shots} labels={labels} />);
    advance();
    expect(carousel.api.scrollNext).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: labels.pause })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: labels.next }));
    expect(carousel.api.scrollNext).toHaveBeenCalledWith(true);
  });

  it('stops timers while the browser tab is hidden', () => {
    render(<ConsultationActivityCarousel shots={shots} labels={labels} />);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    fireEvent(document, new Event('visibilitychange'));
    advance();
    expect(carousel.api.scrollNext).not.toHaveBeenCalled();
  });

  it('handles a single screenshot without rotation controls', () => {
    carousel.api.canScrollNext.mockReturnValue(false);
    carousel.api.canScrollPrev.mockReturnValue(false);
    render(<ConsultationActivityCarousel shots={shots.slice(0, 1)} labels={labels} />);
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: labels.next })).not.toBeInTheDocument();
    advance();
    expect(carousel.api.scrollNext).not.toHaveBeenCalled();
  });
});

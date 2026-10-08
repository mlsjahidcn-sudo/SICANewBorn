import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConsultationCta } from '../ConsultationCta';

// The i18n context + analytics tracker both have to be mocked — the
// CTA delegates all copy to t() and fires apply_click / whatsapp_click.
// Keeping the mocks at the module boundary (vs in setup) so the
// CTA's tracking behaviour is observable per-test.

const tMock = vi.fn((key: string) => {
  // Translate the keys our CTA actually uses; everything else falls
  // through to the raw key (the CTA asserts by accessible name, so
  // we only need to satisfy the names the tests look up).
  const map: Record<string, string> = {
    'consultationCta.eyebrow': 'Free 10-minute consultation',
    'consultationCta.title': 'Book a free 10-minute consultation',
    'consultationCta.subtitle': 'Talk to a SICA admissions counsellor.',
    'consultationCta.ctaPrimary': 'Book a free consultation',
    'consultationCta.ctaSecondary': 'Chat on WhatsApp',
  };
  return map[key] ?? key;
});

const trackMock = vi.fn();

vi.mock('@/lib/i18n', async () => {
  // Phase 147: ConsultationCta wraps itself in I18nProvider, so the
  // mock must export both `useI18n` and `I18nProvider` (the wrapper
  // just renders its children; the real provider reads the cookie).
  const React = await import('react');
  return {
    useI18n: () => ({ t: tMock, locale: 'en', setLocale: vi.fn() }),
    I18nProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

vi.mock('@/lib/contact', () => ({
  WHATSAPP_PHONE: '8617325764171',
}));

vi.mock('@/lib/analytics', () => ({
  track: (...args: unknown[]) => trackMock(...args),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    onClick,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  tMock.mockClear();
  trackMock.mockClear();
});

describe('ConsultationCta — Phase 147', () => {
  it('links to /counselling with ?from=<slug> when slug is provided', () => {
    render(<ConsultationCta slug="tsinghua-university" />);
    const links = screen.getAllByRole('link', { name: /Book a free consultation/i });
    expect(links[0]).toHaveAttribute('href', '/counselling?from=tsinghua-university');
  });

  it('links to /counselling (no from) when slug is omitted', () => {
    render(<ConsultationCta />);
    const links = screen.getAllByRole('link', { name: /Book a free consultation/i });
    expect(links[0]).toHaveAttribute('href', '/counselling');
  });

  it('encodes the WhatsApp link with the canonical phone', () => {
    render(<ConsultationCta slug="tsinghua-university" />);
    const wa = screen.getByRole('link', { name: /Chat on WhatsApp/i });
    expect(wa).toHaveAttribute('href', expect.stringContaining('wa.me/8617325764171'));
  });

  it('tracks apply_click with the page slug in location', () => {
    render(<ConsultationCta slug="tsinghua-university" />);
    const cta = screen.getAllByRole('link', { name: /Book a free consultation/i })[0];
    cta.click();
    expect(trackMock).toHaveBeenCalledWith(
      'apply_click',
      expect.objectContaining({
        location: 'consultation_tsinghua-university',
        slug: 'tsinghua-university',
        locale: 'en',
      }),
    );
  });

  it('renders the hero CTA compact layout when variant="hero"', () => {
    render(<ConsultationCta variant="hero" />);
    // The hero variant stacks the two buttons in a single row.
    const cta = screen.getByRole('link', { name: /Book a free consultation/i });
    expect(cta).toBeInTheDocument();
  });
});
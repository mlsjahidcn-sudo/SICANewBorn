import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConsultationCta } from '../ConsultationCta';

const tMock = vi.fn((key: string) => {
  const map: Record<string, string> = {
    'consultationCta.eyebrow': 'China Admission Kit 2027',
    'consultationCta.title': 'Apply on your own with the complete kit',
    'consultationCta.subtitle': '11 guides, templates and a university database.',
    'consultationCta.ctaPrimary': 'Get the Kit',
    'consultationCta.ctaSecondary': 'Get the Kit',
  };
  return map[key] ?? key;
});

const trackMock = vi.fn();

vi.mock('@/lib/i18n', async () => {
  const React = await import('react');
  return {
    useI18n: () => ({ t: tMock, locale: 'en', setLocale: vi.fn() }),
    I18nProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

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

describe('ConsultationCta — Admission Kit buy-only', () => {
  it('links primary CTA to /china-admission-kit with ?from=<slug>', () => {
    render(<ConsultationCta slug="tsinghua-university" />);
    const links = screen.getAllByRole('link', { name: /Get the Kit/i });
    expect(links[0]).toHaveAttribute('href', '/china-admission-kit?from=tsinghua-university');
  });

  it('links primary CTA to /china-admission-kit when slug is omitted', () => {
    render(<ConsultationCta />);
    const links = screen.getAllByRole('link', { name: /Get the Kit/i });
    expect(links[0]).toHaveAttribute('href', '/china-admission-kit');
  });

  it('does not offer a counselling secondary CTA', () => {
    render(<ConsultationCta slug="tsinghua-university" />);
    expect(screen.queryByRole('link', { name: /counselling/i })).toBeNull();
  });

  it('tracks apply_click with kit location prefix', () => {
    render(<ConsultationCta slug="tsinghua-university" />);
    const cta = screen.getAllByRole('link', { name: /Get the Kit/i })[0];
    cta.click();
    expect(trackMock).toHaveBeenCalledWith(
      'apply_click',
      expect.objectContaining({
        location: 'kit_tsinghua-university',
        slug: 'tsinghua-university',
        locale: 'en',
      }),
    );
  });

  it('renders the hero CTA compact layout when variant="hero"', () => {
    render(<ConsultationCta variant="hero" />);
    const cta = screen.getByRole('link', { name: /Get the Kit/i });
    expect(cta).toBeInTheDocument();
  });
});

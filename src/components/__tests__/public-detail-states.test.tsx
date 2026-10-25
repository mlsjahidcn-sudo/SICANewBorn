import { render, screen, fireEvent } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { UniversityPrograms } from '@/components/public-detail/university-programs';
import { DetailEvidence } from '@/components/public-detail/detail-evidence';
import { DetailImage } from '@/components/public-detail/detail-image';
import { I18nProvider, useI18n } from '@/lib/i18n';
import { DetailFaq } from '@/components/public-detail/detail-faq';
import { buildProgramFaqItems } from '@/lib/program-faq';
import { programs } from '@/lib/data';
import type { UniversityProgramPage } from '@/lib/university-programs';

const empty: UniversityProgramPage = { rows: [], total: 0, totalPages: 0, page: 1, degreeOptions: [], languageOptions: [], search: '', degree: '', language: '' };
beforeAll(() => { window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }); });

describe('public detail recovery states', () => {
  it('updates visible FAQ answers, JSON-LD and page language together on a locale change', () => {
    function BilingualFaq() {
      const { locale, setLocale } = useI18n();
      return <><button onClick={() => setLocale('zh')}>中文</button><DetailFaq items={buildProgramFaqItems(programs[0], 'Example University', locale)} /></>;
    }
    const { container } = render(<I18nProvider initialLocale="en"><BilingualFaq /></I18nProvider>);
    fireEvent.click(screen.getByRole('button', { name: '中文' }));
    const schema = JSON.parse(container.querySelector('script')?.textContent ?? '{}') as { mainEntity: { acceptedAnswer: { text: string } }[] };
    expect(schema.mainEntity.map((item) => item.acceptedAnswer.text)).toEqual(Array.from(container.querySelectorAll('dd')).map((item) => item.textContent));
    expect(document.documentElement.lang).toBe('zh');
    if (typeof window.localStorage.removeItem === 'function') window.localStorage.removeItem('sica-locale');
    document.cookie = 'sica-locale=; max-age=0; path=/';
  });
  it('distinguishes an unlisted university catalog from filtered no matches', () => {
    const { rerender } = render(<I18nProvider initialLocale="en"><UniversityPrograms slug="example" result={empty} fromQuery="" totalPrograms={0} /></I18nProvider>);
    expect(screen.getByText('No public programs listed yet')).toBeInTheDocument();
    rerender(<I18nProvider initialLocale="en"><UniversityPrograms slug="example" result={{ ...empty, search: 'no-match' }} fromQuery="" totalPrograms={80} /></I18nProvider>);
    expect(screen.getByText('No programs match')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Clear all' }).every((link) => !link.getAttribute('href')?.includes('programQ'))).toBe(true);
  });
  it('offers retry for a failed result page rather than claiming there are zero programs', () => {
    render(<I18nProvider initialLocale="en"><UniversityPrograms slug="example" result={{ ...empty, error: true }} fromQuery="city=Beijing" totalPrograms={80} /></I18nProvider>);
    expect(screen.getByRole('alert')).toHaveTextContent('We could not load these details');
    expect(screen.getByRole('link', { name: 'Retry' })).toHaveAttribute('href', expect.stringContaining('from=city%3DBeijing'));
    expect(screen.queryByText('No programs match')).not.toBeInTheDocument();
  });
  it('uses the published result total for pagination and preserves filters in return links', () => {
    render(<I18nProvider initialLocale="en"><UniversityPrograms slug="example" result={{ ...empty, total: 413, totalPages: 35, page: 2, degree: 'Bachelor' }} fromQuery="city=Beijing" totalPrograms={413} /></I18nProvider>);
    expect(screen.getByText('413 programs')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', expect.stringContaining('programPage=3'));
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', expect.stringContaining('programDegree=Bachelor'));
  });
  it('ties an expired deadline to its named intake and leaves an unassigned legacy date unqualified', () => {
    render(<I18nProvider initialLocale="en"><DetailEvidence evidence={{ sourceUrl: 'https://university.edu.cn', verifiedAt: '2020-01-01', intake: 'September 2020', deadline: '2020-06-01', intakeStatus: 'open' }} /></I18nProvider>);
    expect(screen.getByText('September 2020')).toBeInTheDocument();
    expect(screen.getByText('The recorded deadline has passed')).toBeInTheDocument();
  });
  it('keeps a meaningful fallback for a broken campus image', () => {
    render(<I18nProvider initialLocale="en"><DetailImage src="/missing.jpg" alt="Example campus" sizes="100vw" /></I18nProvider>);
    fireEvent.error(screen.getByRole('img', { name: 'Example campus' }));
    expect(screen.getByRole('img', { name: 'Example campus' })).toHaveTextContent('Campus photo unavailable');
  });
});

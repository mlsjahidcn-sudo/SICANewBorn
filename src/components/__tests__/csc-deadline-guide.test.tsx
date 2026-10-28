import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GuidePage } from '@/components/guides/guide-page';
import { cscDeadlineGuide, cscCountryDeadlines, CSC_DEADLINES_PATH, CSC_DEADLINES_REVIEWED_AT } from '@/lib/guides/csc-deadlines-2027-2028';
import { cscScholarshipGuide } from '@/lib/guides/chinese-government-scholarship-csc';
import { guideCards } from '@/lib/guides/hub-data';

function showGuide(locale: 'en' | 'zh'): ReturnType<typeof render> {
  return render(<GuidePage guide={cscDeadlineGuide[locale]} pathSegment="csc-scholarship-deadlines-2027-2028" urlPath={CSC_DEADLINES_PATH} showConsultationCta={false} />);
}

describe('CSC 2027/2028 deadline and document guide', () => {
  it('preserves the four notice deadlines and leaves unpublished dates unknown', () => {
    expect(cscCountryDeadlines.filter((row) => row.status === 'confirmed').map((row) => [row.country.en, row.deadline])).toEqual([
      ['Timor-Leste', '2026-12-20'], ['South Sudan', '2027-01-20'], ['Maldives', '2027-01-29'], ['Singapore', '2027-01-31'],
    ]);
    expect(cscCountryDeadlines[0].before).toBe(true);
    expect(cscCountryDeadlines.filter((row) => row.status === 'check').map((row) => [row.country.en, row.deadline])).toEqual([
      ['Bangladesh', null], ['Pakistan', null], ['Nigeria', null],
    ]);
  });

  it.each(['en', 'zh'] as const)('links all seven country rows to their official source in %s', (locale) => {
    showGuide(locale);
    const table = screen.getByRole('table');
    for (const row of cscCountryDeadlines) {
      const tr = within(table).getByRole('row', { name: new RegExp(row.country[locale]) });
      expect(within(tr).getByRole('link', { name: row.sourceLabel[locale] })).toHaveAttribute('href', row.source);
      if (row.status === 'check') expect(tr).not.toHaveTextContent(/2027-\d{2}-\d{2}/);
    }
    expect(table).toHaveTextContent(locale === 'en' ? 'Before 2026-12-20' : '早于 2026-12-20');
    expect(table).toHaveTextContent('23:59');
    expect(guideCards[locale].some((card) => card.href === CSC_DEADLINES_PATH)).toBe(true);
  });

  it.each(['en', 'zh'] as const)('keeps the CSC page and deadline article in sync in %s', (locale) => {
    const tracker = cscDeadlineGuide[locale].sections.find((section) => section.id === 'deadlines-by-country');
    expect(cscScholarshipGuide[locale].sections.find((section) => section.id === 'deadlines-by-country')).toEqual(tracker);
    expect(cscScholarshipGuide[locale].related.some((guide) => guide.href === CSC_DEADLINES_PATH)).toBe(true);
    const requirements = cscScholarshipGuide[locale].sections.filter((section) => ['pre-admission-letter', 'csca-requirement'].includes(section.id));
    expect(JSON.stringify(requirements)).not.toMatch(/\[verify|\[待核实\]/i);
    expect(JSON.stringify(requirements)).toContain('https://www.csca.cn/');
  });

  it('uses the real review date in visible content and Article metadata', () => {
    const { container } = showGuide('en');
    expect(container.querySelector('time')).toHaveAttribute('datetime', CSC_DEADLINES_REVIEWED_AT);
    const article = [...container.querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent ?? '{}')).find((schema: { '@type'?: string }) => schema['@type'] === 'Article');
    expect(article.dateModified).toBe(CSC_DEADLINES_REVIEWED_AT);
    expect(article.datePublished).toBeUndefined();
  });

  it('does not invent a last-updated date for an undated guide', () => {
    const { container } = render(<GuidePage guide={{ ...cscDeadlineGuide.en, updatedAt: undefined, publishedAt: undefined }} pathSegment="undated" showConsultationCta={false} />);
    expect(container.querySelector('time')).toBeNull();
    expect(screen.queryByText(/Last updated:/)).not.toBeInTheDocument();
  });
});

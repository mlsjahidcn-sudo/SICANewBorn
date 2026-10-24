import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/lib/i18n';
import { CatalogResultRow } from '@/components/catalog/catalog-results';
import { parseCatalogQuery, type CatalogRow } from '@/lib/catalog-search';
vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));
const row: CatalogRow = { slug: 'computer-science', name: 'Computer Science', nameCn: '', city: 'Beijing', cityCn: '北京', universitySlug: 'tsinghua', universityName: 'Tsinghua University', degree: 'Bachelor', language: 'English', tuition: 'CNY 16,000–24,000/year', scholarshipAvailable: null };
describe('public result facts', () => {
  it('preserves tuition units and ranges and does not claim an unconfirmed scholarship', () => {
    render(<I18nProvider initialLocale="en"><CatalogResultRow row={row} query={parseCatalogQuery('programs', new URLSearchParams('q=CS&city=Beijing&page=2'))} position={24} /></I18nProvider>);
    expect(screen.getByText('CNY 16,000–24,000/year')).toBeInTheDocument();
    expect(screen.queryByText('Scholarship available')).not.toBeInTheDocument();
    const href = screen.getByRole('link', { name: 'Computer Science' }).getAttribute('href');
    expect(href).toContain('from=q%3DCS%26city%3DBeijing%26page%3D2');
  });
  it('links university matches back to the same subject and school', () => {
    render(<I18nProvider initialLocale="en"><CatalogResultRow row={{ ...row, name: 'Tsinghua University', slug: 'tsinghua', matchingProgramCount: 3 }} query={parseCatalogQuery('universities', new URLSearchParams('q=English+CS&city=Beijing'))} position={0} /></I18nProvider>);
    expect(screen.getByText('3 matching programs')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View matching programs' })).toHaveAttribute('href', '/programs?q=English+CS&city=Beijing&uni=tsinghua');
  });
});

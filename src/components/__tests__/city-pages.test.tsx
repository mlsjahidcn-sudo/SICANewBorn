import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CityCatalog } from '@/lib/city-catalog';
import { buildCityIndex, citySlug, type CityUniversity } from '@/lib/city-index';
import Hub from '@/app/study-in-china/page';
import CityPage from '@/app/study-in-china/[city]/page';

const state = vi.hoisted(() => ({ locale: 'en' as 'en' | 'zh', catalog: { cities: [], source: 'live', programsAvailable: true } as CityCatalog }));
vi.mock('@/lib/city-catalog', () => ({
  getCityCatalog: async () => state.catalog, seedCities: [],
  getCityBySlugAsync: async (slug: string) => state.catalog.cities.find((c) => c.slug === citySlug(slug)) ?? null,
}));
vi.mock('@/lib/server-t', async () => {
  const { t } = await import('@/lib/i18n-translations');
  return { getServerLocale: async () => state.locale, getServerT: async () => (key: string, params?: Record<string, string | number>) => t(state.locale, key, params) };
});
vi.mock('@/lib/supabase-server', () => ({ isSupabaseServerConfigured: () => true }));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NOT_FOUND'); }, permanentRedirect: (href: string) => { throw new Error(`REDIRECT:${href}`); } }));
vi.mock('next/form', () => ({ default: ({ children, ...props }: React.ComponentProps<'form'>) => <form {...props}>{children}</form> }));

beforeEach(() => {
  state.locale = 'en';
  const universities: CityUniversity[] = Array.from({ length: 25 }, (_, i) => ({ slug: `university-${i}`, name: `University ${i}`, nameCn: `测试大学${i}`, city: 'Beijing', cityCn: '北京', ranking: i ? i : 0, type: 'Public', typeCn: '公立', established: 0, description: 'English description', descriptionCn: '中文描述', image: '', logo: '', tuitionUndergrad: '', tuitionGraduate: '' }));
  state.catalog = { source: 'live', programsAvailable: true, cities: buildCityIndex(universities, [{ slug: 'p', universitySlug: 'university-1', language: 'English' }]) };
});

describe('city directory and detail pages', () => {
  it('renders a GET city search with visible-result structured data', async () => {
    const { container } = render(await Hub({ searchParams: Promise.resolve({ q: '北京', sort: 'programs' }) }));
    expect(screen.getByLabelText('City or university')).toHaveValue('北京');
    expect(screen.getByLabelText('Sort by')).toHaveValue('programs');
    expect(container.querySelector('form')).toHaveAttribute('action', '/study-in-china');
    const schema = JSON.parse(container.querySelector('script')?.textContent ?? '[]') as Array<{ numberOfItems?: number }>;
    expect(schema[1].numberOfItems).toBe(1);
  });
  it('renders only one page of universities and preserves city context in program and profile links', async () => {
    const { container } = render(await CityPage({ params: Promise.resolve({ city: 'beijing' }), searchParams: Promise.resolve({ page: '2', sort: 'name' }) }));
    const results = screen.getByRole('region', { name: 'Universities in Beijing' });
    expect(within(results).getAllByRole('heading', { level: 3 })).toHaveLength(12);
    for (const link of within(results).getAllByRole('link', { name: 'View programs' })) {
      const url = new URL(link.getAttribute('href') ?? '', 'https://sica.test');
      expect(url.searchParams.get('city')).toBe('Beijing');
      expect(url.searchParams.get('uni')).toMatch(/^university-/);
    }
    expect(within(results).getByRole('link', { name: 'Next' })).toHaveAttribute('href', '/study-in-china/beijing?sort=name&page=3');
    expect(container.textContent).not.toContain('{{city}}');
    expect(container.textContent).not.toContain('oldest');
    expect(container.textContent).not.toContain('est. 0');
    const schema = JSON.parse(container.querySelector('script')?.textContent ?? '[]') as Array<{ numberOfItems?: number }>;
    expect(schema[1].numberOfItems).toBe(12);
  });
  it('uses Chinese names and descriptions with localized pagination', async () => {
    state.locale = 'zh';
    render(await CityPage({ params: Promise.resolve({ city: 'beijing' }), searchParams: Promise.resolve({}) }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('在北京留学');
    expect(screen.getAllByText('中文描述')).toHaveLength(12);
    expect(screen.queryByText('English description')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '下一页' })).toHaveAttribute('href', '/study-in-china/beijing?sort=ranking&page=2&lang=zh');
  });
  it('offers recovery when a valid search has no results', async () => {
    render(await CityPage({ params: Promise.resolve({ city: 'beijing' }), searchParams: Promise.resolve({ q: 'nonexistent' }) }));
    expect(screen.getByText('No matches found')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Browse result pages' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Clear search' }).every((link) => link.getAttribute('href') === '/study-in-china/beijing')).toBe(true);
  });
  it('distinguishes a missing city from a temporary catalog failure', async () => {
    await expect(CityPage({ params: Promise.resolve({ city: 'missing' }), searchParams: Promise.resolve({}) })).rejects.toThrow('NOT_FOUND');
    state.catalog.source = 'fallback';
    await expect(CityPage({ params: Promise.resolve({ city: 'missing' }), searchParams: Promise.resolve({}) })).rejects.toThrow('temporarily unavailable');
  });
  it('redirects an existing noncanonical city spelling while preserving search and sorting', async () => {
    await expect(CityPage({ params: Promise.resolve({ city: 'BEIJING' }), searchParams: Promise.resolve({ q: 'University', sort: 'name', page: '2' }) })).rejects.toThrow('REDIRECT:/study-in-china/beijing?q=University&sort=name&page=2');
  });
  it('resets visible form controls when a clear/back navigation changes the URL query', async () => {
    const props = { params: Promise.resolve({ city: 'beijing' }), searchParams: Promise.resolve({ q: 'University', sort: 'name' }) };
    const view = render(await CityPage(props));
    fireEvent.change(screen.getByLabelText('University name'), { target: { value: 'unsent draft' } });
    view.rerender(await CityPage({ params: Promise.resolve({ city: 'beijing' }), searchParams: Promise.resolve({}) }));
    expect(screen.getByLabelText('University name')).toHaveValue('');
    expect(screen.getByLabelText('Sort by')).toHaveValue('ranking');
  });

});

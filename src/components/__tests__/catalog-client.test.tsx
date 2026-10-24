import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/lib/i18n';
import { CatalogClient } from '@/components/catalog/catalog-client';
import { parseCatalogQuery, type CatalogSearchResult } from '@/lib/catalog-search';

const navigation = vi.hoisted(() => ({ params: new URLSearchParams('q=CS'), push: vi.fn() }));
vi.mock('next/navigation', () => ({ useSearchParams: () => navigation.params, useRouter: () => ({ push: navigation.push }) }));
vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));
const initialQuery = parseCatalogQuery('programs', new URLSearchParams('q=CS'));
const initialResult: CatalogSearchResult = {
  kind: 'programs', total: 1, page: 1, limit: 24, totalPages: 1, facets: {}, suggestions: [],
  rows: [{ slug: 'computer-science', name: 'Computer Science', nameCn: '', city: 'Beijing', cityCn: '北京', universityName: 'Tsinghua', universitySlug: 'tsinghua' }],
};
function View(): React.ReactElement {
  return <I18nProvider initialLocale="en"><CatalogClient initialQuery={initialQuery} initialResult={initialResult} /></I18nProvider>;
}
beforeEach(() => {
  navigation.params = new URLSearchParams('q=CS');
  vi.restoreAllMocks();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ suggestions: [] }) }));
});

describe('catalog result navigation and recovery', () => {
  it('renders server results without a duplicate full-result request and commits only on submit', () => {
    const history = vi.spyOn(window.history, 'pushState');
    render(<View />);
    expect(screen.getByRole('heading', { name: 'Computer Science' })).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('combobox', { name: 'Subject, university, or city…' }), { target: { value: 'English CS Beijing' } });
    expect(history).not.toHaveBeenCalled();
    fireEvent.submit(screen.getByRole('search'));
    expect(history).toHaveBeenCalledWith(null, '', '/programs?q=English+CS+Beijing');
  });
  it('restores URL state on Back and protects previous rows against a failed search', async () => {
    const rendered = render(<View />);
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
    navigation.params = new URLSearchParams('q=English+CS');
    rendered.rerender(<View />);
    await screen.findByRole('alert');
    expect(screen.getByRole('heading', { name: 'Computer Science' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Computer Science' }).getAttribute('href')).toContain('from=q%3DCS');
    navigation.params = new URLSearchParams('q=CS');
    rendered.rerender(<View />);
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(screen.getByRole('combobox', { name: 'Subject, university, or city…' })).toHaveValue('CS');
  });
  it('does not let an older full search overwrite a newer search', async () => {
    const rendered = render(<View />);
    let resolveOld: (value: Response) => void = () => {};
    vi.mocked(fetch).mockImplementation((input) => {
      if (String(input).startsWith('/api/catalog/suggestions')) return Promise.resolve({ ok: true, json: async () => ({ suggestions: [] }) } as Response);
      if (String(input).includes('q=old')) return new Promise<Response>((resolve) => { resolveOld = resolve; });
      return Promise.resolve({ ok: true, json: async () => ({ ...initialResult, rows: [{ ...initialResult.rows[0], name: 'New program', slug: 'new-program' }] }) } as Response);
    });
    navigation.params = new URLSearchParams('q=old'); rendered.rerender(<View />);
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringContaining('q=old'), expect.anything()));
    navigation.params = new URLSearchParams('q=new'); rendered.rerender(<View />);
    await screen.findByRole('heading', { name: 'New program' });
    await act(async () => resolveOld({ ok: true, json: async () => ({ ...initialResult, rows: [{ ...initialResult.rows[0], name: 'Old program' }] }) } as Response));
    expect(screen.queryByRole('heading', { name: 'Old program' })).not.toBeInTheDocument();
  });
});

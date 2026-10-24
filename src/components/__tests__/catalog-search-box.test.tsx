import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/lib/i18n';
import { CatalogSearchBox } from '@/components/catalog/catalog-search-box';
import type { CatalogQuery, CatalogSuggestion } from '@/lib/catalog-search';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));
const query: CatalogQuery = { kind: 'programs', q: '', filters: {}, sort: 'default', page: 1, limit: 24 };
const suggestions: CatalogSuggestion[] = [
  { kind: 'programs', label: 'Computer Science', sublabel: 'Tsinghua · Bachelor · English', href: '/programs?q=Computer+Science&uni=tsinghua' },
  { kind: 'universities', label: 'Tsinghua University', sublabel: 'Beijing', href: '/universities/tsinghua-university' },
];
function setup(onSearch = vi.fn()): { onSearch: ReturnType<typeof vi.fn>; input: HTMLElement } {
  render(<I18nProvider initialLocale="en"><CatalogSearchBox query={query} onSearch={onSearch} /></I18nProvider>);
  return { onSearch, input: screen.getByRole('combobox') };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ suggestions }) }));
});
afterEach(() => { vi.useRealTimers(); });

describe('catalog search interaction', () => {
  it('waits for input focus before requesting suggestions for a server-rendered query', async () => {
    vi.useFakeTimers();
    render(<I18nProvider initialLocale="en"><CatalogSearchBox query={{ ...query, q: 'CS' }} onSearch={vi.fn()} /></I18nProvider>);
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.focus(screen.getByRole('combobox'));
    await act(async () => { vi.advanceTimersByTime(250); });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('keeps typing as a draft until Search is submitted', async () => {
    const { input, onSearch } = setup();
    fireEvent.change(input, { target: { value: 'CS' } });
    await screen.findByRole('listbox');
    expect(onSearch).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(onSearch).toHaveBeenCalledWith('CS');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('supports arrow navigation, Enter selection and Escape', async () => {
    const { input, onSearch } = setup();
    fireEvent.change(input, { target: { value: 'computer' } });
    await screen.findByRole('listbox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: /Computer Science/ })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(push).toHaveBeenCalledWith(suggestions[0].href);
    expect(onSearch).not.toHaveBeenCalled();
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('does not submit Enter while Chinese composition is active', () => {
    const { input, onSearch } = setup();
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: '清华' } });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(onSearch).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
    fireEvent.submit(screen.getByRole('search'));
    expect(onSearch).toHaveBeenCalledWith('清华');
  });
  it('keeps full search usable if suggestions fail', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
    const { input, onSearch } = setup();
    fireEvent.change(input, { target: { value: 'computer' } });
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    fireEvent.submit(screen.getByRole('search'));
    expect(onSearch).toHaveBeenCalledWith('computer');
  });
  it('ignores a superseded suggestion response even if the server ignores abort', async () => {
    let resolveOld: (value: Response) => void = () => {};
    vi.mocked(fetch).mockImplementationOnce(() => new Promise<Response>((resolve) => { resolveOld = resolve; }));
    const { input } = setup();
    fireEvent.change(input, { target: { value: 'old' } });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    fireEvent.change(input, { target: { value: 'computer' } });
    await screen.findByRole('listbox');
    await act(async () => resolveOld({ ok: true, json: async () => ({ suggestions: [{ ...suggestions[0], label: 'Old stale result' }] }) } as Response));
    expect(screen.queryByText('Old stale result')).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Computer Science/ })).toBeInTheDocument();
  });
});

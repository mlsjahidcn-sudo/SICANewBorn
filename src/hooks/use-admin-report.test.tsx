import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock('@/lib/api-client', () => ({ apiFetchJson: mocks.fetch }));
import { useAdminReport, useReportingFilters } from './use-admin-report';
function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, '', '/');
});
afterEach(() => vi.useRealTimers());

describe('scoped reporting requests', () => {
  it('aborts old filters and ignores out-of-order completions', async () => {
    const first = deferred<{ total: number }>();
    const second = deferred<{ total: number }>();
    mocks.fetch
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const { result, rerender } = renderHook(
      ({ url }) => useAdminReport<{ total: number }>(url, false),
      { initialProps: { url: '/report?q=old' } },
    );
    const oldSignal = mocks.fetch.mock.calls[0][1].signal as AbortSignal;
    rerender({ url: '/report?q=new' });
    expect(oldSignal.aborted).toBe(true);
    expect(result.current.data).toBeNull();
    await act(async () => second.resolve({ total: 2 }));
    expect(result.current.data?.total).toBe(2);
    await act(async () => first.resolve({ total: 99 }));
    expect(result.current.data?.total).toBe(2);
  });
  it('retains a successful snapshot on refresh failure, but never shows it for a different scope', async () => {
    mocks.fetch
      .mockResolvedValueOnce({ total: 7 })
      .mockRejectedValueOnce(new Error('Offline'))
      .mockReturnValueOnce(new Promise(() => {}));
    const { result, rerender } = renderHook(
      ({ url }) => useAdminReport<{ total: number }>(url, false),
      { initialProps: { url: '/report?range=7d' } },
    );
    await waitFor(() => expect(result.current.data?.total).toBe(7));
    act(() => result.current.refresh());
    await waitFor(() => expect(result.current.error).toBe('Offline'));
    expect(result.current.data?.total).toBe(7);
    rerender({ url: '/report?range=30d' });
    expect(result.current.data).toBeNull();
  });
  it('hydrates URL filters, debounces search, and resets pagination when audience changes', async () => {
    vi.useFakeTimers();
    window.history.replaceState(
      {},
      '',
      '/?range=custom&from=2026-10-01&to=2026-10-22&country=Nigeria&page=3',
    );
    const { result } = renderHook(() => useReportingFilters());
    expect(result.current.ready).toBe(true);
    expect(result.current.filters.page).toBe(3);
    act(() => result.current.update({ q: 'new search' }));
    expect(result.current.filters.page).toBe(1);
    expect(result.current.query).not.toContain('q=');
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.query).toContain('q=new+search');
    expect(window.location.search).toContain('q=new+search');
    act(() => result.current.update({ country: 'China' }));
    expect(result.current.query).toContain('country=China');
    expect(result.current.query).not.toContain('page=');
  });
});

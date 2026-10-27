'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetchJson } from '@/lib/api-client';
import { parseReportRange, type ReportPreset } from '@/lib/admin-reporting';

export interface ReportingFilters {
  range: ReportPreset;
  from: string;
  to: string;
  q: string;
  status: string;
  country: string;
  source: string;
  interest: string;
  webinarKey: string;
  page: number;
}
const INITIAL: ReportingFilters = {
  range: '30d',
  from: '',
  to: '',
  q: '',
  status: 'all',
  country: '',
  source: '',
  interest: '',
  webinarKey: '',
  page: 1,
};
const FILTER_KEYS = [
  'range',
  'from',
  'to',
  'q',
  'status',
  'country',
  'source',
  'interest',
  'webinarKey',
  'page',
] as const;

function readFilters(): ReportingFilters {
  const params = new URLSearchParams(window.location.search);
  let period;
  try {
    period = parseReportRange(params);
  } catch {
    period = parseReportRange(new URLSearchParams());
  }
  return {
    range: period.preset,
    from: period.from,
    to: period.to,
    q: params.get('q') || '',
    status: params.get('status') || 'all',
    country: params.get('country') || '',
    source: params.get('source') || '',
    interest: params.get('interest') || '',
    webinarKey: params.get('webinarKey') || '',
    page: Math.max(1, Math.trunc(Number(params.get('page')) || 1)),
  };
}
export function useReportingFilters(): {
  filters: ReportingFilters;
  ready: boolean;
  query: string;
  update: (patch: Partial<ReportingFilters>) => void;
} {
  const [filters, setFilters] = useState<ReportingFilters>(INITIAL);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState('');
  useEffect(() => {
    const read = (): void => {
      const next = readFilters();
      setFilters(next);
      setSearch(next.q);
      setReady(true);
    };
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(filters.q), 300);
    return () => window.clearTimeout(timer);
  }, [filters.q]);
  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('range', filters.range);
    if (filters.range === 'custom') {
      params.set('from', filters.from);
      params.set('to', filters.to);
    }
    for (const key of ['country', 'source', 'interest', 'webinarKey'] as const)
      if (filters[key]) params.set(key, filters[key]);
    if (search.trim()) params.set('q', search.trim());
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.page > 1) params.set('page', String(filters.page));
    return params.toString();
  }, [filters, search]);
  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    for (const key of FILTER_KEYS) url.searchParams.delete(key);
    for (const [key, value] of new URLSearchParams(query))
      url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
  }, [query, ready]);
  const update = useCallback((patch: Partial<ReportingFilters>): void => {
    setFilters((previous) => {
      const next = { ...previous, ...patch, page: patch.page ?? 1 };
      if (patch.range && patch.range !== 'custom') {
        const period = parseReportRange(
          new URLSearchParams({ range: patch.range }),
        );
        next.from = period.from;
        next.to = period.to;
      }
      return next;
    });
  }, []);
  return { filters, ready, query, update };
}

/** Scope data by request URL, cancel stale reads, and keep a successful snapshot during refresh. */
export function useAdminReport<T>(
  url: string | null,
  poll: boolean = true,
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [snapshot, setSnapshot] = useState<{ url: string; data: T } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const refresh = useCallback((): void => setNonce((value) => value + 1), []);
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void apiFetchJson<T>(url, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setSnapshot({ url, data });
      })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted)
          setError(
            failure instanceof Error ? failure.message : 'Report unavailable.',
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [url, nonce]);
  useEffect(() => {
    if (!poll || !url) return;
    const tick = (): void => {
      if (!document.hidden) refresh();
    };
    const timer = window.setInterval(tick, 30_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [poll, url, refresh]);
  return {
    data: snapshot?.url === url ? snapshot.data : null,
    loading,
    error,
    refresh,
  };
}

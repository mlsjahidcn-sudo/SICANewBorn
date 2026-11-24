'use client';
import { useEffect, useState } from 'react';
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
interface RemoteOption<T> extends SearchableSelectOption { record: T }
export function RemoteSearchSelect<T>({ url, value, onChange, placeholder, clearValue, clearLabel, disabled, container, getLogo }: {
  url: string; value: string; onChange: (value: string, record?: T) => void; placeholder: string;
  clearValue?: string; clearLabel?: string; disabled?: boolean; container?: HTMLElement | null;
  getLogo?: (record: T) => string | undefined;
}): React.ReactNode {
  const { t } = useI18n();
  const [search, setSearch] = useState(''); const [page, setPage] = useState(1);
  const [options, setOptions] = useState<RemoteOption<T>[]>([]);
  const [selected, setSelected] = useState<RemoteOption<T> | undefined>();
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false); const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true); setError('');
      const params = new URLSearchParams({ search, page: String(page) });
      apiFetchJson<{ options: RemoteOption<T>[]; hasMore: boolean }>(`${url}&${params}`, { signal: controller.signal })
        .then(data => {
          if (controller.signal.aborted) return;
          // A response without an `options` array must not put `undefined`
          // into state: the render path maps over `options` unconditionally,
          // and an undefined array crashes the whole tree on the next render.
          const rows = data.options ?? [];
          setOptions(prev => page === 1 ? rows : [...prev, ...rows]); setHasMore(data.hasMore);
        }).catch(err => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : t('common.error')); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [url, search, page, retry, t]);
  useEffect(() => { setPage(1); setSearch(''); setOptions([]); }, [url]);
  // Hydrate a deep-linked student, including one outside the current search page.
  useEffect(() => {
    if (!value || value === clearValue || selected?.value === value || options.some(o => o.value === value)) return;
    const controller = new AbortController();
    apiFetchJson<{ options: RemoteOption<T>[] }>(`${url}&value=${encodeURIComponent(value)}`, { signal: controller.signal })
      .then(data => { const rows = data.options ?? []; if (!controller.signal.aborted && rows[0]) { setSelected(rows[0]); setOptions(prev => [...rows, ...prev.filter(o => o.value !== value)]); } })
      .catch(err => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : t('common.error')); });
    return () => controller.abort();
  }, [value, clearValue, options, url, t, selected]);
  const decorated = options.map(o => (o.logo ? o : { ...o, logo: getLogo?.(o.record) }));
  const visible = selected && selected.value === value && !options.some(o => o.value === selected.value)
    ? [{ ...selected, logo: selected.logo ?? getLogo?.(selected.record) }, ...decorated]
    : decorated;
  // Pagination and errors belong to the open list, not the parent layout: as
  // in-flow siblings they grew the filter bar's grid cell under the trigger.
  // Undefined, not an empty fragment — a fragment is always truthy, which would
  // make the popover render a bordered band with nothing in it.
  const footer = error || hasMore ? <>
    {error && <p role="alert" className="text-red-700">{error} <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setRetry(n => n + 1)}>{t('common.retry')}</Button></p>}
    {hasMore && <Button variant="link" size="sm" className="h-auto p-0" disabled={loading} onClick={() => setPage(p => p + 1)}>{t('adminManagement.moreOptions')}</Button>}
  </> : undefined;
  return <div className="min-w-0">
    <SearchableSelect value={value} options={visible} placeholder={placeholder} searchPlaceholder={t('adminManagement.searchOptions')} clearValue={clearValue} clearLabel={clearLabel} disabled={disabled} loading={loading} searchValue={search} container={container} footer={footer} onSearchChange={text => { setPage(1); setSearch(text); }} onChange={next => { const option = visible.find(o => o.value === next); setSelected(option); onChange(next, option?.record); }} />
  </div>;
}

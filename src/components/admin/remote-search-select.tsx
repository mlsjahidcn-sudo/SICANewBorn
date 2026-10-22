'use client';
import { useEffect, useState } from 'react';
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
interface RemoteOption<T> extends SearchableSelectOption { record: T }
export function RemoteSearchSelect<T>({ url, value, onChange, placeholder, clearValue, clearLabel, disabled, container }: {
  url: string; value: string; onChange: (value: string, record?: T) => void; placeholder: string;
  clearValue?: string; clearLabel?: string; disabled?: boolean; container?: HTMLElement | null;
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
          setOptions(prev => page === 1 ? data.options : [...prev, ...data.options]); setHasMore(data.hasMore);
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
      .then(data => { if (!controller.signal.aborted && data.options[0]) { setSelected(data.options[0]); setOptions(prev => [...data.options, ...prev.filter(o => o.value !== value)]); } })
      .catch(err => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : t('common.error')); });
    return () => controller.abort();
  }, [value, clearValue, options, url, t, selected]);
  const visible = selected && selected.value === value && !options.some(o => o.value === selected.value) ? [selected, ...options] : options;
  return <div className="min-w-0">
    <SearchableSelect value={value} options={visible} placeholder={placeholder} searchPlaceholder={t('adminManagement.searchOptions')} clearValue={clearValue} clearLabel={clearLabel} disabled={disabled} loading={loading} searchValue={search} container={container} onSearchChange={text => { setPage(1); setSearch(text); }} onChange={next => { const option = visible.find(o => o.value === next); setSelected(option); onChange(next, option?.record); }} />
    {error && <p role="alert" className="text-sm text-red-700">{error} <Button variant="link" onClick={() => setRetry(n => n + 1)}>{t('common.retry')}</Button></p>}
    {hasMore && <Button variant="link" disabled={loading} onClick={() => setPage(p => p + 1)}>{t('adminManagement.moreOptions')}</Button>}
  </div>;
}

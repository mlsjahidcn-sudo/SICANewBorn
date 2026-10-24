'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState, type FormEvent, type ReactElement } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { track } from '@/lib/analytics';
import { CATALOG_QUERY_MAX, catalogHref, catalogTabHref, type CatalogKind, type CatalogQuery, type CatalogSuggestion } from '@/lib/catalog-search';

interface Props {
  query: CatalogQuery;
  onSearch: (q: string) => void;
  onKindChange?: (kind: CatalogKind) => void;
  variant?: 'directory' | 'hero';
}

/** Draft text belongs here; the parent receives committed searches only. */
export function CatalogSearchBox({ query, onSearch, onKindChange, variant = 'directory' }: Props): ReactElement {
  const { t, locale } = useI18n();
  const router = useRouter();
  const id = useId();
  const [draft, setDraft] = useState(query.q);
  const [suggestions, setSuggestions] = useState<CatalogSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [composing, setComposing] = useState(false);
  const composition = useRef(false);
  const request = useRef(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(query.q); setOpen(false); setActive(-1); }, [query.q]);

  useEffect(() => {
    const serial = ++request.current;
    const controller = new AbortController();
    setSuggestions([]);
    setActive(-1);
    setLoading(false);
    if (!open || draft.trim().length < 2 || composing) return () => controller.abort();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const sp = new URLSearchParams({ q: draft.trim(), locale });
        const res = await fetch(`/api/catalog/suggestions?${sp}`, { signal: controller.signal });
        if (!res.ok) throw new Error('suggestions unavailable');
        const data = await res.json() as { suggestions: CatalogSuggestion[] };
        if (request.current === serial && !controller.signal.aborted) setSuggestions(data.suggestions.slice(0, 8));
      } catch {
        // Suggestions are optional; a failed request must never block Enter/Search.
        if (request.current === serial && !controller.signal.aborted) setSuggestions([]);
      } finally {
        if (request.current === serial && !controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [draft, locale, composing, open]);

  const choose = (item: CatalogSuggestion, position: number): void => {
    setOpen(false);
    track('catalog_suggestion_select', { kind: item.kind, position, locale });
    router.push(item.href);
  };
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (composition.current) return;
    setOpen(false);
    setActive(-1);
    onSearch(draft.trim());
  };
  const visible = open && suggestions.length > 0;

  const categories = (
    <nav aria-label={t('catalog.searchTypes')} className={`flex gap-6 border-b border-gray-200 ${variant === 'hero' ? 'mb-5' : 'mt-3'}`}>
      {(['programs', 'universities'] as const).map((kind) => {
        const className = `border-b-2 pb-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B1B30] ${query.kind === kind ? 'border-[#9B1B30] text-[#9B1B30]' : 'border-transparent text-gray-600 hover:text-[#1B2A4A]'}`;
        return onKindChange ? <button key={kind} type="button" aria-pressed={query.kind === kind} className={className} onClick={() => onKindChange(kind)}>{t(`catalog.${kind}`)}</button>
          : <Link key={kind} prefetch={false} href={kind === query.kind ? catalogHref(query) : catalogTabHref(query, kind)} aria-current={query.kind === kind ? 'page' : undefined} className={className}>{t(`catalog.${kind}`)}</Link>;
      })}
    </nav>
  );

  return (
    <div className="min-w-0 text-[#1B2A4A]">
      {variant === 'hero' && categories}
      <form onSubmit={submit} role="search" aria-label={t('catalog.searchLabel')} className="relative flex gap-2">
        <div className="relative min-w-0 flex-1" onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        }}>
          <Search className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-[#1B2A4A]" aria-hidden="true" />
          <input
            ref={input} type="search" role="combobox" value={draft} maxLength={CATALOG_QUERY_MAX}
            aria-label={t('catalog.placeholder')} placeholder={t('catalog.placeholder')}
            aria-autocomplete="list" aria-expanded={visible} aria-controls={visible ? `${id}-suggestions` : undefined}
            aria-activedescendant={visible && active >= 0 ? `${id}-option-${active}` : undefined}
            autoComplete="off"
            onFocus={() => setOpen(true)}
            onChange={(event) => { setDraft(event.target.value); setOpen(true); setActive(-1); }}
            onCompositionStart={() => { composition.current = true; setComposing(true); }}
            onCompositionEnd={() => { composition.current = false; setComposing(false); }}
            onKeyDown={(event) => {
              if (composition.current || event.nativeEvent.isComposing || event.keyCode === 229) {
                if (event.key === 'Enter') event.preventDefault();
                return;
              }
              if (event.key === 'Escape') { setOpen(false); setActive(-1); }
              if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && suggestions.length) {
                event.preventDefault(); setOpen(true);
                setActive((value) => event.key === 'ArrowDown' ? (value + 1) % suggestions.length : (value <= 0 ? suggestions.length - 1 : value - 1));
              }
              if (event.key === 'Enter' && visible && active >= 0) { event.preventDefault(); choose(suggestions[active], active); }
            }}
            className="h-14 w-full min-w-0 appearance-none rounded-none border border-gray-300 bg-white pl-12 pr-16 text-base shadow-sm outline-none transition-colors focus:border-[#9B1B30] focus:ring-2 focus:ring-[#9B1B30]/20 [&::-webkit-search-cancel-button]:appearance-none"
          />
          <div className="absolute right-3 top-4 flex items-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin text-[#1B2A4A]" aria-hidden="true" />}
            {draft && <button type="button" onClick={() => { setDraft(''); setSuggestions([]); setOpen(false); input.current?.focus(); }} aria-label={t('catalog.clearSearch')} className="p-0.5 text-[#1B2A4A] focus-visible:ring-2 focus-visible:ring-[#9B1B30]"><X className="h-5 w-5" /></button>}
          </div>
          {visible && (
            <div id={`${id}-suggestions`} role="listbox" aria-label={t('catalog.suggestions')} className="absolute inset-x-0 top-full z-40 mt-1 max-h-[min(65vh,28rem)] overflow-y-auto border border-gray-300 bg-white shadow-lg">
              {(['programs', 'universities'] as const).map((kind) => (
                suggestions.some((item) => item.kind === kind) && <div role="group" aria-label={t(`catalog.${kind}`)} key={kind}>
                  <div className="border-b border-gray-100 bg-[#FAFAF8] px-4 py-2 text-xs font-semibold">{t(`catalog.${kind}`)}</div>
                  {suggestions.map((item, position) => item.kind === kind && (
                    <button key={`${item.href}-${position}`} id={`${id}-option-${position}`} role="option" aria-selected={active === position} type="button" tabIndex={-1}
                      onMouseDown={(event) => event.preventDefault()} onMouseEnter={() => setActive(position)} onClick={() => choose(item, position)}
                      className={`block w-full border-b border-gray-100 px-4 py-3 text-left last:border-0 ${active === position ? 'bg-[#9B1B30]/5' : 'hover:bg-[#FAFAF8]'}`}>
                      <span className="block break-words text-sm font-semibold">{item.label}</span>
                      <span className="mt-1 block break-words text-xs text-gray-600">{item.sublabel}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
          <span role="status" aria-live="polite" className="sr-only">{visible ? t('catalog.suggestionCount', { count: suggestions.length }) : ''}</span>
        </div>
        <button type="submit" className="h-14 shrink-0 rounded-none bg-[#9B1B30] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#7A1526] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 sm:px-6">{t('catalog.search')}</button>
      </form>
      {variant === 'directory' && categories}
    </div>
  );
}

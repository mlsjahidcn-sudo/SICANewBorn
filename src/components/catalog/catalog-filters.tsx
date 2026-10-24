'use client';

import { useState, type ReactElement } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { type CatalogFacet, type CatalogFilterKey, type CatalogFilters, type CatalogKind } from '@/lib/catalog-search';

export function catalogValueLabel(key: CatalogFilterKey, value: string, t: (key: string) => string): string {
  if (value === '__none__') return t('catalog.notPublished');
  if (key === 'scholarship') return t('filter.scholarshipOnly');
  if (key === 'tuition') return t(value === '0-20000' ? 'prog.tuitionUnder20k' : value === '20000-40000' ? 'prog.tuition20to40k' : 'prog.tuitionOver40k');
  if (key === 'duration') return t(value === '0-1' ? 'prog.durationUpTo1' : value === '1-2' ? 'prog.duration1to2' : value === '2-3' ? 'prog.duration2to3' : 'prog.durationOver3');
  if (key === 'rating') return `${value}★+`;
  const names: Record<string, string> = {
    Bachelor: 'catalog.bachelor', Master: 'catalog.master', PhD: 'catalog.phd', 'Chinese Language': 'catalog.chineseLanguage',
    Foundation: 'catalog.foundation', 'Non-degree': 'catalog.nonDegree', English: 'catalog.english', Chinese: 'catalog.chinese',
    Bilingual: 'catalog.bilingual', 'To be confirmed': 'catalog.toConfirm', Public: 'catalog.public', Private: 'catalog.private',
    September: 'catalog.september', March: 'catalog.march', Both: 'catalog.bothIntakes', Unknown: 'catalog.toConfirm',
  };
  return names[value] ? t(names[value]) : value;
}

interface Props {
  kind: CatalogKind;
  filters: CatalogFilters;
  facets: Partial<Record<CatalogFilterKey, CatalogFacet[]>>;
  onChange: (filters: CatalogFilters) => void;
}

export function CatalogFiltersPanel({ kind, filters, facets, onChange }: Props): ReactElement {
  const { t, locale } = useI18n();
  const [moreOpen, setMoreOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<CatalogFilters>(filters);
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  const primary: CatalogFilterKey[] = kind === 'programs' ? ['degree', 'language', 'city'] : ['city'];
  const secondary: CatalogFilterKey[] = kind === 'programs' ? ['university', 'discipline', 'scholarship', 'intake', 'year', 'tuition', 'duration'] : ['discipline', 'tag', 'type', 'rating'];
  const secondaryCount = secondary.filter((key) => filters[key]).length;
  const count = Object.keys(filters).length;
  const update = (values: CatalogFilters, key: CatalogFilterKey, value: string): CatalogFilters => {
    const next = { ...values };
    if (value) next[key] = value; else delete next[key];
    return next;
  };
  const control = (key: CatalogFilterKey, values: CatalogFilters, commit: (next: CatalogFilters) => void, inDrawer = false): ReactElement | null => {
    let options = facets[key] ?? [];
    if (key === 'scholarship') options = options.filter((option) => option.value === '1');
    if (!options.length && !values[key]) return null;
    const label = t(`catalog.filter.${key}`);
    const selected = values[key] ?? '';
    if (selected && !options.some((option) => option.value === selected)) options = [...options, { value: selected, label: selected, count: 0 }];
    const optionLabel = (option: CatalogFacet): string => {
      const local = catalogValueLabel(key, option.value, t);
      return local !== option.value ? local : locale === 'zh' ? option.labelCn || option.label || option.value : option.label || option.value;
    };
    if (key === 'university' || key === 'discipline' || (key === 'city' && options.length > 12)) {
      return <div key={key} className="min-w-0" role="group" aria-label={label}>
        <div className="mb-1.5 text-xs font-medium text-gray-600">{label}</div>
        <SearchableSelect value={selected} onChange={(value) => commit(update(values, key, value))}
          options={options.map((option) => ({ value: option.value, label: `${optionLabel(option)} (${option.count})` }))}
          placeholder={t('catalog.all')} searchPlaceholder={`${t('catalog.search')} ${label}`} emptyText={t('catalog.noSuggestions')}
          clearValue="" clearLabel={t('catalog.all')} container={inDrawer ? portal : undefined} className="w-full min-w-0 rounded-none border-gray-300 text-[#1B2A4A]" />
      </div>;
    }
    return <label key={key} className="block min-w-0 text-xs font-medium text-gray-600">
      <span className="mb-1.5 block">{label}</span>
      <select value={selected} onChange={(event) => commit(update(values, key, event.target.value))}
        className="h-10 w-full min-w-0 rounded-none border border-gray-300 bg-white px-2.5 text-sm text-[#1B2A4A] outline-none focus:ring-2 focus:ring-[#9B1B30]/30">
        <option value="">{t('catalog.all')}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{optionLabel(option)} ({option.count})</option>)}
      </select>
    </label>;
  };
  return <div className="border-b border-gray-200 bg-white">
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="hidden items-end gap-3 lg:flex">
        <div className={`grid min-w-0 flex-1 gap-3 ${kind === 'programs' ? 'grid-cols-3' : 'max-w-xs grid-cols-1'}`}>{primary.map((key) => control(key, filters, onChange))}</div>
        <button type="button" aria-expanded={moreOpen} aria-controls="catalog-more-filters" onClick={() => setMoreOpen(!moreOpen)} className="flex h-10 shrink-0 items-center gap-2 border border-gray-300 px-4 text-sm font-medium text-[#1B2A4A] hover:bg-[#FAFAF8] focus-visible:ring-2 focus-visible:ring-[#9B1B30]">
          <SlidersHorizontal className="h-4 w-4" />{t('catalog.moreFilters')}{secondaryCount > 0 ? ` (${secondaryCount})` : ''}
        </button>
      </div>
      {moreOpen && <div id="catalog-more-filters" className="mt-4 hidden grid-cols-3 gap-4 border-t border-gray-200 pt-4 lg:grid">{secondary.map((key) => control(key, filters, onChange))}</div>}
      <div className="lg:hidden">
        <Sheet open={drawerOpen} onOpenChange={(open) => { setDrawerOpen(open); if (open) setDraft({ ...filters }); }}>
          <SheetTrigger asChild><button type="button" className="inline-flex h-11 items-center gap-2 border border-gray-300 px-4 text-sm font-semibold text-[#1B2A4A] focus-visible:ring-2 focus-visible:ring-[#9B1B30]"><SlidersHorizontal className="h-4 w-4" />{t('catalog.filters')}{count ? ` (${count})` : ''}</button></SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85dvh] gap-0 rounded-none" aria-describedby="catalog-filter-description">
            <SheetHeader><SheetTitle>{t('catalog.filters')}</SheetTitle><SheetDescription id="catalog-filter-description">{t('catalog.filterHint')}</SheetDescription></SheetHeader>
            <div ref={setPortal} className="min-h-0 overflow-y-auto px-4 pb-6"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{[...primary, ...secondary].map((key) => control(key, draft, setDraft, true))}</div></div>
            <div className="flex shrink-0 gap-3 border-t border-gray-200 bg-white p-4">
              <button type="button" onClick={() => setDraft({})} className="h-11 border border-gray-300 px-5 text-sm font-semibold text-[#1B2A4A] focus-visible:ring-2 focus-visible:ring-[#9B1B30]">{t('catalog.reset')}</button>
              <button type="button" onClick={() => { onChange(draft); setDrawerOpen(false); }} className="h-11 flex-1 bg-[#9B1B30] px-5 text-sm font-semibold text-white hover:bg-[#7A1526] focus-visible:ring-2 focus-visible:ring-[#1B2A4A]">{t('catalog.applyFilters')}</button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </div>;
}

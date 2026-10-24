'use client';

import { useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { CatalogSearchBox } from './catalog-search-box';
import { useI18n } from '@/lib/i18n';
import { track } from '@/lib/analytics';
import { catalogHref, type CatalogKind } from '@/lib/catalog-search';

export function HomeCatalogSearch(): ReactElement {
  const [kind, setKind] = useState<CatalogKind>('programs');
  const router = useRouter();
  const { t, locale } = useI18n();
  const query = { kind, q: '', filters: {}, sort: 'relevance', page: 1, limit: 24 };
  return <div className="mt-7 border-t-2 border-[#9B1B30] bg-[#FAFAF8] p-4 shadow-[0_16px_48px_-16px_rgba(10,20,40,0.5)] sm:p-6">
    <p className="mb-4 text-base font-semibold text-[#1B2A4A]">{t('catalog.homeTitle')}</p>
    <CatalogSearchBox variant="hero" query={query} onKindChange={setKind} onSearch={(q) => {
      track('search_performed', { surface: kind, term: q, locale });
      router.push(catalogHref({ ...query, q, sort: q ? 'relevance' : kind === 'programs' ? 'default' : 'ranking' }));
    }} />
    <p className="mt-4 text-xs leading-5 text-gray-600">{t('catalog.examples')}</p>
  </div>;
}

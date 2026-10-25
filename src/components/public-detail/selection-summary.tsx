'use client';

import type { ReactElement } from 'react';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { selectionLabel, type CatalogSelection } from '@/lib/catalog-selection';

export function SelectionSummary({ selection, error = false, clearHref }: { selection: CatalogSelection | null; error?: boolean; clearHref?: string }): ReactElement | null {
  const { t, locale } = useI18n();
  if (error) return <div role="alert" className="mb-6 border border-[#9B1B30] bg-white p-4 text-sm text-[#1B2A4A]">{t('detail.selectionError')}{clearHref && <Link className="ml-2 font-semibold underline" href={clearHref}>{t('detail.clearSelection')}</Link>}</div>;
  if (!selection) return null;
  return <div className="mb-6 min-w-0 border border-gray-200 border-l-4 border-l-[#9B1B30] bg-white p-4">
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{t('detail.discussing')}</p>
    <Link href={selection.sourcePath} className="mt-2 block break-words text-sm font-semibold text-[#1B2A4A] hover:underline">{selectionLabel(selection, locale)}</Link>
    {clearHref && <Link href={clearHref} className="mt-2 inline-flex min-h-11 items-center text-xs text-[#9B1B30] underline">{t('detail.clearSelection')}</Link>}
  </div>;
}

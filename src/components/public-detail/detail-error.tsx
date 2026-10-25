'use client';

import type { ReactElement } from 'react';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { detailLink } from './detail-ui';

export function DetailError({ reset, href }: { reset: () => void; href: string }): ReactElement {
  const { t } = useI18n();
  return <div role="alert" className="mx-auto my-16 max-w-xl border border-gray-200 bg-white p-6 sm:p-10">
    <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('detail.loadError')}</h1><p className="mt-3 text-sm leading-7 text-gray-600">{t('detail.loadErrorHelp')}</p>
    <div className="mt-6 flex flex-wrap gap-3"><button onClick={reset} className={detailLink}>{t('common.retry')}</button><Link href={href} className="inline-flex min-h-11 items-center border border-gray-300 px-4 text-sm font-semibold text-[#1B2A4A]">{t('catalog.backToResults')}</Link></div>
  </div>;
}

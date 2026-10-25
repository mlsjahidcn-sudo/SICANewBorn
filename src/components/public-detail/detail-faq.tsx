'use client';

import type { ReactElement } from 'react';

import { useI18n } from '@/lib/i18n';
import { faqSchema, type DetailFaqItem } from '@/lib/program-faq';
import { serializeJsonLd } from '@/lib/json-ld';
import { detailContainer } from './detail-ui';

export function DetailFaq({ items }: { items: DetailFaqItem[] }): ReactElement {
  const { t } = useI18n();
  return <section className={`${detailContainer} py-10`}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema(items)) }} />
    <h2 className="text-2xl font-bold tracking-tight text-[#1B2A4A]">{t('detail.faqTitle')}</h2>
    <dl className="mt-6 grid gap-4 md:grid-cols-2">{items.map((item) => <div key={item.question} className="min-w-0 border border-gray-200 bg-white p-5 sm:p-6"><dt className="font-semibold leading-6 text-[#1B2A4A]">{item.question}</dt><dd className="mt-3 break-words text-sm leading-7 text-gray-600">{item.answer}</dd></div>)}</dl>
  </section>;
}

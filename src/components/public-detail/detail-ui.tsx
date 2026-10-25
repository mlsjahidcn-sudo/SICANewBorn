'use client';

import { useEffect, useRef, useState, type ReactNode, type ReactElement } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, MessageCircle } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '@/lib/i18n';
import { WHATSAPP_PHONE } from '@/lib/contact';
import { track } from '@/lib/analytics';

export const detailContainer = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';
export const detailPanel = 'min-w-0 border border-gray-200 bg-white p-5 sm:p-7';
export const detailLink = 'inline-flex min-h-11 items-center justify-center gap-2 bg-[#9B1B30] px-5 py-3 text-center text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#7A1526] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B1B30] focus-visible:ring-offset-2';
export const detailLinkOnDark = 'inline-flex min-h-11 items-center justify-center gap-2 bg-white px-5 py-3 text-center text-sm font-semibold text-[#1B2A4A] transition-colors duration-150 hover:bg-[#F3F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B2A4A]';

export function detailCounsellingHref(input: {
  universitySlug: string;
  name: string;
  programSlug?: string;
  programName?: string;
}): string {
  const params = new URLSearchParams({
    interest: input.universitySlug,
    interestName: input.programName ?? input.name,
    university: input.universitySlug,
    from: input.programSlug ? `program_${input.programSlug}` : `university_${input.universitySlug}`,
  });
  if (input.programSlug) params.set('program', input.programSlug);
  return `/counselling?${params}#book`;
}

export function useDetailSection(keys: readonly string[]): [string, (value: string) => void] {
  const sp = useSearchParams();
  const pathname = usePathname();
  const { locale } = useI18n();
  const lastView = useRef('');
  const lastSection = useRef('');
  const fromUrl = sp.get('section') ?? '';
  const keyList = keys.join('|');
  const resolved = keys.includes(fromUrl) ? fromUrl : keys[0];
  const [active, setActive] = useState(resolved);

  useEffect(() => {
    const [, kind, slug] = pathname.split('/');
    if (kind !== 'programs' && kind !== 'universities') return;
    const identity = `${pathname}:${locale}`;
    if (lastView.current !== identity) {
      track('detail_view', { kind, slug, locale });
      lastView.current = identity;
    }
    if (lastSection.current !== `${identity}:${active}`) {
      track('detail_section_view', { kind, slug, section: active, locale });
      lastSection.current = `${identity}:${active}`;
    }
  }, [pathname, locale, active]);

  useEffect(() => {
    const list = keyList.split('|');
    setActive(list.includes(fromUrl) ? fromUrl : list[0] ?? 'overview');
  }, [fromUrl, keyList]);

  const select = (value: string): void => {
    const next = keys.includes(value) ? value : keys[0];
    setActive(next);
    const url = new URL(window.location.href);
    if (next === keys[0]) url.searchParams.delete('section');
    else url.searchParams.set('section', next);
    window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
  };

  return [active, select];
}

export function DetailNav({ sections, active }: { sections: { key: string; label: string }[]; active: string }): ReactElement {
  const { t, locale } = useI18n();
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const current = list.current?.querySelector<HTMLElement>('[data-state="active"]');
    if (current && list.current) {
      const box = current.getBoundingClientRect();
      const outer = list.current.getBoundingClientRect();
      if (box.left < outer.left || box.right > outer.right) {
        list.current.scrollTo({ left: list.current.scrollLeft + box.left - outer.left - 16, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    }
  }, [active, locale]);

  return (
    <div id="detail-section-nav" className="sticky top-16 z-30 scroll-mt-16 border-b border-gray-200 bg-[#FAFAF8]/95 backdrop-blur-sm">
      <div className={detailContainer}>
        <div ref={list} className="min-w-0 overflow-x-auto border-r-2 border-gray-200 lg:border-r-0">
          <TabsList aria-label={t('detail.pageSections')} className="h-auto min-w-max justify-start gap-0 rounded-none bg-transparent p-0">
            {sections.map((section) => (
              <TabsTrigger
                key={section.key}
                value={section.key}
                className="h-auto flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-4 py-4 text-sm font-medium text-gray-500 shadow-none data-[state=active]:border-[#9B1B30] data-[state=active]:bg-transparent data-[state=active]:text-[#9B1B30] data-[state=active]:shadow-none"
              >
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>
    </div>
  );
}

export function DetailBack({ href, children }: { href: string; children: ReactNode }): ReactElement {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className={`${detailContainer} py-1 sm:py-2`}>
        <Link href={href} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#9B1B30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B1B30]">
          <ArrowLeft className="h-4 w-4 text-[#1B2A4A]" />
          {children}
        </Link>
      </div>
    </div>
  );
}

export function DetailFacts({ facts }: { facts: { label: string; value: string; badge?: boolean }[] }): ReactElement | null {
  if (facts.length === 0) return null;
  const columns = facts.length >= 4 ? 'sm:grid-cols-4' : facts.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';
  return (
    <dl className={`grid grid-cols-2 border border-gray-200 bg-white shadow-sm ${columns}`}>
      {facts.map((fact) => (
        <div key={fact.label} className="min-w-0 border-b border-gray-100 p-3 even:border-l sm:border-b-0 sm:border-l sm:first:border-l-0 sm:p-5">
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{fact.label}</dt>
          <dd className="mt-1.5 break-words text-sm font-semibold leading-relaxed text-[#1B2A4A] sm:text-base">
            {fact.badge ? <span className="inline-flex bg-[#D4A853] px-2 py-0.5 text-[#1B2A4A]">{fact.value}</span> : fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function DetailSection({ title, lede, children }: { title: string; lede?: string; children?: ReactNode }): ReactElement {
  return (
    <section className={detailPanel}>
      <h2 className="text-2xl font-bold tracking-tight text-[#1B2A4A]">{title}</h2>
      {lede ? <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">{lede}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

export function DetailSpec({ rows }: { rows: { label: string; value: string }[] }): ReactElement {
  return (
    <dl className="divide-y divide-gray-100 border-t border-gray-100">
      {rows.map((row) => (
        <div key={row.label} className="grid gap-1 py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
          <dt className="text-sm text-gray-500">{row.label}</dt>
          <dd className="break-words text-sm font-semibold leading-6 text-[#1B2A4A]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DetailNotice({ title, children }: { title: string; children: ReactNode }): ReactElement {
  return (
    <div className="border border-gray-200 border-l-4 border-l-[#9B1B30] bg-white p-5">
      <h3 className="font-semibold text-[#1B2A4A]">{title}</h3>
      <div className="mt-2 text-sm leading-6 text-gray-600">{children}</div>
    </div>
  );
}

export function DetailSupport({ name, universitySlug, programSlug, programName }: { name: string; universitySlug: string; programSlug?: string; programName?: string }): ReactElement {
  const { t, locale } = useI18n();
  const href = detailCounsellingHref({ universitySlug, name, programSlug, programName });
  const assessment = new URLSearchParams({ university: universitySlug, interest: universitySlug });
  if (programSlug) {
    assessment.set('program', programSlug);
    assessment.set('major', programName ?? name);
  }
  const whatsapp = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`Hi SICA, I'd like guidance about ${programName ? `${programName} at ` : ''}${name}.`)}`;
  const slug = programSlug ?? universitySlug;

  return (
    <div className="border border-gray-200 bg-white shadow-sm">
      <div className="border-t-4 border-t-[#9B1B30] px-5 pb-5 pt-5 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{t('detail.withSica')}</p>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-[#1B2A4A]">{t('detail.planApplication')}</h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">{t('detail.supportDescription')}</p>
        <ul className="my-5 space-y-3">
          {['detail.checkEligibility', 'detail.reviewDocuments', 'detail.confirmCosts'].map((key) => (
            <li key={key} className="flex items-start gap-2.5 text-sm leading-6 text-gray-600">
              <Check className="mt-1 h-4 w-4 shrink-0 text-[#1B2A4A]" />
              {t(key)}
            </li>
          ))}
        </ul>
        <Link href={href} onClick={() => track('apply_click', { location: 'detail_consultation', slug, locale })} className={`${detailLink} w-full`}>
          {t('consultationCta.ctaPrimary')}
        </Link>
        <Link href={`/assessment?${assessment}#assessment-form`} className="mt-3 flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-[#9B1B30] hover:underline">
          {t('detail.startAssessment')}
          <ArrowRight className="h-4 w-4 text-[#1B2A4A]" />
        </Link>
        <div className="mt-3 border-t border-gray-100 pt-4">
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_click', { location: 'detail_support', slug, locale })} className="flex min-h-11 items-center justify-center gap-2 text-sm font-medium text-[#1B2A4A] hover:underline">
            <MessageCircle className="h-4 w-4" />
            {t('detail.askWhatsapp')}
          </a>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { BookOpen, CalendarClock } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { track } from '@/lib/analytics';
import { I18nProvider } from '@/lib/i18n';

/**
 * Sitewide conversion block — primary CTA is the China Admission Kit
 * landing page; free counselling remains the secondary path.
 *
 * Wraps itself in a local I18nProvider so it renders correctly on
 * public guide pages (which don't have an outer provider).
 *
 * Variants:
 *  - `inline` (default): bordered navy card used inside GuidePage
 *  - `hero`: compact two-button row for the homepage hero band
 *
 * The `slug` prop lands in `?from=<slug>` for attribution.
 */
export function ConsultationCta({
  slug,
  variant = 'inline',
}: {
  slug?: string;
  variant?: 'inline' | 'hero';
}) {
  return (
    <I18nProvider initialLocale="en">
      <ConsultationCtaInner slug={slug} variant={variant} />
    </I18nProvider>
  );
}

function ConsultationCtaInner({
  slug,
  variant,
}: {
  slug?: string;
  variant: 'inline' | 'hero';
}) {
  const { t, locale } = useI18n();
  const from = slug ?? 'generic';
  const kitHref = slug
    ? `/china-admission-kit?from=${encodeURIComponent(slug)}`
    : '/china-admission-kit';
  const counsellingHref = slug
    ? `/counselling?from=${encodeURIComponent(slug)}`
    : '/counselling';

  const onPrimaryClick = () => {
    track('apply_click', { location: `kit_${from}`, slug: slug ?? 'none', locale });
  };

  if (variant === 'hero') {
    return (
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
        <Link
          href={kitHref}
          onClick={onPrimaryClick}
          className="inline-flex min-h-11 items-center gap-2.5 text-sm font-medium text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span className="flex h-7 w-7 items-center justify-center bg-white/90">
            <BookOpen className="h-4 w-4 text-[#1B2A4A]" />
          </span>
          {t('consultationCta.ctaPrimary')}
        </Link>
        <Link
          href={counsellingHref}
          className="inline-flex min-h-11 items-center gap-2.5 text-sm font-medium text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span className="flex h-7 w-7 items-center justify-center bg-white/90">
            <CalendarClock className="h-4 w-4 text-[#1B2A4A]" />
          </span>
          {t('consultationCta.ctaSecondary')}
        </Link>
      </div>
    );
  }

  return (
    <section className="bg-[#1B2A4A] p-6 text-white sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#D4A853]">
            {t('consultationCta.eyebrow')}
          </div>
          <h2 className="mb-2 text-xl font-bold sm:text-2xl">
            {t('consultationCta.title')}
          </h2>
          <p className="text-sm leading-relaxed text-gray-300">
            {t('consultationCta.subtitle')}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Link
            href={kitHref}
            onClick={onPrimaryClick}
            className="inline-flex items-center justify-center gap-2 bg-[#9B1B30] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#7A1526]"
          >
            <BookOpen className="h-4 w-4" />
            {t('consultationCta.ctaPrimary')}
          </Link>
          <Link
            href={counsellingHref}
            className="inline-flex items-center justify-center gap-2 border-2 border-white/40 px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:border-white"
          >
            <CalendarClock className="h-4 w-4" />
            {t('consultationCta.ctaSecondary')}
          </Link>
        </div>
      </div>
    </section>
  );
}

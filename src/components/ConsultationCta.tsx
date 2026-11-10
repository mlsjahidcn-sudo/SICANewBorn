'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { track } from '@/lib/analytics';
import { I18nProvider } from '@/lib/i18n';

/**
 * Sitewide conversion block — primary CTA is the China Admission Kit.
 * Buy-focused: no counselling secondary on this surface.
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

  const onPrimaryClick = () => {
    track('apply_click', { location: `kit_${from}`, slug: slug ?? 'none', locale });
  };

  if (variant === 'hero') {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <Link
          href={kitHref}
          onClick={onPrimaryClick}
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#9B1B30] px-7 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#7A1526] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B2A4A]"
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          {t('consultationCta.ctaPrimary')}
        </Link>
        <p className="max-w-xs text-sm leading-snug text-white/70">
          {t('consultationCta.subtitle')}
        </p>
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
        </div>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { CalendarClock, MessageCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { WHATSAPP_PHONE } from '@/lib/contact';
import { track } from '@/lib/analytics';
import { I18nProvider } from '@/lib/i18n';

/**
 * Phase 147 (Task 7): the sitewide conversion block for the free
 * 10-minute consultation at /counselling — the site's single
 * conversion goal per the 2026-10-08 SEO brief.
 *
 * Wraps itself in a local I18nProvider so it renders correctly on
 * public guide pages (which don't have an outer provider). Uses
 * `useI18n()` for copy and the `apply_click` / `whatsapp_click` GA
 * events.
 *
 * Variants:
 *  - `inline` (default): bordered navy card used inside GuidePage
 *    above the FAQ — renders on every guide / csca / listicle page.
 *  - `hero`: compact two-button row for the homepage hero band.
 *
 * The `slug` prop lands in the /counselling?from=<slug> param and in
 * the GA event so funnel attribution survives.
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
  const href = slug ? `/counselling?from=${encodeURIComponent(slug)}` : '/counselling';
  const whatsapp = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    "Hi SICA, I'd like to book a free 10-minute consultation about studying in China.",
  )}`;

  const onPrimaryClick = () => {
    track('apply_click', { location: `consultation_${from}`, slug: slug ?? 'none', locale });
  };
  const onWhatsappClick = () => {
    track('whatsapp_click', { location: `consultation_${from}`, locale });
  };

  if (variant === 'hero') {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={href}
          onClick={onPrimaryClick}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold uppercase tracking-wider text-sm transition-colors"
        >
          <CalendarClock className="h-4 w-4" />
          {t('consultationCta.ctaPrimary')}
        </Link>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onWhatsappClick}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white/50 hover:border-white text-white font-semibold uppercase tracking-wider text-sm transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    );
  }

  return (
    <section className="bg-[#1B2A4A] text-white p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-wider text-[#D4A853] mb-2">
            {t('consultationCta.eyebrow')}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            {t('consultationCta.title')}
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            {t('consultationCta.subtitle')}
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <Link
            href={href}
            onClick={onPrimaryClick}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#9B1B30] hover:bg-[#7A1526] text-white text-sm font-semibold uppercase tracking-wider transition-colors"
          >
            <CalendarClock className="h-4 w-4" />
            {t('consultationCta.ctaPrimary')}
          </Link>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onWhatsappClick}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border-2 border-white/40 hover:border-white text-white text-sm font-semibold uppercase tracking-wider transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            {t('consultationCta.ctaSecondary')}
          </a>
        </div>
      </div>
    </section>
  );
}
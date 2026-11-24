'use client';

import type { ReactElement } from 'react';

import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { WHATSAPP_PHONE } from '@/lib/contact';
import { track, type BookingSurface } from '@/lib/analytics';
import { BookingWizard } from '@/components/counselling/booking-wizard';
import { detailCounsellingHref } from '@/components/public-detail/detail-ui';
import type { CatalogSelection } from '@/lib/catalog-selection';

/**
 * The sidebar card on the university and program detail pages.
 *
 * It carries the free 10-minute consultation booking itself — the visitor
 * picks a date, picks a time and leaves their details without leaving the
 * page they came from. The booking is attached to the university (and, on a
 * program page, the program) they were reading, so the admin sees a lead
 * that already knows what it is about.
 *
 * The form is the same `BookingWizard` the /counselling page uses, in its
 * `compact` layout. One implementation, two placements.
 */
export function ConsultationBookingCard({
  selection,
  name,
  surface,
  kitHref,
}: {
  /** The catalog entry this booking is about — sent to the API and shown to the visitor. */
  selection: CatalogSelection;
  /** Localized display name, used in the WhatsApp pre-fill. */
  name: string;
  /** Which detail page rendered the card — tags the GA funnel events. */
  surface: Exclude<BookingSurface, 'counselling'>;
  /** The paid China Admission Kit — kept reachable from the card it replaced. */
  kitHref?: string;
}): ReactElement {
  const { t, locale } = useI18n();
  const slug = selection.programSlug ?? selection.universitySlug;

  const assessment = new URLSearchParams({ university: selection.universitySlug, interest: selection.universitySlug });
  if (selection.programSlug) {
    assessment.set('program', selection.programSlug);
    assessment.set('major', selection.programName ?? name);
  }
  const whatsapp = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    `Hi SICA, I'd like guidance about ${selection.programName ? `${selection.programName} at ` : ''}${name}.`,
  )}`;

  return (
    <section
      data-booking-anchor
      tabIndex={-1}
      className="scroll-mt-24 border border-gray-200 border-t-4 border-t-[#9B1B30] bg-white shadow-sm"
    >
      <div className="px-5 pb-4 pt-5 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{t('detail.withSica')}</p>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-[#1B2A4A]">{t('consultationBooking.title')}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">{t('consultationBooking.subtitle')}</p>
      </div>

      {/* The form itself — no separate border or padding, the card is the box. */}
      <div className="border-t border-gray-100 px-5 pb-5 pt-5 sm:px-6">
        <BookingWizard selection={selection} variant="compact" surface={surface} />
      </div>

      <div className="border-t border-gray-100 px-5 pb-5 pt-4 sm:px-6">
        {kitHref ? (
          <Link
            href={kitHref}
            className="flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-[#9B1B30] hover:underline"
          >
            {t('consultationCta.ctaPrimary')}
            <ArrowRight className="h-4 w-4 text-[#1B2A4A]" />
          </Link>
        ) : null}
        <Link
          href={`/assessment?${assessment}#assessment-form`}
          className="flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-[#9B1B30] hover:underline"
        >
          {t('detail.startAssessment')}
          <ArrowRight className="h-4 w-4 text-[#1B2A4A]" />
        </Link>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('whatsapp_click', { location: 'detail_support', slug, locale })}
          className="mt-2 flex min-h-11 items-center justify-center gap-2 text-sm font-medium text-[#1B2A4A] hover:underline"
        >
          <MessageCircle className="h-4 w-4" />
          {t('detail.askWhatsapp')}
        </a>
        {/* The dedicated booking page stays reachable — it explains the
            session itself and is the target of the footer/sitemap links.
            It carries the same selection so the visitor does not lose it. */}
        <Link
          href={detailCounsellingHref({
            universitySlug: selection.universitySlug,
            name,
            programSlug: selection.programSlug,
            programName: selection.programName,
          })}
          className="mt-2 flex min-h-11 items-center justify-center text-xs text-gray-500 hover:underline"
        >
          {t('consultationBooking.allOptions')}
        </Link>
      </div>
    </section>
  );
}

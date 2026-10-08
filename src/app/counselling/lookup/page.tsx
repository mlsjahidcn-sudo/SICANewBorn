import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import { getServerT } from '@/lib/server-t';
import { buildServiceClient } from '@/lib/supabase-auth';
import { mapCounsellingBookingFromDb } from '@/lib/counselling-mapper';
import { BEIJING_OFFSET_MS } from '@/lib/counselling-slots';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ reference?: string; email?: string }>;
}

/**
 * Public self-service lookup at /counselling/lookup (Phase 152 #9).
 *
 * RSC reads ?reference=…&email=… from the URL (the form on the page
 * is a plain HTML <form method="get"> — no JS required for the
 * happy path). If both are present + valid + match a row, we render
 * a status card with the mapped booking. Otherwise we render the
 * empty form + the explanatory copy.
 *
 * No index: this is a PII surface (returns name/email/phone/slot
 * for whoever holds the reference + email pair).
 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const t = await getServerT();
  const { reference, email } = await searchParams;
  const hasQuery = Boolean(reference && email);
  return {
    title: hasQuery
      ? `${t('counsellingLookup.statusHeading')} · SICA`
      : `${t('counsellingLookup.title')} · SICA`,
    description: t('counsellingLookup.subtitle'),
    alternates: buildLanguageAlternates('/counselling/lookup'),
    robots: { index: false, follow: false },
  };
}

export default async function LookupPage({ searchParams }: PageProps) {
  const t = await getServerT();
  const { reference: refRaw, email: emailRaw } = await searchParams;

  const reference = (refRaw ?? '').trim();
  const email = (emailRaw ?? '').trim().toLowerCase();

  let booking: ReturnType<typeof mapCounsellingBookingFromDb> | null = null;
  let notFound = false;

  if (reference && email) {
    const supabase = buildServiceClient();
    if (supabase) {
      const { data: row } = await supabase
        .from('counselling_bookings')
        .select('*')
        .eq('reference', reference.toUpperCase())
        .ilike('email', email)
        .maybeSingle();
      if (row) {
        booking = mapCounsellingBookingFromDb(row as Record<string, unknown>);
      } else {
        notFound = true;
      }
    } else {
      notFound = true;
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-4 py-12">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] mb-2">
          {booking ? t('counsellingLookup.statusHeading') : t('counsellingLookup.title')}
        </h1>
        <p className="text-sm text-[#4B5563] mb-6">{t('counsellingLookup.subtitle')}</p>

        {notFound && (
          <div
            role="alert"
            className="mb-6 bg-white border border-[#9B1B30] text-[#9B1B30] px-4 py-3 text-sm"
          >
            {t('counsellingLookup.notFound')}
          </div>
        )}

        {booking ? renderStatusCard(booking, t) : renderLookupForm(t)}
      </div>
    </main>
  );
}

/* ---------------------------------------------------------------- *
 * Render helpers — these would normally live in a sibling component,
 * but the lookup page is one-shot and SSR-only so a private function
 * per render path keeps the data flow obvious.
 * ---------------------------------------------------------------- */

type T = (key: string, vars?: Record<string, string>) => string;

/**
 * Format an ISO instant into "Mon, 1 Dec 2026 · 09:00-09:10 (GMT+8)".
 * Mirrors the format used by /counselling/respond + the email
 * templates. Phase 152: keep this page self-contained so the
 * lookup doesn't pull the whole `Intl.DateTimeFormat` setup into
 * the client island.
 */
function formatBeijingSlotLabel(isoInstant: string): string {
  const start = new Date(isoInstant);
  const shifted = new Date(start.getTime() + BEIJING_OFFSET_MS);
  const day = `${shifted.getUTCFullYear()}-${pad2(shifted.getUTCMonth() + 1)}-${pad2(shifted.getUTCDate())}`;
  const hhmm = (d: Date) =>
    `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
  return `${day} · ${hhmm(shifted)}-${hhmm(new Date(shifted.getTime() + 10 * 60 * 1000))} (GMT+8)`;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function renderLookupForm(t: T) {
  return (
    <form
      method="get"
      action="/counselling/lookup"
      className="bg-white border border-gray-200 p-6 sm:p-8"
    >
      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute opacity-0 pointer-events-none h-0 w-0"
        aria-hidden="true"
      />
      <label className="block mb-4">
        <span className="block text-xs uppercase tracking-wider font-semibold text-[#1B2A4A] mb-2">
          {t('counsellingLookup.referenceLabel')}
        </span>
        <input
          name="reference"
          type="text"
          required
          pattern="CS-\d{8}-[A-Z0-9]{4}"
          autoComplete="off"
          placeholder={t('counsellingLookup.referencePlaceholder')}
          className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#1B2A4A] focus:outline-none"
        />
      </label>
      <label className="block mb-6">
        <span className="block text-xs uppercase tracking-wider font-semibold text-[#1B2A4A] mb-2">
          {t('counsellingLookup.emailLabel')}
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t('counsellingLookup.emailPlaceholder')}
          className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#1B2A4A] focus:outline-none"
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center bg-[#9B1B30] hover:bg-[#7A1526] text-white text-sm uppercase tracking-wider font-semibold px-6 py-2 transition-colors"
      >
        {t('counsellingLookup.submit')}
      </button>
    </form>
  );
}

function renderStatusCard(
  booking: ReturnType<typeof mapCounsellingBookingFromDb>,
  t: T,
) {
  const slotIso = booking.proposedSlotStart ?? booking.slotStart;
  const slotLabel = slotIso ? formatBeijingSlotLabel(slotIso) : null;
  const statusMessage = pickStatusMessage(booking.status, t);

  return (
    <div className="bg-white border border-gray-200 p-6 sm:p-8">
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#4B5563]">
          {booking.reference}
        </span>
        <span className="text-xs uppercase tracking-wider font-semibold text-[#1B2A4A]">
          {booking.status}
        </span>
      </div>
      <p className="text-sm text-[#4B5563] mb-6">{statusMessage}</p>

      {slotLabel && (
        <div className="mb-4">
          <div className="text-xs uppercase tracking-wider font-semibold text-[#4B5563] mb-1">
            {booking.proposedSlotStart && booking.status === 'Proposed'
              ? t('counsellingLookup.proposedSlotLabel')
              : t('counsellingLookup.slotLabel')}
          </div>
          <div className="text-sm text-[#1B2A4A]">{slotLabel}</div>
        </div>
      )}

      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider font-semibold text-[#4B5563] mb-1">
          {t('counsellingLookup.meetingLink')}
        </div>
        {booking.meetingLink ? (
          <a
            href={booking.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#1B2A4A] underline break-all"
          >
            {booking.meetingLink}
          </a>
        ) : (
          <div className="text-sm text-[#4B5563] italic">
            {t('counsellingLookup.meetingLinkNone')}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {booking.status === 'Proposed' && booking.proposedSlotStart && (
          // The student already has the magic link in their email.
          // This button gives them a one-click reminder to find it.
          <a
            href="/counselling/respond"
            className="inline-flex items-center justify-center bg-[#1B2A4A] hover:bg-[#0F1B33] text-white text-sm uppercase tracking-wider font-semibold px-6 py-2 transition-colors"
          >
            {t('counsellingLookup.openEmail')}
          </a>
        )}
        <a
          href="/counselling"
          className="inline-flex items-center justify-center border-2 border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white text-sm uppercase tracking-wider font-semibold px-6 py-2 transition-colors"
        >
          {t('counsellingLookup.bookAnother')}
        </a>
      </div>
    </div>
  );
}

function pickStatusMessage(
  status: ReturnType<typeof mapCounsellingBookingFromDb>['status'],
  t: T,
): string {
  switch (status) {
    case 'Pending':
      return t('counsellingLookup.statusPending');
    case 'Proposed':
      return t('counsellingLookup.statusProposed');
    case 'Confirmed':
      return t('counsellingLookup.statusConfirmed');
    case 'Completed':
      return t('counsellingLookup.statusCompleted');
    case 'Cancelled':
      return t('counsellingLookup.statusCancelled');
    case 'No-show':
      return t('counsellingLookup.statusNoShow');
    default:
      return '';
  }
}

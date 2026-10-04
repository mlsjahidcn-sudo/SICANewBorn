import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import { getServerT } from '@/lib/server-t';
import { buildServiceClient } from '@/lib/supabase-auth';
import { RespondClient } from './RespondClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ token?: string; action?: string }>;
}

/**
 * Public /counselling/respond (Phase 125). RSC shell resolves the
 * booking row by its single-use token (no login) and hands the props
 * to the RespondClient island for accept/counter/decline POSTs.
 *
 * Tokens that don't resolve, are expired, or whose row has already
 * moved past 'Proposed' render a small error card with a CTA back to
 * /counselling.
 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('counselling.respondTitle'),
    description: t('counselling.respondSubtitle'),
    alternates: buildLanguageAlternates('/counselling/respond'),
    robots: { index: false },
  };
}

export default async function RespondPage({ searchParams }: PageProps) {
  const t = await getServerT();
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] px-4 py-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-gray-200 p-8 text-center">
          <h1 className="text-xl font-bold text-[#1B2A4A] mb-2">
            {t('counselling.respondInvalidTitle')}
          </h1>
          <p className="text-sm text-[#4B5563]">{t('counselling.respondInvalidBody')}</p>
          <a
            href="/counselling"
            className="inline-block mt-6 px-6 py-2 bg-[#9B1B30] text-white text-sm uppercase tracking-wider font-semibold"
          >
            {t('counselling.respondBookNew')}
          </a>
        </div>
      </main>
    );
  }

  const supabase = buildServiceClient();
  if (!supabase) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] px-4 py-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-gray-200 p-8 text-center">
          <h1 className="text-xl font-bold text-[#1B2A4A] mb-2">
            {t('counselling.errorGeneric')}
          </h1>
          <p className="text-sm text-[#4B5563]">{t('counselling.respondInvalidBody')}</p>
        </div>
      </main>
    );
  }

  const { data: row } = await supabase
    .from('counselling_bookings')
    .select(
      'id, status, email, name, reference, slot_start, proposed_slot_start, proposal_token, proposal_expires_at, meeting_link, locale',
    )
    .eq('proposal_token', token)
    .maybeSingle();

  if (
    !row ||
    !row.proposed_slot_start ||
    !row.proposal_expires_at ||
    row.status !== 'Proposed'
  ) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] px-4 py-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-gray-200 p-8 text-center">
          <h1 className="text-xl font-bold text-[#1B2A4A] mb-2">
            {t('counselling.respondInvalidTitle')}
          </h1>
          <p className="text-sm text-[#4B5563]">{t('counselling.respondInvalidBody')}</p>
          <a
            href="/counselling"
            className="inline-block mt-6 px-6 py-2 bg-[#9B1B30] text-white text-sm uppercase tracking-wider font-semibold"
          >
            {t('counselling.respondBookNew')}
          </a>
        </div>
      </main>
    );
  }

  if (row.status !== 'Proposed') {
    return (
      <main className="min-h-screen bg-[#FAFAF8] px-4 py-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-gray-200 p-8 text-center">
          <h1 className="text-xl font-bold text-[#1B2A4A] mb-2">
            {t('counselling.respondInvalidTitle')}
          </h1>
          <p className="text-sm text-[#4B5563]">{t('counselling.respondInvalidBody')}</p>
          <a
            href="/counselling"
            className="inline-block mt-6 px-6 py-2 bg-[#9B1B30] text-white text-sm uppercase tracking-wider font-semibold"
          >
            {t('counselling.respondBookNew')}
          </a>
        </div>
      </main>
    );
  }

  const expiresAt = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(row.proposal_expires_at));

  // Same Beijing-time formatting the email pipeline uses (counselling
  // bookings always render wall-clock for Beijing since slots are stored
  // as absolute instants but referenced in Asia/Shanghai by the UI).
  const start = new Date(row.proposed_slot_start);
  const day = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(start);
  const hhmm = (d: Date) =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Shanghai',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  const end = new Date(start.getTime() + 10 * 60 * 1000);
  const proposedSlotLabel = `${day}, ${hhmm(start)}-${hhmm(end)} Beijing time (GMT+8)`;

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-4 py-12 flex items-center justify-center">
      <div className="max-w-lg w-full">
        <h1 className="text-2xl font-bold text-[#1B2A4A] mb-4">
          {t('counselling.respondHeading')}
        </h1>
        <div className="bg-white border border-gray-200 p-6 sm:p-8">
          <RespondClient
            token={token}
            reference={row.reference}
            studentName={row.name}
            proposedSlotIso={row.proposed_slot_start}
            proposedSlotLabel={proposedSlotLabel}
            expiresAtIso={expiresAt}
            locale={row.locale === 'zh' ? 'zh' : 'en'}
            adminUrl={'/admin/counselling'}
          />
        </div>
      </div>
    </main>
  );
}

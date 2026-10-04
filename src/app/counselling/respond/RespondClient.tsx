'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, MessageCircle, XCircle, CalendarClock, AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { track } from '@/lib/analytics';

interface RespondClientProps {
  token: string;
  reference: string;
  studentName: string;
  proposedSlotIso: string;
  proposedSlotLabel: string;
  expiresAtIso: string;
  locale: string;
  adminUrl: string;
}

/**
 * Client island for /counselling/respond (Phase 125). Reads the
 * server-resolved proposed slot + reference, lets the student accept /
 * counter-pick / decline. The slot-picker for the counter-pick path
 * reuses /api/counselling/slots like the booking wizard does.
 */
export function RespondClient(props: RespondClientProps) {
  const { t, locale } = useI18n();
  const [stage, setStage] = useState<'view' | 'picker' | 'submitting'>('view');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<'accept' | 'counter' | 'decline' | 'error' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<{ start: string; label: string; available: boolean }[]>([]);
  const [pickedStart, setPickedStart] = useState<string | null>(null);
  const [loadingDates, setLoadingDates] = useState(false);

  const submit = async (action: 'accept' | 'counter' | 'decline', newSlotStartIso?: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/counselling/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: props.token, action, newSlotStartIso, website: '' }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || t('counselling.errorGeneric'));
      }
      setResult(action);
      track('counselling_proposal_response', { outcome: action, reference: props.reference });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('counselling.errorGeneric'));
      setResult('error');
    } finally {
      setSubmitting(false);
    }
  };

  const openPicker = async () => {
    setStage('picker');
    if (dates.length > 0) return;
    setLoadingDates(true);
    try {
      const res = await fetch('/api/counselling/slots');
      const data = (await res.json()) as { dates?: string[] };
      const list = data.dates ?? [];
      setDates(list);
      setDate(list[0] ?? null);
    } finally {
      setLoadingDates(false);
    }
  };

  if (date && stage === 'picker') {
    if (slots.length === 0) {
      void fetch(`/api/counselling/slots?date=${date}`)
        .then((r) => r.json())
        .then((d) => setSlots(d.slots ?? []));
    }
  }

  if (result === 'accept') {
    return (
      <Result
        kind="accept"
        title={t('counselling.respondAcceptTitle')}
        body={t('counselling.respondAcceptBody', { reference: props.reference })}
        locale={locale}
      />
    );
  }
  if (result === 'counter') {
    return (
      <Result
        kind="counter"
        title={t('counselling.respondCounterTitle')}
        body={t('counselling.respondCounterBody')}
        locale={locale}
      />
    );
  }
  if (result === 'decline') {
    return (
      <Result
        kind="decline"
        title={t('counselling.respondDeclineTitle')}
        body={t('counselling.respondDeclineBody')}
        locale={locale}
      />
    );
  }
  if (result === 'error' && error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 flex items-start gap-2">
        <AlertCircle className="h-5 w-5 mt-0.5" />
        <div>
          <h3 className="font-semibold">{t('counselling.respondErrorTitle')}</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (stage === 'picker') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1F2937] mb-1">
            {t('counselling.respondPickDate')}
          </label>
          {loadingDates && dates.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('counselling.loading')}
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDate(d);
                    setSlots([]);
                    setPickedStart(null);
                  }}
                  className={`flex-shrink-0 border px-4 py-2 text-sm font-medium transition-colors ${
                    date === d
                      ? 'border-[#9B1B30] bg-[#9B1B30] text-white'
                      : 'border-gray-300 bg-white text-[#1F2937] hover:border-[#9B1B30] hover:text-[#9B1B30]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1F2937] mb-1">
            {t('counselling.respondPickSlot')}
          </label>
          {slots.length === 0 ? (
            <div className="text-sm text-gray-500 py-2">{t('counselling.loading')}</div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {slots.map((s) => (
                <button
                  key={s.start}
                  type="button"
                  disabled={!s.available}
                  onClick={() => setPickedStart(s.start)}
                  className={`border px-2 py-2 text-sm font-medium transition-colors ${
                    pickedStart === s.start
                      ? 'border-[#9B1B30] bg-[#9B1B30] text-white'
                      : s.available
                        ? 'border-gray-300 bg-white text-[#1F2937] hover:border-[#9B1B30] hover:text-[#9B1B30]'
                        : 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setStage('view')}
            className="px-4 py-2 border border-gray-300 text-sm"
          >
            {t('counselling.cancelEdit')}
          </button>
          <button
            type="button"
            disabled={!pickedStart || submitting}
            onClick={() => submit('counter', pickedStart ?? undefined)}
            className="px-6 py-2 bg-[#9B1B30] text-white text-sm uppercase tracking-wider font-semibold disabled:opacity-50"
          >
            {submitting ? t('counselling.sending') : t('counselling.respondCounterSave')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-[#4B5563]">
        {t('counselling.respondIntro', { reference: props.reference, name: props.studentName })}
      </p>
      <div className="bg-[#FAFAF8] border border-gray-200 p-5">
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 text-[#1B2A4A]" />
          {t('counselling.respondProposedTime')}
        </div>
        <div className="text-lg font-semibold text-[#1B2A4A]">{props.proposedSlotLabel}</div>
        <div className="text-xs text-gray-500 mt-1">
          {t('counselling.respondExpiresAt', { expiresAt: props.expiresAtIso })}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => void submit('accept')}
          disabled={submitting}
          className="px-5 py-3 bg-[#1B2A4A] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#14203A] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          {t('counselling.respondAccept')}
        </button>
        <button
          type="button"
          onClick={() => void openPicker()}
          disabled={submitting}
          className="px-5 py-3 border-2 border-[#9B1B30] text-[#9B1B30] font-semibold uppercase tracking-wider text-sm hover:bg-[#9B1B30]/5 disabled:opacity-50"
        >
          {t('counselling.respondCounter')}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            t('counselling.respondWhatsappMessage', { reference: props.reference }),
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-3 border-2 border-[#25D366] text-[#128C4B] font-semibold uppercase tracking-wider text-sm hover:bg-[#25D366]/10 flex items-center justify-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          {t('counselling.respondWhatsapp')}
        </a>
        <button
          type="button"
          onClick={() => void submit('decline')}
          disabled={submitting}
          className="px-5 py-3 border border-gray-300 text-sm text-gray-600 hover:text-red-600 hover:border-red-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          {t('counselling.respondDecline')}
        </button>
      </div>
      <div className="pt-2 border-t border-gray-100">
        <Link href="/" className="text-xs text-gray-500 hover:text-[#1B2A4A]">
          {t('counselling.backHome')}
        </Link>
      </div>
    </div>
  );
}

function Result(props: {
  kind: 'accept' | 'counter' | 'decline';
  title: string;
  body: string;
  locale: string;
}) {
  const { t } = useI18n();
  const Icon =
    props.kind === 'accept' ? CheckCircle2 : props.kind === 'counter' ? CalendarClock : MessageCircle;
  return (
    <div className="text-center bg-white border border-gray-200 p-8">
      <div
        className={`h-16 w-16 mx-auto mb-4 flex items-center justify-center ${
          props.kind === 'decline' ? 'bg-gray-100' : 'bg-[#9B1B30]/10'
        }`}
      >
        <Icon
          className={`h-9 w-9 ${
            props.kind === 'decline' ? 'text-gray-500' : 'text-[#9B1B30]'
          }`}
        />
      </div>
      <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">{props.title}</h3>
      <p className="text-sm text-[#4B5563] max-w-md mx-auto">{props.body}</p>
      <div className="mt-6 flex gap-3 justify-center">
        <Link
          href="/"
          className="px-6 py-2 bg-[#9B1B30] text-white text-sm uppercase tracking-wider font-semibold"
        >
          {t('counselling.backHome')}
        </Link>
      </div>
    </div>
  );
}

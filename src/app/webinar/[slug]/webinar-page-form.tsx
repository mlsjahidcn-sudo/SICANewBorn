'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, AlertCircle, CalendarPlus, Users } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { getCurrentUtm } from '@/lib/utm';
import { track } from '@/lib/analytics';
import { useI18n } from '@/lib/i18n';
import { buildWebinarIcs } from '@/lib/webinar-ics';

interface CountryOption {
  value: string;
  label: string;
}

interface Props {
  webinarSlug: string;
  /** ISO start — null while staff hasn't confirmed the date. */
  startsAt: string | null;
  durationMinutes: number;
  webinarTitle: string;
  countryOptions: CountryOption[];
  initialFormMode: 'signup' | 'waitlist' | 'closed';
  initialSeatsLeft: number | null;
  initialSeatCap: number | null;
}

const PROGRAM_INTEREST_VALUES = [
  'chinese_language',
  'foundation',
  'bachelor_march',
  'bachelor',
  'master',
  'phd',
  'csc',
] as const;
type ProgramInterestValue = (typeof PROGRAM_INTEREST_VALUES)[number];

const INTEREST_KEYS: Record<ProgramInterestValue, string> = {
  chinese_language: 'webinar.interests.chineseLanguage',
  foundation: 'webinar.interests.foundation',
  bachelor_march: 'webinar.interests.bachelorMarch',
  bachelor: 'webinar.interests.bachelor',
  master: 'webinar.interests.master',
  phd: 'webinar.interests.phd',
  csc: 'webinar.interests.csc',
};

type Mode = 'signup' | 'waitlist' | 'closed';

/**
 * Phase 161: per-webinar signup/waitlist form for /webinar/[slug].
 *
 * Builds on the Phase 139 form (same fields, same honeypot, same GA
 * funnel events) and adds:
 *   - capacity awareness — polls /api/webinars/[slug]/capacity every
 *     30s; when the server says full the form flips itself into
 *     waitlist mode (a 409 WEBINAR_FULL from the submit does the
 *     same for the unlucky last click)
 *   - waitlist mode — posts to /api/webinar-waitlist; WhatsApp +
 *     country become optional, success shows the waitlist copy
 *   - closed mode — read-only card when registration_status is
 *     draft/closed
 *   - "Add to calendar" — .ics Blob download built client-side from
 *     the webinar's starts_at + duration (RFC 5545, UTC-anchored)
 *
 * Never shows any SICA service prices.
 */
export function WebinarPageForm({
  webinarSlug,
  startsAt,
  durationMinutes,
  webinarTitle,
  countryOptions,
  initialFormMode,
  initialSeatsLeft,
  initialSeatCap,
}: Props) {
  const { locale, t } = useI18n();

  const [mode, setMode] = useState<Mode>(initialFormMode);
  const [seatsLeft, setSeatsLeft] = useState<number | null>(initialSeatsLeft);
  const [seatCap, setSeatCap] = useState<number | null>(initialSeatCap);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');
  const [programInterests, setProgramInterests] = useState<Set<ProgramInterestValue>>(new Set());
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [formStartedFired, setFormStartedFired] = useState(false);
  const pollRef = useRef(false);

  useEffect(() => {
    track('webinar_page_view', { locale });
  }, [locale]);

  // Capacity poll — flips the form into waitlist mode the moment the
  // last seat goes. Runs alongside the hero widget poll (different
  // components can't share state; the endpoint is browser-cached).
  // A closed webinar never re-opens via the poll — that flip is a
  // deliberate staff action.
  useEffect(() => {
    if (pollRef.current) return;
    pollRef.current = true;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/webinars/${encodeURIComponent(webinarSlug)}/capacity`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const json = (await res.json()) as {
          formMode: Mode;
          seatsLeft: number | null;
          seatCap: number | null;
        };
        if (cancelled) return;
        setSeatsLeft(json.seatsLeft);
        setSeatCap(json.seatCap);
        setMode((prev) => (prev === 'closed' ? prev : json.formMode));
      } catch {
        // keep last known
      }
    };
    void poll();
    const timer = setInterval(poll, 30_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [webinarSlug]);

  const fireFormStarted = () => {
    if (formStartedFired) return;
    setFormStartedFired(true);
    track('webinar_form_started', {
      locale,
      source: typeof window !== 'undefined' ? window.location.pathname : undefined,
    });
  };

  const onFieldFocus = (field: 'firstName' | 'lastName' | 'email' | 'whatsapp' | 'country' | 'interests') => {
    fireFormStarted();
    track('webinar_form_field_focused', { locale, field });
  };

  const toggleInterest = (value: ProgramInterestValue) => {
    setProgramInterests((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const downloadIcs = useCallback(() => {
    if (!startsAt) return;
    const ics = buildWebinarIcs({
      title: webinarTitle,
      startsAt,
      durationMinutes,
      pageUrl:
        typeof window !== 'undefined'
          ? `${window.location.origin}/webinar/${webinarSlug}`
          : `/webinar/${webinarSlug}`,
      meetUrl: null,
      locale,
    });
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sica-webinar-${webinarSlug}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [startsAt, durationMinutes, webinarTitle, webinarSlug, locale]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mode === 'closed') return;
    setStatus('submitting');
    setErrorMsg('');
    setNotice(null);

    const requiredOk =
      mode === 'waitlist'
        ? firstName.trim() && lastName.trim() && email.trim()
        : firstName.trim() && lastName.trim() && email.trim() && whatsapp.trim();
    if (!requiredOk) {
      track('webinar_form_submitted_failed', { locale, error_code: 'validation' });
      setErrorMsg(t('webinar.form.errorRequired'));
      setStatus('error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      track('webinar_form_submitted_failed', { locale, error_code: 'validation' });
      setErrorMsg(t('webinar.form.errorEmail'));
      setStatus('error');
      return;
    }

    const utm = getCurrentUtm();
    const shared = {
      webinarSlug,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      country: country.trim() || undefined,
      notes: notes.trim() || undefined,
      website: honeypot,
      sourcePage:
        typeof window !== 'undefined' ? window.location.pathname : `/webinar/${webinarSlug}`,
      locale,
      ...utm,
    };
    const payload =
      mode === 'waitlist'
        ? shared
        : { ...shared, whatsapp: whatsapp.trim(), programInterests: Array.from(programInterests) };

    try {
      const res = await fetch(mode === 'waitlist' ? '/api/webinar-waitlist' : '/api/webinar-signups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; code?: string };

      if (res.status === 409 && body.code === 'WEBINAR_FULL') {
        // Last seat went while the visitor was typing — flip to
        // waitlist in place and keep everything they entered.
        setMode('waitlist');
        setSeatsLeft(0);
        setStatus('idle');
        setErrorMsg('');
        setNotice(t('webinar.form.justFilled'));
        track('webinar_form_submitted_failed', { locale, error_code: 'full' });
        return;
      }
      if (!res.ok) {
        track('webinar_form_submitted_failed', { locale, error_code: 'server' });
        throw new Error(body.error || `Submission failed (${res.status})`);
      }

      setStatus('success');
      if (mode === 'waitlist') {
        track('webinar_waitlist_submit', { locale, webinar_slug: webinarSlug });
      } else {
        track('webinar_signup_submit', {
          locale,
          program_interests: Array.from(programInterests),
          country: country.trim() || undefined,
        });
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('webinar.form.errorGeneric'));
      setStatus('error');
    }
  };

  // ============================== CLOSED ==============================
  if (mode === 'closed') {
    return (
      <div className="bg-white border border-gray-200 p-8 text-center">
        <div className="h-14 w-14 bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Users className="h-7 w-7 text-gray-400" />
        </div>
        <p className="font-semibold text-[#1B2A4A] mb-2">{t('webinar.form.closedTitle')}</p>
        <p className="text-sm text-[#4B5563]">{t('webinar.form.closedBody')}</p>
      </div>
    );
  }

  // ============================== SUCCESS ==============================
  if (status === 'success') {
    const isWaitlist = mode === 'waitlist';
    return (
      <div className="bg-white border border-gray-200 p-8 text-center">
        <div
          className={`h-16 w-16 flex items-center justify-center mx-auto mb-4 ${
            isWaitlist ? 'bg-[#D4A853]/15' : 'bg-[#9B1B30]/10'
          }`}
        >
          <CheckCircle2 className={`h-8 w-8 ${isWaitlist ? 'text-[#D4A853]' : 'text-[#9B1B30]'}`} />
        </div>
        <p className="text-[#1B2A4A] font-semibold mb-2">
          {isWaitlist ? t('webinar.form.waitlistSuccessTitle') : t('webinar.form.successTitle')}
        </p>
        <p className="text-sm text-[#4B5563] mb-6">
          {isWaitlist ? t('webinar.form.waitlistSuccessBody') : t('webinar.form.successBody')}
        </p>
        {!isWaitlist && startsAt && (
          <button
            type="button"
            onClick={downloadIcs}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#1B2A4A] text-[#1B2A4A] font-semibold uppercase tracking-wider text-sm hover:bg-[#1B2A4A] hover:text-white transition-colors"
          >
            <CalendarPlus className="h-4 w-4" />
            {t('webinar.form.addCalendar')}
          </button>
        )}
      </div>
    );
  }

  const isWaitlist = mode === 'waitlist';
  const inputCls =
    'w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]';

  // ============================== FORM ==============================
  return (
    <div className="bg-white border border-gray-200 p-6 sm:p-8">
      {isWaitlist && (
        <div className="mb-6 bg-[#FAF6E8] border border-[#D4A853]/50 px-4 py-3 text-sm text-[#1B2A4A]">
          <p className="font-semibold">{t('webinar.form.waitlistTitle')}</p>
          <p className="mt-1 text-[#4B5563]">{t('webinar.form.waitlistBody')}</p>
        </div>
      )}
      {notice && (
        <div className="mb-6 bg-[#FAF6E8] border border-[#D4A853]/50 px-4 py-3 text-sm text-[#1B2A4A]">
          {notice}
        </div>
      )}
      {seatsLeft !== null && seatCap !== null && !isWaitlist && (
        <p className="mb-4 text-sm text-emerald-700 font-semibold">
          {t('webinar.page.seatsLeft', { count: seatsLeft, total: seatCap })}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Honeypot — visually hidden, off the tab order. */}
        <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
          <label htmlFor={`webinar-website-${webinarSlug}`}>Website</label>
          <input
            id={`webinar-website-${webinarSlug}`}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">
              {t('webinar.form.firstName')} *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onFocus={() => onFieldFocus('firstName')}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">
              {t('webinar.form.lastName')} *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onFocus={() => onFieldFocus('lastName')}
              required
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1F2937] mb-1">
            {t('webinar.form.email')} *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => onFieldFocus('email')}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1F2937] mb-1">
            {t('webinar.form.whatsapp')}
            {isWaitlist ? '' : ' *'}
          </label>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            onFocus={() => onFieldFocus('whatsapp')}
            required={!isWaitlist}
            placeholder="+86 173 2576 4171"
            className={inputCls}
          />
          {!isWaitlist && (
            <p className="mt-1 text-xs text-[#4B5563]">{t('webinar.form.whatsappHelp')}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1F2937] mb-1">
            {t('webinar.form.country')}
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            onFocus={() => onFieldFocus('country')}
            className={inputCls}
          >
            <option value="">{t('webinar.form.countryPlaceholder')}</option>
            {countryOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {!isWaitlist && (
          <>
            <div>
              <p className="block text-sm font-medium text-[#1F2937] mb-2">
                {t('webinar.form.interestsTitle')}
              </p>
              <p className="text-xs text-[#4B5563] mb-3">{t('webinar.form.interestsHelp')}</p>
              <div className="space-y-2">
                {PROGRAM_INTEREST_VALUES.map((value) => {
                  const checked = programInterests.has(value);
                  return (
                    <label
                      key={value}
                      className={`flex items-center gap-3 border px-3 py-2 cursor-pointer transition-colors ${
                        checked
                          ? 'border-[#9B1B30] bg-[#9B1B30]/5'
                          : 'border-gray-200 hover:border-[#9B1B30]/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleInterest(value)}
                        className="h-4 w-4 accent-[#9B1B30] cursor-pointer"
                      />
                      <span className="text-sm text-[#1F2937]">{t(INTEREST_KEYS[value])}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                {t('webinar.form.notes')}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('webinar.form.notesPlaceholder')}
                className={`${inputCls} resize-vertical`}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className={`w-full sm:w-auto px-8 py-3 text-white font-semibold uppercase tracking-wider text-sm transition-colors duration-150 flex items-center gap-2 disabled:opacity-50 ${
            isWaitlist
              ? 'bg-[#1B2A4A] hover:bg-[#2C3E60]'
              : 'bg-[#9B1B30] hover:bg-[#7A1526]'
          }`}
        >
          {status === 'submitting' ? (
            <>
              <Spinner size="sm" />
              {t('webinar.form.submitting')}
            </>
          ) : isWaitlist ? (
            t('webinar.form.submitWaitlist')
          ) : (
            t('webinar.form.submit')
          )}
        </button>
        <p className="text-xs text-[#4B5563]">{t('webinar.form.privacy')}</p>
      </form>
    </div>
  );
}

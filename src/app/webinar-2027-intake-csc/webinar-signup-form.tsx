'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { getCurrentUtm } from '@/lib/utm';
import { track } from '@/lib/analytics';
import { useI18n } from '@/lib/i18n';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface CountryOption {
  value: string;
  label: string;
}

interface Props {
  /** Pre-serialized country list from the RSC parent. */
  countryOptions: CountryOption[];
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

/**
 * Phase 139: client island for /webinar-2027-intake-csc.
 *
 * Submits to /api/webinar-signups, fires GA4 events for
 * page-view + signup, and redirects to
 * /thank-you?source=webinar&interest=webinar-2027-intake-csc.
 *
 * Honeypot: hidden `website` input mirroring the contact +
 * assessment form pattern (Track 1.1). Real users never
 * see or fill it; bots that auto-complete every field
 * give themselves away — and we fake a 200 so the bot
 * can't tell which field betrayed it.
 */
export function WebinarSignupForm({ countryOptions }: Props) {
  const router = useRouter();
  const { locale, t } = useI18n();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');
  const [programInterests, setProgramInterests] = useState<Set<ProgramInterestValue>>(
    new Set(),
  );
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Phase 139 + 143: funnel analytics. webinar_page_view on
  // mount (Phase 139); webinar_form_started fires once when
  // the visitor first focuses any input (Phase 143 drop-off).
  const [formStartedFired, setFormStartedFired] = useState(false);
  useEffect(() => {
    track('webinar_page_view', { locale });
  }, [locale]);

  const fireFormStarted = () => {
    if (formStartedFired) return;
    setFormStartedFired(true);
    track('webinar_form_started', {
      locale,
      source: typeof window !== 'undefined' ? window.location.pathname : undefined,
    });
  };

  /**
   * Per-field focus handler — emits a granular `webinar_form_field_focused`
   * event so the funnel shows which inputs visitors reach before
   * dropping off (Phase 143). Wrapped in `useCallback` so it
   * doesn't recreate on every render and reset React's focus
   * tracking.
   */
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    // Client-side required-field gate so we don't burn the
    // server-side rate-limit on obvious blanks. The server
    // re-validates.
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !whatsapp.trim()) {
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
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      country: country.trim() || undefined,
      programInterests: Array.from(programInterests),
      notes: notes.trim() || undefined,
      website: honeypot,
      sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/webinar-2027-intake-csc',
      locale,
      ...utm,
    };

    try {
      const res = await fetch('/api/webinar-signups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        // Phase 143: surface the server-side capacity decision in
        // the funnel so admin can correlate a 409 with the page view.
        const errorCode: 'session_full' | 'server' =
          res.status === 409 && body.error === 'session_full' ? 'session_full' : 'server';
        track('webinar_form_submitted_failed', { locale, error_code: errorCode });
        throw new Error(body.error || `Submission failed (${res.status})`);
      }
      setStatus('success');
      // GA4: count after API returns 200 (failed submits don't
      // inflate the funnel). Interests + country are passed as
      // optional segmentation.
      track('webinar_signup_submit', {
        locale,
        program_interests: Array.from(programInterests),
        country: country.trim() || undefined,
      });
      // 250ms delay before redirect — same UX pattern as the
      // contact + assessment forms (below the human-perception
      // threshold for "I clicked and the page changed", gives
      // the network tab time to flush).
      setTimeout(() => {
        router.push('/thank-you?source=webinar&interest=webinar-2027-intake-csc');
      }, 250);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('webinar.form.errorGeneric'));
      setStatus('error');
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-6 sm:p-8">
      {status === 'success' ? (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-[#9B1B30]/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-[#9B1B30]" />
          </div>
          <p className="text-[#1B2A4A] font-semibold mb-2">{t('thankYou.webinar.heroTitle')}</p>
          <p className="text-sm text-[#4B5563]">{t('thankYou.webinar.heroBody')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Honeypot — visually hidden, off the tab order. */}
          <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
            <label htmlFor="webinar-website">Website</label>
            <input
              id="webinar-website"
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
                className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
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
                className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
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
              className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">
              {t('webinar.form.whatsapp')} *
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              onFocus={() => onFieldFocus('whatsapp')}
              required
              placeholder="+86 173 2576 4171"
              className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
            />
            <p className="mt-1 text-xs text-[#4B5563]">{t('webinar.form.whatsappHelp')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">
              {t('webinar.form.country')}
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              onFocus={() => onFieldFocus('country')}
              className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
            >
              <option value="">{t('webinar.form.countryPlaceholder')}</option>
              {countryOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

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
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('webinar.form.notesPlaceholder')}
              className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30] resize-vertical"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full sm:w-auto px-8 py-3 bg-[#9B1B30] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#7A1526] transition-colors duration-150 flex items-center gap-2 disabled:opacity-50"
          >
            {status === 'submitting' ? (
              <>
                <Spinner size="sm" />
                {t('webinar.form.submitting')}
              </>
            ) : (
              t('webinar.form.submit')
            )}
          </button>
          <p className="text-xs text-[#4B5563]">{t('webinar.form.privacy')}</p>
        </form>
      )}
    </div>
  );
}

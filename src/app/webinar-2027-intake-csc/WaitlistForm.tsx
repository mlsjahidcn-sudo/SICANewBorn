'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { getCurrentUtm } from '@/lib/utm';
import { track } from '@/lib/analytics';
import { useI18n } from '@/lib/i18n';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Phase 142: lighter waitlist capture shown when the active
 * session is full. Just email + name + optional WhatsApp.
 * Posts to /api/webinar-waitlist (mirrors /api/webinar-signups
 * 5/hr/IP rate limit + honeypot). No email fires on submit —
 * staff drains the leads via the new admin Waitlist tab.
 */
export function WaitlistForm() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    if (!firstName.trim() || !email.trim()) {
      setErrorMsg(t('webinar.form.errorRequired'));
      setStatus('error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg(t('webinar.form.errorEmail'));
      setStatus('error');
      return;
    }

    const utm = getCurrentUtm();
    const payload = {
      firstName: firstName.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim() || undefined,
      notes: notes.trim() || undefined,
      website: honeypot,
      sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/webinar-2027-intake-csc',
      locale,
      ...utm,
    };

    try {
      const res = await fetch('/api/webinar-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string })?.error || `Submission failed (${res.status})`);
      }
      setStatus('success');
      track('webinar_signup_submit', {
        locale,
        program_interests: [],
        country: undefined,
      });
      // Brief pause so the success card is visible.
      setTimeout(() => {
        router.push('/thank-you?source=webinar&interest=webinar-2027-intake-csc');
      }, 250);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('webinar.waitlistError'));
      setStatus('error');
    }
  };

  return (
    <div className="bg-white border-2 border-[#9B1B30] p-6 sm:p-8">
      <div className="bg-[#9B1B30]/10 border border-[#9B1B30]/30 px-4 py-3 mb-5 -mx-2">
        <p className="text-sm text-[#9B1B30] font-semibold">{t('webinar.sessionFullTitle')}</p>
        <p className="text-xs text-[#4B5563] mt-1">{t('webinar.sessionFullBody', { total: 50 })}</p>
      </div>

      {status === 'success' ? (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-[#9B1B30]/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-[#9B1B30]" />
          </div>
          <p className="text-[#1B2A4A] font-semibold mb-2">{t('webinar.waitlistSuccess')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-bold text-[#1B2A4A]">{t('webinar.waitlistTitle')}</h3>
          <p className="text-sm text-[#4B5563]">{t('webinar.waitlistBody')}</p>

          {/* Honeypot — visually hidden. */}
          <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
            <label htmlFor="waitlist-website">Website</label>
            <input
              id="waitlist-website"
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                {t('webinar.waitlistFirstName')} *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                {t('webinar.waitlistEmail')} *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">
              {t('webinar.waitlistWhatsapp')}
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+86 173 2576 4171"
              className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">
              {t('webinar.waitlistNotes')}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30] resize-vertical"
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
                {t('webinar.waitlistSubmitting')}
              </>
            ) : (
              t('webinar.waitlistSubmit')
            )}
          </button>
        </form>
      )}
    </div>
  );
}
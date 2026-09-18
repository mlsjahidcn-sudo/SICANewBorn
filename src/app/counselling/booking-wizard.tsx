'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Globe2,
  Loader2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { getCurrentUtm } from '@/lib/utm';
import { track } from '@/lib/analytics';
import { COUNSELLING_EDUCATION_LEVELS } from '@/lib/counselling-slots';

interface SlotOption {
  start: string;
  label: string;
  available: boolean;
}

interface BookedInfo {
  reference: string;
  slotStart: string;
  slotLabel: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-\s\d]{5,25}$/;

/**
 * Client island for the /counselling booking wizard (Phase 114).
 * Two steps — pick a date+slot, then contact details — talking to
 * /api/counselling/slots (GET) and /api/counselling/bookings (POST).
 * All copy comes from the `counselling.*` i18n namespace so the
 * language toggle works mid-flow.
 */
export function BookingWizard() {
  const { t, locale } = useI18n();
  const localeTag = locale === 'zh' ? 'zh-CN' : 'en-US';

  const [dates, setDates] = useState<string[]>([]);
  const [datesLoading, setDatesLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);

  const [step, setStep] = useState<'datetime' | 'details' | 'success'>('datetime');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [topic, setTopic] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState<BookedInfo | null>(null);

  const loadSlots = useCallback(async (date: string) => {
    setSlotsLoading(true);
    try {
      const res = await fetch(`/api/counselling/slots?date=${encodeURIComponent(date)}`);
      const data = (await res.json()) as { slots?: SlotOption[] };
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/counselling/slots');
        const data = (await res.json()) as { dates?: string[] };
        if (cancelled) return;
        const list = data.dates ?? [];
        setDates(list);
        if (list.length > 0) setSelectedDate(list[0]);
      } catch {
        if (!cancelled) setDates([]);
      } finally {
        if (!cancelled) setDatesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setSelectedSlot(null);
    void loadSlots(selectedDate);
  }, [selectedDate, loadSlots]);

  const formatDateChip = (dateStr: string): string => {
    // post-mount fetch data only — no SSR mismatch risk.
    const d = new Date(`${dateStr}T00:00:00+08:00`);
    return new Intl.DateTimeFormat(localeTag, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Shanghai',
    }).format(d);
  };

  const formatBookedWhen = (iso: string): string => {
    const d = new Date(iso);
    const day = new Intl.DateTimeFormat(localeTag, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Shanghai',
    }).format(d);
    return `${day} · ${booked?.slotLabel ?? ''}`;
  };

  const validateDetails = (): boolean => {
    const errors: Record<string, string> = {};
    if (name.trim().length < 2) errors.name = t('counselling.errorName');
    if (!EMAIL_RE.test(email.trim())) errors.email = t('counselling.errorEmail');
    if (!PHONE_RE.test(phone.trim())) errors.phone = t('counselling.errorPhone');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!selectedSlot || submitting) return;
    setFormError(null);
    if (!validateDetails()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/counselling/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          country: country.trim() || null,
          educationLevel: educationLevel || null,
          topic: topic.trim() || null,
          slotStart: selectedSlot.start,
          locale,
          website,
          sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/counselling',
          ...getCurrentUtm(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        booking?: BookedInfo;
        error?: string;
      };
      if (!res.ok || !data.booking) {
        if (res.status === 409) {
          setFormError(t('counselling.errorSlotTaken'));
          setStep('datetime');
          setSelectedSlot(null);
          if (selectedDate) void loadSlots(selectedDate);
          return;
        }
        throw new Error(data.error || t('counselling.errorGeneric'));
      }
      setBooked(data.booking);
      setStep('success');
      track('counselling_booking_submit', { locale, reference: data.booking.reference });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('counselling.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-none border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]';

  if (step === 'success' && booked) {
    return (
      <div className="bg-white border border-gray-200 p-8 text-center">
        <div className="h-16 w-16 bg-[#9B1B30]/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-9 w-9 text-[#9B1B30]" />
        </div>
        <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">{t('counselling.successTitle')}</h3>
        <p className="text-[#4B5563] text-sm max-w-md mx-auto">{t('counselling.successBody')}</p>
        <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
          <div className="border border-gray-200 p-4">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#1B2A4A]" />
              {t('counselling.successWhen')}
            </div>
            <div className="text-sm font-semibold text-[#1F2937]">{formatBookedWhen(booked.slotStart)}</div>
          </div>
          <div className="border border-gray-200 p-4">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5 text-[#1B2A4A]" />
              {t('counselling.successReference')}
            </div>
            <div className="text-sm font-semibold text-[#1F2937] font-mono">{booked.reference}</div>
          </div>
        </div>
        <p className="mt-6 text-sm text-[#4B5563] max-w-md mx-auto text-left">
          <span className="font-semibold text-[#1F2937]">{t('counselling.successNext')}</span>
          <br />
          {t('counselling.successNextBody')}
        </p>
        <Link
          href="/"
          className="inline-block mt-8 px-8 py-3 bg-[#9B1B30] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#7A1526] transition-colors"
        >
          {t('counselling.backHome')}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 p-6 sm:p-8" id="book">
      <h3 className="text-xl font-bold text-[#1B2A4A] mb-1">{t('counselling.wizardTitle')}</h3>
      <p className="text-sm text-[#4B5563] mb-6 flex items-center gap-1.5">
        <Globe2 className="h-4 w-4 text-[#1B2A4A]" />
        {t('counselling.timezoneNote')}
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6 text-xs font-semibold uppercase tracking-wider">
        <span className={step === 'datetime' ? 'text-[#9B1B30]' : 'text-[#1B2A4A]'}>
          {t('counselling.stepTime')}
        </span>
        <span className="text-gray-300">→</span>
        <span className={step === 'details' ? 'text-[#9B1B30]' : 'text-gray-400'}>
          {t('counselling.stepDetails')}
        </span>
      </div>

      {formError && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {step === 'datetime' && (
        <div>
          <div className="mb-2 text-sm font-medium text-[#1F2937]">{t('counselling.pickDate')}</div>
          {datesLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('counselling.loadingDates')}
            </div>
          ) : dates.length === 0 ? (
            <div className="text-sm text-gray-500 py-3">{t('counselling.noSlots')}</div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map((date) => (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 rounded-none border px-4 py-2.5 text-sm font-medium transition-colors ${
                    selectedDate === date
                      ? 'border-[#9B1B30] bg-[#9B1B30] text-white'
                      : 'border-gray-300 bg-white text-[#1F2937] hover:border-[#9B1B30] hover:text-[#9B1B30]'
                  }`}
                >
                  {formatDateChip(date)}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 mb-2 text-sm font-medium text-[#1F2937]">{t('counselling.pickSlot')}</div>
          {slotsLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('counselling.loadingSlots')}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-sm text-gray-500 py-3">{t('counselling.noSlots')}</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-none border px-2 py-2 text-sm font-medium transition-colors ${
                    selectedSlot?.start === slot.start
                      ? 'border-[#9B1B30] bg-[#9B1B30] text-white'
                      : slot.available
                        ? 'border-gray-300 bg-white text-[#1F2937] hover:border-[#9B1B30] hover:text-[#9B1B30]'
                        : 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            disabled={!selectedSlot}
            onClick={() => {
              setFormError(null);
              setStep('details');
            }}
            className="mt-8 w-full sm:w-auto px-8 py-3 bg-[#9B1B30] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#7A1526] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('counselling.nextDetails')}
          </button>
        </div>
      )}

      {step === 'details' && selectedSlot && (
        <div>
          <button
            type="button"
            onClick={() => setStep('datetime')}
            className="mb-5 inline-flex items-center gap-1.5 text-sm text-[#4B5563] hover:text-[#9B1B30] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('counselling.backToTime')}
          </button>
          <div className="mb-6 border-l-4 border-[#9B1B30] bg-[#FAFAF8] px-4 py-3 text-sm">
            <span className="text-gray-500">{t('counselling.selectedSlot')}</span>{' '}
            <span className="font-semibold text-[#1F2937]">
              {formatDateChip(selectedDate ?? '')} · {selectedSlot.label} (GMT+8)
            </span>
          </div>

          {/* Honeypot — visually hidden, off tab order, bots only. */}
          <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
            <label htmlFor="counselling-website">Website</label>
            <input
              id="counselling-website"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                {t('counselling.fieldName')} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="John Smith"
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                {t('counselling.fieldEmail')} *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="john@example.com"
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mt-5">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                {t('counselling.fieldPhone')} *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="+92 300 1234567"
              />
              <p className="mt-1 text-xs text-gray-500">{t('counselling.fieldPhoneHint')}</p>
              {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                {t('counselling.fieldCountry')}
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClass}
                placeholder={t('counselling.fieldCountryPlaceholder')}
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium text-[#1F2937] mb-1">
              {t('counselling.fieldEducation')}
            </label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className={inputClass}
            >
              <option value="">—</option>
              {COUNSELLING_EDUCATION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {t(`counselling.edu_${level}` as 'counselling.edu_high_school')}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium text-[#1F2937] mb-1">
              {t('counselling.fieldTopic')}
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              maxLength={500}
              className={`${inputClass} resize-vertical`}
              placeholder={t('counselling.fieldTopicPlaceholder')}
            />
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="mt-8 w-full sm:w-auto px-8 py-3 bg-[#9B1B30] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#7A1526] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? t('counselling.submitting') : t('counselling.submit')}
          </button>
        </div>
      )}
    </div>
  );
}

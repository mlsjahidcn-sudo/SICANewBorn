'use client';

import { useEffect, useId, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  GraduationCap,
  Mail,
  MessageSquare,
  Plane,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { getCurrentUtm } from '@/lib/utm';
import { track } from '@/lib/analytics';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const GUMROAD_URL = 'https://ednexgroup.gumroad.com/l/sicakit';
const STICKY_DISMISS_KEY = 'sica_kit_sticky_dismissed';
const WHATSAPP_HREF = 'https://wa.me/8617325764171';

const WHO_ITEMS = [
  {
    icon: GraduationCap,
    titleKey: 'kit.whoBachelorTitle',
    bodyKey: 'kit.whoBachelorBody',
  },
  {
    icon: School,
    titleKey: 'kit.whoGradTitle',
    bodyKey: 'kit.whoGradBody',
  },
  {
    icon: Sparkles,
    titleKey: 'kit.whoScholarshipTitle',
    bodyKey: 'kit.whoScholarshipBody',
  },
] as const;

const INSIDE_ITEMS = [
  { icon: Search, titleKey: 'kit.inside1' },
  { icon: Database, titleKey: 'kit.inside2' },
  { icon: BookOpen, titleKey: 'kit.inside3' },
  { icon: ShieldCheck, titleKey: 'kit.inside4' },
  { icon: ClipboardList, titleKey: 'kit.inside5' },
  { icon: FileText, titleKey: 'kit.inside6' },
  { icon: FileText, titleKey: 'kit.inside7' },
  { icon: CalendarDays, titleKey: 'kit.inside8' },
  { icon: Mail, titleKey: 'kit.inside9' },
  { icon: MessageSquare, titleKey: 'kit.inside10' },
  { icon: Plane, titleKey: 'kit.inside11' },
] as const;

const STEPS = [
  { n: '1', titleKey: 'kit.step1' },
  { n: '2', titleKey: 'kit.step2' },
  { n: '3', titleKey: 'kit.step3' },
] as const;

const FAQ_ITEMS = [
  { q: 'kit.faq1q', a: 'kit.faq1a' },
  { q: 'kit.faq2q', a: 'kit.faq2a' },
  { q: 'kit.faq3q', a: 'kit.faq3a' },
  { q: 'kit.faq4q', a: 'kit.faq4a' },
  { q: 'kit.faq5q', a: 'kit.faq5a' },
  { q: 'kit.faq7q', a: 'kit.faq7a' },
] as const;

export function ChinaAdmissionKitClient() {
  const { t, locale } = useI18n();
  const formId = useId();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [stickyVisible, setStickyVisible] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(true);

  useEffect(() => {
    try {
      setStickyDismissed(Boolean(sessionStorage.getItem(STICKY_DISMISS_KEY)));
    } catch {
      setStickyDismissed(false);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const threshold = Math.max(window.innerHeight * 0.5, 400);
      setStickyVisible(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openBuyModal = (location: string) => {
    setError('');
    setModalOpen(true);
    track('apply_click', {
      location: `kit_${location}`,
      slug: 'china-admission-kit',
      locale,
    });
  };

  const dismissSticky = () => {
    try {
      sessionStorage.setItem(STICKY_DISMISS_KEY, '1');
    } catch {
      // ignore
    }
    setStickyDismissed(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail) {
      setError(t('kit.modalRequired'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(t('kit.modalInvalidEmail'));
      return;
    }

    setSubmitting(true);
    const utm = getCurrentUtm();
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'contact',
          name: trimmedName,
          email: trimmedEmail,
          subject: 'China Admission Kit 2027',
          message:
            'Lead captured from China Admission Kit landing page before Gumroad checkout.',
          website,
          sourcePage: '/china-admission-kit',
          utmSource: utm.utm_source,
          utmMedium: utm.utm_medium,
          utmCampaign: utm.utm_campaign,
          gclid: utm.gclid,
          fbclid: utm.fbclid,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || t('kit.modalSubmitError'));
      }
      track('apply_click', {
        location: 'kit_modal_submit',
        slug: 'china-admission-kit',
        locale,
      });
      window.open(GUMROAD_URL, '_blank', 'noopener,noreferrer');
      setModalOpen(false);
      setName('');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('kit.modalSubmitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const showSticky = !stickyDismissed && stickyVisible;

  return (
    <div className={`min-h-screen bg-[#FAFAF8] ${showSticky ? 'pb-20 md:pb-0' : ''}`}>
      {/* Hero — full-bleed navy product band, buy-only (no cover mockup) */}
      <section className="relative overflow-hidden bg-[#1B2A4A]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: 'url(/hero-bg.avif)' }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B2A4A] via-[#1B2A4A]/95 to-[#9B1B30]/40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-14 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="max-w-3xl">
            <p className="inline-block border border-[#D4A853] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#D4A853]">
              {t('kit.heroBadge')}
            </p>
            <h1 className="mt-5 text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t('kit.heroTitle')}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/80 sm:text-lg">
              {t('kit.heroSubtitle')}
            </p>
            <p className="mt-3 text-sm text-white/65">{t('kit.heroCredit')}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => openBuyModal('hero')}
                className="inline-flex min-h-12 items-center justify-center bg-[#9B1B30] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#7A1526] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B2A4A]"
              >
                {t('kit.ctaBuy')}
              </button>
              <p className="text-sm text-white/70">{t('kit.heroPriceNote')}</p>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium uppercase tracking-wider text-white/55">
              <li>{t('kit.heroChip1')}</li>
              <li aria-hidden className="text-[#D4A853]">•</li>
              <li>{t('kit.heroChip2')}</li>
              <li aria-hidden className="text-[#D4A853]">•</li>
              <li>{t('kit.heroChip3')}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-[#1B2A4A] sm:text-3xl">
          {t('kit.whoTitle')}
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {WHO_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.titleKey}
                className="border-2 border-gray-200 bg-white p-6 transition-colors hover:border-[#1B2A4A]"
              >
                <Icon className="h-7 w-7 text-[#1B2A4A]" aria-hidden />
                <h3 className="mt-4 text-lg font-bold text-[#1B2A4A]">
                  {t(item.titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {t(item.bodyKey)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* What's inside */}
      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1B2A4A] sm:text-3xl">
            {t('kit.insideTitle')}
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INSIDE_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.titleKey}
                  className="flex items-start gap-3 border border-gray-200 bg-[#FAFAF8] p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#1B2A4A] text-white">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#9B1B30]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="mt-0.5 text-sm font-medium leading-snug text-[#1B2A4A]">
                      {t(item.titleKey)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-[#1B2A4A] sm:text-3xl">
          {t('kit.howTitle')}
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.titleKey}
              className="border-2 border-gray-200 bg-white p-6"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center bg-[#9B1B30] text-lg font-bold text-white">
                {step.n}
              </span>
              <p className="mt-4 text-base font-semibold text-[#1B2A4A]">
                {t(step.titleKey)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Format strip */}
      <section className="bg-[#1B2A4A] py-6">
        <p className="mx-auto max-w-7xl px-4 text-center text-sm font-medium tracking-wide text-white sm:px-6 sm:text-base lg:px-8">
          {t('kit.formatStrip')}
        </p>
      </section>

      {/* Value / buy band */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="border-2 border-[#1B2A4A] bg-white p-6 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-[#1B2A4A] sm:text-3xl">
              {t('kit.valueTitle')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
              {t('kit.valueSubtitle')}
            </p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {[
                'kit.diyPoint1',
                'kit.diyPoint2',
                'kit.diyPoint3',
                'kit.diyPoint4',
              ].map((key) => (
                <li key={key} className="flex gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1B2A4A]" />
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => openBuyModal('value')}
            className="mt-6 inline-flex min-h-12 w-full shrink-0 items-center justify-center bg-[#9B1B30] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#7A1526] lg:mt-0 lg:w-auto"
          >
            {t('kit.ctaBuy')}
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1B2A4A] sm:text-3xl">
            {t('kit.faqTitle')}
          </h2>
          <div className="mt-8 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group border-2 border-gray-200 bg-[#FAFAF8] transition-colors hover:border-[#1B2A4A]"
              >
                <summary className="cursor-pointer list-none p-4 font-semibold text-[#1B2A4A] marker:content-none sm:p-5 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {t(item.q)}
                    <span className="text-xl leading-none text-[#9B1B30] group-open:hidden">
                      +
                    </span>
                    <span className="hidden text-xl leading-none text-[#9B1B30] group-open:inline">
                      −
                    </span>
                  </span>
                </summary>
                <p className="border-t border-gray-200 px-4 pb-4 pt-3 text-sm leading-relaxed text-gray-600 sm:px-5">
                  {t(item.a)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#1B2A4A] py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {t('kit.finalTitle')}
          </h2>
          <button
            type="button"
            onClick={() => openBuyModal('final')}
            className="mt-6 inline-flex min-h-12 items-center justify-center bg-[#9B1B30] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#7A1526]"
          >
            {t('kit.ctaBuy')}
          </button>
          <p className="mt-4 text-sm text-white/70">
            {t('kit.finalSupport')}{' '}
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#D4A853] underline-offset-2 hover:underline"
            >
              WhatsApp +86 173 2576 4171
            </a>
          </p>
        </div>
      </section>

      {/* Mobile sticky bar */}
      {showSticky ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-[#9B1B30] bg-[#1B2A4A] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-2">
            <button
              type="button"
              onClick={dismissSticky}
              aria-label={t('kit.stickyDismiss')}
              className="p-2 text-white/70 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => openBuyModal('sticky')}
              className="min-h-11 flex-1 bg-[#9B1B30] px-4 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#7A1526]"
            >
              {t('kit.ctaBuy')}
            </button>
          </div>
        </div>
      ) : null}

      {/* Buy modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          closeLabel={t('common.close')}
          className="rounded-none border-2 border-[#1B2A4A] sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-[#1B2A4A]">
              {t('kit.modalTitle')}
            </DialogTitle>
            <DialogDescription>{t('kit.modalSubtitle')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-2 space-y-4" noValidate>
            <div>
              <label
                htmlFor={`${formId}-name`}
                className="mb-1.5 block text-sm font-medium text-[#1B2A4A]"
              >
                {t('kit.modalName')}
              </label>
              <input
                id={`${formId}-name`}
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-2 border-gray-200 bg-white px-3 py-2.5 text-sm text-[#1B2A4A] outline-none focus:border-[#1B2A4A]"
              />
            </div>
            <div>
              <label
                htmlFor={`${formId}-email`}
                className="mb-1.5 block text-sm font-medium text-[#1B2A4A]"
              >
                {t('kit.modalEmail')}
              </label>
              <input
                id={`${formId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-200 bg-white px-3 py-2.5 text-sm text-[#1B2A4A] outline-none focus:border-[#1B2A4A]"
              />
            </div>
            {/* Honeypot */}
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label htmlFor={`${formId}-website`}>Website</label>
              <input
                id={`${formId}-website`}
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            {error ? (
              <p className="text-sm text-[#9B1B30]" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 w-full items-center justify-center bg-[#9B1B30] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#7A1526] disabled:opacity-60"
            >
              {submitting ? t('kit.modalSubmitting') : t('kit.ctaBuy')}
            </button>
            <p className="text-center text-xs text-gray-500">
              {t('kit.modalPrivacy')}
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

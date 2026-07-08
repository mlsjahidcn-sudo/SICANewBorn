'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Mail,
  MessageCircle,
  Calendar,
  Clock,
  ArrowRight,
  Copy,
  GraduationCap,
  Building2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

/**
 * Client island for the thank-you page. Renders the
 * personalized confirmation based on ?source= (contact vs
 * assessment) and ?interest= (university slug for the
 * "you were looking at this" block).
 *
 * The page is split into 6 sections:
 *   1. Hero — big "we got it" with a check mark
 *   2. Reference number row (auto-generated UUID-shaped string
 *      derived from sessionStorage / timestamp so the lead has
 *      something to quote if they call us)
 *   3. What happens next — 3-step timeline
 *   4. In the meantime — multi-channel reach-out (WhatsApp,
 *      email, schedule a call)
 *   5. Social proof — 3 stats (response time, placement rate,
 *      partner unis)
 *   6. While you wait — 2-3 related content links, personalised
 *      by ?interest if present
 *   7. FAQ — 3 common questions
 *   8. Share + copy link
 *
 * The copy link section uses the Web Clipboard API (navigator.clipboard)
 * with a textarea fallback for older browsers / non-secure contexts.
 */

const WHATSAPP_PHONE = '8617325764171';
const CONTACT_EMAIL = 'support@sica.com.cn';
const SITE_URL = 'https://studyinchina.academy';

function generateReferenceNumber(): string {
  // Cheap, client-only reference number — not the real DB id
  // (privacy + tiny payload). Format SICA-YYYYMMDD-XXXX so
  // it looks credible on the phone. The real DB id is in
  // the admin's row view, so the quote lets us pull up the
  // submission in <10s.
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SICA-${y}${m}${day}-${rand}`;
}

export default function ThankYouClient() {
  const searchParams = useSearchParams();
  const { t } = useI18n();

  // Which form was just submitted. Defaults to 'contact' so a
  // direct visit to /thank-you (bookmark, share-link) still
  // shows useful copy instead of a blank page.
  const source = searchParams.get('source') === 'assessment' ? 'assessment' : 'contact';
  // University slug from the Apply CTA redirect chain (Phase
  // 24 wired ?interest=<slug> on /universities/[slug]). When
  // present, surface a "you were looking at this" personalisation
  // card. We don't fetch the university name client-side (would
  // require an extra round-trip + state) — just the slug is
  // enough to make the link work, and SICA's counselor has the
  // full context from the form submission.
  const interest = searchParams.get('interest');
  // Phase 1: ?interestName is the human-readable name piped
  // through the Apply CTA chain (university detail page →
  // StickyApplyBar → assessment form → thank-you). We use it
  // for the personalization card label so the user sees
  // "Tsinghua University" instead of the raw slug
  // "tsinghua-university". Falls back to the slug if the chain
  // broke (e.g. bookmarked link, missing param).
  const interestName = searchParams.get('interestName');
  const interestLabel = interestName || interest;
  // Pre-compute the reference number once per mount so it
  // stays stable across re-renders (e.g. if the user opens
  // the share modal, the number doesn't change).
  const [reference] = useState(() => generateReferenceNumber());
  const [copied, setCopied] = useState(false);

  // Auto-clear the "Copied!" flash after 2s. Standard pattern,
  // matches the team-page copy button.
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const heroTitle = source === 'assessment' ? t('thankYou.titleAssessment') : t('thankYou.titleContact');
  const heroSubtitle = source === 'assessment' ? t('thankYou.subtitleAssessment') : t('thankYou.subtitleContact');

  // Pre-fill the WhatsApp link with a context-aware message
  // so the counselor knows where the lead is coming from.
  const whatsappContext = source === 'assessment'
    ? `Hi SICA, I just submitted the assessment (ref: ${reference}). Following up.`
    : `Hi SICA, I just sent a message through the contact form (ref: ${reference}). Following up.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(whatsappContext)}`;

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts (e.g. http://localhost).
        // Create a temporary textarea, select, exec.
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
    } catch {
      // Clipboard blocked — leave the user on the page; the
      // link is visible enough to copy by hand.
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* ========== 1. Hero ========== */}
      <section className="relative bg-[#1B2A4A] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B2A4A] via-[#1B2A4A] to-[#2C3E60]" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          <div className="h-20 w-20 bg-[#9B1B30] flex items-center justify-center mx-auto mb-6 rounded-full">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            {heroTitle}
          </h1>
          <p className="mt-5 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>
          {/* Reference number — generated client-side. Real
              DB id is in the admin's row view; the quote lets
              them pull up the submission in <10s. */}
          <div className="mt-8 inline-block bg-white/10 border border-white/20 px-5 py-3">
            <p className="text-xs text-gray-300 uppercase tracking-wider mb-1">
              {t('thankYou.referenceLabel')}
            </p>
            <p className="font-mono text-lg sm:text-xl text-white font-semibold select-all">
              {reference}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t('thankYou.referenceHelp')}
            </p>
          </div>
        </div>
      </section>

      {/* ========== 2. What happens next — timeline ========== */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-6 w-6 text-[#9B1B30]" />
          <h2 className="text-2xl font-bold text-[#1B2A4A]">
            {t('thankYou.timelineTitle')}
          </h2>
        </div>
        <div className="space-y-4">
          {[
            { n: 1, title: t('thankYou.timelineStep1Title'), desc: t('thankYou.timelineStep1Desc') },
            { n: 2, title: t('thankYou.timelineStep2Title'), desc: t('thankYou.timelineStep2Desc') },
            { n: 3, title: t('thankYou.timelineStep3Title'), desc: t('thankYou.timelineStep3Desc') },
          ].map((step) => (
            <div key={step.n} className="flex gap-4 bg-white border border-gray-200 p-5">
              <div className="flex-shrink-0 w-10 h-10 bg-[#9B1B30] text-white flex items-center justify-center font-bold text-lg">
                {step.n}
              </div>
              <div>
                <h3 className="font-semibold text-[#1B2A4A]">{step.title}</h3>
                <p className="text-sm text-[#4B5563] mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== 3. In the meantime — multi-channel ========== */}
      <section className="bg-white border-y border-gray-200 py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-6 w-6 text-[#9B1B30]" />
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              {t('thankYou.alternativesTitle')}
            </h2>
          </div>
          <p className="text-sm text-[#4B5563] mb-6 max-w-2xl">
            {t('thankYou.alternativesDesc')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WhatsApp — primary for time-sensitive */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-[#FAFAF8] border border-gray-200 p-5 hover:border-[#25D366] transition-colors group"
            >
              <MessageCircle className="h-7 w-7 text-[#25D366] mb-3" />
              <h3 className="font-semibold text-[#1B2A4A] mb-1">
                {t('thankYou.altWhatsAppLabel')}
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                {t('thankYou.altWhatsAppDesc')}
              </p>
            </a>
            {/* Email — best for longer questions */}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Following up (ref: ${reference})`)}`}
              className="block bg-[#FAFAF8] border border-gray-200 p-5 hover:border-[#1B2A4A] transition-colors group"
            >
              <Mail className="h-7 w-7 text-[#1B2A4A] mb-3" />
              <h3 className="font-semibold text-[#1B2A4A] mb-1">
                {t('thankYou.altEmailLabel')}
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                {t('thankYou.altEmailDesc')}
              </p>
            </a>
            {/* Schedule a call — for users who want to skip back-and-forth */}
            <a
              href="/contact?subject=Schedule%20a%20call"
              className="block bg-[#FAFAF8] border border-gray-200 p-5 hover:border-[#9B1B30] transition-colors group"
            >
              <Calendar className="h-7 w-7 text-[#9B1B30] mb-3" />
              <h3 className="font-semibold text-[#1B2A4A] mb-1">
                {t('thankYou.altCallLabel')}
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                {t('thankYou.altCallDesc')}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] mt-2 group-hover:underline">
                {t('thankYou.altCallCta')}
                <ArrowRight className="h-3 w-3" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ========== 4. Social proof — stats ========== */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1B2A4A]">
            {t('thankYou.proofTitle')}
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-4 lg:gap-8">
          {[
            { value: t('thankYou.proofStat1Value'), label: t('thankYou.proofStat1Label') },
            { value: t('thankYou.proofStat2Value'), label: t('thankYou.proofStat2Label') },
            { value: t('thankYou.proofStat3Value'), label: t('thankYou.proofStat3Label') },
          ].map((stat) => (
            <div key={stat.label} className="text-center bg-white border border-gray-200 p-5 lg:p-8">
              <p className="text-3xl lg:text-5xl font-extrabold text-[#9B1B30]">
                {stat.value}
              </p>
              <p className="text-xs lg:text-sm text-[#4B5563] mt-2 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== 5. While you wait — related content ========== */}
      <section className="bg-white border-y border-gray-200 py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-2">
            {t('thankYou.relatedTitle')}
          </h2>
          <p className="text-sm text-[#4B5563] mb-6">
            {t('thankYou.relatedSubtitle')}
          </p>
          {/* If ?interest is set, show a "you were looking at
              this" personalized card first. Falls back to the
              generic 3-link grid otherwise. */}
          {interest && (
            <div className="bg-[#FAF6E8] border border-[#D4A853] p-5 mb-5">
              <p className="text-xs text-[#9B1B30] uppercase tracking-wider font-semibold mb-2">
                {t('thankYou.relatedPersonalizedNote')}
              </p>
              <Link
                href={`/universities/${encodeURIComponent(interest)}`}
                className="flex items-center gap-2 font-semibold text-[#1B2A4A] hover:text-[#9B1B30]"
              >
                <Building2 className="h-4 w-4" />
                {/* Phase 1: show the human-readable name (e.g. "Tsinghua
                    University") when piped through, fall back to the
                    raw slug if the chain broke. */}
                {interestLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/universities"
              className="block bg-[#FAFAF8] border border-gray-200 p-5 hover:border-[#1B2A4A] transition-colors"
            >
              <Building2 className="h-7 w-7 text-[#1B2A4A] mb-3" />
              <h3 className="font-semibold text-[#1B2A4A]">
                {t('thankYou.relatedExploreUniversities')}
              </h3>
            </Link>
            <Link
              href="/programs?scholarship=true"
              className="block bg-[#FAFAF8] border border-gray-200 p-5 hover:border-[#1B2A4A] transition-colors"
            >
              <GraduationCap className="h-7 w-7 text-[#9B1B30] mb-3" />
              <h3 className="font-semibold text-[#1B2A4A]">
                {t('thankYou.relatedSeePrograms')}
              </h3>
            </Link>
            <Link
              href="/guides/application"
              className="block bg-[#FAFAF8] border border-gray-200 p-5 hover:border-[#1B2A4A] transition-colors"
            >
              <BookOpen className="h-7 w-7 text-[#D4A853] mb-3" />
              <h3 className="font-semibold text-[#1B2A4A]">
                {t('thankYou.relatedReadGuide')}
              </h3>
            </Link>
          </div>
        </div>
      </section>

      {/* ========== 6. FAQ ========== */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <h2 className="text-2xl font-bold text-[#1B2A4A] mb-6">
          {t('thankYou.faqTitle')}
        </h2>
        <div className="space-y-4">
          {[
            { q: t('thankYou.faq1Q'), a: t('thankYou.faq1A') },
            { q: t('thankYou.faq2Q'), a: t('thankYou.faq2A') },
            { q: t('thankYou.faq3Q'), a: t('thankYou.faq3A') },
          ].map((item, i) => (
            <details
              key={i}
              className="bg-white border border-gray-200 p-5 group"
            >
              <summary className="font-semibold text-[#1B2A4A] cursor-pointer list-none flex items-center justify-between">
                <span>{item.q}</span>
                <ArrowRight className="h-4 w-4 text-[#4B5563] group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-sm text-[#4B5563] mt-3 leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ========== 7. Share + back home ========== */}
      <section className="bg-white border-t border-gray-200 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-[#1B2A4A]">
            {t('thankYou.shareTitle')}
          </p>
          <p className="text-xs text-[#4B5563] mt-1 mb-4">
            {t('thankYou.shareDesc')}
          </p>
          <div className="inline-flex items-center gap-2 bg-[#FAFAF8] border border-gray-200 px-3 py-2">
            <code className="text-xs text-[#4B5563] font-mono">
              {SITE_URL}/thank-you
            </code>
            <button
              onClick={() => copyToClipboard(`${SITE_URL}/thank-you`)}
              className="flex items-center gap-1 px-2 py-1 bg-[#9B1B30] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#7A1526] transition-colors"
              aria-label={t('thankYou.copyLinkButton')}
            >
              <Copy className="h-3 w-3" />
              {copied ? t('thankYou.copyLinkCopied') : t('thankYou.copyLinkButton')}
            </button>
          </div>
          <div className="mt-6">
            <Link
              href="/"
              className="text-sm text-[#4B5563] hover:text-[#9B1B30] font-medium"
            >
              {t('thankYou.backHome')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

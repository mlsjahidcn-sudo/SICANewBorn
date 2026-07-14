'use client';

/**
 * /get-started client island.
 *
 * Phase 57: the public-facing sales landing page. Influencer
 * traffic from YouTube + TikTok lands here. Designed for
 * 30-second scan: hook → trust strip → services → proof
 * (videos + admission notices) → pricing → final CTA.
 *
 * Why a single client island wrapping all sections:
 * - One i18n context for the whole page (no prop-drilling
 *   `t` through every section).
 * - One UTM context (from useSearchParams) shared across
 *   every WhatsApp CTA — every link gets the UTM pre-fill.
 * - One place for the "scrolled" state if we later add
 *   scroll-based animations.
 *
 * Sections are 100% presentational — data comes from props
 * (admission notices fetched server-side in the page wrapper,
 * no client-side data fetching except admission cards which
 * hydrate from a server-rendered initial list).
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MessageCircle,
  Check,
  X,
  Phone,
  Shield,
  Award,
  Globe,
  GraduationCap,
  ChevronDown,
  Users,
  Building2,
  Clock,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { track } from '@/lib/analytics';
import { whatsappUrl, WHATSAPP_DISPLAY } from '@/lib/contact';
import type { AdmissionNotice } from '@/lib/admission-notices/types';
import { AdmissionCards } from '@/components/sales/AdmissionCards';

interface GetStartedClientProps {
  /** Server-rendered list of published admission notices (top 6 by display_order). */
  initialNotices: AdmissionNotice[];
}

/**
 * The 3 review videos we have in /public/videos/. Hard-coded
 * (no admin surface yet) — the files are committed and known.
 */
const REVIEW_VIDEOS: Array<{ id: string; src: string; poster: string }> = [
  { id: 'review-1', src: '/videos/review-1.mp4', poster: '/videos/review-1-poster.jpg' },
  { id: 'review-2', src: '/videos/review-2-720p.mp4', poster: '/videos/review-2-poster.jpg' },
  { id: 'review-3', src: '/videos/review-3.mp4', poster: '/videos/review-3-poster.jpg' },
];

export function GetStartedClient({ initialNotices }: GetStartedClientProps) {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  // Capture UTM source so the WhatsApp pre-fill tells the
  // consultant where the lead came from. Persists across
  // page navigation (sessionStorage) per the existing
  // src/lib/utm.ts helper.
  const [utmSource, setUtmSource] = useState<string | null>(null);

  useEffect(() => {
    // Phase 57: read utm_source from URL or sessionStorage.
    // src/lib/utm.ts is the canonical helper but it's
    // server-bound — re-implement the read here for client use.
    const fromUrl = searchParams.get('utm_source');
    if (fromUrl) {
      setUtmSource(fromUrl);
      try {
        sessionStorage.setItem('sica_utm_source', fromUrl);
      } catch {
        // sessionStorage blocked — proceed with the URL value only.
      }
    } else {
      try {
        setUtmSource(sessionStorage.getItem('sica_utm_source'));
      } catch {
        // sessionStorage blocked — leave utmSource as null.
      }
    }
  }, [searchParams]);

  // Build a WhatsApp URL for a given tier. Centralized so every
  // CTA on the page can pass through the same UTM context.
  // Tiered clicks fire the `service_card_click` event so the
  // dashboard can compare tier-conversion rates; non-tiered
  // CTAs (hero / final) fire `whatsapp_click` so the overall
  // sales-page-to-WhatsApp conversion is visible.
  const tieredWhatsappUrl = (tier: 'diy' | 'full_service', location: string) => {
    const url = whatsappUrl({ utmSource: utmSource ?? undefined, tier });
    track('service_card_click', { tier, location, locale });
    return url;
  };

  const genericWhatsappUrl = (location: string) => {
    const url = whatsappUrl({ utmSource: utmSource ?? undefined });
    track('whatsapp_click', { location, slug: 'sales_page', locale });
    return url;
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* ============== HERO ============== */}
      <section className="bg-gradient-to-br from-[#1B2A4A] to-[#2d4170] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
          <p className="inline-block text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#D4A853] mb-4 px-3 py-1 border border-[#D4A853]/40 rounded-full">
            {t('sales.eyebrow')}
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
            {t('sales.heroTitle')}
          </h1>
          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-8">
            {t('sales.heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={genericWhatsappUrl('hero')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-semibold px-6 py-3 text-base sm:text-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              {t('sales.heroCtaWhatsapp')}
            </a>
            <a
              href={genericWhatsappUrl('hero_secondary')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white hover:bg-white/10 font-semibold px-6 py-3 text-base transition-colors"
            >
              {t('sales.heroCtaFree')}
            </a>
          </div>
        </div>
      </section>

      {/* ============== TRUST STRIP ============== */}
      {/*
        * Trust strip — 4 stats in a row (desktop) or 2×2 (mobile).
        * Each cell: small icon + leading number + short label.
        * Old version: raw text "10,000+ students admitted" wrapped
        * to 3 lines on mobile and the sub-label was redundant
        * ("students" / "universities" repeated the unit). New
        * version splits number from label so the cell reads
        * top-down ("100+" / "partner universities") and uses
        * a small icon to break the visual monotony.
        *
        * Why 2×2 on mobile: at 390px the previous 4-col grid
        * wrapped the long values ugly. 2×2 keeps each cell
        * ~180px wide — enough for "10,000+" + "students admitted".
        */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
            <TrustStat
              icon={<Users className="w-5 h-5" />}
              value="10,000+"
              label={t('sales.trustLabelStudents')}
            />
            <TrustStat
              icon={<Building2 className="w-5 h-5" />}
              value="100+"
              label={t('sales.trustLabelUniversities')}
            />
            <TrustStat
              icon={<Award className="w-5 h-5" />}
              value="90%"
              label={t('sales.trustLabelSuccess')}
            />
            <TrustStat
              icon={<Clock className="w-5 h-5" />}
              value="24h"
              label={t('sales.trustLabelResponse')}
            />
          </div>
        </div>
      </section>

      {/* ============== SERVICES — 2-TIER PRICING ============== */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] mb-3">
              {t('sales.servicesTitle')}
            </h2>
            <p className="text-[#4B5563] max-w-2xl mx-auto">{t('sales.servicesSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DIY tier */}
            <PricingCard
              tier="diy"
              badge={t('sales.tierDiyBadge')}
              price={t('sales.tierDiyPrice')}
              priceUnit={t('sales.tierDiyPriceUnit')}
              features={[
                t('sales.tierDiyFeature1'),
                t('sales.tierDiyFeature2'),
                t('sales.tierDiyFeature3'),
                t('sales.tierDiyFeature4'),
                t('sales.tierDiyFeature5'),
                t('sales.tierDiyFeature6'),
              ]}
              cta={t('sales.tierDiyCta')}
              ctaHref={tieredWhatsappUrl('diy', 'pricing_diy')}
              accent="slate"
              recommended={false}
            />
            {/* Full-service tier */}
            <PricingCard
              tier="full_service"
              badge={t('sales.tierFullBadge')}
              price={t('sales.tierFullPrice')}
              priceUnit={t('sales.tierFullDeposit')}
              features={[
                t('sales.tierFullFeature1'),
                t('sales.tierFullFeature2'),
                t('sales.tierFullFeature3'),
                t('sales.tierFullFeature4'),
                t('sales.tierFullFeature5'),
              ]}
              refundNote={t('sales.tierFullRefund')}
              cta={t('sales.tierFullCta')}
              ctaHref={tieredWhatsappUrl('full_service', 'pricing_full')}
              accent="crimson"
              recommended
              recommendedLabel={t('sales.tierFullRecommended')}
            />
          </div>
        </div>
      </section>

      {/* ============== WHY WE'RE DIFFERENT ============== */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] mb-3">
              {t('sales.whyTitle')}
            </h2>
            <p className="text-[#4B5563] max-w-2xl mx-auto">{t('sales.whySubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <WhyCard
              icon={<Award className="w-6 h-6" />}
              title={t('sales.why1Title')}
              body={t('sales.why1Body')}
            />
            <WhyCard
              icon={<GraduationCap className="w-6 h-6" />}
              title={t('sales.why2Title')}
              body={t('sales.why2Body')}
            />
            <WhyCard
              icon={<Shield className="w-6 h-6" />}
              title={t('sales.why3Title')}
              body={t('sales.why3Body')}
            />
            <WhyCard
              icon={<Globe className="w-6 h-6" />}
              title={t('sales.why4Title')}
              body={t('sales.why4Body')}
            />
          </div>
        </div>
      </section>

      {/* ============== REVIEW VIDEOS ============== */}
      <section className="py-12 sm:py-16 bg-[#FAFAF8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] mb-3">
              {t('sales.videosTitle')}
            </h2>
            <p className="text-[#4B5563] max-w-2xl mx-auto">{t('sales.videosSubtitle')}</p>
          </div>
          <ReviewVideoGrid />
        </div>
      </section>

      {/* ============== ADMISSION NOTICES ============== */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] mb-3">
              {t('sales.noticesTitle')}
            </h2>
            <p className="text-[#4B5563] max-w-2xl mx-auto">{t('sales.noticesSubtitle')}</p>
          </div>
          <AdmissionCards initialNotices={initialNotices} />
          <div className="text-center mt-8">
            <a
              href="/success-stories"
              className="inline-flex items-center gap-2 text-[#9B1B30] font-semibold hover:underline"
            >
              {t('sales.viewAll')} →
            </a>
          </div>
        </div>
      </section>

      {/* ============== PRICING COMPARISON TABLE ============== */}
      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] mb-3">
              {t('sales.compareTitle')}
            </h2>
            <p className="text-[#4B5563]">{t('sales.compareSubtitle')}</p>
          </div>
          <CompareTable />
        </div>
      </section>

      {/* ============== FINAL CTA ============== */}
      <section className="bg-gradient-to-br from-[#1B2A4A] to-[#2d4170] text-white py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t('sales.finalTitle')}</h2>
          <p className="text-white/80 mb-6">{t('sales.finalSubtitle')}</p>
          <a
            href={genericWhatsappUrl('final')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-semibold px-6 py-3 text-base sm:text-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            {t('sales.finalCta')}
          </a>
          <p className="text-sm text-white/60 mt-4 flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" />
            {t('sales.finalOr')} <span className="font-mono">{WHATSAPP_DISPLAY}</span>
          </p>
        </div>
      </section>

      {/* ============== FAQ ============== */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] mb-6 text-center">
            {t('sales.faqTitle')}
          </h2>
          <div className="space-y-3">
            <FaqItem q={t('sales.faq1Q')} a={t('sales.faq1A')} />
            <FaqItem q={t('sales.faq2Q')} a={t('sales.faq2A')} />
            <FaqItem q={t('sales.faq3Q')} a={t('sales.faq3A')} />
            <FaqItem q={t('sales.faq4Q')} a={t('sales.faq4A')} />
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TrustStat — one cell of the trust strip. Icon + big number on
// top, short label below. Kept in this file (not a separate
// component) because it's used exactly once and the 4 callsite
// props read better inline than as a shared component file.
// ---------------------------------------------------------------------------
function TrustStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-full bg-[#1B2A4A]/5 text-[#1B2A4A] flex items-center justify-center mb-2">
        {icon}
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] leading-tight">{value}</div>
      <div className="text-xs sm:text-sm text-[#4B5563] mt-1 leading-snug">{label}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PricingCard — DIY + Full-Service cards. 2 props. Hero CTA on each card.
// ---------------------------------------------------------------------------
interface PricingCardProps {
  tier: 'diy' | 'full_service';
  badge: string;
  price: string;
  priceUnit: string;
  features: string[];
  refundNote?: string;
  cta: string;
  ctaHref: string;
  accent: 'slate' | 'crimson';
  recommended: boolean;
  recommendedLabel?: string;
}

function PricingCard({
  tier,
  badge,
  price,
  priceUnit,
  features,
  refundNote,
  cta,
  ctaHref,
  accent,
  recommended,
  recommendedLabel,
}: PricingCardProps) {
  const accentBg = accent === 'crimson' ? 'bg-[#9B1B30]' : 'bg-[#1B2A4A]';
  const accentText = accent === 'crimson' ? 'text-[#9B1B30]' : 'text-[#1B2A4A]';
  const ctaBg = accent === 'crimson' ? 'bg-[#25D366] hover:bg-[#1ebd5a]' : 'bg-[#1B2A4A] hover:bg-[#14213d]';
  return (
    <div
      className={`bg-white border-2 ${recommended ? 'border-[#9B1B30]' : 'border-gray-200'} relative flex flex-col`}
    >
      {recommended && recommendedLabel && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#9B1B30] text-white text-xs font-bold uppercase tracking-wider px-3 py-1">
          {recommendedLabel}
        </div>
      )}
      <div className={`${accentBg} text-white px-6 py-3`}>
        <div className="text-sm font-semibold uppercase tracking-wider opacity-80">{badge}</div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-6">
          <div className={`text-4xl font-bold ${accentText}`}>{price}</div>
          <div className="text-sm text-[#4B5563] mt-1">{priceUnit}</div>
        </div>
        <ul className="space-y-2.5 mb-6 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#1F2937]">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        {refundNote && (
          <p className="text-xs text-[#4B5563] bg-amber-50 border border-amber-200 p-3 mb-4">
            {refundNote}
          </p>
        )}
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          data-tier={tier}
          className={`${ctaBg} text-white font-semibold text-center py-3 transition-colors`}
        >
          {cta}
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WhyCard — 4 cards in the "Why we're different" section.
// ---------------------------------------------------------------------------
function WhyCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="border border-gray-200 p-5 bg-white">
      <div className="w-10 h-10 rounded-full bg-[#1B2A4A]/5 text-[#1B2A4A] flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="font-bold text-[#1B2A4A] mb-1.5">{title}</h3>
      <p className="text-sm text-[#4B5563] leading-relaxed">{body}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReviewVideoGrid — 3 video cards with click-to-play modal.
// Simpler than the home-page VideoTestimonials component — no
// university-name override, no i18n title keys, just the 3 files
// we have. Re-uses the same play-on-click pattern.
// ---------------------------------------------------------------------------
function ReviewVideoGrid() {
  const [openVideo, setOpenVideo] = useState<typeof REVIEW_VIDEOS[number] | null>(null);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {REVIEW_VIDEOS.map((v) => (
          <button
            key={v.id}
            onClick={() => setOpenVideo(v)}
            className="relative aspect-video bg-[#1B2A4A] overflow-hidden group"
            aria-label={`Play review video ${v.id}`}
          >
            <img
              src={v.poster}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#1B2A4A] ml-1" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
      {openVideo && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setOpenVideo(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setOpenVideo(null)}
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={openVideo.src}
              controls
              autoPlay
              className="w-full bg-black"
              poster={openVideo.poster}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// CompareTable — feature × tier comparison.
// ---------------------------------------------------------------------------
function CompareTable() {
  const { t } = useI18n();
  const yes = t('sales.compareYes');
  const no = t('sales.compareNo');
  const partial = t('sales.comparePartial');
  const features: Array<{ label: string; diy: string; full: string }> = [
    { label: t('sales.compare1'), diy: yes, full: yes },
    { label: t('sales.compare2'), diy: yes, full: yes },
    { label: t('sales.compare3'), diy: yes, full: yes },
    { label: t('sales.compare4'), diy: yes, full: yes },
    { label: t('sales.compare5'), diy: yes, full: yes },
    { label: t('sales.compare6'), diy: yes, full: yes },
    { label: t('sales.compare7'), diy: no, full: yes },
    { label: t('sales.compare8'), diy: no, full: yes },
    { label: t('sales.compare9'), diy: no, full: yes },
    { label: t('sales.compareRefund'), diy: no, full: partial },
  ];
  return (
    <div className="border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[#1B2A4A] text-white">
          <tr>
            <th className="text-left px-4 py-3 font-semibold">{t('sales.compareFeature')}</th>
            <th className="text-center px-4 py-3 font-semibold">{t('sales.compareDiy')}</th>
            <th className="text-center px-4 py-3 font-semibold">{t('sales.compareFull')}</th>
          </tr>
        </thead>
        <tbody>
          {features.map((f, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}>
              <td className="px-4 py-3 text-[#1F2937]">{f.label}</td>
              <td className="px-4 py-3 text-center text-[#4B5563]">{f.diy}</td>
              <td className="px-4 py-3 text-center text-[#1F2937] font-medium">{f.full}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FaqItem — <details> accordion for the FAQ section. No state needed.
// ---------------------------------------------------------------------------
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-gray-200 bg-white">
      <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-[#1B2A4A] list-none">
        <span>{q}</span>
        <ChevronDown className="w-5 h-5 text-[#4B5563] group-open:rotate-180 transition-transform" />
      </summary>
      <div className="px-4 pb-4 text-sm text-[#4B5563] leading-relaxed">{a}</div>
    </details>
  );
}

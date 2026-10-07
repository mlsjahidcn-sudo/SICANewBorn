/**
 * Phase 139 + 140: public webinar landing page.
 *
 * One-session webinar covering March 2027 Intake (Chinese
 * Language + Foundation + select Bachelor programs),
 * September 2027 Intake (Bachelor + Master's + PhD), and CSC
 * Scholarship. Signup form posts to /api/webinar-signups
 * and redirects to
 * /thank-you?source=webinar&interest=webinar-2027-intake-csc.
 *
 * Phase 140 swaps the hardcoded "Date coming soon" + 4
 * hardcoded tracks for DB-backed values:
 *   - Hero date pill: reads `active.session_date` +
 *     `session_time` from `webinar_sessions where is_active=true`.
 *     Falls back to the "Date coming soon" copy when no active
 *     session is set up yet (preserves Phase 139 behavior
 *     during the seed window).
 *   - Agenda section: iterates `webinar_topics` ordered by
 *     `display_order` for the active session. Falls back to
 *     the 4 hardcoded i18n tracks when no topics are seeded
 *     yet.
 *
 * RSC + client island. Static (revalidate = 3600) since the
 * copy and structure only change via code deployment.
 */
import type { Metadata } from 'next';
import {
  GraduationCap,
  Globe2,
  BookOpen,
  Award,
  Clock,
  Sparkles,
  ChevronDown,
  MessageCircle,
  Microscope,
  type LucideIcon,
} from 'lucide-react';
import { getServerT } from '@/lib/server-t';
import { buildLanguageAlternates } from '@/lib/alternates';
import { COUNTRIES } from '@/lib/seo-data';
import {
  getActiveSessionWithTopics,
  getActiveSessionCapacity,
  formatWebinarDate,
} from '@/lib/webinar-sessions';
import type { WebinarTopicDegree, WebinarTopicIntake } from '@/lib/webinar-sessions';
import { WebinarSignupForm } from './webinar-signup-form';
import { CapacityPill } from './CapacityPill';
import { WaitlistForm } from './WaitlistForm';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('webinar.hero.title'),
    description: t('webinar.hero.subtitle'),
    alternates: buildLanguageAlternates('/webinar-2027-intake-csc'),
    openGraph: {
      title: t('webinar.hero.title'),
      description: t('webinar.hero.subtitle'),
      type: 'website',
      url: '/webinar-2027-intake-csc',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('webinar.hero.title'),
      description: t('webinar.hero.subtitle'),
    },
  };
}

// Map topic.degree → Lucide icon. Phase 139's hardcoded
// AGENDA_ICONS array used index-by-position, which broke if
// staff deleted a row; this lookup by the row's degree enum
// is robust to ordering changes.
const DEGREE_ICONS: Record<WebinarTopicDegree, LucideIcon> = {
  chinese_language: GraduationCap,
  foundation: BookOpen,
  bachelor: Globe2,
  master: Award,
  phd: Microscope,
  csc: Sparkles,
};

// Map topic.intake → i18n key for the badge text. Phase 139
// hardcoded "March 2027" / "September 2027" inside the i18n
// table; Phase 140 keeps those keys as the fallback for
// unmapped intakes.
const INTAKE_BADGE_KEYS: Record<WebinarTopicIntake, string> = {
  march_2027: 'webinar.intakeBadge.march2027',
  september_2027: 'webinar.intakeBadge.september2027',
  csc: 'webinar.intakeBadge.csc',
  other: 'webinar.intakeBadge.other',
};

export default async function WebinarPage() {
  const t = await getServerT();
  const bundle = await getActiveSessionWithTopics();
  const activeSession = bundle?.session ?? null;
  const activeTopics = bundle?.topics ?? [];
  const hasActiveTopics = activeTopics.length > 0;

  // Phase 142: cached capacity snapshot. The RSC stays
  // statically cached (revalidate = 3600); the live CapacityPill
  // client island refreshes every 30s on the client.
  const capacity = await getActiveSessionCapacity();
  const showFullForm = !!activeSession && capacity.acceptsSignups;
  const showWaitlist = !!activeSession && !capacity.acceptsSignups;
  const capacityInitial = activeSession
    ? {
        maxAttendees: capacity.maxAttendees,
        seatHolders: capacity.seatHolders,
        seatsRemaining: capacity.seatsRemaining,
        isFull: capacity.isFull,
        acceptsSignups: capacity.acceptsSignups,
      }
    : null;

  // Format the hero date pill. When the session has a real
  // date, render "Sat, 19 Sep 2026 · 10:00 AM Beijing Time".
  // When the session exists but date is null, show a
  // "scheduled but date TBA" state. When no session is set
  // up, render the Phase 139 "Date coming soon" fallback.
  const heroDateLabel = activeSession?.sessionDate
    ? formatWebinarDate(activeSession.sessionDate)
    : activeSession
      ? t('webinar.hero.dateTba')
      : t('webinar.hero.dateLabel');
  const heroDateBody = activeSession?.sessionTime
    ? activeSession.sessionTime
    : t('webinar.hero.dateBody');

  // If no topics are seeded, render the Phase 139 4-track
  // fallback (the original en/zh i18n strings remain intact).
  const fallbackTracks = [
    { badgeKey: 'webinar.agenda.t1Badge', titleKey: 'webinar.agenda.t1Title', bodyKey: 'webinar.agenda.t1Body' },
    { badgeKey: 'webinar.agenda.t2Badge', titleKey: 'webinar.agenda.t2Title', bodyKey: 'webinar.agenda.t2Body' },
    { badgeKey: 'webinar.agenda.t3Badge', titleKey: 'webinar.agenda.t3Title', bodyKey: 'webinar.agenda.t3Body' },
    { badgeKey: 'webinar.agenda.t4Badge', titleKey: 'webinar.agenda.t4Title', bodyKey: 'webinar.agenda.t4Body' },
  ];
  const fallbackIcons: LucideIcon[] = [GraduationCap, BookOpen, Globe2, Award];

  const benefitItems = [
    { titleKey: 'webinar.benefits.b1Title', bodyKey: 'webinar.benefits.b1Body' },
    { titleKey: 'webinar.benefits.b2Title', bodyKey: 'webinar.benefits.b2Body' },
    { titleKey: 'webinar.benefits.b3Title', bodyKey: 'webinar.benefits.b3Body' },
    { titleKey: 'webinar.benefits.b4Title', bodyKey: 'webinar.benefits.b4Body' },
  ];
  const benefitIcons: LucideIcon[] = [Sparkles, GraduationCap, MessageCircle, Clock];

  const faqItems = [
    { qKey: 'webinar.faq.q1', aKey: 'webinar.faq.a1' },
    { qKey: 'webinar.faq.q2', aKey: 'webinar.faq.a2' },
    { qKey: 'webinar.faq.q3', aKey: 'webinar.faq.a3' },
    { qKey: 'webinar.faq.q4', aKey: 'webinar.faq.a4' },
  ];

  // Pass serialized country list to the client form. We only
  // need {value, label} — the client doesn't care about the
  // slug/iso2/region metadata for an enrollment dropdown.
  const countryOptions = COUNTRIES.map((c) => ({ value: c.name, label: c.name }));

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* ============================== HERO ============================== */}
      <section className="relative bg-[#1B2A4A] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B2A4A] via-[#1B2A4A] to-[#2C3E60]" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20 text-center">
          <span className="inline-block bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white">
            {t('webinar.hero.eyebrow')}
          </span>
          <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            {t('webinar.hero.title')}
          </h1>
          <p className="mt-5 text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('webinar.hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-[#D4A853]/15 border border-[#D4A853]/40 px-4 py-2 text-sm text-[#D4A853] font-semibold">
              <Clock className="h-4 w-4" />
              <span>{heroDateLabel}</span>
              {heroDateBody && (
                <>
                  <span className="text-white/50">·</span>
                  <span className="text-white/80 font-normal">{heroDateBody}</span>
                </>
              )}
            </div>
            {/* Phase 142: live seat count. CapacityPill renders its
                own emerald-on-light styling so it sits below the
                gold date pill as a visually distinct (but still
                centred) row — not a "wrapped" half-inside-the-
                hero-pill as the previous layout did. */}
            {activeSession && capacityInitial && (
              <CapacityPill initial={capacityInitial} />
            )}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#signup"
              className="inline-flex items-center justify-center px-7 py-3 bg-[#9B1B30] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#7A1526] transition-colors"
            >
              {t('webinar.hero.ctaPrimary')}
              <ChevronDown className="ml-2 h-4 w-4" />
            </a>
            <a
              href="#agenda"
              className="inline-flex items-center justify-center px-7 py-3 border border-white/30 text-white font-semibold uppercase tracking-wider text-sm hover:bg-white/5 transition-colors"
            >
              {t('webinar.hero.ctaSecondary')}
            </a>
          </div>
        </div>
      </section>

      {/* ============================== AGENDA ============================== */}
      <section id="agenda" className="bg-[#FAFAF8] py-14 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9B1B30]">
              {t('webinar.agenda.eyebrow')}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#1B2A4A]">
              {t('webinar.agenda.title')}
            </h2>
          </div>
          {hasActiveTopics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeTopics.map((topic) => {
                const Icon = DEGREE_ICONS[topic.degree] ?? GraduationCap;
                const badgeKey = INTAKE_BADGE_KEYS[topic.intake];
                const isZh = false; // RSC locale detection happens via getServerT; badge keys are pre-localized
                const title = isZh ? topic.titleZh : topic.titleEn;
                const body = isZh ? topic.bodyZh : topic.bodyEn;
                return (
                  <div
                    key={topic.id}
                    className="bg-white border-2 border-[#D4A853]/40 p-6 flex gap-4"
                  >
                    <div className="flex-shrink-0 h-12 w-12 bg-[#1B2A4A] text-white flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <span className="inline-block bg-[#D4A853]/15 border border-[#D4A853]/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1B2A4A] mb-2">
                        {t(badgeKey)}
                      </span>
                      <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{title}</h3>
                      <p className="text-sm text-[#4B5563] leading-relaxed">{body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // No active topics seeded yet — Phase 139 fallback
            // renders the original 4 hardcoded tracks so the
            // page isn't a blank wall during the seed window.
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {fallbackTracks.map((track, i) => {
                const Icon = fallbackIcons[i] ?? GraduationCap;
                return (
                  <div
                    key={track.titleKey}
                    className="bg-white border-2 border-[#D4A853]/40 p-6 flex gap-4"
                  >
                    <div className="flex-shrink-0 h-12 w-12 bg-[#1B2A4A] text-white flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <span className="inline-block bg-[#D4A853]/15 border border-[#D4A853]/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1B2A4A] mb-2">
                        {t(track.badgeKey)}
                      </span>
                      <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">
                        {t(track.titleKey)}
                      </h3>
                      <p className="text-sm text-[#4B5563] leading-relaxed">
                        {t(track.bodyKey)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ============================== BENEFITS ============================== */}
      <section className="bg-[#1B2A4A] py-14 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">{t('webinar.benefits.title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefitItems.map((item, i) => {
              const Icon = benefitIcons[i] ?? Clock;
              return (
                <div key={item.titleKey} className="bg-white/5 border border-white/10 p-5">
                  <Icon className="h-7 w-7 text-[#D4A853] mb-3" />
                  <h3 className="text-base font-bold text-white mb-2">
                    {t(item.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {t(item.bodyKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================== SIGNUP FORM ============================== */}
      <section id="signup" className="bg-[#FAFAF8] py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left rail — value props */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9B1B30]">
                {t('webinar.form.eyebrow')}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#1B2A4A] leading-tight">
                {t('webinar.form.title')}
              </h2>
              <p className="mt-3 text-base text-[#4B5563] leading-relaxed">
                {t('webinar.form.subtitle')}
              </p>
            </div>
            <div className="bg-[#FAF6E8] border border-[#D4A853]/50 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-[#D4A853] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1B2A4A] text-sm">{heroDateLabel}</p>
                  <p className="text-sm text-[#4B5563]">{heroDateBody}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-[#D4A853] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1B2A4A] text-sm">{t('webinar.agenda.tracksCount')}</p>
                  <p className="text-sm text-[#4B5563]">
                    {t('webinar.agenda.tracksList')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-[#D4A853] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1B2A4A] text-sm">{t('webinar.benefits.b4Title')}</p>
                  <p className="text-sm text-[#4B5563]">
                    {t('webinar.benefits.b4Body')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right rail — the form (or waitlist form when full) */}
          <div>
            {showFullForm ? (
              <WebinarSignupForm countryOptions={countryOptions} />
            ) : showWaitlist ? (
              <WaitlistForm />
            ) : (
              // No active session at all — the empty-state fallback
              // is rendered above. Render nothing here so the right
              // rail doesn't show a stale form.
              null
            )}
          </div>
        </div>
      </section>

      {/* ============================== FAQ ============================== */}
      <section className="bg-white border-y border-gray-200 py-14 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1B2A4A] mb-8 text-center">
            {t('webinar.faq.title')}
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <details
                key={i}
                className="bg-[#FAFAF8] border border-gray-200 p-5 group"
              >
                <summary className="font-semibold text-[#1B2A4A] cursor-pointer list-none flex items-center justify-between">
                  <span>{t(item.qKey)}</span>
                  <ChevronDown className="h-4 w-4 text-[#4B5563] group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-sm text-[#4B5563] mt-3 leading-relaxed">
                  {t(item.aKey)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== BOTTOM CTA ============================== */}
      <section className="bg-[#1B2A4A] py-14 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">{t('webinar.cta.bottomTitle')}</h2>
          <p className="mt-4 text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t('webinar.cta.bottomBody')}
          </p>
          <a
            href="#signup"
            className="mt-8 inline-flex items-center justify-center px-8 py-3 bg-[#9B1B30] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#7A1526] transition-colors"
          >
            {t('webinar.cta.bottomCta')}
          </a>
          <p className="mt-6 text-xs text-white/50 uppercase tracking-wider">
            {t('webinar.cta.trustBadge')}
          </p>
        </div>
      </section>
    </div>
  );
}

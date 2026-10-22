/**
 * Phase 139 + 165: public webinar landing page.
 *
 * Phase 165 simplification: the page is fully static. All session
 * metadata (date, time, join URL, label) + the 4-track agenda come
 * from `@/lib/webinar-config` (a hardcoded module). No DB query
 * runs on this route, no `webinar_sessions` / `webinar_topics`
 * table lookups, no `is_active` toggle, no university-kind topics,
 * no auto-rollover query. Staff edits the constants in
 * `webinar-config.ts` and pushes when the date moves.
 *
 * What still goes to the DB:
 * - `POST /api/webinar-signups` for the registration form (the
 *   only runtime DB write on this surface — see api route).
 * - `GET /thank-you` for the post-submit redirect (no DB).
 *
 * Static (revalidate = 3600) so the route is cached at the edge.
 */
import type { Metadata } from 'next';
import Image from 'next/image';
import {
  GraduationCap,
  Globe2,
  BookOpen,
  Award,
  Clock,
  ChevronDown,
  MessageCircle,
  Microscope,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { getServerT } from '@/lib/server-t';
import { buildLanguageAlternates } from '@/lib/alternates';
import { COUNTRIES } from '@/lib/seo-data';
import { universities as staticUniversities } from '@/lib/data';
import {
  WEBINAR_CONFIG,
  WEBINAR_AGENDA_TRACKS,
  WEBINAR_FEATURED_UNIVERSITY_SLUGS,
  type WebinarAgendaTrack,
} from '@/lib/webinar-config';
import { formatWebinarDate } from '@/lib/webinar-config';
import { CountdownTimer } from './CountdownTimer';
import { WebinarSignupForm } from './webinar-signup-form';

export const revalidate = 3600;

// Map the agenda track icons to Lucide components (matches the
// original Phase 139 hardcoded AGENDA_ICONS).
const TRACK_ICONS: Record<WebinarAgendaTrack['icon'], LucideIcon> = {
  march: GraduationCap,
  foundation: BookOpen,
  bachelor: Globe2,
  csc: Award,
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('webinar.hero.title'),
    description: t('webinar.hero.subtitle'),
    alternates: await buildLanguageAlternates('/webinar-2027-intake-csc'),
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

export default async function WebinarPage() {
  const t = await getServerT();

  // Static session metadata — read once from the hardcoded module.
  // Phase 165: no DB call. Staff edits WEBINAR_CONFIG and pushes
  // when the date moves.
  const sessionDateIso = WEBINAR_CONFIG.sessionDateIso;
  const heroDateLabel = formatWebinarDate(sessionDateIso);
  const heroDateBody = WEBINAR_CONFIG.sessionTimeDisplay;

  // Render the 4-track agenda grid from the hardcoded list. No
  // DB lookup, no fallback chain — the agenda is canonical.
  const tracks = WEBINAR_AGENDA_TRACKS;

  const benefitItems = [
    { titleKey: 'webinar.benefits.b1Title', bodyKey: 'webinar.benefits.b1Body' },
    { titleKey: 'webinar.benefits.b2Title', bodyKey: 'webinar.benefits.b2Body' },
    { titleKey: 'webinar.benefits.b3Title', bodyKey: 'webinar.benefits.b3Body' },
    { titleKey: 'webinar.benefits.b4Title', bodyKey: 'webinar.benefits.b4Body' },
  ];
  const benefitIcons: LucideIcon[] = [Clock, GraduationCap, MessageCircle, Clock];

  const faqItems = [
    { qKey: 'webinar.faq.q1', aKey: 'webinar.faq.a1' },
    { qKey: 'webinar.faq.q2', aKey: 'webinar.faq.a2' },
    { qKey: 'webinar.faq.q3', aKey: 'webinar.faq.a3' },
    { qKey: 'webinar.faq.q4', aKey: 'webinar.faq.a4' },
  ];

  // Country dropdown is static (Phase 139's COUNTRIES seed). Pass
  // a serialised list to the client form.
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
            <CountdownTimer sessionDate={sessionDateIso} />
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9B1B30]">
              {t('webinar.agenda.eyebrow')}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#1B2A4A]">
              {t('webinar.agenda.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tracks.map((track) => {
              const Icon = TRACK_ICONS[track.icon];
              return (
                <div
                  key={track.id}
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

      {/* ============================== FEATURED UNIVERSITIES (static, no DB) ============================== */}
      {/* Phase 165b: 5-card grid sourced from src/lib/data.ts's
          static fallback (no DB query, no Phase 162 dynamic topic
          rows). The 5 slugs are hardcoded in WEBINAR_FEATURED_UNIVERSITY_SLUGS
          so staff can swap the featured list with a commit. Each
          card shows logo + bilingual name + city + QS ranking + 3
          top programs + a "View detail" link to /universities/<slug>. */}
      <section id="universities" className="bg-white border-y border-gray-200 py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9B1B30]">
              {t('webinar.featuredEyebrow')}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#1B2A4A]">
              {t('webinar.featuredTitle')}
            </h2>
            <p className="mt-3 text-base text-[#4B5563] max-w-3xl mx-auto leading-relaxed">
              {t('webinar.featuredSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {WEBINAR_FEATURED_UNIVERSITY_SLUGS.map((slug) => {
              const uni = staticUniversities.find((u) => u.slug === slug);
              if (!uni) return null;
              return (
                <div
                  key={uni.slug}
                  className="bg-[#FAFAF8] border-2 border-[#D4A853]/40 p-5 flex flex-col"
                >
                  <div className="mb-3">
                    <h3 className="font-bold text-[#1B2A4A] text-base leading-tight">
                      {uni.name}
                    </h3>
                    <p className="text-xs text-gray-500 leading-tight mt-0.5">{uni.nameCn}</p>
                  </div>
                  <div className="text-xs text-gray-600 mb-3 flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#1B2A4A]">#{uni.ranking}</span>
                    <span className="text-gray-400">·</span>
                    <span>{uni.city}</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-[#9B1B30] font-bold mb-1">
                    {t('webinar.card.topPrograms')}
                  </div>
                  <ul className="text-xs text-[#4B5563] space-y-0.5 mb-3 flex-1">
                    {uni.popularPrograms.slice(0, 3).map((program, i) => (
                      <li key={i} className="truncate">
                        • {program}
                      </li>
                    ))}
                  </ul>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-[#9B1B30] font-bold mb-1">
                    {t('webinar.card.tuition')}
                  </div>
                  <p className="text-xs text-[#4B5563] mb-4">{uni.tuitionUndergrad}</p>
                  <a
                    href={`/universities/${uni.slug}`}
                    className="mt-auto inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0F1B33] transition-colors"
                  >
                    {t('webinar.card.viewDetail')}
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="webinar-activity-title" className="bg-[#FAFAF8] border-b border-gray-200 py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9B1B30]">
              {t('webinar.activity.eyebrow')}
            </p>
            <h2 id="webinar-activity-title" className="mt-3 text-3xl font-bold text-[#1B2A4A]">
              {t('webinar.activity.title')}
            </h2>
          </div>
          <figure className="bg-white border border-gray-200">
            <Image
              src="/webinars/sica-live-webinar.png"
              alt={t('webinar.activity.imageAlt')}
              width={3290}
              height={1694}
              sizes="(max-width: 1152px) 100vw, 1088px"
              className="w-full h-auto"
            />
            <figcaption className="p-5 sm:p-6 text-sm text-[#4B5563] leading-relaxed">
              {t('webinar.activity.caption')}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ============================== SIGNUP FORM ============================== */}
      <section id="signup" className="bg-[#FAFAF8] py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
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
                <Award className="h-5 w-5 text-[#D4A853] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1B2A4A] text-sm">{t('webinar.benefits.b4Title')}</p>
                  <p className="text-sm text-[#4B5563]">
                    {t('webinar.benefits.b4Body')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* Phase 165: registration is always open (no isClosed
                prop, no session FK, no 410 gate). The form submits
                to /api/webinar-signups which inserts to webinar_signups
                with no session FK. */}
            <WebinarSignupForm countryOptions={countryOptions} />
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

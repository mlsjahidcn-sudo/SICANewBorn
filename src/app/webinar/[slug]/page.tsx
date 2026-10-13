/**
 * Phase 161: data-driven webinar landing page — /webinar/[slug].
 *
 * Replaces the single hardcoded /webinar-2027-intake-csc page (that
 * route now redirects here). Everything below the hero comes from
 * the webinar_sessions row + its jsonb columns:
 *
 *   hero          — title/description, session_time display label,
 *                   visitor-local time + countdown + seats-left
 *                   (client island), Reserve My Seat CTA
 *   agenda        — agenda jsonb; falls back to webinar_topics rows
 *                   (Phase 140), then to the generic i18n tracks
 *   universities  — featured_universities jsonb cards (name, city,
 *                   ranking badge, English programs, scholarships,
 *                   key requirements, deadline)
 *   eligibility   — rule-based client checker over the same jsonb
 *   CSCA prep     — link block to cscaprep.academy
 *   FAQ           — faq jsonb (details/summary)
 *   signup        — capacity-aware form + waitlist + .ics
 *
 * SEO: per-slug metadata + Open Graph image + Event JSON-LD.
 * No SICA service prices anywhere on this page.
 *
 * RSC + client islands; revalidate 120s (capacity polls live
 * client-side, the page shell only needs title/agenda freshness).
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  GraduationCap,
  Globe2,
  BookOpen,
  Award,
  Clock,
  ChevronDown,
  Microscope,
  Sparkles,
  Building2,
  CalendarDays,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import { getServerT, getServerLocale } from '@/lib/server-t';
import { buildLanguageAlternates } from '@/lib/alternates';
import { COUNTRIES } from '@/lib/seo-data';
import {
  getWebinarBySlug,
  getTopicsForSession,
  formatWebinarDate,
  type WebinarTopic,
} from '@/lib/webinar-sessions';
import type { WebinarAgendaItem } from '@/lib/webinar-content';
import { WebinarHeroWidgets } from './webinar-hero-widgets';
import { WebinarEligibilityChecker } from './eligibility-checker';
import { WebinarPageForm } from './webinar-page-form';

export const revalidate = 120;

export const dynamicParams = true;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://studyinchina.academy';

// Fallback agenda icons. Keys cover both the seeded `icon` values
// (universities / requirements / check / csca / basics) and the
// Phase 140 topic.degree enums (the topics fallback path). Unknown
// keys degrade to GraduationCap.
const AGENDA_ICONS: Record<string, LucideIcon> = {
  universities: Building2,
  requirements: BookOpen,
  check: Award,
  csca: Sparkles,
  basics: Globe2,
  chinese_language: GraduationCap,
  foundation: BookOpen,
  bachelor: Globe2,
  master: Award,
  phd: Microscope,
  csc: Sparkles,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = await getServerT();
  const bundle = await getWebinarBySlug(slug);
  if (!bundle) {
    return {
      title: t('webinar.page.notFoundTitle'),
      description: t('webinar.hero.subtitle'),
      alternates: buildLanguageAlternates(`/webinar/${slug}`),
    };
  }
  const title = t('webinar.page.metaTitle', { title: bundle.session.titleEn });
  const description = bundle.session.descriptionEn ?? t('webinar.hero.subtitle');
  return {
    title,
    description,
    alternates: buildLanguageAlternates(`/webinar/${slug}`),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/webinar/${slug}`,
      images: [{ url: '/og-default.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-default.png'],
    },
  };
}

export default async function WebinarSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getServerT();
  const bundle = await getWebinarBySlug(slug);
  if (!bundle) notFound();

  const { session, content, seatInfo } = bundle;
  const isZh = (await getServerLocale()) === 'zh';

  // Agenda: jsonb first, Phase 140 topics second, generic i18n third.
  const topics: WebinarTopic[] = content.agenda.length === 0 ? await getTopicsForSession(session.id) : [];
  const agendaFromTopics = topics.map((topic) => ({
    icon: topic.degree,
    titleEn: topic.titleEn,
    titleZh: topic.titleZh,
    bodyEn: topic.bodyEn,
    bodyZh: topic.bodyZh,
  }));
  const agendaItems: WebinarAgendaItem[] =
    content.agenda.length > 0 ? content.agenda : agendaFromTopics;

  const dateLabel = session.sessionDate ? formatWebinarDate(session.sessionDate) : t('webinar.hero.dateLabel');
  const countryOptions = COUNTRIES.map((c) => ({ value: c.name, label: c.name }));

  // Event JSON-LD (schema.org) — free online event.
  const eventJsonLd = session.sessionDate
    ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: session.titleEn,
        description: session.descriptionEn ?? undefined,
        startDate: session.sessionDate,
        endDate: new Date(
          new Date(session.sessionDate).getTime() + session.durationMinutes * 60_000,
        ).toISOString(),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        location: {
          '@type': 'VirtualLocation',
          url: `${SITE_URL}/webinar/${session.slug}`,
        },
        image: [`${SITE_URL}/og-default.png`],
        organizer: {
          '@type': 'Organization',
          name: 'SICA — Study in China Academy',
          url: SITE_URL,
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: seatInfo.formMode === 'waitlist'
            ? 'https://schema.org/SoldOut'
            : 'https://schema.org/InStock',
          url: `${SITE_URL}/webinar/${session.slug}#signup`,
        },
      }
    : null;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {eventJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
      )}

      {/* ============================== HERO ============================== */}
      <section className="relative bg-[#1B2A4A] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B2A4A] via-[#1B2A4A] to-[#2C3E60]" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20 text-center">
          <span className="inline-block bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white">
            {t('webinar.page.heroEyebrow')}
          </span>
          <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            {isZh ? session.titleZh || session.titleEn : session.titleEn}
          </h1>
          {(isZh ? session.descriptionZh : session.descriptionEn) && (
            <p className="mt-5 text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {isZh ? session.descriptionZh : session.descriptionEn}
            </p>
          )}

          <WebinarHeroWidgets
            slug={session.slug}
            startsAt={session.sessionDate}
            sessionTimeLabel={session.sessionTime}
            initialSeatsLeft={seatInfo.seatsLeft}
            initialSeatCap={seatInfo.seatCap}
            initialFormMode={seatInfo.formMode}
          />

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#signup"
              className="inline-flex items-center justify-center px-7 py-3 bg-[#9B1B30] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#7A1526] transition-colors"
            >
              {t('webinar.page.ctaReserve')}
              <ChevronDown className="ml-2 h-4 w-4" />
            </a>
            {content.featuredUniversities.length > 0 && (
              <a
                href="#eligibility"
                className="inline-flex items-center justify-center px-7 py-3 border border-white/30 text-white font-semibold uppercase tracking-wider text-sm hover:bg-white/5 transition-colors"
              >
                {t('webinar.page.ctaEligibility')}
              </a>
            )}
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
              {t('webinar.page.agendaTitle')}
            </h2>
          </div>
          {agendaItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {agendaItems.map((item, i) => {
                const Icon = AGENDA_ICONS[item.icon] ?? GraduationCap;
                return (
                  <div key={`${item.icon}-${i}`} className="bg-white border-2 border-[#D4A853]/40 p-6 flex gap-4">
                    <div className="flex-shrink-0 h-12 w-12 bg-[#1B2A4A] text-white flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <span className="inline-block bg-[#D4A853]/15 border border-[#D4A853]/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1B2A4A] mb-2">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">
                        {isZh ? item.titleZh || item.titleEn : item.titleEn}
                      </h3>
                      <p className="text-sm text-[#4B5563] leading-relaxed">
                        {isZh ? item.bodyZh || item.bodyEn : item.bodyEn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // No agenda jsonb AND no Phase 140 topics — generic tracks.
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(['t1', 't2', 't3', 't4'] as const).map((key, i) => {
                const Icon = [GraduationCap, BookOpen, Globe2, Microscope][i] ?? GraduationCap;
                return (
                  <div key={key} className="bg-white border-2 border-[#D4A853]/40 p-6 flex gap-4">
                    <div className="flex-shrink-0 h-12 w-12 bg-[#1B2A4A] text-white flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">
                        {t(`webinar.agenda.${key}Title`)}
                      </h3>
                      <p className="text-sm text-[#4B5563] leading-relaxed">
                        {t(`webinar.agenda.${key}Body`)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ======================= FEATURED UNIVERSITIES ======================= */}
      {content.featuredUniversities.length > 0 && (
        <section className="bg-[#1B2A4A] py-14 lg:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4A853]">
                {t('webinar.page.unisEyebrow')}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white">
                {t('webinar.page.unisTitle')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {content.featuredUniversities.map((uni) => (
                <div
                  key={uni.slug}
                  className="bg-white flex flex-col p-6 border-t-4 border-[#9B1B30]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-[#1B2A4A] leading-snug">
                      {isZh ? uni.nameZh || uni.nameEn : uni.nameEn}
                    </h3>
                    <span className="flex-shrink-0 bg-[#D4A853] text-[#1B2A4A] text-[10px] font-extrabold uppercase tracking-wider px-2 py-1">
                      {uni.rankingLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[#4B5563] mt-1 flex items-center gap-1">
                    <Globe2 className="h-3 w-3" />
                    {isZh ? uni.cityZh || uni.cityEn : uni.cityEn}
                  </p>

                  <dl className="mt-4 space-y-3 text-sm flex-1">
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9B1B30]">
                        {t('webinar.uni.englishPrograms')}
                      </dt>
                      <dd className="text-[#4B5563] mt-1 leading-relaxed">
                        {isZh ? uni.englishProgramsZh || uni.englishProgramsEn : uni.englishProgramsEn}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9B1B30]">
                        {t('webinar.uni.scholarship')}
                      </dt>
                      <dd className="text-[#4B5563] mt-1 leading-relaxed">
                        {isZh ? uni.scholarshipZh || uni.scholarshipEn : uni.scholarshipEn}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9B1B30]">
                        {t('webinar.uni.requirements')}
                      </dt>
                      <dd className="text-[#4B5563] mt-1 leading-relaxed">
                        {isZh ? uni.requirementsZh || uni.requirementsEn : uni.requirementsEn}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-[#9B1B30] flex-shrink-0" />
                    <span className="text-[#1B2A4A] font-semibold">
                      {t('webinar.uni.deadline')}
                    </span>
                    <span className="text-[#4B5563]">{uni.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================= ELIGIBILITY CHECKER ======================= */}
      {content.featuredUniversities.length > 0 && (
        <section id="eligibility" className="bg-[#FAFAF8] py-14 lg:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <WebinarEligibilityChecker universities={content.featuredUniversities} countries={countryOptions} />
          </div>
        </section>
      )}

      {/* ============================ CSCA PREP ============================ */}
      <section className="bg-white border-y border-gray-200 py-14 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-12 w-12 bg-[#1B2A4A] text-white flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A]">
            {t('webinar.csca.title')}
          </h2>
          <p className="mt-4 text-base text-[#4B5563] max-w-2xl mx-auto leading-relaxed">
            {t('webinar.csca.body')}
          </p>
          <a
            href="https://cscaprep.academy"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 px-7 py-3 bg-[#1B2A4A] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#2C3E60] transition-colors"
          >
            {t('webinar.csca.cta')}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ============================== SIGNUP ============================== */}
      <section id="signup" className="bg-[#FAFAF8] py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9B1B30]">
                {t('webinar.form.eyebrow')}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#1B2A4A] leading-tight">
                {isZh ? session.titleZh || session.titleEn : session.titleEn}
              </h2>
              <p className="mt-3 text-base text-[#4B5563] leading-relaxed">
                {t('webinar.form.subtitle')}
              </p>
            </div>
            <div className="bg-[#FAF6E8] border border-[#D4A853]/50 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-[#D4A853] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1B2A4A] text-sm">{dateLabel}</p>
                  <p className="text-sm text-[#4B5563]">
                    {session.sessionTime ?? t('webinar.hero.dateBody')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-[#D4A853] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1B2A4A] text-sm">
                    {t('webinar.benefits.b2Title')}
                  </p>
                  <p className="text-sm text-[#4B5563]">{t('webinar.benefits.b2Body')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-[#D4A853] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1B2A4A] text-sm">
                    {t('webinar.benefits.b4Title')}
                  </p>
                  <p className="text-sm text-[#4B5563]">{t('webinar.benefits.b4Body')}</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <WebinarPageForm
              webinarSlug={session.slug}
              startsAt={session.sessionDate}
              durationMinutes={session.durationMinutes}
              webinarTitle={isZh ? session.titleZh || session.titleEn : session.titleEn}
              countryOptions={countryOptions}
              initialFormMode={seatInfo.formMode}
              initialSeatsLeft={seatInfo.seatsLeft}
              initialSeatCap={seatInfo.seatCap}
            />
          </div>
        </div>
      </section>

      {/* ============================== FAQ ============================== */}
      {content.faq.length > 0 && (
        <section className="bg-white border-y border-gray-200 py-14 lg:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#1B2A4A] mb-8 text-center">
              {t('webinar.faq.title')}
            </h2>
            <div className="space-y-4">
              {content.faq.map((item, i) => (
                <details key={i} className="bg-[#FAFAF8] border border-gray-200 p-5 group">
                  <summary className="font-semibold text-[#1B2A4A] cursor-pointer list-none flex items-center justify-between">
                    <span>{isZh ? item.qZh || item.qEn : item.qEn}</span>
                    <ChevronDown className="h-4 w-4 text-[#4B5563] group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-sm text-[#4B5563] mt-3 leading-relaxed">
                    {isZh ? item.aZh || item.aEn : item.aEn}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================ BOTTOM CTA ============================ */}
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
            {t('webinar.page.ctaReserve')}
          </a>
          <p className="mt-6 text-xs text-white/50 uppercase tracking-wider">
            {t('webinar.cta.trustBadge')}
          </p>
        </div>
      </section>
    </div>
  );
}

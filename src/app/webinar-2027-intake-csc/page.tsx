/**
 * Phase 139: public webinar landing page.
 *
 * One-session webinar covering March 2027 Intake (Chinese
 * Language + Foundation), September 2027 Intake (Bachelor +
 * Master's), and CSC Scholarship. Signup form posts to
 * /api/webinar-signups and redirects to
 * /thank-you?source=webinar&interest=webinar-2027-intake-csc.
 *
 * Date copy is placeholder ("Date coming soon") until staff
 * confirm the real session date — staff then edits the
 * webinar.confirmed email template body to swap in the
 * actual join link. No code change needed at that point.
 *
 * RSC + client island. Static (revalidate = 3600) since the
 * copy and structure only change via code deployment.
 */
import type { Metadata } from 'next';
import { GraduationCap, Globe2, BookOpen, Award, Clock, Sparkles, ChevronDown, MessageCircle } from 'lucide-react';
import { getServerT } from '@/lib/server-t';
import { buildLanguageAlternates } from '@/lib/alternates';
import { COUNTRIES } from '@/lib/seo-data';
import { WebinarSignupForm } from './webinar-signup-form';

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

const AGENDA_ICONS = [GraduationCap, BookOpen, Globe2, Award] as const;
const BENEFIT_ICONS = [Sparkles, GraduationCap, MessageCircle, Clock] as const;

export default async function WebinarPage() {
  const t = await getServerT();

  const agendaTracks = [
    { badgeKey: 'webinar.agenda.t1Badge', titleKey: 'webinar.agenda.t1Title', bodyKey: 'webinar.agenda.t1Body' },
    { badgeKey: 'webinar.agenda.t2Badge', titleKey: 'webinar.agenda.t2Title', bodyKey: 'webinar.agenda.t2Body' },
    { badgeKey: 'webinar.agenda.t3Badge', titleKey: 'webinar.agenda.t3Title', bodyKey: 'webinar.agenda.t3Body' },
    { badgeKey: 'webinar.agenda.t4Badge', titleKey: 'webinar.agenda.t4Title', bodyKey: 'webinar.agenda.t4Body' },
  ];
  const benefitItems = [
    { titleKey: 'webinar.benefits.b1Title', bodyKey: 'webinar.benefits.b1Body' },
    { titleKey: 'webinar.benefits.b2Title', bodyKey: 'webinar.benefits.b2Body' },
    { titleKey: 'webinar.benefits.b3Title', bodyKey: 'webinar.benefits.b3Body' },
    { titleKey: 'webinar.benefits.b4Title', bodyKey: 'webinar.benefits.b4Body' },
  ];
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
          <div className="mt-8 inline-flex items-center gap-2 bg-[#D4A853]/15 border border-[#D4A853]/40 px-4 py-2 text-sm text-[#D4A853] font-semibold">
            <Clock className="h-4 w-4" />
            <span>{t('webinar.hero.dateLabel')}</span>
            <span className="text-white/50">·</span>
            <span className="text-white/80 font-normal">{t('webinar.hero.dateBody')}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {agendaTracks.map((track, i) => {
              const Icon = AGENDA_ICONS[i];
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
              const Icon = BENEFIT_ICONS[i];
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
                  <p className="font-semibold text-[#1B2A4A] text-sm">{t('webinar.hero.dateLabel')}</p>
                  <p className="text-sm text-[#4B5563]">{t('webinar.hero.dateBody')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-[#D4A853] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1B2A4A] text-sm">4 tracks in 60 minutes</p>
                  <p className="text-sm text-[#4B5563]">
                    Chinese Language · Foundation · Bachelor + Master · CSC Scholarship
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-[#D4A853] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1B2A4A] text-sm">Free 1:1 follow-up if you attend</p>
                  <p className="text-sm text-[#4B5563]">
                    Everyone who attends the live session gets a free 10-minute counselling slot.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right rail — the form */}
          <div>
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

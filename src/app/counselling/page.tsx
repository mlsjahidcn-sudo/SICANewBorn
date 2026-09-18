import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import {
  Award,
  CalendarCheck,
  ClipboardList,
  Coins,
  Compass,
  MessagesSquare,
  Route,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { getServerT } from '@/lib/server-t';
import { BookingWizard } from './booking-wizard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('counselling.metaTitle'),
    description: t('counselling.heroSubtitle'),
    alternates: buildLanguageAlternates('/counselling'),
    openGraph: {
      title: t('counselling.metaTitle'),
      description: t('counselling.heroSubtitle'),
      url: '/counselling',
      images: ['/og-default.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('counselling.metaTitle'),
      description: t('counselling.heroSubtitle'),
      images: ['/og-default.png'],
    },
  };
}

const BENEFITS = [
  { icon: Compass, titleKey: 'counselling.benefit1Title', bodyKey: 'counselling.benefit1Body' },
  { icon: Route, titleKey: 'counselling.benefit2Title', bodyKey: 'counselling.benefit2Body' },
  { icon: Award, titleKey: 'counselling.benefit3Title', bodyKey: 'counselling.benefit3Body' },
  { icon: Coins, titleKey: 'counselling.benefit4Title', bodyKey: 'counselling.benefit4Body' },
] as const;

const STEPS = [
  { icon: CalendarCheck, titleKey: 'counselling.step1Title', bodyKey: 'counselling.step1Body' },
  { icon: Video, titleKey: 'counselling.step2Title', bodyKey: 'counselling.step2Body' },
  { icon: ClipboardList, titleKey: 'counselling.step3Title', bodyKey: 'counselling.step3Body' },
] as const;

export default async function CounsellingPage() {
  const t = await getServerT();

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero-bg.avif)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A] via-[#1B2A4A]/85 to-[#1B2A4A]/60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          <span className="inline-block border border-[#D4A853] text-[#D4A853] text-xs font-semibold uppercase tracking-widest px-4 py-1.5 mb-6">
            {t('counselling.badge')}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white max-w-3xl mx-auto leading-tight">
            {t('counselling.heroTitle')}
          </h1>
          <p className="mt-5 text-lg text-gray-300 max-w-2xl mx-auto">
            {t('counselling.heroSubtitle')}
          </p>
          <div className="mt-8">
            <a
              href="#book"
              className="inline-block px-10 py-4 bg-[#9B1B30] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#7A1526] transition-colors"
            >
              {t('counselling.ctaBook')}
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-gray-300">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#D4A853]" />
              {t('counselling.reassure1')}
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#D4A853]" />
              {t('counselling.reassure2')}
            </span>
            <span className="flex items-center gap-2">
              <MessagesSquare className="h-4 w-4 text-[#D4A853]" />
              {t('counselling.reassure3')}
            </span>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] text-center">
          {t('counselling.whatYouGetTitle')}
        </h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map(({ icon: Icon, titleKey, bodyKey }) => (
            <div key={titleKey} className="bg-white border border-gray-200 p-6">
              <div className="h-12 w-12 bg-[#1B2A4A]/5 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-[#1B2A4A]" />
              </div>
              <h3 className="text-base font-bold text-[#1B2A4A] mb-2">{t(titleKey)}</h3>
              <p className="text-sm text-[#4B5563]">{t(bodyKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] text-center">
            {t('counselling.howTitle')}
          </h2>
          <div className="mt-10 grid sm:grid-cols-3 gap-8">
            {STEPS.map(({ icon: Icon, titleKey, bodyKey }, i) => (
              <div key={titleKey} className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <div className="h-16 w-16 bg-[#9B1B30]/5 border border-[#9B1B30]/20 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-[#9B1B30]" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-6 w-6 bg-[#1B2A4A] text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-[#1B2A4A]">{t(titleKey)}</h3>
                <p className="mt-2 text-sm text-[#4B5563] max-w-xs mx-auto">{t(bodyKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking wizard */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <BookingWizard />
      </section>

      {/* Deeper-commitment cross-link */}
      <section className="bg-[#1B2A4A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {t('counselling.crossSellTitle')}
          </h2>
          <p className="mt-3 text-gray-300 max-w-xl mx-auto">{t('counselling.crossSellBody')}</p>
          <a
            href="/assessment"
            className="inline-block mt-6 px-8 py-3 bg-[#9B1B30] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#7A1526] transition-colors"
          >
            {t('counselling.crossSellCta')}
          </a>
        </div>
      </section>
    </div>
  );
}

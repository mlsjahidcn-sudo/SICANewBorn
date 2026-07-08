import Link from 'next/link';
import { FileText, BookOpen, Mail, Users, CheckCircle2, ArrowRight, Sparkles, Clock } from 'lucide-react';
import { getServerT } from '@/lib/server-t';

// Phase 2 funnel: self-serve product landing. Mirrors the structure
// of /about (hero + product cards + comparison + how-it-works + FAQ
// + CTA) but every section is tuned to the Whop-community product
// rather than the SICA mission. The single CTA at the bottom routes
// to Whop — see WHOP_URL below.
//
// The page is a Server Component so it ships zero JS for the static
// content. The `getServerT()` helper reads the sica-locale cookie
// for the i18n lookups, so we don't need a separate `cookies()` call.

/**
 * TODO Phase 2: replace this placeholder with the real SICA Whop
 * community URL on deploy. The Whop community is the entire
 * self-serve product — without the right URL the CTA goes nowhere.
 * Example format: https://whop.com/sica-resources
 */
const WHOP_URL = 'https://whop.com/sica-resources';

export default async function ResourcesPage() {
  const t = await getServerT();

  // Product cards — the 4 deliverables SICA ships in the Whop
  // community. Same order as the i18n keys (templates / study /
  // emails / community) so a translator can keep them in sync.
  const productCards = [
    {
      icon: FileText,
      title: t('resources.card.templates.title'),
      desc: t('resources.card.templates.desc'),
    },
    {
      icon: BookOpen,
      title: t('resources.card.study.title'),
      desc: t('resources.card.study.desc'),
    },
    {
      icon: Mail,
      title: t('resources.card.emails.title'),
      desc: t('resources.card.emails.desc'),
    },
    {
      icon: Users,
      title: t('resources.card.community.title'),
      desc: t('resources.card.community.desc'),
    },
  ];

  const howItWorksSteps = [
    { n: 1, title: t('resources.howItWorks.step1Title'), desc: t('resources.howItWorks.step1Desc') },
    { n: 2, title: t('resources.howItWorks.step2Title'), desc: t('resources.howItWorks.step2Desc') },
    { n: 3, title: t('resources.howItWorks.step3Title'), desc: t('resources.howItWorks.step3Desc') },
  ];

  const stats = [
    { value: t('resources.proofStat1Value'), label: t('resources.proofStat1Label') },
    { value: t('resources.proofStat2Value'), label: t('resources.proofStat2Label') },
    { value: t('resources.proofStat3Value'), label: t('resources.proofStat3Label') },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* ========== Hero ========== */}
      <section className="relative overflow-hidden bg-[#1B2A4A]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/hero-bg.avif)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B2A4A] via-[#1B2A4A]/90 to-[#2C3E60]/80" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-[#9B1B30]/20 border border-[#9B1B30]/40 px-3 py-1 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#D4A853]" />
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#D4A853]">
              {t('resources.hero.eyebrow')}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            {t('resources.hero.title')}
          </h1>
          <p className="mt-5 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t('resources.hero.subtitle')}
          </p>
          {/* Primary CTA — opens Whop in a new tab. Whop owns the
              payment surface; the user can return to SICA after. */}
          <a
            href={WHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold uppercase tracking-wider text-sm px-8 py-4 transition-colors"
          >
            {t('resources.hero.cta')}
            <ArrowRight className="h-4 w-4" />
          </a>
          <p className="mt-3 text-xs text-gray-400">
            {t('resources.hero.ctaHint')}
          </p>
        </div>
      </section>

      {/* ========== What's in the community — 4 product cards ========== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A]">
            {t('resources.what.title')}
          </h2>
          <p className="mt-3 text-[#4B5563] leading-relaxed">
            {t('resources.what.subtitle')}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productCards.map((card) => (
            <div
              key={card.title}
              className="bg-white border-2 border-gray-200 hover:border-[#9B1B30] p-6 transition-colors group"
            >
              <div className="h-12 w-12 flex items-center justify-center bg-[#1B2A4A] text-white mb-4 group-hover:bg-[#9B1B30] transition-colors">
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== Comparison table — full-service vs self-serve ========== */}
      <section className="bg-white border-y border-gray-200 py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] text-center mb-10">
            {t('productCompare.title')}
          </h2>
          {/* Use grid (not <table>) for layout — easier to make
              responsive (rows stack on mobile). Each row is a
              3-column grid: label / full-service / self-serve. */}
          <div className="border-2 border-gray-200 bg-[#FAFAF8]">
            {/* Header row */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-b-2 border-gray-200">
              <div className="p-4 md:border-r border-gray-200">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  &nbsp;
                </span>
              </div>
              <div className="p-4 bg-[#1B2A4A] text-white md:border-r border-gray-200">
                <span className="text-sm font-bold uppercase tracking-wider">
                  {t('productCompare.columnFullService')}
                </span>
              </div>
              <div className="p-4 bg-[#9B1B30] text-white">
                <span className="text-sm font-bold uppercase tracking-wider">
                  {t('productCompare.columnSelfServe')}
                </span>
              </div>
            </div>
            {/* Body rows — 4 comparison dimensions */}
            {[
              { label: t('productCompare.rowWhoApplies'), fs: t('productCompare.rowWhoAppliesFs'), ss: t('productCompare.rowWhoAppliesSs') },
              { label: t('productCompare.rowBestFor'), fs: t('productCompare.rowBestForFs'), ss: t('productCompare.rowBestForSs') },
              { label: t('productCompare.rowIncludes'), fs: t('productCompare.rowIncludesFs'), ss: t('productCompare.rowIncludesSs') },
              { label: t('productCompare.rowPricing'), fs: t('productCompare.rowPricingFs'), ss: t('productCompare.rowPricingSs') },
            ].map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-1 md:grid-cols-3 ${i > 0 ? 'border-t border-gray-200' : ''}`}
              >
                <div className="p-4 md:border-r border-gray-200 bg-[#FAFAF8]">
                  <span className="text-sm font-semibold text-[#1B2A4A]">
                    {row.label}
                  </span>
                </div>
                <div className="p-4 md:border-r border-gray-200">
                  <span className="text-sm text-[#4B5563] leading-relaxed">
                    {row.fs}
                  </span>
                </div>
                <div className="p-4 bg-[#FAFAF8]/50">
                  <span className="text-sm text-[#4B5563] leading-relaxed">
                    {row.ss}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {/* Two CTAs under the table — give the reader an
              immediate next step regardless of which side they
              leaned toward. */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/assessment"
              className="inline-flex items-center justify-center gap-2 bg-[#1B2A4A] hover:bg-[#0F1A2E] text-white font-semibold uppercase tracking-wider text-sm px-6 py-3 transition-colors"
            >
              {t('product.fullService.ctaLabel')} →
            </Link>
            <a
              href={WHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#9B1B30] text-[#9B1B30] hover:bg-[#9B1B30] hover:text-white font-semibold uppercase tracking-wider text-sm px-6 py-3 transition-colors"
            >
              {t('product.selfServe.ctaLabel')} →
            </a>
          </div>
        </div>
      </section>

      {/* ========== How it works — 3 steps ========== */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A]">
            {t('resources.howItWorks.title')}
          </h2>
        </div>
        <div className="space-y-4">
          {howItWorksSteps.map((step) => (
            <div key={step.n} className="flex gap-4 bg-white border border-gray-200 p-5">
              <div className="flex-shrink-0 w-10 h-10 bg-[#9B1B30] text-white flex items-center justify-center font-bold text-lg">
                {step.n}
              </div>
              <div>
                <h3 className="font-semibold text-[#1B2A4A]">{step.title}</h3>
                <p className="text-sm text-[#4B5563] mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== Stats — community size + content library ========== */}
      <section className="bg-[#1B2A4A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-3 gap-4 lg:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl lg:text-5xl font-extrabold text-[#D4A853]">
                  {stat.value}
                </p>
                <p className="text-xs lg:text-sm text-gray-300 mt-2 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] mb-8">
          {t('resources.faq.title')}
        </h2>
        <div className="space-y-4">
          {[
            { q: t('resources.faq.q1'), a: t('resources.faq.a1') },
            { q: t('resources.faq.q2'), a: t('resources.faq.a2') },
            { q: t('resources.faq.q3'), a: t('resources.faq.a3') },
          ].map((item, i) => (
            <details
              key={i}
              className="bg-white border border-gray-200 p-5 group"
            >
              <summary className="font-semibold text-[#1B2A4A] cursor-pointer list-none flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#9B1B30] shrink-0" />
                  {item.q}
                </span>
                <ArrowRight className="h-4 w-4 text-[#4B5563] group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-sm text-[#4B5563] mt-3 leading-relaxed pl-6">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ========== Final CTA — Whop link, the actual conversion ========== */}
      <section className="relative overflow-hidden bg-[#9B1B30]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#9B1B30] to-[#7A1526]" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Clock className="h-10 w-10 text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t('resources.cta.title')}
          </h2>
          <p className="mt-4 text-gray-100 max-w-2xl mx-auto leading-relaxed">
            {t('resources.cta.subtitle')}
          </p>
          <a
            href={WHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-[#9B1B30] font-bold uppercase tracking-wider text-sm px-8 py-4 transition-colors"
          >
            {t('resources.cta.button')}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}

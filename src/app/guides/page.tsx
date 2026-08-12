import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { getServerT, getServerLocale } from '@/lib/server-t';
import { guideCards } from '@/lib/guides/hub-data';
import { GuideIcons } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

// Constants for the listicle pagination — process guides section
// stays static (6 cards fit in 2 rows of 3 with room to breathe).
const LISTICLES_PER_PAGE = 9;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('seo.guidesTitle'),
    description: t('seo.guidesDescription'),
    alternates: buildLanguageAlternates('/guides'),
    openGraph: {
      title: t('seo.guidesOgTitle'),
      description: t('seo.guidesDescription'),
      url: `${SITE_URL}/guides`,
      type: 'website',
    },
  };
}

export default async function GuidesHubPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const [t, locale] = await Promise.all([getServerT(), getServerLocale()]);
  const cards = guideCards[locale];

  // Listicle pagination: 9 cards per page, ?page=N (1-indexed).
  // Process guides section is not paginated — only 6 cards.
  const sp: { page?: string } = searchParams ? await searchParams : {};
  const rawPage = Number.parseInt(sp.page ?? '1', 10);
  const requestedPage = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  const allListicles = cards.filter((c) => c.category === 'listicle');
  const totalPages = Math.max(1, Math.ceil(allListicles.length / LISTICLES_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);
  const listicleStart = (currentPage - 1) * LISTICLES_PER_PAGE;
  const pagedListicles = allListicles.slice(listicleStart, listicleStart + LISTICLES_PER_PAGE);

  // JSON-LD: ItemList so the hub itself can surface in search results
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: cards.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.title,
      description: c.subtitle,
      url: `${SITE_URL}${c.href}`,
    })),
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Hero — same bg-image + left-to-right navy gradient overlay
          as the /about page hero so the visual treatment is
          consistent across the public surface. */}
      <section className="relative overflow-hidden text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero-bg.avif)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A] via-[#1B2A4A]/80 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 mb-6">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {t('guides.hero.eyebrow')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              {t('guides.hero.title')}
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              {t('guides.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Cards grid — two sections: process guides + listicles */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <h2 className="text-2xl font-bold text-[#1B2A4A] mb-2">
          {t('guides.sectionTitle')}
        </h2>
        <p className="text-[#4B5563] mb-10">
          {t('guides.sectionSubtitle')}
        </p>

        {/* Section 1: Process guides (the original /guides/* pages) */}
        <div className="mb-12">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9B1B30] mb-4">
            {t('guides.processTitle')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards
              .filter((c) => c.category === 'process')
              .map((card) => {
                const Icon = GuideIcons[card.icon] ?? BookOpen;
                return (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="group flex flex-col bg-white border-2 border-gray-200 hover:border-[#9B1B30] p-6 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-[#1B2A4A] flex items-center justify-center">
                        <Icon className="w-6 h-6 text-[#D4A853]" />
                      </div>
                      <span className="text-xs text-[#6B7280] uppercase tracking-wider">
                        {card.readTime}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors mb-2">
                      {card.title}
                    </h4>
                    <p className="text-sm text-[#4B5563] leading-relaxed mb-4 flex-1">
                      {card.subtitle}
                    </p>
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#9B1B30]">
                        {card.highlight}
                      </span>
                      <span className="text-sm font-medium text-[#9B1B30] flex items-center gap-1 group-hover:gap-2 transition-all">
                        {t('guides.read')} <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>

        {/* Section 2: Evergreen listicles & best-of guides — paginated */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9B1B30]">
              {t('guides.listiclesTitle', { count: allListicles.length })}
            </h3>
            <span className="text-xs text-[#6B7280] uppercase tracking-wider">
              {t('guides.page', { current: currentPage, total: totalPages })}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagedListicles.map((card) => {
              const Icon = GuideIcons[card.icon] ?? BookOpen;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group flex flex-col bg-white border-2 border-gray-200 hover:border-[#9B1B30] p-6 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-[#1B2A4A] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#D4A853]" />
                    </div>
                    <span className="text-xs text-[#6B7280] uppercase tracking-wider">
                      {card.readTime}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors mb-2">
                    {card.title}
                  </h4>
                  <p className="text-sm text-[#4B5563] leading-relaxed mb-4 flex-1">
                    {card.subtitle}
                  </p>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#9B1B30]">
                      {card.highlight}
                    </span>
                    <span className="text-sm font-medium text-[#9B1B30] flex items-center gap-1 group-hover:gap-2 transition-all">
                      {t('guides.read')} <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination controls — server-side ?page=N URLs so search
              engines can index every page. Same card aesthetic so it
              reads as part of the design. */}
          {totalPages > 1 && (
            <nav
              className="flex items-center justify-center gap-2 mt-10"
              aria-label={t('guides.pagination')}
            >
              {currentPage > 1 && (
                <Link
                  href={currentPage === 2 ? '/guides' : `/guides?page=${currentPage - 1}`}
                  className="inline-flex items-center gap-1 px-4 py-2 border-2 border-gray-300 hover:border-[#1B2A4A] text-sm font-medium text-[#1B2A4A] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('guides.previous')}
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isCurrent = p === currentPage;
                const href = p === 1 ? '/guides' : `/guides?page=${p}`;
                return (
                  <Link
                    key={p}
                    href={href}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={
                      isCurrent
                        ? 'inline-flex items-center justify-center w-10 h-10 border-2 border-[#9B1B30] bg-[#9B1B30] text-white text-sm font-bold'
                        : 'inline-flex items-center justify-center w-10 h-10 border-2 border-gray-300 hover:border-[#1B2A4A] text-sm font-medium text-[#1B2A4A] transition-colors'
                    }
                  >
                    {p}
                  </Link>
                );
              })}
              {currentPage < totalPages && (
                <Link
                  href={`/guides?page=${currentPage + 1}`}
                  className="inline-flex items-center gap-1 px-4 py-2 border-2 border-gray-300 hover:border-[#1B2A4A] text-sm font-medium text-[#1B2A4A] transition-colors"
                >
                  {t('guides.next')}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </nav>
          )}
        </div>
      </section>

      {/* What's inside (GEO/AEO transparency note) */}
      <section className="bg-white border-t-2 border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-3">
            {t('guides.insideTitle')}
          </h2>
          <p className="text-[#4B5563] mb-6 max-w-3xl">
            {t('guides.insideSubtitle')}
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              t('guides.inside.tldr'),
              t('guides.inside.takeaways'),
              t('guides.inside.toc'),
              t('guides.inside.headings'),
              t('guides.inside.tables'),
              t('guides.inside.howTo'),
              t('guides.inside.faq'),
              t('guides.inside.schema'),
              t('guides.inside.bilingual'),
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-[#374151] leading-relaxed"
              >
                <span className="shrink-0 w-5 h-5 bg-[#9B1B30] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <GraduationCap className="w-10 h-10 text-[#D4A853] mx-auto mb-3" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              {t('guides.cta.title')}
            </h2>
            <p className="text-gray-300 mb-6">
              {t('guides.cta.subtitle')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#9B1B30] hover:bg-[#7A1526] text-white text-sm font-semibold uppercase tracking-wider transition-colors"
              >
                {t('guides.cta.assessment')} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 hover:border-white text-white text-sm font-semibold uppercase tracking-wider transition-colors"
              >
                {t('guides.cta.contact')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

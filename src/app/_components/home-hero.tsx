import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Award, BookOpen, GraduationCap, Headphones } from 'lucide-react';
import { HomeCatalogSearch } from '@/components/catalog/home-catalog-search';
import { isCatalogSearchEnabled } from '@/lib/catalog-search-server';
import { getCatalogCounts } from '@/lib/data-fetcher';
import { getServerT } from '@/lib/server-t';
import { formatCountValue } from '@/lib/site-stats';

const ConsultationCtaHero = dynamic(
  () => import('@/components/ConsultationCta').then((m) => m.ConsultationCta),
);

export function HomeHeroFallback() {
  return (
    <div aria-hidden>
      <div className="bg-[#1B2A4A]">
        <div className="mx-auto min-h-[22rem] max-w-7xl px-4 sm:px-6 lg:px-8" />
      </div>
      <div className="relative z-10 mx-auto -mt-10 grid max-w-7xl grid-cols-2 gap-4 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-36 border border-gray-200 bg-white" />
        ))}
      </div>
    </div>
  );
}

async function HeroCatalogSearch() {
  const enabled = await isCatalogSearchEnabled();
  if (!enabled) return null;
  return <HomeCatalogSearch className="mt-0" />;
}

function HeroSearchFallback() {
  return <div aria-hidden className="h-44 border-t-2 border-[#9B1B30] bg-[#FAFAF8]/95" />;
}

async function DiverseProgramCount() {
  const [t, counts] = await Promise.all([getServerT(), getCatalogCounts()]);
  return (
    <p className="text-xs leading-relaxed text-gray-500">
      {t('quick.diverse.desc', { count: formatCountValue(counts.programs) })}
    </p>
  );
}

export async function HomeHero() {
  const t = await getServerT();
  const quickCards = [
    { icon: GraduationCap, label: t('quick.top'), desc: t('quick.top.desc') },
    { icon: BookOpen, label: t('quick.diverse'), desc: null },
    {
      icon: Award,
      label: t('quick.scholarships'),
      desc: t('quick.scholarships.desc'),
      link: '/chinese-government-scholarship-csc',
      linkLabel: t('home.cscGuideLink'),
    },
    { icon: Headphones, label: t('quick.support'), desc: t('quick.support.desc') },
  ];

  return (
    <>
      <section className="relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero-bg.avif)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A] via-[#1B2A4A]/90 to-[#1B2A4A]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A4A]/70 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8 lg:pt-20">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-8">
            <div className="max-w-xl lg:col-start-1 lg:row-start-1">
              <h1 className="text-balance text-[2.5rem] font-extrabold leading-[1.08] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
                {t('hero.title')}
                <br />
                <span className="text-white">{t('hero.tagline')}</span>
              </h1>
              <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-white/80 sm:text-lg">
                {t('hero.subtitle')}
              </p>
            </div>
            <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <Suspense fallback={<HeroSearchFallback />}>
                <HeroCatalogSearch />
              </Suspense>
            </div>
            <div className="lg:col-start-1 lg:row-start-2">
              <ConsultationCtaHero variant="hero" slug="home_hero" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {quickCards.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 border border-gray-200 bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center bg-[#1B2A4A15]">
                <item.icon className="h-5 w-5 text-[#1B2A4A]" />
              </div>
              <h2 className="text-sm font-semibold text-[#1B2A4A]">{item.label}</h2>
              {item.desc === null ? (
                <Suspense
                  fallback={<p className="text-xs leading-relaxed text-gray-500">&nbsp;</p>}
                >
                  <DiverseProgramCount />
                </Suspense>
              ) : (
                <p className="text-xs leading-relaxed text-gray-500">{item.desc}</p>
              )}
              {'link' in item && item.link ? (
                <Link
                  href={item.link}
                  className="mt-1 text-xs font-medium text-[#9B1B30] hover:underline"
                >
                  {item.linkLabel}
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

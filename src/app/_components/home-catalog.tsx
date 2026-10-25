import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Award, GraduationCap, MapPin } from 'lucide-react';
import {
  getFeaturedPrograms,
  getFeaturedUniversities,
  type HomeFeaturedProgram,
  type University,
} from '@/lib/data-fetcher';
import { getServerLocale, getServerT } from '@/lib/server-t';
import type { Locale } from '@/lib/i18n-translations';

const CARD_COUNT = 6;

function localized(locale: Locale, en: string, zh: string): string {
  if (locale === 'zh' && zh.trim().length > 0) return zh;
  return en;
}

export function HomeCatalogSkeleton() {
  return (
    <div aria-hidden className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8 h-8 w-64 bg-[#F3F4F6]" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: CARD_COUNT }, (_, index) => (
            <div key={index} className="h-28 border border-gray-200 bg-[#F3F4F6]" />
          ))}
        </div>
        <div className="mb-8 mt-16 h-8 w-56 bg-[#F3F4F6]" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: CARD_COUNT }, (_, index) => (
            <div key={index} className="h-44 border border-gray-200 bg-[#F3F4F6]" />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  href,
  viewAll,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  href: string;
  viewAll: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9B1B30]">
          <GraduationCap className="h-4 w-4 text-[#1B2A4A]" />
          {eyebrow}
        </div>
        <h2 className="text-2xl font-bold text-[#1B2A4A] sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-[#4B5563]">{subtitle}</p>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-[#9B1B30] hover:underline"
      >
        {viewAll}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function UniversityCard({
  university,
  locale,
  chinaLabel,
  qsLabel,
}: {
  university: University;
  locale: Locale;
  chinaLabel: string;
  qsLabel: (rank: number) => string;
}) {
  const name = localized(locale, university.name, university.nameCn);
  const city = localized(locale, university.city, university.cityCn);
  return (
    <Link
      href={`/universities/${university.slug}`}
      className="group flex items-center gap-3 border border-gray-200 bg-white p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-[#9B1B30] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B1B30]"
    >
      {university.logo ? (
        <Image
          src={university.logo}
          alt=""
          width={48}
          height={48}
          loading="lazy"
          sizes="48px"
          className="h-12 w-12 shrink-0 border border-gray-200 bg-white object-contain"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-gray-200 bg-[#F3F4F6]">
          <GraduationCap className="h-5 w-5 text-[#1B2A4A]" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-bold text-[#1B2A4A] group-hover:text-[#9B1B30]">
            {name}
          </h3>
          {university.ranking > 0 ? (
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center bg-[#D4A853]/20 text-[10px] font-bold text-[#1B2A4A]">
              {university.ranking}
            </span>
          ) : null}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-[#4B5563]">
          <MapPin className="h-3 w-3 shrink-0 text-[#1B2A4A]" />
          <span className="truncate">
            {city ? `${city}, ${chinaLabel}` : chinaLabel}
          </span>
          {university.qsWorldRanking > 0 ? (
            <span className="ml-auto shrink-0 text-[10px] font-semibold text-[#1B2A4A]">
              {qsLabel(university.qsWorldRanking)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function ProgramCard({
  program,
  locale,
  scholarshipLabel,
}: {
  program: HomeFeaturedProgram;
  locale: Locale;
  scholarshipLabel: string;
}) {
  const name = localized(locale, program.name, program.nameCn);
  const universityName = localized(locale, program.universityName, program.universityNameCn);
  const city = localized(locale, program.city, program.cityCn);
  const discipline = localized(locale, program.discipline, program.disciplineCn);
  const duration = localized(locale, program.duration, program.durationCn);
  const school = universityName || program.universitySlug;
  const place = [school, city].filter((part) => part.length > 0).join(', ');

  return (
    <Link
      href={`/programs/${program.slug}`}
      className="group flex h-full flex-col border border-gray-200 bg-white p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-[#9B1B30] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B1B30]"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        {program.degree ? (
          <span className="inline-flex items-center border border-[#1B2A4A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1B2A4A]">
            {program.degree}
          </span>
        ) : (
          <span />
        )}
        {program.scholarshipAvailable ? (
          <span className="inline-flex items-center border border-[#9B1B30] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9B1B30]">
            <Award className="mr-0.5 h-3 w-3 text-[#1B2A4A]" />
            {scholarshipLabel}
          </span>
        ) : null}
      </div>
      <h3 className="line-clamp-2 font-bold leading-snug text-[#1B2A4A] group-hover:text-[#9B1B30]">
        {name}
      </h3>
      {discipline ? (
        <p className="mt-1 line-clamp-1 text-xs text-[#4B5563]">{discipline}</p>
      ) : null}
      {place ? (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-[#4B5563]">
          <MapPin className="h-3 w-3 shrink-0 text-[#1B2A4A]" />
          <span className="line-clamp-2">{place}</span>
        </div>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-3 text-xs text-[#4B5563]">
        {duration ? <span>{duration}</span> : null}
        {program.tuition ? <span>{program.tuition}</span> : null}
      </div>
    </Link>
  );
}

export async function HomeCatalog() {
  const [t, locale, universities, programs] = await Promise.all([
    getServerT(),
    getServerLocale(),
    getFeaturedUniversities(CARD_COUNT),
    getFeaturedPrograms(CARD_COUNT),
  ]);

  return (
    <>
      {universities.length > 0 ? (
        <section className="border-t border-gray-200 bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow={t('home.universities.eyebrow')}
              title={t('home.universities.title')}
              subtitle={t('home.universities.subtitle')}
              href="/universities"
              viewAll={t('home.universities.viewAll')}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {universities.map((university) => (
                <UniversityCard
                  key={university.slug}
                  university={university}
                  locale={locale}
                  chinaLabel={t('common.china')}
                  qsLabel={(rank) => t('home.universities.qs', { rank })}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {programs.length > 0 ? (
        <section className="border-t border-gray-200 bg-[#FAFAF8] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow={t('home.programs.eyebrow')}
              title={t('home.programs.title')}
              subtitle={t('home.programs.subtitle')}
              href="/programs"
              viewAll={t('home.programs.viewAll')}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {programs.map((program) => (
                <ProgramCard
                  key={program.slug}
                  program={program}
                  locale={locale}
                  scholarshipLabel={t('home.programs.scholarshipBadge')}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

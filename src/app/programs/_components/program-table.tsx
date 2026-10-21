'use client';

import Link from 'next/link';
import { Award, ChevronRight } from 'lucide-react';
import {
  degreeTypes,
  degreeTypesCn,
  languages,
  languagesCn,
  type Program,
} from '@/lib/data';
import { track } from '@/lib/analytics';

/**
 * ProgramTable — the dense listing view.
 *
 * Why a table and not cards: the catalogue has 2,513 programs, and a
 * card per program turned a 24-row page into ~24 screens of scrolling.
 * A table puts the scannable facts (university, degree, language,
 * duration, tuition, intake, scholarship) in columns that can be read
 * down instead of one card at a time, and cuts the row height from
 * ~260px to ~52px.
 *
 * Responsive strategy: the table is a real `<table>` at every width, and
 * the low-value columns drop out as the viewport narrows, so a phone
 * shows Program + Tuition + Intake while a desktop shows all eight.
 * The university and discipline move into the program cell's sub-line
 * on the narrow widths where their columns are gone.
 */

export interface TableUniversity {
  slug: string;
  name: string;
  nameCn: string;
}

interface ProgramTableProps {
  programs: Program[];
  universityBySlug: Map<string, TableUniversity>;
  locale: 'en' | 'zh';
  t: (key: string) => string;
  /** The filter query to hand back to the detail page (PF-6). */
  fromQuery: string;
  /** The active search term, for the "matched by university" hint. */
  searchQuery: string;
  /** Universities the term resolved to (PF-1). */
  matchedUniversitySlugs: string[];
}

export function ProgramTable({
  programs,
  universityBySlug,
  locale,
  t,
  fromQuery,
  searchQuery,
  matchedUniversitySlugs,
}: ProgramTableProps) {
  return (
    <div className="overflow-x-auto border border-gray-200 bg-white">
      <table className="w-full min-w-[360px] border-collapse text-sm">
        <caption className="sr-only">{t('prog.tableCaption')}</caption>
        <thead>
          <tr className="border-b border-gray-200 bg-[#FAFAF8] text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            <th scope="col" className="px-3 py-2.5">
              {t('prog.colProgram')}
            </th>
            <th scope="col" className="hidden md:table-cell px-3 py-2.5">
              {t('prog.colUniversity')}
            </th>
            <th scope="col" className="hidden lg:table-cell px-3 py-2.5">
              {t('prog.colLanguage')}
            </th>
            <th scope="col" className="hidden xl:table-cell px-3 py-2.5 text-right">
              {t('prog.colDuration')}
            </th>
            <th scope="col" className="px-3 py-2.5 text-right">
              {t('prog.colTuition')}
            </th>
            <th scope="col" className="hidden sm:table-cell px-3 py-2.5 text-right">
              {t('prog.colIntake')}
            </th>
            <th scope="col" className="hidden lg:table-cell px-3 py-2.5 text-center">
              {t('prog.colScholarship')}
            </th>
            <th scope="col" className="w-8 px-2 py-2.5">
              <span className="sr-only">{t('prog.viewDetails')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {programs.map((program: Program, idx: number) => {
            const uni = universityBySlug.get(program.universitySlug);
            const uniName = uni
              ? locale === 'zh'
                ? uni.nameCn
                : uni.name
              : program.universitySlug;
            const discipline = program.discipline
              ? locale === 'zh'
                ? program.disciplineCn || program.discipline
                : program.discipline
              : '';
            const matchedViaUniversity =
              searchQuery !== '' &&
              matchedUniversitySlugs.length > 0 &&
              matchedUniversitySlugs.includes(program.universitySlug) &&
              !program.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
              !(program.nameCn ?? '').toLowerCase().includes(searchQuery.toLowerCase());

            return (
              <tr
                key={program.slug}
                className="group border-b border-gray-100 align-top transition-colors last:border-b-0 hover:bg-[#9B1B30]/[0.04]"
              >
                {/* Program — name + degree chip, with the university and
                    discipline underneath on the narrow widths where
                    their columns are hidden. */}
                <td className="px-3 py-2 sm:py-2.5">
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 inline-block shrink-0 px-1.5 py-0.5 text-[10px] font-semibold leading-4 ${degreeColor(program.degree)}`}
                    >
                      {degreeLabel(program.degree, locale)}
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/programs/${program.slug}${fromQuery ? `?from=${encodeURIComponent(fromQuery)}` : ''}`}
                        onClick={() =>
                          track('program_click', { slug: program.slug, position: idx, locale })
                        }
                        className="block font-semibold leading-snug text-[#1B2A4A] transition-colors hover:text-[#9B1B30]"
                      >
                        {locale === 'zh' ? program.nameCn : program.name}
                      </Link>
                      <p className="mt-0.5 text-[11px] leading-4 text-gray-500 md:hidden">
                        {uniName}
                        {discipline ? ` · ${discipline}` : ''}
                      </p>
                      <p className="mt-0.5 hidden text-[11px] leading-4 text-gray-500 md:block">
                        {discipline}
                      </p>
                      {matchedViaUniversity && (
                        <p className="mt-1 text-[11px] font-medium leading-4 text-[#9B1B30]">
                          {t('prog.matchedViaUniversity')}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="hidden md:table-cell px-3 py-2.5 text-gray-600">
                  <span className="line-clamp-2">{uniName}</span>
                </td>

                <td className="hidden lg:table-cell px-3 py-2.5 text-gray-600">
                  {locale === 'zh'
                    ? languagesCn[languages.indexOf(program.language)] || program.language
                    : program.language}
                </td>

                <td className="hidden xl:table-cell px-3 py-2.5 text-right tabular-nums text-gray-600">
                  {locale === 'zh' ? program.durationCn : program.duration}
                </td>

                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums font-medium text-[#1B2A4A] sm:py-2.5">
                  <span title={program.tuition || undefined}>{compactTuition(program.tuition)}</span>
                </td>

                <td className="hidden sm:table-cell px-3 py-2.5 text-right text-gray-600">
                  {locale === 'zh' ? program.intakeCn : program.intake}
                </td>

                <td className="hidden lg:table-cell px-3 py-2.5 text-center">
                  {program.scholarshipAvailable === true ? (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9B1B30]"
                      title={t('prog.scholarship')}
                    >
                      <Award className="h-3.5 w-3.5" aria-hidden="true" />
                      {t('prog.colScholarshipShort')}
                    </span>
                  ) : program.scholarshipAvailable === false ? (
                    <span className="text-[11px] text-gray-300" aria-label={t('prog.noScholarship')}>
                      —
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-300" title={t('prog.notPublished')}>
                      &middot;
                    </span>
                  )}
                </td>

                <td className="px-2 py-2.5 text-right">
                  <ChevronRight
                    className="h-4 w-4 text-gray-300 transition-colors group-hover:text-[#9B1B30]"
                    aria-hidden="true"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Degree badge colour — matches the card view. */
function degreeColor(degree: string) {
  switch (degree) {
    case 'Bachelor':
      return 'bg-blue-50 text-blue-800';
    case 'Master':
      return 'bg-purple-50 text-purple-800';
    case 'PhD':
      return 'bg-amber-50 text-amber-800';
    default:
      return 'bg-gray-50 text-gray-800';
  }
}

/** Degree label in the active locale. */
function degreeLabel(degree: Program['degree'], locale: 'en' | 'zh'): string {
  if (locale !== 'zh') return degree;
  return degreeTypesCn[degreeTypes.indexOf(degree)] || degree;
}

/**
 * The tuition column is free text ("CNY 31,000/year (2026)", "¥16,000-24,000
 * /year", "CNY 55,000/year single; CNY 70,000/year double"). The full
 * string is ~24 characters, which forced the program name to wrap on a
 * phone. The table shows the currency + the first figure instead, and
 * keeps the full string in the cell's tooltip.
 */
function compactTuition(value: string): string {
  if (!value) return '—';
  const coded = value.match(/(CNY|RMB|USD|EUR)\s*([\d,]+(?:\.\d+)?)/i);
  if (coded) return `${coded[1].toUpperCase()} ${coded[2]}`;
  const symbol = value.match(/[¥$€]\s*([\d,]+(?:\.\d+)?)/);
  if (symbol) return symbol[0].replace(/\s+/g, '');
  return value.length > 18 ? `${value.slice(0, 17)}…` : value;
}

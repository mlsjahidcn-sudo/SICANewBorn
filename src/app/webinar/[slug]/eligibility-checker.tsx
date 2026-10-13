'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ClipboardCheck, ShieldAlert, CalendarCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { track } from '@/lib/analytics';
import {
  checkAllUniversities,
  type EligibilityInput,
  type EligibilityResult,
} from '@/lib/webinar-eligibility';
import type { WebinarFeaturedUniversity } from '@/lib/webinar-content';

interface Props {
  universities: WebinarFeaturedUniversity[];
  countries: { value: string; label: string }[];
}

const VERDICT_STYLES: Record<EligibilityResult['verdict'], string> = {
  likely: 'bg-emerald-50 border-emerald-300 text-emerald-900',
  borderline: 'bg-[#FAF6E8] border-[#D4A853] text-[#1B2A4A]',
  unlikely: 'bg-red-50 border-red-200 text-red-900',
};

const VERDICT_ICON_STYLES: Record<EligibilityResult['verdict'], string> = {
  likely: 'bg-emerald-100 text-emerald-800',
  borderline: 'bg-[#D4A853]/20 text-[#1B2A4A]',
  unlikely: 'bg-red-100 text-red-800',
};

/**
 * Phase 161: mini eligibility checker for /webinar/[slug].
 *
 * Rule-based + client-side on purpose: the visitor's grades never
 * leave the browser (no API call, no DB row) until they choose to
 * book a consultation. The rules come from the same
 * featured_universities jsonb that renders the cards above.
 *
 * "Book a free consultation" routes to /counselling — the existing
 * booking flow (Phase 123+).
 */
export function WebinarEligibilityChecker({ universities, countries }: Props) {
  const { t, locale } = useI18n();
  const zh = locale === 'zh';

  const [educationLevel, setEducationLevel] =
    useState<EligibilityInput['educationLevel']>('high_school');
  const [gpaPercent, setGpaPercent] = useState('');
  const [englishTest, setEnglishTest] = useState<EligibilityInput['englishTest']>('ielts');
  const [englishScore, setEnglishScore] = useState('');
  const [hskLevel, setHskLevel] = useState('');
  const [country, setCountry] = useState('');
  const [checked, setChecked] = useState(false);

  const input: EligibilityInput = useMemo(
    () => ({
      educationLevel,
      gpaPercent: gpaPercent.trim() === '' ? null : Number.parseFloat(gpaPercent),
      englishTest,
      englishScore: englishScore.trim() === '' ? null : Number.parseFloat(englishScore),
      hskLevel: hskLevel.trim() === '' ? null : Number.parseInt(hskLevel, 10),
      country,
    }),
    [educationLevel, gpaPercent, englishTest, englishScore, hskLevel, country],
  );

  const results = useMemo(
    () => (checked ? checkAllUniversities(universities, input) : []),
    [checked, universities, input],
  );

  const runCheck = () => {
    setChecked(true);
    track('webinar_eligibility_check', { locale, universities: universities.length });
  };

  if (universities.length === 0) return null;

  const inputCls =
    'w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]';

  return (
    <div className="bg-white border-2 border-[#1B2A4A]/15 p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 bg-[#1B2A4A] text-white flex items-center justify-center flex-shrink-0">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-bold text-[#1B2A4A]">{t('webinar.elig.title')}</h3>
      </div>
      <p className="text-sm text-[#4B5563] mb-6">{t('webinar.elig.subtitle')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1F2937] mb-1">
            {t('webinar.elig.educationLevel')}
          </label>
          <select
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value as EligibilityInput['educationLevel'])}
            className={inputCls}
          >
            <option value="high_school">{t('webinar.elig.levelHighSchool')}</option>
            <option value="bachelor">{t('webinar.elig.levelBachelor')}</option>
            <option value="master">{t('webinar.elig.levelMaster')}</option>
            <option value="other">{t('webinar.elig.levelOther')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1F2937] mb-1">
            {t('webinar.elig.gpa')}
          </label>
          <input
            type="number"
            min={0}
            max={100}
            inputMode="decimal"
            value={gpaPercent}
            onChange={(e) => setGpaPercent(e.target.value)}
            placeholder="80"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1F2937] mb-1">
            {t('webinar.elig.country')}
          </label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
            <option value="">{t('webinar.form.countryPlaceholder')}</option>
            {countries.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1F2937] mb-1">
            {t('webinar.elig.englishTest')}
          </label>
          <select
            value={englishTest}
            onChange={(e) =>
              setEnglishTest(e.target.value as EligibilityInput['englishTest'])
            }
            className={inputCls}
          >
            <option value="ielts">IELTS</option>
            <option value="toefl">TOEFL</option>
            <option value="none">{t('webinar.elig.noEnglish')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1F2937] mb-1">
            {t('webinar.elig.englishScore')}
          </label>
          <input
            type="number"
            min={0}
            max={englishTest === 'ielts' ? 9 : 120}
            inputMode="decimal"
            value={englishScore}
            onChange={(e) => setEnglishScore(e.target.value)}
            placeholder={englishTest === 'toefl' ? '68' : '5.5'}
            disabled={englishTest === 'none'}
            className={`${inputCls} disabled:bg-gray-100 disabled:text-gray-400`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1F2937] mb-1">
            {t('webinar.elig.hsk')}
          </label>
          <select value={hskLevel} onChange={(e) => setHskLevel(e.target.value)} className={inputCls}>
            <option value="">{t('webinar.elig.hskNone')}</option>
            {[1, 2, 3, 4, 5, 6].map((lvl) => (
              <option key={lvl} value={lvl}>
                HSK {lvl}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={runCheck}
        className="mt-6 w-full sm:w-auto px-8 py-3 bg-[#1B2A4A] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#2C3E60] transition-colors"
      >
        {t('webinar.elig.check')}
      </button>

      {checked && (
        <div className="mt-8 space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-[#9B1B30]">
            {t('webinar.elig.resultsTitle')}
          </h4>
          {results.map((result) => {
            const name = zh ? result.university.nameZh : result.university.nameEn;
            const city = zh ? result.university.cityZh : result.university.cityEn;
            const reason = result.reasonKeys
              .map((key) => t(`webinar.elig.reason.${key}`))
              .join(' · ');
            return (
              <div
                key={result.university.slug}
                className={`border p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${VERDICT_STYLES[result.verdict]}`}
              >
                <div
                  className={`flex-shrink-0 h-9 w-9 flex items-center justify-center text-xs font-extrabold uppercase ${VERDICT_ICON_STYLES[result.verdict]}`}
                >
                  {t(`webinar.elig.verdict.${result.verdict}`).slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{name}</p>
                  <p className="text-xs opacity-80 mt-0.5">
                    {city} · {reason}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2 py-1 ${VERDICT_ICON_STYLES[result.verdict]}`}
                >
                  {t(`webinar.elig.verdict.${result.verdict}`)}
                </span>
              </div>
            );
          })}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-[#4B5563] flex items-start gap-2 flex-1">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-400" />
              {t('webinar.elig.disclaimer')}
            </p>
            <Link
              href="/counselling"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#9B1B30] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#7A1526] transition-colors"
            >
              <CalendarCheck className="h-4 w-4" />
              {t('webinar.elig.bookConsultation')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

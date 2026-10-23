/**
 * Real publication / last-edit dates for GuidePage Article JSON-LD.
 *
 * Sourced from git first-commit (`publishedAt`) and last-touch
 * (`updatedAt`) dates of each guide module under `src/lib/guides/`.
 * `updatedAt` is omitted when it equals `publishedAt` so we never
 * invent a "modified" signal that isn't real.
 *
 * GuidePage merges these with any dates already set on the Guide
 * object itself (guide fields win). Do NOT fabricate dates here —
 * see `Guide.publishedAt` / `Guide.updatedAt` in types.ts.
 *
 * Regenerated as part of SEO/AEO G2 (2026-10-18). Re-run the
 * collection script if a guide module is renamed or a new guide
 * is added and you want its first-commit date reflected.
 */

export interface GuideDateEntry {
  /** YYYY-MM-DD — first git commit that introduced the module. */
  publishedAt: string;
  /** YYYY-MM-DD — last git commit that touched the module, if different. */
  updatedAt?: string;
}

export const GUIDE_DATES: Readonly<Record<string, GuideDateEntry>> = {
  'accommodation': { publishedAt: '2026-06-04', updatedAt: '2026-10-18' },
  'application': { publishedAt: '2026-06-04', updatedAt: '2026-10-18' },
  'banking': { publishedAt: '2026-07-12' },
  'best-cities-china-international-students': { publishedAt: '2026-07-05', updatedAt: '2026-10-18' },
  'best-mba-programs-china': { publishedAt: '2026-07-05', updatedAt: '2026-10-18' },
  'best-universities-china': { publishedAt: '2026-07-04', updatedAt: '2026-10-18' },
  'best-universities-in-beijing': { publishedAt: '2026-07-12', updatedAt: '2026-10-18' },
  'best-universities-in-hong-kong': { publishedAt: '2026-09-30', updatedAt: '2026-10-18' },
  'best-universities-in-northeast-china': { publishedAt: '2026-09-30', updatedAt: '2026-10-18' },
  'best-universities-in-shanghai': { publishedAt: '2026-07-08', updatedAt: '2026-10-18' },
  'cheapest-universities-china': { publishedAt: '2026-07-04', updatedAt: '2026-10-08' },
  'china-mobile-internet-for-international-students': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'china-student-visa-jw202-residence-permit': { publishedAt: '2026-10-10', updatedAt: '2026-10-18' },
  'china-university-admission-requirements': { publishedAt: '2026-07-05', updatedAt: '2026-10-18' },
  'china-university-application-deadlines': { publishedAt: '2026-07-08', updatedAt: '2026-10-18' },
  'china-university-dorms-cost': { publishedAt: '2026-10-10', updatedAt: '2026-10-18' },
  'chinese-government-scholarship-csc': { publishedAt: '2026-07-08', updatedAt: '2026-10-18' },
  'cost-of-living': { publishedAt: '2026-06-04', updatedAt: '2026-10-18' },
  'cost-of-living-china-by-city': { publishedAt: '2026-07-05', updatedAt: '2026-10-09' },
  'csc-scholarship-bangladesh': { publishedAt: '2026-10-14', updatedAt: '2026-10-18' },
  'csc-scholarship-nigeria': { publishedAt: '2026-10-08', updatedAt: '2026-10-18' },
  'csc-scholarship-pakistan': { publishedAt: '2026-10-08', updatedAt: '2026-10-18' },
  'csca-csc-scholarship': { publishedAt: '2026-09-19', updatedAt: '2026-10-18' },
  'csca-english-taught-programs': { publishedAt: '2026-09-19', updatedAt: '2026-10-18' },
  'csca-exam': { publishedAt: '2026-09-19', updatedAt: '2026-10-18' },
  'csca-exam-exemptions': { publishedAt: '2026-09-19', updatedAt: '2026-10-18' },
  'csca-exam-fees': { publishedAt: '2026-09-19', updatedAt: '2026-10-18' },
  'csca-exam-registration': { publishedAt: '2026-09-19', updatedAt: '2026-10-18' },
  'csca-faq': { publishedAt: '2026-09-19', updatedAt: '2026-10-18' },
  'csca-fee-pakistan-nigeria-bangladesh': { publishedAt: '2026-10-14', updatedAt: '2026-10-18' },
  'csca-humanities-chinese-guide': { publishedAt: '2026-09-19', updatedAt: '2026-10-18' },
  'csca-mbbs-applicants': { publishedAt: '2026-09-19', updatedAt: '2026-10-18' },
  'csca-partner-guide': { publishedAt: '2026-09-19', updatedAt: '2026-10-18' },
  'csca-scores-and-cutoffs': { publishedAt: '2026-09-19', updatedAt: '2026-10-18' },
  'csca-stem-chinese-guide': { publishedAt: '2026-09-19', updatedAt: '2026-10-18' },
  'csca-test-day-retakes': { publishedAt: '2026-09-19', updatedAt: '2026-10-18' },
  'csca-vs-hsk': { publishedAt: '2026-09-19', updatedAt: '2026-10-18' },
  'csca-vs-sat-a-level-ib': { publishedAt: '2026-09-19', updatedAt: '2026-10-18' },
  'english-taught-programs-china': { publishedAt: '2026-10-09', updatedAt: '2026-10-18' },
  'fudan-university': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'fudan-university-admissions-guide': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'harbin-institute-of-technology': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'health-insurance': { publishedAt: '2026-07-12' },
  'how-to-write-study-plan-china': { publishedAt: '2026-10-14', updatedAt: '2026-10-18' },
  'hsk': { publishedAt: '2026-07-12' },
  'hsk-3-0-prep-timeline': { publishedAt: '2026-10-13', updatedAt: '2026-10-18' },
  'hsk-3-0-speaking-writing': { publishedAt: '2026-10-13', updatedAt: '2026-10-18' },
  'hsk-3-0-vocabulary-list': { publishedAt: '2026-10-13', updatedAt: '2026-10-18' },
  'hsk-3-vs-hsk-2': { publishedAt: '2026-10-13', updatedAt: '2026-10-18' },
  'hunan-vs-yunnan': { publishedAt: '2026-10-14', updatedAt: '2026-10-18' },
  'international-money-transfer-china': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'mbbs-in-china': { publishedAt: '2026-07-04', updatedAt: '2026-10-08' },
  'medical-check-physical-examination-form': { publishedAt: '2026-10-14', updatedAt: '2026-10-18' },
  'moe-listed-mbbs-universities-china': { publishedAt: '2026-10-08', updatedAt: '2026-10-18' },
  'nanjing-university': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'nankai-university': { publishedAt: '2026-10-14', updatedAt: '2026-10-18' },
  'open-chinese-bank-account': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'part-time-work': { publishedAt: '2026-07-12', updatedAt: '2026-10-08' },
  'peking-university': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'peking-university-admissions-guide': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'peking-university-vs-fudan': { publishedAt: '2026-09-30', updatedAt: '2026-10-18' },
  'peking-university-vs-tsinghua': { publishedAt: '2026-09-30', updatedAt: '2026-10-18' },
  'peking-vs-tsinghua-international-students': { publishedAt: '2026-10-10', updatedAt: '2026-10-18' },
  'phd-in-china-international-students': { publishedAt: '2026-07-08', updatedAt: '2026-10-18' },
  'scholarships': { publishedAt: '2026-06-04', updatedAt: '2026-10-18' },
  'shanghai-jiao-tong-university': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'shanghai-jiao-tong-university-admissions-guide': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'shenyang-pharmaceutical-university': { publishedAt: '2026-10-14', updatedAt: '2026-10-18' },
  'student-health-care-china': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'study-in-china': { publishedAt: '2026-06-04', updatedAt: '2026-10-18' },
  'study-in-china-vs-russia-for-mbbs': { publishedAt: '2026-07-08', updatedAt: '2026-10-18' },
  'study-in-china-without-ielts': { publishedAt: '2026-10-08' },
  'sufe': { publishedAt: '2026-10-14', updatedAt: '2026-10-18' },
  'sun-yat-sen-university': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'top-engineering-universities-china': { publishedAt: '2026-07-05', updatedAt: '2026-10-08' },
  'tsinghua-university': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'tsinghua-university-admissions-guide': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'university-of-science-and-technology-of-china': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'visa': { publishedAt: '2026-06-04', updatedAt: '2026-10-18' },
  'wuhan-university': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'x1-vs-x2-student-visa-china': { publishedAt: '2026-10-08', updatedAt: '2026-10-18' },
  'xiamen-vs-fuzhou': { publishedAt: '2026-10-14', updatedAt: '2026-10-18' },
  'zhejiang-university': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
  'zhejiang-university-admissions-guide': { publishedAt: '2026-09-29', updatedAt: '2026-10-18' },
};

/**
 * Resolve the dates to emit for a guide. Prefer dates already set on
 * the Guide object; fall back to the git-derived map keyed by slug.
 */
export function resolveGuideDates(guide: {
  slug: string;
  publishedAt?: string;
  updatedAt?: string;
}): { publishedAt?: string; updatedAt?: string } {
  const fromMap = GUIDE_DATES[guide.slug];
  const publishedAt = guide.publishedAt ?? fromMap?.publishedAt;
  const updatedAt = guide.updatedAt ?? fromMap?.updatedAt;
  return {
    ...(publishedAt ? { publishedAt } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  };
}


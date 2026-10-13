/**
 * Phase 161: shared content types for the data-driven webinar pages.
 *
 * These mirror the jsonb columns on `webinar_sessions` (agenda /
 * featured_universities / faq, migration 2026-10-13_webinars_multi.sql).
 * They live in their own module — no Supabase import — so client
 * islands (countdown, eligibility checker, signup form) can import
 * the types + parsers without dragging the server-only
 * `@/lib/supabase-server` into the browser bundle.
 *
 * Every parser is defensive: jsonb columns are staff-editable and
 * historically absent (the columns only exist after the Phase 161
 * migration), so a malformed row degrades to an empty list instead
 * of throwing the landing page.
 */

export interface WebinarAgendaItem {
  icon: string;
  titleEn: string;
  titleZh: string;
  bodyEn: string;
  bodyZh: string;
}

/**
 * Machine-readable eligibility gate consumed by the rule-based
 * checker (`@/lib/webinar-eligibility`). Absent keys mean "no hard
 * gate on this criterion" — the university reviews holistically.
 */
export interface WebinarEligibilityRules {
  /** Minimum grade average in percent (e.g. 80 = "high-school average 80+"). */
  min_gpa_percent?: number;
  /** English-test floor — visitor passes if EITHER test meets its floor. */
  english?: { ielts?: number; toefl?: number };
  /** Minimum HSK level (not used by the Phase 161 seeds, kept for future
   *  Chinese-taught program webinars). */
  hsk?: number;
}

export interface WebinarFeaturedUniversity {
  slug: string;
  nameEn: string;
  nameZh: string;
  cityEn: string;
  cityZh: string;
  /** Badge label, e.g. "985 · C9". Rendered verbatim (proper nouns). */
  rankingLabel: string;
  englishProgramsEn: string;
  englishProgramsZh: string;
  scholarshipEn: string;
  scholarshipZh: string;
  requirementsEn: string;
  requirementsZh: string;
  /** ISO date (YYYY-MM-DD) rendered verbatim — university deadline. */
  deadline: string;
  eligibility: WebinarEligibilityRules;
}

export interface WebinarFaqItem {
  qEn: string;
  qZh: string;
  aEn: string;
  aZh: string;
}

export interface WebinarContent {
  agenda: WebinarAgendaItem[];
  featuredUniversities: WebinarFeaturedUniversity[];
  faq: WebinarFaqItem[];
}

const EMPTY_CONTENT: WebinarContent = {
  agenda: [],
  featuredUniversities: [],
  faq: [],
};

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function num(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function parseAgendaItem(row: Record<string, unknown>): WebinarAgendaItem | null {
  const item: WebinarAgendaItem = {
    icon: str(row.icon) || 'basics',
    titleEn: str(row.title_en),
    titleZh: str(row.title_zh),
    bodyEn: str(row.body_en),
    bodyZh: str(row.body_zh),
  };
  return item.titleEn || item.titleZh ? item : null;
}

function parseEligibility(row: unknown): WebinarEligibilityRules {
  if (!row || typeof row !== 'object') return {};
  const raw = row as Record<string, unknown>;
  const englishRaw = raw.english;
  let english: WebinarEligibilityRules['english'];
  if (englishRaw && typeof englishRaw === 'object') {
    const e = englishRaw as Record<string, unknown>;
    const ielts = num(e.ielts);
    const toefl = num(e.toefl);
    if (ielts !== undefined || toefl !== undefined) english = { ielts, toefl };
  }
  return {
    min_gpa_percent: num(raw.min_gpa_percent),
    english,
    hsk: num(raw.hsk),
  };
}

function parseFeaturedUniversity(row: Record<string, unknown>): WebinarFeaturedUniversity | null {
  const item: WebinarFeaturedUniversity = {
    slug: str(row.slug),
    nameEn: str(row.name_en),
    nameZh: str(row.name_zh),
    cityEn: str(row.city_en),
    cityZh: str(row.city_zh),
    rankingLabel: str(row.ranking_label),
    englishProgramsEn: str(row.english_programs_en),
    englishProgramsZh: str(row.english_programs_zh),
    scholarshipEn: str(row.scholarship_en),
    scholarshipZh: str(row.scholarship_zh),
    requirementsEn: str(row.requirements_en),
    requirementsZh: str(row.requirements_zh),
    deadline: str(row.deadline),
    eligibility: parseEligibility(row.eligibility),
  };
  return item.nameEn || item.nameZh ? item : null;
}

function parseFaqItem(row: Record<string, unknown>): WebinarFaqItem | null {
  const item: WebinarFaqItem = {
    qEn: str(row.q_en),
    qZh: str(row.q_zh),
    aEn: str(row.a_en),
    aZh: str(row.a_zh),
  };
  return item.qEn || item.qZh ? item : null;
}

/** Parse the three jsonb columns of a webinar_sessions row. Never throws. */
export function parseWebinarContent(
  agendaJson: unknown,
  featuredJson: unknown,
  faqJson: unknown,
): WebinarContent {
  const rows = (value: unknown): Record<string, unknown>[] =>
    Array.isArray(value)
      ? value.filter((r): r is Record<string, unknown> => Boolean(r) && typeof r === 'object')
      : [];

  return {
    agenda: rows(agendaJson)
      .map(parseAgendaItem)
      .filter((i): i is WebinarAgendaItem => i !== null),
    featuredUniversities: rows(featuredJson)
      .map(parseFeaturedUniversity)
      .filter((i): i is WebinarFeaturedUniversity => i !== null),
    faq: rows(faqJson)
      .map(parseFaqItem)
      .filter((i): i is WebinarFaqItem => i !== null),
  };
}

/** Re-export so RSC callers can hand parsed content straight to islands. */
export { EMPTY_CONTENT };

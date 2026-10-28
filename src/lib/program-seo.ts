import { detailText } from '@/lib/detail-content';

/** Rendered document titles must stay inside a typical SERP title budget. */
export const PROGRAM_TITLE_MAX = 60;
/** Meta descriptions target the 140–155 character snippet window. */
export const PROGRAM_DESCRIPTION_MAX = 155;

const BRAND = ' | SICA';
const ENTRY_TAIL =
  'Entry requirements, intake and how SICA helps you apply. Book a free 10-minute check.';
const HSK_TAIL =
  'HSK requirement, intake and how SICA helps you apply. Book a free 10-minute check.';
const CHINESE_SOFT_TAIL =
  'Chinese-taught: language level and intake confirmed by SICA. Book a free 10-minute check.';

export interface ProgramSeoFields {
  major: string;
  degree: string;
  language: string;
  university: string;
  city?: string;
  /** When present, used to decide whether Chinese-taught metas may claim an HSK line. */
  requirements?: string[];
}

export type TeachingLanguage = 'English' | 'Chinese' | 'Bilingual';

/** Closed teaching-language values. Placeholders such as "To be confirmed" are omitted. */
export function teachingLanguageWord(language: string): TeachingLanguage | '' {
  const value = detailText(language);
  if (value === 'English' || value === 'Chinese' || value === 'Bilingual') return value;
  return '';
}

/** Visible label rendered next to the programme H1. */
export function teachingLanguageLabel(language: string, locale: 'en' | 'zh' = 'en'): string {
  const word = teachingLanguageWord(language);
  if (!word) return '';
  if (locale === 'zh') {
    if (word === 'English') return '英语授课';
    if (word === 'Chinese') return '中文授课';
    return '双语授课';
  }
  return `${word}-taught`;
}

/**
 * Drop "University" / "University of" before any other truncation.
 * There is no short-name column on universities, so this is the short form.
 */
export function shortenUniversityName(name: string): string {
  const original = detailText(name);
  if (!original) return '';
  const short = original
    .replace(/\bUniversity of\s+/gi, '')
    .replace(/\s+University\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return short || original;
}

function hasLanguageRequirementValue(requirements: string[] | undefined): boolean {
  return (requirements ?? []).some((item) => {
    const text = detailText(item);
    return Boolean(text && /HSK|IELTS|TOEFL|\blanguage\b/i.test(text));
  });
}

function wordCount(value: string): number {
  return value.split(/\s+/).filter(Boolean).length;
}

function qualifier(degree: string, language: TeachingLanguage | ''): string {
  const parts = [degree, language ? `${language}-taught` : ''].filter(Boolean);
  return parts.length ? ` (${parts.join(', ')})` : '';
}

function wordPrefixes(value: string): string[] {
  const words = value.split(/\s+/).filter(Boolean);
  const stages: string[] = [];
  for (let count = words.length; count >= 1; count -= 1) {
    const text = stripTrailingJoiners(words.slice(0, count).join(' '));
    if (text && !stages.includes(text)) stages.push(text);
  }
  return stages;
}

/** Major stages for metas: longest first, never below 2 words when the name has 2+. */
function majorStagesForMeta(value: string): string[] {
  const stages = wordPrefixes(value);
  const multi = stages.filter((stage) => wordCount(stage) >= 2);
  return multi.length > 0 ? multi : stages.slice(0, 1);
}

const TRAILING_JOINER = /^(and|of|the|in|for|with|or|a|an|&)$/i;

function stripTrailingJoiners(value: string): string {
  const words = value.split(/\s+/).filter(Boolean);
  while (words.length > 1 && TRAILING_JOINER.test(words[words.length - 1] ?? '')) words.pop();
  return words.join(' ');
}

function isBareCityUniversity(university: string, city: string): boolean {
  if (!university) return false;
  if (city && university.toLowerCase() === city.toLowerCase()) return true;
  return false;
}

/**
 * `{Major} ({Degree}, {Language}-taught) – {University} | SICA`
 * Fallback when >60: shorten university name → drop brand → shorten major
 * (min 2 words) → only then cut university words (min 2 / never a bare city).
 * Keeps the teaching-language qualifier; never doubles SICA.
 */
export function buildProgramDocumentTitle(fields: ProgramSeoFields): string {
  const majorFull = detailText(fields.major) || 'Program';
  const degree = detailText(fields.degree);
  const language = teachingLanguageWord(fields.language);
  const universityFull = detailText(fields.university);
  const city = detailText(fields.city);
  const qual = qualifier(degree, language);

  const render = (major: string, university: string, withBrand: boolean): string => {
    const head = `${major}${qual}`;
    const body = university ? `${head} – ${university}` : head;
    if (!withBrand) return body;
    return body.includes('SICA') ? body : `${body}${BRAND}`;
  };

  const fits = (major: string, university: string, withBrand: boolean): boolean =>
    render(major, university, withBrand).length <= PROGRAM_TITLE_MAX;

  const pick = (major: string, university: string, withBrand: boolean): string =>
    render(major, university, withBrand);

  let major = majorFull;
  let university = universityFull;

  if (fits(major, university, true)) return pick(major, university, true);

  // (a) shortenUniversityName
  const stripped = shortenUniversityName(university);
  if (stripped && stripped !== university) {
    university = stripped;
    if (fits(major, university, true)) return pick(major, university, true);
  }

  // (b) drop trailing " | SICA"
  if (fits(major, university, false)) {
    return fits(major, university, true)
      ? pick(major, university, true)
      : pick(major, university, false);
  }

  // (c) shorten major by whole words (min 2 words)
  const majorWords = major.split(/\s+/).filter(Boolean);
  while (majorWords.length > 2) {
    majorWords.pop();
    major = stripTrailingJoiners(majorWords.join(' '));
    if (fits(major, university, false)) {
      return fits(major, university, true)
        ? pick(major, university, true)
        : pick(major, university, false);
    }
  }
  major = stripTrailingJoiners(majorWords.join(' '));

  // (d) only then cut university words — never below 2, never a bare city
  const uniWords = university.split(/\s+/).filter(Boolean);
  while (uniWords.length > 2) {
    const nextWords = uniWords.slice(0, -1);
    const candidate = stripTrailingJoiners(nextWords.join(' '));
    if (!candidate || isBareCityUniversity(candidate, city)) break;
    uniWords.length = nextWords.length;
    university = candidate;
    if (fits(major, university, false)) {
      return fits(major, university, true)
        ? pick(major, university, true)
        : pick(major, university, false);
    }
  }

  // Still over: allow one more major-word drop so language + university stay.
  if (!fits(major, university, false) && wordCount(major) > 1) {
    const words = major.split(/\s+/).filter(Boolean);
    words.pop();
    major = stripTrailingJoiners(words.join(' ')) || major;
  }

  if (fits(major, university, true)) return pick(major, university, true);
  if (fits(major, university, false)) return pick(major, university, false);

  // Last resort: keep the language qualifier; trim the major from the end.
  let title = pick(major, university, false);
  if (title.length <= PROGRAM_TITLE_MAX) return title;
  while (title.length > PROGRAM_TITLE_MAX && major.length > 1) {
    major = major.slice(0, -1).trim();
    title = pick(major, university, false);
  }
  return title.length <= PROGRAM_TITLE_MAX ? title : title.slice(0, PROGRAM_TITLE_MAX);
}

/**
 * English-taught and Chinese-taught descriptions use different closing sentences.
 * Prefer the full major, then the longest university form that still fits ≤155.
 * Never cut the major below 2 words when the name has 2+.
 */
export function buildProgramMetaDescription(fields: ProgramSeoFields): string {
  const majorFull = detailText(fields.major) || 'this program';
  const degree = detailText(fields.degree);
  const city = detailText(fields.city);
  const language = teachingLanguageWord(fields.language);
  const universityFull = detailText(fields.university);
  const tail =
    language === 'Chinese'
      ? hasLanguageRequirementValue(fields.requirements)
        ? HSK_TAIL
        : CHINESE_SOFT_TAIL
      : ENTRY_TAIL;
  const medium =
    language === 'English'
      ? 'in English'
      : language === 'Chinese'
        ? 'in Chinese'
        : language === 'Bilingual'
          ? 'in English and Chinese'
          : '';

  const render = (major: string, university: string, cityName: string): string => {
    const degreeBit = degree ? ` (${degree})` : '';
    const mediumBit = medium ? ` ${medium}` : '';
    let place = '';
    if (university && cityName) place = ` at ${university}, ${cityName}`;
    else if (university) place = ` at ${university}`;
    else if (cityName) place = ` in ${cityName}`;
    return `Study ${major}${degreeBit}${mediumBit}${place}. ${tail}`.replace(/\s{2,}/g, ' ').trim();
  };

  const shortened = shortenUniversityName(universityFull);
  const universityStages = [
    ...new Set([universityFull, shortened, ...wordPrefixes(shortened || universityFull)].filter(Boolean)),
  ];
  if (universityStages.length === 0) universityStages.push('');
  const majorStages = majorStagesForMeta(majorFull);
  const cityStages = city ? [city, ''] : [''];

  // Prefer full major → longest university → first form that fits ≤155.
  for (const major of majorStages) {
    for (const university of universityStages) {
      for (const cityName of cityStages) {
        const text = render(major, university, cityName);
        if (text.length <= PROGRAM_DESCRIPTION_MAX) return text;
      }
    }
  }

  // Full major never fits with any university/city combo. Keep a ≥2-word major
  // and drop place details rather than chopping the major to a single word.
  const major = majorStages[majorStages.length - 1] ?? majorFull;
  let text = render(major, '', '');
  if (text.length <= PROGRAM_DESCRIPTION_MAX) return text;

  // Extremely long tails: trim the closing sentence only.
  while (text.length > PROGRAM_DESCRIPTION_MAX && text.includes('. ')) {
    text = text.replace(/\.\s+[^.]*$/, '.').trim();
  }
  return text.length <= PROGRAM_DESCRIPTION_MAX ? text : text.slice(0, PROGRAM_DESCRIPTION_MAX);
}

/** `{Major} – {Degree} at {University}` with empty fields omitted. */
export function buildProgramHeading(fields: { major: string; degree: string; university: string }): string {
  const major = detailText(fields.major) || 'Program';
  const degree = detailText(fields.degree);
  const university = detailText(fields.university);
  if (degree && university) return `${major} – ${degree} at ${university}`;
  if (university) return `${major} at ${university}`;
  if (degree) return `${major} – ${degree}`;
  return major;
}

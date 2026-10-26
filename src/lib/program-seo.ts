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

export interface ProgramSeoFields {
  major: string;
  degree: string;
  language: string;
  university: string;
  city?: string;
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

function clipText(value: string, max: number): string {
  const text = value.trim();
  if (max <= 0) return '';
  if (text.length <= max) return text;
  if (max === 1) return text.slice(0, 1);
  const sliced = text.slice(0, max).trimEnd();
  const space = sliced.lastIndexOf(' ');
  const base = space >= 4 ? sliced.slice(0, space) : sliced;
  return base.replace(/[\s,;:–-]+$/u, '').trim();
}

function qualifier(degree: string, language: TeachingLanguage | ''): string {
  const parts = [degree, language ? `${language}-taught` : ''].filter(Boolean);
  return parts.length ? ` (${parts.join(', ')})` : '';
}

/**
 * `{Major} ({Degree}, {Language}-taught) – {University} | SICA`
 * Shortens the university name before the major. The teaching language stays.
 */
export function buildProgramDocumentTitle(fields: ProgramSeoFields): string {
  const majorFull = detailText(fields.major) || 'Program';
  const degree = detailText(fields.degree);
  const language = teachingLanguageWord(fields.language);
  const universityFull = detailText(fields.university);
  const qual = qualifier(degree, language);

  const render = (major: string, university: string): string => {
    const head = `${major}${qual}`;
    return university ? `${head} – ${university}${BRAND}` : `${head}${BRAND}`;
  };

  let major = majorFull;
  let university = universityFull;
  let title = render(major, university);
  if (title.length <= PROGRAM_TITLE_MAX) return title;

  const stripped = shortenUniversityName(university);
  if (stripped && stripped.length < university.length) {
    university = stripped;
    title = render(major, university);
    if (title.length <= PROGRAM_TITLE_MAX) return title;
  }

  const uniWords = university.split(/\s+/).filter(Boolean);
  while (uniWords.length > 1 && render(major, stripTrailingJoiners(uniWords.join(' '))).length > PROGRAM_TITLE_MAX) {
    uniWords.pop();
  }
  university = stripTrailingJoiners(uniWords.join(' '));
  title = render(major, university);
  if (title.length <= PROGRAM_TITLE_MAX) return title;

  // The university is already as short as its name allows. Shorten the
  // major next, and keep the teaching-language qualifier intact.
  const majorWords = major.split(/\s+/).filter(Boolean);
  while (majorWords.length > 1 && render(stripTrailingJoiners(majorWords.join(' ')), university).length > PROGRAM_TITLE_MAX) {
    majorWords.pop();
  }
  major = stripTrailingJoiners(majorWords.join(' '));
  title = render(major, university);
  if (title.length <= PROGRAM_TITLE_MAX) return title;

  const suffix = university ? `${qual} – ${university}${BRAND}` : `${qual}${BRAND}`;
  const room = PROGRAM_TITLE_MAX - suffix.length;
  major = clipText(major, Math.max(room, 1));
  title = render(major, university);
  if (title.length <= PROGRAM_TITLE_MAX) return title;

  while (title.length > PROGRAM_TITLE_MAX && major.length > 1) {
    major = major.slice(0, -1).trim();
    title = render(major, university);
  }
  return title.length <= PROGRAM_TITLE_MAX ? title : title.slice(0, PROGRAM_TITLE_MAX);
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

const TRAILING_JOINER = /^(and|of|the|in|for|with|or|a|an|&)$/i;

function stripTrailingJoiners(value: string): string {
  const words = value.split(/\s+/).filter(Boolean);
  while (words.length > 1 && TRAILING_JOINER.test(words[words.length - 1] ?? '')) words.pop();
  return words.join(' ');
}

/**
 * English-taught and Chinese-taught descriptions use different closing sentences.
 * Empty fields are left out. The result is never longer than 155 characters.
 * University names are shortened by whole words, never cut mid-word.
 */
export function buildProgramMetaDescription(fields: ProgramSeoFields): string {
  const majorFull = detailText(fields.major) || 'this program';
  const degree = detailText(fields.degree);
  const city = detailText(fields.city);
  const language = teachingLanguageWord(fields.language);
  const universityFull = detailText(fields.university);
  const tail = language === 'Chinese' ? HSK_TAIL : ENTRY_TAIL;
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
  const universityStages = [...new Set([universityFull, shortened, ...wordPrefixes(shortened || universityFull)].filter(Boolean))];
  if (universityStages.length === 0) universityStages.push('');
  const majorStages = wordPrefixes(majorFull);
  const cityStages = city ? [city, ''] : [''];

  let best = '';
  for (const cityName of cityStages) {
    for (const university of universityStages) {
      for (const major of majorStages) {
        const text = render(major, university, cityName);
        if (text.length <= PROGRAM_DESCRIPTION_MAX && text.length > best.length) best = text;
      }
    }
  }
  if (best) return best;

  const university = universityStages[universityStages.length - 1] ?? '';
  let major = majorStages[majorStages.length - 1] ?? majorFull;
  let text = render(major, university, '');
  while (text.length > PROGRAM_DESCRIPTION_MAX && major.length > 1) {
    major = major.slice(0, -1).trim();
    text = render(major, university, '');
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

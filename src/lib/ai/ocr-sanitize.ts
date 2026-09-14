/**
 * Phase 89: sanitizer + payload normalizer for OCR responses.
 *
 * The model's freeform output is wrapped with extractJsonObject()
 * (from src/lib/ai/blog-sanitize.ts) — that strips markdown fences
 * + preamble and repairs trailing commas. Then we coerce the
 * parsed JSON into the strict shape the wizard expects:
 *   - string fields trimmed + length-capped
 *   - dates validated as ISO YYYY-MM-DD
 *   - gender strictly one of 'Male' | 'Female' | 'Other'
 *   - GPA preserved as the original-scale string
 *   - confidence clamped to [0, 1] (per-field, default 0)
 *
 * All fields are nullable. The wizard + apply handlers simply
 * skip null values when populating form fields.
 */

import { extractJsonObject } from '@/lib/ai/blog-sanitize';
import { ALL_COUNTRIES } from '@/lib/common-countries';

// Field length caps — match what student_profiles.extra can hold
// (JSONB has no real limit, but reasonable for downstream forms).
const MAX_NAME_LENGTH = 100;
const MAX_DOC_NUMBER_LENGTH = 50;
const MAX_PLACE_LENGTH = 100;
const MAX_GPA_LENGTH = 30;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const ALLOWED_GENDERS = new Set(['Male', 'Female', 'Other']);

const CURRENT_YEAR = new Date().getFullYear();
const MIN_PLAUSIBLE_YEAR = 1950;
const MAX_PLAUSIBLE_YEAR = CURRENT_YEAR + 5;

export interface PassportOcrResult {
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  passportNumber: string | null;
  gender: 'Male' | 'Female' | 'Other' | null;
  passportIssueDate: string | null;
  passportExpiryDate: string | null;
  confidence: Record<string, number>;
}

export interface TranscriptOcrResult {
  highSchoolName: string | null;
  highSchoolCity: string | null;
  highSchoolCountry: string | null;
  highSchoolGPA: string | null;
  highSchoolGraduationDate: string | null;
  confidence: Record<string, number>;
}

function clampConfidence(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function normalizeConfidence(
  raw: unknown,
  keys: string[],
): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw || typeof raw !== 'object') {
    for (const k of keys) out[k] = 0;
    return out;
  }
  for (const k of keys) out[k] = clampConfidence((raw as Record<string, unknown>)[k]);
  return out;
}

function trimCap(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function normalizeIsoDate(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  if (!ISO_DATE_REGEX.test(trimmed)) return null;
  const [y, m, d] = trimmed.split('-').map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  if (y < MIN_PLAUSIBLE_YEAR || y > MAX_PLAUSIBLE_YEAR) return null;
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > 31) return null;
  return trimmed;
}

function normalizeIsoDateYearFlexible(v: unknown): string | null {
  // Transcripts often only have a graduation year. Allow the model
  // to emit YYYY or YYYY-MM-DD and we'll coerce to a valid YYYY-MM-01
  // if the year is plausible.
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  if (ISO_DATE_REGEX.test(trimmed)) return normalizeIsoDate(trimmed);
  const yearMatch = trimmed.match(/^(\d{4})(?:[-/](\d{1,2}))?(?:[-/](\d{1,2}))?$/);
  if (!yearMatch) return null;
  const year = Number(yearMatch[1]);
  if (year < MIN_PLAUSIBLE_YEAR || year > MAX_PLAUSIBLE_YEAR) return null;
  const month = yearMatch[2] ? Math.max(1, Math.min(12, Number(yearMatch[2]))) : 1;
  const day = yearMatch[3] ? Math.max(1, Math.min(28, Number(yearMatch[3]))) : 1;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function normalizeNationality(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  // Try to match canonical ISO name; otherwise return the trimmed
  // value as-is. We don't drop it because the admin can still
  // correct it via the Custom option.
  const canonical = ALL_COUNTRIES.find(
    (c) => c.value.toLowerCase() === trimmed.toLowerCase(),
  );
  if (canonical) return canonical.value;
  return trimmed.length > MAX_PLACE_LENGTH
    ? trimmed.slice(0, MAX_PLACE_LENGTH)
    : trimmed;
}

/**
 * Normalize the raw model JSON into the strict PassportOcrResult
 * shape. Defensive — never throws on malformed input. Returns
 * an all-nulls result with empty confidence when the model
 * returned garbage.
 */
export function normalizePassportOcrPayload(
  parsed: unknown,
): PassportOcrResult {
  if (!parsed || typeof parsed !== 'object') {
    return {
      firstName: null,
      lastName: null,
      dateOfBirth: null,
      nationality: null,
      passportNumber: null,
      gender: null,
      passportIssueDate: null,
      passportExpiryDate: null,
      confidence: {},
    };
  }
  const p = parsed as Record<string, unknown>;

  const genderRaw = typeof p.gender === 'string' ? p.gender.trim() : '';
  const gender = (ALLOWED_GENDERS.has(genderRaw) ? genderRaw : null) as
    | 'Male'
    | 'Female'
    | 'Other'
    | null;

  const keys = [
    'firstName',
    'lastName',
    'dateOfBirth',
    'nationality',
    'passportNumber',
    'gender',
    'passportIssueDate',
    'passportExpiryDate',
  ];

  return {
    firstName: trimCap(p.firstName, MAX_NAME_LENGTH),
    lastName: trimCap(p.lastName, MAX_NAME_LENGTH),
    dateOfBirth: normalizeIsoDate(p.dateOfBirth),
    nationality: normalizeNationality(p.nationality),
    passportNumber: trimCap(p.passportNumber, MAX_DOC_NUMBER_LENGTH)?.toUpperCase() ?? null,
    gender,
    passportIssueDate: normalizeIsoDate(p.passportIssueDate),
    passportExpiryDate: normalizeIsoDate(p.passportExpiryDate),
    confidence: normalizeConfidence(p.conf, keys),
  };
}

/**
 * Normalize the raw model JSON into the strict TranscriptOcrResult
 * shape. Same defensive guarantees as the passport sanitizer.
 */
export function normalizeTranscriptOcrPayload(
  parsed: unknown,
): TranscriptOcrResult {
  if (!parsed || typeof parsed !== 'object') {
    return {
      highSchoolName: null,
      highSchoolCity: null,
      highSchoolCountry: null,
      highSchoolGPA: null,
      highSchoolGraduationDate: null,
      confidence: {},
    };
  }
  const p = parsed as Record<string, unknown>;
  const keys = [
    'highSchoolName',
    'highSchoolCity',
    'highSchoolCountry',
    'highSchoolGPA',
    'highSchoolGraduationDate',
  ];

  return {
    highSchoolName: trimCap(p.highSchoolName, MAX_NAME_LENGTH),
    highSchoolCity: trimCap(p.highSchoolCity, MAX_PLACE_LENGTH),
    highSchoolCountry: normalizeNationality(p.highSchoolCountry),
    highSchoolGPA: trimCap(p.highSchoolGPA, MAX_GPA_LENGTH),
    highSchoolGraduationDate: normalizeIsoDateYearFlexible(
      p.highSchoolGraduationDate,
    ),
    confidence: normalizeConfidence(p.conf, keys),
  };
}

// Re-export so the route handler doesn't need a second import.
export { extractJsonObject };
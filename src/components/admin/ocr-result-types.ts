/**
 * Phase 89 / edit-OCR: Shared OCR result types — duplicated from
 * `src/lib/ai/ocr-sanitize.ts` so the client component can use
 * them without pulling in a server-only module. Keep the field
 * shapes in sync with the route handler that emits them.
 */

export type OcrKind = 'passport' | 'transcript' | 'resume';

/** Closed set for leveled transcript OCR (high school / bachelor / master). */
export type TranscriptLevel = 'high_school' | 'bachelor' | 'master';

export const TRANSCRIPT_LEVELS: readonly TranscriptLevel[] = [
  'high_school',
  'bachelor',
  'master',
] as const;

export function isTranscriptLevel(v: unknown): v is TranscriptLevel {
  return (
    typeof v === 'string' &&
    (TRANSCRIPT_LEVELS as readonly string[]).includes(v)
  );
}

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

/**
 * Level-agnostic transcript result. Only the fields for the
 * requested level are populated; the rest stay null.
 */
export interface TranscriptOcrResult {
  highSchoolName: string | null;
  highSchoolCity: string | null;
  highSchoolCountry: string | null;
  highSchoolGPA: string | null;
  highSchoolGraduationDate: string | null;
  bachelorUniversityName: string | null;
  bachelorMajor: string | null;
  bachelorGPA: string | null;
  bachelorGraduationDate: string | null;
  masterUniversityName: string | null;
  masterMajor: string | null;
  masterGPA: string | null;
  masterGraduationDate: string | null;
  confidence: Record<string, number>;
}

export interface ResumeOcrResult {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  /** Parent/guardian free-text block (e.g. "Parent: Name · Phone · Address"). */
  partnerInfo: string | null;
  confidence: Record<string, number>;
}

export type OcrResult = PassportOcrResult | TranscriptOcrResult | ResumeOcrResult;

/**
 * Phase 89: Shared OCR result types — duplicated from
 * `src/lib/ai/ocr-sanitize.ts` so the client component can use
 * them without pulling in a server-only module. Keep the field
 * shapes in sync with the route handler that emits them.
 */

export type OcrKind = 'passport' | 'transcript';

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

export type OcrResult = PassportOcrResult | TranscriptOcrResult;
/**
 * Phase 89 / edit-OCR: Pure helpers for the admin OCR upload modal.
 *
 * Kept separate from the modal component so they can be unit-tested
 * without rendering (mirrors the existing pattern in src/lib/__tests__/).
 */

import type { OcrKind } from '@/components/admin/ocr-result-types';

export type { OcrKind };

export const OCR_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;
export type OcrMimeType = (typeof OCR_ALLOWED_MIME_TYPES)[number];

export const OCR_MAX_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Map a 0-1 confidence score to a UI tone bucket.
 *  - >= 0.7 = green (high confidence, safe to apply)
 *  - 0.4 - 0.7 = yellow (verify before applying)
 *  - < 0.4 = red (likely wrong, manual review)
 */
export function confidenceToTone(conf: number): 'green' | 'yellow' | 'red' {
  if (conf >= 0.7) return 'green';
  if (conf >= 0.4) return 'yellow';
  return 'red';
}

/**
 * Map an OCR API field name to its i18n key suffix inside
 * `adminStudentOcr.fields.<key>`. The modal renders
 * `t('adminStudentOcr.fields.' + formatFieldLabel(kind, field))`.
 */
export function formatFieldLabel(kind: OcrKind, field: string): string {
  if (kind === 'passport') {
    switch (field) {
      case 'firstName': return 'passport.firstName';
      case 'lastName': return 'passport.lastName';
      case 'dateOfBirth': return 'passport.dateOfBirth';
      case 'nationality': return 'passport.nationality';
      case 'passportNumber': return 'passport.passportNumber';
      case 'gender': return 'passport.gender';
      case 'passportIssueDate': return 'passport.passportIssueDate';
      case 'passportExpiryDate': return 'passport.passportExpiryDate';
      default: return field;
    }
  }
  if (kind === 'resume') {
    switch (field) {
      case 'firstName': return 'resume.firstName';
      case 'lastName': return 'resume.lastName';
      case 'email': return 'resume.email';
      case 'phone': return 'resume.phone';
      case 'whatsapp': return 'resume.whatsapp';
      case 'address': return 'resume.address';
      case 'city': return 'resume.city';
      case 'country': return 'resume.country';
      case 'partnerInfo': return 'resume.partnerInfo';
      default: return field;
    }
  }
  // transcript (high school / bachelor / master — same result shape)
  switch (field) {
    case 'highSchoolName': return 'transcript.highSchoolName';
    case 'highSchoolCity': return 'transcript.highSchoolCity';
    case 'highSchoolCountry': return 'transcript.highSchoolCountry';
    case 'highSchoolGPA': return 'transcript.highSchoolGPA';
    case 'highSchoolGraduationDate': return 'transcript.highSchoolGraduationDate';
    case 'bachelorUniversityName': return 'transcript.bachelorUniversityName';
    case 'bachelorMajor': return 'transcript.bachelorMajor';
    case 'bachelorGPA': return 'transcript.bachelorGPA';
    case 'bachelorGraduationDate': return 'transcript.bachelorGraduationDate';
    case 'masterUniversityName': return 'transcript.masterUniversityName';
    case 'masterMajor': return 'transcript.masterMajor';
    case 'masterGPA': return 'transcript.masterGPA';
    case 'masterGraduationDate': return 'transcript.masterGraduationDate';
    default: return field;
  }
}

export function isValidFileType(mime: string): boolean {
  return (OCR_ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

export function isValidFileSize(bytes: number): boolean {
  return Number.isFinite(bytes) && bytes > 0 && bytes <= OCR_MAX_BYTES;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

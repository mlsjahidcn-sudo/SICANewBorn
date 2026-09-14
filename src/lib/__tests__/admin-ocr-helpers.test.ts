import { describe, it, expect } from 'vitest';
import {
  confidenceToTone,
  formatFieldLabel,
  isValidFileType,
  isValidFileSize,
  formatFileSize,
  OCR_ALLOWED_MIME_TYPES,
  OCR_MAX_BYTES,
} from '@/lib/admin-ocr-helpers';

describe('confidenceToTone', () => {
  it('returns green for >= 0.7', () => {
    expect(confidenceToTone(0.7)).toBe('green');
    expect(confidenceToTone(0.85)).toBe('green');
    expect(confidenceToTone(1)).toBe('green');
  });

  it('returns yellow for 0.4 - 0.7 (exclusive lower bound)', () => {
    expect(confidenceToTone(0.69)).toBe('yellow');
    expect(confidenceToTone(0.5)).toBe('yellow');
    expect(confidenceToTone(0.4)).toBe('yellow');
  });

  it('returns red for < 0.4', () => {
    expect(confidenceToTone(0.39)).toBe('red');
    expect(confidenceToTone(0)).toBe('red');
    expect(confidenceToTone(-0.1)).toBe('red');
  });
});

describe('formatFieldLabel', () => {
  it('maps passport fields to passport.* labels', () => {
    expect(formatFieldLabel('passport', 'firstName')).toBe('passport.firstName');
    expect(formatFieldLabel('passport', 'passportNumber')).toBe('passport.passportNumber');
    expect(formatFieldLabel('passport', 'passportExpiryDate')).toBe('passport.passportExpiryDate');
    expect(formatFieldLabel('passport', 'gender')).toBe('passport.gender');
  });

  it('maps transcript fields to transcript.* labels', () => {
    expect(formatFieldLabel('transcript', 'highSchoolName')).toBe('transcript.highSchoolName');
    expect(formatFieldLabel('transcript', 'highSchoolGPA')).toBe('transcript.highSchoolGPA');
    expect(formatFieldLabel('transcript', 'highSchoolGraduationDate')).toBe('transcript.highSchoolGraduationDate');
  });

  it('returns the raw field name for unknown fields (defensive)', () => {
    expect(formatFieldLabel('passport', 'mystery')).toBe('mystery');
    expect(formatFieldLabel('transcript', 'mystery')).toBe('mystery');
  });
});

describe('isValidFileType', () => {
  it('accepts jpeg, png, webp, pdf', () => {
    expect(isValidFileType('image/jpeg')).toBe(true);
    expect(isValidFileType('image/png')).toBe(true);
    expect(isValidFileType('image/webp')).toBe(true);
    expect(isValidFileType('application/pdf')).toBe(true);
  });

  it('rejects other mime types', () => {
    expect(isValidFileType('image/gif')).toBe(false);
    expect(isValidFileType('application/zip')).toBe(false);
    expect(isValidFileType('')).toBe(false);
    expect(isValidFileType('text/plain')).toBe(false);
  });

  it('does not allow image/jpg (storage bucket uses jpeg)', () => {
    // The bucket whitelist canonicalizes on image/jpeg; image/jpg is non-standard.
    expect(isValidFileType('image/jpg')).toBe(false);
  });

  it('OCR_ALLOWED_MIME_TYPES contains exactly the 4 expected types', () => {
    expect(OCR_ALLOWED_MIME_TYPES).toEqual([
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ]);
  });
});

describe('isValidFileSize', () => {
  it('accepts files up to 10MB inclusive', () => {
    expect(isValidFileSize(1)).toBe(true);
    expect(isValidFileSize(5 * 1024 * 1024)).toBe(true);
    expect(isValidFileSize(OCR_MAX_BYTES)).toBe(true);
  });

  it('rejects files over 10MB', () => {
    expect(isValidFileSize(OCR_MAX_BYTES + 1)).toBe(false);
    expect(isValidFileSize(20 * 1024 * 1024)).toBe(false);
  });

  it('rejects 0 and negative sizes', () => {
    expect(isValidFileSize(0)).toBe(false);
    expect(isValidFileSize(-1)).toBe(false);
  });

  it('rejects NaN / Infinity', () => {
    expect(isValidFileSize(NaN)).toBe(false);
    expect(isValidFileSize(Infinity)).toBe(false);
  });
});

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(512)).toBe('512 B');
  });
  it('formats KB', () => {
    expect(formatFileSize(2048)).toBe('2.0 KB');
  });
  it('formats MB', () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});
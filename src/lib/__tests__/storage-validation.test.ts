import { describe, it, expect } from 'vitest';
import {
  validateFileType,
  validateFileSize,
  validateFileName,
  isAllowedMimeType,
} from '@/lib/storage-validation';
import { STUDENT_DOC_MAX_BYTES } from '@/lib/storage';

describe('storage-validation', () => {
  describe('isAllowedMimeType', () => {
    it('accepts all whitelisted types', () => {
      for (const t of [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]) {
        expect(isAllowedMimeType(t)).toBe(true);
      }
    });
    it('rejects unknowns', () => {
      expect(isAllowedMimeType('text/html')).toBe(false);
      expect(isAllowedMimeType('application/zip')).toBe(false);
      expect(isAllowedMimeType(null)).toBe(false);
      expect(isAllowedMimeType(undefined)).toBe(false);
      expect(isAllowedMimeType(123)).toBe(false);
    });
  });

  describe('validateFileType', () => {
    it('passes for allowed types', () => {
      expect(validateFileType('application/pdf').ok).toBe(true);
    });
    it('fails for disallowed types', () => {
      const r = validateFileType('text/html');
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toContain('File type not allowed');
    });
    it('fails for non-strings', () => {
      expect(validateFileType(undefined).ok).toBe(false);
      expect(validateFileType(123).ok).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('passes for normal sizes', () => {
      expect(validateFileSize(1024).ok).toBe(true);
      expect(validateFileSize(5 * 1024 * 1024).ok).toBe(true);
    });
    it('fails for zero bytes', () => {
      const r = validateFileSize(0);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toContain('empty');
    });
    it('fails for negative', () => {
      expect(validateFileSize(-1).ok).toBe(false);
    });
    it('fails for > 10MB', () => {
      const r = validateFileSize(STUDENT_DOC_MAX_BYTES + 1);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toContain('too large');
    });
    it('fails for non-numbers', () => {
      expect(validateFileSize('1024' as any).ok).toBe(false);
      expect(validateFileSize(NaN).ok).toBe(false);
    });
  });

  describe('validateFileName', () => {
    it('passes for normal names', () => {
      expect(validateFileName('passport.pdf').ok).toBe(true);
      expect(validateFileName('transcript (official).pdf').ok).toBe(true);
    });
    it('fails for empty', () => {
      expect(validateFileName('').ok).toBe(false);
      expect(validateFileName('   ').ok).toBe(false);
    });
    it('fails for path traversal', () => {
      expect(validateFileName('../etc/passwd').ok).toBe(false);
      expect(validateFileName('a/b.pdf').ok).toBe(false);
      expect(validateFileName('a\\b.pdf').ok).toBe(false);
    });
    it('fails for too long', () => {
      expect(validateFileName('a'.repeat(256)).ok).toBe(false);
    });
  });
});

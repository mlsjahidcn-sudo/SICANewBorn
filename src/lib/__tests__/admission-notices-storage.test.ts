/**
 * admission-notices-storage.test.ts
 *
 * Phase 51: tests the storage path conventions + the
 * isOriginalPath defense-in-depth gate. No Supabase calls
 * — these are pure-string checks.
 */
import { describe, it, expect } from 'vitest';
import { isOriginalPath, ADMISSION_NOTICES_BUCKET } from '@/lib/admission-notices/storage';

describe('admission-notices storage', () => {
  describe('ADMISSION_NOTICES_BUCKET', () => {
    it('is the hyphenated bucket name', () => {
      expect(ADMISSION_NOTICES_BUCKET).toBe('admission-notices');
    });
  });

  describe('isOriginalPath', () => {
    it('returns true for paths under originals/', () => {
      expect(isOriginalPath('originals/abc-123.jpg')).toBe(true);
      expect(isOriginalPath('originals/abc-123.png')).toBe(true);
      expect(isOriginalPath('originals/some/long/path.jpg')).toBe(true);
    });
    it('returns false for paths under public/ or anywhere else', () => {
      expect(isOriginalPath('public/abc-123.jpg')).toBe(false);
      expect(isOriginalPath('other/abc-123.jpg')).toBe(false);
      expect(isOriginalPath('abc-123.jpg')).toBe(false);
      expect(isOriginalPath('')).toBe(false);
      // Defense against path traversal — even with a leading slash,
      // the originals/ prefix is the only thing that matches.
      expect(isOriginalPath('/originals/abc-123.jpg')).toBe(false);
    });
  });
});

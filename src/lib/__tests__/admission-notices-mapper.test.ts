/**
 * admission-notices-mapper.test.ts
 *
 * Phase 51: tests the DB ↔ UI mapper + the closed-taxonomy parser.
 * Mapper tests don't touch Supabase — they only check shape coercion.
 */
import { describe, it, expect } from 'vitest';
import {
  mapAdmissionNoticeFromDb,
  mapAdmissionNoticeInsertToDb,
  mapAdmissionNoticeUpdateToDb,
} from '@/lib/admission-notices/mapper';
import { parseAdmissionDegree, ADMISSION_DEGREES } from '@/lib/admission-notices/types';

describe('admission-notices mapper', () => {
  describe('parseAdmissionDegree', () => {
    it('returns the degree for known values', () => {
      for (const d of ADMISSION_DEGREES) {
        expect(parseAdmissionDegree(d)).toBe(d);
      }
    });
    it('returns null for unknown values', () => {
      expect(parseAdmissionDegree('PhD-2')).toBeNull();
      expect(parseAdmissionDegree('')).toBeNull();
      expect(parseAdmissionDegree(null)).toBeNull();
      expect(parseAdmissionDegree(undefined)).toBeNull();
      expect(parseAdmissionDegree(123)).toBeNull();
    });
  });

  describe('mapAdmissionNoticeFromDb', () => {
    it('coerces snake_case to camelCase + falls back invalid degree to null', () => {
      const row = {
        id: 'row-1',
        student_name: 'FAROLIA SYNDI MEKUI MANDJI',
        university_name: 'Zhengzhou University',
        program: 'Pharmacy',
        degree: 'InvalidValue', // not in the closed taxonomy
        intake: 'September 2026',
        scholarship: 'Partial Scholarship',
        country: 'Cameroon',
        image_path: 'public/row-1.jpg',
        original_path: 'originals/row-1.jpg',
        is_published: true,
        display_order: 10,
        created_by: 'user-1',
        created_at: '2026-07-11T00:00:00Z',
        updated_at: '2026-07-11T00:00:00Z',
      };
      const mapped = mapAdmissionNoticeFromDb(row);
      expect(mapped.studentName).toBe('FAROLIA SYNDI MEKUI MANDJI');
      expect(mapped.universityName).toBe('Zhengzhou University');
      expect(mapped.degree).toBeNull(); // invalid → null
      expect(mapped.imagePath).toBe('public/row-1.jpg');
      expect(mapped.isPublished).toBe(true);
      expect(mapped.displayOrder).toBe(10);
    });
    it('coerces null/undefined optional fields to null', () => {
      const row = {
        id: 'row-2',
        student_name: 'Test',
        university_name: 'Test U',
        image_path: 'public/row-2.jpg',
        original_path: 'originals/row-2.jpg',
        is_published: false,
        display_order: 0,
        created_at: '',
        updated_at: '',
      };
      const mapped = mapAdmissionNoticeFromDb(row);
      expect(mapped.program).toBeNull();
      expect(mapped.degree).toBeNull();
      expect(mapped.intake).toBeNull();
      expect(mapped.scholarship).toBeNull();
      expect(mapped.country).toBeNull();
      expect(mapped.createdBy).toBeNull();
    });
  });

  describe('mapAdmissionNoticeInsertToDb', () => {
    it('trims strings + applies defaults', () => {
      const payload = {
        studentName: '  Alice  ',
        universityName: 'Tsinghua',
        program: '  CS  ',
        degree: 'Master' as const,
        intake: ' Sep 2026 ',
        scholarship: '  CSC ',
        country: ' BD ',
        imagePath: 'public/x.jpg',
        originalPath: 'originals/x.jpg',
      };
      const row = mapAdmissionNoticeInsertToDb(payload, 'user-1');
      expect(row.student_name).toBe('Alice');
      expect(row.university_name).toBe('Tsinghua');
      expect(row.program).toBe('CS');
      expect(row.degree).toBe('Master');
      expect(row.intake).toBe('Sep 2026');
      expect(row.scholarship).toBe('CSC');
      expect(row.country).toBe('BD');
      expect(row.image_path).toBe('public/x.jpg');
      expect(row.original_path).toBe('originals/x.jpg');
      expect(row.is_published).toBe(false); // default
      expect(row.display_order).toBe(0); // default
      expect(row.created_by).toBe('user-1');
    });
    it('coerces empty optional strings to null', () => {
      const payload: import('@/lib/admission-notices/types').CreateAdmissionNoticePayload = {
        studentName: 'Bob',
        universityName: 'PKU',
        program: '',
        degree: null,
        intake: '  ',
        scholarship: '',
        country: '',
        imagePath: 'public/y.jpg',
        originalPath: 'originals/y.jpg',
      };
      const row = mapAdmissionNoticeInsertToDb(payload, 'user-2');
      expect(row.program).toBeNull();
      expect(row.degree).toBeNull();
      expect(row.intake).toBeNull();
      expect(row.scholarship).toBeNull();
      expect(row.country).toBeNull();
    });
  });

  describe('mapAdmissionNoticeUpdateToDb', () => {
    it('only includes provided fields', () => {
      const partial = { studentName: 'Updated' };
      const row = mapAdmissionNoticeUpdateToDb(partial);
      expect(row).toEqual({ student_name: 'Updated' });
    });
    it('skips undefined fields', () => {
      const partial = { studentName: 'X', program: undefined, isPublished: true };
      const row = mapAdmissionNoticeUpdateToDb(partial);
      expect(row).toEqual({ student_name: 'X', is_published: true });
    });
    it('trims and normalizes null fields', () => {
      const partial = { program: '  ', country: '   ' };
      const row = mapAdmissionNoticeUpdateToDb(partial);
      expect(row.program).toBeNull();
      expect(row.country).toBeNull();
    });
  });
});

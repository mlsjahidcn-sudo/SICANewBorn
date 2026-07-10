import { describe, it, expect } from 'vitest';
import {
  validatePartnerStudentPayload,
  PARTNER_STUDENT_FIELD_LIMITS,
} from '@/lib/partner-validation';

describe('partner-validation (Phase 47)', () => {
  describe('validatePartnerStudentPayload — create mode', () => {
    it('accepts a minimal valid payload (only required field)', () => {
      const errs = validatePartnerStudentPayload(
        { studentName: 'John Doe' },
        'create',
      );
      expect(errs).toEqual([]);
    });

    it('rejects missing studentName', () => {
      const errs = validatePartnerStudentPayload({}, 'create');
      expect(errs).toHaveLength(1);
      expect(errs[0].field).toBe('studentName');
      expect(errs[0].message).toContain('required');
    });

    it('rejects empty / whitespace-only studentName', () => {
      expect(
        validatePartnerStudentPayload({ studentName: '' }, 'create')[0]?.field,
      ).toBe('studentName');
      expect(
        validatePartnerStudentPayload({ studentName: '   ' }, 'create')[0]?.field,
      ).toBe('studentName');
      expect(
        validatePartnerStudentPayload({ studentName: 123 }, 'create')[0]?.field,
      ).toBe('studentName');
    });

    it('rejects studentName longer than the limit', () => {
      const tooLong = 'a'.repeat(PARTNER_STUDENT_FIELD_LIMITS.studentName + 1);
      const errs = validatePartnerStudentPayload(
        { studentName: tooLong },
        'create',
      );
      expect(errs).toHaveLength(1);
      expect(errs[0].field).toBe('studentName');
      expect(errs[0].message).toMatch(/at most 200/);
    });

    it('accepts a valid email', () => {
      const errs = validatePartnerStudentPayload(
        { studentName: 'A', studentEmail: 'a@b.com' },
        'create',
      );
      expect(errs).toEqual([]);
    });

    it('rejects a typo\'d email', () => {
      const cases = [
        'gmial.com', // missing @
        'a@b', // no dot
        '@b.com', // no local part
        'not an email', // spaces
        'a@b com', // space in domain
      ];
      for (const email of cases) {
        const errs = validatePartnerStudentPayload(
          { studentName: 'A', studentEmail: email },
          'create',
        );
        expect(errs.some((e) => e.field === 'studentEmail')).toBe(true);
      }
    });

    it('skips email validation when studentEmail is undefined / null / empty', () => {
      for (const v of [undefined, null, '']) {
        const errs = validatePartnerStudentPayload(
          { studentName: 'A', studentEmail: v },
          'create',
        );
        expect(errs).toEqual([]);
      }
    });

    it('rejects over-long studentEmail / studentPhone / nationality / targetUniversity / targetProgram / notes', () => {
      for (const [key, limit] of Object.entries(PARTNER_STUDENT_FIELD_LIMITS)) {
        const over = 'x'.repeat(limit + 1);
        const errs = validatePartnerStudentPayload(
          { studentName: 'A', [key]: over },
          'create',
        );
        expect(errs).toHaveLength(1);
        expect(errs[0].field).toBe(key);
        expect(errs[0].message).toMatch(new RegExp(`at most ${limit}`));
      }
    });

    it('skips length checks when optional fields are absent / empty / null', () => {
      const errs = validatePartnerStudentPayload(
        {
          studentName: 'A',
          studentEmail: undefined,
          studentPhone: null,
          nationality: '',
          targetUniversity: '',
          targetProgram: '',
          notes: '',
        },
        'create',
      );
      expect(errs).toEqual([]);
    });

    it('collects multiple errors in one pass (caller chooses to return the first)', () => {
      const errs = validatePartnerStudentPayload(
        {
          studentName: '',
          studentEmail: 'gmial.com',
          studentPhone: 'x'.repeat(100),
        },
        'create',
      );
      expect(errs.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('validatePartnerStudentPayload — update mode', () => {
    it('accepts an empty body (PATCH can touch nothing)', () => {
      const errs = validatePartnerStudentPayload({}, 'update');
      expect(errs).toEqual([]);
    });

    it('does not require studentName if absent', () => {
      const errs = validatePartnerStudentPayload(
        { studentEmail: 'a@b.com' },
        'update',
      );
      expect(errs).toEqual([]);
    });

    it('rejects studentName when it is present but empty (cannot clear required field)', () => {
      // The pre-Phase 47 bug: PATCH could clear studentName. Now
      // if the client sends the key, it must have a value.
      const errs = validatePartnerStudentPayload(
        { studentName: '' },
        'update',
      );
      expect(errs).toHaveLength(1);
      expect(errs[0].field).toBe('studentName');
    });

    it('still applies email format / length checks on PATCH', () => {
      const errs = validatePartnerStudentPayload(
        { studentEmail: 'gmial.com' },
        'update',
      );
      expect(errs).toHaveLength(1);
      expect(errs[0].field).toBe('studentEmail');
    });

    it('still applies length caps on PATCH', () => {
      const over = 'x'.repeat(PARTNER_STUDENT_FIELD_LIMITS.notes + 1);
      const errs = validatePartnerStudentPayload(
        { notes: over },
        'update',
      );
      expect(errs).toHaveLength(1);
      expect(errs[0].field).toBe('notes');
    });
  });
});

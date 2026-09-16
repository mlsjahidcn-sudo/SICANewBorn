import { describe, it, expect } from 'vitest';
import { pickStudentFeeUpdates } from '@/lib/student-fee-validation';

describe('student-fee-validation', () => {
  describe('pickStudentFeeUpdates', () => {
    it('passes through editable fields', () => {
      const out = pickStudentFeeUpdates({
        amount: 1000,
        currency: 'CNY',
        notes: 'foo',
      });
      expect(out).toEqual({ amount: 1000, currency: 'CNY', notes: 'foo' });
    });

    it('strips identity / server-stamped fields', () => {
      const out = pickStudentFeeUpdates({
        id: 'fee-1',
        student_id: 's-1',
        created_at: '2026-09-16T00:00:00Z',
        updated_at: '2026-09-16T00:00:00Z',
        updated_by: 'admin-1',
      });
      expect(out).toEqual({});
    });

    it('strips application_id + fee_type (cannot be reassigned post-create)', () => {
      const out = pickStudentFeeUpdates({
        application_id: 'app-2',
        fee_type: 'Tuition',
        amount: 100,
      });
      expect(out).toEqual({ amount: 100 });
    });

    it('strips unknown future fields', () => {
      const out = pickStudentFeeUpdates({
        amount: 100,
        future_column: 'whatever',
      });
      expect(out).toEqual({ amount: 100 });
    });

    it('returns empty object when all fields are server-only', () => {
      expect(
        pickStudentFeeUpdates({
          id: 'fee-1',
          student_id: 's-1',
          created_at: '2026-09-16T00:00:00Z',
        }),
      ).toEqual({});
    });
  });
});
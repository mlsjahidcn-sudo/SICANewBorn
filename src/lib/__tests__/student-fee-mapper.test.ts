import { describe, it, expect } from 'vitest';
import {
  mapStudentFeeFromDb,
  mapStudentFeeToDb,
  parseStudentFeeStatus,
  parseStudentFeeType,
  parseStudentFeeCurrency,
  STUDENT_FEE_STATUSES,
  STUDENT_FEE_TYPES,
  STUDENT_FEE_CURRENCIES,
} from '@/lib/student-fee-mapper';
import { currencySymbol } from '@/lib/currency';

describe('student-fee-mapper', () => {
  describe('parseStudentFeeStatus', () => {
    it('accepts all statuses', () => {
      for (const s of STUDENT_FEE_STATUSES) {
        expect(parseStudentFeeStatus(s)).toBe(s);
      }
    });
    it('rejects unknowns and case drift', () => {
      expect(parseStudentFeeStatus('pending')).toBeNull();
      expect(parseStudentFeeStatus('Pending ')).toBeNull();
      expect(parseStudentFeeStatus('Refunded')).toBeNull();
      expect(parseStudentFeeStatus(0)).toBeNull();
      expect(parseStudentFeeStatus(null)).toBeNull();
      expect(parseStudentFeeStatus(undefined)).toBeNull();
    });
  });

  describe('parseStudentFeeType', () => {
    it('accepts all types', () => {
      for (const t of STUDENT_FEE_TYPES) {
        expect(parseStudentFeeType(t)).toBe(t);
      }
    });
    it('rejects unknowns', () => {
      expect(parseStudentFeeType('application')).toBeNull();
      expect(parseStudentFeeType('Misc')).toBeNull();
      expect(parseStudentFeeType(42)).toBeNull();
    });
  });

  describe('parseStudentFeeCurrency', () => {
    it('accepts all currencies', () => {
      for (const c of STUDENT_FEE_CURRENCIES) {
        expect(parseStudentFeeCurrency(c)).toBe(c);
      }
    });
    it('rejects unknowns', () => {
      expect(parseStudentFeeCurrency('GBP')).toBeNull();
      expect(parseStudentFeeCurrency('cny')).toBeNull();
      expect(parseStudentFeeCurrency('¥')).toBeNull();
    });
  });

  describe('mapStudentFeeFromDb', () => {
    it('maps a full row', () => {
      const result = mapStudentFeeFromDb({
        id: 'fee-1',
        student_id: 's-1',
        application_id: 'app-1',
        fee_type: 'Tuition',
        description: 'Spring semester tuition',
        amount: 5000,
        currency: 'CNY',
        amount_paid: 2500,
        due_date: '2026-07-01',
        paid_date: null,
        status: 'Partial',
        payment_method: 'Bank Transfer',
        notes: '50% upfront',
        created_at: '2026-06-01T00:00:00Z',
        updated_at: '2026-06-15T00:00:00Z',
      });
      expect(result).toMatchObject({
        id: 'fee-1',
        studentId: 's-1',
        applicationId: 'app-1',
        feeType: 'Tuition',
        description: 'Spring semester tuition',
        amount: 5000,
        currency: 'CNY',
        amountPaid: 2500,
        dueDate: '2026-07-01',
        paidDate: null,
        status: 'Partial',
        paymentMethod: 'Bank Transfer',
        notes: '50% upfront',
        createdAt: '2026-06-01T00:00:00Z',
        updatedAt: '2026-06-15T00:00:00Z',
      });
    });

    it('coerces NUMERIC strings from PostgREST to number', () => {
      const result = mapStudentFeeFromDb({
        id: 'fee-1',
        student_id: 's-1',
        amount: '5000.50' as unknown as number,
        amount_paid: '0' as unknown as number,
        fee_type: 'Tuition',
        currency: 'CNY',
        status: 'Pending',
      });
      expect(result.amount).toBe(5000.5);
      expect(result.amountPaid).toBe(0);
      expect(typeof result.amount).toBe('number');
      expect(typeof result.amountPaid).toBe('number');
    });

    it('defaults amount=0 + amountPaid=0 + currency=CNY + status=Pending + feeType=Other for missing fields', () => {
      const result = mapStudentFeeFromDb({
        id: 'fee-1',
        student_id: 's-1',
        amount: null,
        amount_paid: null,
        currency: null,
        status: null,
        fee_type: null,
      });
      expect(result.amount).toBe(0);
      expect(result.amountPaid).toBe(0);
      expect(result.currency).toBe('CNY');
      expect(result.status).toBe('Pending');
      expect(result.feeType).toBe('Other');
    });

    it('ignores unknown columns to lock future-proofing for new fields', () => {
      const result = mapStudentFeeFromDb({
        id: 'fee-1',
        student_id: 's-1',
        fee_type: 'Visa',
        amount: 1000,
        currency: 'EUR',
        status: 'Paid',
        updated_by: 'admin-1',
        payment_proof_url: 'student/s-1/proof.png',
        future_column: 'whatever',
      } as unknown as Parameters<typeof mapStudentFeeFromDb>[0]);
      expect(result.id).toBe('fee-1');
      expect(result.feeType).toBe('Visa');
      expect(result.status).toBe('Paid');
      expect(result.currency).toBe('EUR');
    });
  });

  describe('mapStudentFeeToDb', () => {
    it('converts numeric strings to floats', () => {
      const out = mapStudentFeeToDb({ amount: '1234.56', amountPaid: '100' });
      expect(out.amount).toBe(1234.56);
      expect(out.amount_paid).toBe(100);
    });

    it('strips empty-string description back to null', () => {
      const out = mapStudentFeeToDb({ description: '' });
      expect(out.description).toBeNull();
    });

    it('omits unset fields', () => {
      expect(mapStudentFeeToDb({ status: 'Paid' })).toEqual({ status: 'Paid' });
    });

    it('passes applicationId null through explicitly', () => {
      expect(mapStudentFeeToDb({ applicationId: null })).toEqual({
        application_id: null,
      });
    });

    it('strips empty paymentMethod back to null', () => {
      expect(mapStudentFeeToDb({ paymentMethod: '' })).toEqual({
        payment_method: null,
      });
    });
  });

  describe('currencySymbol', () => {
    it('maps the three supported currencies', () => {
      expect(currencySymbol('CNY')).toBe('¥');
      expect(currencySymbol('USD')).toBe('$');
      expect(currencySymbol('EUR')).toBe('€');
    });
    it('falls back to the code for unknowns', () => {
      expect(currencySymbol('GBP')).toBe('GBP');
    });
  });
});
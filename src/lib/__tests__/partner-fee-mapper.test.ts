import { describe, it, expect } from 'vitest';
import {
  mapPartnerFeeFromDb,
  mapPartnerFeeToDb,
  parsePartnerFeeStatus,
  PARTNER_FEE_STATUSES,
} from '@/lib/partner-fee-mapper';

describe('partner-fee-mapper', () => {
  describe('parsePartnerFeeStatus', () => {
    it('accepts all 4 statuses', () => {
      for (const s of PARTNER_FEE_STATUSES) {
        expect(parsePartnerFeeStatus(s)).toBe(s);
      }
    });
    it('rejects unknowns', () => {
      expect(parsePartnerFeeStatus('paid')).toBeNull();
      expect(parsePartnerFeeStatus('Pending ')).toBeNull();
      expect(parsePartnerFeeStatus(0)).toBeNull();
    });
  });

  describe('mapPartnerFeeFromDb', () => {
    it('maps a full row', () => {
      const result = mapPartnerFeeFromDb({
        id: 'fee-1',
        partner_id: 'p-1',
        student_name: 'Alice',
        amount: 5000,
        currency: 'CNY',
        status: 'Paid',
        description: 'Application fee',
        due_date: '2026-07-01',
        paid_at: '2026-06-15T10:00:00Z',
        created_at: '2026-06-01T00:00:00Z',
        updated_at: '2026-06-15T00:00:00Z',
      });
      expect(result).toMatchObject({
        id: 'fee-1',
        partnerId: 'p-1',
        studentName: 'Alice',
        amount: 5000,
        currency: 'CNY',
        status: 'Paid',
        description: 'Application fee',
        dueDate: '2026-07-01',
        paidAt: '2026-06-15T10:00:00Z',
      });
    });

    it('coerces NUMERIC string from PostgREST to number', () => {
      const result = mapPartnerFeeFromDb({
        id: 'fee-1',
        partner_id: 'p-1',
        student_name: 'X',
        amount: '5000.50' as any,
        currency: 'CNY',
        status: 'Pending',
      });
      expect(result.amount).toBe(5000.5);
      expect(typeof result.amount).toBe('number');
    });

    it('defaults amount=0 + currency=CNY + status=Pending for missing fields', () => {
      const result = mapPartnerFeeFromDb({
        id: 'fee-1',
        partner_id: 'p-1',
        student_name: 'X',
        amount: null,
        currency: null,
        status: null,
      });
      expect(result.amount).toBe(0);
      expect(result.currency).toBe('CNY');
      expect(result.status).toBe('Pending');
    });
  });

  describe('mapPartnerFeeToDb', () => {
    it('converts numeric strings to floats', () => {
      const out = mapPartnerFeeToDb({ amount: '1234.56' });
      expect(out.amount).toBe(1234.56);
    });

    it('trims currency and studentName', () => {
      const out = mapPartnerFeeToDb({
        studentName: '  Alice  ',
        currency: '  USD  ',
      });
      expect(out).toEqual({ student_name: 'Alice', currency: 'USD' });
    });

    it('omits unset fields', () => {
      expect(mapPartnerFeeToDb({ status: 'Paid' })).toEqual({ status: 'Paid' });
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  mapPartnerApplicationFromDb,
  mapPartnerApplicationToDb,
  parsePartnerApplicationStatus,
  parsePartnerApplicationDecision,
  PARTNER_APPLICATION_STATUSES,
  PARTNER_APPLICATION_DECISIONS,
} from '@/lib/partner-application-mapper';

describe('partner-application-mapper', () => {
  describe('parsePartnerApplicationStatus', () => {
    it('accepts all whitelisted statuses', () => {
      for (const s of PARTNER_APPLICATION_STATUSES) {
        expect(parsePartnerApplicationStatus(s)).toBe(s);
      }
    });
    it('rejects unknowns / wrong case', () => {
      expect(parsePartnerApplicationStatus('draft')).toBeNull();
      expect(parsePartnerApplicationStatus('Pending')).toBeNull(); // not in this enum
      expect(parsePartnerApplicationStatus(123)).toBeNull();
      expect(parsePartnerApplicationStatus(null)).toBeNull();
    });
  });

  describe('parsePartnerApplicationDecision', () => {
    it('accepts all whitelisted decisions', () => {
      for (const d of PARTNER_APPLICATION_DECISIONS) {
        expect(parsePartnerApplicationDecision(d)).toBe(d);
      }
    });
    it('rejects unknowns', () => {
      expect(parsePartnerApplicationDecision('Maybe')).toBeNull();
      expect(parsePartnerApplicationDecision(undefined)).toBeNull();
    });
  });

  describe('mapPartnerApplicationFromDb', () => {
    it('maps a full DB row', () => {
      const result = mapPartnerApplicationFromDb({
        id: 'app-1',
        partner_id: 'p-1',
        student_name: 'Alice',
        university: 'Tsinghua',
        program: 'CS (Master)',
        status: 'Submitted',
        submitted_at: '2026-05-01T00:00:00Z',
        decision: 'Pending',
        notes: null,
        created_at: '2026-05-01T00:00:00Z',
        updated_at: '2026-05-02T00:00:00Z',
      });
      expect(result).toMatchObject({
        id: 'app-1',
        partnerId: 'p-1',
        studentName: 'Alice',
        university: 'Tsinghua',
        program: 'CS (Master)',
        status: 'Submitted',
        decision: 'Pending',
      });
    });

    it('falls back to "Draft" + "Pending" when missing', () => {
      const result = mapPartnerApplicationFromDb({
        id: 'app-2',
        partner_id: 'p-1',
        student_name: 'Bob',
        university: 'PKU',
        program: 'IB',
        status: null,
        decision: null,
      });
      expect(result.status).toBe('Draft');
      expect(result.decision).toBe('Pending');
    });
  });

  describe('mapPartnerApplicationToDb', () => {
    it('omits unset fields (partial PATCH friendly)', () => {
      expect(mapPartnerApplicationToDb({ status: 'Submitted' })).toEqual({
        status: 'Submitted',
      });
    });

    it('trims required strings', () => {
      const out = mapPartnerApplicationToDb({
        studentName: '  Alice  ',
        university: '  Tsinghua  ',
        program: '  CS  ',
      });
      expect(out).toEqual({
        student_name: 'Alice',
        university: 'Tsinghua',
        program: 'CS',
      });
    });
  });
});

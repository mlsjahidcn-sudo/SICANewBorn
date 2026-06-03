import { describe, it, expect } from 'vitest';
import {
  mapPartnerLeadFromDb,
  mapPartnerLeadToDb,
  parsePartnerLeadStatus,
  PARTNER_LEAD_STATUSES,
} from '@/lib/partner-lead-mapper';

describe('partner-lead-mapper', () => {
  describe('parsePartnerLeadStatus', () => {
    it('accepts all 5 statuses', () => {
      for (const s of PARTNER_LEAD_STATUSES) {
        expect(parsePartnerLeadStatus(s)).toBe(s);
      }
    });
    it('rejects unknowns', () => {
      expect(parsePartnerLeadStatus('new')).toBeNull();
      expect(parsePartnerLeadStatus('Hot')).toBeNull();
      expect(parsePartnerLeadStatus(undefined)).toBeNull();
    });
  });

  describe('mapPartnerLeadFromDb', () => {
    it('maps a full row', () => {
      const result = mapPartnerLeadFromDb({
        id: 'l-1',
        partner_id: 'p-1',
        lead_name: 'Bob',
        lead_email: 'bob@example.com',
        lead_phone: '+1-555',
        interested_program: 'CS',
        status: 'Contacted',
        notes: 'Following up',
        created_at: '2026-06-01T00:00:00Z',
        updated_at: '2026-06-02T00:00:00Z',
      });
      expect(result).toMatchObject({
        id: 'l-1',
        partnerId: 'p-1',
        leadName: 'Bob',
        leadEmail: 'bob@example.com',
        leadPhone: '+1-555',
        interestedProgram: 'CS',
        status: 'Contacted',
        notes: 'Following up',
      });
    });

    it('defaults status to "New" and nulls to null', () => {
      const result = mapPartnerLeadFromDb({
        id: 'l-2',
        partner_id: 'p-1',
        lead_name: 'X',
        lead_email: null,
        status: null,
      });
      expect(result.status).toBe('New');
      expect(result.leadEmail).toBeNull();
    });
  });

  describe('mapPartnerLeadToDb', () => {
    it('omits unset fields', () => {
      expect(mapPartnerLeadToDb({ status: 'Lost' })).toEqual({ status: 'Lost' });
    });

    it('trims leadName', () => {
      const out = mapPartnerLeadToDb({ leadName: '  Bob  ' });
      expect(out).toEqual({ lead_name: 'Bob' });
    });
  });
});

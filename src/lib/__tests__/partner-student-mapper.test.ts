import { describe, it, expect } from 'vitest';
import {
  mapPartnerStudentFromDb,
  mapPartnerStudentToDb,
  parsePartnerStudentStatus,
  PARTNER_STUDENT_STATUSES,
  PartnerStudent,
} from '@/lib/partner-student-mapper';

describe('partner-student-mapper', () => {
  describe('parsePartnerStudentStatus', () => {
    it('returns the status for valid inputs', () => {
      for (const s of PARTNER_STUDENT_STATUSES) {
        expect(parsePartnerStudentStatus(s)).toBe(s);
      }
    });

    it('rejects anything else', () => {
      expect(parsePartnerStudentStatus('new')).toBeNull(); // wrong case
      expect(parsePartnerStudentStatus('Unknown')).toBeNull();
      expect(parsePartnerStudentStatus(123)).toBeNull();
      expect(parsePartnerStudentStatus(null)).toBeNull();
      expect(parsePartnerStudentStatus(undefined)).toBeNull();
      expect(parsePartnerStudentStatus({})).toBeNull();
    });
  });

  describe('mapPartnerStudentFromDb', () => {
    it('maps snake_case → camelCase and fills defaults for missing status', () => {
      const row = {
        id: 'p-1',
        partner_id: 'partner-1',
        student_name: 'John Smith',
        student_email: 'john@example.com',
        student_phone: '+1-555-0101',
        nationality: 'USA',
        target_university: 'Tsinghua',
        target_program: 'CS',
        status: 'Accepted',
        notes: 'VIP',
        created_at: '2026-05-01T00:00:00Z',
        updated_at: '2026-05-02T00:00:00Z',
      };
      const result = mapPartnerStudentFromDb(row);
      // The mapper always includes the nullable author + soft-
      // delete fields so a missing source row produces a
      // well-formed PartnerStudent (the call site never has to
      // null-check). Phase 50b added archivedAt /
      // archivedByUserId alongside the existing createdByUserId
      // / createdByEmail pair. Phase E added applicationCount.
      expect(result).toEqual<PartnerStudent>({
        id: 'p-1',
        partnerId: 'partner-1',
        studentName: 'John Smith',
        studentEmail: 'john@example.com',
        studentPhone: '+1-555-0101',
        nationality: 'USA',
        targetUniversity: 'Tsinghua',
        targetProgram: 'CS',
        status: 'Accepted',
        notes: 'VIP',
        createdAt: '2026-05-01T00:00:00Z',
        updatedAt: '2026-05-02T00:00:00Z',
        createdByUserId: null,
        createdByEmail: null,
        archivedAt: null,
        archivedByUserId: null,
        applicationCount: null,
        linkedStudentProfileId: null,
        partnerName: null,
        documentCount: null,
      });
    });

    it('coerces null to null and missing status to "New"', () => {
      const result = mapPartnerStudentFromDb({
        id: 'p-2',
        partner_id: 'partner-1',
        student_name: 'Anonymous',
        student_email: null,
        student_phone: null,
        nationality: null,
        target_university: null,
        target_program: null,
        status: null,
        notes: null,
        created_at: '',
        updated_at: '',
      });
      expect(result.studentEmail).toBeNull();
      expect(result.studentPhone).toBeNull();
      expect(result.status).toBe('New');
      expect(result.notes).toBeNull();
    });

    it('falls back to "New" for unknown status string', () => {
      const result = mapPartnerStudentFromDb({
        id: 'p-3',
        partner_id: 'partner-1',
        student_name: 'Test',
        status: 'GarbageStatus',
      } as any);
      expect(result.status).toBe('New');
    });
  });

  describe('mapPartnerStudentToDb', () => {
    it('omits unset fields so PATCH can be a partial update', () => {
      const out = mapPartnerStudentToDb({ studentName: '  John  ' });
      expect(out).toEqual({ student_name: 'John' });
    });

    it('converts empty strings to null', () => {
      const out = mapPartnerStudentToDb({
        studentName: 'X',
        studentEmail: '',
        studentPhone: '',
        notes: '',
      });
      expect(out).toEqual({
        student_name: 'X',
        student_email: null,
        student_phone: null,
        notes: null,
      });
    });

    it('passes through status untouched (validated upstream)', () => {
      const out = mapPartnerStudentToDb({ status: 'Applied' });
      expect(out.status).toBe('Applied');
    });

    it('handles all optional fields', () => {
      const out = mapPartnerStudentToDb({
        studentName: 'X',
        studentEmail: 'a@b.com',
        studentPhone: '+1',
        nationality: 'USA',
        targetUniversity: 'Tsinghua',
        targetProgram: 'CS',
        status: 'New',
        notes: 'hi',
      });
      expect(out).toEqual({
        student_name: 'X',
        student_email: 'a@b.com',
        student_phone: '+1',
        nationality: 'USA',
        target_university: 'Tsinghua',
        target_program: 'CS',
        status: 'New',
        notes: 'hi',
      });
    });
  });
});

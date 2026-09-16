import { describe, it, expect } from 'vitest';
import {
  pickAdminDocRowUpdates,
  parseAndValidateAdminDocumentUpload,
} from '@/lib/admin-document-validation';
import {
  STUDENT_DOC_CATEGORIES,
  parseStudentDocCategory,
} from '@/lib/admin-document-categories';

describe('admin-document-validation', () => {
  describe('pickAdminDocRowUpdates', () => {
    it('passes through editable fields', () => {
      const out = pickAdminDocRowUpdates({
        status: 'Verified',
        rejection_reason: 'blurry',
        application_id: 'app-1',
      });
      expect(out).toEqual({
        status: 'Verified',
        rejection_reason: 'blurry',
        application_id: 'app-1',
      });
    });

    it('strips server-only fields', () => {
      const out = pickAdminDocRowUpdates({
        id: 'doc-1',
        student_id: 's-1',
        partner_student_id: null,
        uploaded_at: '2026-09-16T00:00:00Z',
        created_at: '2026-09-16T00:00:00Z',
        status: 'Verified',
      });
      expect(out).toEqual({ status: 'Verified' });
    });

    it('strips unknown future fields', () => {
      const out = pickAdminDocRowUpdates({
        status: 'Pending',
        future_column: 'whatever',
      });
      expect(out).toEqual({ status: 'Pending' });
    });

    it('returns empty object when nothing editable', () => {
      expect(
        pickAdminDocRowUpdates({
          id: 'doc-1',
          student_id: 's-1',
        }),
      ).toEqual({});
    });
  });

  describe('parseAndValidateAdminDocumentUpload', () => {
    const validBody = {
      studentId: '00000000-0000-0000-0000-000000000000',
      name: 'Passport',
      category: 'Passport',
      fileUrl:
        'student/00000000-0000-0000-0000-000000000000/doc-1-123.pdf',
      fileName: 'passport.pdf',
      fileType: 'application/pdf',
      fileSize: 12345,
    };

    it('accepts a complete body', () => {
      const out = parseAndValidateAdminDocumentUpload(validBody);
      expect(out.ok).toBe(true);
      if (out.ok) {
        expect(out.value).toEqual({
          studentId: validBody.studentId,
          applicationId: null,
          name: 'Passport',
          nameCn: null,
          category: 'Passport',
          fileUrl: validBody.fileUrl,
          fileName: 'passport.pdf',
          fileType: 'application/pdf',
          fileSize: 12345,
          notes: null,
        });
      }
    });

    it('passes applicationId through when present', () => {
      const out = parseAndValidateAdminDocumentUpload({
        ...validBody,
        applicationId: 'app-1',
      });
      expect(out.ok).toBe(true);
      if (out.ok) expect(out.value.applicationId).toBe('app-1');
    });

    it('rejects missing studentId', () => {
      const out = parseAndValidateAdminDocumentUpload({
        ...validBody,
        studentId: '',
      });
      expect(out.ok).toBe(false);
      if (!out.ok) expect(out.error).toBe('studentId is required');
    });

    it('rejects unknown category', () => {
      const out = parseAndValidateAdminDocumentUpload({
        ...validBody,
        category: 'Cat Photos',
      });
      expect(out.ok).toBe(false);
      if (!out.ok) expect(out.error).toContain('category');
    });

    it('accepts every category in STUDENT_DOC_CATEGORIES', () => {
      for (const cat of STUDENT_DOC_CATEGORIES) {
        expect(parseStudentDocCategory(cat)).toBe(cat);
        const r = parseAndValidateAdminDocumentUpload({ ...validBody, category: cat });
        expect(r.ok).toBe(true);
      }
    });

    it('rejects missing fileSize', () => {
      const out = parseAndValidateAdminDocumentUpload({
        ...validBody,
        fileSize: 'not-a-number' as unknown as number,
      });
      expect(out.ok).toBe(false);
      if (!out.ok) expect(out.error).toContain('fileSize');
    });
  });
});
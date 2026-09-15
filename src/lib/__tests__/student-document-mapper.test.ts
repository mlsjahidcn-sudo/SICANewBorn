import { describe, it, expect } from 'vitest';
import {
  mapStudentDocumentRow,
  mapDocCategoryToStudentCategory,
  isDocumentUsable,
} from '@/lib/student-document-mapper';

const FULL_ROW = {
  id: 'doc-1',
  student_id: 'stu-1',
  document_type_id: 'passport',
  name: 'Passport',
  status: 'Pending',
  file_name: 'passport.pdf',
  file_url: 'stu-1/doc-1-passport.pdf',
  file_size: 2048,
  application_id: 'app-1',
  uploaded_at: '2026-09-15T00:00:00Z',
};

describe('student-document-mapper', () => {
  describe('mapStudentDocumentRow', () => {
    it('maps snake_case DB columns to the camelCase view', () => {
      const v = mapStudentDocumentRow(FULL_ROW);
      expect(v).toEqual({
        id: 'doc-1',
        studentId: 'stu-1',
        documentTypeId: 'passport',
        name: 'Passport',
        status: 'Pending',
        fileName: 'passport.pdf',
        fileUrl: 'stu-1/doc-1-passport.pdf',
        fileSize: 2048,
        applicationId: 'app-1',
        rejectionReason: null,
        uploadedAt: '2026-09-15T00:00:00Z',
      });
    });

    it('fills safe defaults for missing/null fields', () => {
      const v = mapStudentDocumentRow({ id: 'doc-2' });
      expect(v.studentId).toBe('');
      expect(v.documentTypeId).toBe('');
      expect(v.name).toBe('');
      expect(v.fileName).toBe('');
      expect(v.fileUrl).toBe('');
      expect(v.fileSize).toBeNull();
      expect(v.applicationId).toBeNull();
      expect(v.rejectionReason).toBeNull();
      expect(v.uploadedAt).toBeNull();
    });

    it('normalizes unknown statuses to Pending', () => {
      expect(mapStudentDocumentRow({ id: 'x', status: 'weird' }).status).toBe('Pending');
      expect(mapStudentDocumentRow({ id: 'x', status: null }).status).toBe('Pending');
      expect(mapStudentDocumentRow({ id: 'x', status: 'Rejected' }).status).toBe('Rejected');
      expect(mapStudentDocumentRow({ id: 'x', status: 'Verified' }).status).toBe('Verified');
    });
  });

  describe('mapDocCategoryToStudentCategory', () => {
    it('translates the data.ts categories into the API union', () => {
      expect(mapDocCategoryToStudentCategory('Student Basic')).toBe('Identity');
      expect(mapDocCategoryToStudentCategory('Academic')).toBe('Academic');
      expect(mapDocCategoryToStudentCategory('Application Specific')).toBe('Other');
    });

    it('falls back to Other for unknown categories instead of 400-ing', () => {
      expect(mapDocCategoryToStudentCategory('Something New')).toBe('Other');
      expect(mapDocCategoryToStudentCategory('')).toBe('Other');
    });
  });

  describe('isDocumentUsable', () => {
    it('counts Pending, legacy Uploaded, and Verified as usable', () => {
      expect(isDocumentUsable('Pending')).toBe(true);
      expect(isDocumentUsable('Uploaded')).toBe(true);
      expect(isDocumentUsable('Verified')).toBe(true);
    });

    it('does not count Rejected or missing docs', () => {
      expect(isDocumentUsable('Rejected')).toBe(false);
      expect(isDocumentUsable(null)).toBe(false);
      expect(isDocumentUsable(undefined)).toBe(false);
    });
  });
});

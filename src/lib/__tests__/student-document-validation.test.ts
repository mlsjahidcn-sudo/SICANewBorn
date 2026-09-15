import { describe, it, expect } from 'vitest';
import { pickStudentEditableDocumentUpdates } from '@/lib/student-document-validation';

describe('pickStudentEditableDocumentUpdates', () => {
  it('passes through the content fields a student may edit', () => {
    const updates = pickStudentEditableDocumentUpdates({
      name: 'My Passport',
      name_cn: '我的护照',
      notes: 'renewed last month',
      file_url: 'stu-1/doc-1.pdf',
      file_name: 'passport.pdf',
      file_type: 'application/pdf',
      file_size: 1234,
    });
    expect(updates).toEqual({
      name: 'My Passport',
      name_cn: '我的护照',
      notes: 'renewed last month',
      file_url: 'stu-1/doc-1.pdf',
      file_name: 'passport.pdf',
      file_type: 'application/pdf',
      file_size: 1234,
    });
  });

  it('strips the admin-controlled review fields (self-verify hole)', () => {
    const updates = pickStudentEditableDocumentUpdates({
      name: 'ok',
      status: 'Verified',
      verified_at: '2026-09-15T00:00:00Z',
      verified_by: '00000000-0000-0000-0000-000000000000',
      rejection_reason: null,
    });
    expect(updates).toEqual({ name: 'ok' });
  });

  it('strips identity columns', () => {
    const updates = pickStudentEditableDocumentUpdates({
      id: 'doc-1',
      student_id: 'someone-else',
      document_type_id: 'passport',
      uploaded_at: '2026-09-15T00:00:00Z',
      created_at: '2026-09-15T00:00:00Z',
      category: 'Identity',
    });
    expect(updates).toEqual({});
  });

  it('must NOT accept snake_case application_id — linkage goes only through the checked applicationId wrapper', () => {
    const updates = pickStudentEditableDocumentUpdates({
      application_id: '11111111-2222-3333-4444-555555555555',
    });
    expect(updates).toEqual({});
  });

  it('returns an empty object for an empty or entirely-disallowed body', () => {
    expect(pickStudentEditableDocumentUpdates({})).toEqual({});
    expect(pickStudentEditableDocumentUpdates({ applicationId: 'app-1' })).toEqual({});
  });
});

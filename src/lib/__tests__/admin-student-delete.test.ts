import { describe, it, expect } from 'vitest';
import {
  decideStudentDelete,
  parseDeleteBody,
} from '@/lib/admin-student-delete';

describe('decideStudentDelete', () => {
  const student = { email: 'Sara@Example.com', first_name: 'Sara', last_name: 'Lee' };

  it('returns suspend when body is null (back-compat for old clients)', () => {
    const r = decideStudentDelete(null, student);
    expect(r.action).toBe('suspend');
  });

  it('returns suspend when body has action="suspend"', () => {
    const r = decideStudentDelete({ action: 'suspend' }, student);
    expect(r.action).toBe('suspend');
  });

  it('returns suspend when body has no action key', () => {
    const r = decideStudentDelete({}, student);
    expect(r.action).toBe('suspend');
  });

  it('returns delete when confirmEmail matches exactly (case-insensitive, trimmed)', () => {
    const r = decideStudentDelete(
      { action: 'delete', confirmEmail: '  sara@example.com  ' },
      student,
    );
    expect(r.action).toBe('delete');
  });

  it('rejects delete when confirmEmail is missing', () => {
    const r = decideStudentDelete({ action: 'delete' }, student);
    expect(r.action).toBe('reject');
    if (r.action !== 'reject') return;
    expect(r.status).toBe(400);
    expect(r.error).toMatch(/required/i);
  });

  it('rejects delete when confirmEmail does not match the student email', () => {
    const r = decideStudentDelete(
      { action: 'delete', confirmEmail: 'someone@else.com' },
      student,
    );
    expect(r.action).toBe('reject');
    if (r.action !== 'reject') return;
    expect(r.status).toBe(400);
    expect(r.error).toMatch(/does not match/i);
  });

  it('rejects delete when confirmEmail is the wrong type (not a string)', () => {
    const r = decideStudentDelete(
      { action: 'delete', confirmEmail: 42 },
      student,
    );
    expect(r.action).toBe('reject');
    if (r.action !== 'reject') return;
    expect(r.status).toBe(400);
  });

  it('treats case mismatch as a match (case-insensitive)', () => {
    const r = decideStudentDelete(
      { action: 'delete', confirmEmail: 'SARA@EXAMPLE.COM' },
      student,
    );
    expect(r.action).toBe('delete');
  });

  it('treats whitespace mismatch as a match (trimmed)', () => {
    const r = decideStudentDelete(
      { action: 'delete', confirmEmail: 'sara@example.com\t' },
      student,
    );
    expect(r.action).toBe('delete');
  });

  it('rejects unknown action values', () => {
    const r = decideStudentDelete({ action: 'explode' }, student);
    expect(r.action).toBe('reject');
    if (r.action !== 'reject') return;
    expect(r.status).toBe(400);
  });

  it('handles a student with an empty/missing email defensively', () => {
    const r = decideStudentDelete(
      { action: 'delete', confirmEmail: 'sara@example.com' },
      { email: '' },
    );
    // The student's email is empty, so any confirmEmail will not match.
    expect(r.action).toBe('reject');
    if (r.action !== 'reject') return;
    expect(r.status).toBe(400);
  });
});

describe('parseDeleteBody', () => {
  it('returns null for null or undefined', () => {
    expect(parseDeleteBody(null)).toBeNull();
    expect(parseDeleteBody(undefined)).toBeNull();
  });

  it('returns the parsed object as-is when valid', () => {
    expect(parseDeleteBody({ action: 'delete', confirmEmail: 'x@y.com' })).toEqual({
      action: 'delete',
      confirmEmail: 'x@y.com',
    });
  });

  it('returns null for non-objects (e.g. a string)', () => {
    expect(parseDeleteBody('hello')).toBeNull();
    expect(parseDeleteBody(42)).toBeNull();
  });
});
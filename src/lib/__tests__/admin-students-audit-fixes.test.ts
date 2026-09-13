import { describe, it, expect } from 'vitest';
import { parseStatus, parseSource, mapStudentToDb } from '@/lib/student-mapper';
import { decideStudentDelete, parseDeleteBody } from '@/lib/admin-student-delete';

describe('parseStatus', () => {
  it('accepts the 4 allowed status values', () => {
    expect(parseStatus('Active')).toBe('Active');
    expect(parseStatus('Inactive')).toBe('Inactive');
    expect(parseStatus('Pending')).toBe('Pending');
    expect(parseStatus('Suspended')).toBe('Suspended');
  });

  it('rejects arbitrary strings (C3 — silent data corruption vector)', () => {
    expect(parseStatus('Banned')).toBeNull();
    expect(parseStatus('banned')).toBeNull();
    expect(parseStatus('')).toBeNull();
    expect(parseStatus(null)).toBeNull();
    expect(parseStatus(undefined)).toBeNull();
    expect(parseStatus(42)).toBeNull();
    expect(parseStatus({})).toBeNull();
  });
});

describe('parseSource', () => {
  it('accepts the 3 allowed source values', () => {
    expect(parseSource('Admin')).toBe('Admin');
    expect(parseSource('Partner')).toBe('Partner');
    expect(parseSource('Online')).toBe('Online');
  });

  it('rejects arbitrary strings (C3)', () => {
    expect(parseSource('phone-call')).toBeNull();
    expect(parseSource('walk-in')).toBeNull();
    expect(parseSource('')).toBeNull();
    expect(parseSource(null)).toBeNull();
    expect(parseSource(42)).toBeNull();
  });
});

describe('mapStudentToDb (H1 regression — extra-only payloads)', () => {
  it('returns a non-empty extraUpdates when body has only extra JSONB fields', () => {
    const { dbRow, extraUpdates } = mapStudentToDb({ gender: 'Male' });
    // The dbRow split must yield empty fixed columns + a populated extra
    expect(Object.keys(dbRow).length).toBe(0);
    expect(extraUpdates).toEqual({ gender: 'Male' });
  });

  it('returns empty for fully empty body', () => {
    const { dbRow, extraUpdates } = mapStudentToDb({});
    expect(Object.keys(dbRow).length).toBe(0);
    expect(Object.keys(extraUpdates).length).toBe(0);
  });

  it('fixed-column-only payload produces empty extraUpdates', () => {
    const { dbRow, extraUpdates } = mapStudentToDb({ firstName: 'Sara' });
    expect(dbRow.first_name).toBe('Sara');
    expect(Object.keys(extraUpdates).length).toBe(0);
  });

  it('mixed payload splits correctly', () => {
    const { dbRow, extraUpdates } = mapStudentToDb({
      firstName: 'Sara',
      lastName: 'Lee',
      gender: 'Male',
    });
    expect(dbRow.first_name).toBe('Sara');
    expect(dbRow.last_name).toBe('Lee');
    expect(extraUpdates).toEqual({ gender: 'Male' });
  });
});

describe('decideStudentDelete with orphan auth.users fallback (H5)', () => {
  // H5: when student_profiles.email is null/empty (orphaned auth.users),
  // the route falls back to auth.admin.getUserById. The decision helper
  // sees the resolved email and runs the confirmEmail check normally.
  it('matches the auth.users-resolved email (case-insensitive)', () => {
    const studentRow = { email: 'orphan@example.com' }; // from auth.users
    const r = decideStudentDelete(
      { action: 'delete', confirmEmail: '  ORPHAN@EXAMPLE.COM  ' },
      studentRow,
    );
    expect(r.action).toBe('delete');
  });

  it('rejects when email does not match the orphan fallback', () => {
    const studentRow = { email: 'orphan@example.com' };
    const r = decideStudentDelete(
      { action: 'delete', confirmEmail: 'someone-else@example.com' },
      studentRow,
    );
    expect(r.action).toBe('reject');
  });
});

describe('parseDeleteBody with corrupted JSON (M14 regression)', () => {
  // M14: non-zero content-length with corrupted JSON body used to silently
  // become 'suspend'. After the fix, the route catches JSON parse errors
  // and returns 400; parseDeleteBody only sees the parsed value.
  it('returns null for null', () => {
    expect(parseDeleteBody(null)).toBeNull();
  });

  it('returns the parsed object for valid JSON', () => {
    expect(parseDeleteBody({ action: 'delete', confirmEmail: 'x@y.com' })).toEqual({
      action: 'delete',
      confirmEmail: 'x@y.com',
    });
  });

  it('returns null for non-objects', () => {
    expect(parseDeleteBody('not an object')).toBeNull();
    expect(parseDeleteBody(42)).toBeNull();
    expect(parseDeleteBody(true)).toBeNull();
    // Arrays pass typeof 'object' but won't have meaningful delete fields.
    // The decision helper handles the empty/missing action case as 'suspend'.
  });
});
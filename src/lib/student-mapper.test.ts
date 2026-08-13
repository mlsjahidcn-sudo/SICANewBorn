/**
 * student-mapper.test.ts
 *
 * Round-trip tests for the DB ↔ AdminStudent mapper. These catch
 * the most common regression: a column gets renamed in the DB but
 * the mapper doesn't get updated, or vice versa.
 */
import { describe, it, expect } from 'vitest';
import {
  mapStudentFromDb,
  mapStudentToDb,
  parseStatus,
  parseSource,
  STUDENT_SORTABLE_FIELDS,
} from './student-mapper';

describe('mapStudentFromDb', () => {
  it('converts a complete snake_case row to the camelCase AdminStudent', () => {
    const row = {
      id: 'abc-123',
      first_name: 'Jahid',
      last_name: 'Abdullah',
      email: 'mlsjahid.cn@gmail.com',
      phone: '+86 10 8888 9999',
      nationality: 'Bangladesh',
      date_of_birth: '1995-04-12',
      target_degree: 'Master',
      target_intake: 'September 2026',
      source: 'Online',
      status: 'Active',
      extra: { hsk_level: '4', gender: 'Male', notes: 'priority' },
      created_at: '2026-01-15T10:00:00Z',
      updated_at: '2026-05-20T14:30:00Z',
    };

    const student = mapStudentFromDb(row);

    expect(student).toEqual({
      id: 'abc-123',
      firstName: 'Jahid',
      lastName: 'Abdullah',
      email: 'mlsjahid.cn@gmail.com',
      phone: '+86 10 8888 9999',
      nationality: 'Bangladesh',
      dateOfBirth: '1995-04-12',
      gender: 'Male',
      targetDegree: 'Master',
      targetField: '',
      targetIntake: 'September 2026',
      isOffline: false, // source !== 'Admin'
      source: 'Online',
      status: 'Active',
      notes: 'priority',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-05-20T14:30:00Z',
      extra: { hsk_level: '4', gender: 'Male', notes: 'priority' },
    });
  });

  it('derives isOffline=true when source is Admin', () => {
    const student = mapStudentFromDb({
      id: 'x', source: 'Admin', status: 'Active',
    });
    expect(student.isOffline).toBe(true);
  });

  it('defaults missing fields to empty strings / "Online" / "Active"', () => {
    const student = mapStudentFromDb({ id: 'x' });
    expect(student.firstName).toBe('');
    expect(student.lastName).toBe('');
    expect(student.email).toBe('');
    expect(student.source).toBe('Online');
    expect(student.status).toBe('Active');
    expect(student.isOffline).toBe(false);
    expect(student.extra).toEqual({});
  });

  it('treats null `extra` as {}', () => {
    const student = mapStudentFromDb({ id: 'x', extra: null });
    expect(student.extra).toEqual({});
    expect(student.notes).toBeUndefined();
  });
});

describe('mapStudentToDb', () => {
  it('only includes fields that were provided (partial update)', () => {
    const { dbRow, extraUpdates } = mapStudentToDb({
      firstName: 'New Name',
      notes: 'updated note',
    });
    expect(dbRow.first_name).toBe('New Name');
    expect(dbRow).not.toHaveProperty('last_name');
    expect(dbRow).not.toHaveProperty('email');
    expect(extraUpdates.notes).toBe('updated note');
  });

  it('preserves id when provided (for upsert)', () => {
    const { dbRow } = mapStudentToDb({ id: 'abc-123', firstName: 'X' });
    expect(dbRow.id).toBe('abc-123');
  });

  it('routes free-form fields (gender, notes) to extraUpdates', () => {
    const { dbRow, extraUpdates } = mapStudentToDb({
      gender: 'Female',
      notes: 'priority',
    });
    expect(dbRow).not.toHaveProperty('gender');
    expect(dbRow).not.toHaveProperty('notes');
    expect(extraUpdates.gender).toBe('Female');
    expect(extraUpdates.notes).toBe('priority');
  });

  it('round-trips a full AdminStudent back to a row', () => {
    const original = mapStudentFromDb({
      id: 'abc',
      first_name: 'A',
      last_name: 'B',
      email: 'a@b.com',
      phone: '1',
      nationality: 'CN',
      date_of_birth: '2000-01-01',
      target_degree: 'PhD',
      target_intake: 'March 2026',
      source: 'Admin',
      status: 'Pending',
      extra: { hsk_level: '5' },
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    });
    const { dbRow, extraUpdates } = mapStudentToDb(original);
    expect(dbRow.first_name).toBe('A');
    expect(dbRow.source).toBe('Admin');
    expect(dbRow.status).toBe('Pending');
    expect(extraUpdates.hsk_level).toBe('5');
  });
});

describe('parseStatus', () => {
  it('accepts the four valid statuses', () => {
    for (const s of ['Active', 'Inactive', 'Pending', 'Suspended']) {
      expect(parseStatus(s)).toBe(s);
    }
  });

  it('rejects garbage', () => {
    expect(parseStatus('Deleted')).toBeNull();
    expect(parseStatus('active')).toBeNull(); // case-sensitive on purpose
    expect(parseStatus(null)).toBeNull();
    expect(parseStatus(42)).toBeNull();
    expect(parseStatus(undefined)).toBeNull();
  });
});

describe('parseSource', () => {
  it('accepts the three valid sources', () => {
    for (const s of ['Admin', 'Partner', 'Online']) {
      expect(parseSource(s)).toBe(s);
    }
  });

  it('rejects garbage', () => {
    expect(parseSource('Offline')).toBeNull();
    expect(parseSource('admin')).toBeNull();
    expect(parseSource(null)).toBeNull();
  });
});

describe('STUDENT_SORTABLE_FIELDS', () => {
  it('is a non-empty readonly tuple of DB column names', () => {
    expect(STUDENT_SORTABLE_FIELDS.length).toBeGreaterThan(0);
    for (const f of STUDENT_SORTABLE_FIELDS) {
      // Must be snake_case (DB convention)
      expect(f).toMatch(/^[a-z_]+$/);
    }
  });
});

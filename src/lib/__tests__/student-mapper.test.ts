/**
 * student-mapper.test.ts — Phase 77 + Phase 88
 *
 * Covers `mapStudentName` re-export (which delegates to
 * `deriveStudentFullName`) so the student-profile header banner can
 * render a name with the same fallback chain as the application
 * surfaces. Phase 88 also exercises `mapStudentFromDb` +
 * `mapStudentToDb` for the preferredUniversities field that was
 * previously dropped by the mapper (data-flow bug reported by
 * the user).
 */
import { describe, it, expect } from 'vitest';
import {
  mapStudentName,
  mapStudentFromDb,
  mapStudentToDb,
} from '@/lib/student-mapper';

describe('mapStudentName', () => {
  it('combines first + last name', () => {
    expect(
      mapStudentName({
        first_name: 'John',
        last_name: 'Smith',
        email: 'john@example.com',
      }),
    ).toBe('John Smith');
  });

  it('returns first only when last missing', () => {
    expect(
      mapStudentName({
        first_name: 'Madonna',
        last_name: null,
        email: 'madonna@example.com',
      }),
    ).toBe('Madonna');
  });

  it('returns last only when first missing (edge case)', () => {
    expect(
      mapStudentName({
        first_name: null,
        last_name: 'Cher',
        email: 'cher@example.com',
      }),
    ).toBe('Cher');
  });

  it('falls back to email local-part when both names empty', () => {
    expect(
      mapStudentName({
        first_name: null,
        last_name: null,
        email: 'jane.doe@example.com',
      }),
    ).toBe('jane.doe');
  });

  it('returns "—" when everything empty', () => {
    expect(mapStudentName({})).toBe('—');
    expect(
      mapStudentName({
        first_name: '',
        last_name: '',
        email: '',
      }),
    ).toBe('—');
  });
});

describe('mapStudentFromDb — preferredUniversities', () => {
  it('reads preferred_universities TEXT[] into a string[]', () => {
    const result = mapStudentFromDb({
      id: 'abc',
      email: 'x@y.com',
      first_name: 'A',
      preferred_universities: ['Tsinghua University', 'Peking University'],
    });
    expect(result.preferredUniversities).toEqual([
      'Tsinghua University',
      'Peking University',
    ]);
  });

  it('returns [] when the column is null', () => {
    const result = mapStudentFromDb({
      id: 'abc',
      email: 'x@y.com',
      preferred_universities: null,
    });
    expect(result.preferredUniversities).toEqual([]);
  });

  it('returns [] when the column is missing entirely', () => {
    const result = mapStudentFromDb({ id: 'abc', email: 'x@y.com' });
    expect(result.preferredUniversities).toEqual([]);
  });

  it('filters out non-string elements defensively', () => {
    const result = mapStudentFromDb({
      id: 'abc',
      email: 'x@y.com',
      // PostgREST sometimes returns mixed-type arrays if a column
      // was migrated; the mapper never throws.
      preferred_universities: ['valid', null, 42, 'also-valid'],
    } as Record<string, unknown>);
    expect(result.preferredUniversities).toEqual(['valid', 'also-valid']);
  });
});

describe('mapStudentToDb — preferredUniversities', () => {
  it('writes preferredUniversities as snake_case preferred_universities', () => {
    const { dbRow, extraUpdates } = mapStudentToDb({
      preferredUniversities: ['Tsinghua University', 'Peking University'],
    });
    expect(dbRow.preferred_universities).toEqual([
      'Tsinghua University',
      'Peking University',
    ]);
    expect(extraUpdates.preferred_universities).toBeUndefined();
  });

  it('trims whitespace + drops empty entries', () => {
    const { dbRow } = mapStudentToDb({
      preferredUniversities: ['  Tsinghua  ', '', '   ', 'Peking'],
    });
    expect(dbRow.preferred_universities).toEqual(['Tsinghua', 'Peking']);
  });

  it('writes [] when all entries are blank (so the DB clears the column)', () => {
    const { dbRow } = mapStudentToDb({
      preferredUniversities: ['', '   '],
    });
    expect(dbRow.preferred_universities).toEqual([]);
  });

  it('does NOT touch the column when preferredUniversities is undefined', () => {
    const { dbRow } = mapStudentToDb({ firstName: 'Sara' });
    expect(dbRow.preferred_universities).toBeUndefined();
    expect(dbRow.first_name).toBe('Sara');
  });
});
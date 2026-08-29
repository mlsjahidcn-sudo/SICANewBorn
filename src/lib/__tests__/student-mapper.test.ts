/**
 * student-mapper.test.ts — Phase 77
 *
 * Covers `mapStudentName` re-export (which delegates to
 * `deriveStudentFullName`) so the student-profile header banner can
 * render a name with the same fallback chain as the application
 * surfaces. The full `mapStudentFromDb` is exercised via integration
 * tests against the /api/admin/students/[id] endpoint.
 */
import { describe, it, expect } from 'vitest';
import { mapStudentName } from '@/lib/student-mapper';

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
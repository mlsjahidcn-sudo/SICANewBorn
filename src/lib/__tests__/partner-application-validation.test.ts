import { describe, expect, it } from 'vitest';

import {
  MIN_NOTES_WHEN_UNASSIGNED,
  PARTNER_APPLICATION_FIELD_LIMITS,
  validatePartnerApplicationPayload,
} from '@/lib/partner-application-validation';

/**
 * The partner application validator is the gate in front of both the
 * create route and the PATCH route. Its documented contract says that
 * in `update` mode "required fields are only checked when they are
 * present in the body, so single-field updates still work" — the
 * `studentName` check did not honour that, which blocked the inline
 * notes editor (Phase 177) from ever saving.
 */
describe('validatePartnerApplicationPayload — studentName', () => {
  it('requires studentName on create', () => {
    const errors = validatePartnerApplicationPayload({ university: 'X', program: 'Y' }, 'create');
    expect(errors[0]?.field).toBe('studentName');
  });

  it('rejects an empty studentName on create', () => {
    const errors = validatePartnerApplicationPayload(
      { studentName: '   ', university: 'X', program: 'Y' },
      'create',
    );
    expect(errors[0]?.field).toBe('studentName');
  });

  it('rejects a studentName over the length limit', () => {
    const errors = validatePartnerApplicationPayload(
      {
        studentName: 'a'.repeat(PARTNER_APPLICATION_FIELD_LIMITS.studentName + 1),
        university: 'X',
        program: 'Y',
      },
      'create',
    );
    expect(errors[0]?.field).toBe('studentName');
  });

  it('allows a single-field update that omits studentName', () => {
    expect(validatePartnerApplicationPayload({ notes: 'A note.' }, 'update')).toEqual([]);
  });

  it('allows a single-field archive update that omits studentName', () => {
    expect(validatePartnerApplicationPayload({ archived: false }, 'update')).toEqual([]);
  });

  it('still validates studentName on update when it IS present', () => {
    const errors = validatePartnerApplicationPayload({ studentName: '' }, 'update');
    expect(errors[0]?.field).toBe('studentName');
  });

  it('accepts a valid studentName on update', () => {
    expect(validatePartnerApplicationPayload({ studentName: 'Amara' }, 'update')).toEqual([]);
  });
});

describe('validatePartnerApplicationPayload — unassigned university/program', () => {
  it('requires notes on create when the catalog fields are empty', () => {
    const errors = validatePartnerApplicationPayload(
      { studentName: 'Amara', university: '', program: '' },
      'create',
    );
    expect(errors.some((e) => e.field === 'notes')).toBe(true);
  });

  it('requires enough notes on create when the catalog fields are empty', () => {
    const errors = validatePartnerApplicationPayload(
      { studentName: 'Amara', university: '', program: '', notes: 'short' },
      'create',
    );
    expect(errors[0]?.message).toContain(String(MIN_NOTES_WHEN_UNASSIGNED));
  });

  it('accepts a create with notes long enough for an unassigned application', () => {
    const errors = validatePartnerApplicationPayload(
      {
        studentName: 'Amara',
        university: '',
        program: '',
        notes: 'A note long enough to describe the desired school.',
      },
      'create',
    );
    expect(errors).toEqual([]);
  });
});

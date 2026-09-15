import { describe, it, expect } from 'vitest';
import {
  computeBasicProfileCompletion,
  BASIC_PROFILE_FIELDS,
} from '@/lib/student-profile-completion';

describe('student-profile-completion', () => {
  it('tracks exactly the 9 basic fields', () => {
    expect(BASIC_PROFILE_FIELDS).toEqual([
      'first_name',
      'last_name',
      'phone',
      'nationality',
      'date_of_birth',
      'highest_education',
      'target_degree',
      'target_field',
      'target_intake',
    ]);
  });

  it('reports complete for a fully filled profile', () => {
    const profile = Object.fromEntries(BASIC_PROFILE_FIELDS.map((f) => [f, 'x']));
    const result = computeBasicProfileCompletion(profile);
    expect(result).toEqual({ missing: [], complete: true, percent: 100 });
  });

  it('treats null/undefined/whitespace-only values as missing', () => {
    const result = computeBasicProfileCompletion({
      first_name: 'John',
      last_name: '   ',
      phone: null,
      nationality: undefined,
      date_of_birth: '',
      highest_education: 'High School',
      target_degree: 'Bachelor',
      target_field: 'CS',
      target_intake: '2026 Fall',
    });
    expect(result.missing).toEqual(['last_name', 'phone', 'nationality', 'date_of_birth']);
    expect(result.complete).toBe(false);
    expect(result.percent).toBe(56); // 5/9 rounded
  });

  it('matches the signup-trigger shape: 5 fields filled → 3 missing', () => {
    // handle_new_student_user copies first/last name, whatsapp→phone,
    // country→nationality, degree→target_degree,
    // interested_program→target_field. DOB, education, intake remain.
    const result = computeBasicProfileCompletion({
      first_name: 'John',
      last_name: 'Smith',
      phone: '+123',
      nationality: 'Nigeria',
      target_degree: 'Bachelor',
      target_field: 'Computer Science',
    });
    expect(result.missing).toEqual(['date_of_birth', 'highest_education', 'target_intake']);
    expect(result.complete).toBe(false);
    expect(result.percent).toBe(67); // 6/9 = 66.67 → 67
  });

  it('handles null/undefined profile (404 / no trigger row)', () => {
    expect(computeBasicProfileCompletion(null)).toEqual({
      missing: [...BASIC_PROFILE_FIELDS],
      complete: false,
      percent: 0,
    });
    expect(computeBasicProfileCompletion(undefined).percent).toBe(0);
  });

  it('rounds percent to the nearest integer', () => {
    const profile: Record<string, string> = {};
    BASIC_PROFILE_FIELDS.forEach((f, i) => {
      if (i < 8) profile[f] = 'x';
    });
    expect(computeBasicProfileCompletion(profile).percent).toBe(89); // 8/9 = 88.9
  });
});

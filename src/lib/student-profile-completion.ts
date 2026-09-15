/**
 * Basic-profile completion check for the student portal.
 *
 * Phase 94: these are the fields SICA needs to advise + process a
 * student. The signup form fills 5 of the 9 via the
 * handle_new_student_user trigger (names, phone, nationality,
 * target_degree, target_field) — the rest (date_of_birth,
 * highest_education, target_intake) are what the post-signup prompt
 * chases. Shared by the dashboard banner, the profile-page meter
 * (replaces the page's local Phase 4D field list), and
 * GET /api/student/profile's `completion` block so all three agree.
 */
export const BASIC_PROFILE_FIELDS = [
  'first_name',
  'last_name',
  'phone',
  'nationality',
  'date_of_birth',
  'highest_education',
  'target_degree',
  'target_field',
  'target_intake',
] as const;

export type BasicProfileField = (typeof BASIC_PROFILE_FIELDS)[number];

export type BasicProfileLike = Partial<Record<BasicProfileField, string | null | undefined>>;

export interface BasicProfileCompletion {
  /** Fields still missing — empty array means complete. */
  missing: BasicProfileField[];
  complete: boolean;
  /** 0–100 */
  percent: number;
}

export function computeBasicProfileCompletion(
  profile: BasicProfileLike | null | undefined,
): BasicProfileCompletion {
  const missing = BASIC_PROFILE_FIELDS.filter((field) => {
    const value = profile?.[field];
    return value === null || value === undefined || String(value).trim() === '';
  });
  const done = BASIC_PROFILE_FIELDS.length - missing.length;
  return {
    missing,
    complete: missing.length === 0,
    percent: Math.round((done / BASIC_PROFILE_FIELDS.length) * 100),
  };
}

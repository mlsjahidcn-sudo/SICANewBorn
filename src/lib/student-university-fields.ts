/** Shared optional details needed by external university application portals. */
export const STUDENT_UNIVERSITY_COLUMNS = {
  placeOfBirth: 'place_of_birth',
  nativeLanguage: 'native_language',
  maritalStatus: 'marital_status',
  religion: 'religion',
  yearsInHomeCountry: 'years_in_home_country',
  sponsorEmail: 'sponsor_email',
  guarantorName: 'guarantor_name',
  guarantorRelationship: 'guarantor_relationship',
  guarantorPhone: 'guarantor_phone',
  guarantorEmail: 'guarantor_email',
} as const;
export type StudentUniversityField = keyof typeof STUDENT_UNIVERSITY_COLUMNS;
export type StudentUniversityDetails = Partial<Record<Exclude<StudentUniversityField, 'yearsInHomeCountry'>, string | null>> & {
  yearsInHomeCountry?: number | null;
};
export type StudentUniversityFormValues = Record<StudentUniversityField, string>;
export const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'] as const;
export const STUDENT_UNIVERSITY_LIMITS: Record<StudentUniversityField, number> = {
  placeOfBirth: 128, nativeLanguage: 100, maritalStatus: 32, religion: 100,
  yearsInHomeCountry: 150, sponsorEmail: 255, guarantorName: 200,
  guarantorRelationship: 100, guarantorPhone: 50, guarantorEmail: 255,
};

export function studentUniversityFormValues(details: Partial<Record<StudentUniversityField, string | number | null>> = {}): StudentUniversityFormValues {
  return Object.fromEntries(Object.keys(STUDENT_UNIVERSITY_COLUMNS).map(key => {
    const value = details[key as StudentUniversityField];
    return [key, value == null ? '' : String(value)];
  })) as StudentUniversityFormValues;
}

/** Only supplied keys are returned, so a partial update never clears unrelated fields. */
export function studentUniversityUpdates(body: Record<string, unknown>): Partial<Record<StudentUniversityField, string | number | null>> {
  const extra = body.extra && typeof body.extra === 'object' && !Array.isArray(body.extra)
    ? body.extra as Record<string, unknown> : {};
  const result: Partial<Record<StudentUniversityField, string | number | null>> = {};
  for (const key of Object.keys(STUDENT_UNIVERSITY_COLUMNS) as StudentUniversityField[]) {
    const value = body[key] !== undefined ? body[key] : extra[key];
    if (value === undefined) continue;
    result[key] = value === null || (typeof value === 'string' && !value.trim()) ? null
      : key === 'yearsInHomeCountry' ? Number(value) : String(value).trim();
  }
  return result;
}

export function validateStudentUniversityDetails(body: Record<string, unknown>): { field: StudentUniversityField; message: string }[] {
  const extra = body.extra && typeof body.extra === 'object' && !Array.isArray(body.extra)
    ? body.extra as Record<string, unknown> : {};
  const errors: { field: StudentUniversityField; message: string }[] = [];
  for (const key of Object.keys(STUDENT_UNIVERSITY_COLUMNS) as StudentUniversityField[]) {
    // Validate both representations; a malformed extra value must not bypass validation.
    for (const value of [body[key], extra[key]]) {
      if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) continue;
      let message = '';
      if (key === 'yearsInHomeCountry') {
        if (!['number', 'string'].includes(typeof value) || !/^\d+(?:\.\d{1,2})?$/.test(String(value).trim()) || !Number.isFinite(Number(value)) || Number(value) > 150) {
          message = 'Years of living in your home country must be a number from 0 to 150 (up to two decimal places).';
        }
      } else if (typeof value !== 'string' || value.trim().length > STUDENT_UNIVERSITY_LIMITS[key]) {
        message = `${key} must be text with at most ${STUDENT_UNIVERSITY_LIMITS[key]} characters.`;
      } else if ((key === 'sponsorEmail' || key === 'guarantorEmail') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        message = `${key === 'sponsorEmail' ? 'Financial sponsor' : 'Guarantor'} email must be a valid email address.`;
      } else if (key === 'maritalStatus' && !(MARITAL_STATUSES as readonly string[]).includes(value.trim())) {
        message = 'Marital status must be Single, Married, Divorced or Widowed.';
      }
      if (message) { errors.push({ field: key, message }); break; }
    }
  }
  return errors;
}

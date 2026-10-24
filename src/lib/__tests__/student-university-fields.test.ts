import { describe, expect, it } from 'vitest';
import { mapStudentFromDb, mapStudentToDb } from '@/lib/student-mapper';
import { mapPartnerStudentFromDb, mapPartnerStudentToDb } from '@/lib/partner-student-mapper';
import { validatePartnerStudentPayload } from '@/lib/partner-validation';
import { studentUniversityFormValues, studentUniversityUpdates, validateStudentUniversityDetails } from '@/lib/student-university-fields';
import { buildStudentMarkdown } from '@/lib/student-markdown';

const details = {
  placeOfBirth: 'Dhaka', nativeLanguage: 'Bangla', maritalStatus: 'Single', religion: 'Islam',
  yearsInHomeCountry: 0, sponsorEmail: 'father@example.com', guarantorName: 'Parent',
  guarantorRelationship: 'Father', guarantorPhone: '+880 12345', guarantorEmail: 'guarantor@example.com',
};
describe('university portal student details', () => {
  it('round-trips every canonical field through fixed columns and extra, preserving zero and unrelated extra', () => {
    const { dbRow, extraUpdates } = mapStudentToDb({ ...details, extra: { hskScore: '220' } });
    expect(dbRow).toMatchObject({ place_of_birth: 'Dhaka', marital_status: 'Single', sponsor_email: 'father@example.com' });
    expect(extraUpdates.hskScore).toBe('220');
    const result = mapStudentFromDb({ ...dbRow, extra: extraUpdates });
    expect(result).toMatchObject(details);
    expect(studentUniversityFormValues(result).yearsInHomeCountry).toBe('0');
  });
  it('round-trips partner fields without allowing changes to agency ownership or profile links', () => {
    const row = mapPartnerStudentToDb({ ...details, partnerId: 'attacker', linkedStudentProfileId: 'other', id: 'other' });
    expect(row).not.toHaveProperty('partner_id');
    expect(row).not.toHaveProperty('linked_student_profile_id');
    expect(row).not.toHaveProperty('id');
    expect(mapPartnerStudentFromDb({ ...row, id: 'student', partner_id: 'agency', student_name: 'Student' })).toMatchObject(details);
  });
  it('supports partial updates and explicit clearing without reviving legacy values', () => {
    expect(studentUniversityUpdates({ religion: '  ' })).toEqual({ religion: null });
    expect(mapPartnerStudentToDb({ guarantorEmail: '' })).toEqual({ guarantor_email: null });
    const { dbRow, extraUpdates } = mapStudentToDb({ placeOfBirth: '', maritalStatus: '', sponsorEmail: '', extra: { placeOfBirth: 'Old', religion: 'Old' } });
    const saved = mapStudentFromDb({ ...dbRow, extra: extraUpdates });
    expect(saved.placeOfBirth).toBeNull();
    expect(saved.maritalStatus).toBeNull();
    expect(saved.sponsorEmail).toBeNull();
    expect(saved.religion).toBe('Old');
  });
  it.each([-1, 151, Infinity, 'NaN', '0x10', '1e2', '1.234', true, {}, []])('rejects invalid residence years %j in both API validators', value => {
    expect(validateStudentUniversityDetails({ extra: { yearsInHomeCountry: value } })[0]?.field).toBe('yearsInHomeCountry');
    expect(validatePartnerStudentPayload({ yearsInHomeCountry: value }, 'update')[0]?.field).toBe('yearsInHomeCountry');
  });
  it('accepts blank optional fields, zero and fractional years, and validates text/email/status', () => {
    expect(validateStudentUniversityDetails({})).toEqual([]);
    expect(validateStudentUniversityDetails({ ...details, yearsInHomeCountry: '20.50' })).toEqual([]);
    expect(validateStudentUniversityDetails(studentUniversityFormValues())).toEqual([]);
    for (const [field, value] of Object.entries({ sponsorEmail: 'bad', guarantorEmail: 'bad', guarantorPhone: {}, nativeLanguage: 'x'.repeat(101), maritalStatus: 'Other' })) {
      expect(validateStudentUniversityDetails({ [field]: value })[0]?.field).toBe(field);
    }
  });
  it('exports canonical and linked partner values separately, including guarantor details and zero years', () => {
    const { dbRow, extraUpdates } = mapStudentToDb(details);
    const md = buildStudentMarkdown({ identity: { ...dbRow, extra: extraUpdates }, partnerStudent: { religion: 'Partner value' }, education: [], documents: [], applications: [] }, '2026-10-24');
    for (const text of ['**Place of birth:** Dhaka', '**Native language:** Bangla', '**Marital status:** Single', '**Religion:** Islam', '**Years of living in home country:** 0', '**Sponsor email:** father@example.com', '## Guarantor', '**Name:** Parent', '**Relationship:** Father', '**Phone:** +880 12345', '**Email:** guarantor@example.com', '**Religion:** Partner value']) expect(md).toContain(text);
  });
});

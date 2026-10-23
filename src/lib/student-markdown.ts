/** Explicit applicant fields only: never serialize CRM notes, credentials or file URLs. */
export const STUDENT_EXPORT_KINDS = ['student', 'partner-student', 'student-application', 'partner-application'] as const;
export type StudentExportKind = (typeof STUDENT_EXPORT_KINDS)[number];
export type ExportRow = Record<string, unknown>;
export interface StudentMarkdownData {
  identity: ExportRow;
  /** Null means the newer history table is unavailable; legacy qualifications still export. */
  education: ExportRow[] | null;
  applications: { surface: 'student' | 'partner'; record: ExportRow }[];
  documents: ExportRow[];
}

type Field = readonly [label: string, ...keys: string[]];
const SECTIONS: readonly [string, readonly Field[]][] = [
  ['Personal information', [
    ['First / given name', 'first_name', 'firstName'], ['Family / last name', 'last_name', 'lastName'],
    ['Chinese name', 'chinese_name', 'chineseName'], ['Date of birth', 'date_of_birth', 'student_dob', 'dateOfBirth'],
    ['Gender', 'gender'], ['Nationality', 'nationality', 'applicant_nationality'],
    ['Place of birth', 'place_of_birth', 'placeOfBirth'], ['Marital status', 'marital_status', 'maritalStatus'],
  ]],
  ['Contact information', [
    ['Email', 'email', 'student_email', 'applicant_email'], ['Phone', 'phone', 'student_phone', 'applicant_phone'],
    ['WhatsApp', 'whatsapp'], ['Current address', 'current_address', 'address', 'currentAddress'],
    ['City', 'city'], ['Country of residence', 'country'],
    ['Permanent address', 'permanent_address', 'permanentAddress'], ['Postal code', 'postal_code', 'postalCode'],
  ]],
  ['Passport', [
    ['Passport number', 'passport_number', 'passportNumber'], ['Issue date', 'passport_issue_date', 'passportIssueDate'],
    ['Expiry date', 'passport_expiry_date', 'passport_expiry', 'passportExpiryDate'],
  ]],
  ['Academic background', [
    ['Highest education', 'highest_education', 'highest_degree', 'highestEducation'],
    ['School / institution', 'school_name', 'schoolName'], ['School country', 'school_country', 'schoolCountry'],
    ['Major', 'major'], ['Graduation year', 'graduation_year', 'graduationYear'], ['GPA / grade', 'gpa'], ['Class rank', 'class_rank', 'classRank'],
  ]],
  ['Language qualifications', [
    ['Native language', 'native_language', 'nativeLanguage'], ['English test', 'english_test', 'english_test_type', 'englishTest'],
    ['English score', 'english_score', 'englishScore'], ['IELTS score', 'ieltsScore'], ['TOEFL score', 'toeflScore'],
    ['HSK level', 'hsk_level', 'hskLevel'], ['HSK score', 'hsk_score', 'hskScore'],
  ]],
  ['Study preferences and history', [
    ['Target degree', 'target_degree', 'targetDegree'], ['Target field', 'target_field', 'targetField'],
    ['Target intake', 'target_intake', 'targetIntake'], ['Target university', 'target_university', 'targetUniversity'],
    ['Target program', 'target_program', 'targetProgram'], ['Preferred universities', 'preferred_universities', 'preferredUniversities'],
    ['Previously studied in China', 'has_studied_in_china', 'hasStudiedInChina'],
    ['Previously applied to a Chinese university', 'has_applied_china_uni', 'hasAppliedChinaUni'],
  ]],
  ['Family', [
    ['Father’s name', 'father_name', 'fatherName'], ['Father’s nationality', 'father_nationality', 'fatherNationality'],
    ['Father’s occupation', 'father_occupation', 'fatherOccupation'], ['Father’s phone', 'father_phone', 'fatherPhone'],
    ['Mother’s name', 'mother_name', 'motherName'], ['Mother’s nationality', 'mother_nationality', 'motherNationality'],
    ['Mother’s occupation', 'mother_occupation', 'motherOccupation'], ['Mother’s phone', 'mother_phone', 'motherPhone'],
  ]],
  ['Emergency contact', [
    ['Name', 'emergency_contact_name', 'emergencyContactName'], ['Relationship', 'emergency_contact_relationship', 'emergencyContactRelationship'],
    ['Phone', 'emergency_contact_phone', 'emergencyContactPhone'], ['Email', 'emergency_contact_email', 'emergencyContactEmail'],
  ]],
  ['Funding and sponsor', [
    ['Funding source', 'funding_source', 'fundingSource'], ['Scholarship name', 'scholarship_name', 'scholarshipName'],
    ['Sponsor name', 'sponsor_name', 'sponsorName'], ['Sponsor relationship', 'sponsor_relationship', 'sponsorRelationship'],
    ['Sponsor occupation', 'sponsor_occupation', 'sponsorOccupation'], ['Sponsor phone', 'sponsor_phone', 'sponsorPhone'],
    ['Sponsor email', 'sponsor_email', 'sponsorEmail'], ['Sponsor annual income', 'sponsor_annual_income', 'sponsorAnnualIncome'],
  ]],
];
const LEGACY_EDUCATION: readonly Field[] = [
  ['High school', 'highSchoolName'], ['High-school city', 'highSchoolCity'], ['High-school country', 'highSchoolCountry'],
  ['High-school grade', 'highSchoolGPA'], ['High-school graduation date', 'highSchoolGraduationDate'],
  ['Bachelor’s institution', 'bachelorUniversityName'], ['Bachelor’s city', 'bachelorUniversityCity'], ['Bachelor’s country', 'bachelorUniversityCountry'],
  ['Bachelor’s major', 'bachelorMajor'], ['Bachelor’s grade', 'bachelorGPA'], ['Bachelor’s graduation date', 'bachelorGraduationDate'],
  ['Master’s institution', 'masterUniversityName'], ['Master’s major', 'masterMajor'],
  ['Master’s grade', 'masterGPA'], ['Master’s graduation date', 'masterGraduationDate'],
];
const APPLICATION_FIELDS: readonly Field[] = [
  ['Application number', 'application_number'], ['University', 'university_name', 'university'],
  ['Program', 'program_name', 'program'], ['Degree', 'degree', 'degree_level'], ['Intake', 'intake'], ['Status', 'status'],
  ['Personal statement', 'personal_statement'], ['Why this program', 'why_program'], ['Career plan', 'career_plan'],
];

function present(value: unknown): boolean {
  return typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value)) ||
    (typeof value === 'string' && value.trim() !== '') || (Array.isArray(value) && value.some(present));
}
function value(row: ExportRow, keys: readonly string[]): unknown {
  const extra = row.extra && typeof row.extra === 'object' && !Array.isArray(row.extra) ? row.extra as ExportRow : {};
  for (const source of [row, extra]) for (const key of keys) if (present(source[key])) return source[key];
  return undefined;
}
function plain(input: unknown): string {
  if (Array.isArray(input)) return input.filter(present).map(plain).filter(Boolean).join(', ');
  if (typeof input === 'boolean') return input ? 'Yes' : 'No';
  return typeof input === 'string' || typeof input === 'number' ? String(input).trim() : '';
}
function escape(input: unknown): string {
  return plain(input).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([\\`*_[\]{}()#!|~])/g, '\\$1')
    .replace(/\n/g, '\n  ');
}
function fields(row: ExportRow, definitions: readonly Field[], includeMissing = true): string[] {
  return definitions.flatMap(([label, ...keys]) => {
    const entry = value(row, keys);
    return !present(entry) && !includeMissing ? [] : [`- **${label}:** ${present(entry) ? escape(entry) : 'Not provided'}`];
  });
}
export function studentExportName(row: ExportRow): string {
  const first = plain(value(row, ['first_name', 'firstName']));
  const last = plain(value(row, ['last_name', 'lastName']));
  return [first, last].filter(Boolean).join(' ') || plain(value(row, ['student_name', 'applicant_name']));
}
export function studentMarkdownFilename(row: ExportRow): string {
  const name = studentExportName(row).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 72).replace(/-+$/g, '');
  return `student-info-${name || 'student'}.md`;
}

export function buildStudentMarkdown(data: StudentMarkdownData, exportedAt: string): string {
  const fullName = studentExportName(data.identity) || 'Not provided';
  const lines = [`# Student information: ${escape(fullName)}`, '', `Exported at (UTC): ${exportedAt}`, '',
    'Use the saved details below to complete university application forms. “Not provided” means the value has not been recorded.',
    'Application snapshots are kept separate from the student profile; check any differences before copying.', '',
    `- **Full name:** ${escape(fullName)}`, ''];
  for (const [title, definitions] of SECTIONS) lines.push(`## ${title}`, '', ...fields(data.identity, definitions), '');
  lines.push('## Education history', '');
  if (data.education === null) lines.push('Detailed education history is unavailable. Recorded qualifications are shown under Academic background and Previously saved education details when available.', '');
  for (const [i, row] of (data.education ?? []).entries()) lines.push(`### Qualification ${i + 1}`, '', ...fields(row, [
    ['Institution', 'institution'], ['Country', 'country'], ['Qualification', 'qualification'], ['Subject / major', 'subject'],
    ['Start date', 'start_date'], ['End / graduation date', 'end_date'], ['Currently studying', 'is_current'],
    ['Grade', 'grade'], ['Grading scale', 'grading_scale'],
  ]), '');
  const legacy = fields(data.identity, LEGACY_EDUCATION, false);
  if (legacy.length) lines.push('### Previously saved education details', '', ...legacy, '');
  if (data.education !== null && !data.education.length && !legacy.length) lines.push('Not provided.', '');
  lines.push('## Applications', '');
  if (!data.applications.length) lines.push('No current applications recorded.', '');
  for (const [i, { surface, record }] of data.applications.entries()) {
    lines.push(`### Application ${i + 1} (${surface === 'partner' ? 'partner' : 'student'})`, '', ...fields(record, APPLICATION_FIELDS), '');
    const name = studentExportName(record);
    if (name) lines.push(`- **Applicant name on application:** ${escape(name)}`, '');
    for (const [title, definitions] of SECTIONS) {
      const entries = fields(record, definitions, false);
      if (entries.length) lines.push(`#### ${title} saved on this application`, '', ...entries, '');
    }
  }
  lines.push('## Document checklist', '', 'Upload the original documents separately. This file lists saved document details; it does not contain the attachments.', '');
  if (!data.documents.length) lines.push('No documents recorded.', '');
  for (const [i, row] of data.documents.entries()) lines.push(`### Document ${i + 1}`, '', ...fields(row, [
    ['Name', 'name'], ['Category', 'category'], ['Filename', 'file_name'], ['Status', 'status'],
  ]), '');
  return lines.join('\n');
}

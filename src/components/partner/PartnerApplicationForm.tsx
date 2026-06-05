'use client';

import {
  ArrowLeft,
  Save,
  User,
  IdCard,
  Phone,
  GraduationCap,
  Languages,
  Building2,
  FileText,
  Wallet,
  ListChecks,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  PARTNER_APPLICATION_DEGREES,
  PARTNER_APPLICATION_STATUSES,
  PARTNER_APPLICATION_DECISIONS,
  PARTNER_APPLICATION_PRIORITIES,
  GENDERS,
  MARITAL_STATUSES,
  HIGHEST_EDUCATIONS,
  ENGLISH_TESTS,
  HSK_LEVELS,
  FUNDING_SOURCES,
  EMERGENCY_RELATIONSHIPS,
  PartnerApplicationStatus,
  PartnerApplicationDecision,
  PartnerApplicationPriority,
  PartnerApplicationDegree,
  Gender,
  MaritalStatus,
  HighestEducation,
  EnglishTest,
  HskLevel,
  FundingSource,
  EmergencyRelationship,
} from '@/lib/partner-application-mapper';
import { getIntendedIntakes, type University, type Program } from '@/lib/data';

// ----- form state ---------------------------------------------------------

// S26: '' means "not set" for the closed-set string unions. The mapper
// strips empty strings to null on POST. The same FormData shape is
// used by both the new + edit pages — the edit page just pre-fills it
// from the loaded record.

type Emptyable<T extends string> = '' | T;

export interface PartnerApplicationFormData {
  // Section 1 — Student & Identity
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  nationality: string;
  dateOfBirth: string;
  gender: Emptyable<Gender>;
  maritalStatus: Emptyable<MaritalStatus>;
  placeOfBirth: string;
  currentAddress: string;

  // Section 2 — Passport
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;

  // Section 3 — Emergency contact
  emergencyContactName: string;
  emergencyContactRelationship: Emptyable<EmergencyRelationship>;
  emergencyContactPhone: string;
  emergencyContactEmail: string;

  // Section 4 — Academic background
  highestEducation: Emptyable<HighestEducation>;
  schoolName: string;
  schoolCountry: string;
  major: string;
  graduationYear: string;
  gpa: string;
  classRank: string;

  // Section 5 — Language proficiency
  nativeLanguage: string;
  englishTest: Emptyable<EnglishTest>;
  englishScore: string;
  hskLevel: Emptyable<HskLevel>;
  hskScore: string;

  // Section 6 — Program & Application
  university: string;
  program: string;
  intake: string;
  degree: Emptyable<PartnerApplicationDegree>;
  hasStudiedInChina: boolean;
  hasAppliedChinaUni: boolean;

  // Section 7 — Funding
  fundingSource: Emptyable<FundingSource>;
  scholarshipName: string;

  // Section 8 — Personal statement
  whyProgram: string;
  careerPlan: string;

  // Section 9 — Workflow
  priority: PartnerApplicationPriority;
  status: PartnerApplicationStatus;
  decision: PartnerApplicationDecision;
  notes: string;

  // Edit-page-only bookkeeping
  applicationNumber: string;
  submittedAt: string | null;
}

export const INITIAL_FORM_DATA: PartnerApplicationFormData = {
  studentName: '',
  studentEmail: '',
  studentPhone: '',
  nationality: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  placeOfBirth: '',
  currentAddress: '',

  passportNumber: '',
  passportIssueDate: '',
  passportExpiryDate: '',

  emergencyContactName: '',
  emergencyContactRelationship: '',
  emergencyContactPhone: '',
  emergencyContactEmail: '',

  highestEducation: '',
  schoolName: '',
  schoolCountry: '',
  major: '',
  graduationYear: '',
  gpa: '',
  classRank: '',

  nativeLanguage: '',
  englishTest: '',
  englishScore: '',
  hskLevel: '',
  hskScore: '',

  university: '',
  program: '',
  intake: '',
  degree: '',
  hasStudiedInChina: false,
  hasAppliedChinaUni: false,

  fundingSource: '',
  scholarshipName: '',

  whyProgram: '',
  careerPlan: '',

  priority: 'Normal',
  status: 'Draft',
  decision: 'Pending',
  notes: '',

  applicationNumber: '',
  submittedAt: null,
};

/**
 * FormSection — collapsible card with a header, description, and icon.
 * Used to break the partner application form into 9 clear sections.
 */
function FormSection({
  title,
  description,
  icon: Icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border border-gray-200 bg-white">
      <summary className="cursor-pointer select-none flex items-center gap-3 px-5 py-3 hover:bg-gray-50 list-none">
        {Icon && <Icon className="h-5 w-5 text-[#1B2A4A] flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-[#1B2A4A] leading-tight">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <span
          aria-hidden
          className="text-[#1B2A4A] text-xl leading-none group-open:rotate-90 transition-transform"
        >
          ›
        </span>
      </summary>
      <div className="px-5 pb-5 pt-2 border-t border-gray-200">{children}</div>
    </details>
  );
}

const NONE = '__none__';
const NONE_DISPLAY = '(unspecified)';

export interface PartnerApplicationFormProps {
  formData: PartnerApplicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<PartnerApplicationFormData>>;
  universities: University[];
  programs: Program[];
  dataLoading: boolean;
  isSaving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  /** "Create" or "Save Changes" — the submit button label. */
  submitLabel: string;
  /** "Cancel" link target. */
  cancelHref: string;
  /** Whether the submit button is at the top of the page (default)
   *  or sticky at the bottom. Edit page uses default; new page uses
   *  sticky. */
  stickySubmit?: boolean;
}

/**
 * PartnerApplicationForm — the shared 9-section form used by both
 * the partner new-app page and the partner edit-app page. The
 * form-data shape + field set are identical between the two
 * surfaces; the only differences are the submit label and the
 * pre-fill state.
 */
export function PartnerApplicationForm({
  formData,
  setFormData,
  universities,
  programs,
  dataLoading,
  isSaving,
  onSubmit,
  submitLabel,
  cancelHref,
  stickySubmit = false,
}: PartnerApplicationFormProps) {
  // S26: small typed setter so the per-field change handler doesn't
  // have to repeat the "name is one of the form keys" type assertion.
  const set = <K extends keyof PartnerApplicationFormData>(
    key: K,
    value: PartnerApplicationFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // S26: list of intake options, generated at runtime from the
  // current date. Same helper the student wizard uses.
  const intakeOptions = getIntendedIntakes();

  const formContent = (
    <div className="space-y-4">
      {/* Section 1 — Student & Identity */}
      <FormSection
        title="Student & Identity"
        description="Basic contact + personal info. Chinese universities ask for DOB, gender, and home-country address on every form."
        icon={User}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="studentName" className="text-[#1B2A4A] mb-2 block">
              Full Name (as on passport) <span className="text-red-600">*</span>
            </Label>
            <Input
              id="studentName"
              value={formData.studentName}
              onChange={(e) => set('studentName', e.target.value)}
              required
              className="rounded-none"
              placeholder="Last, First Middle"
            />
          </div>
          <div>
            <Label htmlFor="studentEmail" className="text-[#1B2A4A] mb-2 block">
              Email
            </Label>
            <Input
              id="studentEmail"
              type="email"
              value={formData.studentEmail}
              onChange={(e) => set('studentEmail', e.target.value)}
              className="rounded-none"
              placeholder="student@example.com"
            />
          </div>
          <div>
            <Label htmlFor="studentPhone" className="text-[#1B2A4A] mb-2 block">
              Phone (with country code)
            </Label>
            <Input
              id="studentPhone"
              type="tel"
              value={formData.studentPhone}
              onChange={(e) => set('studentPhone', e.target.value)}
              className="rounded-none"
              placeholder="+234 803 000 0000"
            />
          </div>
          <div>
            <Label htmlFor="nationality" className="text-[#1B2A4A] mb-2 block">
              Nationality
            </Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => set('nationality', e.target.value)}
              className="rounded-none"
              placeholder="e.g., Nigeria, Brazil, Vietnam"
            />
          </div>
          <div>
            <Label htmlFor="dateOfBirth" className="text-[#1B2A4A] mb-2 block">
              Date of Birth
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => set('dateOfBirth', e.target.value)}
              className="rounded-none"
            />
          </div>
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">Gender</Label>
            <Select
              value={formData.gender || NONE}
              onValueChange={(v) => set('gender', v === NONE ? '' : (v as Gender))}
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={NONE_DISPLAY} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{NONE_DISPLAY}</SelectItem>
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">Marital Status</Label>
            <Select
              value={formData.maritalStatus || NONE}
              onValueChange={(v) =>
                set('maritalStatus', v === NONE ? '' : (v as MaritalStatus))
              }
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={NONE_DISPLAY} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{NONE_DISPLAY}</SelectItem>
                {MARITAL_STATUSES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="placeOfBirth" className="text-[#1B2A4A] mb-2 block">
              Place of Birth
            </Label>
            <Input
              id="placeOfBirth"
              value={formData.placeOfBirth}
              onChange={(e) => set('placeOfBirth', e.target.value)}
              className="rounded-none"
              placeholder="e.g., Lagos, Nigeria"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="currentAddress" className="text-[#1B2A4A] mb-2 block">
              Current Home-Country Address
            </Label>
            <Textarea
              id="currentAddress"
              value={formData.currentAddress}
              onChange={(e) => set('currentAddress', e.target.value)}
              rows={2}
              className="rounded-none"
              placeholder="Street, city, state, postal code, country"
            />
          </div>
        </div>
      </FormSection>

      {/* Section 2 — Passport */}
      <FormSection
        title="Passport"
        description="Needed for the visa application. Expiry must be > 6 months past the study-end date."
        icon={IdCard}
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="passportNumber" className="text-[#1B2A4A] mb-2 block">
              Passport Number
            </Label>
            <Input
              id="passportNumber"
              value={formData.passportNumber}
              onChange={(e) => set('passportNumber', e.target.value)}
              className="rounded-none"
              placeholder="As printed on the bio page"
            />
          </div>
          <div />
          <div>
            <Label htmlFor="passportIssueDate" className="text-[#1B2A4A] mb-2 block">
              Issue Date
            </Label>
            <Input
              id="passportIssueDate"
              type="date"
              value={formData.passportIssueDate}
              onChange={(e) => set('passportIssueDate', e.target.value)}
              className="rounded-none"
            />
          </div>
          <div>
            <Label htmlFor="passportExpiryDate" className="text-[#1B2A4A] mb-2 block">
              Expiry Date
            </Label>
            <Input
              id="passportExpiryDate"
              type="date"
              value={formData.passportExpiryDate}
              onChange={(e) => set('passportExpiryDate', e.target.value)}
              className="rounded-none"
            />
          </div>
        </div>
      </FormSection>

      {/* Section 3 — Emergency contact */}
      <FormSection
        title="Emergency Contact"
        description="Required on every Chinese university application form."
        icon={Phone}
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergencyContactName" className="text-[#1B2A4A] mb-2 block">
              Full Name
            </Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => set('emergencyContactName', e.target.value)}
              className="rounded-none"
              placeholder="Father, mother, spouse, etc."
            />
          </div>
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">Relationship</Label>
            <Select
              value={formData.emergencyContactRelationship || NONE}
              onValueChange={(v) =>
                set(
                  'emergencyContactRelationship',
                  v === NONE ? '' : (v as EmergencyRelationship),
                )
              }
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={NONE_DISPLAY} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{NONE_DISPLAY}</SelectItem>
                {EMERGENCY_RELATIONSHIPS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="emergencyContactPhone" className="text-[#1B2A4A] mb-2 block">
              Phone (with country code)
            </Label>
            <Input
              id="emergencyContactPhone"
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={(e) => set('emergencyContactPhone', e.target.value)}
              className="rounded-none"
              placeholder="+234 803 000 0000"
            />
          </div>
          <div>
            <Label htmlFor="emergencyContactEmail" className="text-[#1B2A4A] mb-2 block">
              Email (optional)
            </Label>
            <Input
              id="emergencyContactEmail"
              type="email"
              value={formData.emergencyContactEmail}
              onChange={(e) => set('emergencyContactEmail', e.target.value)}
              className="rounded-none"
              placeholder="contact@example.com"
            />
          </div>
        </div>
      </FormSection>

      {/* Section 4 — Academic background */}
      <FormSection
        title="Academic Background"
        description="The student's most recent school + grades. Chinese unis require this for every application."
        icon={GraduationCap}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">
              Highest Education Completed
            </Label>
            <Select
              value={formData.highestEducation || NONE}
              onValueChange={(v) =>
                set('highestEducation', v === NONE ? '' : (v as HighestEducation))
              }
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={NONE_DISPLAY} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{NONE_DISPLAY}</SelectItem>
                {HIGHEST_EDUCATIONS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="graduationYear" className="text-[#1B2A4A] mb-2 block">
              Graduation Year
            </Label>
            <Input
              id="graduationYear"
              type="number"
              inputMode="numeric"
              min={1950}
              max={2100}
              value={formData.graduationYear}
              onChange={(e) => set('graduationYear', e.target.value)}
              className="rounded-none"
              placeholder="e.g., 2024"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="schoolName" className="text-[#1B2A4A] mb-2 block">
              School Name
            </Label>
            <Input
              id="schoolName"
              value={formData.schoolName}
              onChange={(e) => set('schoolName', e.target.value)}
              className="rounded-none"
              placeholder="e.g., University of Lagos"
            />
          </div>
          <div>
            <Label htmlFor="schoolCountry" className="text-[#1B2A4A] mb-2 block">
              School Country
            </Label>
            <Input
              id="schoolCountry"
              value={formData.schoolCountry}
              onChange={(e) => set('schoolCountry', e.target.value)}
              className="rounded-none"
              placeholder="e.g., Nigeria"
            />
          </div>
          <div>
            <Label htmlFor="major" className="text-[#1B2A4A] mb-2 block">
              Major / Field of Study
            </Label>
            <Input
              id="major"
              value={formData.major}
              onChange={(e) => set('major', e.target.value)}
              className="rounded-none"
              placeholder="e.g., Computer Science"
            />
          </div>
          <div>
            <Label htmlFor="gpa" className="text-[#1B2A4A] mb-2 block">
              GPA
            </Label>
            <Input
              id="gpa"
              value={formData.gpa}
              onChange={(e) => set('gpa', e.target.value)}
              className="rounded-none"
              placeholder="e.g., 3.85/4.0 or 85% — write whatever the transcript says"
            />
          </div>
          <div>
            <Label htmlFor="classRank" className="text-[#1B2A4A] mb-2 block">
              Class Rank (optional)
            </Label>
            <Input
              id="classRank"
              value={formData.classRank}
              onChange={(e) => set('classRank', e.target.value)}
              className="rounded-none"
              placeholder="e.g., Top 10% or 5/120"
            />
          </div>
        </div>
      </FormSection>

      {/* Section 5 — Language proficiency */}
      <FormSection
        title="Language Proficiency"
        description="English for English-taught programs; HSK for Chinese-taught programs. Both are usually required."
        icon={Languages}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nativeLanguage" className="text-[#1B2A4A] mb-2 block">
              Native Language
            </Label>
            <Input
              id="nativeLanguage"
              value={formData.nativeLanguage}
              onChange={(e) => set('nativeLanguage', e.target.value)}
              className="rounded-none"
              placeholder="e.g., Yoruba, Vietnamese, Portuguese"
            />
          </div>
          <div />
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">English Test</Label>
            <Select
              value={formData.englishTest || NONE}
              onValueChange={(v) =>
                set('englishTest', v === NONE ? '' : (v as EnglishTest))
              }
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={NONE_DISPLAY} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{NONE_DISPLAY}</SelectItem>
                {ENGLISH_TESTS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="englishScore" className="text-[#1B2A4A] mb-2 block">
              English Score
            </Label>
            <Input
              id="englishScore"
              value={formData.englishScore}
              onChange={(e) => set('englishScore', e.target.value)}
              className="rounded-none"
              placeholder="e.g., 7.5 (IELTS) or 100 (TOEFL)"
              disabled={formData.englishTest === '' || formData.englishTest === 'None'}
            />
          </div>
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">HSK Level</Label>
            <Select
              value={formData.hskLevel || NONE}
              onValueChange={(v) =>
                set('hskLevel', v === NONE ? '' : (v as HskLevel))
              }
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={NONE_DISPLAY} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{NONE_DISPLAY}</SelectItem>
                {HSK_LEVELS.filter((l) => l !== 'None').map((l) => (
                  <SelectItem key={l} value={l}>
                    HSK {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="hskScore" className="text-[#1B2A4A] mb-2 block">
              HSK Score
            </Label>
            <Input
              id="hskScore"
              value={formData.hskScore}
              onChange={(e) => set('hskScore', e.target.value)}
              className="rounded-none"
              placeholder="e.g., 220"
              disabled={formData.hskLevel === '' || formData.hskLevel === 'None'}
            />
          </div>
        </div>
      </FormSection>

      {/* Section 6 — Program & Application */}
      <FormSection
        title="Program & Application"
        description="The university + program the student is applying to. Type to search by program or university name."
        icon={Building2}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="program" className="text-[#1B2A4A] mb-2 block">
              Program <span className="text-red-600">*</span>
            </Label>
            <SearchableSelect
              value={formData.program}
              onChange={(value) => {
                const picked = programs.find((p) => p.slug === value);
                if (!picked) return;
                const uni = universities.find(
                  (u) => u.slug === picked.universitySlug,
                );
                setFormData((prev) => ({
                  ...prev,
                  program: picked.name,
                  university: uni?.name ?? picked.universitySlug,
                }));
              }}
              options={programs.map((program) => {
                const uni = universities.find(
                  (u) => u.slug === program.universitySlug,
                );
                return {
                  value: program.slug,
                  label: program.name,
                  sublabel: uni
                    ? `at ${uni.name} · ${program.degree} · ${program.language}`
                    : `${program.degree} · ${program.language}`,
                  logo: uni?.logo || undefined,
                };
              })}
              placeholder={
                dataLoading
                  ? 'Loading programs…'
                  : 'Type to search by program OR university…'
              }
              emptyText="No programs match"
              searchPlaceholder="Search by program, school, or language…"
              disabled={dataLoading}
              loading={dataLoading}
            />
          </div>
          <div>
            <Label htmlFor="university" className="text-[#1B2A4A] mb-2 block">
              University <span className="text-red-600">*</span>
            </Label>
            <Input
              id="university"
              value={formData.university}
              onChange={(e) => set('university', e.target.value)}
              className="rounded-none bg-gray-50"
              placeholder="Auto-filled when you pick a program"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Editable in case the program references a school we don't have in
              the catalogue yet.
            </p>
          </div>
          <div>
            <Label htmlFor="degree" className="text-[#1B2A4A] mb-2 block">
              Degree Level
            </Label>
            <Select
              value={formData.degree || NONE}
              onValueChange={(v) =>
                set('degree', v === NONE ? '' : (v as PartnerApplicationDegree))
              }
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={NONE_DISPLAY} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{NONE_DISPLAY}</SelectItem>
                {PARTNER_APPLICATION_DEGREES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="intake" className="text-[#1B2A4A] mb-2 block">
              Intended Intake
            </Label>
            <Select
              value={formData.intake || NONE}
              onValueChange={(v) => set('intake', v === NONE ? '' : v)}
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={NONE_DISPLAY} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{NONE_DISPLAY}</SelectItem>
                {intakeOptions.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex flex-col gap-3 pt-2">
            <label className="flex items-start gap-2 cursor-pointer text-sm">
              <Checkbox
                checked={formData.hasStudiedInChina}
                onCheckedChange={(v) => set('hasStudiedInChina', v === true)}
                className="rounded-none mt-0.5"
              />
              <span>
                The student has previously studied in China.
                <span className="block text-xs text-gray-500">
                  Affects the visa category and may require a release letter
                  from the previous school.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer text-sm">
              <Checkbox
                checked={formData.hasAppliedChinaUni}
                onCheckedChange={(v) => set('hasAppliedChinaUni', v === true)}
                className="rounded-none mt-0.5"
              />
              <span>
                The student has previously applied to a Chinese university.
                <span className="block text-xs text-gray-500">
                  Repeat applicants may need a different document set.
                </span>
              </span>
            </label>
          </div>
        </div>
      </FormSection>

      {/* Section 7 — Funding */}
      <FormSection
        title="Funding"
        description="Required for the visa application. Pick the source closest to the student's reality."
        icon={Wallet}
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">Source of Funding</Label>
            <Select
              value={formData.fundingSource || NONE}
              onValueChange={(v) =>
                set('fundingSource', v === NONE ? '' : (v as FundingSource))
              }
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={NONE_DISPLAY} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{NONE_DISPLAY}</SelectItem>
                {FUNDING_SOURCES.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="scholarshipName" className="text-[#1B2A4A] mb-2 block">
              Scholarship / Sponsor Name
            </Label>
            <Input
              id="scholarshipName"
              value={formData.scholarshipName}
              onChange={(e) => set('scholarshipName', e.target.value)}
              className="rounded-none"
              placeholder="e.g., Chinese Government Scholarship — Bilateral Program"
              disabled={
                formData.fundingSource === '' ||
                (formData.fundingSource !== 'Scholarship' &&
                  formData.fundingSource !== 'Sponsor' &&
                  formData.fundingSource !== 'Government')
              }
            />
          </div>
        </div>
      </FormSection>

      {/* Section 8 — Personal statement */}
      <FormSection
        title="Personal Statement"
        description="Most Chinese unis ask for at least a 'why this program' paragraph. Some (especially Master's / PhD) also want a career plan."
        icon={FileText}
        defaultOpen={false}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="whyProgram" className="text-[#1B2A4A] mb-2 block">
              Why this program?
            </Label>
            <Textarea
              id="whyProgram"
              value={formData.whyProgram}
              onChange={(e) => set('whyProgram', e.target.value)}
              rows={5}
              className="rounded-none"
              placeholder="1–2 paragraphs. Why this university, why this program, what the student hopes to learn."
            />
          </div>
          <div>
            <Label htmlFor="careerPlan" className="text-[#1B2A4A] mb-2 block">
              Post-graduation plan
            </Label>
            <Textarea
              id="careerPlan"
              value={formData.careerPlan}
              onChange={(e) => set('careerPlan', e.target.value)}
              rows={4}
              className="rounded-none"
              placeholder="What the student plans to do after graduating. Some unis want this in writing."
            />
          </div>
        </div>
      </FormSection>

      {/* Section 9 — Workflow */}
      <FormSection
        title="Workflow"
        description="Internal pipeline status. The student never sees these."
        icon={ListChecks}
        defaultOpen={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(v) =>
                set('priority', v as PartnerApplicationPriority)
              }
            >
              <SelectTrigger className="rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PARTNER_APPLICATION_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) =>
                set('status', v as PartnerApplicationStatus)
              }
            >
              <SelectTrigger className="rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PARTNER_APPLICATION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">Decision</Label>
            <Select
              value={formData.decision}
              onValueChange={(v) =>
                set('decision', v as PartnerApplicationDecision)
              }
            >
              <SelectTrigger className="rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PARTNER_APPLICATION_DECISIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="notes" className="text-[#1B2A4A] mb-2 block">
            Internal Notes
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={4}
            className="rounded-none"
            placeholder="Free-form context, follow-up steps, partner-side admin notes. Not shown to the student."
          />
        </div>
      </FormSection>
    </div>
  );

  // S26: when sticky, the submit bar is fixed at the bottom of the
  // page so the partner can submit without scrolling. When not
  // sticky (edit page), the bar sits at the end of the form like a
  // normal page.
  if (stickySubmit) {
    return (
      <>
        <form onSubmit={onSubmit}>{formContent}</form>
        <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 px-4 py-3 flex items-center justify-between z-10 mt-6">
          <a href={cancelHref}>
            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              disabled={isSaving}
            >
              Cancel
            </Button>
          </a>
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={isSaving}
            className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? `${submitLabel}…` : submitLabel}
          </Button>
        </div>
      </>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {formContent}
      <div className="flex items-center justify-between pt-2">
        <a href={cancelHref}>
          <Button
            type="button"
            variant="outline"
            className="rounded-none"
            disabled={isSaving}
          >
            Cancel
          </Button>
        </a>
        <Button
          type="submit"
          disabled={isSaving}
          className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? `${submitLabel}…` : submitLabel}
        </Button>
      </div>
    </form>
  );
}

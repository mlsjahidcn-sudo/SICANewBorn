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
  PARTNER_APPLICATION_PRIORITIES,
  GENDERS,
  MARITAL_STATUSES,
  HIGHEST_EDUCATIONS,
  ENGLISH_TESTS,
  HSK_LEVELS,
  FUNDING_SOURCES,
  EMERGENCY_RELATIONSHIPS,
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
import { useI18n } from '@/lib/i18n';

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
  // S27: status and decision are admin-only — the partner can never
  // change them. They live in the partner_applications row (set by
  // SICA's admin team) and shown on the detail page, but the
  // partner's edit form doesn't surface them as controls.
  priority: PartnerApplicationPriority;
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

export interface PartnerApplicationFormProps {
  formData: PartnerApplicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<PartnerApplicationFormData>>;
  universidades: University[];
  programs: Program[];
  dataLoading: boolean;
  isSaving: boolean;
  // Phase 1.6: per-field error map. Each key is a form field
  // name; the value is the human error message. The form
  // renders the error inline below the field (red text) and
  // adds a red border to the input. Empty object = no errors.
  fieldErrors?: Record<string, string>;
  // Label for the primary submit button (e.g. "Submit
  // Application" for the new page, "Save Changes" for the
  // edit page). The form suffixes "…" while saving.
  submitLabel: string;
  // Href for the cancel/back link in the bottom bar.
  cancelHref: string;
  /** Whether the submit button is at the top of the page (default)
   *  or sticky at the bottom. Edit page uses default; new page uses
   *  sticky. */
  stickySubmit?: boolean;
  onSubmit: (e: React.FormEvent) => void;
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
  universidades,
  programs,
  dataLoading,
  isSaving,
  fieldErrors = {},
  submitLabel,
  cancelHref,
  stickySubmit = false,
  onSubmit,
}: PartnerApplicationFormProps) {
  const { t } = useI18n();
  const noneDisplay = t('partnerAppForm.noneDisplay');
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
        title={t('partnerAppForm.section1Title')}
        description={t('partnerAppForm.section1Desc')}
        icon={User}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="studentName" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldFullName')} <span className="text-red-600">{t('partnerCommon.requiredAsterisk')}</span>
            </Label>
            <Input
              id="studentName"
              name="studentName"
              value={formData.studentName}
              onChange={(e) => set('studentName', e.target.value)}
              required
              className={`rounded-none ${fieldErrors.studentName ? 'border-red-500' : ''}`}
              placeholder={t('partnerAppForm.fieldFullNamePlaceholder')}
            />
            {fieldErrors.studentName && (
              <p className="text-xs text-red-700 mt-1">{fieldErrors.studentName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="studentEmail" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldEmail')}
            </Label>
            <Input
              id="studentEmail"
              type="email"
              value={formData.studentEmail}
              onChange={(e) => set('studentEmail', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldEmailPlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor="studentPhone" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldPhone')}
            </Label>
            <Input
              id="studentPhone"
              type="tel"
              value={formData.studentPhone}
              onChange={(e) => set('studentPhone', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldPhonePlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor="nationality" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldNationality')}
            </Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => set('nationality', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldNationalityPlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor="dateOfBirth" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldDateOfBirth')}
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
            <Label className="text-[#1B2A4A] mb-2 block">{t('partnerAppForm.fieldGender')}</Label>
            <Select
              value={formData.gender || NONE}
              onValueChange={(v) => set('gender', v === NONE ? '' : (v as Gender))}
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={noneDisplay} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{noneDisplay}</SelectItem>
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">{t('partnerAppForm.fieldMaritalStatus')}</Label>
            <Select
              value={formData.maritalStatus || NONE}
              onValueChange={(v) =>
                set('maritalStatus', v === NONE ? '' : (v as MaritalStatus))
              }
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={noneDisplay} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{noneDisplay}</SelectItem>
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
              {t('partnerAppForm.fieldPlaceOfBirth')}
            </Label>
            <Input
              id="placeOfBirth"
              value={formData.placeOfBirth}
              onChange={(e) => set('placeOfBirth', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldPlaceOfBirthPlaceholder')}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="currentAddress" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldCurrentAddress')}
            </Label>
            <Textarea
              id="currentAddress"
              value={formData.currentAddress}
              onChange={(e) => set('currentAddress', e.target.value)}
              rows={2}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldCurrentAddressPlaceholder')}
            />
          </div>
        </div>
      </FormSection>

      {/* Section 2 — Passport */}
      <FormSection
        title={t('partnerAppForm.section2Title')}
        description={t('partnerAppForm.section2Desc')}
        icon={IdCard}
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="passportNumber" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldPassportNumber')}
            </Label>
            <Input
              id="passportNumber"
              value={formData.passportNumber}
              onChange={(e) => set('passportNumber', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldPassportNumberPlaceholder')}
            />
          </div>
          <div />
          <div>
            <Label htmlFor="passportIssueDate" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldPassportIssueDate')}
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
              {t('partnerAppForm.fieldPassportExpiryDate')}
            </Label>
            <Input
              id="passportExpiryDate"
              name="passportExpiryDate"
              type="date"
              value={formData.passportExpiryDate}
              className={`rounded-none ${fieldErrors.passportExpiryDate ? 'border-red-500' : ''}`}
              onChange={(e) => set('passportExpiryDate', e.target.value)}
            />
            {fieldErrors.passportExpiryDate && (
              <p className="text-xs text-red-700 mt-1">{fieldErrors.passportExpiryDate}</p>
            )}
          </div>
        </div>
      </FormSection>

      {/* Section 3 — Emergency contact */}
      <FormSection
        title={t('partnerAppForm.section3Title')}
        description={t('partnerAppForm.section3Desc')}
        icon={Phone}
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergencyContactName" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldEmergencyName')}
            </Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => set('emergencyContactName', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldEmergencyNamePlaceholder')}
            />
          </div>
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">{t('partnerAppForm.fieldEmergencyRelationship')}</Label>
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
                <SelectValue placeholder={noneDisplay} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{noneDisplay}</SelectItem>
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
              {t('partnerAppForm.fieldEmergencyPhone')}
            </Label>
            <Input
              id="emergencyContactPhone"
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={(e) => set('emergencyContactPhone', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldEmergencyPhonePlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor="emergencyContactEmail" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldEmergencyEmail')}
            </Label>
            <Input
              id="emergencyContactEmail"
              type="email"
              value={formData.emergencyContactEmail}
              onChange={(e) => set('emergencyContactEmail', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldEmergencyEmailPlaceholder')}
            />
          </div>
        </div>
      </FormSection>

      {/* Section 4 — Academic background */}
      <FormSection
        title={t('partnerAppForm.section4Title')}
        description={t('partnerAppForm.section4Desc')}
        icon={GraduationCap}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldHighestEducation')}
            </Label>
            <Select
              value={formData.highestEducation || NONE}
              onValueChange={(v) =>
                set('highestEducation', v === NONE ? '' : (v as HighestEducation))
              }
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={noneDisplay} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{noneDisplay}</SelectItem>
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
              {t('partnerAppForm.fieldGraduationYear')}
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
              placeholder={t('partnerAppForm.fieldGraduationYearPlaceholder')}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="schoolName" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldSchoolName')}
            </Label>
            <Input
              id="schoolName"
              value={formData.schoolName}
              onChange={(e) => set('schoolName', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldSchoolNamePlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor="schoolCountry" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldSchoolCountry')}
            </Label>
            <Input
              id="schoolCountry"
              value={formData.schoolCountry}
              onChange={(e) => set('schoolCountry', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldSchoolCountryPlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor="major" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldMajor')}
            </Label>
            <Input
              id="major"
              value={formData.major}
              onChange={(e) => set('major', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldMajorPlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor="gpa" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldGPA')}
            </Label>
            <Input
              id="gpa"
              value={formData.gpa}
              onChange={(e) => set('gpa', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldGPAPlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor="classRank" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldClassRank')}
            </Label>
            <Input
              id="classRank"
              value={formData.classRank}
              onChange={(e) => set('classRank', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldClassRankPlaceholder')}
            />
          </div>
        </div>
      </FormSection>

      {/* Section 5 — Language proficiency */}
      <FormSection
        title={t('partnerAppForm.section5Title')}
        description={t('partnerAppForm.section5Desc')}
        icon={Languages}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nativeLanguage" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldNativeLanguage')}
            </Label>
            <Input
              id="nativeLanguage"
              value={formData.nativeLanguage}
              onChange={(e) => set('nativeLanguage', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldNativeLanguagePlaceholder')}
            />
          </div>
          <div />
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">{t('partnerAppForm.fieldEnglishTest')}</Label>
            <Select
              value={formData.englishTest || NONE}
              onValueChange={(v) =>
                set('englishTest', v === NONE ? '' : (v as EnglishTest))
              }
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={noneDisplay} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{noneDisplay}</SelectItem>
                {ENGLISH_TESTS.map((tt) => (
                  <SelectItem key={tt} value={tt}>
                    {tt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="englishScore" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldEnglishScore')}
            </Label>
            <Input
              id="englishScore"
              value={formData.englishScore}
              onChange={(e) => set('englishScore', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldEnglishScorePlaceholder')}
              disabled={formData.englishTest === '' || formData.englishTest === 'None'}
            />
          </div>
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">{t('partnerAppForm.fieldHskLevel')}</Label>
            <Select
              value={formData.hskLevel || NONE}
              onValueChange={(v) =>
                set('hskLevel', v === NONE ? '' : (v as HskLevel))
              }
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={noneDisplay} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{noneDisplay}</SelectItem>
                {HSK_LEVELS.filter((l) => l !== 'None').map((l) => (
                  <SelectItem key={l} value={l}>
                    {t('partnerAppForm.hskPrefix')}{l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="hskScore" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldHskScore')}
            </Label>
            <Input
              id="hskScore"
              value={formData.hskScore}
              onChange={(e) => set('hskScore', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldHskScorePlaceholder')}
              disabled={formData.hskLevel === '' || formData.hskLevel === 'None'}
            />
          </div>
        </div>
      </FormSection>

      {/* Section 6 — Program & Application */}
      <FormSection
        title={t('partnerAppForm.section6Title')}
        description={t('partnerAppForm.section6Desc')}
        icon={Building2}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="program" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldProgram')} <span className="text-red-600">{t('partnerCommon.requiredAsterisk')}</span>
            </Label>
            <SearchableSelect
              value={formData.program}
              onChange={(value) => {
                const picked = programs.find((p) => p.slug === value);
                if (!picked) return;
                const uni = universidades.find(
                  (u) => u.slug === picked.universitySlug,
                );
                setFormData((prev) => ({
                  ...prev,
                  program: picked.name,
                  university: uni?.name ?? picked.universitySlug,
                }));
              }}
              options={programs.map((program) => {
                const uni = universidades.find(
                  (u) => u.slug === program.universitySlug,
                );
                return {
                  value: program.slug,
                  label: program.name,
                  sublabel: uni
                    ? `${t('partnerAppForm.programSublabelAt', { name: uni.name })} · ${program.degree} · ${program.language}`
                    : `${program.degree} · ${program.language}`,
                  logo: uni?.logo || undefined,
                };
              })}
              placeholder={
                dataLoading
                  ? t('partnerAppForm.programLoadingPlaceholder')
                  : t('partnerAppForm.programSearchPrompt')
              }
              emptyText={t('partnerAppForm.programEmptyText')}
              searchPlaceholder={t('partnerAppForm.programSearchPlaceholder')}
              disabled={dataLoading}
              loading={dataLoading}
            />
            {fieldErrors.program && (
              <p className="text-xs text-red-700 mt-1">{fieldErrors.program}</p>
            )}
          </div>
          <div>
            <Label htmlFor="university" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldUniversity')} <span className="text-red-600">{t('partnerCommon.requiredAsterisk')}</span>
            </Label>
            <Input
              id="university"
              name="university"
              value={formData.university}
              onChange={(e) => set('university', e.target.value)}
              className={`rounded-none bg-gray-50 ${fieldErrors.university ? 'border-red-500' : ''}`}
              placeholder={t('partnerAppForm.fieldUniversityPlaceholder')}
              required
            />
            {fieldErrors.university && (
              <p className="text-xs text-red-700 mt-1">{fieldErrors.university}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {t('partnerAppForm.fieldUniversityHint')}
            </p>
          </div>
          <div>
            <Label htmlFor="degree" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldDegreeLevel')}
            </Label>
            <Select
              value={formData.degree || NONE}
              onValueChange={(v) =>
                set('degree', v === NONE ? '' : (v as PartnerApplicationDegree))
              }
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={noneDisplay} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{noneDisplay}</SelectItem>
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
              {t('partnerAppForm.fieldIntendedIntake')}
            </Label>
            <Select
              value={formData.intake || NONE}
              onValueChange={(v) => set('intake', v === NONE ? '' : v)}
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={noneDisplay} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{noneDisplay}</SelectItem>
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
                {t('partnerAppForm.studiedInChinaBefore')}
                <span className="block text-xs text-gray-500">
                  {t('partnerAppForm.studiedInChinaBeforeHint')}
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
                {t('partnerAppForm.appliedToChinaUniBefore')}
                <span className="block text-xs text-gray-500">
                  {t('partnerAppForm.appliedToChinaUniBeforeHint')}
                </span>
              </span>
            </label>
          </div>
        </div>
      </FormSection>

      {/* Section 7 — Funding */}
      <FormSection
        title={t('partnerAppForm.section7Title')}
        description={t('partnerAppForm.section7Desc')}
        icon={Wallet}
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">{t('partnerAppForm.fieldFundingSource')}</Label>
            <Select
              value={formData.fundingSource || NONE}
              onValueChange={(v) =>
                set('fundingSource', v === NONE ? '' : (v as FundingSource))
              }
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={noneDisplay} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{noneDisplay}</SelectItem>
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
              {t('partnerAppForm.fieldScholarshipName')}
            </Label>
            <Input
              id="scholarshipName"
              value={formData.scholarshipName}
              onChange={(e) => set('scholarshipName', e.target.value)}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldScholarshipNamePlaceholder')}
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
        title={t('partnerAppForm.section8Title')}
        description={t('partnerAppForm.section8Desc')}
        icon={FileText}
        defaultOpen={false}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="whyProgram" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldWhyProgram')}
            </Label>
            <Textarea
              id="whyProgram"
              value={formData.whyProgram}
              onChange={(e) => set('whyProgram', e.target.value)}
              rows={5}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldWhyProgramPlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor="careerPlan" className="text-[#1B2A4A] mb-2 block">
              {t('partnerAppForm.fieldCareerPlan')}
            </Label>
            <Textarea
              id="careerPlan"
              value={formData.careerPlan}
              onChange={(e) => set('careerPlan', e.target.value)}
              rows={4}
              className="rounded-none"
              placeholder={t('partnerAppForm.fieldCareerPlanPlaceholder')}
            />
          </div>
        </div>
      </FormSection>

      {/* Section 9 — Workflow (S27: status + decision are admin-only) */}
      <FormSection
        title={t('partnerAppForm.section9Title')}
        description={t('partnerAppForm.section9Desc')}
        icon={ListChecks}
        defaultOpen={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">{t('partnerAppForm.fieldPriority')}</Label>
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
            <p className="text-xs text-gray-500 mt-1">
              {t('partnerAppForm.fieldPriorityHint')}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="notes" className="text-[#1B2A4A] mb-2 block">
            {t('partnerAppForm.fieldNotes')}
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={4}
            className="rounded-none"
            placeholder={t('partnerAppForm.fieldNotesPlaceholder')}
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
              {t('partnerAppForm.cancel')}
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
            {t('partnerAppForm.cancel')}
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

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  User,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Copy,
  AlertCircle,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiFetchJson } from '@/lib/api-client';
import { ALL_COUNTRIES, NATIONALITY_CUSTOM } from '@/lib/common-countries';
import { useI18n } from '@/lib/i18n';
import {
  OcrUploadModal,
  type OcrResult,
  type PassportOcrResult,
  type TranscriptOcrResult,
} from '@/components/admin/ocr-upload-modal';

// Fields that map to fixed columns in student_profiles.
// Everything else goes to the `extra` JSONB blob.
const FIXED_FIELDS = [
  'firstName',
  'lastName',
  'dateOfBirth',
  'nationality',
  'email',
  'phone',
  'targetDegree',
  'targetField',
  'targetIntake',
  'preferredUniversities',
  'source',
  'status',
] as const;

export default function AdminAddStudentPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    studentId: string;
    studentName: string;
    studentEmail: string;
    temporaryPassword?: string;
    emailSent: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Phase 88: fetch active intake_periods dynamically (Phase 25
  // pattern) instead of the hardcoded 3-option list. Falls back to
  // a static option if the API fails so the wizard doesn't break.
  const [intakes, setIntakes] = useState<{ id: string; label: string }[]>([]);
  useEffect(() => {
    apiFetchJson<{ intakes?: { id: string; label: string }[] }>('/api/intakes?active=true')
      .then((d) => {
        if (d && Array.isArray(d.intakes)) setIntakes(d.intakes);
      })
      .catch(() => {
        /* swallow — the SelectContent falls back to one static option */
      });
  }, []);

  // Phase 89: country dropdown with full ISO 3166-1 list + Custom
  // fallback for legacy / unlisted values. Mirrors the partner student
  // form pattern (src/app/partner/students/new/page.tsx).
  const [showCustomNationality, setShowCustomNationality] = useState(false);
  useEffect(() => {
    // If a loaded value (e.g. on the edit page) isn't in ALL_COUNTRIES,
    // show the free-text fallback so the admin sees what was previously
    // stored instead of a silent mismatch.
    if (
      formData.nationality &&
      !ALL_COUNTRIES.some((c) => c.value === formData.nationality)
    ) {
      setShowCustomNationality(true);
    }
  }, []); // mount only — the wizard's nationality state is set later

  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    gender: '',
    maritalStatus: '',
    partnerInfo: '',

    // Contact Info
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    country: '',

    // Education Background
    highSchoolName: '',
    highSchoolCity: '',
    highSchoolCountry: '',
    highSchoolGPA: '',
    highSchoolGraduationDate: '',
    bachelorUniversityName: '',
    bachelorUniversityCity: '',
    bachelorUniversityCountry: '',
    bachelorMajor: '',
    bachelorGPA: '',
    bachelorGraduationDate: '',

    // Language Proficiency
    hskLevel: '',
    hskScore: '',
    ieltsScore: '',
    toeflScore: '',

    // Target
    targetDegree: '',
    targetField: '',
    targetIntake: '',
    preferredUniversities: '',

    // Notes
    notes: ''
  });

  // Accept (name, value) directly so both <Input onChange={e => ...}> and
  // <Select onValueChange={value => ...}> can call it without faking a ChangeEvent.
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Phase 89: inline arrow handlers (kept terse — TSX in this file
  // gets confused by longer function declarations inside the
  // component body, breaking the JSX parser downstream).
  const handleNationalitySelectChange = (value: string): void => {
    if (value === NATIONALITY_CUSTOM) {
      setShowCustomNationality(true);
    } else {
      setShowCustomNationality(false);
      handleInputChange('nationality', value);
    }
  };

  // Derive the Select value at the top so JSX doesn't need a
  // multi-line ternary inside the value={...} attribute (TSX
  // parsing inside attribute values is unreliable when the
  // expression contains other ternaries).
  const selectNationalityValue: string =
    formData.nationality &&
    ALL_COUNTRIES.some((c) => c.value === formData.nationality)
      ? formData.nationality
      : NATIONALITY_CUSTOM;

  // Phase 89: OCR modal state + apply handlers.
  const [ocrKind, setOcrKind] = useState<'passport' | 'transcript' | null>(null);
  const openPassportOcr = () => setOcrKind('passport');
  const openTranscriptOcr = () => setOcrKind('transcript');
  const closeOcr = () => setOcrKind(null);

  function applyPassportOcr(result: PassportOcrResult): void {
    const set = (k: keyof typeof formData, v: string | null) =>
      handleInputChange(k, v ?? '');
    set('firstName', result.firstName);
    set('lastName', result.lastName);
    set('dateOfBirth', result.dateOfBirth);
    set('nationality', result.nationality);
    set('passportNumber', result.passportNumber);
    set('gender', result.gender);
    set('passportIssueDate', result.passportIssueDate);
    set('passportExpiryDate', result.passportExpiryDate);
  }

  function applyTranscriptOcr(result: TranscriptOcrResult): void {
    const set = (k: keyof typeof formData, v: string | null) =>
      handleInputChange(k, v ?? '');
    set('highSchoolName', result.highSchoolName);
    set('highSchoolCity', result.highSchoolCity);
    set('highSchoolCountry', result.highSchoolCountry);
    set('highSchoolGPA', result.highSchoolGPA);
    set('highSchoolGraduationDate', result.highSchoolGraduationDate);
  }

  const applyOcr = (result: OcrResult) => {
    if (ocrKind === 'passport') {
      applyPassportOcr(result as PassportOcrResult);
    } else if (ocrKind === 'transcript') {
      applyTranscriptOcr(result as TranscriptOcrResult);
    }
  };

  const passportExistingFields = ([
    formData.firstName,
    formData.lastName,
    formData.dateOfBirth,
    formData.nationality,
    formData.passportNumber,
    formData.gender,
    formData.passportIssueDate,
    formData.passportExpiryDate,
  ] as Array<string | null>).filter((v) => v && v.length > 0) as string[];

  const transcriptExistingFields = ([
    formData.highSchoolName,
    formData.highSchoolCity,
    formData.highSchoolCountry,
    formData.highSchoolGPA,
    formData.highSchoolGraduationDate,
  ] as Array<string | null>).filter((v) => v && v.length > 0) as string[];

  /**
   * Split the form into:
   *   - top-level: fields with fixed columns
   *   - extra: free-form fields that live in the `extra` JSONB column
   * Drop empty strings so the API doesn't get cluttered with `field: ''`.
   */
  const buildPayload = () => {
    const payload: Record<string, unknown> = {};
    const extra: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(formData)) {
      if (value === '' || value === null || value === undefined) continue;
      // Phase 88: convert the comma-separated preferredUniversities
      // string into the TEXT[] the mapper expects. Stays as a single
      // input on the UI to avoid dragging in a multi-select component.
      if (key === 'preferredUniversities' && typeof value === 'string') {
        const arr = value
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        if (arr.length > 0) payload.preferredUniversities = arr;
        continue;
      }
      if ((FIXED_FIELDS as readonly string[]).includes(key)) {
        payload[key] = value;
      } else {
        extra[key] = value;
      }
    }
    if (Object.keys(extra).length > 0) payload.extra = extra;
    // Default source to 'Admin' for the "Add Offline Student" flow
    if (!payload.source) payload.source = 'Admin';
    return payload;
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const data = await apiFetchJson<{
        student: { id: string; firstName: string; lastName: string; email: string };
        temporaryPassword?: string;
        emailSent?: boolean;
      }>('/api/admin/students', {
        method: 'POST',
        body: JSON.stringify(buildPayload()),
      });
      setSuccess({
        studentId: data.student.id,
        studentName: `${data.student.firstName} ${data.student.lastName}`.trim(),
        studentEmail: data.student.email,
        temporaryPassword: data.temporaryPassword,
        emailSent: data.emailSent !== false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminStudentForm.errorCreateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const copyPassword = async () => {
    if (!success?.temporaryPassword) return;
    try {
      await navigator.clipboard.writeText(success.temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API blocked; user can copy manually
    }
  };

  const totalSteps = 4;

  // Success state: show the temp password + next-step actions
  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-[#1B2A4A]">{t('adminStudentForm.successTitle')}</h2>
                <p className="text-[#4B5563] mt-2">
                  <strong>{success.studentName || success.studentEmail}</strong>{' '}
                  {t('adminStudentForm.successMessage')}
                </p>
              </div>

              {/* M10: warn the admin when Resend was down + the welcome
                  email didn't go out. They can still share the password
                  manually + retry from the detail page. */}
              {!success.emailSent && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-6 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-900">
                    {t('adminStudentForm.welcomeEmailFailed')}
                  </p>
                </div>
              )}

              {success.temporaryPassword && (
                <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-amber-900 text-sm">
                        {t('adminStudentForm.passwordHintTitle')}
                      </p>
                      <p className="text-amber-800 text-sm mt-1">
                        {t('adminStudentForm.passwordHintBody')}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded font-mono text-sm select-all">
                          {success.temporaryPassword}
                        </code>
                        <Button size="sm" variant="outline" onClick={copyPassword}>
                          <Copy className="w-4 h-4 mr-1" />
                          {copied
                            ? t('adminStudentForm.buttonCopied')
                            : t('adminStudentForm.buttonCopy')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" asChild>
                  <Link href="/admin/students">{t('adminStudentForm.buttonBackToStudents')}</Link>
                </Button>
                <Button
                  className="bg-[#9B1B30] hover:bg-[#7A1526]"
                  asChild
                >
                  <Link href={`/admin/students/${success.studentId}`}>
                    {t('adminStudentForm.buttonViewStudent')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/students" className="p-2 hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-3">
                {t('adminStudentForm.pageTitleNew')}
                <Badge className="bg-[#9B1B30] hover:bg-[#7A1526]">
                  {t('adminStudentForm.badgeOfflineStudent')}
                </Badge>
              </h1>
              <p className="text-[#4B5563] mt-1">{t('adminStudentForm.pageSubtitleNew')}</p>
            </div>
          </div>
        </div>

        {/* Step Indicator — inline circle+label (same pattern as the edit
            wizard). The old version used fixed w-24 connectors plus a
            detached justify-between label row, which forced the page
            ~600px wide on mobile and let labels drift from their circles. */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {[
                { n: 1, label: t('adminStudentForm.step1Title'), Icon: User },
                { n: 2, label: t('adminStudentForm.step2Title'), Icon: GraduationCap },
                { n: 3, label: t('adminStudentForm.step3TitleNew'), Icon: BookOpen },
                { n: 4, label: t('adminStudentForm.step4Title'), Icon: CheckCircle2 },
              ].map(({ n, label, Icon }) => (
                <div key={n} className="flex items-center min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold shrink-0 ${
                    n < step
                      ? 'bg-green-500 text-white'
                      : n === step
                        ? 'bg-[#9B1B30] text-white'
                        : 'bg-gray-200 text-[#4B5563]'
                  }`}>
                    {n < step ? <CheckCircle2 className="w-5 h-5" /> : n}
                  </div>
                  <span className={`ml-2 hidden md:flex items-center gap-1 text-sm whitespace-nowrap ${
                    n === step ? 'font-medium text-[#1B2A4A]' : 'text-[#4B5563]'
                  }`}>
                    <Icon className="w-4 h-4" /> {label}
                  </span>
                  {n < totalSteps && (
                    <div className={`w-8 sm:w-16 lg:w-24 h-1 mx-2 shrink-0 ${n < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card>
          <CardContent className="pt-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-[#1B2A4A]" />
                    <h2 className="text-lg font-semibold text-[#1B2A4A]">{t('adminStudentForm.sectionPersonalInfo')}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={openPassportOcr}
                    className="inline-flex items-center gap-1 text-xs border border-[#1B2A4A] text-[#1B2A4A] px-2.5 py-1 hover:bg-[#1B2A4A] hover:text-white transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    {t('adminStudentForm.ocrButtonPassport')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-[#1B2A4A]">{t('adminStudentForm.fieldFirstName')}</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-[#1B2A4A]">{t('adminStudentForm.fieldLastName')}</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth" className="text-[#1B2A4A]">{t('adminStudentForm.fieldDateOfBirth')}</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nationality" className="text-[#1B2A4A]">{t('adminStudentForm.fieldNationality')}</Label>
                    {showCustomNationality ? (
                      <Input
                        id="nationality"
                        name="nationality"
                        value={formData.nationality}
                        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                        className="mt-2"
                        placeholder={t('adminStudentForm.placeholderNationalityNew')}
                        required
                      />
                    ) : (
                      <Select
                        value={selectNationalityValue}
                        onValueChange={handleNationalitySelectChange}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t('adminStudentForm.placeholderNationalityNew')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[320px]">
                          {ALL_COUNTRIES.map((c) => (
                            <SelectItem key={c.code} value={c.value}>
                              {c.label} ({c.code})
                            </SelectItem>
                          ))}
                          <SelectItem value={NATIONALITY_CUSTOM}>
                            {t('adminStudentForm.fieldNationalityOther')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="passportNumber" className="text-[#1B2A4A]">{t('adminStudentForm.fieldPassportNumber')}</Label>
                    <Input
                      id="passportNumber"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="passportIssueDate" className="text-[#1B2A4A]">{t('adminStudentForm.fieldPassportIssueDate')}</Label>
                    <Input
                      id="passportIssueDate"
                      name="passportIssueDate"
                      type="date"
                      value={formData.passportIssueDate}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="passportExpiryDate" className="text-[#1B2A4A]">{t('adminStudentForm.fieldPassportExpiryDate')}</Label>
                    <Input
                      id="passportExpiryDate"
                      name="passportExpiryDate"
                      type="date"
                      value={formData.passportExpiryDate}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender" className="text-[#1B2A4A]">{t('adminStudentForm.fieldGender')}</Label>
                    <Select name="gender" value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={t('adminStudentForm.selectGender')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">{t('adminStudentForm.optionMale')}</SelectItem>
                        <SelectItem value="Female">{t('adminStudentForm.optionFemale')}</SelectItem>
                        <SelectItem value="Other">{t('adminStudentForm.optionOther')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#1B2A4A]" />
                  <h3 className="text-md font-semibold text-[#1B2A4A]">{t('adminStudentForm.sectionContactInfo')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="text-[#1B2A4A]">{t('adminStudentForm.fieldEmail')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-[#1B2A4A]">{t('adminStudentForm.fieldPhone')}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp" className="text-[#1B2A4A]">{t('adminStudentForm.fieldWhatsApp')}</Label>
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-[#1B2A4A]">{t('adminStudentForm.fieldCountryRequired')}</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address" className="text-[#1B2A4A]">{t('adminStudentForm.fieldAddress')}</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="md:col-span-2">
                  <Label htmlFor="partnerInfo" className="text-[#1B2A4A]">
                    {t('adminStudentForm.fieldPartnerInfo')}
                  </Label>
                  <Textarea
                    id="partnerInfo"
                    name="partnerInfo"
                    value={formData.partnerInfo}
                    onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                    placeholder={t('adminStudentForm.placeholderPartnerInfo')}
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#1B2A4A]" />
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">{t('adminStudentForm.sectionEducationBackground')}</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-semibold text-[#1B2A4A]">{t('adminStudentForm.sectionHighSchool')}</h3>
                      <button
                        type="button"
                        onClick={openTranscriptOcr}
                        className="inline-flex items-center gap-1 text-xs border border-[#1B2A4A] text-[#1B2A4A] px-2.5 py-1 hover:bg-[#1B2A4A] hover:text-white transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        {t('adminStudentForm.ocrButtonTranscript')}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label htmlFor="highSchoolName" className="text-[#1B2A4A]">{t('adminStudentForm.fieldHighSchoolName')}</Label>
                        <Input
                          id="highSchoolName"
                          name="highSchoolName"
                          value={formData.highSchoolName}
                          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="highSchoolCity" className="text-[#1B2A4A]">{t('adminStudentForm.fieldCity')}</Label>
                        <Input
                          id="highSchoolCity"
                          name="highSchoolCity"
                          value={formData.highSchoolCity}
                          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="highSchoolCountry" className="text-[#1B2A4A]">{t('adminStudentForm.fieldHighSchoolCountry')}</Label>
                        <Input
                          id="highSchoolCountry"
                          name="highSchoolCountry"
                          value={formData.highSchoolCountry}
                          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="highSchoolGPA" className="text-[#1B2A4A]">{t('adminStudentForm.fieldGpa')}</Label>
                        <Input
                          id="highSchoolGPA"
                          name="highSchoolGPA"
                          value={formData.highSchoolGPA}
                          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          className="mt-2"
                          placeholder={t('adminStudentForm.placeholderGpa')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="highSchoolGraduationDate" className="text-[#1B2A4A]">{t('adminStudentForm.fieldGraduationDate')}</Label>
                        <Input
                          id="highSchoolGraduationDate"
                          name="highSchoolGraduationDate"
                          type="date"
                          value={formData.highSchoolGraduationDate}
                          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="text-md font-semibold text-[#1B2A4A] mb-4">{t('adminStudentForm.sectionBachelorsDegree')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label htmlFor="bachelorUniversityName" className="text-[#1B2A4A]">{t('adminStudentForm.fieldUniversityName')}</Label>
                        <Input
                          id="bachelorUniversityName"
                          name="bachelorUniversityName"
                          value={formData.bachelorUniversityName}
                          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bachelorMajor" className="text-[#1B2A4A]">{t('adminStudentForm.fieldMajor')}</Label>
                        <Input
                          id="bachelorMajor"
                          name="bachelorMajor"
                          value={formData.bachelorMajor}
                          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bachelorGPA" className="text-[#1B2A4A]">{t('adminStudentForm.fieldGpa')}</Label>
                        <Input
                          id="bachelorGPA"
                          name="bachelorGPA"
                          value={formData.bachelorGPA}
                          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bachelorGraduationDate" className="text-[#1B2A4A]">{t('adminStudentForm.fieldGraduationDate')}</Label>
                        <Input
                          id="bachelorGraduationDate"
                          name="bachelorGraduationDate"
                          type="date"
                          value={formData.bachelorGraduationDate}
                          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#1B2A4A]" />
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">{t('adminStudentForm.sectionLanguageTarget')}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="hskLevel" className="text-[#1B2A4A]">{t('adminStudentForm.fieldHskLevel')}</Label>
                    <Select name="hskLevel" value={formData.hskLevel} onValueChange={(value) => handleInputChange('hskLevel', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={t('adminStudentForm.selectHskLevel')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">HSK 1</SelectItem>
                        <SelectItem value="2">HSK 2</SelectItem>
                        <SelectItem value="3">HSK 3</SelectItem>
                        <SelectItem value="4">HSK 4</SelectItem>
                        <SelectItem value="5">HSK 5</SelectItem>
                        <SelectItem value="6">HSK 6</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="hskScore" className="text-[#1B2A4A]">{t('adminStudentForm.fieldHskScore')}</Label>
                    <Input
                      id="hskScore"
                      name="hskScore"
                      value={formData.hskScore}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                      placeholder={t('adminStudentForm.placeholderHskScore')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ieltsScore" className="text-[#1B2A4A]">{t('adminStudentForm.fieldIeltsScore')}</Label>
                    <Input
                      id="ieltsScore"
                      name="ieltsScore"
                      value={formData.ieltsScore}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                      placeholder={t('adminStudentForm.placeholderIeltsScore')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="toeflScore" className="text-[#1B2A4A]">{t('adminStudentForm.fieldToeflScore')}</Label>
                    <Input
                      id="toeflScore"
                      name="toeflScore"
                      value={formData.toeflScore}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                      placeholder={t('adminStudentForm.placeholderToeflScore')}
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-md font-semibold text-[#1B2A4A] mb-4">{t('adminStudentForm.sectionTargetApplication')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="targetDegree" className="text-[#1B2A4A]">{t('adminStudentForm.fieldTargetDegree')}</Label>
                      <Select name="targetDegree" value={formData.targetDegree} onValueChange={(value) => handleInputChange('targetDegree', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t('adminStudentForm.selectDegree')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                          <SelectItem value="Master">Master's Degree</SelectItem>
                          <SelectItem value="PhD">PhD</SelectItem>
                          <SelectItem value="Chinese Language">Chinese Language</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="targetIntake" className="text-[#1B2A4A]">{t('adminStudentForm.fieldTargetIntake')}</Label>
                      <Select name="targetIntake" value={formData.targetIntake} onValueChange={(value) => handleInputChange('targetIntake', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t('adminStudentForm.selectIntake')} />
                        </SelectTrigger>
                        <SelectContent>
                          {intakes.length === 0 ? (
                            <SelectItem value="September 2025">September 2025</SelectItem>
                          ) : (
                            intakes.map((i) => (
                              <SelectItem key={i.id} value={i.label}>{i.label}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Phase 88: targetField + preferredUniversities inputs. */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <Label htmlFor="targetField" className="text-[#1B2A4A]">
                        {t('adminStudentForm.fieldTargetField')}
                      </Label>
                      <Input
                        id="targetField"
                        name="targetField"
                        value={formData.targetField}
                        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                        placeholder={t('adminStudentForm.placeholderTargetField')}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferredUniversities" className="text-[#1B2A4A]">
                        {t('adminStudentForm.fieldPreferredUniversities')}
                      </Label>
                      <Input
                        id="preferredUniversities"
                        name="preferredUniversities"
                        value={formData.preferredUniversities}
                        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                        placeholder={t('adminStudentForm.placeholderPreferredUniversities')}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="mt-8">
                  <Label htmlFor="notes" className="text-[#1B2A4A]">{t('adminStudentForm.sectionAdditionalNotes')}</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                    rows={5}
                    className="mt-2"
                    placeholder={t('adminStudentForm.placeholderNotesNew')}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#1B2A4A]" />
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">{t('adminStudentForm.reviewHeadingNew')}</h2>
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#1B2A4A]">{t('adminStudentForm.reviewCardPersonalNew')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelName')}</span> <span className="font-medium">{formData.firstName} {formData.lastName}</span></div>
                        <div><span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelDateOfBirth')}</span> <span className="font-medium">{formData.dateOfBirth || '-'}</span></div>
                        <div><span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelNationality')}</span> <span className="font-medium">{formData.nationality || '-'}</span></div>
                        <div><span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelEmail')}</span> <span className="font-medium">{formData.email || '-'}</span></div>
                        <div><span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelPhone')}</span> <span className="font-medium">{formData.phone || '-'}</span></div>
                        <div><span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelCountry')}</span> <span className="font-medium">{formData.country || '-'}</span></div>
                        {formData.whatsapp && (
                          <div><span className="text-[#4B5563]">{t('adminStudentForm.fieldWhatsApp')}</span> <span className="font-medium">{formData.whatsapp}</span></div>
                        )}
                        {formData.passportNumber && (
                          <div><span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelPassport')}</span> <span className="font-medium">{formData.passportNumber}</span></div>
                        )}
                        {formData.partnerInfo && (
                          <div className="col-span-2">
                            <span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelPartnerInfo')}</span>{' '}
                            <span className="font-medium whitespace-pre-wrap">{formData.partnerInfo}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {(formData.highSchoolName || formData.bachelorUniversityName) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-[#1B2A4A]">{t('adminStudentForm.reviewCardEducationNew')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {formData.highSchoolName && (
                            <div className="col-span-2"><span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelHighSchool')}</span> <span className="font-medium">{formData.highSchoolName}</span></div>
                          )}
                          {formData.bachelorUniversityName && (
                            <>
                              <div><span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelBachelorsUniversity')}</span> <span className="font-medium">{formData.bachelorUniversityName}</span></div>
                              <div><span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelMajor')}</span> <span className="font-medium">{formData.bachelorMajor}</span></div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {(formData.hskLevel || formData.ieltsScore || formData.toeflScore || formData.targetDegree || formData.targetField || formData.preferredUniversities) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-[#1B2A4A]">{t('adminStudentForm.reviewCardLanguageTargetNew')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {formData.hskLevel && (
                            <div><span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelHskLevel')}</span> <span className="font-medium">{formData.hskLevel}</span></div>
                          )}
                          {formData.ieltsScore && (
                            <div><span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelIelts')}</span> <span className="font-medium">{formData.ieltsScore}</span></div>
                          )}
                          {formData.toeflScore && (
                            <div><span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelToefl')}</span> <span className="font-medium">{formData.toeflScore}</span></div>
                          )}
                          {formData.targetDegree && (
                            <div><span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelTargetDegree')}</span> <span className="font-medium">{formData.targetDegree}</span></div>
                          )}
                          {formData.targetField && (
                            <div><span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelTargetField')}</span> <span className="font-medium">{formData.targetField}</span></div>
                          )}
                          {formData.targetIntake && (
                            <div><span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelTargetIntake')}</span> <span className="font-medium">{formData.targetIntake}</span></div>
                          )}
                          {formData.preferredUniversities && (
                            <div className="col-span-2">
                              <span className="text-[#4B5563]">{t('adminStudentForm.reviewLabelPreferredUniversities')}</span>{' '}
                              <span className="font-medium">{formData.preferredUniversities}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <Button
              variant="secondary"
              onClick={() => setStep(step - 1)}
            >
              {t('adminStudentForm.buttonPrevious')}
            </Button>
          ) : (
            <Button variant="secondary" asChild>
              <Link href="/admin/students">
                {t('adminStudentForm.buttonCancel')}
              </Link>
            </Button>
          )}
          
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)} className="bg-[#1B2A4A] hover:bg-[#152138]">
              {t('adminStudentForm.buttonNext')}
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isSaving} className="bg-[#9B1B30] hover:bg-[#7A1526]">
              {isSaving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {t('adminStudentForm.buttonSaving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('adminStudentForm.buttonSaveNew')}
                </>
              )}
            </Button>
          )}
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 pb-4">
              <p className="text-red-800 text-sm">
                <strong>{t('adminStudentForm.errorPrefix')}</strong> {error}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Phase 89: OCR modals — single instance, kind-driven so we
          don't mount two modals side by side. */}
      {ocrKind === 'passport' && (
        <OcrUploadModal
          open
          onOpenChange={(o) => !o && closeOcr()}
          kind="passport"
          existingFieldKeys={passportExistingFields}
          onApply={applyOcr}
        />
      )}
      {ocrKind === 'transcript' && (
        <OcrUploadModal
          open
          onOpenChange={(o) => !o && closeOcr()}
          kind="transcript"
          existingFieldKeys={transcriptExistingFields}
          onApply={applyOcr}
        />
      )}
    </div>
  );
}

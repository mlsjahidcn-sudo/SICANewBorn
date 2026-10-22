'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2, ChevronRight, ChevronLeft, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import type { AdminStudent } from '@/lib/student-mapper';
import { ALL_COUNTRIES, NATIONALITY_CUSTOM } from '@/lib/common-countries';
import {
  OcrUploadModal,
  type OcrKind,
  type OcrResult,
  type PassportOcrResult,
  type TranscriptOcrResult,
  type ResumeOcrResult,
  type TranscriptLevel,
} from '@/components/admin/ocr-upload-modal';

// Fields with fixed columns. Everything else lives in `extra` JSONB.
// passportNumber must be here so passport OCR writes the real column
// (not a silent extra.passportNumber copy).
const FIXED_FIELDS = [
  'firstName',
  'lastName',
  'dateOfBirth',
  'nationality',
  'email',
  'phone',
  'passportNumber',
  'targetDegree',
  'targetIntake',
  'source',
  'status',
] as const;

export default function AdminStudentEditPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const studentId = params.id as string;

  const STEPS = [
    t('adminStudentForm.step1Title'),
    t('adminStudentForm.step2Title'),
    t('adminStudentForm.step3TitleEdit'),
    t('adminStudentForm.step4Title'),
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Form state — covers all fields the API supports (fixed + extra).
  // initial state is empty; we populate from the GET response in useEffect.
  const original = useRef<Record<string, string>>({});
  const version = useRef<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Load the student on mount / id change
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    setNotFound(false);

    apiFetchJson<{ student: AdminStudent }>(`/api/admin/students/${studentId}`, {
      signal: controller.signal,
    })
      .then(({ student }) => {
        // Flatten fixed fields + extra into a single key/value bag
        const flat: Record<string, string> = {};
        for (const key of FIXED_FIELDS) {
          const v = student[key as keyof AdminStudent];
          flat[key] = typeof v === 'string' ? v : v ? String(v) : '';
        }
        // Spread extra fields into the form (so HSK, IELTS, etc. show up)
        if (student.extra && typeof student.extra === 'object') {
          for (const [k, v] of Object.entries(student.extra)) {
            if (typeof v === 'string') flat[k] = v;
          }
        }
        // Prefer mapper top-level passport dates (extra is the source of
        // truth, but AdminStudent surfaces them for convenience).
        flat.passportIssueDate =
          student.passportIssueDate ?? flat.passportIssueDate ?? '';
        flat.passportExpiryDate =
          student.passportExpiryDate ?? flat.passportExpiryDate ?? '';
        original.current = { ...flat };
        version.current = student.updatedAt;
        setFormData(flat);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (err.status === 404) {
          setNotFound(true);
        } else {
          setError(err.message || t('adminStudentForm.errorLoadFailed'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [studentId, t]);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // OCR modal state — single instance, kind + transcriptLevel driven.
  const [ocrKind, setOcrKind] = useState<OcrKind | null>(null);
  const [transcriptLevel, setTranscriptLevel] = useState<TranscriptLevel>('high_school');
  const openPassportOcr = () => {
    setOcrKind('passport');
  };
  const openResumeOcr = () => {
    setOcrKind('resume');
  };
  const openTranscriptOcr = (level: TranscriptLevel) => {
    setTranscriptLevel(level);
    setOcrKind('transcript');
  };
  const closeOcr = () => setOcrKind(null);

  function applyPassportOcr(result: PassportOcrResult): void {
    const set = (k: string, val: string | null) => handleInputChange(k, val ?? '');
    set('firstName', result.firstName);
    set('lastName', result.lastName);
    set('dateOfBirth', result.dateOfBirth);
    set('nationality', result.nationality);
    set('passportNumber', result.passportNumber);
    set('gender', result.gender);
    set('passportIssueDate', result.passportIssueDate);
    set('passportExpiryDate', result.passportExpiryDate);
  }

  function applyTranscriptOcr(level: TranscriptLevel, result: TranscriptOcrResult): void {
    const set = (k: string, val: string | null) => handleInputChange(k, val ?? '');
    if (level === 'high_school') {
      set('highSchoolName', result.highSchoolName);
      set('highSchoolCity', result.highSchoolCity);
      set('highSchoolCountry', result.highSchoolCountry);
      set('highSchoolGPA', result.highSchoolGPA);
      set('highSchoolGraduationDate', result.highSchoolGraduationDate);
      return;
    }
    if (level === 'bachelor') {
      set('bachelorUniversityName', result.bachelorUniversityName);
      set('bachelorMajor', result.bachelorMajor);
      set('bachelorGPA', result.bachelorGPA);
      set('bachelorGraduationDate', result.bachelorGraduationDate);
      return;
    }
    set('masterUniversityName', result.masterUniversityName);
    set('masterMajor', result.masterMajor);
    set('masterGPA', result.masterGPA);
    set('masterGraduationDate', result.masterGraduationDate);
  }

  function applyResumeOcr(result: ResumeOcrResult): void {
    const set = (k: string, val: string | null) => {
      if (val == null || val === '') return;
      handleInputChange(k, val);
    };
    // Always map when non-null (plan): contact + parent/guardian.
    set('phone', result.phone);
    set('whatsapp', result.whatsapp);
    set('address', result.address);
    set('partnerInfo', result.partnerInfo);
    // Also map identity/contact when present (same replace-confirm gate).
    set('email', result.email);
    set('city', result.city);
    set('country', result.country);
    set('firstName', result.firstName);
    set('lastName', result.lastName);
  }

  const applyOcr = (result: OcrResult) => {
    if (ocrKind === 'passport') {
      applyPassportOcr(result as PassportOcrResult);
    } else if (ocrKind === 'transcript') {
      applyTranscriptOcr(transcriptLevel, result as TranscriptOcrResult);
    } else if (ocrKind === 'resume') {
      applyResumeOcr(result as ResumeOcrResult);
    }
  };

  const nonEmpty = (vals: Array<string | undefined>): string[] =>
    vals.filter((v): v is string => typeof v === 'string' && v.length > 0);

  const passportExistingFields = nonEmpty([
    formData.firstName,
    formData.lastName,
    formData.dateOfBirth,
    formData.nationality,
    formData.passportNumber,
    formData.gender,
    formData.passportIssueDate,
    formData.passportExpiryDate,
  ]);

  const resumeExistingFields = nonEmpty([
    formData.phone,
    formData.whatsapp,
    formData.address,
    formData.partnerInfo,
    formData.email,
    formData.city,
    formData.country,
    formData.firstName,
    formData.lastName,
  ]);

  const highSchoolExistingFields = nonEmpty([
    formData.highSchoolName,
    formData.highSchoolCity,
    formData.highSchoolCountry,
    formData.highSchoolGPA,
    formData.highSchoolGraduationDate,
  ]);

  const bachelorExistingFields = nonEmpty([
    formData.bachelorUniversityName,
    formData.bachelorMajor,
    formData.bachelorGPA,
    formData.bachelorGraduationDate,
  ]);

  const masterExistingFields = nonEmpty([
    formData.masterUniversityName,
    formData.masterMajor,
    formData.masterGPA,
    formData.masterGraduationDate,
  ]);

  const ocrExistingFieldKeys =
    ocrKind === 'passport'
      ? passportExistingFields
      : ocrKind === 'resume'
        ? resumeExistingFields
        : transcriptLevel === 'bachelor'
          ? bachelorExistingFields
          : transcriptLevel === 'master'
            ? masterExistingFields
            : highSchoolExistingFields;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };
  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Split into fixed fields + extra JSONB
      const payload: Record<string, unknown> = {};
      const extra: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(formData)) {
        if (value === original.current[key]) continue;
        if ((FIXED_FIELDS as readonly string[]).includes(key)) {
          payload[key] = key === 'dateOfBirth' && value === '' ? null : value;
        } else {
          extra[key] = value;
        }
      }
      if (Object.keys(extra).length > 0) payload.extra = extra;

      if (Object.keys(payload).length === 0) { router.push(`/admin/students/${studentId}`); return; }
      payload.expectedUpdatedAt = version.current;
      await apiFetchJson(`/api/admin/students/${studentId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      router.push(`/admin/students/${studentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminStudentForm.errorUpdateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-40 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded-lg" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">{t('adminStudentForm.notFoundTitle')}</h3>
              <p className="text-gray-500 mb-4">{t('adminStudentForm.notFoundBody')}</p>
              <Button onClick={() => router.push('/admin/students')}>
                {t('adminStudentForm.buttonBackToStudents')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const v = (key: string) => formData[key] || '';

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push(`/admin/students/${studentId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('adminStudentForm.buttonBackToStudent')}
            </Button>
          </div>
          <Badge className="bg-[#1B2A4A] text-white">
            {t('adminStudentForm.pageTitleEdit')}
          </Badge>
        </div>

        {/* Step Indicator */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    index < currentStep
                      ? 'bg-[#9B1B30] text-white'
                      : index === currentStep
                        ? 'bg-[#9B1B30] text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${index === currentStep ? 'font-medium text-[#1B2A4A]' : 'text-gray-500'}`}>
                    {step}
                  </span>
                  {index < STEPS.length - 1 && (
                    <div className={`mx-4 h-0.5 flex-1 ${index < currentStep ? 'bg-[#9B1B30]' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card>
          <CardContent className="pt-6">
            {/* Step 1: Personal Info */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('adminStudentForm.sectionPersonalInfo')}</h3>
                  <button
                    type="button"
                    onClick={openPassportOcr}
                    className="inline-flex items-center gap-1 text-xs border border-[#1B2A4A] text-[#1B2A4A] px-2.5 py-1 hover:bg-[#1B2A4A] hover:text-white transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    {t('adminStudentForm.ocrButtonPassport')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('adminStudentForm.fieldFirstName')}</Label>
                    <Input id="firstName" value={v('firstName')} onChange={(e) => handleInputChange('firstName', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('adminStudentForm.fieldLastName')}</Label>
                    <Input id="lastName" value={v('lastName')} onChange={(e) => handleInputChange('lastName', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">{t('adminStudentForm.fieldDateOfBirth')}</Label>
                    <Input id="dateOfBirth" type="date" value={v('dateOfBirth')} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">{t('adminStudentForm.fieldNationality')}</Label>
                    {v('nationality') && !ALL_COUNTRIES.some((c) => c.value === v('nationality')) ? (
                      <Input
                        id="nationality"
                        value={v('nationality')}
                        onChange={(e) => handleInputChange('nationality', e.target.value)}
                        placeholder={t('adminStudentForm.placeholderNationalityEdit')}
                      />
                    ) : (
                      <Select
                        value={v('nationality') || NATIONALITY_CUSTOM}
                        onValueChange={(value) => {
                          if (value === NATIONALITY_CUSTOM) {
                            handleInputChange('nationality', '');
                          } else {
                            handleInputChange('nationality', value);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('adminStudentForm.placeholderNationalityEdit')} />
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
                  <div className="space-y-2">
                    <Label htmlFor="gender">{t('adminStudentForm.fieldGender')}</Label>
                    <Select value={v('gender')} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger><SelectValue placeholder={t('adminStudentForm.selectGender')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">{t('adminStudentForm.optionMale')}</SelectItem>
                        <SelectItem value="Female">{t('adminStudentForm.optionFemale')}</SelectItem>
                        <SelectItem value="Other">{t('adminStudentForm.optionOther')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">{t('adminStudentForm.fieldMaritalStatus')}</Label>
                    <Select value={v('maritalStatus')} onValueChange={(value) => handleInputChange('maritalStatus', value)}>
                      <SelectTrigger><SelectValue placeholder={t('adminStudentForm.selectMaritalStatus')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">{t('adminStudentForm.optionSingle')}</SelectItem>
                        <SelectItem value="Married">{t('adminStudentForm.optionMarried')}</SelectItem>
                        <SelectItem value="Other">{t('adminStudentForm.optionOther')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('adminStudentForm.sectionContactInfo')}</h3>
                  <button
                    type="button"
                    onClick={openResumeOcr}
                    className="inline-flex items-center gap-1 text-xs border border-[#1B2A4A] text-[#1B2A4A] px-2.5 py-1 hover:bg-[#1B2A4A] hover:text-white transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    {t('adminStudentForm.ocrButtonResume')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('adminStudentForm.fieldEmail')}</Label>
                    <Input id="email" type="email" value={v('email')} onChange={(e) => handleInputChange('email', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('adminStudentForm.fieldPhone')}</Label>
                    <Input id="phone" value={v('phone')} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder={t('adminStudentForm.placeholderPhone')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">{t('adminStudentForm.fieldWhatsApp')}</Label>
                    <Input id="whatsapp" value={v('whatsapp')} onChange={(e) => handleInputChange('whatsapp', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">{t('adminStudentForm.fieldCountry')}</Label>
                    <Input id="country" value={v('country')} onChange={(e) => handleInputChange('country', e.target.value)} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">{t('adminStudentForm.fieldAddress')}</Label>
                    <Textarea id="address" value={v('address')} onChange={(e) => handleInputChange('address', e.target.value)} rows={2} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="partnerInfo">{t('adminStudentForm.fieldPartnerInfo')}</Label>
                    <Textarea
                      id="partnerInfo"
                      value={v('partnerInfo')}
                      onChange={(e) => handleInputChange('partnerInfo', e.target.value)}
                      placeholder={t('adminStudentForm.placeholderPartnerInfo')}
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">{t('adminStudentForm.sectionStatus')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">{t('adminStudentForm.fieldStudentStatus')}</Label>
                    <Select value={v('status')} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger><SelectValue placeholder={t('adminStudentForm.selectStudentStatus')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">{t('adminStudentForm.fieldSource')}</Label>
                    <Select value={v('source')} onValueChange={(value) => handleInputChange('source', value)}>
                      <SelectTrigger><SelectValue placeholder={t('adminStudentForm.selectSource')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">{t('adminStudentForm.optionSourceAdmin')}</SelectItem>
                        <SelectItem value="Partner">{t('adminStudentForm.optionSourcePartner')}</SelectItem>
                        <SelectItem value="Online">{t('adminStudentForm.optionSourceOnline')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Education */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('adminStudentForm.sectionHighSchool')}</h3>
                  <button
                    type="button"
                    onClick={() => openTranscriptOcr('high_school')}
                    className="inline-flex items-center gap-1 text-xs border border-[#1B2A4A] text-[#1B2A4A] px-2.5 py-1 hover:bg-[#1B2A4A] hover:text-white transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    {t('adminStudentForm.ocrButtonTranscriptHighSchool')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="highSchoolName">{t('adminStudentForm.fieldHighSchoolName')}</Label>
                    <Input id="highSchoolName" value={v('highSchoolName')} onChange={(e) => handleInputChange('highSchoolName', e.target.value)} />
                  </div>
                  <div className="space-y-2"><Label htmlFor="highSchoolCity">{t('adminStudentForm.fieldCity')}</Label>
                    <Input id="highSchoolCity" value={v('highSchoolCity')} onChange={(e) => handleInputChange('highSchoolCity', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="highSchoolCountry">{t('adminStudentForm.fieldHighSchoolCountry')}</Label>
                    <Input id="highSchoolCountry" value={v('highSchoolCountry')} onChange={(e) => handleInputChange('highSchoolCountry', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="highSchoolGPA">{t('adminStudentForm.fieldGpa')}</Label>
                    <Input id="highSchoolGPA" value={v('highSchoolGPA')} onChange={(e) => handleInputChange('highSchoolGPA', e.target.value)} placeholder={t('adminStudentForm.placeholderGpa')} /></div>
                  <div className="space-y-2"><Label htmlFor="highSchoolGraduationDate">{t('adminStudentForm.fieldGraduationDate')}</Label>
                    <Input id="highSchoolGraduationDate" type="date" value={v('highSchoolGraduationDate')} onChange={(e) => handleInputChange('highSchoolGraduationDate', e.target.value)} /></div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('adminStudentForm.sectionBachelorsDegree')}</h3>
                  <button
                    type="button"
                    onClick={() => openTranscriptOcr('bachelor')}
                    className="inline-flex items-center gap-1 text-xs border border-[#1B2A4A] text-[#1B2A4A] px-2.5 py-1 hover:bg-[#1B2A4A] hover:text-white transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    {t('adminStudentForm.ocrButtonTranscriptBachelor')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="bachelorUniversityName">{t('adminStudentForm.fieldUniversityName')}</Label>
                    <Input id="bachelorUniversityName" value={v('bachelorUniversityName')} onChange={(e) => handleInputChange('bachelorUniversityName', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="bachelorMajor">{t('adminStudentForm.fieldMajor')}</Label>
                    <Input id="bachelorMajor" value={v('bachelorMajor')} onChange={(e) => handleInputChange('bachelorMajor', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="bachelorGPA">{t('adminStudentForm.fieldGpa')}</Label>
                    <Input id="bachelorGPA" value={v('bachelorGPA')} onChange={(e) => handleInputChange('bachelorGPA', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="bachelorGraduationDate">{t('adminStudentForm.fieldGraduationDate')}</Label>
                    <Input id="bachelorGraduationDate" type="date" value={v('bachelorGraduationDate')} onChange={(e) => handleInputChange('bachelorGraduationDate', e.target.value)} /></div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('adminStudentForm.sectionMastersDegree')}</h3>
                  <button
                    type="button"
                    onClick={() => openTranscriptOcr('master')}
                    className="inline-flex items-center gap-1 text-xs border border-[#1B2A4A] text-[#1B2A4A] px-2.5 py-1 hover:bg-[#1B2A4A] hover:text-white transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    {t('adminStudentForm.ocrButtonTranscriptMaster')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="masterUniversityName">{t('adminStudentForm.fieldUniversityName')}</Label>
                    <Input id="masterUniversityName" value={v('masterUniversityName')} onChange={(e) => handleInputChange('masterUniversityName', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="masterMajor">{t('adminStudentForm.fieldMajor')}</Label>
                    <Input id="masterMajor" value={v('masterMajor')} onChange={(e) => handleInputChange('masterMajor', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="masterGPA">{t('adminStudentForm.fieldGpa')}</Label>
                    <Input id="masterGPA" value={v('masterGPA')} onChange={(e) => handleInputChange('masterGPA', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="masterGraduationDate">{t('adminStudentForm.fieldGraduationDate')}</Label>
                    <Input id="masterGraduationDate" type="date" value={v('masterGraduationDate')} onChange={(e) => handleInputChange('masterGraduationDate', e.target.value)} /></div>
                </div>
              </div>
            )}

            {/* Step 3: Language & Target */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">{t('adminStudentForm.sectionLanguageProficiency')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="hskLevel">{t('adminStudentForm.fieldHskLevel')}</Label>
                    <Select value={v('hskLevel')} onValueChange={(value) => handleInputChange('hskLevel', value)}>
                      <SelectTrigger><SelectValue placeholder={t('adminStudentForm.selectHskLevel')} /></SelectTrigger>
                      <SelectContent>
                        {['1','2','3','4','5','6'].map((n) => (
                          <SelectItem key={n} value={n}>HSK {n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label htmlFor="hskScore">{t('adminStudentForm.fieldHskScore')}</Label>
                    <Input id="hskScore" value={v('hskScore')} onChange={(e) => handleInputChange('hskScore', e.target.value)} placeholder={t('adminStudentForm.placeholderHskScore')} /></div>
                  <div className="space-y-2"><Label htmlFor="ieltsScore">{t('adminStudentForm.fieldIeltsScore')}</Label>
                    <Input id="ieltsScore" value={v('ieltsScore')} onChange={(e) => handleInputChange('ieltsScore', e.target.value)} placeholder={t('adminStudentForm.placeholderIeltsScore')} /></div>
                  <div className="space-y-2"><Label htmlFor="toeflScore">{t('adminStudentForm.fieldToeflScore')}</Label>
                    <Input id="toeflScore" value={v('toeflScore')} onChange={(e) => handleInputChange('toeflScore', e.target.value)} placeholder={t('adminStudentForm.placeholderToeflScore')} /></div>
                </div>

                <Separator />

                {/* Phase 181: the edit form had NO passport section at
                    all — number, issue date and expiry were creation-only,
                    so a typo in a passport number could never be fixed.
                    Passport expiry in particular drives application
                    urgency, so it must be correctable. */}
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">{t('adminStudentForm.fieldPassportNumber')}</Label>
                  <Input id="passportNumber" value={v('passportNumber')}
                    onChange={(e) => handleInputChange('passportNumber', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passportIssueDate">{t('adminStudentForm.fieldPassportIssueDate')}</Label>
                    <Input id="passportIssueDate" type="date" value={v('passportIssueDate')}
                      onChange={(e) => handleInputChange('passportIssueDate', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passportExpiryDate">{t('adminStudentForm.fieldPassportExpiryDate')}</Label>
                    <Input id="passportExpiryDate" type="date" value={v('passportExpiryDate')}
                      onChange={(e) => handleInputChange('passportExpiryDate', e.target.value)} />
                  </div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">{t('adminStudentForm.sectionTargetApplication')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="targetDegree">{t('adminStudentForm.fieldTargetDegree')}</Label>
                    <Select value={v('targetDegree')} onValueChange={(value) => handleInputChange('targetDegree', value)}>
                      <SelectTrigger><SelectValue placeholder={t('adminStudentForm.selectDegree')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bachelor">Bachelor's</SelectItem>
                        <SelectItem value="Master">Master's</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                        <SelectItem value="Chinese Language">Chinese Language</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Phase 181: targetField (the student's intended
                      major) was settable at creation but NOT editable
                      afterwards — so a student's plan could never be
                      corrected, which also desynchronises it from the
                      target_degree they applied under. */}
                  <div className="space-y-2"><Label htmlFor="targetField">{t('adminStudentForm.fieldTargetField')}</Label>
                    <Input id="targetField" value={v('targetField')}
                      onChange={(e) => handleInputChange('targetField', e.target.value)} />
                  </div>
                  <div className="space-y-2"><Label htmlFor="targetIntake">{t('adminStudentForm.fieldTargetIntake')}</Label>
                    <Select value={v('targetIntake')} onValueChange={(value) => handleInputChange('targetIntake', value)}>
                      <SelectTrigger><SelectValue placeholder={t('adminStudentForm.selectIntake')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="September 2025">September 2025</SelectItem>
                        <SelectItem value="March 2026">March 2026</SelectItem>
                        <SelectItem value="September 2026">September 2026</SelectItem>
                        <SelectItem value="March 2027">March 2027</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">{t('adminStudentForm.fieldNotes')}</h3>
                <div className="space-y-2">
                  <Textarea
                    id="notes"
                    value={v('notes')}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    placeholder={t('adminStudentForm.placeholderNotesEdit')}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('adminStudentForm.step4Title')}</h3>
                <p
                  className="text-sm text-gray-600"
                  // reviewDescriptionEdit includes inline <strong> markup around
                  // the "Update Student" CTA reference — same pattern the
                  // hardcoded English copy used.
                  dangerouslySetInnerHTML={{ __html: t('adminStudentForm.reviewDescriptionEdit') }}
                />
                <Card>
                  <CardHeader><CardTitle>{t('adminStudentForm.reviewCardPersonalEdit')}</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><span className="text-gray-500">{t('adminStudentForm.reviewLabelName')}</span> {v('firstName')} {v('lastName')}</p>
                    <p><span className="text-gray-500">{t('adminStudentForm.reviewLabelDob')}</span> {v('dateOfBirth') || '—'}</p>
                    <p><span className="text-gray-500">{t('adminStudentForm.reviewLabelNationality')}</span> {v('nationality') || '—'}</p>
                    <p><span className="text-gray-500">{t('adminStudentForm.reviewLabelEmail')}</span> {v('email')}</p>
                    <p><span className="text-gray-500">{t('adminStudentForm.reviewLabelPhone')}</span> {v('phone')}</p>
                    <p><span className="text-gray-500">{t('adminStudentForm.reviewLabelStatus')}</span> {v('status') || 'Active'}</p>
                    <p><span className="text-gray-500">{t('adminStudentForm.reviewLabelSource')}</span> {v('source') || 'Online'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>{t('adminStudentForm.reviewCardTargetEdit')}</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><span className="text-gray-500">{t('adminStudentForm.reviewLabelTargetDegree')}</span> {v('targetDegree') || '—'}</p>
                    <p><span className="text-gray-500">{t('adminStudentForm.reviewLabelTargetIntake')}</span> {v('targetIntake') || '—'}</p>
                    <p><span className="text-gray-500">{t('adminStudentForm.reviewLabelHskLevel')}</span> {v('hskLevel') || '—'}</p>
                    <p><span className="text-gray-500">{t('adminStudentForm.reviewLabelIelts')}</span> {v('ieltsScore') || '—'}</p>
                    <p><span className="text-gray-500">{t('adminStudentForm.reviewLabelToefl')}</span> {v('toeflScore') || '—'}</p>
                  </CardContent>
                </Card>
                {v('notes') && (
                  <Card>
                    <CardHeader><CardTitle>{t('adminStudentForm.reviewCardNotesEdit')}</CardTitle></CardHeader>
                    <CardContent><p className="text-sm">{v('notes')}</p></CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 pb-4">
              <p className="text-red-800 text-sm"><strong>{t('adminStudentForm.errorPrefix')}</strong> {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={currentStep === 0 ? () => router.push(`/admin/students/${studentId}`) : handlePrevious}
          >
            {currentStep === 0 ? (
              <><ArrowLeft className="h-4 w-4 mr-2" /> {t('adminStudentForm.buttonCancel')}</>
            ) : (
              <><ChevronLeft className="h-4 w-4 mr-2" /> {t('adminStudentForm.buttonPrevious')}</>
            )}
          </Button>
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} className="bg-[#1B2A4A] hover:bg-[#152138]">
              {t('adminStudentForm.buttonNext')} <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isSaving} className="bg-[#9B1B30] hover:bg-[#7A1526]">
              {isSaving ? (
                <><><Spinner size="sm" className="mr-2" /> {t('adminStudentForm.buttonSaving')}</></>
              ) : (
                <><Check className="h-4 w-4 mr-2" /> {t('adminStudentForm.buttonUpdateEdit')}</>
              )}
            </Button>
          )}
        </div>
      </div>

      {ocrKind && (
        <OcrUploadModal
          open
          onOpenChange={(o) => !o && closeOcr()}
          kind={ocrKind}
          transcriptLevel={ocrKind === 'transcript' ? transcriptLevel : undefined}
          existingFieldKeys={ocrExistingFieldKeys}
          onApply={applyOcr}
        />
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { User, Edit, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetchJson } from '@/lib/api-client';

interface StudentProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  nationality: string | null;
  date_of_birth: string | null;
  passport_number: string | null;
  passport_expiry: string | null;
  current_address: string | null;
  permanent_address: string | null;
  highest_education: string | null;
  school_name: string | null;
  graduation_year: string | null;
  gpa: string | null;
  english_proficiency: string | null;
  english_score: string | null;
  target_degree: string | null;
  target_field: string | null;
  target_intake: string | null;
  preferred_universities: string[] | null;
}

const EMPTY_PROFILE: StudentProfile = {
  id: '',
  first_name: '',
  last_name: '',
  phone: '',
  nationality: '',
  date_of_birth: '',
  passport_number: '',
  passport_expiry: '',
  current_address: '',
  permanent_address: '',
  highest_education: '',
  school_name: '',
  graduation_year: '',
  gpa: '',
  english_proficiency: '',
  english_score: '',
  target_degree: '',
  target_field: '',
  target_intake: '',
  preferred_universities: [],
};

// Allowed target degree values — mirrors the enum the wizard uses.
const TARGET_DEGREES = ['Bachelor', 'Master', 'PhD', 'Chinese Language'] as const;
const ENGLISH_PROFICIENCY = ['IELTS', 'TOEFL', 'Duolingo', 'PTE', 'Other'] as const;
const HIGHEST_EDUCATION = ['High School', 'Diploma', 'Bachelor', 'Master', 'PhD', 'Other'] as const;

export default function StudentProfilePage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [profile, setProfile] = useState<StudentProfile>(EMPTY_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetchJson<{ data: StudentProfile }>('/api/student/profile');
      setProfile({ ...EMPTY_PROFILE, ...res.data });
    } catch (err) {
      const e = err as { message?: string; status?: number };
      // 404 is fine — the trigger that creates the profile row on
      // sign-up may not have run for older accounts. Show empty form
      // and let the user fill it in.
      if (e.status !== 404) {
        setError(e.message || t('studentProfile.errorFailedToLoad'));
      }
      setProfile(EMPTY_PROFILE);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleChange = (key: keyof StudentProfile, value: string | string[]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    if (savedAt) setSavedAt(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Only send editable fields — strip id/created_at/updated_at
      // and convert empty strings to null so the DB doesn't end up
      // with a forest of empty string rows.
      const payload: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(profile)) {
        if (k === 'id') continue;
        if (typeof v === 'string') {
          payload[k] = v.trim() === '' || v === '_unset_' ? null : v.trim();
        } else if (Array.isArray(v)) {
          payload[k] = v.length === 0 ? null : v;
        } else {
          payload[k] = v;
        }
      }
      const res = await apiFetchJson<{ data: StudentProfile }>('/api/student/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setProfile({ ...EMPTY_PROFILE, ...res.data });
      setSavedAt(new Date());
      setIsEditing(false);
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message || t('studentProfile.errorFailedToSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    void load(); // re-fetch the canonical state
  };

  // Phase 4D: profile completeness meter. We count the fields that
  // meaningfully help SICA advise + process applications.
  const COMPLETENESS_FIELDS: Array<keyof StudentProfile> = [
    'first_name',
    'last_name',
    'phone',
    'nationality',
    'date_of_birth',
    'highest_education',
    'target_degree',
    'target_field',
    'target_intake',
  ];
  const completedFields = COMPLETENESS_FIELDS.filter((k) => {
    const v = profile[k];
    return v !== null && v !== undefined && String(v).trim() !== '';
  }).length;
  const completeness = Math.round((completedFields / COMPLETENESS_FIELDS.length) * 100);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded-none w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 animate-pulse rounded-none" />
          <div className="h-96 bg-gray-200 animate-pulse rounded-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('studentProfile.title')}</h1>
          <p className="text-[#4B5563] mt-1">
            {t('studentProfile.subtitle')} ·{' '}
            <span className="font-mono text-xs">{user?.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && !isEditing && (
            <span className="inline-flex items-center gap-1 text-xs text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t('studentProfile.saved', { time: savedAt.toLocaleTimeString() })}
            </span>
          )}
          {!isEditing ? (
            <Button
              className="rounded-none"
              onClick={() => { setSavedAt(null); setIsEditing(true); }}
            >
              <Edit className="mr-2 h-4 w-4" />
              {t('studentProfile.edit')}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="rounded-none"
                onClick={handleCancel}
                disabled={isSaving}
              >
                {t('studentProfile.cancel')}
              </Button>
              <Button
                className="rounded-none bg-[#9B1B30] hover:bg-[#7A1526]"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? t('studentProfile.saving') : t('studentProfile.save')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Phase 4D: profile completeness card. */}
      <Card className="rounded-none border-[#1B2A4A]/10 bg-[#1B2A4A]/5">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1B2A4A]">
                {t('studentProfile.completenessTitle', { percent: completeness })}
              </p>
              <p className="text-xs text-[#4B5563] mt-0.5">
                {completeness < 100
                  ? t('studentProfile.completenessHint')
                  : t('studentProfile.completenessComplete')}
              </p>
            </div>
            <div className="sm:w-1/3">
              <Progress value={completeness} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('studentProfile.personalInfoTitle')}
            </CardTitle>
            <CardDescription>{t('studentProfile.personalInfoDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">{t('studentProfile.firstName')}</Label>
                <Input
                  id="first_name"
                  value={profile.first_name ?? ''}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  disabled={!isEditing}
                  className="rounded-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">{t('studentProfile.lastName')}</Label>
                <Input
                  id="last_name"
                  value={profile.last_name ?? ''}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  disabled={!isEditing}
                  className="rounded-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('studentProfile.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone ?? ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={!isEditing}
                className="rounded-none"
                placeholder="+86 138 0000 0000"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nationality">{t('studentProfile.nationality')}</Label>
                <Input
                  id="nationality"
                  value={profile.nationality ?? ''}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  disabled={!isEditing}
                  className="rounded-none"
                  placeholder="e.g., Nigeria, Brazil, Vietnam"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">{t('studentProfile.dateOfBirth')}</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={profile.date_of_birth ?? ''}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  disabled={!isEditing}
                  className="rounded-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="passport_number">{t('studentProfile.passportNumber')}</Label>
              <Input
                id="passport_number"
                value={profile.passport_number ?? ''}
                onChange={(e) => handleChange('passport_number', e.target.value)}
                disabled={!isEditing}
                className="rounded-none"
                placeholder="e.g., E1234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passport_expiry">{t('studentProfile.passportExpiry')}</Label>
              <Input
                id="passport_expiry"
                type="date"
                value={profile.passport_expiry ?? ''}
                onChange={(e) => handleChange('passport_expiry', e.target.value)}
                disabled={!isEditing}
                className="rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_address">{t('studentProfile.currentAddress')}</Label>
              <Input
                id="current_address"
                value={profile.current_address ?? ''}
                onChange={(e) => handleChange('current_address', e.target.value)}
                disabled={!isEditing}
                className="rounded-none"
                placeholder="Where you live now"
              />
            </div>
          </CardContent>
        </Card>

        {/* Education & Preferences */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>{t('studentProfile.educationTitle')}</CardTitle>
            <CardDescription>{t('studentProfile.educationDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="highest_education">{t('studentProfile.highestEducation')}</Label>
              <Select
                value={profile.highest_education ?? ''}
                onValueChange={(value) => handleChange('highest_education', value)}
                disabled={!isEditing}
              >
                <SelectTrigger id="highest_education" className="rounded-none">
                  <SelectValue placeholder={t('studentProfile.notSet')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_unset_">{t('studentProfile.notSet')}</SelectItem>
                  {HIGHEST_EDUCATION.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="school_name">{t('studentProfile.schoolName')}</Label>
              <Input
                id="school_name"
                value={profile.school_name ?? ''}
                onChange={(e) => handleChange('school_name', e.target.value)}
                disabled={!isEditing}
                className="rounded-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="graduation_year">{t('studentProfile.graduationYear')}</Label>
                <Input
                  id="graduation_year"
                  value={profile.graduation_year ?? ''}
                  onChange={(e) => handleChange('graduation_year', e.target.value)}
                  disabled={!isEditing}
                  className="rounded-none"
                  placeholder="e.g., 2023"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpa">{t('studentProfile.gpa')}</Label>
                <Input
                  id="gpa"
                  value={profile.gpa ?? ''}
                  onChange={(e) => handleChange('gpa', e.target.value)}
                  disabled={!isEditing}
                  className="rounded-none"
                  placeholder="e.g., 3.8 / 4.0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="english_proficiency">{t('studentProfile.englishTest')}</Label>
                <Select
                  value={profile.english_proficiency ?? ''}
                  onValueChange={(value) => handleChange('english_proficiency', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="english_proficiency" className="rounded-none">
                    <SelectValue placeholder={t('studentProfile.notSet')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_unset_">{t('studentProfile.notSet')}</SelectItem>
                    {ENGLISH_PROFICIENCY.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="english_score">{t('studentProfile.testScore')}</Label>
                <Input
                  id="english_score"
                  value={profile.english_score ?? ''}
                  onChange={(e) => handleChange('english_score', e.target.value)}
                  disabled={!isEditing}
                  className="rounded-none"
                  placeholder="e.g., 7.0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target_degree">{t('studentProfile.targetDegree')}</Label>
                <Select
                  value={profile.target_degree ?? ''}
                  onValueChange={(value) => handleChange('target_degree', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="target_degree" className="rounded-none">
                    <SelectValue placeholder={t('studentProfile.notSet')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_unset_">{t('studentProfile.notSet')}</SelectItem>
                    {TARGET_DEGREES.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_intake">{t('studentProfile.targetIntake')}</Label>
                <Input
                  id="target_intake"
                  value={profile.target_intake ?? ''}
                  onChange={(e) => handleChange('target_intake', e.target.value)}
                  disabled={!isEditing}
                  className="rounded-none"
                  placeholder="e.g., Fall 2026"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_field">{t('studentProfile.fieldOfStudy')}</Label>
              <Input
                id="target_field"
                value={profile.target_field ?? ''}
                onChange={(e) => handleChange('target_field', e.target.value)}
                disabled={!isEditing}
                className="rounded-none"
                placeholder="e.g., Computer Science"
              />
            </div>
            {/* Phase 4D: preferred universities — comma-separated for now. */}
            <div className="space-y-2">
              <Label htmlFor="preferred_universities">{t('studentProfile.preferredUniversities')}</Label>
              <Input
                id="preferred_universities"
                value={(profile.preferred_universities ?? []).join(', ')}
                onChange={(e) =>
                  handleChange(
                    'preferred_universities',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  )
                }
                disabled={!isEditing}
                className="rounded-none"
                placeholder="e.g., Tsinghua University, Peking University"
              />
              <p className="text-xs text-gray-500">
                {t('studentProfile.preferredUniversitiesHint')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
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
  'targetIntake',
  'source',
  'status',
] as const;

export default function AdminAddStudentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    studentId: string;
    studentName: string;
    studentEmail: string;
    temporaryPassword?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    gender: '',
    maritalStatus: '',

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
    masterUniversityName: '',
    masterUniversityCity: '',
    masterUniversityCountry: '',
    masterMajor: '',
    masterGPA: '',
    masterGraduationDate: '',

    // Language Proficiency
    hskLevel: '',
    hskScore: '',
    ieltsScore: '',
    toeflScore: '',

    // Target
    targetDegree: '',
    targetIntake: '',

    // Notes
    notes: ''
  });

  // Accept (name, value) directly so both <Input onChange={e => ...}> and
  // <Select onValueChange={value => ...}> can call it without faking a ChangeEvent.
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      }>('/api/admin/students', {
        method: 'POST',
        body: JSON.stringify(buildPayload()),
      });
      setSuccess({
        studentId: data.student.id,
        studentName: `${data.student.firstName} ${data.student.lastName}`.trim(),
        studentEmail: data.student.email,
        temporaryPassword: data.temporaryPassword,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create student');
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
                <h2 className="text-2xl font-bold text-[#1B2A4A]">Student Created</h2>
                <p className="text-[#4B5563] mt-2">
                  <strong>{success.studentName || success.studentEmail}</strong> is now in the system.
                </p>
              </div>

              {success.temporaryPassword && (
                <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-amber-900 text-sm">
                        Temporary password — share with the student NOW
                      </p>
                      <p className="text-amber-800 text-sm mt-1">
                        The student must use this to log in, then reset it on first use.
                        This password will not be shown again.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded font-mono text-sm select-all">
                          {success.temporaryPassword}
                        </code>
                        <Button size="sm" variant="outline" onClick={copyPassword}>
                          <Copy className="w-4 h-4 mr-1" />
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" asChild>
                  <Link href="/admin/students">Back to Students</Link>
                </Button>
                <Button
                  className="bg-[#9B1B30] hover:bg-[#7A1526]"
                  asChild
                >
                  <Link href={`/admin/students/${success.studentId}`}>
                    View Student Profile
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
                Add New Student
                <Badge className="bg-[#9B1B30] hover:bg-[#7A1526]">
                  Offline Student
                </Badge>
              </h1>
              <p className="text-[#4B5563] mt-1">Enter offline student information</p>
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
                { n: 1, label: 'Personal Info', Icon: User },
                { n: 2, label: 'Education', Icon: GraduationCap },
                { n: 3, label: 'Language', Icon: BookOpen },
                { n: 4, label: 'Review', Icon: CheckCircle2 },
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
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#1B2A4A]" />
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Personal Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-[#1B2A4A]">First Name *</Label>
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
                    <Label htmlFor="lastName" className="text-[#1B2A4A]">Last Name *</Label>
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
                    <Label htmlFor="dateOfBirth" className="text-[#1B2A4A]">Date of Birth *</Label>
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
                    <Label htmlFor="nationality" className="text-[#1B2A4A]">Nationality *</Label>
                    <Input
                      id="nationality"
                      name="nationality"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                      placeholder="e.g., USA, UK, China"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="passportNumber" className="text-[#1B2A4A]">Passport Number</Label>
                    <Input
                      id="passportNumber"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender" className="text-[#1B2A4A]">Gender</Label>
                    <Select name="gender" value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#1B2A4A]" />
                  <h3 className="text-md font-semibold text-[#1B2A4A]">Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="text-[#1B2A4A]">Email *</Label>
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
                    <Label htmlFor="phone" className="text-[#1B2A4A]">Phone *</Label>
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
                    <Label htmlFor="whatsapp" className="text-[#1B2A4A]">WhatsApp</Label>
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
                    <Label htmlFor="country" className="text-[#1B2A4A]">Country *</Label>
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
                    <Label htmlFor="address" className="text-[#1B2A4A]">Address</Label>
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
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#1B2A4A]" />
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Education Background</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-semibold text-[#1B2A4A] mb-4">High School</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label htmlFor="highSchoolName" className="text-[#1B2A4A]">High School Name</Label>
                        <Input
                          id="highSchoolName"
                          name="highSchoolName"
                          value={formData.highSchoolName}
                          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="highSchoolCity" className="text-[#1B2A4A]">City</Label>
                        <Input
                          id="highSchoolCity"
                          name="highSchoolCity"
                          value={formData.highSchoolCity}
                          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="highSchoolCountry" className="text-[#1B2A4A]">Country</Label>
                        <Input
                          id="highSchoolCountry"
                          name="highSchoolCountry"
                          value={formData.highSchoolCountry}
                          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="highSchoolGPA" className="text-[#1B2A4A]">GPA</Label>
                        <Input
                          id="highSchoolGPA"
                          name="highSchoolGPA"
                          value={formData.highSchoolGPA}
                          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          className="mt-2"
                          placeholder="e.g., 3.8/4.0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="highSchoolGraduationDate" className="text-[#1B2A4A]">Graduation Date</Label>
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
                    <h3 className="text-md font-semibold text-[#1B2A4A] mb-4">Bachelor's Degree (if applicable)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label htmlFor="bachelorUniversityName" className="text-[#1B2A4A]">University Name</Label>
                        <Input
                          id="bachelorUniversityName"
                          name="bachelorUniversityName"
                          value={formData.bachelorUniversityName}
                          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bachelorMajor" className="text-[#1B2A4A]">Major</Label>
                        <Input
                          id="bachelorMajor"
                          name="bachelorMajor"
                          value={formData.bachelorMajor}
                          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bachelorGPA" className="text-[#1B2A4A]">GPA</Label>
                        <Input
                          id="bachelorGPA"
                          name="bachelorGPA"
                          value={formData.bachelorGPA}
                          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bachelorGraduationDate" className="text-[#1B2A4A]">Graduation Date</Label>
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
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Language Proficiency & Target</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="hskLevel" className="text-[#1B2A4A]">HSK Level</Label>
                    <Select name="hskLevel" value={formData.hskLevel} onValueChange={(value) => handleInputChange('hskLevel', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select HSK level" />
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
                    <Label htmlFor="hskScore" className="text-[#1B2A4A]">HSK Score</Label>
                    <Input
                      id="hskScore"
                      name="hskScore"
                      value={formData.hskScore}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                      placeholder="e.g., 280"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ieltsScore" className="text-[#1B2A4A]">IELTS Score</Label>
                    <Input
                      id="ieltsScore"
                      name="ieltsScore"
                      value={formData.ieltsScore}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                      placeholder="e.g., 6.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="toeflScore" className="text-[#1B2A4A]">TOEFL Score</Label>
                    <Input
                      id="toeflScore"
                      name="toeflScore"
                      value={formData.toeflScore}
                      onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      className="mt-2"
                      placeholder="e.g., 90"
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-md font-semibold text-[#1B2A4A] mb-4">Target Application</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="targetDegree" className="text-[#1B2A4A]">Target Degree</Label>
                      <Select name="targetDegree" value={formData.targetDegree} onValueChange={(value) => handleInputChange('targetDegree', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select degree" />
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
                      <Label htmlFor="targetIntake" className="text-[#1B2A4A]">Target Intake</Label>
                      <Select name="targetIntake" value={formData.targetIntake} onValueChange={(value) => handleInputChange('targetIntake', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select intake" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="September 2025">September 2025</SelectItem>
                          <SelectItem value="March 2026">March 2026</SelectItem>
                          <SelectItem value="September 2026">September 2026</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="mt-8">
                  <Label htmlFor="notes" className="text-[#1B2A4A]">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                    rows={5}
                    className="mt-2"
                    placeholder="Any additional information about the student..."
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#1B2A4A]" />
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Review Student Information</h2>
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#1B2A4A]">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-[#4B5563]">Name:</span> <span className="font-medium">{formData.firstName} {formData.lastName}</span></div>
                        <div><span className="text-[#4B5563]">Date of Birth:</span> <span className="font-medium">{formData.dateOfBirth || '-'}</span></div>
                        <div><span className="text-[#4B5563]">Nationality:</span> <span className="font-medium">{formData.nationality || '-'}</span></div>
                        <div><span className="text-[#4B5563]">Email:</span> <span className="font-medium">{formData.email || '-'}</span></div>
                        <div><span className="text-[#4B5563]">Phone:</span> <span className="font-medium">{formData.phone || '-'}</span></div>
                        <div><span className="text-[#4B5563]">Country:</span> <span className="font-medium">{formData.country || '-'}</span></div>
                      </div>
                    </CardContent>
                  </Card>

                  {(formData.highSchoolName || formData.bachelorUniversityName) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-[#1B2A4A]">Education</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {formData.highSchoolName && (
                            <div className="col-span-2"><span className="text-[#4B5563]">High School:</span> <span className="font-medium">{formData.highSchoolName}</span></div>
                          )}
                          {formData.bachelorUniversityName && (
                            <>
                              <div><span className="text-[#4B5563]">Bachelor's University:</span> <span className="font-medium">{formData.bachelorUniversityName}</span></div>
                              <div><span className="text-[#4B5563]">Major:</span> <span className="font-medium">{formData.bachelorMajor}</span></div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {(formData.hskLevel || formData.ieltsScore || formData.toeflScore || formData.targetDegree) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-[#1B2A4A]">Language & Target</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {formData.hskLevel && (
                            <div><span className="text-[#4B5563]">HSK Level:</span> <span className="font-medium">{formData.hskLevel}</span></div>
                          )}
                          {formData.ieltsScore && (
                            <div><span className="text-[#4B5563]">IELTS:</span> <span className="font-medium">{formData.ieltsScore}</span></div>
                          )}
                          {formData.toeflScore && (
                            <div><span className="text-[#4B5563]">TOEFL:</span> <span className="font-medium">{formData.toeflScore}</span></div>
                          )}
                          {formData.targetDegree && (
                            <div><span className="text-[#4B5563]">Target Degree:</span> <span className="font-medium">{formData.targetDegree}</span></div>
                          )}
                          {formData.targetIntake && (
                            <div><span className="text-[#4B5563]">Target Intake:</span> <span className="font-medium">{formData.targetIntake}</span></div>
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
              Previous
            </Button>
          ) : (
            <Button variant="secondary" asChild>
              <Link href="/admin/students">
                Cancel
              </Link>
            </Button>
          )}
          
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)} className="bg-[#1B2A4A] hover:bg-[#152138]">
              Next
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isSaving} className="bg-[#9B1B30] hover:bg-[#7A1526]">
              {isSaving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Student
                </>
              )}
            </Button>
          )}
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 pb-4">
              <p className="text-red-800 text-sm">
                <strong>Error:</strong> {error}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

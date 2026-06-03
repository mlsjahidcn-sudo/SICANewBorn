'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiFetchJson } from '@/lib/api-client';
import type { AdminStudent } from '@/lib/student-mapper';

const STEPS = ['Personal Info', 'Education', 'Language & Target', 'Review'];

// Fields with fixed columns. Everything else lives in `extra` JSONB.
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

export default function AdminStudentEditPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Form state — covers all fields the API supports (fixed + extra).
  // initial state is empty; we populate from the GET response in useEffect.
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
        setFormData(flat);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (err.status === 404) {
          setNotFound(true);
        } else {
          setError(err.message || 'Failed to load student');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [studentId]);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
        if (value === '' || value === null || value === undefined) continue;
        if ((FIXED_FIELDS as readonly string[]).includes(key)) {
          payload[key] = value;
        } else {
          extra[key] = value;
        }
      }
      if (Object.keys(extra).length > 0) payload.extra = extra;

      await apiFetchJson(`/api/admin/students/${studentId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      router.push(`/admin/students/${studentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update student');
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
              <h3 className="text-lg font-semibold mb-2">Student Not Found</h3>
              <p className="text-gray-500 mb-4">This student may have been deleted or doesn't exist.</p>
              <Button onClick={() => router.push('/admin/students')}>
                Back to Students
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
              Back to Student
            </Button>
          </div>
          <Badge className="bg-[#1B2A4A] text-white">
            Edit Student
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
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" value={v('firstName')} onChange={(e) => handleInputChange('firstName', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" value={v('lastName')} onChange={(e) => handleInputChange('lastName', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input id="dateOfBirth" type="date" value={v('dateOfBirth')} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Input id="nationality" value={v('nationality')} onChange={(e) => handleInputChange('nationality', e.target.value)} placeholder="e.g., Bangladesh" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={v('gender')} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">Marital Status</Label>
                    <Select value={v('maritalStatus')} onValueChange={(value) => handleInputChange('maritalStatus', value)}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={v('email')} onChange={(e) => handleInputChange('email', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" value={v('phone')} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="+86 138 0000 0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="whatsapp" value={v('whatsapp')} onChange={(e) => handleInputChange('whatsapp', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={v('country')} onChange={(e) => handleInputChange('country', e.target.value)} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" value={v('address')} onChange={(e) => handleInputChange('address', e.target.value)} rows={2} />
                  </div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Student Status</Label>
                    <Select value={v('status')} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Select value={v('source')} onValueChange={(value) => handleInputChange('source', value)}>
                      <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin (Offline)</SelectItem>
                        <SelectItem value="Partner">Partner</SelectItem>
                        <SelectItem value="Online">Online (Self-signup)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Education */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">High School</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="highSchoolName">High School Name</Label>
                    <Input id="highSchoolName" value={v('highSchoolName')} onChange={(e) => handleInputChange('highSchoolName', e.target.value)} />
                  </div>
                  <div className="space-y-2"><Label htmlFor="highSchoolCity">City</Label>
                    <Input id="highSchoolCity" value={v('highSchoolCity')} onChange={(e) => handleInputChange('highSchoolCity', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="highSchoolCountry">Country</Label>
                    <Input id="highSchoolCountry" value={v('highSchoolCountry')} onChange={(e) => handleInputChange('highSchoolCountry', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="highSchoolGPA">GPA</Label>
                    <Input id="highSchoolGPA" value={v('highSchoolGPA')} onChange={(e) => handleInputChange('highSchoolGPA', e.target.value)} placeholder="e.g., 3.8/4.0" /></div>
                  <div className="space-y-2"><Label htmlFor="highSchoolGraduationDate">Graduation Date</Label>
                    <Input id="highSchoolGraduationDate" type="date" value={v('highSchoolGraduationDate')} onChange={(e) => handleInputChange('highSchoolGraduationDate', e.target.value)} /></div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">Bachelor's Degree (if applicable)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="bachelorUniversityName">University Name</Label>
                    <Input id="bachelorUniversityName" value={v('bachelorUniversityName')} onChange={(e) => handleInputChange('bachelorUniversityName', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="bachelorMajor">Major</Label>
                    <Input id="bachelorMajor" value={v('bachelorMajor')} onChange={(e) => handleInputChange('bachelorMajor', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="bachelorGPA">GPA</Label>
                    <Input id="bachelorGPA" value={v('bachelorGPA')} onChange={(e) => handleInputChange('bachelorGPA', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="bachelorGraduationDate">Graduation Date</Label>
                    <Input id="bachelorGraduationDate" type="date" value={v('bachelorGraduationDate')} onChange={(e) => handleInputChange('bachelorGraduationDate', e.target.value)} /></div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">Master's Degree (if applicable)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="masterUniversityName">University Name</Label>
                    <Input id="masterUniversityName" value={v('masterUniversityName')} onChange={(e) => handleInputChange('masterUniversityName', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="masterMajor">Major</Label>
                    <Input id="masterMajor" value={v('masterMajor')} onChange={(e) => handleInputChange('masterMajor', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="masterGPA">GPA</Label>
                    <Input id="masterGPA" value={v('masterGPA')} onChange={(e) => handleInputChange('masterGPA', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="masterGraduationDate">Graduation Date</Label>
                    <Input id="masterGraduationDate" type="date" value={v('masterGraduationDate')} onChange={(e) => handleInputChange('masterGraduationDate', e.target.value)} /></div>
                </div>
              </div>
            )}

            {/* Step 3: Language & Target */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Language Proficiency</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="hskLevel">HSK Level</Label>
                    <Select value={v('hskLevel')} onValueChange={(value) => handleInputChange('hskLevel', value)}>
                      <SelectTrigger><SelectValue placeholder="Select HSK level" /></SelectTrigger>
                      <SelectContent>
                        {['1','2','3','4','5','6'].map((n) => (
                          <SelectItem key={n} value={n}>HSK {n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label htmlFor="hskScore">HSK Score</Label>
                    <Input id="hskScore" value={v('hskScore')} onChange={(e) => handleInputChange('hskScore', e.target.value)} placeholder="e.g., 280" /></div>
                  <div className="space-y-2"><Label htmlFor="ieltsScore">IELTS Score</Label>
                    <Input id="ieltsScore" value={v('ieltsScore')} onChange={(e) => handleInputChange('ieltsScore', e.target.value)} placeholder="e.g., 6.5" /></div>
                  <div className="space-y-2"><Label htmlFor="toeflScore">TOEFL Score</Label>
                    <Input id="toeflScore" value={v('toeflScore')} onChange={(e) => handleInputChange('toeflScore', e.target.value)} placeholder="e.g., 90" /></div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">Target Application</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="targetDegree">Target Degree</Label>
                    <Select value={v('targetDegree')} onValueChange={(value) => handleInputChange('targetDegree', value)}>
                      <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bachelor">Bachelor's</SelectItem>
                        <SelectItem value="Master">Master's</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                        <SelectItem value="Chinese Language">Chinese Language</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label htmlFor="targetIntake">Target Intake</Label>
                    <Select value={v('targetIntake')} onValueChange={(value) => handleInputChange('targetIntake', value)}>
                      <SelectTrigger><SelectValue placeholder="Select intake" /></SelectTrigger>
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

                <h3 className="text-lg font-semibold">Notes</h3>
                <div className="space-y-2">
                  <Textarea
                    id="notes"
                    value={v('notes')}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    placeholder="Any additional notes about this student..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Review</h3>
                <p className="text-sm text-gray-600">
                  Confirm the changes below, then click <strong>Update Student</strong> to save.
                </p>
                <Card>
                  <CardHeader><CardTitle>Personal</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><span className="text-gray-500">Name:</span> {v('firstName')} {v('lastName')}</p>
                    <p><span className="text-gray-500">DOB:</span> {v('dateOfBirth') || '—'}</p>
                    <p><span className="text-gray-500">Nationality:</span> {v('nationality') || '—'}</p>
                    <p><span className="text-gray-500">Email:</span> {v('email')}</p>
                    <p><span className="text-gray-500">Phone:</span> {v('phone')}</p>
                    <p><span className="text-gray-500">Status:</span> {v('status') || 'Active'}</p>
                    <p><span className="text-gray-500">Source:</span> {v('source') || 'Online'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Target</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><span className="text-gray-500">Target Degree:</span> {v('targetDegree') || '—'}</p>
                    <p><span className="text-gray-500">Target Intake:</span> {v('targetIntake') || '—'}</p>
                    <p><span className="text-gray-500">HSK Level:</span> {v('hskLevel') || '—'}</p>
                    <p><span className="text-gray-500">IELTS:</span> {v('ieltsScore') || '—'}</p>
                    <p><span className="text-gray-500">TOEFL:</span> {v('toeflScore') || '—'}</p>
                  </CardContent>
                </Card>
                {v('notes') && (
                  <Card>
                    <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
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
              <p className="text-red-800 text-sm"><strong>Error:</strong> {error}</p>
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
              <><ArrowLeft className="h-4 w-4 mr-2" /> Cancel</>
            ) : (
              <><ChevronLeft className="h-4 w-4 mr-2" /> Previous</>
            )}
          </Button>
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} className="bg-[#1B2A4A] hover:bg-[#152138]">
              Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isSaving} className="bg-[#9B1B30] hover:bg-[#7A1526]">
              {isSaving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Check className="h-4 w-4 mr-2" /> Update Student</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

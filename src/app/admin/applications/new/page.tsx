'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Check, User, FileText, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { universities, programs, degreeLevels, intendedIntakes, documentTypes } from '@/lib/data';
import { useStudentList } from '@/hooks/use-student-list';
import { apiFetchJson } from '@/lib/api-client';
import type { AdminStudent } from '@/lib/student-mapper';
import type { DocumentStatus, StudentDocument } from '@/lib/student-data';

interface FormData {
  studentId: string | null;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantNationality: string;
  university: string;
  program: string;
  degree: string;
  intake: string;
  personalStatement: string;
  notes: string;
  syncDocuments: boolean;
  selectedDocuments: string[];
}

export default function AdminNewApplicationPage() {
  const { students } = useStudentList();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(null);
  const [studentDocuments, setStudentDocuments] = useState<StudentDocument[]>([]);
  const [studentDocumentsLoading, setStudentDocumentsLoading] = useState(false);
  const [filteredPrograms, setFilteredPrograms] = useState(programs);
  const [filteredUniversities, setFilteredUniversities] = useState(universities);
  
  const [formData, setFormData] = useState<FormData>({
    studentId: null,
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    applicantNationality: '',
    university: '',
    program: '',
    degree: '',
    intake: '',
    personalStatement: '',
    notes: '',
    syncDocuments: false,
    selectedDocuments: []
  });

  // Filter programs when degree changes
  useEffect(() => {
    if (formData.degree) {
      const filtered = programs.filter(p => p.degree === formData.degree);
      setFilteredPrograms(filtered);
      setFormData(prev => ({
        ...prev,
        program: '',
        university: ''
      }));
    } else {
      setFilteredPrograms(programs);
    }
  }, [formData.degree]);

  // Filter universities when program changes
  useEffect(() => {
    if (formData.program) {
      const selectedProgram = programs.find(p => p.slug === formData.program);
      if (selectedProgram) {
        const filtered = universities.filter(u => u.slug === selectedProgram.universitySlug);
        setFilteredUniversities(filtered);
        setFormData(prev => ({
          ...prev,
          university: selectedProgram.universitySlug
        }));
      }
    } else {
      setFilteredUniversities(universities);
    }
  }, [formData.program]);

  // Load student documents when student is selected
  useEffect(() => {
    if (!formData.studentId) {
      setSelectedStudent(null);
      setStudentDocuments([]);
      setFormData(prev => ({
        ...prev,
        selectedDocuments: []
      }));
      return;
    }

    const student = students.find(s => s.id === formData.studentId);
    setSelectedStudent(student ?? null);

    let cancelled = false;
    setStudentDocumentsLoading(true);

    (async () => {
      try {
        const res = await apiFetchJson<{ documents: Array<Record<string, unknown>> }>(
          `/api/admin/students/${formData.studentId}/documents`,
        );
        if (cancelled) return;

        // Map snake_case DB rows -> camelCase StudentDocument shape the page already expects.
        const docs: StudentDocument[] = (res.documents || []).map((d) => ({
          id: String(d.id),
          studentId: String(d.student_id),
          documentTypeId: String(d.document_type_id),
          status: ((d.status as DocumentStatus) || 'Pending'),
          fileUrl: (d.file_url as string) || undefined,
          fileName: (d.file_name as string) || undefined,
          fileSize: (d.file_size as number) || undefined,
          uploadedAt: (d.uploaded_at as string) || undefined,
          verifiedAt: (d.verified_at as string) || undefined,
          verifiedBy: (d.verified_by as string) || undefined,
          rejectionReason: (d.rejection_reason as string) || undefined,
          notes: (d.notes as string) || undefined,
        }));

        setStudentDocuments(docs);

        const basicDocs = docs.filter((d) => {
          const docType = documentTypes.find((dt) => dt.id === d.documentTypeId);
          return docType?.category === 'Student Basic' && d.status === 'Verified';
        });
        setFormData((prev) => ({
          ...prev,
          selectedDocuments: basicDocs.map((d) => d.id),
        }));
      } catch (err) {
        if (cancelled) return;
        console.error('[admin/applications/new] failed to load student documents:', err);
        setStudentDocuments([]);
        setFormData((prev) => ({ ...prev, selectedDocuments: [] }));
      } finally {
        if (!cancelled) setStudentDocumentsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [formData.studentId, students]);

  const handleChange = (field: keyof FormData, value: string | boolean | string[] | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDocument = (docId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDocuments: prev.selectedDocuments.includes(docId)
        ? prev.selectedDocuments.filter(id => id !== docId)
        : [...prev.selectedDocuments, docId]
    }));
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setSubmitError(null);
    try {
      const program = getSelectedProgram();
      const university = getSelectedUniversity();
      const payload: Record<string, unknown> = {
        universityId: formData.university,
        universityName: university?.name || formData.university,
        universityNameCn: university?.nameCn,
        programId: formData.program,
        programName: program?.name || formData.program,
        programNameCn: program?.nameCn,
        degree: formData.degree,
        intake: formData.intake,
        status: 'Submitted',
        personalStatement: formData.personalStatement,
        additionalNotes: formData.notes,
        adminNotes: formData.notes,
      };
      // S12.2: Either link to a registered student OR capture applicant details
      if (formData.studentId) {
        payload.studentId = formData.studentId;
      } else if (formData.applicantName && formData.applicantEmail) {
        payload.applicantName = formData.applicantName;
        payload.applicantEmail = formData.applicantEmail;
        if (formData.applicantPhone) payload.applicantPhone = formData.applicantPhone;
        if (formData.applicantNationality) payload.applicantNationality = formData.applicantNationality;
      }
      await apiFetchJson<{ application: { id: string } }>('/api/admin/applications', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      router.push('/admin/applications');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create application');
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentType = (docTypeId: string) => {
    return documentTypes.find(dt => dt.id === docTypeId);
  };

  const getSelectedProgram = () => {
    return programs.find(p => p.slug === formData.program);
  };

  const getSelectedUniversity = () => {
    return universities.find(u => u.slug === formData.university);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="rounded-none text-[#1B2A4A]"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#1B2A4A]">Create Application</h1>
              <p className="text-[#4B5563] mt-1">Add a new student application</p>
            </div>
          </div>
          <Badge className="bg-[#9B1B30] text-white rounded-none">Offline</Badge>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 flex items-center justify-center text-sm font-medium ${
                s < step ? 'bg-[#9B1B30] text-white' :
                s === step ? 'bg-[#1B2A4A] text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-1 mx-2 ${s < step ? 'bg-[#9B1B30]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-[#4B5563] mb-6">
          <span>Select Student</span>
          <span>Program Details</span>
          <span>Review</span>
        </div>

        <Card className="rounded-none border-0 shadow-sm">
          <CardContent className="p-6">
            {/* Step 1: Select Student */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">
                    <User className="w-5 h-5 inline mr-2" />
                    Select Student
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[#1F2937]">Select Existing Student *</Label>
                      <Select 
                        value={formData.studentId || ''} 
                        onValueChange={(value) => handleChange('studentId', value || null)}
                      >
                        <SelectTrigger className="rounded-none mt-1">
                          <SelectValue placeholder="Select a student..." />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map(student => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.firstName} {student.lastName} ({student.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-[#4B5563] mt-1">
                        Select an existing student, OR fill in the manual fields below for a lead without an account.
                      </p>
                    </div>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-2 text-[#4B5563]">OR — NEW LEAD (NO ACCOUNT YET)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[#1F2937]">Applicant Name *</Label>
                        <Input
                          className="mt-1"
                          value={formData.applicantName}
                          onChange={(e) => handleChange('applicantName', e.target.value)}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <Label className="text-[#1F2937]">Applicant Email *</Label>
                        <Input
                          className="mt-1"
                          type="email"
                          value={formData.applicantEmail}
                          onChange={(e) => handleChange('applicantEmail', e.target.value)}
                          placeholder="lead@example.com"
                        />
                      </div>
                      <div>
                        <Label className="text-[#1F2937]">Phone (optional)</Label>
                        <Input
                          className="mt-1"
                          value={formData.applicantPhone}
                          onChange={(e) => handleChange('applicantPhone', e.target.value)}
                          placeholder="+1 555 123 4567"
                        />
                      </div>
                      <div>
                        <Label className="text-[#1F2937]">Nationality (optional)</Label>
                        <Input
                          className="mt-1"
                          value={formData.applicantNationality}
                          onChange={(e) => handleChange('applicantNationality', e.target.value)}
                          placeholder="e.g., Bangladesh"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded">
                      The lead won't get a SICA account automatically. When they sign up later, the application can be linked to their student profile.
                    </p>

                    {selectedStudent && (
                      <Card className="rounded-none border border-[#9B1B30]/20 bg-[#9B1B30]/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-[#1B2A4A]">
                            Student Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-[#4B5563]">Name:</span>{' '}
                              <span className="font-medium text-[#1F2937]">
                                {selectedStudent.firstName} {selectedStudent.lastName}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#4B5563]">Email:</span>{' '}
                              <span className="font-medium text-[#1F2937]">
                                {selectedStudent.email}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#4B5563]">Nationality:</span>{' '}
                              <span className="font-medium text-[#1F2937]">
                                {selectedStudent.nationality}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#4B5563]">Target Degree:</span>{' '}
                              <span className="font-medium text-[#1F2937]">
                                {selectedStudent.targetDegree || 'Not specified'}
                              </span>
                            </div>
                          </div>
                          <div className="pt-2">
                            <Badge className="bg-[#9B1B30] text-white rounded-none">
                              Offline Student
                            </Badge>
                            <Badge className="ml-2 rounded-none" variant="secondary">
                              {selectedStudent.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {(studentDocuments.length > 0 || studentDocumentsLoading) && formData.studentId && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-[#1F2937]">Available Documents</Label>
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id="syncAll"
                              checked={formData.syncDocuments}
                              onCheckedChange={(checked) => {
                                handleChange('syncDocuments', checked);
                                if (checked) {
                                  const verifiedDocs = studentDocuments
                                    .filter(d => d.status === 'Verified')
                                    .map(d => d.id);
                                  handleChange('selectedDocuments', verifiedDocs);
                                }
                              }}
                            />
                            <label htmlFor="syncAll" className="text-sm text-[#4B5563]">
                              Auto-sync verified documents
                            </label>
                          </div>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-none p-4">
                          {studentDocumentsLoading && (
                            <div className="text-sm text-[#4B5563] py-4 text-center">
                              Loading student documents…
                            </div>
                          )}
                          {!studentDocumentsLoading && studentDocuments.length === 0 && (
                            <div className="text-sm text-[#4B5563] py-4 text-center">
                              This student has not uploaded any documents yet.
                            </div>
                          )}
                          {studentDocuments.map(doc => {
                            const docType = getDocumentType(doc.documentTypeId);
                            const isSelected = formData.selectedDocuments.includes(doc.id);
                            const isVerified = doc.status === 'Verified';
                            return (
                              <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-none hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                  <Checkbox 
                                    id={`doc-${doc.id}`}
                                    checked={isSelected}
                                    onCheckedChange={() => toggleDocument(doc.id)}
                                    disabled={!isVerified}
                                  />
                                  <div>
                                    <label 
                                      htmlFor={`doc-${doc.id}`}
                                      className={`text-sm font-medium ${!isVerified ? 'text-gray-400' : 'text-[#1F2937]'}`}
                                    >
                                      {docType?.name || 'Document'}
                                    </label>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge className={`rounded-none text-xs ${
                                        isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {doc.status}
                                      </Badge>
                                      {doc.fileName && (
                                        <span className="text-xs text-[#4B5563]">
                                          {doc.fileName}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {!isVerified && (
                                  <span className="text-xs text-gray-400">Needs verification</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-[#4B5563] mt-2">
                          {formData.selectedDocuments.length} of {studentDocuments.length} documents selected
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Program Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">
                    <GraduationCap className="w-5 h-5 inline mr-2" />
                    Program Details
                  </h2>

                  {selectedStudent && (
                    <Card className="rounded-none border border-gray-200 bg-[#F3F4F6] mb-6">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#9B1B30] text-white flex items-center justify-center font-bold">
                            {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                          </div>
                          <div>
                            <div className="font-medium text-[#1F2937]">
                              {selectedStudent.firstName} {selectedStudent.lastName}
                            </div>
                            <div className="text-sm text-[#4B5563]">{selectedStudent.email}</div>
                          </div>
                          <Badge className="ml-auto bg-[#9B1B30] text-white rounded-none">
                            Offline
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[#1F2937]">Degree Level *</Label>
                        <Select 
                          value={formData.degree} 
                          onValueChange={(value) => handleChange('degree', value)}
                        >
                          <SelectTrigger className="rounded-none mt-1">
                            <SelectValue placeholder="Select degree..." />
                          </SelectTrigger>
                          <SelectContent>
                            {degreeLevels.map(level => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[#1F2937]">Intended Intake *</Label>
                        <Select 
                          value={formData.intake} 
                          onValueChange={(value) => handleChange('intake', value)}
                        >
                          <SelectTrigger className="rounded-none mt-1">
                            <SelectValue placeholder="Select intake..." />
                          </SelectTrigger>
                          <SelectContent>
                            {intendedIntakes.map(intake => (
                              <SelectItem key={intake} value={intake}>
                                {intake}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-[#1F2937]">Program *</Label>
                      <Select 
                        value={formData.program} 
                        onValueChange={(value) => handleChange('program', value)}
                        disabled={!formData.degree}
                      >
                        <SelectTrigger className="rounded-none mt-1">
                          <SelectValue placeholder={formData.degree ? "Select program..." : "First select degree level"} />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredPrograms.map(program => (
                            <SelectItem key={program.slug} value={program.slug}>
                              {program.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {getSelectedProgram() && (
                      <Card className="rounded-none border border-gray-200 bg-gray-50">
                        <CardContent className="p-4">
                          <div className="font-medium text-[#1F2937]">
                            {getSelectedProgram()?.name}
                          </div>
                          <div className="text-sm text-[#4B5563] mt-1">
                            {getSelectedUniversity()?.name || 'University will be auto-selected'}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div>
                      <Label className="text-[#1F2937]">Additional Notes</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Add any additional notes or requirements..."
                        className="rounded-none mt-1"
                        rows={4}
                      />
                    </div>

                    {formData.selectedDocuments.length > 0 && (
                      <div>
                        <Label className="text-[#1F2937]">Documents to Sync</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.selectedDocuments.map(docId => {
                            const doc = studentDocuments.find(d => d.id === docId);
                            const docType = getDocumentType(doc?.documentTypeId || '');
                            return (
                              <Badge key={docId} className="rounded-none bg-green-100 text-green-700">
                                <FileText className="w-3 h-3 mr-1" />
                                {docType?.name || 'Document'}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">
                    <FileText className="w-5 h-5 inline mr-2" />
                    Review Application
                  </h2>

                  <div className="space-y-4">
                    <Card className="rounded-none border border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[#1B2A4A]">
                          Student Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedStudent ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-[#9B1B30] text-white flex items-center justify-center font-bold text-lg">
                                {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                              </div>
                              <div>
                                <div className="font-medium text-[#1F2937]">
                                  {selectedStudent.firstName} {selectedStudent.lastName}
                                </div>
                                <div className="text-[#4B5563]">{selectedStudent.email}</div>
                              </div>
                              <Badge className="ml-auto bg-[#9B1B30] text-white rounded-none">
                                Offline
                              </Badge>
                            </div>
                            <Separator className="my-4" />
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[#4B5563]">Nationality:</span>{' '}
                                <span className="font-medium text-[#1F2937]">
                                  {selectedStudent.nationality}
                                </span>
                              </div>
                              <div>
                                <span className="text-[#4B5563]">Phone:</span>{' '}
                                <span className="font-medium text-[#1F2937]">
                                  {selectedStudent.phone}
                                </span>
                              </div>
                              <div>
                                <span className="text-[#4B5563]">Status:</span>{' '}
                                <Badge className="rounded-none">{selectedStudent.status}</Badge>
                              </div>
                              <div>
                                <span className="text-[#4B5563]">Target Degree:</span>{' '}
                                <span className="font-medium text-[#1F2937]">
                                  {selectedStudent.targetDegree || 'Not specified'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[#4B5563]">No student selected</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="rounded-none border border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[#1B2A4A]">
                          Application Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[#4B5563]">University:</span>{' '}
                            <span className="font-medium text-[#1F2937]">
                              {getSelectedUniversity()?.name || 'Not selected'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#4B5563]">Program:</span>{' '}
                            <span className="font-medium text-[#1F2937]">
                              {getSelectedProgram()?.name || 'Not selected'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#4B5563]">Degree:</span>{' '}
                            <span className="font-medium text-[#1F2937]">
                              {formData.degree || 'Not selected'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#4B5563]">Intake:</span>{' '}
                            <span className="font-medium text-[#1F2937]">
                              {formData.intake || 'Not selected'}
                            </span>
                          </div>
                        </div>
                        {formData.notes && (
                          <>
                            <Separator className="my-4" />
                            <div>
                              <span className="text-[#4B5563]">Notes:</span>
                              <p className="mt-1 text-[#1F2937]">{formData.notes}</p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {formData.selectedDocuments.length > 0 && (
                      <Card className="rounded-none border border-gray-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-[#1B2A4A]">
                            Documents to Sync ({formData.selectedDocuments.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {formData.selectedDocuments.map(docId => {
                              const doc = studentDocuments.find(d => d.id === docId);
                              const docType = getDocumentType(doc?.documentTypeId || '');
                              return (
                                <div key={docId} className="flex items-center justify-between p-2 bg-green-50 rounded-none">
                                  <span className="text-sm font-medium text-green-800">
                                    {docType?.name || 'Document'}
                                  </span>
                                  <Badge className="rounded-none bg-green-600 text-white">
                                    Verified
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  className="rounded-none text-[#1B2A4A]"
                  onClick={() => setStep(step - 1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              ) : (
                <div></div>
              )}
              
              {step < 3 ? (
                <Button
                  className="rounded-none bg-[#9B1B30] hover:bg-[#7A1526] text-white"
                  onClick={() => setStep(step + 1)}
                  disabled={
                    step === 1 && !formData.studentId ||
                    step === 2 && (!formData.degree || !formData.program || !formData.intake)
                  }
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  className="rounded-none bg-[#9B1B30] hover:bg-[#7A1526] text-white"
                  onClick={handleSubmit}
                  disabled={isLoading || !formData.studentId}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Create Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

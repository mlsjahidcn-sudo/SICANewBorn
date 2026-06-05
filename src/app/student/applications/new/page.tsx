'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, CheckCircle2, ChevronRight, Building, Upload, FileText, FileCheck, RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { apiFetchJson } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { DocumentUploader, DocumentCategory } from '@/components/student/DocumentUploader';
import {
  universities,
  programs,
  degreeLevels,
  intendedIntakes,
  documentTypes,
  DegreeLevel,
  DocumentType
} from '@/lib/data';

// Form state shape — targetDegreeLevel starts as '' (unset) and narrows to
// a real DegreeLevel after the user picks one. Keeping it as a real union
// (not plain `string`) makes the .includes() check on `requiredFor` type-safe.
interface ApplicationFormData {
  targetDegreeLevel: '' | DegreeLevel;
  targetProgramSlug: string;
  targetUniversity: string;
  intendedIntake: string;
  personalStatement: string;
  additionalNotes: string;
  selectedDocuments: string[];
}

// Runtime guard for Select onValueChange payloads: the shadcn Select gives
// us `string`, but our form state expects the strict DegreeLevel union.
const isDegreeLevel = (v: string): v is DegreeLevel =>
  (degreeLevels as readonly string[]).includes(v);

// data.ts DocumentType.category is the same union as student-data.ts
// DocumentCategory, but TypeScript doesn't unify across files. We trust
// the runtime values match (they do — both are 'Identity' | 'Academic' |
// 'Language' | 'Financial' | 'Recommendation' | 'Other').
const mapDocCategoryToStudentCategory = (c: string): DocumentCategory =>
  c as DocumentCategory;
// Type-only imports (we removed the mock-student-data runtime imports
// in S14.6; we keep just the types so the SyncableDocument interface
// and DocumentStatus union still resolve.)
import type { StudentDocument, DocumentStatus } from '@/lib/student-data';

const steps = [
  { id: 1, title: 'University & Program', icon: Building },
  { id: 2, title: 'Documents', icon: FileCheck },
  { id: 3, title: 'Review', icon: Check }
];

interface SyncableDocument {
  documentType: DocumentType;
  studentDoc?: StudentDocument;
  selected: boolean;
}

export default function StudentNewApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Phase 1: when the student clicks "Continue Editing" on a draft
  // detail page, the link is /new?resume=<applicationId>. The wizard
  // loads the existing application and pre-fills the form, then uses
  // PUT (not POST) for both Save-as-Draft and Submit so the same
  // record is updated.
  const resumeId = searchParams.get('resume');
  const isResuming = !!resumeId;
  const [resuming, setResuming] = useState(isResuming);
  const resumeLoadStartedRef = useRef(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationFormData>({
    targetDegreeLevel: '',
    targetProgramSlug: '',
    targetUniversity: '',
    intendedIntake: '',
    personalStatement: '',
    additionalNotes: '',
    selectedDocuments: []
  });

  /**
   * Phase 1: when `?resume=<id>` is set, load the existing draft and
   * pre-fill the form. The form state needs to be narrowed to
   * DegreeLevel for type-safety on the Select.
   */
  useEffect(() => {
    if (!isResuming || !resumeId || resumeLoadStartedRef.current) return;
    resumeLoadStartedRef.current = true;
    (async () => {
      try {
        const data = await apiFetchJson<{
          application: {
            id: string;
            degree: string | null;
            intake: string | null;
            personalStatement: string | null;
            additionalNotes: string | null;
            university: string;
            program: string;
          };
        }>(`/api/student/applications/${resumeId}`);
        const a = data.application;
        // Match the program by its display name to recover the slug,
        // since the API returns the name not the id. Fall back to the
        // existing form value if no match.
        const matchedProgram = programs.find(
          (p) => p.name === a.program || p.slug === a.program,
        );
        const matchedUniversity = matchedProgram
          ? universities.find((u) => u.slug === matchedProgram.universitySlug)
          : universities.find((u) => u.name === a.university);
        setApplicationData((prev) => ({
          ...prev,
          targetDegreeLevel:
            a.degree && isDegreeLevel(a.degree) ? a.degree : prev.targetDegreeLevel,
          targetProgramSlug: matchedProgram?.slug || prev.targetProgramSlug,
          targetUniversity: matchedUniversity?.slug || prev.targetUniversity,
          intendedIntake: a.intake || prev.intendedIntake,
          personalStatement: a.personalStatement || prev.personalStatement,
          additionalNotes: a.additionalNotes || prev.additionalNotes,
        }));
      } catch (err) {
        // Non-fatal: just start with an empty form. The student can
        // still create a new application.
        const e = err as { message?: string };
        setSubmitError(`Couldn't load draft: ${e.message || 'Unknown error'}`);
      } finally {
        setResuming(false);
      }
    })();
    // We intentionally run this only on mount. resumeId is a string
    // parsed from searchParams; if the user navigates here twice we
    // don't want to re-fetch. The ref guard makes that explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPrograms = applicationData.targetDegreeLevel
    ? programs.filter(p => p.degree === applicationData.targetDegreeLevel)
    : programs;

  const selectedProgram = filteredPrograms.find(p => p.slug === applicationData.targetProgramSlug);
  const selectedUniversity = selectedProgram 
    ? universities.find((u: { slug: string }) => u.slug === selectedProgram.universitySlug)
    : null;

  // Get the current logged-in student from the auth context (real user,
  // NOT mockStudentAccounts[0]). The studentDocuments hook fetches
  // their own documents from /api/student/documents.
  const { user } = useAuth();
  const [studentDocuments, setStudentDocuments] = useState<Array<{
    id: string;
    documentTypeId: string;
    name: string;
    status: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected';
    fileName?: string;
  }>>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setDocumentsLoading(true);
    apiFetchJson<{ documents: typeof studentDocuments }>('/api/student/documents', {
      signal: controller.signal,
    })
      .then((d) => setStudentDocuments(d.documents || []))
      .catch(() => setStudentDocuments([]))
      .finally(() => {
        if (!controller.signal.aborted) setDocumentsLoading(false);
      });
    return () => controller.abort();
  }, [user?.id]);

  // Get syncable documents based on degree level
  const syncableDocuments = useMemo(() => {
    if (!applicationData.targetDegreeLevel) return [];
    // Narrow: after the guard, targetDegreeLevel is 'Bachelor' | 'Master' | 'PhD'
    const level = applicationData.targetDegreeLevel;

    const applicableDocs = documentTypes.filter(doc =>
      doc.requiredFor.includes(level)
    );

    return applicableDocs.map(docType => {
      const studentDoc = studentDocuments.find((sd) => sd.documentTypeId === docType.id);
      const isAutoSync = docType.category === 'Student Basic';
      const isSelected = applicationData.selectedDocuments.includes(docType.id) ||
        (isAutoSync && studentDoc && ['Uploaded', 'Verified'].includes(studentDoc.status));

      return {
        documentType: docType,
        studentDoc,
        selected: isSelected
      };
    });
  }, [applicationData.targetDegreeLevel, studentDocuments, applicationData.selectedDocuments]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdAppId, setCreatedAppId] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const getSelectedProgramBySlug = () =>
    programs.find((p) => p.slug === applicationData.targetProgramSlug);

  /**
   * Phase 1: save the current form state as a Draft. Available on
   * every step. POSTs with status='Draft' for a new application, or
   * PUTs status='Draft' when resuming an existing draft. The API
   * allows a Draft with just universityName + programName; other
   * fields can be filled in later.
   */
  const handleSaveAsDraft = async () => {
    if (!applicationData.targetUniversity) {
      setSubmitError('Pick a university first to save a draft.');
      setCurrentStep(1);
      return;
    }
    if (!applicationData.targetProgramSlug) {
      setSubmitError('Pick a program first to save a draft.');
      setCurrentStep(1);
      return;
    }
    setSavingDraft(true);
    setSubmitError(null);
    try {
      const university = universities.find(
        (u: { slug: string }) => u.slug === applicationData.targetUniversity,
      );
      const program = getSelectedProgramBySlug();
      const payload = {
        universityId: applicationData.targetUniversity,
        universityName: university?.name || applicationData.targetUniversity,
        universityNameCn: university?.nameCn,
        programId: applicationData.targetProgramSlug,
        programName: program?.name || applicationData.targetProgramSlug,
        programNameCn: program?.nameCn,
        degree: applicationData.targetDegreeLevel || undefined,
        intake: applicationData.intendedIntake || undefined,
        status: 'Draft' as const,
        personalStatement: applicationData.personalStatement,
        additionalNotes: applicationData.additionalNotes,
      };
      const data = isResuming && resumeId
        ? await apiFetchJson<{ application: { id: string; applicationNumber: string | null } }>(
            `/api/student/applications/${resumeId}`,
            { method: 'PUT', body: JSON.stringify(payload) },
          )
        : await apiFetchJson<{ application: { id: string; applicationNumber: string | null } }>(
            '/api/student/applications',
            { method: 'POST', body: JSON.stringify(payload) },
          );
      setCreatedAppId(data.application.id);
      setDraftSaved(true);
      // Brief delay so the success message is visible
      setTimeout(() => {
        router.push(`/student/applications/${data.application.id}`);
      }, 1000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save draft');
      setSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError(null);
    try {
      const university = universities.find((u: { slug: string }) => u.slug === applicationData.targetUniversity);
      const program = getSelectedProgramBySlug();
      const payload = {
        universityId: applicationData.targetUniversity,
        universityName: university?.name || applicationData.targetUniversity,
        universityNameCn: university?.nameCn,
        programId: applicationData.targetProgramSlug,
        programName: program?.name || applicationData.targetProgramSlug,
        programNameCn: program?.nameCn,
        degree: applicationData.targetDegreeLevel,
        intake: applicationData.intendedIntake,
        status: 'Submitted' as const,
        personalStatement: applicationData.personalStatement,
        additionalNotes: applicationData.additionalNotes,
      };
      const data = isResuming && resumeId
        ? await apiFetchJson<{ application: { id: string; applicationNumber: string | null } }>(
            `/api/student/applications/${resumeId}`,
            { method: 'PUT', body: JSON.stringify(payload) },
          )
        : await apiFetchJson<{ application: { id: string; applicationNumber: string | null } }>(
            '/api/student/applications',
            { method: 'POST', body: JSON.stringify(payload) },
          );
      setCreatedAppId(data.application.id);
      // Brief delay so the success message is visible before navigating
      setTimeout(() => router.push('/student/applications'), 1500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create application');
      setLoading(false);
    }
  };

  const toggleDocument = (docTypeId: string, checked: boolean) => {
    setApplicationData(prev => ({
      ...prev,
      selectedDocuments: checked 
        ? [...prev.selectedDocuments, docTypeId]
        : prev.selectedDocuments.filter(id => id !== docTypeId)
    }));
  };

  const getStatusColor = (status: DocumentStatus) => {
    const colors: Record<DocumentStatus, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Uploaded': 'bg-blue-100 text-blue-800',
      'Verified': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const syncStats = useMemo(() => {
    const total = syncableDocuments.length;
    const selected = syncableDocuments.filter(d => d.selected).length;
    const available = syncableDocuments.filter(d => d.studentDoc && ['Uploaded', 'Verified'].includes(d.studentDoc.status)).length;
    return { total, selected, available };
  }, [syncableDocuments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild className="rounded-none">
          <Link href="/student/applications">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">New Application</h1>
          <p className="text-[#4B5563] mt-1">Create a new application for yourself</p>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 border border-[#D4A853] bg-[#FAF6E8] text-sm text-[#1B2A4A]">
        <Save className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#9B1B30]" />
        <p>
          <strong>Save as Draft</strong> is available on every step — your
          progress is saved and you can come back to finish later. Nothing
          is sent to SICA until you click <strong>Submit Application</strong>.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isCompleted ? 'bg-[#9B1B30] text-white' : 
                    isActive ? 'bg-[#9B1B30] text-white' : 'bg-gray-200 text-gray-500'}
                `}>
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs mt-2 ${isActive || isCompleted ? 'text-[#1B2A4A] font-medium' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${isCompleted ? 'bg-[#9B1B30]' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      <Card className="rounded-none">
        <CardContent className="p-6">
          {/* Step 1: University & Program */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg text-[#1B2A4A]">Choose University & Program</CardTitle>
              </CardHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-[#1B2A4A]">Degree Level</Label>
                    <Select
                      value={applicationData.targetDegreeLevel}
                      onValueChange={(value) => {
                        if (isDegreeLevel(value)) {
                          setApplicationData({ ...applicationData, targetDegreeLevel: value });
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-none">
                        <SelectValue placeholder="Select degree level" />
                      </SelectTrigger>
                      <SelectContent>
                        {degreeLevels.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[#1B2A4A]">Program</Label>
                    <Select 
                      value={applicationData.targetProgramSlug}
                      onValueChange={(value) => {
                        const program = filteredPrograms.find(p => p.slug === value);
                        const university = program 
                          ? universities.find((u: { slug: string }) => u.slug === program.universitySlug)
                          : null;
                        setApplicationData({
                          ...applicationData, 
                          targetProgramSlug: value,
                          targetUniversity: university?.slug || ''
                        });
                      }}
                      disabled={!applicationData.targetDegreeLevel}
                    >
                      <SelectTrigger className="rounded-none">
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredPrograms.map((program) => {
                          const university = universities.find((u: { slug: string }) => u.slug === program.universitySlug);
                          return (
                            <SelectItem key={program.slug} value={program.slug}>
                              {university?.name} - {program.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-[#1B2A4A]">Intended Intake</Label>
                    <Select 
                      value={applicationData.intendedIntake}
                      onValueChange={(value) => setApplicationData({...applicationData, intendedIntake: value})}
                    >
                      <SelectTrigger className="rounded-none">
                        <SelectValue placeholder="Select intake" />
                      </SelectTrigger>
                      <SelectContent>
                        {intendedIntakes.map((intake) => (
                          <SelectItem key={intake} value={intake}>{intake}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {selectedProgram && selectedUniversity && (
                <Card className="rounded-none bg-[#F3F4F6]">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-[#1B2A4A] mb-2">Selected Program</h3>
                    <p className="text-[#1B2A4A]">{selectedUniversity.name}</p>
                    <p className="text-gray-600">{selectedProgram.name}</p>
                    <p className="text-gray-500 text-sm mt-1">{selectedProgram.degree} • {selectedProgram.intake}</p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <div>
                  <Label className="text-[#1B2A4A]">Personal Statement</Label>
                  <Textarea 
                    placeholder="Tell us why you want to study this program..."
                    className="rounded-none mt-2"
                    rows={4}
                    value={applicationData.personalStatement}
                    onChange={(e) => setApplicationData({...applicationData, personalStatement: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="text-[#1B2A4A]">Additional Notes (Optional)</Label>
                  <Textarea 
                    placeholder="Any additional information..."
                    className="rounded-none mt-2"
                    rows={3}
                    value={applicationData.additionalNotes}
                    onChange={(e) => setApplicationData({...applicationData, additionalNotes: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Document Sync */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg text-[#1B2A4A]">Select Documents</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Choose which documents to include from your profile
                </p>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="rounded-none bg-[#F3F4F6]">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-[#1B2A4A]">{syncStats.total}</p>
                    <p className="text-sm text-gray-600">Required Documents</p>
                  </CardContent>
                </Card>
                <Card className="rounded-none bg-[#F3F4F6]">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-[#1B2A4A]">{syncStats.available}</p>
                    <p className="text-sm text-gray-600">Available</p>
                  </CardContent>
                </Card>
                <Card className="rounded-none bg-[#F3F4F6]">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-[#9B1B30]">{syncStats.selected}</p>
                    <p className="text-sm text-gray-600">Selected</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                {syncableDocuments.map((doc) => (
                  <Card key={doc.documentType.id} className="rounded-none">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox 
                            id={`doc-${doc.documentType.id}`}
                            checked={doc.selected}
                            onCheckedChange={(checked) => 
                              toggleDocument(doc.documentType.id, checked as boolean)
                            }
                            className="mt-1 data-[state=checked]:bg-[#9B1B30] data-[state=checked]:border-[#9B1B30]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <Label 
                                htmlFor={`doc-${doc.documentType.id}`}
                                className="font-medium text-[#1B2A4A] cursor-pointer"
                              >
                                {doc.documentType.name}
                              </Label>
                              {doc.studentDoc && (
                                <Badge className={`rounded-none ${getStatusColor(doc.studentDoc.status)}`}>
                                  {doc.studentDoc.status}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {doc.documentType.description}
                            </p>
                            {doc.studentDoc && doc.studentDoc.fileName && (
                              <p className="text-xs text-gray-500 mt-1">
                                {doc.studentDoc.fileName} 
                                {doc.studentDoc.fileName && ` (${doc.studentDoc.fileName})`}
                              </p>
                            )}
                          </div>
                        </div>
                        {!doc.studentDoc && (
                          <div className="w-64">
                            <DocumentUploader
                              documentTypeId={doc.documentType.id}
                              documentName={doc.documentType.name}
                              category={mapDocCategoryToStudentCategory(doc.documentType.category)}
                              onUploaded={(uploaded) => {
                                // Re-fetch so the doc moves from "missing" → "selected"
                                setDocumentsLoading(true);
                                apiFetchJson<{ data: Array<{ id: string; documentTypeId: string; name: string; status: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected'; fileName?: string }> }>(
                                  '/api/student/documents',
                                )
                                  .then((d) => setStudentDocuments(d.data || []))
                                  .catch(() => {})
                                  .finally(() => setDocumentsLoading(false));
                                console.log('[student/new] document uploaded:', uploaded.id);
                              }}
                              compact
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg text-[#1B2A4A]">Review Application</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Please review your application before submitting
                </p>
              </CardHeader>

              <div className="grid gap-6">
                <Card className="rounded-none">
                  <CardHeader className="border-b border-gray-200">
                    <CardTitle className="text-base text-[#1B2A4A]">Student Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <p className="font-medium text-[#1B2A4A]">
                      {user?.user_metadata?.full_name || user?.email || 'Current Student'}
                    </p>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-gray-600">{user?.user_metadata?.phone || '—'}</p>
                  </CardContent>
                </Card>

                <Card className="rounded-none">
                  <CardHeader className="border-b border-gray-200">
                    <CardTitle className="text-base text-[#1B2A4A]">Program Selection</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <p className="font-medium text-[#1B2A4A]">{selectedUniversity?.name}</p>
                    <p className="text-gray-600">{selectedProgram?.name}</p>
                    <p className="text-gray-600">{applicationData.targetDegreeLevel} • {applicationData.intendedIntake}</p>
                  </CardContent>
                </Card>

                <Card className="rounded-none">
                  <CardHeader className="border-b border-gray-200">
                    <CardTitle className="text-base text-[#1B2A4A]">
                      Documents ({syncStats.selected}/{syncStats.total})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {syncableDocuments
                        .filter(d => d.selected)
                        .map(doc => (
                          <Badge key={doc.documentType.id} className="rounded-none bg-[#F3F4F6] text-[#1B2A4A]">
                            {doc.documentType.name}
                            {doc.studentDoc && ` (${doc.studentDoc.status})`}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading || savingDraft}
              className="rounded-none"
            >
              Previous
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSaveAsDraft}
                disabled={savingDraft || draftSaved || loading}
                className="rounded-none border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white"
                title="Save as Draft — keep your progress and finish later"
              >
                {savingDraft ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving Draft...
                  </>
                ) : draftSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Draft Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </>
                )}
              </Button>
              {currentStep < steps.length ? (
                <Button
                  onClick={handleNext}
                  disabled={savingDraft}
                  className="bg-[#9B1B30] hover:bg-[#7A1525] text-white rounded-none"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !!createdAppId || savingDraft}
                className="bg-[#9B1B30] hover:bg-[#7A1525] text-white rounded-none"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : createdAppId ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submitted!
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
              )}
            </div>
          </div>

          {submitError && (
            <div className="mt-4 p-3 border border-red-200 bg-red-50 text-red-800 text-sm rounded">
              <strong>Error:</strong> {submitError}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

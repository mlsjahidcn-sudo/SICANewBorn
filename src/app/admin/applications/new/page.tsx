'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Check, User, FileText, GraduationCap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { degreeLevels, intendedIntakes, documentTypes } from '@/lib/data';
// Phase 20: universidades + programs were imported from the static
// `data.ts` fallback (the 9-school / 17-program set shipped with
// the repo). Any school or program an admin added through
// /admin/universities or /admin/programs was invisible here —
// admins could create applications for rows that didn't exist in
// the public catalog. Same root-cause as the Phase 3 chatbot fix
// (live data context module) and the Phase S20 student-wizard
// refactor. We now fetch the live catalog on mount from the
// public APIs.
//
// `degreeLevels`, `intendedIntakes`, and `documentTypes` stay
// as static imports for now — they're closed taxonomies not
// managed via the admin UI yet (no /admin/intakes or
// /admin/document-types pages). If we ever add admin UIs for
// those, they'll need the same treatment.
import type { University, Program } from '@/lib/data';
import { SearchableSelect } from '@/components/ui/searchable-select';
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
  // H9: which status to write on create. Was hardcoded to
  // 'Submitted', so admins couldn't create a Draft at intake
  // (the partner + student flows both support Draft). Default
  // 'Submitted' to preserve existing behavior — admins
  // explicitly opt into Draft when they want to keep the row
  // in the back office for further info collection before
  // sending it to the student for review.
  submitStatus: 'Draft' | 'Submitted';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  syncDocuments: boolean;
  selectedDocuments: string[];
}

export default function AdminNewApplicationPage() {
  // Phase 21: also surface `isLoading` so the typeahead can show
  // a "Loading students..." placeholder instead of a confusing
  // empty popover between mount and the API response settling.
  const { students, isLoading: studentsLoading } = useStudentList();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(null);
  const [studentDocuments, setStudentDocuments] = useState<StudentDocument[]>([]);
  const [studentDocumentsLoading, setStudentDocumentsLoading] = useState(false);
  // Phase 20: live catalog. Was `useState(programs)` /
  // `useState(universities)` reading the static `data.ts` fallback
  // (the 9-school / 17-program set). Admin-added schools + programs
  // were invisible in the create-app wizard. Now fetched from
  // /api/universities and /api/programs on mount, with a
  // `dataLoading` flag the page can show in the dropdown placeholders.
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);

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
    // H9: default to 'Submitted' so existing behavior is
    // unchanged. The new <Select> on step 2 lets admins
    // explicitly switch to Draft.
    submitStatus: 'Submitted',
    // M1: default to 'Normal' to match the server's default
    // ('Medium' in the DB schema, but the partner + admin
    // app taxonomy uses Normal). We send this to the API
    // explicitly so the DB default doesn't override.
    priority: 'Normal',
    syncDocuments: false,
    selectedDocuments: []
  });

  // Phase 20: fetch the live university + program catalog on mount.
  // The two endpoints are independent — run in parallel; one
  // failing shouldn't block the other. Limit=500 covers the
  // realistic catalog size (the live DB has 27 universities +
  // 149 programs as of Phase 3 — well under the cap).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [u, p] = await Promise.all([
          apiFetchJson<{ universities: University[] }>('/api/universities?limit=500'),
          apiFetchJson<{ programs: Program[] }>('/api/programs?limit=500'),
        ]);
        if (cancelled) return;
        setUniversities(u.universities || []);
        setPrograms(p.programs || []);
      } catch (err) {
        if (cancelled) return;
        // Soft fail — the dropdowns will just show empty. Admin
        // can retry by reloading the page. Better than a hard
        // error blocking the whole wizard.
        console.error('[admin/applications/new] failed to load catalog:', err);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
  }, [formData.degree, programs]);

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
  }, [formData.program, programs, universities]);

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
        // H9: read the chosen status from formData (was
        // hardcoded 'Submitted' before). Admitting as a
        // string-typed payload because the API accepts the
        // literal status; we validated Draft | Submitted
        // via the FormData union + the new <Select>.
        status: formData.submitStatus,
        // M1: surface the priority field. Same closed
        // taxonomy the partner side uses (Low | Normal |
        // High | Urgent); default is Normal.
        priority: formData.priority,
        personalStatement: formData.personalStatement,
        // C4: the form's `notes` field is the same Textarea for
        // both student-visible additional_notes AND admin-only
        // admin_notes. Mapping it to BOTH meant the student saw
        // whatever the admin typed. The form has no separate
        // "internal notes" field, so the safe default is to only
        // send additional_notes (visible to student). The admin
        // can write admin-only notes from the application detail
        // page after creation, where the field is properly
        // separated.
        additionalNotes: formData.notes,
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
      const res = await apiFetchJson<{ application: { id: string } }>(
        '/api/admin/applications',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      // C2: actually link the selected documents. The form has
      // a full "Documents to Sync" panel with checkboxes +
      // an "N of M selected" counter + a review step that
      // shows green badges, but the POST payload never carried
      // the document IDs — the whole feature was silent
      // theater. After the application is created, PATCH each
      // selected doc to set its application_id. Mirrors the
      // student wizard's linkOrphanDocsToApplication pattern.
      //
      // The PATCH is on /api/admin/documents/[id] (the doc
      // review queue route, extended in Phase 18 to also
      // accept applicationId). Failures are non-fatal: log
      // them and let the admin re-attach from the document
      // detail page if needed. The application itself was
      // created successfully — that is the user-visible
      // outcome.
      if (formData.selectedDocuments.length > 0) {
        const linkResults = await Promise.allSettled(
          formData.selectedDocuments.map((docId) =>
            apiFetchJson(`/api/admin/documents/${docId}`, {
              method: 'PATCH',
              // Link-only PATCH: don't touch status. The wizard
              // filters the auto-selected docs to "Student Basic
              // + Verified" so the linked docs are already in a
              // good state. Sending status would risk flipping a
              // Pending doc to Verified as a side effect of the
              // link, which isn't what the admin asked for.
              // Phase 18 extended the PATCH route to accept a
              // body with just `applicationId` (status is now
              // optional).
              body: JSON.stringify({
                applicationId: res.application.id,
              }),
            }),
          ),
        );
        const failed = linkResults.filter((r) => r.status === 'rejected').length;
        if (failed > 0) {
          console.error(
            `[admin/applications/new] ${failed} of ${formData.selectedDocuments.length} document links failed`,
          );
        }
      }

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
            {/* M7: was `router.back()`. From a step-wizard,
                "back" through browser history can land on
                /admin/students, /admin, or anywhere — the
                wizard's previous step isn't a real URL. Push
                to the applications list (where post-submit
                navigates) so the button is consistent with
                the rest of the page. */}
            <Button
              variant="ghost"
              className="rounded-none text-[#1B2A4A]"
              onClick={() => router.push('/admin/applications')}
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
                      {/* Phase 21: typeahead picker. Was a plain
                          <Select> capped at 100 rows by
                          useStudentList — a 200+ student org
                          silently truncated the visible list and
                          the admin couldn't pick anyone sorted
                          below row 100. Now a SearchableSelect
                          (cmdk-based client filter) over up to
                          500 rows. Sub-line = nationality for
                          quick disambiguation when two students
                          share a name. The popover filters on
                          name / email / nationality as the admin
                          types. */}
                      <SearchableSelect
                        value={formData.studentId || ''}
                        onChange={(value) => handleChange('studentId', value || null)}
                        placeholder="Select a student..."
                        searchPlaceholder="Search by name, email, or nationality..."
                        emptyText="No students match your search."
                        loading={studentsLoading}
                        options={students.map((s) => ({
                          value: s.id,
                          label: `${s.firstName} ${s.lastName}`,
                          sublabel: [s.email, s.nationality].filter(Boolean).join(' · '),
                        }))}
                      />
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

                    {/* H8: when an admin picks an existing student AND
                        fills in the lead fields, the API rejects with
                        400 "Provide either studentId OR applicantEmail,
                        not both". The wizard USED to surface this as a
                        raw API error after submit, with no warning
                        while filling the form. Show an inline amber
                        banner as soon as the conflict is detected so
                        the admin knows to clear one path before
                        continuing. The "either clear" message gives
                        the explicit fix. */}
                    {formData.studentId &&
                     formData.applicantName.trim() &&
                     formData.applicantEmail.trim() && (
                      <div className="p-3 bg-amber-50 border border-amber-300 text-sm text-amber-900 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-700" />
                        <div>
                          <strong>You can&apos;t fill both.</strong>{' '}
                          Pick <em>either</em> an existing student <em>or</em> a new lead. Clear one of the two
                          paths below to continue.
                        </div>
                      </div>
                    )}

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
                        // Phase 20: gate the dropdown on the live
                        // catalog fetch. Without this the admin
                        // sees a flash of "no programs" between
                        // mount and the API response settling.
                        disabled={!formData.degree || dataLoading}
                      >
                        <SelectTrigger className="rounded-none mt-1">
                          <SelectValue
                            placeholder={
                              dataLoading
                                ? 'Loading catalog...'
                                : formData.degree
                                  ? 'Select program...'
                                  : 'First select degree level'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredPrograms.map(program => (
                            <SelectItem key={program.slug} value={program.slug}>
                              {program.name}
                            </SelectItem>
                          ))}
                          {/* Empty-state inside the dropdown so the
                              admin gets feedback when their filter
                              has no matches (e.g. no programs for
                              the chosen degree). */}
                          {filteredPrograms.length === 0 && !dataLoading && formData.degree && (
                            <div className="px-2 py-3 text-xs text-[#4B5563] text-center">
                              No programs found for this degree level.
                            </div>
                          )}
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

                    {/* H9: status select. The form previously
                        hardcoded 'Submitted' on submit, so admins
                        couldn't create a Draft at intake. The
                        partner + student flows both support Draft;
                        admins should too — useful when the row
                        needs more info before going to the
                        student. Default 'Submitted' preserves
                        existing behavior. */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[#1F2937]">Initial Status</Label>
                        <Select
                          value={formData.submitStatus}
                          onValueChange={(value) =>
                            handleChange('submitStatus', value as 'Draft' | 'Submitted')
                          }
                        >
                          <SelectTrigger className="rounded-none mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft (save for later)</SelectItem>
                            <SelectItem value="Submitted">Submitted (go to student)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-[#4B5563] mt-1">
                          Drafts stay in the back office until you move them.
                        </p>
                      </div>
                      {/* M1: priority select. Same closed
                          taxonomy the partner side uses (Low |
                          Normal | High | Urgent). Default Normal.
                          Admins can now triage at intake instead
                          of having to edit the row after. */}
                      <div>
                        <Label className="text-[#1F2937]">Priority</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value) =>
                            handleChange(
                              'priority',
                              value as 'Low' | 'Normal' | 'High' | 'Urgent',
                            )
                          }
                        >
                          <SelectTrigger className="rounded-none mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-[#4B5563] mt-1">
                          Sets the initial triage for this application.
                        </p>
                      </div>
                    </div>

                    {/* M2: personal statement field. Was in
                        formData and in the payload, but the
                        form had no Textarea for it — the
                        field was always empty on create. The
                        student wizard collects a personal
                        statement, and admins often pre-fill it
                        on the student's behalf (e.g. when the
                        student can't write English well yet).
                        maxLength=4000 mirrors the student
                        wizard's limit (M3). */}
                    <div>
                      <Label className="text-[#1F2937]">Personal Statement</Label>
                      <Textarea
                        value={formData.personalStatement}
                        onChange={(e) => handleChange('personalStatement', e.target.value)}
                        placeholder="Why does this student want to study this program? Goals, motivation, relevant background..."
                        className="rounded-none mt-1"
                        rows={5}
                        maxLength={4000}
                      />
                      <p className="text-xs text-[#4B5563] mt-1">
                        {formData.personalStatement.length} / 4000
                      </p>
                    </div>

                    <div>
                      <Label className="text-[#1F2937]">Additional Notes</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Add any additional notes or requirements..."
                        className="rounded-none mt-1"
                        rows={4}
                        // M3: cap notes at 2000 chars. The DB
                        // column is TEXT-ish with no length
                        // limit, but the display layer truncates
                        // awkwardly past a certain point and a
                        // runaway paste (100k chars) just isn't
                        // useful here.
                        maxLength={2000}
                      />
                      <p className="text-xs text-[#4B5563] mt-1">
                        {formData.notes.length} / 2000
                      </p>
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
                          <div>
                            <span className="text-[#4B5563]">Initial Status:</span>{' '}
                            <span className="font-medium text-[#1F2937]">
                              {formData.submitStatus}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#4B5563]">Priority:</span>{' '}
                            <span className="font-medium text-[#1F2937]">
                              {formData.priority}
                            </span>
                          </div>
                        </div>
                        {formData.personalStatement && (
                          <>
                            <Separator className="my-4" />
                            <div>
                              <span className="text-[#4B5563]">Personal Statement:</span>
                              <p className="mt-1 text-[#1F2937] whitespace-pre-wrap">
                                {formData.personalStatement}
                              </p>
                            </div>
                          </>
                        )}
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
                    // C3: step 1 can proceed EITHER with a
                    // selected existing student OR with a valid
                    // lead (name + email both filled). The
                    // previous condition `!formData.studentId`
                    // blocked the lead path entirely — the Next
                    // button stayed disabled forever for a lead,
                    // even after filling name + email.
                    (step === 1 && !formData.studentId &&
                     !(formData.applicantName.trim() && formData.applicantEmail.trim())) ||
                    (step === 2 && (!formData.degree || !formData.program || !formData.intake))
                  }
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  className="rounded-none bg-[#9B1B30] hover:bg-[#7A1526] text-white"
                  onClick={handleSubmit}
                  disabled={
                    isLoading ||
                    // C3: same as the Next button — submit
                    // requires either a linked student OR a
                    // valid lead pair (name + email).
                    (!formData.studentId &&
                     !(formData.applicantName.trim() && formData.applicantEmail.trim()))
                  }
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="text-white mr-2" />
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

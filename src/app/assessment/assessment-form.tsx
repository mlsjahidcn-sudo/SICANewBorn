'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle, Mail, Calendar, GraduationCap, Upload, AlertCircle, Loader2, FileCheck, X } from 'lucide-react';

interface Props {
  successMessages: {
    title: string;
    body1: string;
    body2: string;
    sendAnother: string;
  };
}

/** Maximum file size: 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const ALLOWED_EXTENSIONS = '.pdf, .png, .jpg, .jpeg';

export function AssessmentForm({ successMessages }: Props) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'failed'>('idle');
  const [uploadProgress, setUploadProgress] = useState('');
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setUploadStatus('idle');
      setStoragePath(null);
      setAssessmentId(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg('File too large. Maximum size is 10MB.');
      setUploadStatus('failed');
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMsg('Invalid file type. Use PDF, PNG, or JPG.');
      setUploadStatus('failed');
      return;
    }

    setSelectedFile(file);
    setErrorMsg('');
    setUploadStatus('uploading');
    setUploadProgress('Starting upload…');

    try {
      // Step 1: Create assessment record to get an ID
      const form = document.getElementById('assessment-form') as HTMLFormElement;
      const data = new FormData(form);
      const submitPayload = {
        firstName: data.get('firstName'),
        lastName: data.get('lastName'),
        email: data.get('email'),
        whatsapp: data.get('whatsapp'),
        country: data.get('country'),
        dateOfBirth: data.get('dateOfBirth') || '',
        currentEducation: data.get('currentEducation') || '',
        intendedMajor: data.get('intendedMajor') || '',
        targetUniversities: data.get('targetUniversities') || '',
        notes: data.get('notes') || '',
        transcript: { name: file.name, size: file.size, type: file.type },
        sourcePage: window.location.pathname,
      };

      setUploadProgress('Creating record…');
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitPayload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || `Failed (${res.status})`);
      }
      const result = (await res.json()) as { success: boolean; id: string };
      setAssessmentId(result.id);

      // Step 2: Get signed upload URL
      setUploadProgress('Preparing upload…');
      const urlRes = await fetch('/api/upload/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: result.id,
          fileName: file.name,
          fileType: file.type,
          size: file.size,
        }),
      });
      if (!urlRes.ok) {
        const body = await urlRes.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || 'Failed to prepare upload');
      }
      const { uploadUrl, storagePath: path } = (await urlRes.json()) as {
        uploadUrl: string;
        storagePath: string;
      };

      // Step 3: Upload directly to Supabase Storage
      setUploadProgress('Uploading file…');
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) {
        throw new Error(`Upload failed (${uploadRes.status})`);
      }

      setStoragePath(path);
      setUploadStatus('done');
      setUploadProgress(`✓ ${file.name} uploaded`);
    } catch (err) {
      setUploadStatus('failed');
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      firstName: data.get('firstName'),
      lastName: data.get('lastName'),
      email: data.get('email'),
      whatsapp: data.get('whatsapp'),
      country: data.get('country'),
      dateOfBirth: data.get('dateOfBirth') || '',
      currentEducation: data.get('currentEducation') || '',
      intendedMajor: data.get('intendedMajor') || '',
      targetUniversities: data.get('targetUniversities') || '',
      notes: data.get('notes') || '',
      sourcePage: window.location.pathname,
    };

    // If we have a storage path but the record wasn't created yet, create it first
    if (storagePath && !assessmentId) {
      try {
        setUploadProgress('Creating record…');
        const res = await fetch('/api/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            transcript: selectedFile
              ? { name: selectedFile.name, size: selectedFile.size, type: selectedFile.type }
              : null,
            transcriptStoragePath: storagePath,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error || `Submission failed (${res.status})`);
        }
        setStatus('success');
        setSelectedFile(null);
        setUploadStatus('idle');
        setStoragePath(null);
        setAssessmentId(null);
        form.reset();
        return;
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Submission failed');
        setStatus('error');
        return;
      }
    }

    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          transcript: selectedFile
            ? { name: selectedFile.name, size: selectedFile.size, type: selectedFile.type }
            : null,
          transcriptStoragePath: storagePath,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || `Submission failed (${res.status})`);
      }
      setStatus('success');
      setSelectedFile(null);
      setUploadStatus('idle');
      setStoragePath(null);
      setAssessmentId(null);
      form.reset();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed');
      setStatus('error');
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-[#1F2937] mb-6">Submit Your Assessment</h2>

      {status === 'success' ? (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-[#9B1B30]/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-[#9B1B30]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
            {successMessages.title}
          </h3>
          <p className="text-[#4B5563] mb-2">{successMessages.body1}</p>
          <p className="text-[#4B5563] mb-6">{successMessages.body2}</p>
          <button
            onClick={() => setStatus('idle')}
            className="px-6 py-2 bg-[#9B1B30] text-white font-semibold text-sm uppercase tracking-wider hover:bg-[#7A1526] transition-colors duration-150"
          >
            {successMessages.sendAnother}
          </button>
        </div>
      ) : (
        <form id="assessment-form" onSubmit={handleSubmit} className="space-y-5">
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <h3 className="text-base font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#1B2A4A]" />
              Basic Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
                  placeholder="Smith"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5 mt-5">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">WhatsApp *</label>
                <input
                  type="tel"
                  name="whatsapp"
                  required
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Country *</label>
              <input
                type="text"
                name="country"
                required
                className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
                placeholder="Your Country"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-base font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#1B2A4A]" />
              Date of Birth *
            </h3>
            <div>
              <input
                type="date"
                name="dateOfBirth"
                required
                className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-base font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#1B2A4A]" />
              Education Background
            </h3>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Current Education *</label>
                <select
                  name="currentEducation"
                  required
                  defaultValue=""
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
                >
                  <option value="">Select...</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor">Bachelor's Degree</option>
                  <option value="Master">Master's Degree</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Intended Major *</label>
                <input
                  type="text"
                  name="intendedMajor"
                  required
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
                  placeholder="Computer Science, Business, etc."
                />
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                Target Universities (Optional)
              </label>
              <input
                type="text"
                name="targetUniversities"
                className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
                placeholder="Tsinghua, Peking, Fudan, etc."
              />
            </div>
          </div>

          {/* Transcript Upload */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-base font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
              <Upload className="h-4 w-4 text-[#1B2A4A]" />
              Academic Transcript
              <span className="text-xs font-normal text-gray-500 ml-1">(optional)</span>
            </h3>
            <div className="border-2 border-dashed border-gray-300 p-6 text-center">
              {uploadStatus === 'idle' && (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Select your academic transcript (PDF/PNG/JPG)</p>
                  <p className="text-xs text-gray-500 mb-3">Maximum file size: 10 MB</p>
                  <input
                    type="file"
                    accept={ALLOWED_EXTENSIONS}
                    onChange={handleFileChange}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-[#9B1B30] file:text-white hover:file:bg-[#7A1526]"
                  />
                </>
              )}
              {uploadStatus === 'uploading' && (
                <div>
                  <Spinner size="lg" className="text-[#9B1B30] mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{uploadProgress}</p>
                </div>
              )}
              {uploadStatus === 'done' && selectedFile && (
                <div>
                  <FileCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#1B2A4A]">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    {(selectedFile.size / 1024).toFixed(1)} KB — {uploadProgress}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setUploadStatus('idle');
                      setStoragePath(null);
                      setAssessmentId(null);
                    }}
                    className="text-xs text-red-600 hover:underline flex items-center gap-1 mx-auto"
                  >
                    <X className="h-3 w-3" /> Remove
                  </button>
                </div>
              )}
              {uploadStatus === 'failed' && (
                <div>
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600 mb-3">{errorMsg}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadStatus('idle');
                      setErrorMsg('');
                    }}
                    className="text-sm text-[#9B1B30] underline"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Additional Notes</label>
              <textarea
                name="notes"
                rows={4}
                className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30] resize-vertical"
                placeholder="Any additional information you'd like us to know..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full sm:w-auto px-8 py-3 bg-[#9B1B30] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#7A1526] transition-colors duration-150 flex items-center gap-2 disabled:opacity-50"
          >
            {status === 'submitting' ? (
              <>
                <Spinner size="sm" />
                Submitting…
              </>
            ) : (
              'Submit Assessment'
            )}
          </button>
        </form>
      )}
    </div>
  );
}

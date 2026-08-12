'use client';

import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { getCurrentUtm } from '@/lib/utm';
import { track } from '@/lib/analytics';
import { useI18n } from '@/lib/i18n';
import {
  CheckCircle,
  Mail,
  GraduationCap,
  Upload,
  AlertCircle,
  FileCheck,
  X,
  ArrowRight,
  ArrowLeft,
  User,
  FileText,
  Check,
} from 'lucide-react';

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

// Step metadata. The wizard always advances forward and lets the
// user jump back to fix earlier answers; it never loses data
// because the underlying form is uncontrolled.
const STEPS = [
  { key: 'personal', label: 'Personal', icon: User, desc: 'Your contact details' },
  { key: 'education', label: 'Education', icon: GraduationCap, desc: 'Your study background' },
  { key: 'documents', label: 'Documents', icon: Upload, desc: 'Upload transcript' },
  { key: 'notes', label: 'Submit', icon: FileText, desc: 'Add notes & send' },
] as const;

export function AssessmentForm({ successMessages }: Props) {
  const router = useRouter();
  const { locale } = useI18n();
  // If the user arrived on /assessment from a university
  // detail page's "Apply" CTA (Phase 24 wired ?interest=<slug>
  // into the redirect chain), pass it through to the
  // thank-you page so the "you were looking at this" card
  // lights up.
  const searchParams = useSearchParams();
  const interestParam = searchParams.get('interest');
  // Phase 1: ?interestName is the human-readable university name
  // (e.g. "Tsinghua University") piped through the apply CTA
  // chain from the university detail page. We forward it to
  // /thank-you so the "you were looking at this" personalization
  // card shows the real name, not the raw slug.
  const interestNameParam = searchParams.get('interestName');

  // Phase 29: fire the assessment_start event once on mount.
  // The event fires AFTER first render so the event helpers
  // have access to the locale + the URL params from the
  // search-params hook. We capture `referrer` so the funnel
  // can attribute the lead to the surface that sent them
  // here (home CTA / university Apply CTA / nav link /
  // direct visit).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ref = document.referrer;
    let source: 'home' | 'university' | 'nav' | 'direct' | 'other' = 'other';
    if (!ref) {
      source = 'direct';
    } else if (ref.includes('/universities/')) {
      source = 'university';
    } else if (ref.endsWith('/') || ref.endsWith(window.location.host)) {
      source = 'home';
    } else {
      try {
        const refPath = new URL(ref).pathname;
        if (refPath === '/' || refPath === '') source = 'home';
        else if (refPath.startsWith('/universities/')) source = 'university';
      } catch {
        // malformed referrer — leave as 'other'
      }
    }
    track('assessment_start', {
      source,
      locale,
      interest: interestParam || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fire once on mount; locale is stable per session
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'failed'>('idle');
  const [uploadProgress, setUploadProgress] = useState('');
  const [storagePath, setStoragePath] = useState<string | null>(null);

  // Pre-submit summary values. Read from form on input events
  // (post-render) and displayed in step 4. Avoids the React
  // anti-pattern of reading ref.current during render.
  const [summary, setSummary] = useState({
    name: '—',
    email: '—',
    country: '—',
    currentEducation: '—',
    intendedMajor: '—',
  });

  // Refs for per-step validation. The form is still uncontrolled
  // (FormData on submit) but the wizard needs to read individual
  // field values to validate before advancing.
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const whatsappRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLInputElement>(null);
  const dateOfBirthRef = useRef<HTMLInputElement>(null);
  const currentEducationRef = useRef<HTMLSelectElement>(null);
  const intendedMajorRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Pre-fill the Intended Major field when the user comes from a
  // program page (e.g. /assessment?major=Computer+Science).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const major = params.get('major');
    if (major && intendedMajorRef.current) {
      intendedMajorRef.current.value = major;
    }
  }, []);

  // Keep the pre-submit summary in sync with the live form values.
  // We attach a single delegated `input` listener to the form (via
  // the ref) and update state on every change. This is a post-
  // render side effect, so it doesn't violate the React refs
  // rule of "no ref access during render".
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const update = () => {
      const data = new FormData(form);
      setSummary({
        name:
          [data.get('firstName'), data.get('lastName')]
            .filter(Boolean)
            .join(' ')
            .trim() || '—',
        email: (data.get('email') as string)?.trim() || '—',
        country: (data.get('country') as string)?.trim() || '—',
        currentEducation: (data.get('currentEducation') as string)?.trim() || '—',
        intendedMajor: (data.get('intendedMajor') as string)?.trim() || '—',
      });
    };
    update();
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    return () => {
      form.removeEventListener('input', update);
      form.removeEventListener('change', update);
    };
  }, [currentStep, status]);

  // Per-step validation. Returns null if step is valid; otherwise
  // returns the name of the first invalid field (which we focus).
  // Required-field check uses simple trimmed-string comparison —
  // mirrors what `required` would do, but lets us advance one
  // step at a time without re-rendering the whole form.
  const validateStep = (step: number): string | null => {
    const get = (ref: React.RefObject<HTMLInputElement | HTMLSelectElement | null>) => {
      return ref.current?.value?.trim() ?? '';
    };
    if (step === 0) {
      if (!get(firstNameRef)) return 'firstName';
      if (!get(lastNameRef)) return 'lastName';
      if (!get(emailRef)) return 'email';
      else if (!/^\S+@\S+\.\S+$/.test(get(emailRef))) return 'email';
      if (!get(whatsappRef)) return 'whatsapp';
      if (!get(countryRef)) return 'country';
      if (!get(dateOfBirthRef)) return 'dateOfBirth';
      return null;
    }
    if (step === 1) {
      if (!get(currentEducationRef)) return 'currentEducation';
      if (!get(intendedMajorRef)) return 'intendedMajor';
      return null;
    }
    // Steps 2 and 3 are always valid (transcript + notes are
    // optional, and the submit happens in step 3).
    return null;
  };

  const focusField = (name: string) => {
    if (!formRef.current) return;
    const el = formRef.current.querySelector<HTMLElement>(`[name="${name}"]`);
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNext = () => {
    const invalid = validateStep(currentStep);
    if (invalid) {
      focusField(invalid);
      return;
    }
    // Phase 29: fire step_complete on every successful
    // forward-advance. The step number is the one the user
    // just finished (1-indexed). We don't fire on the
    // initial mount — only on actual advancement — so
    // the funnel shows "step 1 reached" via assessment_start.
    track('assessment_step_complete', {
      step: (currentStep + 1) as 1 | 2 | 3 | 4,
      locale,
    });
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setUploadStatus('idle');
      setStoragePath(null);
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
    setUploadProgress('Preparing upload…');

    try {
      // Step 1: Get signed upload URL from the server. We do NOT create an
      // assessment record here — that only happens once on final submit.
      // The server generates a one-time folder id for the storage path.
      const urlRes = await fetch('/api/upload/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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

      // Step 2: Upload directly to Supabase Storage
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
    // Phase 26: spread UTM + click-id attribution into the
    // payload. Mirrors the contact-form pattern — helper
    // reads sessionStorage (cross-page survival) and falls
    // back to the current URL. Spreads the (possibly empty)
    // object so a direct visit omits the keys cleanly.
    const utm = getCurrentUtm();
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
      ...utm,
    };

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
      // Phase 29: assessment_submit on successful submission.
      // We fire it before the form.reset() so the event captures
      // the full state. `has_transcript` reflects whether the
      // upload completed (storagePath is set on successful
      // signed-URL upload).
      track('assessment_submit', {
        locale,
        has_transcript: storagePath != null,
        interest: interestParam || undefined,
      });
      form.reset();
      // Phase 27: redirect to the thank-you page. Pass through
      // the ?interest=<slug> + ?interestName=<name> params if
      // the user came from a university detail page's Apply CTA
      // (Phase 24 wired this on the redirect chain) so the
      // thank-you page can show a "you were looking at this"
      // personalized card with the real name (not the raw slug).
      // Same 250ms delay as the contact form — short enough to
      // feel instant, long enough to flush the network state
      // and show the inline success state to anyone watching
      // devtools.
      const interestQs = interestParam
        ? `&interest=${encodeURIComponent(interestParam)}${interestNameParam ? `&interestName=${encodeURIComponent(interestNameParam)}` : ''}`
        : '';
      const thankYouUrl = interestParam
        ? `/thank-you?source=assessment${interestQs}`
        : '/thank-you?source=assessment';
      setTimeout(() => {
        router.push(thankYouUrl);
      }, 250);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed');
      setStatus('error');
    }
  };

  // ── Success state ─────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="bg-white border border-gray-200 p-6 sm:p-8 text-center">
        <div className="h-16 w-16 bg-[#9B1B30]/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-[#9B1B30]" />
        </div>
        <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
          {successMessages.title}
        </h3>
        <p className="text-[#4B5563] mb-2">{successMessages.body1}</p>
        <p className="text-[#4B5563] mb-6">{successMessages.body2}</p>
        <button
          onClick={() => {
            setStatus('idle');
            setCurrentStep(0);
          }}
          className="px-6 py-2 bg-[#9B1B30] text-white font-semibold text-sm uppercase tracking-wider hover:bg-[#7A1526] transition-colors duration-150"
        >
          {successMessages.sendAnother}
        </button>
      </div>
    );
  }

  // ── Wizard ────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-gray-200 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-[#1F2937] mb-6">Submit Your Assessment</h2>

      {/* Progress indicator */}
      <ol className="flex items-center gap-2 mb-6" aria-label="Progress">
        {STEPS.map((s, i) => {
          const isDone = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <li key={s.key} className="flex-1 flex items-center gap-2 min-w-0">
              <div
                className={[
                  'shrink-0 h-8 w-8 flex items-center justify-center text-xs font-bold border-2',
                  isDone
                    ? 'bg-[#9B1B30] border-[#9B1B30] text-white'
                    : isCurrent
                      ? 'bg-white border-[#9B1B30] text-[#9B1B30]'
                      : 'bg-white border-gray-200 text-gray-400',
                ].join(' ')}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isDone ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <div className="min-w-0 flex-1 hidden sm:block">
                <p
                  className={[
                    'text-xs font-semibold truncate',
                    isCurrent ? 'text-[#9B1B30]' : isDone ? 'text-[#1B2A4A]' : 'text-gray-400',
                  ].join(' ')}
                >
                  {s.label}
                </p>
                <p className="text-[10px] text-gray-500 truncate">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={[
                    'hidden md:block flex-1 h-px',
                    isDone ? 'bg-[#9B1B30]' : 'bg-gray-200',
                  ].join(' ')}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Visual progress bar */}
      <div className="h-1 w-full bg-gray-100 mb-6 overflow-hidden">
        <div
          className="h-full bg-[#9B1B30] transition-all duration-300"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5"
      >
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── Step 1: Personal info ─────────────────────────── */}
        {currentStep === 0 && (
          <div>
            <h3 className="text-base font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-[#1B2A4A]" />
              Personal Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">First Name *</label>
                <input
                  ref={firstNameRef}
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
                  ref={lastNameRef}
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
                  ref={emailRef}
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
                  ref={whatsappRef}
                  type="tel"
                  name="whatsapp"
                  required
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5 mt-5">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Country *</label>
                <input
                  ref={countryRef}
                  type="text"
                  name="country"
                  required
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
                  placeholder="Your Country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Date of Birth *</label>
                <input
                  ref={dateOfBirthRef}
                  type="date"
                  name="dateOfBirth"
                  required
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Education ─────────────────────────────── */}
        {currentStep === 1 && (
          <div>
            <h3 className="text-base font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#1B2A4A]" />
              Education Background
            </h3>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Current Education *</label>
                <select
                  ref={currentEducationRef}
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
                  ref={intendedMajorRef}
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
            <p className="mt-4 text-xs text-gray-500 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Step 1 of 4 complete. Tell us about your study background.
            </p>
          </div>
        )}

        {/* ── Step 3: Documents (transcript upload) ─────────── */}
        {currentStep === 2 && (
          <div>
            <h3 className="text-base font-semibold text-[#1F2937] mb-1 flex items-center gap-2">
              <Upload className="h-4 w-4 text-[#1B2A4A]" />
              Academic Transcript
              <span className="text-xs font-normal text-gray-500 ml-1">(optional but recommended)</span>
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Uploading your transcript lets our team give you a more accurate assessment.
              Skip this if you don't have a copy handy — you can always email it later.
            </p>
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
            {uploadStatus === 'failed' && (
              <p className="mt-3 text-xs text-red-600">
                The transcript upload failed, but you can still submit the form and email
                your transcript to <a href="mailto:info@studyinchina.academy" className="underline">info@studyinchina.academy</a>{' '}
                after.
              </p>
            )}
          </div>
        )}

        {/* ── Step 4: Notes & Submit ────────────────────────── */}
        {currentStep === 3 && (
          <div>
            <h3 className="text-base font-semibold text-[#1F2937] mb-1 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#1B2A4A]" />
              Additional Notes
              <span className="text-xs font-normal text-gray-500 ml-1">(optional)</span>
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Anything else you want our team to know? Scholarship needs, preferred
              cities, deadlines, language test scores, etc.
            </p>
            <div>
              <textarea
                name="notes"
                rows={6}
                className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30] resize-vertical"
                placeholder="Any additional information you'd like us to know..."
              />
            </div>

            {/* Summary card — pre-submit review. Values are read
                from the form on mount and via input events (see
                useEffect below) so we don't have to touch refs
                during render. */}
            <div className="mt-6 bg-[#FAFAF8] border border-gray-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] mb-3">
                Review before submitting
              </p>
              <dl className="space-y-1.5 text-sm">
                <SummaryRow label="Name" value={summary.name} />
                <SummaryRow label="Email" value={summary.email} />
                <SummaryRow label="Country" value={summary.country} />
                <SummaryRow label="Education" value={summary.currentEducation} />
                <SummaryRow label="Intended major" value={summary.intendedMajor} />
                {selectedFile && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500">Transcript</dt>
                    <dd className="font-medium text-[#1B2A4A] text-right">
                      {selectedFile.name}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}

        {/* ── Navigation ──────────────────────────────────── */}
        <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0 || status === 'submitting'}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-[#1B2A4A] border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#9B1B30] text-white font-semibold text-sm uppercase tracking-wider hover:bg-[#7A1526] transition-colors"
            >
              {currentStep === 0 ? 'Continue to education' : 'Continue to documents'}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#9B1B30] text-white font-semibold text-sm uppercase tracking-wider hover:bg-[#7A1526] transition-colors disabled:opacity-50"
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
          )}
        </div>

        <p className="text-xs text-gray-400 text-center sm:text-left">
          Step {currentStep + 1} of {STEPS.length} · {STEPS[currentStep].label}
        </p>
      </form>
    </div>
  );
}

// Tiny presentational helper for the pre-submit summary list. Reads
// from the `summary` state (which is updated by a delegated input
// listener — see useEffect above). This is the lint-safe
// alternative to reading formRef.current during render.
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-[#1B2A4A] text-right max-w-[60%] truncate">
        {value || '—'}
      </dd>
    </div>
  );
}

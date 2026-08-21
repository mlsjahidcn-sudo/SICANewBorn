'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CheckCircle2,
  GraduationCap,
  User,
  BookOpen,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface FormState {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  nationality: string;
  university: string;
  program: string;
  degree: '' | 'Bachelor' | 'Master' | 'PhD';
  intake: string;
  gpa: string;
  englishTest: '' | 'IELTS' | 'TOEFL' | 'Duolingo' | 'PTE' | 'Other';
  englishScore: string;
  whyProgram: string;
  // Honeypot — visually hidden, never filled by humans.
  website: string;
}

const STORAGE_KEY = 'sica-apply-draft-v1';

const EMPTY: FormState = {
  studentName: '',
  studentEmail: '',
  studentPhone: '',
  nationality: '',
  university: '',
  program: '',
  degree: '',
  intake: '',
  gpa: '',
  englishTest: '',
  englishScore: '',
  whyProgram: '',
  website: '',
};

type FileCategory = 'passport' | 'transcript' | 'english_test' | 'other';
type FilesMap = Partial<Record<FileCategory, File>>;

interface SuccessPayload {
  application_id: string;
  application_number: string;
  student_id: string;
  confirmation: {
    student_name: string;
    university: string | null;
    program: string | null;
  };
}

const DEGREES = ['Bachelor', 'Master', 'PhD'] as const;
const TESTS = ['IELTS', 'TOEFL', 'Duolingo', 'PTE', 'Other'] as const;

export function ApplyForm() {
  const { t } = useI18n();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['student']));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessPayload | null>(null);
  const [files, setFiles] = useState<FilesMap>({});
  const formTopRef = useRef<HTMLDivElement>(null);

  // Hydrate from localStorage on mount. Do not block render — fall
  // back to empty if draft is corrupt (e.g. partial write from an
  // older tab that was killed mid-typing).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FormState>;
        setForm((prev) => ({ ...prev, ...parsed, website: '' }));
        // Auto-expand sections that have content
        if (parsed.studentName || parsed.studentEmail) {
          setExpanded((prev) => new Set(prev).add('student'));
        }
      }
    } catch {
      // ignore — start clean
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist on every change. Throttled via the next-tick effect;
  // writing on every keystroke is fine for the small payload.
  useEffect(() => {
    if (!hydrated) return;
    try {
      // Never persist the honeypot value (defense in depth — a
      // bot that reads localStorage shouldn't find a confirmation).
      const { website: _omit, ...rest } = form;
      void _omit;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch {
      // ignore — quota or private mode
    }
  }, [form, hydrated]);

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleSection = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Section progress: true if the minimum-required fields are filled.
  // Mobile users see the badge so they know what's left.
  const sectionStatus = useCallback(
    (id: 'student' | 'program' | 'academics' | 'statement' | 'documents'): 'done' | 'partial' | 'empty' => {
      if (id === 'student') {
        if (!form.studentName) return 'empty';
        if (form.studentEmail && form.studentPhone) return 'done';
        return 'partial';
      }
      if (id === 'program') {
        if (!form.university && !form.program) return 'empty';
        if (form.university && form.program) return 'done';
        return 'partial';
      }
      if (id === 'academics') {
        // All optional — always "done" if user filled anything, else
        // "empty". Either is OK to submit.
        if (!form.gpa && !form.englishScore) return 'empty';
        return 'done';
      }
      if (id === 'statement') {
        if (!form.whyProgram) return 'empty';
        return 'done';
      }
      return 'empty'; // documents — v1 defers to admin
    },
    [form],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    // Client-side guard: name is required. The server re-validates
    // everything; this is just a faster UX.
    if (!form.studentName.trim()) {
      setError(t('apply.errorNameRequired'));
      setExpanded((prev) => new Set(prev).add('student'));
      formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      // If the user attached any files, use multipart/form-data
      // so the server can upload + create the student_documents
      // rows in one round trip. Otherwise plain JSON.
      const hasFiles = Object.values(files).some((f) => f && f.size > 0);
      let res: Response;
      if (hasFiles) {
        const fd = new FormData();
        for (const [k, v] of Object.entries(form)) {
          if (typeof v === 'string') fd.set(k, v);
        }
        for (const cat of ['passport', 'transcript', 'english_test', 'other'] as const) {
          const f = files[cat];
          if (f && f.size > 0) fd.set(`file_${cat}`, f, f.name);
        }
        res = await fetch('/api/public/submissions', { method: 'POST', body: fd });
      } else {
        res = await fetch('/api/public/submissions', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const payload = (await res.json()) as SuccessPayload;
      setSuccess(payload);
      // Clear the draft so a new submission starts clean.
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      // Scroll the success state into view on mobile.
      setTimeout(() => {
        formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('apply.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  }

  // Success view
  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
        <Header />
        <main className="flex-1">
          <div ref={formTopRef} className="max-w-2xl mx-auto px-4 py-12">
            <div className="bg-white border-2 border-[#9B1B30] p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-[#9B1B30] rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-9 w-9 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">
                {t('apply.successTitle')}
              </h1>
              <p className="text-sm text-gray-600 mb-6">
                {t('apply.successBody')}
              </p>
              <div className="bg-[#FAFAF8] border border-gray-200 p-4 text-left space-y-1 mb-6">
                <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                  {t('apply.successRefLabel')}
                </div>
                <div className="font-mono text-xl text-[#1B2A4A]">
                  {success.application_number || success.application_id}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {success.confirmation.student_name}
                  {success.confirmation.university ? ` · ${success.confirmation.university}` : ''}
                  {success.confirmation.program ? ` · ${success.confirmation.program}` : ''}
                </div>
              </div>
              <p className="text-xs text-gray-500">{t('apply.successNextSteps')}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const sectionMeta = [
    { id: 'student', icon: User, label: t('apply.sectionStudent') },
    { id: 'program', icon: BookOpen, label: t('apply.sectionProgram') },
    { id: 'academics', icon: Award, label: t('apply.sectionAcademics') },
    { id: 'statement', icon: Sparkles, label: t('apply.sectionStatement') },
    { id: 'documents', icon: GraduationCap, label: t('apply.sectionDocuments') },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Header />

      <main className="flex-1 pb-32 md:pb-12">
        <div ref={formTopRef} className="max-w-3xl mx-auto px-4 py-8">
          {/* Hero */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#9B1B30]/10 text-[#9B1B30] text-xs font-semibold mb-4">
              {t('apply.eyebrow')}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-2">
              {t('apply.title')}
            </h1>
            <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
              {t('apply.subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Honeypot — visually hidden via opacity-0 + absolute positioning.
                Real screen readers (browsers) skip it because aria-hidden.
                Bots that auto-fill every visible field will fill this. */}
            <div className="absolute opacity-0 pointer-events-none -z-50" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => update('website', e.target.value)}
              />
            </div>

            {sectionMeta.map(({ id, icon: Icon, label }) => {
              const isOpen = expanded.has(id);
              const status = sectionStatus(id);
              return (
                <div key={id} className="bg-white border border-gray-200">
                  <button
                    type="button"
                    onClick={() => toggleSection(id)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#1B2A4A]/5 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-[#1B2A4A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#1B2A4A] text-sm">{label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {status === 'done' && `✓ ${t('apply.sectionDone')}`}
                        {status === 'partial' && t('apply.sectionPartial')}
                        {status === 'empty' && t('apply.sectionEmpty')}
                      </div>
                    </div>
                    <StatusDot status={status} />
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-0 space-y-4 border-t border-gray-100">
                      {id === 'student' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor="studentName">{t('apply.fieldName')} *</Label>
                            <Input
                              id="studentName"
                              value={form.studentName}
                              onChange={(e) => update('studentName', e.target.value)}
                              required
                              placeholder={t('apply.fieldNamePh')}
                            />
                          </div>
                          <div>
                            <Label htmlFor="studentEmail">{t('apply.fieldEmail')}</Label>
                            <Input
                              id="studentEmail"
                              type="email"
                              inputMode="email"
                              value={form.studentEmail}
                              onChange={(e) => update('studentEmail', e.target.value)}
                              placeholder={t('apply.fieldEmailPh')}
                            />
                          </div>
                          <div>
                            <Label htmlFor="studentPhone">{t('apply.fieldPhone')}</Label>
                            <Input
                              id="studentPhone"
                              type="tel"
                              inputMode="tel"
                              value={form.studentPhone}
                              onChange={(e) => update('studentPhone', e.target.value)}
                              placeholder={t('apply.fieldPhonePh')}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="nationality">{t('apply.fieldNationality')}</Label>
                            <Input
                              id="nationality"
                              value={form.nationality}
                              onChange={(e) => update('nationality', e.target.value)}
                              placeholder={t('apply.fieldNationalityPh')}
                            />
                          </div>
                        </div>
                      )}

                      {id === 'program' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor="university">{t('apply.fieldUniversity')}</Label>
                            <Input
                              id="university"
                              value={form.university}
                              onChange={(e) => update('university', e.target.value)}
                              placeholder={t('apply.fieldUniversityPh')}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="program">{t('apply.fieldProgram')}</Label>
                            <Input
                              id="program"
                              value={form.program}
                              onChange={(e) => update('program', e.target.value)}
                              placeholder={t('apply.fieldProgramPh')}
                            />
                          </div>
                          <div>
                            <Label htmlFor="degree">{t('apply.fieldDegree')}</Label>
                            <select
                              id="degree"
                              className="w-full h-10 border border-gray-300 px-3 text-sm bg-white"
                              value={form.degree}
                              onChange={(e) => update('degree', e.target.value as FormState['degree'])}
                            >
                              <option value="">—</option>
                              {DEGREES.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="intake">{t('apply.fieldIntake')}</Label>
                            <Input
                              id="intake"
                              value={form.intake}
                              onChange={(e) => update('intake', e.target.value)}
                              placeholder={t('apply.fieldIntakePh')}
                            />
                          </div>
                        </div>
                      )}

                      {id === 'academics' && (
                        <div className="space-y-4">
                          <p className="text-xs text-gray-500">{t('apply.academicsHelp')}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="gpa">{t('apply.fieldGpa')}</Label>
                              <Input
                                id="gpa"
                                value={form.gpa}
                                onChange={(e) => update('gpa', e.target.value)}
                                placeholder={t('apply.fieldGpaPh')}
                              />
                            </div>
                            <div>
                              <Label htmlFor="englishTest">{t('apply.fieldEnglishTest')}</Label>
                              <select
                                id="englishTest"
                                className="w-full h-10 border border-gray-300 px-3 text-sm bg-white"
                                value={form.englishTest}
                                onChange={(e) => update('englishTest', e.target.value as FormState['englishTest'])}
                              >
                                <option value="">—</option>
                                {TESTS.map((t2) => (
                                  <option key={t2} value={t2}>
                                    {t2}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label htmlFor="englishScore">{t('apply.fieldEnglishScore')}</Label>
                              <Input
                                id="englishScore"
                                value={form.englishScore}
                                onChange={(e) => update('englishScore', e.target.value)}
                                placeholder={t('apply.fieldEnglishScorePh')}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {id === 'statement' && (
                        <div>
                          <Label htmlFor="whyProgram">{t('apply.fieldWhyProgram')}</Label>
                          <Textarea
                            id="whyProgram"
                            value={form.whyProgram}
                            onChange={(e) => update('whyProgram', e.target.value)}
                            rows={5}
                            maxLength={500}
                            placeholder={t('apply.fieldWhyProgramPh')}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {form.whyProgram.length}/500
                          </p>
                        </div>
                      )}

                      {id === 'documents' && (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-500">{t('apply.documentsHelp')}</p>
                          {(
                            [
                              { cat: 'passport', label: t('apply.docPassport') },
                              { cat: 'transcript', label: t('apply.docTranscript') },
                              { cat: 'english_test', label: t('apply.docEnglishTest') },
                              { cat: 'other', label: t('apply.docOther') },
                            ] as const
                          ).map(({ cat, label }) => (
                            <div key={cat}>
                              <Label htmlFor={`file_${cat}`}>{label}</Label>
                              <input
                                id={`file_${cat}`}
                                name={`file_${cat}`}
                                type="file"
                                accept="application/pdf,image/jpeg,image/png"
                                onChange={(e) => {
                                  const f = e.target.files?.[0] ?? null;
                                  setFiles((prev) => ({ ...prev, [cat]: f }));
                                }}
                                className="block w-full text-sm text-gray-700 file:mr-3 file:px-3 file:py-1.5 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-[#1B2A4A] file:text-white hover:file:bg-[#26345A]"
                              />
                              {files[cat] && (
                                <p className="text-xs text-gray-500 mt-1">
                                  ✓ {files[cat]!.name} ({Math.round(files[cat]!.size / 1024)} KB)
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Desktop submit button (inline) */}
            <div className="hidden md:flex justify-end pt-2">
              <Button
                type="submit"
                disabled={submitting || !form.studentName.trim()}
                className="bg-[#9B1B30] hover:bg-[#7A1526] text-white px-8"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('apply.submitting')}
                  </>
                ) : (
                  t('apply.submit')
                )}
              </Button>
            </div>

            {/* Mobile sticky submit */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-30">
              <Button
                type="submit"
                disabled={submitting || !form.studentName.trim()}
                className="w-full bg-[#9B1B30] hover:bg-[#7A1526] text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('apply.submitting')}
                  </>
                ) : (
                  t('apply.submit')
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatusDot({ status }: { status: 'done' | 'partial' | 'empty' }) {
  if (status === 'done') {
    return <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />;
  }
  if (status === 'partial') {
    return <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />;
  }
  return <div className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />;
}

'use client';

/**
 * ShortlistBuilder — Phase 175.
 *
 * The multi-university application builder. SICA's own email copy sells
 * "1 reach, 2 targets, 1 safety" and "apply to 3-5 universities", but
 * until now the admin wizard could only create ONE application at a
 * time, with the university derived from the picked program. This
 * inverts that: you describe the program you want, see every university
 * that offers it, and pick several.
 *
 * Deliberately a SEPARATE page from the existing single-target wizard
 * (`/admin/applications/new`, 1,498 lines) rather than a rewrite of it.
 * That wizard still works and is still the right tool for "one student,
 * one specific school". This is the other job.
 *
 * All copy goes through t() and is registered in i18n-translations.ts
 * for BOTH locales — the Phase 173b gate (npm run i18n:missing) fails
 * the build otherwise.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Check, Plus, Send, Trash2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { PageContainer } from '@/components/admin/page-container';
import { useStudentList } from '@/hooks/use-student-list';
import { useI18n } from '@/lib/i18n';
import { apiFetch, apiFetchJson } from '@/lib/api-client';
import {
  CAMPAIGN_ROLES,
  CAMPAIGN_MAX_TARGETS,
  DEFAULT_CAMPAIGN_ROLE,
  type CampaignRole,
  type ShortlistTarget,
} from '@/lib/application-campaign';
import { degreeTypes, programDisciplines } from '@/lib/data';

interface CandidateProgram {
  slug: string;
  name: string;
  nameCn: string;
  discipline: string;
  degree: string;
  language: string;
  tuition: string;
  duration: string;
  scholarshipAvailable: boolean;
  noMatchingPrograms: boolean;
}

interface CandidateUniversity {
  slug: string;
  name: string;
  nameCn: string;
}

interface CandidatesResponse {
  universities: { university: CandidateUniversity; programs: CandidateProgram[] }[];
  programCount: number;
  droppedOrphanPrograms: number;
}

interface ShortlistResponse {
  campaignId: string | null;
  created: { id: string; applicationNumber: string; universityName: string; programName: string; role: string }[];
  failed: { universityName: string; programName: string; error: string }[];
  partial?: boolean;
}

interface SuggestionResponse {
  summary: string;
  /** Slugs + role + reason only — names are looked up from the loaded
   *  candidate list, so the model can never put a made-up name on
   *  screen. See applySuggestion. */
  recommendations: {
    programSlug: string;
    universitySlug: string;
    role: CampaignRole;
    reason: string;
  }[];
  warnings: string[];
  model?: string;
}

export default function ShortlistBuilder() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { students, isLoading: studentsLoading } = useStudentList();

  const [studentId, setStudentId] = useState('');
  const [intake, setIntake] = useState('');
  const [degree, setDegree] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [search, setSearch] = useState('');

  const [candidates, setCandidates] = useState<CandidatesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  /** Selected targets, keyed by `${universitySlug}::${programSlug}` so a
   *  student can legitimately target two programs at one school without
   *  the two colliding in state. */
  const [selected, setSelected] = useState<Record<string, ShortlistTarget>>({});

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ShortlistResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Phase 175b: AI-ranked suggestions. These are NOT created
  // applications — the advisor reviews them and adds the ones they
  // agree with. The API has already guaranteed every slug came from
  // the live catalog, so an "add" here is always safe.
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  // Load candidates whenever the filter set changes. Debounced so
  // typing in the search box is one request, not one per keystroke.
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const sp = new URLSearchParams();
        if (degree) sp.set('degree', degree);
        if (discipline) sp.set('discipline', discipline);
        if (search.trim()) sp.set('search', search.trim());
        // MUST be apiFetch, not bare fetch: requireAdmin() demands an
        // `Authorization: Bearer <token>` header, and only apiFetch
        // attaches the Supabase session token. A bare fetch() here
        // returns 401 "Not authenticated" for every admin — which is
        // exactly what happened on 2026-10-15.
        const res = await apiFetch(
          `/api/admin/applications/candidates?${sp.toString()}`,
          { signal: controller.signal },
        );
        if (!res.ok) {
          // Surface the server's reason, not just the status code.
          // "Not authenticated" and "Database not configured" need
          // completely different fixes; `HTTP 401` tells the admin
          // nothing.
          let reason = `HTTP ${res.status}`;
          try {
            const body = (await res.json()) as { error?: string };
            if (body?.error) reason = body.error;
          } catch {
            /* non-JSON error body — keep the status code */
          }
          throw new Error(reason);
        }
        setCandidates((await res.json()) as CandidatesResponse);
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return;
        setLoadError((e as Error).message || 'Failed to load candidates');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [degree, discipline, search]);

  const targetKey = (uni: string, prog: string) => `${uni}::${prog}`;

  const isSelected = useCallback(
    (uni: string, prog: string) => targetKey(uni, prog) in selected,
    [selected],
  );

  const toggle = useCallback(
    (uniSlug: string, uni: CandidateUniversity, program: CandidateProgram) => {
      const key = targetKey(uniSlug, program.slug);
      setSelected((prev) => {
        if (key in prev) {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        if (Object.keys(prev).length >= CAMPAIGN_MAX_TARGETS) return prev;
        return {
          ...prev,
          [key]: {
            universityId: uniSlug,
            universityName: locale === 'zh' ? uni.nameCn : uni.name,
            universityNameCn: uni.nameCn,
            programId: program.slug,
            programName: locale === 'zh' ? program.nameCn : program.name,
            programNameCn: program.nameCn,
            degree: program.degree,
            role: DEFAULT_CAMPAIGN_ROLE,
          },
        };
      });
    },
    [locale],
  );

  const setRole = useCallback((key: string, role: CampaignRole) => {
    setSelected((prev) => (prev[key] ? { ...prev, [key]: { ...prev[key], role } } : prev));
  }, []);

  const remove = useCallback((key: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const selectedList = useMemo(() => Object.values(selected), [selected]);

  const suggest = useCallback(async () => {
    setSuggesting(true);
    setSuggestError(null);
    try {
      const res = await apiFetchJson<SuggestionResponse>('/api/admin/ai/recommend-shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          intake: intake.trim(),
          discipline,
          degree,
          search: search.trim(),
        }),
      });
      setSuggestions(res);
    } catch (e) {
      setSuggestError((e as Error).message || 'Could not generate suggestions');
    } finally {
      setSuggesting(false);
    }
  }, [studentId, intake, discipline, degree, search]);

  /**
   * Move an AI suggestion into the shortlist.
   *
   * Names come from the candidate list the UI already holds, NOT from
   * the AI response — the response only carries slugs, so this can't
   * be the path where a fabricated name gets rendered. If the slug
   * isn't in the loaded candidates we don't add it at all.
   */
  const applySuggestion = useCallback(
    (rec: SuggestionResponse['recommendations'][number]) => {
      const group = candidates?.universities.find((u) => u.university.slug === rec.universitySlug);
      const program = group?.programs.find((p) => p.slug === rec.programSlug);
      if (!group || !program) return;
      const key = targetKey(group.university.slug, program.slug);
      // Add directly rather than via toggle() — toggling would REMOVE
      // an already-selected suggestion, which is the opposite of what
      // "apply" means.
      setSelected((prev) => {
        if (key in prev) return prev;
        if (Object.keys(prev).length >= CAMPAIGN_MAX_TARGETS) return prev;
        return {
          ...prev,
          [key]: {
            universityId: group.university.slug,
            universityName: locale === 'zh' ? group.university.nameCn : group.university.name,
            universityNameCn: group.university.nameCn,
            programId: program.slug,
            programName: locale === 'zh' ? program.nameCn : program.name,
            programNameCn: program.nameCn,
            degree: program.degree,
            role: rec.role,
          },
        };
      });
    },
    [candidates, locale],
  );

  /** Add every suggestion that isn't already in the shortlist, honouring
   *  the capacity cap. One click for the advisor who agrees with the AI. */
  const applyAll = useCallback(() => {
    if (!suggestions) return;
    for (const rec of suggestions.recommendations) {
      if (Object.keys(selected).length >= CAMPAIGN_MAX_TARGETS) break;
      const key = targetKey(rec.universitySlug, rec.programSlug);
      if (!(key in selected)) applySuggestion(rec);
    }
  }, [suggestions, selected, applySuggestion]);

  const roleCounts = useMemo(() => {
    const counts: Record<CampaignRole, number> = { Reach: 0, Target: 0, Safety: 0 };
    for (const t of selectedList) counts[t.role] += 1;
    return counts;
  }, [selectedList]);

  const atCapacity = selectedList.length >= CAMPAIGN_MAX_TARGETS;

  const submit = useCallback(async () => {
    if (!studentId || !intake.trim() || selectedList.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await apiFetchJson<ShortlistResponse>('/api/admin/applications/shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          intake: intake.trim(),
          targets: selectedList.map(({ universityId, universityName, universityNameCn, programId, programName, programNameCn, degree: deg, role }) => ({
            universityId,
            universityName,
            universityNameCn,
            programId,
            programName,
            programNameCn,
            degree: deg,
            role,
          })),
        }),
      });
      setResult(res);
    } catch (e) {
      setSubmitError((e as Error).message || 'Failed to create shortlist');
    } finally {
      setSubmitting(false);
    }
  }, [studentId, intake, selectedList]);

  if (result) {
    return (
      <PageContainer width="narrow">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-2 text-[#1B2A4A] font-semibold text-lg">
            <Check className="h-5 w-5 text-green-600" />
            {t('adminShortlist.created', { count: result.created.length })}
          </div>

          {result.partial && result.failed.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-300 text-sm text-amber-900 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>{t('adminShortlist.partialTitle')}</strong>
                <ul className="mt-1 list-disc pl-4">
                  {result.failed.map((f) => (
                    <li key={`${f.universityName}-${f.programName}`}>
                      {f.universityName} — {f.programName}: {f.error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <ul className="mt-4 divide-y divide-gray-100 border border-gray-200">
            {result.created.map((c) => (
              <li key={c.id} className="px-3 py-2 text-sm flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="block font-medium text-[#1B2A4A] truncate">{c.universityName}</span>
                  <span className="text-gray-500">{c.programName}</span>
                </span>
                <span className="shrink-0 text-xs text-gray-500 font-mono">{c.applicationNumber}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/applications"
              className="px-4 py-2 bg-[#1B2A4A] hover:bg-[#26345A] text-white text-sm font-semibold"
            >
              {t('adminShortlist.viewApplications')}
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setSelected({});
              }}
              className="px-4 py-2 border border-gray-300 text-sm text-[#4B5563] hover:bg-gray-100"
            >
              {t('adminShortlist.buildAnother')}
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="wide">
      <div className="flex items-center gap-4">
        <Link href="/admin/applications" className="p-2 hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('adminShortlist.title')}</h1>
          <p className="text-[#4B5563] mt-1 text-sm max-w-2xl">{t('adminShortlist.subtitle')}</p>
        </div>
      </div>

      {/* ── Step 1: who + when ─────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-[#1B2A4A]">{t('adminShortlist.step1')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">
              {t('adminShortlist.student')}
            </label>
            <SearchableSelect
              value={studentId}
              onChange={setStudentId}
              placeholder={t('adminShortlist.selectStudent')}
              searchPlaceholder={t('adminShortlist.searchStudent')}
              emptyText={t('adminShortlist.noStudents')}
              loading={studentsLoading}
              locale={locale === 'zh' ? 'zh' : 'en'}
              options={students.map((s) => ({
                value: s.id,
                label: `${s.firstName} ${s.lastName}`,
                sublabel: [s.email, s.nationality].filter(Boolean).join(' · '),
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1" htmlFor="sl-intake">
              {t('adminShortlist.intake')}
            </label>
            <input
              id="sl-intake"
              type="text"
              value={intake}
              onChange={(e) => setIntake(e.target.value)}
              placeholder={t('adminShortlist.intakePlaceholder')}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#9B1B30] focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px] items-start">
        {/* ── Step 2: pick targets ─────────────────────────────────── */}
        <div className="bg-white border border-gray-200 p-5">
          <h2 className="font-semibold text-[#1B2A4A]">{t('adminShortlist.step2')}</h2>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="border border-gray-300 px-3 py-2 text-sm focus:border-[#9B1B30] focus:outline-none"
              aria-label={t('adminShortlist.discipline')}
            >
              <option value="">{t('adminShortlist.allDisciplines')}</option>
              {programDisciplines.map((d) => (
                <option key={d} value={d}>
                  {locale === 'zh' ? '全部学科' : d}
                </option>
              ))}
            </select>
            <select
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="border border-gray-300 px-3 py-2 text-sm focus:border-[#9B1B30] focus:outline-none"
              aria-label={t('adminShortlist.degree')}
            >
              <option value="">{t('adminShortlist.allDegrees')}</option>
              {degreeTypes.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('adminShortlist.searchPrograms')}
              aria-label={t('adminShortlist.searchPrograms')}
              className="border border-gray-300 px-3 py-2 text-sm focus:border-[#9B1B30] focus:outline-none"
            />
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-[#4B5563]">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>
              {candidates?.programCount ?? 0} {t('adminShortlist.programsFound')}
            </span>
            {candidates && candidates.droppedOrphanPrograms > 0 && (
              <span className="text-[#D4A853]">
                · {candidates.droppedOrphanPrograms} {t('adminShortlist.orphansHidden')}
              </span>
            )}
          </div>

          {loadError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-300 text-sm text-red-800">
              {t('adminShortlist.loadFailed')}: {loadError}
            </div>
          )}

          <div className="mt-4 space-y-4 max-h-[560px] overflow-y-auto pr-1">
            {candidates?.universities.map(({ university, programs }) => (
              <div key={university.slug} className="border border-gray-200">
                <div className="px-3 py-2 bg-[#F3F4F6] flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#1B2A4A]" />
                  <span className="font-semibold text-sm text-[#1B2A4A]">
                    {locale === 'zh' ? university.nameCn : university.name}
                  </span>
                </div>
                <ul>
                  {programs.map((p) => {
                    const key = targetKey(university.slug, p.slug);
                    const on = isSelected(university.slug, p.slug);
                    return (
                      <li key={p.slug}>
                        <button
                          type="button"
                          onClick={() => toggle(university.slug, university, p)}
                          disabled={!on && atCapacity}
                          className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 border-t border-gray-100 hover:bg-[#FAFAF8] disabled:opacity-40 disabled:cursor-not-allowed ${on ? 'bg-[#9B1B30]/5' : ''}`}
                        >
                          <span
                            className={`h-4 w-4 border flex items-center justify-center shrink-0 ${on ? 'bg-[#9B1B30] border-[#9B1B30]' : 'border-gray-300'}`}
                          >
                            {on && <Check className="h-3 w-3 text-white" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[#1B2A4A]">
                              {locale === 'zh' ? p.nameCn : p.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {p.degree}
                              {p.language ? ` · ${p.language}` : ''}
                              {p.scholarshipAvailable ? ` · ${t('prog.scholarship')}` : ''}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {!loading && candidates && candidates.universities.length === 0 && (
              <div className="py-10 text-center text-sm text-gray-500 border border-dashed border-gray-300">
                {t('adminShortlist.noCandidates')}
              </div>
            )}
          </div>
        </div>

        {/* ── Step 3: the shortlist ────────────────────────────────── */}
        <div className="bg-white border border-gray-200 p-5 lg:sticky lg:top-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#1B2A4A]">{t('adminShortlist.step3')}</h2>
            <span className="text-xs text-gray-500">
              {selectedList.length}/{CAMPAIGN_MAX_TARGETS}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
            {CAMPAIGN_ROLES.map((r) => (
              <span key={r}>
                <strong>{roleCounts[r]}</strong> {t(`adminShortlist.role_${r}`)}
              </span>
            ))}
          </div>

          {selectedList.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">{t('adminShortlist.empty')}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {selectedList.map((target) => {
                const key = targetKey(target.universityId, target.programId ?? target.programName);
                return (
                  <li key={key} className="border border-gray-200 p-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-[#1B2A4A] truncate">
                          {target.universityName}
                        </span>
                        <span className="block text-xs text-gray-500 truncate">{target.programName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(key)}
                        aria-label={t('adminShortlist.remove')}
                        className="shrink-0 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {CAMPAIGN_ROLES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(key, r)}
                          className={`px-2 py-0.5 text-[11px] border ${
                            target.role === r
                              ? 'border-[#9B1B30] bg-[#9B1B30] text-white'
                              : 'border-gray-300 text-gray-600 hover:border-[#9B1B30]'
                          }`}
                        >
                          {t(`adminShortlist.role_${r}`)}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {atCapacity && (
            <p className="mt-3 text-xs text-[#D4A853]">
              {t('adminShortlist.atCapacity', { max: CAMPAIGN_MAX_TARGETS })}
            </p>
          )}

          {submitError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-300 text-sm text-red-800">
              {submitError}
            </div>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={submitting || !studentId || !intake.trim() || selectedList.length === 0}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#9B1B30] hover:bg-[#7A1526] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {t('adminShortlist.submit', { count: selectedList.length })}
          </button>

          {/* Phase 175b: AI ranks the SAME candidate set the builder
              above is showing — the route allowlists every returned
              slug against the live catalog and drops invented ones
              with a warning. The advisor still reviews and picks. */}
          <button
            type="button"
            onClick={suggest}
            disabled={suggesting || !studentId || !intake.trim()}
            className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 border border-[#9B1B30] text-[#9B1B30] text-sm font-medium hover:bg-[#9B1B30]/5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {suggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {suggesting ? t('adminShortlist.aiThinking') : t('adminShortlist.aiSuggest')}
          </button>
          {!studentId && (
            <p className="mt-1 text-[11px] text-gray-400">{t('adminShortlist.aiNeedsStudent')}</p>
          )}

          {suggestError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-300 text-sm text-red-800">
              {suggestError}
            </div>
          )}

          {suggestions && (
            <div className="mt-3 border border-[#9B1B30]/30">
              {suggestions.summary && (
                <p className="px-3 py-2 text-sm text-[#1B2A4A] bg-[#9B1B30]/5 border-b border-[#9B1B30]/20">
                  {suggestions.summary}
                </p>
              )}

              {suggestions.warnings.length > 0 && (
                <details className="px-3 py-2 bg-amber-50 border-b border-amber-200">
                  <summary className="text-xs text-amber-900 cursor-pointer flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {t('adminShortlist.aiWarnings', { count: suggestions.warnings.length })}
                  </summary>
                  <ul className="mt-1 list-disc pl-4 text-[11px] text-amber-900 space-y-0.5">
                    {suggestions.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </details>
              )}

              {suggestions.recommendations.length === 0 ? (
                <p className="px-3 py-3 text-sm text-gray-500">{t('adminShortlist.aiNone')}</p>
              ) : (
                <>
                  <ul>
                    {suggestions.recommendations.map((rec) => {
                      const key = targetKey(rec.universitySlug, rec.programSlug);
                      const added = key in selected;
                      const group = candidates?.universities.find((u) => u.university.slug === rec.universitySlug);
                      const program = group?.programs.find((p) => p.slug === rec.programSlug);
                      return (
                        <li key={rec.programSlug} className="px-3 py-2 border-b border-gray-100">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="block text-sm font-medium text-[#1B2A4A] truncate">
                                {program && group
                                  ? locale === 'zh'
                                    ? group.university.nameCn
                                    : group.university.name
                                  : rec.universitySlug}
                              </span>
                              <span className="block text-xs text-gray-500 truncate">
                                {program ? (locale === 'zh' ? program.nameCn : program.name) : rec.programSlug}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => applySuggestion(rec)}
                              disabled={added || atCapacity}
                              className={`shrink-0 px-2 py-1 text-[11px] border ${
                                added
                                  ? 'border-green-600 text-green-700 bg-green-50'
                                  : 'border-[#9B1B30] text-[#9B1B30] hover:bg-[#9B1B30]/5 disabled:opacity-40'
                              }`}
                            >
                              {added ? t('adminShortlist.aiAdded') : t('adminShortlist.aiAdd')}
                            </button>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="px-1.5 py-0.5 text-[10px] border border-gray-300 text-gray-600">
                              {t(`adminShortlist.role_${rec.role}`)}
                            </span>
                            {rec.reason && (
                              <span className="text-[11px] text-gray-500 leading-snug">{rec.reason}</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="px-3 py-2 flex gap-2">
                    <button
                      type="button"
                      onClick={applyAll}
                      disabled={atCapacity}
                      className="flex-1 px-3 py-1.5 text-xs bg-[#1B2A4A] hover:bg-[#26345A] text-white disabled:opacity-40"
                    >
                      {t('adminShortlist.aiAddAll')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuggestions(null)}
                      className="px-3 py-1.5 text-xs border border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                      {t('adminShortlist.aiDismiss')}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

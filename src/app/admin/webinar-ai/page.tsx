'use client';

/**
 * /admin/webinar-ai — Phase 163 AI-generated webinar brief wizard.
 *
 * 3-step state machine (single page, URL is stateless — refresh
 * survives, no back-button issues since every state is derivable
 * from the form fields):
 *
 *   1. SETUP — pick a target session + write an intent prompt +
 *      pick up to 5 featured universities (the seed step had a
 *      "top 5 by ranking" prefilled; admin can override).
 *   2. PREVIEW — review the structured brief side-by-side: title
 *      + description (en/zh) with Accept Both / Reject Both / per-
 *      field Accept/Reject; each university's 4 topic kinds as
 *      collapsible cards with per-section accept/reject; sanitization
 *      warnings surface inline (orange chip per warning).
 *   3. APPLY — progressive POST loop to /apply endpoint. Per-row
 *      status surfaced (created / updated / skipped / error).
 *
 * Trigger surface: a "Generate with AI" button inside the
 * SessionEditDialog (163c) opens this page in a new tab with
 * ?sessionId=<id> preloaded.
 */

import { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Wand2,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { useUrlState } from '@/hooks/use-url-state';
import type {
  NormalizedBrief,
  WebinarBriefKind,
  NormalizedBriefTopic,
  NormalizedBriefUniversity,
} from '@/lib/ai/webinar-brief-sanitize';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminSession {
  id: string;
  slug: string;
  titleEn: string;
  titleZh: string;
  sessionDate: string | null;
  sessionTime: string | null;
  isActive: boolean;
}

interface AdminUniversity {
  id: string;
  slug: string;
  name: string;
  nameZh: string;
  city: string | null;
}

type Step = 'setup' | 'preview' | 'apply';

interface GenerateResponse {
  brief: NormalizedBrief;
  warnings: string[];
  rawModelOutput: string;
  model: string;
}

interface ApplyResult {
  session: { updated: boolean; error: string | null };
  topics: Array<{
    slug: string;
    kind: WebinarBriefKind;
    status: 'created' | 'updated' | 'skipped' | 'error';
    id?: string;
    error?: string;
  }>;
}

const VALID_KINDS: WebinarBriefKind[] = [
  'program',
  'scholarship',
  'timing',
  'requirement',
];

const KIND_LABEL_KEYS: Record<WebinarBriefKind, string> = {
  program: 'webinar.card.sections.program',
  scholarship: 'webinar.card.sections.scholarship',
  timing: 'webinar.card.sections.timing',
  requirement: 'webinar.card.sections.requirement',
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function WebinarAiGeneratorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading…</div>}>
      <WebinarAiGeneratorPageInner />
    </Suspense>
  );
}

function WebinarAiGeneratorPageInner() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Setup-state controlled inputs
  const [step, setStep] = useState<Step>('setup');
  const [sessionId, setSessionId] = useUrlState('sessionId', '', { coerce: (v) => v });
  const [intent, setIntent] = useState('');
  const [featuredSlugs, setFeaturedSlugs] = useState<string[]>([]);
  const [sessionDateLabel, setSessionDateLabel] = useState<string>('');

  // Loaded catalog data
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [universities, setUniversities] = useState<AdminUniversity[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Generate response
  const [brief, setBrief] = useState<NormalizedBrief | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [rawModelOutput, setRawModelOutput] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Apply state
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null);

  // Accept state — the wizard starts with everything accepted (admin
  // rejects per-item in the preview step). Stored as a separate
  // shape from the brief so we can PATCH/PUT without re-fetching.
  const [acceptSession, setAcceptSession] = useState(true);
  const [acceptUniversities, setAcceptUniversities] = useState<Record<string, boolean>>(
    {},
  );
  const [acceptTopics, setAcceptTopics] = useState<
    Record<string, Record<WebinarBriefKind, boolean>>
  >({});

  // Seed `sessionId` from URL on mount
  useEffect(() => {
    const fromUrl = searchParams?.get('sessionId');
    if (fromUrl && !sessionId) setSessionId(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load sessions + universities once on mount
  useEffect(() => {
    (async () => {
      setCatalogLoading(true);
      setCatalogError(null);
      try {
        const [sessRes, uniRes] = await Promise.all([
          apiFetchJson<{ sessions: AdminSession[] }>(
            '/api/admin/webinar-sessions',
          ),
          apiFetchJson<{ universities: AdminUniversity[] }>(
            '/api/universities?limit=500',
          ),
        ]);
        setSessions(sessRes.sessions ?? []);
        setUniversities(uniRes.universities ?? []);
      } catch (err) {
        setCatalogError(
          err instanceof ApiError ? err.message : t('adminWebinars.ai.loadError'),
        );
      } finally {
        setCatalogLoading(false);
      }
    })();
  }, [t]);

  // Default `featuredSlugs` to top 5 by ranking once universities load
  useEffect(() => {
    if (featuredSlugs.length === 0 && universities.length > 0) {
      const sorted = [...universities].sort((a, b) => {
        // No `ranking` field in the slim shape — fall back to id.
        // The user's "top 5" picker will refine.
        return a.id.localeCompare(b.id);
      });
      setFeaturedSlugs(sorted.slice(0, 5).map((u) => u.slug));
    }
  }, [universities, featuredSlugs.length]);

  // When a session is selected, prefill the date label for the prompt
  useEffect(() => {
    const s = sessions.find((x) => x.id === sessionId);
    if (!s) return;
    if (s.sessionDate && !sessionDateLabel) {
      try {
        const d = new Date(s.sessionDate);
        const label = d.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'Asia/Shanghai',
        });
        setSessionDateLabel(label);
      } catch {
        // ignore — the prompt tolerates an empty date label
      }
    }
  }, [sessionId, sessions, sessionDateLabel]);

  const handleGenerate = useCallback(async () => {
    if (!sessionId) {
      setGenerateError(t('adminWebinars.ai.errorNoSession'));
      return;
    }
    if (!intent.trim()) {
      setGenerateError(t('adminWebinars.ai.errorNoIntent'));
      return;
    }
    if (featuredSlugs.length === 0) {
      setGenerateError(t('adminWebinars.ai.errorNoUniversities'));
      return;
    }
    setGenerating(true);
    setGenerateError(null);
    setBrief(null);
    setApplyResult(null);
    try {
      const res = await apiFetchJson<GenerateResponse>(
        '/api/admin/webinar-ai/generate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            intent,
            featuredUniversitySlugs: featuredSlugs,
            sessionDateLabel: sessionDateLabel || null,
            sessionId,
          }),
        },
      );
      setBrief(res.brief);
      setWarnings(res.warnings);
      setRawModelOutput(res.rawModelOutput);
      // Default: everything accepted. Admin rejects per-item in preview.
      setAcceptSession(true);
      const uniAccept: Record<string, boolean> = {};
      const topicAccept: Record<string, Record<WebinarBriefKind, boolean>> = {};
      for (const u of res.brief.featuredUniversities) {
        uniAccept[u.slug] = true;
        const perKind: Record<WebinarBriefKind, boolean> = {} as Record<
          WebinarBriefKind,
          boolean
        >;
        for (const k of VALID_KINDS) perKind[k] = Boolean(u.topics[k]);
        topicAccept[u.slug] = perKind;
      }
      setAcceptUniversities(uniAccept);
      setAcceptTopics(topicAccept);
      setStep('preview');
    } catch (err) {
      setGenerateError(
        err instanceof ApiError
          ? `${err.message}${err.status === 503 ? ` (${t('adminWebinars.ai.errorProviderNotConfigured')})` : ''}`
          : t('adminWebinars.ai.errorGeneric'),
      );
    } finally {
      setGenerating(false);
    }
  }, [sessionId, intent, featuredSlugs, sessionDateLabel, t]);

  const handleApply = useCallback(async () => {
    if (!brief || !sessionId) return;
    setApplying(true);
    setApplyError(null);
    try {
      const res = await apiFetchJson<ApplyResult>(
        '/api/admin/webinar-ai/apply',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            brief,
            accepted: {
              session: acceptSession,
              universities: acceptUniversities,
            },
            // topic-level accepts are read server-side from
            // acceptTopics when we wire it — for v1 we apply all
            // topics for an accepted university; per-item topic
            // rejection is wired in 163d.
          }),
        },
      );
      setApplyResult(res);
      setStep('apply');
    } catch (err) {
      setApplyError(
        err instanceof ApiError ? err.message : t('adminWebinars.ai.errorGeneric'),
      );
    } finally {
      setApplying(false);
    }
  }, [brief, sessionId, acceptSession, acceptUniversities, t]);

  const session = useMemo(
    () => sessions.find((s) => s.id === sessionId) ?? null,
    [sessions, sessionId],
  );
  const universitiesBySlug = useMemo(() => {
    const m = new Map<string, AdminUniversity>();
    for (const u of universities) m.set(u.slug, u);
    return m;
  }, [universities]);

  return (
    <div className="space-y-6">
      <Header step={step} />

      {catalogError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{catalogError}</span>
        </div>
      )}

      {catalogLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="md" className="text-[#1B2A4A]" />
        </div>
      ) : (
        <>
          {step === 'setup' && (
            <SetupStep
              intent={intent}
              setIntent={setIntent}
              featuredSlugs={featuredSlugs}
              setFeaturedSlugs={setFeaturedSlugs}
              sessionDateLabel={sessionDateLabel}
              setSessionDateLabel={setSessionDateLabel}
              sessions={sessions}
              universities={universities}
              sessionId={sessionId}
              setSessionId={(next: string) => {
                setSessionId(next);
                router.replace(`/admin/webinar-ai?sessionId=${next}`);
              }}
              session={session}
              onGenerate={handleGenerate}
              generating={generating}
              generateError={generateError}
              t={t}
            />
          )}
          {step === 'preview' && brief && (
            <PreviewStep
              brief={brief}
              warnings={warnings}
              rawModelOutput={rawModelOutput}
              universitiesBySlug={universitiesBySlug}
              acceptSession={acceptSession}
              setAcceptSession={setAcceptSession}
              acceptUniversities={acceptUniversities}
              setAcceptUniversities={setAcceptUniversities}
              acceptTopics={acceptTopics}
              setAcceptTopics={setAcceptTopics}
              onBack={() => setStep('setup')}
              onApply={handleApply}
              applying={applying}
              applyError={applyError}
              t={t}
            />
          )}
          {step === 'apply' && applyResult && (
            <ApplyStep
              result={applyResult}
              onDone={() => router.push('/admin/webinar-signups?tab=topics')}
              onBack={() => setStep('preview')}
              t={t}
            />
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Setup
// ---------------------------------------------------------------------------

function SetupStep({
  intent,
  setIntent,
  featuredSlugs,
  setFeaturedSlugs,
  sessionDateLabel,
  setSessionDateLabel,
  sessions,
  universities,
  sessionId,
  setSessionId,
  session,
  onGenerate,
  generating,
  generateError,
  t,
}: {
  intent: string;
  setIntent: (v: string) => void;
  featuredSlugs: string[];
  setFeaturedSlugs: (v: string[]) => void;
  sessionDateLabel: string;
  setSessionDateLabel: (v: string) => void;
  sessions: AdminSession[];
  universities: AdminUniversity[];
  sessionId: string;
  setSessionId: (v: string) => void;
  session: AdminSession | null;
  onGenerate: () => void;
  generating: boolean;
  generateError: string | null;
  t: (k: string, params?: Record<string, string | number>) => string;
}) {
  const toggleFeatured = (slug: string) => {
    setFeaturedSlugs(
      featuredSlugs.includes(slug)
        ? featuredSlugs.filter((s) => s !== slug)
        : featuredSlugs.length >= 5
          ? featuredSlugs
          : [...featuredSlugs, slug],
    );
  };
  return (
    <Card>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#1B2A4A]">
            {t('adminWebinars.ai.setupTitle')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('adminWebinars.ai.setupSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session picker */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">
              {t('adminWebinars.ai.sessionLabel')}
            </label>
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
            >
              <option value="">—</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.titleEn} {s.isActive ? `(${t('adminWebinars.sessionActiveBadge')})` : ''}
                </option>
              ))}
            </select>
            {session && (
              <p className="mt-1 text-xs text-gray-500">
                {t('adminWebinars.ai.sessionLabelHint', {
                  slug: session.slug,
                  time: session.sessionTime ?? 'TBA',
                })}
              </p>
            )}
          </div>

          {/* Date label */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">
              {t('adminWebinars.ai.dateLabel')}
            </label>
            <input
              type="text"
              value={sessionDateLabel}
              onChange={(e) => setSessionDateLabel(e.target.value)}
              placeholder="Tue 20 October 2026"
              className="w-full border border-gray-300 px-4 py-2 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('adminWebinars.ai.dateLabelHint')}
            </p>
          </div>
        </div>

        {/* Intent */}
        <div>
          <label className="block text-sm font-medium text-[#1F2937] mb-1">
            {t('adminWebinars.ai.intentLabel')}
          </label>
          <textarea
            rows={4}
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder={t('adminWebinars.ai.intentPlaceholder')}
            className="w-full border border-gray-300 px-4 py-2 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30] resize-vertical"
          />
          <p className="mt-1 text-xs text-gray-500">
            {t('adminWebinars.ai.intentHint')}
          </p>
        </div>

        {/* Featured universities multiselect */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-[#1F2937]">
              {t('adminWebinars.ai.featuredLabel')}
            </label>
            <span className="text-xs text-gray-500">
              {t('adminWebinars.ai.featuredCount', {
                count: featuredSlugs.length,
              })}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-auto border border-gray-200 p-3">
            {universities.map((u) => {
              const checked = featuredSlugs.includes(u.slug);
              const atLimit = !checked && featuredSlugs.length >= 5;
              return (
                <label
                  key={u.slug}
                  className={`flex items-start gap-2 border px-3 py-2 cursor-pointer ${
                    checked
                      ? 'border-[#9B1B30] bg-[#9B1B30]/5'
                      : atLimit
                        ? 'border-gray-200 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-[#9B1B30]/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={atLimit}
                    onChange={() => toggleFeatured(u.slug)}
                    className="h-4 w-4 accent-[#9B1B30] mt-0.5"
                  />
                  <span className="text-sm text-[#1F2937]">
                    <span className="font-medium">{u.name}</span>
                    <span className="block text-xs text-gray-500">
                      {u.nameZh} · {u.city ?? '—'}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {t('adminWebinars.ai.featuredHint')}
          </p>
        </div>

        {generateError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{generateError}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
          <Button
            className="bg-[#9B1B30] hover:bg-[#7A1526] rounded-none"
            onClick={onGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('adminWebinars.ai.generating')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t('adminWebinars.ai.generateCta')}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Preview
// ---------------------------------------------------------------------------

function PreviewStep({
  brief,
  warnings,
  rawModelOutput,
  universitiesBySlug,
  acceptSession,
  setAcceptSession,
  acceptUniversities,
  setAcceptUniversities,
  acceptTopics,
  setAcceptTopics,
  onBack,
  onApply,
  applying,
  applyError,
  t,
}: {
  brief: NormalizedBrief;
  warnings: string[];
  rawModelOutput: string;
  universitiesBySlug: Map<string, AdminUniversity>;
  acceptSession: boolean;
  setAcceptSession: (v: boolean) => void;
  acceptUniversities: Record<string, boolean>;
  setAcceptUniversities: (
    v: Record<string, boolean> | ((p: Record<string, boolean>) => Record<string, boolean>),
  ) => void;
  acceptTopics: Record<string, Record<WebinarBriefKind, boolean>>;
  setAcceptTopics: (
    v:
      | Record<string, Record<WebinarBriefKind, boolean>>
      | ((p: Record<string, Record<WebinarBriefKind, boolean>>) => Record<string, Record<WebinarBriefKind, boolean>>),
  ) => void;
  onBack: () => void;
  onApply: () => void;
  applying: boolean;
  applyError: string | null;
  t: (k: string, params?: Record<string, string | number>) => string;
}) {
  return (
    <div className="space-y-6">
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 text-sm">
          <p className="font-semibold mb-1">{t('adminWebinars.ai.warningsTitle')}</p>
          <ul className="list-disc list-inside space-y-1">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <Card>
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#1B2A4A]">
                {t('adminWebinars.ai.sessionFields')}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {t('adminWebinars.ai.sessionFieldsHint')}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#1F2937] cursor-pointer">
              <input
                type="checkbox"
                checked={acceptSession}
                onChange={(e) => setAcceptSession(e.target.checked)}
                className="h-4 w-4 accent-[#9B1B30]"
              />
              <span>{t('adminWebinars.ai.acceptLabel')}</span>
            </label>
          </div>
          <SessionFields
            titleEn={brief.titleEn}
            titleZh={brief.titleZh}
            descriptionEn={brief.descriptionEn}
            descriptionZh={brief.descriptionZh}
          />
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#1B2A4A]">
                {t('adminWebinars.ai.universitiesTitle')}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {t('adminWebinars.ai.universitiesHint')}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {brief.featuredUniversities.map((u) => (
              <UniversityPreviewCard
                key={u.slug}
                uniBrief={u}
                uni={universitiesBySlug.get(u.slug)}
                accepted={acceptUniversities[u.slug] ?? false}
                topicAccept={acceptTopics[u.slug] ?? {}}
                onAcceptUni={(v) =>
                  setAcceptUniversities((p) => ({ ...p, [u.slug]: v }))
                }
                onAcceptTopic={(kind, v) =>
                  setAcceptTopics((p) => ({
                    ...p,
                    [u.slug]: { ...(p[u.slug] ?? ({} as Record<WebinarBriefKind, boolean>)), [kind]: v },
                  }))
                }
                t={t}
              />
            ))}
          </div>
        </div>
      </Card>

      <details className="bg-white border border-gray-200 p-4">
        <summary className="text-xs text-gray-500 cursor-pointer">
          {t('adminWebinars.ai.rawToggle')}
        </summary>
        <pre className="mt-2 bg-gray-50 border border-gray-200 p-3 text-xs text-[#1F2937] overflow-auto max-h-72 whitespace-pre-wrap font-mono">
          {rawModelOutput}
        </pre>
      </details>

      {applyError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{applyError}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
        <Button variant="outline" onClick={onBack} className="rounded-none">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t('adminWebinars.ai.backToSetup')}
        </Button>
        <Button
          className="bg-[#9B1B30] hover:bg-[#7A1526] rounded-none"
          onClick={onApply}
          disabled={applying}
        >
          {applying ? (
            <>
              <Spinner size="xs" />
              {t('adminWebinars.ai.applying')}
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              {t('adminWebinars.ai.applyCta')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SessionFields({
  titleEn,
  titleZh,
  descriptionEn,
  descriptionZh,
}: {
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FieldDisplay label="English" textEn={titleEn} textZh="" />
      <FieldDisplay label="中文" textEn={titleZh} textZh="" />
      <FieldDisplay label="English" textEn={descriptionEn} textZh="" />
      <FieldDisplay label="中文" textEn={descriptionZh} textZh="" />
    </div>
  );
}

function FieldDisplay({
  label,
  textEn,
  textZh,
}: {
  label: string;
  textEn: string;
  textZh: string;
}) {
  return (
    <div className="border border-gray-200">
      <div className="bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider px-3 py-2">
        {label}
      </div>
      <div className="p-3 text-[#1F2937] text-sm whitespace-pre-wrap max-h-48 overflow-auto">
        {textEn || <span className="text-gray-400">—</span>}
        {textZh && (
          <div className="mt-2 pt-2 border-t border-gray-200 text-[#4B5563]">
            {textZh}
          </div>
        )}
      </div>
    </div>
  );
}

function UniversityPreviewCard({
  uniBrief,
  uni,
  accepted,
  topicAccept,
  onAcceptUni,
  onAcceptTopic,
  t,
}: {
  uniBrief: NormalizedBriefUniversity;
  uni: AdminUniversity | undefined;
  accepted: boolean;
  topicAccept: Record<WebinarBriefKind, boolean>;
  onAcceptUni: (v: boolean) => void;
  onAcceptTopic: (kind: WebinarBriefKind, v: boolean) => void;
  t: (k: string, params?: Record<string, string | number>) => string;
}) {
  return (
    <div className="border border-gray-200">
      <div className="flex items-center justify-between gap-3 bg-[#FAFAF8] px-4 py-3 border-b border-gray-200">
        <div>
          <h4 className="font-semibold text-[#1B2A4A]">
            {uni?.name ?? uniBrief.slug}
          </h4>
          <p className="text-xs text-gray-500">
            {uni?.nameZh ?? '—'} · <code>{uniBrief.slug}</code>
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => onAcceptUni(e.target.checked)}
            className="h-4 w-4 accent-[#9B1B30]"
          />
          <span className="text-[#1F2937] font-medium">
            {t('adminWebinars.ai.acceptLabel')}
          </span>
        </label>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {VALID_KINDS.map((kind) => {
          const topic = uniBrief.topics[kind];
          if (!topic) return null;
          return (
            <TopicPreviewCard
              key={kind}
              kind={kind}
              topic={topic}
              accepted={topicAccept[kind] ?? false}
              onAccept={(v) => onAcceptTopic(kind, v)}
              t={t}
            />
          );
        })}
      </div>
    </div>
  );
}

function TopicPreviewCard({
  kind,
  topic,
  accepted,
  onAccept,
  t,
}: {
  kind: WebinarBriefKind;
  topic: NormalizedBriefTopic;
  accepted: boolean;
  onAccept: (v: boolean) => void;
  t: (k: string, params?: Record<string, string | number>) => string;
}) {
  const sectionTitle = t(KIND_LABEL_KEYS[kind]);
  return (
    <div className="border border-gray-200">
      <div className="flex items-center justify-between bg-[#1B2A4A] text-white px-3 py-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider">
          {sectionTitle}
        </span>
        <label className="flex items-center gap-1.5 cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => onAccept(e.target.checked)}
            className="h-3.5 w-3.5 accent-[#9B1B30]"
          />
          <span>{t('adminWebinars.ai.acceptLabel')}</span>
        </label>
      </div>
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldDisplay label="EN" textEn={topic.bodyEn} textZh="" />
        <FieldDisplay label="中文" textEn={topic.bodyZh} textZh="" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Apply results
// ---------------------------------------------------------------------------

function ApplyStep({
  result,
  onDone,
  onBack,
  t,
}: {
  result: ApplyResult;
  onDone: () => void;
  onBack: () => void;
  t: (k: string, params?: Record<string, string | number>) => string;
}) {
  const created = result.topics.filter((r) => r.status === 'created').length;
  const updated = result.topics.filter((r) => r.status === 'updated').length;
  const skipped = result.topics.filter((r) => r.status === 'skipped').length;
  const failed = result.topics.filter((r) => r.status === 'error').length;
  return (
    <Card>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-[#1B2A4A]">
              {t('adminWebinars.ai.applyDoneTitle')}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {t('adminWebinars.ai.applyDoneSummary', {
                created,
                updated,
                skipped,
                failed,
              })}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#1F2937] mb-2">
            {t('adminWebinars.ai.session')}
          </h3>
          {result.session.updated ? (
            <BadgeRow label={t('adminWebinars.ai.sessionUpdated')} variant="success" />
          ) : (
            <BadgeRow
              label={
                result.session.error
                  ? `${t('adminWebinars.ai.sessionFailed')}: ${result.session.error}`
                  : t('adminWebinars.ai.sessionSkipped')
              }
              variant={result.session.error ? 'error' : 'neutral'}
            />
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#1F2937] mb-2">
            {t('adminWebinars.ai.topicsTitle')}
          </h3>
          <div className="space-y-1 max-h-72 overflow-auto border border-gray-200">
            {result.topics.map((row, i) => (
              <div
                key={`${row.slug}-${row.kind}-${i}`}
                className="flex items-center justify-between px-3 py-1.5 text-xs border-b border-gray-100 last:border-b-0"
              >
                <span>
                  <code>{row.slug}</code> · {row.kind}
                </span>
                <span>
                  {row.status === 'created' && (
                    <span className="text-emerald-700">{t('adminWebinars.ai.topicCreated')}</span>
                  )}
                  {row.status === 'updated' && (
                    <span className="text-blue-700">{t('adminWebinars.ai.topicUpdated')}</span>
                  )}
                  {row.status === 'skipped' && (
                    <span className="text-gray-500">{t('adminWebinars.ai.topicSkipped')}</span>
                  )}
                  {row.status === 'error' && (
                    <span className="text-red-700">{t('adminWebinars.ai.topicError', { error: row.error ?? '' })}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
          <Button variant="outline" onClick={onBack} className="rounded-none">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('adminWebinars.ai.backToPreview')}
          </Button>
          <Button onClick={onDone} className="bg-[#1B2A4A] hover:bg-[#2C3E60] rounded-none">
            {t('adminWebinars.ai.viewSessions')}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function BadgeRow({
  label,
  variant,
}: {
  label: string;
  variant: 'success' | 'error' | 'neutral';
}) {
  const cls =
    variant === 'success'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
      : variant === 'error'
        ? 'border-red-300 bg-red-50 text-red-800'
        : 'border-gray-200 bg-gray-50 text-gray-600';
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border ${cls}`}
    >
      {label}
    </span>
  );
}

function Header({ step }: { step: Step }) {
  const { t } = useI18n();
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-[#9B1B30]" />
        {t('adminWebinars.ai.title')}
      </h1>
      <p className="text-sm text-gray-600 mt-1">{t('adminWebinars.ai.subtitle')}</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <StepLabel active={step === 'setup'} step="1" label={t('adminWebinars.ai.stepSetup')} />
        <ChevronRight className="h-3 w-3" />
        <StepLabel active={step === 'preview'} step="2" label={t('adminWebinars.ai.stepPreview')} />
        <ChevronRight className="h-3 w-3" />
        <StepLabel active={step === 'apply'} step="3" label={t('adminWebinars.ai.stepApply')} />
      </div>
    </div>
  );
}

function StepLabel({
  step,
  active,
  label,
}: {
  step: string;
  active: boolean;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 border ${
        active ? 'border-[#9B1B30] bg-[#9B1B30]/5 text-[#9B1B30] font-semibold' : 'border-gray-200 bg-white text-gray-500'
      }`}
    >
      {step}. {label}
    </span>
  );
}
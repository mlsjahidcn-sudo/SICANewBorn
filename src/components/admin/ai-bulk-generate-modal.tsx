'use client';

/**
 * AIBulkGenerateModal — Phase 35 bulk university generator.
 *
 * 5-step flow that splits the work into a cheap "names + city +
 * ranking" pass (1 AI call, ~10s) followed by a parallel "full
 * detail" pass (N concurrent calls to /api/ai/generate-university,
 * ~30s per row but only the slowest call bounds wall time).
 *
 * Why two passes:
 *   - The cheap pass gives the admin a checkpoint to prune bad
 *     suggestions before we burn the long-tail tokens (~4K
 *     tokens × N rows).
 *   - Each pass uses the same provider abstraction
 *     (src/lib/ai/provider.ts) — the bulk endpoint just reads
 *     the existing catalog from DB and asks the LLM to avoid
 *     overlap; the detail pass is the existing single-row
 *     endpoint called N times in parallel from the client.
 *
 * Steps:
 *   0. idle           — explain + "Suggest 5" button
 *   1. suggesting     — spinner + button disabled
 *   2. review-names   — 5 cards with checkboxes, "Continue (N)"
 *   3. generating     — N concurrent detail gens, per-row status
 *   4. review-details — full data per card, "Save N"
 *   5. saving         — N parallel POSTs to /api/universities
 *   6. done           — summary, closes modal + onSaved callback
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, X, Loader2, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { apiFetch } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

type DetailStatus = 'idle' | 'pending' | 'generating' | 'ready' | 'error' | 'skipped';

interface SuggestionItem {
  /** Stable identifier we mint so React keys survive re-renders. */
  id: string;
  /** The lightweight fields returned by /bulk-suggest-names. */
  name: string;
  nameCn: string;
  slug: string;
  city: string;
  cityCn: string;
  ranking: number;
  /** User toggle — only rows with selected=true get generated + saved. */
  selected: boolean;
  /** Detail-phase state. */
  status: DetailStatus;
  /** Detail data once `status === 'ready'`. */
  data?: Record<string, unknown>;
  /** Error message if status === 'error'. */
  error?: string;
  /** Save-phase result row. */
  saveResult?: 'saved' | 'duplicate' | 'error';
}

interface AIBulkGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful save pass so the parent can refresh its list. */
  onSaved: (savedCount: number) => void;
}

type Step = 'idle' | 'suggesting' | 'review-names' | 'generating' | 'review-details' | 'saving' | 'done';

const STEP_KEYS: Array<{ key: Step; labelKey: string }> = [
  { key: 'idle', labelKey: 'stepStart' },
  { key: 'review-names', labelKey: 'stepReview' },
  { key: 'generating', labelKey: 'stepGenerate' },
  { key: 'review-details', labelKey: 'stepConfirm' },
  { key: 'saving', labelKey: 'stepSave' },
];

export function AIBulkGenerateModal({ isOpen, onClose, onSaved }: AIBulkGenerateModalProps) {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>('idle');
  const [items, setItems] = useState<SuggestionItem[]>([]);
  const [error, setError] = useState('');
  const [generatingProgress, setGeneratingProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [savingProgress, setSavingProgress] = useState<{ saved: number; failed: number; duplicate: number; total: number }>({ saved: 0, failed: 0, duplicate: 0, total: 0 });
  const abortRefs = useRef<Map<string, AbortController>>(new Map());

  // Reset on open — keeps the modal idempotent across opens.
  useEffect(() => {
    if (isOpen) {
      setStep('idle');
      setItems([]);
      setError('');
      setGeneratingProgress({ done: 0, total: 0 });
      setSavingProgress({ saved: 0, failed: 0, duplicate: 0, total: 0 });
      // Cancel any in-flight detail streams from a previous session.
      for (const ctrl of abortRefs.current.values()) ctrl.abort();
      abortRefs.current.clear();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    for (const ctrl of abortRefs.current.values()) ctrl.abort();
    abortRefs.current.clear();
    onClose();
  };

  const handleSuggest = async () => {
    setStep('suggesting');
    setError('');
    try {
      // Phase 36: apiFetch attaches Bearer so requireAdmin passes.
      // Raw fetch() here 401s once we gate the route — Phase 36
      // fixed the detail-phase call but missed this one, so the
      // very first click of "Suggest 5" was 401-ing on every
      // admin's screen. Symptom: "Not authenticated" toast.
      const res = await apiFetch('/api/admin/universities/bulk-suggest-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Failed to suggest universities');
      }
      const data = (await res.json()) as { suggestions: Array<Omit<SuggestionItem, 'id' | 'selected' | 'status'>> };
      if (!data.suggestions || data.suggestions.length === 0) {
        throw new Error('AI returned no suggestions. Try again.');
      }
      setItems(
        data.suggestions.map((s, i) => ({
          ...s,
          id: `s-${Date.now()}-${i}`,
          selected: true,
          status: 'idle',
        })),
      );
      setStep('review-names');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      setStep('idle');
    }
  };

  const handleToggle = (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it)));
  };

  const handleCancelGeneration = () => {
    for (const ctrl of abortRefs.current.values()) ctrl.abort();
    abortRefs.current.clear();
    // Mark all `generating`/`pending` rows as skipped so the review
    // step shows them in a final state.
    setItems((prev) =>
      prev.map((it) =>
        it.status === 'pending' || it.status === 'generating' ? { ...it, status: 'error', error: 'Cancelled' } : it,
      ),
    );
    setStep('review-details');
  };

  const handleGenerateDetails = async () => {
    const toGenerate = items.filter((it) => it.selected);
    if (toGenerate.length === 0) return;

    setItems((prev) => prev.map((it) => (it.selected ? { ...it, status: 'pending' as DetailStatus } : it)));
    setGeneratingProgress({ done: 0, total: toGenerate.length });
    setStep('generating');

    // Run all detail generations in parallel. Each completes its own
    // per-row state mutation; the page-level "Done" counter sums it.
    const tasks = toGenerate.map(async (item) => {
      const ctrl = new AbortController();
      abortRefs.current.set(item.id, ctrl);
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: 'generating' } : it)));

      try {
        // Phase 36: apiFetch attaches Bearer so per-admin rate
        // limiting + Sentry capture (keyed on user.id) actually
        // fire. Raw fetch() here would 401 once we gate the route.
        const response = await apiFetch('/api/ai/generate-university', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: item.name }),
          signal: ctrl.signal,
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: 'Request failed' }));
          throw new Error(err.error || `HTTP ${response.status}`);
        }
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response stream');

        // Stream the response; the server sends a `parsed` event when
        // it has successfully parsed+validated the JSON. Use that
        // final event as the canonical payload so we don't re-parse
        // the streamed content client-side.
        const decoder = new TextDecoder();
        let serverParsed: Record<string, unknown> | null = null;
        let lastError: string | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') continue;
            try {
              const parsed = JSON.parse(payload) as { parsed?: unknown; error?: string };
              if (parsed.error) lastError = parsed.error;
              if (parsed.parsed && typeof parsed.parsed === 'object') {
                serverParsed = parsed.parsed as Record<string, unknown>;
              }
            } catch {
              // ignore unparseable SSE lines
            }
          }
        }

        if (!serverParsed) {
          throw new Error(lastError || 'AI did not produce a parsed object');
        }

        // Backend may have returned a different slug than the suggestion.
        // Override with the suggestion's slug so the row matches what the
        // admin saw in step 2.
        const finalData = { ...serverParsed, slug: item.slug, name: item.name, nameCn: item.nameCn };
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'ready', data: finalData } : it)),
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const msg = err instanceof Error ? err.message : 'Generation failed';
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'error', error: msg } : it)),
        );
      } finally {
        abortRefs.current.delete(item.id);
        setGeneratingProgress((prev) => ({ ...prev, done: prev.done + 1 }));
      }
    });

    await Promise.allSettled(tasks);
    setStep('review-details');
  };

  const handleSave = async () => {
    const toSave = items.filter((it) => it.selected && it.status === 'ready' && it.data);
    if (toSave.length === 0) return;
    setSavingProgress({ saved: 0, failed: 0, duplicate: 0, total: toSave.length });
    setStep('saving');

    const tasks = toSave.map(async (item) => {
      try {
        const res = await fetch('/api/universities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        if (res.ok) {
          setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, saveResult: 'saved' } : it)));
          setSavingProgress((prev) => ({ ...prev, saved: prev.saved + 1 }));
        } else {
          const err = await res.json().catch(() => ({}));
          const msg = (err as { error?: string }).error ?? '';
          const isDuplicate = /duplicate|unique|exists/i.test(msg);
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, saveResult: isDuplicate ? 'duplicate' : 'error', error: msg } : it,
            ),
          );
          setSavingProgress((prev) =>
            isDuplicate
              ? { ...prev, duplicate: prev.duplicate + 1 }
              : { ...prev, failed: prev.failed + 1 },
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Save failed';
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, saveResult: 'error', error: msg } : it)),
        );
        setSavingProgress((prev) => ({ ...prev, failed: prev.failed + 1 }));
      }
    });

    await Promise.allSettled(tasks);
    setStep('done');
  };

  const handleFinish = () => {
    const savedCount = savingProgress.saved;
    handleClose();
    if (savedCount > 0) onSaved(savedCount);
  };

  const selectedCount = items.filter((it) => it.selected).length;
  const readyCount = items.filter((it) => it.selected && it.status === 'ready').length;
  const currentStepIndex = STEP_KEYS.findIndex((s) => s.key === step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#9B1B30]" />
            <h2 className="text-lg font-semibold text-[#1F2937]">{t('adminUniversities.bulkModal.title')}</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        {step !== 'idle' && step !== 'done' && (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-[#F9FAFB] text-xs">
            {STEP_KEYS.slice(1).map((s, i) => {
              const isActive = s.key === step;
              const isPast = currentStepIndex > i + 1;
              return (
                <React.Fragment key={s.key}>
                  <span
                    className={`font-medium ${
                      isActive ? 'text-[#9B1B30]' : isPast ? 'text-green-600' : 'text-[#9CA3AF]'
                    }`}
                  >
                    {t(`adminUniversities.bulkModal.${s.labelKey}`)}
                  </span>
                  {i < STEP_KEYS.length - 2 && <span className="text-[#9CA3AF]">→</span>}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'idle' && (
            <div>
              <p className="text-sm text-[#4B5563] mb-4">
                {t('adminUniversities.bulkModal.intro')}
              </p>
              <div className="bg-gray-50 border border-gray-200 p-3 mb-4 text-xs text-[#4B5563]">
                <strong>{t('adminUniversities.bulkModal.stepsExplainerTitle')}</strong>
                <ol className="list-decimal ml-4 mt-2 space-y-1">
                  <li>{t('adminUniversities.bulkModal.step1')}</li>
                  <li>{t('adminUniversities.bulkModal.step2')}</li>
                  <li>{t('adminUniversities.bulkModal.step3')}</li>
                </ol>
              </div>
              {error && (
                <div className="border border-red-200 bg-red-50 p-3 mb-4 text-sm text-red-700">
                  {error}
                </div>
              )}
              <button
                onClick={handleSuggest}
                className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                {t('adminUniversities.bulkModal.suggestBtn')}
              </button>
            </div>
          )}

          {step === 'suggesting' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner size="md" className="text-[#9B1B30]" />
              <p className="text-sm text-[#4B5563] mt-4">
                {t('adminUniversities.bulkModal.suggestingNow')}
              </p>
            </div>
          )}

          {step === 'review-names' && (
            <div>
              <p className="text-sm text-[#4B5563] mb-4">
                {t('adminUniversities.bulkModal.reviewInstructions')}
              </p>
              <div className="space-y-2">
                {items.map((it) => (
                  <label
                    key={it.id}
                    className="flex items-start gap-3 border border-gray-200 p-3 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={it.selected}
                      onChange={() => handleToggle(it.id)}
                      className="mt-1 w-4 h-4 accent-[#9B1B30]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-[#1F2937]">
                        {it.name}{' '}
                        <span className="text-[#6B7280] font-normal">/ {it.nameCn}</span>
                      </div>
                      <div className="text-xs text-[#6B7280] mt-0.5">
                        {it.city} · rank #{it.ranking} · slug: <code>{it.slug}</code>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div>
              <p className="text-sm text-[#4B5563] mb-4">
                {t('adminUniversities.bulkModal.generatingDetails', {
                  done: generatingProgress.done,
                  total: generatingProgress.total,
                })}
              </p>
              <div className="space-y-2">
                {items
                  .filter((it) => it.selected)
                  .map((it) => (
                    <div key={it.id} className="flex items-center gap-3 border border-gray-200 p-3">
                      <StatusIcon status={it.status} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-[#1F2937] truncate">
                          {it.name}
                        </div>
                        <div className="text-xs text-[#6B7280] mt-0.5">{statusLabel(it, t)}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {step === 'review-details' && (
            <div>
              <p className="text-sm text-[#4B5563] mb-4">
                {t('adminUniversities.bulkModal.detailReviewInstructions')}
              </p>
              <div className="space-y-2">
                {items
                  .filter((it) => it.selected || it.status === 'error')
                  .map((it) => (
                    <DetailRow key={it.id} item={it} onToggle={() => handleToggle(it.id)} />
                  ))}
              </div>
            </div>
          )}

          {step === 'saving' && (
            <div>
              <p className="text-sm text-[#4B5563] mb-4">
                {t('adminUniversities.bulkModal.savingProgress', {
                  total: savingProgress.total,
                  saved: savingProgress.saved,
                  duplicate: savingProgress.duplicate > 0 ? ` · ${savingProgress.duplicate} duplicate skipped` : '',
                  failed: savingProgress.failed > 0 ? ` · ${savingProgress.failed} failed` : '',
                }).replace(/ \. ·/g, ' ·')}
              </p>
              <div className="space-y-2">
                {items
                  .filter((it) => it.selected && it.status === 'ready')
                  .map((it) => (
                    <div key={it.id} className="flex items-center gap-3 border border-gray-200 p-3">
                      <StatusIcon
                        status={
                          it.saveResult === 'saved'
                            ? 'ready'
                            : it.saveResult === 'duplicate'
                              ? 'skipped'
                              : it.saveResult === 'error'
                                ? 'error'
                                : 'pending'
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-[#1F2937] truncate">{it.name}</div>
                        <div className="text-xs text-[#6B7280] mt-0.5">
                          {it.saveResult === 'saved' && t('adminUniversities.bulkModal.savedToDb')}
                          {it.saveResult === 'duplicate' && t('adminUniversities.bulkModal.slugDuplicate')}
                          {it.saveResult === 'error' &&
                            t('adminUniversities.bulkModal.saveFailed', { error: it.error ?? 'unknown' })}
                          {!it.saveResult && t('adminUniversities.bulkModal.savingNow')}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold text-[#1F2937] mt-3">
                {savingProgress.saved > 0
                  ? t('adminUniversities.bulkModal.doneSavedTitle', { n: savingProgress.saved })
                  : t('adminUniversities.bulkModal.doneTitle')}
              </h3>
              <p className="text-sm text-[#4B5563] mt-2">
                {t('adminUniversities.bulkModal.doneBody', {
                  saved: savingProgress.saved,
                  duplicate: savingProgress.duplicate,
                  failed: savingProgress.failed,
                })}
              </p>
              {(savingProgress.failed > 0 || savingProgress.duplicate > 0) && (
                <p className="text-xs text-[#6B7280] mt-3">
                  {t('adminUniversities.bulkModal.retryHint')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 p-4 border-t border-gray-200">
          {step === 'idle' && (
            <>
              <button onClick={handleClose} className="text-sm text-[#4B5563] hover:text-[#1F2937]">
                Cancel
              </button>
              <div />
            </>
          )}

          {step === 'review-names' && (
            <>
              <button
                onClick={() => setStep('idle')}
                className="inline-flex items-center gap-1 text-sm text-[#4B5563] hover:text-[#1F2937]"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('adminUniversities.bulkModal.restart')}
              </button>
              <button
                onClick={handleGenerateDetails}
                disabled={selectedCount === 0}
                className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('adminUniversities.bulkModal.continueWith', { n: selectedCount })}
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'generating' && (
            <>
              <span />
              <button
                onClick={handleCancelGeneration}
                className="text-sm text-[#4B5563] hover:text-[#1F2937]"
              >
                {t('adminUniversities.bulkModal.cancelGeneration')}
              </button>
            </>
          )}

          {step === 'review-details' && (
            <>
              <button
                onClick={() => setStep('review-names')}
                className="inline-flex items-center gap-1 text-sm text-[#4B5563] hover:text-[#1F2937]"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('adminUniversities.bulkModal.restart')}
              </button>
              <button
                onClick={handleSave}
                disabled={readyCount === 0}
                className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                {readyCount === 1
                  ? t('adminUniversities.bulkModal.saveBtnSingular', { n: readyCount })
                  : t('adminUniversities.bulkModal.saveBtn', { n: readyCount })}
              </button>
            </>
          )}

          {step === 'saving' && (
            <>
              <span />
              <span className="text-sm text-[#4B5563]">
                <Loader2 className="w-4 h-4 inline animate-spin mr-1" />
                {t('adminUniversities.bulkModal.savingNow')}
              </span>
            </>
          )}

          {step === 'done' && (
            <>
              <span />
              <button
                onClick={handleFinish}
                className="bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors"
              >
                {t('adminUniversities.bulkModal.doneButton')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: DetailStatus }) {
  if (status === 'pending') return <Loader2 className="w-4 h-4 text-[#9CA3AF] animate-spin flex-shrink-0" />;
  if (status === 'generating') return <Spinner size="sm" className="text-[#9B1B30] flex-shrink-0" />;
  if (status === 'ready') return <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />;
  if (status === 'error') return <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
  return <div className="w-4 h-4 border border-gray-300 flex-shrink-0" />;
}

function statusLabel(it: SuggestionItem, t: (key: string, params?: Record<string, string | number>) => string): string {
  switch (it.status) {
    case 'pending':
      return t('adminUniversities.bulkModal.statusQueued');
    case 'generating':
      return t('adminUniversities.bulkModal.statusGenerating');
    case 'ready':
      return t('adminUniversities.bulkModal.statusReady');
    case 'error':
      return t('adminUniversities.bulkModal.statusErrorPrefix', { error: it.error ?? 'unknown error' });
    case 'skipped':
      return t('adminUniversities.bulkModal.detailCancel');
    default:
      return '';
  }
}

function DetailRow({ item, onToggle }: { item: SuggestionItem; onToggle: () => void }) {
  const { t } = useI18n();
  const showData = item.status === 'ready' && item.data;
  return (
    <div className="border border-gray-200 p-3">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={item.selected}
          onChange={onToggle}
          disabled={item.status !== 'ready'}
          className="mt-1 w-4 h-4 accent-[#9B1B30] disabled:opacity-30"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium text-sm text-[#1F2937]">
                {item.name} <span className="text-[#6B7280] font-normal">/ {item.nameCn}</span>
              </div>
              <div className="text-xs text-[#6B7280] mt-0.5">
                {item.city} · rank #{item.ranking}
              </div>
            </div>
            <StatusIcon status={item.status} />
          </div>
          {showData ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs text-[#4B5563]">
              {dataSummary(item.data as Record<string, unknown>, t).map((kv) => (
                <div key={kv.k} className="truncate">
                  <span className="text-[#6B7280]">{kv.k}:</span> {kv.v}
                </div>
              ))}
            </div>
          ) : item.status === 'error' ? (
            <div className="mt-2 text-xs text-red-600">{item.error ?? t('adminUniversities.aiModal.failed')}</div>
          ) : null}
        </div>
      </label>
    </div>
  );
}

function dataSummary(
  d: Record<string, unknown>,
  t: (key: string, params?: Record<string, string | number>) => string,
): Array<{ k: string; v: string }> {
  // Compact 2-col grid for the review step — too long to inline.
  // Falls back to em-dash for null/undefined.
  const dash = t('adminUniversities.bulkModal.detailDash');
  const fmt = (v: unknown, max = 80): string => {
    if (v == null || v === '') return dash;
    if (Array.isArray(v)) return t('adminUniversities.bulkModal.detailItems', { n: v.length });
    const s = String(v);
    return s.length > max ? s.slice(0, max) + '…' : s;
  };
  return [
    { k: t('adminUniversities.bulkModal.detailType'), v: fmt(d.type) },
    { k: t('adminUniversities.bulkModal.detailEst'), v: fmt(d.established) },
    { k: t('adminUniversities.bulkModal.detailStudents'), v: fmt(d.students) },
    { k: t('adminUniversities.bulkModal.detailIntl'), v: fmt(d.intlStudents) },
    { k: t('adminUniversities.bulkModal.detailTuitionUg'), v: fmt(d.tuitionUndergrad) },
    { k: t('adminUniversities.bulkModal.detailTuitionG'), v: fmt(d.tuitionGraduate) },
    { k: t('adminUniversities.bulkModal.detailRating'), v: fmt(d.rating) },
    { k: t('adminUniversities.bulkModal.detailQsWorld'), v: fmt(d.qsWorldRanking) },
  ];
}

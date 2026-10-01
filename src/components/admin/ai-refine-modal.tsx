'use client';

import React, { useState, useCallback } from 'react';
import { Sparkles, X, Check, RotateCcw } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

/**
 * Phase 128+ — AI Refine preview modal.
 *
 * Generic-enough to host any "current vs AI-refined text" pair: the
 * parent passes `currentEn`, `currentZh`, and the AI's `refinedEn`
 * + `refinedZh` (once the response comes back). The modal renders
 * side-by-side columns with per-field Accept / Reject + top-level
 * Accept Both / Reject Both shortcuts. Closing the modal does not
 * mutate anything — the parent decides what to do with the
 * returned accept set.
 *
 * State machine:
 *   - `busy` while the AI call is in flight (parent-controlled)
 *   - `error` if the response failed to parse (parent-controlled)
 *   - `view: 'current' | 'diff'` toggles between side-by-side and
 *     a unified diff view (uniform for both fields)
 *   - `accepted: { en: boolean, zh: boolean }` per-field flags the
 *     admin's accept/reject choice
 *
 * Accept semantics:
 *   - The modal does NOT write to the DB. It returns a Promise
 *     that resolves with `{ accepted: 'en' | 'zh' | 'both' | 'none' }`
 *     and the refined strings via the `onAccept` callback. The
 *     parent writes the refined strings into the underlying form
 *     state ONLY for the accepted fields; rejected fields keep
 *     their current value.
 */
export interface AiRefineModalProps {
  open: boolean;
  onCancel: () => void;
  onAccept: (fields: { en: boolean; zh: boolean }, refined: { en: string; zh: string }) => void;
  currentEn: string;
  currentZh: string;
  refinedEn: string;
  refinedZh: string;
  busy: boolean;
  error: string | null;
}

export function AiRefineModal({
  open,
  onCancel,
  onAccept,
  currentEn,
  currentZh,
  refinedEn,
  refinedZh,
  busy,
  error,
}: AiRefineModalProps) {
  const { t } = useI18n();
  // Accept/reject per field. Default false so they have to be
  // explicit — protects against the modal closing on accidental
  // keypress without an admin actually clicking Accept.
  const [accepted, setAccepted] = useState<{ en: boolean; zh: boolean }>({
    en: false,
    zh: false,
  });
  // View toggle: side-by-side vs unified diff. Defaults to side-
  // by-side because that's the admin's first-pass review.
  const [view, setView] = useState<'side' | 'diff'>('side');

  const handleAcceptBoth = useCallback(() => {
    setAccepted({ en: true, zh: true });
  }, []);

  const handleRejectBoth = useCallback(() => {
    setAccepted({ en: false, zh: false });
  }, []);

  const handleConfirm = useCallback(() => {
    onAccept(accepted, { en: refinedEn, zh: refinedZh });
  }, [accepted, refinedEn, refinedZh, onAccept]);

  if (!open) return null;

  const bothAccepted = accepted.en && accepted.zh;
  const anyAccepted = accepted.en || accepted.zh;
  // For display-only purpose: highlight whether the AI returned
  // anything (it might return '' for fields a one-side source).
  const enHasRefinement = refinedEn.length > 0;
  const zhHasRefinement = refinedZh.length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-refine-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="bg-white rounded-none border border-gray-200 w-full max-w-6xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-200">
          <div>
            <h2
              id="ai-refine-modal-title"
              className="flex items-center gap-2 text-lg font-bold text-[#1B2A4A]"
            >
              <Sparkles className="h-5 w-5 text-[#9B1B30]" />
              {t('adminUniversities.aiRefine.title')}
            </h2>
            <p className="mt-1 text-sm text-[#4B5563]">
              {t('adminUniversities.aiRefine.disclaimer')}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label={t('adminUniversities.aiRefine.cancel')}
            className="p-1 text-[#4B5563] hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Top toolbar — global Accept Both / Reject Both + view toggle */}
        <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-gray-200 bg-[#FAFAF8]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAcceptBoth}
              disabled={busy || (!enHasRefinement && !zhHasRefinement)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="h-3.5 w-3.5" />
              {t('adminUniversities.aiRefine.acceptBoth')}
            </button>
            <button
              type="button"
              onClick={handleRejectBoth}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-300 text-[#4B5563] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t('adminUniversities.aiRefine.rejectBoth')}
            </button>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setView('side')}
              className={`px-2 py-1 border ${
                view === 'side'
                  ? 'border-[#1B2A4A] bg-[#1B2A4A] text-white'
                  : 'border-gray-300 text-[#4B5563] hover:bg-gray-100'
              }`}
            >
              {t('adminUniversities.aiRefine.viewSide')}
            </button>
            <button
              type="button"
              onClick={() => setView('diff')}
              className={`px-2 py-1 border ${
                view === 'diff'
                  ? 'border-[#1B2A4A] bg-[#1B2A4A] text-white'
                  : 'border-gray-300 text-[#4B5563] hover:bg-gray-100'
              }`}
            >
              {t('adminUniversities.aiRefine.viewDiff')}
            </button>
          </div>
        </div>

        {/* Body — side-by-side columns or unified diff */}
        <div className="flex-1 overflow-auto p-6">
          {busy && (
            <div className="flex items-center justify-center py-12 text-sm text-[#4B5563]">
              <Sparkles className="h-4 w-4 mr-2 animate-pulse text-[#9B1B30]" />
              {t('adminUniversities.aiRefine.refining')}
            </div>
          )}
          {error && !busy && (
            <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          {!busy && !error && view === 'side' && (
            <div className="grid grid-cols-2 gap-4">
              <RefineColumn
                title="English"
                current={currentEn}
                refined={refinedEn}
                hasRefinement={enHasRefinement}
                accepted={accepted.en}
                onAccept={(v) => setAccepted((p) => ({ ...p, en: v }))}
                labels={{
                  current: t('adminUniversities.aiRefine.current'),
                  refined: t('adminUniversities.aiRefine.aiRefined'),
                  accept: t('adminUniversities.aiRefine.acceptEn'),
                  reject: t('adminUniversities.aiRefine.rejectEn'),
                  noRefinement: t('adminUniversities.aiRefine.emptyEn'),
                }}
              />
              <RefineColumn
                title="中文"
                current={currentZh}
                refined={refinedZh}
                hasRefinement={zhHasRefinement}
                accepted={accepted.zh}
                onAccept={(v) => setAccepted((p) => ({ ...p, zh: v }))}
                labels={{
                  current: t('adminUniversities.aiRefine.current'),
                  refined: t('adminUniversities.aiRefine.aiRefined'),
                  accept: t('adminUniversities.aiRefine.acceptZh'),
                  reject: t('adminUniversities.aiRefine.rejectZh'),
                  noRefinement: t('adminUniversities.aiRefine.emptyZh'),
                }}
              />
            </div>
          )}
          {!busy && !error && view === 'diff' && (
            <div className="space-y-4">
              <DiffBlock
                title="English"
                current={currentEn}
                refined={refinedEn}
                labels={{
                  unchanged: t('adminUniversities.aiRefine.unchanged'),
                  changed: t('adminUniversities.aiRefine.changed'),
                  removed: t('adminUniversities.aiRefine.removed'),
                  added: t('adminUniversities.aiRefine.added'),
                }}
              />
              <DiffBlock
                title="中文"
                current={currentZh}
                refined={refinedZh}
                labels={{
                  unchanged: t('adminUniversities.aiRefine.unchanged'),
                  changed: t('adminUniversities.aiRefine.changed'),
                  removed: t('adminUniversities.aiRefine.removed'),
                  added: t('adminUniversities.aiRefine.added'),
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-[#FAFAF8]">
          <span className="text-xs text-[#4B5563]">
            {anyAccepted
              ? bothAccepted
                ? t('adminUniversities.aiRefine.bothAccepted')
                : t('adminUniversities.aiRefine.partialAccepted', {
                    en: accepted.en ? 1 : 0,
                    zh: accepted.zh ? 1 : 0,
                  })
              : t('adminUniversities.aiRefine.noneAccepted')}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-[#4B5563] text-sm font-semibold hover:bg-gray-100"
            >
              {t('adminUniversities.aiRefine.cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy || !anyAccepted}
              className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4" />
              {t('adminUniversities.aiRefine.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RefineColumnLabels {
  current: string;
  refined: string;
  accept: string;
  reject: string;
  noRefinement: string;
}

function RefineColumn({
  title,
  current,
  refined,
  hasRefinement,
  accepted,
  onAccept,
  labels,
}: {
  title: string;
  current: string;
  refined: string;
  hasRefinement: boolean;
  accepted: boolean;
  onAccept: (v: boolean) => void;
  labels: RefineColumnLabels;
}) {
  return (
    <div className="border border-gray-200">
      <div className="bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider px-3 py-2">
        {title}
      </div>
      <div className="p-3 space-y-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] mb-1">
            {labels.current}
          </div>
          <div className="bg-gray-50 border border-gray-200 p-3 text-sm text-[#1F2937] max-h-48 overflow-auto whitespace-pre-wrap">
            {current || <span className="text-gray-400">—</span>}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#9B1B30] mb-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {labels.refined}
          </div>
          {hasRefinement ? (
            <div
              className={`p-3 text-sm max-h-48 overflow-auto whitespace-pre-wrap border ${
                accepted
                  ? 'border-green-600 bg-green-50 text-[#1F2937]'
                  : 'border-[#9B1B30] bg-[#9B1B30]/5 text-[#1F2937]'
              }`}
            >
              {refined}
            </div>
          ) : (
            <div className="p-3 text-sm italic text-gray-500 border border-dashed border-gray-300">
              {labels.noRefinement}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAccept(true)}
            disabled={!hasRefinement}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border ${
              accepted
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            {labels.accept}
          </button>
          <button
            type="button"
            onClick={() => onAccept(false)}
            disabled={!hasRefinement}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border ${
              !accepted
                  ? 'border-gray-400 bg-gray-400 text-white'
                  : 'border-gray-300 text-[#4B5563] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {labels.reject}
          </button>
        </div>
      </div>
    </div>
  );
}

interface DiffLabels {
  unchanged: string;
  changed: string;
  removed: string;
  added: string;
}

/**
 * Lightweight word-level diff using a longest-common-subsequence
 * approximation. The goal isn't a perfect diff — it's "show the
 * admin what the AI changed so they can spot invented facts /
 * dropped scholarships". Side-by-side review remains the
 * authoritative view; the diff is a quick scan.
 */
function DiffBlock({
  title,
  current,
  refined,
  labels,
}: {
  title: string;
  current: string;
  refined: string;
  labels: DiffLabels;
}) {
  const tokens = (s: string) => s.split(/(\s+)/);
  const a = tokens(current);
  const b = tokens(refined);
  const m = a.length;
  const n = b.length;
  // LCS table — O(m*n), fine for short scholarship narratives.
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  // Walk back, emit a list of ops.
  type Op = { type: 'eq' | 'rem' | 'add'; text: string };
  const ops: Op[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      ops.push({ type: 'eq', text: a[i - 1] });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.push({ type: 'rem', text: a[i - 1] });
      i--;
    } else {
      ops.push({ type: 'add', text: b[j - 1] });
      j--;
    }
  }
  while (i > 0) {
    ops.push({ type: 'rem', text: a[i - 1] });
    i--;
  }
  while (j > 0) {
    ops.push({ type: 'add', text: b[j - 1] });
    j--;
  }
  ops.reverse();

  return (
    <div className="border border-gray-200">
      <div className="bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider px-3 py-2">
        {title}
      </div>
      <div className="p-3">
        <div className="bg-gray-50 border border-gray-200 p-3 text-sm text-[#1F2937] whitespace-pre-wrap font-mono leading-relaxed">
          {ops.length === 0 ? (
            <span className="text-gray-400">—</span>
          ) : (
            ops.map((op, idx) => {
              if (op.type === 'eq') {
                return <span key={idx}>{op.text}</span>;
              }
              if (op.type === 'rem') {
                return (
                  <span
                    key={idx}
                    className="bg-red-100 text-red-900 line-through"
                    title={labels.removed}
                  >
                    {op.text}
                  </span>
                );
              }
              return (
                <span
                  key={idx}
                  className="bg-green-100 text-green-900"
                  title={labels.added}
                >
                  {op.text}
                </span>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
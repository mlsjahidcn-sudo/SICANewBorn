'use client';

/**
 * S36: structured-field editor for the SEO + AEO + GEO fields on
 * a news post. The form deals in three list-style fields:
 *
 *   - `key_takeaways`: array of short strings (3-5 bullets)
 *   - `at_a_glance`  : array of {label, value} pairs
 *   - `faq`          : array of {question, answer} pairs
 *   - `sources`      : array of {label, url} pairs
 *
 * Editing raw JSON would be a UX nightmare for an admin, so this
 * component renders each row as a card with explicit "Remove"
 * buttons + an "Add row" footer. The output is the exact JSONB
 * shape the API expects; the parent form stores it as
 * `Record<string, unknown>` and passes it through verbatim.
 *
 * The fields are independent — the parent picks which ones to
 * include via the `field` prop. The component doesn't know (or
 * care) about the rest of the form.
 */

import React, { useCallback } from 'react';
import { Plus, X, GripVertical, ArrowUp, ArrowDown, ListChecks, BookOpen, HelpCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

type StructuredField = 'key_takeaways' | 'at_a_glance' | 'faq' | 'sources';

interface GlanceRow { label: string; value: string }
interface FaqRow { question: string; answer: string }
interface SourceRow { label: string; url: string }

type AnyRow = GlanceRow | FaqRow | SourceRow | string;

interface Props {
  field: StructuredField;
  value: unknown;
  onChange: (next: unknown) => void;
}

const FIELD_META: Record<StructuredField, {
  title: string;
  description: string;
  icon: React.ElementType;
  addLabel: string;
  emptyHint: string;
}> = {
  key_takeaways: {
    title: 'Key takeaways (AEO)',
    description: '3-5 short bullets that power the TL;DR box on the public post. Each under 90 characters.',
    icon: ListChecks,
    addLabel: 'Add takeaway',
    emptyHint: 'No takeaways yet. Add 3-5 distilled facts that a reader should remember.',
  },
  at_a_glance: {
    title: 'At a glance (GEO)',
    description: '4-6 {label, value} fact rows. LLMs (ChatGPT, Perplexity, Claude) extract from these when composing answers. Keep values short and atomic — years, numbers, deadlines, ranks.',
    icon: BookOpen,
    addLabel: 'Add fact',
    emptyHint: 'No facts yet. Add specific data points (founded, QS rank, tuition, deadline…).',
  },
  faq: {
    title: 'Frequently asked questions (AEO)',
    description: '3-5 Q&A pairs. Rendered as a visible accordion AND as FAQPage JSON-LD (Google rich result). Each answer 40-60 words, leads with the answer.',
    icon: HelpCircle,
    addLabel: 'Add Q&A',
    emptyHint: 'No Q&A yet. Real questions a student would type into Google.',
  },
  sources: {
    title: 'Sources (GEO)',
    description: '2-4 {label, url} citations. Rendered as a footer + Article JSON-LD isBasedOn. Public sources only (campuschina.org, moe.gov.cn, the university\'s own page, Wikipedia).',
    icon: ExternalLink,
    addLabel: 'Add source',
    emptyHint: 'No sources yet. Add 2-4 public references that ground the claims in the body.',
  },
};

export function StructuredFieldsEditor({ field, value, onChange }: Props) {
  const meta = FIELD_META[field];
  const Icon = meta.icon;
  const rows = Array.isArray(value) ? (value as AnyRow[]) : [];

  const setRows = useCallback(
    (next: AnyRow[]) => onChange(next),
    [onChange],
  );

  const addRow = useCallback(() => {
    let blank: AnyRow;
    if (field === 'key_takeaways') blank = '';
    else if (field === 'at_a_glance') blank = { label: '', value: '' };
    else if (field === 'faq') blank = { question: '', answer: '' };
    else blank = { label: '', url: '' };
    setRows([...rows, blank]);
  }, [field, rows, setRows]);

  const removeAt = useCallback(
    (idx: number) => setRows(rows.filter((_, i) => i !== idx)),
    [rows, setRows],
  );

  const updateAt = useCallback(
    (idx: number, patch: Partial<GlanceRow & FaqRow & SourceRow>) => {
      setRows(
        rows.map((r, i) => (i === idx ? ({ ...(r as object), ...patch } as AnyRow) : r)),
      );
    },
    [rows, setRows],
  );

  const move = useCallback(
    (idx: number, dir: -1 | 1) => {
      const j = idx + dir;
      if (j < 0 || j >= rows.length) return;
      const next = rows.slice();
      [next[idx], next[j]] = [next[j], next[idx]];
      setRows(next);
    },
    [rows, setRows],
  );

  return (
    <div className="bg-white border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-[#1B2A4A]" />
        <h3 className="text-sm font-semibold text-[#1B2A4A]">{meta.title}</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">{meta.description}</p>

      {rows.length === 0 ? (
        <div className="border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          {meta.emptyHint}
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="border border-gray-200 bg-[#FAFAF8] p-3"
            >
              <div className="flex items-start gap-2">
                {/* Move + remove controls */}
                <div className="flex flex-col items-center gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="text-gray-400 hover:text-[#1B2A4A] disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <GripVertical className="h-3.5 w-3.5 text-gray-300" />
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === rows.length - 1}
                    className="text-gray-400 hover:text-[#1B2A4A] disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  {field === 'key_takeaways' ? (
                    <input
                      type="text"
                      value={row as string}
                      onChange={(e) => {
                        const next = rows.slice();
                        next[idx] = e.target.value;
                        setRows(next);
                      }}
                      placeholder="e.g. CSC covers tuition, dorm, and ¥2,500/month stipend"
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
                    />
                  ) : field === 'at_a_glance' ? (
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={(row as GlanceRow).label}
                        onChange={(e) => updateAt(idx, { label: e.target.value })}
                        placeholder="Label (e.g. QS Rank)"
                        className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
                      />
                      <input
                        type="text"
                        value={(row as GlanceRow).value}
                        onChange={(e) => updateAt(idx, { value: e.target.value })}
                        placeholder="Value (e.g. #20 (2025))"
                        className="col-span-2 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
                      />
                    </div>
                  ) : field === 'faq' ? (
                    <>
                      <input
                        type="text"
                        value={(row as FaqRow).question}
                        onChange={(e) => updateAt(idx, { question: e.target.value })}
                        placeholder="Question (conversational, include the target keyword)"
                        className="w-full px-3 py-2 border border-gray-300 text-sm font-medium focus:outline-none focus:border-[#9B1B30]"
                      />
                      <textarea
                        value={(row as FaqRow).answer}
                        onChange={(e) => updateAt(idx, { answer: e.target.value })}
                        rows={3}
                        placeholder="40-60 word answer. Lead with the answer, not preamble."
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30] resize-none"
                      />
                    </>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={(row as SourceRow).label}
                        onChange={(e) => updateAt(idx, { label: e.target.value })}
                        placeholder="Label (e.g. CSC 2025 Annual Report)"
                        className="col-span-2 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
                      />
                      <input
                        type="url"
                        value={(row as SourceRow).url}
                        onChange={(e) => updateAt(idx, { url: e.target.value })}
                        placeholder="https://..."
                        className="px-3 py-2 border border-gray-300 text-sm font-mono focus:outline-none focus:border-[#9B1B30]"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="text-gray-400 hover:text-red-600 mt-1"
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-none mt-3"
        onClick={addRow}
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        {meta.addLabel}
      </Button>
    </div>
  );
}

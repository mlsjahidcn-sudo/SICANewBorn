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
 *
 * Phase 106: every chrome string is now pulled from the admin
 * i18n context under the `adminNews.structuredFields.*` namespace
 * (with one shared `adminCommon.moveUp` / `.moveDown` / `.remove`
 * triplet for the row controls that are shared by all 4 field
 * variants). The icon + field shape stay in TS — only the user-
 * facing copy translates.
 */

import React, { useCallback } from 'react';
import { Plus, X, GripVertical, ArrowUp, ArrowDown, ListChecks, BookOpen, HelpCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

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

interface FieldMetaShape {
  icon: React.ElementType;
}

// The labels / hints / descriptions all move into the component
// body so they can be read from useI18n() per render — leaving
// only the icon mapping here keeps the icon stable across locales
// while the text is rendered from the locale table.
const FIELD_META: Record<StructuredField, FieldMetaShape> = {
  key_takeaways: { icon: ListChecks },
  at_a_glance: { icon: BookOpen },
  faq: { icon: HelpCircle },
  sources: { icon: ExternalLink },
};

export function StructuredFieldsEditor({ field, value, onChange }: Props) {
  const { t } = useI18n();
  const meta = FIELD_META[field];
  const Icon = meta.icon;
  const rows = Array.isArray(value) ? (value as AnyRow[]) : [];

  // Resolve the field-specific chrome once per render. The keys
  // are namespaced under adminNews.structuredFields.* and use the
  // field name as a sub-namespace (e.g.
  // adminNews.structuredFields.keyTakeaways.title).
  const ns = `adminNews.structuredFields.${camelCase(field)}`;
  const title = t(`${ns}.title`);
  const description = t(`${ns}.description`);
  const addLabel = t(`${ns}.addLabel`);
  const emptyHint = t(`${ns}.emptyHint`);

  const placeholders = {
    keyTakeaway: t(`${ns}.placeholders.takeaway`),
    glanceLabel: t(`${ns}.placeholders.glanceLabel`),
    glanceValue: t(`${ns}.placeholders.glanceValue`),
    faqQuestion: t(`${ns}.placeholders.faqQuestion`),
    faqAnswer: t(`${ns}.placeholders.faqAnswer`),
    sourceLabel: t(`${ns}.placeholders.sourceLabel`),
    sourceUrl: t(`${ns}.placeholders.sourceUrl`),
  };

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
        <h3 className="text-sm font-semibold text-[#1B2A4A]">{title}</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">{description}</p>

      {rows.length === 0 ? (
        <div className="border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          {emptyHint}
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
                    title={t('adminCommon.moveUp')}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <GripVertical className="h-3.5 w-3.5 text-gray-300" />
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === rows.length - 1}
                    className="text-gray-400 hover:text-[#1B2A4A] disabled:opacity-30"
                    title={t('adminCommon.moveDown')}
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
                      placeholder={placeholders.keyTakeaway}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
                    />
                  ) : field === 'at_a_glance' ? (
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={(row as GlanceRow).label}
                        onChange={(e) => updateAt(idx, { label: e.target.value })}
                        placeholder={placeholders.glanceLabel}
                        className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
                      />
                      <input
                        type="text"
                        value={(row as GlanceRow).value}
                        onChange={(e) => updateAt(idx, { value: e.target.value })}
                        placeholder={placeholders.glanceValue}
                        className="col-span-2 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
                      />
                    </div>
                  ) : field === 'faq' ? (
                    <>
                      <input
                        type="text"
                        value={(row as FaqRow).question}
                        onChange={(e) => updateAt(idx, { question: e.target.value })}
                        placeholder={placeholders.faqQuestion}
                        className="w-full px-3 py-2 border border-gray-300 text-sm font-medium focus:outline-none focus:border-[#9B1B30]"
                      />
                      <textarea
                        value={(row as FaqRow).answer}
                        onChange={(e) => updateAt(idx, { answer: e.target.value })}
                        rows={3}
                        placeholder={placeholders.faqAnswer}
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30] resize-none"
                      />
                    </>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={(row as SourceRow).label}
                        onChange={(e) => updateAt(idx, { label: e.target.value })}
                        placeholder={placeholders.sourceLabel}
                        className="col-span-2 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
                      />
                      <input
                        type="url"
                        value={(row as SourceRow).url}
                        onChange={(e) => updateAt(idx, { url: e.target.value })}
                        placeholder={placeholders.sourceUrl}
                        className="px-3 py-2 border border-gray-300 text-sm font-mono focus:outline-none focus:border-[#9B1B30]"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="text-gray-400 hover:text-red-600 mt-1"
                  title={t('adminCommon.remove')}
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
        {addLabel}
      </Button>
    </div>
  );
}

// Map the DB column name to the camelCase sub-namespace used in
// the i18n table. Keeping the conversion local to this file
// means changing the DB column later doesn't break translation
// lookup as long as the sub-namespace keys stay in sync.
function camelCase(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
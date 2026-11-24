'use client';

import type { ReactNode } from 'react';

/**
 * Read-only label/value rows for detail pages.
 *
 * The partner detail pages each shipped their own private `Field` helper
 * (duplicated in `partner/applications/[id]/page.tsx` and
 * `partner/students/[id]/page.tsx`). This is the shared version — the
 * visual contract is unchanged: muted label with a fixed minimum width,
 * semibold value, optional monospace, and an em dash for empty values.
 *
 * Not to be confused with `ui/field.tsx`, which is a form primitive
 * (`FieldSet` / `FieldLegend` / `FieldError`) and does not fit a
 * read-only label/value row.
 */

export interface DescriptionRow {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}

export function DescriptionRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#4B5563] min-w-24">{label}:</span>
      <span className={`font-medium text-[#1F2937] ${mono ? 'font-mono' : ''}`}>
        {value || '—'}
      </span>
    </div>
  );
}

export function DescriptionList({
  items,
  className,
}: {
  items: DescriptionRow[];
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      {items.map((item) => (
        <DescriptionRow
          key={item.label}
          label={item.label}
          value={item.value}
          mono={item.mono}
        />
      ))}
    </div>
  );
}

/**
 * A row whose value was never recorded, plus an optional call to action.
 * Used by the "student file" tab so an empty section is visibly empty
 * rather than silently missing — the caller passes the translated
 * "Not recorded" string so the state is explicit, not another em dash.
 */
export function DescriptionPlaceholder({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#4B5563] min-w-24">{label}:</span>
      <span className="text-sm text-[#4B5563] italic">{value}</span>
      {action}
    </div>
  );
}

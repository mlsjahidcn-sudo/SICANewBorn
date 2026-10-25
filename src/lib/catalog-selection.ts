export interface CatalogSelection {
  universitySlug: string;
  universityName: string;
  universityNameCn: string;
  programSlug?: string;
  programName?: string;
  programNameCn?: string;
  sourcePath: string;
}

export function selectionLabel(selection: CatalogSelection, locale: 'en' | 'zh' = 'en'): string {
  const university = locale === 'zh' ? selection.universityNameCn || selection.universityName : selection.universityName;
  const program = locale === 'zh' ? selection.programNameCn || selection.programName : selection.programName;
  return program ? `${program} — ${university}` : university;
}

export function selectionQuery(selection: CatalogSelection): URLSearchParams {
  const query = new URLSearchParams({ university: selection.universitySlug, interest: selection.universitySlug });
  if (selection.programSlug) query.set('program', selection.programSlug);
  return query;
}

/** Use existing staff-visible text fields and the source path, without a schema dependency. */
export function selectionTopic(selection: CatalogSelection | null, topic: string | null): string | null {
  if (!selection) return topic;
  const university = selection.universityName.slice(0, 180);
  const program = selection.programName?.slice(0, 180);
  return [`${program ? `${program} — ` : ''}${university}`, topic].filter(Boolean).join('\n').slice(0, 500);
}

export function selectionNotes(selection: CatalogSelection | null, notes: string | null): string | null {
  return selection ? [`Selected catalog entry: ${selectionLabel(selection)} (${selection.sourcePath})`, notes].filter(Boolean).join('\n\n') : notes;
}

/**
 * Phase 127 — free-text program parsing helpers for the admin bulk
 * import page's "AI Parse" mode.
 *
 * The AI endpoint (/api/programs/ai-parse) sends the admin's raw
 * notes to the provider and gets back a JSON array of program rows.
 * These helpers are the pure, network-free half of that flow so the
 * extraction + normalization rules are unit-testable:
 *
 *   - extractProgramsJson: fence-stripping + bracket-slicing JSON
 *     array extractor (the model occasionally wraps output in
 *     ```json fences or preamble prose).
 *   - normalizeProgramRows: per-row validation with closed-set
 *     fallbacks (bad degree → Bachelor + warning, not a failed
 *     request), length caps matching the programs table columns,
 *     in-batch dedupe, and a hard row cap.
 *
 * Parsing mirrors parseSuggestions in bulk-suggest-names and
 * extractJsonObject in blog-sanitize — same LLM fail-modes, same
 * repairs.
 */

export const PROGRAM_DEGREES = ['Bachelor', 'Master', 'PhD'] as const;
export const PROGRAM_LANGUAGES = ['English', 'Chinese', 'Bilingual'] as const;

export type ProgramDegree = (typeof PROGRAM_DEGREES)[number];
export type ProgramLanguage = (typeof PROGRAM_LANGUAGES)[number];

/** One normalized program row, shaped for the bulk import preview. */
export interface ParsedProgramRow {
  name: string;
  nameCn: string;
  degree: ProgramDegree;
  discipline: string;
  disciplineCn: string;
  language: ProgramLanguage;
  duration: string;
  durationCn: string;
  tuition: string;
  intake: string;
  intakeCn: string;
  scholarshipAvailable: boolean;
}

export interface NormalizedProgramResult {
  programs: ParsedProgramRow[];
  warnings: string[];
}

/**
 * Server-side hard cap. The bulk import endpoint allows 200 rows;
 * 120 per parse keeps the AI response inside max_tokens (8000) with
 * headroom — bigger lists get split across two parses.
 */
export const MAX_PARSED_PROGRAMS = 120;

// Column caps lifted from the programs table DDL
// (database/migration-supabase-cloud.sql): name 255, degree 50,
// discipline 100, duration 50, tuition 100, intake 100.
const CAPS = {
  name: 255,
  nameCn: 255,
  discipline: 100,
  disciplineCn: 100,
  duration: 50,
  durationCn: 50,
  tuition: 100,
  intake: 100,
  intakeCn: 100,
} as const;

/**
 * Degree aliases the model (or the admin's notes) actually produce.
 * Matched case-insensitively against the trimmed input; everything
 * unknown falls back to Bachelor with a warning.
 */
const DEGREE_ALIASES: Record<string, ProgramDegree> = {
  bachelor: 'Bachelor',
  bachelors: 'Bachelor',
  undergraduate: 'Bachelor',
  本科: 'Bachelor',
  学士: 'Bachelor',
  master: 'Master',
  masters: 'Master',
  graduate: 'Master',
  postgraduate: 'Master',
  硕士: 'Master',
  研究生: 'Master',
  phd: 'PhD',
  'ph.d': 'PhD',
  'ph.d.': 'PhD',
  doctor: 'PhD',
  doctoral: 'PhD',
  doctorate: 'PhD',
  博士: 'PhD',
};

const LANGUAGE_ALIASES: Record<string, ProgramLanguage> = {
  english: 'English',
  en: 'English',
  英文: 'English',
  英语: 'English',
  chinese: 'Chinese',
  zh: 'Chinese',
  中文: 'Chinese',
  bilingual: 'Bilingual',
  中英: 'Bilingual',
  双语: 'Bilingual',
};

function normalizeDegree(value: unknown, rowIndex: number, warnings: string[]): ProgramDegree {
  if (typeof value === 'string') {
    const key = value.trim().toLowerCase().replace(/\s+/g, ' ');
    const hit = DEGREE_ALIASES[key];
    if (hit) return hit;
    // Also catch prefixed forms like "Bachelor degree" / "PhD program".
    for (const alias of Object.keys(DEGREE_ALIASES)) {
      if (key.startsWith(alias)) return DEGREE_ALIASES[alias];
    }
    if (value.trim()) {
      warnings.push(
        `Row ${rowIndex}: unrecognized degree "${value.trim()}" — defaulted to Bachelor (edit before importing).`,
      );
    } else {
      warnings.push(`Row ${rowIndex}: no degree given — defaulted to Bachelor.`);
    }
    return 'Bachelor';
  }
  warnings.push(`Row ${rowIndex}: no degree given — defaulted to Bachelor.`);
  return 'Bachelor';
}

function normalizeLanguage(value: unknown, rowIndex: number, warnings: string[]): ProgramLanguage {
  if (typeof value === 'string' && value.trim()) {
    const key = value.trim().toLowerCase().replace(/\s+/g, ' ');
    const hit = LANGUAGE_ALIASES[key];
    if (hit) return hit;
    warnings.push(
      `Row ${rowIndex}: unrecognized language "${value.trim()}" — defaulted to English (edit before importing).`,
    );
  }
  // Empty is the expected case — the prompt leaves language blank
  // when the notes don't state it; the import default is English.
  return 'English';
}

function normalizeString(value: unknown, cap: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, cap);
}

function normalizeBoolean(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === 'true' || v === 'yes' || v === '是' || v === '1';
  }
  return false;
}

/**
 * Extract a JSON array from the model's freeform output. Strips
 * markdown fences, prose before the first `[` / after the last `]`,
 * and trailing commas. Returns the parsed value, or null when no
 * array can be recovered.
 */
export function extractProgramsJson(raw: string): unknown[] | null {
  if (!raw) return null;
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const firstBrack = s.indexOf('[');
  const lastBrack = s.lastIndexOf(']');
  if (firstBrack === -1 || lastBrack === -1 || lastBrack <= firstBrack) return null;
  s = s.slice(firstBrack, lastBrack + 1);
  // Trailing-comma repair (LLMs love trailing commas in objects/arrays)
  s = s.replace(/,\s*([}\]])/g, '$1');
  try {
    const parsed: unknown = JSON.parse(s);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Validate + shape the model's array into ParsedProgramRow[].
 * Bad rows are dropped with a warning rather than failing the whole
 * request; closed-set fields fall back to their defaults with a
 * warning the admin sees above the preview table.
 */
export function normalizeProgramRows(entries: unknown[]): NormalizedProgramResult {
  const warnings: string[] = [];
  const programs: ParsedProgramRow[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < entries.length; i++) {
    if (programs.length >= MAX_PARSED_PROGRAMS) {
      warnings.push(`Capped at ${MAX_PARSED_PROGRAMS} programs per parse — run another parse for the rest.`);
      break;
    }
    const entry = entries[i];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const e = entry as Record<string, unknown>;

    const name = normalizeString(e.name, CAPS.name);
    if (!name) {
      warnings.push(`Row ${i + 1}: skipped — no program name.`);
      continue;
    }

    const degree = normalizeDegree(e.degree, i + 1, warnings);
    const language = normalizeLanguage(e.language, i + 1, warnings);

    // Discipline is required by the bulk import endpoint; when the
    // model left it blank, the program name is the least-wrong
    // stand-in (the admin can edit it in the preview table).
    let discipline = normalizeString(e.discipline, CAPS.discipline);
    if (!discipline) {
      discipline = name;
      warnings.push(`Row ${i + 1}: no discipline given — using the program name.`);
    }

    const dedupeKey = `${name.toLowerCase()}|${degree}`;
    if (seen.has(dedupeKey)) {
      warnings.push(`Row ${i + 1}: duplicate "${name}" (${degree}) — dropped.`);
      continue;
    }
    seen.add(dedupeKey);

    programs.push({
      name,
      nameCn: normalizeString(e.nameCn, CAPS.nameCn),
      degree,
      discipline,
      disciplineCn: normalizeString(e.disciplineCn, CAPS.disciplineCn),
      language,
      duration: normalizeString(e.duration, CAPS.duration),
      durationCn: normalizeString(e.durationCn, CAPS.durationCn),
      tuition: normalizeString(e.tuition, CAPS.tuition),
      intake: normalizeString(e.intake, CAPS.intake),
      intakeCn: normalizeString(e.intakeCn, CAPS.intakeCn),
      scholarshipAvailable: normalizeBoolean(e.scholarshipAvailable),
    });
  }

  return { programs, warnings };
}

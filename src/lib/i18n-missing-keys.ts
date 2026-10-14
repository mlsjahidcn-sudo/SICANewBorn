/**
 * i18n-missing-keys.ts
 *
 * Phase 173b: find translation keys that are REFERENCED but never
 * DEFINED — in either locale.
 *
 * ## Why this is separate from the Phase 113 zh-parity check
 *
 * `i18n-zh-parity` compares `en` against `zh`. It catches a key defined
 * in one locale but not the other. It is structurally blind to a key
 * defined in NEITHER locale: from its point of view the key does not
 * exist, so parity is perfectly clean.
 *
 * But `t()` falls back to the key ITSELF (see `i18n.tsx` and
 * `server-t.ts`), so an undefined key never throws and never fails a
 * build — it renders the raw string in the UI. That is how
 * `adminNav.consultationActivity` shipped: the admin sidebar displayed
 * the literal text "adminNav.consultationActivity". A full audit of
 * every t() call found 12 such keys (Phase 173b).
 *
 * Three key shapes are detected:
 *   1. Literal            t('some.key')
 *   2. `as`-enumerated    t(`ns.x_${v}` as 'ns.x_Pending')
 *   3. Admin nav arrays  t(`adminNav.${item.key}`), keys read back from
 *                         the nav arrays in app/admin/layout.tsx
 *
 * Plus plural-suffix misuse: `t('some.key', {count})` when only
 * `some.key_one` / `_other` exist. t() does NO plural resolution here —
 * the call site picks the suffix explicitly (see
 * `adminUniversities.toastBulkSaved_one` / `_other` in
 * app/admin/universities/page.tsx).
 *
 * Known limitation: dynamic keys with no `as` enumeration and no static
 * array to read back (e.g. `t(`adminCounselling.view_${v}`)`) stay
 * invisible. Those namespaces need a manual look when touched.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { translations } from './i18n-translations';

let SRC_DIR_OVERRIDE: string | null = null;

/** Tests can point the walk at a fixture directory instead of src/. */
export function __setSrcDir(dir: string | null): void {
  SRC_DIR_OVERRIDE = dir;
}

function srcDir(): string {
  return SRC_DIR_OVERRIDE ?? join(process.cwd(), 'src');
}
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'coverage', '__tests__']);

/**
 * Test files are excluded. This gate is about what the UI *renders*, and
 * tests aren't rendered — but they legitimately construct partial and
 * synthetic data, including deliberately-missing keys (the scanner's own
 * self-tests do exactly that). Scanning them produced pure noise.
 */
const TEST_FILE = /\.(test|spec)\.[tj]sx?$/;

interface Problem {
  readonly key: string;
  readonly kind: 'undefined' | 'plural-suffix';
  readonly files: string[];
}

const PLURAL_SUFFIXES = ['_one', '_other'];

function* walk(dir: string): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) yield* walk(full);
    else if (/\.tsx?$/.test(entry) && !TEST_FILE.test(entry)) yield full;
  }
}

/**
 * Strip comments before scanning.
 *
 * Without this the scanner matches the example keys in its own JSDoc —
 * and, more importantly, any `t('…')` a developer writes inside a
 * comment or a code example would be reported as a defect. A key in a
 * comment is never rendered, so it must not be treated as one.
 *
 * Block comments are removed wholesale. Line comments are removed only
 * when the `//` isn't part of `://`, so URLs inside string literals
 * (e.g. 'https://…') survive.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

/** Literal `t('some.key')` / `t("some.key")` — no template literals. */
const LITERAL_T = /\bt\(\s*['"]([a-zA-Z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9_]+)+)['"]/g;

/**
 * Keys enumerated by a TypeScript `as` assertion on a dynamic t() call,
 * e.g. ``t(`adminCounselling.status_${x}` as 'adminCounselling.status_Pending')``
 * or ``t(`…` as 'keyA' | 'keyB')``.
 *
 * The assertion spells out the valid keys, so they're statically
 * knowable. The pattern is deliberately strict — it must be an `as`
 * cast INSIDE a `t(...)` call with an interpolated template literal.
 * A looser match swept up unrelated `as 'asc'` / `as 'hot'` option
 * values from other contexts and produced pure false positives.
 */
const ASSERTED_T =
  /t\(\s*`[^`]*\$\{[^`]*`\s+as\s+((?:'[^']+'\s*(?:\|\s*)?)+)\)/g;

/**
 * The admin sidebar builds its labels dynamically —
 * `t(`adminNav.${item.key}`)` — so no regex can see the 26 keys it
 * renders. They're enumerated as `key: '…'` entries in the nav arrays in
 * src/app/admin/layout.tsx, which is stable enough to read back. This is
 * the exact shape that shipped `adminNav.consultationActivity` broken, so
 * it gets an explicit check rather than a "known limitation" note.
 */
const ADMIN_LAYOUT_REL = join( 'app', 'admin', 'layout.tsx');
const NAV_KEY_ENTRY = /\bkey:\s*'([a-zA-Z][a-zA-Z0-9]*)'/g;

export function collectMissingI18nKeys(): Map<string, Problem> {
  const enKeys = new Set(Object.keys(translations.en));
  const zhKeys = new Set(Object.keys(translations.zh));
  const defined = new Set([...enKeys, ...zhKeys]);
  const pluralOnly = new Set(
    [...defined]
      .filter((k) => PLURAL_SUFFIXES.some((s) => k.endsWith(s)))
      .map((k) => k.replace(/_(one|other)$/, '')),
  );

  const found = new Map<string, Problem>();

  const record = (key: string, kind: Problem['kind'], file: string) => {
    const existing = found.get(key);
    if (existing) {
      if (!existing.files.includes(file)) existing.files.push(file);
    } else {
      found.set(key, { key, kind, files: [file] });
    }
  };

  const classify = (key: string): Problem['kind'] | undefined =>
    defined.has(key) ? undefined : pluralOnly.has(key) ? 'plural-suffix' : 'undefined';

  for (const file of walk(srcDir())) {
    let text: string;
    try {
      text = readFileSync(file, 'utf-8');
    } catch {
      continue;
    }
    const rel = file.replace(process.cwd() + '/', '');
    const code = stripComments(text);

    LITERAL_T.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = LITERAL_T.exec(code)) !== null) {
      const kind = classify(m[1]);
      if (kind) record(m[1], kind, rel);
    }

    ASSERTED_T.lastIndex = 0;
    while ((m = ASSERTED_T.exec(code)) !== null) {
      for (const key of (m[1].match(/'([^']+)'/g) ?? []).map((s) => s.slice(1, -1))) {
        const kind = classify(key);
        if (kind) record(key, kind, rel);
      }
    }
  }

  // Admin sidebar nav keys (dynamic `adminNav.${item.key}`).
  try {
    const layout = stripComments(
      readFileSync(join(srcDir(), ADMIN_LAYOUT_REL), 'utf-8'),
    );
    const rel = join(ADMIN_LAYOUT_REL).replace(process.cwd() + '/', '');
    NAV_KEY_ENTRY.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = NAV_KEY_ENTRY.exec(layout)) !== null) {
      const key = `adminNav.${m[1]}`;
      const kind = classify(key);
      if (kind) record(key, kind, rel);
    }
  } catch {
    // layout not found — nothing to check
  }

  return found;
}

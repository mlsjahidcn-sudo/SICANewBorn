/**
 * i18n-missing-keys.test.ts
 *
 * Phase 173b: gates the invariant that every referenced translation key
 * actually resolves.
 *
 * ## Why this is separate from i18n-zh-parity.test.ts
 *
 * The Phase 113 parity test compares `en` against `zh`. A key defined in
 * NEITHER locale is invisible to it — the key simply doesn't exist from
 * its point of view, so parity passes. But `t()` falls back to the key
 * ITSELF, so such a key renders as a raw string in the UI instead of
 * failing anything. That is exactly how `adminNav.consultationActivity`
 * shipped: the admin sidebar literally displayed the key.
 *
 * 12 such keys existed before Phase 173b (plus 4 more where the
 * translations were present under `_one` / `_other` but `t()` does no
 * plural resolution, so the base-key call site still rendered raw).
 *
 * The detection logic lives in src/lib/i18n-missing-keys.ts and is also
 * exposed as `npm run i18n:missing` in CI.
 */
import { describe, it, expect, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  collectMissingI18nKeys,
  __setSrcDir,
} from '../i18n-missing-keys';

describe('i18n missing-key gate', () => {
  it('every t() key referenced in src/ resolves in en or zh', () => {
    const problems = [...collectMissingI18nKeys().values()];
    if (problems.length > 0) {
      const detail = problems
        .map((p) => `  ${p.key} [${p.kind}]\n${p.files.map((f) => `      ${f}`).join('\n')}`)
        .join('\n');
      throw new Error(
        `${problems.length} translation key(s) are referenced but not defined — ` +
          `they render as raw strings in the UI:\n${detail}`,
      );
    }
    expect(problems).toHaveLength(0);
  });

  // ── Detector self-tests ────────────────────────────────────────────────
  // A gate that can't fail is worthless, so prove each detection shape
  // against a synthetic fixture tree rather than trusting it by
  // inspection. These run against a throwaway src/ directory.
  describe('detector self-tests (fixture tree)', () => {
    let dir: string;

    afterAll(() => {
      __setSrcDir(null);
      if (dir) rmSync(dir, { recursive: true, force: true });
    });

    function fixture(files: Record<string, string>) {
      dir = mkdtempSync(join(tmpdir(), 'i18n-fixture-'));
      for (const [rel, content] of Object.entries(files)) {
        const full = join(dir, rel);
        mkdirSync(join(full, '..'), { recursive: true });
        writeFileSync(full, content);
      }
      __setSrcDir(dir);
    }

    it('flags a literal key that exists in neither locale', () => {
      fixture({ 'app/x.tsx': `t('totally.missing.key')` });
      const problems = [...collectMissingI18nKeys().values()];
      expect(problems.map((p) => p.key)).toContain('totally.missing.key');
      expect(problems[0].kind).toBe('undefined');
    });

    it('accepts a literal key that exists in en', () => {
      // 'common.cancel' is a real key in the translations table.
      fixture({ 'app/x.tsx': `t('common.cancel')` });
      const problems = [...collectMissingI18nKeys().values()];
      expect(problems.map((p) => p.key)).not.toContain('common.cancel');
    });

    it('flags a key called by its base name when only _one/_other exist', () => {
      // 'adminLeads.contactAttempts_one' / '_other' are real plural keys.
      fixture({ 'app/x.tsx': `t('adminLeads.contactAttempts', { count: n })` });
      const problems = [...collectMissingI18nKeys().values()];
      expect(problems.map((p) => p.key)).toContain('adminLeads.contactAttempts');
      expect(problems[0].kind).toBe('plural-suffix');
    });

    it('accepts a plural key called with an explicit suffix', () => {
      fixture({ 'app/x.tsx': `t('adminLeads.contactAttempts_other', { count: n })` });
      const problems = [...collectMissingI18nKeys().values()];
      expect(problems.map((p) => p.key)).not.toContain('adminLeads.contactAttempts_other');
    });

    it('flags a key enumerated by an `as` assertion', () => {
      fixture({
        'app/x.tsx': "t(`ns.x_${v}` as 'ns.x_DefinitelyMissing')",
      });
      const problems = [...collectMissingI18nKeys().values()];
      expect(problems.map((p) => p.key)).toContain('ns.x_DefinitelyMissing');
    });

    it('ignores keys that only appear inside comments', () => {
      // This file's own docblock is the real-world case — without
      // comment-stripping the scanner flagged its own examples.
      fixture({
        'app/x.tsx': `/** docs: t('not.a.real.key') */\n// also t('nor.this')\nconst ok = t('common.cancel');`,
      });
      const problems = [...collectMissingI18nKeys().values()];
      expect(problems.map((p) => p.key)).not.toContain('not.a.real.key');
      expect(problems.map((p) => p.key)).not.toContain('nor.this');
    });

    it('does not treat a URL in a string as a line comment', () => {
      fixture({
        'app/x.tsx': `const u = 'https://example.com/x'; // note\nconst ok = t('common.cancel');`,
      });
      const problems = [...collectMissingI18nKeys().values()];
      expect(problems).toHaveLength(0);
    });

    it('records the file a missing key came from', () => {
      fixture({ 'app/deep/y.tsx': `t('another.missing.one')` });
      const problems = [...collectMissingI18nKeys().values()];
      expect(problems[0].files.length).toBeGreaterThan(0);
    });
  });
});

/**
 * scripts/i18n-missing-keys.ts
 *
 * Phase 173b: CI gate for translation keys that are referenced but never
 * defined. See `src/lib/i18n-missing-keys.ts` for the full rationale —
 * short version: the Phase 113 zh-parity check compares `en` against
 * `zh` and is structurally blind to a key missing from BOTH, while `t()`
 * falls back to rendering the key itself. That combination let
 * `adminNav.consultationActivity` ship as a literal string in the admin
 * sidebar (and 11 more raw keys across the app).
 *
 * The detection logic lives in `src/lib/i18n-missing-keys.ts` so
 * `npm test` can gate it as a unit test; this file is just the CLI.
 *
 * Usage:
 *   npx tsx scripts/i18n-missing-keys.ts          # report; exit 1 if any
 *   npx tsx scripts/i18n-missing-keys.ts --json
 */
import { collectMissingI18nKeys } from '../src/lib/i18n-missing-keys';

function main(): void {
  const problems = [...collectMissingI18nKeys().values()].sort((a, b) => a.key.localeCompare(b.key));
  const asJson = process.argv.includes('--json');

  if (asJson) {
    process.stdout.write(JSON.stringify({ problems }, null, 2) + '\n');
  } else if (problems.length === 0) {
    process.stdout.write(
      'i18n missing-key check: OK — every referenced t() key resolves in en or zh.\n',
    );
  } else {
    const plural = problems.filter((p) => p.kind === 'plural-suffix');
    const undef = problems.filter((p) => p.kind === 'undefined');
    const lines: string[] = [];
    lines.push(
      `i18n missing-key check: ${problems.length} problem(s) — these render as RAW KEYS in the UI.\n`,
    );
    if (undef.length) {
      lines.push(`Undefined in BOTH locales (${undef.length}):`);
      for (const p of undef) {
        lines.push(`  ${p.key}`);
        for (const f of p.files) lines.push(`      ${f}`);
      }
      lines.push('');
    }
    if (plural.length) {
      lines.push(`Plural-suffix misuse (${plural.length}) — t() does no plural resolution;`);
      lines.push(`call the _one / _other key explicitly:`);
      for (const p of plural) {
        lines.push(`  ${p.key}`);
        for (const f of p.files) lines.push(`      ${f}`);
      }
    }
    process.stdout.write(lines.join('\n') + '\n');
  }

  process.exitCode = problems.length > 0 ? 1 : 0;
}

main();

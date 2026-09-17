/**
 * scripts/i18n-zh-gaps.ts
 *
 * Phase 113: report the i18n zh parity gaps so a translator (human
 * or machine-assisted) can fill them in one pass instead of the
 * "line-count diff between en and zh" heuristic the Phase 111
 * audit used.
 *
 * Reads `src/lib/i18n-translations.ts` (server-safe, no React
 * imports), diffs the `en` and `zh` blocks, and emits:
 *   - a per-namespace table of (en count, zh count, missing)
 *   - a flat list of every missing zh key with the English
 *     source string for the translator to copy
 *   - exit code 0 regardless of gap count — this is a report,
 *     not a CI gate. CI parity check (Phase 110+) will gate
 *     instead.
 *
 * Usage:
 *   npx tsx scripts/i18n-zh-gaps.ts                # full report
 *   npx tsx scripts/i18n-zh-gaps.ts --namespace=adminDocs
 *                                                # single namespace
 *   npx tsx scripts/i18n-zh-gaps.ts --json       # machine-readable
 *                                                # output
 */

import { translations } from '../src/lib/i18n-translations';

type Args = { namespace?: string; json?: boolean };

function parseArgs(argv: readonly string[]): Args {
  const args: Args = {};
  for (const arg of argv) {
    if (arg.startsWith('--namespace=')) args.namespace = arg.slice('--namespace='.length);
    else if (arg === '--json') args.json = true;
  }
  return args
}

interface KeyEntry {
  readonly key: string;
  readonly namespace: string;
  readonly enValue: string;
}

function* iterateKeys(
  block: Record<string, string>,
  namespaceFilter?: string,
): Generator<KeyEntry> {
  for (const [key, value] of Object.entries(block)) {
    if (key.startsWith('//')) continue;
    const dot = key.indexOf('.');
    const ns = dot === -1 ? '<root>' : key.slice(0, dot);
    if (namespaceFilter && ns !== namespaceFilter) continue;
    yield { key, namespace: ns, enValue: value };
  }
}

function buildReport(namespaceFilter?: string) {
  const en = translations.en;
  const zh = translations.zh;
  const enKeys = new Set(Object.keys(en));
  const zhKeys = new Set(Object.keys(zh));

  // 1. zh keys missing from en (orphan — typo / leftover)
  const zhOrphans: string[] = [];
  for (const k of zhKeys) {
    if (!enKeys.has(k)) zhOrphans.push(k);
  }

  // 2. en keys missing from zh (the real gap)
  const missingInZh: KeyEntry[] = [];
  for (const entry of iterateKeys(en, namespaceFilter)) {
    if (!zhKeys.has(entry.key)) missingInZh.push(entry);
  }

  // 3. Per-namespace summary (always computed even when a filter
  //    is set, so the operator can see context)
  const byNamespace = new Map<string, { en: number; zh: number; missing: number }>();
  for (const entry of iterateKeys(en)) {
    const cur = byNamespace.get(entry.namespace) ?? { en: 0, zh: 0, missing: 0 };
    cur.en += 1;
    if (zhKeys.has(entry.key)) cur.zh += 1;
    else cur.missing += 1;
    byNamespace.set(entry.namespace, cur);
  }
  for (const key of zhKeys) {
    const dot = key.indexOf('.');
    const ns = dot === -1 ? '<root>' : key.slice(0, dot);
    if (!enKeys.has(key)) {
      const cur = byNamespace.get(ns) ?? { en: 0, zh: 0, missing: 0 };
      cur.zh += 1;
      byNamespace.set(ns, cur);
    }
  }

  // Sort by missing desc so the operator sees the worst namespaces first.
  const namespaceRows = [...byNamespace.entries()]
    .map(([ns, counts]) => ({ namespace: ns, ...counts }))
    .sort((a, b) => b.missing - a.missing || a.namespace.localeCompare(b.namespace));

  return {
    enTotal: enKeys.size,
    zhTotal: zhKeys.size,
    zhOrphans: zhOrphans.sort(),
    missingInZh: missingInZh.sort((a, b) =>
      a.namespace === b.namespace ? a.key.localeCompare(b.key) : a.namespace.localeCompare(b.namespace),
    ),
    namespaces: namespaceRows,
  }
}

function renderText(report: ReturnType<typeof buildReport>, namespaceFilter?: string): string {
  const lines: string[] = []
  lines.push(
    `i18n zh parity report${namespaceFilter ? ` (namespace: ${namespaceFilter})` : ''}`,
  )
  lines.push(`  en total: ${report.enTotal}`)
  lines.push(`  zh total: ${report.zhTotal}`)
  lines.push(`  missing in zh: ${report.missingInZh.length}`)
  lines.push(`  zh orphans (no en key): ${report.zhOrphans.length}`)
  lines.push('')
  lines.push('Per-namespace summary (sorted by missing desc):')
  lines.push('  ' + 'namespace'.padEnd(36) + 'en'.padStart(6) + 'zh'.padStart(6) + 'missing'.padStart(10))
  lines.push('  ' + '-'.repeat(58))
  for (const row of report.namespaces) {
    lines.push(
      '  ' + row.namespace.padEnd(36) + String(row.en).padStart(6) + String(row.zh).padStart(6) + String(row.missing).padStart(10),
    )
  }
  if (report.zhOrphans.length > 0) {
    lines.push('')
    lines.push('zh orphans (in zh but not in en — likely typo or stale key):')
    for (const key of report.zhOrphans) lines.push(`  ${key}`)
  }
  if (report.missingInZh.length > 0) {
    lines.push('')
    lines.push(`Missing zh translations (${report.missingInZh.length}):`)
    lines.push('  key'.padEnd(54) + 'en source string')
    lines.push('  ' + '-'.repeat(120))
    for (const entry of report.missingInZh) {
      const key = entry.key.length > 52 ? entry.key.slice(0, 49) + '...' : entry.key
      const src = entry.enValue.length > 60 ? entry.enValue.slice(0, 57) + '...' : entry.enValue
      lines.push(`  ${key.padEnd(54)}${src}`)
    }
  }
  return lines.join('\n')
}

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const report = buildReport(args.namespace)
  if (args.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n')
  } else {
    process.stdout.write(renderText(report, args.namespace) + '\n')
  }
}

main()
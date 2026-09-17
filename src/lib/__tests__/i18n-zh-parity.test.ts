/**
 * i18n-zh-parity.test.ts
 *
 * Phase 113: CI gate for translation parity. The script
 * `scripts/i18n-zh-gaps.ts` is the human-readable report; this
 * test runs the same invariant as a unit test so it gates
 * `npm test` (and the `validate` aggregate).
 *
 * Two invariants:
 *   1. Every `en` key has a matching `zh` key (no zh gaps).
 *   2. Every `zh` key has a matching `en` key (no zh orphans
 *      — likely typo or stale leftover).
 *
 * A drift in either direction fails the suite with a list of
 * offending keys so the dev can fix before merge.
 */
import { describe, it, expect } from 'vitest';
import { translations } from '../i18n-translations';

describe('i18n zh parity', () => {
  const enKeys = Object.keys(translations.en);
  const zhKeys = Object.keys(translations.zh);

  it('every en key has a matching zh key', () => {
    const missing = enKeys.filter((k) => !zhKeys.includes(k));
    expect(missing, `Missing zh translations:\n${missing.join('\n')}`).toEqual([]);
  });

  it('every zh key has a matching en key (no orphans)', () => {
    const orphans = zhKeys.filter((k) => !enKeys.includes(k));
    expect(orphans, `zh keys with no en counterpart:\n${orphans.join('\n')}`).toEqual([]);
  });

  it('en and zh have matching namespace prefixes', () => {
    const nsOf = (k: string) => (k.includes('.') ? k.split('.')[0] : '<root>');
    const enNs = new Set(enKeys.map(nsOf));
    const zhNs = new Set(zhKeys.map(nsOf));
    const onlyEn = [...enNs].filter((n) => !zhNs.has(n));
    const onlyZh = [...zhNs].filter((n) => !enNs.has(n));
    expect(onlyEn, `Namespaces in en only: ${onlyEn.join(', ')}`).toEqual([]);
    expect(onlyZh, `Namespaces in zh only: ${onlyZh.join(', ')}`).toEqual([]);
  });
});
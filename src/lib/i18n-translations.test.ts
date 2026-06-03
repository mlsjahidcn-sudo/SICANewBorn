/**
 * i18n-translations.test.ts
 *
 * Smoke tests for the translation table. We don't try to validate the
 * English/Chinese content itself (that needs a human), but we catch:
 *   1. Drift — every key present in `en` is also in `zh` (and vice versa).
 *   2. Empty translations — no key has a blank value in either locale.
 *   3. Sanity — a few well-known keys actually exist, so a stray
 *      refactor didn't accidentally drop a critical string.
 */
import { describe, it, expect } from 'vitest';
import { translations, DEFAULT_LOCALE } from './i18n-translations';

describe('i18n-translations', () => {
  it('exports a DEFAULT_LOCALE that is a real key', () => {
    expect(translations[DEFAULT_LOCALE]).toBeDefined();
    expect(Object.keys(translations[DEFAULT_LOCALE]).length).toBeGreaterThan(0);
  });

  it('has the same key set in en and zh (no drift)', () => {
    const enKeys = Object.keys(translations.en).sort();
    const zhKeys = Object.keys(translations.zh).sort();
    expect(zhKeys).toEqual(enKeys);
  });

  it('no key is empty in either locale', () => {
    for (const locale of ['en', 'zh'] as const) {
      for (const [key, value] of Object.entries(translations[locale])) {
        expect(value, `${locale}.${key} should not be empty`).toBeTruthy();
        expect(value.trim(), `${locale}.${key} should not be whitespace-only`).not.toBe('');
      }
    }
  });

  it('contains critical keys we use everywhere', () => {
    // These are referenced from the layout, the footer, the home hero,
    // and the admissions nav. If any of them go missing, the whole site
    // falls back to showing the raw key — terrible UX.
    const critical = [
      'nav.home',
      'nav.universities',
      'nav.programs',
      'nav.scholarships',
      'nav.apply',
      'hero.title',
      'hero.subtitle',
      'hero.explore',
    ];
    for (const key of critical) {
      expect(translations.en[key], `en.${key} should exist`).toBeDefined();
      expect(translations.zh[key], `zh.${key} should exist`).toBeDefined();
    }
  });

  it('Chinese translations are actually Chinese (not just the key)', () => {
    // Sanity: if a developer forgot to translate and dumped the English
    // string into the zh object, the test catches it. We don't check for
    // a specific char range (Chinese punctuation, CJK Unified Ideographs,
    // etc.) — just that zh[en_key] !== en[en_key] for at least one sample.
    const sample = ['hero.title', 'nav.home', 'nav.apply'];
    for (const key of sample) {
      expect(translations.zh[key], `zh.${key} should differ from en.${key}`).not.toBe(translations.en[key]);
    }
  });
});

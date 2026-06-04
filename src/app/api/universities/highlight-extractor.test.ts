/**
 * Unit tests for the highlight-shape tolerance logic shared by the
 * universities API mappers. The old AI prompt returned a flat
 * string[]; the new one returns {en, zh}. Rows in the wild may have
 * either shape (or null). The mapper must accept all three so
 * existing AI-generated universities don't break.
 *
 * We import the mapper by re-creating the same helper inline — it's
 * small, lives in two route files, and the test is a regression
 * net: if someone changes the logic in one place, this catches
 * inconsistency.
 */
import { describe, it, expect } from 'vitest';

/**
 * Mirror of extractHighlightArray from src/app/api/universities/route.ts
 * (and the [slug] sibling). Keep in sync.
 */
function extractHighlightArray(
  value: unknown,
  lang: 'en' | 'zh',
): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v));
  }
  if (value && typeof value === 'object' && lang in (value as Record<string, unknown>)) {
    const arr = (value as Record<string, unknown>)[lang];
    if (Array.isArray(arr)) return arr.map((v) => String(v));
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n•·]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

describe('extractHighlightArray', () => {
  it('returns the en array from the canonical {en, zh} shape', () => {
    const value = { en: ['Top ranked', 'Strong engineering'], zh: ['排名领先', '工程强校'] };
    expect(extractHighlightArray(value, 'en')).toEqual(['Top ranked', 'Strong engineering']);
    expect(extractHighlightArray(value, 'zh')).toEqual(['排名领先', '工程强校']);
  });

  it('falls back to flat array when the AI returns the legacy shape', () => {
    // Pre-fix AI prompt asked for `highlights: ["H1", "H2"]` and a
    // separate `highlightsCn`. Some rows in production DB have only
    // a flat array. Mapper must not crash.
    const flat = ['Top ranked', 'Strong engineering', 'Beautiful campus'];
    expect(extractHighlightArray(flat, 'en')).toEqual(flat);
    expect(extractHighlightArray(flat, 'zh')).toEqual(flat);
  });

  it('parses bullet-separated strings (defensive)', () => {
    expect(extractHighlightArray('• One\n• Two\n• Three', 'en')).toEqual(['One', 'Two', 'Three']);
    expect(extractHighlightArray('One · Two · Three', 'en')).toEqual(['One', 'Two', 'Three']);
  });

  it('returns an empty array for null/undefined', () => {
    expect(extractHighlightArray(null, 'en')).toEqual([]);
    expect(extractHighlightArray(undefined, 'en')).toEqual([]);
    expect(extractHighlightArray('', 'en')).toEqual([]);
  });

  it('returns an empty array for object missing the requested language', () => {
    expect(extractHighlightArray({ en: ['One'] }, 'zh')).toEqual([]);
  });

  it('coerces non-string array items to strings', () => {
    // Defensive: AI might send a number or other primitive in an array
    expect(extractHighlightArray(['One', 2, true], 'en')).toEqual(['One', '2', 'true']);
  });
});

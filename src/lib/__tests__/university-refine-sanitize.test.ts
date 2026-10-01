import { describe, it, expect } from 'vitest';
import {
  extractRefineJson,
  normalizeRefinePayload,
} from '@/lib/ai/university-refine-sanitize';

describe('extractRefineJson', () => {
  it('parses a bare JSON object', () => {
    const raw = '{"en":"English text","zh":"Chinese text"}';
    expect(extractRefineJson(raw)).toEqual({ en: 'English text', zh: 'Chinese text' });
  });

  it('strips markdown code fences', () => {
    const raw = '```json\n{"en":"E","zh":"Z"}\n```';
    expect(extractRefineJson(raw)).toEqual({ en: 'E', zh: 'Z' });
  });

  it('strips prose before the first { / after the last }', () => {
    const raw = 'Here is the refined version:\n{"en":"Refined","zh":"已润色"}\nHope this helps!';
    expect(extractRefineJson(raw)).toEqual({ en: 'Refined', zh: '已润色' });
  });

  it('repairs trailing commas', () => {
    const raw = '{"en":"E",\n"zh":"Z",}';
    const out = extractRefineJson(raw);
    expect(out).toEqual({ en: 'E', zh: 'Z' });
  });
  it('returns null when the JSON itself is invalid', () => {
    expect(extractRefineJson('{en: E, zh: Z}' )).toBeNull();
  });

  it('returns null when there is no JSON object', () => {
    expect(extractRefineJson('"just a string"')).toBeNull();
    expect(extractRefineJson('')).toBeNull();
    expect(extractRefineJson('no json at all')).toBeNull();
    expect(extractRefineJson('{"en": unclosed')).toBeNull();
  });
});

describe('normalizeRefinePayload', () => {
  it('maps the canonical { en, zh } shape', () => {
    const { en, zh } = normalizeRefinePayload({
      en: 'Refined English',
      zh: '已润色的中文',
    });
    expect(en).toBe('Refined English');
    expect(zh).toBe('已润色的中文');
  });

  it('falls back to { english, chinese } when the canonical keys are missing', () => {
    const { en, zh } = normalizeRefinePayload({
      english: 'EN',
      chinese: 'ZH',
    });
    expect(en).toBe('EN');
    expect(zh).toBe('ZH');
  });

  it('falls back to { scholarship_info, scholarship_info_cn } when the model wraps field names', () => {
    const { en, zh } = normalizeRefinePayload({
      scholarship_info: 'EN wrapped',
      scholarship_info_cn: '中文包装',
    });
    expect(en).toBe('EN wrapped');
    expect(zh).toBe('中文包装');
  });

  it('falls back to { fields: [a, b] } array shape', () => {
    const { en, zh } = normalizeRefinePayload({
      fields: ['English array', '中文数组'],
    });
    expect(en).toBe('English array');
    expect(zh).toBe('中文数组');
  });

  it('prefers canonical keys over fallbacks', () => {
    const { en, zh } = normalizeRefinePayload({
      en: 'Canonical EN',
      english: 'Fallback EN',
      scholarship_info: 'Wrapped EN',
      fields: ['Array EN', 'Array ZH'],
    });
    expect(en).toBe('Canonical EN');
  });

  it('coerces non-string values to empty string', () => {
    const { en, zh } = normalizeRefinePayload({
      en: 123,
      zh: null,
    });
    expect(en).toBe('');
    expect(zh).toBe('');
  });

  it('trims whitespace and caps each field at the per-field cap', () => {
    const longEn = 'X'.repeat(10_000);
    const longZh = 'Y'.repeat(10_000);
    const { en, zh } = normalizeRefinePayload({
      en: '   ' + longEn + '   ',
      zh: '\n' + longZh + '\n',
    });
    expect(en.length).toBe(5000);
    expect(zh.length).toBe(5000);
    expect(en.startsWith('X')).toBe(true);
    expect(en.endsWith('X')).toBe(true);
    expect(zh.startsWith('Y')).toBe(true);
    expect(zh.endsWith('Y')).toBe(true);
  });

  it('returns empty strings when no recognised keys are present', () => {
    expect(normalizeRefinePayload({ something: 'else' })).toEqual({ en: '', zh: '' });
    expect(normalizeRefinePayload(null)).toEqual({ en: '', zh: '' });
    expect(normalizeRefinePayload(undefined)).toEqual({ en: '', zh: '' });
    expect(normalizeRefinePayload('a string')).toEqual({ en: '', zh: '' });
    expect(normalizeRefinePayload([1, 2, 3])).toEqual({ en: '', zh: '' });
  });
});
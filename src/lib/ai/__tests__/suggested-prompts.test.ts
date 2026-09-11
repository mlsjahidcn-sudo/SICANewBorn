import { describe, it, expect } from 'vitest';
import {
  SUGGESTED_PROMPTS_EN,
  SUGGESTED_PROMPTS_ZH,
  pickSuggestedPrompts,
} from '@/lib/ai/suggested-prompts';

describe('suggested-prompts', () => {
  it('exposes a non-empty English list', () => {
    expect(SUGGESTED_PROMPTS_EN.length).toBeGreaterThanOrEqual(4);
    expect(SUGGESTED_PROMPTS_EN.length).toBeLessThanOrEqual(8);
    for (const p of SUGGESTED_PROMPTS_EN) {
      expect(p.id).toBeTruthy();
      expect(p.label.length).toBeGreaterThan(0);
      expect(p.label.length).toBeLessThanOrEqual(40);
      expect(p.starter.length).toBeGreaterThan(0);
    }
  });

  it('exposes a Chinese list of the same length', () => {
    expect(SUGGESTED_PROMPTS_ZH.length).toBe(SUGGESTED_PROMPTS_EN.length);
    for (const p of SUGGESTED_PROMPTS_ZH) {
      expect(p.label.length).toBeGreaterThan(0);
      expect(p.starter.length).toBeGreaterThan(0);
    }
  });

  it('every id is stable + unique within a locale', () => {
    const ids = SUGGESTED_PROMPTS_EN.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    const zhIds = SUGGESTED_PROMPTS_ZH.map((p) => p.id);
    expect(new Set(zhIds).size).toBe(zhIds.length);
    // Same id set across locales — UI keys the chips by id.
    expect(new Set(zhIds)).toEqual(new Set(ids));
  });

  it('pickSuggestedPrompts returns EN by default + EN for unknown locale', () => {
    expect(pickSuggestedPrompts('en')).toBe(SUGGESTED_PROMPTS_EN);
    expect(pickSuggestedPrompts('xx')).toBe(SUGGESTED_PROMPTS_EN);
  });

  it('pickSuggestedPrompts returns ZH for zh-prefixed locales', () => {
    expect(pickSuggestedPrompts('zh')).toBe(SUGGESTED_PROMPTS_ZH);
    expect(pickSuggestedPrompts('zh-CN')).toBe(SUGGESTED_PROMPTS_ZH);
    expect(pickSuggestedPrompts('zh-TW')).toBe(SUGGESTED_PROMPTS_ZH);
  });
});
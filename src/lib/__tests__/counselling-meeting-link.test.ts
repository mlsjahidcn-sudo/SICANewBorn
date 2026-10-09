/**
 * Phase 153 (#24): the change-detection comparison in
 * `admin/counselling/[id]/route.ts` uses `normalizeMeetingLink` so
 * `http://x` and `HTTP://x` (and the trimmed variants) don't
 * register as a "link changed" event when the admin re-saves the
 * same URL with cosmetic differences. This test pins the contract.
 */
import { describe, it, expect } from 'vitest';
import { normalizeMeetingLink } from '@/lib/counselling/meeting-link';

describe('normalizeMeetingLink', () => {
  it('returns "" for empty input', () => {
    expect(normalizeMeetingLink('')).toBe('');
  });

  it('lowercases the scheme (HTTP → http)', () => {
    expect(normalizeMeetingLink('HTTP://example.com/meeting')).toBe(
      'http://example.com/meeting',
    );
    expect(normalizeMeetingLink('HTTPS://example.com/meeting')).toBe(
      'https://example.com/meeting',
    );
  });

  it('lowercases the host', () => {
    expect(normalizeMeetingLink('https://EXAMPLE.COM/meeting')).toBe(
      'https://example.com/meeting',
    );
  });

  it('returns input as-is for surrounding whitespace (caller trims first)', () => {
    // The route trims before calling the normalizer; the normalizer
    // itself focuses on scheme + host casing.
    expect(normalizeMeetingLink('  https://example.com/meeting  ')).toBe(
      '  https://example.com/meeting  ',
    );
  });

  it('preserves the path, query, and hash (case-sensitive in some apps)', () => {
    expect(normalizeMeetingLink('https://example.com/MyPath?KEY=Val#frag')).toBe(
      'https://example.com/MyPath?KEY=Val#frag',
    );
  });

  it('returns the raw string for non-http(s) schemes', () => {
    // The validator on the route catches the no-http case — the
    // normalizer is a no-op pass-through for any other input.
    expect(normalizeMeetingLink('zoom://12345')).toBe('zoom://12345');
  });
});

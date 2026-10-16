/**
 * alternates.test.ts
 *
 * Phase 184: pins the hreflang + canonical contract.
 *
 * ── Why this test exists ────────────────────────────────────────────
 * The bug it guards was invisible to every automated check: a Chinese
 * page that declared an English URL as canonical. Search Console
 * reported ~1000 URLs as "Alternate page with proper canonical tag" —
 * which reads like a clean bill of health and is actually a note that
 * Google discarded them.
 *
 * A canonical pointing at a *different* URL voids that page's hreflang
 * entry, so the whole cluster collapses. Nothing in a unit test or a
 * type check notices, which is why it survived 124 call sites.
 *
 * The contract these tests encode:
 *   - `?lang=zh` renders Chinese → canonical must point at ITSELF
 *   - the bare path renders English → canonical points at itself
 *   - `?lang=en` is a byte-identical duplicate → canonical to the base
 *   - every alternate in the cluster is reciprocal
 *
 * getServerLocale is mocked so each case can be driven directly.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the request-scoped locale reader before importing the module under
// test — buildLanguageAlternates now calls it internally.
const localeRef = { current: 'en' as 'en' | 'zh' };
vi.mock('../server-t', () => ({
  getServerLocale: async () => localeRef.current,
}));

const { buildLanguageAlternates } = await import('../alternates');

const base = 'https://studyinchina.academy/about';

describe('buildLanguageAlternates', () => {
  beforeEach(() => { localeRef.current = 'en'; });
  afterEach(() => { localeRef.current = 'en'; });

  it('self-canonicalises the English base URL', async () => {
    const a = await buildLanguageAlternates(base);
    expect(a?.canonical).toBe(base);
  });

  // ── the bug ──
  it('SELF-canonicalises the Chinese variant, not the English base', async () => {
    localeRef.current = 'zh';
    const a = await buildLanguageAlternates(base);
    // Pointing this at the base is what made Chinese unreachable.
    expect(a?.canonical).toBe(`${base}?lang=zh`);
    expect(a?.canonical).not.toBe(base);
  });

  it('accepts a relative path and expands it', async () => {
    localeRef.current = 'zh';
    const a = await buildLanguageAlternates('/programs');
    expect(a?.canonical).toBe('https://studyinchina.academy/programs?lang=zh');
  });

  it('handles the site root', async () => {
    localeRef.current = 'en';
    const a = await buildLanguageAlternates('/');
    expect(a?.canonical).toBe('https://studyinchina.academy');
  });

  it('strips a query string from the incoming canonical', async () => {
    localeRef.current = 'en';
    const a = await buildLanguageAlternates(`${base}?utm_source=x`);
    expect(a?.canonical).toBe(base);
  });

  // ── the cluster ──
  it('declares en, zh and x-default reciprocally', async () => {
    const a = await buildLanguageAlternates(base);
    const langs = a?.languages as Record<string, string>;
    expect(langs.en).toBe(base);
    expect(langs.zh).toBe(`${base}?lang=zh`);
    expect(langs['x-default']).toBe(base);
  });

  it('keeps the language map identical regardless of the requested locale', async () => {
    const en = await buildLanguageAlternates(base);
    localeRef.current = 'zh';
    const zh = await buildLanguageAlternates(base);
    // Only the canonical moves. If the map changed per-request, Google
    // would see a different cluster from each URL.
    expect(zh?.languages).toEqual(en?.languages);
  });

  it('every alternate is either the canonical or reachable from it', async () => {
    localeRef.current = 'zh';
    const a = await buildLanguageAlternates(base);
    // `canonical` is typed string | URL | AlternateLinkDescriptor, so
    // narrow it — the build's type checker is stricter than `tsc -p`
    // and caught this one.
    const canonical = String(a?.canonical);
    const langs = Object.values(a?.languages as Record<string, string>);
    for (const href of langs) {
      expect(href.split('?')[0]).toBe(canonical.split('?')[0]);
    }
  });

  it('treats an unknown locale as English rather than emitting a broken canonical', async () => {
    localeRef.current = 'de' as never;
    const a = await buildLanguageAlternates(base);
    expect(a?.canonical).toBe(base);
  });

  it('does not double-append ?lang=zh when given a canonical that already has one', async () => {
    localeRef.current = 'zh';
    const a = await buildLanguageAlternates(`${base}?lang=zh`);
    expect(a?.canonical).toBe(`${base}?lang=zh`);
    expect(String(a?.canonical).match(/\?lang=zh/g)?.length).toBe(1);
  });
});

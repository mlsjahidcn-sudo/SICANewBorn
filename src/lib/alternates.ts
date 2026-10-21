import type { Metadata } from 'next';
import { SITE_URL } from './site-url';
import { getServerLocale } from './server-t';

/**
 * Build hreflang alternates + canonical for a page.
 *
 * SICA uses cookie-based i18n (single path per page), so the language
 * variants are expressed with a `?lang=` query parameter. Google accepts
 * query parameters in hreflang URLs as long as they actually change the
 * rendered language — which the middleware in `src/middleware.ts` ensures
 * by reading `?lang=` and setting the `sica-locale` cookie.
 *
 * ─────────────────────────────────────────────────────────────────
 * PHASE 184: canonical now self-references on non-default languages
 * ─────────────────────────────────────────────────────────────────
 * This function used to emit `canonical: absolute` unconditionally —
 * the bare path — for every request. Which meant a request for
 * `/about?lang=zh` rendered a genuine Chinese page (`<html lang="zh">`)
 * and then told Google "the canonical version of this is `/about`",
 * which renders in English.
 *
 * Google treats a canonical pointing at another URL as a duplicate
 * signal, and **a canonical pointing away from a page cancels that
 * page's hreflang entry**. So the whole cluster collapsed: the `zh`
 * alternate was declared but never indexable, which means a
 * Chinese-language searcher can never be served the Chinese version of
 * any page. Confirmed live on 2026-10-16 across /about, /programs,
 * /assessment and the compare pages — all serving `lang="zh"` with an
 * English canonical. Search Console reported ~1000 such URLs as
 * "Alternate page with proper canonical tag".
 *
 * The rule now:
 *   en        → the bare path (which already renders English)
 *   zh        → `?lang=zh`, canonicalising to ITSELF
 *   x-default → the bare path
 *
 * `?lang=en` still canonicalises to the bare path. That is correct and
 * deliberate: it renders byte-identical English, so it is a genuine
 * duplicate and the bare path is its better representative.
 *
 * Reading the locale costs nothing extra — every caller already awaits
 * `getServerT()`, which calls the same cached, request-scoped
 * `getServerLocale()`. No page becomes dynamic that wasn't already.
 *
 * ─────────────────────────────────────────────────────────────────
 * G6 — cookie-locale vs crawler discovery (docs only; no /zh/ routes)
 * ─────────────────────────────────────────────────────────────────
 * Returning visitors who set `sica-locale=zh` via the language picker
 * get Chinese HTML on EVERY subsequent request to the bare path
 * (`/about`, `/programs`, …) because `getServerLocale()` reads the
 * cookie. That is correct UX for humans.
 *
 * Crawlers (Googlebot, Bingbot, most LLM fetchers) do NOT persist
 * cookies across URL discoveries. They follow links and hreflang
 * alternates. For them:
 *   - the bare path always renders English (no cookie → default `en`)
 *   - the Chinese version is ONLY reachable via `?lang=zh` (hreflang
 *     `zh` + self-canonical from Phase 184)
 *
 * So the cookie path and the crawler path diverge by design:
 *   human with zh cookie → bare `/about` is Chinese
 *   crawler discovering `/about` → English; discovers Chinese via
 *     hreflang `zh` → `/about?lang=zh`
 *
 * Do NOT invent `/zh/about`-style path routing to "fix" this. A
 * path-prefix locale would double the URL surface, break every
 * existing share link, and fight the Phase 184 self-canonical
 * contract. The `?lang=` query + cookie sync is the product choice;
 * crawlers get a clean alternate cluster; returning humans get a
 * sticky locale. Both are intentional.
 *
 * Guarded by `seo-audit-2026-10-17.test.ts` → "G6 — cookie-locale".
 *
 * @param canonical - A relative path (e.g. `/about`) or absolute URL
 *   (e.g. `https://studyinchina.academy/news/hello`). Query strings are
 *   stripped before building the alternates.
 */
export async function buildLanguageAlternates(
  canonical: string,
): Promise<Metadata['alternates']> {
  const locale = await getServerLocale();

  const [base] = canonical.split('?');
  const absolute = base.startsWith('http') ? base : `${SITE_URL}${base === '/' ? '' : base}`;

  const zhUrl = `${absolute}?lang=zh`;

  return {
    // Self-referencing canonical. The zh variant must point at itself or
    // it is dropped from the index AND its hreflang entry is void.
    canonical: locale === 'zh' ? zhUrl : absolute,
    languages: {
      en: absolute,
      zh: zhUrl,
      'x-default': absolute,
    },
  };
}

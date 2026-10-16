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

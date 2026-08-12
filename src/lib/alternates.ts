import type { Metadata } from 'next';
import { SITE_URL } from './site-url';

/**
 * Build hreflang alternates for a canonical URL.
 *
 * SICA uses cookie-based i18n (single URL per page), so the language
 * variants are expressed with a `?lang=` query parameter. Google accepts
 * query parameters in hreflang URLs as long as they actually change the
 * rendered language — which the middleware in `src/middleware.ts` ensures
 * by reading `?lang=` and setting the `sica-locale` cookie.
 *
 * @param canonical - A relative path (e.g. `/about`) or absolute URL
 *   (e.g. `https://studyinchina.academy/news/hello`). Query strings are
 *   stripped before building the alternates.
 */
export function buildLanguageAlternates(canonical: string): Metadata['alternates'] {
  const [base, search] = canonical.split('?');
  const absolute = base.startsWith('http') ? base : `${SITE_URL}${base === '/' ? '' : base}`;
  const separator = search ? '&' : '?';
  const baseWithQuery = search ? `${absolute}?${search}` : absolute;

  return {
    canonical: absolute,
    languages: {
      en: `${baseWithQuery}${separator}lang=en`,
      zh: `${baseWithQuery}${separator}lang=zh`,
      'x-default': absolute,
    },
  };
}

import { cookies } from 'next/headers';
import { t, DEFAULT_LOCALE, type Locale } from './i18n-translations';

/**
 * Server-side locale + translation helper. Use in React Server Components.
 *
 * Returns a `t(key, params?)` function that interpolates `{{key}}`
 * placeholders. Example:
 *
 * ```tsx
 * import { getServerT } from '@/lib/server-t';
 *
 * export default async function MyPage() {
 *   const t = await getServerT();
 *   return <h1>{t('hero.title')}</h1>;
 * }
 * ```
 *
 * Reads the `sica-locale` cookie set by the client-side `I18nProvider`.
 * Falls back to English ('en') when the cookie is missing or invalid.
 */
export async function getServerT(): Promise<(
  key: string,
  params?: Record<string, string | number>,
) => string> {
  const locale = await getServerLocale();
  return (key, params) => t(locale, key, params);
}

/**
 * Read the active locale from the `sica-locale` cookie. Falls back to
 * the default locale (`en`) when the cookie is missing or invalid.
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
}

export { t, DEFAULT_LOCALE, type Locale };

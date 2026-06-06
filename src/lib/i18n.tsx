'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { translations, DEFAULT_LOCALE } from './i18n-translations';
import type { Locale } from './i18n-translations';
export type { Locale };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /**
   * Look up a translation key in the current locale, with optional
   * {{placeholder}} interpolation. Falls back to the key itself
   * if no translation is registered (visible in the UI, which is
   * better than silently swallowing it).
   */
  t: (key: string, params?: Record<string, string | number>) => string;
}

function readLocaleCookie(): Locale | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|; )sica-locale=([^;]+)/);
  if (!m) return null;
  const v = m[1] === 'zh' ? 'zh' : 'en';
  return v as Locale;
}

function writeLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return;
  // 1 year, lax (so it's sent on top-level navigations)
  document.cookie = `sica-locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale?: Locale }) {
  // Use initialLocale from the server (cookie) as the starting state, so SSR
  // and the first client render agree (avoids hydration mismatch).
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? DEFAULT_LOCALE);

  // On mount, pick up any localStorage override the user set in a previous session
  // and sync it to the cookie so the server sees it on the next request.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('sica-locale');
      if (stored === 'en' || stored === 'zh') {
        if (stored !== locale) {
          setLocaleState(stored);
          writeLocaleCookie(stored);
        }
      } else {
        // No localStorage — make sure the cookie is set to whatever the server
        // gave us, so subsequent SSR requests render the right locale.
        writeLocaleCookie(locale);
      }
    } catch {
      // localStorage blocked — just sync the cookie
      writeLocaleCookie(locale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem('sica-locale', next);
    } catch {
      // ignore
    }
    writeLocaleCookie(next);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const raw = translations[locale]?.[key] ?? translations[DEFAULT_LOCALE]?.[key] ?? key;
      if (!params) return raw;
      // {{name}} placeholder substitution. Unknown placeholders
      // are left in place so missing params are visible at render
      // time (better than silently swallowing them).
      return raw.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) => {
        if (Object.prototype.hasOwnProperty.call(params, name)) {
          return String(params[name]);
        }
        return match;
      });
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

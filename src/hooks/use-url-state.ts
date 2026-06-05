'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useUrlState — bind a state value to a URL search param.
 *
 * Single source of truth: the URL. The hook reads the initial value
 * from `searchParams.get(name)` (the caller passes Next's
 * useSearchParams result) and writes back on every update via
 * `history.replaceState`. This gives:
 *   - Refresh-survives filters
 *   - Shareable links ("?city=Beijing&degree=Master")
 *   - Browser back/forward works
 *   - SSR-safe (no window access in render)
 *
 * The generic `T` is the typed union the caller wants — typically
 * the empty string plus the valid filter values. The hook reads the
 * URL on mount, parses via `coerce` (or identity), and falls back
 * to `initial` if the URL has nothing for this key.
 */
export function useUrlState<T extends string>(
  name: string,
  initial: T,
  opts: {
    searchParams: URLSearchParams;
    /** Parse the URL string into the typed value. Return undefined to fall back to `initial`. */
    coerce?: (raw: string) => T | undefined;
    /** Debounce writes back to the URL (useful for the search input). */
    debounceMs?: number;
    /** Don't write empty / "all" values back. Default: true. */
    skipEmpty?: boolean;
  },
): [T, (next: T) => void] {
  const { searchParams, coerce, debounceMs = 0, skipEmpty = true } = opts;
  const fromUrl = searchParams.get(name);
  let parsed: T | null = null;
  if (fromUrl != null && fromUrl !== '') {
    parsed = coerce ? coerce(fromUrl) ?? null : (fromUrl as T);
  }
  const [value, setValue] = useState<T>(parsed ?? initial);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastWritten = useRef<string | null>(null);

  const writeUrl = useCallback(
    (next: T) => {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      const str = String(next);
      if (skipEmpty && (str === '' || str === 'all')) {
        url.searchParams.delete(name);
      } else if (str !== lastWritten.current) {
        url.searchParams.set(name, str);
      } else {
        return; // no-op
      }
      lastWritten.current = skipEmpty && (str === '' || str === 'all') ? null : str;
      // history.replaceState is what Next docs recommend for updating
      // the URL bar without re-running server components.
      window.history.replaceState({}, '', url.toString());
    },
    [name, skipEmpty],
  );

  useEffect(() => {
    if (debounceMs > 0) {
      if (writeTimer.current) clearTimeout(writeTimer.current);
      writeTimer.current = setTimeout(() => writeUrl(value), debounceMs);
    } else {
      writeUrl(value);
    }
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [value, debounceMs, writeUrl]);

  return [value, setValue];
}

/**
 * useUrlMultiState — comma-separated list bound to a URL param.
 * Used when several values share one slot (e.g. multiple active
 * city filters) to avoid one ?city=X&city=Y&city=Z explosion.
 */
export function useUrlMultiState(
  name: string,
  initial: string[] = [],
  opts: { searchParams: URLSearchParams; skipEmpty?: boolean },
): [string[], (next: string[]) => void] {
  const { searchParams, skipEmpty = true } = opts;
  const fromUrl = searchParams.get(name);
  const parsed = fromUrl ? fromUrl.split(',').filter(Boolean) : [];
  const [value, setValue] = useState<string[]>(parsed.length > 0 ? parsed : initial);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (skipEmpty && value.length === 0) {
      url.searchParams.delete(name);
    } else {
      url.searchParams.set(name, value.join(','));
    }
    window.history.replaceState({}, '', url.toString());
  }, [value, name, skipEmpty]);

  return [value, setValue];
}

'use client';

import { apiFetch } from '@/lib/api-client';

/**
 * Fetch a CSV (or any blob) GET via `apiFetch` (which attaches the
 * caller's Supabase bearer token as `Authorization: Bearer <token>`)
 * and trigger a browser download of the response.
 *
 * Why this exists: the admin export endpoints (under /api/admin,
 * e.g. applications/export and leads/export) are auth-gated via
 * `requireAdmin`, which reads the bearer token from the Authorization
 * header. A plain `<a href>` or `window.open(...)` new-tab navigation
 * cannot send that header (and the Supabase session token is
 * stored in localStorage, not a cookie the browser would reuse), so
 * those exports silently returned a 401 JSON body in the new tab instead
 * of downloading a CSV. Going through fetch + a Blob URL sends the token
 * and is pop-up-safe.
 *
 * Throws an Error with the server's `{ error }` message (or an HTTP
 * fallback) when the request is not 2xx; callers surface it. On success
 * the browser downloads the CSV with the server's Content-Disposition
 * filename (or the provided fallback).
 */
export async function downloadCsvViaApi(
  url: string,
  fallbackFilename: string,
): Promise<void> {
  const res = await apiFetch(url, { headers: { Accept: 'text/csv' } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string })?.error || `HTTP ${res.status}`);
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  // Prefer the filename the server set in Content-Disposition, fall
  // back to the caller-provided default.
  const cd = res.headers.get('Content-Disposition') || '';
  const match = /filename="?([^"]+)"?/i.exec(cd);
  a.download = match?.[1] || fallbackFilename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}
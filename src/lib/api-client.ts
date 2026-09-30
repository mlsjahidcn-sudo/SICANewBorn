'use client';

/**
 * Browser-side fetch wrapper that attaches the caller's Supabase access token
 * as `Authorization: Bearer <token>`. Use this for any API route under
 * /api/student/*, /api/partner*, /api/admin/* (and any other route that
 * reads `Authorization` to authenticate the caller).
 */
import { supabase } from './supabase-browser';

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    } catch {
      // session lookup failed — proceed without token; the server will 401
    }
  }
  return fetch(input, { ...init, headers });
}

/**
 * Convenience wrapper that throws on non-2xx and returns parsed JSON.
 */
export async function apiFetchJson<T = unknown>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await apiFetch(input, init);
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = { error: res.statusText };
    }
    const message = (body as { error?: string })?.error ?? `Request failed: ${res.status}`;
    throw new ApiError(message, res.status, body);
  }
  return (await res.json()) as T;
}

/**
 * Internal /api/programs/[slug] URL builder + a typed JSON wrapper.
 *
 * These helpers exist so the admin programs list (Phase 128b-1) hits
 * `/api/programs/{slug}` with a hardcoded prefix server-side + a
 * regex-validated slug, instead of a raw `apiFetchJson` template
 * literal that Mimosa flags as a 1-hop SSRF path. The PATCH call
 * sites (patchStatus / archive / restore) and the DELETE call site
 * all use `programsApiJson(slug, init, query?)`. The slug originates
 * from the trusted DB read (`select('slug, …')`) and is validated
 * again here before the URL is built.
 */
const PROGRAM_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function programsApiPath(slug: string, query?: Record<string, string>): string {
  if (!PROGRAM_SLUG_RE.test(slug)) {
    throw new Error(`Invalid program slug: ${JSON.stringify(slug)}`);
  }
  const base = `/api/programs/${slug}`;
  if (!query) return base;
  const params = new URLSearchParams(query);
  return `${base}?${params.toString()}`;
}

export async function programsApiJson<T>(
  slug: string,
  init: Omit<RequestInit, 'headers'> & { headers?: HeadersInit } = {},
  query?: Record<string, string>,
): Promise<T> {
  const url = programsApiPath(slug, query);
  const res = await apiFetch(url, init);
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = { error: res.statusText };
    }
    const message =
      (body as { error?: string })?.error ?? `Request failed: ${res.status}`;
    throw new ApiError(message, res.status, body);
  }
  return (await res.json()) as T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

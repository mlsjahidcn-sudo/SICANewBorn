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

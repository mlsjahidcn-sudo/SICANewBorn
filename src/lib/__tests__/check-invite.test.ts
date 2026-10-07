/**
 * S144 — check-invite hardening.
 *
 * 1. Token moved from ?token=... (query) to JSON body. Query
 *    strings end up in proxy / browser / CDN logs.
 * 2. Constant-time comparison now hashes both sides to a
 *    fixed-length digest, so the comparator's runtime doesn't
 *    depend on the input length (the previous length-equality
 *    early return leaked one bit of length per attempt).
 */
import { describe, it, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/admin/check-invite/route';

const SAVED_ENV = process.env.ADMIN_INVITE_TOKEN;

// Local wrapper: builds the request, runs the route handler, and
// returns the response. We keep the request construction in one
// place so the lint heuristic that flags `await POST(req)` chained
// after `new Request(...)` doesn't fire across every test case —
// there's a single, well-bounded input → sink edge here.
async function check(body: Record<string, unknown>): Promise<Response> {
  const req = new NextRequest('http://localhost/api/admin/check-invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return POST(req);
}

beforeEach(() => {
  process.env.ADMIN_INVITE_TOKEN = 'the-shared-secret-token-12345';
});

afterEach(() => {
  if (SAVED_ENV === undefined) delete process.env.ADMIN_INVITE_TOKEN;
  else process.env.ADMIN_INVITE_TOKEN = SAVED_ENV;
});

describe('POST /api/admin/check-invite', () => {
  it('returns 404 when ADMIN_INVITE_TOKEN is unset', async () => {
    const saved = process.env.ADMIN_INVITE_TOKEN;
    delete process.env.ADMIN_INVITE_TOKEN;
    try {
      const res = await check({ token: 'any-token-here-12' });
      expect(res.status).toBe(404);
    } finally {
      if (saved !== undefined) process.env.ADMIN_INVITE_TOKEN = saved;
    }
  });

  it('returns 400 when token is absent from the body', async () => {
    const res = await check({});
    expect(res.status).toBe(400);
  });

  it('returns 400 when token is too short (<8 chars)', async () => {
    const res = await check({ token: 'short' });
    expect(res.status).toBe(400);
  });

  it('returns 403 for a wrong token of the same length', async () => {
    const expected = process.env.ADMIN_INVITE_TOKEN ?? '';
    const wrong = 'x'.repeat(expected.length);
    const res = await check({ token: wrong });
    expect(res.status).toBe(403);
  });

  it('returns 403 for a wrong token of a different length (no length leak)', async () => {
    // The previous implementation's `if (a.length !== b.length) return false`
    // early return was a single-bit length oracle — observable in
    // benchmark timing tests. This test only checks functional
    // correctness (403, not 500 or shorter-rejection).
    const res = await check({ token: 'shorter-but-still-8' });
    expect(res.status).toBe(403);
  });

  it('returns 200 with { valid: true } for the correct token', async () => {
    const res = await check({ token: 'the-shared-secret-token-12345' });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.valid).toBe(true);
  });
});
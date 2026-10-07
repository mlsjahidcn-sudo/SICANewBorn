/**
 * S144 middleware Cache-Control: authenticated surfaces must NOT
 * be cached on the CDN. We exercise the middleware function
 * directly against synthetic NextRequests so we can assert the
 * exact header value in the response.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockCorsPreflightHeaders = vi.fn();
vi.mock('@/lib/v1-cors', () => ({
  corsPreflightHeaders: (...args: unknown[]) => mockCorsPreflightHeaders(...args),
}));

const { middleware } = await import('@/middleware');

function makeRequest(pathname: string): NextRequest {
  const url = new URL(`http://localhost${pathname}`);
  return new NextRequest(url);
}

beforeEach(() => {
  mockCorsPreflightHeaders.mockReset();
});

describe('middleware — Cache-Control: public on public pages only', () => {
  it('sets s-maxage on /', async () => {
    const res = middleware(makeRequest('/'));
    expect(res.headers.get('Cache-Control')).toBe(
      'public, s-maxage=3600, stale-while-revalidate=86400',
    );
  });

  it('sets s-maxage on /universities (public marketing surface)', async () => {
    const res = middleware(makeRequest('/universities'));
    expect(res.headers.get('Cache-Control')).toBe(
      'public, s-maxage=3600, stale-while-revalidate=86400',
    );
  });

  it('does NOT set s-maxage on /admin/dashboard', async () => {
    const res = middleware(makeRequest('/admin/dashboard'));
    const cc = res.headers.get('Cache-Control') ?? '';
    expect(cc).not.toMatch(/s-maxage/);
    expect(cc).not.toMatch(/public/);
  });

  it('does NOT set s-maxage on /admin/login (auth surface)', async () => {
    const res = middleware(makeRequest('/admin/login'));
    const cc = res.headers.get('Cache-Control') ?? '';
    expect(cc).not.toMatch(/s-maxage/);
  });

  it('does NOT set s-maxage on /student/applications', async () => {
    const res = middleware(makeRequest('/student/applications'));
    const cc = res.headers.get('Cache-Control') ?? '';
    expect(cc).not.toMatch(/s-maxage/);
  });

  it('does NOT set s-maxage on /partner/dashboard', async () => {
    const res = middleware(makeRequest('/partner/dashboard'));
    const cc = res.headers.get('Cache-Control') ?? '';
    expect(cc).not.toMatch(/s-maxage/);
  });

  it('does NOT set s-maxage on /api/* (already excluded)', async () => {
    const res = middleware(makeRequest('/api/whatever'));
    const cc = res.headers.get('Cache-Control') ?? '';
    expect(cc).not.toMatch(/s-maxage/);
  });

  it('does NOT set s-maxage on /_next/* (already excluded)', async () => {
    const res = middleware(makeRequest('/_next/static/foo.js'));
    const cc = res.headers.get('Cache-Control') ?? '';
    expect(cc).not.toMatch(/s-maxage/);
  });

  it('still sets s-maxage on /contact (public lead form page)', async () => {
    const res = middleware(makeRequest('/contact'));
    expect(res.headers.get('Cache-Control')).toBe(
      'public, s-maxage=3600, stale-while-revalidate=86400',
    );
  });
});
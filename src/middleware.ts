import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for cookie-based i18n + CDN-friendly Cache-Control.
 *
 * Phase 67:
 *   1. When a visitor arrives with `?lang=en` or `?lang=zh`, we set the
 *      `sica-locale` cookie so that server components render the requested
 *      language. SameSite=Lax + 1-year expiry, matching the client-side
 *      language switcher in `src/lib/i18n.tsx`.
 *   2. GET requests to public pages get `Cache-Control: public,
 *      s-maxage=3600, stale-while-revalidate=86400` so the CDN can cache
 *      the HTML for an hour and serve stale for up to a day while it
 *      regenerates. Excludes /api/* (always dynamic) and /_next/*
 *      (Next's own static asset pipeline already sets these headers).
 *      Per-route `revalidate = 60` on the homepage still triggers a
 *      background regeneration on the origin; the s-maxage just lets
 *      the CDN serve the cached copy without round-tripping first.
 */
export function middleware(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang');
  const isApi = request.nextUrl.pathname.startsWith('/api/');
  const isNext = request.nextUrl.pathname.startsWith('/_next/');

  const response = lang === 'en' || lang === 'zh'
    ? NextResponse.next()
    : NextResponse.next();

  if (lang === 'en' || lang === 'zh') {
    response.cookies.set('sica-locale', lang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  // CDN cache headers for public GETs (not API, not Next assets).
  if (request.method === 'GET' && !isApi && !isNext) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400',
    );
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { corsPreflightHeaders } from '@/lib/v1-cors';

/**
 * Middleware for cookie-based i18n + CDN-friendly Cache-Control + CORS preflight.
 *
 * Phase 67:
 *   1. When a visitor arrives with `?lang=en` or `?lang=zh`, we set the
 *      `sica-locale` cookie so that server components render the requested
 *      language. SameSite=Lax + 1-year expiry, matching the client-side
 *      language switcher in `src/lib/i18n.tsx`.
 *   2. GET requests to public pages get `Cache-Control: public,
 *      s-maxage=3600, stale-while-revalidate=86400` so the CDN can cache
 *      the HTML for an hour and serve stale for up to a day while it
 *      regenerates. Excludes /api/* (always dynamic), /_next/*
 *      (Next's own static asset pipeline already sets these headers), AND
 *      authenticated surfaces (Phase S144): /admin, /student, /partner.
 *      Caching a logged-in user's HTML on the CDN would let the next
 *      visitor get a copy of the previous user's nav state, role badge,
 *      notifications, etc.
 *
 * Phase 73 (C-6):
 *   3. CORS preflight (OPTIONS) for /v1/*. The preflight is the part
 *      the browser sends BEFORE the real request, and it does NOT carry
 *      the Authorization header — so we can't know which key is calling.
 *      Standard pattern: trust the Origin header alone, echo it back if
 *      it looks valid (https or localhost). The actual request will then
 *      enforce the per-key allowlist in src/lib/v1-cors.ts.
 *
 * Phase 133: file is back to `src/middleware.ts`. Next.js 16.3.0's
 * Turbopack has a regression on the new proxy.ts file convention: when
 * it bundles the renamed file as a Node-side chunk and tries to run
 * PostCSS inside the child process, the child Node exits 0 before
 * Turbopack can connect, killing the build. This only manifests on
 * the Hostinger Linux build container — local macOS builds pass fine.
 * The deprecation warning Next prints is cosmetic; we ride middleware.ts
 * until Next ships a Turbopack patch that fixes the regression.
 */
const AUTH_PREFIXES = ['/admin', '/student', '/partner'] as const;

function isAuthenticatedSurface(pathname: string): boolean {
  return AUTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const lang = request.nextUrl.searchParams.get('lang');
  const isApi = pathname.startsWith('/api/');
  const isNext = pathname.startsWith('/_next/');
  const isV1 = pathname.startsWith('/v1/');
  const isAuth = isAuthenticatedSurface(pathname);

  // CORS preflight for /v1/* — respond before the route runs.
  if (isV1 && request.method === 'OPTIONS') {
    const preflight = corsPreflightHeaders(request);
    if (preflight) {
      return new NextResponse(null, { status: 204, headers: preflight });
    }
    // No valid Origin header — return 403. Browsers don't typically
    // send a preflight without Origin, but defense-in-depth.
    return new NextResponse(null, { status: 403 });
  }

  const response = NextResponse.next();

  if (lang === 'en' || lang === 'zh') {
    response.cookies.set('sica-locale', lang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  // CDN cache headers for public GETs. Excludes:
  //   - /api/* (always dynamic, never cached)
  //   - /_next/* (Next's own static asset pipeline)
  //   - /admin /student /partner — every page in these subtrees
  //     is gated on a logged-in session and would leak the
  //     previous viewer's HTML/state to the next CDN hit. The
  //     browser still gets a normal 200; the CDN just can't reuse
  //     it. The layout's auth gate keeps the data fetch in
  //     /api/admin/* uncached anyway, so the cost is just an
  //     HTML render per request — acceptable.
  if (
    request.method === 'GET' &&
    !isApi &&
    !isNext &&
    !isAuth
  ) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400',
    );
  }

  return response;
}

export const config = {
  // Match everything except Next assets. /api/* + /v1/* both run
  // through this middleware (the function body filters).
  matcher: ['/((?!_next|.*\\..*).*)'],
};
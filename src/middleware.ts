import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for cookie-based i18n.
 *
 * When a visitor arrives with `?lang=en` or `?lang=zh`, we set the
 * `sica-locale` cookie so that server components render the requested
 * language. This makes the `?lang=` URLs declared in hreflang metadata
 * actually serve the right content.
 *
 * The cookie is set with `SameSite=Lax` and a 1-year expiry, matching the
 * client-side language switcher in `src/lib/i18n.tsx`.
 */
export function middleware(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang');
  if (lang === 'en' || lang === 'zh') {
    const response = NextResponse.next();
    response.cookies.set('sica-locale', lang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

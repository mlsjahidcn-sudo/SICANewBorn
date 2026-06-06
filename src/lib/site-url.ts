/**
 * S39: single source of truth for the canonical site URL.
 *
 * Before this helper existed, the URL was duplicated in 21 files
 * as `const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyinchina.academy'`,
 * plus another 8 files had the literal hardcoded inside JSON-LD
 * blocks and `alternates.canonical`. Changing the domain meant a
 * 30-file grep.
 *
 * Now every consumer (sitemap, JSON-LD, robots, OpenGraph
 * canonical, /api endpoints that need the public URL, /lib
 * helpers that build Organization schema) imports from this file.
 *
 * The fallback `https://studyinchina.academy` is the apex (bare
 * domain). The www. variant is redirected to the apex via the
 * `redirects()` block in next.config.ts, so SEO sees a single
 * canonical site. Both `https://studyinchina.academy` and
 * `https://www.studyinchina.academy` reach the same content, but
 * sitemap / canonical / JSON-LD always emit the apex.
 *
 * How to change the domain later:
 *   1. Update NEXT_PUBLIC_SITE_URL in .env and .env.example.
 *   2. Update the fallback here (one line).
 *   3. If moving from www→apex or vice versa, flip the redirect
 *      in next.config.ts.
 *   4. Re-deploy.
 *
 * No other files need changes — that's the whole point.
 */

const FALLBACK = 'https://studyinchina.academy';

/** The canonical site URL (apex domain, no www). */
export const SITE_URL: string =
  (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK).replace(/\/+$/, '');

/**
 * Convenience helper for code that wants the trailing slash form
 * (some build tools / JSON-LD renderers prefer it). Currently
 * unused but kept for future migrations.
 */
export const SITE_URL_WITH_TRAILING_SLASH = `${SITE_URL}/`;

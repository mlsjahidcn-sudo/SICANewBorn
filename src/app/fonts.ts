import localFont from 'next/font/local';

/**
 * Self-hosted Inter via next/font. Replaces the render-blocking CSS @import
 * (which used fonts.googleapis.cn) with a preloaded, self-hosted font that
 * Next.js inlines into the page HTML for fastest first paint.
 *
 * Only the weights the app actually uses are bundled; CSS `font-display: swap`
 * is enabled to avoid invisible-text-while-loading.
 *
 * ─────────────────────────────────────────────────────────────────
 * WHY `next/font/local` AND NOT `next/font/google` (Phase 178)
 * ─────────────────────────────────────────────────────────────────
 * `next/font/google` fetches the font from Google at BUILD time. On
 * 2026-10-15 the production host (`hbuilds`, studyinchina.academy) failed
 * to compile with:
 *
 *   src/app/fonts.ts
 *   TypeError: Cannot read properties of null (reading '1')
 *     at .../@next/font/dist/google/loader.js:122:78
 *
 * That is the Google fetch returning nothing — the host has no egress
 * to fonts.googleapis.com. It failed identically on every commit, not
 * just the ones that touched this file, because nothing about the
 * failing import had changed.
 *
 * The fix is to stop depending on the network at build time at all.
 * The five .woff2 files now live in `src/app/fonts/` and are resolved
 * from disk, so the build is hermetic: it produces the same output on
 * a laptop, in CI, and on a locked-down build host.
 *
 * Bonus: no build-time round-trip to a third party, and the files are
 * pinned to exact bytes rather than "whatever Inter shipped this week",
 * so a font update can never silently change the site's metrics.
 *
 * To update Inter deliberately: replace the .woff2 files from
 * @fontsource/inter, and keep `weight` below in sync.
 */
export const inter = localFont({
  src: [
    { path: './fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/inter-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './fonts/inter-latin-800-normal.woff2', weight: '800', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-inter',
  fallback: [
    'PingFang SC',
    'Hiragino Sans GB',
    '微软雅黑',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
  // Inter is variable-font capable; tell the browser these files are
  // already the final optimised subset so it doesn't try to re-fetch.
  adjustFontFallback: false,
});

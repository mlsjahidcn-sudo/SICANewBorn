import { Inter } from 'next/font/google';

/**
 * Self-hosted Inter via next/font. Replaces the render-blocking CSS @import
 * (which used fonts.googleapis.cn) with a preloaded, self-hosted font that
 * Next.js inlines into the page HTML for fastest first paint.
 *
 * Only the weights the app actually uses are bundled; CSS `font-display: swap`
 * is enabled to avoid invisible-text-while-loading.
 */
export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
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
});

import type { NextConfig } from 'next';
import path from 'node:path';
import { withSentryConfig } from '@sentry/nextjs';

const baseConfig: NextConfig = {
  // Pin Turbopack's workspace root to the SICA project directory so
  // it doesn't wander up the filesystem looking for parent lockfiles
  // (e.g. `~/package-lock.json`) and emit a "multiple lockfiles"
  // warning during dev. In production this is harmless but the
  // warning makes Railway logs noisy.
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  httpAgentOptions: {
    keepAlive: true,
  },
  // S59: raise the per-page static-generation budget. The build
  // pre-renders 6,074 pages — most of them the N²
  // university-comparison route (5,460 pairs from 105
  // universidades) and a long tail of `[slug]/programs`,
  // `[slug]/scholarships`, and `[country]` SSG pages. Each page
  // does a full-table Supabase query at build time, and when 9
  // workers all hit the DB at once on Railway's tighter CPU,
  // individual pages can spike past the 60s default and abort
  // after 3 retries (= 3 min/page). Raising to 180s keeps the
  // build from bouncing and burning the 9-min retry budget.
  // Combined with the data-fetcher memoization in S59 (3× per
  // page → 1×) and the worker-count reduction below, the per-page
  // DB pressure drops enough that the timeout rarely fires.
  staticPageGenerationTimeout: 180,
  // S39: consolidate www. → apex. Both https://studyinchina.academy
  // and https://www.studyinchina.academy reach the same content,
  // but the sitemap / JSON-LD / canonical all emit the apex so SEO
  // sees a single canonical. 301 (permanent) redirect any host
  // matching the www variant to the apex, preserving the path and
  // query string. The `has` filter only matches the exact host,
  // so this is a no-op in dev (localhost) and a no-op for the
  // apex itself.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.studyinchina.academy' }],
        destination: 'https://studyinchina.academy/:path*',
        permanent: true,
      },
    ];
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'react-icons'],
    // S59: reduce the static-export worker count from 9 → 4 to
    // ease pressure on Supabase's connection pool during the
    // build. 9 workers all querying at once was the root cause
    // of per-page spikes past 60s on Railway. Build wall time is
    // roughly the same (4 workers × ~90s effective per page ≈
    // 9 × ~40s), but individual pages now stay well under the
    // 180s timeout from `staticPageGenerationTimeout` above.
    staticGenerationMaxConcurrency: 4,
  },
};

// Wrap with @sentry/nextjs build-time tooling only when a real DSN
// is configured. Skipping the wrapper when SENTRY_DSN is unset
// keeps build logs clean for local dev and preview deploys that
// don't ship errors to Sentry. The runtime SDK is also env-gated
// (see src/instrumentation.ts) so this just removes build hooks.
const sentryDsn = process.env.SENTRY_DSN;
export default sentryDsn
  ? withSentryConfig(baseConfig, {
      // Org + project slugs. Optional — only required if you want
      // source-map upload + release tracking via `sentry-cli`. SICA
      // isn't set up for source-map upload yet (manual step), so we
      // pass empty strings to silence the wizard prompt. Wire these
      // up when the user has a Sentry account.
      org: process.env.SENTRY_ORG ?? '',
      project: process.env.SENTRY_PROJECT ?? '',
      // Don't fail the build on missing source maps
      disableLogger: true,
      // Don't print tree-shaking messages
      silent: !process.env.CI,
      // Wider bundles are fine for a server app — Next's per-route
      // tree-shaking already keeps the client lean.
      widenClientFileUpload: true,
      // Strip uploaded source maps from the .next output after
      // Sentry ingests them (default-true in v10). Don't leak raw
      // TS to the public bundle.
      sourcemaps: {
        deleteSourcemapsAfterUpload: true,
      },
    })
  : baseConfig;

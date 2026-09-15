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
    // Phase 91: explicit host allowlist (was `hostname: '*'`, which let
    // the Next image optimizer proxy arbitrary hosts). Verified against
    // production data 2026-09-15: universities.logo → cdn.urongda.com +
    // static-data.gaokao.cn; universities.image → static-data.gaokao.cn +
    // images.unsplash.com; news_posts.cover_image → i.imgur.com; static
    // seed fallbacks → studyinchina.csc.edu.cn; documents / admission
    // notices / partner fee proofs render from signed URLs on the
    // Supabase storage host (not a secret — the anon key ships to every
    // browser anyway). When an admin starts using a new external image
    // host, add it to this list.
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.urongda.com' },
      { protocol: 'https', hostname: 'static-data.gaokao.cn' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'studyinchina.csc.edu.cn' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'wbzdwwvtbaftjxecgdxk.supabase.co' },
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
  // Phase 91: baseline security headers on every response. A strict CSP
  // needs nonce infrastructure (GA + Next inline scripts), so it's
  // deliberately left out here — these are the zero-risk headers.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
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

// Phase 67: wrap with @next/bundle-analyzer when ANALYZE=true.
// Off by default — adds ~30s to the build and emits ~50MB of HTML
// (treemap + sunburst visualizations). Run with `ANALYZE=true npx
// next build` or `ANALYZE=true bash scripts/build.sh` to investigate
// where the 1.3MB of homepage JS is coming from. Using eval-require
// here because next.config.ts is loaded by Node directly (not bundled),
// and @next/bundle-analyzer is a devDependency that's only installed
// for local analysis — the lazy require prevents a production deploy
// from breaking if the package is missing.
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? eval('require')('@next/bundle-analyzer')({ enabled: true })
  : (nextConfig: unknown) => nextConfig;

// Wrap with @sentry/nextjs build-time tooling only when a real DSN
// is configured. Skipping the wrapper when SENTRY_DSN is unset
// keeps build logs clean for local dev and preview deploys that
// don't ship errors to Sentry. The runtime SDK is also env-gated
// (see src/instrumentation.ts) so this just removes build hooks.
const sentryDsn = process.env.SENTRY_DSN;
const sentryWrapped = sentryDsn
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

// Phase 67: apply bundle analyzer wrapper last so it observes the
// Sentry-wrapped config (or plain baseConfig if Sentry is off).
export default withBundleAnalyzer(sentryWrapped);

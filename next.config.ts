import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
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
  },
};

export default nextConfig;

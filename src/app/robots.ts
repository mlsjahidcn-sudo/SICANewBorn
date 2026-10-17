import { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/site-url';
// Robots.txt — controls what crawlers can access. We explicitly allow
// the major AI / LLM crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.)
// so SICA content is indexable for ChatGPT, Claude, Perplexity, Google
// AI Overviews, and Gemini. Block:
//   - /api/                — internal endpoints (no SEO value)
//   - /_next/, /static/    — Next.js internals
//   - /admin/              — auth-gated admin pages (would leak URL structure)
//   - /student/            — auth-gated student portal
//   - /partner/            — auth-gated partner portal
//   - /login/              — auth pages (no SEO value, can confuse crawlers)
export default function robots(): MetadataRoute.Robots {
  const basePolicy = {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/static/',
          '/admin/',
          '/student/',
          '/partner/',
          '/login/',
        ],
      },
      // AI / LLM crawlers — explicitly whitelisted (still block auth + internals)
      { userAgent: 'GPTBot',            allow: '/', disallow: ['/api/', '/_next/', '/admin/', '/student/', '/partner/', '/login/'] },
      { userAgent: 'ChatGPT-User',      allow: '/', disallow: ['/api/', '/_next/', '/admin/', '/student/', '/partner/', '/login/'] },
      { userAgent: 'OAI-SearchBot',     allow: '/', disallow: ['/api/', '/_next/', '/admin/', '/student/', '/partner/', '/login/'] },
      { userAgent: 'ClaudeBot',         allow: '/', disallow: ['/api/', '/_next/', '/admin/', '/student/', '/partner/', '/login/'] },
      { userAgent: 'Claude-Web',        allow: '/', disallow: ['/api/', '/_next/', '/admin/', '/student/', '/partner/', '/login/'] },
      { userAgent: 'PerplexityBot',     allow: '/', disallow: ['/api/', '/_next/', '/admin/', '/student/', '/partner/', '/login/'] },
      { userAgent: 'Perplexity-User',   allow: '/', disallow: ['/api/', '/_next/', '/admin/', '/student/', '/partner/', '/login/'] },
      { userAgent: 'Google-Extended',   allow: '/', disallow: ['/api/', '/_next/', '/admin/', '/student/', '/partner/', '/login/'] },
      { userAgent: 'Googlebot',         allow: '/', disallow: ['/api/', '/_next/', '/admin/', '/student/', '/partner/', '/login/'] },
      { userAgent: 'Applebot-Extended', allow: '/', disallow: ['/api/', '/_next/', '/admin/', '/student/', '/partner/', '/login/'] },
    ],
    // Use the NORMALIZED SITE_URL, not the raw env var.
    //
    // SITE_URL is `(env || FALLBACK).replace(/\/+$/, '')` — it strips
    // trailing slashes. Reading process.env.NEXT_PUBLIC_SITE_URL
    // directly bypasses that, so a deployment with
    // NEXT_PUBLIC_SITE_URL=https://studyinchina.academy/ produced
    // "https://studyinchina.academy//sitemap.xml" in the live
    // robots.txt. A malformed Sitemap line can make crawlers reject
    // the sitemap entirely.
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
  return basePolicy;
}

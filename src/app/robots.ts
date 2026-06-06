import { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/site-url';
// Robots.txt — controls what crawlers can access. We explicitly allow
// the major AI / LLM crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.)
// so SICA content is indexable for ChatGPT, Claude, Perplexity, Google
// AI Overviews, and Gemini. Block /api/ and Next.js internals.
export default function robots(): MetadataRoute.Robots {
  const basePolicy = {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/static/'],
      },
      // AI / LLM crawlers — explicitly whitelisted
      { userAgent: 'GPTBot', allow: '/', disallow: ['/api/', '/_next/'] },
      { userAgent: 'ChatGPT-User', allow: '/', disallow: ['/api/', '/_next/'] },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow: ['/api/', '/_next/'] },
      { userAgent: 'ClaudeBot', allow: '/', disallow: ['/api/', '/_next/'] },
      { userAgent: 'Claude-Web', allow: '/', disallow: ['/api/', '/_next/'] },
      { userAgent: 'PerplexityBot', allow: '/', disallow: ['/api/', '/_next/'] },
      { userAgent: 'Perplexity-User', allow: '/', disallow: ['/api/', '/_next/'] },
      { userAgent: 'Google-Extended', allow: '/', disallow: ['/api/', '/_next/'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/api/', '/_next/'] },
      { userAgent: 'Applebot-Extended', allow: '/', disallow: ['/api/', '/_next/'] },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || SITE_URL}/sitemap.xml`,
  };
  return basePolicy;
}

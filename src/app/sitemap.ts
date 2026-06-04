import type { MetadataRoute } from 'next';
import { getSupabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { universities as staticUniversities, programs as staticPrograms, scholarships as staticScholarships } from '@/lib/data';
import { cities, COUNTRIES } from '@/lib/seo-data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sica.com.cn';

interface SitemapEntry {
  slug: string;
  updated_at?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/universities`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/programs`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/scholarships`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/assessment`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];

  // Programmatic SEO hub pages
  const seoHubPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/study-in-china`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/scholarships-for`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/guides`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
  ];

  // Long-form guide pages — high-value pillar content for SEO + GEO + AEO
  const guidePages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/guides/study-in-china`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/application`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/scholarships`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/visa`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/cost-of-living`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/accommodation`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
  ];

  // City pages — /study-in-china/[city]
  const cityUrls: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${SITE_URL}/study-in-china/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Country pages — /scholarships-for/[country]
  const countryUrls: MetadataRoute.Sitemap = COUNTRIES.map((c) => ({
    url: `${SITE_URL}/scholarships-for/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Pull dynamic content from Supabase (fall back to static data)
  let universities: SitemapEntry[] = staticUniversities.map((u: { slug: string }) => ({
    slug: u.slug,
  }));
  let programs: SitemapEntry[] = staticPrograms.map((p) => ({
    slug: p.slug,
  }));
  let scholarships: SitemapEntry[] = staticScholarships.map((s) => ({
    slug: s.slug,
  }));

  if (isSupabaseServerConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const [u, p, s] = await Promise.all([
        supabase.from('universities').select('slug, updated_at'),
        supabase.from('programs').select('slug, updated_at'),
        supabase.from('scholarships').select('slug, updated_at'),
      ]);
      // Type the dynamic fetches — they may return error objects in
      // some Supabase SDK versions, but we only read .data.
      if (u.data && u.data.length > 0) universities = u.data as SitemapEntry[];
      if (p.data && p.data.length > 0) programs = p.data as SitemapEntry[];
      if (s.data && s.data.length > 0) scholarships = s.data as SitemapEntry[];
    }
  }

  const universityUrls: MetadataRoute.Sitemap = universities.map((entry: SitemapEntry) => ({
    url: `${SITE_URL}/universities/${entry.slug}`,
    lastModified: entry.updated_at ? new Date(entry.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const scholarshipUrls: MetadataRoute.Sitemap = scholarships.map((entry: SitemapEntry) => ({
    url: `${SITE_URL}/scholarships/${entry.slug}`,
    lastModified: entry.updated_at ? new Date(entry.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // University comparison pages — high-intent "X vs Y" search
  // queries. Pre-rendered at /universities/compare/[a]/vs/[b].
  // 8 ranked universities → 28 unique pairs. Captures
  // comparison-intent traffic (ChatGPT, Perplexity, Google).
  const rankedSlugs = universities
    .map((u) => u.slug)
    .filter(Boolean);
  const comparePairs: Array<{ a: string; b: string }> = [];
  for (let i = 0; i < rankedSlugs.length; i++) {
    for (let j = i + 1; j < rankedSlugs.length; j++) {
      comparePairs.push({ a: rankedSlugs[i], b: rankedSlugs[j] });
    }
  }
  const compareUrls: MetadataRoute.Sitemap = comparePairs.map((p) => ({
    url: `${SITE_URL}/universities/compare/${p.a}/vs/${p.b}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  return [
    ...staticPages,
    ...seoHubPages,
    ...guidePages,
    ...cityUrls,
    ...countryUrls,
    ...universityUrls,
    ...scholarshipUrls,
    ...compareUrls,
  ];
}

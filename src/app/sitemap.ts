import type { MetadataRoute } from 'next';
import { getSupabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { universities as staticUniversities, programs as staticPrograms, scholarships as staticScholarships } from '@/lib/data';
import { cities, COUNTRIES } from '@/lib/seo-data';

import { SITE_URL } from '@/lib/site-url';
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
    { url: `${SITE_URL}/guides/health-insurance`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/banking`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/part-time-work`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/hsk`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
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
  // We use the unfiltered programs list for sitemap entries that
  // need additional fields (e.g. discipline for the /majors/* URLs).
  const allPrograms = staticPrograms;
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

  // Per-university subpages — scholarships and programs subroutes.
  // 8 ranked universities × 2 subroutes = 16 pages. High-intent
  // "[University] scholarships" / "[University] programs" queries.
  const rankedUniSubUrls: MetadataRoute.Sitemap = rankedSlugs.flatMap((s) => [
    {
      url: `${SITE_URL}/universities/${s}/scholarships`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/universities/${s}/programs`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]);

  // /majors index + per-discipline pages — 8 unique disciplines.
  const majorsIndexUrl: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/majors`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];
  // Derive the same discipline slugs the /majors/[discipline] route uses
  // (lowercased, hyphens). Build from the programs list to stay in
  // sync with the page's own slugifyDiscipline.
  const DISCIPLINE_SLUGS = Array.from(
    new Set(allPrograms.map((p) => p.discipline.toLowerCase().replace(/\s+/g, '-'))),
  );
  const majorUrls: MetadataRoute.Sitemap = DISCIPLINE_SLUGS.map((d) => ({
    url: `${SITE_URL}/majors/${d}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Per-scholarship /eligible-countries subpage — 10 real scholarships.
  const scholarshipEligibilityUrls: MetadataRoute.Sitemap = scholarships
    .filter((s: { slug: string }) => s.slug.includes('scholarship') || s.slug.startsWith('csc-'))
    .map((s: { slug: string }) => ({
      url: `${SITE_URL}/scholarships/${s.slug}/eligible-countries`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    }));

  // Per-program /scholarships subpage — 17 programs.
  const programScholarshipUrls: MetadataRoute.Sitemap = allPrograms.map((p: { slug: string }) => ({
    url: `${SITE_URL}/programs/${p.slug}/scholarships`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.65,
  }));

  // News posts — /news index + per-post URLs. The RLS policy on
  // news_posts lets the public see only status='published' rows, so
  // we filter here too (defense in depth). Posts are fresh, so weekly
  // change frequency + priority 0.8 matches their SEO weight.
  const newsIndexUrl: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/news`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  ];
  let newsPostUrls: MetadataRoute.Sitemap = [];
  if (isSupabaseServerConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { data } = await supabase
        .from('news_posts')
        .select('slug, updated_at, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(500);
      if (data && data.length > 0) {
        newsPostUrls = (data as Array<{ slug: string; updated_at: string; published_at: string }>).map(
          (p) => ({
            url: `${SITE_URL}/news/${p.slug}`,
            lastModified: p.updated_at ? new Date(p.updated_at) : now,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
          }),
        );
      }
    }
  }

  return [
    ...staticPages,
    ...seoHubPages,
    ...guidePages,
    ...cityUrls,
    ...countryUrls,
    ...universityUrls,
    ...scholarshipUrls,
    ...compareUrls,
    ...rankedUniSubUrls,
    ...majorsIndexUrl,
    ...majorUrls,
    ...scholarshipEligibilityUrls,
    ...programScholarshipUrls,
    ...newsIndexUrl,
    ...newsPostUrls,
  ];
}

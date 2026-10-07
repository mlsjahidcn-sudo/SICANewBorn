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
    { url: `${SITE_URL}/success-stories`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    // Phase 57: /get-started is the influencer-traffic sales
    // landing page. Higher priority than /contact (0.5) because
    // it's the conversion page for paid-traffic channels.
    { url: `${SITE_URL}/get-started`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    // Phase 114: free counselling session booking — the conversion
    // landing for "free counselling study in china" queries.
    { url: `${SITE_URL}/counselling`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    // Phase 139: webinar landing page for the March/Sept 2027
    // intake + CSC Scholarship webinar. weekly change frequency
    // because the date copy will update as the session is
    // confirmed; priority 0.8 matches /counselling + /get-started.
    { url: `${SITE_URL}/webinar-2027-intake-csc`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];

  // Programmatic SEO landing pages (static, high-intent long-tail)
  const landingPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/best-universities-china`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/best-universities-in-beijing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/best-universities-in-shanghai`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/top-engineering-universities-china`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/best-mba-programs-china`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/mbbs-in-china`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/study-in-china-vs-russia-for-mbbs`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${SITE_URL}/china-university-application-deadlines`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${SITE_URL}/chinese-government-scholarship-csc`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    // Phase 115: CSCA exam flagship — new mandatory exam for intl bachelor's applicants (2026 intake)
    { url: `${SITE_URL}/csca-exam`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    // Phase 116: CSCA cluster Batch 1 — logistics pillars
    { url: `${SITE_URL}/csca-exam-dates`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-exam-registration`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-exam-fees`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-exam-exemptions`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 121: Study-in-China cluster Batch 1 — personal finance & daily life
    { url: `${SITE_URL}/open-chinese-bank-account`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/international-money-transfer-china`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/china-mobile-internet-for-international-students`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/student-health-care-china`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 117: Professional Chinese tracks stay on SICA (admissions
    // angle). The 3 subject deep-dives + the 12-week prep plan were
    // removed — they 301 to cscaprep.academy (Phase 146 / Option C in
    // docs/csca-overlap.md).
    { url: `${SITE_URL}/csca-humanities-chinese-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-stem-chinese-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 146: the 10 top-level /<slug>-university profile pages
    // were removed from the sitemap — they now 301 to
    // /universities/<slug> (next.config.ts redirects), which is the
    // canonical URL already emitted by the universityUrls bucket
    // below. Same for /peking-university-vs-* and the 4 pure-prep
    // CSCA pages (→ cscaprep.academy).
    // Phase 118: CSCA cluster Batch 3 — comparisons & scores
    { url: `${SITE_URL}/csca-vs-hsk`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-vs-sat-a-level-ib`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-scores-and-cutoffs`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 119: CSCA cluster Batch 4 — scenario pages
    { url: `${SITE_URL}/csca-csc-scholarship`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-mbbs-applicants`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-english-taught-programs`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-test-day-retakes`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 120: CSCA cluster Batch 5 — FAQ mega-page + partner handbook (cluster complete: 20/20)
    { url: `${SITE_URL}/csca-faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-partner-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    // Phase 121: Study-in-China cluster Batch 1 — personal finance & daily life
    { url: `${SITE_URL}/open-chinese-bank-account`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/international-money-transfer-china`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/china-mobile-internet-for-international-students`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/student-health-care-china`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 122-124: the 10 top-level university profile pages were
    // here — removed in Phase 146 (they 301 to /universities/<slug>,
    // see the comment in the CSCA block above).
    // Phase 136: Flagship admissions deep-dives Batch 1 — operational admissions guides
    { url: `${SITE_URL}/peking-university-admissions-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/tsinghua-university-admissions-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/fudan-university-admissions-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/shanghai-jiao-tong-university-admissions-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/zhejiang-university-admissions-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 137: /peking-university-vs-* removed in Phase 146 —
    // they 301 to /universities/compare/... (the compareUrls bucket
    // below emits the canonical pairs).
    { url: `${SITE_URL}/best-universities-in-hong-kong`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/best-universities-in-northeast-china`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/phd-in-china-international-students`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${SITE_URL}/china-university-admission-requirements`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${SITE_URL}/cost-of-living-china-by-city`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${SITE_URL}/best-cities-china-international-students`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${SITE_URL}/cheapest-universities-china`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
  ];

  // Programmatic SEO hub pages
  const seoHubPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/study-in-china`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/scholarships-for`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/guides`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/universities/compare`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/majors`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
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
    try {
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
    } catch {
      // Phase 145: an RLS / network / 5xx from any of the three
      // Supabase fetches used to bubble out of `sitemap()` and turn
      // /sitemap.xml into a 500. We swallow the error here so the
      // fallback to the static seed lists still emits a valid
      // sitemap. Failure is silent (no log) because /sitemap.xml is
      // called by every crawler on every fetch — logging would
      // drown the system. Real outages surface via the Supabase
      // dashboard's monitoring.
    }
  }

  const universityUrls: MetadataRoute.Sitemap = universities.map((entry: SitemapEntry) => ({
    url: `${SITE_URL}/universities/${entry.slug}`,
    lastModified: entry.updated_at ? new Date(entry.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Program detail pages — were missing from the sitemap entirely.
  const programUrls: MetadataRoute.Sitemap = programs.map((entry: SitemapEntry) => ({
    url: `${SITE_URL}/programs/${entry.slug}`,
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
  // Phase 146: the canonical order per pair is ALPHABETICAL by slug
  // (the compare page permanentRedirects the reverse order to it),
  // so each emitted pair is sorted before inclusion — the sitemap
  // never lists a URL that redirects.
  const rankedSlugs = universities
    .map((u) => u.slug)
    .filter(Boolean)
    .sort();
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

  // /majors per-discipline pages — the /majors index lives in seoHubPages.
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
    try {
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
    } catch {
      // Phase 145: see the catch block above. Same rationale — keep
      // /sitemap.xml alive even if Supabase is flaky.
    }
  }

  return [
    ...staticPages,
    ...landingPages,
    ...seoHubPages,
    ...guidePages,
    ...cityUrls,
    ...countryUrls,
    ...universityUrls,
    ...programUrls,
    ...scholarshipUrls,
    ...compareUrls,
    ...rankedUniSubUrls,
    ...majorUrls,
    ...scholarshipEligibilityUrls,
    ...programScholarshipUrls,
    ...newsIndexUrl,
    ...newsPostUrls,
  ];
}

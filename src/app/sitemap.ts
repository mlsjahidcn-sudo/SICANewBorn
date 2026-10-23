import type { MetadataRoute } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { universities as staticUniversities, programs as staticPrograms, scholarships as staticScholarships } from '@/lib/data';
import { cities, COUNTRIES } from '@/lib/seo-data';

import { SITE_URL } from '@/lib/site-url';
import { PUBLIC_WEBINAR_ENABLED } from '@/lib/webinar-config';
interface SitemapEntry {
  slug: string;
  updated_at?: string;
  discipline?: string;
}

/**
 * PF-6: fetch EVERY row of a catalogue table, in PostgREST-sized pages.
 *
 * The sitemap used to read the catalogue with a single un-limited
 * `.select('slug, updated_at')`. PostgREST caps a response at
 * `max-rows` (1,000 on this project), so the query silently returned
 * exactly 1,000 program rows: 1,513 of the 2,513 live program pages
 * never reached the sitemap and were only discoverable by paging the
 * listing. A cap that looks like data is the worst kind of bug — there
 * is no error, just a quietly truncated list.
 *
 * Paging fixes it: keep asking for the next window until a short page
 * comes back.
 */
const SITEMAP_PAGE_SIZE = 1000;

async function fetchAllCatalogRows(
  supabase: SupabaseClient,
  table: 'programs' | 'scholarships' | 'universities',
  columns = 'slug, updated_at',
): Promise<SitemapEntry[] | null> {
  const rows: SitemapEntry[] = [];
  for (let offset = 0; ; offset += SITEMAP_PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(offset, offset + SITEMAP_PAGE_SIZE - 1);
    if (error || !data || data.length === 0) break;
    rows.push(...(data as unknown as SitemapEntry[]));
    if (data.length < SITEMAP_PAGE_SIZE) break;
  }
  return rows.length > 0 ? rows : null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ─────────────────────────────────────────────────────────────────
  // NO build-time lastmod.
  // ─────────────────────────────────────────────────────────────────
  // Every static entry used to carry `lastModified: now`, i.e. the
  // moment the sitemap was generated. On the live site that produced
  // 395 URLs sharing one identical timestamp and 187 sharing another.
  //
  // That is worse than having no lastmod at all, for two reasons:
  //
  //   1. It is a lie. "Changed at 05:58:47 today" for a page that has
  //      not changed since March tells a crawler the freshness
  //      signal is worthless.
  //   2. It poisons the signal that IS real. Google has said
  //      explicitly that if lastmod is inaccurate they may ignore it
  //      for the whole sitemap — and this sitemap's DB-driven URLs
  //      (universities, programs, scholarships) carry genuine
  //      `updated_at` values. 395 fake stamps would get those 1,000+
  //      accurate ones discounted too.
  //
  // So: static pages now carry NO lastmod, and DB-driven pages carry
  // their real `updated_at` — and only when the row actually has one.
  //
  // Static pages

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/universities`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/programs`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/scholarships`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/assessment`, changeFrequency: 'monthly', priority: 0.6 },
    // G3 (2026-10-18): public application form — conversion surface
    // that was live but missing from the sitemap. Priority matches
    // /assessment (both are commit-level intake funnels).
    { url: `${SITE_URL}/apply`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/success-stories`, changeFrequency: 'monthly', priority: 0.6 },
    // Phase A+B (footer audit): the footer linked Privacy Policy +
    // Terms of Use as `href="#"` — dead links that the newsletter's
    // own copy pointed at. Both are now real pages.
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    // Phase 57: /get-started is the influencer-traffic sales
    // landing page. Phase 147: removed from the sitemap + noindexed
    // (it shows paid package prices); paid traffic reaches it via
    // direct links. [verify] Jahid decision.
    // Phase 114: free counselling session booking — the conversion
    // landing for "free counselling study in china" queries.
    { url: `${SITE_URL}/counselling`, changeFrequency: 'weekly', priority: 0.8 },
    ...(PUBLIC_WEBINAR_ENABLED
      ? [{ url: `${SITE_URL}/webinar-2027-intake-csc`, changeFrequency: 'weekly' as const, priority: 0.8 }]
      : []),
  ];

  // Programmatic SEO landing pages (static, high-intent long-tail)
  const landingPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/best-universities-china`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/best-universities-in-beijing`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/best-universities-in-shanghai`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/top-engineering-universities-china`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/best-mba-programs-china`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/mbbs-in-china`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/study-in-china-vs-russia-for-mbbs`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${SITE_URL}/china-university-application-deadlines`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${SITE_URL}/chinese-government-scholarship-csc`, changeFrequency: 'monthly', priority: 0.75 },
    // Phase 115: CSCA exam flagship — new mandatory exam for intl bachelor's applicants (2026 intake)
    { url: `${SITE_URL}/csca-exam`, changeFrequency: 'monthly', priority: 0.85 },
    // Phase 116: CSCA cluster Batch 1 — logistics pillars
    // Phase 149: /csca-exam-dates removed (dates now live on
    // cscaprep.academy/exam-dates per the spec's CSCA-overlap split;
    // see next.config.ts for the 301 + docs/csca-overlap.md for the
    // keep-vs-explanation table).
    { url: `${SITE_URL}/csca-exam-registration`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-exam-fees`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-exam-exemptions`, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 121: Study-in-China cluster Batch 1 — personal finance & daily life
    { url: `${SITE_URL}/open-chinese-bank-account`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/international-money-transfer-china`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/china-mobile-internet-for-international-students`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/student-health-care-china`, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 117: Professional Chinese tracks stay on SICA (admissions
    // angle). The 3 subject deep-dives + the 12-week prep plan were
    // removed — they 301 to cscaprep.academy (Phase 146 / Option C in
    // docs/csca-overlap.md).
    { url: `${SITE_URL}/csca-humanities-chinese-guide`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-stem-chinese-guide`, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 146: the 10 top-level /<slug>-university profile pages
    // were removed from the sitemap — they now 301 to
    // /universities/<slug> (next.config.ts redirects), which is the
    // canonical URL already emitted by the universityUrls bucket
    // below. Same for /peking-university-vs-* and the 4 pure-prep
    // CSCA pages (→ cscaprep.academy).
    // Phase 118: CSCA cluster Batch 3 — comparisons & scores
    { url: `${SITE_URL}/csca-vs-hsk`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-vs-sat-a-level-ib`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-scores-and-cutoffs`, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 119: CSCA cluster Batch 4 — scenario pages
    { url: `${SITE_URL}/csca-csc-scholarship`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-mbbs-applicants`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-english-taught-programs`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-test-day-retakes`, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 120: CSCA cluster Batch 5 — FAQ mega-page + partner handbook (cluster complete: 20/20)
    { url: `${SITE_URL}/csca-faq`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csca-partner-guide`, changeFrequency: 'monthly', priority: 0.75 },
    // Phase 147 (SEO Task 5): 5 country/process pages added to address
    // unserved long-tail queries. All have en+zh via the standard
    // GuidePage shell + auto-rendered CSCA Prep callout on the /csca-*
    // sibling pages.
    { url: `${SITE_URL}/csc-scholarship-pakistan`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/csc-scholarship-nigeria`, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 166: Bangladesh joins the Phase 147 country guide batch.
    // Closes the only country gap from the original Phase 147 list.
    { url: `${SITE_URL}/csc-scholarship-bangladesh`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/moe-listed-mbbs-universities-china`, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 167: closes the highest-intent transactional gap from
    // the 20-article audit — every admissions guide on SICA
    // references the study plan as a required document but no
    // single article operationalizes "how to actually write one".
    { url: `${SITE_URL}/how-to-write-study-plan-china`, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 168: province + city comparator templates (novel
    // format — pairs two SICA-listed regions head-to-head on
    // cost, climate, language, programs, international student
    // community, scholarships). The pattern lives in the
    // shared LocalizedGuide shell — both pages use the same
    // template so future comparators (Yunnan vs Guizhou,
    // Wuhan vs Nanjing, etc.) can reuse it without a new shell.
    { url: `${SITE_URL}/hunan-vs-yunnan`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/xiamen-vs-fuzhou`, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 169: 3 university deep-dive guides (same Phase 136
    // flagship pattern as Tsinghua + Peking + Fudan + SJTU +
    // Zhejiang admissions). Shenyang Pharma is the only
    // dedicated pharmacy specialist; Nankai is Tianjin-based
    // 985 with strong math/finance/economics; SUFE is the
    // most specialized finance + economics university in
    // China (DFC economics + business administration).
    { url: `${SITE_URL}/shenyang-pharmaceutical-university`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/nankai-university`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/sufe`, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 170: CSCA fee deep-dive for Pakistan, Nigeria, Bangladesh
    // — closes the country-specific payment-rail gap from the
    // global /csca-exam-fees article (per-country bank wire +
    // Payoneer + Flutterwave + bKash / Nagad paths + common
    // failure modes).
    { url: `${SITE_URL}/csca-fee-pakistan-nigeria-bangladesh`, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 171: standalone medical-check + physical-examination
    // form guide — was referenced as a checkbox across 4+ guides
    // (visa, mbbs, jw202, csc-pakistan) without an operational
    // deep-dive. Now has its own URL.
    { url: `${SITE_URL}/medical-check-physical-examination-form`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/x1-vs-x2-student-visa-china`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/study-in-china-without-ielts`, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 150: English-track ETP landscape article — the broad
    // 300+ university MOE ETP catalog for non-Chinese speakers, the
    // C9 + 30 strong-research-university cluster, subject coverage,
    // the English-track admissions pathway (IELTS + CSCA), CSC for
    // ETP candidates, and the realistic English-campus experience.
    // Complements /csca-english-taught-programs (the narrow CSCA
    // angle) and /study-in-china-without-ielts (the IELTS exemption
    // angle).
    { url: `${SITE_URL}/english-taught-programs-china`, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 155: 3 new long-form listicles closing the 2027 application
    // cycle + life-in-China content gaps. (a) Dorms deep-dive: the
    // four room types + international-dorm vs local-dorm distinction
    // + cost table by city tier. Complements /guides/accommodation
    // (the general on-vs-off-campus guide). (b) Peking vs Tsinghua
    // for international students: subject-fit + decision framework
    // (deeper than the /peking-university-vs-tsinghua metrics
    // compare). (c) X1 vs X2 + JW202 + residence permit: the
    // operational deep-dive on the visa, the 30-day conversion, the
    // residence permit, and the most common rejection reasons
    // (deeper than /x1-vs-x2-student-visa-china summary).
    { url: `${SITE_URL}/china-university-dorms-cost`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/peking-vs-tsinghua-international-students`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/china-student-visa-jw202-residence-permit`, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 122: HSK 3.0 transition cluster (4 articles, the most
    // time-sensitive SEO bet on the site ahead of the Dec 13, 2026
    // full format switch). All four are bilingual LocalizedGuide
    // pages with en+zh hub cards + per-cycle cross-link mesh.
    { url: `${SITE_URL}/hsk-3-vs-hsk-2`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/hsk-3-0-vocabulary-list`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/hsk-3-0-speaking-writing`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/hsk-3-0-prep-timeline`, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 122-124: the 10 top-level university profile pages were
    // here — removed in Phase 146 (they 301 to /universities/<slug>,
    // see the comment in the CSCA block above).
    // Phase 136: Flagship admissions deep-dives Batch 1 — operational admissions guides
    { url: `${SITE_URL}/peking-university-admissions-guide`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/tsinghua-university-admissions-guide`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/fudan-university-admissions-guide`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/shanghai-jiao-tong-university-admissions-guide`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/zhejiang-university-admissions-guide`, changeFrequency: 'monthly', priority: 0.8 },
    // Phase 137: /peking-university-vs-* removed in Phase 146 —
    // they 301 to /universities/compare/... (the compareUrls bucket
    // below emits the canonical pairs).
    { url: `${SITE_URL}/best-universities-in-hong-kong`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/best-universities-in-northeast-china`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/phd-in-china-international-students`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${SITE_URL}/china-university-admission-requirements`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${SITE_URL}/cost-of-living-china-by-city`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${SITE_URL}/best-cities-china-international-students`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${SITE_URL}/cheapest-universities-china`, changeFrequency: 'monthly', priority: 0.75 },
  ];

  // Programmatic SEO hub pages
  const seoHubPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/study-in-china`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/scholarships-for`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/guides`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/universities/compare`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/majors`, changeFrequency: 'weekly', priority: 0.85 },
  ];

  // Long-form guide pages — high-value pillar content for SEO + GEO + AEO
  const guidePages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/guides/study-in-china`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/application`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/scholarships`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/visa`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/cost-of-living`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/accommodation`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/health-insurance`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/banking`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/part-time-work`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/guides/hsk`, changeFrequency: 'monthly', priority: 0.85 },
  ];

  // City pages — /study-in-china/[city]
  const cityUrls: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${SITE_URL}/study-in-china/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Country pages — /scholarships-for/[country]
  const countryUrls: MetadataRoute.Sitemap = COUNTRIES.map((c) => ({
    url: `${SITE_URL}/scholarships-for/${c.slug}`,
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
          fetchAllCatalogRows(supabase, 'universities'),
          fetchAllCatalogRows(supabase, 'programs', 'slug, updated_at, discipline'),
          fetchAllCatalogRows(supabase, 'scholarships'),
        ]);
        // Type the dynamic fetches — they may return error objects in
        // some Supabase SDK versions, but we only read .data.
        if (u && u.length > 0) universities = u as SitemapEntry[];
        if (p && p.length > 0) programs = p as SitemapEntry[];
        if (s && s.length > 0) scholarships = s as SitemapEntry[];
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
    ...(entry.updated_at ? { lastModified: new Date(entry.updated_at) } : {}),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Program detail pages — were missing from the sitemap entirely.
  const programUrls: MetadataRoute.Sitemap = programs.map((entry: SitemapEntry) => ({
    url: `${SITE_URL}/programs/${entry.slug}`,
    ...(entry.updated_at ? { lastModified: new Date(entry.updated_at) } : {}),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  const scholarshipUrls: MetadataRoute.Sitemap = scholarships.map((entry: SitemapEntry) => ({
    url: `${SITE_URL}/scholarships/${entry.slug}`,
    ...(entry.updated_at ? { lastModified: new Date(entry.updated_at) } : {}),
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
  // Phase 159: cap the compare pair sitemap entries to the top
  // COMPARE_TOP_N universities. With 132+ live rows the full
  // combinatorial C(132, 2) ≈ 8,646 pair URLs were dominating
  // 93% of the sitemap, soaking Google's crawl budget on thin
  // "A vs B" pages instead of the high-conversion article URLs.
  // Limiting to the top 20 → 190 pair URLs (still covers the
  // Tsinghua/Peking/Fudan/Zhejiang/SJTU/etc. cluster that
  // actually drives clicks). The /compare hub + internal links
  // still cover the long tail; the sitemap just doesn't scream
  // "low-value permutational content" to Google.
  const COMPARE_TOP_N = 20;
  const compareScopeSlugs = rankedSlugs.slice(0, COMPARE_TOP_N);
  const comparePairs: Array<{ a: string; b: string }> = [];
  for (let i = 0; i < compareScopeSlugs.length; i++) {
    for (let j = i + 1; j < compareScopeSlugs.length; j++) {
      comparePairs.push({ a: compareScopeSlugs[i], b: compareScopeSlugs[j] });
    }
  }
  const compareUrls: MetadataRoute.Sitemap = comparePairs.map((p) => ({
    url: `${SITE_URL}/universities/compare/${p.a}/vs/${p.b}`,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  // Per-university subpages — scholarships and programs
  // subroutes. Phase 159: capped to the top COMPARE_TOP_N so the
  // 132-university bulk doesn't flood the sitemap with 264 thin
  // subpages. The hub still links to every per-uni subpage via
  // the per-uni detail (the per-uni URL itself is in the sitemap
  // — see universityUrls above — so crawlers can discover the
  // subpages through internal links).
  const rankedUniSubUrls: MetadataRoute.Sitemap = compareScopeSlugs.flatMap((s) => [
    {
      url: `${SITE_URL}/universities/${s}/scholarships`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/universities/${s}/programs`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]);

  // /majors per-discipline pages — the /majors index lives in seoHubPages.
  // (lowercased, hyphens). The /majors/[discipline] route generates its
  // own params from the LIVE catalogue, so the sitemap has to list the
  // live disciplines too — listing only the 8 from the 45-row static
  // seed left 70+ real discipline pages undiscoverable.
  const DISCIPLINE_SLUGS = Array.from(
    new Set(
      (programs.length > 0 && programs[0].discipline !== undefined
        ? programs.map((p) => p.discipline)
        : allPrograms.map((p) => p.discipline)
      )
        .filter((d): d is string => Boolean(d))
        .map((d) => d.toLowerCase().replace(/\s+/g, '-')),
    ),
  );
  const majorUrls: MetadataRoute.Sitemap = DISCIPLINE_SLUGS.map((d) => ({
    url: `${SITE_URL}/majors/${d}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Per-scholarship /eligible-countries subpage — 10 real scholarships.
  const scholarshipEligibilityUrls: MetadataRoute.Sitemap = scholarships
    .filter((s: { slug: string }) => s.slug.includes('scholarship') || s.slug.startsWith('csc-'))
    .map((s: { slug: string }) => ({
      url: `${SITE_URL}/scholarships/${s.slug}/eligible-countries`,
      changeFrequency: 'monthly',
      priority: 0.65,
    }));

  // Per-program /scholarships subpage — 17 programs.
  const programScholarshipUrls: MetadataRoute.Sitemap = allPrograms.map((p: { slug: string }) => ({
    url: `${SITE_URL}/programs/${p.slug}/scholarships`,
    changeFrequency: 'monthly',
    priority: 0.65,
  }));

  // News posts — /news index + per-post URLs. The RLS policy on
  // news_posts lets the public see only status='published' rows, so
  // we filter here too (defense in depth). Posts are fresh, so weekly
  // change frequency + priority 0.8 matches their SEO weight.
  const newsIndexUrl: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/news`, changeFrequency: 'daily', priority: 0.8 },
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
              ...(p.updated_at ? { lastModified: new Date(p.updated_at) } : {}),
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

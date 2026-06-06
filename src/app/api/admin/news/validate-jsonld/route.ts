import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

import { SITE_URL } from '@/lib/site-url';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/news/validate-jsonld
 *
 * Audits every published news post's structured data against the
 * schema.org shapes we render on the public page (Article +
 * BreadcrumbList + FAQPage). Returns a per-post report with the
 * issues found so the admin can fix them before Google crawls.
 *
 * This is the offline, programmatic equivalent of pasting each
 * post URL into Google's Rich Results Test. It's a stronger
 * check than a real-world tester for our specific schema: we
 * know exactly what we emit, so we can validate every required
 * field precisely (Google's tester only checks subset).
 *
 * Auth: requireAdmin. Returns 200 with empty issues array when
 * Supabase isn't configured (dev mode without a project).
 *
 * Response shape:
 *   {
 *     posts: [
 *       { slug, title_en, ok: boolean, issues: string[], fieldCount: number,
 *         schemaTypes: string[] }
 *     ],
 *     summary: { total: number, with_issues: number, by_issue: Record<string, number> }
 *   }
 */
export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ posts: [], summary: emptySummary(), configured: false });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const service = buildServiceClient();
  const { data: posts, error } = await service
    .from('news_posts')
    .select(
      'id, slug, title_en, title_zh, excerpt_en, excerpt_zh, content_en, content_zh, cover_image, category, tags, status, author, seo_title, seo_description, published_at, updated_at, faq, key_takeaways, at_a_glance, sources, read_time_minutes',
    )
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reports = (posts || []).map(validatePost);
  const summary = buildSummary(reports);
  return NextResponse.json({ posts: reports, summary, configured: true });
}

// ----- validation ---------------------------------------------------------

interface RawPost {
  id: string;
  slug: string;
  title_en: string | null;
  title_zh: string | null;
  excerpt_en: string | null;
  excerpt_zh: string | null;
  content_en: string | null;
  content_zh: string | null;
  cover_image: string | null;
  category: string | null;
  tags: string[] | null;
  status: string | null;
  author: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  updated_at: string | null;
  faq: unknown;
  key_takeaways: unknown;
  at_a_glance: unknown;
  sources: unknown;
  read_time_minutes: number | null;
}

interface Report {
  slug: string;
  title_en: string;
  status: string;
  ok: boolean;
  issues: string[];
  fieldCount: number;
  schemaTypes: string[];
}

const RECOMMENDED_KEY_TAKEAWAYS = 3;
const MAX_KEY_TAKEAWAYS = 5;
const RECOMMENDED_FAQ_PAIRS = 3;
const MAX_FAQ_PAIRS = 8;
const RECOMMENDED_SOURCES = 2;
const RECOMMENDED_AT_A_GLANCE = 4;
const MAX_AT_A_GLANCE = 6;
const SEO_TITLE_MAX = 65;
const SEO_TITLE_MIN = 50;
const SEO_DESC_MIN = 140;
const SEO_DESC_MAX = 160;
const TITLE_MAX = 70;
const EXCERPT_MAX = 200;

function validatePost(p: RawPost): Report {
  const issues: string[] = [];
  const schemaTypes: string[] = [];

  if (p.status !== 'published') {
    issues.push(`status is '${p.status}', not 'published' — post is not visible publicly but the API still validates it`);
  }

  // Title
  if (!p.title_en || p.title_en.trim().length < 10) {
    issues.push('title_en is empty or too short (SEO critical)');
  } else if (p.title_en.length > TITLE_MAX) {
    issues.push(`title_en is ${p.title_en.length} chars (max ${TITLE_MAX} for SERP display)`);
  }

  // Excerpt
  if (!p.excerpt_en) {
    issues.push('excerpt_en is empty (used as fallback meta description + social card preview)');
  } else if (p.excerpt_en.length > EXCERPT_MAX) {
    issues.push(`excerpt_en is ${p.excerpt_en.length} chars (max ${EXCERPT_MAX})`);
  }

  // SEO meta
  if (!p.seo_title) {
    issues.push('seo_title is empty (falls back to title_en — usually too long)');
  } else if (p.seo_title.length > SEO_TITLE_MAX) {
    issues.push(`seo_title is ${p.seo_title.length} chars (max ${SEO_TITLE_MAX} for SERP — Google truncates with "...")`);
  } else if (p.seo_title.length < SEO_TITLE_MIN) {
    issues.push(`seo_title is ${p.seo_title.length} chars (Google rewards 50-65)`);
  }
  if (!p.seo_description) {
    issues.push('seo_description is empty (used as meta description + LinkedIn/Twitter previews)');
  } else if (p.seo_description.length < SEO_DESC_MIN) {
    issues.push(`seo_description is ${p.seo_description.length} chars (target 140-160)`);
  } else if (p.seo_description.length > SEO_DESC_MAX) {
    issues.push(`seo_description is ${p.seo_description.length} chars (max ${SEO_DESC_MAX} — Google truncates)`);
  }

  // Content
  if (!p.content_en || p.content_en.trim().length < 200) {
    issues.push('content_en is empty or under 200 chars (thin content)');
  } else {
    // AEO: question-format H2s are how posts surface in PAA boxes
    const h2s = (p.content_en.match(/^##\s+(?!#)/gm) || []).length;
    if (h2s < 2) issues.push(`content_en has only ${h2s} H2 — AEO wants 2+ question-format H2s`);
  }

  // Cover image — important for OG / Twitter cards
  if (!p.cover_image) issues.push('cover_image is empty (OG/Twitter card will be blank)');

  // S36 structured fields
  const keyTakeaways = Array.isArray(p.key_takeaways) ? (p.key_takeaways as unknown[]) : [];
  if (keyTakeaways.length === 0) {
    issues.push('key_takeaways is empty (TL;DR box won\'t render — AEO gap)');
  } else if (keyTakeaways.length < RECOMMENDED_KEY_TAKEAWAYS) {
    issues.push(`key_takeaways has ${keyTakeaways.length} (recommended ${RECOMMENDED_KEY_TAKEAWAYS}-${MAX_KEY_TAKEAWAYS})`);
  } else if (keyTakeaways.length > MAX_KEY_TAKEAWAYS) {
    issues.push(`key_takeaways has ${keyTakeaways.length} (max ${MAX_KEY_TAKEAWAYS})`);
  }

  const atAGlance = Array.isArray(p.at_a_glance) ? (p.at_a_glance as unknown[]) : [];
  if (atAGlance.length === 0) {
    issues.push('at_a_glance is empty (fact table won\'t render — GEO gap)');
  } else if (atAGlance.length < RECOMMENDED_AT_A_GLANCE) {
    issues.push(`at_a_glance has ${atAGlance.length} rows (recommended ${RECOMMENDED_AT_A_GLANCE}-${MAX_AT_A_GLANCE})`);
  }

  const sources = Array.isArray(p.sources) ? (p.sources as unknown[]) : [];
  if (sources.length === 0) {
    issues.push('sources is empty (Sources footer won\'t render + isBasedOn JSON-LD is missing — GEO gap)');
  } else if (sources.length < RECOMMENDED_SOURCES) {
    issues.push(`sources has ${sources.length} (recommended ${RECOMMENDED_SOURCES}+)`);
  } else {
    // Validate source URLs
    for (const s of sources) {
      if (s && typeof s === 'object') {
        const url = (s as { url?: unknown }).url;
        if (typeof url === 'string' && !/^https?:\/\//i.test(url)) {
          issues.push(`source url "${url}" is not a valid http(s) URL`);
        }
      }
    }
  }

  const faq = Array.isArray(p.faq) ? (p.faq as unknown[]) : [];
  if (faq.length === 0) {
    issues.push('faq is empty (FAQPage JSON-LD won\'t render — AEO gap)');
  } else {
    if (faq.length < RECOMMENDED_FAQ_PAIRS) {
      issues.push(`faq has ${faq.length} Q&A (recommended ${RECOMMENDED_FAQ_PAIRS}-${MAX_FAQ_PAIRS})`);
    }
    for (let i = 0; i < faq.length; i++) {
      const q = faq[i] as { question?: unknown; answer?: unknown };
      if (!q || typeof q !== 'object') {
        issues.push(`faq[${i}] is not an object`);
        continue;
      }
      if (typeof q.question !== 'string' || q.question.trim().length < 10) {
        issues.push(`faq[${i}].question is empty or too short`);
      }
      if (typeof q.answer !== 'string' || q.answer.trim().length < 20) {
        issues.push(`faq[${i}].answer is empty or too short (target 40-60 words)`);
      }
    }
  }

  // Internal links (SEO)
  if (p.content_en) {
    const internalLinks = (p.content_en.match(/\]\(\/[a-z]/g) || []).length;
    if (internalLinks < 3) {
      issues.push(`content_en has ${internalLinks} internal links (SEO wants 3-5 to /universities, /programs, /scholarships)`);
    }
  }

  // Third-party-agency sniff (S35 scrub) — defense in depth
  if (p.content_en) {
    const c = p.content_en.toLowerCase();
    if (c.includes('cucas')) issues.push('content_en mentions CUCAS (S35 scrub should have caught this — scrub may be broken)');
    if (c.includes('china admissions')) issues.push('content_en mentions "China Admissions" (S35 scrub should have caught this)');
    if (c.includes('启德')) issues.push('content_en mentions 启德 (S35 scrub should have caught this)');
  }

  // datePublished — Article schema requires it
  if (p.status === 'published' && !p.published_at) {
    issues.push('published_at is null (Article JSON-LD datePublished will be null — Google may drop the rich result)');
  }

  // ---- Schema types that will be emitted ----
  schemaTypes.push('Article', 'BreadcrumbList');
  if (faq.length > 0) schemaTypes.push('FAQPage');

  // ---- Field count — rough signal of structured-data density ----
  let fieldCount = 0;
  if (p.title_en) fieldCount++;
  if (p.title_zh) fieldCount++;
  if (p.excerpt_en) fieldCount++;
  if (p.content_en) fieldCount++;
  if (p.cover_image) fieldCount++;
  if (p.seo_title) fieldCount++;
  if (p.seo_description) fieldCount++;
  fieldCount += keyTakeaways.length;
  fieldCount += atAGlance.length;
  fieldCount += sources.length;
  fieldCount += faq.length * 2; // Q + A

  return {
    slug: p.slug,
    title_en: p.title_en || '(no title)',
    status: p.status || 'unknown',
    ok: issues.length === 0,
    issues,
    fieldCount,
    schemaTypes,
  };
}

function buildSummary(reports: Report[]): {
  total: number;
  with_issues: number;
  by_issue: Record<string, number>;
} {
  const byIssue: Record<string, number> = {};
  for (const r of reports) {
    for (const issue of r.issues) {
      // Reduce "faq has 0 Q&A (recommended 3-8)" + "faq has 1 Q&A
      // (recommended 3-8)" to one bucket so the count is meaningful.
      const key = issue.replace(/\b\d+\b/g, 'N');
      byIssue[key] = (byIssue[key] || 0) + 1;
    }
  }
  return {
    total: reports.length,
    with_issues: reports.filter((r) => !r.ok).length,
    by_issue: byIssue,
  };
}

function emptySummary() {
  return { total: 0, with_issues: 0, by_issue: {} as Record<string, number> };
}

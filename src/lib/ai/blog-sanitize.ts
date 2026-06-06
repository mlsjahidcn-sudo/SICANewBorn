/**
 * Shared sanitization + shaping utilities for AI-generated SICA news posts.
 *
 * Extracted from /api/ai/generate-blog/route.ts so the daily cron at
 * /api/cron/generate-news can sanitize the same way the interactive
 * admin streaming endpoint does.
 *
 * Two layers of defense here:
 *   1. sanitizeMarkdown()    — strips dangerous HTML / scripts / event
 *                             handlers from the model output BEFORE we
 *                             write to the DB. The renderer (react-markdown
 *                             + rehype-sanitize) is the primary XSS
 *                             defense; this is belt-and-suspenders.
 *   2. scrubThirdPartyAgencies() — strips competitor / third-party agency
 *                             names from the post body, FAQ answers, tag
 *                             lists, etc. The system prompt tells the
 *                             model to avoid them; this catches any leak.
 *
 * Plus two helpers:
 *   - slugify()  — produces the post slug from the title.
 *   - scrubFaq() — normalizes the FAQ array shape.
 */

/**
 * Defense-in-depth sanitizer for AI-generated markdown. The renderer
 * (react-markdown + rehype-sanitize) is the primary XSS defense; this
 * catches dangerous patterns BEFORE we save to the DB so the stored
 * content is already clean.
 */
export function sanitizeMarkdown(md: string): string {
  if (!md) return md;
  return md
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*>[\s\S]*?<\/embed>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<(script|iframe|object|embed|style)\b[^>]*\/?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1=$2#$2')
    .replace(/(href|src)\s*=\s*("|')\s*vbscript:[^"']*\2/gi, '$1=$2#$2')
    .replace(/(href|src)\s*=\s*("|')\s*data:text\/html[^"']*\2/gi, '$1=$2#$2');
}

/**
 * Curated denylist of third-party study-in-China agencies, platforms,
 * and commercial competitors. The system prompt also forbids these by
 * name; this filter is the second line of defense for when the model
 * slips one in.
 *
 * CSC (Chinese Government Scholarship), Confucius Institute, and
 * government programs are NOT in this list — they are official
 * programs, not competitors.
 */
const THIRD_PARTY_AGENCIES: ReadonlyArray<{ name: string; replacement: string }> = [
  { name: 'CUCAS', replacement: 'other agencies' },
  { name: 'China University and College Admission Service', replacement: 'other agencies' },
  { name: 'China Admissions', replacement: 'other admissions platforms' },
  { name: 'ApplyESL', replacement: 'other agencies' },
  { name: 'ApplyChina', replacement: 'other agencies' },
  { name: 'ApplyBoard', replacement: 'other agencies' },
  { name: 'INTO China', replacement: 'other pathway providers' },
  { name: 'INTO Universities', replacement: 'other pathway providers' },
  { name: '启德教育', replacement: '其他留学机构' },
  { name: '启德', replacement: '其他留学机构' },
  { name: '新航道', replacement: '其他留学机构' },
  { name: '学为贵', replacement: '其他留学机构' },
  { name: 'Shinyway', replacement: 'other agencies' },
  { name: 'EIC Education', replacement: 'other agencies' },
  { name: 'IDP Education', replacement: 'other agencies' },
  { name: 'IDP', replacement: 'other agencies' },
  { name: 'Hotcourses', replacement: 'other platforms' },
  { name: 'educations.com', replacement: 'other platforms' },
  { name: 'Leverage Edu', replacement: 'other agencies' },
  { name: 'Educonnects', replacement: 'other agencies' },
  { name: 'ChinaScholarship.com', replacement: 'commercial scholarship portals' },
  { name: 'ChinaScholarship', replacement: 'commercial scholarship portals' },
  { name: 'Cucas', replacement: 'other agencies' },
];

/**
 * Strip third-party agency names from AI-generated content.
 * Replaces each match with a generic phrase so the surrounding
 * sentence still reads naturally. Iterates longest-first so
 * multi-word names like "China University and College Admission
 * Service" win over a shorter "China Admissions" overlap.
 */
export function scrubThirdPartyAgencies(text: string): string {
  if (!text) return text;
  const sorted = [...THIRD_PARTY_AGENCIES].sort((a, b) => b.name.length - a.name.length);
  let out = text;
  for (const { name, replacement } of sorted) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = /[A-Za-z]/.test(name)
      ? new RegExp(`\\b${escaped}\\b`, 'gi')
      : new RegExp(escaped, 'g');
    out = out.replace(pattern, replacement);
  }
  return out;
}

/**
 * Normalize + scrub the FAQ array. The model occasionally returns
 * malformed entries (empty question, missing answer, wrong shape)
 * and we don't want to crash the renderer on a bad row. We also
 * run the third-party agency scrub on the answer text so the FAQ
 * block never names a competitor.
 */
export function scrubFaq(faq: unknown): Array<{ question: string; answer: string }> {
  const out: Array<{ question: string; answer: string }> = [];
  if (!Array.isArray(faq)) return out;
  for (const row of faq) {
    if (!row || typeof row !== 'object') continue;
    const r = row as { question?: unknown; answer?: unknown };
    const q = typeof r.question === 'string' ? r.question.trim() : '';
    const a = typeof r.answer === 'string' ? r.answer.trim() : '';
    if (!q || !a) continue;
    out.push({
      question: scrubThirdPartyAgencies(q).slice(0, 250),
      answer: scrubThirdPartyAgencies(a).slice(0, 500),
    });
    if (out.length >= 8) break;
  }
  return out;
}

/**
 * URL-slugify a title (ASCII, lowercase, hyphens). Mirrors the
 * convention in /admin/news and the guides.
 */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

/**
 * Try to extract a JSON object from the model's freeform output.
 * The model usually wraps in code fences or preamble; this strips
 * those before parsing. Returns null if no JSON object is found.
 */
export function extractJsonObject(raw: string): string | null {
  if (!raw) return null;
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const firstBrace = s.indexOf('{');
  const lastBrace = s.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  s = s.slice(firstBrace, lastBrace + 1);
  // Drop trailing commas before } or ] — the model occasionally
  // emits them and JSON.parse is strict.
  s = s.replace(/,\s*([}\]])/g, '$1');
  return s;
}

/**
 * Validate + shape the raw model output into the news_posts insert
 * payload. Returns the cleaned payload AND the computed read time
 * (caller stores it on the row). Throws if the model returned
 * something unusable (caller should catch and retry the same topic).
 */
export interface NormalizedBlogPayload {
  title_en: string;
  title_zh: string | null;
  slug: string;
  excerpt_en: string | null;
  excerpt_zh: string | null;
  content_en: string;
  content_zh: string | null;
  category: string;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  key_takeaways: string[];
  at_a_glance: Array<{ label: string; value: string }>;
  faq: Array<{ question: string; answer: string }>;
  sources: Array<{ label: string; url: string }>;
  read_time_minutes: number;
}

export function normalizeBlogPayload(parsed: Record<string, unknown>): NormalizedBlogPayload {
  // Sanitize + scrub every text field
  const contentEn = typeof parsed.content_en === 'string' ? parsed.content_en : '';
  const contentZhRaw = typeof parsed.content_zh === 'string' ? parsed.content_zh : '';
  const content_en = sanitizeMarkdown(scrubThirdPartyAgencies(contentEn));
  const content_zh = contentZhRaw
    ? sanitizeMarkdown(scrubThirdPartyAgencies(contentZhRaw))
    : null;

  const excerpt_en = typeof parsed.excerpt_en === 'string'
    ? scrubThirdPartyAgencies(parsed.excerpt_en.trim()).slice(0, 500) || null
    : null;
  const excerpt_zh = typeof parsed.excerpt_zh === 'string'
    ? scrubThirdPartyAgencies(parsed.excerpt_zh.trim()).slice(0, 500) || null
    : null;

  const title_en = typeof parsed.title_en === 'string'
    ? parsed.title_en.trim().slice(0, 300)
    : '';
  if (!title_en) throw new Error('Model returned no title_en');

  const title_zh = typeof parsed.title_zh === 'string'
    ? parsed.title_zh.trim().slice(0, 300) || null
    : null;

  // Slug: prefer model's, fall back to slugified title
  const modelSlug = typeof parsed.slug === 'string' ? parsed.slug.trim() : '';
  const slug = modelSlug ? slugify(modelSlug) : slugify(title_en);
  if (!slug) throw new Error('Could not derive slug from title');

  const category = typeof parsed.category === 'string' && parsed.category.trim()
    ? parsed.category.trim().slice(0, 50)
    : 'announcement';

  const tags = Array.isArray(parsed.tags)
    ? parsed.tags
        .filter((t: unknown) => typeof t === 'string' && t.trim())
        .map((t: string) => scrubThirdPartyAgencies(t.trim()).slice(0, 50))
        .slice(0, 10)
    : [];

  const seo_title = typeof parsed.seo_title === 'string'
    ? scrubThirdPartyAgencies(parsed.seo_title.trim()).slice(0, 200) || null
    : null;
  const seo_description = typeof parsed.seo_description === 'string'
    ? scrubThirdPartyAgencies(parsed.seo_description.trim()).slice(0, 500) || null
    : null;

  // S36 structured fields
  const key_takeaways = Array.isArray(parsed.key_takeaways)
    ? parsed.key_takeaways
        .filter((s: unknown) => typeof s === 'string' && s.trim())
        .map((s: string) => scrubThirdPartyAgencies(s.trim()).slice(0, 200))
    : [];

  const at_a_glance = Array.isArray(parsed.at_a_glance)
    ? parsed.at_a_glance
        .filter((row: unknown) => row && typeof row === 'object')
        .map((row: { label?: unknown; value?: unknown }) => ({
          label: typeof row.label === 'string' ? scrubThirdPartyAgencies(row.label.trim()).slice(0, 80) : '',
          value: typeof row.value === 'string' ? scrubThirdPartyAgencies(row.value.trim()).slice(0, 200) : '',
        }))
        .filter((row: { label: string; value: string }) => row.label && row.value)
    : [];

  const faq = scrubFaq(parsed.faq);

  const sources = Array.isArray(parsed.sources)
    ? parsed.sources
        .filter((s: unknown) => s && typeof s === 'object')
        .map((s: { label?: unknown; url?: unknown }) => ({
          label: typeof s.label === 'string' ? scrubThirdPartyAgencies(s.label.trim()).slice(0, 200) : '',
          url: typeof s.url === 'string' ? s.url.trim().slice(0, 500) : '',
        }))
        .filter((s: { label: string; url: string }) => s.label && s.url && /^https?:\/\//i.test(s.url))
    : [];

  // Read time from the body length
  const wordCount = (content_en || contentZhRaw || '').split(/\s+/).filter(Boolean).length;
  const read_time_minutes = Math.max(1, Math.round(wordCount / 220));

  return {
    title_en,
    title_zh,
    slug,
    excerpt_en,
    excerpt_zh,
    content_en,
    content_zh,
    category,
    tags,
    seo_title,
    seo_description,
    key_takeaways,
    at_a_glance,
    faq,
    sources,
    read_time_minutes,
  };
}

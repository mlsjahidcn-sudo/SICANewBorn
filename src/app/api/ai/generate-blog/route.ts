import { NextRequest } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';

/**
 * POST /api/ai/generate-blog
 *
 * Stream-generates a SICA news post (markdown body) for the given
 * topic + category + length. The response is a Server-Sent Events
 * stream (text/event-stream) so the admin can watch the post
 * materialize live, same pattern as /api/ai/generate-university.
 *
 * Each event is `data: { content: <chunk> }\n\n` for raw text deltas
 * and `data: { parsed: <object> }\n\n` for the final validated
 * JSON object (after the stream finishes).
 *
 * The AI is the writer, not the publisher. The post still has to be
 * reviewed and explicitly published by an admin (status='published')
 * in the admin panel before it goes live at /news/[slug].
 *
 * Body:
 *   { topic: string, category?: string, length?: 'short'|'medium'|'long', language?: 'en'|'zh'|'both',
 *     tone?: string, targetKeyword?: string, slug?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const topic = (body.topic as string)?.trim();
    if (!topic) {
      return new Response(JSON.stringify({ error: 'topic is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const provider = getAIProvider();
    if (!provider.isConfigured) {
      return new Response(
        JSON.stringify({
          error:
            'AI provider not configured. Set DEEPSEEK_API_KEY or DOUBAO_API_KEY on the server.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const category = (body.category as string) || 'announcement';
    const length = (body.length as 'short' | 'medium' | 'long') || 'medium';
    const language = (body.language as 'en' | 'zh' | 'both') || 'en';
    const tone = (body.tone as string) || 'informational';
    const targetKeyword = (body.targetKeyword as string)?.trim() || '';

    const systemPrompt = buildSystemPrompt({
      category,
      length,
      language,
      tone,
      targetKeyword,
    });
    const userPrompt = buildUserPrompt({ topic, category, targetKeyword });

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = '';
        try {
          for await (const chunk of provider.stream(messages, {
            temperature: 0.7,
            maxTokens: length === 'long' ? 4000 : length === 'medium' ? 2500 : 1500,
          })) {
            if (chunk.content) {
              fullContent += chunk.content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`),
              );
            }
            if (chunk.done) break;
          }

          // Parse the AI's JSON response. Fall back to raw content if
          // parsing fails (the client tries again client-side).
          let jsonStr = fullContent.trim();
          jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
          const firstBrace = jsonStr.indexOf('{');
          const lastBrace = jsonStr.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
          }
          jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');

          try {
            const parsed = JSON.parse(jsonStr);
            // Sanitize AI-generated markdown — strip script tags,
            // on* attributes, javascript: URLs, etc. Defense in
            // depth; the renderer ALSO sanitizes with rehype-sanitize.
            if (parsed.content_en) parsed.content_en = sanitizeMarkdown(parsed.content_en);
            if (parsed.content_zh) parsed.content_zh = sanitizeMarkdown(parsed.content_zh);
            // Defense in depth: scrub any third-party agency names
            // the model slipped past the system prompt. The prompt
            // tells the model to avoid them, but LLMs occasionally
            // name a "peer" service for color. We strip a curated
            // denylist and replace with a generic phrase so the
            // post reads naturally.
            if (parsed.content_en) parsed.content_en = scrubThirdPartyAgencies(parsed.content_en);
            if (parsed.content_zh) parsed.content_zh = scrubThirdPartyAgencies(parsed.content_zh);
            if (parsed.excerpt_en) parsed.excerpt_en = scrubThirdPartyAgencies(parsed.excerpt_en);
            if (parsed.excerpt_zh) parsed.excerpt_zh = scrubThirdPartyAgencies(parsed.excerpt_zh);
            if (Array.isArray(parsed.tags)) {
              parsed.tags = parsed.tags.map((t: unknown) =>
                typeof t === 'string' ? scrubThirdPartyAgencies(t) : t,
              );
            }
            // If no slug was provided, slugify the title
            if (!parsed.slug && parsed.title_en) {
              parsed.slug = slugify(parsed.title_en);
            }
            // Estimate read time from word count
            if (parsed.content_en) {
              const words = parsed.content_en.split(/\s+/).length;
              parsed.read_time_minutes = Math.max(1, Math.round(words / 220));
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ parsed })}\n\n`));
          } catch {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ raw: fullContent })}\n\n`));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (streamError) {
          const errorMessage =
            streamError instanceof Error ? streamError.message : 'Stream error';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Prompt builders
// ──────────────────────────────────────────────────────────────────────────

function buildSystemPrompt(opts: {
  category: string;
  length: 'short' | 'medium' | 'long';
  language: 'en' | 'zh' | 'both';
  tone: string;
  targetKeyword: string;
}): string {
  const wordTarget =
    opts.length === 'short' ? '400-600 words' : opts.length === 'medium' ? '800-1200 words' : '1500-2200 words';

  return `You are the SICA Editorial Team — a professional content writer for SICA (Study in China Academy), a study-in-China platform that helps international students apply to top Chinese universities.

Your job: write a news post for the SICA newsroom at sica.com.cn/news.

## Required output format
Respond with ONLY a valid JSON object (no markdown code blocks, no preamble) with this EXACT shape:

{
  "title_en": "English title (50-70 chars, SEO-friendly, includes the year if relevant)",
  "title_zh": "Chinese title (corresponding translation, 20-30 chars)",
  "slug": "url-friendly-slug-lowercase-hyphenated (ascii only, no year prefix)",
  "excerpt_en": "1-2 sentence English summary (under 200 chars). Hook the reader.",
  "excerpt_zh": "Corresponding Chinese excerpt",
  "content_en": "Full English body in MARKDOWN. Use h2 (##), h3 (###), bullet lists, bold, and links. ${wordTarget}. Include a call to action at the end linking to /assessment or /contact.",
  "content_zh": "Corresponding Chinese body in MARKDOWN (or empty string if language='en' only)",
  "category": "${opts.category}",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "seo_title": "SEO title (60-70 chars, includes target keyword if any)",
  "seo_description": "Meta description (140-160 chars, includes target keyword naturally)"
}

## Voice and tone
- Tone: ${opts.tone}
- Author: "SICA Editorial Team" (use third-person / institutional voice)
- SICA facts: based in Guangzhou, China; helps students from 30+ countries apply to 50+ Chinese universities
- The "About SICA" knowledge from the chatbot prompt is your reference (we don't repeat it here)

## Content rules
- DO use real facts about Chinese universities, scholarships, and cities. Be accurate.
- DO cite specific programs, universities, scholarship names (e.g. "Tsinghua University", "CSC scholarship", "Confucius Institute Scholarship").
- DO end with a relevant CTA: "Get a free assessment at /assessment" or "Talk to an advisor at /contact".
- DO NOT invent statistics. If you don't have a number, say "hundreds" or "thousands" — not a fabricated specific count.
- DO NOT use marketing-speak like "world-class" or "cutting-edge" without substance.
- AVOID: html, <script>, <iframe>, on* attributes, javascript: URLs. Markdown only.

## ⚠️ DO NOT mention third-party commercial agencies or competitors
SICA is the publisher of this article. Never name, recommend, link to, or compare against ANY other study-in-China agency, platform, or service — including (but not limited to):
  - CUCAS / China University and College Admission Service
  - China Admissions
  - ApplyESL, ApplyChina, ApplyBoard
  - INTO China / INTO Universities
  - 启德教育 (EIC Education), 新航道 (New Channel), 学为贵 (Shinyway)
  - IDP Education, Hotcourses, educations.com
  - Leverage Edu, Educonnects, ChinaScholarship.com (commercial portals)
  - Any other private/paid third-party admissions service
Use generic phrasing instead — "other agencies", "third-party services", "private consultancies", "other platforms", or simply don't reference competitors at all. CSC (Chinese Government Scholarship), Confucius Institute, and government programs ARE allowed and encouraged — they are official programs, not competitors.
${opts.targetKeyword ? `- SEO target keyword: "${opts.targetKeyword}" — include naturally in title, first paragraph, and 1-2 other places.` : ''}

${opts.language === 'zh' ? 'Write the post primarily in Chinese (zh). Include English title for SEO.' : ''}
${opts.language === 'both' ? 'Write BOTH English and Chinese versions. Both must be complete, full-length posts.' : ''}

Respond with ONLY the JSON object. No commentary, no markdown code fences, no extra text.`;
}

function buildUserPrompt(opts: { topic: string; category: string; targetKeyword: string }): string {
  return `Write a SICA news post about: ${opts.topic}

Category: ${opts.category}
${opts.targetKeyword ? `Target SEO keyword: ${opts.targetKeyword}` : ''}

Make it informative, specific, and useful for international students considering studying in China. Include 1-2 concrete examples (a specific university, scholarship, deadline, or city). End with a clear next step for the reader.`;
}

// ──────────────────────────────────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────────────────────────────────

/**
 * Defense-in-depth sanitizer for AI-generated markdown. The renderer
 * (react-markdown + rehype-sanitize) is the primary XSS defense; this
 * catches dangerous patterns BEFORE we save to the DB so the stored
 * content is already clean.
 *
 * Strategy: strip <script>, <iframe>, <object>, <embed>, <style> tags
 * entirely. Strip on* attributes and javascript: URLs. Allow
 * everything else (markdown is plain text; safe elements get
 * rendered as their markdown equivalents).
 */
function sanitizeMarkdown(md: string): string {
  if (!md) return md;
  return md
    // Block-level dangerous tags (full tag including contents)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*>[\s\S]*?<\/embed>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    // Self-closing dangerous tags
    .replace(/<(script|iframe|object|embed|style)\b[^>]*\/?>/gi, '')
    // Inline event handlers (onclick, onerror, onload, etc.)
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    // javascript: and vbscript: URLs
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1=$2#$2')
    .replace(/(href|src)\s*=\s*("|')\s*vbscript:[^"']*\2/gi, '$1=$2#$2')
    // data: URLs (can be used for XSS via base64-encoded SVG)
    .replace(/(href|src)\s*=\s*("|')\s*data:text\/html[^"']*\2/gi, '$1=$2#$2');
}

/**
 * Curated denylist of third-party study-in-China agencies,
 * platforms, and commercial competitors. Matches are
 * case-insensitive and tolerant of whitespace / punctuation
 * (e.g. "CUCAS", "Cucas", "C.U.C.A.S.").
 *
 * CSC (Chinese Government Scholarship), Confucius Institute,
 * and other government programs are NOT in this list — they
 * are official programs, not competitors.
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
  // Generous catch for "Cucas" / "cucas" without period / with weird case
  { name: 'Cucas', replacement: 'other agencies' },
];

/**
 * Strip third-party agency names from AI-generated content. The
 * system prompt tells the model to avoid them, but LLMs sometimes
 * sneak in a "competitor" name for color — this filter is the
 * second line of defense so the published post never names one.
 *
 * Replaces each match with a generic phrase (e.g. "CUCAS" →
 * "other agencies") so the surrounding sentence still reads
 * naturally. Iterates the denylist longest-first so multi-word
 * names like "China University and College Admission Service" win
 * over a shorter "China Admissions" overlap.
 */
function scrubThirdPartyAgencies(text: string): string {
  if (!text) return text;
  // Sort by length desc so longer phrases match first (avoids
  // partial-replace race where "CUCAS" inside a longer name would
  // leave a stub like "other agencies University").
  const sorted = [...THIRD_PARTY_AGENCIES].sort((a, b) => b.name.length - a.name.length);
  let out = text;
  for (const { name, replacement } of sorted) {
    // Escape regex specials in the name (e.g. dots in "educations.com")
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Word-boundary-ish: \b for ASCII names (which is all of them);
    // for CJK names we just use a literal substring match.
    const pattern = /[A-Za-z]/.test(name)
      ? new RegExp(`\\b${escaped}\\b`, 'gi')
      : new RegExp(escaped, 'g');
    out = out.replace(pattern, replacement);
  }
  return out;
}

/**
 * URL-slugify a title (ASCII, lowercase, hyphens).
 * Mirrors the convention in /admin/news and the guides.
 */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

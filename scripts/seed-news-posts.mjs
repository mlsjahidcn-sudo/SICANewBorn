#!/usr/bin/env node
/**
 * Seed news posts by calling the AI blog endpoint 4 times and
 * POSTing the result to the admin news API. Designed to run
 * against the dev server on :5050 with a logged-in admin
 * session token in `localStorage` (or fall back to a fresh
 * admin sign-in via the API if needed).
 *
 * Usage:  node scripts/seed-news-posts.mjs
 *
 * Idempotent: re-running will create 4 more posts (the
 * admin can delete duplicates from /admin/news). For
 * one-shot use as documented in Phase 1.1.
 */

const BASE = process.env.SICA_BASE || 'http://localhost:5050';
const ADMIN_EMAIL = 'admin@sica.cn';
const ADMIN_PASSWORD = 'Sica-Admin-2026!';

const POSTS = [
  {
    topic: 'How to apply to Chinese universities as an international student in 2026 — a step-by-step guide',
    category: 'guide',
    length: 'long',
    language: 'en',
    tone: 'instructional',
    targetKeyword: 'apply to Chinese universities',
  },
  {
    topic: 'Top 5 scholarships for international students in China 2026 (CSC, Confucius, provincial)',
    category: 'scholarship',
    length: 'medium',
    language: 'en',
    tone: 'informational',
    targetKeyword: 'China scholarships for international students',
  },
  {
    topic: 'Chinese Government Scholarship (CSC) 2026 application timeline: deadlines and required documents',
    category: 'announcement',
    length: 'medium',
    language: 'en',
    tone: 'informational',
    targetKeyword: 'CSC scholarship deadline 2026',
  },
  {
    topic: 'Why study in China: 7 advantages international students should know in 2026',
    category: 'guide',
    length: 'long',
    language: 'en',
    tone: 'celebratory',
    targetKeyword: 'why study in China',
  },
];

async function getAdminToken() {
  // Supabase Auth sign-in: POST to /auth/v1/token?grant_type=password
  // (the project's anon key + admin email/password).
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase env vars not set');
  }
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: key },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Sign-in failed: ${res.status} ${t}`);
  }
  const json = await res.json();
  return json.access_token;
}

function consumeSSEStream(res) {
  return new Promise((resolve, reject) => {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let parsed = null;
    let buf = '';
    let eventCount = 0;
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            eventCount++;
            try {
              const obj = JSON.parse(data);
              if (obj.content) fullContent += obj.content;
              if (obj.parsed) parsed = obj.parsed;
            } catch (_) { /* skip */ }
          }
        }
        console.log(`    [stream: ${eventCount} events, ${fullContent.length} chars, parsed=${parsed ? 'yes' : 'no'}]`);
        resolve({ fullContent, parsed });
      } catch (e) {
        reject(e);
      }
    })();
  });
}

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function bestString(obj, ...keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function bestStringArray(obj, ...keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (Array.isArray(v) && v.length) return v.map(String);
  }
  return [];
}

function buildPayload(ai, post) {
  // The streaming parser surfaces either an inline `parsed` object
  // (the model emitted the final JSON) or just raw text. Prefer
  // parsed; fall back to carving title/slug/excerpt from the raw
  // markdown — DeepSeek often streams the body and only sometimes
  // emits the structured `parsed` event.
  const parsed = ai.parsed || {};
  const rawContent = ai.fullContent || '';

  // 1) Try the structured parsed object first
  let title = bestString(parsed, 'title_en', 'title') || '';
  let excerpt = bestString(parsed, 'excerpt_en', 'excerpt') || '';
  let content = bestString(parsed, 'content_en', 'content') || rawContent;
  const seoTitle = bestString(parsed, 'seo_title') || '';
  const seoDesc = bestString(parsed, 'seo_description') || '';
  const tags = bestStringArray(parsed, 'tags');

  // 2) Carve the markdown if parsed is missing fields. The model
  // typically writes "# Title\n\n## Introduction\n\n…".
  if (!title) {
    const h1 = rawContent.match(/^\s*#\s+([^\n]+)/m);
    title = h1?.[1]?.trim() || post.topic;
  }
  if (!excerpt) {
    // First paragraph after the first heading — strip markdown bold.
    const afterTitle = rawContent.split(/\n\n+/).slice(1, 4).join('\n\n');
    const para = afterTitle.split(/\n\n/)[0] || '';
    excerpt = para.replace(/[*_`]/g, '').slice(0, 280);
  }

  // 3) Slug: prefer parsed.slug, else derive from title, suffix
  // with a short timestamp so re-running this seeder doesn't
  // collide with existing rows.
  let slug =
    bestString(parsed, 'slug') ||
    `${slugify(title)}-${Date.now().toString(36).slice(-4)}`;

  const aiPrompt = JSON.stringify({
    topic: post.topic,
    category: post.category,
    length: post.length,
    tone: post.tone,
    language: post.language,
    targetKeyword: post.targetKeyword,
  });

  return {
    title_en: title.slice(0, 200),
    slug: slug.slice(0, 80),
    excerpt_en: excerpt.slice(0, 500),
    content_en: content,
    category: post.category,
    tags,
    status: 'published',
    seo_title: (seoTitle || title).slice(0, 200),
    seo_description: (seoDesc || excerpt).slice(0, 500),
    ai_prompt: aiPrompt,
  };
}

async function generateOne(token, post) {
  // DeepSeek occasionally rate-limits back-to-back calls (we
  // saw the 3rd+4th of 4 rapid-fire calls return an empty
  // stream in the first run). Retry with exponential backoff
  // on empty/short streams (the route returns 200 with just a
  // single error event when the upstream errors out).
  const maxAttempts = 3;
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`${BASE}/api/ai/generate-blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(post),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`AI generate failed: ${res.status} ${t}`);
      }
      const result = await consumeSSEStream(res);
      if (result.fullContent.length < 200) {
        throw new Error(
          `stream too short (${result.fullContent.length} chars) — likely rate-limited`,
        );
      }
      return result;
    } catch (e) {
      lastErr = e;
      if (attempt < maxAttempts) {
        const wait = 2000 * attempt; // 2s, 4s
        console.log(`    [retry ${attempt}/${maxAttempts - 1} in ${wait}ms: ${e.message}]`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  throw lastErr;
}

async function publishOne(token, payload) {
  const res = await fetch(`${BASE}/api/admin/news`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Admin POST failed: ${res.status} ${t}`);
  }
  const json = await res.json();
  return json.post;
}

async function main() {
  console.log(`Seeding ${POSTS.length} news posts via AI blog flow → ${BASE}\n`);
  const token = await getAdminToken();
  console.log('✓ Admin session acquired\n');

  for (const [i, post] of POSTS.entries()) {
    process.stdout.write(`[${i + 1}/${POSTS.length}] ${post.topic.slice(0, 60)}…\n`);
    try {
      const ai = await generateOne(token, post);
      const payload = buildPayload(ai, post);
      const created = await publishOne(token, payload);
      console.log(
        `  ✓ published: /news/${created.slug}  (id=${created.id})\n`,
      );
    } catch (e) {
      console.error(`  ✗ failed: ${e.message}\n`);
    }
  }

  console.log('\nDone. Refresh /admin/news to see the new posts.');
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});

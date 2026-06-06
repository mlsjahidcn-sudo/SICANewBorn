# SICA News — SEO / AEO / GEO Validation Guide

What ships: every AI-generated news post renders **Article** + **BreadcrumbList** + (when FAQ is present) **FAQPage** JSON-LD, plus visible TL;DR / at-a-glance / sources blocks. The S36 + S37 + S38 work built the system; this doc is the validation playbook so you can confirm the rich results are picked up and the LLM citations flow.

## 1. Programmatic audit (run locally)

There's an admin endpoint that walks every published post and checks the same fields the schema renderer uses. Run after any schema change or before a large publish batch:

```bash
# Get a fresh admin Bearer token first (see CLAUDE notes)
TOK=$(...)

curl -s -H "Authorization: Bearer $TOK" \
  http://localhost:5050/api/admin/news/validate-jsonld \
  | python3 -m json.tool
```

Response shape:
```json
{
  "posts": [
    {
      "slug": "csc-scholarship-2026-application-guide",
      "title_en": "CSC Scholarship 2026: Complete Application Guide for International Students",
      "status": "published",
      "ok": true,
      "issues": [],
      "fieldCount": 18,
      "schemaTypes": ["Article", "BreadcrumbList", "FAQPage"]
    }
  ],
  "summary": { "total": 12, "with_issues": 1, "by_issue": {...} },
  "configured": true
}
```

The endpoint flags:
- Missing / out-of-range SEO title and meta description
- Missing / too-short excerpt
- Empty `key_takeaways`, `at_a_glance`, `faq`, `sources`
- Insufficient internal links (SEO wants 3-5)
- Few H2s (AEO wants 2+ question-format H2s)
- Missing cover image (OG/Twitter card)
- Third-party agency names that slipped past the S35 scrub

This catches every regression before the post hits Google. Run it after every AI prompt change.

## 2. Google Rich Results Test (post-deploy)

For any single post URL, paste into https://search.google.com/test/rich-results and verify:

| Schema | Expected result |
|---|---|
| Article | ✓ detected, no errors, no warnings |
| FAQPage | ✓ detected if post has FAQ; if not, the FAQ block just doesn't emit |
| BreadcrumbList | ✓ detected (not a rich-result-eligible type, but validates the structure) |

Things to check:
- **"Detected"** appears for each emitted schema
- **No "Error"** items (errors disqualify the rich result)
- **"Warning"** items are OK to ignore for the S36 schema set; they're usually Google suggesting extra fields (e.g. "Add a `dateModified`" when `datePublished` is enough)
- The FAQ section is expandable in the test preview and matches the visible accordion

If the test reports a schema parse error, look at the live page's `<script type="application/ld+json">` block (view-source) and paste the JSON into https://validator.schema.org/ to get a precise line number.

## 3. IndexNow / Bing (instant indexing)

IndexNow is the free protocol Bing + Yandex use to index URLs within minutes instead of days. The site has a static sitemap; the fastest path is to ping IndexNow directly after publishing a post.

```bash
# Generate the IndexNow key (one-time, see below)
KEY=$(openssl rand -hex 16)
echo "IndexNow key: $KEY"
# 1. Save it as a text file at the site root, e.g.
#    public/<KEY>.txt containing only the key string
# 2. Submit the key + URLs to https://www.bing.com/indexnow

# Submit (after deploying the key file)
curl -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d "{
    \"host\": \"sica.com.cn\",
    \"key\": \"$KEY\",
    \"keyLocation\": \"https://sica.com.cn/$KEY.txt\",
    \"urlList\": [
      \"https://sica.com.cn/news/<slug>\"
    ]
  }"
```

Google doesn't accept IndexNow directly but will discover Bing's index; Bing's indexing is the most reliable early signal for the 7-30 day window before Google crawls.

## 4. Sitemap

`/sitemap.xml` is generated server-side by `src/app/sitemap.ts` and already includes:

- Static pages (`/`, `/universities`, `/programs`, `/scholarships`, ...)
- Programmatic SEO hubs (`/study-in-china`, `/scholarships-for`, `/guides`)
- Per-city, per-country, per-discipline URLs
- All `news_posts` where `status = 'published'` (capped at 500)
- University compare pairs, per-program scholarship subpages, etc.

Verify after any schema change:

```bash
curl -s https://sica.com.cn/sitemap.xml | head -100
curl -s https://sica.com.cn/sitemap.xml | grep -c "<loc>"
```

## 5. Manual post-by-post checks (3 example URLs)

Pick 3 published posts and run the test suite. Spot-check both:
- A long-form scholarship post (should have FAQ + sources)
- A short announcement (might be light on FAQ, that's OK)
- A partnership post

If all three pass Google's Rich Results Test, the system is healthy. If any fail, paste the failing URL into the Rich Results Test for the precise error.

## 6. LLMO / GEO (LLM citation) checks

This is the slowest to verify but the most valuable. After a few weeks of crawl:

1. Open ChatGPT or Perplexity, ask: "What's the latest from SICA news about [topic covered in a recent post]?". If the post has the visible TL;DR + at-a-glance + sources, the answer should reference specific facts from the post with attribution. If it returns vague or wrong answers, the structured fields need denser / more atomic content.
2. Google "site:sica.com.cn/news" — count the number of posts indexed. This is the AEO/SEO health check. If 0-2 of your 5 posts are indexed, submit them via Search Console's URL Inspection → Request Indexing.
3. Track LLM referral traffic in analytics (utm parameters on LLM-bot user agents if you can). ChatGPT's crawler is `GPTBot`; Perplexity is `PerplexityBot`; Claude is `ClaudeBot`. Allow them in robots.txt and watch for traffic.

## 7. Common regressions to watch for

| Symptom | Likely cause |
|---|---|
| FAQPage not detected by Google | A Q&A has `question` or `answer` as empty / non-string. Run the audit endpoint. |
| Article not detected | `published_at` is null on a published post (e.g. status flipped from draft without setting it) |
| Search result has truncated title | `seo_title` > 65 chars; audit endpoint flags this |
| Sitemap missing a new post | `news_posts.status` is not `'published'`; or sitemap cache hasn't refreshed (`revalidate = 3600` so up to 1h) |
| LLM gives wrong answer despite a post existing | The `at_a_glance` values are too long / are sentences instead of atomic facts. LLMs extract short values much better than long ones. |
| New posts not indexed in Google | Old sitemap. Re-ping IndexNow after any large publish batch. |

# University profiles — 10 GEO-optimized articles plan

A new cluster of 10 deep GEO pages — one per university — built to
capture long-tail search traffic for individual Chinese universities.
Each page is a comprehensive profile (history, programs, admissions,
international student realities, scholarships, practical tips) optimized
for the "[university name] + admission / programs / international students /
scholarships" query family that drives a large share of study-in-China intent.

**The 10 universities** (selected for breadth of geography + program mix +
search volume):

| # | University | Why this one |
|---|---|---|
| 1 | Peking University (北大) | #1 most-searched Chinese university; humanities + sciences; Beijing |
| 2 | Tsinghua University (清华) | #2 most-searched; engineering powerhouse; Beijing |
| 3 | Fudan University (复旦) | #3 most-searched; humanities + sciences + medicine; Shanghai |
| 4 | Shanghai Jiao Tong University (上海交大) | Engineering + medicine; Shanghai; high international intake |
| 5 | Zhejiang University (浙大) | Hangzhou; strong research output + international programs |
| 6 | Nanjing University (南大) | Nanjing; strong humanities + sciences; historic prestige |
| 7 | University of Science and Technology of China (USTC, 中科大) | Hefei; #1 physics/sciences; CAS-affiliated |
| 8 | Wuhan University (武大) | Wuhan; strong sciences + large international programs |
| 9 | Sun Yat-sen University (中山大学) | Guangzhou; strong medicine + business; Pearl River Delta |
| 10 | Harbin Institute of Technology (HIT, 哈工大) | Harbin; engineering powerhouse; strong Belt-and-Road international intake |

**GEO optimization per page** — the angle that makes these
"static article GEO pages" rather than ranking listicles:

1. **Per-university deep structured data** — each page is its own
   `WebPage` + `Organization` + `EducationalOrganization` JSON-LD block;
   the same `GuidePage` component already emits `Article` + FAQPage +
   HowTo, so each page carries 4 JSON-LD graphs that help search and
   AI search engines extract specific facts.
2. **Question-shaped H2s throughout** — admissions-officer style
   "Does X offer English-taught programs?", "What is the tuition for
   international students?", "How does Y compare to other Chinese
   universities?" — direct extractable answers in the FAQ + section
   intros.
3. **Snippet-style declarative answers** at the start of every section
   (per the AEO/GEO authoring pattern in `src/lib/guides/types.ts`).
4. **Self-contained answer blocks** — each page stands alone; the
   per-university profile covers the same 8 sections in the same order
   so cross-linking across profiles is one-to-one.
5. **Cross-linking mesh** — every page's `related` array points to:
   the flagship study-in-china guide, the CSCA flagship (since the
   exam applies to most), the CSC scholarship guide (since the topic
   is asked), the 2–3 most-likely peer universities (so users hop
   between profiles), and one program-specific guide where relevant
   (e.g., MBBS for medical programs).

**Standard per-university section structure** (identical for all 10;
the content differs):

1. **Overview** — what the university is, in 4–6 sentences
2. **History** — founded when, key turning points, current scale
3. **Academics** — schools/colleges, signature disciplines, English-taught programs
4. **Admissions for international students** — CSCA combinations, language requirements, application channels, deadlines
5. **Scholarships** — CSC + university-specific + program-specific
6. **Cost of attendance** — tuition, dorm, living costs (approximate)
7. **Student life** — campus, city, international community
8. **FAQs** — 10 per-page, each answering a question-shaped, extractable query
9. **HowTo steps** — 6 per-page, admissions-process steps
10. **Related** — 4–6 cross-links (peer universities + the cluster-wide guides)

**Article pattern** (identical to CSCA + study-in-china clusters):
bilingual `LocalizedGuide` module in `src/lib/guides/<slug>.ts` + top-level
`force-static` RSC page at `src/app/<slug>/page.tsx` + en+zh hub card on
`/guides` (category `process`, icon from `hub-types.ts` — likely `landmark`
or `building-2` for the flagship universities; will use the same icon for
all 10 to keep the hub visually consistent) + sitemap entry (priority 0.8).

**Standing rules** (continued)
- Bilingual content with identical `id`s for ToC anchors so zh mirrors
  en section-for-section.
- Per-university facts (founding date, schools count, international
  student count, scholarship names) framed as "as published in
  official university sources; verify before publication" — these numbers
  evolve but the SEO claims (long-form profile, English programs, etc.)
  are evergreen.
- No invented rankings or score claims; flag any number with its
  source year.
- No DB, no env, no i18n-table changes.
- Icons: use `landmark` for all 10 (already in `hub-types.ts`).

**Batching** (5 + 3 + 2 to spread the commit sizes):

- **Batch 1 (B1, #1–5)** — Peking, Tsinghua, Fudan, Shanghai Jiao Tong,
  Zhejiang — the 5 highest-search-volume flagships.
- **Batch 2 (B2, #6–8)** — Nanjing, USTC, Wuhan — historic + sciences.
- **Batch 3 (B3, #9–10)** — Sun Yat-sen, Harbin — medicine + engineering.

**Status legend** (filled as each batch ships)
- B1 → Phase 122
- B2 → Phase 123
- B3 → Phase 124

**Standing maintenance rule**

- The 10 profile facts (founding dates, school counts, international
  student counts) should be re-verified against each university's own
  international student page before each subsequent batch. Search
  engines reward freshness on factual claims.
- Avoid restating the same fact across multiple profiles — each profile
  is distinct on what makes that university different.

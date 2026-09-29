# Flagship university admissions — 5 deep-dive guides

A focused 5-article cluster that complements the 10 university-profile
pages shipped in Phases 122–124 (`docs/university-profiles-10-article-plan.md`).

**Why these exist** — the profile pages cover "everything about the
university" (history, schools, signature programs, scholarships, cost,
student life). What they do NOT cover with depth is **the admissions
process itself** — the actual step-by-step of *how* to apply, *what*
documents to send, *when* each deadline falls, *which* CSCA combination
each school asks for, *how* to position the study plan, and *what*
makes a competitive applicant. This cluster is the operational deep-dive
that a student who has already decided to apply to Peking / Tsinghua /
Fudan / SJTU / ZJU would open to plan their application.

**Anti-duplication** — the profile pages already cover:
- History / heritage
- Schools and signature programs
- English-taught programs at a high level
- CSCA combinations at a high level (one table per university)
- Scholarships at a high level
- Cost of attendance

What this cluster adds (the deep-dive layer):
- Application **routes** (ISO portal vs CSC channel vs embassy channel) — which to pick and why
- Application **deadlines** at the level of early-round / regular / spring intake / rolling
- **Document checklist** with line items (not a generic "passport + transcripts")
- **CSCA strategy** broken down by school within the university (not a single table)
- **Language requirements** broken down by program type (HSK 4/5/6 vs IELTS 6.0/6.5/7.0 vs TOEFL 80/90/100)
- **Scholarship strategy** (when to apply for CSC, when to apply for the university's own scholarship, the university + provincial + municipal stack)
- **Interview prep** — what to expect, what to prepare
- **What makes a competitive applicant** — concrete profile components

**Article pattern** — identical to the existing university-profile cluster:
bilingual `LocalizedGuide` module in `src/lib/guides/<slug>.ts` + top-level
`force-static` RSC page at `src/app/<slug>/page.tsx` + en+zh hub card on
`/guides` (category `listicle`, icon `graduation-cap` to signal the
admissions-application angle vs the `landmark` icon used by profile pages) +
sitemap entry (priority 0.8). Gates per phase: `ts-check` against the
12-error baseline (0 new), `next build` green, all new routes registered.

**Standing rules** (continued from the existing clusters)
- Bilingual content with identical `id`s for ToC anchors so zh mirrors
  en section-for-section.
- Application facts are evergreen; verify deadline windows / scholarship
  names / language-test thresholds against the university's current
  international student office page each cycle.
- No DB, no env, no i18n-table changes for any article.
- Icons only from the existing `hub-types.ts` union (`graduation-cap` is
  already there — no new addition).

**Article inventory**

| # | Slug | Working title (EN) | Target queries | Angle | Batch |
|---|---|---|---|---|---|
| 1 | `peking-university-admissions-guide` | Peking University admissions — step-by-step guide for international students | "peking university admissions", "PKU application international", "apply PKU", "北大 申请" | PKU's application process, deadlines, documents, CSCA combinations by school, scholarship stack, what makes a competitive applicant | B1 |
| 2 | `tsinghua-university-admissions-guide` | Tsinghua University admissions — step-by-step guide for international students | "tsinghua admissions", "apply Tsinghua international", "Schwarzman application", "清华 申请" | Tsinghua's process + the Schwarzman Scholars separate application pathway | B1 |
| 3 | `fudan-university-admissions-guide` | Fudan University admissions — step-by-step guide for international students | "fudan admissions", "Fudan application international", "复旦 申请" | Fudan's process, the National College Student English Competition as a scholarship short-cut, the Hong Kong/Macau special pathway | B1 |
| 4 | `shanghai-jiao-tong-university-admissions-guide` | SJTU admissions — step-by-step guide for international students | "SJTU admissions", "UM-SJTU JI application", "Antai MBA international", "上海交大 申请" | SJTU's process + the UM-SJTU Joint Institute as a distinct admissions stream | B1 |
| 5 | `zhejiang-university-admissions-guide` | Zhejiang University admissions — step-by-step guide for international students | "ZJU admissions", "Zhejiang University application international", "浙大 申请" | ZJU's process, the International Business School (ZIBS) as an English-medium option, the Alibaba connection for internships | B1 |

**Section template** (used identically across all 5 — deep, not shallow)

| Section id | What it covers |
|---|---|
| `overview` | The admissions picture for this university in one paragraph |
| `application-routes` | Which channel: ISO portal / CSC / embassy / agency — the tradeoff matrix |
| `deadlines` | Early-round / regular / spring intake dates with concrete windows |
| `documents` | Line-item checklist: passport, transcripts, study plan (with word count), references (with rank requirements), language test, application fee, photos, physical examination |
| `csca-strategy` | Subject combinations by school within the university, in a table |
| `language-requirements` | HSK / IELTS / TOEFL thresholds by program level + waivers for native English speakers |
| `scholarship-stack` | The CSC + university-specific + provincial + municipal stack — what to apply for, when, how to stack |
| `interview-prep` | What to expect (online / in-person / academic / Chinese-language) + what to prepare |
| `profile-strength` | Concrete profile components that move borderline applicants to admit |

**Batching**

- **Batch 1 (B1, #1–5)** — All 5 flagship admissions deep-dives in a single
  Phase. Each is a deep, narrow guide (not a profile). 5 articles ×
  ~3,000–4,000 words each en+zh = ~30,000–40,000 words of new bilingual
  content. Single commit + AGENTS.md entry.

**Status legend** (filled as each batch ships)
- B1 → Phase 136 — SHIPPED 2026-09-29 (all 5 articles live)

**Standing maintenance rule**

- Application facts are evergreen; verify deadline windows / scholarship
  names / language-test thresholds against the university's current
  international student office page each cycle.
- Deadlines shift slightly year over year; flag the publication year of
  the windows used in each article.
- CSC and provincial/municipal scholarship amounts are stable but
  stipend rates may shift with MOE announcements; verify before each
  cycle.

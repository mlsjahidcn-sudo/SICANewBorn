# CSCA content plan — 20 articles (Phase 115+)

The CSCA (China Scholastic Competency Assessment) is China's new mandatory,
centrally-administered admissions exam for international bachelor's applicants,
effective from the 2026 intake. It is the biggest new SEO topic in the
study-in-China niche: search volume is growing, official information is
scattered across embassy notices and university pages, and no competitor has a
comprehensive cluster yet. This plan builds that cluster.

**Facts baseline** (verified Dec 2025 – Jan 2026 official sources: Chinese
embassy notices, BLCU/CUMT/GDUFS international college pages, Shanghai gov
FAQ, THE coverage). Re-verify date/fee tables against the official portal
(`csca.org.cn`) before publishing each article — dates and fees are
per-session and evolve:

- Mandatory for most international bachelor's applicants from the 2026 intake;
  CSC scholarship applicants must submit scores.
- 5 sessions/year. Inaugural global test Dec 21, 2025; 2026 included Jan 25 +
  Mar 15. Registration closes ~15 days before each test.
- Subjects: Professional Chinese — Humanities track or STEM track (80 MCQs,
  ~60 min); Mathematics (48 MCQs, compulsory for everyone); Physics (48);
  Chemistry (48). No calculators anywhere.
- Scoring: 100 points per subject; **no national pass mark** — each university
  sets its own cutoffs.
- Fees: ¥450 for 1 subject, ¥700 total for 2+ subjects (Alipay / WeChat Pay /
  bank transfer).
- Exemptions: Chinese-language program applicants with valid HSK 4; qualifying
  HSK can waive the Professional Chinese subject.

**Pattern per article** (identical to Phase 115 flagship):

1. `src/lib/guides/<slug>.ts` — bilingual `LocalizedGuide` (en + zh), full
   Guide shape: stats / quickAnswer / keyTakeaways / sections / faqs /
   howToSteps / CTA / related. Question-shaped H2s, snippet-style answer
   sentences, tables over prose (AEO/GEO per `types.ts` authoring notes).
2. `src/app/<slug>/page.tsx` — top-level RSC wrapper, `force-static`,
   `generateMetadata` + `<GuidePage guide={...} urlPath={'/' + slug}>`.
3. Hub card (en + zh) in `src/lib/guides/hub-data.ts` (category `listicle`,
   icon from `hub-types.ts` union).
4. Sitemap entry in `src/app/sitemap.ts` (landingPages block, priority 0.75–0.85).
5. Cross-link: every new article's `related` array must link the flagship
   `/csca-exam` + 2 topic neighbors; flagship's `related` grows as the
   cluster fills.
6. Gates: `npm run ts-check` 0 NEW errors (baseline 12 pre-existing), no new
   lint errors. One phase commit per batch (or per article if done
   incrementally), AGENTS.md changelog entry per phase.

## The 20 articles

| # | Slug (/prefix) | Working title (EN) | Target queries | Angle / key blocks | Batch |
|---|---|---|---|---|---|
| 1 | `csca-exam` | CSCA exam — complete guide | csca exam, china scholastic competency assessment | **SHIPPED (Phase 115)** flagship: what/who/subjects/scoring/dates/fees/HSK-diff/CSC requirement/register/prep/test-day | 115 |
| 2 | `csca-exam-dates` | CSCA exam dates & registration windows 2026–2027 | csca exam dates, csca registration deadline | 5-session calendar table, intake-backwards planner, session-choice decision table | ✅ 116 |
| 3 | `csca-exam-registration` | How to register for the CSCA — step-by-step | csca registration, csca sign up, csca portal | Portal walkthrough (8 steps), passport-name pitfalls, test-center selection, scam-agent warning | ✅ 116 |
| 4 | `csca-exam-fees` | CSCA exam fees & payment guide | csca exam fee, csca cost | ¥450/¥700 banding table, Alipay/WeChat/bank-transfer how-to for non-Chinese residents, refund policy caveats | ✅ 116 |
| 5 | `csca-exam-exemptions` | Who must take the CSCA — and who is exempt | csca exemption, csca hsk waiver | Mandatory-vs-exempt matrix, HSK 4 route, Professional-Chinese waiver, "get it in writing" checklist | ✅ 116 |
| 6 | `csca-mathematics-guide` | CSCA Mathematics — syllabus & prep | csca math, csca mathematics syllabus | Topic checklist vs A-Level/IB/AP overlap, 48-MCQ timing drills, no-calculator technique | ✅ 117 |
| 7 | `csca-physics-guide` | CSCA Physics — syllabus & prep | csca physics, csca physics syllabus | Mechanics→modern topic map, formula-sheet ban (memorization list), MCQ strategy | ✅ 117 |
| 8 | `csca-chemistry-guide` | CSCA Chemistry — syllabus & prep | csca chemistry | Inorganic/organic/physical split, who needs it (med/pharmacy/chem-eng), prep resources | ✅ 117 |
| 9 | `csca-humanities-chinese-guide` | CSCA Professional Chinese — Humanities track | csca humanities chinese, 人文中文 | 80-question format, academic-vocab builder (law/business/arts), HSK5+ bridging plan | ✅ 117 |
| 10 | `csca-stem-chinese-guide` | CSCA Professional Chinese — STEM track | csca stem chinese, 理工中文 | Technical-Chinese vocab for engineering/science, notation glossary, reading-speed drills | ✅ 117 |
| 11 | `csca-exam-preparation` | How to prepare for the CSCA — 8-week study plan | csca preparation, csca study guide | Week-by-week plan, mock-test assembly, score-improvement framework, SICA prep pack CTA | ✅ 117 |
| 12 | `csca-vs-hsk` | CSCA vs HSK — what's the difference | csca vs hsk, do i need hsk for csca | Side-by-side table, who needs which/both, exemption interplay, decision flowchart | ✅ 118 |
| 13 | `csca-vs-sat-a-level-ib` | CSCA vs SAT / A-Level / IB | csca vs sat, csca a-level equivalent | Comparison table, transferability, curriculum-style differences (Chinese HS MCQ style), gap-year candidates | ✅ 118 |
| 14 | `csca-scores-and-cutoffs` | CSCA scores explained — how universities set cutoffs | csca passing score, csca score report | 100-pt scale, no national pass mark, tier benchmarks (80+/70+/60s), score-report logistics | ✅ 118 |
| 15 | `csca-csc-scholarship` | CSCA for CSC scholarship applicants | csca scholarship, csc scholarship csca score | Jan–Apr deadline crunch timeline, session planning, no-score-no-shortlist rules | B4 |
| 16 | `csca-mbbs-applicants` | CSCA for MBBS & medicine applicants | csca mbbs, csca for medical students | Subject combo for med schools (Chem+Physics?), NMC/PMDC recognition context, med-school cutoff expectations | B4 |
| 17 | `csca-english-taught-programs` | Does the CSCA apply to English-taught programs? | csca english taught, csca international program | Yes-but nuance, IELTS/TOEFL stacking, which subjects English-track applicants sit | B4 |
| 18 | `csca-test-day-retakes` | CSCA test day & retake policy | csca test day, csca retake | Bring/leave lists, answer-sheet discipline, resit strategy, score-submission mechanics | B4 |
| 19 | `csca-faq` | CSCA exam — 50 frequently asked questions | csca faq, csca questions | 50-Q mega-page (superset of flagship FAQs), FAQPage JSON-LD via guide `faqs` array | B5 |
| 20 | `csca-partner-guide` | Advising clients on the CSCA — partner handbook | (partner-portal, low search volume) | For SICA partner agencies: client triage, subject-combo matrix, deadline calendar template | B5 |

## Batching

- **Batch 1 (B1, #2–5)** — the four logistics pillars. Highest immediate
  search demand (everyone registering for the next session lands here).
  **SHIPPED in Phase 116.**
- **Batch 2 (B2, #6–11)** — subject deep-dives. Longest articles; each can be
  its own phase or paired 2-per-phase. **SHIPPED in Phase 117.**
- **Batch 3 (B3, #12–14)** — comparison/decision content; converts readers
  from awareness to prep. **SHIPPED in Phase 118.**
- **Batch 4 (B4, #15–18)** — scenario pages; strong internal-link targets
  from flagship + CSC guide + MBBS guide.
- **Batch 5 (B5, #19–20)** — FAQ mega-page + partner handbook; do last so the
  FAQ can absorb corrections discovered while writing #2–18.

## Standing rules

- Never invent official exam dates for future sessions — link the official
  portal and label tables "as announced at launch / latest session".
- Fee values, exemption rules, and retake policy must carry a
  "confirm with your target university / official portal" qualifier.
- Keep DB-facing claims out; these are static content pages (no live-data
  blocks needed).
- zh versions mirror en section-for-section (same `id`s for ToC anchors),
  matching the Phase 115 flagship.

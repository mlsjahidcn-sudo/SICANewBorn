# Study-in-China guides — 20-article expansion plan

A second cluster of 20 long-form guides targeting three SEO opportunity zones
the existing site underserves: (1) personal-finance / daily-life deep dives
beyond the existing process guides, (2) the live **HSK 3.0 transition** (the
new syllabus became the official standard in July 2026 and the full format
switch is December 13, 2026 — the most time-sensitive SEO bet in the cluster),
and (3) university insights, application strategy, and student-life tips.

**Article pattern (identical to the CSCA cluster, Phases 115–120)** — bilingual
`LocalizedGuide` module in `src/lib/guides/<slug>.ts` + top-level
`force-static` RSC page wrapper at `src/app/<slug>/page.tsx` + en+zh hub card
on `/guides` (category `process` or `listicle`, icon from `hub-types.ts`)
+ sitemap entry (priority 0.8). Each article has its own `related` array
linking to neighbors and the relevant existing process guides.

**Standing rules**
- Bilingual content (en + zh) with identical `id`s for ToC anchors so zh
  mirrors en section-for-section.
- Date/price/policy figures get the same "verify on the official source"
  qualifier the cluster established for CSCA.
- HSK 3.0 numbers (vocabulary counts, dates, format rules) carry an
  explicit "as published in the 2025 revised standard; subject to update
  per cycle" flag in every claim — the rollout is live and is the most
  likely drift surface.
- No invented future dates; no fabrication of course/program details;
  no personally-identifiable student stories.
- Each phase ships as its own commit; gates per phase: `ts-check` against
  the 12-error baseline (0 new), `next build` green, all new routes
  registered static.
- Hub cards use only icons already in `hub-types.ts`; if a new icon is
  needed, add it to the union before the phase commit.

**Article inventory**

| # | Slug | Working title | Target queries | Angle | Batch |
|---|---|---|---|---|---|
| 1 | `open-chinese-bank-account` | How international students open a Chinese bank account | "open bank account china student", "中国银行 学生开户" | The most-searched banking gap: which bank, which app (or branch), required documents, monthly-fee traps, what a student needs vs what works in the first 30 days | ✅ 121 |
| 2 | `international-money-transfer-china` | Sending money to/from China — fees, apps, and the Alipay/WeChat Pay setup for foreigners | "send money china student", "alipay foreigner setup", "wechat pay international card" | The day-to-day payment reality for international students: setup playbook for Alipay/WeChat Pay, transfer fee comparison, common card-failure reasons | ✅ 121 |
| 3 | `china-mobile-internet-for-international-students` | Mobile data, eSIM, VPNs, and the apps that won't work without a Chinese phone number | "china esim international student", "china vpn student", "china mobile data tourist" | Pre-arrival setup: eSIM vs physical SIM, payment-app residency, the legitimate VPN discussion, the apps that fail without a CN number | ✅ 121 |
| 4 | `student-health-care-china` | Health insurance for international students in China | "china student health insurance", "international student insurance china" | Public vs university scheme vs private; what is/isn't covered; how to actually use it; mental health support on campus | ✅ 121 |
| 5 | `hsk-3-vs-hsk-2` | HSK 3.0 vs HSK 2.0 — what's changing and when | "hsk 3.0", "new hsk 2026", "hsk change" | The flagship comparison: 6→9 levels, vocabulary shift (40–60% reduction for 1–5), modern words, computer-based rollout, July 2026 standard / Dec 13, 2026 full format switch | B2 |
| 6 | `hsk-3-0-vocabulary-list` | HSK 3.0 vocabulary — what's on the list and what dropped | "hsk 3 vocabulary", "hsk word list", "hsk vocabulary" | Per-level word counts, starter modern-vocab lists, what to drop from old prep books, build your own list from the official 2025 syllabus | B2 |
| 7 | `hsk-3-0-speaking-writing` | Speaking and writing in HSK 3.0 — the new components | "hsk speaking", "hsk writing", "hsk 3.0 format" | The speaking component at Level 3+, the no-handwriting rule until Level 5, computer-based testing, what test centers to look for | B2 |
| 8 | `hsk-3-0-prep-timeline` | HSK 3.0 prep timeline — what to do at every stage of your application | "hsk prep schedule", "hsk 3.0 timeline" | Branched by where you are now: just heard about HSK 3.0 / already sat 2.0 / mid-prep; sequenced against intake deadlines | B2 |
| 9 | `best-cities-china-international-students-2026` | Best cities in China for international students — the 2026 list | "best cities china students", "中国留学 城市" | City comparison by cost, English program availability, international community, transit, climate — the city that fits your priorities | B3 |
| 10 | `china-university-rankings-explained` | How to read Chinese university rankings (QS, MOE, ShanghaiRanking) | "china university ranking", "qs ranking china", "moe ranking" | What each measures, why they disagree, which one to use for your decision, what they don't capture | B3 |
| 11 | `985-211-double-first-class-explained` | China's 985 / 211 / Double First Class — what the labels mean today | "985 211", "double first class", "211 universities" | The three-classification system demystified: history, current status, overlap, how admissions actually use them | B3 |
| 12 | `how-to-choose-a-china-university` | How to choose a Chinese university — beyond the rankings | "choose china university", "select university china" | The decision framework: accreditation (MOE list), English instruction availability, location, cost, scholarship probability — when rankings stop being the right input | B3 |
| 13 | `how-to-write-study-plan-china-applications` | The study plan (SOP) for Chinese university applications | "study plan china", "china sop", "personal statement china" | The 500–1,500-word SOP that wins the ranking past the CSCA screen: structure, what Chinese reviewers reward, the seven program-specific moves | B4 |
| 14 | `recommendation-letters-china-applications` | Recommendation letters for Chinese university applications | "recommendation letter china", "china university reference" | How to brief referees, what Chinese universities look for, the two-letter vs three-letter question, the timing-window for asking | B4 |
| 15 | `china-university-interview-prep` | Interview preparation for Chinese university admissions | "china university interview", "admission interview china" | The post-application interview becoming common for competitive programs: typical formats, the questions, what Chinese interviewers reward | B4 |
| 16 | `comparing-admission-offers-china` | Comparing admission offers — the deposit-math, conditions, and timeline | "china admission offer", "deposit deadline china", "compare china offers" | The decision after offers arrive: deposit math, condition clauses, transferring, deferring, what happens if you say no | B4 |
| 17 | `china-culture-for-international-students` | Chinese culture for international students — the do's and don'ts | "china culture international students", "中国留学 文化" | Food, language, hierarchy, money, relationships with professors, classroom etiquette — the unspoken rules that don't fit the orientation handout | B5 |
| 18 | `mental-health-support-china` | Mental health support for international students in China | "mental health china students", "china counseling international" | Campus counseling centers, hotlines, what works and what doesn't, when to use each | B5 |
| 19 | `staying-safe-in-china` | Safety for international students in China — everyday risks, scams, emergencies | "safety china international students", "china scams students", "china emergency numbers" | Everyday safety, the scams that target international students, emergency numbers, what to do when something goes wrong | B5 |
| 20 | `first-week-in-china-survival-guide` | The first week in China — the survival checklist | "first week china student", "china arrival checklist", "international student arrival" | The pre-arrival through first 7 days checklist: phone, bank, SIM, campus registration, housing, food, finding a doctor | B5 |

**Batching**

- **Batch 1 (B1, #1–4)** — Personal finance / daily life. Deep-dives beyond the
  existing process guides. Same cluster pattern; gates per phase.
  **SHIPPED in Phase 121.**
- **Batch 2 (B2, #5–8)** — HSK 3.0 transition. **High-priority SEO win**: the new
  syllabus became the official standard in July 2026 and the full format
  switch is December 13, 2026. Candidates searching "HSK 3.0" currently
  land on the existing `/guides/hsk` (which still describes 2.0). These four
  articles capture that wave. Phase 122.
- **Batch 3 (B3, #9–12)** — University insights. Data-backed listicles, same
  style as the existing best-* guides. Phase 123.
- **Batch 4 (B4, #13–16)** — Application strategy. Plays into the same pre-
  application funnel as `study-in-china-vs-russia-for-mbbs`. Phase 124.
- **Batch 5 (B5, #17–20)** — Student-life tips. Captures the cultural /
  practical tips-and-tricks demand. Phase 125.

**Status legend (filled as each batch ships)**

- B1 → Phase 121
- B2 → Phase 122
- B3 → Phase 123
- B4 → Phase 124
- B5 → Phase 125

**Cross-link mesh**

- Every new article's `related` array includes: the relevant existing
  process guide (`/guides/study-in-china`, `/guides/application`, etc.) + 1–2
  sibling articles in the same batch.
- The flagship study-in-china guide's `related` array stays small (≤3) to
  avoid bloat — like the CSCA flagship.
- New `/guides` hub card icons come only from the existing `hub-types.ts`
  union; if a new visual is needed, add it before the phase commit.

**Standing rules (continued)**

- DB-free, env-free, i18n-table-free for every new article (just like the
  CSCA cluster) — guide content lives in its own module, so a Chinese
  translation can evolve independently of the static page.
- Re-verify any HSK 3.0 numbers (vocabulary counts, dates, format rules)
  against the official HSK 3.0 sources every cycle before touching them
  — the rollout is the most likely drift surface in the whole cluster.

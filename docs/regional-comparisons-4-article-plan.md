# Regional Listicles + Flagship Comparisons — 4-Article Cluster Plan

Status legend: ⬜ queued · 🔨 in progress · ✅ shipped

| # | Slug | Angle | Status |
|---|------|-------|--------|
| 1 | `peking-university-vs-tsinghua` | The classic rivalry — subject-fit decision framework; Schwarzman vs Yenching as the symmetric elite callout | ✅ B1 → Phase 137 — SHIPPED 2026-09-30 |
| 2 | `peking-university-vs-fudan` | City-vs-city as much as uni-vs-uni; the calendar asymmetry (Fudan closes Dec–Mar, PKU runs Mar 31–May 31) as the operational hook | ✅ B1 → Phase 137 — SHIPPED 2026-09-30 |
| 3 | `best-universities-in-hong-kong` | Hybrid listicle + system explainer: HK is a separate admissions jurisdiction (no CSCA, no CSC, direct application, Sep–Nov rounds); mainland-vs-HK decision table routes budget-sensitive readers back to the mainland funnel | ✅ B1 → Phase 137 — SHIPPED 2026-09-30 |
| 4 | `best-universities-in-northeast-china` | The value region: four 985s (HIT, Jilin, DUT, NEU) + HEU/NENU niches at China's lowest living-cost tier; honest climate copy | ✅ B1 → Phase 137 — SHIPPED 2026-09-30 |

## Why this cluster

- Comparison ("X vs Y") and "best universities in [region]" queries are GEO favorites — AI engines cite structured side-by-side tables and explicit verdicts, which the `GuideBlock` table + callout blocks deliver natively.
- These 4 pages interlink the 15 pages shipped in Phases 122–136 (10 university profiles + 5 admissions deep-dives), tightening the internal-link mesh around the site's highest-authority cluster.
- The Hong Kong page captures an adjacent query family ("study in Hong Kong vs mainland") that competing study-in-China sites handle dishonestly — stating plainly that HK is a separate jurisdiction (no CSCA, no CSC, higher tuition) and offering a fair mainland-vs-HK comparison is both accurate and funnel-correct.

## Standing rules (inherited from the flagship-admissions + 20-article plans)

- Bilingual en/zh modules with identical section `id`s for ToC anchor parity.
- Evergreen content; every date/fee carries a verify-qualifier ("as published 2025/2026; verify against official sources") — especially Hong Kong tuition and deadlines.
- **No invented rankings** — tier language only ("China's top two; exact order varies by ranking and year"), never specific league-table numbers.
- Comparison facts must not contradict the shipped profiles/admissions guides — deadline bands, tuition bands, CSCA combinations, and scholarship stacks were pulled from those modules verbatim.
- `related` arrays ≤3, existing slugs only (grep against the route inventory before commit).
- No DB, no env, no i18n-table changes; icons from the existing `hub-types.ts` union only (`scale` for vs-pages, consistent with the 3 existing comparison pages; `building-2`, `map-pin` for regionals).
- Gates per phase: `npm run ts-check` 0 errors, clean `npx next build --webpack` with new routes static, live smoke HTTP 200 + zh parity, single commit + push to main.

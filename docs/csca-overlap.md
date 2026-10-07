# CSCA content split: SICA vs cscaprep.academy

**Date:** 2026-10-08 (Phase 146)
**Rule:** SICA = **admissions decisions** (which universities require the CSCA, scholarship links, MBBS context, application timelines). CSCA Prep (https://cscaprep.academy) = **exam content and practice** (dates detail, syllabus, mocks, study plans).

Search data behind the split (GSC 2026-07-05 → 10-04): on date queries CSCA Prep wins clearly ("csca exam dates 2027": CSCA Prep pos 2.81 / 159 impr / 22 clicks vs SICA pos 7.11 / 9 impr). On fee queries SICA wins (125-impression cluster at pos ~7 vs CSCA Prep's 1 impression). Most SICA `/csca-*` pages have <40 impressions or none.

## Decision table

| SICA URL | Decision | Target / note |
|---|---|---|
| `/csca-exam` (hub) | **Keep + fix** | SICA's CSCA admissions hub; first paragraph uses the verified facts table. CSCA Prep box auto-renders (urlPath-derived). |
| `/csca-exam-fees` | **Keep + fix** | SICA's strongest CSCA page (fees win on SICA). Rewritten 2026-10-08: RMB 450/700 official band, subject-count fix, payment channels `[verify]`, unsourced comparison table removed. |
| `/csca-exam-dates` | **Option A — rewrite** | Admissions-angle rewrite: verified 6-sitting calendar + "which sitting fits your intake". Exam-detail queries defer to https://cscaprep.academy/exam-dates (in-content callout). Event JSON-LD for the 3 confirmed sittings. |
| `/csca-mbbs-applicants` | **Keep + fix** | CSCA Prep box auto-renders. |
| `/csca-csc-scholarship` | **Keep + fix** | CSCA Prep box auto-renders. |
| `/csca-english-taught-programs` | **Keep + fix** | CSCA Prep box auto-renders. |
| `/csca-exam-exemptions` | **Keep + fix** | CSCA Prep box auto-renders. |
| `/csca-scores-and-cutoffs` | **Keep + fix** ("what universities ask for" angle) | CSCA Prep box auto-renders. |
| `/csca-exam-registration` | Keep (light) | CSCA Prep box auto-renders; content is registration-logistics — revisit if CSCA Prep adds a registration walkthrough. |
| `/csca-faq` | Keep (light) | CSCA Prep box auto-renders. |
| `/csca-humanities-chinese-guide` | Keep (light) | Professional Chinese is also an admissions decision (which programs require it). CSCA Prep box auto-renders. |
| `/csca-stem-chinese-guide` | Keep (light) | Same as above. |
| `/csca-test-day-retakes` | Keep (light) | CSCA Prep box auto-renders. |
| `/csca-vs-hsk` | Keep (light) | CSCA Prep box auto-renders. |
| `/csca-vs-sat-a-level-ib` | Keep (light) | CSCA Prep box auto-renders. |
| `/csca-partner-guide` | Keep (light) | Partner/counselor audience, SICA-specific. CSCA Prep box auto-renders. |
| `/csca-mathematics-guide` | **Option C — 301** | → https://cscaprep.academy/guides/mathematics (pure syllabus/prep; ~0 impressions on SICA) |
| `/csca-physics-guide` | **Option C — 301** | → https://cscaprep.academy/guides/physics |
| `/csca-chemistry-guide` | **Option C — 301** | → https://cscaprep.academy/guides/chemistry |
| `/csca-exam-preparation` | **Option C — 301** | → https://cscaprep.academy/csca/study-plan-12-week |

Options (from the 2026-10-08 SEO brief):
- **Option A (rewrite):** short admissions-angle page + prominent link to the CSCA Prep equivalent.
- **Option B (cross-domain canonical):** `rel=canonical` to the CSCA Prep page — only when content is near-identical. Not used.
- **Option C (301):** permanent redirect. Used for pure-prep pages with ~0 SICA impressions.

## Implementation notes

- The 4 Option-C redirects live in `next.config.ts` (`statusCode: 301`); the page directories and guide data files were deleted in Phase 146; the sitemap entries were removed.
- Every remaining `/csca-*` page renders the "Practise free on CSCA Prep →" box (link: `https://cscaprep.academy/signup?utm_source=sica&utm_medium=csca_page`) automatically — `<GuidePage>` derives it from the `/csca-` urlPath prefix; the `showCscaPrepCallout` prop overrides.
- Verified CSCA facts (organizer = CSC / csca.cn / RMB 450+700 / 6 sittings / next 14-15 Nov 2026 with registration 15-21 Oct Beijing time / mainly online at home) live in the guides' copy and the `/csca-exam-dates` Event JSON-LD.

## Open items for Jahid

- [ ] Mar/Apr/Jun 2027 exact sitting dates — publish when csca.cn announces them.
- [ ] Payment channels on csca.cn checkout (Alipay / WeChat / bank transfer `[verify]`).
- [ ] Results SLA ("within 10 working days" `[verify]`).
- [ ] Whether CSCA Prep wants reciprocal links back to SICA's admissions pages.

# SICA Enhancement Plan — Phased Roadmap

**Project:** SICA (Study in China Academy) Next.js platform  
**Review date:** 2026-08-12  
**Scope:** Public marketing site + admin/partner/student portals  
**Goal:** Ship incremental, low-risk improvements that build on the recent server-rendered list pages, with clear phase boundaries and success gates.

---

## Phase guide

- **Effort:** small = hours–1 day; medium = 2–4 days; large = 1–2 weeks.
- **Impact:** high = materially moves SEO/conversion/operations; medium = noticeable UX/quality gain; low = polish or internal-only.
- Phases are ordered by dependency and risk. Parallel work is noted where safe.

---

## Phase 1 — Performance & SEO Foundation
**Theme:** Eliminate remaining client-only data fetches and add branded loading/error surfaces.  
**Estimated duration:** 1.5–2 weeks  
**Overall impact:** high

| # | Item | Problem | Solution | Files/modules | Effort | Impact |
|---|------|---------|----------|---------------|--------|--------|
| 1.1 | Server-render university detail pages | `/universities/[slug]/page.tsx` is `'use client'` and fetches in `useEffect`, blocking first paint. | Convert to RSC; call `getUniversities()` / `getUniversityBySlug()`. Move tabs/gallery into client islands. Add `generateMetadata()` and `CollegeOrUniversity` JSON-LD. | `src/app/universities/[slug]/page.tsx`, `src/lib/university-queries.ts` | large | high |
| 1.2 | Server-render program detail pages | `/programs/[slug]/page.tsx` has the same client-fetch delay. | Convert to RSC; call `getPrograms()`. Move interactive tabs to client islands. Add `generateMetadata()` and `Course` JSON-LD. | `src/app/programs/[slug]/page.tsx`, `src/lib/program-queries.ts` | large | high |
| 1.3 | Server-render scholarships list | `/scholarships/page.tsx` fetches on mount and has no URL-synced filters. | Create `getScholarships()` helper, async server page, and `ScholarshipsClient` with `useUrlState`, active-filter pills, and clear-all. | `src/app/scholarships/page.tsx`, new `_components/scholarships-client.tsx`, `src/hooks/use-url-state.ts` | medium | high |
| 1.4 | Add App Router loading/error/not-found boundaries | No branded `loading.tsx`, `error.tsx`, or `not-found.tsx` files exist. Portal pages show inline spinners and generic 404s. | Add root `error.tsx` + `not-found.tsx`; add portal-level `loading.tsx` skeletons for `/admin`, `/partner`, `/student`. | `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/admin/loading.tsx`, `src/app/partner/loading.tsx`, `src/app/student/loading.tsx` | small | medium |

**Phase 1 success gates**
- `npm run validate` clean.
- Lighthouse LCP improves on `/universities/[slug]` and `/programs/[slug]`.
- No regression in client-side filtering UX on list pages.

---

## Phase 2 — Scale & API Hardening
**Theme:** Make public data fast under load and make API inputs predictable.  
**Estimated duration:** 2–2.5 weeks  
**Overall impact:** high  
**Dependencies:** Phase 1 (so public RSC fetchers exist to cache).

| # | Item | Problem | Solution | Files/modules | Effort | Impact |
|---|------|---------|----------|---------------|--------|--------|
| 2.1 | Runtime caching + revalidation | Every request hits Supabase; no cross-request caching. | Wrap `getUniversities`, `getPrograms`, `getScholarships`, and public API routes with `unstable_cache` + cache tags. Trigger `revalidateTag` from admin/partner mutations. | `src/lib/university-queries.ts`, `src/lib/program-queries.ts`, public API routes, admin/partner mutation routes | large | high |
| 2.2 | Standardize API input validation with Zod | Routes parse bodies/params manually; errors are inconsistent. | Create `src/lib/validators/*.ts` schemas per domain. Validate every API route and return structured 400s. Re-use schemas client-side where possible. | new `src/lib/validators/*.ts`, all `src/app/api/**/route.ts` files, some form components | large | medium-high |

**Phase 2 success gates**
- `npm run validate` clean; `npm test` passing.
- Public API TTFB improves under repeated requests.
- Invalid API payloads return consistent `{ error, details }` shapes.

---

## Phase 3 — Partner Monetization
**Theme:** Unlock the commission data model with partner-facing reports and admin payout workflow.  
**Estimated duration:** 1.5–2 weeks  
**Overall impact:** high  
**Dependencies:** None (data model already exists), can run parallel with Phase 2 after it starts.

| # | Item | Problem | Solution | Files/modules | Effort | Impact |
|---|------|---------|----------|---------------|--------|--------|
| 3.1 | Partner commission report | Partners cannot see expected vs. paid commissions. | Create `/partner/commissions` page with status breakdown (Accepted / Withdrawn / Rejected) and remaining amounts. | `src/app/partner/commissions/page.tsx`, new `/api/partner/commissions/route.ts`, partner sidebar | medium | high |
| 3.2 | Admin commission payout workflow | Admins track payouts manually outside the app. | Create `/admin/commissions` page with per-partner totals, payout table, and “Mark as paid” action. Update `paid_amount`/`paid_at` and log timeline event. | `src/app/admin/commissions/page.tsx`, new `/api/admin/commissions/route.ts`, admin sidebar, possible DB migration for `paid_at`/`commission_notes` | large | high |
| 3.3 | Partner dashboard commission card | Partners lack an at-a-glance commission summary. | Add commission summary card on `/partner` dashboard. | `src/app/partner/page.tsx` | small | medium |

**Phase 3 success gates**
- Commission totals match DB calculations.
- Payout actions write audit-friendly timeline events.
- `npm run validate` clean.

---

## Phase 4 — Student Success
**Theme:** Reduce friction in document uploads and prevent missed deadlines.  
**Estimated duration:** 1–1.5 weeks  
**Overall impact:** high  
**Dependencies:** Can run parallel with Phase 2 and Phase 3.

| # | Item | Problem | Solution | Files/modules | Effort | Impact |
|---|------|---------|----------|---------------|--------|--------|
| 4.1 | Document upload validation & progress | File type/size checks are inconsistent; no upload progress indicator. | Add client-side validation (whitelist, max size) and progress UI. Harden server endpoint with matching validation. | Document upload components, `/api/student/documents/route.ts`, `/api/upload/transcript/route.ts` | medium | high |
| 4.2 | Deadline reminders | Students miss deadlines without automated nudges. | Add daily cron that creates `student_notifications` for approaching deadlines or `Documents Requested` status. | New cron route, `src/lib/email.ts`, possible DB migration for `student_applications.deadline` | medium | high |

**Phase 4 success gates**
- Invalid uploads are rejected with clear messages on both client and server.
- Cron runs idempotently and creates only unread notifications.
- `npm run validate` clean.

---

## Phase 5 — Admin Operations & Insights
**Theme:** Give the admissions team a conversion funnel and trend view.  
**Estimated duration:** 1 week  
**Overall impact:** medium  
**Dependencies:** Phase 2 API validation recommended before adding new admin API.

| # | Item | Problem | Solution | Files/modules | Effort | Impact |
|---|------|---------|----------|---------------|--------|--------|
| 5.1 | Admin funnel / reporting page | Admin dashboard shows counts but no funnel or trends. | Create `/admin/reports` with time-series charts for lead sources, application volume by status, acceptance rate, partner vs. online split. | `src/app/admin/reports/page.tsx`, new `/api/admin/reports/funnel/route.ts`, chart wrappers, admin sidebar | medium | medium |

**Phase 5 success gates**
- Charts render from SQL aggregates.
- Date-range filters work without full-table scans.
- `npm run validate` clean.

---

## Phase 6 — SEO Polish & Globalization
**Theme:** Improve crawl context and complete admin i18n.  
**Estimated duration:** 1 week  
**Overall impact:** medium  
**Dependencies:** Phase 1 detail pages (so breadcrumbs/JSON-LD can be added there).

| # | Item | Problem | Solution | Files/modules | Effort | Impact |
|---|------|---------|----------|---------------|--------|--------|
| 6.1 | Breadcrumbs + structured data | Detail/list pages lack breadcrumb UI and `BreadcrumbList` JSON-LD. | Build `Breadcrumb` component and helper; wire into university, program, scholarship, guides, and hub pages. | New breadcrumb component, structured-data helper, detail/list pages | small | medium |
| 6.2 | Complete admin portal i18n | Admin create/edit forms and bulk dialogs still have hard-coded English. | Finish `adminForms.*`, `adminCommon.*`, `adminBulk.*` namespaces; replace hard-coded strings. | `src/lib/i18n-translations.ts`, remaining `src/app/admin/**/page.tsx`, shared admin components | medium | low-medium |

**Phase 6 success gates**
- Rich-results test passes on sample detail pages.
- i18n drift test passes.
- `npm run validate` clean.

---

## Phase 7 — Quality Assurance
**Theme:** Add regression safety for revenue-critical flows.  
**Estimated duration:** 2–2.5 weeks  
**Overall impact:** high  
**Dependencies:** Best done after Phases 1–4 stabilize the API surface.

| # | Item | Problem | Solution | Files/modules | Effort | Impact |
|---|------|---------|----------|---------------|--------|--------|
| 7.1 | API route tests | No coverage for API handlers. | Add vitest + MSW tests for key routes. | New `src/app/api/**/*.test.ts`, `vitest.config.ts` | medium | high |
| 7.2 | End-to-end tests | No e2e coverage for critical flows. | Add Playwright specs for student application + document upload, partner creates student + application, admin status change + notification. | New `e2e/` directory, CI workflow | large | high |

**Phase 7 success gates**
- `npm test` and `npx playwright test` pass locally and in CI.
- New tests cover at least the three critical flows above.
- `npm run validate` clean.

---

## Suggested overall schedule

| Phase | Focus | Duration | Can run in parallel with |
|-------|-------|----------|--------------------------|
| Phase 1 | Performance & SEO Foundation | 1.5–2 weeks | — |
| Phase 2 | Scale & API Hardening | 2–2.5 weeks | Phase 3, Phase 4 |
| Phase 3 | Partner Monetization | 1.5–2 weeks | Phase 2, Phase 4 |
| Phase 4 | Student Success | 1–1.5 weeks | Phase 2, Phase 3 |
| Phase 5 | Admin Operations & Insights | 1 week | Phase 6 |
| Phase 6 | SEO Polish & Globalization | 1 week | Phase 5 |
| Phase 7 | Quality Assurance | 2–2.5 weeks | — (after APIs stabilize) |

**Total estimated calendar time:** 6–8 weeks with parallel tracks.

---

## Global implementation gates

Every phase must pass these before merge:

- `npm run ts-check` at 0 errors.
- `npm run lint:build` clean (no new warnings).
- `npm test` passing; add tests for new code.
- Production build succeeds (`npx next build`).
- For data-model changes: add a migration under `database/` and note it in `AGENTS.md`.
- For SEO changes: validate structured data with a schema validator.

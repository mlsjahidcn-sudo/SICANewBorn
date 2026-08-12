# SICA Enhancement Plan

**Project:** SICA (Study in China Academy) Next.js platform  
**Review date:** 2026-08-12  
**Scope:** Public marketing site + admin/partner/student portals  
**Goal:** Prioritized, concrete improvements that build on the recent performance fixes (server-rendered list pages, shared server query helpers) without destabilizing the current ship.

---

## How to read this plan

- **Effort:** small = hours–1 day; medium = 2–4 days; large = 1–2 weeks.
- **Impact:** high = materially moves SEO/conversion/operations; medium = noticeable UX/quality gain; low = polish or internal-only.
- Each item lists the files/modules that would change so the implementer knows where to start.

---

## Enhancement opportunities

### 1. Convert university & program detail pages to server components
**Category:** Performance & UX + SEO  
**Problem:** `src/app/universities/[slug]/page.tsx` and `src/app/programs/[slug]/page.tsx` are `'use client'` pages that fetch data in `useEffect`. First paint is blocked by network round trips, and per-page metadata / JSON-LD only ships after hydration.  
**Proposed solution:** Make the detail shells RSCs that call the shared fetchers (`getUniversities`, `getPrograms`). Move only the interactive parts (tabs, gallery carousel) into small client islands. Add `generateMetadata()` and `CollegeOrUniversity` / `Course` JSON-LD to the initial HTML. Use `export const revalidate = 60` for freshness.  
**Files/modules affected:** `src/app/universities/[slug]/page.tsx`, `src/app/programs/[slug]/page.tsx`, `src/lib/university-queries.ts`, `src/lib/program-queries.ts`, related layout files.  
**Effort:** large  
**Expected impact:** high (faster first paint, better crawlability, richer SERP snippets)

### 2. Server-render the scholarships list and URL-sync its filters
**Category:** Performance & UX  
**Problem:** `src/app/scholarships/page.tsx` still fetches `/api/scholarships` on mount with an empty initial render, and its filters (type, level, sort, search) are not URL-synced, so filtered views cannot be shared or deep-linked.  
**Proposed solution:** Mirror the universities/programs pattern: an async server page fetches `getScholarships()` and passes the list to a new `ScholarshipsClient` component that uses `useUrlState` for filters. Add active-filter pills and a clear-all CTA.  
**Files/modules affected:** `src/app/scholarships/page.tsx`, new `src/app/scholarships/_components/scholarships-client.tsx`, `src/hooks/use-url-state.ts`, scholarship query helper.  
**Effort:** medium  
**Expected impact:** high (removes last major client-only list page, improves SEO and shareability)

### 3. Add runtime caching + revalidation for public read APIs and RSC fetchers
**Category:** Data & backend  
**Problem:** The shared query helpers currently hit Supabase on every request. Under traffic spikes this is the next bottleneck.  
**Proposed solution:** Wrap public fetchers and public API routes with Next.js `unstable_cache` keyed by entity + locale, with `revalidate` windows and cache tags (`universities`, `programs`, `scholarships`, `news`, `admission-notices`). Trigger `revalidateTag` from admin/partner mutation endpoints after creates/updates/deletes. Start with read-heavy public endpoints and expand to portal dashboards.  
**Files/modules affected:** `src/lib/university-queries.ts`, `src/lib/program-queries.ts`, public API routes, admin/partner mutation routes, `next.config.ts` if cache headers needed.  
**Effort:** large  
**Expected impact:** high (reduces Supabase load, improves TTFB, protects against traffic spikes)

### 4. Standardize API input validation with Zod
**Category:** Data & backend + Quality  
**Problem:** API routes parse JSON bodies and query params manually. Validation is inconsistent: some routes silently fall back, some return generic “Invalid request body”, and type coercion is ad hoc.  
**Proposed solution:** Introduce `src/lib/validators/` schemas for each domain using zod. Update every API route to validate `request.json()` and `URLSearchParams` against the schema and return a structured `{ error, details }` 400 response. Re-use the same schemas on the client for pre-flight validation where possible.  
**Files/modules affected:** new `src/lib/validators/*.ts`, all `src/app/api/**/route.ts` files, some form components.  
**Effort:** large  
**Expected impact:** medium-high (fewer runtime errors, cleaner errors for users, easier maintenance)

### 5. Build partner commission reporting and admin payout workflow
**Category:** Partner portal + Admin portal  
**Problem:** `partner_applications` already stores `commission_eligible`, `expected_commission`, `paid_amount`, and `currency`, but there is no partner-facing commission report or admin workflow to track/mark payouts.  
**Proposed solution:** Add a `/partner/commissions` page showing expected vs. paid vs. remaining by status. Add an `/admin/commissions` page with a payout table, per-partner totals, and a “Mark as paid” action that updates `paid_amount`/`paid_at` and logs a timeline event. Surface a commission summary card on the partner dashboard.  
**Files/modules affected:** `src/app/partner/commissions/page.tsx`, `src/app/admin/commissions/page.tsx`, new API routes, partner dashboard, possible DB migration to add `paid_at`/`commission_notes`.  
**Effort:** large  
**Expected impact:** high (unlocks partner monetization visibility and reduces manual reconciliation)

### 6. Add document upload validation, progress UI, and deadline reminders
**Category:** Student portal  
**Problem:** The student document uploader does not enforce file type / size consistently across client and server, shows no upload progress, and students have no automated reminders as application deadlines approach.  
**Proposed solution:** Add client-side file validation (type whitelist, max size) and a progress bar in the document uploader. Harden the server endpoint with matching validation. Add a daily cron that creates `student_notifications` rows for applications approaching their deadline or with status `Documents Requested`.  
**Files/modules affected:** document upload components, `/api/student/documents/route.ts`, `/api/upload/transcript/route.ts`, new cron route, `src/lib/email.ts`, possible DB migration for `student_applications.deadline`.  
**Effort:** medium  
**Expected impact:** high (fewer bad uploads, fewer missed deadlines, better student experience)

### 7. Add admin funnel / reporting page
**Category:** Admin portal  
**Problem:** The admin dashboard shows counts and recent rows but no conversion funnel or trend view (e.g. leads → applications → accepted over 7/30/90 days).  
**Proposed solution:** Create `/admin/reports` with time-series charts (recharts is already a dependency) for lead sources, application volume by status, acceptance rate, and partner vs. online split. Add an API that aggregates in SQL where possible.  
**Files/modules affected:** `src/app/admin/reports/page.tsx`, new `/api/admin/reports/funnel/route.ts`, chart wrappers, admin sidebar.  
**Effort:** medium  
**Expected impact:** medium (better operational visibility for the admissions team)

### 8. Add App Router loading, error, and not-found boundaries
**Category:** Performance & UX  
**Problem:** There are no `loading.tsx`, `error.tsx`, or `not-found.tsx` files in the app tree. Portal pages show inline spinners; detail pages fall back to plain text; 404s are generic.  
**Proposed solution:** Add a branded root `error.tsx` and `not-found.tsx`. Add portal-level `loading.tsx` skeletons (`/admin`, `/partner`, `/student`) that match each portal’s card/sidebar layout. Keep existing inline error states for granular feedback.  
**Files/modules affected:** `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/admin/loading.tsx`, `src/app/partner/loading.tsx`, `src/app/student/loading.tsx`.  
**Effort:** small  
**Expected impact:** medium (polished UX, faster perceived load, better error recovery)

### 9. Add breadcrumb navigation and BreadcrumbList structured data
**Category:** SEO & marketing  
**Problem:** Detail and list pages lack breadcrumb UI and `BreadcrumbList` JSON-LD, missing an easy internal-linking and SERP enhancement opportunity.  
**Proposed solution:** Build a small `Breadcrumb` component and a structured-data helper. Wire it into university detail, program detail, scholarship detail, guides hub, and the majors/city/country hub pages.  
**Files/modules affected:** new breadcrumb component, structured-data helper, detail/list pages.  
**Effort:** small  
**Expected impact:** medium (better crawl context, richer snippets)

### 10. Expand test coverage to API routes and critical end-to-end flows
**Category:** Quality  
**Problem:** Tests are currently limited to mapper/util unit tests. There is no coverage for API route handlers or the critical user flows (transcript upload, partner application creation, student wizard).  
**Proposed solution:** Add API route tests using vitest + MSW for external calls. Add Playwright e2e specs for: (a) student creates an application and uploads a document, (b) partner creates a student + application, (c) admin changes status and triggers notification.  
**Files/modules affected:** new `src/app/api/**/*.test.ts`, new `e2e/` directory, `vitest.config.ts`, CI workflow.  
**Effort:** large  
**Expected impact:** high (regression safety for the flows that directly drive revenue)

### 11. Finish admin portal i18n for create/edit forms
**Category:** Quality + Admin portal  
**Problem:** Admin list and detail pages are localized, but create/edit forms and bulk dialogs still contain hard-coded English strings.  
**Proposed solution:** Complete the `adminForms.*`, `adminCommon.*`, and `adminBulk.*` namespaces in `src/lib/i18n-translations.ts` and replace hard-coded strings in the remaining admin pages. Re-run the existing i18n drift test after each batch.  
**Files/modules affected:** `src/lib/i18n-translations.ts`, remaining `src/app/admin/**/page.tsx` files, shared admin components.  
**Effort:** medium  
**Expected impact:** low-medium (internal users mostly operate in English today, but needed for a fully bilingual product)

---

## Recommended top-5 priority order

1. **Convert university & program detail pages to server components**  
   *Why first:* these are the highest-traffic SEO landing pages. Moving them to RSC improves Core Web Vitals, search indexing, and structured data in one change.

2. **Add runtime caching + revalidation for public read APIs and RSC fetchers**  
   *Why second:* the list pages are already server-rendered; adding cross-request caching is the natural next step for scale and protects the site as traffic grows.

3. **Build partner commission reporting and admin payout workflow**  
   *Why third:* the data model already exists, so this is mostly UI/API work with immediate business value for partner retention and operations.

4. **Standardize API input validation with Zod**  
   *Why fourth:* it reduces the class of bugs that surface in production and makes the API surface predictable before scaling up integrations.

5. **Add document upload validation, progress UI, and deadline reminders**  
   *Why fifth:* directly improves the student experience and reduces admissions-team manual follow-up, with a clear cron + notification pattern to build on.

---

## Suggested implementation gates for each item

- `npm run ts-check` must stay at 0 errors.
- `npm test` must pass (add tests for new code).
- `npm run lint:build` clean; do not introduce new warnings.
- For data-model changes, add a migration file under `database/` and note it in `AGENTS.md`.
- For SEO changes, verify structured data with a validator.

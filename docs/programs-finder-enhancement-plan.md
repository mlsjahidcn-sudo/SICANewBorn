# Program Finder — Filter System & Listing UX Plan

**Scope:** the public `/programs` finder (list + filters + cards), the query layer behind it
(`/api/programs`, `src/lib/program-query.ts`), and the `/programs/[slug]` detail page's
link-back / related-programs behaviour.

**Status:** PF-1, PF-3, PF-4a, PF-4b, PF-5, PF-6, PF-7 and PF-8 are **shipped**
(see §9). PF-2's migration is written but **not applied** — the finder works
before and after it.

**Naming:** workstreams are `PF-1 … PF-8` (Program Finder) to avoid colliding with the
`Phase N` sequence in `AGENTS.md`.

---

## 1. Summary

The finder has a clean, correct foundation (Phase 173 moved all filtering server-side into one
shared module — `/api/programs` and the RSC page can't drift). The problems are **not** in the
architecture; they are in the **taxonomy the filters offer** and in the **ergonomics of the
listing UI**.

Measured against production on 2026-10-21 (2,513 programs, 152 universities):

| Finding | Evidence | Impact |
|---|---|---|
| The discipline filter offers **8 of 82** live discipline values | 73 live values have no filter option (Dentistry, Nursing, Civil Engineering, AI, Journalism, …) | Most of the catalogue is **unfilterable** |
| **1,977 / 2,513 (79%)** of programs have `discipline = NULL` | live count | The discipline filter is empty for 4 in 5 rows |
| `tuition` is free text; **1,789 values have no digits** (1,738 NULL) | live count | `sort=tuition` dumps 71% of rows at the end; no tuition filter is possible |
| `intake` is free text with **13 variants** ("September 2027", "September", "Autumn (2026 catalogue)", "Spring, Autumn (2026 catalogue)", …) | live count | No intake filter; the highest-intent question after "which school" is unanswerable |
| `duration` has **28 variants** + 1,433 NULL | live count | No duration filter |
| The university filter is a native `<select>` with **152 options** | `programs-client.tsx:326` | Unusable on a 390px screen; no type-ahead |
| The sitemap emits exactly **1,000** program URLs | live `sitemap.xml` (1,016 `/programs/` hits = 1,000 detail + 38 sub-pages) | **1,513 program pages (60%) are absent from the sitemap** — PostgREST's default `max-rows` truncates the un-limited `.select('slug, updated_at')` at `src/app/sitemap.ts:271` |
| `search_performed` / `filter_change` events exist in the analytics map with `surface: 'programs'` but are **never fired** by the programs page | `src/lib/analytics.ts:194-211` vs `programs-client.tsx` (only `program_click`) | Zero funnel data on the one surface that needs it |
| `sort=default` is not a distinct sort — the server falls back to `name` | `program-query.ts:163,224-231` | The "Default" option silently means "Name"; a second control lies |
| The `q` binding writes to the URL on **every keystroke** (no `debounceMs`) while the fetch is debounced 250 ms | `programs-client.tsx:70`, `use-url-state.ts:78-88` | URL churn; back button pollution |
| Filter option lists come from **static arrays** in `src/lib/data.ts` (45-row seed) | `programDisciplines` = 8 entries | The filter vocabulary is a hand-maintained constant that has already drifted |

**The single most valuable change is not a UI change:** it is making the filter vocabulary
**data-driven** and giving `intake` / `tuition` / `duration` a normalized, queryable shape.
Without that, every UI improvement is lipstick on a filter that can't express most of the
catalogue.

---

## 2. Current architecture (what to keep)

```
src/app/programs/page.tsx (RSC, 109 L)
  └─ parseProgramQueryParams(sp) → queryPrograms(params)      [src/lib/program-query.ts]
  └─ getUniversityOptions()  → 152 × {slug,name,nameCn}       (no limit, no cache)
  └─ <ProgramsClient initialResult … />                       (617 L client island)
       └─ 8 × useUrlState (q, degree, lang, disc, uni, scholarship, sort, page)
       └─ 250 ms debounced GET /api/programs?<same params>
       └─ filter pills → windowed pagination → 4-col card grid

src/app/api/programs/route.ts (73 L)  → thin GET adapter over queryPrograms + admin POST
src/lib/program-search.ts (125 L)    → pure: university-slug resolution + .or() builder
```

**Keep:** the single-query-module rule (Phase 173), URL-synced filters, the `useUrlState`
primitive, the two-step university-slug resolution (`programs.university_slug` has no FK — see
`docs/NEXT-PHASES.md` U4 #1), the static-seed fallback contract (Track 1.3 U3 #1), and the
existing `SearchableSelect` (`src/components/ui/searchable-select.tsx`, already used in 5 places).

**Do not** re-introduce client-side filtering, and do not add a second filter implementation.

---

## 3. Workstreams

### PF-1 — Data-driven filter vocabulary (facets) · **highest value**

Replace the static `degreeTypes` / `languages` / `programDisciplines` arrays with a facet
source read from the live table, each option carrying a **count**.

- New `GET /api/programs/facets` → `{ degree: [{value,count}], language: [...],
  discipline: [...], university: [...], intake: [...], tuition: [...] }`.
- Implementation: one query selecting the facet columns for live programs, aggregated in TS,
  cached in-process for 10 min, invalidated by `revalidateTag(CACHE_TAGS.programs)` on admin
  writes (the POST route already revalidates; PUT/DELETE/archive must be added).
- Keep the static arrays as the offline/no-DB fallback only.
- Every option renders its count; the "Not published" bucket is shown honestly for NULL
  discipline / intake / tuition.
- **Parity test:** for a sample of filter combinations, the facet counts must sum to
  `queryPrograms().total` for the single-filter case.
- Rationale for TS aggregation over a Postgres `GROUP BY` RPC: PostgREST has no aggregate
  endpoint, and the repo only has RPCs for admin analytics. One column of 2,513 rows is ~30 KB
  and cacheable, so a 1-hour/10-min cached read is cheaper than a new SECURITY DEFINER
  function — and it cannot drift from the table it reads.

### PF-2 — Normalize `intake`, `tuition`, `duration` (migration + backfill)

Free text cannot be filtered or sorted reliably. New columns on `programs`:

```sql
intake_year      SMALLINT       -- 2026 | 2027 | NULL
intake_season    TEXT           -- 'September' | 'March' | 'Spring' | 'Autumn' | 'Both' | 'Unknown'
tuition_amount   NUMERIC        -- 38000 | NULL
tuition_currency TEXT           -- 'CNY' | 'USD' | 'EUR' | NULL
duration_years   NUMERIC        -- 4 | 2.5 | NULL
```

- Migration `database/2026-XX_program_facets_normalization.sql`, idempotent, with a
  `RAISE NOTICE` coverage report (the `database/2026-09-17_partner_applications_program_slug.sql`
  pattern: DO-block, coverage %, safe to re-run).
- Backfill from the free text: 13 intake variants and 28 duration variants are enumerable
  (see §1), so a deterministic SQL mapping covers ~100% of the non-NULL rows; the remainder
  (e.g. "4-5 years (confirm major-specific duration)") → NULL + a review list.
- **Do not** use a `GENERATED ALWAYS AS (...)` column: the `text → numeric` cast is not
  `IMMUTABLE` in Postgres, so the expression would be rejected. Use a plain column + backfill,
  kept in sync by the admin write path (`mapProgramToDb` recomputes it) — verify the write
  path also covers the admin bulk import (`/api/programs/bulk`).
- Indexes: `(intake_year, intake_season)`, `tuition_amount`, `duration_years`.
- The `tuition` column stays as the display string; the new numeric column is the sort/filter
  key. Display keeps "¥38,000/year".

### PF-3 — Honest + correct sorting

- `sort=default` → implement as a real ordering (featured first, then name) or delete the
  option. Today it silently means `name`.
- Add `sort=relevance` for a search term: exact name match → name prefix → name contains →
  university match, then popularity. PostgREST can't rank, so fetch the candidate set
  (already narrowed by the `.or()` group) and rank in TS before slicing — keep the candidate
  cap explicit and documented.
- `sort=tuition` uses `tuition_amount` (PF-2) with NULLs last, instead of parsing free text.
- Add `sort=intake` (newest intake first) — the most decision-relevant order for a student
  applying for 2027.

### PF-4 — Filter UX rebuild

- **University picker → `SearchableSelect`** (already built, `src/components/ui/searchable-select.tsx`).
  152 options in a native select is the single worst interaction on the page. It already
  supports `sublabel` (Chinese name) and `logo`.
- **Mobile filter drawer**: on `< lg`, one "Filters (n)" button opens a shadcn `Sheet`/`Drawer`
  containing all controls; desktop keeps the inline row. Today 6 controls wrap into a tall
  stack on a 390px screen.
- **Sticky filter bar** on scroll (the bar is 5 rows tall on mobile; sticky lets the user
  refine without scrolling back up 24 cards).
- **Multi-select** for degree / language / discipline via the existing `useUrlMultiState`
  (`src/hooks/use-url-state.ts:98`) — "Master + PhD" is a real query.
- **City filter** — the site's biggest intent ("study in Beijing/Shanghai") is missing, and
  `universities.city` exists. It needs the same two-step resolution as PF-1's university
  match: resolve city → university slugs → `programs.university_slug.in.(…)`. Reuse
  `matchUniversitySlugs` in `src/lib/program-search.ts`.
- **Quick toggles** for the two highest-intent binary questions: "English-taught"
  (`language=English`) and "Scholarship available" (exists).
- Per-control "clear" affordance, and a live count ("37 programs match") that updates as
  filters change.
- Fix the fragile label surgery `t('prog.allDisciplines').replace('All ', '').replace('所有', '')`
  (`programs-client.tsx:195`) — add a proper `prog.discipline` key.

### PF-5 — Listing UI/UX

- **Load more** instead of 105 page buttons (`pageNumbers` at `programs-client.tsx:603`):
  24 more rows per click, matching the partner/admin "Load more" pattern. Keep a page jump
  for power users. 105 pages of numbered buttons is not a UX.
- **Card density**: at 390px the 4-across grid becomes 1 column; 24 cards = a very long
  scroll. Show the university logo (there is `src/components/university-logo.tsx` + local AVIF
  logos from Phase 64), the normalized intake ("Sept 2027"), and keep tuition/duration on one
  line; hide empty meta cells instead of showing "—".
- **View toggle** grid ⇄ list (list = name + university + intake + tuition + one-line
  description) for students scanning many rows.
- **Skeleton loading** for the listing: `src/app/programs/` has no `loading.tsx` (only
  `[slug]/loading.tsx` exists), so a filter change flashes an empty grid. Add one, and dim
  the grid (already done via `isPending` opacity) rather than blanking it.
- **Empty state → actionable**: when 0 results, name the filter that removed the most rows
  (needs PF-1 counts) and offer "show all {discipline} instead"; today the only escape is
  "Clear all".
- **Preserve filter state on back-navigation** to the detail page: the detail page should
  link back to `/programs?uni=<slug>&…` with the referring filters intact, and the card
  should carry the referring query in the URL.

### PF-6 — Detail page ↔ finder linkage (SEO + conversion)

- **Related programs** on `/programs/[slug]`: same university, same discipline, same degree.
  The detail page (411 L) currently has 4 tabs and no related-programs block and no
  "other programs at this university" link — 2,513 pages with no internal links to each other.
- **Breadcrumb** back to the filtered list, preserving the filter set.
- **Sitemap truncation fix** (`src/app/sitemap.ts:271`): the un-limited
  `.select('slug, updated_at')` is capped by PostgREST's default `max-rows=1000`, so 1,513
  program URLs never reach the sitemap. Fix by paging the fetch (`.range()` chunks) or an
  explicit `.limit(5000)`. Apply the same check to `universities` / `scholarships`.
  Also confirm the public API's own `limit` clamp (`parseProgramQueryParams` caps at 500) does
  not affect the sitemap path.
- Optional: a per-discipline hub page (`/programs?discipline=Dentistry` as a canonical,
  indexable URL rather than a query string) — the same "filter pages as landing pages" play
  that made `/csca-*` work. Needs a decision on canonicalization (see §7).

### PF-7 — Analytics (the map already supports it)

Fire the events that exist but are unused, plus one new one:

- `search_performed` (`surface: 'programs'`, `term`, `locale`) — debounced, on the same 250 ms
  cadence as the fetch.
- `filter_change` (`surface: 'programs'`, `filter`, `value`, `locale`) — for every control
  change, with `filter` = `degree|language|discipline|university|city|scholarship|intake|tuition|duration`.
- New `program_filter_results` (or reuse `filter_change` with the result count) so we can see
  **which filter produces clicks**, not just which filter gets used. Without the result count
  the funnel stops at "filter used".

### PF-8 — Plumbing, performance, correctness

- **Cache the read path.** `/programs` is dynamic (it reads `searchParams`) and hits Supabase
  twice per request (programs + 152 universities). Add a tagged, short-TTL cache for the
  facet/option lists and for the results query, and revalidate `CACHE_TAGS.programs` on every
  admin write (POST exists; **PUT / DELETE / archive do not revalidate** — verify and fix).
- `getUniversityOptions()` (`src/app/programs/page.tsx:90`) has **no limit** — add one and a
  cache; it currently ships 152 rows on every request.
- **URL churn**: add `debounceMs: 300` to the `q` `useUrlState` binding; consider `pushState`
  for discrete filter changes (selects) so the back button walks the filter history, keeping
  `replaceState` for the search box. Document the choice.
- **Exact count cost**: `queryPrograms` runs `count: 'exact'` on every request over 2,513 rows.
  Fine at this size; note the ceiling (a 50k-row catalogue would want an estimate).
- **OR-vs-AND parity**: the `.or()` search group is already correct; keep the
  `sanitizeOrTerm` discipline and the slug-regex contract pinned by
  `src/lib/__tests__/programs-search.test.ts`.

---

## 4. Phasing

Each batch ships independently and is verifiable on its own. Gates per batch:
`npm run lint` (0 errors) · `npm run ts-check` (0) · `npm test` (all green) ·
`npm run build` · live smoke on the production build.

| Batch | Contents | Why this order |
|---|---|---|
| **PF-1** | Facet endpoint + data-driven vocabulary + counts in the UI | Biggest single win; no migration needed |
| **PF-2** | Normalization migration + backfill + admin write path | PF-4's intake/tuition filters depend on it |
| **PF-3** | Sort honesty + relevance sort | Small, self-contained, immediately visible |
| **PF-4a** | University `SearchableSelect` + mobile drawer + sticky bar + multi-select | Pure UI; biggest perceived-UX win on 390px |
| **PF-4b** | City filter + quick toggles + clear affordances + empty-state suggestions | Depends on PF-1 counts and PF-2 |
| **PF-5** | Load-more, card density, list/grid toggle, skeleton | Independent of the data work |
| **PF-6** | Related programs, back-links, sitemap truncation fix | Sitemap fix is 3 lines and should ship first |
| **PF-7** | Analytics events | Cheap; do it in PF-1 so the data starts collecting |
| **PF-8** | Caching, URL semantics, count cost | Last: performance work is worthless before the queries are right |

**Fastest path to value if only one batch is approved:** PF-1 + PF-7 (a week) — the filter
vocabulary becomes real and measurable, which then justifies PF-2's migration.

**Do first regardless of batching:** the sitemap `max-rows` fix (3 lines, 1,513 orphan URLs).

---

## 5. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Facet vocabulary changes as admins add programs → stale option lists | Facets are read from the table (never a hardcoded list) and cached 10 min; a new discipline appears in the facet list immediately, so no filter can silently hide rows |
| Two filter implementations drift (rows vs counts) | Both come from `queryPrograms` / the same cached column read; parity test asserts `Σ counts == total` for single-filter cases |
| Normalization backfill mis-maps free text | Idempotent migration with a coverage report + a NULL bucket for unmapped rows; no row is deleted or rewritten, only new columns are filled |
| The 1,977 NULL-discipline rows make the discipline facet look broken | Show "Not published" as its own counted option and add a data-quality backlog (AI-assisted backfill, same pattern as the Phase 127 program parser) |
| Faceted counts get stale after an admin edit | `revalidateTag(CACHE_TAGS.programs)` on **all** write paths (add to PUT/DELETE/archive, which currently don't revalidate) |
| A new `sort=relevance` needs ranking outside SQL | Rank in TS over the already-`.or()`-narrowed candidate set, with an explicit, documented candidate cap |
| `?discipline=Dentistry` as an indexable URL conflicts with the filter-param URL | Decision needed — see §7 |
| Big diff touching a page that converts | Ship in the batch order; PF-1 changes data only, PF-4a/5 change layout only; keep a feature flag if needed |

---

## 6. Out of scope (deliberately)

- A program **compare** feature (the site has university compare at `/universities/compare`).
  Possible later; not part of the finder.
- Saved searches / email alerts on new matches.
- Changing the program **detail** page's tab structure (only add a related-programs block and
  back-links).
- Re-platforming the finder on a headless CMS or a search service (Typesense/Meilisearch).
  At 2,513 rows Postgres + PostgREST is the right tool; the ceiling to revisit is ~50k rows.
- The admin programs list (its own backlog: `docs/NEXT-PHASES.md` U3 #5, U4 #1–#3).

---

## 7. Decisions needed before PF-4b

1. **Facet counts: global or context-sensitive?**
   *Global* (recommended for v1): one cached read, cheap, always consistent. *Context-sensitive*
   ("Dentistry (2)" recalculated against the other active filters) is the standard faceted-search
   experience but needs a second implementation of the filter predicates in SQL, with a parity
   test to guard drift. Recommend global now, context-sensitive later only if the data shows
   it matters.
2. **Should filter URLs be indexable landing pages?**
   `?discipline=Dentistry` as a canonical, crawlable page (with its own title/meta/ItemList) is
   a large SEO lever for 82 disciplines × 6 degrees — but it multiplies pages that must each be
   genuinely useful, and it risks thin-content penalties if implemented carelessly. Recommend:
   yes for a curated set (top 20 disciplines), no for the long tail.
3. **Does the 79% NULL `discipline` get backfilled?**
   A migration that infers discipline from the program name (AI-assisted, in the Phase 127
   "paste like ChatGPT" pattern) would make the discipline facet useful; without it the facet
   is honest but thin. Recommend yes, as a separate, admin-triggered action rather than a
   silent migration.
4. **Page size / load-more vs pagination.** 24 rows per load with a "jump to page" escape, or
   48 with traditional pagination? Recommend 24 + load-more (mobile-first, matches the
   partner/admin pattern).
5. **Does the university filter stay a single-select?** A student often wants "all programs at
   one university" (single) or "English-taught at any of these 3" (multi). Recommend:
   single-select + a separate multi-select "university" facet only if PF-4b's data shows
   multi-university queries are common.

---

## 8. Appendix — measured evidence (production, 2026-10-21)

```
programs: 2,513   universities: 152   pages @24/page: 105
sitemap: 1,562 URLs, of which 1,000 program detail pages (PostgREST max-rows cap)
degree:    6 distinct   (static list: 6)  ✓ in sync
language:  4 distinct   (static list: 4)  ✓ in sync
discipline: 82 distinct (static list: 8)  ✗ 73 values unreachable; 1,977 rows NULL
tuition:   1,789 / 2,513 have no digits (1,738 NULL, 51 empty)
intake:    13 distinct variants + 419 NULL
duration:  28 distinct variants + 1,433 NULL
```

---

## 9. What shipped (2026-10-21)

| Batch | Status | Notes |
|---|---|---|
| **PF-1** facets | ✅ shipped | `src/lib/program-facets.ts` + `GET /api/programs/facets`. The vocabulary is read from the live table in 1,000-row pages (PostgREST's `max-rows` cap — the trap that truncated the sitemap). Counts cached 10 min in-process, invalidated by every admin write. **Discipline options went 8 → 83** (82 live values + the "Not specified (1978)" bucket). |
| **PF-3** sorting | ✅ shipped | `sort=default` is now a real ordering (featured → featured_rank → name) instead of silently meaning "name". New `sort=relevance` (TS-ranked: exact → prefix → contains → Chinese name → university) and `sort=intake` (needs PF-2's column; falls back to name until the migration is applied). |
| **PF-4a** filter UX | ✅ shipped | University picker → the existing `SearchableSelect` (152 options → type-ahead). Mobile filter `Sheet` (the six controls used to wrap into a tall stack on a 390px screen). Sticky filter bar. Discipline/labels use the data-driven vocabulary. |
| **PF-4b** city + toggles | ✅ shipped | **City filter** (47 cities, "Beijing (978)") — the biggest missing intent; a program inherits its university's city, so the city resolves to university slugs server-side. One-click "English-taught" toggle. Empty state now offers each active filter back, one at a time. |
| **PF-5** listing UX | ✅ shipped | "Load more" (24 → 32 → …) instead of 105 page buttons, `loading.tsx` skeleton. **The default view is now a real `<table>`** (`_components/program-table.tsx`): 8 columns on desktop, dropping to Program + Tuition + Intake on a phone; row height ~260px (card) → 70px (mobile) / 61px (desktop). The card grid stays available via the view toggle. |
| **PF-6** detail + sitemap | ✅ shipped | **Sitemap: 1,000 → 2,532 program detail URLs** (the `max-rows` truncation left 1,513 pages out of the sitemap) and the /majors list went 8 → 85 disciplines. Related programs block on the detail page (same university, then same discipline) + a back-to-results link that preserves the filter query. |
| **PF-7** analytics | ✅ shipped | `search_performed` + `filter_change` (both already existed in the event map with `surface: 'programs'` and were never fired) now fire from the finder. |
| **PF-8** caching | ✅ shipped | In-process 5-min memo for the result set (per filter combination) + a 1-hour memo for the university options. Deliberately NOT `unstable_cache` — it throws outside a Next request context, which broke 11 unit tests. Both memos are invalidated by the admin write paths. |
| **PF-2** normalization | ⚠️ applied, **backfill was wrong** | `database/2026-10-21_program_facets_normalization.sql` adds `intake_year` / `intake_season` / `tuition_amount` / `tuition_currency` / `duration_years` and backfills them from the free text. It was applied on 2026-10-21, but its tuition + duration backfills extracted the regex **capture group** instead of the whole match → `tuition_amount` filled for 0 of 787 rows, `duration_years` = 0.5 for the 14 "2.5 years" rows, and the statement still reported success. `database/2026-10-21_program_facets_normalization_fix.sql` is the corrected backfill (verified against PostgreSQL 16 on an 800-row production sample: 370/370 tuition, 655/655 duration, zero misses). The finder hides the tuition + duration filters while the broken values are in place and shows them automatically after the fix. **Pre-deploy: run the fix in the Supabase SQL editor.** |

### Verified live (production build, headless Chrome at 390×844)

20/20 automated checks + 5/5 UI-interaction checks: data-driven options with
counts, the not-published bucket, server-side filtering (2,513 → 99 programs),
relevance ranking ("Clinical Nursing" first for `q=nursing`), load-more, the
mobile sheet, the university type-ahead, related programs, the filter-preserving
back link, and the sitemap now emitting 2,532 program URLs. No console errors.

### Still open (deliberately)

- Context-sensitive facet counts (the counts are global, not per-combination).
- The 1,977 NULL `discipline` rows — the facet is honest about them, but a
  backfill would make it useful. Recommended as an admin-triggered AI pass in the
  Phase 127 "paste like ChatGPT" pattern.
- `/programs?discipline=X` as an indexable landing page (decision §7 #2).
- The admin programs list (its own backlog: `docs/NEXT-PHASES.md` U3 #5, U4 #1–#3).

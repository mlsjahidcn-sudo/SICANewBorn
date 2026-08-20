# Next Phases — Handoff Document

Project: SICA (study-in-China platform) — Next.js 16 (App Router, Turbopack) + Supabase.
Repo state: T1.1 (rate-limit + honeypot), T1.2 (CI pipeline), and T1.3-U2 (mapper consolidation, partial PUT, slug validation) are **done**. T1.1+T1.2 pushed to `main`; U2 may be uncommitted locally — check `git status` first.

## Conventions to follow

- Validators: zod schemas in `src/lib/validators/*.ts`; helpers in `src/lib/validators/shared.ts`.
- DB mappers: canonical copies now live in `src/lib/catalog-mappers.ts` (route files import from it). `src/lib/data-fetcher.ts` (RSC) and `src/lib/{university,program,scholarship}-queries.ts` keep their own separate copies intentionally.
- Cache: `CACHE_TAGS` in `src/lib/cache.ts`; call `revalidateTag(tag, 'default')` after every mutation.
- Rate limiting: `src/lib/rate-limit.ts` (`checkPublicRateLimit` for anonymous endpoints, `checkRateLimit` for authed).
- Auth: mutations are admin-gated via `requireAdmin` from `src/lib/supabase-auth.ts`.
- Comment tags: use the phase tag (e.g. "Track 1.3 U3") for new comments; match surrounding comment density.
- Verify before finishing any phase: `npx tsc --noEmit`, `npm run lint:build`, `npx vitest run` — all must pass.
- **Never run `npm run dev`** (port 5000 conflicts with AirPlay). Use `npx next dev --port 31xx` if a dev server is needed.
- No `majors` table — majors derive from `programs.discipline` at render time.

---

## Track 1.3 U3 — Static/DB duality fixes

The site serves "DB first, static seed fallback" everywhere. Known bugs:

1. **Zero-row fallback bug** — API GET list routes (`src/app/api/universities/route.ts:45`, `programs/route.ts:45`, `scholarships/route.ts:41`) fall back to the full static dataset whenever the DB query returns 0 rows — including when a filter legitimately matches nothing. Result: filtering to an empty result shows unrelated static data instead of "no results". Fix: only fall back when the query **errors** or when no filters/search params are applied (truly empty table); a filtered empty result must return `[]`.

2. **Stale edit-form prefill** — admin edit forms for programs (`src/app/admin/programs/new/page.tsx:86-92`) and scholarships (`src/app/admin/scholarships/new/page.tsx:85-92`) prefill from the static seed only, so editing a DB-only or previously DB-edited row starts from stale/blank data. Make them match the universities edit form (`src/app/admin/universities/new/page.tsx:138-155`): fetch `/api/<entity>/[slug]` first, fall back to static.

3. **`/api/seed` has no auth guard** — `src/app/api/seed/route.ts` upserts all static seed data into the DB (`onConflict: 'slug'`) and can overwrite curated DB rows. Add the `requireAdmin` gate like the other mutation routes.

4. **Scholarship form↔schema mismatch** — the admin scholarship form sends `applicationMethod`/`applicationMethodCn` as **arrays** (`src/app/admin/scholarships/new/page.tsx:111-112`) but the schema declares `z.string()` (`src/lib/validators/scholarship.ts:24-25`) — submits currently fail with 400. Reconcile (accept arrays in the schema, or join to string in the form — check what the DB column type is in `database/migration-supabase-cloud.sql` scholarships DDL first). Related drift: the schema accepts `typeCn, degreeLevelsCn, eligibleRegionsCn, durationCn, benefits, benefitsCn, officialLink` but `mapScholarshipToDb` drops them and the DDL has no such columns — either add columns or trim the schema.

5. **Admin list merge ghosting** — `src/app/admin/programs/page.tsx:27-31` and `admin/scholarships/page.tsx:223-230` merge DB + static by slug; a DB row whose slug also exists in the static seed **reappears from static after deletion**. Decide intended behavior (probably: if the entity exists in DB, mark it and allow hard delete to hide the static twin too — e.g. track a `hidden` flag or accept the limitation and document it).

6. **Cache gap (minor)** — mutations call `revalidateTag` which busts `*-queries.ts` caches, but `data-fetcher.ts`'s 60s process TTL cache (`cachedProcess`) is not busted; RSC pages can serve stale data up to 60s after an admin edit. Acceptable — document, or shorten TTL.

## Track 1.3 U4 — Integrity & UX

1. **Cascade deletes** — `programs.university_slug` is a plain `VARCHAR` with **no FK** (`database/migration-supabase-cloud.sql:67`): deleting a university orphans its programs. In `src/app/api/universities/[slug]/route.ts` DELETE: delete (or count + require `?force=true` confirmation for) child programs first. Also note `partner_promotions` rows have real FKs with `ON DELETE CASCADE` (`supabase/migrations/20260813021000_partner_promotions.sql:8-9`) — deleting a university/program silently deletes its promotions; count them and return the count in the DELETE response so the admin UI can warn.

2. **Regenerate slug** — no way to rename a slug today (PUT treats slug as immutable). Add an admin action (e.g. `POST /api/<entity>/[slug]/regenerate-slug`) that regenerates from the name via `slugify` (in `src/lib/catalog-mappers.ts`), updates the row, and — for universities — updates `programs.university_slug` references in the same flow. Must revalidate cache tags and ideally redirect old slug (there is no redirect table today; simplest: return the new slug and let the UI navigate).

3. **Bulk upsert UX** — programs bulk import exists (`src/app/admin/programs/bulk/page.tsx`, paste-text → `POST /api/programs/bulk`, max 200 rows, in-batch `-2`/`-3` slug dedup). The `universidad_slug` response bug is already fixed by U2. Remaining UX gaps: surface per-row errors in the UI (the API currently reports them but check the page renders them), show which slugs were deduped/renamed. No bulk import exists for scholarships — optional add if wanted.

## Track 1.4 — Sentry activation (no code change)

Code is already env-gated (see `src/lib/__tests__/with-capture.test.ts` no-op path). To activate: set `SENTRY_DSN` (+ org/project env vars if used) in the production env. Done when errors appear in the Sentry dashboard.

## Deferred — Partner collaboration P3/P4

Partner portal collaboration phases were deferred from earlier planning. Re-scope from the current state of `src/app/partner/` and `src/app/admin/partners/` before starting — earlier phase notes are not in this repo.

---

## Reference: useful file paths

- Catalog routes: `src/app/api/{universities,programs,scholarships}/route.ts` + `[slug]/route.ts`, `src/app/api/programs/bulk/route.ts`
- Shared mappers: `src/lib/catalog-mappers.ts` · validators: `src/lib/validators/`
- Static seed data: `src/lib/data.ts` · RSC fetcher: `src/lib/data-fetcher.ts` · query caches: `src/lib/*-queries.ts`
- Schema DDL: `database/migration-supabase-cloud.sql` · migrations: `supabase/migrations/`
- Existing test style example: `src/lib/__tests__/rate-limit.test.ts`, `src/lib/__tests__/catalog-mappers.test.ts`

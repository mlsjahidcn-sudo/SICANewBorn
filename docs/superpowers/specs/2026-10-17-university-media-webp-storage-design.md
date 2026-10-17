# University media: URL → WebP → Supabase Storage

**Date:** 2026-10-17  
**Status:** Approved  
**Phase name (implementation):** Phase 175 — university media WebP import  
**Decisions locked with user:**

- Trigger: **on Save** (paste URLs as today; import happens in the create/update API)
- Fields: **logo + banner (`image`) + campus gallery**
- Existing rows: **on next edit** + admin **“Import all external images”** bulk action

---

## Problem

Admin university forms store Logo, Banner, and Gallery as raw external URLs (`cdn.urongda.com`, Unsplash, etc.). Public pages load those hosts on every visit. External CDNs are slow / flaky; some logos already self-hosted as `/university-logos/*.avif` in static fallback, but live DB rows still point at remote URLs.

## Goal

When an admin pastes image URLs and saves (or runs bulk import):

1. Server downloads each **external** image (SSRF-safe)
2. Compresses to **WebP** with sharp (already a dependency for admission notices)
3. Uploads to a **public** Supabase Storage bucket
4. Replaces the DB field with the Storage **public URL**

Public pages keep reading `logo` / `image` / `gallery` as URL strings — no renderer change required beyond faster URLs.

## Non-goals

- Direct file-picker upload UI (can add later; out of scope)
- Re-watermarking or brand overlay on campus photos
- Changing static fallback logos in `src/lib/data.ts` / `public/university-logos/`
- Migrating partner/student document buckets
- Automatic cron re-import of every university without an admin click

---

## Approach (approved)

**Approach A — Server import on Save + bulk migrate**

Reuse patterns from:

- `src/lib/admission-notices/storage.ts` + watermark upload (sharp → Storage)
- `src/lib/ssrf-guard.ts` (Phase S144 webhook SSRF)
- Consultation activity public bucket + `getPublicUrl()`

---

## Storage

### Bucket

- Name: `university-media`
- Public read (same model as `consultation-activity` / `admission-notices` `public/` folder)
- Created manually in Supabase Storage dashboard before deploy (document in migration header / AGENTS checklist)
- MIME allowlist on bucket (optional): `image/webp` primary; allow jpeg/png only if we ever store originals (v1 stores WebP only)

### Object paths

```
universities/{slug}/logo.webp
universities/{slug}/banner.webp
universities/{slug}/gallery/{index}-{shortHash}.webp
```

- `{slug}` = university slug (stable; overwrite on re-import of logo/banner)
- Gallery uses `{index}-{shortHash}` so replacing one line doesn’t collide with an old object; orphan cleanup is best-effort on save when the gallery list shrinks (optional v1: leave orphans; document as known follow-up)

### DB columns

**No schema migration.** Continue storing absolute public URLs in:

| Column (DB) | Form field | Role |
|-------------|------------|------|
| `logo` | Logo URL | Square-ish mark |
| `image` | Banner Image URL | Hero / card banner |
| `gallery` | Gallery URLs (text[]) | Campus photos |

After import, values look like:

`https://wbzdwwvtbaftjxecgdxk.supabase.co/storage/v1/object/public/university-media/universities/tsinghua-university/logo.webp`

### Already-ours detection

Skip import when URL is already our media:

- Hostname matches project Supabase host **and** path contains `/university-media/`
- Or relative `/university-logos/…` (static self-host — leave alone)

Also skip empty / whitespace-only strings.

---

## Compression (sharp)

| Field | Max dimension | WebP quality | Notes |
|-------|---------------|--------------|-------|
| Logo | 512×512 (fit inside, no upscale) | 80 | Preserve alpha if present |
| Banner | width ≤ 1600 | 75 | Height proportional |
| Gallery | width ≤ 1600 | 75 | Same as banner |

- Input: any sharp-supported image (`jpeg`, `png`, `webp`, `gif`, `heic` if sharp build supports it)
- Output: always `image/webp`
- Reject if decoded pixel count or byte size exceeds caps (see Limits)
- Rotate via EXIF (`sharp().rotate()`) before resize

---

## Limits & failure policy

| Limit | Value |
|-------|--------|
| Max download bytes | 15 MB |
| Max gallery images imported per save | 12 |
| Download timeout | 20 s per URL |
| Allowed schemes | `https:` only |
| Allowed Content-Type | `image/*` (must start with `image/`) |

**Partial failure (Save):**

- University row still saves successfully
- Any URL that fails import keeps the **original external URL**
- Response includes optional `mediaImport: { imported, skipped, failed: [{ field, url, error }] }` so the admin UI can toast warnings

**Bulk import:**

- Process universities in batches (e.g. 5 at a time)
- Same per-URL failure semantics
- Return summary counts; do not abort the whole run on one school

---

## API / code shape

### New module: `src/lib/university-media.ts`

Pure-ish helpers:

- `isUniversityMediaUrl(url: string): boolean`
- `isExternalImageUrl(url: string): boolean`
- `importUniversityImageFromUrl(args): Promise<{ publicUrl: string } | { error: string }>`
  - SSRF check → fetch → size/type check → sharp → upload → `getPublicUrl`
- `importUniversityMediaFields({ slug, logo, image, gallery }): Promise<{ logo, image, gallery, report }>`

### Wire into university mutations

- `POST /api/universities` and `PUT /api/universities/[slug]` (and any admin wrapper that writes the same columns)
- After Zod validation, **before** DB write: run `importUniversityMediaFields`
- Persist rewritten URLs

### New admin bulk endpoint

- `POST /api/admin/universities/import-media`
- `requireAdmin` + rate limit (e.g. 3 runs / 15 min per admin — reuse `checkAdminAIRateLimit` pattern or `checkRateLimit`)
- Body: optional `{ limit?: number, slug?: string }` for single-school or capped runs
- Scans `universities` for rows whose `logo` / `image` / `gallery` contain external URLs
- Updates rows that successfully imported at least one field

### Admin UI

- `/admin/universities` list header: **Import external images** button
  - Confirm dialog: explains it will download remote logos/banners/galleries, convert to WebP, store in SICA Storage
  - Shows progress / result toast (imported / skipped / failed)
- University form: keep URL inputs; add short helper text under Media + Gallery:  
  *“On save, external URLs are compressed to WebP and stored in SICA Storage for faster loading.”*

---

## Security

1. **SSRF:** call existing `ssrf-guard` (resolve DNS, block private ranges, IPv6-aware) before fetch; `redirect: 'manual'` or bounded redirects with re-check (same as webhook delivery)
2. **Auth:** import on public university POST/PUT only if those routes are already admin-gated; if any public write path exists, gate import to `requireAdmin` callers only. Verify current route auth before implementing.
3. **Path traversal:** slug sanitized to existing university slug pattern; gallery filenames use hash + index only
4. **Do not** log full image bytes; log URL host + error message only

---

## Pre-deploy checklist (manual)

1. Create Supabase Storage bucket `university-media` (Public = on)
2. Optional: bucket file size limit ≥ 15 MB; allowed MIME includes `image/webp`
3. Deploy code
4. Smoke: edit one university with an Unsplash URL → Save → confirm DB URL is `…/university-media/…webp` and page loads the image
5. Run **Import external images** on a small `limit` first

No SQL table migration required for v1. Optional follow-up SQL doc under `database/2026-10-17_university_media_bucket_notes.sql` as a comment-only checklist (bucket creation is dashboard-only for this project’s ops pattern).

---

## Testing

Unit tests (`src/lib/__tests__/university-media.test.ts`):

- `isUniversityMediaUrl` / `isExternalImageUrl` edge cases
- Skip already-stored URLs
- Gallery cap truncates import beyond 12 (extra URLs left as-is or dropped from import — document: leave as external with warning)
- Reject `http://` and blocked SSRF addresses (mock fetch / guard)
- Sharp path: tiny PNG buffer → WebP buffer with expected content-type (integration-style with sharp, like watermark tests)

Manual / smoke:

- Create + edit university with logo + 2 gallery URLs
- Bulk import with `limit=3`
- Confirm `/universities/[slug]` and list page use Storage URLs

Gates: `ts-check` 0, existing vitest green + new cases, `lint:build` 0 new, build succeeds.

---

## Rollout / ops notes

- First Save with many gallery URLs may take ~1–5 s (download + sharp + upload × N). Acceptable for admin; show “Saving / importing images…” if UI hangs.
- Orphan gallery objects after admin removes a line: acceptable leak for v1; optional cleanup later.
- `next.config.ts` already allows `*.supabase.co` in `remotePatterns` / CSP `img-src` — no change needed if public URLs stay on that host.

---

## Open items (resolved for v1)

| Question | Decision |
|----------|----------|
| When to import? | On Save |
| Which fields? | logo + image + gallery |
| Existing data? | Next edit + bulk admin action |
| Fail one URL? | Keep original URL; warn; still save row |
| Store originals? | No — WebP only |
| Schema change? | No |

---

## Success criteria

- Pasting an external logo URL and saving results in a `university-media` WebP public URL in the DB
- Public university pages load logos/gallery from Supabase Storage without hitting urongda/Unsplash for imported schools
- Bulk import can clear a batch of existing external URLs without editing each school
- SSRF-blocked URLs cannot be imported

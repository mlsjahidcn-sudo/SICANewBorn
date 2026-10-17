# University Media WebP Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On university Save (and via admin bulk), download external logo/banner/gallery URLs, compress to WebP with sharp, upload to public Supabase Storage bucket `university-media`, and persist Storage public URLs in the existing `logo` / `image` / `gallery` columns.

**Architecture:** Restore `ssrf-guard` (deleted with B2B webhooks). New `src/lib/university-media.ts` owns detect → SSRF → fetch → sharp → upload. Wire into admin-gated `POST /api/universities` and `PUT /api/universities/[slug]` before DB write. New bulk `POST /api/admin/universities/import-media` + list-page button. No schema migration.

**Tech Stack:** Next.js App Router, sharp, Supabase Storage (service-role), vitest, existing `checkRateLimit` / `requireAdmin`.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-17-university-media-webp-storage-design.md` (Approved)
- No DB schema change; bucket created manually in Supabase dashboard
- Partial import failure keeps original URL; row still saves; return `mediaImport` report
- https only; 15 MB max; 20 s timeout; gallery import cap 12; logo ≤512px q80; banner/gallery ≤1600px q75
- Skip already-ours: path contains `/university-media/` or starts with `/university-logos/`
- Do not commit dirty `next-env.d.ts`
- Package manager: npm (`npm run ts-check` / `npm test`)

## File map

| File | Responsibility |
|------|----------------|
| `src/lib/ssrf-guard.ts` | Restore from `/tmp/ssrf-guard-full.ts` (IPv6-aware) |
| `src/lib/__tests__/ssrf-guard.test.ts` | Restore from `/tmp/ssrf-guard.test.ts` |
| `src/lib/university-media.ts` | Import helpers + sharp + Storage upload |
| `src/lib/__tests__/university-media.test.ts` | Unit + sharp buffer tests |
| `src/app/api/universities/route.ts` | POST: import before insert |
| `src/app/api/universities/[slug]/route.ts` | PUT: import before update |
| `src/app/api/admin/universities/import-media/route.ts` | Bulk import |
| `src/app/admin/universities/page.tsx` | Import button + confirm + toast |
| `src/app/admin/universities/new/page.tsx` | Helper text under Media |
| `src/lib/i18n-translations.ts` | en + zh keys |
| `database/2026-10-17_university_media_bucket_notes.sql` | Comment-only pre-deploy checklist |

---

### Task 1: Restore SSRF guard

**Files:**
- Create: `src/lib/ssrf-guard.ts`
- Create: `src/lib/__tests__/ssrf-guard.test.ts`

- [ ] Copy `/tmp/ssrf-guard-full.ts` → `src/lib/ssrf-guard.ts`
- [ ] Copy `/tmp/ssrf-guard.test.ts` → `src/lib/__tests__/ssrf-guard.test.ts`
- [ ] Run `npx vitest run src/lib/__tests__/ssrf-guard.test.ts` — expect pass
- [ ] Commit: `Restore ssrf-guard for university media URL imports`

---

### Task 2: University media module + tests (TDD)

**Files:**
- Create: `src/lib/university-media.ts`
- Create: `src/lib/__tests__/university-media.test.ts`

Exports:

```ts
export const UNIVERSITY_MEDIA_BUCKET = 'university-media';
export function isUniversityMediaUrl(url: string): boolean;
export function isExternalImageUrl(url: string): boolean;
export type MediaImportReport = {
  imported: number;
  skipped: number;
  failed: Array<{ field: string; url: string; error: string }>;
};
export async function importUniversityMediaFields(args: {
  slug: string;
  logo?: string | null;
  image?: string | null;
  gallery?: string[] | null;
}): Promise<{
  logo: string | null | undefined;
  image: string | null | undefined;
  gallery: string[] | null | undefined;
  report: MediaImportReport;
}>;
```

Behavior:

- `isUniversityMediaUrl`: absolute URL whose path includes `/university-media/`
- `isExternalImageUrl`: non-empty, not media URL, not `/university-logos/…` relative or absolute path ending that way
- Per URL: `assertSafeWebhookUrl(url, false)` (prod-strict; https only via design — reject http even in dev for media), `fetch` with `redirect: 'manual'`, Content-Type `image/*`, max 15 MB, 20 s AbortController
- sharp: `rotate()` then resize (logo contain 512, banner/gallery width 1600 without enlargement) → webp
- Upload path `universities/{slug}/logo.webp` | `banner.webp` | `gallery/{index}-{sha8}.webp`, upsert true
- Gallery: import at most 12 external entries; extras stay as original URLs with warning in report
- Failures keep original URL

- [ ] Write failing tests for detect helpers + gallery cap + tiny PNG→WebP
- [ ] Implement module
- [ ] Run tests — pass
- [ ] Commit: `Add university-media WebP import helpers`

---

### Task 3: Wire POST + PUT

**Files:**
- Modify: `src/app/api/universities/route.ts`
- Modify: `src/app/api/universities/[slug]/route.ts`

- [ ] After Zod parse (POST) / after merge (PUT), call `importUniversityMediaFields` with slug + logo/image/gallery
- [ ] Write rewritten fields into the DB payload
- [ ] Include `mediaImport: report` on JSON response
- [ ] Commit: `Import external university images on create/update`

---

### Task 4: Bulk import API + admin UI + i18n + checklist

**Files:**
- Create: `src/app/api/admin/universities/import-media/route.ts`
- Modify: `src/app/admin/universities/page.tsx`
- Modify: `src/app/admin/universities/new/page.tsx` (helper under Media)
- Modify: `src/lib/i18n-translations.ts`
- Create: `database/2026-10-17_university_media_bucket_notes.sql`

Bulk route:

- `requireAdmin` + `checkRateLimit({ action: 'university-import-media', key: userId, max: 3, windowMs: 15*60*1000 })`
- Body `{ limit?: number, slug?: string }` — default limit 25, max 100
- Select universities with external-looking logo/image/gallery (or filter by slug)
- Process sequentially (or batches of 5); update when at least one field imported
- Return `{ processed, updated, imported, skipped, failed, details? }`

UI:

- Button next to Bulk Generate: “Import external images”
- ConfirmDialog → `apiFetch` POST → toast with counts
- Form helper text under Media section

i18n keys (en + zh): `adminUniversities.importMedia`, `importMediaConfirmTitle`, `importMediaConfirmBody`, `importMediaBusy`, `importMediaToast`, `importMediaError`, `mediaImportHint`

- [ ] Implement route + UI + i18n + SQL notes
- [ ] Run `npm run i18n:check` / missing-key gate if present
- [ ] Commit: `Admin bulk import for university media WebP`

---

### Task 5: Gates + PR

- [ ] `npm run ts-check` → 0
- [ ] `npm test` → green (ssrf + university-media + parity)
- [ ] `npm run lint:build` → 0 new
- [ ] Push branch; open draft PR via ManagePullRequest
- [ ] Do **not** commit `next-env.d.ts`

-- ============================================================================
-- Phase 112: add `program_slug` column to partner_applications + backfill.
--
-- Why this exists
-- ───────────────
-- Phase 111 audit found the application edit page matched the saved
-- program by `name` (line 75 of `[id]/edit/page.tsx`):
--
--   const matchedProgram = (p.programs || []).find(
--     (prog) => prog.name === a.program,
--   );
--
-- If two programs at the same university share a name (BSc + MSc
-- both "Computer Science"), the partner's saved `program` text
-- resolves ambiguously on edit — the wrong program lights up in
-- the picker with no warning.
--
-- Fix: store the catalog slug alongside the human-readable name
-- on the application row. The picker can match by slug (unique
-- per row in the live catalog) and fall back to name only when
-- the row was created outside the catalog (manual mode).
--
-- Schema impact
-- ─────────────
-- `program_slug VARCHAR(120) NULL` on `partner_applications`.
-- Nullable so the migration is safe on existing rows; the backfill
-- below populates ~all of them, leaving only manual-mode rows
-- (program == partner-typed free text) with NULL.
--
-- The 120-char limit matches the `programs.slug` column (255-cap
-- in practice; 120 leaves headroom for future prefixes). No FK
-- to programs.slug by design — a deleted program shouldn't
-- silently null out the saved application; we keep the denormalized
-- slug as a hint, and the edit page falls back to name matching
-- when the slug doesn't resolve to a live row.
--
-- Backfill strategy
-- ────────────────
-- Join partner_applications.university (text) against
-- universities.slug (university name == slug — same denormalized
-- pattern used everywhere in this schema) to scope the program
-- lookup to the right school, then match program name against
-- programs.name. One-pass UPDATE with NOT EXISTS guard so the
-- migration is idempotent.
--
-- Post-migration: the partner applications edit page (Phase 112
-- follow-up) reads `program_slug` directly and matches it against
-- `programs.slug` in the live catalog.
-- ============================================================================

BEGIN;

-- 1. Add the column.
ALTER TABLE public.partner_applications
  ADD COLUMN IF NOT EXISTS program_slug VARCHAR(120);

-- 2. Partial index — only rows with a real catalog slug benefit.
--    Manual-mode rows (NULL) don't get indexed because the edit
--    page falls back to name matching for them.
CREATE INDEX IF NOT EXISTS idx_partner_applications_program_slug
  ON public.partner_applications (program_slug)
  WHERE program_slug IS NOT NULL;

-- 3. Backfill: pair university + program name with the live
--    catalog. universities.slug is the same string stored on
--    partner_applications.university (denormalized text).
UPDATE public.partner_applications pa
SET program_slug = p.slug
FROM public.programs p
JOIN public.universities u ON u.slug = p.university_slug
WHERE pa.university = u.slug
  AND pa.program = p.name
  AND pa.program_slug IS NULL;

-- 4. Audit: report coverage as a NOTICE so the operator sees
--    the result when running via Supabase SQL editor.
DO $$
DECLARE
  v_total BIGINT;
  v_with_slug BIGINT;
  v_pct NUMERIC;
BEGIN
  SELECT count(*) INTO v_total FROM public.partner_applications;
  SELECT count(*) INTO v_with_slug FROM public.partner_applications WHERE program_slug IS NOT NULL;
  IF v_total > 0 THEN
    v_pct := round((v_with_slug::numeric / v_total::numeric) * 100, 1);
  ELSE
    v_pct := 0;
  END IF;
  RAISE NOTICE 'partner_applications.program_slug backfill: % / % rows have a catalog slug (% %%)',
    v_with_slug, v_total, v_pct;
END
$$;

COMMENT ON COLUMN public.partner_applications.program_slug
  IS 'Catalog programs.slug at write time. NULL means the row was created with a free-text program not in the live catalog (manual-mode row). Phase 112.';

COMMIT;

-- ============================================================================
-- Manual cleanup query — run separately if you want to spot the
-- rows that didn't match (manual-mode / typo'd program names):
--
--   SELECT id, partner_id, university, program, program_slug
--   FROM public.partner_applications
--   WHERE program_slug IS NULL
--   ORDER BY updated_at DESC
--   LIMIT 50;
--
-- For each row, the partner either typed a program that no longer
-- exists in the catalog (typo, removed program, pre-migration
-- free-text entry) or chose "not in catalog" mode. The edit page
-- surfaces these via the existing notInCatalog amber banner.
-- ============================================================================
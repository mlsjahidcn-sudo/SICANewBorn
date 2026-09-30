-- Phase 128a — programs.status surface
--
-- Adds the four columns that every other catalog module already has
-- (universities has `archived_at`, scholarships has `is_published`):
--   is_featured     -> home page "Popular programs" widget + admin toggle
--   is_published    -> public GET filter (admin can hide a row without
--                      losing it; today the only escape is hard DELETE)
--   archived_at     -> soft-delete; preserves FK links with partner
--                      promotions + applications that hard-DELETE would
--                      cascade into, with a 409 + "archive instead?"
--                      offer on the existing DELETE route
--   featured_rank   -> stable ordering for the home widget (when 2+
--                      rows are featured, lower rank wins; ties by name)
--
-- All four default safe:
--   is_featured    DEFAULT FALSE  (no row is featured until you ask)
--   is_published   DEFAULT TRUE   (every row stays visible until you
--                                   explicitly unpublish — matches the
--                                   expectation that newly-added content
--                                   goes live)
--   archived_at    DEFAULT NULL    (no row is archived until asked)
--   featured_rank  DEFAULT NULL    (NULL means "feature but don't rank"
--                                   — sort then by name)
--
-- One partial index speeds up the home-page featured query:
-- WHERE is_featured = TRUE AND archived_at IS NULL
--
-- The existing RLS policies stay untouched — the new columns inherit
-- the same visibility rules as the rest of the row (admin-only writes,
-- public reads via the anon policy).

ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS featured_rank INT;

-- Home-page featured widget: only featured + visible rows, ordered by
-- rank then name. The partial predicate keeps the index small even as
-- programs grows (every row's indexed entry only exists while it's
-- actively featured — flipping is_featured=FALSE drops it).
CREATE INDEX IF NOT EXISTS idx_programs_featured_live
  ON programs (featured_rank NULLS LAST, name)
  WHERE is_featured = TRUE
    AND archived_at IS NULL
    AND is_published = TRUE;

-- Public list filter: anonymous read path needs to skip archived rows
-- fast. Complements the existing idx_programs_university_slug /
-- idx_programs_degree indexes.
CREATE INDEX IF NOT EXISTS idx_programs_published_unarchived
  ON programs (is_published, archived_at);
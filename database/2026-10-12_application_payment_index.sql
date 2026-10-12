-- ============================================================================
-- Phase 145 — application payment aggregate index
--
-- Background: /admin/applications now surfaces a payment badge per row
-- (Paid / Partial / Unpaid / No fee) derived from student_fees. The list
-- API does a single round-trip to fetch all fees for the visible row set,
-- grouped by application_id. Without an index, that join does a seq scan
-- on student_fees (~thousands of rows projected) for every page load.
--
-- Partial index — only rows with application_id NOT NULL are useful for
-- the aggregate. Existing student_fees rows without an application_id
-- (older rows + future free-standing fees) are excluded from the index
-- so it stays small.
--
-- Auth: no RLS change. student_fees RLS already allows admin SELECT.
--
-- Rollback: DROP INDEX IF EXISTS idx_student_fees_application_partial;
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_student_fees_application_partial
  ON student_fees (application_id)
  WHERE application_id IS NOT NULL;

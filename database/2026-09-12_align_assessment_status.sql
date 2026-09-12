-- Migration: Phase 83 — align student_assessments status taxonomy.
--
-- Root cause: the DB CHECK constraint on student_assessments.status
-- allowed only 'New', 'Reviewing', 'Completed', 'Rejected' (4 values),
-- while the admin UI + API STATUS_WHITELIST allowed 'Pending',
-- 'Reviewed', 'Contacted', 'Accepted', 'Rejected' (5 values).
-- Only 'Rejected' was valid in both. Of the 5 dropdown options,
-- 4 triggered a CHECK constraint violation that returned 500
-- with the raw 'student_assessments_status_check' error text,
-- making the assessment queue effectively unmanageable.
--
-- Fix: replace the CHECK with the union of both taxonomies so
-- neither side loses options. Future code that wants a subset
-- can use STATUS_WHITELIST — the DB is the upper bound.
--
-- Backfill: any rows in the old (now-invalid) space were never
-- possible (DB rejected them). Safe to apply.

ALTER TABLE student_assessments
  DROP CONSTRAINT IF EXISTS student_assessments_status_check;

ALTER TABLE student_assessments
  ADD CONSTRAINT student_assessments_status_check
  CHECK (status IN (
    'New',
    'Pending',
    'Reviewing',
    'Reviewed',
    'Completed',
    'Contacted',
    'Accepted',
    'Rejected'
  ));
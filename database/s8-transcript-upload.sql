-- ============================================
-- Transcript file upload (S8)
-- Adds transcript_storage_path column so the actual file
-- can be stored in Supabase Storage and downloaded by admins.
-- ============================================

-- 1. Add storage path column
ALTER TABLE student_assessments
  ADD COLUMN IF NOT EXISTS transcript_storage_path TEXT;

COMMENT ON COLUMN student_assessments.transcript_storage_path IS
  'Supabase Storage path for the uploaded transcript file (e.g. transcripts/<assessment_id>/filename.pdf)';

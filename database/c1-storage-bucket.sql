-- ============================================================================
-- C1: Student documents storage bucket + RLS
-- ============================================================================
--
-- Creates the `student-documents` bucket and the storage RLS policies that
-- scope uploads/reads to the calling student (or admin).
--
-- Path layout: {bucket}/{student_id}/{document_id}-{filename}
--
-- Flow:
--   1. Client → POST /api/student/documents/upload-url
--      → server signs an upload URL for the path above
--   2. Client → PUT file bytes directly to the signed URL (Supabase Storage)
--   3. Client → POST /api/student/documents (with file_url = storage path)
--      → server creates a student_documents row pointing at the file
--
-- The bucket is PRIVATE (public = false). All reads go through signed URLs.

-- ----------------------------------------------------------------------------
-- 1. Bucket
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-documents',
  'student-documents',
  false,                                  -- private bucket
  10485760,                               -- 10MB per file
  ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- 2. Storage RLS policies on storage.objects
-- ----------------------------------------------------------------------------
-- We rely on the fact that storage.objects.bucket_id = 'student-documents'
-- and the path always starts with `{user_id}/` for student uploads.
--
-- SECURITY DEFINER: We do NOT use is_admin() here because storage RLS doesn't
-- have access to admin_profiles via the same path as table RLS — the simpler
-- rule "admins can do anything" is below using a direct role check via
-- auth.jwt() ->> 'role' or by hitting admin_profiles via a SECURITY DEFINER
-- function. For now we keep it scoped to student_id in the path, and admins
-- can read via the service-role client.

-- 2a. Students can INSERT into their own folder
DROP POLICY IF EXISTS "Students can upload their own documents" ON storage.objects;
CREATE POLICY "Students can upload their own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'student-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2b. Students can READ their own files
DROP POLICY IF EXISTS "Students can read their own documents" ON storage.objects;
CREATE POLICY "Students can read their own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'student-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2c. Students can UPDATE (overwrite) their own files — needed because the
-- upload is a two-step process (signed PUT + finalize) and some clients
-- might retry the PUT.
DROP POLICY IF EXISTS "Students can update their own documents" ON storage.objects;
CREATE POLICY "Students can update their own documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'student-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2d. Students can DELETE their own files
DROP POLICY IF EXISTS "Students can delete their own documents" ON storage.objects;
CREATE POLICY "Students can delete their own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'student-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2e. Admins can read all student documents (for verification / audit).
-- We use a SECURITY DEFINER function to look up admin_profiles so storage
-- RLS doesn't have to chase the table RLS graph.
CREATE OR REPLACE FUNCTION public.is_admin_for_storage()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
      AND is_active = true
      AND role IN ('admin', 'super_admin')
  );
$$;

DROP POLICY IF EXISTS "Admins can read all student documents" ON storage.objects;
CREATE POLICY "Admins can read all student documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'student-documents'
    AND public.is_admin_for_storage()
  );

-- ----------------------------------------------------------------------------
-- 3. student_documents table RLS — already exists from the original migration,
--    but the public-read policy (if any) needs to be removed so private files
--    are not accidentally exposed via the REST API.
-- ----------------------------------------------------------------------------
-- (No-op — student_documents RLS is already correctly scoped to student_id = auth.uid()
--  for the student portal. Admins use the service-role client.)

-- ============================================================================
-- Phase 76: Admin "Request documents" for public-form submissions
--
-- The public application form (Phase 75) creates partner_applications
-- rows with source='public_form'. Sometimes the student doesn't
-- upload their passport / transcript / English test in the form, and
-- the admin needs to ask for them. This migration adds a
-- `documents_requested` JSONB column that holds a list of pending
-- request events; the admin's UI can render them on the application
-- detail page and mark them as fulfilled when the student uploads.
--
-- Why JSONB and not a separate table?
--   - One application has at most a handful of request events
--     (typically 1-2). A separate table would add a join + an
--     extra round trip on every detail-page render for a feature
--     that almost never sees >1 active request.
--   - The list-of-events shape maps cleanly to the UI: render the
--     open ones as "pending requests", the closed ones as history.
--   - JSONB makes the "latest open request" query trivial
--     (jsonb_path_query_array) without writing a partial index.
--
-- Apply: psql $COZE_SUPABASE_DB_URL -f database/2026-08-21_documents_requested.sql
-- or paste into Supabase dashboard → SQL Editor.
-- ============================================================================

ALTER TABLE public.partner_applications
  ADD COLUMN IF NOT EXISTS documents_requested JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Each entry shape:
-- {
--   "id": "<uuid>",                            // server-generated
--   "categories": ["passport","transcript"],  // requested categories
--   "message": "Please upload your passport and most recent transcript.",
--   "requested_at": "<iso8601>",
--   "requested_by": "<admin user uuid>",
--   "requested_by_email": "admin@sica.cn",     // hydrated server-side
--   "fulfilled_at": "<iso8601>" | null,        // null while open
--   "fulfilled_by": "<admin user uuid>" | null
-- }
--
-- GIN index on the categories array for "all apps with an open
-- passport request" type queries. Cheap because most rows have
-- an empty array.
CREATE INDEX IF NOT EXISTS idx_partner_apps_documents_requested_categories
  ON public.partner_applications USING GIN ((documents_requested->'categories'))
  WHERE documents_requested <> '[]'::jsonb;

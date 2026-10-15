-- ============================================================================
-- Phase 179 (2026-10-15): keep the advisor's shortlist reasoning admin-only,
-- and stop students writing to their own application rows directly.
--
-- WHY THIS EXISTS
-- ---------------
-- The shortlist builder (Phase 175) gave the admin a campaign per student:
-- which target is a Reach, which is a Safety. That is the advisor's
-- private judgement — a student seeing "this one is a stretch" is a
-- confidence leak, and seeing the UUID grouping is just noise.
--
-- The UI already hides it. `mapApplicationForStudent()` in
-- src/lib/application-mapper.ts is an explicit allowlist that omits
-- `campaign_id` / `campaign_role`. But the UI is not the security
-- boundary — RLS is, and RLS here was scoped by ROW, never by COLUMN:
--
--     CREATE POLICY "Students can view their own applications"
--       FOR SELECT USING (student_id = auth.uid());
--
-- A logged-in student holds the public anon key (it ships in the browser
-- bundle), so they can skip our API entirely and query PostgREST
-- directly, which returns every column of their own rows:
--
--     GET {SUPABASE_URL}/rest/v1/student_applications
--         ?select=campaign_role,admin_notes
--
-- `admin_notes` is deliberately NOT revoked: it is the Phase 1
-- "Notes from admissions" channel the student detail page renders on
-- purpose. Two different things were sharing one column, and only one
-- of them is meant to be private.
--
-- ─────────────────────────────────────────────────────────────────
-- THE SECOND HALF: students could WRITE their own rows
-- ─────────────────────────────────────────────────────────────────
-- While checking the above, a worse hole turned up next to it:
--
--     CREATE POLICY "Students can update their own applications"
--       FOR UPDATE USING (student_id = auth.uid());
--
-- No `WITH CHECK` clause, and no column-level grants anywhere in this
-- schema — so `authenticated` holds full-table UPDATE. Which means a
-- student with a browser console can do:
--
--     PATCH /rest/v1/student_applications?id=eq.<their own row>
--     { "status": "Accepted" }
--
-- and mark their own application Accepted, set `enrolled_at`, or
-- rewrite any other column. An advisor's pipeline is data the student
-- is not allowed to author.
--
-- Nothing client-side writes to this table — the student portal goes
-- through /api/student/applications exclusively, and Phase 179 moves
-- those routes to the service-role client (which bypasses RLS and
-- these grants, with `.eq('student_id', user.id)` still applied
-- explicitly). So after that change `authenticated` needs no direct
-- write access at all, and revoking it closes the hole outright.
--
-- Apply via Supabase dashboard SQL editor. Idempotent.
-- ============================================================================

-- 1. Students lose ALL direct access to this table --------------------

-- TABLE-level revoke, not column-level. This was originally written as
--
--     REVOKE SELECT (campaign_id, campaign_role) ... FROM authenticated;
--
-- and it does NOT work on Supabase. Verified on 2026-10-15: after
-- applying that version, has_column_privilege still returned true for
-- campaign_role.
--
-- Why: PostgreSQL privileges are ADDITIVE. Supabase grants ALL on every
-- table in `public`, so there is a TABLE-level SELECT grant. A
-- column-level REVOKE can only subtract a privilege granted at the
-- column level; the table-level grant still confers SELECT on every
-- column. Subtracting is impossible — you can only remove the table
-- grant, then add back the columns you actually want.
--
-- So: revoke the table grant outright and grant nothing back.
--
-- That is safe because as of this same phase EVERY route that reads or
-- writes student_applications runs on the service-role client
-- (/api/student/applications moved here), which bypasses RLS and grants
-- alike. The student-facing scoping is the explicit
-- `.eq('student_id', user.id)` on those queries, not RLS. The RLS
-- policies below stay in place as defence in depth.
--
-- Re-runnable: REVOKE on an ungranted privilege is a no-op.
REVOKE SELECT ON public.student_applications FROM authenticated;

COMMENT ON COLUMN public.student_applications.campaign_id IS
  'Groups the rows of one shortlist. NULL = a pre-Phase-175 single-target application. Admin-only since Phase 179: the `authenticated` role has no SELECT privilege on this column, so a student cannot read it via direct PostgREST.';
COMMENT ON COLUMN public.student_applications.campaign_role IS
  'Advisor placement intent: Reach | Target | Safety. Admin-only since Phase 179 — this is the advisor''s private judgement of the student''s chances, not student-facing information.';

-- 2. Students stop writing to their own rows directly ------------------

-- All student-facing writes go through /api/student/applications, which
-- as of Phase 179 runs on the service-role client and validates status
-- transitions against the closed vocabulary before writing. Direct
-- PostgREST writes bypass every one of those checks, which is how a
-- student could author their own 'Accepted'.
REVOKE INSERT ON public.student_applications FROM authenticated;
REVOKE UPDATE ON public.student_applications FROM authenticated;

-- NOTE: RLS still allows both operations for `auth.uid()`'s own rows.
-- The REVOKE is what removes the ability — RLS says WHICH rows, grants
-- say WHETHER you may touch them at all. Both layers are needed.

-- 3. Verification ------------------------------------------------------

-- Should return 0 rows. If it returns rows, some student-facing code is
-- still writing through the anon key and the revoke has broken it:
--
--   SELECT count(*) FROM student_applications
--    WHERE created_at > now() - interval '1 day';
--
-- Confirm the columns are actually gone from the authenticated role
-- (information_schema.role_table_grants shows table-level grants only;
-- use has_column_privilege for column-level):
--
--   SELECT
--     has_column_privilege('authenticated', 'student_applications', 'campaign_role', 'SELECT') AS can_read_campaign_role,
--     has_column_privilege('authenticated', 'student_applications', 'admin_notes',    'SELECT') AS can_read_admin_notes,
--     has_column_privilege('authenticated', 'student_applications', 'university_name','SELECT') AS can_read_anything,
--     has_column_privilege('authenticated', 'student_applications', 'status',         'UPDATE') AS can_write_status;
--
-- Expected: false | false | false | false
--
-- admin_notes is unreadable now too — not by choice, but because the
-- whole table is off-limits to `authenticated`. Students still see it:
-- the API route uses the service role and mapApplicationForStudent
-- decides what reaches the browser. The RLS policies on the table
-- remain as a second layer.

-- To restore column-selective access later (if a client-side reader
-- ever needs one), revoke the table grant and grant columns back:
--
--   REVOKE SELECT ON public.student_applications FROM authenticated;
--   GRANT SELECT (id, university_name, program_name, status, ...)
--     ON public.student_applications TO authenticated;

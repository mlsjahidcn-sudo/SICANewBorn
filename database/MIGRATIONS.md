# Database migrations — apply order

Supabase project: `wbzdwwvtbaftjxecgdxk` (ap-northeast-1, supabase.com).
Migrations are applied manually via the Supabase dashboard SQL editor —
there is no applied-migrations tracking table, so keep a note of what
you ran and when.

## Fresh deploy

Run in this order. `migration-supabase-cloud.sql` is the base schema
(tables + RLS + triggers); everything after it is incremental.

1. `migration-supabase-cloud.sql` — full base schema (2026-06-02)
2. `student-tables.sql` — student-portal tables + RLS
3. `fix-rls-recursion.sql` — SECURITY DEFINER `is_admin()` fix
4. Legacy phase patches, in phase order:
   - `s5-intake-tables.sql`
   - `s8-transcript-bucket.sql`
   - `s8-transcript-upload.sql`
   - `s9-admin-students.sql`
   - `s11-admin-extras.sql`
   - `s12-applications-no-student.sql`
   - `c1-storage-bucket.sql`
   - `d1-fix-student-trigger.sql`
5. Every date-prefixed file, in filename (chronological) order:
   `2026-06-04_*` → `2026-09-13_*` — see the directory listing; the
   names sort correctly as-is.

`supabase/migrations/` contains a divergent, partial CLI-style copy of
some of these files — it is NOT authoritative. Do not mix the two trees.

## Caveats

- The ordering above is derived from file names and the phase log in
  `AGENTS.md`, not from a dependency graph. Before running a fresh
  deploy end-to-end, diff the resulting schema against a snapshot of
  the live project (Supabase dashboard → Database → Backups, or
  `pg_dump --schema-only`).
- Most files are written to be re-runnable (`if exists` / `on conflict`
  guards), but not all — re-running a non-idempotent file can fail
  loudly (that's fine) or, worse, re-seed data (check for `insert`
  blocks before re-running).
- `2026-07-11_README.md` documents apply-order + verification queries
  for the three `2026-07-11_*` files.
- Storage buckets (`transcripts`, `student-documents`) live in the
  `storage` schema — the bucket restore/patch files
  (`s8-transcript-bucket.sql`, `c1-storage-bucket.sql`,
  `2026-08-26_restore_transcripts_bucket.sql`) must also run for
  uploads to work.

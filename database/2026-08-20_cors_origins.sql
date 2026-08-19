-- ============================================================================
-- Phase C-6: B2B CORS allowlist (per-key)
--
-- Browser-side consumers (e.g. a partner's public-facing site calling SICA
-- via fetch() from JS) need CORS headers to make cross-origin requests.
-- Per-key allowlist: each API key declares which origins can call it from
-- a browser. Server (not browser) is the source of truth — the key's
-- `cors_origins` array is checked on every request and only the matched
-- origin gets `Access-Control-Allow-Origin`.
--
-- Allowed values:
--   - Exact origin strings: 'https://acme-recruitment.com'
--   - Wildcard '*' is NOT allowed for production keys (would let any site
--     call the API on behalf of the partner's key). Use a sandbox key for
--     that case (see Phase 73).
--
-- Empty array (default) = no CORS (current behavior — server-side and
-- curl consumers work fine; browser consumers get CORS errors).
--
-- Apply: psql $COZE_SUPABASE_DB_URL -f database/2026-08-20_cors_origins.sql
-- or paste into Supabase dashboard → SQL Editor.
-- ============================================================================

ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS cors_origins TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Light sanity constraint: at most 50 origins per key. The wildcard '*' is
-- restricted to a single-element array (use a sandbox key for that). This
-- is defense-in-depth, not the primary gate — the primary gate is the
-- exact-match check in src/lib/v1-cors.ts.
ALTER TABLE public.api_keys
  DROP CONSTRAINT IF EXISTS api_keys_cors_origins_limit;
ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_cors_origins_limit
  CHECK (array_length(cors_origins, 1) IS NULL OR array_length(cors_origins, 1) <= 50);

-- Wildcard-only keys: allow '*' as the sole entry. Enforced in src/lib
-- (we don't trust the DB CHECK to be the only gate).
ALTER TABLE public.api_keys
  DROP CONSTRAINT IF EXISTS api_keys_cors_origins_wildcard;
ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_cors_origins_wildcard
  CHECK (
    NOT (cors_origins = ARRAY['*']::TEXT[]) OR array_length(cors_origins, 1) = 1
  );

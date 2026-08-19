-- ============================================================================
-- Phase C-1: B2B catalog API — api_keys table
--
-- Issue scoped API keys to external integrators (affiliate sites, sister
-- platforms, recruitment partners) so they can call /v1/catalog/* without
-- having a Supabase account. The /v1/* surface is public read-only catalog
-- data; the existing /api/admin/* and /api/partner/* keep their session-auth
-- model — this is a separate, parallel auth path.
--
-- Key format: sk_live_<base64 32 bytes> (Stripe-style). The plaintext is
-- shown once on creation and never stored. We store:
--   - key_prefix  (first 12 chars including "sk_live_") for display + lookup
--   - key_hash    (SHA-256 of the full key, hex)
-- The lookup path is: prefix-scan to narrow candidates, then SHA-256 compare.
-- v1 keeps it simple: hash the full key with SHA-256, store the hash. No
-- bcrypt — bcrypt is for low-rate password auth; API keys are hit 100s of
-- times per minute per partner, and SHA-256 is fine because the key space
-- is 256 bits of entropy (brute force is computationally infeasible).
--
-- Auth model: every /v1/* request needs Authorization: Bearer sk_live_...
-- Middleware (src/lib/api-auth.ts) extracts the bearer, hashes, looks up,
-- checks not revoked + not expired, attaches key context to the request.
--
-- Apply: run via Supabase dashboard SQL editor, or:
--   psql "$COZE_SUPABASE_DB_URL" -f database/2026-08-20_api_keys.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Human-readable label, e.g. "Acme Recruitment — Production"
  name TEXT NOT NULL,

  -- Org + contact for notifications (rate-limit warnings, deprecation,
  -- security advisories). Not unique — one org can have multiple keys.
  org_name TEXT,
  contact_email TEXT NOT NULL,

  -- Lookup columns. key_prefix is the first 12 chars of the plaintext
  -- (always starts with "sk_live_") — narrow-scan index. key_hash is
  -- SHA-256(plaintext) hex. Together: O(prefix matches) hash compares.
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,

  -- Scope tags — array so we can add new scopes without a migration.
  -- v1: only "read:catalog". Future: "read:applications" etc.
  scope TEXT[] NOT NULL DEFAULT ARRAY['read:catalog']::TEXT[],

  -- Per-key rate limit. Default 100 req/min, can be raised for trusted
  -- partners. C-3 will wire the actual limiter.
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 100,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  -- Lifetime cap. NULL = no expiry (default for trusted internal keys).
  expires_at TIMESTAMPTZ,
  -- Soft revoke: row stays for audit, requests rejected. Hard delete
  -- only if the user explicitly asks GDPR-style.
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id),
  revoke_reason TEXT
);

-- Index for the prefix-scan lookup in the auth middleware.
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix_active
  ON public.api_keys(key_prefix)
  WHERE revoked_at IS NULL;

-- Index for the admin UI's "active keys" list.
CREATE INDEX IF NOT EXISTS idx_api_keys_created
  ON public.api_keys(created_at DESC);

-- RLS: only admins can read/write. The auth middleware uses the service
-- role to bypass RLS for the lookup itself.
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS api_keys_admin_all ON public.api_keys;
CREATE POLICY api_keys_admin_all ON public.api_keys
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Last_used_at auto-update helper: a SECURITY DEFINER function the
-- middleware calls so we don't need service-role for the bump. Also
-- gives us a single place to add per-request counters later (C-3).
CREATE OR REPLACE FUNCTION public.touch_api_key_last_used(p_key_hash TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.api_keys
  SET last_used_at = now()
  WHERE key_hash = p_key_hash
    AND revoked_at IS NULL;
END;
$$;

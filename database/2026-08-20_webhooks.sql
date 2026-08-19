-- ============================================================================
-- Phase C-5: B2B webhooks — webhook_subscriptions + webhook_deliveries
--
-- SICA emits events (university.created/updated/deleted, program.created/
-- updated/deleted) to subscriber URLs that the integrator registers
-- via /v1/webhooks. The secret is a per-subscription HMAC key used to
-- sign deliveries; the subscriber verifies the signature before
-- trusting the payload.
--
-- Delivery model: at-least-once. Failed deliveries (5xx, network) get
-- retried with exponential backoff (1m, 5m, 30m, 2h, 12h) up to 5
-- attempts. 4xx is treated as a permanent failure (the consumer is
-- telling us "bad request" — retrying just spams them). Each
-- attempt is recorded in webhook_deliveries for audit.
--
-- Apply: psql $COZE_SUPABASE_DB_URL -f database/2026-08-20_webhooks.sql
-- or paste into Supabase dashboard → SQL Editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The api_keys row this subscription belongs to. ON DELETE CASCADE:
  -- revoking a key wipes its webhooks (no orphan deliveries).
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,

  -- Where to POST. Validated on insert to be https:// (or http://
  -- for local dev). The consumer verifies the X-SICA-Signature
  -- header on every request.
  url TEXT NOT NULL,

  -- Events to subscribe to. Validated against an enum at the app
  -- layer (Zod). Possible values:
  --   university.created | university.updated | university.deleted
  --   program.created    | program.updated    | program.deleted
  events TEXT[] NOT NULL,

  -- HMAC-SHA256 secret. Shown ONCE on create (like the API key); the
  -- consumer stores it server-side and uses it to verify signatures.
  -- 32 random bytes (256 bits), base64url-encoded.
  secret TEXT NOT NULL,

  -- Optional human-readable label, e.g. "Acme Production Worker".
  description TEXT,

  -- Soft-disable without losing history. Admin can flip this off
  -- temporarily; deliveries stop, row stays.
  active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  last_triggered_at TIMESTAMPTZ,

  -- Stats: how many successful vs failed deliveries since creation.
  -- Cheap counters (no separate table); updated on every delivery
  -- attempt.
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0
);

-- Per-subscription lookup is the hot path (event dispatch reads
-- subscriptions for event X). Partial index on active=true so
-- disabled subs don't bloat the index.
CREATE INDEX IF NOT EXISTS idx_webhook_subs_active
  ON public.webhook_subscriptions(api_key_id)
  WHERE active = true;

-- Event filter — postgres GIN index on the events array, partial on
-- active=true. Event dispatch queries `WHERE events @> ARRAY[$1]`.
CREATE INDEX IF NOT EXISTS idx_webhook_subs_events
  ON public.webhook_subscriptions USING GIN(events)
  WHERE active = true;

ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS webhook_subs_admin ON public.webhook_subscriptions;
CREATE POLICY webhook_subs_admin ON public.webhook_subscriptions
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Service-role also bypasses RLS, which is what the B2B /v1/webhooks
-- endpoints use (after requireApiKey confirms the caller is the
-- owner of api_key_id). The ownership check is done in the route,
-- not in RLS, because the RLS doesn't know which api_key the
-- request was authenticated with.

-- ============================================================================
-- Delivery audit log
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  subscription_id UUID NOT NULL REFERENCES public.webhook_subscriptions(id) ON DELETE CASCADE,

  -- Event name (e.g. "university.updated"). Denormalized from the
  -- subscription at the time of dispatch so the log is queryable
  -- without joining.
  event TEXT NOT NULL,

  -- The exact JSON body that was POSTed. Stored as JSONB so admins
  -- can inspect via the dashboard.
  payload JSONB NOT NULL,

  -- pending  : queued, not yet attempted
  -- success  : 2xx response
  -- failed   : non-2xx, will retry per next_retry_at
  -- dead     : failed 5+ times, no more retries
  status TEXT NOT NULL DEFAULT 'pending',

  -- Response from the subscriber (for debugging).
  http_status INTEGER,
  response_body TEXT,

  attempt_count INTEGER NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,

  -- Set when the delivery first enters the queue. Used for SLA
  -- reporting ("how long did the average delivery take").
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Listing deliveries for a subscription: subscription_id + created_at DESC
-- is the only query pattern from the admin UI.
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_sub_created
  ON public.webhook_deliveries(subscription_id, created_at DESC);

-- Worker query: pick up deliveries due for retry. Partial index
-- on status=failed AND next_retry_at IS NOT NULL keeps it tiny.
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_retry
  ON public.webhook_deliveries(next_retry_at)
  WHERE status = 'failed';

-- Worker query: pending deliveries that haven't been attempted yet.
-- Tiny because the worker drains these on each tick.
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_pending
  ON public.webhook_deliveries(created_at)
  WHERE status = 'pending';

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS webhook_del_admin ON public.webhook_deliveries;
CREATE POLICY webhook_del_admin ON public.webhook_deliveries
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- SECURITY DEFINER counter bump. Lets the worker update the
-- subscription's success/failure tallies + last_triggered_at
-- without needing service-role for the table write. One round
-- trip per delivery, atomic.
CREATE OR REPLACE FUNCTION public.bump_webhook_subscription_counters(
  p_id UUID,
  p_success_delta INTEGER,
  p_failure_delta INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.webhook_subscriptions
  SET
    success_count = success_count + p_success_delta,
    failure_count = failure_count + p_failure_delta,
    last_triggered_at = CASE
      WHEN p_success_delta > 0 OR p_failure_delta > 0 THEN now()
      ELSE last_triggered_at
    END
  WHERE id = p_id;
END;
$$;

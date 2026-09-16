-- =============================================================================
-- Phase 108 Batch 8: student_fees overdue cron
-- =============================================================================
-- A SECURITY DEFINER function that flips Pending/Partial -> Overdue on
-- student_fees rows where due_date < CURRENT_DATE and status hasn't
-- already moved to Overdue. Idempotent — re-running on the same day
-- is a no-op (the partial index on (due_date) WHERE status IN
-- ('Pending','Partial') is already in place from s11-admin-extras.sql).
--
-- Usage: call from a cron route (POST /api/cron/student-fees-overdue)
-- gated on x-cron-secret + STUDENT_FEES_CRON_SECRET env var (matches
-- the news/drip cron fail-closed pattern from Phase 91).
--
-- Returns: the count of rows flipped. The route logs + audits via
-- student_fee_events.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.student_fee_overdue_cron()
RETURNS TABLE (flipped_count integer, fee_ids uuid[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_ids uuid[];
  flipped integer;
BEGIN
  -- Capture the ids that we're about to flip (so the route can
  -- insert audit events for each).
  SELECT array_agg(id) INTO affected_ids
  FROM public.student_fees
  WHERE due_date < CURRENT_DATE
    AND status IN ('Pending', 'Partial');

  IF affected_ids IS NULL THEN
    affected_ids := ARRAY[]::uuid[];
    flipped := 0;
  ELSE
    flipped := array_length(affected_ids, 1);
  END IF;

  UPDATE public.student_fees
  SET status = 'Overdue'
  WHERE id = ANY (affected_ids);

  RETURN QUERY SELECT flipped, affected_ids;
END;
$$;

GRANT EXECUTE ON FUNCTION public.student_fee_overdue_cron() TO service_role;
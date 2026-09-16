-- ============================================================================
-- Phase 107 / Batch 8: enrolled_timeseries RPC
--
-- Mirrors the existing admin_reports_time_series shape but uses
-- student_applications.enrolled_at (added in
-- 2026-09-17_phase107_applications_foundation.sql) instead of
-- decision='Accepted'. Powers the 4th line on the /admin/reports
-- time-series chart + the 'Enrolled' KPI card on the same page.
--
-- Decision='Accepted' counts all rows the admin marked accepted,
-- even ones that never actually enrolled (no deposit, no visa).
-- enrolled_at is a stronger signal — it captures rows where the
-- admin finalized the enrollment via /api/admin/applications/[id]/enroll
-- (deposit + visa + arrival captured). One row per day bucketed by
-- the enrolled_at date.
-- ============================================================================

CREATE OR REPLACE FUNCTION admin_reports_enrolled_timeseries(
  p_from TIMESTAMP WITH TIME ZONE,
  p_to TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE(date TEXT, enrolled BIGINT) AS $$
BEGIN
  RETURN QUERY
  WITH days AS (
    SELECT generate_series(
      p_from::DATE,
      p_to::DATE,
      '1 day'::INTERVAL
    )::DATE AS day
  ),
  enrolled_counts AS (
    SELECT enrolled_at::DATE AS day, COUNT(*)::BIGINT AS n
    FROM student_applications
    WHERE enrolled_at IS NOT NULL
      AND enrolled_at >= p_from
      AND enrolled_at <= p_to
    GROUP BY enrolled_at::DATE
  )
  SELECT
    days.day::TEXT,
    COALESCE(enrolled_counts.n, 0::BIGINT) AS enrolled
  FROM days
  LEFT JOIN enrolled_counts ON enrolled_counts.day = days.day
  ORDER BY days.day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
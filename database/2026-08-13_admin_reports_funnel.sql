-- Phase 5: Admin Operations & Insights — funnel reporting RPCs
-- Provides aggregated, read-only data for /api/admin/reports/funnel
-- and the /admin/reports dashboard.

CREATE OR REPLACE FUNCTION admin_reports_lead_sources(p_from TIMESTAMP WITH TIME ZONE, p_to TIMESTAMP WITH TIME ZONE)
RETURNS TABLE(source TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 'Contact'::TEXT, COUNT(*)::BIGINT FROM contact_submissions
  WHERE created_at >= p_from AND created_at <= p_to
  UNION ALL
  SELECT 'Chat'::TEXT, COUNT(*)::BIGINT FROM chat_leads
  WHERE created_at >= p_from AND created_at <= p_to
  UNION ALL
  SELECT 'Assessment'::TEXT, COUNT(*)::BIGINT FROM student_assessments
  WHERE created_at >= p_from AND created_at <= p_to;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_reports_apps_by_status(p_from TIMESTAMP WITH TIME ZONE, p_to TIMESTAMP WITH TIME ZONE)
RETURNS TABLE(status TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(sa.status, 'Unknown')::TEXT, COUNT(*)::BIGINT
  FROM student_applications sa
  WHERE sa.created_at >= p_from AND sa.created_at <= p_to
  GROUP BY sa.status
  UNION ALL
  SELECT COALESCE(pa.status, 'Unknown')::TEXT, COUNT(*)::BIGINT
  FROM partner_applications pa
  WHERE pa.created_at >= p_from AND pa.created_at <= p_to
  GROUP BY pa.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_reports_source_split(p_from TIMESTAMP WITH TIME ZONE, p_to TIMESTAMP WITH TIME ZONE)
RETURNS TABLE(source TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 'Online'::TEXT, COUNT(*)::BIGINT FROM student_applications
  WHERE created_at >= p_from AND created_at <= p_to
  UNION ALL
  SELECT 'Partner'::TEXT, COUNT(*)::BIGINT FROM partner_applications
  WHERE created_at >= p_from AND created_at <= p_to;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_reports_time_series(p_from TIMESTAMP WITH TIME ZONE, p_to TIMESTAMP WITH TIME ZONE)
RETURNS TABLE(date TEXT, leads BIGINT, applications BIGINT, accepted BIGINT) AS $$
BEGIN
  RETURN QUERY
  WITH days AS (
    SELECT generate_series(
      p_from::DATE,
      p_to::DATE,
      '1 day'::INTERVAL
    )::DATE AS day
  ),
  lead_counts AS (
    SELECT created_at::DATE AS day, COUNT(*)::BIGINT AS n
    FROM (
      SELECT created_at FROM contact_submissions WHERE created_at >= p_from AND created_at <= p_to
      UNION ALL
      SELECT created_at FROM chat_leads WHERE created_at >= p_from AND created_at <= p_to
      UNION ALL
      SELECT created_at FROM student_assessments WHERE created_at >= p_from AND created_at <= p_to
    ) all_leads
    GROUP BY created_at::DATE
  ),
  app_counts AS (
    SELECT created_at::DATE AS day, COUNT(*)::BIGINT AS n
    FROM (
      SELECT created_at FROM student_applications WHERE created_at >= p_from AND created_at <= p_to
      UNION ALL
      SELECT created_at FROM partner_applications WHERE created_at >= p_from AND created_at <= p_to
    ) all_apps
    GROUP BY created_at::DATE
  ),
  accepted_counts AS (
    SELECT created_at::DATE AS day, COUNT(*)::BIGINT AS n
    FROM (
      SELECT created_at FROM student_applications WHERE created_at >= p_from AND created_at <= p_to AND decision = 'Accepted'
      UNION ALL
      SELECT created_at FROM partner_applications WHERE created_at >= p_from AND created_at <= p_to AND decision = 'Accepted'
    ) accepted_apps
    GROUP BY created_at::DATE
  )
  SELECT
    days.day::TEXT,
    COALESCE(lead_counts.n, 0::BIGINT) AS leads,
    COALESCE(app_counts.n, 0::BIGINT) AS applications,
    COALESCE(accepted_counts.n, 0::BIGINT) AS accepted
  FROM days
  LEFT JOIN lead_counts ON lead_counts.day = days.day
  LEFT JOIN app_counts ON app_counts.day = days.day
  LEFT JOIN accepted_counts ON accepted_counts.day = days.day
  ORDER BY days.day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

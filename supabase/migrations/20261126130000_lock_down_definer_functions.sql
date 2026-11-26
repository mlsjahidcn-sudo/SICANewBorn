-- Two SECURITY DEFINER functions were executable by anon/authenticated
-- through the Data API (Supabase advisor 0028/0029):
--   student_fee_overdue_cron()            -- flips unpaid fees to Overdue
--   admin_reports_enrolled_timeseries()   -- enrolment report numbers
-- The other four admin report functions had no admin check either and were
-- executable by any signed-in user (students, partners could read lead and
-- application totals). All six are only called server-side with the service-role client
-- (/api/cron/student-fees-overdue, /api/admin/reports/funnel), so remove
-- public access and keep service_role. Also pin the search_path on the
-- report function (advisor 0011). Idempotent.

revoke execute on function public.student_fee_overdue_cron() from public, anon, authenticated;
grant execute on function public.student_fee_overdue_cron() to service_role;

alter function public.admin_reports_enrolled_timeseries(timestamptz, timestamptz)
  set search_path = public;
revoke execute on function public.admin_reports_enrolled_timeseries(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.admin_reports_enrolled_timeseries(timestamptz, timestamptz) to service_role;

-- Remaining admin report functions: service_role only.
revoke execute on function public.admin_reports_time_series(timestamptz, timestamptz) from public, anon, authenticated;
revoke execute on function public.admin_reports_apps_by_status(timestamptz, timestamptz) from public, anon, authenticated;
revoke execute on function public.admin_reports_lead_sources(timestamptz, timestamptz) from public, anon, authenticated;
revoke execute on function public.admin_reports_source_split(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.admin_reports_time_series(timestamptz, timestamptz) to service_role;
grant execute on function public.admin_reports_apps_by_status(timestamptz, timestamptz) to service_role;
grant execute on function public.admin_reports_lead_sources(timestamptz, timestamptz) to service_role;
grant execute on function public.admin_reports_source_split(timestamptz, timestamptz) to service_role;

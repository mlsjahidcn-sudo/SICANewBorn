/**
 * GET /api/admin/reports/funnel
 *
 * Returns aggregate funnel data for the admin reporting dashboard:
 *  - lead sources breakdown
 *  - application volume by status
 *  - acceptance rate
 *  - partner vs online split
 *  - daily time series (leads, applications, accepted applications)
 *
 * Query params:
 *  - from, to: ISO date strings (defaults to last 30 days)
 *
 * Auth: admin only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const toParam = searchParams.get('to');
  const fromParam = searchParams.get('from');

  const to = toParam ? startOfDay(new Date(toParam)) : startOfDay(new Date());
  const from = fromParam
    ? startOfDay(new Date(fromParam))
    : new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000);

  const fromIso = from.toISOString();
  const toIso = new Date(to.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();

  const service = buildServiceClient();

  // Lead sources: contact, chat, assessment
  const leadSourcesQuery = service.rpc('admin_reports_lead_sources', {
    p_from: fromIso,
    p_to: toIso,
  });

  // Application volume by status (partner + online)
  const applicationsByStatusQuery = service.rpc('admin_reports_apps_by_status', {
    p_from: fromIso,
    p_to: toIso,
  });

  // Partner vs Online split
  const sourceSplitQuery = service.rpc('admin_reports_source_split', {
    p_from: fromIso,
    p_to: toIso,
  });

  // Time series
  const timeSeriesQuery = service.rpc('admin_reports_time_series', {
    p_from: fromIso,
    p_to: toIso,
  });

  // Phase 107 Batch 8: enrolled time series (4th line on the chart).
  // RPC added in database/2026-09-17_admin_reports_enrolled.sql.
  const enrolledTimeSeriesQuery = service.rpc('admin_reports_enrolled_timeseries', {
    p_from: fromIso,
    p_to: toIso,
  });

  try {
    const [
      { data: leadSources, error: leadSourcesErr },
      { data: applicationsByStatus, error: appsErr },
      { data: sourceSplit, error: splitErr },
      { data: timeSeries, error: tsErr },
      { data: enrolledTimeSeries, error: enrolledErr },
    ] = await Promise.all([
      leadSourcesQuery,
      applicationsByStatusQuery,
      sourceSplitQuery,
      timeSeriesQuery,
      enrolledTimeSeriesQuery,
    ]);

    if (leadSourcesErr || appsErr || splitErr || tsErr || enrolledErr) {
      console.error('[admin/reports/funnel] rpc errors:', {
        leadSourcesErr,
        appsErr,
        splitErr,
        tsErr,
        enrolledErr,
      });
      return NextResponse.json({ error: 'Failed to load report data' }, { status: 500 });
    }

    const online = (sourceSplit as { source: string; count: number }[] | null)?.find(
      (s) => s.source === 'Online',
    )?.count ?? 0;
    const partner = (sourceSplit as { source: string; count: number }[] | null)?.find(
      (s) => s.source === 'Partner',
    )?.count ?? 0;
    const totalApps = online + partner;

    const accepted =
      (applicationsByStatus as { status: string; count: number }[] | null)?.find(
        (s) => s.status === 'Accepted',
      )?.count ?? 0;
    const acceptanceRate = totalApps > 0 ? Math.round((accepted / totalApps) * 1000) / 10 : 0;

    // Phase 107 Batch 8: enrolled rate + enrolled time series.
    // Sum the per-day counts (the RPC returns one row per day, even
    // when the count is 0 — the date series is always contiguous).
    const enrolledSeries = (enrolledTimeSeries as { date: string; enrolled: number }[] | null) ?? [];
    const totalEnrolled = enrolledSeries.reduce((s, r) => s + (r.enrolled ?? 0), 0);
    const enrolledRate = accepted > 0 ? Math.round((totalEnrolled / accepted) * 1000) / 10 : 0;

    return NextResponse.json({
      dateRange: { from: formatISODate(from), to: formatISODate(to) },
      leadSources: (leadSources as { source: string; count: number }[] | null) ?? [],
      applicationsByStatus: (applicationsByStatus as { status: string; count: number }[] | null) ?? [],
      partnerVsOnline: [
        { name: 'Partner', value: partner },
        { name: 'Online', value: online },
      ],
      acceptanceRate,
      totalApplications: totalApps,
      acceptedApplications: accepted,
      timeSeries: (timeSeries as { date: string; leads: number; applications: number; accepted: number }[] | null) ?? [],
      // Phase 107 Batch 8: 4th line + 5th KPI card.
      enrolledTimeSeries: enrolledSeries,
      enrolledApplications: totalEnrolled,
      enrolledRate,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/reports/funnel] error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

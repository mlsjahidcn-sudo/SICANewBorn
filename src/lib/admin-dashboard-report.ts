import type { SupabaseClient } from '@supabase/supabase-js';
import {
  readReportRows,
  reportDates,
  reportingDate,
  type MetricComparison,
  type ReportRange,
} from './admin-reporting';
import { isWebinarStatus } from './webinar-report';

export interface TimedReportRow {
  id: string;
  created_at: string;
}
export interface DashboardAnalytics {
  range: ReportRange;
  metrics: {
    leads: MetricComparison;
    applications: MetricComparison;
    accounts: MetricComparison;
    webinars: MetricComparison;
  };
  trend: {
    date: string;
    leads: number;
    applications: number;
    previousApplications: number;
  }[];
  webinar: {
    total: number;
    attended: number;
    awaiting: number;
    noShow: number;
    attendanceRate: number | null;
  };
  submitted: number;
  pendingConsultations: number;
}
export function periodComparison(
  rows: TimedReportRow[],
  range: ReportRange,
): MetricComparison {
  const start = Date.parse(range.start);
  const end = Date.parse(range.endExclusive);
  const previous = Date.parse(range.previousStart);
  return rows.reduce(
    (result, row) => {
      const stamp = Date.parse(row.created_at);
      if (stamp >= start && stamp < end) result.current++;
      else if (stamp >= previous && stamp < start) result.previous++;
      return result;
    },
    { current: 0, previous: 0 },
  );
}
export function dashboardTrend(
  leads: TimedReportRow[],
  applications: TimedReportRow[],
  range: ReportRange,
): DashboardAnalytics['trend'] {
  const leadDays = new Map<string, number>();
  const appDays = new Map<string, number>();
  for (const row of leads) {
    const key = reportingDate(row.created_at);
    leadDays.set(key, (leadDays.get(key) || 0) + 1);
  }
  for (const row of applications) {
    const key = reportingDate(row.created_at);
    appDays.set(key, (appDays.get(key) || 0) + 1);
  }
  return reportDates(range).map((date, i) => ({
    date,
    leads: leadDays.get(date) || 0,
    applications: appDays.get(date) || 0,
    previousApplications:
      appDays.get(
        reportingDate(Date.parse(range.previousStart) + i * 86_400_000),
      ) || 0,
  }));
}
function requireCount(result: {
  error: { message: string } | null;
  count: number | null;
}): number {
  if (result.error || result.count === null)
    throw new Error(result.error?.message || 'Count unavailable.');
  return result.count;
}
export async function loadDashboardAnalytics(
  client: SupabaseClient,
  range: ReportRange,
): Promise<DashboardAnalytics> {
  const timestamps = async (
    table: string,
    archived: boolean = false,
  ): Promise<TimedReportRow[]> =>
    readReportRows<TimedReportRow>((from, to) => {
      let query = client
        .from(table)
        .select('id,created_at')
        .gte('created_at', range.previousStart)
        .lt('created_at', range.endExclusive)
        .order('created_at')
        .order('id');
      if (archived) query = query.is('archived_at', null);
      return query.range(from, to);
    });
  const [
    contacts,
    chats,
    assessments,
    studentApps,
    partnerApps,
    accounts,
    webinarRows,
    submittedStudent,
    submittedPartner,
    pendingConsultations,
  ] = await Promise.all([
    timestamps('contact_submissions'),
    timestamps('chat_leads'),
    timestamps('student_assessments'),
    timestamps('student_applications'),
    timestamps('partner_applications', true),
    timestamps('student_profiles'),
    readReportRows((from) =>
      client
        .from('webinar_signups')
        .select('id,created_at,status')
        .gte('created_at', range.previousStart)
        .lt('created_at', range.endExclusive)
        .order('created_at')
        .order('id')
        .range(from, from + 499),
    ),
    client
      .from('student_applications')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Submitted'),
    client
      .from('partner_applications')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Submitted')
      .is('archived_at', null),
    client
      .from('counselling_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Pending')
      .gte('slot_start', `${reportingDate(new Date())}T00:00:00+08:00`),
  ]);
  const leads = [...contacts, ...chats, ...assessments];
  const applications = [...studentApps, ...partnerApps];
  let attended = 0;
  let awaiting = 0;
  let noShow = 0;
  let total = 0;
  for (const row of webinarRows) {
    if (!isWebinarStatus(row.status))
      throw new Error('Unknown webinar status.');
    if (Date.parse(row.created_at) < Date.parse(range.start)) continue;
    total++;
    if (row.status === 'Attended') attended++;
    if (row.status === 'Registered') awaiting++;
    if (row.status === 'No-Show') noShow++;
  }
  return {
    range,
    metrics: {
      leads: periodComparison(leads, range),
      applications: periodComparison(applications, range),
      accounts: periodComparison(accounts, range),
      webinars: periodComparison(webinarRows, range),
    },
    trend: dashboardTrend(leads, applications, range),
    webinar: {
      total,
      attended,
      awaiting,
      noShow,
      attendanceRate:
        attended + noShow ? (attended / (attended + noShow)) * 100 : null,
    },
    submitted: requireCount(submittedStudent) + requireCount(submittedPartner),
    pendingConsultations: requireCount(pendingConsultations),
  };
}

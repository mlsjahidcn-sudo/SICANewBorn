import type { ReportBreakdown, ReportRange } from './admin-reporting';
import {
  csvCell,
  rankReportValues,
  reportDates,
  reportingDate,
  ReportInputError,
} from './admin-reporting';

export const WEBINAR_STATUSES = [
  'Registered',
  'Attended',
  'No-Show',
  'Cancelled',
] as const;
export type WebinarStatus = (typeof WEBINAR_STATUSES)[number];
export const WEBINAR_INTEREST_KEYS: Record<string, string> = {
  chinese_language: 'webinar.interests.chineseLanguage',
  foundation: 'webinar.interests.foundation',
  bachelor_march: 'webinar.interests.bachelorMarch',
  bachelor: 'webinar.interests.bachelor',
  master: 'webinar.interests.master',
  phd: 'webinar.interests.phd',
  csc: 'webinar.interests.csc',
};
export interface WebinarSignup {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  country: string | null;
  programInterests: string[];
  notes: string | null;
  sourcePage: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
  status: WebinarStatus;
  createdAt: string;
}
export interface WebinarFilters {
  q: string;
  country: string;
  source: string;
  interest: string;
  status: string;
}
export interface WebinarSummary {
  total: number;
  attended: number;
  awaiting: number;
  noShow: number;
  cancelled: number;
  attendanceRate: number | null;
  markingCoverage: number | null;
  byStatus: { status: WebinarStatus; count: number }[];
  byCountry: ReportBreakdown[];
  byInterest: ReportBreakdown[];
  bySource: ReportBreakdown[];
  trend: { date: string; registrations: number }[];
}
export interface WebinarReport {
  range: ReportRange;
  filters: WebinarFilters;
  generatedAt: string;
  stats: WebinarSummary;
  signups: WebinarSignup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: { countries: string[]; sources: string[]; interests: string[] };
}
export function isWebinarStatus(value: unknown): value is WebinarStatus {
  return (
    typeof value === 'string' &&
    WEBINAR_STATUSES.some((status) => status === value)
  );
}
export function parseWebinarFilters(params: URLSearchParams): WebinarFilters {
  const status = params.get('status') || 'all';
  if (status !== 'all' && !isWebinarStatus(status))
    throw new ReportInputError('Invalid registration status.');
  return {
    status,
    q: (params.get('q') || '').trim().slice(0, 200),
    country: params.get('country') || '',
    source: params.get('source') || '',
    interest: params.get('interest') || '',
  };
}
export function webinarMatches(
  signup: WebinarSignup,
  filters: WebinarFilters,
  includeStatus: boolean = true,
): boolean {
  if (
    includeStatus &&
    filters.status !== 'all' &&
    signup.status !== filters.status
  )
    return false;
  if (filters.country && (signup.country || '__missing') !== filters.country)
    return false;
  if (filters.source && (signup.utmSource || '__missing') !== filters.source)
    return false;
  if (filters.interest && !signup.programInterests.includes(filters.interest))
    return false;
  const haystack = [
    signup.firstName,
    signup.lastName,
    `${signup.firstName} ${signup.lastName}`,
    signup.email,
    signup.whatsapp,
    signup.country || '',
  ]
    .join(' ')
    .toLocaleLowerCase();
  return !filters.q || haystack.includes(filters.q.toLocaleLowerCase());
}
export function summarizeWebinar(
  rows: WebinarSignup[],
  range: ReportRange,
): WebinarSummary {
  const byStatus = WEBINAR_STATUSES.map((status) => ({
    status,
    count: rows.filter((row) => row.status === status).length,
  }));
  const counts = Object.fromEntries(
    byStatus.map((row) => [row.status, row.count]),
  );
  const attended = counts.Attended;
  const noShow = counts['No-Show'];
  const cancelled = counts.Cancelled;
  const trendCounts = new Map<string, number>();
  for (const row of rows) {
    const day = reportingDate(row.createdAt);
    trendCounts.set(day, (trendCounts.get(day) || 0) + 1);
  }
  return {
    total: rows.length,
    attended,
    noShow,
    cancelled,
    awaiting: counts.Registered,
    attendanceRate:
      attended + noShow ? (attended / (attended + noShow)) * 100 : null,
    markingCoverage:
      rows.length - cancelled
        ? ((attended + noShow) / (rows.length - cancelled)) * 100
        : null,
    byStatus,
    byCountry: rankReportValues(rows.map((row) => row.country || '__missing')),
    bySource: rankReportValues(rows.map((row) => row.utmSource || '__missing')),
    byInterest: rankReportValues(
      rows.flatMap((row) => [...new Set(row.programInterests)]),
    ),
    trend: reportDates(range).map((date) => ({
      date,
      registrations: trendCounts.get(date) || 0,
    })),
  };
}
export function webinarCsv(rows: WebinarSignup[], timezone: string): string {
  const header = [
    'Name',
    'Email',
    'WhatsApp',
    'Country',
    'Interests',
    'Status',
    'Source',
    'Campaign',
    'Source page',
    'Registered at (UTC)',
    'Reporting timezone',
    'Notes',
  ];
  return (
    '\uFEFF' +
    [
      header,
      ...rows.map((row) => [
        `${row.firstName} ${row.lastName}`.trim(),
        row.email,
        row.whatsapp,
        row.country,
        row.programInterests.join('; '),
        row.status,
        row.utmSource,
        row.utmCampaign,
        row.sourcePage,
        row.createdAt,
        timezone,
        row.notes,
      ]),
    ]
      .map((row) => row.map(csvCell).join(','))
      .join('\r\n')
  );
}

export const REPORT_TIMEZONE = 'Asia/Shanghai';
const DAY = 86_400_000;
const OFFSET = 8 * 3_600_000;
export type ReportPreset = '7d' | '30d' | '90d' | 'custom';
export interface ReportRange {
  preset: ReportPreset;
  from: string;
  to: string;
  days: number;
  start: string;
  endExclusive: string;
  previousStart: string;
  previousEndExclusive: string;
  timezone: string;
}
export class ReportInputError extends Error {}

export function reportingDate(iso: string | number | Date): string {
  return new Date(new Date(iso).getTime() + OFFSET).toISOString().slice(0, 10);
}

function dateStamp(value: string): number {
  const stamp = Date.parse(`${value}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(stamp) ||
    new Date(stamp).toISOString().slice(0, 10) !== value
  ) {
    throw new ReportInputError('Choose valid calendar dates.');
  }
  return stamp;
}

export function parseReportRange(
  params: URLSearchParams,
  now: Date = new Date(),
): ReportRange {
  const raw =
    params.get('range') ||
    (params.has('from') || params.has('start_date') ? 'custom' : '30d');
  if (!['7d', '30d', '90d', 'custom'].includes(raw))
    throw new ReportInputError('Invalid reporting period.');
  const preset = raw as ReportPreset;
  let to = reportingDate(now);
  let from = to;
  if (preset === 'custom') {
    from = params.get('from') || params.get('start_date') || '';
    to = params.get('to') || params.get('end_date') || '';
  } else {
    from = new Date(dateStamp(to) - (parseInt(preset, 10) - 1) * DAY)
      .toISOString()
      .slice(0, 10);
  }
  const fromMs = dateStamp(from);
  const toMs = dateStamp(to);
  const days = Math.round((toMs - fromMs) / DAY) + 1;
  if (days < 1 || days > 366)
    throw new ReportInputError('Choose a date range between 1 and 366 days.');
  const startMs = fromMs - OFFSET;
  return {
    preset,
    from,
    to,
    days,
    timezone: REPORT_TIMEZONE,
    start: new Date(startMs).toISOString(),
    endExclusive: new Date(toMs + DAY - OFFSET).toISOString(),
    previousStart: new Date(startMs - days * DAY).toISOString(),
    previousEndExclusive: new Date(startMs).toISOString(),
  };
}

export function reportDates(range: ReportRange): string[] {
  return Array.from({ length: range.days }, (_, i) =>
    new Date(dateStamp(range.from) + i * DAY).toISOString().slice(0, 10),
  );
}

export interface MetricComparison {
  current: number;
  previous: number;
}
export interface ReportBreakdown {
  label: string;
  count: number;
}
export interface ReportQueryResult<T> {
  data: T[] | null;
  error: { message: string } | null;
}

/** Read past PostgREST's per-response row limit; fail rather than truncate a report. */
export async function readReportRows<T>(
  page: (from: number, to: number) => PromiseLike<ReportQueryResult<T>>,
): Promise<T[]> {
  const rows: T[] = [];
  const size = 500;
  for (let from = 0; from <= 50_000; from += size) {
    const result = await page(from, from + size - 1);
    if (result.error) throw new Error(result.error.message);
    if (!result.data) throw new Error('Reporting query returned no data.');
    rows.push(...result.data);
    if (rows.length > 50_000)
      throw new ReportInputError(
        'This report is too large. Choose a shorter date range.',
      );
    if (result.data.length < size) return rows;
  }
  throw new ReportInputError(
    'This report is too large. Choose a shorter date range.',
  );
}

export function rankReportValues(values: string[]): ReportBreakdown[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function csvCell(value: unknown): string {
  let text = value == null ? '' : String(value);
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text))
    text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

import { describe, expect, it } from 'vitest';
import {
  csvCell,
  parseReportRange,
  readReportRows,
  reportDates,
  reportingDate,
} from '../admin-reporting';
import { dashboardTrend, periodComparison } from '../admin-dashboard-report';
import {
  parseWebinarFilters,
  summarizeWebinar,
  webinarCsv,
  webinarMatches,
  type WebinarSignup,
} from '../webinar-report';

const range = parseReportRange(
  new URLSearchParams('range=custom&from=2026-10-21&to=2026-10-22'),
);
const signup = (patch: Partial<WebinarSignup> = {}): WebinarSignup => ({
  id: '00000000-0000-4000-8000-000000000001',
  firstName: 'Test',
  lastName: 'Student',
  email: 'test@example.com',
  whatsapp: '+123456789',
  country: 'Nigeria',
  programInterests: ['master'],
  notes: null,
  sourcePage: '/webinar',
  utmSource: null,
  utmCampaign: null,
  status: 'Registered',
  createdAt: '2026-10-21T16:00:00Z',
  webinarKey: '2026-10-22',
  ...patch,
});

describe('report periods and complete reads', () => {
  it('uses Beijing midnight, inclusive calendar dates, and an equal prior period', () => {
    expect(range).toMatchObject({
      days: 2,
      start: '2026-10-20T16:00:00.000Z',
      endExclusive: '2026-10-22T16:00:00.000Z',
      previousStart: '2026-10-18T16:00:00.000Z',
      previousEndExclusive: '2026-10-20T16:00:00.000Z',
    });
    expect(reportDates(range)).toEqual(['2026-10-21', '2026-10-22']);
    const preset = parseReportRange(
      new URLSearchParams('range=7d'),
      new Date('2026-10-22T17:00:00Z'),
    );
    expect(preset.from).toBe('2026-10-17');
    expect(preset.to).toBe('2026-10-23');
    expect(reportingDate('2026-10-21T16:00:00Z')).toBe('2026-10-22');
  });
  it.each([
    'from=2026-02-30&to=2026-03-01',
    'from=2026-10-22&to=2026-10-21',
    'from=2025-01-01&to=2026-10-22',
    'range=custom',
    'range=forever',
  ])('rejects invalid ranges: %s', (query) => {
    expect(() => parseReportRange(new URLSearchParams(query))).toThrow();
  });
  it('reads 1,201 records across inclusive pages instead of stopping at the API row limit', async () => {
    const calls: number[][] = [];
    const all = Array.from({ length: 1201 }, (_, id) => ({ id }));
    const result = await readReportRows(async (from, to) => {
      calls.push([from, to]);
      return { data: all.slice(from, to + 1), error: null };
    });
    expect(result).toHaveLength(1201);
    expect(calls).toEqual([
      [0, 499],
      [500, 999],
      [1000, 1499],
    ]);
  });
  it('fails the whole report if any page fails and never represents errors as zero', async () => {
    await expect(
      readReportRows(async (from) =>
        from === 0
          ? { data: Array.from({ length: 500 }, (_, id) => id), error: null }
          : { data: null, error: { message: 'DB failed' } },
      ),
    ).rejects.toThrow('DB failed');
    await expect(
      readReportRows(async () => ({ data: null, error: null })),
    ).rejects.toThrow('no data');
  });
});

describe('webinar metric definitions', () => {
  it('keeps pending and cancelled registrations out of the recorded attendance denominator', () => {
    const stats = summarizeWebinar(
      [
        signup({ status: 'Attended' }),
        signup({ status: 'No-Show' }),
        signup(),
        signup({ status: 'Cancelled' }),
      ],
      range,
    );
    expect(stats).toMatchObject({
      total: 4,
      attended: 1,
      noShow: 1,
      awaiting: 1,
      cancelled: 1,
      attendanceRate: 50,
    });
    expect(stats.markingCoverage).toBeCloseTo(200 / 3);
    expect(summarizeWebinar([signup()], range).attendanceRate).toBeNull();
    expect(
      summarizeWebinar([signup({ status: 'Cancelled' })], range)
        .markingCoverage,
    ).toBeNull();
  });
  it('retains missing attribution, deduplicates interests per signup, and zero-fills Beijing days', () => {
    const stats = summarizeWebinar(
      [
        signup({
          programInterests: ['master', 'master', 'csc'],
          country: null,
        }),
      ],
      range,
    );
    expect(stats.byInterest).toEqual([
      { label: 'csc', count: 1 },
      { label: 'master', count: 1 },
    ]);
    expect(stats.byCountry).toEqual([{ label: '__missing', count: 1 }]);
    expect(stats.bySource).toEqual([{ label: '__missing', count: 1 }]);
    expect(stats.trend).toEqual([
      { date: '2026-10-21', registrations: 0 },
      { date: '2026-10-22', registrations: 1 },
    ]);
  });
  it('applies literal full-name/country search and audience filters, with a separate table status scope', () => {
    const filters = parseWebinarFilters(
      new URLSearchParams(
        'q=test%20student&country=Nigeria&interest=master&source=__missing&status=Attended',
      ),
    );
    expect(webinarMatches(signup(), filters)).toBe(false);
    expect(webinarMatches(signup(), filters, false)).toBe(true);
    expect(webinarMatches(signup({ status: 'Attended' }), filters)).toBe(true);
    expect(
      webinarMatches(signup({ status: 'Attended', country: 'China' }), filters),
    ).toBe(false);
    expect(
      webinarMatches(
        signup(),
        parseWebinarFilters(new URLSearchParams('q=NIGERIA')),
      ),
    ).toBe(true);
    expect(
      webinarMatches(
        signup(),
        parseWebinarFilters(new URLSearchParams('q=%25')),
      ),
    ).toBe(false);
    expect(() =>
      parseWebinarFilters(new URLSearchParams('status=Unknown')),
    ).toThrow();
  });
  it('filters by webinar_key including untagged legacy rows', () => {
    const tagged = parseWebinarFilters(
      new URLSearchParams('webinarKey=2026-11-03'),
    );
    const untagged = parseWebinarFilters(
      new URLSearchParams('webinarKey=__untagged'),
    );
    expect(webinarMatches(signup({ webinarKey: '2026-11-03' }), tagged)).toBe(
      true,
    );
    expect(webinarMatches(signup({ webinarKey: '2026-10-22' }), tagged)).toBe(
      false,
    );
    expect(webinarMatches(signup({ webinarKey: null }), untagged)).toBe(true);
    expect(webinarMatches(signup({ webinarKey: '2026-11-03' }), untagged)).toBe(
      false,
    );
  });
  it('exports quoted multiline CSV, UTF-8 BOM, and neutralizes spreadsheet formulas', () => {
    const csv = webinarCsv(
      [
        signup({
          firstName: '=HYPERLINK("evil")',
          notes: 'First line\nSecond, "quoted"',
        }),
      ],
      'Asia/Shanghai',
    );
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('Webinar key');
    expect(csv).toContain('2026-10-22');
    expect(csv).toContain('"\'=HYPERLINK(""evil"") Student"');
    expect(csv).toContain('"First line\nSecond, ""quoted"""');
    expect(csv).toContain('Asia/Shanghai');
    expect(csvCell('  +123')).toBe('"\'  +123"');
    expect(csvCell('@SUM(1)')).toBe('"\'@SUM(1)"');
  });
});

describe('dashboard comparisons', () => {
  it('excludes next-day boundary rows and aligns previous-period trend dates', () => {
    const rows = [
      { id: 'a', created_at: range.start },
      { id: 'b', created_at: range.previousStart },
      { id: 'c', created_at: range.endExclusive },
    ];
    expect(periodComparison(rows, range)).toEqual({ current: 1, previous: 1 });
    const trend = dashboardTrend([], rows, range);
    expect(trend).toEqual([
      {
        date: '2026-10-21',
        leads: 0,
        applications: 1,
        previousApplications: 1,
      },
      {
        date: '2026-10-22',
        leads: 0,
        applications: 0,
        previousApplications: 0,
      },
    ]);
  });
});

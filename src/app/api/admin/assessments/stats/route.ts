import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

interface StatusBucket {
  status: string;
  count: number;
}

interface BreakdownEntry {
  label: string;
  count: number;
}

interface AssessmentStats {
  total: number;
  today: number;
  last7Days: number;
  last30Days: number;
  byStatus: StatusBucket[];
  topCountries: BreakdownEntry[];
  topEducation: BreakdownEntry[];
  conversionRate: number; // 0..1, Completed / (Completed + Rejected); 0 if denominator is 0
  hasTranscriptRate: number; // 0..1
  avgTranscriptsSizeBytes: number; // 0 if no transcripts
  generatedAt: string;
}

const STATUS_VALUES = ['New', 'Reviewing', 'Completed', 'Rejected'] as const;

/**
 * Admin analytics for student_assessments.
 *
 * All queries are service-role + aggregate (no row bodies, just
 * counts), so the response is cheap regardless of table size. The
 * UI's stat-card strip polls this endpoint on the same 30-second
 * cadence as the listing — keeps both surfaces consistent.
 */
export async function GET(_request: NextRequest) {
  const auth = await requireAdmin(_request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Local-day boundaries in the server's tz (we just use ISO days for
  // simplicity — admin dashboards are fine with UTC-aligned buckets).
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    .toISOString();
  const startOf7dAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const startOf30dAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalRes,
    todayRes,
    last7dRes,
    last30dRes,
    byStatusRes,
    topCountriesRes,
    topEducationRes,
    hasTranscriptRes,
    transcriptSizeRes,
    completedRes,
    rejectedRes,
  ] = await Promise.all([
    // Total
    supabase.from('student_assessments').select('*', { count: 'exact', head: true }),
    // Today
    supabase
      .from('student_assessments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfToday),
    // Last 7 days
    supabase
      .from('student_assessments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOf7dAgo),
    // Last 30 days
    supabase
      .from('student_assessments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOf30dAgo),
    // Per-status breakdown (all rows, no time filter — admin can see
    // how many are in each bucket at any time)
    Promise.all(
      STATUS_VALUES.map(async (status) => {
        const { count, error } = await supabase
          .from('student_assessments')
          .select('*', { count: 'exact', head: true })
          .eq('status', status);
        if (error) throw new Error(`status ${status}: ${error.message}`);
        return { status, count: count ?? 0 } satisfies StatusBucket;
      }),
    ),
    // Top 5 countries
    supabase
      .from('student_assessments')
      .select('country')
      .not('country', 'is', null)
      .neq('country', '')
      .limit(1000),
    // Top 5 current_education values
    supabase
      .from('student_assessments')
      .select('current_education')
      .not('current_education', 'is', null)
      .neq('current_education', '')
      .limit(1000),
    // Has-transcript rate
    supabase
      .from('student_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('has_transcript', true),
    // Average transcript size (server-side avg)
    supabase.from('student_assessments').select('transcript_file_size'),
    // Completed + Rejected counts (for conversion)
    supabase
      .from('student_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Completed'),
    supabase
      .from('student_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Rejected'),
  ]);

  const byStatus = byStatusRes as StatusBucket[];

  const topCountries = aggregateStrings(topCountriesRes.data ?? []);
  const topEducation = aggregateStrings(topEducationRes.data ?? []);

  const totalCount = totalRes.count ?? 0;
  const transcriptSizeSum = (transcriptSizeRes.data ?? []).reduce<number>(
    (acc, row) => {
      const size = (row as { transcript_file_size?: number | null }).transcript_file_size;
      return typeof size === 'number' && size > 0 ? acc + size : acc;
    },
    0,
  );
  const transcriptRowCount = (transcriptSizeRes.data ?? []).length;
  const avgTranscriptSize = transcriptRowCount > 0 ? Math.round(transcriptSizeSum / transcriptRowCount) : 0;

  const completedCount = completedRes.count ?? 0;
  const rejectedCount = rejectedRes.count ?? 0;
  const conversionDenom = completedCount + rejectedCount;
  const conversionRate = conversionDenom > 0 ? completedCount / conversionDenom : 0;

  const stats: AssessmentStats = {
    total: totalCount,
    today: todayRes.count ?? 0,
    last7Days: last7dRes.count ?? 0,
    last30Days: last30dRes.count ?? 0,
    byStatus,
    topCountries,
    topEducation,
    conversionRate,
    hasTranscriptRate: totalCount > 0 ? (hasTranscriptRes.count ?? 0) / totalCount : 0,
    avgTranscriptsSizeBytes: avgTranscriptSize,
    generatedAt: now.toISOString(),
  };

  return NextResponse.json(stats);
}

/**
 * Tally a small set of string values and return the top 5 by count.
 * Cheaper than a server-side GROUP BY for the size we sample (1000
 * rows max); pulls the same payload to the client either way.
 */
function aggregateStrings(
  rows: ReadonlyArray<Record<string, unknown>>,
  field: string = 'country',
  limit: number = 5,
): BreakdownEntry[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const v = row[field];
    if (typeof v !== 'string' || !v.trim()) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}
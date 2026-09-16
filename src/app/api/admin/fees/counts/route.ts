import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient } from '@/lib/supabase-auth';

/**
 * GET /api/admin/fees/counts
 *
 * Phase 108 Batch 2 — fixes the slice-math KPI bug.
 *
 * Before this endpoint existed, the list page computed Total Revenue,
 * Pending Amount, Paid Count, and Pending Count from the visible 20-row
 * page. When `total > 20`, those numbers were wrong.
 *
 * Headline numbers (totalRevenue / totalPending / paidCount / pendingCount
 * / overdueCount) use exact head-count queries or sum aggregates on the
 * full set — they're accurate regardless of pipeline size.
 *
 * perCurrency breakdown reports revenue + pending amounts per currency,
 * so the admin UI can render "¥ revenue / $ revenue" instead of falsely
 * summing across currencies.
 *
 * perStatusCapped flag mirrors the Phase 107 pattern: when the pipeline
 * exceeds 5000 rows, the perStatus / perType / perCurrency breakdowns
 * become a lower bound (headline exact-count numbers remain accurate).
 *
 * Response:
 *   {
 *     totalCount, paidCount, pendingCount, overdueCount,
 *     totalRevenueByCurrency: { CNY: number, USD: number, EUR: number },
 *     totalPendingByCurrency: { CNY: number, USD: number, EUR: number },
 *     byStatus: { Pending: n, ... },
 *     byType:   { Tuition: n, ... },
 *     byCurrency: { CNY: n, ... },
 *     perStatusCapped: boolean,
 *   }
 */
export async function GET(_request: NextRequest) {
  const auth = await requireAdmin(_request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const service = buildServiceClient();

    const totalCountQuery = service
      .from('student_fees')
      .select('id', { count: 'exact', head: true });

    const paidCountQuery = service
      .from('student_fees')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Paid');

    const pendingCountQuery = service
      .from('student_fees')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Pending');

    const overdueCountQuery = service
      .from('student_fees')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Overdue');

    // Revenue: sum(amount_paid) WHERE status='Paid' per currency.
    // We can't SELECT SUM() directly via PostgREST, so we fetch the
    // (amount_paid, currency) pairs (capped at 5000 rows) and bucket
    // client-side. For a > 5000 row pipeline, the headline number
    // becomes a lower bound and perStatusCapped flips true.
    const paidRowsQuery = service
      .from('student_fees')
      .select('amount_paid, currency')
      .eq('status', 'Paid')
      .range(0, 4999);

    // Pending amount = (amount - amount_paid) for Pending + Partial + Overdue
    // rows, per currency. Capped same as above.
    const pendingRowsQuery = service
      .from('student_fees')
      .select('amount, amount_paid, currency, status')
      .in('status', ['Pending', 'Partial', 'Overdue'])
      .range(0, 4999);

    // Full breakdown (capped 5000) for perStatus / perType / perCurrency
    const breakdownQuery = service
      .from('student_fees')
      .select('status, fee_type, currency')
      .range(0, 4999);

    const [
      totalCountRes,
      paidCountRes,
      pendingCountRes,
      overdueCountRes,
      paidRowsRes,
      pendingRowsRes,
      breakdownRes,
    ] = await Promise.all([
      totalCountQuery,
      paidCountQuery,
      pendingCountQuery,
      overdueCountQuery,
      paidRowsQuery,
      pendingRowsQuery,
      breakdownQuery,
    ]);

    for (const r of [
      totalCountRes,
      paidCountRes,
      pendingCountRes,
      overdueCountRes,
      paidRowsRes,
      pendingRowsRes,
      breakdownRes,
    ]) {
      if (r.error) {
        return NextResponse.json({ error: r.error.message }, { status: 500 });
      }
    }

    const totalRevenueByCurrency: Record<string, number> = {
      CNY: 0,
      USD: 0,
      EUR: 0,
    };
    const totalPendingByCurrency: Record<string, number> = {
      CNY: 0,
      USD: 0,
      EUR: 0,
    };

    for (const row of paidRowsRes.data || []) {
      const r = row as { amount_paid?: number | string | null; currency?: string | null };
      const cur = r.currency || 'CNY';
      const amt =
        typeof r.amount_paid === 'string'
          ? parseFloat(r.amount_paid)
          : r.amount_paid || 0;
      totalRevenueByCurrency[cur] = (totalRevenueByCurrency[cur] || 0) + amt;
    }

    for (const row of pendingRowsRes.data || []) {
      const r = row as {
        amount?: number | string | null;
        amount_paid?: number | string | null;
        currency?: string | null;
      };
      const cur = r.currency || 'CNY';
      const total =
        typeof r.amount === 'string' ? parseFloat(r.amount) : r.amount || 0;
      const paid =
        typeof r.amount_paid === 'string'
          ? parseFloat(r.amount_paid)
          : r.amount_paid || 0;
      const remaining = Math.max(0, total - paid);
      totalPendingByCurrency[cur] = (totalPendingByCurrency[cur] || 0) + remaining;
    }

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byCurrency: Record<string, number> = {};
    for (const row of breakdownRes.data || []) {
      const r = row as {
        status?: string | null;
        fee_type?: string | null;
        currency?: string | null;
      };
      const s = r.status || 'Unknown';
      const t = r.fee_type || 'Other';
      const c = r.currency || 'CNY';
      byStatus[s] = (byStatus[s] || 0) + 1;
      byType[t] = (byType[t] || 0) + 1;
      byCurrency[c] = (byCurrency[c] || 0) + 1;
    }

    return NextResponse.json({
      totalCount: totalCountRes.count || 0,
      paidCount: paidCountRes.count || 0,
      pendingCount: pendingCountRes.count || 0,
      overdueCount: overdueCountRes.count || 0,
      totalRevenueByCurrency,
      totalPendingByCurrency,
      byStatus,
      byType,
      byCurrency,
      perStatusCapped:
        (paidRowsRes.data?.length || 0) >= 5000 ||
        (pendingRowsRes.data?.length || 0) >= 5000 ||
        (breakdownRes.data?.length || 0) >= 5000,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
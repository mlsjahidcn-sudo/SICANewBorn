/**
 * payment-aggregate.test.ts
 *
 * Phase 145: vitest coverage for the payment-aggregate helper. The
 * /admin/applications + /admin/students endpoints both feed raw
 * student_fees rows into this helper and trust the result. Any
 * regression in the priority order (overdue > partial > unpaid >
 * paid) or the per-currency math would silently break the badge on
 * the unified list — so we test the four priority branches + the
 * multi-currency + the 'no fee rows' edge case.
 */

import { describe, it, expect } from 'vitest';
import {
  computePaymentAggregateForApp,
  computePaymentAggregatesByAppId,
  emptyPaymentAggregate,
  type PaymentAggregateFeeRow,
} from './payment-aggregate';

function row(overrides: Partial<PaymentAggregateFeeRow>): PaymentAggregateFeeRow {
  return {
    application_id: 'app-1',
    status: 'Pending',
    amount: 100,
    amount_paid: 0,
    currency: 'CNY',
    paid_date: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('emptyPaymentAggregate', () => {
  it('returns status=none with zero counts', () => {
    const agg = emptyPaymentAggregate();
    expect(agg.status).toBe('none');
    expect(agg.feeCount).toBe(0);
    expect(agg.totalByCurrency).toEqual({});
    expect(agg.paidByCurrency).toEqual({});
    expect(agg.outstandingByCurrency).toEqual({});
    expect(agg.lastPaidAt).toBeNull();
  });
});

describe('computePaymentAggregateForApp — priority order', () => {
  it('returns "none" for an empty fee list', () => {
    const agg = computePaymentAggregateForApp([]);
    expect(agg.status).toBe('none');
    expect(agg.feeCount).toBe(0);
  });

  it('returns "paid" when every fee is Paid', () => {
    const agg = computePaymentAggregateForApp([
      row({ status: 'Paid', amount: 100, amount_paid: 100, paid_date: '2026-01-15' }),
      row({ application_id: 'app-1', status: 'Paid', amount: 50, amount_paid: 50, paid_date: '2026-02-01' }),
    ]);
    expect(agg.status).toBe('paid');
    expect(agg.feeCount).toBe(2);
    expect(agg.totalByCurrency.CNY).toBe(150);
    expect(agg.paidByCurrency.CNY).toBe(150);
    expect(agg.outstandingByCurrency.CNY).toBe(0);
    expect(agg.lastPaidAt).toBe('2026-02-01');
  });

  it('returns "unpaid" when at least one fee is Pending and no Partial', () => {
    const agg = computePaymentAggregateForApp([
      row({ status: 'Pending', amount: 100, amount_paid: 0 }),
    ]);
    expect(agg.status).toBe('unpaid');
  });

  it('returns "partial" when at least one fee is Partial', () => {
    const agg = computePaymentAggregateForApp([
      row({ status: 'Partial', amount: 100, amount_paid: 40 }),
    ]);
    expect(agg.status).toBe('partial');
  });

  it('prefers "overdue" over every other status', () => {
    const agg = computePaymentAggregateForApp([
      row({ status: 'Paid', amount: 100, amount_paid: 100, paid_date: '2026-01-15' }),
      row({ application_id: 'app-1', status: 'Overdue', amount: 200, amount_paid: 0 }),
    ]);
    expect(agg.status).toBe('overdue');
  });

  it('prefers "partial" over "unpaid" when both exist', () => {
    const agg = computePaymentAggregateForApp([
      row({ status: 'Pending', amount: 100, amount_paid: 0 }),
      row({ application_id: 'app-1', status: 'Partial', amount: 50, amount_paid: 25 }),
    ]);
    expect(agg.status).toBe('partial');
  });

  it('ignores Cancelled rows in totals + status', () => {
    const agg = computePaymentAggregateForApp([
      row({ status: 'Cancelled', amount: 100, amount_paid: 100 }),
    ]);
    // Defensive: every row was Cancelled, so the aggregate lands
    // on 'none' (no contributing rows). Tests that the
    // Cancelled branch doesn't count toward "paid" — a cancelled
    // fee that was previously marked Paid should not silently
    // resurrect the badge.
    expect(agg.status).toBe('none');
    expect(agg.totalByCurrency.CNY).toBeUndefined();
  });
});

describe('computePaymentAggregateForApp — per-currency math', () => {
  it('keeps CNY and USD totals separate (never sums across currencies)', () => {
    const agg = computePaymentAggregateForApp([
      row({ status: 'Paid', amount: 1000, amount_paid: 1000, currency: 'CNY', paid_date: '2026-01-10' }),
      row({ application_id: 'app-1', status: 'Partial', amount: 500, amount_paid: 250, currency: 'USD' }),
    ]);
    expect(agg.totalByCurrency.CNY).toBe(1000);
    expect(agg.paidByCurrency.CNY).toBe(1000);
    expect(agg.totalByCurrency.USD).toBe(500);
    expect(agg.paidByCurrency.USD).toBe(250);
    expect(agg.outstandingByCurrency.USD).toBe(250);
  });

  it('clamps outstanding at 0 when amount_paid exceeds amount (data entry sloppy)', () => {
    const agg = computePaymentAggregateForApp([
      row({ status: 'Paid', amount: 100, amount_paid: 150 }),
    ]);
    expect(agg.outstandingByCurrency.CNY).toBe(0);
  });

  it('rounds to 2 decimal places (no floating point noise)', () => {
    const agg = computePaymentAggregateForApp([
      row({ status: 'Paid', amount: 33.33, amount_paid: 33.33 }),
      row({ application_id: 'app-1', status: 'Paid', amount: 33.33, amount_paid: 33.33 }),
    ]);
    // 33.33 + 33.33 = 66.66 exactly; we test that round2 doesn't
    // produce 66.66000000000001.
    expect(agg.totalByCurrency.CNY).toBe(66.66);
  });

  it('tracks the most recent paid_date across all Paid rows', () => {
    const agg = computePaymentAggregateForApp([
      row({ status: 'Paid', amount: 100, amount_paid: 100, paid_date: '2026-01-10' }),
      row({ application_id: 'app-1', status: 'Paid', amount: 50, amount_paid: 50, paid_date: '2026-03-15' }),
      row({ application_id: 'app-1', status: 'Paid', amount: 25, amount_paid: 25, paid_date: '2026-02-20' }),
    ]);
    expect(agg.lastPaidAt).toBe('2026-03-15');
  });
});

describe('computePaymentAggregatesByAppId', () => {
  it('groups by application_id and skips rows with null application_id', () => {
    const fees: PaymentAggregateFeeRow[] = [
      row({ application_id: 'app-A', status: 'Paid', amount: 100, amount_paid: 100 }),
      row({ application_id: null, status: 'Paid', amount: 999, amount_paid: 999 }), // free-standing, skip
      row({ application_id: 'app-B', status: 'Pending', amount: 50, amount_paid: 0 }),
    ];
    const map = computePaymentAggregatesByAppId(fees);
    expect(map.size).toBe(2);
    expect(map.get('app-A')?.status).toBe('paid');
    expect(map.get('app-B')?.status).toBe('unpaid');
    expect(map.get(null as unknown as string)).toBeUndefined();
  });

  it('returns an empty map for an empty fee list', () => {
    const map = computePaymentAggregatesByAppId([]);
    expect(map.size).toBe(0);
  });
});

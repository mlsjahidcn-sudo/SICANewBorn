/**
 * payment-aggregate.ts
 *
 * Phase 145 — derive a single payment status from one or more
 * student_fees rows. The /admin/applications list + detail + the
 * /admin/students aggregate all use the same derivation logic, so
 * it lives here once.
 *
 *   'paid'    — at least one fee row exists AND every fee is Paid
 *                (no Pending/Partial/Overdue/Cancelled).
 *   'partial' — at least one fee is Partial, OR at least one fee is
 *                Paid AND at least one other fee exists in any state.
 *                (mixed bag where some money landed but not all).
 *   'unpaid'  — at least one fee exists AND at least one of them is
 *                Pending / Partial / Overdue (the application has fee
 *                rows attached but nothing is fully settled).
 *   'overdue' — at least one fee is Overdue (overrides 'unpaid' —
 *                overdue is the louder signal).
 *   'none'    — zero student_fees rows for this application_id.
 *                Admin hasn't set up billing yet. Rendered as "—" / grey
 *                on the list (excluded from Paid/Unpaid/Partial filters
 *                so it doesn't pollute the cohort counts).
 *
 * Derivation rules in priority order:
 *   1. If any fee is Overdue → 'overdue'.
 *   2. Else if any fee is Pending/Partial/Overdue → 'unpaid' (or 'partial'
 *      if any Partial exists with no Pending).
 *   3. Else if any fee exists → 'paid'.
 *   4. Else → 'none'.
 *
 * Notes:
 *   - 'Paid' is the ONLY terminal-good state. 'Cancelled' counts as
 *     unpaid because the fee still needs attention (re-issued or removed
 *     by admin).
 *   - Amount math: outstanding = sum(amount) - sum(amount_paid) where
 *     the row isn't Cancelled (cancelled rows don't count toward debt).
 *   - Multiple currencies are kept separate; the API surfaces them as a
 *     map so the UI can render per-currency totals.
 */

export const APPLICATION_PAYMENT_STATUSES = [
  'paid',
  'partial',
  'unpaid',
  'overdue',
  'none',
] as const;

export type ApplicationPaymentStatus = (typeof APPLICATION_PAYMENT_STATUSES)[number];

/**
 * Single source of truth for the visible status colors + labels. The UI
 * imports this so the badge, the filter chip, and the sidebar section
 * stay in sync if a status is ever renamed.
 */
export const APPLICATION_PAYMENT_STATUS_DISPLAY: Record<
  ApplicationPaymentStatus,
  { label: string; color: string; chipColor: string; sortOrder: number }
> = {
  paid:    { label: 'Paid',         color: 'bg-green-100 text-green-800',   chipColor: 'bg-green-50 text-green-700 border-green-200', sortOrder: 0 },
  partial: { label: 'Partial',      color: 'bg-amber-100 text-amber-800',   chipColor: 'bg-amber-50 text-amber-700 border-amber-200', sortOrder: 1 },
  unpaid:  { label: 'Unpaid',       color: 'bg-red-100 text-red-800',       chipColor: 'bg-red-50 text-red-700 border-red-200',       sortOrder: 2 },
  overdue: { label: 'Overdue',      color: 'bg-red-200 text-red-900',       chipColor: 'bg-red-100 text-red-800 border-red-300',     sortOrder: 3 },
  none:    { label: 'No fee set',   color: 'bg-gray-100 text-gray-600',     chipColor: 'bg-gray-50 text-gray-500 border-gray-200',   sortOrder: 4 },
};

/**
 * One row's worth of payment math. All amounts are by currency (we
 * never sum CNY + USD). `total` is the sum of fee amounts; `paid` is
 * the sum of amount_paid; `outstanding` is the difference (capped at 0
 * per row to avoid negative surprises if data entry got sloppy).
 */
export interface PaymentAggregate {
  status: ApplicationPaymentStatus;
  // Map<currency, totalAmount>. Empty when no fees exist.
  totalByCurrency: Record<string, number>;
  // Map<currency, paidAmount>. Same shape as totalByCurrency.
  paidByCurrency: Record<string, number>;
  // Map<currency, outstandingAmount> = total - paid, clamped >= 0.
  outstandingByCurrency: Record<string, number>;
  feeCount: number;
  // The most recent paid_date across all Paid rows, ISO string or null.
  lastPaidAt: string | null;
  // Phase 182 — true when any non-Cancelled fee has payment_channel='offline'.
  hasOfflinePayment: boolean;
}

/**
 * DB-shaped fee row. We type only the fields we read so the helper is
 * resilient to schema additions.
 */
export interface PaymentAggregateFeeRow {
  application_id: string | null;
  status: string | null;
  amount: number | string | null;
  amount_paid: number | string | null;
  currency: string | null;
  paid_date: string | null;
  created_at: string | null;
  payment_channel?: string | null;
}

/**
 * Compute the payment aggregate for one application from its fee rows.
 * Pure function — no DB, no IO. Easy to unit test.
 */
export function computePaymentAggregateForApp(
  fees: PaymentAggregateFeeRow[],
): PaymentAggregate {
  const totalByCurrency: Record<string, number> = {};
  const paidByCurrency: Record<string, number> = {};
  const outstandingByCurrency: Record<string, number> = {};
  let hasOverdue = false;
  let hasPendingOrPartial = false;
  let hasPartial = false;
  let hasPaidRow = false;
  let lastPaidAt: string | null = null;
  let hasOfflinePayment = false;

  for (const fee of fees) {
    // Cancelled rows don't contribute to totals or status. The fee has
    // been removed from the books.
    if (fee.status === 'Cancelled') continue;

    const currency = (fee.currency || 'CNY').toUpperCase();
    const amount = toNumber(fee.amount);
    const amountPaid = toNumber(fee.amount_paid);

    totalByCurrency[currency] = round2((totalByCurrency[currency] || 0) + amount);
    paidByCurrency[currency] = round2((paidByCurrency[currency] || 0) + amountPaid);
    outstandingByCurrency[currency] = round2(
      Math.max(0, amount - amountPaid),
    );

    if (fee.payment_channel === 'offline') hasOfflinePayment = true;

    if (fee.status === 'Overdue') hasOverdue = true;
    if (fee.status === 'Pending' || fee.status === 'Partial') {
      hasPendingOrPartial = true;
    }
    if (fee.status === 'Partial') hasPartial = true;
    if (fee.status === 'Paid') {
      hasPaidRow = true;
      if (fee.paid_date) {
        if (!lastPaidAt || fee.paid_date > lastPaidAt) {
          lastPaidAt = fee.paid_date;
        }
      }
    }
  }

  let status: ApplicationPaymentStatus;
  if (fees.length === 0) {
    status = 'none';
  } else if (hasOverdue) {
    status = 'overdue';
  } else if (hasPartial) {
    status = 'partial';
  } else if (hasPendingOrPartial) {
    status = 'unpaid';
  } else if (hasPaidRow) {
    status = 'paid';
  } else {
    // Defensive fallback — every row was Cancelled (skipped above). The
    // caller passed a non-empty array but nothing counted. Treat as 'none'
    // so the UI doesn't show a misleading badge.
    status = 'none';
  }

  return {
    status,
    totalByCurrency,
    paidByCurrency,
    outstandingByCurrency,
    feeCount: fees.length,
    lastPaidAt,
    hasOfflinePayment,
  };
}

/**
 * Compute aggregates for many applications in one pass. Caller passes the
 * full slice of fees (typically from a single `student_fees` query scoped
 * to the visible application ids). Returns a Map<application_id,
 * PaymentAggregate> — caller merges into the row payload.
 */
export function computePaymentAggregatesByAppId(
  fees: PaymentAggregateFeeRow[],
): Map<string, PaymentAggregate> {
  // Group by application_id first, then reduce. Skip rows with null
  // application_id (free-standing fees that aren't tied to an
  // application — they belong to /admin/fees, not the applications list).
  const grouped = new Map<string, PaymentAggregateFeeRow[]>();
  for (const fee of fees) {
    if (!fee.application_id) continue;
    const list = grouped.get(fee.application_id) || [];
    list.push(fee);
    grouped.set(fee.application_id, list);
  }
  const out = new Map<string, PaymentAggregate>();
  for (const [appId, appFees] of grouped) {
    out.set(appId, computePaymentAggregateForApp(appFees));
  }
  return out;
}

/**
 * For an application with NO matching fee rows, return a 'none'
 * aggregate. Keeps the caller's row-building code uniform (every row
 * gets a PaymentAggregate regardless of whether fees exist).
 */
export function emptyPaymentAggregate(): PaymentAggregate {
  return {
    status: 'none',
    totalByCurrency: {},
    paidByCurrency: {},
    outstandingByCurrency: {},
    feeCount: 0,
    lastPaidAt: null,
    hasOfflinePayment: false,
  };
}

function toNumber(v: number | string | null): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function round2(n: number): number {
  // Two-decimal rounding (CNY/USD cents). Math.round * 100 / 100
  // avoids the floating-point surprises of toFixed.
  return Math.round(n * 100) / 100;
}

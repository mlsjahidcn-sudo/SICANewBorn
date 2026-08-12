/**
 * partner-fee-mapper.ts
 *
 * Maps between camelCase UI shape and snake_case `partner_fees` DB row.
 *
 *   UI (camelCase)                    DB (snake_case)
 *   ────────────────────              ──────────────────
 *   id                  ↔             id
 *   partnerId           ↔             partner_id
 *   studentName         ↔             student_name
 *   amount              ↔             amount     (NUMERIC → number)
 *   currency            ↔             currency
 *   status              ↔             status
 *   description         ↔             description
 *   dueDate             ↔             due_date   (DATE → ISO date string)
 *   paidAt              ↔             paid_at    (TIMESTAMP → ISO string)
 *   paymentProofUrl     ↔             payment_proof_url
 *   paymentNotes        ↔             payment_notes
 *   verifiedAt          ↔             verified_at
 *   verifiedBy          ↔             verified_by
 *   createdAt           ↔             created_at
 *   updatedAt           ↔             updated_at
 *
 * Status: Pending | PendingVerification | Paid | Rejected | Refunded
 */

export const PARTNER_FEE_STATUSES = [
  'Pending',
  'PendingVerification',
  'Paid',
  'Rejected',
  'Refunded',
] as const;
export type PartnerFeeStatus = (typeof PARTNER_FEE_STATUSES)[number];

export interface PartnerFee {
  id: string;
  partnerId: string;
  studentName: string;
  amount: number;
  currency: string;
  status: PartnerFeeStatus;
  description?: string | null;
  dueDate?: string | null;
  paidAt?: string | null;
  paymentProofUrl?: string | null;
  paymentNotes?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function parsePartnerFeeStatus(input: unknown): PartnerFeeStatus | null {
  if (typeof input !== 'string') return null;
  if ((PARTNER_FEE_STATUSES as readonly string[]).includes(input)) {
    return input as PartnerFeeStatus;
  }
  return null;
}

interface RawPartnerFee {
  id: string;
  partner_id: string;
  student_name: string;
  amount?: number | string | null;
  currency?: string | null;
  status?: string | null;
  description?: string | null;
  due_date?: string | null;
  paid_at?: string | null;
  payment_proof_url?: string | null;
  payment_notes?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export function mapPartnerFeeFromDb(row: RawPartnerFee): PartnerFee {
  // Supabase returns NUMERIC as a string sometimes (depending on
  // client). Coerce safely.
  const amount = typeof row.amount === 'string' ? parseFloat(row.amount) : row.amount ?? 0;
  return {
    id: row.id,
    partnerId: row.partner_id,
    studentName: row.student_name,
    amount: amount,
    currency: row.currency ?? 'CNY',
    status: parsePartnerFeeStatus(row.status) ?? 'Pending',
    description: row.description ?? null,
    dueDate: row.due_date ?? null,
    paidAt: row.paid_at ?? null,
    paymentProofUrl: row.payment_proof_url ?? null,
    paymentNotes: row.payment_notes ?? null,
    verifiedAt: row.verified_at ?? null,
    verifiedBy: row.verified_by ?? null,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function mapPartnerFeeToDb(payload: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (payload.studentName !== undefined) row.student_name = String(payload.studentName).trim();
  if (payload.amount !== undefined) {
    const n = typeof payload.amount === 'string' ? parseFloat(payload.amount) : payload.amount;
    row.amount = n;
  }
  if (payload.currency !== undefined) row.currency = String(payload.currency).trim();
  if (payload.status !== undefined) row.status = payload.status;
  if (payload.description !== undefined) row.description = payload.description || null;
  if (payload.dueDate !== undefined) row.due_date = payload.dueDate || null;
  if (payload.paidAt !== undefined) row.paid_at = payload.paidAt || null;
  if (payload.paymentProofUrl !== undefined) row.payment_proof_url = payload.paymentProofUrl || null;
  if (payload.paymentNotes !== undefined) row.payment_notes = payload.paymentNotes || null;
  if (payload.verifiedAt !== undefined) row.verified_at = payload.verifiedAt || null;
  if (payload.verifiedBy !== undefined) row.verified_by = payload.verifiedBy || null;
  return row;
}

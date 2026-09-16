/**
 * student-fee-mapper.ts
 *
 * Maps between camelCase UI shape and snake_case `student_fees` DB row.
 *
 *   UI (camelCase)                    DB (snake_case)
 *   ────────────────────              ──────────────────
 *   id                  ↔             id
 *   studentId           ↔             student_id
 *   applicationId       ↔             application_id
 *   feeType             ↔             fee_type
 *   description         ↔             description
 *   amount              ↔             amount     (NUMERIC → number)
 *   currency            ↔             currency
 *   amountPaid          ↔             amount_paid
 *   dueDate             ↔             due_date   (DATE → ISO date string)
 *   paidDate            ↔             paid_date  (DATE → ISO date string)
 *   status              ↔             status
 *   paymentMethod       ↔             payment_method
 *   notes               ↔             notes
 *   createdAt           ↔             created_at
 *   updatedAt           ↔             updated_at
 *
 * Status: Pending | Partial | Paid | Overdue | Cancelled
 *   (DB CHECK rejects 'Refunded' — deliberately omitted from the type to
 *    prevent UI/API drift.)
 * Type:   Application | Tuition | Service | Visa | Other
 * Currency: CNY | USD | EUR (closed set)
 */

export const STUDENT_FEE_STATUSES = [
  'Pending',
  'Partial',
  'Paid',
  'Overdue',
  'Cancelled',
] as const;
export type StudentFeeStatus = (typeof STUDENT_FEE_STATUSES)[number];

export const STUDENT_FEE_TYPES = [
  'Application',
  'Tuition',
  'Service',
  'Visa',
  'Other',
] as const;
export type StudentFeeType = (typeof STUDENT_FEE_TYPES)[number];

export const STUDENT_FEE_CURRENCIES = ['CNY', 'USD', 'EUR'] as const;
export type StudentFeeCurrency = (typeof STUDENT_FEE_CURRENCIES)[number];

export interface StudentFee {
  id: string;
  studentId: string;
  applicationId?: string | null;
  feeType: StudentFeeType;
  description?: string | null;
  amount: number;
  currency: StudentFeeCurrency;
  amountPaid: number;
  dueDate?: string | null;
  paidDate?: string | null;
  status: StudentFeeStatus;
  paymentMethod?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function parseStudentFeeStatus(input: unknown): StudentFeeStatus | null {
  if (typeof input !== 'string') return null;
  if ((STUDENT_FEE_STATUSES as readonly string[]).includes(input)) {
    return input as StudentFeeStatus;
  }
  return null;
}

export function parseStudentFeeType(input: unknown): StudentFeeType | null {
  if (typeof input !== 'string') return null;
  if ((STUDENT_FEE_TYPES as readonly string[]).includes(input)) {
    return input as StudentFeeType;
  }
  return null;
}

export function parseStudentFeeCurrency(
  input: unknown,
): StudentFeeCurrency | null {
  if (typeof input !== 'string') return null;
  if ((STUDENT_FEE_CURRENCIES as readonly string[]).includes(input)) {
    return input as StudentFeeCurrency;
  }
  return null;
}

export interface RawStudentFee {
  id: string;
  student_id: string;
  application_id?: string | null;
  fee_type?: string | null;
  description?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  amount_paid?: number | string | null;
  due_date?: string | null;
  paid_date?: string | null;
  status?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export function mapStudentFeeFromDb(row: RawStudentFee): StudentFee {
  // Supabase may return NUMERIC as a string depending on client config —
  // coerce safely.
  const amount =
    typeof row.amount === 'string'
      ? parseFloat(row.amount)
      : row.amount ?? 0;
  const amountPaid =
    typeof row.amount_paid === 'string'
      ? parseFloat(row.amount_paid)
      : row.amount_paid ?? 0;
  return {
    id: row.id,
    studentId: row.student_id,
    applicationId: row.application_id ?? null,
    feeType: parseStudentFeeType(row.fee_type) ?? 'Other',
    description: row.description ?? null,
    amount,
    currency: parseStudentFeeCurrency(row.currency) ?? 'CNY',
    amountPaid,
    dueDate: row.due_date ?? null,
    paidDate: row.paid_date ?? null,
    status: parseStudentFeeStatus(row.status) ?? 'Pending',
    paymentMethod: row.payment_method ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export interface StudentFeeWritePayload {
  studentId?: string;
  applicationId?: string | null;
  feeType?: StudentFeeType;
  description?: string | null;
  amount?: number | string;
  currency?: StudentFeeCurrency;
  amountPaid?: number | string;
  dueDate?: string | null;
  paidDate?: string | null;
  status?: StudentFeeStatus;
  paymentMethod?: string | null;
  notes?: string | null;
}

export function mapStudentFeeToDb(
  payload: StudentFeeWritePayload,
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (payload.studentId !== undefined) row.student_id = String(payload.studentId);
  if (payload.applicationId !== undefined) {
    row.application_id = payload.applicationId || null;
  }
  if (payload.feeType !== undefined) row.fee_type = payload.feeType;
  if (payload.description !== undefined) {
    row.description = payload.description || null;
  }
  if (payload.amount !== undefined) {
    const n =
      typeof payload.amount === 'string'
        ? parseFloat(payload.amount)
        : payload.amount;
    row.amount = n;
  }
  if (payload.currency !== undefined) row.currency = payload.currency;
  if (payload.amountPaid !== undefined) {
    const n =
      typeof payload.amountPaid === 'string'
        ? parseFloat(payload.amountPaid)
        : payload.amountPaid;
    row.amount_paid = n;
  }
  if (payload.dueDate !== undefined) row.due_date = payload.dueDate || null;
  if (payload.paidDate !== undefined) row.paid_date = payload.paidDate || null;
  if (payload.status !== undefined) row.status = payload.status;
  if (payload.paymentMethod !== undefined) {
    row.payment_method = payload.paymentMethod || null;
  }
  if (payload.notes !== undefined) row.notes = payload.notes || null;
  return row;
}
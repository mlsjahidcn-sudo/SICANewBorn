import type { SupabaseClient } from '@supabase/supabase-js';
import { mapApplicationFromDb, type AdminApplication, type RawApp } from '@/lib/application-mapper';
import { normalizeIntake, parseIntakeFilter } from '@/lib/intake-normalize';
import { computePaymentAggregatesByAppId, emptyPaymentAggregate, APPLICATION_PAYMENT_STATUSES, type PaymentAggregate, type PaymentAggregateFeeRow } from '@/lib/payment-aggregate';
import { parseIntParam } from '@/lib/postgrest';
import { groupKeyFor } from '@/lib/application-grouping';

/** Read every page, including when the Data API enforces a smaller page cap.
 * The offset advances by the number actually returned; a short page isn't EOF. */
export async function collectRows<T>(read: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
  const rows: T[] = [];
  for (;;) {
    const { data, error } = await read(rows.length, rows.length + 499);
    if (error) throw new Error(error.message);
    if (!data?.length) return rows;
    rows.push(...data);
  }
}

export interface AdminApplicationRow extends AdminApplication {
  archivedAt: string | null;
  payment: PaymentAggregate;
  studentPhone: string;
  nationality: string;
  dateOfBirth: string;
  partnerPriority?: string | null;
  partnerDecision?: string | null;
  partnerOrgId?: string | null;
  partnerOrgName?: string | null;
}
interface StudentRow extends RawApp {
  archived_at?: string | null;
  student?: RawApp['student'] & { phone?: string; nationality?: string; date_of_birth?: string };
}
interface PartnerRow {
  id: string; linked_student_profile_id: string | null; partner_id: string;
  student_name: string; student_email: string; student_phone: string;
  nationality: string; date_of_birth: string; passport_number: string;
  university: string; program: string; degree: string; intake: string;
  status: string; decision: string | null; priority: string | null;
  application_number: string | null; created_at: string; updated_at: string;
  submitted_at: string | null; archived_at: string | null;
  partner: { company_name: string } | null;
}
export class ApplicationQueryError extends Error { readonly status = 400; }

export async function loadAdminApplications(service: SupabaseClient): Promise<AdminApplicationRow[]> {
  const [students, partners, fees] = await Promise.all([
    collectRows<StudentRow>((from, to) => service.from('student_applications')
      .select('*, student:student_profiles!student_id(id, first_name, last_name, email, source, status, passport_number, phone, nationality, date_of_birth)')
      .order('id').range(from, to)),
    collectRows<PartnerRow>((from, to) => service.from('partner_applications')
      .select('*, partner:partners!partner_id(company_name)').order('id').range(from, to)),
    collectRows<PaymentAggregateFeeRow>((from, to) => service.from('student_fees')
      .select('id, application_id, status, amount, amount_paid, currency, paid_date, created_at, payment_channel').order('id').range(from, to)),
  ]);
  const payments = computePaymentAggregatesByAppId(fees);
  return [
    ...students.map((row): AdminApplicationRow => ({
      ...mapApplicationFromDb(row), archivedAt: row.archived_at ?? null,
      payment: payments.get(row.id) ?? emptyPaymentAggregate(),
      studentPhone: row.student?.phone || row.applicant_phone || '',
      nationality: row.student?.nationality || row.applicant_nationality || '',
      dateOfBirth: row.student?.date_of_birth || '',
    })),
    ...partners.map((row): AdminApplicationRow => ({
      id: row.id, surface: 'partner', studentId: row.linked_student_profile_id ?? null,
      studentName: row.student_name || '—', studentEmail: row.student_email || '',
      studentPassportNumber: row.passport_number || '', studentPhone: row.student_phone || '',
      nationality: row.nationality || '', dateOfBirth: row.date_of_birth || '',
      isLinked: Boolean(row.linked_student_profile_id), university: row.university || '', universityNameCn: null,
      program: row.program || '', programNameCn: null, degree: row.degree || '', intake: row.intake || '',
      status: row.status, source: 'Partner CRM', applicationNumber: row.application_number,
      createdAt: row.created_at, updatedAt: row.updated_at, submittedAt: row.submitted_at,
      reviewedAt: null, personalStatement: null, additionalNotes: null, adminNotes: null,
      leadId: null, leadType: null, enrolledAt: null, decision: row.decision, decisionDate: null,
      priority: row.priority, campaignId: null, campaignRole: null, timelineVisibleToStudent: false,
      partnerPriority: row.priority, partnerDecision: row.decision,
      partnerOrgId: row.partner_id, partnerOrgName: row.partner?.company_name || null,
      archivedAt: row.archived_at, payment: emptyPaymentAggregate(),
    })),
  ];
}

const canonicalStatus = (value: string): string => value === 'In Review' ? 'Under Review' : value;
const priorityRank: Record<string, number> = { Low: 0, Normal: 1, Medium: 1, High: 2, Urgent: 3 };
export function filterAdminApplications(rows: AdminApplicationRow[], params: URLSearchParams): AdminApplicationRow[] {
  const surface = params.get('surface');
  if (surface && !['student', 'partner'].includes(surface)) throw new ApplicationQueryError('Invalid application surface');
  const payment = params.get('paymentStatus');
  if (payment && !(APPLICATION_PAYMENT_STATUSES as readonly string[]).includes(payment)) throw new ApplicationQueryError('Invalid payment status');
  const channel = params.get('paymentChannel');
  if (channel && channel !== 'offline') throw new ApplicationQueryError('Invalid payment channel');
  const archive = params.get('archive') || (params.get('archived') === 'true' ? 'all' : 'active');
  if (!['active', 'archived', 'all'].includes(archive)) throw new ApplicationQueryError('Invalid archive filter');
  const keys = new Set((params.get('keys') || '').split(',').filter(Boolean));
  const ids = new Set((params.get('ids') || '').split(',').filter(Boolean));
  const selection = keys.size > 0 || ids.size > 0;
  const source = params.get('source');
  const status = params.get('status');
  const student = params.get('student');
  const campaign = params.get('campaign');
  const intake = parseIntakeFilter(params.get('intake'));
  const needle = (params.get('search') || '').trim().toLowerCase();
  const decision = params.get('hasDecision');
  const enrolled = params.get('enrolled');
  const result = rows.filter((row) => {
    // Explicit selection is authoritative; preserve selected archived records too.
    if (selection) return keys.size ? keys.has(`${row.surface}:${row.id}`) : ids.has(row.id);
    if (surface && row.surface !== surface) return false;
    if (archive === 'active' && row.archivedAt) return false;
    if (archive === 'archived' && !row.archivedAt) return false;
    if (source && source !== 'all' && !(source === 'Partner' ? ['Partner', 'Partner CRM'].includes(row.source) : row.source === source)) return false;
    if (status && status !== 'all' && canonicalStatus(row.status) !== canonicalStatus(status)) return false;
    if (student && row.studentId !== student) return false;
    if (campaign && row.campaignId !== campaign) return false;
    if (intake) {
      const normalized = normalizeIntake(row.intake);
      if (intake.kind === 'none' ? normalized !== null : normalized?.cohort !== intake.cohort) return false;
    }
    if (needle && ![row.studentName, row.studentEmail, row.studentPhone, row.program, row.university, row.applicationNumber, row.studentPassportNumber].some(v => v?.toLowerCase().includes(needle))) return false;
    if (decision === 'true' && !row.decision) return false;
    if (decision === 'false' && row.decision) return false;
    // Enrollment and fee linkage are student-only capabilities.
    if ((enrolled || payment || channel) && row.surface !== 'student') return false;
    if (enrolled === 'true' && !row.enrolledAt) return false;
    if (enrolled === 'false' && row.enrolledAt) return false;
    if (payment && row.payment.status !== payment) return false;
    if (channel && !row.payment.hasOfflinePayment) return false;
    return true;
  });
  const field = params.get('sort') || 'createdAt';
  const direction = params.get('order') === 'asc' ? 1 : -1;
  return result.sort((a, b) => {
    let compared = 0;
    if (field === 'priority') compared = (priorityRank[a.priority || 'Normal'] ?? 1) - (priorityRank[b.priority || 'Normal'] ?? 1);
    else {
      const value = (r: AdminApplicationRow): string => {
        switch (field) {
          case 'updatedAt': return r.updatedAt || '';
          case 'studentName': return r.studentName;
          case 'status': return canonicalStatus(r.status);
          case 'university': return r.university;
          default: return r.createdAt || '';
        }
      };
      const av = value(a); const bv = value(b);
      if (!av && bv) return 1;
      if (av && !bv) return -1;
      compared = av.toLowerCase().localeCompare(bv.toLowerCase());
    }
    return compared * direction || (b.createdAt || '').localeCompare(a.createdAt || '') || `${a.surface}:${a.id}`.localeCompare(`${b.surface}:${b.id}`);
  });
}
export function paginateAdminApplications(rows: AdminApplicationRow[], params: URLSearchParams): { applications: AdminApplicationRow[]; total: number; page: number; limit: number; totalPages: number; applicationTotal: number } {
  const page = parseIntParam(params.get('page'), 1);
  const limit = parseIntParam(params.get('limit'), 20, { max: 100 });
  if (params.get('grouped') === 'true') {
    const keys = [...new Set(rows.map(groupKeyFor))];
    const selected = new Set(keys.slice((page - 1) * limit, page * limit));
    return { applications: rows.filter(row => selected.has(groupKeyFor(row))), total: keys.length, page, limit, totalPages: Math.max(1, Math.ceil(keys.length / limit)), applicationTotal: rows.length };
  }
  return { applications: rows.slice((page - 1) * limit, page * limit), total: rows.length, page, limit, totalPages: Math.max(1, Math.ceil(rows.length / limit)), applicationTotal: rows.length };
}

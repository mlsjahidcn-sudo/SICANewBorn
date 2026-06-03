/**
 * partner-lead-mapper.ts
 *
 * Maps between camelCase UI shape and snake_case `partner_leads` DB row.
 * The `partner_leads` table is the partner's own CRM lead list — they
 * use it to track incoming inquiries before they become students or
 * applications. (The "lead-sharing" page in the partner portal is
 * really just CRUD on this table.)
 *
 *   UI (camelCase)                    DB (snake_case)
 *   ────────────────────              ──────────────────
 *   id                  ↔             id
 *   partnerId           ↔             partner_id
 *   leadName            ↔             lead_name
 *   leadEmail           ↔             lead_email
 *   leadPhone           ↔             lead_phone
 *   interestedProgram   ↔             interested_program
 *   status              ↔             status
 *   notes               ↔             notes
 *   createdAt           ↔             created_at
 *   updatedAt           ↔             updated_at
 *
 * Status: New | Contacted | Qualified | Converted | Lost
 */

export const PARTNER_LEAD_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Converted',
  'Lost',
] as const;
export type PartnerLeadStatus = (typeof PARTNER_LEAD_STATUSES)[number];

export interface PartnerLead {
  id: string;
  partnerId: string;
  leadName: string;
  leadEmail?: string | null;
  leadPhone?: string | null;
  interestedProgram?: string | null;
  status: PartnerLeadStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function parsePartnerLeadStatus(input: unknown): PartnerLeadStatus | null {
  if (typeof input !== 'string') return null;
  if ((PARTNER_LEAD_STATUSES as readonly string[]).includes(input)) {
    return input as PartnerLeadStatus;
  }
  return null;
}

interface RawPartnerLead {
  id: string;
  partner_id: string;
  lead_name: string;
  lead_email?: string | null;
  lead_phone?: string | null;
  interested_program?: string | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export function mapPartnerLeadFromDb(row: RawPartnerLead): PartnerLead {
  return {
    id: row.id,
    partnerId: row.partner_id,
    leadName: row.lead_name,
    leadEmail: row.lead_email ?? null,
    leadPhone: row.lead_phone ?? null,
    interestedProgram: row.interested_program ?? null,
    status: parsePartnerLeadStatus(row.status) ?? 'New',
    notes: row.notes ?? null,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function mapPartnerLeadToDb(payload: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (payload.leadName !== undefined) row.lead_name = String(payload.leadName).trim();
  if (payload.leadEmail !== undefined) row.lead_email = payload.leadEmail || null;
  if (payload.leadPhone !== undefined) row.lead_phone = payload.leadPhone || null;
  if (payload.interestedProgram !== undefined)
    row.interested_program = payload.interestedProgram || null;
  if (payload.status !== undefined) row.status = payload.status;
  if (payload.notes !== undefined) row.notes = payload.notes || null;
  return row;
}

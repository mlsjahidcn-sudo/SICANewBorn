/**
 * partner-promotion-mapper.ts
 *
 * Maps between camelCase UI shape and snake_case `partner_promotions` DB row.
 *
 *   UI (camelCase)                    DB (snake_case)
 *   ────────────────────              ──────────────────
 *   id                                id
 *   universityId                      university_id
 *   programId                         program_id
 *   serviceFeeAmount                  service_fee_amount
 *   serviceFeeCurrency                service_fee_currency
 *   visibility                        visibility
 *   targetCountries                   target_countries
 *   restrictedCountries               restricted_countries
 *   status                            status
 *   priority                          priority
 *   internalNotes                     internal_notes
 *   partnerNotes                      partner_notes
 *   createdBy                         created_by
 *   createdAt                         created_at
 *   updatedAt                         updated_at
 *
 * Status:  active | paused | archived
 * Visibility: partner_only | public_and_partner
 */

export const PARTNER_PROMOTION_STATUSES = ['active', 'paused', 'archived'] as const;
export type PartnerPromotionStatus = (typeof PARTNER_PROMOTION_STATUSES)[number];

export const PARTNER_PROMOTION_VISIBILITIES = ['partner_only', 'public_and_partner'] as const;
export type PartnerPromotionVisibility = (typeof PARTNER_PROMOTION_VISIBILITIES)[number];

export interface PartnerPromotion {
  id: string;
  universityId: string;
  programId: string;
  serviceFeeAmount: number;
  serviceFeeCurrency: string;
  visibility: PartnerPromotionVisibility;
  targetCountries: string[];
  restrictedCountries: string[];
  status: PartnerPromotionStatus;
  priority: number;
  internalNotes: string | null;
  partnerNotes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionUniversity {
  id: string;
  slug: string;
  name: string;
  nameCn?: string | null;
  city?: string | null;
  logo?: string | null;
}

export interface PromotionProgram {
  id: string;
  slug: string;
  name: string;
  nameCn?: string | null;
  degree?: string | null;
  language?: string | null;
  discipline?: string | null;
  universitySlug?: string | null;
}

export interface PartnerPromotionWithDetails extends PartnerPromotion {
  university: PromotionUniversity | null;
  program: PromotionProgram | null;
}

export function parsePartnerPromotionStatus(input: unknown): PartnerPromotionStatus | null {
  if (typeof input !== 'string') return null;
  if ((PARTNER_PROMOTION_STATUSES as readonly string[]).includes(input)) {
    return input as PartnerPromotionStatus;
  }
  return null;
}

export function parsePartnerPromotionVisibility(input: unknown): PartnerPromotionVisibility | null {
  if (typeof input !== 'string') return null;
  if ((PARTNER_PROMOTION_VISIBILITIES as readonly string[]).includes(input)) {
    return input as PartnerPromotionVisibility;
  }
  return null;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return [];
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

interface RawPartnerPromotion {
  id: string;
  university_id: string;
  program_id: string;
  service_fee_amount?: number | string | null;
  service_fee_currency?: string | null;
  visibility?: string | null;
  target_countries?: string[] | null;
  restricted_countries?: string[] | null;
  status?: string | null;
  priority?: number | string | null;
  internal_notes?: string | null;
  partner_notes?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export function mapPartnerPromotionFromDb(row: RawPartnerPromotion): PartnerPromotion {
  return {
    id: row.id,
    universityId: row.university_id,
    programId: row.program_id,
    serviceFeeAmount: toNumber(row.service_fee_amount),
    serviceFeeCurrency: row.service_fee_currency ?? 'CNY',
    visibility: parsePartnerPromotionVisibility(row.visibility) ?? 'partner_only',
    targetCountries: toStringArray(row.target_countries),
    restrictedCountries: toStringArray(row.restricted_countries),
    status: parsePartnerPromotionStatus(row.status) ?? 'active',
    priority: typeof row.priority === 'number' ? row.priority : parseInt(String(row.priority ?? '0'), 10) || 0,
    internalNotes: row.internal_notes ?? null,
    partnerNotes: row.partner_notes ?? null,
    createdBy: row.created_by ?? null,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function mapPartnerPromotionToDb(payload: Partial<PartnerPromotion>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (payload.universityId !== undefined) row.university_id = payload.universityId;
  if (payload.programId !== undefined) row.program_id = payload.programId;
  if (payload.serviceFeeAmount !== undefined) row.service_fee_amount = payload.serviceFeeAmount;
  if (payload.serviceFeeCurrency !== undefined) row.service_fee_currency = payload.serviceFeeCurrency;
  if (payload.visibility !== undefined) row.visibility = payload.visibility;
  if (payload.targetCountries !== undefined) row.target_countries = payload.targetCountries;
  if (payload.restrictedCountries !== undefined) row.restricted_countries = payload.restrictedCountries;
  if (payload.status !== undefined) row.status = payload.status;
  if (payload.priority !== undefined) row.priority = payload.priority;
  if (payload.internalNotes !== undefined) row.internal_notes = payload.internalNotes || null;
  if (payload.partnerNotes !== undefined) row.partner_notes = payload.partnerNotes || null;
  return row;
}

/**
 * Country eligibility check. Empty targetCountries means "all countries".
 * Empty restrictedCountries means "no restrictions".
 */
export function isPromotionEligibleForCountry(
  promotion: Pick<PartnerPromotion, 'targetCountries' | 'restrictedCountries'>,
  country?: string | null,
): boolean {
  if (!country) return false;
  const normalized = country.trim();
  if (!normalized) return false;

  if (promotion.targetCountries.length > 0) {
    const targets = promotion.targetCountries.map((c) => c.toLowerCase());
    if (!targets.includes(normalized.toLowerCase())) return false;
  }

  if (promotion.restrictedCountries.length > 0) {
    const restricted = promotion.restrictedCountries.map((c) => c.toLowerCase());
    if (restricted.includes(normalized.toLowerCase())) return false;
  }

  return true;
}

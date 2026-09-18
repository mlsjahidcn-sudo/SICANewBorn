/**
 * Mapper for `counselling_bookings` rows (Phase 114). Shared by the
 * public booking route's response, the admin list/patch routes, and
 * the /admin/counselling page — one source of truth for the status
 * closed set and the snake_case → camelCase coercion.
 */

export const COUNSELLING_BOOKING_STATUSES = [
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled',
  'No-show',
] as const;

export type CounsellingBookingStatus = (typeof COUNSELLING_BOOKING_STATUSES)[number];

export function isCounsellingBookingStatus(value: unknown): value is CounsellingBookingStatus {
  return typeof value === 'string' && (COUNSELLING_BOOKING_STATUSES as readonly string[]).includes(value);
}

export interface CounsellingBooking {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  country: string | null;
  educationLevel: string | null;
  topic: string | null;
  /** Absolute ISO-8601 UTC instant of the slot start. */
  slotStart: string;
  status: CounsellingBookingStatus;
  meetingLink: string | null;
  adminNotes: string | null;
  locale: string;
  sourcePage: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  gclid: string | null;
  fbclid: string | null;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asIso(value: unknown, fallback: string): string {
  const s = asString(value);
  if (!s) return fallback;
  const ms = Date.parse(s);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : fallback;
}

export function mapCounsellingBookingFromDb(row: Record<string, unknown>): CounsellingBooking {
  const created = asIso(row.created_at, new Date(0).toISOString());
  return {
    id: String(row.id),
    reference: String(row.reference ?? ''),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    country: asString(row.country),
    educationLevel: asString(row.education_level),
    topic: asString(row.topic),
    slotStart: asIso(row.slot_start, created),
    status: isCounsellingBookingStatus(row.status) ? row.status : 'Pending',
    meetingLink: asString(row.meeting_link),
    adminNotes: asString(row.admin_notes),
    locale: row.locale === 'zh' ? 'zh' : 'en',
    sourcePage: asString(row.source_page),
    utmSource: asString(row.utm_source),
    utmMedium: asString(row.utm_medium),
    utmCampaign: asString(row.utm_campaign),
    gclid: asString(row.gclid),
    fbclid: asString(row.fbclid),
    confirmedAt: row.confirmed_at ? asIso(row.confirmed_at, created) : null,
    createdAt: created,
    updatedAt: asIso(row.updated_at, created),
  };
}

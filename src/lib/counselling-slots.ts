/**
 * Slot engine for the free 10-minute online counselling sessions
 * (Phase 114). Pure date math — no I/O — so the API routes and the
 * vitest suite share one source of truth for what a bookable slot is.
 *
 * Timezone contract: every slot is a 10-minute session starting on a
 * 30-minute grid during SICA's Beijing working hours. Beijing is
 * UTC+8 year-round (China abolished DST in 1991), so wall-clock ↔
 * absolute-instant conversion is a constant-offset shift and needs no
 * tz database. Slots are stored as timestamptz (absolute instants);
 * the Beijing calendar date is only a *selection* concept — the API
 * recomputes it from the instant, so a lead can never book
 * "2026-09-19 09:00" into the wrong day by submitting a stale date.
 *
 * Capacity contract: one live (Pending/Confirmed) booking per grid
 * slot, enforced DB-side by the partial unique index in
 * database/2026-09-19_counselling_bookings.sql. The remaining 20
 * minutes of each grid cell are advisor buffer.
 */

/** Beijing is UTC+8 fixed. */
const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;

/** Length of the counselling conversation itself. */
export const SESSION_MINUTES = 10;

/** Grid spacing between slot starts. */
export const SLOT_GRID_MINUTES = 30;

/** How far ahead the public picker shows dates. */
export const BOOKING_HORIZON_DAYS = 14;

/** A slot must start at least this far in the future to be bookable. */
export const MIN_LEAD_HOURS = 2;

/** Working days, Monday–Saturday (Sunday closed). Matches Date#getUTCDay. */
const WORKING_DAYS_UTC = [1, 2, 3, 4, 5, 6];

/** First slot start of the day, minutes from Beijing midnight. */
export const DAY_START_MINUTES = 9 * 60;

/** Last slot start of the day, minutes from Beijing midnight. */
export const DAY_END_MINUTES = 17 * 60 + 30;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface BookableSlot {
  /** Absolute slot start, ISO-8601 UTC instant. */
  start: string;
  /** Beijing wall-clock label, e.g. "09:30". */
  label: string;
}

/** "YYYY-MM-DD" → [year, month(1-12), day]. null when malformed. */
function parseDateStr(dateStr: string): [number, number, number] | null {
  const m = dateStr.match(DATE_RE);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return [year, month, day];
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Beijing wall-clock (calendar date + minutes-from-midnight) →
 * absolute UTC instant. e.g. ('2026-09-19', 540) → 01:00 UTC same day.
 */
export function beijingWallToUtc(dateStr: string, minutesFromMidnight: number): Date | null {
  const parts = parseDateStr(dateStr);
  if (!parts) return null;
  const [year, month, day] = parts;
  // Date.UTC is month-1 based.
  return new Date(Date.UTC(year, month - 1, day) + minutesFromMidnight * 60_000 - BEIJING_OFFSET_MS);
}

/** Absolute instant → Beijing calendar date "YYYY-MM-DD". */
export function utcToBeijingDateStr(instant: Date): string {
  const shifted = new Date(instant.getTime() + BEIJING_OFFSET_MS);
  return `${shifted.getUTCFullYear()}-${pad2(shifted.getUTCMonth() + 1)}-${pad2(shifted.getUTCDate())}`;
}

/** "Today" in Beijing wall-clock, as "YYYY-MM-DD". */
export function beijingTodayStr(now: Date): string {
  return utcToBeijingDateStr(now);
}

/** Is this a Beijing working day (Mon–Sat) at all? */
export function isWorkingBeijingDate(dateStr: string): boolean {
  const parts = parseDateStr(dateStr);
  if (!parts) return false;
  const [year, month, day] = parts;
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    // e.g. 2026-02-30 — the calendar rolled over, so the date is fake.
    return false;
  }
  return WORKING_DAYS_UTC.includes(utc.getUTCDay());
}

/**
 * Next `horizonDays` Beijing calendar dates from `now` (inclusive of
 * today) that are working days, "YYYY-MM-DD" ascending. Today itself
 * only appears if any slot still clears the lead-time window (checked
 * per-slot by the caller).
 */
export function listBookableDates(now: Date, horizonDays: number = BOOKING_HORIZON_DAYS): string[] {
  const today = beijingTodayStr(now);
  const parts = parseDateStr(today);
  if (!parts) return [];
  const cursor = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  const dates: string[] = [];
  for (let i = 0; i < horizonDays; i++) {
    const dateStr = `${cursor.getUTCFullYear()}-${pad2(cursor.getUTCMonth() + 1)}-${pad2(cursor.getUTCDate())}`;
    if (isWorkingBeijingDate(dateStr)) dates.push(dateStr);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

/** Every candidate slot start (absolute instants) for one Beijing date. */
export function listCandidateSlotsForDate(dateStr: string): Date[] {
  if (!isWorkingBeijingDate(dateStr)) return [];
  const slots: Date[] = [];
  for (let m = DAY_START_MINUTES; m <= DAY_END_MINUTES; m += SLOT_GRID_MINUTES) {
    const start = beijingWallToUtc(dateStr, m);
    if (start) slots.push(start);
  }
  return slots;
}

/** Beijing "HH:MM" label for a slot start. */
export function formatBeijingLabel(instant: Date): string {
  const shifted = new Date(instant.getTime() + BEIJING_OFFSET_MS);
  return `${pad2(shifted.getUTCHours())}:${pad2(shifted.getUTCMinutes())}`;
}

/** Slot must start at least MIN_LEAD_HOURS from now. */
export function isSlotWithinLeadWindow(now: Date, slotStart: Date): boolean {
  return slotStart.getTime() >= now.getTime() + MIN_LEAD_HOURS * 60 * 60 * 1000;
}

/**
 * Parse a client-submitted slot value into an instant. Accepts only
 * ISO strings that parse to a minute-aligned instant (no seconds,
 * no millis) — anything else is a malformed slot, not a booking.
 */
export function parseSlotInstant(value: unknown): Date | null {
  if (typeof value !== 'string' || value.length === 0 || value.length > 40) return null;
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return null;
  const d = new Date(ms);
  if (d.getUTCSeconds() !== 0 || d.getUTCMilliseconds() !== 0) return null;
  return d;
}

/**
 * Membership check: is this instant EXACTLY one of the candidate
 * slots for its own Beijing date? This is what stops a tampered
 * payload from booking 03:17 Beijing time or a slot on a closed day.
 */
export function isCandidateSlot(slotStart: Date): boolean {
  const dateStr = utcToBeijingDateStr(slotStart);
  return listCandidateSlotsForDate(dateStr).some((s) => s.getTime() === slotStart.getTime());
}

/**
 * Closed set for the wizard's "current education" select. Kept here
 * (not in the route) so the client wizard and the API validate the
 * same values.
 */
export const COUNSELLING_EDUCATION_LEVELS = [
  'high_school',
  'bachelor_student',
  'bachelor_graduate',
  'master_student',
  'master_graduate',
  'other',
] as const;

export type CounsellingEducationLevel = (typeof COUNSELLING_EDUCATION_LEVELS)[number];

export function isCounsellingEducationLevel(value: unknown): value is CounsellingEducationLevel {
  return (
    typeof value === 'string' &&
    (COUNSELLING_EDUCATION_LEVELS as readonly string[]).includes(value)
  );
}

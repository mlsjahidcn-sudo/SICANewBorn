/**
 * Phase 141: country → IANA timezone map for the webinar
 * confirmation email.
 *
 * The signup form (`webinar-signup-form.tsx`) already captures
 * `country` as a free-text English name (the same labels used
 * in `COUNTRIES` from `src/lib/seo-data.ts`). For the
 * `webinar.confirmed` email we want to render the webinar time
 * in the student's local timezone alongside China time.
 *
 * This module is a tiny pure helper — no external dep, no
 * `country-to-timezone` npm package. Server-only (uses
 * `Intl.DateTimeFormat` with `timeZone` option, which works
 * fine in Node ≥ 18).
 *
 * Countries spanning multiple timezones (USA, Russia,
 * Canada, Brazil, Australia) are mapped to the dominant zone
 * (population-weighted default), and the email body appends
 * a small "(approximate — confirm local time)" hint via
 * `isMultiTimezoneCountry()`. For those countries the
 * admin can follow up with a precise local-time when the
 * student replies.
 */

export const COUNTRY_TIMEZONE: Record<string, string> = {
  // South Asia
  Pakistan: 'Asia/Karachi',
  India: 'Asia/Kolkata',
  Bangladesh: 'Asia/Dhaka',
  Nepal: 'Asia/Kathmandu',
  'Sri Lanka': 'Asia/Colombo',
  // Southeast Asia
  Indonesia: 'Asia/Jakarta',
  Vietnam: 'Asia/Ho_Chi_Minh',
  Thailand: 'Asia/Bangkok',
  Malaysia: 'Asia/Kuala_Lumpur',
  Philippines: 'Asia/Manila',
  Singapore: 'Asia/Singapore',
  // East Asia (other than China)
  Japan: 'Asia/Tokyo',
  'South Korea': 'Asia/Seoul',
  Mongolia: 'Asia/Ulaanbaatar',
  // Central Asia
  Kazakhstan: 'Asia/Almaty',
  Uzbekistan: 'Asia/Tashkent',
  // Middle East
  'Saudi Arabia': 'Asia/Riyadh',
  'United Arab Emirates': 'Asia/Dubai',
  Turkey: 'Europe/Istanbul',
  Iran: 'Asia/Tehran',
  Israel: 'Asia/Jerusalem',
  // Africa
  Nigeria: 'Africa/Lagos',
  Ghana: 'Africa/Accra',
  Kenya: 'Africa/Nairobi',
  Tanzania: 'Africa/Dar_es_Salaam',
  Ethiopia: 'Africa/Addis_Ababa',
  Egypt: 'Africa/Cairo',
  'South Africa': 'Africa/Johannesburg',
  Morocco: 'Africa/Casablanca',
  Uganda: 'Africa/Kampala',
  Rwanda: 'Africa/Kigali',
  // Europe
  'United Kingdom': 'Europe/London',
  Germany: 'Europe/Berlin',
  France: 'Europe/Paris',
  Italy: 'Europe/Rome',
  Spain: 'Europe/Madrid',
  Netherlands: 'Europe/Amsterdam',
  Poland: 'Europe/Warsaw',
  Ukraine: 'Europe/Kyiv',
  // Americas
  Mexico: 'America/Mexico_City',
  Colombia: 'America/Bogota',
  Argentina: 'America/Argentina/Buenos_Aires',
  Chile: 'America/Santiago',
  Peru: 'America/Lima',
  // Multi-timezone countries — single dominant zone; the
  // email body appends an "(approximate)" hint via
  // isMultiTimezoneCountry() below.
  'United States': 'America/New_York',
  Russia: 'Europe/Moscow',
  Canada: 'America/Toronto',
  Brazil: 'America/Sao_Paulo',
  Australia: 'Australia/Sydney',
};

/**
 * Countries where our single-zone mapping is an approximation.
 * The email renderer uses this to append a small
 * "(approximate — confirm local time)" hint so the student
 * doesn't show up at the wrong time after we email a guess.
 */
export const MULTI_TZ_COUNTRIES = new Set<string>([
  'United States',
  'Russia',
  'Canada',
  'Brazil',
  'Australia',
]);

export function getTimezoneForCountry(
  name: string | null | undefined,
): string | null {
  if (!name) return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  // Direct hit first (most common case — the form uses the
  // exact English label from the COUNTRIES list).
  if (COUNTRY_TIMEZONE[trimmed]) return COUNTRY_TIMEZONE[trimmed];
  // Case-insensitive fallback for hand-typed variants.
  const lower = trimmed.toLowerCase();
  for (const [key, tz] of Object.entries(COUNTRY_TIMEZONE)) {
    if (key.toLowerCase() === lower) return tz;
  }
  return null;
}

export function isMultiTimezoneCountry(
  name: string | null | undefined,
): boolean {
  if (!name) return false;
  return MULTI_TZ_COUNTRIES.has(name.trim());
}

/**
 * Render a wall-clock line for an ISO instant in a specific
 * IANA timezone. Returns null on invalid input so the caller
 * can fall back to the China-time-only branch.
 *
 * Locale defaults:
 *   en → 'en-GB' (Sat, 19 Sep 2026, 10:00)
 *   zh → 'zh-CN' (周六, 2026年9月19日 10:00)
 */
export function formatTimeInZone(
  iso: string | null,
  timezone: string,
  locale: 'en' | 'zh' = 'en',
): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone,
    }).format(d);
  } catch {
    return null;
  }
}

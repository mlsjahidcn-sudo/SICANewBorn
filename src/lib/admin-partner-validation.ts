/**
 * Phase 85: pure validation helpers for /api/admin/partners (POST).
 *
 * Extracted so the route stays a thin HTTP shell + these helpers
 * are unit-testable without mocking Supabase. Everything that the
 * sub-agent put inline in the POST handler moved here unchanged.
 */

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export interface PartnerCreateInput {
  email: unknown;
  company_name: unknown;
  contact_person: unknown;
  phone?: unknown;
  country?: unknown;
  notes?: unknown;
  commission_rate?: unknown;
  send_welcome_email?: unknown;
}

export interface NormalizedPartnerCreate {
  email: string;
  company_name: string;
  contact_person: string;
  phone: string;
  country: string;
  notes: string;
  commission_rate: number | null;
  send_welcome_email: boolean;
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

/**
 * Validate the body of POST /api/admin/partners. Returns the
 * normalized value on success or the 400-error message on failure.
 */
export function validatePartnerCreate(
  body: PartnerCreateInput | null | undefined,
): ValidationResult<NormalizedPartnerCreate> {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid JSON body' };
  }
  const emailRaw =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!emailRaw) return { ok: false, error: 'email is required' };
  if (!EMAIL_REGEX.test(emailRaw)) {
    return { ok: false, error: 'Invalid email format' };
  }
  const companyRaw =
    typeof body.company_name === 'string' ? body.company_name.trim() : '';
  if (!companyRaw) return { ok: false, error: 'company_name is required' };
  if (companyRaw.length > 255) {
    return { ok: false, error: 'company_name too long (max 255)' };
  }
  const contactRaw =
    typeof body.contact_person === 'string' ? body.contact_person.trim() : '';
  if (!contactRaw) return { ok: false, error: 'contact_person is required' };
  if (contactRaw.length > 255) {
    return { ok: false, error: 'contact_person too long (max 255)' };
  }
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  if (phone.length > 50) {
    return { ok: false, error: 'phone too long (max 50)' };
  }
  const country = typeof body.country === 'string' ? body.country.trim() : '';
  if (country.length > 100) {
    return { ok: false, error: 'country too long (max 100)' };
  }
  const notes = typeof body.notes === 'string' ? body.notes.trim() : '';

  let commissionRate: number | null = null;
  if (
    body.commission_rate !== undefined &&
    body.commission_rate !== null &&
    body.commission_rate !== ''
  ) {
    const parsed =
      typeof body.commission_rate === 'number'
        ? body.commission_rate
        : parseFloat(String(body.commission_rate));
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      return {
        ok: false,
        error: 'commission_rate must be a number between 0 and 100',
      };
    }
    commissionRate = parsed;
  }

  const sendWelcome = body.send_welcome_email === false ? false : true;

  return {
    ok: true,
    value: {
      email: emailRaw,
      company_name: companyRaw,
      contact_person: contactRaw,
      phone,
      country,
      notes,
      commission_rate: commissionRate,
      send_welcome_email: sendWelcome,
    },
  };
}

/**
 * Whitelist the PATCH `action='update'` body. Only the 6 admin-editable
 * partner fields survive — anything else (user_id, id, created_at,
 * status, etc.) is dropped. Returns the safe update payload.
 */
export function whitelistPartnerUpdate(
  body: Record<string, unknown> | null | undefined,
): ValidationResult<Record<string, unknown>> {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'No editable fields provided' };
  }
  const allowed: string[] = [
    'company_name',
    'contact_person',
    'phone',
    'country',
    'commission_rate',
    'notes',
  ];
  const updates: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in body) updates[k] = body[k];
  }
  if (Object.keys(updates).length === 0) {
    return { ok: false, error: 'No editable fields provided' };
  }
  return { ok: true, value: updates };
}

/**
 * Re-export the email regex for callers that want to validate
 * client-side before submitting.
 */
export { EMAIL_REGEX };
/**
 * Application messages — pure helpers shared by the API routes, the
 * notification/email code and the UI. No I/O here, so it is unit-tested
 * directly (src/lib/__tests__/application-messages.test.ts).
 *
 * A conversation belongs to exactly one application:
 *   surface 'student' → student_applications: SICA admin ↔ the student
 *   surface 'partner' → partner_applications: SICA admin ↔ the partner team
 */

export type MessageSurface = 'student' | 'partner';
export type MessageSenderRole = 'admin' | 'student' | 'partner';

export const MESSAGE_MAX_LENGTH = 5000;
/** At most one email per side per conversation within this window. */
export const MESSAGE_EMAIL_THROTTLE_MS = 60 * 60 * 1000;
/** Characters of the message quoted in notification emails. */
export const MESSAGE_EMAIL_PREVIEW_LENGTH = 500;

export interface RawApplicationMessage {
  id: string;
  sender_role: string;
  sender_name: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface ApplicationMessage {
  id: string;
  senderRole: MessageSenderRole;
  senderName: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export type MessageBodyResult =
  | { ok: true; body: string }
  | { ok: false; error: 'empty' | 'too_long' | 'invalid' };

export function validateMessageBody(input: unknown): MessageBodyResult {
  if (typeof input !== 'string') return { ok: false, error: 'invalid' };
  // Normalise line endings and trim outer whitespace; keep inner newlines.
  const body = input.replace(/\r\n?/g, '\n').trim();
  if (!body) return { ok: false, error: 'empty' };
  if (body.length > MESSAGE_MAX_LENGTH) return { ok: false, error: 'too_long' };
  return { ok: true, body };
}

function toSenderRole(value: string): MessageSenderRole {
  return value === 'student' || value === 'partner' ? value : 'admin';
}

export function mapApplicationMessage(row: RawApplicationMessage): ApplicationMessage {
  return {
    id: row.id,
    senderRole: toSenderRole(row.sender_role),
    senderName: row.sender_name ?? '',
    body: row.body,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

/** The side that sends from a portal on this surface. */
export function portalRoleFor(surface: MessageSurface): MessageSenderRole {
  return surface === 'student' ? 'student' : 'partner';
}

/**
 * True when the side receiving a new message should get an email: no email
 * went to that side for this conversation within the throttle window.
 */
export function shouldEmail(
  lastEmailedAt: string | null | undefined,
  nowMs: number,
  windowMs: number = MESSAGE_EMAIL_THROTTLE_MS,
): boolean {
  if (!lastEmailedAt) return true;
  const last = Date.parse(lastEmailedAt);
  if (Number.isNaN(last)) return true;
  return nowMs - last >= windowMs;
}

/** Truncate a message for a notification preview without cutting mid-word where possible. */
export function messagePreview(body: string, max: number = MESSAGE_EMAIL_PREVIEW_LENGTH): string {
  const flat = body.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Offline students created without an email get an `@sica.invalid`
 * placeholder login (Phase 90). Never send mail there.
 */
export function isDeliverableEmail(email: string | null | undefined): email is string {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed.includes('@')) return false;
  return !trimmed.endsWith('@sica.invalid');
}

/** Count messages from the other side that the viewer hasn't read yet. */
export function countUnreadFor(
  messages: Array<Pick<ApplicationMessage, 'senderRole' | 'readAt'>>,
  viewerRole: MessageSenderRole,
): number {
  return messages.filter((m) => m.senderRole !== viewerRole && !m.readAt).length;
}

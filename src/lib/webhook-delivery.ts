/**
 * Webhook delivery: HMAC-signed POST + retry with backoff.
 *
 * The wire format:
 *   POST <url>
 *   Content-Type: application/json
 *   User-Agent: SICA-Webhooks/1.0
 *   X-SICA-Event: university.updated
 *   X-SICA-Delivery-Id: <uuid>           (idempotency key for the consumer)
 *   X-SICA-Signature: sha256=<hex>        (HMAC-SHA256 of raw body using
 *                                          subscription.secret)
 *
 *   {"event":"university.updated","data":{...},"delivery_id":"<uuid>"}
 *
 * Retry policy (in src/lib/webhook-emitter.ts): 5xx or network error →
 * schedule retry with backoff 1m, 5m, 30m, 2h, 12h. 4xx → mark dead
 * (consumer is saying "bad request", retrying just spams them).
 * After 5 attempts → status='dead', no more retries.
 *
 * Consumers verify the signature like:
 *   const expected = 'sha256=' + crypto.createHmac('sha256', secret)
 *                                 .update(rawBody)
 *                                 .digest('hex');
 *   if (!timingSafeEqual(expected, header)) reject;
 * Use crypto.timingSafeEqual (Node) or hmac.compare_digest (Python)
 * — a regular === leaks timing information.
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export type WebhookEvent =
  | 'university.created'
  | 'university.updated'
  | 'university.deleted'
  | 'program.created'
  | 'program.updated'
  | 'program.deleted';

export const ALL_WEBHOOK_EVENTS: WebhookEvent[] = [
  'university.created',
  'university.updated',
  'university.deleted',
  'program.created',
  'program.updated',
  'program.deleted',
];

const SIGNATURE_HEADER = 'X-SICA-Signature';
const EVENT_HEADER = 'X-SICA-Event';
const DELIVERY_HEADER = 'X-SICA-Delivery-Id';
const USER_AGENT = 'SICA-Webhooks/1.0';

export interface DeliveryPayload {
  event: WebhookEvent;
  delivery_id: string;
  data: unknown;
}

export interface DeliveryResult {
  ok: boolean;
  http_status: number | null;
  response_body: string | null;
  error?: string;
}

/** Generate a 32-byte secret for a new subscription. Base64url-encoded
 *  (43 chars, no padding). Returned to the consumer ONCE on create. */
export function generateWebhookSecret(): string {
  return randomBytes(32).toString('base64url');
}

/** HMAC-SHA256 of the raw body, hex. Pinned to sha256= prefix so the
 *  consumer's verifier is unambiguous about the algorithm. */
export function signPayload(secret: string, body: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(body, 'utf8');
  return 'sha256=' + hmac.digest('hex');
}

/** Constant-time equality check. Throws on length mismatch (timingSafeEqual
 *  throws on different-length buffers). We guard with a length check
 *  first and return false instead — HMAC hex is always 64 chars
 *  (sha256= + 64 hex) so length-equality is implicit if both sides
 *  are well-formed, but defending against malformed input is cheap. */
export function verifySignature(secret: string, body: string, header: string): boolean {
  if (typeof header !== 'string' || !header.startsWith('sha256=')) return false;
  if (header.length !== 71) return false; // 'sha256=' (7) + 64 hex = 71
  const expected = signPayload(secret, body);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(header, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Backoff schedule. attempt 1 → wait 1m, attempt 2 → 5m, etc. */
export const RETRY_BACKOFF_MS = [
  1 * 60 * 1000,      // 1 minute
  5 * 60 * 1000,      // 5 minutes
  30 * 60 * 1000,     // 30 minutes
  2 * 60 * 60 * 1000, // 2 hours
  12 * 60 * 60 * 1000,// 12 hours
];
export const MAX_ATTEMPTS = 5;

/** Decide the next retry time for a failed attempt. Returns null if
 *  the attempt count has reached MAX_ATTEMPTS (caller should mark
 *  the delivery 'dead' instead of scheduling another retry). */
export function nextRetryAt(attemptCount: number): Date | null {
  if (attemptCount >= MAX_ATTEMPTS) return null;
  const delay = RETRY_BACKOFF_MS[attemptCount - 1] ?? RETRY_BACKOFF_MS[RETRY_BACKOFF_MS.length - 1];
  return new Date(Date.now() + delay);
}

/** Build the fetch headers for a delivery. */
export function deliveryHeaders(
  payload: DeliveryPayload,
  secret: string,
  body: string,
): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'User-Agent': USER_AGENT,
    [EVENT_HEADER]: payload.event,
    [DELIVERY_HEADER]: payload.delivery_id,
    [SIGNATURE_HEADER]: signPayload(secret, body),
  };
}

export { SIGNATURE_HEADER, EVENT_HEADER, DELIVERY_HEADER, USER_AGENT };

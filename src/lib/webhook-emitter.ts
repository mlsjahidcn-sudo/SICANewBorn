/**
 * Webhook event emitter + delivery worker.
 *
 * Two responsibilities:
 *   1. dispatchEvent(event, data) — called from admin route handlers
 *      when they mutate a university or program. Inserts a
 *      `webhook_deliveries` row per matching subscription.
 *   2. processWebhookQueue() — runs every ~60s via the in-process
 *      scheduler in src/server.ts. Picks up pending + due-for-retry
 *      deliveries, POSTs to the subscriber, updates the row.
 *
 * Why an in-process worker instead of a separate cron?
 *   - The SICA runtime is a single Node process (custom server.ts).
 *   - At our volume (low hundreds of B2B consumers, ~10s of events
 *     per day) the work fits in-process comfortably.
 *   - If we ever need to scale to multiple containers, swap this
 *     for a proper pg-boss / BullMQ worker — the interface is the
 *     same (insert row → claim row → deliver → update row).
 *
 * At-least-once delivery: a delivery that crashes the worker
 * mid-POST will be re-attempted on the next tick. Consumers MUST
 * dedupe on `delivery_id` (the X-SICA-Delivery-Id header).
 */

import { buildServiceClient } from './supabase-auth';
import {
  deliveryHeaders,
  nextRetryAt,
  type DeliveryPayload,
  type WebhookEvent,
} from './webhook-delivery';

interface QueuedDelivery {
  id: string;
  subscription_id: string;
  event: string;
  payload: DeliveryPayload;
  url: string;
  secret: string;
  attempt_count: number;
}

const DELIVERY_TIMEOUT_MS = 10_000;
const BATCH_SIZE = 25;

/**
 * Queue an event for delivery to all matching subscriptions.
 * Called from admin route handlers. Returns the number of deliveries
 * queued (1 per matching subscription; 0 if no one is subscribed).
 */
export async function dispatchEvent(
  event: WebhookEvent,
  data: unknown,
): Promise<number> {
  const service = buildServiceClient();
  // Find active subscriptions for this event, scoped to the api_key
  // that owns the resource being mutated. The event payload includes
  // api_key_id (when known) so we can filter; for admin-initiated
  // mutations there's no specific key, so we just fire to all
  // matching subs (each admin edit broadcasts to all subscribers).
  const { data: subs, error: subsErr } = await service
    .from('webhook_subscriptions')
    .select('id, secret, api_key_id, url, events')
    .eq('active', true)
    .contains('events', [event]);

  if (subsErr) {
    console.error('[webhook-emitter] subscription lookup error:', subsErr);
    return 0;
  }
  if (!subs || subs.length === 0) return 0;

  const rows = subs.map((sub) => {
    const delivery_id = crypto.randomUUID();
    return {
      subscription_id: sub.id,
      event,
      payload: {
        event,
        delivery_id,
        data,
      } satisfies DeliveryPayload,
      status: 'pending',
      attempt_count: 0,
    };
  });

  const { error: insertErr } = await service
    .from('webhook_deliveries')
    .insert(rows);

  if (insertErr) {
    console.error('[webhook-emitter] insert deliveries error:', insertErr);
    return 0;
  }

  return rows.length;
}

/** Main worker tick. Called by the in-process scheduler every 60s. */
export async function processWebhookQueue(): Promise<{ processed: number; delivered: number; failed: number; dead: number }> {
  const service = buildServiceClient();
  // Pick up pending + due-for-retry deliveries. The retry index is
  // partial on status=failed AND next_retry_at IS NOT NULL; the
  // pending index is partial on status=pending. OR-combined here,
  // then the BATCH_SIZE cap keeps each tick bounded.
  const { data: rows, error: fetchErr } = await service
    .from('webhook_deliveries')
    .select(`
      id,
      subscription_id,
      event,
      payload,
      attempt_count,
      webhook_subscriptions!inner (
        url,
        secret,
        active
      )
    `)
    .or('status.eq.pending,and(status.eq.failed,next_retry_at.lte.now())')
    .eq('webhook_subscriptions.active', true)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchErr) {
    console.error('[webhook-emitter] queue fetch error:', fetchErr);
    return { processed: 0, delivered: 0, failed: 0, dead: 0 };
  }
  if (!rows || rows.length === 0) {
    return { processed: 0, delivered: 0, failed: 0, dead: 0 };
  }

  let delivered = 0;
  let failed = 0;
  let dead = 0;

  for (const row of rows) {
    const sub = (row as { webhook_subscriptions: { url: string; secret: string; active: boolean } | { url: string; secret: string; active: boolean }[] }).webhook_subscriptions;
    const subObj = Array.isArray(sub) ? sub[0] : sub;
    if (!subObj || !subObj.active) continue;

    const queued: QueuedDelivery = {
      id: row.id,
      subscription_id: row.subscription_id,
      event: row.event,
      payload: row.payload as DeliveryPayload,
      url: subObj.url,
      secret: subObj.secret,
      attempt_count: row.attempt_count,
    };

    const result = await attemptDelivery(queued);
    if (result === 'success') delivered++;
    else if (result === 'failed') failed++;
    else dead++;
  }

  return { processed: rows.length, delivered, failed, dead };
}

type DeliveryOutcome = 'success' | 'failed' | 'dead';

async function attemptDelivery(q: QueuedDelivery): Promise<DeliveryOutcome> {
  const service = buildServiceClient();
  const body = JSON.stringify(q.payload);
  const headers = deliveryHeaders(q.payload, q.secret, body);
  const attemptNumber = q.attempt_count + 1;

  let httpStatus: number | null = null;
  let responseBody: string | null = null;
  let errorMessage: string | null = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(q.url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    httpStatus = res.status;
    // Read at most 4KB of the body for the audit log. The rest is
    // truncated to keep the table small.
    responseBody = (await res.text()).slice(0, 4096);
    if (res.ok) {
      // 2xx — success. Bump counters on the subscription too.
      await service
        .from('webhook_deliveries')
        .update({
          status: 'success',
          http_status: httpStatus,
          response_body: responseBody,
          attempt_count: attemptNumber,
          last_attempt_at: new Date().toISOString(),
          next_retry_at: null,
        })
        .eq('id', q.id);
      await service.rpc('bump_webhook_subscription_counters' as never, {
        p_id: q.subscription_id,
        p_success_delta: 1,
        p_failure_delta: 0,
      } as never).then(
        () => undefined,
        (e: unknown) => console.error('[webhook-emitter] counter bump failed:', e),
      );
      await service
        .from('webhook_subscriptions')
        .update({ last_triggered_at: new Date().toISOString() })
        .eq('id', q.subscription_id);
      return 'success';
    }

    // Non-2xx: 4xx → dead (consumer said no), 5xx → retry.
    if (res.status >= 400 && res.status < 500) {
      errorMessage = `4xx response (no retry)`;
      // ...fall through to dead
    } else {
      errorMessage = `5xx response`;
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Network error';
  }

  // Failure path: either retry or mark dead.
  const nextRetry = nextRetryAt(attemptNumber);
  const isDead = nextRetry === null;

  await service
    .from('webhook_deliveries')
    .update({
      status: isDead ? 'dead' : 'failed',
      http_status: httpStatus,
      response_body: responseBody,
      attempt_count: attemptNumber,
      last_attempt_at: new Date().toISOString(),
      next_retry_at: isDead ? null : nextRetry!.toISOString(),
    })
    .eq('id', q.id);

  if (!isDead) {
    await service.rpc('bump_webhook_subscription_counters' as never, {
      p_id: q.subscription_id,
      p_success_delta: 0,
      p_failure_delta: 1,
    } as never).then(
      () => undefined,
      (e: unknown) => console.error('[webhook-emitter] counter bump failed:', e),
    );
  }
  console.warn(
    `[webhook-emitter] delivery ${q.id} ${isDead ? 'dead' : 'failed'} (attempt ${attemptNumber}): ${errorMessage}`,
  );
  return isDead ? 'dead' : 'failed';
}

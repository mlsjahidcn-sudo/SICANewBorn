/**
 * Webhook delivery scheduler — in-process worker tick.
 *
 * Runs processWebhookQueue() every 60s. The worker:
 *   1. Picks up `pending` deliveries (never attempted yet) AND
 *      `failed` deliveries whose `next_retry_at` has elapsed.
 *   2. POSTs each one with a 10s timeout.
 *   3. Updates status to success / failed / dead based on the
 *      response, scheduling the next retry if needed.
 *
 * Why in-process instead of an external queue:
 *   - SICA is a single-container deploy (Railway / Hostinger Cloud).
 *   - At our volume (low hundreds of B2B consumers, ~10s of events
 *     per day) the work fits comfortably in a single process.
 *   - If we ever scale to multiple containers, swap this for a
 *     proper pg-boss / BullMQ worker — the interface is identical.
 *
 * Idempotent: safe to call from a module-load guard.
 */

import { isSupabaseServerConfigured } from './supabase-server';
import { processWebhookQueue } from './webhook-emitter';

const TICK_MS = 60_000; // 1 minute

let started = false;
let timer: NodeJS.Timeout | null = null;

export function startWebhookScheduler(): void {
  if (started) return;
  started = true;

  if (!isSupabaseServerConfigured()) {
    console.log('[webhook] scheduler not started (Supabase not configured)');
    return;
  }

  console.log('[webhook] scheduler started — running every 60s');
  // Fire once on startup to catch up on anything missed while the
  // process was down, then every minute thereafter.
  processWebhookQueue()
    .then((stats) => {
      if (stats.processed > 0) {
        console.log(
          `[webhook] startup catch-up: processed=${stats.processed} ` +
            `delivered=${stats.delivered} failed=${stats.failed} dead=${stats.dead}`,
        );
      }
    })
    .catch((err) => console.error('[webhook] initial run failed', err));
  timer = setInterval(() => {
    processWebhookQueue()
      .then((stats) => {
        if (stats.processed > 0) {
          console.log(
            `[webhook] tick: processed=${stats.processed} ` +
              `delivered=${stats.delivered} failed=${stats.failed} dead=${stats.dead}`,
          );
        }
      })
      .catch((err) => console.error('[webhook] tick failed', err));
  }, TICK_MS);
  // Don't block process exit.
  timer.unref?.();
}

/** Test-only: stop the scheduler. */
export function stopWebhookScheduler(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  started = false;
}

/**
 * Shared GET/POST handling for the four application-message routes. Each
 * route does its OWN permission check and context lookup first, then hands
 * off here — this module never decides who is allowed in.
 */

import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateMessageBody, type MessageSenderRole } from '@/lib/application-messages';
import {
  countUnreadApplicationMessages,
  listApplicationMessages,
  postApplicationMessage,
  type MessageApplicationContext,
  type MessageSender,
} from '@/lib/application-messages-server';

export type MessageDisabledReason = 'no_portal_account';

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

/**
 * GET: `?summary=1` → `{ unreadCount }` (for tab badges);
 * otherwise the thread, marking the other side's messages read when `?markRead=1`.
 */
export async function respondWithThread(
  request: Request,
  service: SupabaseClient,
  ctx: MessageApplicationContext,
  viewerRole: MessageSenderRole,
  disabledReason: MessageDisabledReason | null = null,
): Promise<NextResponse> {
  const url = new URL(request.url);
  if (url.searchParams.get('summary') === '1') {
    const unreadCount = await countUnreadApplicationMessages(service, ctx, viewerRole);
    return NextResponse.json({ unreadCount });
  }
  try {
    const messages = await listApplicationMessages(
      service,
      ctx,
      viewerRole,
      url.searchParams.get('markRead') === '1',
    );
    return NextResponse.json({
      messages,
      canSend: disabledReason === null,
      disabledReason,
    });
  } catch (err) {
    console.error('[application-messages] list failed:', err);
    return NextResponse.json({ error: 'Could not load messages' }, { status: 500 });
  }
}

/** POST: `{ body }` → 201 `{ message }`. */
export async function handleMessagePost(
  request: Request,
  service: SupabaseClient,
  ctx: MessageApplicationContext,
  sender: MessageSender,
): Promise<NextResponse> {
  const limit = checkRateLimit({
    action: 'application-message',
    key: sender.userId,
    max: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many messages. Please wait a few minutes.', code: 'RATE_LIMITED' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const validated = validateMessageBody((payload as { body?: unknown } | null)?.body);
  if (!validated.ok) {
    const error =
      validated.error === 'too_long'
        ? 'Message is too long (5,000 characters max).'
        : 'Message cannot be empty.';
    return NextResponse.json({ error, code: validated.error }, { status: 400 });
  }

  try {
    const message = await postApplicationMessage(service, ctx, sender, validated.body);
    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error('[application-messages] post failed:', err);
    return NextResponse.json({ error: 'Could not send the message' }, { status: 500 });
  }
}

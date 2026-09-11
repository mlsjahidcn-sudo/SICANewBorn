/**
 * Chat history hydration for the public chat widget.
 *
 * Phase 82: backed by `chat_messages` table (TTL = 7 days).
 * On chat open, ChatWindow fetches the last N messages for this
 * session_token and shows them above the welcome message so a
 * returning visitor doesn't see "Hi there! 👋" again like a stranger.
 *
 * The API is anonymous-by-design (the session_token IS the auth —
 * anyone with the link can read the conversation). Acceptable for this
 * use case because the chat stores no PII in the messages themselves
 * (the LeadPanel sends name/email to chat_leads, a separate table
 * with admin-only RLS).
 */

export interface HistoryMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  /** ISO timestamp from the server. */
  created_at: string;
}

export interface HistoryResponse {
  messages: HistoryMessage[];
  expires_at: string | null;
}

/**
 * Fetch persisted messages for the given session_token.
 * Returns [] on 404 / network error so the caller can fall through to
 * the welcome message without blocking the chat open.
 */
export async function loadSessionHistory(
  sessionToken: string,
): Promise<HistoryMessage[]> {
  if (!sessionToken) return [];
  try {
    const res = await fetch(
      `/api/chat/session/messages?session_token=${encodeURIComponent(sessionToken)}`,
      { method: 'GET', headers: { Accept: 'application/json' } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as HistoryResponse;
    return data.messages || [];
  } catch {
    return [];
  }
}

/**
 * Persist a batch of messages for the given session. Fire-and-forget —
 * callers don't await this; we don't want a DB hiccup to bubble up
 * to the visitor's UI.
 */
export function persistMessages(
  sessionToken: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): void {
  if (!sessionToken || messages.length === 0) return;
  // The actual fetch is fire-and-forget. We don't await — the
  // /api/ai/chat SSE stream is the user-facing surface; DB writes
  // for history can fail silently and the next request will retry.
  void fetch('/api/chat/session/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_token: sessionToken, messages }),
    // No keepalive — let the browser pool the request
  }).catch(() => {
    // swallow — history is best-effort
  });
}

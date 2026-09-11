/**
 * Phase 82: GET + POST /api/chat/session/messages
 *
 * Public chat 7-day conversation history. The chat widget calls this
 * on mount to hydrate from the backend, then on each successful
 * stream completion to persist the new messages.
 *
 * GET — fetch the message history for a given session_token.
 *   Query: ?session_token=<string>
 *   Response: { messages: [{role, content, created_at}], expires_at }
 *
 * POST — persist a batch of new messages for a given session_token.
 *   Body: { session_token, messages: [{role, content}] }
 *   Response: { ok: true, inserted: N }
 *
 * No authentication — the session_token is the auth. Anyone with the
 * token can read/write the messages for that session. This is
 * intentional: the chat is anonymous-by-design and the messages
 * contain no PII (LeadPanel saves name/email to chat_leads separately).
 *
 * Phase 82: writes go to the new `chat_history` table (NOT the
 * legacy orphan `chat_messages` table from June 2026 — different
 * schema, no TTL, no `session_token` FK). We keep the legacy table
 * in place for historical reads; the chat widget only reads from
 * chat_history going forward.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { checkPublicRateLimit, extractClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const FIFTEEN_MIN_MS = 15 * 60 * 1000;

/**
 * GET — return up to 200 messages for the given session_token,
 * newest first, with server-side TTL filtering.
 *
 * Returns [] when no token, expired rows, or fetch errors so the
 * chat widget can fall through to the welcome message without
 * blocking the open.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionToken = (searchParams.get('session_token') || '').trim();
  if (!sessionToken) {
    return NextResponse.json({ messages: [], expires_at: null });
  }
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ messages: [], expires_at: null });
  }
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ messages: [], expires_at: null });
  }

  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('role, content, created_at, expires_at')
      .eq('session_token', sessionToken)
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) {
      console.warn('[chat-messages GET] supabase error:', error.message);
      return NextResponse.json({ messages: [], expires_at: null });
    }
    // Return in chronological order (oldest first) so the chat UI
    // can render directly without reversing.
    const messages = (data || []).reverse().map((r) => ({
      role: r.role as 'user' | 'assistant',
      content: r.content,
      created_at: r.created_at,
    }));
    return NextResponse.json({
      messages,
      expires_at: data?.[data.length - 1]?.expires_at ?? null,
    });
  } catch (err) {
    console.warn('[chat-messages GET] unhandled:', err);
    return NextResponse.json({ messages: [], expires_at: null });
  }
}

/**
 * POST — persist a batch of new messages for the given session_token.
 *
 * The body shape mirrors the localStorage save loop in ChatWindow,
 * so the route is reusable from anywhere that holds an in-memory
 * conversation (chat widget, future voice-mode widget, etc.).
 *
 * Inserts run as a single batch via the Supabase JS client.
 * Service-role bypasses RLS so the anon INSERT policy text is
 * effectively gated to this route.
 */
export async function POST(request: NextRequest) {
  const ip = extractClientIp(request);
  const rl = checkPublicRateLimit({
    action: 'public-chat-messages',
    request,
    maxPerIp: 30,
    maxGlobal: 600,
    windowMs: FIFTEEN_MIN_MS,
  });
  if (rl.blocked) {
    return NextResponse.json(
      { error: 'Too many requests.', retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: { session_token?: string; messages?: Array<{ role: string; content: string }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const sessionToken = (body.session_token || '').trim();
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!sessionToken) {
    return NextResponse.json({ error: 'session_token required' }, { status: 400 });
  }
  if (sessionToken.length > 64) {
    return NextResponse.json({ error: 'session_token too long' }, { status: 400 });
  }
  if (messages.length === 0) {
    return NextResponse.json({ ok: true, inserted: 0 });
  }
  if (messages.length > 200) {
    return NextResponse.json({ error: 'max 200 messages per request' }, { status: 400 });
  }

  // Validate shape
  for (const m of messages) {
    if (!m || typeof m.content !== 'string' || m.content.length === 0) {
      return NextResponse.json({ error: 'each message needs non-empty content' }, { status: 400 });
    }
    if (m.role !== 'user' && m.role !== 'assistant' && m.role !== 'system') {
      return NextResponse.json({ error: `invalid role: ${m.role}` }, { status: 400 });
    }
    if (m.content.length > 16_000) {
      return NextResponse.json({ error: 'message too long (>16k chars)' }, { status: 400 });
    }
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const rows = messages.map((m) => ({
    session_token: sessionToken,
    role: m.role,
    content: m.content,
  }));

  try {
    const { error } = await supabase.from('chat_history').insert(rows);
    if (error) {
      console.warn('[chat-messages POST] supabase error:', error.message);
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, inserted: rows.length });
  } catch (err) {
    console.warn('[chat-messages POST] unhandled:', err);
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }
}

// Side-channel: surface the rate-limit IP for debugging if needed.
export const config = {
  api: {
    bodyParser: { sizeLimit: '1mb' },
  },
};
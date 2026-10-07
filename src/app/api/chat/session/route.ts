import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import { checkPublicRateLimit } from '@/lib/rate-limit';
import {
  buildChatCookieValue,
  CHAT_SESSION_COOKIE,
  generateSessionToken,
  isHighEntropyClientToken,
  readChatSessionCookie,
  verifyChatCookieValue,
} from '@/lib/chat-session';

export const dynamic = 'force-dynamic';

const ONE_HOUR_MS = 60 * 60 * 1000;
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30d — long enough for return visits

/** Public fields of a chat_sessions row that POST/PATCH return to
 *  the caller. Sensitive internal fields (lead_id, first_message,
 *  last_message) are deliberately NOT included so a guessed low-
 *  entropy token never leaked them in the first place. */
const PUBLIC_SESSION_COLUMNS =
  'id, session_token, message_count, started_at, last_seen_at';

/**
 * POST /api/chat/session
 *
 * Creates (or refreshes) a chat_sessions row for a visitor.
 *
 *   - If `session_token` is a high-entropy base64url string (38+
 *     chars), we look up the matching row. If it exists, we update
 *     `last_seen_at` + attribution and return the public fields.
 *   - If `session_token` is missing OR fails the entropy floor, we
 *     issue a fresh 32-byte base64url token, insert a new row, and
 *     return the new token in the body + as an HttpOnly cookie.
 *
 * The HttpOnly + SameSite=Lax cookie (`sica_chat_session`) binds
 * the session_id with an HMAC so the same browser can resume via
 * cookie even without the body token.
 *
 * Body: { session_token?, source_page?, referrer?, user_agent?, locale? }
 * Returns: { session: { id, session_token, message_count, started_at, last_seen_at } }
 */
export async function POST(request: NextRequest) {
  // Track 1.1: rate limit — anonymous session upserts.
  const rl = checkPublicRateLimit({
    action: 'public-chat-session',
    request,
    maxPerIp: 30,
    maxGlobal: 600,
    windowMs: ONE_HOUR_MS,
  });
  if (rl.blocked) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.', retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const rawToken = typeof body.session_token === 'string' ? body.session_token.trim() : '';
  // Either: (a) the client sent a high-entropy token, we look it
  // up; or (b) the client sent nothing (or low-entropy), we mint a
  // new one. We never store a low-entropy client-supplied value —
  // that was the leak surface in the previous design.
  const providedHighEntropy = rawToken.length > 0 && isHighEntropyClientToken(rawToken);

  if (rawToken.length > 0 && !providedHighEntropy) {
    return NextResponse.json(
      {
        error:
          'session_token must be a server-issued high-entropy token (≥38 chars, base64url). Re-issue via this endpoint with no token to receive one.',
      },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let sessionToken = rawToken;
  let session: { id: string; session_token: string; message_count: number; started_at: string; last_seen_at: string } | null = null;

  if (providedHighEntropy) {
    // Try to find the existing row. If found, refresh attribution
    // and last_seen_at. If not found (a brand-new high-entropy
    // token), create one. We do NOT leak any other visitor's
    // fields: SELECT uses PUBLIC_SESSION_COLUMNS so lead_id etc.
    // never come back.
    const { data: existing, error: lookupErr } = await supabase
      .from('chat_sessions')
      .select(PUBLIC_SESSION_COLUMNS)
      .eq('session_token', rawToken)
      .maybeSingle();
    if (lookupErr) {
      console.error('[POST /api/chat/session] lookup failed:', lookupErr);
      return NextResponse.json(
        { error: lookupErr.message ?? 'Session lookup failed' },
        { status: 500 },
      );
    }
    if (existing) {
      const { data: updated, error: updateErr } = await supabase
        .from('chat_sessions')
        .update({
          source_page: (body.source_page as string | undefined) ?? null,
          referrer: request.headers.get('referer') ?? null,
          user_agent: request.headers.get('user-agent') ?? null,
          locale: (body.locale as string | undefined) ?? null,
          last_seen_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select(PUBLIC_SESSION_COLUMNS)
        .single();
      if (updateErr || !updated) {
        console.error('[POST /api/chat/session] update failed:', updateErr);
        return NextResponse.json(
          { error: updateErr?.message ?? 'Failed to refresh session' },
          { status: 500 },
        );
      }
      session = updated;
    }
  }

  if (!session) {
    // Mint a server token and create the row. The token is the
    // ONLY thing the client needs going forward (plus the cookie).
    sessionToken = generateSessionToken();
    const { data: created, error: insertErr } = await supabase
      .from('chat_sessions')
      .insert({
        session_token: sessionToken,
        source_page: (body.source_page as string | undefined) ?? null,
        referrer: request.headers.get('referer') ?? null,
        user_agent: request.headers.get('user-agent') ?? null,
        locale: (body.locale as string | undefined) ?? null,
        last_seen_at: new Date().toISOString(),
        message_count: 0,
        first_message: null,
        last_message: null,
        lead_id: null,
      })
      .select(PUBLIC_SESSION_COLUMNS)
      .single();
    if (insertErr || !created) {
      console.error('[POST /api/chat/session] insert failed:', insertErr);
      return NextResponse.json(
        { error: insertErr?.message ?? 'Failed to create session' },
        { status: 500 },
      );
    }
    session = created;
  }

  // Bind the session_id to a signed cookie so PATCH can authenticate
  // without depending on the body token alone.
  const cookieValue = buildChatCookieValue(session.id);
  const response = NextResponse.json({ session });
  response.cookies.set({
    name: CHAT_SESSION_COOKIE,
    value: cookieValue,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: '/',
  });
  return response;
}

/**
 * PATCH /api/chat/session
 *
 * Appends messages to a chat session the caller owns. The caller
 * authenticates via EITHER:
 *   (a) the body `session_token` matching the high-entropy floor,
 *       and that token maps to a chat_sessions row, OR
 *   (b) the `sica_chat_session` signed cookie whose payload
 *       session_id exists in chat_sessions.
 *
 * Body: { session_token?, messages: [{ role, content, provider?, is_fallback?, client_sent_at? }] }
 *
 * The API only accepts appends. Sensitive fields are NOT returned
 * (no transcript echoes, no lead_id).
 */
export async function PATCH(request: NextRequest) {
  // Track 1.1: rate limit — generous, the client appends transcript
  // messages after every send, but not unbounded.
  const rl = checkPublicRateLimit({
    action: 'public-chat-session-append',
    request,
    maxPerIp: 240,
    maxGlobal: 2000,
    windowMs: ONE_HOUR_MS,
  });
  if (rl.blocked) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.', retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const incomingMessages = body.messages as
    | Array<{
        role: string;
        content: string;
        provider?: string;
        is_fallback?: boolean;
        client_sent_at?: string;
      }>
    | undefined;

  if (!Array.isArray(incomingMessages) || incomingMessages.length === 0) {
    return NextResponse.json({ error: 'messages[] is required' }, { status: 400 });
  }

  // Auth: either the cookie or a high-entropy body token.
  const cookieHeader = request.headers.get('cookie');
  const cookieValue = readChatSessionCookie(cookieHeader);
  const cookieSessionId = verifyChatCookieValue(cookieValue);

  const rawToken = typeof body.session_token === 'string' ? body.session_token.trim() : '';
  const hasToken = rawToken.length > 0 && isHighEntropyClientToken(rawToken);
  if (rawToken.length > 0 && !hasToken) {
    return NextResponse.json(
      {
        error:
          'session_token must be a server-issued high-entropy token (≥38 chars, base64url) when supplied',
      },
      { status: 400 },
    );
  }
  if (!cookieSessionId && !hasToken) {
    // No cookie AND no (or low-entropy) token. Reject — the cookie
    // is set automatically by POST so a normal client always has it.
    return NextResponse.json(
      { error: 'Authentication required: provide a session_token or the sica_chat_session cookie' },
      { status: 401 },
    );
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Resolve the row. Prefer the cookie path; if the cookie is
  // missing, fall back to the high-entropy body token lookup.
  let sessionId: string | null = null;
  let messageCount = 0;

  if (cookieSessionId) {
    const { data: byCookieRow, error: lookupErr } = await supabase
      .from('chat_sessions')
      .select('id, message_count')
      .eq('id', cookieSessionId)
      .maybeSingle();
    if (lookupErr) {
      console.error('[PATCH /api/chat/session] cookie lookup failed:', lookupErr);
      return NextResponse.json(
        { error: lookupErr.message ?? 'Session lookup failed' },
        { status: 500 },
      );
    }
    if (byCookieRow) {
      sessionId = byCookieRow.id;
      messageCount = byCookieRow.message_count ?? 0;
    }
  }

  if (!sessionId && hasToken) {
    const { data: byToken, error: lookupErr } = await supabase
      .from('chat_sessions')
      .select('id, message_count')
      .eq('session_token', rawToken)
      .maybeSingle();
    if (lookupErr) {
      console.error('[PATCH /api/chat/session] token lookup failed:', lookupErr);
      return NextResponse.json(
        { error: lookupErr.message ?? 'Session lookup failed' },
        { status: 500 },
      );
    }
    if (byToken) {
      sessionId = byToken.id;
      messageCount = byToken.message_count ?? 0;
    }
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Only append messages beyond what we already have (idempotent
  // client retries).
  const newMessages = incomingMessages.slice(messageCount);
  if (newMessages.length === 0) {
    return NextResponse.json({ session_id: sessionId, inserted: 0 });
  }

  const rows = newMessages
    .filter((m) => m.role === 'user' || m.role === 'assistant' || m.role === 'system')
    .map((m) => ({
      session_id: sessionId,
      role: m.role,
      content: m.content,
      provider: m.provider ?? null,
      is_fallback: m.is_fallback ?? false,
      client_sent_at: m.client_sent_at ?? null,
    }));

  if (rows.length === 0) {
    return NextResponse.json({ session_id: sessionId, inserted: 0 });
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('chat_messages')
    .insert(rows)
    .select('id, role, content, created_at');

  if (insertErr) {
    console.error('[PATCH /api/chat/session] message insert failed:', insertErr);
    return NextResponse.json(
      { error: insertErr.message ?? 'Failed to insert messages' },
      { status: 500 },
    );
  }

  // Rollup update: we still update first_message / last_message
  // internally so admin / lead-capture views can use them, but the
  // API does NOT return them.
  const firstUser = incomingMessages.find((m) => m.role === 'user');
  const lastAny = incomingMessages[incomingMessages.length - 1];
  await supabase
    .from('chat_sessions')
    .update({
      first_message: firstUser?.content?.slice(0, 200) ?? null,
      last_message: lastAny?.content?.slice(0, 200) ?? null,
      message_count: messageCount + rows.length,
      last_seen_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  return NextResponse.json({
    session_id: sessionId,
    inserted: inserted?.length ?? 0,
  });
}
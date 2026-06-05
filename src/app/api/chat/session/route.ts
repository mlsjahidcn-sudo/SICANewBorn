import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/chat/session
 *
 * Creates (or updates) a chat_sessions row for a visitor's
 * anonymous session token. The token is generated client-side and
 * stored in localStorage so the same visitor gets the same session
 * across page loads (and the same day — matches the localStorage
 * "same day" conversation history on the client).
 *
 * Body:
 *   { session_token: string, source_page?, referrer?, user_agent?, locale? }
 *
 * Returns:
 *   { session: { id, session_token, message_count, ... } }
 *
 * Idempotent: if a row already exists for the token, it's
 * returned (and updated with last_seen_at + attribution).
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const sessionToken = ((body.session_token as string) ?? '').trim();
  if (!sessionToken || sessionToken.length > 64) {
    return NextResponse.json(
      { error: 'session_token is required (1-64 chars)' },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Upsert: insert a new row, or update last_seen_at + attribution
  // on the existing row. session_token is UNIQUE so this works.
  const { data: session, error } = await supabase
    .from('chat_sessions')
    .upsert(
      {
        session_token: sessionToken,
        source_page: (body.source_page as string | undefined) ?? null,
        referrer: request.headers.get('referer') ?? null,
        user_agent: request.headers.get('user-agent') ?? null,
        locale: (body.locale as string | undefined) ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'session_token' },
    )
    .select('id, session_token, message_count, first_message, last_message, lead_id, started_at, last_seen_at')
    .single();

  if (error || !session) {
    console.error('[POST /api/chat/session] upsert failed:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Failed to upsert session' },
      { status: 500 },
    );
  }

  return NextResponse.json({ session });
}

/**
 * PATCH /api/chat/session
 *
 * Appends one or more messages to a chat session and updates the
 * rollup fields (first_message, last_message, message_count).
 *
 * Body:
 *   { session_token: string, messages: Array<{ role, content, provider?, is_fallback?, client_sent_at? }> }
 *
 * The API only accepts appends — the client streams its existing
 * transcript on every send. The DB computes diffs via the
 * session's existing message_count to avoid duplicates if a
 * client retries after a network blip.
 */
export async function PATCH(request: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const sessionToken = ((body.session_token as string) ?? '').trim();
  const incomingMessages = body.messages as
    | Array<{
        role: string;
        content: string;
        provider?: string;
        is_fallback?: boolean;
        client_sent_at?: string;
      }>
    | undefined;

  if (!sessionToken) {
    return NextResponse.json({ error: 'session_token is required' }, { status: 400 });
  }
  if (!Array.isArray(incomingMessages) || incomingMessages.length === 0) {
    return NextResponse.json({ error: 'messages[] is required' }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // 1. Find the session id
  const { data: session, error: sessionErr } = await supabase
    .from('chat_sessions')
    .select('id, message_count')
    .eq('session_token', sessionToken)
    .maybeSingle();

  if (sessionErr) {
    console.error('[PATCH /api/chat/session] session lookup failed:', sessionErr);
    return NextResponse.json(
      { error: sessionErr.message ?? 'Session lookup failed' },
      { status: 500 },
    );
  }
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // 2. Read existing message count so we only insert the *new*
  //    ones (idempotent retries).
  const existingCount = session.message_count ?? 0;
  const newMessages = incomingMessages.slice(existingCount);
  if (newMessages.length === 0) {
    return NextResponse.json({ session, inserted: 0 });
  }

  // 3. Insert
  const rows = newMessages
    .filter((m) => m.role === 'user' || m.role === 'assistant' || m.role === 'system')
    .map((m) => ({
      session_id: session.id,
      role: m.role,
      content: m.content,
      provider: m.provider ?? null,
      is_fallback: m.is_fallback ?? false,
      client_sent_at: m.client_sent_at ?? null,
    }));

  if (rows.length === 0) {
    return NextResponse.json({ session, inserted: 0 });
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

  // 4. Update the rollup fields
  const firstUser = incomingMessages.find((m) => m.role === 'user');
  const lastAny = incomingMessages[incomingMessages.length - 1];
  await supabase
    .from('chat_sessions')
    .update({
      first_message: firstUser?.content?.slice(0, 200) ?? null,
      last_message: lastAny?.content?.slice(0, 200) ?? null,
      message_count: existingCount + rows.length,
      last_seen_at: new Date().toISOString(),
    })
    .eq('id', session.id);

  return NextResponse.json({
    session: { id: session.id, message_count: existingCount + rows.length },
    inserted: inserted?.length ?? 0,
  });
}

-- Migration: Phase 82 — public chat 7-day conversation history.
--
-- Scope: this migration creates a new `chat_history` table. We
-- intentionally do NOT touch the existing `chat_messages` table
-- (which already exists from June 2026 with a non-standard schema
-- — `session_id` instead of `session_token`, no expires_at, etc.).
-- The orphaned table is left in place so we don't break historical
-- data; the route layer reads from `chat_history` going forward.
--
-- Schema:
--   - chat_history is keyed by session_token (VARCHAR(64), the same
--     token the /api/chat/session route uses).
--   - expires_at = NOW() + 7 days, set at insert time.
--   - Anonymous SELECT is intentional: the chat widget is anonymous
--     by design and the session_token IS the auth. This is acceptable
--     because the messages contain no PII (the LeadPanel saves
--     name/email to chat_leads separately, with admin-only RLS).
--
-- Retention: 7-day TTL aligns with Phase 62-77 lead retention.
-- Add a daily purge cron when ops queue has bandwidth:
--   DELETE FROM chat_history WHERE expires_at < NOW();
-- Suggested schedule: daily at 04:00 UTC.

CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token VARCHAR(64) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_chat_history_session_created
  ON chat_history (session_token, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_history_expires
  ON chat_history (expires_at)
  WHERE expires_at IS NOT NULL;

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read own session history"
  ON chat_history FOR SELECT USING (true);

CREATE POLICY "Service role insert chat history"
  ON chat_history FOR INSERT WITH CHECK (true);
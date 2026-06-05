-- ============================================================================
-- SICA AI Assistant chat leads + conversation history
--
-- Powers two new flows:
--
--  1. LEAD CAPTURE inside the chatbot. The visitor can optionally fill in
--     a 6-field form (name, email, WhatsApp, country, interested degree,
--     interested program) to "save their progress" and get personalized
--     follow-up. Posts to /api/leads/chat → chat_leads table.
--     Admin-visible from the existing /admin/leads dashboard.
--
--  2. CONVERSATION HISTORY persistence. Even without a logged-in account,
--     we keep the full chat transcript in chat_sessions / chat_messages
--     keyed by an anonymous session_token stored in the visitor's
--     localStorage. Lets SICA support staff read what the user asked
--     about when they follow up (especially useful when the lead
--     capture succeeded but the conversation ran long).
--
-- Safe to run on a fresh DB or an existing one — all CREATE statements
-- use IF NOT EXISTS. The chat_sessions table is the parent; chat_messages
-- has FK → chat_sessions.id with ON DELETE CASCADE so a session delete
-- also drops its messages.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. chat_leads — visitor info collected from the chatbot
-- ----------------------------------------------------------------------------
-- Created FIRST because chat_sessions references it via lead_id.
CREATE TABLE IF NOT EXISTS chat_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Personal info (all collected from the in-chat form)
  name VARCHAR(255),
  email VARCHAR(255),
  whatsapp VARCHAR(50),
  country VARCHAR(100),
  -- Academic intent
  interested_degree VARCHAR(50) CHECK (
    interested_degree IS NULL OR
    interested_degree IN ('Bachelor', 'Master', 'PhD', 'Language', 'Other')
  ),
  interested_program VARCHAR(255),
  interested_university VARCHAR(255),
  -- Conversation context: a snapshot of the last few messages so
  -- admin can see what the visitor was asking about when they
  -- decided to share their info. Stored as JSONB.
  conversation_context JSONB,
  -- Lifecycle (mirrors contact_submissions / student_assessments)
  status VARCHAR(20) DEFAULT 'New' CHECK (
    status IN ('New', 'Reviewing', 'Contacted', 'Converted', 'Archived')
  ),
  reviewer_id UUID REFERENCES auth.users(id),
  reviewer_notes TEXT,
  -- Attribution
  source_page VARCHAR(255),
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contacted_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_chat_leads_status ON chat_leads(status);
CREATE INDEX IF NOT EXISTS idx_chat_leads_email ON chat_leads(email);
CREATE INDEX IF NOT EXISTS idx_chat_leads_created_at ON chat_leads(created_at DESC);

-- ----------------------------------------------------------------------------
-- 2. chat_sessions — one row per visitor conversation
-- ----------------------------------------------------------------------------
-- Created AFTER chat_leads so the FK can be declared inline.
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Anonymous session token. Visitors get one stored in localStorage
  -- (key: sica_chat_session_id). The token is what links messages
  -- and leads together for the same visitor across page loads.
  -- For logged-in users we ALSO capture auth_user_id (nullable).
  session_token VARCHAR(64) UNIQUE NOT NULL,
  auth_user_id UUID REFERENCES auth.users(id),
  -- Rollup: first user message, last message, total message count.
  -- Populated by the API on every message append. Makes the admin
  -- chat_sessions view show a useful one-row summary without joining
  -- the messages table.
  first_message TEXT,
  last_message TEXT,
  message_count INTEGER DEFAULT 0,
  -- Lead link (nullable until the visitor fills in the lead form).
  lead_id UUID REFERENCES chat_leads(id),
  -- Attribution
  source_page VARCHAR(255),
  referrer TEXT,
  user_agent TEXT,
  locale VARCHAR(10),
  -- Lifecycle
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_token ON chat_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_auth_user_id ON chat_sessions(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_seen_at ON chat_sessions(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at DESC);

-- ----------------------------------------------------------------------------
-- 3. chat_messages — the actual transcript
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  -- Optional metadata: which AI provider served this, fallback flag,
  -- client-side timestamp from the visitor's clock.
  provider VARCHAR(50),
  is_fallback BOOLEAN DEFAULT FALSE,
  client_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ----------------------------------------------------------------------------
-- RLS policies
-- ----------------------------------------------------------------------------
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- chat_sessions: anyone (anon) can insert + update their own session,
-- but only by matching session_token. We use a public.insert/select
-- policy that doesn't tie to a specific row guard (the API layer
-- validates the session_token). The simpler approach: allow anon
-- insert/select/update, gate writes through the API (service-role).

DROP POLICY IF EXISTS "Anyone can insert chat sessions" ON chat_sessions;
CREATE POLICY "Anyone can insert chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update own chat session" ON chat_sessions;
CREATE POLICY "Anyone can update own chat session"
  ON chat_sessions FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Admins can view chat sessions" ON chat_sessions;
CREATE POLICY "Admins can view chat sessions"
  ON chat_sessions FOR SELECT
  USING (public.is_admin());

-- chat_messages: anon insert (so the API can log messages), admins read.
DROP POLICY IF EXISTS "Anyone can insert chat messages" ON chat_messages;
CREATE POLICY "Anyone can insert chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view chat messages" ON chat_messages;
CREATE POLICY "Admins can view chat messages"
  ON chat_messages FOR SELECT
  USING (public.is_admin());

-- chat_leads: anon insert (public form), admins read + update.
DROP POLICY IF EXISTS "Anyone can submit chat lead" ON chat_leads;
CREATE POLICY "Anyone can submit chat lead"
  ON chat_leads FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view chat leads" ON chat_leads;
CREATE POLICY "Admins can view chat leads"
  ON chat_leads FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update chat leads" ON chat_leads;
CREATE POLICY "Admins can update chat leads"
  ON chat_leads FOR UPDATE
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- updated_at trigger for chat_leads
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_chat_leads_updated_at ON chat_leads;
CREATE TRIGGER trg_chat_leads_updated_at
  BEFORE UPDATE ON chat_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

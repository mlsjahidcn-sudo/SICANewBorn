-- Email drip sequence for new leads.
--
-- When a high-intent lead is captured (assessment form, contact
-- form), we schedule a 4-step drip sequence (welcome, day 1, day
-- 3, day 7). The background scheduler (or /api/email/drip-cron
-- endpoint) picks up pending rows and sends them via Resend.
--
-- Tracking per (source, step) lets us:
--   - Resume after a server restart
--   - Show send status to admins
--   - Support unsubscribe by marking all future steps for a lead
--     as 'skipped_unsubscribed' in one UPDATE
--   - Retry on transient Resend failures

CREATE TABLE IF NOT EXISTS email_drips (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_kind           TEXT NOT NULL,             -- 'assessment' | 'contact'
  source_id             UUID NOT NULL,
  recipient_email       TEXT NOT NULL,
  recipient_first_name  TEXT,
  recipient_country     TEXT,
  recipient_field       TEXT,                      -- intended major or subject
  step_key              TEXT NOT NULL,             -- 'welcome' | 'day1' | 'day3' | 'day7'
  step_index            INT NOT NULL,              -- 0, 1, 2, 3
  scheduled_at          TIMESTAMPTZ NOT NULL,
  sent_at               TIMESTAMPTZ,
  status                TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'sent' | 'failed' | 'skipped_unsubscribed'
  resend_message_id     TEXT,
  error                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_kind, source_id, step_index)
);

-- Hot index for the cron: find pending drips due right now.
-- Partial index keeps it small (only pending rows are scanned).
CREATE INDEX IF NOT EXISTS email_drips_pending_idx
  ON email_drips(scheduled_at)
  WHERE status = 'pending';

-- Lookup by source (used when an admin views a lead's email history).
CREATE INDEX IF NOT EXISTS email_drips_source_idx
  ON email_drips(source_kind, source_id);

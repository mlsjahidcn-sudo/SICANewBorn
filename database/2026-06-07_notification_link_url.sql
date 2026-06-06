-- ============================================================================
-- S42 Phase 1.2: add link_url to student_notifications and
-- partner_notifications so the inbox can deep-link to the
-- relevant application/document/etc.
--
-- Both notification tables had no link column before, so the
-- inbox was a dead end after marking read. Phase 1.2 adds
-- nullable link_url (text — URLs can be relative or absolute).
-- ============================================================================

ALTER TABLE student_notifications
  ADD COLUMN IF NOT EXISTS link_url TEXT;

ALTER TABLE partner_notifications
  ADD COLUMN IF NOT EXISTS link_url TEXT;

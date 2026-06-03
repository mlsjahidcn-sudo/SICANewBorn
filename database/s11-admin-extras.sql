-- s11-admin-extras.sql
-- SICA Sprint 11: completes the admin module surface.
--
-- Three additions:
--   1. `student_notes` — internal admin notes per student (the Notes
--      tab in /admin/students/[id]). One row = one note. Notes have
--      an `author_id` so we know which admin wrote it. Cascade delete
--      when the student is removed.
--   2. `student_fees` — replaces mockAdminFees. The fee lifecycle is:
--      Pending → Partial → Paid (or Overdue if past due_date). Cascade
--      on student delete so we never leave orphan fee rows.
--   3. Indexes for the list-page filters we use most.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. student_notes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name VARCHAR(255),
  body TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_notes_student
  ON student_notes (student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_notes_pinned
  ON student_notes (student_id, is_pinned, created_at DESC)
  WHERE is_pinned = true;

-- updated_at trigger (reuses the one from s9 if present)
DROP TRIGGER IF EXISTS trg_student_notes_updated_at ON student_notes;
CREATE TRIGGER trg_student_notes_updated_at
  BEFORE UPDATE ON student_notes
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. student_fees
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES student_applications(id) ON DELETE SET NULL,
  fee_type VARCHAR(50) NOT NULL,  -- 'Application' | 'Tuition' | 'Service' | 'Visa' | 'Other'
  description TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  due_date DATE,
  paid_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Partial', 'Paid', 'Overdue', 'Cancelled')),
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_fees_student
  ON student_fees (student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_fees_status
  ON student_fees (status)
  WHERE status IN ('Pending', 'Partial', 'Overdue');

CREATE INDEX IF NOT EXISTS idx_student_fees_due
  ON student_fees (due_date)
  WHERE status IN ('Pending', 'Partial');

DROP TRIGGER IF EXISTS trg_student_fees_updated_at ON student_fees;
CREATE TRIGGER trg_student_fees_updated_at
  BEFORE UPDATE ON student_fees
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. RLS (admin reads via service-role, so RLS doesn't block us; this
--    is here so the future student-side portal can read its own notes
--    + fees without going through the admin API)
-- ---------------------------------------------------------------------------
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_fees ENABLE ROW LEVEL SECURITY;

-- Students can read their own notes (admins go through service-role)
DROP POLICY IF EXISTS student_notes_self_select ON student_notes;
CREATE POLICY student_notes_self_select ON student_notes
  FOR SELECT USING (student_id = auth.uid());

-- Students can read their own fees
DROP POLICY IF EXISTS student_fees_self_select ON student_fees;
CREATE POLICY student_fees_self_select ON student_fees
  FOR SELECT USING (student_id = auth.uid());

COMMIT;

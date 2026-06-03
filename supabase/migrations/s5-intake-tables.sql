-- S5: Public intake tables (contact + assessment + partner application)
-- All open to INSERT for unauthenticated users (public web forms);
-- only admins can SELECT. Rate-limiting happens via Next.js + reverse proxy.

-- ============================================
-- 1. Contact Submissions (from /contact form)
-- ============================================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  -- UTM + referer for attribution
  source_page VARCHAR(255),
  referrer TEXT,
  user_agent TEXT,
  -- Lifecycle
  status VARCHAR(20) DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Resolved', 'Spam')),
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Public can INSERT (anyone can submit the contact form)
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- Only admins can SELECT
DROP POLICY IF EXISTS "Admins can view contact submissions" ON contact_submissions;
CREATE POLICY "Admins can view contact submissions"
  ON contact_submissions FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update contact submissions" ON contact_submissions;
CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  USING (public.is_admin());

DROP TRIGGER IF EXISTS trg_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER trg_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. Student Assessment Submissions (from /assessment form)
-- ============================================
CREATE TABLE IF NOT EXISTS student_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Personal info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  country VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  -- Academic info
  current_education VARCHAR(100),
  intended_major VARCHAR(255),
  target_universities TEXT,
  -- Transcript file metadata (file itself stored in Supabase Storage when bucket exists)
  transcript_file_name VARCHAR(255),
  transcript_file_size BIGINT,
  transcript_file_type VARCHAR(100),
  has_transcript BOOLEAN DEFAULT FALSE,
  -- Free-form
  notes TEXT,
  -- Lifecycle
  status VARCHAR(20) DEFAULT 'New' CHECK (status IN ('New', 'Reviewing', 'Completed', 'Rejected')),
  reviewer_id UUID REFERENCES auth.users(id),
  reviewer_notes TEXT,
  -- Attribution
  source_page VARCHAR(255),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_student_assessments_status ON student_assessments(status);
CREATE INDEX IF NOT EXISTS idx_student_assessments_created_at ON student_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_assessments_email ON student_assessments(email);

ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit assessment" ON student_assessments;
CREATE POLICY "Anyone can submit assessment"
  ON student_assessments FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view assessments" ON student_assessments;
CREATE POLICY "Admins can view assessments"
  ON student_assessments FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update assessments" ON student_assessments;
CREATE POLICY "Admins can update assessments"
  ON student_assessments FOR UPDATE
  USING (public.is_admin());

DROP TRIGGER IF EXISTS trg_student_assessments_updated_at ON student_assessments;
CREATE TRIGGER trg_student_assessments_updated_at
  BEFORE UPDATE ON student_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

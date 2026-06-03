-- ============================================
-- SICA Student Portal Database Tables
-- ============================================
-- This file contains all database tables needed for the Student Portal
-- Run these in your Supabase SQL Editor

-- ============================================
-- 1. Student Profiles Table
-- ============================================
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  nationality VARCHAR(100),
  date_of_birth DATE,
  passport_number VARCHAR(100),
  passport_expiry DATE,
  current_address TEXT,
  permanent_address TEXT,
  highest_education VARCHAR(100),
  school_name VARCHAR(255),
  graduation_year VARCHAR(10),
  gpa VARCHAR(20),
  english_proficiency VARCHAR(50),
  english_score VARCHAR(50),
  target_degree VARCHAR(50),
  target_field VARCHAR(255),
  target_intake VARCHAR(100),
  preferred_universities TEXT[],
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for student_profiles
CREATE INDEX IF NOT EXISTS idx_student_profiles_status ON student_profiles(status);
CREATE INDEX IF NOT EXISTS idx_student_profiles_nationality ON student_profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_student_profiles_target_degree ON student_profiles(target_degree);

-- Enable Row Level Security
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_profiles
CREATE POLICY "Students can view their own profile"
  ON student_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Students can update their own profile"
  ON student_profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all student profiles"
  ON student_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.user_id = auth.uid() 
      AND admin_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all student profiles"
  ON student_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.user_id = auth.uid() 
      AND admin_profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- 2. Student Applications Table
-- ============================================
CREATE TABLE IF NOT EXISTS student_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  slug VARCHAR(255) UNIQUE,
  application_number VARCHAR(50) UNIQUE,
  university_id VARCHAR(255) NOT NULL,
  university_name VARCHAR(255) NOT NULL,
  university_name_cn VARCHAR(255),
  program_id VARCHAR(255),
  program_name VARCHAR(255) NOT NULL,
  program_name_cn VARCHAR(255),
  degree VARCHAR(50) NOT NULL,
  degree_level VARCHAR(50),
  intake VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'Draft',
  priority VARCHAR(20) DEFAULT 'Medium',
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  decision_date TIMESTAMP WITH TIME ZONE,
  decision VARCHAR(50),
  decision_letter_url TEXT,
  student_notes TEXT,
  personal_statement TEXT,
  additional_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for student_applications
CREATE INDEX IF NOT EXISTS idx_student_applications_student_id ON student_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_student_applications_university_id ON student_applications(university_id);
CREATE INDEX IF NOT EXISTS idx_student_applications_status ON student_applications(status);
CREATE INDEX IF NOT EXISTS idx_student_applications_application_number ON student_applications(application_number);
CREATE INDEX IF NOT EXISTS idx_student_applications_created_at ON student_applications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE student_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_applications
CREATE POLICY "Students can view their own applications"
  ON student_applications
  FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can create their own applications"
  ON student_applications
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own applications"
  ON student_applications
  FOR UPDATE
  USING (student_id = auth.uid());

CREATE POLICY "Admins can view all applications"
  ON student_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.user_id = auth.uid() 
      AND admin_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all applications"
  ON student_applications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.user_id = auth.uid() 
      AND admin_profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- 3. Student Documents Table
-- ============================================
CREATE TABLE IF NOT EXISTS student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES student_applications(id) ON DELETE SET NULL,
  document_type_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_cn VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(100),
  file_size BIGINT,
  status VARCHAR(20) DEFAULT 'Pending',
  notes TEXT,
  rejection_reason TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id)
);

-- Indexes for student_documents
CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON student_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_application_id ON student_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_category ON student_documents(category);
CREATE INDEX IF NOT EXISTS idx_student_documents_status ON student_documents(status);
CREATE INDEX IF NOT EXISTS idx_student_documents_uploaded_at ON student_documents(uploaded_at DESC);

-- Enable Row Level Security
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_documents
CREATE POLICY "Students can view their own documents"
  ON student_documents
  FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can upload their own documents"
  ON student_documents
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own documents"
  ON student_documents
  FOR UPDATE
  USING (student_id = auth.uid());

CREATE POLICY "Students can delete their own documents"
  ON student_documents
  FOR DELETE
  USING (student_id = auth.uid());

CREATE POLICY "Admins can view all documents"
  ON student_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.user_id = auth.uid() 
      AND admin_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all documents"
  ON student_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.user_id = auth.uid() 
      AND admin_profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- 4. Application Timeline/History Table
-- ============================================
CREATE TABLE IF NOT EXISTS application_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES student_applications(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for application_timeline
CREATE INDEX IF NOT EXISTS idx_application_timeline_application_id ON application_timeline(application_id);
CREATE INDEX IF NOT EXISTS idx_application_timeline_created_at ON application_timeline(created_at DESC);

-- Enable Row Level Security
ALTER TABLE application_timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies for application_timeline
CREATE POLICY "Students can view timeline for their applications"
  ON application_timeline
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_applications 
      WHERE student_applications.id = application_timeline.application_id 
      AND student_applications.student_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view and manage all timeline entries"
  ON application_timeline
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.user_id = auth.uid() 
      AND admin_profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- 5. Student Notifications Table
-- ============================================
CREATE TABLE IF NOT EXISTS student_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for student_notifications
CREATE INDEX IF NOT EXISTS idx_student_notifications_student_id ON student_notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_student_notifications_is_read ON student_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_student_notifications_created_at ON student_notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE student_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_notifications
CREATE POLICY "Students can view their own notifications"
  ON student_notifications
  FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can update their own notifications"
  ON student_notifications
  FOR UPDATE
  USING (student_id = auth.uid());

CREATE POLICY "Admins can create notifications for students"
  ON student_notifications
  FOR INSERT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.user_id = auth.uid() 
      AND admin_profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- 6. Auto-updated timestamps triggers
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for student_profiles
DROP TRIGGER IF EXISTS update_student_profiles_updated_at ON student_profiles;
CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for student_applications
DROP TRIGGER IF EXISTS update_student_applications_updated_at ON student_applications;
CREATE TRIGGER update_student_applications_updated_at
  BEFORE UPDATE ON student_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. Function to generate application number
-- ============================================
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS VARCHAR AS $$
DECLARE
  year_part VARCHAR;
  seq_part VARCHAR;
  app_number VARCHAR;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  seq_part := LPAD(NEXTVAL('application_number_seq')::TEXT, 4, '0');
  app_number := 'STU-APP-' || year_part || '-' || seq_part;
  RETURN app_number;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for application numbers
CREATE SEQUENCE IF NOT EXISTS application_number_seq START WITH 1;

-- ============================================
-- 8. Function to create student profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_student_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.student_profiles (id, first_name, last_name, email, status)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'firstName')::VARCHAR,
    (NEW.raw_user_meta_data->>'lastName')::VARCHAR,
    NEW.email,
    'Active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created_for_student ON auth.users;

-- Create trigger (only for students - you might want to add a role check)
-- Note: You might want to modify this to check user role metadata
CREATE TRIGGER on_auth_user_created_for_student
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_student_user();

-- ============================================
-- 9. Storage Bucket Setup (Run separately if needed)
-- ============================================
-- Note: Storage buckets need to be created through Supabase Dashboard or Storage API
-- The following is a reference for bucket configuration:
--
-- Bucket Name: student-documents
-- Public: false (private)
-- File Size Limit: 10MB
-- Allowed MIME Types: application/pdf, image/*
--
-- RLS Policies for storage:
-- - Students can upload to their own folder
-- - Students can read their own files
-- - Admins can read all files
--
-- ============================================

-- ============================================
-- Done! Student Portal Database Tables Created
-- ============================================

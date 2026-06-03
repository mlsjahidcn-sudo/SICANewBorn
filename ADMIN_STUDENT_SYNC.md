# Admin-Student Sync Implementation Plan

## Overview
This document outlines the plan to synchronize student applications between the Student Portal and Admin Portal.

## Current State

### Student Portal
- Students can create applications via `/student/applications/new`
- Applications are stored in mock data (student-data.ts)
- Dashboard shows stats and recent applications
- Status: Draft, Submitted, Under Review, Offer Received, Rejected

### Admin Portal
- Admin can view/manage applications via `/admin/applications`
- Applications are stored in separate mock data
- Status: Pending, In Review, Documents Needed, Approved, Rejected
- Source: Online, Admin, Partner

## Phase 1: Shared Database Schema

### Step 1: Create Unified Applications Table
```sql
-- Unified applications table for both student and admin
CREATE TABLE IF NOT EXISTS unified_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Student Info
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_phone TEXT,
  
  -- Application Details
  university_slug TEXT NOT NULL,
  university_name TEXT NOT NULL,
  program_name TEXT NOT NULL,
  degree TEXT NOT NULL, -- Bachelor, Master, PhD
  intake TEXT NOT NULL, -- e.g., "September 2025"
  
  -- Status
  status TEXT NOT NULL DEFAULT 'Draft',
  -- Student statuses: Draft, Submitted, Under Review, Offer Received, Rejected
  -- Admin statuses: Pending, In Review, Documents Needed, Approved, Rejected
  
  -- Source & Metadata
  source TEXT NOT NULL DEFAULT 'Online', -- Online, Admin, Partner
  admin_notes TEXT,
  student_notes TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE unified_applications ENABLE ROW LEVEL SECURITY;

-- Student policies: can view/edit their own applications
CREATE POLICY "Students can view own applications"
  ON unified_applications FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert own applications"
  ON unified_applications FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own draft applications"
  ON unified_applications FOR UPDATE
  USING (student_id = auth.uid() AND status = 'Draft');

-- Admin policies: can view/edit all applications
CREATE POLICY "Admins can view all applications"
  ON unified_applications FOR SELECT
  USING (auth.jwt() ->> 'email' LIKE '%@sica.com');

CREATE POLICY "Admins can update all applications"
  ON unified_applications FOR UPDATE
  USING (auth.jwt() ->> 'email' LIKE '%@sica.com');

-- Indexes for performance
CREATE INDEX idx_unified_apps_student_id ON unified_applications(student_id);
CREATE INDEX idx_unified_apps_status ON unified_applications(status);
CREATE INDEX idx_unified_apps_university ON unified_applications(university_slug);
CREATE INDEX idx_unified_apps_created ON unified_applications(created_at DESC);
```

### Step 2: Create Application Documents Table
```sql
-- Documents linked to applications
CREATE TABLE IF NOT EXISTS application_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES unified_applications(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  document_type TEXT NOT NULL, -- Passport, Transcript, etc.
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  
  status TEXT DEFAULT 'Pending', -- Pending, Verified, Rejected
  notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own documents"
  ON application_documents FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert own documents"
  ON application_documents FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can view all documents"
  ON application_documents FOR SELECT
  USING (auth.jwt() ->> 'email' LIKE '%@sica.com');

CREATE POLICY "Admins can update all documents"
  ON application_documents FOR UPDATE
  USING (auth.jwt() ->> 'email' LIKE '%@sica.com');

CREATE INDEX idx_app_docs_application ON application_documents(application_id);
CREATE INDEX idx_app_docs_student ON application_documents(student_id);
```

## Phase 2: API Endpoints

### Unified Applications API
Create `src/app/api/unified-applications/route.ts`:
```typescript
// GET: Get applications (student or admin)
// POST: Create new application (student)
// PUT: Update application status (admin or student)
```

### Application Status Sync
- **Student submits**: Draft → Submitted → visible to Admin as "Pending"
- **Admin reviews**: Pending → In Review → visible to Student as "Under Review"
- **Admin requests docs**: In Review → Documents Needed → visible to Student
- **Admin approves**: In Review → Approved → visible to Student as "Offer Received"
- **Admin rejects**: In Review → Rejected → visible to Student as "Rejected"

### Status Mapping
```typescript
const statusMapping = {
  // Student → Admin
  'Draft': 'Draft', // Not visible to admin
  'Submitted': 'Pending',
  'Under Review': 'In Review',
  'Offer Received': 'Approved',
  'Rejected': 'Rejected',
  
  // Admin → Student
  'Pending': 'Submitted',
  'In Review': 'Under Review',
  'Documents Needed': 'Under Review',
  'Approved': 'Offer Received',
  'Rejected': 'Rejected'
};
```

## Phase 3: Frontend Integration

### Update Student Portal
- Use unified API instead of mock data
- Show status from admin with proper mapping
- Display admin notes and document requests

### Update Admin Portal
- Use unified API instead of mock data
- Show student-submitted applications
- Allow status updates and document verification
- Show timeline of status changes

## Phase 4: Real-time Updates (Optional)

### Supabase Realtime
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE unified_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE application_documents;
```

Subscribe to changes in both portals for real-time updates.

## Implementation Checklist

- [ ] Create unified_applications table
- [ ] Create application_documents table
- [ ] Set up RLS policies
- [ ] Create unified API endpoints
- [ ] Update Student Portal to use unified API
- [ ] Update Admin Portal to use unified API
- [ ] Implement status mapping logic
- [ ] Add document upload/verification
- [ ] Test end-to-end flow
- [ ] Add realtime subscriptions (optional)

## Expected Timeline

- Phase 1 (Database): 1-2 hours
- Phase 2 (API): 2-3 hours
- Phase 3 (Frontend): 3-4 hours
- Phase 4 (Realtime): 1-2 hours (optional)

Total: 7-11 hours

## Next Steps

1. Run the SQL scripts in Supabase SQL Editor
2. Create the unified API endpoints
3. Update student portal first, then admin portal
4. Test the complete flow end-to-end

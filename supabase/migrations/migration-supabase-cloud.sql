-- ============================================
-- SICA Migration to Official Supabase Cloud
-- Generated: 2026-06-02
-- Project ref: wbzdwwvtbaftjxecgdxk
-- Source: Volcengine Supabase (br-pious-puma-f2f5c7e0)
-- ============================================

-- ============================================
-- 1. Universities
-- ============================================
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_cn VARCHAR(255),
  city VARCHAR(100),
  city_cn VARCHAR(100),
  ranking INT,
  rating NUMERIC(3,2),
  type VARCHAR(100),
  type_cn VARCHAR(100),
  established INT,
  students VARCHAR(50),
  intl_students VARCHAR(50),
  description TEXT,
  description_cn TEXT,
  popular_programs TEXT[],
  popular_programs_cn TEXT[],
  tuition_undergrad VARCHAR(100),
  tuition_graduate VARCHAR(100),
  intake VARCHAR(255),
  intake_cn VARCHAR(255),
  disciplines TEXT[],
  image TEXT,
  logo TEXT,
  qs_ranking VARCHAR(100),
  qs_world_ranking INT,
  highlights_en TEXT[],
  highlights_zh TEXT[],
  tags TEXT[],
  tags_cn TEXT[],
  accommodation TEXT,
  accommodation_cn TEXT,
  accommodation_cost VARCHAR(100),
  accommodation_cost_cn VARCHAR(100),
  accommodation_types TEXT[],
  accommodation_types_cn TEXT[],
  gallery TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_universities_slug ON universities(slug);
CREATE INDEX IF NOT EXISTS idx_universities_city ON universities(city);
CREATE INDEX IF NOT EXISTS idx_universities_ranking ON universities(ranking);
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Universities are publicly readable"
  ON universities FOR SELECT USING (true);

-- ============================================
-- 2. Programs
-- ============================================
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_cn VARCHAR(255),
  university_slug VARCHAR(255) NOT NULL,
  degree VARCHAR(50),
  discipline VARCHAR(100),
  discipline_cn VARCHAR(100),
  language VARCHAR(50),
  duration VARCHAR(50),
  duration_cn VARCHAR(50),
  tuition VARCHAR(100),
  description TEXT,
  description_cn TEXT,
  requirements TEXT[],
  requirements_cn TEXT[],
  curriculum TEXT[],
  curriculum_cn TEXT[],
  scholarship_available BOOLEAN DEFAULT FALSE,
  intake VARCHAR(100),
  intake_cn VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_programs_slug ON programs(slug);
CREATE INDEX IF NOT EXISTS idx_programs_university_slug ON programs(university_slug);
CREATE INDEX IF NOT EXISTS idx_programs_degree ON programs(degree);
CREATE INDEX IF NOT EXISTS idx_programs_discipline ON programs(discipline);
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Programs are publicly readable"
  ON programs FOR SELECT USING (true);

-- ============================================
-- 3. Scholarships
-- ============================================
CREATE TABLE IF NOT EXISTS scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_cn VARCHAR(255),
  type VARCHAR(50),
  degree_levels TEXT[],
  eligible_regions TEXT,
  duration VARCHAR(100),
  description TEXT,
  description_cn TEXT,
  coverage TEXT[],
  coverage_cn TEXT[],
  requirements TEXT[],
  requirements_cn TEXT[],
  application_process TEXT[],
  application_process_cn TEXT[],
  deadline VARCHAR(100),
  application_method TEXT,
  application_method_cn TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scholarships_slug ON scholarships(slug);
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scholarships are publicly readable"
  ON scholarships FOR SELECT USING (true);

-- ============================================
-- 4. Admin Profiles
-- ============================================
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON admin_profiles(role);
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all admin profiles"
  ON admin_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.user_id = auth.uid()
      AND ap.role IN ('admin', 'super_admin')
    )
  );
CREATE POLICY "Admins can update admin profiles"
  ON admin_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.user_id = auth.uid()
      AND ap.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- 5. Student Profiles
-- ============================================
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
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
CREATE INDEX IF NOT EXISTS idx_student_profiles_status ON student_profiles(status);
CREATE INDEX IF NOT EXISTS idx_student_profiles_nationality ON student_profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_student_profiles_target_degree ON student_profiles(target_degree);
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own profile"
  ON student_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Students can update their own profile"
  ON student_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all student profiles"
  ON student_profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin', 'super_admin'))
  );
CREATE POLICY "Admins can update all student profiles"
  ON student_profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin', 'super_admin'))
  );

-- ============================================
-- 6. Student Applications
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
CREATE INDEX IF NOT EXISTS idx_student_applications_student_id ON student_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_student_applications_university_id ON student_applications(university_id);
CREATE INDEX IF NOT EXISTS idx_student_applications_status ON student_applications(status);
CREATE INDEX IF NOT EXISTS idx_student_applications_application_number ON student_applications(application_number);
ALTER TABLE student_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own applications"
  ON student_applications FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can create their own applications"
  ON student_applications FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can update their own applications"
  ON student_applications FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "Admins can view all applications"
  ON student_applications FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin', 'super_admin'))
  );
CREATE POLICY "Admins can update all applications"
  ON student_applications FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin', 'super_admin'))
  );

-- ============================================
-- 7. Student Documents
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
CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON student_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_application_id ON student_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_category ON student_documents(category);
CREATE INDEX IF NOT EXISTS idx_student_documents_status ON student_documents(status);
CREATE INDEX IF NOT EXISTS idx_student_documents_uploaded_at ON student_documents(uploaded_at DESC);
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own documents"
  ON student_documents FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can upload their own documents"
  ON student_documents FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can update their own documents"
  ON student_documents FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "Students can delete their own documents"
  ON student_documents FOR DELETE USING (student_id = auth.uid());
CREATE POLICY "Admins can view all documents"
  ON student_documents FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin', 'super_admin'))
  );
CREATE POLICY "Admins can update all documents"
  ON student_documents FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin', 'super_admin'))
  );

-- ============================================
-- 8. Application Timeline
-- ============================================
CREATE TABLE IF NOT EXISTS application_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES student_applications(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_application_timeline_application_id ON application_timeline(application_id);
CREATE INDEX IF NOT EXISTS idx_application_timeline_created_at ON application_timeline(created_at DESC);
ALTER TABLE application_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view timeline for their applications"
  ON application_timeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_applications
      WHERE student_applications.id = application_timeline.application_id
      AND student_applications.student_id = auth.uid()
    )
  );
CREATE POLICY "Admins can view and manage all timeline entries"
  ON application_timeline FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin', 'super_admin'))
  );

-- ============================================
-- 9. Student Notifications
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
CREATE INDEX IF NOT EXISTS idx_student_notifications_student_id ON student_notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_student_notifications_is_read ON student_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_student_notifications_created_at ON student_notifications(created_at DESC);
ALTER TABLE student_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own notifications"
  ON student_notifications FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can update their own notifications"
  ON student_notifications FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "Admins can create notifications for students"
  ON student_notifications FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin', 'super_admin'))
  );

-- ============================================
-- 10. Partners (missing in source)
-- ============================================
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  company_name VARCHAR(255),
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  country VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Active',
  commission_rate NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can view their own record"
  ON partners FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all partners"
  ON partners FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin', 'super_admin'))
  );
CREATE POLICY "Admins can manage partners"
  ON partners FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin', 'super_admin'))
  );

-- ============================================
-- 11. Partner sub-tables (4)
-- ============================================
CREATE TABLE IF NOT EXISTS partner_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  student_name VARCHAR(255),
  student_email VARCHAR(255),
  student_phone VARCHAR(50),
  nationality VARCHAR(100),
  target_university VARCHAR(255),
  target_program VARCHAR(255),
  status VARCHAR(50) DEFAULT 'New',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partner_students_partner_id ON partner_students(partner_id);
ALTER TABLE partner_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage their own students"
  ON partner_students FOR ALL
  USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );
CREATE POLICY "Admins can view all partner students"
  ON partner_students FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin', 'super_admin'))
  );

CREATE TABLE IF NOT EXISTS partner_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  student_name VARCHAR(255),
  amount NUMERIC(12,2),
  currency VARCHAR(10) DEFAULT 'CNY',
  status VARCHAR(20) DEFAULT 'Pending',
  description TEXT,
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partner_fees_partner_id ON partner_fees(partner_id);
ALTER TABLE partner_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage their own fees"
  ON partner_fees FOR ALL
  USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS partner_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  lead_name VARCHAR(255),
  lead_email VARCHAR(255),
  lead_phone VARCHAR(50),
  interested_program VARCHAR(255),
  status VARCHAR(20) DEFAULT 'New',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partner_leads_partner_id ON partner_leads(partner_id);
ALTER TABLE partner_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage their own leads"
  ON partner_leads FOR ALL
  USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS partner_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  student_name VARCHAR(255),
  university VARCHAR(255),
  program VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Draft',
  submitted_at TIMESTAMP WITH TIME ZONE,
  decision VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partner_applications_partner_id ON partner_applications(partner_id);
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage their own applications"
  ON partner_applications FOR ALL
  USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- ============================================
-- 12. Triggers, functions, sequences
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_universities_updated_at ON universities;
CREATE TRIGGER trg_universities_updated_at
  BEFORE UPDATE ON universities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_programs_updated_at ON programs;
CREATE TRIGGER trg_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_scholarships_updated_at ON scholarships;
CREATE TRIGGER trg_scholarships_updated_at
  BEFORE UPDATE ON scholarships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_student_profiles_updated_at ON student_profiles;
CREATE TRIGGER trg_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_student_applications_updated_at ON student_applications;
CREATE TRIGGER trg_student_applications_updated_at
  BEFORE UPDATE ON student_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_admin_profiles_updated_at ON admin_profiles;
CREATE TRIGGER trg_admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_partners_updated_at ON partners;
CREATE TRIGGER trg_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_partner_students_updated_at ON partner_students;
CREATE TRIGGER trg_partner_students_updated_at
  BEFORE UPDATE ON partner_students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_partner_fees_updated_at ON partner_fees;
CREATE TRIGGER trg_partner_fees_updated_at
  BEFORE UPDATE ON partner_fees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_partner_leads_updated_at ON partner_leads;
CREATE TRIGGER trg_partner_leads_updated_at
  BEFORE UPDATE ON partner_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_partner_applications_updated_at ON partner_applications;
CREATE TRIGGER trg_partner_applications_updated_at
  BEFORE UPDATE ON partner_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Application number generator
CREATE SEQUENCE IF NOT EXISTS application_number_seq START WITH 1;
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

-- Auto-create student_profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_student_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.student_profiles (id, email, status)
  VALUES (NEW.id, NEW.email, 'Active')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_for_student ON auth.users;
CREATE TRIGGER on_auth_user_created_for_student
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_student_user();

-- ============================================
-- 13. Data (migrated from Volcengine)
-- ============================================

-- Universities (9 rows)
INSERT INTO universities (slug, name, name_cn, city, city_cn, ranking, rating, type, type_cn, established, students, intl_students, description, description_cn, popular_programs, popular_programs_cn, tuition_undergrad, tuition_graduate, intake, intake_cn, disciplines, image, logo, qs_ranking, highlights_en, highlights_zh, qs_world_ranking, tags, tags_cn, accommodation, accommodation_cn, accommodation_cost, accommodation_cost_cn, accommodation_types, accommodation_types_cn, gallery) VALUES ('shanghai-jiao-tong-university', 'Shanghai Jiao Tong University', '上海交通大学', 'Shanghai', '上海', 4, 4.7, 'Public University', '公立大学', 1896, '42,000+', '2,500+', 'Shanghai Jiao Tong University is a top-tier research university in Shanghai and a C9 League member. It excels in engineering, business, and medicine, and maintains strong ties with industry leaders. The university has multiple campuses across Shanghai with state-of-the-art facilities.', '上海交通大学是上海顶尖研究型大学，C9联盟成员。在工程、商业和医学领域表现出色，与行业领袖保持紧密联系。在上海拥有多个校区，配备一流设施。', ARRAY['Mechanical Engineering','Computer Science','MBA','Biomedical Engineering','Naval Architecture'], ARRAY['机械工程','计算机科学','MBA','生物医学工程','船舶与海洋工程'], '¥22,000 - 29,000/yr', '¥24,000 - 38,000/yr', 'September (Fall), March (Spring)', '9月（秋季），3月（春季）', ARRAY['Engineering','Computer Science','Business','Medicine'], 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80', '', '#45 QS World 2025', ARRAY['Industry Connections','Engineering Excellence','Medical School','Innovation Hub'], ARRAY['行业联系','工程卓越','医学院','创新中心'], 45, ARRAY['985','211','Double First Class'], ARRAY['985工程','211工程','双一流'], 'Shanghai Jiao Tong University provides international student dormitories on both Minhang and Xuhui campuses. Rooms include air conditioning, private bathrooms, and Wi-Fi. The dormitories feature shared kitchens, study lounges, and laundry rooms. Minhang campus has a dedicated international student building with modern amenities.', '上海交通大学在闵行和徐汇校区均设有国际学生宿舍。房间配备空调、独立卫浴和Wi-Fi。宿舍设有公共厨房、自习室和洗衣房。闵行校区有专门的国际学生楼，设施现代化。', '¥900 - 2,800/month', '¥900 - 2,800/月', ARRAY['Single Room','Double Room','International Student Dorm'], ARRAY['单人间','双人间','留学生公寓'], ARRAY['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80','https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80','https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80','https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=800&q=80']);
INSERT INTO universities (slug, name, name_cn, city, city_cn, ranking, rating, type, type_cn, established, students, intl_students, description, description_cn, popular_programs, popular_programs_cn, tuition_undergrad, tuition_graduate, intake, intake_cn, disciplines, image, logo, qs_ranking, highlights_en, highlights_zh, qs_world_ranking, tags, tags_cn, accommodation, accommodation_cn, accommodation_cost, accommodation_cost_cn, accommodation_types, accommodation_types_cn, gallery) VALUES ('tsinghua-university', 'Tsinghua University', '清华大学', 'Beijing', '北京', 1, 4.9, 'Public University', '公立大学', 1911, '50,000+', '4,000+', 'Tsinghua University is a major research university in Beijing, and a member of the C9 League. It is consistently ranked as the top university in China and one of the leading universities in the Asia-Pacific region. Known for its engineering and computer science programs, Tsinghua has produced many notable alumni including political leaders and tech entrepreneurs.', '清华大学是中国顶尖研究型大学，C9联盟成员，常年位居中国大学排名第一。以工程和计算机科学项目著称，培养了众多政界领袖和科技企业家。', ARRAY['Computer Science','Electronic Engineering','Business Administration','Architecture','Economics'], ARRAY['计算机科学','电子工程','工商管理','建筑学','经济学'], '¥23,000 - 30,000/yr', '¥25,000 - 40,000/yr', 'September (Fall), March (Spring)', '9月（秋季），3月（春季）', ARRAY['Engineering','Computer Science','Business','Architecture'], 'https://images.unsplash.com/photo-1595437193398-f24279553f4f?w=800&q=80', '', '#20 QS World 2025', ARRAY['World-Class Faculty','Modern Facilities','Global Partnerships','Vibrant Campus Life'], ARRAY['世界级师资','现代化设施','全球合作','活力校园生活'], 20, ARRAY['985','211','Double First Class'], ARRAY['985工程','211工程','双一流'], 'Tsinghua offers modern on-campus dormitories for international students, including single and double rooms with air conditioning, private bathrooms, and Wi-Fi. The international student dormitory (Zijing Apartment) provides 24-hour hot water, laundry facilities, and shared kitchens. Off-campus housing is also available nearby.', '清华大学为国际学生提供现代化校内宿舍，包括单人间和双人间，配备空调、独立卫浴和Wi-Fi。紫荆公寓国际学生宿舍提供24小时热水、洗衣设施和公共厨房。校外住宿也可选择。', '¥800 - 2,500/month', '¥800 - 2,500/月', ARRAY['Single Room','Double Room','International Student Dorm'], ARRAY['单人间','双人间','留学生公寓'], ARRAY['https://images.unsplash.com/photo-1595437193398-f24279553f4f?w=800&q=80','https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80','https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=800&q=80','https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=800&q=80']);
INSERT INTO universities (slug, name, name_cn, city, city_cn, ranking, rating, type, type_cn, established, students, intl_students, description, description_cn, popular_programs, popular_programs_cn, tuition_undergrad, tuition_graduate, intake, intake_cn, disciplines, image, logo, qs_ranking, highlights_en, highlights_zh, qs_world_ranking, tags, tags_cn, accommodation, accommodation_cn, accommodation_cost, accommodation_cost_cn, accommodation_types, accommodation_types_cn, gallery) VALUES ('fudan-university', 'Fudan University', '复旦大学', 'Shanghai', '上海', 3, 4.8, 'Public University', '公立大学', 1905, '35,000+', '2,800+', 'Fudan University, located in Shanghai, is one of China''s most prestigious and selective universities. It is a member of the C9 League and is renowned for its programs in humanities, social sciences, and natural sciences. The university''s location in China''s financial capital provides students with unparalleled opportunities for internships and career development.', '复旦大学位于上海，是中国最负盛名和最具选择性的大学之一，C9联盟成员。以人文社科和自然科学项目著称，地处中国金融中心，为学生提供无与伦比的实习和职业发展机会。', ARRAY['Economics','Journalism','Finance','Medicine','Political Science'], ARRAY['经济学','新闻学','金融学','医学','政治学'], '¥21,000 - 28,000/yr', '¥23,000 - 36,000/yr', 'September (Fall)', '9月（秋季）', ARRAY['Economics','Business','Medicine','Humanities'], 'https://images.unsplash.com/photo-1537531027583-9a0e3e52451f?w=800&q=80', 'https://cdn.urongda.com//images/normal/medium/fudan-university-logo-1024px.png', '#39 QS World 2025', ARRAY['Shanghai Location Advantage','Strong Finance Programs','International Exchange','Research Excellence'], ARRAY['上海地理优势','强大的金融项目','国际交流','卓越研究'], 39, ARRAY['985','211','Double First Class'], ARRAY['985工程','211工程','双一流'], 'Fudan University offers on-campus housing for international students at the International Student Dormitory (Lixiao Building). Rooms are equipped with air conditioning, private bathrooms, and internet. Shared kitchens and laundry facilities are available. Shanghai also offers many off-campus rental apartments near the campus.', '复旦大学为国际学生提供校内住宿（留学生楼），房间配备空调、独立卫浴和网络。公共厨房和洗衣设施齐全。上海校园周边也有丰富的校外租房选择。', '¥1,000 - 3,000/month', '¥1,000 - 3,000/月', ARRAY['Single Room','Double Room','Off-campus Apartment'], ARRAY['单人间','双人间','校外公寓'], ARRAY['https://images.unsplash.com/photo-1537531027583-9a0e3e52451f?w=800&q=80','https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80','https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=800&q=80','https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80']);
INSERT INTO universities (slug, name, name_cn, city, city_cn, ranking, rating, type, type_cn, established, students, intl_students, description, description_cn, popular_programs, popular_programs_cn, tuition_undergrad, tuition_graduate, intake, intake_cn, disciplines, image, logo, qs_ranking, highlights_en, highlights_zh, qs_world_ranking, tags, tags_cn, accommodation, accommodation_cn, accommodation_cost, accommodation_cost_cn, accommodation_types, accommodation_types_cn, gallery) VALUES ('nanjing-university', 'Nanjing University', '南京大学', 'Nanjing', '南京', 6, 4.6, 'Public University', '公立大学', 1902, '33,000+', '1,800+', 'Nanjing University is a prestigious C9 League member known for its academic rigor and research excellence. Located in the historic city of Nanjing, it offers strong programs in sciences, humanities, and social sciences. The university has a long tradition of scholarly excellence dating back over a century.', '南京大学是C9联盟成员，以学术严谨和研究卓越著称。位于历史文化名城南京，在理科、人文社科领域拥有强势项目。学术传承逾百年。', ARRAY['Physics','Chemistry','Astronomy','Chinese Language','Geosciences'], ARRAY['物理学','化学','天文学','汉语言文学','地球科学'], '¥20,000 - 26,000/yr', '¥22,000 - 34,000/yr', 'September (Fall)', '9月（秋季）', ARRAY['Sciences','Humanities','Social Sciences','Geosciences'], 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80', '', '#141 QS World 2025', ARRAY['Academic Rigor','Research Excellence','Historic City','Strong Sciences'], ARRAY['学术严谨','研究卓越','历史名城','强大的理科'], 141, ARRAY['985','211','Double First Class'], ARRAY['985工程','211工程','双一流'], 'Nanjing University provides on-campus dormitories for international students at Xianlin Campus. Rooms come with air conditioning, private bathrooms, and internet access. Shared kitchens and laundry facilities are available. Nanjing offers a lower cost of living compared to Beijing and Shanghai, with many affordable off-campus rentals nearby.', '南京大学在仙林校区为国际学生提供校内宿舍。房间配备空调、独立卫浴和网络。公共厨房和洗衣设施齐全。与北京和上海相比，南京生活成本较低，校园周边有大量实惠的校外租房。', '¥500 - 1,800/month', '¥500 - 1,800/月', ARRAY['Single Room','Double Room','Shared Apartment'], ARRAY['单人间','双人间','合租公寓'], ARRAY['https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80','https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80','https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80','https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80']);
INSERT INTO universities (slug, name, name_cn, city, city_cn, ranking, rating, type, type_cn, established, students, intl_students, description, description_cn, popular_programs, popular_programs_cn, tuition_undergrad, tuition_graduate, intake, intake_cn, disciplines, image, logo, qs_ranking, highlights_en, highlights_zh, qs_world_ranking, tags, tags_cn, accommodation, accommodation_cn, accommodation_cost, accommodation_cost_cn, accommodation_types, accommodation_types_cn, gallery) VALUES ('lishui-university', 'Lishui University', '丽水学院', 'Lishui', '丽水', 382, 4.2, 'Public University', '公立大学', 1907, '15,000+', '300+', 'Lishui University is a full-time public undergraduate university located in the ecologically rich city of Lishui, Zhejiang Province. It has a long history dating back to the Lishui Normal School founded in 1907, and has developed into a comprehensive institution with strong focus on ecological sciences, education and local cultural studies. The university occupies a beautiful campus surrounded by green mountains and clear rivers, reflecting the region''s reputation as one of China''s most environmentally friendly areas. It maintains active partnerships with over 30 universities across 15 countries, welcoming growing numbers of international students each year.', '丽水学院是一所全日制公立本科大学，位于浙江省生态资源丰富的丽水市。学校办学历史可追溯到1907年创办的处州师范学堂，现已发展成为一所以生态科学、教育学和地方文化研究为特色的综合性院校。学校校园风景优美，被青山绿水环绕，呼应了丽水作为中国生态环境最优地区之一的美誉。学校目前与15个国家的30余所大学保持活跃合作关系，每年接待越来越多的国际学生前来学习。', ARRAY['Ecological Forestry','Primary Education','Environmental Engineering','Chinese Language and Literature','Tourism Management'], ARRAY['生态林业学','小学教育','环境工程','汉语言文学','旅游管理'], NULL, NULL, NULL, NULL, '{}'::text[], NULL, '', NULL, '{}'::text[], '{}'::text[], NULL, ARRAY['Double First Class'], ARRAY['双一流'], 'Lishui University provides dedicated on-campus accommodation for international students, with basic facilities fully furnished to meet daily living needs. All dormitory rooms are equipped with Wi-Fi, air conditioning, independent bathrooms and basic furniture. International students can apply for their preferred room type according to personal needs and budget, with on-campus property management providing 24-hour maintenance services.', '丽水学院为国际学生提供专门的校内住宿，所有房间基本生活设施齐全，满足日常居住需求。所有宿舍都配备有无线网络、空调、独立卫浴和基础家具。国际学生可根据个人需求和预算申请心仪的房型，校内物业提供24小时维修服务。', '¥600-1,200/month', '¥600-1,200/月', ARRAY['Single Room','Double Room','International Student Dorm'], ARRAY['单人间','双人间','留学生宿舍'], ARRAY['https://images.unsplash.com/photo-1566155119454-2b581dd44c59?w=800','https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800','https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800','https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800']);
INSERT INTO universities (slug, name, name_cn, city, city_cn, ranking, rating, type, type_cn, established, students, intl_students, description, description_cn, popular_programs, popular_programs_cn, tuition_undergrad, tuition_graduate, intake, intake_cn, disciplines, image, logo, qs_ranking, highlights_en, highlights_zh, qs_world_ranking, tags, tags_cn, accommodation, accommodation_cn, accommodation_cost, accommodation_cost_cn, accommodation_types, accommodation_types_cn, gallery) VALUES ('sun-yat-sen-university', 'Sun Yat-sen University', '中山大学', 'Guangzhou', '广州', 8, 4.5, 'Public University', '公立大学', 1924, '52,000+', '2,000+', 'Sun Yat-sen University, located in Guangzhou, is one of the leading universities in South China. Named after the founding father of modern China, it offers excellent programs in business, medicine, and social sciences. Its location in the Pearl River Delta provides unique opportunities in China''s manufacturing and trade hub.', '中山大学位于广州，是华南地区顶尖大学之一。以中国近代国父命名，在商科、医学和社会科学领域拥有优秀项目。地处珠三角，在中国制造和贸易中心提供独特机遇。', ARRAY['Business Administration','Clinical Medicine','Philosophy','Sociology','Marine Science'], ARRAY['工商管理','临床医学','哲学','社会学','海洋科学'], '¥19,000 - 26,000/yr', '¥21,000 - 34,000/yr', 'September (Fall)', '9月（秋季）', ARRAY['Business','Medicine','Social Sciences','Marine Science'], 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80', '', '#331 QS World 2025', ARRAY['South China Gateway','Business Hub','Medical Excellence','Tropical Research'], ARRAY['华南门户','商业中心','医学卓越','热带研究'], 331, ARRAY['985','211','Double First Class'], ARRAY['985工程','211工程','双一流'], 'Sun Yat-sen University provides on-campus housing for international students at South Campus and Higher Education Mega Center. Rooms include air conditioning, private bathrooms, and internet access. Shared kitchens and laundry are available. Guangzhou offers a vibrant rental market with many affordable options near the university.', '中山大学在南校区和大学城校区为国际学生提供校内住宿。房间配备空调、独立卫浴和网络。公共厨房和洗衣设施齐全。广州租房市场活跃，校园周边有许多实惠的住宿选择。', '¥600 - 2,200/month', '¥600 - 2,200/月', ARRAY['Single Room','Double Room','Off-campus Apartment'], ARRAY['单人间','双人间','校外公寓'], ARRAY['https://images.unsplash.com/photo-1577985043696-8bd54d9c4f19?w=800&q=80','https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80','https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80','https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80']);
INSERT INTO universities (slug, name, name_cn, city, city_cn, ranking, rating, type, type_cn, established, students, intl_students, description, description_cn, popular_programs, popular_programs_cn, tuition_undergrad, tuition_graduate, intake, intake_cn, disciplines, image, logo, qs_ranking, highlights_en, highlights_zh, qs_world_ranking, tags, tags_cn, accommodation, accommodation_cn, accommodation_cost, accommodation_cost_cn, accommodation_types, accommodation_types_cn, gallery) VALUES ('peking-university', 'Peking University', '北京大学', 'Beijing', '北京', 2, 4.9, 'Public University', '公立大学', 1898, '47,000+', '3,500+', 'Peking University is one of the most prestigious and oldest universities in China. Located in the Haidian District of Beijing, it is known for its outstanding programs in humanities, social sciences, and natural sciences. The campus features beautiful traditional Chinese architecture and is adjacent to the Summer Palace.', '北京大学是中国最负盛名、历史最悠久的大学之一。位于北京海淀区，以人文社科和自然科学项目闻名。校园融合传统中式建筑，毗邻颐和园。', ARRAY['Philosophy','International Relations','Law','Economics','Chinese Literature'], ARRAY['哲学','国际关系','法学','经济学','中国文学'], '¥22,000 - 28,000/yr', '¥24,000 - 38,000/yr', 'September (Fall), March (Spring)', '9月（秋季），3月（春季）', ARRAY['Humanities','Social Sciences','Law','Medicine'], 'https://images.unsplash.com/photo-1596437795667-1af9e4287c96?w=800&q=80', '', '#14 QS World 2025', ARRAY['Leading Humanities Programs','Historic Campus','Strong Research Output','Diverse International Community'], ARRAY['领先的人文项目','历史悠久的校园','强劲的科研产出','多元的国际社区'], 14, ARRAY['985','211','Double First Class'], ARRAY['985工程','211工程','双一流'], 'Peking University provides well-furnished international student dormitories on campus, including Shaoyuan Dormitory with single and double rooms. All rooms come with air conditioning, private bathrooms, and internet access. Common areas include study rooms, laundry, and kitchens. The campus is located near many off-campus rental options.', '北京大学为国际学生提供设施齐全的校内宿舍，包括勺园宾馆的单人间和双人间。所有房间配备空调、独立卫浴和网络。公共区域包括自习室、洗衣房和厨房。校园周边也有丰富的校外租房选择。', '¥700 - 2,200/month', '¥700 - 2,200/月', ARRAY['Single Room','Double Room','Suite'], ARRAY['单人间','双人间','套间'], ARRAY['https://images.unsplash.com/photo-1596437795667-1af9e4287c96?w=800&q=80','https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80','https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=800&q=80','https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=800&q=80']);
INSERT INTO universities (slug, name, name_cn, city, city_cn, ranking, rating, type, type_cn, established, students, intl_students, description, description_cn, popular_programs, popular_programs_cn, tuition_undergrad, tuition_graduate, intake, intake_cn, disciplines, image, logo, qs_ranking, highlights_en, highlights_zh, qs_world_ranking, tags, tags_cn, accommodation, accommodation_cn, accommodation_cost, accommodation_cost_cn, accommodation_types, accommodation_types_cn, gallery) VALUES ('zhejiang-university', 'Zhejiang University', '浙江大学', 'Hangzhou', '杭州', 5, 4.7, 'Public University', '公立大学', 1897, '55,000+', '3,000+', 'Zhejiang University, located in the scenic city of Hangzhou, is one of China''s oldest and most prestigious universities. A C9 League member, it is known for its comprehensive academic offerings and strong emphasis on innovation and entrepreneurship. The campus is one of the most beautiful in China.', '浙江大学位于风景秀丽的杭州，是中国历史最悠久、最负盛名的大学之一。C9联盟成员，以全面的学术项目和创新创业著称。校园被誉为中国最美之一。', ARRAY['Computer Science','Agricultural Science','Optical Engineering','Clinical Medicine','Management'], ARRAY['计算机科学','农业科学','光学工程','临床医学','管理学'], '¥20,000 - 27,000/yr', '¥22,000 - 35,000/yr', 'September (Fall)', '9月（秋季）', ARRAY['Engineering','Computer Science','Medicine','Agriculture'], 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80', '', '#47 QS World 2025', ARRAY['Innovation & Entrepreneurship','Beautiful Campus','Comprehensive Programs','Strong Industry Ties'], ARRAY['创新创业','美丽校园','综合项目','紧密行业联系'], 47, ARRAY['985','211','Double First Class'], ARRAY['985工程','211工程','双一流'], 'Zhejiang University offers on-campus accommodation at the International Campus in Haining and Zijingang Campus in Hangzhou. International students enjoy furnished rooms with air conditioning, en-suite bathrooms, and high-speed internet. Common areas include kitchens, gyms, and study rooms. Hangzhou also has many affordable off-campus options.', '浙江大学在海宁国际校区和杭州紫金港校区为国际学生提供校内住宿。房间配备空调、独立卫浴和高速网络。公共区域包括厨房、健身房和自习室。杭州也有许多价格实惠的校外住宿选择。', '¥600 - 2,000/month', '¥600 - 2,000/月', ARRAY['Single Room','Double Room','Shared Apartment'], ARRAY['单人间','双人间','合租公寓'], ARRAY['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80','https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80','https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80','https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80']);
INSERT INTO universities (slug, name, name_cn, city, city_cn, ranking, rating, type, type_cn, established, students, intl_students, description, description_cn, popular_programs, popular_programs_cn, tuition_undergrad, tuition_graduate, intake, intake_cn, disciplines, image, logo, qs_ranking, highlights_en, highlights_zh, qs_world_ranking, tags, tags_cn, accommodation, accommodation_cn, accommodation_cost, accommodation_cost_cn, accommodation_types, accommodation_types_cn, gallery) VALUES ('wuhan-university', 'Wuhan University', '武汉大学', 'Wuhan', '武汉', 7, 4.6, 'Public University', '公立大学', 1893, '58,000+', '2,200+', 'Wuhan University is renowned for its beautiful cherry blossom campus and strong academic reputation. As a comprehensive university, it excels in multiple disciplines including remote sensing, law, and water conservancy. The university is located on Luojia Hill with stunning views of East Lake.', '武汉大学以美丽的樱花校园和卓越的学术声誉著称。作为综合性大学，在遥感、法学、水利等多个学科领域表现出色。校园坐落于珞珈山上，东湖美景尽收眼底。', ARRAY['Remote Sensing','Law','Water Conservancy','Journalism','Biology'], ARRAY['遥感科学','法学','水利工程','新闻学','生物学'], '¥18,000 - 25,000/yr', '¥20,000 - 32,000/yr', 'September (Fall), March (Spring)', '9月（秋季），3月（春季）', ARRAY['Law','Engineering','Sciences','Medicine'], 'https://images.unsplash.com/photo-1548786811-dd6e453ccca7?w=800&q=80', '', '#194 QS World 2025', ARRAY['Cherry Blossom Campus','Remote Sensing Leader','Comprehensive Programs','Central China Hub'], ARRAY['樱花校园','遥感学科领先','综合项目','华中地区中心'], 194, ARRAY['985','211','Double First Class'], ARRAY['985工程','211工程','双一流'], 'Wuhan University offers on-campus accommodation for international students at the International Education College dormitory. Rooms feature air conditioning, private bathrooms, and internet. The campus has shared kitchens, laundry rooms, and recreational areas. Wuhan is one of the most affordable major cities in China for student housing.', '武汉大学在国际教育学院宿舍为国际学生提供校内住宿。房间配备空调、独立卫浴和网络。校园设有公共厨房、洗衣房和休闲区域。武汉是中国学生住房最经济实惠的大城市之一。', '¥400 - 1,500/month', '¥400 - 1,500/月', ARRAY['Single Room','Double Room','International Student Dorm'], ARRAY['单人间','双人间','留学生公寓'], ARRAY['https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&q=80','https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80','https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80','https://images.unsplash.com/photo-1470219556762-1fd5b23f975d?w=800&q=80']);

-- Programs (17 rows)
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('chinese-language-culture-bsc-peking', 'BA in Chinese Language & Culture', '汉语言文化学士', 'peking-university', 'Bachelor', 'Humanities', 'Chinese', '4 years', '¥24,000/year', 'An immersive program for international students to master Chinese language and deeply understand Chinese culture, literature, and history. Includes intensive language training and cultural field trips.', '为国际学生提供沉浸式中文学习项目，深入理解中国文化、文学和历史。包含强化语言训练和文化实地考察。', ARRAY['High school diploma','HSK Level 4 or above','Personal statement in Chinese','Two recommendation letters','Interview'], ARRAY['高中文凭','HSK四级及以上','中文个人陈述','两封推荐信','面试'], ARRAY['Advanced Chinese Reading','Classical Chinese','Chinese Literature','Chinese Philosophy','Cultural Heritage of China','Translation Practice','Graduation Thesis'], ARRAY['高级中文阅读','古代汉语','中国文学','中国哲学','中国文化遗产','翻译实践','毕业论文'], TRUE, 'September', NULL, NULL, NULL);
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('clinical-medicine-mbbs-fudan', 'MBBS in Clinical Medicine', '临床医学学士(MBBS)', 'fudan-university', 'Bachelor', 'Medicine', 'English', '6 years', '¥42,000/year', 'A comprehensive medical program taught in English, designed for international students. Includes pre-clinical studies, clinical rotations at top Shanghai hospitals, and research opportunities in medical sciences.', '全英文授课的综合医学项目，专为国际学生设计。包括临床前学习、上海顶级医院临床轮转和医学科研机会。', ARRAY['High school diploma with strong science background','Minimum IELTS 6.5 or TOEFL 90','Biology and Chemistry prerequisites','Health examination certificate','Interview'], ARRAY['具有强理科背景的高中文凭','雅思最低6.5或托福90','生物和化学先修课','健康检查证明','面试'], ARRAY['Anatomy','Physiology','Pathology','Pharmacology','Internal Medicine','Surgery','Pediatrics','Clinical Rotations'], ARRAY['解剖学','生理学','病理学','药理学','内科学','外科学','儿科学','临床轮转'], TRUE, 'September', NULL, NULL, NULL);
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('physics-phd-nanjing', 'PhD in Physics', '物理学博士', 'nanjing-university', 'PhD', 'Sciences', 'English', '3-5 years', '¥30,000/year', 'A doctoral program at one of China''s strongest physics departments. Research areas include condensed matter physics, quantum information, and nanoscience with access to national key laboratories.', '中国最强物理系之一的博士项目。研究方向包括凝聚态物理、量子信息和纳米科学，可使用国家重点实验室。', ARRAY['Master''s degree in physics or related field','Minimum IELTS 6.5 or TOEFL 90','Detailed research proposal','Three recommendation letters','Published research papers'], ARRAY['物理学或相关领域硕士学位','雅思最低6.5或托福90','详细研究计划','三封推荐信','已发表研究论文'], ARRAY['Advanced Quantum Mechanics','Statistical Physics','Solid State Physics','Quantum Information','Research Seminars','Dissertation'], ARRAY['高等量子力学','统计物理','固体物理','量子信息','研究研讨','博士论文'], TRUE, 'September', NULL, NULL, NULL);
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('computer-science-bsc-tsinghua', 'BSc in Computer Science', '计算机科学学士', 'tsinghua-university', 'Bachelor', 'Computer Science', 'English', '4 years', '¥30,000/year', 'A rigorous program covering algorithms, artificial intelligence, software engineering, and data science. Students gain hands-on experience through research labs and industry partnerships with leading tech companies in Beijing''s Zhongguancun district.', '涵盖算法、人工智能、软件工程和数据科学的严谨项目。学生通过研究实验室和与北京中关村领先科技公司的行业合作获得实践经验。', ARRAY['High school diploma with strong math background','Minimum IELTS 6.5 or TOEFL 85','Personal statement','Two recommendation letters','Entrance exam in mathematics'], ARRAY['具有强数学背景的高中文凭','雅思最低6.5或托福85','个人陈述','两封推荐信','数学入学考试'], ARRAY['Data Structures & Algorithms','Computer Architecture','Operating Systems','Machine Learning','Database Systems','Software Engineering','Artificial Intelligence','Capstone Project'], ARRAY['数据结构与算法','计算机体系结构','操作系统','机器学习','数据库系统','软件工程','人工智能','毕业设计'], TRUE, 'September', NULL, NULL, NULL);
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('mba-shanghai-jiao-tong', 'MBA (International)', '国际MBA', 'shanghai-jiao-tong-university', 'Master', 'Business', 'English', '2 years', '¥58,000/year', 'A globally ranked MBA program with a China focus. Combines Western management theory with Chinese business practices, featuring industry mentorship, company visits, and a diverse cohort of international professionals.', '全球排名领先的MBA项目，以中国为焦点。融合西方管理理论与中国商业实践，提供行业导师、企业参观和多元国际专业学员群体。', ARRAY['Bachelor''s degree','Minimum 3 years work experience','Minimum IELTS 6.5 or TOEFL 90','GMAT/GRE scores','Two recommendation letters','Interview'], ARRAY['学士学位','至少3年工作经验','雅思最低6.5或托福90','GMAT/GRE成绩','两封推荐信','面试'], ARRAY['Strategic Management','China Business Environment','Financial Accounting','Marketing Strategy','Supply Chain Management','Leadership & Ethics','Capstone Project'], ARRAY['战略管理','中国商业环境','财务会计','营销战略','供应链管理','领导力与伦理','毕业项目'], FALSE, 'September', NULL, NULL, NULL);
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('business-administration-bba-sysu', 'BBA in Business Administration', '工商管理学士', 'sun-yat-sen-university', 'Bachelor', 'Business', 'English', '4 years', '¥26,000/year', 'A comprehensive business program in Guangzhou, China''s southern trade hub. Combines management theory with practical business skills, featuring internships at Fortune 500 companies in the Greater Bay Area.', '位于中国南方贸易中心广州的综合商科项目。结合管理理论与实用商业技能，提供大湾区财富500强企业实习机会。', ARRAY['High school diploma','Minimum IELTS 6.0 or TOEFL 75','Math proficiency','Personal statement','Two recommendation letters'], ARRAY['高中文凭','雅思最低6.0或托福75','数学能力','个人陈述','两封推荐信'], ARRAY['Principles of Management','Financial Accounting','Marketing','Business Statistics','Organizational Behavior','Strategic Management','Internship','Capstone'], ARRAY['管理学原理','财务会计','市场营销','商业统计','组织行为学','战略管理','实习','毕业项目'], FALSE, 'September', NULL, NULL, NULL);
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('law-llm-wuhan', 'LLM in International Law', '国际法法学硕士', 'wuhan-university', 'Master', 'Law', 'English', '2 years', '¥28,000/year', 'A specialized program in international law with emphasis on Chinese law, international trade law, and human rights law. WHU''s law school is one of China''s most prestigious, with strong alumni networks in legal practice.', '国际法专业项目，侧重中国法、国际贸易法和人权法。武大法学院是中国最负盛名的法学院之一，在法律实务界拥有强大的校友网络。', ARRAY['Bachelor''s degree in Law','Minimum IELTS 7.0 or TOEFL 100','Legal writing sample','Two recommendation letters','Statement of purpose'], ARRAY['法学学士学位','雅思最低7.0或托福100','法律写作样本','两封推荐信','目的陈述'], ARRAY['International Trade Law','Chinese Legal System','International Arbitration','Human Rights Law','Comparative Law','Legal Research & Writing','Thesis'], ARRAY['国际贸易法','中国法律制度','国际仲裁','人权法','比较法','法律研究与写作','论文'], TRUE, 'September', NULL, NULL, NULL);
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('economics-phd-fudan', 'PhD in Economics', '经济学博士', 'fudan-university', 'PhD', 'Social Sciences', 'English', '4-5 years', '¥32,000/year', 'A doctoral program in one of China''s leading economics departments. Research strengths in Chinese economy, development economics, and financial economics. Access to Shanghai''s financial data and policy research institutions.', '中国领先经济系之一的博士项目。在中国经济、发展经济学和金融经济学方面研究实力雄厚。可使用上海金融数据和政策研究机构资源。', ARRAY['Master''s degree in economics or related field','Minimum IELTS 7.0 or TOEFL 100','Research proposal','Three recommendation letters','Published research papers preferred'], ARRAY['经济学或相关领域硕士学位','雅思最低7.0或托福100','研究计划','三封推荐信','有发表研究论文者优先'], ARRAY['Advanced Microeconomics','Advanced Macroeconomics','Econometrics','Chinese Economy Seminar','Development Economics','Dissertation Research'], ARRAY['高级微观经济学','高级宏观经济学','计量经济学','中国经济研讨','发展经济学','论文研究'], TRUE, 'September', NULL, NULL, NULL);
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('test-program-tsinghua-university', 'Test Program', '测试项目', 'tsinghua-university', 'Master', 'Engineering', 'English', '2 years', '¥30,000/year', '', '', '{}'::text[], '{}'::text[], '{}'::text[], '{}'::text[], FALSE, 'September', '', '', '9月');
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('biomedical-engineering-phd-sjtu', 'PhD in Biomedical Engineering', '生物医学工程博士', 'shanghai-jiao-tong-university', 'PhD', 'Engineering', 'English', '3-4 years', '¥35,000/year', 'A research-intensive doctoral program at the intersection of engineering and medicine. Access to SJTU''s world-class medical engineering labs and affiliated hospitals for translational research.', '工程与医学交叉的研究型博士项目。可使用交大世界一流的医学工程实验室和附属医院进行转化研究。', ARRAY['Master''s degree in BME or related field','Minimum IELTS 6.5 or TOEFL 90','Detailed research proposal','Three recommendation letters','Published research papers preferred'], ARRAY['生物医学工程或相关领域硕士学位','雅思最低6.5或托福90','详细研究计划','三封推荐信','有发表研究论文者优先'], ARRAY['Advanced Biomaterials','Medical Imaging','Tissue Engineering','Neural Engineering','Dissertation Research','Teaching Practicum'], ARRAY['高级生物材料','医学影像','组织工程','神经工程','论文研究','教学实践'], TRUE, 'September', NULL, NULL, NULL);
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('marine-science-msc-sysu', 'MSc in Marine Science', '海洋科学硕士', 'sun-yat-sen-university', 'Master', 'Sciences', 'Bilingual', '3 years', '¥26,000/year', 'A research-focused program leveraging SYSU''s unique location near the South China Sea. Covers marine biology, oceanography, and coastal management with field research opportunities.', '利用中山大学毗邻南海的独特地理位置的研究型项目。涵盖海洋生物学、海洋学和海岸管理，提供实地研究机会。', ARRAY['Bachelor''s degree in marine science, biology, or related field','Minimum IELTS 6.0 or TOEFL 80','HSK Level 4 (for Chinese-taught modules)','Research proposal','Two recommendation letters'], ARRAY['海洋科学、生物或相关领域学士学位','雅思最低6.0或托福80','HSK四级（中文授课模块）','研究计划','两封推荐信'], ARRAY['Marine Biology','Physical Oceanography','Coastal Zone Management','Marine Ecology','Research Methods','Field Research','Thesis'], ARRAY['海洋生物学','物理海洋学','海岸带管理','海洋生态学','研究方法','野外研究','论文'], TRUE, 'September', NULL, NULL, NULL);
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('international-relations-ma-peking', 'MA in International Relations', '国际关系硕士', 'peking-university', 'Master', 'Social Sciences', 'English', '2 years', '¥30,000/year', 'A comprehensive program exploring global politics, diplomacy, and China''s role in international affairs. Students benefit from PKU''s proximity to government institutions and think tanks in Beijing.', '探索全球政治、外交和中国在国际事务中作用的综合项目。学生受益于北大毗邻北京政府机构和智库的地理优势。', ARRAY['Bachelor''s degree in any discipline','Minimum IELTS 7.0 or TOEFL 100','Writing sample (academic paper)','Two recommendation letters','Statement of purpose'], ARRAY['任何学科的本科学位','雅思最低7.0或托福100','写作样本（学术论文）','两封推荐信','目的陈述'], ARRAY['International Political Economy','Chinese Foreign Policy','Global Governance','Diplomatic History','Research Methods','Thesis'], ARRAY['国际政治经济学','中国外交政策','全球治理','外交史','研究方法','论文'], TRUE, 'September', NULL, NULL, NULL);
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('agricultural-science-bsc-zju', 'BSc in Agricultural Science', '农业科学学士', 'zhejiang-university', 'Bachelor', 'Sciences', 'Bilingual', '4 years', '¥22,000/year', 'A unique program combining modern agricultural technology with sustainability. ZJU''s agricultural science ranks among the world''s best, with access to experimental farms and biotech labs in Hangzhou.', '结合现代农业技术与可持续性的独特项目。浙大农业科学排名世界前列，可使用杭州的实验农场和生物技术实验室。', ARRAY['High school diploma with science background','Minimum IELTS 6.0 or TOEFL 75','HSK Level 4 (for Chinese-taught modules)','Personal statement','Two recommendation letters'], ARRAY['具有理科背景的高中文凭','雅思最低6.0或托福75','HSK四级（中文授课模块）','个人陈述','两封推荐信'], ARRAY['Plant Biology','Soil Science','Agricultural Biotechnology','Food Safety & Quality','Sustainable Agriculture','Smart Farming Technology','Field Practice'], ARRAY['植物生物学','土壤学','农业生物技术','食品安全与质量','可持续农业','智慧农业技术','田间实践'], TRUE, 'September', NULL, NULL, NULL);
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('finance-msc-fudan', 'MSc in Finance', '金融学硕士', 'fudan-university', 'Master', 'Business', 'English', '2 years', '¥36,000/year', 'A top-tier finance program in Shanghai''s financial district, offering cutting-edge coursework in quantitative finance, fintech, and investment management. Strong connections with Wall Street firms and Chinese financial institutions.', '上海金融中心的顶级金融项目，提供量化金融、金融科技和投资管理的前沿课程。与华尔街公司和中国金融机构有紧密联系。', ARRAY['Bachelor''s degree in finance, economics, or related field','Minimum IELTS 6.5 or TOEFL 90','GMAT/GRE scores','Two recommendation letters','Professional resume'], ARRAY['金融、经济或相关领域学士学位','雅思最低6.5或托福90','GMAT/GRE成绩','两封推荐信','职业简历'], ARRAY['Quantitative Finance','Financial Derivatives','Risk Management','Fintech & Blockchain','Corporate Finance','Investment Analysis','Thesis'], ARRAY['量化金融','金融衍生品','风险管理','金融科技与区块链','公司金融','投资分析','论文'], TRUE, 'September', NULL, NULL, NULL);
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('electronic-engineering-msc-tsinghua', 'MSc in Electronic Engineering', '电子工程硕士', 'tsinghua-university', 'Master', 'Engineering', 'English', '2-3 years', '¥40,000/year', 'An advanced program focusing on integrated circuits, signal processing, and communications engineering. Access to state-of-the-art microelectronics labs and collaboration with China''s top semiconductor companies.', '专注于集成电路、信号处理和通信工程的高级项目。可使用最先进的微电子实验室，与中国顶级半导体公司合作。', ARRAY['Bachelor''s degree in EE or related field','Minimum IELTS 6.5 or TOEFL 90','Research proposal','Two recommendation letters from professors','GPA 3.0+'], ARRAY['电子工程或相关领域学士学位','雅思最低6.5或托福90','研究计划','两封教授推荐信','GPA 3.0以上'], ARRAY['Advanced Signal Processing','VLSI Design','Embedded Systems','Wireless Communications','Semiconductor Physics','Thesis Research'], ARRAY['高级信号处理','超大规模集成电路设计','嵌入式系统','无线通信','半导体物理','论文研究'], TRUE, 'September', NULL, NULL, NULL);
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('artificial-intelligence-msc-zju', 'MSc in Artificial Intelligence', '人工智能硕士', 'zhejiang-university', 'Master', 'Computer Science', 'English', '2.5 years', '¥35,000/year', 'A cutting-edge program in one of China''s top AI research centers. Covers deep learning, natural language processing, computer vision, and robotics with extensive lab work and industry collaboration.', '中国顶级AI研究中心之一的前沿项目。涵盖深度学习、自然语言处理、计算机视觉和机器人技术，配有丰富的实验室工作和行业合作。', ARRAY['Bachelor''s degree in CS, math, or related field','Minimum IELTS 6.5 or TOEFL 90','Programming proficiency in Python/C++','Research proposal','Two recommendation letters'], ARRAY['计算机科学、数学或相关领域学士学位','雅思最低6.5或托福90','Python/C++编程能力','研究计划','两封推荐信'], ARRAY['Deep Learning','Computer Vision','Natural Language Processing','Reinforcement Learning','AI Ethics & Governance','Research Project','Thesis'], ARRAY['深度学习','计算机视觉','自然语言处理','强化学习','AI伦理与治理','研究项目','论文'], TRUE, 'September', NULL, NULL, NULL);
INSERT INTO programs (slug, name, name_cn, university_slug, degree, discipline, language, duration, tuition, description, description_cn, requirements, requirements_cn, curriculum, curriculum_cn, scholarship_available, intake, discipline_cn, duration_cn, intake_cn) VALUES ('architecture-bsc-tsinghua', 'BSc in Architecture', '建筑学学士', 'tsinghua-university', 'Bachelor', 'Engineering', 'Chinese', '5 years', '¥30,000/year', 'China''s top-ranked architecture program, blending traditional Chinese architectural philosophy with modern design thinking. Students work in design studios and participate in international architecture competitions.', '中国排名第一的建筑学项目，融合传统中国建筑哲学与现代设计思维。学生在设计工作室工作，参与国际建筑设计竞赛。', ARRAY['High school diploma with art portfolio','HSK Level 5 or above','Drawing aptitude test','Personal statement','Two recommendation letters'], ARRAY['具有艺术作品集的高中文凭','HSK五级及以上','绘画能力测试','个人陈述','两封推荐信'], ARRAY['Architectural Design Studio','History of Chinese Architecture','Structural Mechanics','Urban Planning','Building Technology','Landscape Architecture','Design Thesis'], ARRAY['建筑设计工作室','中国建筑史','结构力学','城市规划','建筑技术','景观建筑','设计毕业论文'], TRUE, 'September', NULL, NULL, NULL);

-- Scholarships (10 rows)
INSERT INTO scholarships (slug, name, name_cn, type, degree_levels, eligible_regions, duration, description, description_cn, coverage, coverage_cn, requirements, requirements_cn, application_process, application_process_cn, deadline, application_method, application_method_cn) VALUES ('confucius-institute-scholarship', 'Confucius Institute Scholarship', '孔子学院奖学金', 'Full', ARRAY['Language Student (1 semester)','Language Student (1 year)','Bachelor in Chinese Language','Master in Teaching Chinese'], 'All countries with Confucius Institutes', '1 semester to 4 years depending on program', 'The Confucius Institute Scholarship is established by the Confucius Institute Headquarters (Hanban) to support international students, scholars, and Chinese language teachers to study Chinese language and culture at Chinese universities. It is one of the most accessible scholarships for those interested in Chinese language studies.', '孔子学院奖学金由孔子学院总部（汉办）设立，支持国际学生、学者和中文教师在中国大学学习汉语和中国文化。对于有意学习中文的学生来说，这是最容易获得的奖学金之一。', ARRAY['Tuition','Accommodation','Stipend','Medical Insurance'], ARRAY['学费','住宿','生活费','医疗保险'], ARRAY['Be a non-Chinese citizen aged 16-35 (language students 16-35, MTCSOL under 45)','Have HSK test scores (level varies by program)','Recommended by a Confucius Institute or related institution','Good academic record and health'], ARRAY['非中国籍公民，16-35岁（语言生16-35岁，汉语国际教育硕士45岁以下）','拥有HSK成绩（等级因项目而异）','由孔子学院或相关机构推荐','学业成绩优良，身体健康'], ARRAY['Apply through a Confucius Institute in your home country or via the Confucius Institute Scholarship online system.'], ARRAY['通过驻在国的孔子学院或孔子学院奖学金在线系统申请。'], 'March — May', 'Apply through a Confucius Institute in your home country or via the Confucius Institute Scholarship online system.', '通过驻在国的孔子学院或孔子学院奖学金在线系统申请。');
INSERT INTO scholarships (slug, name, name_cn, type, degree_levels, eligible_regions, duration, description, description_cn, coverage, coverage_cn, requirements, requirements_cn, application_process, application_process_cn, deadline, application_method, application_method_cn) VALUES ('csc-great-wall-program', 'Chinese Government Scholarship — Great Wall Program', '中国政府奖学金——长城项目', 'Full', ARRAY['General Scholar','Senior Scholar'], 'Developing countries and UNESCO member states', '1 academic year', 'The Great Wall Scholarship Program is established by the Ministry of Education for candidates recommended by the United Nations Educational, Scientific and Cultural Organization (UNESCO). It supports general and senior scholars from developing countries to conduct research at Chinese universities.', '长城奖学金项目由教育部设立，面向联合国教科文组织推荐的候选人。支持发展中国家的普通和高级进修生在中国大学进行研修。', ARRAY['Tuition','Accommodation','Stipend','Medical Insurance'], ARRAY['学费','住宿','生活费','医疗保险'], ARRAY['Be a citizen of a developing country','Nominated by UNESCO or recommended by your country''s UNESCO commission','For General Scholar: at least 2 years of undergraduate study, under age 45','For Senior Scholar: Master degree or above, under age 50','Good health and no criminal record'], ARRAY['发展中国家公民','由联合国教科文组织提名或本国教科文组织全国委员会推荐','普通进修生：至少2年本科学习，45岁以下','高级进修生：硕士及以上学位，50岁以下','身体健康，无犯罪记录'], ARRAY['Apply through UNESCO or your country''s National Commission for UNESCO.'], ARRAY['通过联合国教科文组织或本国教科文组织全国委员会申请。'], 'January — April', 'Apply through UNESCO or your country''s National Commission for UNESCO.', '通过联合国教科文组织或本国教科文组织全国委员会申请。');
INSERT INTO scholarships (slug, name, name_cn, type, degree_levels, eligible_regions, duration, description, description_cn, coverage, coverage_cn, requirements, requirements_cn, application_process, application_process_cn, deadline, application_method, application_method_cn) VALUES ('shanghai-government-scholarship', 'Shanghai Government Scholarship', '上海市外国留学生奖学金', 'Partial', ARRAY['Bachelor','Master','PhD','Language Student'], 'All countries', '1 academic year (renewable)', 'The Shanghai Government Scholarship is established by the Shanghai Municipal Education Commission. It offers three types of scholarships — Type A (full scholarship), Type B (partial scholarship for tuition), and Type C (partial scholarship for outstanding students already in Shanghai). It is one of the most popular provincial-level scholarships.', '上海市外国留学生奖学金由上海市教育委员会设立。提供三类奖学金——A类（全额奖学金）、B类（部分学费奖学金）和C类（在沪优秀学生部分奖学金）。是最受欢迎的省级奖学金之一。', ARRAY['Tuition (partial or full)','Living allowance (Type A)'], ARRAY['学费（部分或全额）','生活费（A类）'], ARRAY['Be a non-Chinese citizen in good health','Applying to or studying at a Shanghai university','Type A: excellent academic record, under age 30 (Bachelor), 35 (Master), 40 (PhD)','Type B: good academic performance','Type C: continuing students with outstanding academic results'], ARRAY['非中国籍公民，身体健康','申请或正在上海高校就读','A类：学业成绩优异，30岁以下（学士），35岁以下（硕士），40岁以下（博士）','B类：学业成绩良好','C类：在校生学业成绩突出'], ARRAY['Apply through the international student office of your target or current Shanghai university.'], ARRAY['通过目标或就读的上海高校留学生办公室申请。'], 'January — April', 'Apply through the international student office of your target or current Shanghai university.', '通过目标或就读的上海高校留学生办公室申请。');
INSERT INTO scholarships (slug, name, name_cn, type, degree_levels, eligible_regions, duration, description, description_cn, coverage, coverage_cn, requirements, requirements_cn, application_process, application_process_cn, deadline, application_method, application_method_cn) VALUES ('belt-and-road-scholarship', 'Belt and Road Scholarship', '"一带一路"奖学金', 'Full', ARRAY['Bachelor','Master','PhD'], 'Belt and Road Initiative partner countries', '4-5 years (Bachelor), 2-3 years (Master), 3-4 years (PhD)', 'The Belt and Road Scholarship is a national-level initiative to support students from countries along the Belt and Road to study in China. It focuses on disciplines aligned with BRI cooperation areas including engineering, infrastructure, trade, and international relations. The scholarship is administered through designated Chinese universities.', '"一带一路"奖学金是国家级倡议，支持"一带一路"沿线国家学生来华留学。侧重于与"一带一路"合作领域相关的学科，包括工程、基础设施、贸易和国际关系。该奖学金通过指定的中国大学管理。', ARRAY['Tuition','Accommodation','Stipend','Medical Insurance'], ARRAY['学费','住宿','生活费','医疗保险'], ARRAY['Be a citizen of a Belt and Road partner country','Meet the academic requirements for the chosen degree level','For Bachelor: high school graduate under age 25','For Master: Bachelor degree holder under age 35','For PhD: Master degree holder under age 40','Priority given to students in BRI-related fields'], ARRAY['"一带一路"合作伙伴国家公民','满足所选学位层次的学术要求','学士学位：高中毕业，25岁以下','硕士学位：持有学士学位，35岁以下','博士学位：持有硕士学位，40岁以下','优先考虑"一带一路"相关领域的学生'], ARRAY['Apply directly to designated Chinese universities that offer the Belt and Road Scholarship, or through the Chinese embassy in your country.'], ARRAY['直接向提供"一带一路"奖学金的指定中国大学申请，或通过驻在国中国使馆申请。'], 'January — April (varies by university)', 'Apply directly to designated Chinese universities that offer the Belt and Road Scholarship, or through the Chinese embassy in your country.', '直接向提供"一带一路"奖学金的指定中国大学申请，或通过驻在国中国使馆申请。');
INSERT INTO scholarships (slug, name, name_cn, type, degree_levels, eligible_regions, duration, description, description_cn, coverage, coverage_cn, requirements, requirements_cn, application_process, application_process_cn, deadline, application_method, application_method_cn) VALUES ('csc-bilateral-program', 'Chinese Government Scholarship — Bilateral Program', '中国政府奖学金——双边项目', 'Full', ARRAY['Bachelor','Master','PhD','General Scholar','Senior Scholar'], 'All countries with diplomatic relations with China', '4-5 years (Bachelor), 2-3 years (Master), 3-4 years (PhD)', 'The Chinese Government Scholarship Bilateral Program is the most prestigious and comprehensive scholarship for international students. It is established by the Ministry of Education of China to support outstanding international students pursuing degrees at Chinese universities. The program covers all major expenses and provides a generous monthly stipend.', '中国政府奖学金双边项目是面向国际学生最权威、最全面的奖学金。由中国教育部设立，旨在支持优秀国际学生在中国大学攻读学位。该项目覆盖所有主要费用并提供丰厚的月度生活费。', ARRAY['Tuition','Accommodation','Stipend','Medical Insurance'], ARRAY['学费','住宿','生活费','医疗保险'], ARRAY['Be a citizen of a country other than China and in good health','For Bachelor programs: high school graduate under age 25','For Master programs: Bachelor degree holder under age 35','For PhD programs: Master degree holder under age 40','Meet the language requirements of the program (HSK or IELTS/TOEFL)','Not receiving any other Chinese government scholarship'], ARRAY['非中国籍公民，身体健康','学士学位项目：高中毕业，25岁以下','硕士学位项目：持有学士学位，35岁以下','博士学位项目：持有硕士学位，40岁以下','满足项目的语言要求（HSK或IELTS/TOEFL）','未获得其他中国政府奖学金'], ARRAY['Apply through the Chinese embassy/consulate in your home country or directly to the target university via the CSC online application system.'], ARRAY['通过驻在国中国使领馆申请，或通过CSC在线申请系统直接向目标大学申请。'], 'January — April (varies by country)', 'Apply through the Chinese embassy/consulate in your home country or directly to the target university via the CSC online application system.', '通过驻在国中国使领馆申请，或通过CSC在线申请系统直接向目标大学申请。');
INSERT INTO scholarships (slug, name, name_cn, type, degree_levels, eligible_regions, duration, description, description_cn, coverage, coverage_cn, requirements, requirements_cn, application_process, application_process_cn, deadline, application_method, application_method_cn) VALUES ('csc-eu-program', 'Chinese Government Scholarship — EU Program', '中国政府奖学金——中欧项目', 'Full', ARRAY['Bachelor','Master','PhD'], 'European Union member states', '4-5 years (Bachelor), 2-3 years (Master), 3-4 years (PhD)', 'The EU Program is a special category under the Chinese Government Scholarship exclusively for citizens of European Union member states. It aims to strengthen educational exchange and cooperation between China and the EU, supporting students in undergraduate, postgraduate, and doctoral studies.', '中欧项目是中国政府奖学金下的专项类别，专门面向欧盟成员国公民。旨在加强中欧教育交流与合作，支持学生进行本科、研究生和博士阶段的学习。', ARRAY['Tuition','Accommodation','Stipend','Medical Insurance'], ARRAY['学费','住宿','生活费','医疗保险'], ARRAY['Be a citizen of an EU member state','For Bachelor: high school graduate under age 25','For Master: Bachelor degree holder under age 35','For PhD: Master degree holder under age 40','Meet language proficiency requirements','Not currently holding another Chinese government scholarship'], ARRAY['欧盟成员国公民','学士学位：高中毕业，25岁以下','硕士学位：持有学士学位，35岁以下','博士学位：持有硕士学位，40岁以下','满足语言能力要求','未持有其他中国政府奖学金'], ARRAY['Apply through the Chinese embassy in your EU member state or via the CSC online system.'], ARRAY['通过驻欧盟成员国的中国使馆或CSC在线系统申请。'], 'February — April', 'Apply through the Chinese embassy in your EU member state or via the CSC online system.', '通过驻欧盟成员国的中国使馆或CSC在线系统申请。');
INSERT INTO scholarships (slug, name, name_cn, type, degree_levels, eligible_regions, duration, description, description_cn, coverage, coverage_cn, requirements, requirements_cn, application_process, application_process_cn, deadline, application_method, application_method_cn) VALUES ('maritime-scholarship-program', 'Maritime Scholarship Program', '中国政府海事奖学金', 'Full', ARRAY['Bachelor','Master','PhD'], 'All countries (priority to developing maritime nations)', '4-5 years (Bachelor), 2-3 years (Master), 3-4 years (PhD)', 'The Maritime Scholarship Program is a specialized scholarship for international students interested in maritime studies, oceanography, naval architecture, marine engineering, and related fields. Administered by designated maritime universities in China, it aims to cultivate global maritime talent and promote international cooperation in ocean-related fields.', '中国政府海事奖学金是面向有意从事海事研究、海洋学、船舶与海洋工程及相关领域学习的国际学生的专项奖学金。由中国指定的海事大学管理，旨在培养全球海事人才，促进海洋领域的国际合作。', ARRAY['Tuition','Accommodation','Stipend','Medical Insurance'], ARRAY['学费','住宿','生活费','医疗保险'], ARRAY['Be a non-Chinese citizen in good health','For Bachelor: high school graduate under age 25','For Master: Bachelor degree in related field, under age 35','For PhD: Master degree in related field, under age 40','Interest in maritime/ocean studies','Recommended by your home country or institution'], ARRAY['非中国籍公民，身体健康','学士：高中毕业，25岁以下','硕士：相关领域学士学位，35岁以下','博士：相关领域硕士学位，40岁以下','对海事/海洋研究有兴趣','由本国或所在机构推荐'], ARRAY['Apply through designated maritime universities in China or the Chinese embassy in your country.'], ARRAY['通过中国指定的海事大学或驻在国中国使馆申请。'], 'January — April', 'Apply through designated maritime universities in China or the Chinese embassy in your country.', '通过中国指定的海事大学或驻在国中国使馆申请。');
INSERT INTO scholarships (slug, name, name_cn, type, degree_levels, eligible_regions, duration, description, description_cn, coverage, coverage_cn, requirements, requirements_cn, application_process, application_process_cn, deadline, application_method, application_method_cn) VALUES ('mofcom-scholarship', 'MOFCOM Scholarship', '商务部奖学金', 'Full', ARRAY['Master','PhD'], 'Developing countries (specific list varies annually)', '2-3 years (Master), 3-4 years (PhD)', 'The MOFCOM Scholarship is established by the Ministry of Commerce of China to support talented individuals from developing countries to pursue Master''s or PhD degrees in Economics, Business, and related fields at prestigious Chinese universities. It is one of the most generous scholarships, including round-trip international airfare.', '商务部奖学金由中国商务部设立，支持发展中国家的优秀人才在中国知名大学攻读经济学、商业及相关领域的硕士或博士学位。这是最丰厚的奖学金之一，包括往返国际机票。', ARRAY['Tuition','Accommodation','Stipend','Medical Insurance','Round-trip Airfare'], ARRAY['学费','住宿','生活费','医疗保险','往返机票'], ARRAY['Be a citizen of a developing country on the MOFCOM list','Bachelor degree holder under age 45 for Master programs','Master degree holder for PhD programs','At least 3 years of work experience','Good English proficiency (IELTS 6.0+ or equivalent)','Recommended by your government'], ARRAY['商务部名单上发展中国家的公民','硕士学位项目：持有学士学位，45岁以下','博士学位项目：持有硕士学位','至少3年工作经验','良好的英语能力（雅思6.0+或同等水平）','由本国政府推荐'], ARRAY['Apply through the Economic and Commercial Counsellor''s Office of the Chinese Embassy in your country.'], ARRAY['通过驻在国中国使馆经济商务参赞处申请。'], 'January — April', 'Apply through the Economic and Commercial Counsellor''s Office of the Chinese Embassy in your country.', '通过驻在国中国使馆经济商务参赞处申请。');
INSERT INTO scholarships (slug, name, name_cn, type, degree_levels, eligible_regions, duration, description, description_cn, coverage, coverage_cn, requirements, requirements_cn, application_process, application_process_cn, deadline, application_method, application_method_cn) VALUES ('csc-aun-program', 'Chinese Government Scholarship — AUN Program', '中国政府奖学金——东盟大学网络项目', 'Full', ARRAY['Master','PhD'], 'ASEAN member states (through AUN member universities)', '2-3 years (Master), 3-4 years (PhD)', 'The AUN Program is a special category under the Chinese Government Scholarship designed for students from ASEAN member states. It is managed through the ASEAN University Network (AUN) and supports postgraduate studies at top Chinese universities. The program aims to strengthen China-ASEAN educational cooperation.', '东盟大学网络项目是中国政府奖学金下的专项类别，面向东盟成员国学生。通过东盟大学网络（AUN）管理，支持在顶尖中国大学的研究生学习。旨在加强中国-东盟教育合作。', ARRAY['Tuition','Accommodation','Stipend','Medical Insurance'], ARRAY['学费','住宿','生活费','医疗保险'], ARRAY['Be a citizen of an ASEAN member state','Recommended by an AUN member university','For Master: Bachelor degree holder under age 35','For PhD: Master degree holder under age 40','Meet language proficiency requirements'], ARRAY['东盟成员国公民','由AUN成员大学推荐','硕士：持有学士学位，35岁以下','博士：持有硕士学位，40岁以下','满足语言能力要求'], ARRAY['Apply through an AUN member university in your country, which will nominate you to the AUN Secretariat.'], ARRAY['通过本国的AUN成员大学申请，由该大学向AUN秘书处提名。'], 'January — March', 'Apply through an AUN member university in your country, which will nominate you to the AUN Secretariat.', '通过本国的AUN成员大学申请，由该大学向AUN秘书处提名。');
INSERT INTO scholarships (slug, name, name_cn, type, degree_levels, eligible_regions, duration, description, description_cn, coverage, coverage_cn, requirements, requirements_cn, application_process, application_process_cn, deadline, application_method, application_method_cn) VALUES ('beijing-government-scholarship', 'Beijing Government Scholarship', '北京市外国留学生奖学金', 'Partial', ARRAY['Bachelor','Master','PhD','Language Student'], 'All countries', '1 academic year (renewable)', 'The Beijing Government Scholarship is a municipal-level scholarship established by the Beijing Municipal Government to attract outstanding international students to study at universities in Beijing. It provides partial or full tuition coverage and is available for all degree levels.', '北京市外国留学生奖学金是北京市政府设立的市级奖学金，旨在吸引优秀国际学生到北京的高校学习。提供部分或全额学费资助，适用于所有学位层次。', ARRAY['Tuition (partial or full)'], ARRAY['学费（部分或全额）'], ARRAY['Be a non-Chinese citizen in good health','Applying to or currently studying at a Beijing university','Good academic performance','For new students: meet the university admission requirements','For continuing students: GPA requirements vary by university'], ARRAY['非中国籍公民，身体健康','申请或正在北京高校就读','学业成绩优良','新生：满足大学入学要求','在校生：GPA要求因大学而异'], ARRAY['Apply directly through your target or current Beijing university''s international student office.'], ARRAY['直接通过目标或就读的北京高校留学生办公室申请。'], 'February — May', 'Apply directly through your target or current Beijing university''s international student office.', '直接通过目标或就读的北京高校留学生办公室申请。');

-- ============================================
-- 14. Auth users (must be created via admin API, see scripts/bootstrap-auth.sh)
-- ============================================
-- After the admin API creates the 2 users, run this to seed admin_profile:
--   INSERT INTO admin_profiles (user_id, email, full_name, role, is_active)
--   VALUES ('<new-admin-uuid>', 'admin@sica.cn', 'SICA Admin', 'admin', true);
--
-- student_profile is auto-created by the handle_new_student_user trigger.
-- Update it with the email:
--   UPDATE student_profiles SET email = 'mlsjahid.cn@gmail.com' WHERE id = '<new-user-uuid>';
-- ============================================

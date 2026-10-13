-- ============================================================================
-- Phase 161: data-driven multi-webinar system.
--
-- webinar_sessions IS the webinars table (Phase 140 created it with slug /
-- title / session_date / join_url / status already). This migration adds
-- the columns the /webinar/[slug] landing pages need, restores the seat
-- cap + waitlist that Phase 157 removed (now per-webinar and opt-in via
-- NULL = uncapped), adds per-signup reminder sent flags for the new
-- reminder cron, seeds the Oct 20 2027-top-universities webinar, and
-- seeds the two reminder email templates.
--
-- Naming map (request → actual column):
--   starts_at          → session_date      (timestamptz, existed)
--   meet_url           → join_url          (existed)
--   subtitle           → description_en/zh (existed)
--   timezone_label     → timezone_label    (NEW — canonical IANA id)
--   seat_cap           → seat_cap          (NEW — NULL keeps Phase 157's
--                                            "uncapped" semantics for the
--                                            legacy webinar)
--   status draft/open/full/closed → registration_status (NEW — separate
--                            from the operational Scheduled/Live/... enum)
--   agenda / featured_universities / faq → NEW jsonb columns
--   webinar_signups.webinar_id → webinar_session_id (existed since Phase 140;
--                            backfilled below to the Oct 13 legacy webinar)
--
-- Idempotent: every statement is ADD COLUMN IF NOT EXISTS / IF NOT EXISTS /
-- ON CONFLICT DO UPDATE, so re-running is safe.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. webinar_sessions: registration-lifecycle + content columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.webinar_sessions
  ADD COLUMN IF NOT EXISTS seat_cap integer
    CHECK (seat_cap IS NULL OR seat_cap > 0),
  ADD COLUMN IF NOT EXISTS registration_status varchar(20) NOT NULL DEFAULT 'open'
    CHECK (registration_status IN ('draft','open','full','closed')),
  ADD COLUMN IF NOT EXISTS timezone_label varchar(64) NOT NULL DEFAULT 'Asia/Shanghai',
  ADD COLUMN IF NOT EXISTS agenda jsonb,
  ADD COLUMN IF NOT EXISTS featured_universities jsonb,
  ADD COLUMN IF NOT EXISTS faq jsonb;

CREATE INDEX IF NOT EXISTS idx_webinar_sessions_registration_status
  ON public.webinar_sessions (registration_status);

-- ---------------------------------------------------------------------------
-- 2. webinar_signups: reminder sent flags (exactly-once per recipient)
--    Seat-holders = status IN ('Registered','Attended') — Cancelled and
--    No-Show don't hold a seat (Phase 142 convention).
-- ---------------------------------------------------------------------------
ALTER TABLE public.webinar_signups
  ADD COLUMN IF NOT EXISTS reminder_24h_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_1h_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_webinar_signups_reminder_24h_pending
  ON public.webinar_signups (webinar_session_id)
  WHERE reminder_24h_sent_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_webinar_signups_reminder_1h_pending
  ON public.webinar_signups (webinar_session_id)
  WHERE reminder_1h_sent_at IS NULL;

-- ---------------------------------------------------------------------------
-- 3. webinar_waitlist: restored (Phase 157 dropped it; Phase 161 brings it
--    back per-webinar). Same shape as the Phase 142 table + country.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.webinar_waitlist (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    uuid NOT NULL REFERENCES public.webinar_sessions(id) ON DELETE CASCADE,
  email         varchar(255) NOT NULL,
  first_name    varchar(120) NOT NULL,
  last_name     varchar(120) NOT NULL DEFAULT '',
  whatsapp      varchar(40),
  country       varchar(80),
  source_page   text,
  referrer      text,
  user_agent    text,
  utm_source    varchar(255),
  utm_medium    varchar(255),
  utm_campaign  varchar(255),
  gclid         varchar(255),
  fbclid        varchar(255),
  ip_hash       varchar(64),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webinar_waitlist_session_created
  ON public.webinar_waitlist (session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_webinar_waitlist_email
  ON public.webinar_waitlist (email);

ALTER TABLE public.webinar_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert webinar waitlist" ON public.webinar_waitlist;
CREATE POLICY "Public insert webinar waitlist"
  ON public.webinar_waitlist FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read webinar waitlist" ON public.webinar_waitlist;
CREATE POLICY "Admins read webinar waitlist"
  ON public.webinar_waitlist FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins delete webinar waitlist" ON public.webinar_waitlist;
CREATE POLICY "Admins delete webinar waitlist"
  ON public.webinar_waitlist FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. Legacy row hygiene: pin the Oct 13 webinar's slug + link orphan rows.
--    Only renames when no row already owns the slug (idempotent re-runs and
--    staff-created rows both survive).
-- ---------------------------------------------------------------------------
UPDATE public.webinar_sessions
SET slug = 'webinar-2027-intake-csc'
WHERE slug <> 'webinar-2027-intake-csc'
  AND NOT EXISTS (
    SELECT 1 FROM public.webinar_sessions x WHERE x.slug = 'webinar-2027-intake-csc'
  )
  AND id = (
    SELECT id FROM public.webinar_sessions
    ORDER BY is_active DESC, created_at ASC
    LIMIT 1
  );

UPDATE public.webinar_signups
SET webinar_session_id = (
  SELECT id FROM public.webinar_sessions WHERE slug = 'webinar-2027-intake-csc'
)
WHERE webinar_session_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.webinar_sessions WHERE slug = 'webinar-2027-intake-csc'
  );

-- ---------------------------------------------------------------------------
-- 5. Seed the Oct 20 webinar. Demote the legacy row first so the partial
--    unique single-active index accepts the new is_active=true row.
-- ---------------------------------------------------------------------------
UPDATE public.webinar_sessions
SET is_active = false
WHERE is_active = true
  AND slug <> 'study-in-china-2027-top-universities';

INSERT INTO public.webinar_sessions (
  slug, title_en, title_zh, description_en, description_zh,
  session_date, session_time, duration_minutes, join_url, status,
  is_active, display_order, seat_cap, registration_status, timezone_label,
  agenda, featured_universities, faq
) VALUES (
  'study-in-china-2027-top-universities',
  'Study in China 2027: 5 Top Universities, Eligibility Check & CSCA Prep',
  '2027 留学中国：五大顶尖大学、现场资格评估与 CSCA 备考',
  'See which of 5 top universities you already qualify for — live eligibility checks, scholarship breakdowns, and CSCA exam prep for the 2027 intake.',
  '现场评估你已符合哪五所顶尖大学的录取条件——奖学金详解、现场资格评估，以及 2027 入学的 CSCA 考试备考。',
  '2026-10-20 21:00:00+08',
  '9:00 PM Beijing · 7:00 PM Dhaka',
  90,
  NULL,
  'Scheduled',
  true,
  10,
  100,
  'open',
  'Asia/Shanghai',
  -- agenda jsonb
  '[
    {"icon": "universities", "title_en": "5 featured universities for 2027", "title_zh": "2027 年五所重点大学", "body_en": "HITSZ, SCUT, UESTC, Sichuan University and NUAA — cities, English-taught programs, and how to choose between them.", "body_zh": "哈工大（深圳）、华南理工、电子科大、四川大学、南航——城市、英文授课项目，以及如何选择。"},
    {"icon": "requirements", "title_en": "Admission requirements that actually matter", "title_zh": "真正重要的录取要求", "body_en": "GPA, English scores (IELTS/TOEFL), and documents each university checks first — no fluff, straight from the 2027 requirement sheets.", "body_zh": "各校优先审核的 GPA、雅思/托福成绩与申请材料——全部来自 2027 年最新要求。"},
    {"icon": "check", "title_en": "Live eligibility check", "title_zh": "现场资格评估", "body_en": "Bring your grades and English score — we check live on air which universities you likely qualify for today.", "body_zh": "带上你的成绩和语言分数——我们在直播中现场评估你目前可能符合哪些大学。"},
    {"icon": "csca", "title_en": "CSCA exam & prep", "title_zh": "CSCA 考试与备考", "body_en": "How the CSC Scholarship assessment works, and CSCA prep — November session registration closes October 21 (Beijing time). Free practice at cscaprep.academy.", "body_zh": "CSC 奖学金评估如何运作，以及 CSCA 备考——11 月批次注册 10 月 21 日（北京时间）截止。免费练习请访问 cscaprep.academy。"},
    {"icon": "basics", "title_en": "2027 basics recap", "title_zh": "2027 入学基础回顾", "body_en": "Timeline, intakes, scholarship types and realistic budgets for the 2027 Intake — the 15-minute version.", "body_zh": "2027 入学的时间线、批次、奖学金类型与真实预算——15 分钟讲完。"}
  ]'::jsonb,
  -- featured_universities jsonb (drives BOTH the cards and the eligibility
  -- checker; `eligibility` is the machine-readable gate the client checks)
  '[
    {
      "slug": "hitsz",
      "name_en": "Harbin Institute of Technology, Shenzhen (HITSZ)",
      "name_zh": "哈尔滨工业大学（深圳）",
      "city_en": "Shenzhen", "city_zh": "深圳",
      "ranking_label": "985 · C9",
      "english_programs_en": "12 English-taught programs incl. Computer Science, Data Science, Mechanical, Civil, Environmental & Materials Engineering",
      "english_programs_zh": "12 个英文授课项目，含计算机、数据科学、机械、土木、环境、材料工程等",
      "scholarship_en": "Scholarships A–D (Tier A: full tuition + ¥1,000/month stipend)",
      "scholarship_zh": "A–D 类奖学金（A 类：全额学费 + 每月 1000 元生活补贴）",
      "requirements_en": "No fixed English cutoff for most programs — profile-based review",
      "requirements_zh": "多数项目无固定语言分数线——综合背景评估",
      "deadline": "2027-06-10",
      "eligibility": {}
    },
    {
      "slug": "scut",
      "name_en": "South China University of Technology (SCUT)",
      "name_zh": "华南理工大学",
      "city_en": "Guangzhou", "city_zh": "广州",
      "ranking_label": "985 · 211",
      "english_programs_en": "Computer Science · International Trade & Economics",
      "english_programs_zh": "计算机科学 · 国际经济与贸易",
      "scholarship_en": "Scholarships A–D",
      "scholarship_zh": "A–D 类奖学金",
      "requirements_en": "IELTS 5.5 or TOEFL 68",
      "requirements_zh": "雅思 5.5 或托福 68",
      "deadline": "2027-06-30",
      "eligibility": {"english": {"ielts": 5.5, "toefl": 68}}
    },
    {
      "slug": "uestc",
      "name_en": "University of Electronic Science & Technology of China (UESTC)",
      "name_zh": "电子科技大学",
      "city_en": "Chengdu", "city_zh": "成都",
      "ranking_label": "985 · 211",
      "english_programs_en": "Computer Science · Software Engineering · Electronic Information Engineering · Mechanical Engineering",
      "english_programs_zh": "计算机科学 · 软件工程 · 电子信息工程 · 机械工程",
      "scholarship_en": "Full scholarship: tuition + housing + insurance",
      "scholarship_zh": "全额奖学金：学费 + 住宿 + 保险",
      "requirements_en": "Profile-based review — strong STEM grades recommended",
      "requirements_zh": "综合背景评估——建议理工科成绩优良",
      "deadline": "2027-06-30",
      "eligibility": {}
    },
    {
      "slug": "sichuan-university",
      "name_en": "Sichuan University",
      "name_zh": "四川大学",
      "city_en": "Chengdu", "city_zh": "成都",
      "ranking_label": "985 · 211",
      "english_programs_en": "Software Engineering · Civil Engineering · International Business Management · Tourism Management",
      "english_programs_zh": "软件工程 · 土木工程 · 国际商务管理 · 旅游管理",
      "scholarship_en": "¥20,000/year scholarship",
      "scholarship_zh": "每年 20000 元奖学金",
      "requirements_en": "Profile-based review",
      "requirements_zh": "综合背景评估",
      "deadline": "2027-05-30",
      "eligibility": {}
    },
    {
      "slug": "nuaa",
      "name_en": "Nanjing University of Aeronautics & Astronautics (NUAA)",
      "name_zh": "南京航空航天大学",
      "city_en": "Nanjing", "city_zh": "南京",
      "ranking_label": "211",
      "english_programs_en": "AI · International Business · Aeronautical Engineering · Mechanical Engineering · Aircraft Maintenance · Electrical & Electronic Engineering",
      "english_programs_zh": "人工智能 · 国际商务 · 航空工程 · 机械工程 · 飞机维修 · 电子电气工程",
      "scholarship_en": "Tuition-free scholarship — requires a high-school average of 80+",
      "scholarship_zh": "免学费奖学金——要求高中平均分 80 分以上",
      "requirements_en": "High-school average 80+ for the tuition-free scholarship track",
      "requirements_zh": "免学费奖学金通道要求高中平均分 80 分以上",
      "deadline": "2027-05-30",
      "eligibility": {"min_gpa_percent": 80}
    }
  ]'::jsonb,
  -- faq jsonb
  '[
    {"q_en": "How do I apply for the CSC Type A scholarship?", "q_zh": "如何申请 CSC 类型 A 奖学金？", "a_en": "Type A applications go through your home country''s ministry of education (or the authority it designates), not directly through a university. We walk through the exact form, documents and deadlines live in the session.", "a_zh": "类型 A 通过本国教育部（或其指定机构）提交，而非直接向大学申请。我们会在直播中逐步讲解表格、材料与截止日期。"},
    {"q_en": "Can I register for the CSCA if there is no Chinese embassy near me?", "q_zh": "附近没有中国使馆，还能报名 CSCA 吗？", "a_en": "Yes — CSCA registration is fully online, no embassy visit needed. We show the registration flow step by step, and free practice is available at cscaprep.academy.", "a_zh": "可以——CSCA 报名完全在线，无需前往使馆。我们会逐步演示报名流程，免费练习请访问 cscaprep.academy。"},
    {"q_en": "Which intake does this webinar cover?", "q_zh": "本次讲座涵盖哪个入学批次？", "a_en": "The 2027 Intake — everything from preparation now through the application windows that stay open into mid-2027.", "a_zh": "2027 入学批次——从现在开始准备，直到 2027 年年中截止的所有申请窗口。"}
  ]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  title_zh = EXCLUDED.title_zh,
  description_en = EXCLUDED.description_en,
  description_zh = EXCLUDED.description_zh,
  session_date = EXCLUDED.session_date,
  session_time = EXCLUDED.session_time,
  duration_minutes = EXCLUDED.duration_minutes,
  status = EXCLUDED.status,
  seat_cap = EXCLUDED.seat_cap,
  timezone_label = EXCLUDED.timezone_label,
  agenda = EXCLUDED.agenda,
  featured_universities = EXCLUDED.featured_universities,
  faq = EXCLUDED.faq,
  updated_at = now();
  -- join_url + is_active intentionally NOT overwritten on conflict — staff
  -- may have already pasted a meeting link or toggled active state by hand.

-- ---------------------------------------------------------------------------
-- 6. Email templates: 24h + 1h reminders (bilingual single-block bodies,
--    Phase 124b convention). joinLink / dateLabel / timeLabel arrive from
--    the webinar_sessions row at send time.
-- ---------------------------------------------------------------------------
INSERT INTO public.email_templates (
  slug, name, description, category,
  subject, body_text, subject_zh, body_text_zh,
  variables, is_active, step_index, delay_ms
) VALUES (
  'webinar.reminder_24h',
  'Webinar reminder (24 hours before)',
  'Phase 161: reminder sent 24h before a webinar starts. Carries the join link.',
  'oneoff',
  'Reminder: your SICA webinar starts tomorrow',
  'Hi {{name}},

This is your 24-hour reminder for:

{{webinarTitle}}
DATE: {{dateLabel}}
TIME: {{timeLabel}}

JOIN LINK: {{joinLink}}

If you cannot attend live, reply to this email and we will send you the recap.

See you tomorrow,
SICA Study in China Academy
https://studyinchina.academy

---
您好 {{name}}，

您的讲座将于 24 小时后开始：

{{webinarTitle}}
日期：{{dateLabel}}
时间：{{timeLabel}}

会议链接：{{joinLink}}

如无法参加直播，请直接回复本邮件，我们会发送回顾内容。

SICA Study in China Academy
https://studyinchina.academy',
  '提醒：SICA 讲座明天开始',
  'Hi {{name}},

This is your 24-hour reminder for:

{{webinarTitle}}
DATE: {{dateLabel}}
TIME: {{timeLabel}}

JOIN LINK: {{joinLink}}

If you cannot attend live, reply to this email and we will send you the recap.

See you tomorrow,
SICA Study in China Academy
https://studyinchina.academy

---
您好 {{name}}，

您的讲座将于 24 小时后开始：

{{webinarTitle}}
日期：{{dateLabel}}
时间：{{timeLabel}}

会议链接：{{joinLink}}

如无法参加直播，请直接回复本邮件，我们会发送回顾内容。

SICA Study in China Academy
https://studyinchina.academy',
  jsonb_build_array('name','webinarTitle','dateLabel','timeLabel','joinLink'),
  true, 0, 0
),
(
  'webinar.reminder_1h',
  'Webinar reminder (1 hour before)',
  'Phase 161: final reminder sent 1h before a webinar starts. Carries the join link.',
  'oneoff',
  'Starting soon: your SICA webinar (1 hour)',
  'Hi {{name}},

Your webinar starts in about one hour:

{{webinarTitle}}
TIME: {{timeLabel}}

JOIN NOW (link active at start time): {{joinLink}}

See you shortly,
SICA Study in China Academy
https://studyinchina.academy

---
您好 {{name}}，

讲座将于约 1 小时后开始：

{{webinarTitle}}
时间：{{timeLabel}}

立即加入（开始时间后生效）：{{joinLink}}

SICA Study in China Academy
https://studyinchina.academy',
  '即将开始：您的 SICA 讲座（1 小时）',
  'Hi {{name}},

Your webinar starts in about one hour:

{{webinarTitle}}
TIME: {{timeLabel}}

JOIN NOW (link active at start time): {{joinLink}}

See you shortly,
SICA Study in China Academy
https://studyinchina.academy

---
您好 {{name}}，

讲座将于约 1 小时后开始：

{{webinarTitle}}
时间：{{timeLabel}}

立即加入（开始时间后生效）：{{joinLink}}

SICA Study in China Academy
https://studyinchina.academy',
  jsonb_build_array('name','webinarTitle','dateLabel','timeLabel','joinLink'),
  true, 0, 0
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  subject = EXCLUDED.subject,
  body_text = EXCLUDED.body_text,
  subject_zh = EXCLUDED.subject_zh,
  body_text_zh = EXCLUDED.body_text_zh,
  variables = EXCLUDED.variables,
  is_active = EXCLUDED.is_active;

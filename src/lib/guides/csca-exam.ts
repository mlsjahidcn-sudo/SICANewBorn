import type { LocalizedGuide } from './types';

/**
 * "CSCA (China Scholastic Competency Assessment)" — flagship exam
 * guide. Target queries: "csca exam", "china scholastic competency
 * assessment", "csca exam for international students",
 * "csca exam registration", "csca vs hsk".
 *
 * The CSCA is China's new centrally-administered admissions exam for
 * international bachelor's applicants, effective from the 2026 intake.
 * Fully static content — page wrapper at /csca-exam is a plain RSC
 * (no live-data injection block, unlike the university/scholarship
 * listicles). Facts sourced from official embassy notices, university
 * international-college pages (BLCU, CUMT, GDUFS) and Shanghai gov
 * guidance published Dec 2025 – Jan 2026. Dates/fees evolve per
 * session — the copy flags the official portal as source of truth.
 */
export const cscaExamGuide: LocalizedGuide = {
  en: {
    slug: 'csca-exam',
    eyebrow: 'GUIDE · CSCA EXAM',
    title: 'CSCA Exam (China Scholastic Competency Assessment) — Complete Guide for International Students (2026)',
    description:
      'China\'s new standardized admissions exam for international bachelor\'s applicants. Subjects, format, scoring, fees, dates, exemptions, CSC scholarship requirement — and how it differs from HSK.',
    subtitle:
      'From the 2026 intake, most international applicants to Chinese bachelor\'s degrees must sit the CSCA — a centrally-administered multiple-choice exam in Professional Chinese (Humanities or STEM track) plus fundamental subjects (Mathematics, Physics, Chemistry). Held 5 times a year; ¥450 for one subject, ¥700 for two or more.',
    stats: [
      { value: '5×/year', label: 'Exam sessions' },
      { value: '5 subjects', label: '2 Chinese tracks + 3 fundamentals' },
      { value: '100 pts', label: 'Per subject — no national pass mark' },
      { value: '¥450 / ¥700', label: '1 subject / 2+ subjects' },
    ],
    quickAnswer:
      'The CSCA (China Scholastic Competency Assessment) is China\'s new standardized, centrally-administered exam for international students applying to undergraduate (bachelor\'s) programs, effective from the 2026 intake. It tests Professional Chinese (choose the Humanities Chinese or STEM Chinese track) plus fundamental subjects — Mathematics (required for everyone), Physics, and Chemistry. Every question is multiple choice, calculators are not allowed, each subject is scored out of 100, and each university sets its own score cutoffs (there is no national pass mark). The exam runs 5 sessions a year, costs ¥450 for one subject or ¥700 total for two or more, and CSC (Chinese Government Scholarship) applicants must submit CSCA scores from the 2026 intake onward.',
    keyTakeaways: [
      'CSCA is mandatory for most international bachelor\'s applicants from the 2026 intake — including CSC scholarship applicants',
      '5 subjects: Professional Chinese (Humanities or STEM track) + Mathematics (required for all) + Physics + Chemistry',
      'All multiple choice; no calculators; ~60 minutes per subject; each subject scored out of 100',
      'No national pass mark — each university sets its own cutoffs, so your target school defines your target score',
      'Held 5 times a year; registration typically closes ~15 days before each session; ¥450 (1 subject) / ¥700 (2+ subjects)',
      'Applicants to Chinese-taught language programs may be exempt with a valid HSK 4; a qualifying HSK score can also waive the Professional Chinese subject',
    ],
    sections: [
      {
        id: 'what-is-csca',
        h2: 'What is the CSCA (China Scholastic Competency Assessment)?',
        intro:
          'The CSCA is a unified, centrally-administered academic competency assessment created for international students seeking admission to Chinese universities. It launched with a global inaugural test on December 21, 2025, and applies to most international bachelor\'s applicants from the 2026 intake onward.',
        blocks: [
          {
            type: 'p',
            text: 'Before the CSCA, every Chinese university evaluated international undergraduate applicants with its own materials — high-school transcripts, personal statements, and (for some) interviews. Quality varied widely, and admission standards were effectively set school-by-school. The CSCA replaces that patchwork with one standardized exam, modeled in spirit on tests like the SAT: one sitting, one score report, comparable across universities. It is part of a wider Ministry of Education push to raise the academic quality and consistency of China\'s international student intake.',
          },
          {
            type: 'ul',
            items: [
              '**Who runs it** — administered centrally under the Ministry of Education framework; universities and Chinese embassies publish the notices for their applicants',
              '**Who it targets** — international applicants (non-Chinese citizens) applying for undergraduate (bachelor\'s) degrees in China',
              '**Since when** — inaugural global session December 21, 2025; mandatory for most applicants from the 2026 intake',
              '**Where** — at designated test centers in China and at Chinese embassies/consulates and partner institutions abroad',
              '**Format** — computer-based multiple choice only; no essays, no calculators',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'One exam, many uses: your CSCA score report can be sent to multiple universities, just like the SAT or A-Levels. That means you apply to 3–5 schools and they all read the same standardized score — no more retaking different entrance tests per university.',
          },
        ],
      },
      {
        id: 'who-needs-csca',
        h2: 'Who must take the CSCA exam — and who is exempt?',
        intro:
          'The CSCA applies to most international students applying for bachelor\'s degrees at Chinese universities from the 2026 intake. Some categories are exempt or partially exempt.',
        blocks: [
          {
            type: 'h3',
            text: 'Must sit the CSCA',
            body:
              'All international applicants to undergraduate (bachelor\'s) programs from the 2026 intake — including applicants to English-taught degree programs and applicants for the Chinese Government Scholarship (CSC), who must submit CSCA scores with their scholarship application. Mathematics is required for every candidate regardless of intended major.',
          },
          {
            type: 'h3',
            text: 'Exempt or partially exempt',
            body:
              'Applicants to Chinese-language (Chinese-taught preparatory or language) undergraduate programs may be exempt from the exam if they present a valid HSK Level 4 certificate. Separately, the Professional Chinese subject can be waived for candidates holding a qualifying HSK score — meaning strong Chinese speakers may still need to sit the fundamental subjects (Math, Physics, Chemistry) but not the language paper. Universities may grant individual waivers case-by-case, so always confirm with your target school\'s international admissions office before assuming you are exempt.',
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The exemption rules above were announced at launch and are still being applied inconsistently across universities. Never skip registration on the basis of a rumor — get the waiver in writing from the university first.',
          },
        ],
      },
      {
        id: 'csca-subjects',
        h2: 'CSCA subjects and exam format',
        intro:
          'The exam consists of two Professional Chinese tracks and three fundamental subjects. You pick the Chinese track that matches your intended degree; Mathematics is compulsory for everyone, and you add Physics and/or Chemistry depending on your program\'s requirements.',
        blocks: [
          {
            type: 'table',
            caption: 'CSCA subjects at a glance',
            columns: ['Subject', 'Questions', 'Duration', 'Who takes it'],
            rows: [
              ['Professional Chinese — Humanities track (人文中文)', '80 multiple choice', '~60 min', 'Humanities, business, arts, law, medicine-related Chinese-taught applicants'],
              ['Professional Chinese — STEM track (理工中文)', '80 multiple choice', '~60 min', 'Engineering, science, tech applicants'],
              ['Mathematics', '48 multiple choice', '~60 min', 'Everyone (compulsory)'],
              ['Physics', '48 multiple choice', '~60 min', 'Science/engineering applicants (per program requirements)'],
              ['Chemistry', '48 multiple choice', '~60 min', 'Medicine, pharmacy, chemical/bio applicants (per program requirements)'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Question type** — every subject is multiple choice only; there is no written or spoken component',
              '**Tools** — calculators are NOT allowed in any subject (including Mathematics, Physics, Chemistry)',
              '**Duration** — approximately 60 minutes per subject; subjects are sat in one exam day where scheduling allows',
              '**Language of papers** — papers assess your Chinese for academic/professional contexts; check your target program for whether it expects the Humanities or STEM Chinese track',
              '**Which subjects to pick** — your target university\'s program page lists the required subject combination (e.g. STEM Chinese + Math + Physics for engineering; Humanities Chinese + Math for business)',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Typical combos: Engineering/CS → STEM Chinese + Math + Physics. Medicine/pharmacy → STEM Chinese (or Humanities track per school) + Math + Chemistry. Business/economics → Humanities Chinese + Math. Always verify against the specific program listing — combinations are set by each university.',
          },
        ],
      },
      {
        id: 'csca-scores',
        h2: 'How is the CSCA scored?',
        intro:
          'Each subject is scored on a 100-point scale. There is no national pass mark — universities receive your score report and set their own cutoffs, so your target score depends entirely on where you apply.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Scale** — 0–100 per subject, multiple-choice scored',
              '**No national pass mark** — results serve as a reference for universities; each sets its own admission cutoffs by program and intake',
              '**Score report** — issued per candidate listing per-subject scores; you send it to the universities you apply to (and attach it to your CSC scholarship application if applicable)',
              '**Competitive benchmark** — as a planning heuristic, top-tier universities (C9/985) typically expect strong 80+ scores in required subjects, mid-tier (211 / top-300) schools commonly look for 70+, and regional universities may admit in the 60s — these are market observations, not published minimums',
              '**Multiple attempts** — you can sit a later session again; universities typically consider the score report you choose to submit',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Because cutoffs are university-specific and unpublished, the practical strategy is: pick your target schools first, ask their admissions office what CSCA scores last year\'s admitted students had, then aim 10 points above that.',
          },
        ],
      },
      {
        id: 'csca-dates',
        h2: 'CSCA exam dates and registration windows',
        intro:
          'The CSCA runs 5 sessions per year. The inaugural global session was held December 21, 2025; the 2026 calendar included January 25 and March 15 sessions with further sittings through the year. Registration typically closes about 15 days before each test.',
        blocks: [
          {
            type: 'table',
            caption: 'Session timeline (as announced at launch — confirm current dates on the official portal)',
            columns: ['Milestone', 'Timing'],
            rows: [
              ['Inaugural global test', 'December 21, 2025'],
              ['2026 sessions', 'January 25, 2026; March 15, 2026; + further sessions (5 per year, typically Jan / Mar / Apr and beyond)'],
              ['Registration window (Jan 25 session)', 'December 23, 2025 – January 10, 2026'],
              ['Registration closes', '~15 days before each test date'],
              ['For a September intake', 'Sit the winter or early-spring session of the same calendar year at the latest'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Plan backwards from your intake** — university applications for September intake run roughly November–June; your CSCA score must exist before your application deadline, so sit the earliest session that works for you',
              '**Late registrations** — windows are short and centers fill up; register as soon as the window opens rather than in the final days',
              '**2027 dates** — published on the official CSCA registration portal per session; do not assume the 2026 pattern repeats exactly',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Rule of thumb: register for the session 4–6 months before your target intake. If you miss it, the next session is usually close enough for mid-tier universities with later deadlines — but top universities with January–February deadlines will only see winter-session scores.',
          },
        ],
      },
      {
        id: 'csca-fees',
        h2: 'CSCA registration fees and payment',
        intro:
          'Fees are flat and banded by subject count: ¥450 for one subject, ¥700 total for two or more subjects. Pay via Alipay, WeChat Pay, or bank transfer during registration.',
        blocks: [
          {
            type: 'table',
            caption: 'CSCA registration fees',
            columns: ['Subjects registered', 'Fee (CNY)', 'Per-subject equivalent'],
            rows: [
              ['1 subject', '¥450', '¥450'],
              ['2 subjects', '¥700', '¥350'],
              ['3 subjects', '¥700', '~¥233'],
              ['4 subjects', '¥700', '~¥175'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Payment methods** — Alipay, WeChat Pay, or bank transfer (keep the payment confirmation — you may need it for support tickets)',
              '**One band, once** — paying ¥700 covers all your chosen subjects in that session; adding a subject is cheaper at registration time than as a later change',
              '**International payment tip** — if you have no Chinese payment account, a bank transfer from your home bank works but can take 3–5 business days to clear; start registration early to allow for this',
              '**Refunds** — treated per-session by the registration portal; assume no automatic refund for no-shows',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'At ¥700 all-in, the CSCA is dramatically cheaper than the SAT (~$70 + international fees) or a full A-Level sitting — but you must have a working Alipay/WeChat account or a bank that transfers CNY, so sort payment access before the window opens.',
          },
        ],
      },
      {
        id: 'csca-vs-hsk',
        h2: 'CSCA vs HSK — what is the difference?',
        intro:
          'The HSK tests general Chinese language proficiency; the CSCA tests academic competency in Chinese-language contexts plus fundamental subjects. They are complementary, not interchangeable — most Chinese-taught degree applicants will need both.',
        blocks: [
          {
            type: 'table',
            caption: 'CSCA vs HSK side by side',
            columns: ['Dimension', 'CSCA', 'HSK'],
            rows: [
              ['What it measures', 'Academic competency: Professional Chinese (Humanities/STEM) + Math, Physics, Chemistry', 'General Chinese language proficiency only'],
              ['Who requires it', 'Chinese universities — mandatory for most international bachelor\'s applicants from 2026', 'Chinese-taught programs; also used for scholarship language requirements'],
              ['Format', 'Multiple choice only, ~60 min per subject, no calculators', 'Listening + reading + writing sections (paper or iBT)'],
              ['Frequency', '5 sessions per year', 'Multiple sessions year-round worldwide'],
              ['Scoring', '100 points per subject; university-set cutoffs', 'Levels 1–6; HSK 4–6 is the common program threshold'],
              ['Can one replace the other?', 'No — but a valid HSK 4 can exempt Chinese-language program applicants, and a qualifying HSK can waive the Professional Chinese subject', 'No — HSK alone does not satisfy the CSCA requirement for degree admission'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Practical takeaway: if you are applying to an English-taught degree, you likely need CSCA + IELTS/TOEFL (not HSK). If you are applying to a Chinese-taught degree, plan for HSK 4–5 + CSCA fundamental subjects. Check your specific program\'s listing.',
          },
        ],
      },
      {
        id: 'csca-for-csc',
        h2: 'CSC scholarship applicants must submit CSCA scores',
        intro:
          'From the 2026 intake, applicants for the Chinese Government Scholarship (CSC) are required to sit the CSCA and submit their scores with the scholarship application — this is the single highest-stakes use of the exam.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Which applicants** — CSC bachelor\'s-degree scholarship applicants from the 2026 intake onward (embassy/Bilateral and university/Chinese University Program channels both)',
              '**Timing pressure** — CSC application deadlines cluster January–April, so a winter/early-spring CSCA session is effectively mandatory for scholarship applicants',
              '**No score, no shortlist** — CSC is the most competitive funding route in China; an missing CSCA score disqualifies the application regardless of other strengths',
              '**Strategy** — sit the earliest available session so a weak result can be retaken before CSC deadlines, exactly like planning SAT attempts before Early Decision',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Self-funded applicants can sometimes negotiate deadlines with universities; CSC deadlines do not move. If you are aiming for the CSC scholarship, your entire exam-and-application calendar must be built around the January–April window.',
          },
        ],
      },
      {
        id: 'how-to-register',
        h2: 'How to register for the CSCA — step by step',
        intro:
          'Registration is centralized through the official CSCA registration portal. The flow mirrors other standardized tests: account → session → subjects → payment → admission ticket.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Confirm your subject combination** — open your target university\'s program page and note the required CSCA subjects (e.g. STEM Chinese + Math + Physics). Do this before registering so you pay the right band once.',
              '**Find the official portal** — register only through the official CSCA registration website (the domain published in your university\'s or embassy\'s notice — Chinese official domains end in .org.cn). Beware third-party "agents" charging inflated registration fees.',
              '**Create an account** — register with your passport details exactly as printed; name mismatches between passport and admission ticket are the #1 test-day problem.',
              '**Choose session + test center** — pick the session at least 4–6 months before your intake, and the center nearest you (domestic centers in China; embassy/consulate and partner-institution centers abroad).',
              '**Select subjects + pay** — add your subjects (¥450 for one, ¥700 for 2+) and pay via Alipay, WeChat Pay, or bank transfer. Save the payment confirmation.',
              '**Download your admission ticket** — typically available shortly before the test; check it for date, time, venue, and allowed items. Print it — screens-only tickets cause problems at check-in.',
              '**Sit the exam** — bring passport + printed admission ticket + pencils/eraser as instructed. No calculators, no phones in the room. Arrive 30–45 minutes early.',
              '**Send scores to universities** — when results release, attach the score report to each university application (and the CSC scholarship application if applicable).',
            ],
          },
        ],
      },
      {
        id: 'csca-preparation',
        h2: 'How to prepare for the CSCA',
        intro:
          'The CSCA is new, so past-paper supply is thin — preparation leans on the published syllabus outline, HSK-grade academic Chinese reading, and China\'s high-school math/physics/chemistry curriculum in multiple-choice form.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Map the syllabus (week 1)** — download the subject outlines from the official portal. The fundamental subjects track the Chinese senior-high-school curriculum: if you studied A-Levels/IB/AP, most content overlaps but notation and question style differ.',
              '**Fix your weakest fundamental subject first (weeks 2–4)** — Math is compulsory for everyone and the most common weak spot. Drill multiple-choice sets under 60-minute timing; no calculator practice from day one.',
              '**Build academic Chinese reading speed (weeks 3–8, parallel)** — the Professional Chinese tracks test subject-specific vocabulary (人文 for humanities, 理工 for STEM). Read Chinese-language textbook extracts daily; HSK 4–5 vocabulary is the floor, subject terms are the differentiator.',
              '**Practice China-style MCQ technique (weeks 5–6)** — Chinese exams reward speed and pattern recognition; practice eliminating options fast and flagging-and-moving, because ~60 minutes for 48 questions gives you ~75 seconds per question.',
              '**Full timed mock (week 7)** — assemble a full sitting from syllabus-aligned MCQ banks and sit it in one day, mimicking the real schedule. Review every error against the syllabus, not just the answer.',
              '**Logistics week (week 8)** — confirm admission ticket, passport, test-center route, payment records. Sleep. Arrive early.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'SICA provides CSCA exam preparation questions and study resources as part of its application-support tiers — ask your counselor for the current prep pack and a subject-combination review before you register.',
          },
        ],
      },
      {
        id: 'csca-test-day',
        h2: 'What to expect on test day',
        intro:
          'Test-day rules follow the standard Chinese national-exam playbook: strict ID checks, no electronics, multiple-choice answer sheets only.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Bring** — original passport (the exact one used at registration), printed admission ticket, pencils + eraser as instructed on the ticket',
              '**Leave behind** — calculators (banned in all subjects), phones/smartwatches (not allowed in the exam room), notes and dictionaries',
              '**Timing** — each subject ~60 minutes; multiple subjects may be scheduled across one day — check your admission ticket for your personal timetable',
              '**Answer-sheet discipline** — all multiple choice; fill bubbles fully and check you are on the right subject code, as mis-bubbled subject codes cannot be corrected after submission',
              '**Results** — released via the registration portal per session; download the score report and forward it to universities yourself',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the CSCA exam?',
        a: 'The CSCA (China Scholastic Competency Assessment) is China\'s new standardized, centrally-administered exam for international students applying to bachelor\'s degrees, effective from the 2026 intake. It covers Professional Chinese (Humanities or STEM track) plus fundamental subjects — Mathematics (compulsory for all), Physics, and Chemistry. All questions are multiple choice, each subject is scored out of 100, and universities set their own admission cutoffs.',
      },
      {
        q: 'Who has to take the CSCA exam?',
        a: 'Most international applicants to Chinese undergraduate (bachelor\'s) programs from the 2026 intake — including CSC (Chinese Government Scholarship) applicants, who must submit CSCA scores. Applicants to Chinese-language programs may be exempt with a valid HSK 4 certificate, and a qualifying HSK score can waive the Professional Chinese subject. Master\'s and PhD applicants are not currently covered.',
      },
      {
        q: 'How much does the CSCA exam cost?',
        a: '¥450 CNY for one subject, or ¥700 CNY total for two or more subjects in the same session. Payment is via Alipay, WeChat Pay, or bank transfer during registration. Most candidates sit 3–4 subjects, so the typical total is ¥700.',
      },
      {
        q: 'When is the CSCA exam held?',
        a: 'Five sessions per year. The inaugural global test was December 21, 2025; 2026 sessions included January 25 and March 15 with further sittings through the year. Registration typically closes about 15 days before each test. For a September intake, sit the winter or early-spring session of that year at the latest — check the official portal for the current calendar.',
      },
      {
        q: 'Is there a pass mark for the CSCA?',
        a: 'No. Each subject is scored 0–100 and the results serve as a reference for universities — each university sets its own cutoffs per program. As a planning heuristic, top-tier schools often expect 80+ in required subjects, mid-tier schools 70+, and regional universities may admit in the 60s. Ask your target schools what last year\'s admits scored.',
      },
      {
        q: 'Do I need CSCA if I already have HSK 4 or HSK 5?',
        a: 'Probably yes, partially. A valid HSK 4 can exempt applicants to Chinese-language (language-taught preparatory) programs from the exam, and a qualifying HSK score can waive the Professional Chinese subject for degree applicants — but the fundamental subjects (Math, plus Physics/Chemistry per program) are generally still required. Get the specific waiver confirmed in writing by your target university.',
      },
      {
        q: 'Do English-taught programs require the CSCA?',
        a: 'Yes — the CSCA applies to international bachelor\'s applicants regardless of teaching language, including English-taught degree programs. English-taught applicants take the required subject combination (typically Mathematics plus program-specific subjects) instead of an English proficiency exemption; they still need IELTS/TOEFL for language. Confirm the exact combination with the program listing.',
      },
      {
        q: 'Can I retake the CSCA if my score is low?',
        a: 'Yes — the exam runs five sessions a year, so you can sit a later session and submit your improved score report. There is no published limit on attempts, but practical planning matters: CSC scholarship deadlines (January–April) leave little room for retakes, so sit the earliest viable session first.',
      },
      {
        q: 'Is the CSCA hard?',
        a: 'It depends on preparation, not genius. The fundamental subjects track the Chinese senior-high-school curriculum — comparable to A-Level/IB/AP foundation content — delivered as speed-oriented multiple choice (~75 seconds per question, no calculator). The differentiator for most international students is the Professional Chinese track\'s academic vocabulary. An 8-week structured prep plan is typically enough for candidates with a solid high-school background.',
      },
      {
        q: 'Where can I take the CSCA exam?',
        a: 'At designated test centers in China and at Chinese embassies/consulates and partner institutions abroad. During registration you pick the nearest available center for your session; availability varies by country and session, so register early in the window.',
      },
    ],
    howToSteps: [
      {
        name: 'Confirm your required subject combination',
        text: 'Open your target university\'s bachelor\'s program listing and note the required CSCA subjects — the Chinese track (Humanities or STEM) plus which fundamental subjects (Math always; Physics and/or Chemistry per program). Registering with the wrong combination wastes a session and a fee band.',
      },
      {
        name: 'Pick your session 4–6 months before intake',
        text: 'Work backwards from your intake: September-intake applicants should sit the winter or early-spring session. CSC scholarship applicants must sit even earlier — CSC deadlines cluster January–April and do not move.',
      },
      {
        name: 'Register on the official portal',
        text: 'Use only the official CSCA registration website (the .org.cn domain published in university/embassy notices). Create an account with passport-exact details, choose session + nearest center, select subjects, and pay ¥450 (1 subject) or ¥700 (2+ subjects) via Alipay, WeChat Pay, or bank transfer.',
      },
      {
        name: 'Prepare on an 8-week plan',
        text: 'Week 1: map the syllabus. Weeks 2–4: drill your weakest fundamental subject under 60-minute no-calculator timing. Weeks 3–8: build academic Chinese reading (subject vocabulary). Weeks 5–6: China-style MCQ technique at ~75 seconds/question. Week 7: full timed mock. Week 8: logistics + rest.',
      },
      {
        name: 'Sit the exam',
        text: 'Bring your original passport, printed admission ticket, and pencils/eraser. No calculators, phones, or notes. Each subject runs ~60 minutes; follow the personal timetable on your admission ticket and double-check subject codes when bubbling answer sheets.',
      },
      {
        name: 'Retrieve scores and submit with applications',
        text: 'When results release on the portal, download your score report and attach it to every university application — and to your CSC scholarship application if you are applying. Self-funded applicants can also include it in direct email inquiries to admissions offices.',
      },
      {
        name: 'Retake strategically if needed',
        text: 'If your score is below your target school\'s apparent range, register for the next session and resit only the weak subjects. Balance the retake against your application deadlines — a retake that lands after a deadline helps nobody.',
      },
      {
        name: 'Combine with the rest of your application package',
        text: 'CSCA scores sit alongside transcripts, language certificates (IELTS/TOEFL/HSK), a personal statement, and recommendation letters. SICA counselors map your exam calendar against your full application timeline so no deadline collides.',
      },
    ],
    ctaTitle: 'Preparing for the CSCA?',
    ctaSubtitle:
      'SICA counselors review your subject combination, build your exam-and-application calendar around CSCA sessions, and provide CSCA preparation questions and study resources. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/hsk',
        label: 'HSK Chinese proficiency test guide',
        description: 'Levels, scoring, test dates, and how HSK 4–6 unlocks Chinese-taught programs.',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'Chinese Government Scholarship (CSC)',
        description: 'Full funding: tuition + dorm + ¥2,500–3,500/month stipend + airfare. CSCA scores required from 2026.',
      },
      {
        href: '/china-university-admission-requirements',
        label: 'China university admission requirements',
        description: 'Documents, language scores, and academic requirements by degree level and program type.',
      },
    ],
  },
  zh: {
    slug: 'csca-exam',
    eyebrow: '指南 · CSCA 考试',
    title: 'CSCA 考试（中国国际学生学业能力评估）完全指南（2026）',
    description:
      '中国面向国际本科申请者的统一入学考试。科目、形式、计分、费用、时间、豁免、CSC 奖学金强制要求——以及与 HSK 的区别。',
    subtitle:
      '自 2026 级起，多数申请中国本科的国际学生须参加 CSCA——统一组织的选择题考试，含专业中文（人文/理工两轨）与基础科目（数学、物理、化学）。每年 5 次考试；单科 ¥450，两科及以上合计 ¥700。',
    stats: [
      { value: '5 次/年', label: '考试场次' },
      { value: '5 科', label: '2 条中文轨 + 3 门基础科' },
      { value: '100 分', label: '单科满分——无全国及格线' },
      { value: '¥450 / ¥700', label: '1 科 / 2 科及以上' },
    ],
    quickAnswer:
      'CSCA（中国国际学生学业能力评估）是中国自 2026 级起面向本科（学士）国际申请者实施的统一标准化入学考试。考试含专业中文（人文中文或理工中文二选一）加基础科目——数学（人人必考）、物理、化学。全部为选择题、禁用计算器；单科满分 100 分，各大学自行划定录取分数线（无全国统一及格线）。考试每年举行 5 次，单科报名费 ¥450、两科及以上合计 ¥700；自 2026 级起，中国政府奖学金（CSC）申请者必须提交 CSCA 成绩。',
    keyTakeaways: [
      '自 2026 级起，多数国际本科申请者必须参加 CSCA——含 CSC 奖学金申请者',
      '5 个科目：专业中文（人文/理工轨）+ 数学（全员必考）+ 物理 + 化学',
      '全选择题；禁用计算器；每科约 60 分钟；单科满分 100',
      '无全国及格线——各大学自划分数线，目标分数取决于目标院校',
      '每年 5 次考试；报名通常在考前约 15 天截止；¥450（1 科）/ ¥700（2 科及以上）',
      '中文授课语言项目申请者凭有效 HSK 4 可豁免；合格 HSK 成绩可免专业中文科目',
    ],
    sections: [
      {
        id: 'what-is-csca',
        h2: 'CSCA（中国国际学生学业能力评估）是什么？',
        intro:
          'CSCA 是为申请中国高校的国际学生设立的统一学术能力评估。2025 年 12 月 21 日举行全球首考，自 2026 级起对多数国际本科申请者生效。',
        blocks: [
          {
            type: 'p',
            text: '在 CSCA 之前，每所中国大学用自定材料（高中成绩单、个人陈述，部分含面试）评估国际本科申请者，标准不一。CSCA 以一场统一考试取代这一格局——类似 SAT 的思路：一次考试、一份成绩单、各校可比。这也是教育部提升国际生生源质量与一致性整体举措的一部分。',
          },
          {
            type: 'ul',
            items: [
              '**主办方**——教育部框架下统一组织；各大学与中国驻外使领馆面向各自申请者发布通知',
              '**面向人群**——申请中国本科（学士）学位的国际学生（非中国籍）',
              '**起始时间**——2025 年 12 月 21 日全球首考；自 2026 级起对多数申请者为必考',
              '**地点**——中国境内指定考点，及中国驻外使领馆与海外合作机构考点',
              '**形式**——机考/统一组织的选择题；无作文、无口试、禁用计算器',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '一考多用：CSCA 成绩单可寄送多所大学（如同 SAT 或 A-Level）。同时申请 3-5 所学校时，各校看同一份标准化成绩——无需为每所大学分别重考。',
          },
        ],
      },
      {
        id: 'who-needs-csca',
        h2: '谁必须参加 CSCA？谁可豁免？',
        intro:
          '自 2026 级起，多数申请中国本科的国际学生须参加 CSCA。部分类别可豁免或部分豁免。',
        blocks: [
          {
            type: 'h3',
            text: '必须参加',
            body:
              '自 2026 级起的所有国际本科（学士）申请者——含英文授课学位项目申请者，以及中国政府奖学金（CSC）申请者（须随奖学金申请提交 CSCA 成绩）。无论意向专业为何，数学对每位考生必考。',
          },
          {
            type: 'h3',
            text: '可豁免或部分豁免',
            body:
              '中文授课的语言类（预科/语言）本科项目申请者，凭有效 HSK 4 证书可豁免考试。另外，持合格 HSK 成绩可免考专业中文科目——即中文较好的考生可能仍需考基础科目（数学、物理、化学）但免考语言卷。大学也可个案审批豁免，务必先向目标院校国际招生办公室书面确认。',
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '以上豁免规则为启动时公布口径，各校执行尚不一致。不要凭传闻跳过报名——先拿到大学的书面豁免确认。',
          },
        ],
      },
      {
        id: 'csca-subjects',
        h2: 'CSCA 科目与考试形式',
        intro:
          '考试由两条专业中文轨与三门基础科目构成。中文轨按意向学位选择；数学人人必考，物理与化学按项目要求加选。',
        blocks: [
          {
            type: 'table',
            caption: 'CSCA 科目一览',
            columns: ['科目', '题量', '时长', '适用人群'],
            rows: [
              ['专业中文——人文中文轨', '80 道选择题', '约 60 分钟', '人文、商科、艺术、法律等中文授课申请者'],
              ['专业中文——理工中文轨', '80 道选择题', '约 60 分钟', '理工科申请者'],
              ['数学', '48 道选择题', '约 60 分钟', '全员必考'],
              ['物理', '48 道选择题', '约 60 分钟', '理工申请者（按项目要求）'],
              ['化学', '48 道选择题', '约 60 分钟', '医学、药学、化学生物类申请者（按项目要求）'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**题型**——各科均为选择题；无笔试作文、无口试',
              '**工具**——所有科目（含数学、物理、化学）禁用计算器',
              '**时长**——每科约 60 分钟；排期允许时多科可在同一考试日完成',
              '**试卷语言**——考查学术/专业语境下的中文；确认目标项目要求人文中文轨还是理工中文轨',
              '**选科**——目标大学项目页列出要求的科目组合（如理工类：理工中文 + 数学 + 物理；商科：人文中文 + 数学）',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '常见组合：工科/计算机 → 理工中文 + 数学 + 物理。医学/药学 → 理工中文（部分学校按人文轨）+ 数学 + 化学。商科/经济 → 人文中文 + 数学。组合由各大学自定，务必核对具体项目页。',
          },
        ],
      },
      {
        id: 'csca-scores',
        h2: 'CSCA 如何计分？',
        intro:
          '单科满分 100 分。无全国统一及格线——大学收到成绩单后自行划线，目标分数完全取决于申请院校。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**分值**——单科 0-100 分，选择题计分',
              '**无全国及格线**——成绩作为大学参考；各校按项目与批次自定录取线',
              '**成绩单**——按考生出具、列明各科分数；寄送给你申请的各所大学（如适用并随 CSC 奖学金申请提交）',
              '**竞争基准**——作为规划参考：顶尖高校（C9/985）通常期望必考科 80+，中游（211/前 300）常见 70+，地方院校 60 分段亦有可能录取——此为市场观察值而非公布最低线',
              '**多次考试**——可在后续场次重考；大学通常以你选择提交的成绩单为准',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '分数线因校而异且不公开，实操策略是：先定目标院校 → 询问招生办上年录取者的 CSCA 分数 → 目标定在该分数 +10 分。',
          },
        ],
      },
      {
        id: 'csca-dates',
        h2: 'CSCA 考试时间与报名窗口',
        intro:
          'CSCA 每年举行 5 次。全球首考为 2025 年 12 月 21 日；2026 年日历含 1 月 25 日与 3 月 15 日场次，年内另有后续场次。报名通常在考前约 15 天截止。',
        blocks: [
          {
            type: 'table',
            caption: '场次时间线（启动时公布口径——最新日期以官方门户为准）',
            columns: ['节点', '时间'],
            rows: [
              ['全球首考', '2025 年 12 月 21 日'],
              ['2026 年场次', '2026 年 1 月 25 日；3 月 15 日；及后续场次（每年 5 次，通常 1 月/3 月/4 月等）'],
              ['报名窗口（1 月 25 日场）', '2025 年 12 月 23 日 – 2026 年 1 月 10 日'],
              ['报名截止', '考前约 15 天'],
              ['对应 9 月入学', '最迟参加同年冬季或早春场次'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**从入学时间倒推**——9 月入学的大学申请约为 11 月至次年 6 月滚动进行；成绩须在申请截止前拿到，所以尽早选场',
              '**报名节奏**——窗口短、考位有限；窗口一开就报，别拖到最后几天',
              '**2027 年日期**——按场次在官方报名门户公布；不要假设 2026 年节奏完全复刻',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '经验法则：在目标入学前 4-6 个月的那场考试报名。错过则下一场通常仍赶得上截止较晚的中游院校——但 1-2 月就截止的顶尖大学只看得到冬季场成绩。',
          },
        ],
      },
      {
        id: 'csca-fees',
        h2: 'CSCA 报名费与支付',
        intro:
          '费用按科目数分档：单科 ¥450，两科及以上合计 ¥700。报名时通过支付宝、微信支付或银行转账支付。',
        blocks: [
          {
            type: 'table',
            caption: 'CSCA 报名费',
            columns: ['报考科目数', '费用（人民币）', '折合单科'],
            rows: [
              ['1 科', '¥450', '¥450'],
              ['2 科', '¥700', '¥350'],
              ['3 科', '¥700', '约 ¥233'],
              ['4 科', '¥700', '约 ¥175'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**支付方式**——支付宝、微信支付或银行转账（保留支付凭证，售后申诉可能需要）',
              '**一档一次**——¥700 覆盖当次所选全部科目；在报名时加科比事后变更更省',
              '**境外支付提示**——无国内支付账户者可从本国银行跨境转账，但到账可能需 3-5 个工作日；尽早开始报名留足时间',
              '**退款**——由报名门户按场次处理；缺考默认不自动退款',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '合计 ¥700 的 CSCA 远比 SAT（约 $70 加国际附加费）或整轮 A-Level 便宜——但你需要可用的支付宝/微信账户或能转人民币的银行，报名窗口开启前先解决支付通道。',
          },
        ],
      },
      {
        id: 'csca-vs-hsk',
        h2: 'CSCA 与 HSK 有什么区别？',
        intro:
          'HSK 考通用汉语水平；CSCA 考中文语境下的学术能力加基础学科。两者互补、不可互换——多数中文授课学位申请者两个都需要。',
        blocks: [
          {
            type: 'table',
            caption: 'CSCA 与 HSK 对比',
            columns: ['维度', 'CSCA', 'HSK'],
            rows: [
              ['考什么', '学术能力：专业中文（人文/理工）+ 数学、物理、化学', '仅通用汉语水平'],
              ['谁要求', '中国大学——自 2026 级起多数国际本科申请者必考', '中文授课项目；也用于奖学金语言要求'],
              ['形式', '仅选择题，每科约 60 分钟，禁计算器', '听力 + 阅读 + 书写（纸质或 iBT）'],
              ['频次', '每年 5 次', '全球全年多场次'],
              ['计分', '单科 100 分；大学自划线', '1-6 级；项目门槛常见 HSK 4-6'],
              ['能否互相替代？', '不能——但有效 HSK 4 可豁免语言类项目申请者，合格 HSK 可免专业中文科目', '不能——仅 HSK 不满足学位入学的 CSCA 要求'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '实用结论：申请英文授课学位 → 大概率需要 CSCA + 雅思/托福（而非 HSK）。申请中文授课学位 → 规划 HSK 4-5 + CSCA 基础科目。以具体项目页为准。',
          },
        ],
      },
      {
        id: 'csca-for-csc',
        h2: 'CSC 奖学金申请者必须提交 CSCA 成绩',
        intro:
          '自 2026 级起，中国政府奖学金（CSC）申请者必须参加 CSCA 并随奖学金申请提交成绩——这是该考试风险最高的用途。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**适用人群**——2026 级起的 CSC 本科奖学金申请者（使馆/双边渠道与大学/中国大学项目渠道均适用）',
              '**时间压力**——CSC 申请截止集中在 1-4 月，因此冬季/早春 CSCA 场次对奖学金申请者事实上是必选项',
              '**无成绩即出局**——CSC 是中国竞争最激烈的资助渠道；无论其他条件多强，缺 CSCA 成绩即不符合资格',
              '**策略**——尽早参加最早可用场次，若成绩不理想还能在 CSC 截止前重考——与「早申前刷 SAT」同一套打法',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '自费申请者有时可与大学协商截止日；CSC 截止日不会动。若目标是 CSC 奖学金，整个考试与申请日程必须围绕 1-4 月窗口排布。',
          },
        ],
      },
      {
        id: 'how-to-register',
        h2: 'CSCA 报名流程——逐步操作',
        intro:
          '报名经官方 CSCA 报名门户集中办理。流程与其他标准化考试一致：注册账号 → 选场次 → 选科目 → 支付 → 下载准考证。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**确认科目组合**——打开目标大学项目页，记下要求的 CSCA 科目（如理工中文 + 数学 + 物理）。报名前确认，一次付对费用档。',
              '**找到官方门户**——只通过官方 CSCA 报名网站报名（以大学或使馆通知中公布的域名为准——中国官方域名为 .org.cn）。警惕收取高额「代办费」的第三方中介。',
              '**注册账号**——用护照信息逐字注册；护照与准考证姓名不一致是考日头号问题。',
              '**选场次与考点**——选距离入学 4-6 个月以上的场次，选最近的考点（境内考点；境外为使领馆及合作机构考点）。',
              '**选科目并支付**——加选科目（单科 ¥450，两科及以上 ¥700），用支付宝、微信支付或银行转账付款。保存支付凭证。',
              '**下载准考证**——通常考前不久开放；核对日期、时间、地点与携带物品。打印纸质版——仅凭屏幕截图入场容易出问题。',
              '**参加考试**——携带护照 + 纸质准考证 + 按要求的铅笔/橡皮。禁计算器、禁手机入场。提前 30-45 分钟到场。',
              '**寄送成绩**——成绩发布后，把成绩单附到每所大学的申请材料中（如适用并附到 CSC 奖学金申请）。',
            ],
          },
        ],
      },
      {
        id: 'csca-preparation',
        h2: 'CSCA 备考方法',
        intro:
          'CSCA 是新考试，真题存量少——备考以官方公布的考试大纲、HSK 级别的学术中文阅读、以及中国高中数学/物理/化学课程的选择题化训练为主。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**第 1 周：梳理大纲**——从官方门户下载各科大纲。基础科目对标中国高中课程：学过 A-Level/IB/AP 者多数内容重叠，但符号体系与题型风格不同。',
              '**第 2-4 周：先补最弱的基础科目**——数学人人必考也最常见短板。限时 60 分钟刷选择题；从第一天起就按「无计算器」训练。',
              '**第 3-8 周（并行）：提升学术中文阅读速度**——专业中文轨考学科词汇（人文 / 理工）。每天读中文教材选段；HSK 4-5 词汇是地板，学科词汇才是拉开差距处。',
              '**第 5-6 周：练中式选择题技巧**——中国考试重速度与题型识别；练快速排除选项与标记跳题，48 题约 60 分钟意味着每题约 75 秒。',
              '**第 7 周：整卷限时模考**——用对齐大纲的题库拼一套全真卷，按真实日程一天考完。逐题复盘错误对应的大纲点，而非只对答案。',
              '**第 8 周：后勤周**——确认准考证、护照、考点路线、支付记录。睡好。早到。',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'SICA 在其申请支持服务档位中提供 CSCA 备考题库与学习资料——报名前找顾问领取当前备考资料包并做一次科目组合复核。',
          },
        ],
      },
      {
        id: 'csca-test-day',
        h2: '考试日须知',
        intro:
          '考试日规则遵循中国国家级考试的标准打法：严格核验身份证件、禁带电子设备、仅选择题答题卡。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**必带**——报名所用护照原件、纸质准考证、按要求准备的铅笔与橡皮',
              '**禁带**——计算器（所有科目禁用）、手机/智能手表（不得带入考场）、笔记与词典',
              '**时间**——每科约 60 分钟；多科可能排同一天——以准考证上的个人时间表为准',
              '**答题卡规范**——全部为选择题；涂满选项并核对科目代码正确，科目代码涂错提交后无法更正',
              '**成绩**——按场次在报名门户发布；自行下载成绩单并寄送各大学',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'CSCA 考试是什么？',
        a: 'CSCA（中国国际学生学业能力评估）是中国自 2026 级起面向本科（学士）国际申请者实施的统一标准化入学考试。考试含专业中文（人文或理工轨）加基础科目——数学（全员必考）、物理、化学。全部选择题，单科满分 100 分，各大学自行划线。',
      },
      {
        q: '谁必须参加 CSCA？',
        a: '自 2026 级起多数申请中国本科的国际学生——含须提交 CSCA 成绩的 CSC（中国政府奖学金）申请者。中文授课语言项目申请者凭有效 HSK 4 可豁免；合格 HSK 成绩可免专业中文科目。硕士与博士申请者目前不在范围内。',
      },
      {
        q: 'CSCA 报名费多少？',
        a: '单科 ¥450，同一场次两科及以上合计 ¥700。报名时通过支付宝、微信支付或银行转账支付。多数考生考 3-4 科，典型总费用为 ¥700。',
      },
      {
        q: 'CSCA 什么时候考？',
        a: '每年 5 次。全球首考为 2025 年 12 月 21 日；2026 年含 1 月 25 日与 3 月 15 日场次，年内另有后续场次。报名通常考前约 15 天截止。对应 9 月入学最迟参加同年冬季或早春场次——最新日历以官方门户为准。',
      },
      {
        q: 'CSCA 有及格线吗？',
        a: '没有。单科 0-100 分，成绩仅作为大学参考——各校按项目自行划线。规划参考：顶尖院校常期望必考科 80+，中游 70+，地方院校 60 分段亦有可能。直接询问目标院校上年录取分数最可靠。',
      },
      {
        q: '已有 HSK 4 或 HSK 5 还要考 CSCA 吗？',
        a: '大概率仍需（部分）。有效 HSK 4 可豁免中文授课语言类项目的考试；合格 HSK 成绩可为学位申请者免专业中文科目——但基础科目（数学，及按项目要求的物理/化学）一般仍须参加。具体豁免须由目标大学书面确认。',
      },
      {
        q: '英文授课项目也要考 CSCA 吗？',
        a: '是——CSCA 适用于国际本科申请者，不论授课语言，含英文授课学位项目。英文授课申请者按要求的科目组合考试（通常为数学加项目指定科目），语言上仍需雅思/托福。具体组合以项目页为准。',
      },
      {
        q: '分数不理想可以重考吗？',
        a: '可以——考试每年 5 次，可参加后续场次并提交更好的成绩单。官方未公布次数上限，但实操规划很重要：CSC 奖学金截止集中在 1-4 月，重考空间极小，所以首考应选最早可行场次。',
      },
      {
        q: 'CSCA 难吗？',
        a: '取决于准备而非天赋。基础科目对标中国高中课程——难度相当于 A-Level/IB/AP 基础层——但以速度导向的选择题呈现（每题约 75 秒、无计算器）。对多数国际生而言，拉开差距的是专业中文轨的学术词汇。基础扎实的高中毕业生按 8 周结构化备考通常足够。',
      },
      {
        q: 'CSCA 在哪里考？',
        a: '中国境内指定考点，以及中国驻外使领馆与海外合作机构考点。报名时选择所在国家/地区当次可用的最近考点；各国家与场次可用性不同，请在窗口开启后尽早报名。',
      },
    ],
    howToSteps: [
      {
        name: '确认要求的科目组合',
        text: '打开目标大学本科项目页，记下要求的 CSCA 科目——中文轨（人文/理工）加基础科目（数学必考；物理/化学按项目）。组合报错等于浪费一场考试与一档费用。',
      },
      {
        name: '选入学前 4-6 个月的场次',
        text: '从入学时间倒推：9 月入学者应参加冬季或早春场。CSC 奖学金申请者须更早——CSC 截止集中在 1-4 月且不延期。',
      },
      {
        name: '在官方门户报名',
        text: '只使用官方 CSCA 报名网站（大学/使馆通知公布的 .org.cn 域名）。用与护照完全一致的信息注册，选场次与最近考点，选科目并用支付宝、微信支付或银行转账支付 ¥450（1 科）或 ¥700（两科及以上）。',
      },
      {
        name: '按 8 周计划备考',
        text: '第 1 周梳理大纲；第 2-4 周限时无计算器补最弱基础科目；第 3-8 周并行提升学术中文阅读（学科词汇）；第 5-6 周练每题约 75 秒的中式选择题技巧；第 7 周整卷模考；第 8 周后勤 + 休息。',
      },
      {
        name: '参加考试',
        text: '携带护照原件、纸质准考证、铅笔与橡皮。禁计算器、手机与笔记。每科约 60 分钟；以准考证时间表为准，涂答题卡时核对科目代码。',
      },
      {
        name: '取分并随申请提交',
        text: '成绩在门户发布后下载成绩单，附到每所大学申请材料——如适用附到 CSC 奖学金申请。自费申请者也可在直接邮件咨询招生办时附上。',
      },
      {
        name: '必要时策略性重考',
        text: '若分数低于目标院校大致区间，报名下一场次只重考弱科。重考日期必须落在申请截止之前——过期重考对申请毫无帮助。',
      },
      {
        name: '与整套申请材料组合',
        text: 'CSCA 成绩与成绩单、语言证书（雅思/托福/HSK）、个人陈述、推荐信并列。SICA 顾问将你的考试日程与完整申请时间线对齐，避免任何截止日冲突。',
      },
    ],
    ctaTitle: '正在备考 CSCA？',
    ctaSubtitle:
      'SICA 顾问复核你的科目组合、围绕 CSCA 场次排布考试与申请日程，并提供 CSCA 备考题库与学习资料。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/guides/hsk',
        label: 'HSK 汉语水平考试指南',
        description: '级别、计分、考试时间，HSK 4-6 如何解锁中文授课项目。',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: '中国政府奖学金（CSC）',
        description: '全额资助：学费 + 住宿 + ¥2,500-3,500/月津贴 + 机票。2026 起须提交 CSCA 成绩。',
      },
      {
        href: '/china-university-admission-requirements',
        label: '中国大学录取要求',
        description: '按学位层级与项目类型列明的材料、语言与学术要求。',
      },
    ],
  },
};

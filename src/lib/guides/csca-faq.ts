import type { LocalizedGuide } from './types';

/**
 * "CSCA FAQ — 50 questions" — Batch 5, article #19 of the
 * 20-article CSCA cluster (docs/csca-content-plan.md).
 * Target queries: "csca faq", "csca questions", "csca exam
 * questions and answers" — plus long-tail capture for every
 * question the cluster answers.
 *
 * Static content. The faqs array is a deduplicated superset of the
 * cluster's per-article FAQs (all facts from the verified
 * baseline); the sections act as a topic index into the cluster.
 * All 50 entries render with FAQPage JSON-LD.
 */
export const cscaFaqGuide: LocalizedGuide = {
  en: {
    slug: 'csca-faq',
    eyebrow: 'GUIDE · CSCA FAQ',
    title: 'CSCA Exam — 50 Frequently Asked Questions (Answered)',
    description:
      'Every CSCA question, answered: who must take it, subjects, scoring, fees, dates, exemptions, CSC scholarship rules, retakes, prep — 50 questions with direct answers, plus links to the deep-dive guides.',
    subtitle:
      'One page, every CSCA question we are asked — from "what is the CSCA?" to "do universities see all my attempts?" Each answer is direct and self-contained; the topic map below points to the deep-dive guide for each area. This page carries the full FAQ schema, so the answers are built to be quoted verbatim by search engines and AI assistants.',
    stats: [
      { value: '50', label: 'Questions answered' },
      { value: '6', label: 'Topic areas' },
      { value: '18', label: 'Deep-dive guides in the cluster' },
      { value: '1', label: 'Page to find them all' },
    ],
    quickAnswer:
      'The CSCA (China Scholastic Competency Assessment) is China\'s standardized, centrally-administered admissions exam for international bachelor\'s applicants, mandatory for most from the 2026 intake. The 50 questions below cover everything applicants ask: who must sit it (most bachelor\'s applicants, including English-taught and CSC scholarship candidates), what it tests (Professional Chinese plus Mathematics, Physics, and Chemistry — all multiple choice, no calculators), how it is scored (100 points per subject with no national pass mark — universities set their own cutoffs), what it costs (¥450 for one subject, ¥700 total for two or more), when it runs (5 sessions a year, registration closing about 15 days before each test), who is exempt (Chinese-language program applicants with HSK 4; qualifying HSK scores can waive the Professional Chinese subject), and how retakes work (no published attempt limit, weak subjects only, calendar-constrained). Each answer stands alone; the topic map links the 18 deep-dive guides behind them.',
    keyTakeaways: [
      '50 direct answers spanning basics, subjects, scoring, registration, exemptions, scholarships, retakes, and prep',
      'The superset of every FAQ in the 18-guide CSCA cluster — consistent, cross-checked answers',
      'Structured as FAQPage schema: answers are written to be extractable by search engines and AI assistants',
      'Every deep answer links onward: the topic map routes each question area to its full guide',
      'The five self-diagnosis questions at the top resolve "which exams do I need?" in five minutes',
      'Escalation paths at the bottom: official portal → university admissions in writing → SICA counselors',
    ],
    sections: [
      {
        id: 'how-to-use',
        h2: 'How to use this page',
        intro:
          ' Fifty questions is a lot of answers — the page is built for two reading modes.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Search mode** — scan the questions below (they are ordered by topic) and open only what applies to you; every answer is written to stand alone',
              '**Learn mode** — read the Fast Facts and Self-Diagnosis sections first, then follow the topic map into the deep-dive guides for your situation',
              '**Verify mode** — for anything date-, fee-, or policy-shaped, the answer here tells you the rule; the official portal or your university confirms your specific case in writing',
            ],
          },
        ],
      },
      {
        id: 'topic-map',
        h2: 'The topic map — where deep answers live',
        intro:
          'Each FAQ area below has a full guide in the cluster. Route your deeper questions there.',
        blocks: [
          {
            type: 'table',
            caption: 'Question area → deep-dive guide',
            columns: ['If your question is about…', 'Read'],
            rows: [
              ['What the exam is, subjects, scoring, fees at a glance', '/csca-exam (flagship guide)'],
              ['Session dates and choosing when to sit', '/csca-exam-dates'],
              ['Registering, centers, the portal, avoiding agents', '/csca-exam-registration'],
              ['Fees, payment methods, paying from abroad', '/csca-exam-fees'],
              ['Exemptions, HSK routes, waivers', '/csca-exam-exemptions'],
              ['Math / Physics / Chemistry / Chinese tracks', 'The six subject & prep guides'],
              ['CSCA vs HSK vs SAT/A-Level/IB', 'The three comparison guides'],
              ['CSC scholarship, MBBS, English-taught programs', 'The three scenario guides'],
              ['Test day, retakes, scores and cutoffs', '/csca-test-day-retakes, /csca-scores-and-cutoffs'],
            ],
          },
        ],
      },
      {
        id: 'fast-facts',
        h2: 'The eight facts that answer 80% of questions',
        intro:
          'If you read nothing else on this page, read these.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Mandatory from 2026** — most international bachelor\'s applicants must sit it; English-taught programs included; master\'s/PhD excluded',
              '**Five subjects** — Professional Chinese (Humanities or STEM track, 80 MCQs) + Mathematics (compulsory for all, 48 MCQs) + Physics and Chemistry (48 each, per program)',
              '**No pass mark** — each subject scores 0–100; universities set their own cutoffs (planning bands: 80+ top tier, 70+ mid, 60s regional)',
              '**¥450 / ¥700** — one subject costs ¥450; two or more cost ¥700 total per session, via Alipay, WeChat Pay, or bank transfer',
              '**Five sessions a year** — registration closes ~15 days before each test; sit 4–6 months before your intake',
              '**Two exemptions** — HSK 4 for Chinese-language programs (full); qualifying HSK waives Professional Chinese (degrees)',
              '**CSC requires it** — scholarship applicants submit scores; deadlines January–April force the earliest session',
              '**Retakes allowed** — no published attempt limit; resit weak subjects only; the calendar is the constraint',
            ],
          },
        ],
      },
      {
        id: 'self-diagnosis',
        h2: 'The 5-minute self-diagnosis',
        intro:
          'Answer five questions in order and your exam list falls out.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Degree level?** Master\'s/PhD → no CSCA; follow program requirements. Bachelor\'s → continue.',
              '**Program type?** Chinese-language program + valid HSK 4 → exempt; HSK is your exam. Otherwise → continue.',
              '**Teaching language?** English-taught → CSCA (program combination) + IELTS/TOEFL. Chinese-taught → HSK + CSCA.',
              '**Current HSK?** HSK 5+ → ask each university for the Professional Chinese waiver in writing; may reduce your CSCA to fundamentals. Lower → plan both tracks.',
              '**Scholarship route?** CSC → sit the earliest session of the year; deadlines January–April do not move.',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Output examples: "English-taught CS" = CSCA (Math + Physics) + IELTS. "Chinese-taught business, HSK 5, waiver confirmed" = Math only. "Language program" = HSK 4, no CSCA.',
          },
        ],
      },
      {
        id: 'still-stuck',
        h2: 'Still stuck? The escalation ladder',
        intro:
          'Three levels of authority, in order. Skip levels and you inherit rumor.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Level 1 — the official portal** (csca.org.cn domain from university/embassy notices): session dates, fees, center lists, syllabus outlines. Authoritative for everything exam-mechanical.',
              '**Level 2 — your target university in writing**: subject combinations, waivers, score expectations, program-specific deadlines. An email reply is a document; keep them all.',
              '**Level 3 — a counselor who does this daily**: sequencing sessions, waivers, scholarships, and deadlines into one plan. SICA\'s first consultation is free; the prep pack ships with support tiers.',
              '**What to avoid** — agents selling "guaranteed seats" or "real past papers" (both fabrications), forums as primary sources, and last year\'s rules applied to this year\'s cycle',
            ],
          },
        ],
      },
    ],
    faqs: [
      { q: 'What is the CSCA exam?', a: 'The CSCA (China Scholastic Competency Assessment) is China\'s standardized, centrally-administered admissions exam for international students applying to bachelor\'s degrees, mandatory for most applicants from the 2026 intake. It tests Professional Chinese (a Humanities or STEM track) plus fundamental subjects — Mathematics, Physics, and Chemistry — all as multiple choice.' },
      { q: 'Who must take the CSCA?', a: 'Most international applicants to Chinese bachelor\'s programs from the 2026 intake — including English-taught program applicants and CSC scholarship applicants. Chinese-language program applicants with a valid HSK 4 may be exempt; master\'s and PhD applicants are not covered.' },
      { q: 'Do master\'s or PhD applicants need the CSCA?', a: 'No — the mandate targets undergraduate (bachelor\'s) admissions. Master\'s and PhD admission runs on program-specific requirements, supervisor matching, and university entrance procedures.' },
      { q: 'When did the CSCA start?', a: 'The inaugural global session was held December 21, 2025, and the requirement applies to most bachelor\'s applicants from the 2026 intake onward. Sessions then settled into a rhythm of five per year.' },
      { q: 'Is the CSCA hard?', a: 'It depends on preparation, not aptitude: content sits at the Chinese senior-high level (comparable to A-Level/IB/AP foundations), delivered as speed-oriented multiple choice — about 75 seconds per question with no calculator. The differentiator for most candidates is format training, not new theory.' },
      { q: 'How long should I prepare for the CSCA?', a: 'Eight weeks is the standard cycle at 10–15 hours per week; four weeks is the realistic compression floor (diagnose, patch the weakest subject, timed sets, one full mock). See the 8-week preparation guide for the week-by-week plan.' },
      { q: 'Where do I register for the CSCA?', a: 'On the official CSCA registration website — the .org.cn domain linked from university admissions notices and Chinese embassy announcements. Register only there: third-party agents charge inflated fees and cannot create extra seats.' },
      { q: 'Is the CSCA available in my country?', a: 'Likely, but it varies by session: centers operate in China and at Chinese embassies/consulates and partner institutions abroad. The per-session center list is published on the official portal during registration — availability differs by country and cycle.' },
      { q: 'What subjects does the CSCA cover?', a: 'Five subjects: Professional Chinese (choose the Humanities or STEM track, 80 multiple-choice questions) and three fundamentals — Mathematics (48 questions, compulsory for everyone), Physics (48), and Chemistry (48), the latter two per your program\'s requirements.' },
      { q: 'Which Chinese track do I take — Humanities or STEM?', a: 'Your program decides: business, law, and humanities programs typically require the Humanities track; engineering and science programs typically require STEM Chinese. Check the program page — the choice is specified, not preferred.' },
      { q: 'Is Mathematics compulsory in the CSCA?', a: 'Yes — every candidate sits Mathematics regardless of major, teaching language, or HSK level. No published exemption removes it; exemptions touch the Chinese track or the whole exam for language-program applicants only.' },
      { q: 'How many questions are there per subject?', a: 'Professional Chinese tracks have 80 multiple-choice questions; each fundamental subject (Mathematics, Physics, Chemistry) has 48. All questions are multiple choice with no written or spoken components.' },
      { q: 'How long is each CSCA subject?', a: 'Approximately 60 minutes per subject — about 75 seconds per question on the 48-question fundamentals and about 45 seconds per question on the 80-question Chinese tracks. Multiple subjects may be scheduled across one exam day.' },
      { q: 'Can I use a calculator on the CSCA?', a: 'No — calculators are banned in every subject, including Mathematics, Physics, and Chemistry. Papers are engineered for clean numbers; preparation should include mental-arithmetic and exact-value drills from the start.' },
      { q: 'What subjects do engineering, business, and medicine require?', a: 'Typical patterns: engineering → STEM Chinese + Math + Physics; business/economics → Humanities Chinese + Math; medicine/MBBS → Math + Chemistry (often without the Chinese track for English-taught programs). Combinations are set per program — verify on each program page.' },
      { q: 'Are the exam papers in Chinese?', a: 'Stems mix universal mathematical/scientific notation with Chinese scenario terms, and diagrams carry Chinese labels; answer options are numeric or symbolic. A glossary of the ~60 highest-frequency terms covers most of the reading friction for fundamentals subjects.' },
      { q: 'How is the CSCA scored?', a: 'Each subject is machine-scored from its multiple-choice questions on a 0–100 scale. There is no composite total — each subject stands alone, and universities read each against their own program\'s expectation.' },
      { q: 'What is the passing score for the CSCA?', a: 'There is no national pass mark — every university sets its own admission cutoffs per program. Any specific "national pass mark" you read online is fabricated. Ask your target schools what last cycle\'s admitted applicants scored.' },
      { q: 'What is a good CSCA score?', a: 'Program-relative: 80+ in required subjects is competitive for top-tier (C9/985) universities, 70+ clears most mid-tier (211/top-300) lines, and 60s can work at regional universities. Scholarship ambitions add roughly 5–10 points on top.' },
      { q: 'When do CSCA results come out?', a: 'Per session, through the official registration portal — the release window is announced when each session opens. Download the report as soon as it is available; you submit it to universities yourself.' },
      { q: 'How do I send my CSCA score report to universities?', a: 'You attach it: download the report from the portal and include it in each university application and, if applicable, your CSC scholarship file. There is no automatic transmission to universities — a report that is never attached is functionally a score that does not exist.' },
      { q: 'How do I register for the CSCA?', a: 'In eight steps: confirm your subject combination from the program page, find the official portal, create an account with passport-exact details, choose session and center, select subjects, pay (¥450/¥700), download and print the admission ticket, and sit the exam. The full walkthrough is in the registration guide.' },
      { q: 'How much does the CSCA cost?', a: '¥450 CNY for one subject, or ¥700 CNY total for two or more subjects in the same session — the typical 3–4 subject candidate pays ¥700 (about US$100). Overseas candidates add bank-transfer fees and exchange-rate margins.' },
      { q: 'How do I pay for the CSCA from outside China?', a: 'Three routes: the international version of Alipay or WeChat Pay with a linked foreign card, an international bank transfer to the portal\'s account (3–5 business days — start a week before the window closes), or a trusted person in China paying the order you created. Keep every receipt.' },
      { q: 'When does CSCA registration close?', a: 'About 15 days before each test date, with windows opening roughly 3–5 weeks ahead. There is no published late-registration option, and center seats can fill before the window closes — register in the first days.' },
      { q: 'Where can I take the CSCA?', a: 'At designated test centers in China and at Chinese embassies/consulates and partner institutions abroad. You choose the nearest center with seats during registration; center lists are published per session.' },
      { q: 'What should I bring on CSCA test day?', a: 'Your original passport (the exact document used at registration), the printed admission ticket, and pencils plus eraser as instructed. Phones, smartwatches, calculators, notes, and dictionaries do not enter the exam room. Arrive 30–45 minutes early.' },
      { q: 'Do I need the CSCA if I have HSK 4?', a: 'It depends on program type: a valid HSK 4 fully exempts applicants to Chinese-language programs, but degree applicants with HSK 4 are not automatically exempt — though a qualifying HSK score can waive the Professional Chinese subject, leaving Math and required sciences. Confirm with the university in writing.' },
      { q: 'Does IELTS or TOEFL exempt me from the CSCA?', a: 'No — English proficiency tests and the CSCA certify different things and stack as separate requirements. English-taught applicants sit the CSCA (typically the fundamentals) and provide IELTS/TOEFL for the language line.' },
      { q: 'Can universities grant individual CSCA waivers?', a: 'Yes, case-by-case — beyond the published HSK routes, universities may waive subjects or the exam for individual applicants. A waiver only exists with the university\'s written confirmation; never skip registration on an verbal assurance.' },
      { q: 'Do English-taught programs require the CSCA?', a: 'Yes — the mandate applies regardless of teaching language. English-taught candidates typically sit the fundamentals (Math plus program-named sciences), often without the Professional Chinese track, but combinations vary more across English-taught programs — verify each in writing.' },
      { q: 'Do CSC scholarship applicants need the CSCA?', a: 'Yes — from the 2026 intake, bachelor\'s-level CSC applicants must submit CSCA scores through both main channels (embassy/Bilateral and university/Chinese University Program). A scholarship file without scores is incomplete and does not shortlist.' },
      { q: 'Which CSCA session should CSC applicants sit?', a: 'The earliest session of the calendar year. CSC deadlines cluster January–April, so the first session is the primary attempt and the second (often March) is the only realistic fallback — a third lands after deadlines.' },
      { q: 'Can I apply to universities before I have a CSCA score?', a: 'You can research, shortlist, and often start applications — but your score must be attached before each application\'s deadline. Plan backwards: pick the session that lands 4–6 months before intake so banked scores cover every deadline.' },
      { q: 'Do universities receive my CSCA scores automatically?', a: 'No — scores are issued to you via the registration portal, and you attach the report to each application yourself. Universities do not receive scores automatically.' },
      { q: 'Do transfer students need the CSCA?', a: 'Typically yes if re-applying to a bachelor\'s program from the 2026 intake — but category rules can differ. Confirm with both universities\' admissions offices in writing before assuming either way.' },
      { q: 'Can I retake the CSCA?', a: 'Yes — the exam runs 5 sessions a year and you may resit in a later session, typically only your weak subjects. Universities evaluate the report you choose to submit, so a cleaner retake replaces a weak one for any deadline still open.' },
      { q: 'How many times can I take the CSCA?', a: 'No attempt limit has been published — the practical constraint is calendar: sessions run about 2–3 months apart, and a retake only helps if it lands before your still-open application deadlines.' },
      { q: 'Do universities see all my CSCA attempts?', a: 'No — universities see the score report you choose to submit. Earlier reports do not follow you unless you send them.' },
      { q: 'Can I retake only some CSCA subjects?', a: 'Yes — re-registration lets you sit just the subjects you want to replace. Strong subjects keep their scores; the fee band for the next session is ¥450 for one subject or ¥700 for two or more.' },
      { q: 'What is the difference between the CSCA and HSK?', a: 'The HSK tests general Chinese proficiency (levels 1–6, listening/reading/writing); the CSCA tests academic competency — Professional Chinese in your degree domain plus Mathematics and required sciences, all multiple choice. They are complementary: Chinese-taught degree applicants usually need both.' },
      { q: 'Does China accept SAT scores instead of the CSCA?', a: 'No — SAT, A-Level, and IB scores complement your application but do not replace the CSCA, which is mandatory for most bachelor\'s applicants from the 2026 intake regardless of international qualifications.' },
      { q: 'Is the CSCA harder than A-Levels or the IB?', a: 'Different rather than harder: content overlaps 80–90% with A-Level/IB/AP foundation material, but the exam is all multiple choice, strictly timed (~75 seconds per question), calculator-free, with Chinese-labeled stems. Unprepared candidates lose points to format, not content.' },
      { q: 'Are there past papers for the CSCA?', a: 'No official past-paper catalog has been released — anyone selling "real CSCA past papers" is selling fabrications. Prepare from the official syllabus outlines, your own curriculum materials, and China senior-high-aligned multiple-choice banks.' },
      { q: 'What should I study first for the CSCA?', a: 'Diagnose, then patch your weakest fundamental subject — usually Mathematics, which is compulsory for everyone. The Chinese track (if you sit one) runs in parallel from week 3 because it cannot be crammed. Strong subjects need only format and speed work.' },
      { q: 'How many mock tests should I take?', a: 'Two full timed mocks minimum, assembled from aligned multiple-choice sets at full length for your registered subjects, under exam rules (no calculator, real schedule). Review each the same day, logging every miss by cause: knowledge, arithmetic, misread, or timing.' },
      { q: 'My passport is renewing before the CSCA — what do I do?', a: 'Contact the registration portal\'s support before test day so your admission ticket matches the document you will present — a mismatch between ticket and passport can block entry. Where possible, register with the passport you will hold on test day.' },
      { q: 'I missed the CSCA registration deadline — what now?', a: 'There is no published late-registration or walk-in option; windows close about 15 days before each test. Your realistic options are the next session (typically 2–3 months later) or, if a university deadline still allows, coordinating with that admissions office.' },
      { q: 'I finished school last year — do I still need the CSCA?', a: 'Yes — the mandate applies regardless of when you completed school, and your existing qualifications (A-Level, IB, and equivalents) remain valid. Gap-year candidates actually hold a scheduling advantage: more session choices and more retake room before deadlines.' },
      { q: 'Who can help me plan my CSCA and application timeline?', a: 'SICA counselors handle exactly this: verifying subject combinations with universities, planning sessions around deadlines and scholarships, and providing CSCA preparation packs (glossaries, MCQ sets). The first consultation is free.' },
    ],
    howToSteps: [
      {
        name: 'Classify your application in one line',
        text: 'Degree level (bachelor\'s vs master\'s/PhD), program type (degree vs language program), and teaching language (English vs Chinese). This one line determines whether the CSCA applies to you at all.',
      },
      {
        name: 'Run the five-question self-diagnosis above',
        text: 'Work through the diagnosis section: level, program type, teaching language, current HSK, scholarship route. The output is your exam list — CSCA, HSK, IELTS/TOEFL, or a combination.',
      },
      {
        name: 'Verify your program\'s requirements in writing',
        text: 'One email per target program: required CSCA subjects, language thresholds, and deadline shape. Written answers are the only version that counts — file them with your application records.',
      },
      {
        name: 'Check the exemption and waiver routes before committing',
        text: 'Valid HSK 4 + language program = full exemption. Qualifying HSK = Professional Chinese waiver for degrees. Both exist only with the university\'s written confirmation — ask before you plan prep weeks.',
      },
      {
        name: 'Pick your session and start the 8-week plan',
        text: 'Choose the session 4–6 months before intake (earliest of the year for CSC applicants), then follow the preparation guide: diagnose, patch weakest, Chinese in parallel, two full mocks.',
      },
      {
        name: 'Escalate anything unresolved up the ladder',
        text: 'Official portal for exam mechanics → university admissions in writing for program rules → a SICA counselor to sequence everything into one plan. Skip rumors at every level.',
      },
    ],
    ctaTitle: 'One question left unanswered?',
    ctaSubtitle:
      'SICA counselors answer CSCA questions daily — subject combinations, waiver checks, session planning, and full application timelines. Ask yours in a free first consultation, and get the prep pack with any support tier.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Ask a counselor',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The flagship overview behind most of these answers.',
      },
      {
        href: '/csca-exam-preparation',
        label: 'How to prepare for the CSCA — 8-week plan',
        description: 'The prep system the answers point to.',
      },
      {
        href: '/csca-exam-exemptions',
        label: 'Who must take the CSCA — and who is exempt',
        description: 'The full rules behind the exemption and waiver answers.',
      },
      {
        href: '/guides',
        label: 'All SICA guides',
        description: 'The complete guides hub — process guides, listicles, and the CSCA cluster.',
      },
    ],
  },
  zh: {
    slug: 'csca-faq',
    eyebrow: '指南 · CSCA 问答',
    title: 'CSCA 考试——50 个常见问题（一次答清）',
    description:
      'CSCA 的所有问题都在这里：谁要考、科目、计分、费用、时间、豁免、CSC 奖学金规则、重考、备考——50 问直接作答，并附深入指南链接。',
    subtitle:
      '一页答清我们被问到的每一个 CSCA 问题——从「CSCA 是什么」到「大学看得到我所有尝试吗」。每条答案独立成立；下方主题地图指向各领域的深入指南。本页带完整 FAQ 结构化数据，答案按可被搜索引擎与 AI 助手逐字引用的标准撰写。',
    stats: [
      { value: '50', label: '个问题已回答' },
      { value: '6', label: '大主题域' },
      { value: '18', label: '篇深入指南' },
      { value: '1', label: '页找齐' },
    ],
    quickAnswer:
      'CSCA（中国国际学生学业能力评估）是中国面向国际本科申请者的统一标准化入学考试，自 2026 级起对多数申请者强制。以下 50 问覆盖申请者的一切疑问：谁要考（多数本科申请者，含英文授课与 CSC 奖学金申请者）、考什么（专业中文加数学、物理、化学——全选择题、无计算器）、怎么计分（单科 100 分、无全国及格线——大学自划线）、多少钱（单科 ¥450、两科及以上合计 ¥700）、何时考（一年 5 场、报名考前约 15 天截止）、谁能免（持 HSK 4 的中文授课项目申请者；合格 HSK 可免专业中文）、怎么重考（无公布次数上限、只重考弱科、受日历约束）。每条答案独立成立；主题地图链接背后的 18 篇深入指南。',
    keyTakeaways: [
      '50 条直接答案，横跨基础、科目、计分、报名、豁免、奖学金、重考与备考',
      '18 篇指南 FAQ 的去重超集——答案一致、相互核对',
      '按 FAQPage 结构化数据组织：答案按可被搜索引擎与 AI 助手提取的标准撰写',
      '每个深答案都有出口：主题地图把每个问题域路由到完整指南',
      '顶部五问自诊五分钟解决「我需要考哪些」',
      '底部升级路径：官方门户 → 大学书面确认 → SICA 顾问',
    ],
    sections: [
      {
        id: 'how-to-use',
        h2: '本页用法',
        intro:
          '五十个答案是很大的量——本页为两种读法而建。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**检索模式**——按主题扫一遍下方问题（已按主题排序），只打开与你相关的；每条答案独立成立',
              '**学习模式**——先读「八条快答」与「五问自诊」，再按主题地图进入你的情形对应的深入指南',
              '**核验模式**——凡涉及日期、费用、政策的答案，这里告诉你规则；官方门户或你的大学书面确认你的具体情形',
            ],
          },
        ],
      },
      {
        id: 'topic-map',
        h2: '主题地图——深入答案在哪里',
        intro:
          '下方每个 FAQ 域在指南簇中都有一篇完整指南。更深的问题去那里。',
        blocks: [
          {
            type: 'table',
            caption: '问题域 → 深入指南',
            columns: ['如果你的问题是关于…', '阅读'],
            rows: [
              ['考试是什么、科目、计分、费用速览', '/csca-exam（旗舰指南）'],
              ['场次日期与何时考', '/csca-exam-dates'],
              ['报名、考点、门户、避开中介', '/csca-exam-registration'],
              ['费用、支付方式、境外付款', '/csca-exam-fees'],
              ['豁免、HSK 通道、免考', '/csca-exam-exemptions'],
              ['数学/物理/化学/中文轨', '六篇科目与备考指南'],
              ['CSCA 对比 HSK、SAT/A-Level/IB', '三篇对比指南'],
              ['CSC 奖学金、MBBS、英文授课', '三篇场景指南'],
              ['考试日、重考、分数与划线', '/csca-test-day-retakes、/csca-scores-and-cutoffs'],
            ],
          },
        ],
      },
      {
        id: 'fast-facts',
        h2: '八条快答，解决八成问题',
        intro:
          '如果本页只读一段，读这段。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**2026 级起强制**——多数国际本科申请者必考；含英文授课；硕士/博士除外',
              '**五个科目**——专业中文（人文或理工轨，80 题）+ 数学（人人必考，48 题）+ 物理与化学（各 48 题，按项目）',
              '**无及格线**——单科 0-100；大学自划线（规划带：顶尖 80+、中游 70+、地方 60 分段）',
              '**¥450 / ¥700**——单科 ¥450；两科及以上每场合计 ¥700，支付宝、微信或银行转账',
              '**一年五场**——报名考前约 15 天截止；入学前 4-6 个月的那场最理想',
              '**两条豁免**——HSK 4 豁免中文授课项目（整体）；合格 HSK 免专业中文（学位）',
              '**CSC 要求成绩**——奖学金申请者须提交；1-4 月截止把场次锁定在年内最早',
              '**可重考**——无公布次数上限；只重考弱科；约束是日历',
            ],
          },
        ],
      },
      {
        id: 'self-diagnosis',
        h2: '五分钟自诊',
        intro:
          '按顺序回答五个问题，你的考试清单自动落定。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**学位层级？** 硕士/博士 → 无 CSCA；跟项目要求走。本科 → 继续。',
              '**项目类型？** 中文授课语言项目 + 有效 HSK 4 → 豁免；你的考试是 HSK。否则 → 继续。',
              '**授课语言？** 英文授课 → CSCA（项目组合）+ 雅思/托福。中文授课 → HSK + CSCA。',
              '**当前 HSK？** HSK 5+ → 逐校书面询问专业中文免考；CSCA 可能缩到只剩基础科。更低 → 双轨规划。',
              '**奖学金路线？** CSC → 参加年内最早场次；1-4 月截止不会动。',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '输出示例：「英文授课计算机」= CSCA（数学 + 物理）+ 雅思。「中文授课商科、持 HSK 5、免考已确认」= 仅数学。「语言项目」= HSK 4，无 CSCA。',
          },
        ],
      },
      {
        id: 'still-stuck',
        h2: '还有疑问？升级阶梯',
        intro:
          '三级权威，按序使用。跳级就继承了传闻。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**第一级——官方门户**（大学/使馆通知中的 csca.org.cn 域名）：场次日期、费用、考点清单、大纲。一切考试机制问题的权威。',
              '**第二级——目标大学书面确认**：科目组合、免考、分数预期、项目专属截止。邮件回复就是文件；全部保留。',
              '**第三级——每天都做这件事的顾问**：把场次、免考、奖学金与截止排成一个计划。SICA 首次咨询免费；备考资料随支持档位提供。',
              '**要避开的**——卖「保证考位」或「真题」的中介（都是编造）、把论坛当主要来源、拿去年的规则套今年的周期',
            ],
          },
        ],
      },
    ],
    faqs: [
      { q: 'CSCA 考试是什么？', a: 'CSCA（中国国际学生学业能力评估）是中国面向申请本科的国际学生的统一标准化入学考试，自 2026 级起对多数申请者强制。考专业中文（人文或理工轨）加基础科目——数学、物理、化学，全为选择题。' },
      { q: '谁必须参加 CSCA？', a: '自 2026 级起多数申请中国本科的国际学生——含英文授课项目申请者与 CSC 奖学金申请者。持有效 HSK 4 的中文授课项目申请者可豁免；硕士与博士申请者不在范围内。' },
      { q: '硕士或博士申请者要考 CSCA 吗？', a: '不用——强制令面向本科（学士）招生。硕士与博士录取走项目自有要求、导师匹配与大学校内流程。' },
      { q: 'CSCA 什么时候开始的？', a: '全球首考于 2025 年 12 月 21 日举行，要求自 2026 级起对多数本科申请者生效。此后固定为一年五场的节奏。' },
      { q: 'CSCA 难吗？', a: '取决于备考而非天赋：内容在中国高中水平（相当于 A-Level/IB/AP 基础层），以速度导向的选择题呈现——每题约 75 秒、无计算器。多数考生的差距在形式训练，不在新理论。' },
      { q: 'CSCA 要备考多久？', a: '每周 10-15 小时的标准周期是八周；四周是现实压缩下限（诊断、补最弱科、限时套题、一套整卷模考）。逐周计划见八周备考指南。' },
      { q: '在哪里报名 CSCA？', a: '在官方 CSCA 报名网站——大学招生通知与中国使馆公告中链接的 .org.cn 域名。只在那里报名：第三方中介收费虚高、也变不出额外考位。' },
      { q: '我的国家能考 CSCA 吗？', a: '大概率可以，但逐场而变：考点设在中国境内及中国驻外使领馆与海外合作机构。逐场考点清单在报名期于官方门户公布——各国各周期可用性不同。' },
      { q: 'CSCA 考哪些科目？', a: '五科：专业中文（人文或理工轨，80 道选择题）与三门基础科——数学（48 题，人人必考）、物理（48 题）、化学（48 题），后两者按项目要求。' },
      { q: '中文轨选人文还是理工？', a: '项目说了算：商科、法律与人文项目通常要人文轨；工科与理科项目通常要理工中文。查项目页——这个选择是被指定的，不由偏好。' },
      { q: 'CSCA 的数学是必考的吗？', a: '是——每位考生都考数学，无论专业、授课语言或 HSK 级别。没有公布的豁免能去掉它；豁免只触及中文轨或语言类项目申请者的整体豁免。' },
      { q: '每科多少道题？', a: '专业中文轨 80 道选择题；基础科（数学、物理、化学）各 48 道。全部为选择题，无笔试写作、无口试。' },
      { q: '每科考多久？', a: '每科约 60 分钟——48 题的基础科约合每题 75 秒，80 题的中文轨约合每题 45 秒。多科可能排在同一个考试日。' },
      { q: 'CSCA 可以用计算器吗？', a: '不能——包括数学、物理、化学在内全科禁用。试卷按整洁数字设计；备考应从一开始就包含心算与精确值训练。' },
      { q: '工科、商科、医学分别要求哪些科目？', a: '典型模式：工科 → 理工中文 + 数学 + 物理；商科/经济 → 人文中文 + 数学；医学/MBBS → 数学 + 化学（英文授课常无中文轨）。组合按项目设定——逐项目页核验。' },
      { q: '试卷是中文的吗？', a: '题干是通用数理符号与中文场景词的混合，图形带中文标注；选项为数字或符号。约 60 个最高频术语的术语表即可覆盖基础科的大部分阅读摩擦。' },
      { q: 'CSCA 怎么计分？', a: '每科按选择题在 0-100 区间机读计分。没有合计总分——每科独立存在，大学逐科对照其项目预期来读。' },
      { q: 'CSCA 的及格分是多少？', a: '没有全国及格线——每所大学按项目自划录取线。网上读到的任何具体「全国及格线」都是编造的。直接问目标院校上一轮录取者的分数。' },
      { q: '多少分算好？', a: '相对于项目：必考科 80+ 对顶尖（C9/985）有竞争力，70+ 过多数中游（211/前 300）线，60 分段在地方院校可行。奖学金目标再加约 5-10 分。' },
      { q: 'CSCA 成绩什么时候出？', a: '按场次经官方报名门户发布——发布窗口随场次开放公告。一可下载就下载；由你自己提交给大学。' },
      { q: '怎么把 CSCA 成绩单寄给大学？', a: '由你附上：从门户下载成绩单，放进每份大学申请及（如适用）CSC 奖学金材料。没有向大学的自动传送——从未被附上的成绩单在功能上等于不存在的分数。' },
      { q: '怎么报名 CSCA？', a: '八步：从项目页确认科目组合、找到官方门户、用护照逐字一致的信息注册账号、选场次与考点、选科目、缴费（¥450/¥700）、下载并打印准考证、参加考试。完整流程见报名指南。' },
      { q: 'CSCA 多少钱？', a: '单科 450 元人民币，同场两科及以上合计 700 元——典型的 3-4 科考生付 ¥700（约 100 美元）。境外考生另加转账手续费与汇率差。' },
      { q: '人在国外怎么付 CSCA 费用？', a: '三条路：绑定外卡的国际版支付宝/微信支付、向门户账户跨境银行转账（3-5 个工作日——窗口截止前一周启动）、或请国内的信任之人为你创建的订单付款。回执全部保留。' },
      { q: 'CSCA 报名什么时候截止？', a: '考前约 15 天，窗口约提前 3-5 周开放。没有公布的补报通道，考位也可能在窗口关闭前满员——头几天就报。' },
      { q: 'CSCA 在哪里考？', a: '中国境内指定考点，以及中国驻外使领馆与海外合作机构考点。报名时选最近的有位考点；考点清单逐场公布。' },
      { q: 'CSCA 考试日要带什么？', a: '报名所用护照原件、打印的准考证、按要求的铅笔与橡皮。手机、智能手表、计算器、笔记与词典不得进入考场。提早 30-45 分钟到场。' },
      { q: '有 HSK 4 还要考 CSCA 吗？', a: '取决于项目类型：有效 HSK 4 让中文授课项目申请者整体豁免，但持 HSK 4 的学位申请者并不自动豁免——不过合格 HSK 成绩可免专业中文科目，留下数学与要求理科。向大学书面确认。' },
      { q: '雅思或托福能免 CSCA 吗？', a: '不能——英语水平考试与 CSCA 认证不同的东西、作为独立要求叠加。英文授课考生照考 CSCA（通常为基础科），语言线另由雅思/托福满足。' },
      { q: '大学可以个案豁免 CSCA 吗？', a: '可以——在公布的 HSK 通道之外，大学可对个别申请者免考或免科。豁免只有大学书面确认后才存在；绝不凭口头保证跳过报名。' },
      { q: '英文授课项目要考 CSCA 吗？', a: '要——强制令与授课语言无关。英文授课考生通常考基础科（数学加项目点名理科），常无专业中文轨，但英文授课项目的组合差异更大——逐校书面核验。' },
      { q: 'CSC 奖学金申请者要考 CSCA 吗？', a: '要——自 2026 级起，本科层次 CSC 申请者须经两条主渠道（使馆/双边与大学/中国大学项目）提交 CSCA 成绩。缺成绩单的奖学金材料不完整、不入围。' },
      { q: 'CSC 申请者该参加哪场 CSCA？', a: '年内最早的一场。CSC 截止集中在 1-4 月，所以第一场是主考、第二场（常为 3 月）是唯一现实的兜底——第三场落在截止之后。' },
      { q: '还没有 CSCA 成绩能先申请大学吗？', a: '可以调研、圈定院校、甚至启动申请——但每份申请的截止前必须附上成绩。倒排规划：选入学前 4-6 个月的场次，让存下的成绩覆盖所有截止。' },
      { q: '大学会自动收到我的 CSCA 成绩吗？', a: '不会——成绩经报名门户发给你，由你把报告附到每份申请。大学不会自动收到成绩。' },
      { q: '转学申请者要考 CSCA 吗？', a: '2026 级起重新申请本科的话通常要——但类别规则可能有差异。先与两校招生办书面确认再作假设。' },
      { q: 'CSCA 可以重考吗？', a: '可以——一年 5 场，可在后续场次重考、通常只考弱科。大学以你选择提交的报告为准，所以更干净的重考成绩可为任何仍开放的截止日替换弱分。' },
      { q: 'CSCA 最多能考几次？', a: '没有公布次数上限——实际约束是日历：场次间隔约 2-3 个月，且重考只有落在仍开放的申请截止前才有意义。' },
      { q: '大学看得到我所有 CSCA 尝试吗？', a: '看不到——大学看你选择提交的成绩单。早先的报告不送就不会跟着你。' },
      { q: '可以只重考部分科目吗？', a: '可以——重新报名时可只坐你想替换的科目。强科成绩保留；下一场费用档为单科 ¥450 或两科及以上 ¥700。' },
      { q: 'CSCA 与 HSK 有什么区别？', a: 'HSK 考通用汉语水平（1-6 级，听力/阅读/书写）；CSCA 考学术能力——学位域内的专业中文加数学与要求理科，全选择题。两者互补：中文授课学位申请者通常两个都要。' },
      { q: '中国接受用 SAT 替代 CSCA 吗？', a: '不接受——SAT、A-Level、IB 成绩是申请的补充，但不能替代自 2026 级起对多数本科申请者强制、与国际学历无关的 CSCA。' },
      { q: 'CSCA 比 A-Level 或 IB 难吗？', a: '是「不同」而非更难：内容与 A-Level/IB/AP 基础层重合 80-90%，但考试全选择题、严格计时（每题约 75 秒）、无计算器、中文题干。未准备者输给形式，不是内容。' },
      { q: 'CSCA 有真题吗？', a: '尚未发布官方真题库——任何卖「CSCA 真题」的都是在卖编造。用官方大纲、自己的课程材料与对齐中国高中的选择题库备考。' },
      { q: 'CSCA 应该先学什么？', a: '先诊断，再补最弱的基础科目——通常是人人必考的数学。中文轨（如需）从第 3 周并行，因为它无法突击。强科只需要形式与速度训练。' },
      { q: '要刷几套模考？', a: '整卷限时模考至少两套：按所报科目全长度拼装、按考试规则执行（无计算器、真实日程）。当天复盘，把每个失分按知识、算术、读题或计时归因。' },
      { q: '护照在 CSCA 前到期换发怎么办？', a: '考前联系报名门户支持，让准考证与你将出示的证件匹配——准考证与护照不一致可能被拒入场。可能的话，用考试日将持有的护照报名。' },
      { q: '错过 CSCA 报名截止怎么办？', a: '没有公布的补报或现场报名通道；窗口考前约 15 天关闭。现实选项是下一场（通常 2-3 个月后），或若某大学截止仍允许，与该校招生办协调。' },
      { q: '我去年毕业——还需要考 CSCA 吗？', a: '要——强制令与你何时毕业无关，且既有学历（A-Level、IB 及同等）仍然有效。间隔年考生反而握有排期优势：更多场次选择与更充足的截止前重考空间。' },
      { q: '谁能帮我规划 CSCA 与申请时间线？', a: 'SICA 顾问做的正是这件事：与大学核验科目组合、围绕截止与奖学金排场次、提供 CSCA 备考资料包（术语表、选择题套题）。首次咨询免费。' },
    ],
    howToSteps: [
      {
        name: '一行定位你的申请',
        text: '学位层级（本科 vs 硕士/博士）、项目类型（学位 vs 语言项目）、授课语言（英文 vs 中文）。这一行决定 CSCA 到底是否适用于你。',
      },
      {
        name: '跑一遍上方五问自诊',
        text: '过一遍自诊节：层级、项目类型、授课语言、当前 HSK、奖学金路线。输出就是你的考试清单——CSCA、HSK、雅思/托福或其组合。',
      },
      {
        name: '书面核验项目要求',
        text: '每个目标项目一封邮件：要求的 CSCA 科目、语言阈值、截止形状。书面答复是唯一算数的版本——与申请记录一起归档。',
      },
      {
        name: '在投入前先查豁免与免考通道',
        text: '有效 HSK 4 + 语言项目 = 整体豁免。合格 HSK = 学位的专业中文免考。两者都只在大学书面确认后才存在——规划备考周之前先问。',
      },
      {
        name: '选场次并启动八周计划',
        text: '选入学前 4-6 个月的场次（CSC 申请者取年内最早），然后按备考指南执行：诊断、补最弱、中文并行、两套整卷。',
      },
      {
        name: '未决事项沿阶梯升级',
        text: '考试机制找官方门户 → 项目规则找大学书面确认 → 把一切排成一个计划的 SICA 顾问。每一级都跳过传闻。',
      },
    ],
    ctaTitle: '还剩一个问题没答案？',
    ctaSubtitle:
      'SICA 顾问每天回答 CSCA 问题——科目组合、免考核验、场次规划与完整申请时间线。免费首次咨询里问你的那一个；支持档位附赠备考资料包。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '问顾问',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '大部分答案背后的旗舰总览。',
      },
      {
        href: '/csca-exam-preparation',
        label: 'CSCA 备考——八周计划',
        description: '答案指向的备考体系。',
      },
      {
        href: '/csca-exam-exemptions',
        label: '谁必须参加 CSCA——谁可豁免',
        description: '豁免与免考答案背后的完整规则。',
      },
      {
        href: '/guides',
        label: '全部 SICA 指南',
        description: '完整指南中心——流程指南、榜单与 CSCA 簇。',
      },
    ],
  },
};

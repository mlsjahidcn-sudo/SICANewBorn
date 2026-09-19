import type { LocalizedGuide } from './types';

/**
 * "Advising clients on the CSCA — partner handbook" — Batch 5,
 * article #20 (final) of the 20-article CSCA cluster
 * (docs/csca-content-plan.md).
 * Low search volume by design — this page is for SICA partner
 * agencies and counselors advising clients, complementing the
 * partner portal's student-facing workflows.
 *
 * Static content. All exam facts from the cluster baseline; the
 * playbooks encode the cluster's own guidance in counselor
 * workflow form.
 */
export const cscaPartnerGuide: LocalizedGuide = {
  en: {
    slug: 'csca-partner-guide',
    eyebrow: 'GUIDE · CSCA × PARTNERS',
    title: 'Advising Clients on the CSCA — The Partner & Counselor Handbook',
    description:
      'The counselor-side CSCA playbook: client triage in five questions, the subject-combination matrix, the deadline calendar template, advising scripts for the six most common client mistakes, and how to run the waiver check at scale.',
    subtitle:
      'This handbook compresses the 18-guide CSCA cluster into counselor workflows: how to triage a new client in five questions, which CSCA subject combination each program family requires, the one-page calendar template that keeps exam sessions, application deadlines, and scholarship windows from colliding, the advising scripts for the six mistakes that cost clients sessions or money, and the process for running exemption/waiver checks across a whole client list at once. Built for SICA partner agencies and counselors; every rule cited here links to the client-facing guide that explains it.',
    stats: [
      { value: '5', label: 'Triage questions per client' },
      { value: '6', label: 'Counselor playbooks' },
      { value: '1 page', label: 'Calendar template per client' },
      { value: '18', label: 'Client-facing guides behind it' },
    ],
    quickAnswer:
      'Advising a client on the CSCA comes down to five counselor motions: (1) triage the client with five questions — degree level, program type, teaching language, current HSK/English position, scholarship ambitions — which determines their entire exam set; (2) confirm subject combinations per program in writing, never from memory or last cycle; (3) run the exemption and waiver checks (HSK 4 for language programs; qualifying HSK for the Professional Chinese waiver) before booking any prep weeks; (4) build the one-page calendar that sequences CSCA sessions against application and scholarship deadlines — for CSC clients that means the earliest session of the year with one fallback at most; and (5) operate the checklist discipline: written confirmations filed, registration in the first days of each window, and score reports attached to every application. The six most expensive client mistakes — assuming exemptions, wrong combinations, last-day payments, missed attachments, agent-bought registrations, and unverified licensing claims — are all prevented by these motions.',
    keyTakeaways: [
      'Triage every client with the same five questions — the answers determine the entire exam set and calendar',
      'Subject combinations are set per program and drift cycle-to-cycle: written confirmation per program, every cycle, no exceptions',
      'Run waiver checks before prep planning — a confirmed waiver deletes weeks of work and restructures the whole calendar',
      'One-page calendar per client: CSCA sessions, application deadlines, scholarship windows, language tests — on one sheet or it isn\'t managed',
      'The six expensive client mistakes all trace to skipped verification — your value as a counselor is the verification nobody else does',
      'SICA prep packs (glossaries, MCQ sets) ship with support tiers; position them at triage, not as an upsell after registration',
    ],
    sections: [
      {
        id: 'triage',
        h2: 'Client triage — the five questions',
        intro:
          'Every CSCA conversation starts with the same five questions. They take ten minutes and determine everything downstream.',
        blocks: [
          {
            type: 'table',
            caption: 'The triage matrix — answers drive the exam set',
            columns: ['Question', 'Branch', 'Exam-set consequence'],
            rows: [
              ['Degree level?', 'Master\'s / PhD', 'No CSCA — advise on program-specific requirements instead'],
              ['Program type?', 'Chinese-language program', 'Valid HSK 4 → full exemption; exam set is HSK only'],
              ['Teaching language?', 'English-taught', 'CSCA fundamentals + IELTS/TOEFL; no HSK unless waiver-chasing'],
              ['Current HSK / English?', 'HSK 5+ or near', 'Run the waiver check before any prep planning'],
              ['Scholarship ambitions?', 'CSC or full scholarships', 'Earliest session of the year; +5–10 score premium; one fallback max'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Write the triage down** — the five answers go at the top of the client\'s file; every later decision cites them',
              '**Medicine and engineering flags** — these program families carry specific combination patterns and early deadlines; route to the MBBS and subject guides immediately when flagged',
              '**Gray-zone clients** (transfers, gap years, heritage applicants) — the exemptions guide\'s edge-case table is the script; both-gate confirmation applies',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The triage output is a one-line exam list — "CSCA (Math + Physics) + IELTS" or "HSK only" or "CSCA + HSK, waiver pending". If you cannot write that line, the triage is not finished.',
          },
        ],
      },
      {
        id: 'combination-matrix',
        h2: 'The subject-combination matrix',
        intro:
          'The reference table for the combinations you will be asked about most — with the verification rule that outranks it.',
        blocks: [
          {
            type: 'table',
            caption: 'Typical CSCA combinations by program family (verify per program, every cycle)',
            columns: ['Program family', 'Typical combination', 'Counselor notes'],
            rows: [
              ['Engineering / CS', 'STEM Chinese + Math + Physics', 'Some English-taught CS programs drop the Chinese track'],
              ['Business / economics', 'Humanities Chinese + Math', 'English-taught variants often fundamentals-only'],
              ['Medicine / MBBS', 'Math + Chemistry', 'Verify per faculty; see the MBBS guide for the licensing context'],
              ['Pharmacy / life sciences', 'Math + Chemistry (± Physics)', 'Occasional Physics-or-Chemistry choice'],
              ['Law / international relations', 'Humanities Chinese + Math', 'China-facing programs keep the language signal'],
              ['Design / media / humanities', 'Varies widely', 'The widest variance — individual verification mandatory'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**The table is a prior, not an answer** — combinations drift and English-taught programs change fastest; the written per-program confirmation is the only citable source',
              '**Batch the verification** — one email template, sent per program, collects: CSCA required? subjects? Chinese track listed? language threshold? deadline shape? Standardize it across your client list',
              '**Maintain a live matrix** — keep the collected confirmations in a shared sheet per intake cycle; the second client asking about the same program should cost you zero emails',
              '**Union registrations** — when one client\'s list mixes combinations, register the union in one session; the ¥700 band makes extra subjects nearly free',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Never quote a combination from memory or from last cycle — the counseling error clients least forgive is registering for the wrong subjects. The matrix primes the question; the program\'s written reply answers it.',
          },
        ],
      },
      {
        id: 'calendar-template',
        h2: 'The one-page client calendar',
        intro:
          'Every client gets one page with five lanes. If it does not fit on one page, it is not being managed.',
        blocks: [
          {
            type: 'table',
            caption: 'The five-lane calendar template',
            columns: ['Lane', 'What goes on it', 'Conflict rule'],
            rows: [
              ['CSCA sessions', 'Registration window opens, registration done, test date, results date', 'Registration in first 48h of every window'],
              ['University applications', 'Per-program deadline, file-complete date (2 weeks before)', 'File-complete beats deadline; no exceptions'],
              ['Scholarship windows', 'Embassy + university CSC deadlines (Jan–Apr)', 'CSC clients: earliest session of the year, locked'],
              ['Language tests', 'IELTS/TOEFL/HSK dates + one retest window', 'Language test lands before the earliest file-complete date'],
              ['Deliverables', 'Study plan, references, physical exam, translations', 'Each has an owner date, not a "sometime"'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Work backwards, in writing** — from the earliest application deadline to session choice to prep start; the math on paper prevents the optimistic-slippage conversation later',
              '**Banked-score strategy for premium clients** — any client who can sit 6+ months ahead should; it deletes the crunch and doubles their retake capacity',
              '**The CSC overlay** — scholarship clients get the CSC guide\'s calendar spine overlaid on the same page: primary sitting, one fallback, file deadlines frozen',
              '**Review cadence** — a 15-minute calendar check at every milestone (registration opened, ticket issued, results out, files sent); the calendar that is not reviewed is a wish list',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The template\'s hidden value: conflicts become visible months early. A session landing after a file-complete date, or a language retest colliding with CSC week, is a two-minute fix in September and a crisis in March.',
          },
        ],
      },
      {
        id: 'six-mistakes',
        h2: 'The six expensive client mistakes — and the advising scripts',
        intro:
          'These six account for nearly every CSCA-related client loss. Each has a one-paragraph script; deliver it at triage, not after the damage.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**"I don\'t need the CSCA" (the exemption assumption)** — Script: "Exemptions exist for language programs with HSK 4, and waivers for strong HSK holders — but only with the university\'s written confirmation. We\'ll get that confirmation before we plan anything." Never let a client skip registration on a forum post.',
              '**"My friend sat Math + Physics" (the combination assumption)** — Script: "Combinations are set per program and change between cycles. We confirm yours in writing from each university — that reply is your registration list."',
              '**"I\'ll pay on the last day" (the transfer trap)** — Script: "Bank transfers take 3–5 business days and unpaid orders expire silently. We pay in the first days of the window via Alipay/WeChat where possible." Clients abroad: set up international Alipay/WeChat a month early.',
              '**"The universities will get my scores" (the attachment assumption)** — Script: "Nothing is automatic — you download the report and attach it to every application. We run a per-university attachment checklist on results day."',
              '**"My agent registered me" (the agent trap)** — Script: "Agents charge above the official ¥450/¥700, cannot create seats, and their errors go on your record. Registration is 15 minutes on the official portal — we do it together."',
              '**"This exam counts toward my license back home" (the two-gate confusion, MBBS clients)** — Script: "The CSCA is China\'s admission gate. Your council\'s licensing exam (FMGE/NExT, NRE) comes after graduation and is unchanged. We verify your program\'s MOE listing before any deposit."',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'All six mistakes share a root cause: an assumption that should have been a verification. Your invoiceable value as a counselor is precisely the verifications clients skip — make that explicit in your service description.',
          },
        ],
      },
      {
        id: 'waiver-at-scale',
        h2: 'Running waiver checks at scale',
        intro:
          'For a client list of 10+ candidates, individual waiver emails become a process. Run it like one.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Standardize the waiver email** — one template: client program, intake, HSK level and score, the ask (full exemption or Professional Chinese waiver), and the closing question ("please confirm in writing whether the CSCA is required"). Translated versions for Chinese-language admissions offices.',
              '**Batch by university, not by client** — universities answer program-by-program; collect all clients targeting University X and ask once per program. Track in the live matrix sheet.',
              '**File every reply against the client record** — the waiver confirmation is a required application document for CSC files and the defense in any later dispute; treat it like a transcript.',
              '**Set the re-check trigger** — waiver policies are young and drift; re-confirm at every new intake cycle, and immediately if a university announces updated international-admission rules',
              '**Escalate non-answers** — two weeks of silence: follow up once, then route the client to the conservative plan (register for the full combination) while the question stays open',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The waiver process is also a client-acquisition asset: "we obtained written waivers from 4 of your 5 target universities, cutting your exam load by half" is the most concrete deliverable in the CSCA advisory space.',
          },
        ],
      },
      {
        id: 'sica-stack',
        h2: 'The SICA stack for partners — where the prep pack fits',
        intro:
          'What SICA provides to partner agencies and how to position it in the client conversation.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Client-facing guides (the 18-guide cluster)** — white-label-able depth for every client question; link clients to the specific guide rather than re-explaining, and keep your advisory time for sequencing decisions',
              '**CSCA prep pack** — term glossaries (math, physics diagrams, STEM/Humanities decks), aligned MCQ sets, and subject-combination review; ships with SICA application-support tiers',
              '**Positioning: at triage, not as an upsell** — the prep pack answers the client\'s first real anxiety ("what do I study?"); introducing it during triage converts, introducing it after registration reads as a fee',
              '**Counselor escalation** — SICA counselors take the cases that exceed partner capacity: CSC two-channel strategies, MBBS licensing verification, gray-zone applicants',
              '**The cluster as your training system** — new counselors read the flagship + dates + registration guides first; the FAQ page doubles as the onboarding quiz bank',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The complete CSCA cluster — flagship, logistics pillars, subject deep-dives, comparisons, scenarios, this handbook, and the 50-question FAQ — is the reference layer for every CSCA conversation you will have this cycle.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the fastest way to determine a client\'s CSCA obligations?',
        a: 'Run the five-question triage: degree level, program type, teaching language, current HSK/English position, and scholarship ambitions. The answers determine the exam set — no CSCA for master\'s/PhD, HSK-only for language programs with HSK 4, fundamentals + IELTS/TOEFL for English-taught degrees, both tracks for Chinese-taught degrees.',
      },
      {
        q: 'Can I rely on a combination table instead of verifying each program?',
        a: 'No — treat combination tables as a prior that primes the question. Combinations are set per program, drift between cycles, and change fastest for English-taught programs. The program\'s written confirmation is the only citable answer; batch the emails per university to make it scalable.',
      },
      {
        q: 'How do I run waiver checks for a large client list?',
        a: 'Standardize one waiver-email template (program, intake, HSK score, the ask, and the written-confirmation question), batch requests by university rather than by client, file every reply against the client record, and re-confirm each intake cycle. Non-answers after two weeks: follow up once, then put the client on the conservative full-combination plan.',
      },
      {
        q: 'What should partners do when a client insists they are exempt?',
        a: 'Never let a client skip registration on an assumption — exemptions exist only with the university\'s written confirmation. Deliver the script: exemptions for language programs with HSK 4, waivers for qualifying HSK scores, and everything else gets verified in writing before any planning.',
      },
      {
        q: 'Which clients need the earliest CSCA session of the year?',
        a: 'CSC scholarship applicants, without exception — deadlines cluster January–April, so the earliest session is the primary attempt and only one fallback sitting remains. Clients applying to early-deadline top-tier programs should also front-load; everyone else targets 4–6 months before intake.',
      },
      {
        q: 'What materials does SICA provide to partners for CSCA advising?',
        a: 'The 18-guide client-facing cluster for every question, the CSCA prep pack (term glossaries, aligned MCQ sets, subject-combination review) shipped with application-support tiers, and counselor escalation for CSC two-channel strategies, MBBS licensing verification, and gray-zone cases. Position the prep pack at triage, not as a post-registration upsell.',
      },
    ],
    howToSteps: [
      {
        name: 'Triage every new client with the five questions',
        text: 'Degree level, program type, teaching language, current HSK/English, scholarship ambitions. Write the five answers at the top of the client file — every downstream decision cites them.',
      },
      {
        name: 'Issue the triage line and the exam set',
        text: 'Convert the triage into a one-line exam list ("CSCA (Math + Physics) + IELTS", "HSK only", "CSCA + HSK, waiver pending"). If the line cannot be written, the triage is incomplete.',
      },
      {
        name: 'Verify combinations and run waiver checks in writing',
        text: 'Send the standardized email per program (batched by university), collecting subjects, Chinese-track status, thresholds, and deadlines. Run the waiver template for every HSK-qualifying client. File all replies.',
      },
      {
        name: 'Build the one-page calendar with the client',
        text: 'Five lanes: CSCA sessions, application deadlines, scholarship windows, language tests, deliverables. Work backwards from the earliest file-complete date; lock CSC clients to the earliest session plus one fallback.',
      },
      {
        name: 'Deliver the six-mistake scripts at triage',
        text: 'Exemption assumptions, combination assumptions, last-day payments, score-attachment assumptions, agent registrations, two-gate confusion — one paragraph each, before the damage, not after.',
      },
      {
        name: 'Operate the review cadence to results day',
        text: '15-minute calendar checks at every milestone: registration opened, ticket issued, results released, files sent, reports attached. Then run the retake decision rule for any client short of target.',
      },
    ],
    ctaTitle: 'Advising clients on the CSCA at scale?',
    ctaSubtitle:
      'SICA partners get the full 18-guide client-facing cluster, the CSCA prep pack with application-support tiers, and counselor escalation for complex cases. Talk to us about the partner program — the first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/partner/register',
        label: 'Become a SICA partner',
        description: 'Join the partner program and get the full advisory stack.',
      },
      {
        href: '/csca-faq',
        label: 'CSCA FAQ — 50 questions',
        description: 'The client-question bank, doubled as counselor onboarding material.',
      },
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The flagship client-facing overview behind this handbook.',
      },
    ],
  },
  zh: {
    slug: 'csca-partner-guide',
    eyebrow: '指南 · CSCA × 合作伙伴',
    title: '为客户做 CSCA 顾问——合作伙伴与顾问手册',
    description:
      '顾问侧的 CSCA 打法：五问客户分诊、科目组合矩阵、一页日历模板、六大客户错误的话术，以及批量跑免考核验的流程。',
    subtitle:
      '本手册把 18 篇 CSCA 指南压缩成顾问工作流：如何用五个问题为新客户分诊、各项目族要求哪种 CSCA 科目组合、让考试场次与申请截止和奖学金窗口互不相撞的一页日历模板、六个让客户损失场次或金钱的错误及其话术，以及为整份客户名单批量运行豁免/免考核验的流程。面向 SICA 合作机构与顾问；这里引用的每条规则都链接到面向客户的解释指南。',
    stats: [
      { value: '5 问', label: '每位客户的分诊' },
      { value: '6 套', label: '顾问打法' },
      { value: '1 页', label: '每客户日历模板' },
      { value: '18 篇', label: '背后的客户指南' },
    ],
    quickAnswer:
      '为客户做 CSCA 顾问归结为五个顾问动作：(1) 用五个问题分诊客户——学位层级、项目类型、授课语言、当前 HSK/英语位置、奖学金野心——答案决定整套考试清单；(2) 逐项目书面确认科目组合，绝不凭记忆或上一周期；(3) 在规划任何备考周之前先跑豁免与免考核验（HSK 4 语言项目；合格 HSK 免专业中文）；(4) 建立把 CSCA 场次与申请截止、奖学金窗口排序的一页日历——CSC 客户意味着年内最早场次加至多一次兜底；(5) 执行清单纪律：书面确认归档、窗口开放首日报名、成绩单附进每份申请。六个最昂贵的客户错误——假设豁免、组合报错、最后一天付款、漏附成绩、中介代报、执照说法未核验——全部被这些动作预防。',
    keyTakeaways: [
      '每位客户用同样的五个问题分诊——答案决定整套考试清单与日历',
      '科目组合按项目设定且逐周期漂移：逐项目书面确认，每周期，无例外',
      '先跑免考核验再规划备考——一条确认的免考删掉数周工作并重构整个日历',
      '每客户一页日历：CSCA 场次、申请截止、奖学金窗口、语言考试——不在一页上就没有被管理',
      '六个昂贵客户错误全部源于跳过核验——你作为顾问的价值正是别人不做的核验',
      'SICA 备考资料包（术语表、选择题套题）随支持档位提供；在分诊时摆放，而不是报名后加售',
    ],
    sections: [
      {
        id: 'triage',
        h2: '客户分诊——五个问题',
        intro:
          '每场 CSCA 对话都从同样的五个问题开始。它们花十分钟，决定之后的一切。',
        blocks: [
          {
            type: 'table',
            caption: '分诊矩阵——答案驱动考试清单',
            columns: ['问题', '分支', '考试清单后果'],
            rows: [
              ['学位层级？', '硕士 / 博士', '无 CSCA——转而就项目自有要求做顾问'],
              ['项目类型？', '中文授课语言项目', '有效 HSK 4 → 整体豁免；考试清单只有 HSK'],
              ['授课语言？', '英文授课', 'CSCA 基础科 + 雅思/托福；除非冲免考否则无 HSK'],
              ['当前 HSK / 英语？', 'HSK 5+ 或接近', '在任何备考规划前先跑免考核验'],
              ['奖学金野心？', 'CSC 或全额奖学金', '年内最早场次；+5-10 分溢价；至多一次兜底'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**把分诊写下来**——五个答案放在客户档案顶端；之后的每个决策都引用它们',
              '**医学与工科标记**——这两个项目族有特定的组合模式与早期截止；一旦标记，立即路由到 MBBS 与科目指南',
              '**灰色地带客户**（转学、间隔年、华裔）——豁免指南的边缘情形表就是话术；双闸确认同样适用',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '分诊的产出是一行考试清单——「CSCA（数学 + 物理）+ 雅思」或「仅 HSK」或「CSCA + HSK，免考待确认」。写不出这行字，分诊就没做完。',
          },
        ],
      },
      {
        id: 'combination-matrix',
        h2: '科目组合矩阵',
        intro:
          '你最常被问到组合的参照表——以及排在它之上的核验规则。',
        blocks: [
          {
            type: 'table',
            caption: '按项目族的典型 CSCA 组合（逐项目逐周期核验）',
            columns: ['项目族', '典型组合', '顾问备注'],
            rows: [
              ['工科 / 计算机', '理工中文 + 数学 + 物理', '部分英文授课计算机项目去掉中文轨'],
              ['商科 / 经济', '人文中文 + 数学', '英文授课变体常仅基础科'],
              ['医学 / MBBS', '数学 + 化学', '逐院系核验；执照背景见 MBBS 指南'],
              ['药学 / 生命科学', '数学 + 化学（±物理）', '偶有物理或化学二选一'],
              ['法律 / 国际关系', '人文中文 + 数学', '面向中国的项目保留语言信号'],
              ['设计 / 传媒 / 人文', '差异大', '全场差异最大——必须逐一核验'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**本表是先验、不是答案**——组合会漂移且英文授课项目变得最快；逐项目的书面确认才是唯一可引用的来源',
              '**批量核验**——一套邮件模板逐项目发送，收集：要 CSCA 吗？科目？中文轨？语言阈值？截止形状？在整份客户名单上标准化',
              '**维护实时矩阵表**——按招生周期把收到的确认函存进共享表格；第二个问同一项目的客户应该花你零封邮件',
              '**并集报名**——同一客户的清单组合混合时，一场报并集；¥700 档让加科几乎免费',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '绝不凭记忆或上一周期引用组合——客户最不能原谅的顾问错误就是报错科目。矩阵负责提示问题；项目的书面回复负责回答。',
          },
        ],
      },
      {
        id: 'calendar-template',
        h2: '一页客户日历',
        intro:
          '每个客户一页、五条泳道。放不进一页，就是没在管理。',
        blocks: [
          {
            type: 'table',
            caption: '五泳道日历模板',
            columns: ['泳道', '放什么', '冲突规则'],
            rows: [
              ['CSCA 场次', '报名窗口开放、已报名、考试日、出分日', '每个窗口开放 48 小时内完成报名'],
              ['大学申请', '逐项目截止、材料齐备日（截止前 2 周）', '齐备日压倒截止日；无例外'],
              ['奖学金窗口', '使馆 + 大学 CSC 截止（1-4 月）', 'CSC 客户：年内最早场次，钉死'],
              ['语言考试', '雅思/托福/HSK 日期 + 一次重考窗口', '语言考试落在最早齐备日之前'],
              ['交付物', '学习计划、推荐信、体检、翻译', '每项有归属日期，不是「到时候」'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**书面的倒排**——从最早申请截止倒推到场次选择再到备考起点；纸上的算术防止日后的乐观滑坡谈话',
              '**高端客户的存分策略**——能提早 6 个月以上考试的客户都应该早考；它消除挤压并让重考容量翻倍',
              '**CSC 叠加层**——奖学金客户在同一页上叠加 CSC 指南的日历主线：主考场次、一次兜底、材料截止钉死',
              '**复盘节奏**——每个里程碑一次 15 分钟日历检查（报名开、准考证出、成绩出、材料寄出）；不复盘的日历只是愿望清单',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '模板的隐藏价值：冲突提前数月显形。场次落在齐备日之后、或语言重考撞上 CSC 周，在九月是两分钟的修正，在三月是危机。',
          },
        ],
      },
      {
        id: 'six-mistakes',
        h2: '六个昂贵客户错误——及顾问话术',
        intro:
          '这六个几乎解释了所有 CSCA 相关的客户损失。每个都有一段话术；在分诊时讲，不要在损失后讲。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**「我不需要考 CSCA」（豁免假设）**——话术：「豁免对持 HSK 4 的语言项目存在，高分 HSK 有免考——但都要大学的书面确认。规划任何事之前我们先拿到确认。」绝不让客户凭论坛帖跳过报名。',
              '**「我朋友考的是数学 + 物理」（组合假设）**——话术：「组合按项目设定、周期间会变。我们逐校书面确认——那个回复就是你的报名清单。」',
              '**「我最后一天再付款」（转账陷阱）**——话术：「银行转账要 3-5 个工作日，未支付订单会悄悄过期。窗口头几天就用支付宝/微信付。」境外客户：提前一个月开通国际版支付宝/微信。',
              '**「大学会自己收到我的成绩」（附带假设）**——话术：「没有任何自动传送——你下载报告并附进每份申请。出分日我们跑逐校附带清单。」',
              '**「我的中介帮我报了名」（中介陷阱）**——话术：「中介收费高于官方 ¥450/¥700、变不出考位，且他们的错误记在你的档案上。官方门户报名只要 15 分钟——我们一起做。」',
              '**「这场考试算我回国执照」（双闸混淆，MBBS 客户）**——话术：「CSCA 是中国的入学闸门。你委员会的执照考试（FMGE/NExT、NRE）在毕业后、规则不变。任何押金前我们先核验项目的 MOE 名单。」',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '六个错误共享同一根因：一个本该成为核验的假设。你作为顾问可开票的价值恰恰是客户跳过的那些核验——在服务说明里把这一点讲明。',
          },
        ],
      },
      {
        id: 'waiver-at-scale',
        h2: '批量跑免考核验',
        intro:
          '对 10+ 客户的名单，逐个发免考邮件就成了流程。像流程一样跑它。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**标准化免考邮件**——一套模板：客户项目、入学批次、HSK 级别与分数、请求（整体豁免或专业中文免考）、以及收尾问题（「请书面确认该项目是否要求 CSCA」）。为中文招办准备中文版。',
              '**按大学而非按客户分批**——大学按项目作答；把目标同校的客户集中起来，每项目问一次。记录在实时矩阵表里。',
              '**每份回复归档到客户档案**——免考确认函是 CSC 材料的必备文件、也是日后任何争议的辩护；像对待成绩单一样对待它。',
              '**设重核触发器**——免考政策年轻且漂移；每个新招生周期重新确认，大学公布国际招生新规时立即确认',
              '**无答复升级**——沉默两周：跟进一次，然后让客户走保守方案（报全科组合），问题保持开放',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '免考流程也是获客资产：「我们从你 5 所目标大学中的 4 所拿到了书面免考，把你的考试量砍掉一半」是 CSCA 顾问空间里最具体的交付物。',
          },
        ],
      },
      {
        id: 'sica-stack',
        h2: 'SICA 给合作伙伴的弹药——备考资料包的位置',
        intro:
          'SICA 为合作机构提供什么，以及如何在客户对话中摆放它。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**面向客户的 18 篇指南簇**——每个客户问题都有可白标化的深度；让客户去读具体指南，把你的顾问时间留给排序决策',
              '**CSCA 备考包**——术语表（数学、物理图形、理工/人文卡组）、对齐选择题套题、科目组合复核；随 SICA 申请支持档位提供',
              '**摆放：在分诊时，不是加售**——备考包回答客户的第一个真实焦虑（「我学什么？」）；分诊时介绍能转化，报名后介绍像收费',
              '**顾问升级**——超出合作伙伴能力的案例交给 SICA 顾问：CSC 双渠道策略、MBBS 执照核验、灰色地带申请者',
              '**指南簇就是你的培训体系**——新顾问先读旗舰 + 时间 + 报名三篇；FAQ 页兼任入职测验题库',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '完整的 CSCA 簇——旗舰、后勤支柱、科目深潜、对比、场景、本手册与 50 问 FAQ——就是你本周期每场 CSCA 对话的参照层。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '判定客户 CSCA 义务最快的方法是什么？',
        a: '跑五问分诊：学位层级、项目类型、授课语言、当前 HSK/英语位置、奖学金野心。答案决定考试清单——硕士/博士无 CSCA、持 HSK 4 的语言项目仅 HSK、英文授课为基础科 + 雅思/托福、中文授课双轨都要。',
      },
      {
        q: '可以只靠组合表、不逐项目核验吗？',
        a: '不能——把组合表当提示问题的先验。组合按项目设定、周期间漂移、英文授课项目变得最快。项目的书面确认才是唯一可引用的答案；按大学分批发邮件让它可规模化。',
      },
      {
        q: '大客户名单怎么批量跑免考核验？',
        a: '标准化一套免考邮件模板（项目、批次、HSK 分数、请求、书面确认问题），按大学而非按客户分批请求，每份回复归档到客户记录，并逐招生周期重新确认。两周无答复：跟进一次，然后让客户走保守的全科组合方案。',
      },
      {
        q: '客户坚称自己豁免时，合作伙伴该怎么做？',
        a: '绝不让客户凭假设跳过报名——豁免只在大学书面确认后存在。交付话术：HSK 4 语言项目豁免、合格 HSK 免考、其余一切规划前书面核验。',
      },
      {
        q: '哪些客户需要年内最早的 CSCA 场次？',
        a: 'CSC 奖学金申请者，没有例外——截止集中在 1-4 月，最早场次是主考、只剩一次兜底。申请顶尖早期截止项目的客户同样要前置；其余客户瞄准入学前 4-6 个月。',
      },
      {
        q: 'SICA 为合作伙伴的 CSCA 顾问提供什么材料？',
        a: '18 篇面向客户的指南簇覆盖每个问题、随申请支持档位提供的 CSCA 备考包（术语表、对齐选择题套题、科目组合复核），以及复杂案例（CSC 双渠道策略、MBBS 执照核验、灰色地带申请者）的顾问升级。在分诊时摆放备考包，而不是报名后加售。',
      },
    ],
    howToSteps: [
      {
        name: '每位新客户跑五问分诊',
        text: '学位层级、项目类型、授课语言、当前 HSK/英语、奖学金野心。五个答案写在客户档案顶端——之后每个决策都引用它们。',
      },
      {
        name: '产出分诊行与考试清单',
        text: '把分诊转成一行考试清单（「CSCA（数学 + 物理）+ 雅思」「仅 HSK」「CSCA + HSK，免考待确认」）。写不出这行，分诊就没完成。',
      },
      {
        name: '书面核验组合并跑免考核验',
        text: '逐项目发送标准化邮件（按大学分批），收集科目、中文轨状态、阈值与截止。为每位 HSK 达标客户跑免考模板。全部回复归档。',
      },
      {
        name: '与客户共建一页日历',
        text: '五条泳道：CSCA 场次、申请截止、奖学金窗口、语言考试、交付物。从最早齐备日倒排；CSC 客户钉死最早场次加一次兜底。',
      },
      {
        name: '在分诊时交付六错误话术',
        text: '豁免假设、组合假设、最后一天付款、成绩附带假设、中介代报、双闸混淆——各一段话，在损失之前讲，不在之后。',
      },
      {
        name: '按复盘节奏运行到出分日',
        text: '每个里程碑一次 15 分钟日历检查：报名开、准考证出、成绩出、材料寄、报告附。然后对任何未达标客户跑重考决策规则。',
      },
    ],
    ctaTitle: '正在规模化地为客户做 CSCA 顾问？',
    ctaSubtitle:
      'SICA 合作伙伴获得完整的 18 篇客户指南簇、随申请支持档位提供的 CSCA 备考包，以及复杂案例的顾问升级。了解合作伙伴计划——首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/partner/register',
        label: '成为 SICA 合作伙伴',
        description: '加入合作伙伴计划，获得完整顾问弹药。',
      },
      {
        href: '/csca-faq',
        label: 'CSCA 问答——50 问',
        description: '客户问题库，兼作顾问入职材料。',
      },
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '本手册背后的旗舰客户总览。',
      },
    ],
  },
};

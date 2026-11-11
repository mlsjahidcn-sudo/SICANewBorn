import type { LocalizedGuide } from './types';

/**
 * CSC Type B scholarship interviews and entrance exams for 2027.
 * Target queries: "csc scholarship interview questions",
 * "csc university entrance exam online", "csc type b interview 2027".
 *
 * Grounded only in:
 * - SISU Chinese Government Scholarship (Type B) 2027 Application Fact Sheet
 *   (OISA, 19 Oct 2026)
 * - NPU 2027 Master / PhD Program Application Guides
 * - NPU CSC University Program page (agency 10699)
 * - Campus China information system
 *
 * [verify] Do not invent official “typical CSC interview question” lists,
 * Type A interview rules, bachelor’s interview rules, reschedule policies,
 * or exam language unless a cited university notice states them.
 */
export const cscScholarshipInterview2027Guide: LocalizedGuide = {
  en: {
    slug: 'csc-scholarship-interview-2027',
    eyebrow: 'GUIDE · CSC 2027',
    title: 'CSC Scholarship Interviews and Entrance Exams for 2027: What to Expect',
    description:
      'CSC Type B 2027 interviews and entrance exams: SISU online written and oral tests 1–11 Dec 2026, NPU interview windows, what happens if you miss email, and what comes after you pass.',
    seoTitle: 'CSC Scholarship Interview and Entrance Exam 2027 | SICA',
    seoDescription:
      'Shortlisted for a CSC Type B scholarship? Universities like SISU hold online written and oral exams on Dec 1-11, 2026. What they test and how to prepare.',
    subtitle:
      'Shortlisted for a university (Type B) Chinese Government Scholarship? Many schools test you before they issue admission or pre-admission. This guide uses Shanghai International Studies University (SISU) and Northwestern Polytechnical University (NPU) 2027 notices as concrete examples — other universities set their own dates.',
    stats: [
      { value: 'Type B', label: 'University decides shortlist' },
      { value: '1–11 Dec', label: 'SISU 2026 online exams' },
      { value: '7–10 days', label: 'NPU interview after deadline' },
      { value: '≠ award', label: 'Pass ≠ final CSC scholarship' },
    ],
    quickAnswer:
      'For CSC Type B (university programme) scholarships, the university — not the embassy — decides who goes forward, and many test you first. SISU runs online written exams and oral interviews on 1–11 December 2026 for applicants who applied by 22 November; missing it counts as withdrawing. NPU interviews qualified applicants 7–10 working days after each deadline.',
    keyTakeaways: [
      'Type B interviews/exams are set by the university; Type A follows the embassy notice',
      'SISU 2027: apply by 22 Nov 2026; online written + oral exams 1–11 Dec 2026',
      'NPU 2027: academic review within three days; interviews 7–10 working days after each deadline',
      'Absence or ignored email can forfeit the application',
      'Passing the university step is not the final CSC award',
      'Bachelor’s CSC routes use CSCA score reports — do not assume a master’s-style interview',
    ],
    sections: [
      {
        id: 'do-all-applicants-interview',
        h2: 'Do all CSC scholarship applicants have to sit an interview or exam?',
        intro:
          'No single rule. Type B applications go through the university, which may review documents, interview or examine you before issuing an admission or pre-admission notice.',
        blocks: [
          {
            type: 'p',
            text: 'Chinese Government Scholarship channels are not identical. On the university programme (Type B) route, the host university shortlists and often tests applicants before it supports your CSC file. On the bilateral / embassy (Type A) route, you follow the dispatching authority’s notice — do not assume Type A applicants sit the same university entrance exam described here.',
          },
          {
            type: 'ul',
            items: [
              '**Type B** — university may use document review only, or add a written exam, oral interview, or both before admission / pre-admission',
              '**Type A** — follow the embassy or ministry notice for that country; interview rules (if any) come from that notice, not from SISU/NPU Type B sheets',
              '**Always read your target school’s current fact sheet** — dates and formats change each cycle',
            ],
          },
          {
            type: 'links',
            items: [
              {
                label: 'CSC Scholarship 2027/2028 — Type A vs Type B',
                href: '/chinese-government-scholarship-csc',
              },
              {
                label: 'CSC deadlines tracker 2027/2028',
                href: '/csc-scholarship-deadlines-2027-2028',
              },
            ],
          },
        ],
      },
      {
        id: 'when-are-2027-interviews',
        h2: 'When are the 2027 Type B interviews and exams?',
        intro:
          'There is no single national calendar. Use the two official examples below, then check your own university’s notice.',
        blocks: [
          {
            type: 'h3',
            text: 'SISU 2027 Type B (master’s and PhD)',
            body: 'Apply in both the CSC system and the SISU system by 22 November 2026, 24:00 Beijing time. Exam-list review is on 27 November (if you fail this check, you do not sit the exam). Online entrance exams run 1–11 December 2026. The admission list is published on 14 December; admitted status and the programme admission notice follow on 15–16 December. SISU plans about 50 full-scholarship places for the September 2027 intake (subject to approval); institution code 10271.',
          },
          {
            type: 'h3',
            text: 'NPU 2027 master’s and PhD',
            body: 'Academic schools review materials within three days after each deadline. Qualified applicants are invited to an examination or interview 7–10 working days after each deadline; results go out by email within two weeks. For the CSC University Program (Type B, agency 10699), batch 1 runs 1 November–31 December 2026 at 17:00 Beijing time, and batch 2 runs 1 January–28 February 2027 at 17:00 Beijing time.',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Other universities set their own interview and exam dates. Treat SISU and NPU as working examples, not a universal CSC timetable.',
          },
          {
            type: 'links',
            items: [
              {
                label: 'Pre-admission letter for CSC 2027',
                href: '/pre-admission-letter-csc-2027',
              },
              {
                label: 'CSC scholarship results 2027',
                href: '/csc-scholarship-result-2027',
              },
            ],
          },
        ],
      },
      {
        id: 'what-does-the-university-test',
        h2: 'What does the university test?',
        intro:
          'SISU uses an online written exam plus an oral interview; NPU emails the method, content and time to qualified applicants after material review.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**SISU** — online written exam and oral interview; detailed arrangements are sent by email',
              '**NPU** — examination or interview whose method, content and time are emailed to qualified applicants',
              '**NPU CSC University Program page** — applicants undergo two rounds of material review, interviews and comprehensive assessment',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Universities do not publish a single official “CSC interview question bank.” The preparation list below is practical advice from SICA’s admissions work — not questions copied from an SISU or NPU notice.',
          },
          {
            type: 'h3',
            text: 'How to prepare (SICA advice)',
            body: 'Be ready to explain your study plan or research proposal, your previous studies, why this university and major, and your plans after graduation. Test your camera, microphone and internet before an online session. Keep your passport, application PDF and any requested documents within reach.',
          },
          {
            type: 'ol',
            items: [
              'Re-read your study plan / research proposal the night before',
              'Prepare a short story of your previous degree and any research or work',
              'Be clear why this university and this major — name supervisors or labs only if you already contacted them honestly',
              'State realistic plans after graduation (further study, home-country career, or China-related work)',
              'Check camera, mic, lighting and a quiet room; have a backup network if you can',
              'Watch spam and the university portal daily for the invite email',
            ],
          },
        ],
      },
      {
        id: 'if-you-miss-interview',
        h2: 'What happens if I miss the interview or don’t reply to the email?',
        intro:
          'SISU treats absence as withdrawal; NPU treats late or missing replies and materials as forfeiting the application.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**SISU** — absence from the entrance exam counts as withdrawing from the application',
              '**NPU** — applicants who fail to reply to emails on time or to submit requested supplementary materials are treated as forfeiting the application',
              '**Your action** — check spam folders and the university applicant portal every day once the deadline passes',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'If something goes wrong on exam day, contact the international student / admissions office immediately using the email on the official notice. Do not wait for a second invite.',
          },
        ],
      },
      {
        id: 'after-you-pass',
        h2: 'What happens after I pass?',
        intro:
          'You receive university admission or pre-admission steps first; CSC still decides the scholarship later.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**SISU** — you get “Admitted” status and a programme admission notice; SISU returns your CSC form; you must upload the notice and resubmit in the CSC system. The first CSC submission is not the final scholarship submission.',
              '**NPU** — qualified candidates receive a pre-admission notice, then submit the CSC form and send NPU your CSC serial number.',
              '**CSC review** — passing the university exam is **not** the scholarship award. SISU lists CSC review around April–May 2027, with results around June–August 2027.',
            ],
          },
          {
            type: 'links',
            items: [
              {
                label: 'Pre-admission letter for CSC 2027 — next uploads',
                href: '/pre-admission-letter-csc-2027',
              },
              {
                label: 'When CSC 2027 results are published',
                href: '/csc-scholarship-result-2027',
              },
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Keep screenshots of every status change and email. You will need them if CSC or the university asks you to resubmit.',
          },
        ],
      },
      {
        id: 'bachelors-applicants',
        h2: 'Do bachelor’s applicants face this too?',
        intro:
          'Both official examples above are for master’s and PhD. Bachelor’s CSC applicants are assessed with a CSCA score report under the 2027/2028 embassy notices.',
        blocks: [
          {
            type: 'p',
            text: 'Do not invent a bachelor’s interview rule from the SISU or NPU postgraduate Type B sheets. If your undergraduate CSC route requires CSCA, prepare the exam and score report on that timeline instead of waiting for a master’s-style oral interview.',
          },
          {
            type: 'links',
            items: [
              {
                label: 'CSCA and the CSC scholarship',
                href: '/csca-csc-scholarship',
              },
            ],
          },
        ],
      },
      {
        id: 'plan-with-sica',
        h2: 'Plan your university choices before the deadlines',
        intro:
          'SICA has ten years in study-in-China admissions (parent company Ednex Group LTD, UK), supporting students from countries including Kyrgyzstan, Tajikistan, Bangladesh, Pakistan, Tanzania, Ethiopia, Nigeria, Gabon and Yemen.',
        blocks: [
          {
            type: 'p',
            text: 'If you are choosing between Type B universities and need a clear timeline for exams, pre-admission and CSC resubmission, book a free consultation before the next deadline.',
          },
          {
            type: 'links',
            items: [
              {
                label: 'Book a free counselling session',
                href: '/counselling',
              },
              {
                label: 'CSC Scholarship 2027/2028 overview',
                href: '/chinese-government-scholarship-csc',
              },
            ],
          },
        ],
      },
      {
        id: 'sources',
        h2: 'Official sources',
        intro: 'Cite these university and CSC pages when you verify dates for your own application.',
        blocks: [
          {
            type: 'links',
            items: [
              {
                label:
                  'SISU Chinese Government Scholarship (Type B) 2027 Application Fact Sheet (PDF)',
                href: 'https://saggas.shisu.edu.cn/Upload/Articles/2026-10-19/Original/88488635-0a91-4009-8eb3-64eabf783477.pdf',
              },
              {
                label: 'NPU 2027 Master Program Application Guide',
                href: 'https://studyat.nwpu.edu.cn/info/1303/8791.htm',
              },
              {
                label: 'NPU 2027 PhD Program Application Guide',
                href: 'https://studyat.nwpu.edu.cn/info/1313/8831.htm',
              },
              {
                label: 'NPU CSC University Program (Type B, agency 10699)',
                href: 'https://studyat.nwpu.edu.cn/info/1009/10571.htm',
              },
              {
                label: 'Campus China — CSC information system',
                href: 'https://www.campuschina.org/',
              },
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is the CSC interview online?',
        a: 'SISU’s 2027 entrance exams are online (written and oral). NPU emails the method — online or otherwise — to qualified applicants. Always follow your own university’s notice.',
      },
      {
        q: 'Is the interview in English or Chinese?',
        a: 'Do not assume one language for every school. It normally follows the programme’s teaching language and whatever the university states in the invite email.',
      },
      {
        q: 'Can I reschedule a CSC Type B interview?',
        a: 'Universities rarely publish a general reschedule right. SISU treats absence as withdrawal — contact the admissions office immediately if there is a genuine problem.',
      },
      {
        q: 'Does passing the university exam guarantee the scholarship?',
        a: 'No. The university step comes first; CSC makes the final award later (SISU lists CSC review around April–May 2027 and results around June–August 2027).',
      },
      {
        q: 'How long after the interview do I hear back?',
        a: 'NPU sends results by email within two weeks. SISU publishes the admission list on 14 December 2026 and issues admitted status plus admission notices on 15–16 December 2026.',
      },
    ],
    howToSteps: [
      {
        name: 'Confirm Type B vs Type A',
        text: 'Read whether your route is university programme (Type B) or embassy/bilateral (Type A). Only Type B follows the host university’s exam calendar.',
      },
      {
        name: 'Submit before the university deadline',
        text: 'Complete both the CSC system and the university system where required (e.g. SISU by 22 November 2026, 24:00 Beijing).',
      },
      {
        name: 'Watch email and the portal',
        text: 'Expect exam or interview details by email after shortlisting. Check spam daily; missing the session can forfeit the file.',
      },
      {
        name: 'Prepare your story and tech',
        text: 'Be ready on study plan, past studies, why this school, and post-graduation plans. Test camera, mic and internet for online exams.',
      },
      {
        name: 'Upload and resubmit after admission',
        text: 'If you pass, follow the university’s admission or pre-admission steps and complete any CSC resubmission. Wait for the final CSC award.',
      },
    ],
    ctaTitle: 'Need a Type B interview timeline?',
    ctaSubtitle:
      'SICA helps you choose universities and sequence exams, pre-admission and CSC resubmission before the next deadline. First consultation free.',
    ctaApplyLabel: 'Get the Admission Kit',
    ctaContactLabel: 'Book free counselling',
    related: [
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC Scholarship 2027/2028',
        description: 'Type A vs Type B, coverage, and the full document picture.',
      },
      {
        href: '/pre-admission-letter-csc-2027',
        label: 'Pre-admission letter for CSC 2027',
        description: 'What to upload after the university shortlists you.',
      },
      {
        href: '/csc-scholarship-deadlines-2027-2028',
        label: 'CSC deadlines 2027/2028',
        description: 'Country-channel dates alongside university Type B clocks.',
      },
    ],
    publishedAt: '2026-11-11',
    updatedAt: '2026-11-11',
  },
  zh: {
    slug: 'csc-scholarship-interview-2027',
    eyebrow: '指南 · CSC 2027',
    title: 'CSC 2027 奖学金面试与入学考试：你会遇到什么',
    description:
      'CSC Type B 2027 面试与入学考试：上外 2026 年 12 月 1–11 日线上笔试与口试、西工大面试窗口、错过邮件会怎样，以及通过后如何推进。',
    seoTitle: 'CSC 奖学金面试与入学考试 2027 | SICA',
    seoDescription:
      '已进入 CSC Type B 学校初审？上外等高校在 2026 年 12 月 1–11 日安排线上笔试与口试。考什么、如何准备，一文说清。',
    subtitle:
      '已进入高校项目（Type B）中国政府奖学金初审？许多学校会在发放录取或预录取前先考试或面试。本指南以上海外国语大学（SISU）与西北工业大学（NPU）2027 通知为具体例子——其他高校时间表以本校通知为准。',
    stats: [
      { value: 'Type B', label: '由高校决定进入下一轮' },
      { value: '12/1–11', label: '上外 2026 线上考试' },
      { value: '7–10 天', label: '西工大截止后面试窗口' },
      { value: '≠ 获奖', label: '通过校考 ≠ 最终 CSC 资助' },
    ],
    quickAnswer:
      '对于 CSC Type B（高校项目）奖学金，由大学——而不是使馆——决定谁进入下一轮，且许多学校会先考试。上外对在 11 月 22 日前完成申请的同学，于 2026 年 12 月 1–11 日安排线上笔试与口试；缺考视为放弃。西工大在各批次截止后 7–10 个工作日对合格申请人组织面试。',
    keyTakeaways: [
      'Type B 面试/考试由高校安排；Type A 遵循使馆/选派通知',
      '上外 2027：2026 年 11 月 22 日前申请；12 月 1–11 日线上笔试+口试',
      '西工大 2027：学院三日内审材料；各截止后 7–10 个工作日面试',
      '缺考或未及时回复邮件可能导致申请作废',
      '通过校考不等于最终获得 CSC 奖学金',
      '本科 CSC 路径以 CSCA 成绩单为主——勿套用硕博面试规则',
    ],
    sections: [
      {
        id: 'do-all-applicants-interview',
        h2: '所有 CSC 申请人都必须参加面试或考试吗？',
        intro:
          '没有全国统一规定。Type B 走高校渠道，学校可能只审材料，也可能在发放录取或预录取前安排面试或考试。',
        blocks: [
          {
            type: 'p',
            text: '中国政府奖学金渠道并不相同。高校项目（Type B）由接收院校筛选，并常在支持你的 CSC 材料前安排测试。双边 / 使馆（Type A）以本国选派机构通知为准——不要假定 Type A 申请人也要参加本文所述的高校入学考试。',
          },
          {
            type: 'ul',
            items: [
              '**Type B**——学校可仅审材料，或增加笔试、口试或两者，再发录取 / 预录取',
              '**Type A**——遵循该国使馆或部委通知；若有面试要求，以该通知为准，而非上外/西工大 Type B 说明',
              '**务必阅读目标学校当期事实清单**——日期与形式每年可能调整',
            ],
          },
          {
            type: 'links',
            items: [
              {
                label: 'CSC 奖学金 2027/2028——Type A 与 Type B',
                href: '/chinese-government-scholarship-csc',
              },
              {
                label: 'CSC 截止日期追踪 2027/2028',
                href: '/csc-scholarship-deadlines-2027-2028',
              },
            ],
          },
        ],
      },
      {
        id: 'when-are-2027-interviews',
        h2: '2027 年 Type B 面试与考试何时举行？',
        intro: '没有全国统一日历。请先看以下两个官方例子，再核对本校通知。',
        blocks: [
          {
            type: 'h3',
            text: '上外 2027 Type B（硕士与博士）',
            body: '须在 CSC 系统与上外系统于北京时间 2026 年 11 月 22 日 24:00 前完成申请。11 月 27 日复核考试名单（未通过则不得参加考试）。线上入学考试为 2026 年 12 月 1–11 日。12 月 14 日公布录取名单；12 月 15–16 日更新录取状态并发放项目录取通知。上外 2027 年 9 月入学计划约 50 个全额奖学金名额（以批复为准）；机构代码 10271。',
          },
          {
            type: 'h3',
            text: '西工大 2027 硕士与博士',
            body: '各学院在每批次截止后三个工作日内审材料。合格申请人将在各截止后 7–10 个工作日受邀参加考试或面试；结果两周内邮件通知。CSC 高校项目（Type B，机构号 10699）第一批为 2026 年 11 月 1 日–12 月 31 日北京时间 17:00，第二批为 2027 年 1 月 1 日–2 月 28 日北京时间 17:00。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '其他高校自行安排面试与考试时间。请把上外与西工大当作工作示例，而不是全国统一的 CSC 时间表。',
          },
          {
            type: 'links',
            items: [
              {
                label: 'CSC 2027 预录取通知书',
                href: '/pre-admission-letter-csc-2027',
              },
              {
                label: 'CSC 2027 奖学金结果',
                href: '/csc-scholarship-result-2027',
              },
            ],
          },
        ],
      },
      {
        id: 'what-does-the-university-test',
        h2: '大学考什么？',
        intro:
          '上外安排线上笔试与口试；西工大在材料审核后通过邮件告知合格申请人考试/面试方式、内容与时间。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**上外**——线上笔试与口试；具体安排以邮件通知为准',
              '**西工大**——考试或面试的方式、内容与时间邮件通知合格申请人',
              '**西工大 CSC 高校项目页**——申请人经历两轮材料审核、面试与综合考核',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '各校并未公布统一的“CSC 官方面试题库”。下列准备清单是 SICA 招生工作中的实用建议，不是从上外或西工大通知中抄来的题目。',
          },
          {
            type: 'h3',
            text: '如何准备（SICA 建议）',
            body: '准备好说明学习计划或研究设想、既往学业、为何选择该校该专业，以及毕业后的规划。线上考试前测试摄像头、麦克风与网络。护照、申请 PDF 及要求的材料放在手边。',
          },
          {
            type: 'ol',
            items: [
              '前一晚重读学习计划 / 研究计划',
              '准备一段简洁的既往学位与科研或工作经历',
              '说清为何选择该校该专业——仅在真实联系过的前提下提及导师或实验室',
              '说明毕业后的现实规划（深造、回国就业或与中国相关的工作）',
              '检查摄像头、麦克风、灯光与安静环境；条件允许时准备备用网络',
              '截止后每天查看垃圾邮件与学校申请门户，以免错过邀请',
            ],
          },
        ],
      },
      {
        id: 'if-you-miss-interview',
        h2: '错过面试或未回复邮件会怎样？',
        intro: '上外将缺考视为放弃；西工大将未及时回复邮件或未补交材料视为放弃申请。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**上外**——缺席入学考试视为撤回申请',
              '**西工大**——未按时回复邮件或未提交要求的补充材料，按放弃申请处理',
              '**你的行动**——截止后每天检查垃圾邮件箱与学校申请人门户',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '若考试当日出现问题，请立即用官方通知上的邮箱联系国际学生 / 招生办公室，不要等待第二次邀请。',
          },
        ],
      },
      {
        id: 'after-you-pass',
        h2: '通过之后会发生什么？',
        intro: '你先完成高校录取或预录取步骤；奖学金仍由 CSC 稍后决定。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**上外**——获得“已录取”状态与项目录取通知；学校退回 CSC 表格；你须上传通知并在 CSC 系统中重新提交。首次 CSC 提交并非最终奖学金提交。',
              '**西工大**——合格候选人获预录取通知，随后提交 CSC 表格并向学校发送 CSC 流水号。',
              '**CSC 评审**——通过校考 **不等于** 获得奖学金。上外列出 CSC 评审约在 2027 年 4–5 月，结果约在 2027 年 6–8 月。',
            ],
          },
          {
            type: 'links',
            items: [
              {
                label: 'CSC 2027 预录取——后续上传',
                href: '/pre-admission-letter-csc-2027',
              },
              {
                label: 'CSC 2027 结果何时公布',
                href: '/csc-scholarship-result-2027',
              },
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '请截图保存每一次状态变化与邮件。CSC 或学校要求重新提交时用得上。',
          },
        ],
      },
      {
        id: 'bachelors-applicants',
        h2: '本科申请人也要这样吗？',
        intro:
          '上述两个官方例子均为硕士与博士。本科 CSC 申请人在 2027/2028 使馆通知下以 CSCA 成绩单作为评估依据。',
        blocks: [
          {
            type: 'p',
            text: '不要从上外或西工大的研究生 Type B 说明中推断出本科面试规则。若你的本科 CSC 路径要求 CSCA，请按该时间线准备考试与成绩单，而不是等待硕博式的口试。',
          },
          {
            type: 'links',
            items: [
              {
                label: 'CSCA 与 CSC 奖学金',
                href: '/csca-csc-scholarship',
              },
            ],
          },
        ],
      },
      {
        id: 'plan-with-sica',
        h2: '在截止前规划学校选择',
        intro:
          'SICA 深耕留学中国招生十年（母公司为英国 Ednex Group LTD），服务来自吉尔吉斯斯坦、塔吉克斯坦、孟加拉国、巴基斯坦、坦桑尼亚、埃塞俄比亚、尼日利亚、加蓬与也门等国的学生。',
        blocks: [
          {
            type: 'p',
            text: '若你正在比较多所 Type B 高校，需要理清考试、预录取与 CSC 重新提交的时间线，请在下一截止日前预约免费咨询。',
          },
          {
            type: 'links',
            items: [
              {
                label: '预约免费咨询',
                href: '/counselling',
              },
              {
                label: 'CSC 奖学金 2027/2028 总览',
                href: '/chinese-government-scholarship-csc',
              },
            ],
          },
        ],
      },
      {
        id: 'sources',
        h2: '官方来源',
        intro: '核实本校日期时，请引用这些高校与 CSC 页面。',
        blocks: [
          {
            type: 'links',
            items: [
              {
                label: '上外中国政府奖学金（Type B）2027 申请说明（PDF）',
                href: 'https://saggas.shisu.edu.cn/Upload/Articles/2026-10-19/Original/88488635-0a91-4009-8eb3-64eabf783477.pdf',
              },
              {
                label: '西工大 2027 硕士项目申请指南',
                href: 'https://studyat.nwpu.edu.cn/info/1303/8791.htm',
              },
              {
                label: '西工大 2027 博士项目申请指南',
                href: 'https://studyat.nwpu.edu.cn/info/1313/8831.htm',
              },
              {
                label: '西工大 CSC 高校项目（Type B，机构号 10699）',
                href: 'https://studyat.nwpu.edu.cn/info/1009/10571.htm',
              },
              {
                label: '来华留学网——CSC 信息系统',
                href: 'https://www.campuschina.org/',
              },
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'CSC 面试是线上的吗？',
        a: '上外 2027 入学考试为线上（笔试与口试）。西工大通过邮件告知合格申请人具体方式——线上或其他。请以本校通知为准。',
      },
      {
        q: '面试用英语还是中文？',
        a: '不要假定所有学校统一语言。通常跟随项目授课语言，以及学校邀请邮件中的说明。',
      },
      {
        q: '可以改期吗？',
        a: '高校很少公布通用的改期权利。上外将缺考视为放弃——若确有困难，请立即联系招生办公室。',
      },
      {
        q: '通过校考就一定拿到奖学金吗？',
        a: '不一定。高校环节在前；最终由 CSC 评审发放（上外列出约 2027 年 4–5 月评审、6–8 月出结果）。',
      },
      {
        q: '面试后多久能收到结果？',
        a: '西工大两周内邮件通知。上外于 2026 年 12 月 14 日公布录取名单，12 月 15–16 日更新录取状态并发放录取通知。',
      },
    ],
    howToSteps: [
      {
        name: '确认 Type B 还是 Type A',
        text: '先确认你走高校项目（Type B）还是使馆/双边（Type A）。只有 Type B 跟随接收院校的考试日历。',
      },
      {
        name: '在高校截止前提交',
        text: '按要求完成 CSC 系统与学校系统（如上外须在北京时间 2026 年 11 月 22 日 24:00 前）。',
      },
      {
        name: '盯紧邮件与门户',
        text: '入围后考试或面试细节多以邮件通知。每天查看垃圾邮件；缺席可能导致申请作废。',
      },
      {
        name: '准备陈述与设备',
        text: '准备学习计划、既往学业、择校理由与毕业规划。线上考试前测试摄像头、麦克风与网络。',
      },
      {
        name: '录取后上传并重新提交',
        text: '通过后按学校录取或预录取步骤操作，并完成任何 CSC 重新提交。等待最终 CSC 获奖结果。',
      },
    ],
    ctaTitle: '需要 Type B 面试时间线？',
    ctaSubtitle:
      'SICA 协助你选择学校，并在下一截止日前安排考试、预录取与 CSC 重新提交。首次咨询免费。',
    ctaApplyLabel: '获取录取工具包',
    ctaContactLabel: '预约免费咨询',
    related: [
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC 奖学金 2027/2028',
        description: 'Type A 与 Type B、资助范围与材料全貌。',
      },
      {
        href: '/pre-admission-letter-csc-2027',
        label: 'CSC 2027 预录取通知书',
        description: '学校入围后需要上传什么。',
      },
      {
        href: '/csc-scholarship-deadlines-2027-2028',
        label: 'CSC 截止日期 2027/2028',
        description: '国家渠道日期与高校 Type B 时钟对照。',
      },
    ],
    publishedAt: '2026-11-11',
    updatedAt: '2026-11-11',
  },
};

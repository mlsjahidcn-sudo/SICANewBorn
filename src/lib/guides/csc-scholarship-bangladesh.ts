import type { LocalizedGuide } from './types';

/**
 * "CSC scholarship for Bangladeshi students 2027" — country-specific
 * scholarship guide (Phase 166). Target queries:
 * "csc scholarship bangladesh", "chinese government scholarship
 * bangladeshi students", "bangladesh china scholarship 2027".
 *
 * Closes the Bangladesh gap from the Phase 147 country guide batch
 * (Pakistan + Nigeria shipped at Phase 147; Bangladesh deferred).
 * Facts grounded in the verified table (2026-10-08): embassy
 * route via the Ministry of Education Bangladesh + University
 * Grants Commission (UGC), Type B via Chinese universities.
 * Bangladesh students make up a substantial share of international
 * enrollment in China.
 *
 * Notable Bangladesh-specific items (the parts that differ from
 * the Pakistan/Nigeria guides):
 *   - Bangladesh has both an embassy route (via MoE + UGC) AND a
 *     direct Type B route; many applicants file both
 *   - The MoE Bangladesh scholarship division processes CSC
 *     nominations through its annual notice (typically released
 *     around October-November [verify])
 *   - Bangladesh applicants are over-represented in medicine,
 *     engineering, and CSC-funded Chinese-taught programs (Bangla
 *     speakers often start HSK preparation early)
 *   - Common failure: name mismatch between Bangla passport
 *     (which may carry Bangla script + English transliteration)
 *     and the university application; pick one English spelling
 *     and use it identically
 */
export const cscBangladeshGuide: LocalizedGuide = {
  en: {
    slug: 'csc-scholarship-bangladesh',
    eyebrow: 'GUIDE · BANGLADESH',
    title: 'CSC Scholarship for Bangladeshi Students 2027',
    description:
      'CSC (Chinese Government Scholarship) for Bangladeshi students 2027: the MoE Bangladesh + UGC embassy route vs the university (Type B) route, deadlines, CSCA for bachelor\'s, documents, and the common name-mismatch failure.',
    seoTitle: 'CSC Scholarship for Bangladeshi Students 2027',
    seoDescription: 'CSC (Chinese Government Scholarship) for Bangladeshi students 2027: the MoE Bangladesh + UGC embassy route vs the university (Type B) route, deadlines',
    subtitle:
      'Bangladeshi applicants reach the Chinese Government Scholarship (CSC) through two routes: the MoE Bangladesh + UGC embassy route (notices typically released October-November [verify]), and the university (Type B) route with January-April 2027 deadlines that vary by university. Bachelor\'s applicants need a CSCA score — the next sittings are November 2026, December 2026, and January 2027. Bangladesh students are a large share of international enrollment in China, particularly in medicine and engineering.',
    stats: [
      { value: '2 routes', label: 'MoE/UGC vs university (Type B)' },
      { value: 'Oct-Nov', label: 'Embassy notice window (typical) [verify]' },
      { value: 'Jan-Apr 2027', label: 'Type B deadlines (varies)' },
      { value: 'CSCA', label: 'Required for bachelor\'s' },
    ],
    quickAnswer:
      'Bangladeshi students apply for the Chinese Government Scholarship (CSC) through two routes. Route 1 — the MoE Bangladesh + UGC embassy route: the Bangladesh MoE scholarship division processes CSC nominations through its annual notice (typically October-November [verify on MoE.gov.bd]) and forwards candidates to the Chinese embassy in Dhaka. Route 2 — the university route (Type B): apply directly to your target Chinese university; deadlines fall roughly January-April 2027 and vary by university [verify each target]. Bachelor\'s applicants must submit a CSCA score — sit the November 2026 (register 15-21 October, Beijing time), December 2026, or January 2027 sitting. Bangladesh-specific risk: name mismatch between your Bangla passport (which may carry Bangla script + English transliteration) and every other document — pick one English spelling and use it identically everywhere.',
    keyTakeaways: [
      'Two application routes: MoE Bangladesh + UGC embassy route (annual notice ~October-November) and university Type B (January-April 2027, varies by university)',
      'Embassy notice timing is earlier than the global CSC window — watch the MoE Bangladesh + UGC announcements closely, not just the Chinese side',
      'Bachelor\'s applicants: CSCA score required for CSC — next sittings Nov 14-15 2026 (register Oct 15-21), Dec 19-20 2026, Jan 23-24 2027',
      'Bangladesh applicants are well-represented in medicine + engineering + Chinese-taught programs — many applicants start HSK 3.0 prep (the new standard live July 2026, full switch Dec 13 2026) early',
      'Documents follow the standard CSC list: passport, transcripts, study plan, recommendation letters, physical exam, police clearance — but use one English spelling for your name on every document',
      'Apply through both routes if eligible — many Bangladeshi applicants file both, and the two streams do not block each other',
    ],
    sections: [
      {
        id: 'two-routes',
        h2: 'The two routes: MoE Bangladesh + UGC vs university (Type B)',
        intro:
          'Bangladesh runs CSC applications through the MoE Bangladesh + UGC embassy channel on the bilateral side, while Chinese universities also nominate Bangladeshi students directly. The routes differ in deadline, paperwork, and competition level.',
        blocks: [
          {
            type: 'table',
            caption: 'MoE Bangladesh + UGC route vs university (Type B) route for Bangladeshi applicants',
            columns: ['Dimension', 'MoE/UGC embassy route (Bilateral)', 'University route (Type B)'],
            rows: [
              ['Where you apply', 'MoE Bangladesh scholarship division + UGC portal [verify current cycle]', 'Target university\'s international-student portal'],
              ['Typical notice window', 'October-November (earlier than the global CSC window) [verify on MoE.gov.bd]', 'Roughly January-April 2027, varies by university [verify]'],
              ['Who nominates you', 'MoE Bangladesh + UGC → Chinese embassy in Dhaka → CSC', 'The university → CSC'],
              ['Airfare', 'Included for most bilateral awards', 'Often not included'],
              ['Best for', 'Applicants whose universities are pre-agreed with MoE Bangladesh / who meet the embassy eligibility screens', 'Applicants targeting specific universities (especially medicine + engineering programs that recruit from Bangladesh)'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**The routes are not mutually exclusive** — many Bangladeshi applicants file both; if both succeed you pick one',
              '**MoE Bangladesh has its own eligibility gate** (academic merit + institutional quota) before forwarding to the Chinese embassy — check the current MoE notice for the exact criteria [verify on MoE.gov.bd]',
              '**Type B needs the university on side early** — the pre-admission letter (expected for 2026/27 [verify]) means your university application must be underway before the CSC deadline',
            ],
          },
        ],
      },
      {
        id: 'timeline',
        h2: 'Timeline for the September 2027 intake',
        intro:
          'Bangladesh\'s embassy route typically opens earlier than the global CSC window — work backwards from October-November 2026.',
        blocks: [
          {
            type: 'table',
            caption: 'Bangladesh CSC timeline — September 2027 intake',
            columns: ['When', 'Action'],
            rows: [
              ['Now-Oct 2026', 'Shortlist 3-5 universities; prepare documents; verify HSC + bachelor transcripts with the relevant Bangladeshi authority if needed'],
              ['Oct 15-21, 2026', 'CSCA registration window for the Nov 14-15 sitting (Beijing time) — bachelor\'s applicants'],
              ['Oct-Nov 2026', 'MoE Bangladesh + UGC embassy notice expected to open [verify on MoE.gov.bd] — start the embassy route early'],
              ['Nov 2026', 'Sit the CSCA; start university applications (pre-admission track)'],
              ['Nov-Dec 2026', 'MoE Bangladesh + UGC nomination deadline (typical) [verify] — submit before it closes'],
              ['Dec 2026', 'CSCA sitting Dec 19-20 (backup) — score must exist before CSC deadlines'],
              ['Jan-Apr 2027', 'Type B deadlines (varies by university) — submit each application'],
              ['May-Jun 2027', 'Results; accept, receive JW201 + admission notice'],
              ['Jul-Aug 2027', 'X1 visa at the Chinese visa centre in Dhaka; fly for September orientation'],
            ],
          },
        ],
      },
      {
        id: 'csca-bachelors',
        h2: 'The CSCA requirement for bachelor\'s applicants',
        intro:
          'CSC scholarship undergraduate applications require a CSCA score — for Bangladesh the embassy route\'s earlier deadline makes the November sitting the safe choice.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**What it is** — the CSCA (China Scholastic Competency Assessment), organized by the China Scholarship Council: Math required for everyone; Physics and/or Chemistry depend on the university',
              '**When to sit** — next confirmed: Nov 14-15 2026 (register Oct 15-21, Beijing time), Dec 19-20 2026, Jan 23-24 2027. If the MoE Bangladesh deadline is October-November, the November sitting is the only safe choice — register immediately when the window opens',
              '**Mode** — mainly online at home with a live proctor; fee RMB 450 for one subject / RMB 700 for two or more (official site csca.cn)',
              '**Free practice** — CSCA Prep (https://cscaprep.academy) offers free mocks and study plans for every sitting',
              '**Master\'s and PhD applicants** — the CSCA mandate covers undergraduate admissions; postgraduate requirements follow each program\'s own rules',
              '**Bangladesh advantage** — Bangladeshi students have one of the strongest STEM foundations globally, and the CSCA Math + Physics sections align closely with the HSC + A-level curriculum',
            ],
          },
        ],
      },
      {
        id: 'documents-mistakes',
        h2: 'Documents and the mistakes that sink Bangladeshi applications',
        intro:
          'The CSC document list is standard; the failures for Bangladeshi applicants are usually name-mismatch and embassy-step gaps.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Passport** — valid well beyond the program start; the name must match every other document character-for-character. Choose one English transliteration and use it everywhere',
              '**Bangla-script passport note** — if your passport is in Bangla script + English transliteration, use the English version on all English-language documents; mixing the two is the #1 Bangladeshi application failure',
              '**Transcripts + degrees** — notarized English translations; HSC (Higher Secondary) + bachelor transcripts for the standard track',
              '**Study plan** — 800-1,500 words, specific to each target university; generic plans are the most common weakness',
              '**Recommendation letters** — two (professors or supervisors); PhD applicants strengthen files with a supervisor pre-match',
              '**Physical examination form** — the official CSC form completed by a licensed physician',
              '**Police clearance certificate** — from Bangladeshi authorities, within validity',
              '**Common mistakes** — name mismatches between Bangla + English script; missing the MoE Bangladesh notice; sitting the CSCA too late for the embassy deadline; skipping the pre-admission letter on the Type B route',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The MoE Bangladesh + UGC embassy route\'s earlier deadline (typically October-November) means every upstream step (transcript notarization, CSCA sitting, study plan) needs to start months sooner than friends applying to other countries tell you. Build the calendar backwards from November 2026, not from spring 2027.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How do Bangladeshi students apply for the CSC scholarship?',
        a: 'Through one of two routes: (1) the MoE Bangladesh + UGC route — the Bangladesh MoE scholarship division processes CSC nominations through its annual notice (typically October-November [verify on MoE.gov.bd]) and forwards to the Chinese embassy in Dhaka; or (2) the university route (Type B) — apply directly to your target Chinese university, which nominates you to CSC. The routes are not mutually exclusive.',
      },
      {
        q: 'What is the CSC deadline for Bangladesh?',
        a: 'The MoE Bangladesh + UGC embassy route is reported to close earlier than the global CSC window, typically around October-November [verify on MoE.gov.bd for the current cycle]. University (Type B) deadlines fall roughly January-April 2027 and vary by university — check each target\'s international-student page.',
      },
      {
        q: 'Do Bangladeshi bachelor\'s applicants need the CSCA?',
        a: 'Yes — a CSCA score is required for CSC scholarship undergraduate applications. Math is required for everyone; Physics and/or Chemistry depend on the university. For September 2027, sit the November 2026 (register Oct 15-21, Beijing time), December 2026, or January 2027 sitting — earlier if you are on the embassy route. Free practice: cscaprep.academy',
      },
      {
        q: 'Is IELTS required for the CSC scholarship from Bangladesh?',
        a: 'It depends on the program, not the scholarship. English-taught programs typically require IELTS/TOEFL or equivalent evidence; Chinese-taught programs require HSK. The CSC itself asks for language proof matching your program\'s medium of instruction.',
      },
      {
        q: 'Can I apply for CSC through MoE Bangladesh and a university at the same time?',
        a: 'Yes — the two routes run in parallel, and many applicants file both to maximize chances. If both succeed, you accept one and decline the other. Never hide a dual application: declare it if asked, since both nominations land in the same CSC system.',
      },
      {
        q: 'What does the CSC scholarship cover for Bangladeshi students?',
        a: 'The same package as for any nationality: full tuition waiver, on-campus dorm, a monthly stipend tiered by degree level [verify amounts against the current CSC notice], comprehensive health insurance, and — for most bilateral awards — round-trip airfare. The university (Type B) route often excludes airfare.',
      },
    ],
    howToSteps: [
      {
        name: 'Pick your route(s) and read the current notices',
        text: 'Open MoE.gov.bd and UGC.gov.bd for the current CSC batch announcement (deadline, eligibility, required attestations [verify]) and your target universities\' pages for their Type B deadlines. Write both dates down.',
      },
      {
        name: 'Book the CSCA sitting (bachelor\'s applicants)',
        text: 'Register at csca.cn in the October 15-21 window for the November 14-15 sitting — the December and January sittings are backups but may collide with the MoE deadline. Free mocks: cscaprep.academy',
      },
      {
        name: 'Start university applications in parallel',
        text: 'A pre-admission letter is expected for 2026/27 CSC applications [verify]. Apply to 3-5 universities as soon as their portals open so the letter exists before the CSC deadline.',
      },
      {
        name: 'Prepare and verify the document package',
        text: 'Passport (with one English spelling for your name), notarized transcripts + degrees, study plan tailored per university, two recommendation letters, physical exam form, police clearance. Every document must carry the same English name spelling.',
      },
      {
        name: 'Submit MoE Bangladesh (if applying) before its deadline',
        text: 'File the MoE Bangladesh + UGC application with every attachment complete — incomplete embassy files are rejected, not deferred. Do this before the typical October-November close [verify].',
      },
      {
        name: 'Submit Type B applications by each university\'s deadline',
        text: 'January-April 2027 depending on the university. Attach the pre-admission letter (or proof it is under review) and your CSCA score where required.',
      },
      {
        name: 'Handle results, visa, and departure',
        text: 'On success: accept, receive the admission notice + JW201, apply for the X1 visa at the Chinese visa centre in Dhaka, and convert the X1 to a residence permit within 30 days of arrival in China.',
      },
    ],
    ctaTitle: 'Planning the CSC route from Bangladesh?',
    ctaSubtitle:
      'SICA counselors map your MoE Bangladesh + UGC vs Type B strategy, check your CSCA sitting against your deadlines, and review the document package before submission. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC Scholarship 2027: complete guide',
        description: 'What CSC covers, the four application channels, and the general timeline.',
      },
      {
        href: 'https://cscaprep.academy/exam-dates',
        label: 'CSCA exam dates 2026-27',
        description: 'Next sittings, registration windows, and which sitting fits your deadline.',
      },
      {
        href: '/scholarships-for/bangladesh',
        label: 'Scholarships for Bangladeshi students',
        description: 'Every scholarship in the SICA catalog open to Bangladeshi applicants.',
      },
    ],
  },
  zh: {
    slug: 'csc-scholarship-bangladesh',
    eyebrow: '指南 · 孟加拉国',
    title: '2027 孟加拉国学生 CSC 奖学金申请指南',
    description:
      '2027 年孟加拉国学生的中国政府奖学金（CSC）：MoE 孟加拉国 + UGC 使馆渠道与大学渠道对比、截止时间、CSCA 要求、材料清单与姓名不一致的常见失误。',
    seoTitle: '2027 孟加拉国学生 CSC 奖学金申请指南',
    seoDescription: '2027 年孟加拉国学生的中国政府奖学金（CSC）：MoE 孟加拉国 + UGC 使馆渠道与大学渠道对比、截止时间、CSCA',
    subtitle:
      '孟加拉国申请者可通过两条渠道申请中国政府奖学金（CSC）：MoE 孟加拉国 + UGC 使馆渠道（通知通常 10-11 月 [待核实]），大学（Type B）渠道截止约在 2027 年 1-4 月且因校而异。本科申请者需提交 CSCA 成绩——下一批场次为 2026 年 11 月、12 月与 2027 年 1 月。孟加拉国学生在中国国际生中占比可观，尤其集中在医学与工程领域。',
    stats: [
      { value: '2 条渠道', label: 'MoE/UGC vs 大学（Type B）' },
      { value: '10-11 月', label: '使馆通知窗口（通常）[待核实]' },
      { value: '2027 年 1-4 月', label: 'Type B 截止（因校而异）' },
      { value: 'CSCA', label: '本科申请者必考' },
    ],
    quickAnswer:
      '孟加拉国学生通过两条渠道申请中国政府奖学金（CSC）。渠道一——MoE 孟加拉国 + UGC 使馆渠道：孟加拉国教育部奖学金处通过年度通知（通常 10-11 月 [以 MoE.gov.bd 为准]）处理 CSC 提名，并转交中国驻达卡大使馆。渠道二——大学渠道（Type B）：直接向目标中国大学申请，截止约在 2027 年 1-4 月且因校而异 [逐校核实]。本科申请者必须提交 CSCA 成绩——应参加 2026 年 11 月（报名 10 月 15-21 日北京时间）、12 月或 2027 年 1 月场次。孟加拉国申请的特有风险：孟加拉语护照（可能同时含孟加拉文 + 英文转写）与其他文件之间的姓名不一致——选定一种英文拼写并处处保持一致。',
    keyTakeaways: [
      '两条申请渠道：MoE 孟加拉国 + UGC 使馆渠道（年度通知约 10-11 月）与大学 Type B（2027 年 1-4 月，因校而异）',
      '使馆通知时间比全球 CSC 窗口更早——关注 MoE 孟加拉国 + UGC 公告，不能只盯中方',
      '本科申请者：CSC 奖学金须提交 CSCA 成绩——下一批场次 2026 年 11 月 14-15 日（报名 10 月 15-21 日）、12 月 19-20 日、2027 年 1 月 23-24 日',
      '孟加拉国学生在医学、工程与中文授课项目中表现突出——许多申请者较早开始 HSK 3.0 备考（新标准 2026 年 7 月生效，2026 年 12 月 13 日全面切换）',
      '材料按 CSC 标准清单：护照、成绩单、学习计划、推荐信、体检表、无犯罪证明——但每份文件上的英文姓名拼写必须完全一致',
      '符合条件可双渠道并行申请——两条流互不阻断',
    ],
    sections: [
      {
        id: 'two-routes',
        h2: '两条渠道：MoE 孟加拉国 + UGC vs 大学（Type B）',
        intro:
          '孟加拉国经 MoE 孟加拉国 + UGC 走双边渠道，中国大学也可直接提名孟加拉国学生。两条渠道在截止、竞争与材料上各有不同。',
        blocks: [
          {
            type: 'table',
            caption: '孟加拉国申请者：MoE 孟加拉国 + UGC 渠道 vs 大学（Type B）渠道',
            columns: ['维度', 'MoE/UGC 使馆渠道（双边）', '大学渠道（Type B）'],
            rows: [
              ['申请入口', 'MoE 孟加拉国奖学金处 + UGC 门户 [当期核实]', '目标大学国际生申请门户'],
              ['通常通知窗口', '10-11 月（比全球 CSC 窗口更早）[以 MoE.gov.bd 为准]', '约 2027 年 1-4 月，因校而异 [待核实]'],
              ['提名方', 'MoE 孟加拉国 + UGC → 中国驻达卡大使馆 → CSC', '大学 → CSC'],
              ['机票', '多数双边资助含往返机票', '通常不含'],
              ['适合人群', '就读于 MoE 孟加拉国 / UGC 认可院校的申请者', '目标明确锁定特定大学（尤其从孟加拉国招生的医学 + 工程专业）的申请者'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**两条渠道不互斥**——许多申请者双线提交；若都成功则择一',
              '**MoE 孟加拉国有自己的资格门槛**（学术成绩 + 院校配额）——以当期通知为准 [待核实]',
              '**Type B 需要大学提前配合**——预录取函（2026/27 起预计需要 [待核实]）意味着大学申请必须在 CSC 截止前推进到位',
            ],
          },
        ],
      },
      {
        id: 'timeline',
        h2: '2027 年 9 月入学时间线',
        intro:
          '孟加拉国使馆渠道通常比全球 CSC 窗口更早开放——从 2026 年 10-11 月倒推。',
        blocks: [
          {
            type: 'table',
            caption: '孟加拉国 CSC 时间线——2027 年 9 月入学',
            columns: ['时间', '动作'],
            rows: [
              ['现在-2026 年 10 月', '筛选 3-5 所大学；准备材料；按需办理 HSC + 学士成绩单公证'],
              ['2026 年 10 月 15-21 日', '11 月 14-15 日 CSCA 场次的报名窗口（北京时间）——本科申请者'],
              ['2026 年 10-11 月', 'MoE 孟加拉国 + UGC 使馆通知预计开放 [以 MoE.gov.bd 为准]——使馆渠道尽早启动'],
              ['2026 年 11 月', '参加 CSCA；启动大学申请（预录取轨道）'],
              ['2026 年 11-12 月', 'MoE 孟加拉国 + UGC 提名截止（通常）[待核实]——截止前提交'],
              ['2026 年 12 月', 'CSCA 12 月 19-20 日场次（备份）——成绩须赶在 CSC 截止前'],
              ['2027 年 1-4 月', 'Type B 截止（因校而异）——逐校提交'],
              ['2027 年 5-6 月', '出结果；接受录取，领取 JW201 与录取通知'],
              ['2027 年 7-8 月', '在达卡中国签证中心办 X1 签证；9 月赴华报到'],
            ],
          },
        ],
      },
      {
        id: 'csca-bachelors',
        h2: '本科申请者的 CSCA 要求',
        intro:
          'CSC 奖学金本科申请必须提交 CSCA 成绩——对孟加拉国而言使馆渠道的早截止让 11 月场次成为稳妥选择。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**是什么**——CSCA（中国学业水平评估），国家留学基金委组织：数学全员必考；物理和/或化学取决于大学',
              '**何时考**——已确认：2026 年 11 月 14-15 日（报名 10 月 15-21 日北京时间）、12 月 19-20 日、2027 年 1 月 23-24 日。若 MoE 孟加拉国截止在 10-11 月，11 月场次是唯一稳妥选择——窗口开放即报名',
              '**模式**——以居家线上、真人监考为主；费用单科 450 元、两科及以上 700 元（官网 csca.cn）',
              '**免费练习**——CSCA Prep（https://cscaprep.academy）提供每场次的免费模拟与学习计划',
              '**硕博申请者**——CSCA 强制令覆盖本科招生；研究生要求按各项目规则执行',
              '**孟加拉国学生优势**——孟加拉国学生拥有全球最扎实的 STEM 基础之一，CSCA 数学 + 物理部分与 HSC + A-level 课程高度契合',
            ],
          },
        ],
      },
      {
        id: 'documents-mistakes',
        h2: '材料清单与孟加拉国申请的常见失误',
        intro:
          'CSC 材料清单是标准的；孟加拉国申请的失败多因姓名不一致与使馆步骤缺失。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**护照**——有效期远超项目开始；姓名与其他文件逐字一致。选定一种英文转写并处处使用',
              '**孟加拉文护照说明**——若护照同时含孟加拉文 + 英文转写，所有英文材料上请用英文版本；混合两种写法是孟加拉国申请头号失误',
              '**成绩单 + 学位证**——公证英文翻译；HSC（高中）+ 学士成绩单按标准流程提交',
              '**学习计划**——800-1,500 字，针对每所目标大学具体撰写；通用模板是最常见的弱点',
              '**推荐信**——两封（教授或主管）；博士申请者配合导师预匹配更有竞争力',
              '**体检表**——官方 CSC 表格，由执业医师填写',
              '**无犯罪证明**——孟加拉国官方出具，注意有效期',
              '**常见失误**——孟加拉文 + 英文姓名不一致；错过 MoE 孟加拉国通知；CSCA 考得太晚赶不上使馆截止；Type B 渠道漏掉预录取函',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'MoE 孟加拉国 + UGC 使馆渠道更早的截止（通常 10-11 月）意味着每个前置步骤（成绩单公证、CSCA 考试、学习计划）都要比申请其他国家的朋友更早启动。从 2026 年 11 月倒排日历，而不是 2027 年春天。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '孟加拉国学生怎么申请 CSC 奖学金？',
        a: '两条渠道：(1) MoE 孟加拉国 + UGC 渠道——孟加拉国教育部奖学金处通过年度通知（通常 10-11 月 [以 MoE.gov.bd 为准]）处理 CSC 提名，并转交中国驻达卡大使馆；(2) 大学渠道（Type B）——直接向目标中国大学申请，由大学向 CSC 提名。两条渠道不互斥。',
      },
      {
        q: '孟加拉国的 CSC 截止时间？',
        a: 'MoE 孟加拉国 + UGC 使馆渠道据报比全球 CSC 窗口更早关闭，通常在 10-11 月 [当期以 MoE.gov.bd 为准]。大学（Type B）截止约在 2027 年 1-4 月且因校而异——查每所目标大学的国际生页面。',
      },
      {
        q: '孟加拉国本科申请者需要 CSCA 吗？',
        a: '需要——CSC 奖学金本科申请必须提交 CSCA 成绩。数学全员必考；物理和/或化学因校而异。2027 年 9 月入学应参加 2026 年 11 月（报名 10 月 15-21 日北京时间）、12 月或 2027 年 1 月场次——走使馆渠道者更应尽早。免费练习：cscaprep.academy',
      },
      {
        q: '孟加拉国申请 CSC 需要 IELTS 吗？',
        a: '取决于项目而非奖学金本身。英文授课项目通常要求 IELTS/托福或同等证明；中文授课项目要求 HSK。CSC 要求语言证明与项目授课语言匹配。',
      },
      {
        q: '可以同时走 MoE 孟加拉国和大学两条渠道吗？',
        a: '可以——两条渠道并行，许多申请者双线提交以提高机会。若都成功，接受其一、婉拒另一。不要隐瞒双申请：被问及时如实申报，因为两份提名进入同一个 CSC 系统。',
      },
      {
        q: 'CSC 奖学金为孟加拉国学生覆盖什么？',
        a: '与任何国籍相同的资助包：全额学费减免、校内住宿、按学位分档的月度津贴 [数额以当期 CSC 通知核实]、综合医疗保险，多数双边资助还含往返机票。大学（Type B）渠道通常不含机票。',
      },
    ],
    howToSteps: [
      {
        name: '选定渠道并研读当期公告',
        text: '打开 MoE.gov.bd 与 UGC.gov.bd 查看当期 CSC 批次公告（截止、资格、认证要求 [待核实]），同时查目标大学的 Type B 截止。把两个日期都写下来。',
      },
      {
        name: '报名 CSCA 场次（本科申请者）',
        text: '在 10 月 15-21 日窗口到 csca.cn 报名 11 月 14-15 日场次——12 月与 1 月场次是备份，但可能与 MoE 截止冲突。免费模拟：cscaprep.academy',
      },
      {
        name: '并行启动大学申请',
        text: '2026/27 起 CSC 申请预计需附预录取函 [待核实]。大学门户一开放就申请 3-5 所，确保函件赶在 CSC 截止前到位。',
      },
      {
        name: '准备并认证材料包',
        text: '护照（英文姓名拼写固定一种）、公证成绩单 + 学位证、按校定制的学习计划、两封推荐信、体检表、无犯罪证明。每份文件上的英文姓名拼写完全一致。',
      },
      {
        name: 'MoE 孟加拉国截止前提交（如走该渠道）',
        text: '在 MoE 孟加拉国 + UGC 提交完整附件的申请——不完整的使馆材料会被直接拒绝而非顺延。在通常的 10-11 月截止前完成 [待核实]。',
      },
      {
        name: '按各校截止提交 Type B 申请',
        text: '2027 年 1-4 月，因校而异。附预录取函（或审核中证明）与要求的 CSCA 成绩。',
      },
      {
        name: '处理结果、签证与出发',
        text: '获资助后：接受录取、领取录取通知 + JW201、在达卡的中国签证中心办 X1 签证，抵华后 30 天内换发居留许可。',
      },
    ],
    ctaTitle: '正在规划孟加拉国的 CSC 申请？',
    ctaSubtitle:
      'SICA 顾问帮你制定 MoE 孟加拉国 + UGC vs Type B 策略、把 CSCA 场次对准截止、并在提交前审查材料包。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC 奖学金 2027 完全指南',
        description: 'CSC 覆盖内容、四大申请渠道与通用时间线。',
      },
      {
        href: 'https://cscaprep.academy/exam-dates',
        label: 'CSCA 考试时间 2026-27',
        description: '下一批场次、报名窗口与适合你截止的选择。',
      },
      {
        href: '/scholarships-for/bangladesh',
        label: '孟加拉国学生奖学金',
        description: 'SICA 目录中面向孟加拉国申请者的全部奖学金。',
      },
    ],
  },
};

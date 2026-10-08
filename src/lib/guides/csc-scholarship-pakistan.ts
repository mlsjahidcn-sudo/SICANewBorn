import type { LocalizedGuide } from './types';

/**
 * "CSC scholarship for Pakistani students 2027" — country-specific
 * scholarship guide (Phase 147, SEO Task 5 #1). Target queries:
 * "csc scholarship pakistan", "hec china scholarship 2027",
 * "chinese government scholarship pakistani students".
 *
 * Facts grounded in the verified table (2026-10-08): HEC route
 * agency no. 5861 [verify], reported earlier Dec/Jan deadline
 * [verify], Type B Jan-Apr 2027 varies by university [verify],
 * CSCA required for bachelor's + next sittings Nov/Dec 2026 and
 * Jan 2027, pre-admission letter expected [verify].
 */
export const cscPakistanGuide: LocalizedGuide = {
  en: {
    slug: 'csc-scholarship-pakistan',
    eyebrow: 'GUIDE · PAKISTAN',
    title: 'CSC Scholarship for Pakistani Students 2027',
    description:
      'CSC (Chinese Government Scholarship) for Pakistani students 2027: the HEC route vs the university route, deadlines, CSCA requirement, documents, and common mistakes.',
    subtitle:
      'Pakistani applicants reach the Chinese Government Scholarship (CSC) through two routes: the HEC route (agency no. 5861) with a reported earlier December-January deadline [verify], and the university (Type B) route with January-April 2027 deadlines that vary by university. Bachelor\'s applicants need a CSCA score — the next sittings are November 2026, December 2026, and January 2027.',
    stats: [
      { value: '2 routes', label: 'HEC vs university (Type B)' },
      { value: 'Dec-Jan', label: 'HEC deadline (reported) [verify]' },
      { value: 'Jan-Apr 2027', label: 'Type B deadlines (varies)' },
      { value: 'CSCA', label: 'Required for bachelor\'s' },
    ],
    quickAnswer:
      'Pakistani students apply for the Chinese Government Scholarship (CSC) through two routes. Route 1 — the HEC route (Pakistan\'s Higher Education Commission, CSC agency no. 5861 [verify]): deadlines are reported to fall earlier, around December-January [verify on HEC.gov.pk]. Route 2 — the university route (Type B): apply directly to your target Chinese university; deadlines fall roughly January-April 2027 and vary by university [verify each target]. Bachelor\'s applicants must submit a CSCA score for CSC — sit the November 2026 (register 15-21 October, Beijing time), December 2026, or January 2027 sitting. A pre-admission letter from the host university is expected for 2026/27 applications onward [verify].',
    keyTakeaways: [
      'Two application routes: HEC (agency no. 5861, earlier deadline) and university Type B (Jan-Apr 2027, varies)',
      'HEC route deadline reported as December-January [verify on HEC.gov.pk] — the entire timeline moves earlier than most countries',
      'Bachelor\'s applicants: CSCA score required for CSC — next sittings Nov 14-15 2026 (register Oct 15-21), Dec 19-20 2026, Jan 23-24 2027',
      'A pre-admission letter from the host university is expected for 2026/27 onward [verify] — apply to universities in parallel',
      'Documents follow the standard CSC list: passport, transcripts, study plan, recommendation letters, physical exam, police clearance',
      'Apply through both routes if eligible — they are not mutually exclusive, and you pick one if both come through',
    ],
    sections: [
      {
        id: 'two-routes',
        h2: 'The two routes: HEC vs university (Type B)',
        intro:
          'Pakistan runs CSC applications through HEC on the bilateral channel, while Chinese universities also nominate Pakistani students directly. The routes differ in deadline, competition, and paperwork.',
        blocks: [
          {
            type: 'table',
            caption: 'HEC route vs university (Type B) route for Pakistani applicants',
            columns: ['Dimension', 'HEC route (Bilateral)', 'University route (Type B)'],
            rows: [
              ['Where you apply', 'HEC portal (agency no. 5861 [verify])', 'Target university\'s international-student portal'],
              ['Deadline', 'Reported December-January [verify on HEC.gov.pk]', 'Roughly January-April 2027, varies by university [verify]'],
              ['Who nominates you', 'HEC → Chinese embassy → CSC', 'The university → CSC'],
              ['Airfare', 'Included for most bilateral awards', 'Often not included'],
              ['Best for', 'Applicants who meet HEC\'s eligibility screens', 'Applicants targeting specific universities'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**The routes are not mutually exclusive** — many applicants file both; if both succeed you pick one',
              '**HEC gates its own eligibility** (degree verification, HEC-recognized institutions) before forwarding — check the HEC announcement for the current cycle\'s rules [verify]',
              '**Type B needs the university on side early** — the pre-admission letter (expected for 2026/27 [verify]) means your university application must be underway before the CSC deadline',
            ],
          },
        ],
      },
      {
        id: 'timeline',
        h2: 'Timeline for the September 2027 intake',
        intro:
          'Pakistan\'s earliest deadlines make the calendar the hardest part. Work backwards from December 2026.',
        blocks: [
          {
            type: 'table',
            caption: 'Pakistan CSC timeline — September 2027 intake',
            columns: ['When', 'Action'],
            rows: [
              ['Now-Oct 2026', 'Shortlist 3-5 universities; prepare documents; verify degrees with HEC where needed'],
              ['Oct 15-21, 2026', 'CSCA registration window for the Nov 14-15 sitting (Beijing time) — bachelor\'s applicants'],
              ['Nov 2026', 'Sit the CSCA; start university applications (pre-admission track)'],
              ['Dec 2026-Jan 2027', 'HEC route deadline (reported [verify]) — submit before it closes'],
              ['Dec 2026', 'CSCA sitting Dec 19-20 (backup) — score must exist before CSC deadlines'],
              ['Jan-Apr 2027', 'Type B deadlines (varies by university) — submit each application'],
              ['May-Jun 2027', 'Results; accept, receive JW201 + admission notice'],
              ['Jul-Aug 2027', 'X1 visa at the Chinese visa centre; fly for September orientation'],
            ],
          },
        ],
      },
      {
        id: 'csca-bachelors',
        h2: 'The CSCA requirement for bachelor\'s applicants',
        intro:
          'CSC scholarship undergraduate applications require a CSCA score — for Pakistan this interacts with the early HEC deadline.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**What it is** — the CSCA (China Scholastic Competency Assessment), organized by the China Scholarship Council: Math required for everyone; Physics and/or Chemistry depend on the university',
              '**When to sit** — next confirmed: Nov 14-15 2026 (register Oct 15-21, Beijing time), Dec 19-20 2026, Jan 23-24 2027. If the HEC deadline is December-January, the November sitting is the safe choice',
              '**Mode** — mainly online at home with a live proctor; fee RMB 450 for one subject / RMB 700 for two or more (official site csca.cn)',
              '**Free practice** — CSCA Prep (https://cscaprep.academy) offers free mocks and study plans for every sitting',
              '**Master\'s and PhD applicants** — the CSCA mandate covers undergraduate admissions; postgraduate requirements follow each program\'s own rules',
            ],
          },
        ],
      },
      {
        id: 'documents-mistakes',
        h2: 'Documents and the mistakes that sink Pakistani applications',
        intro:
          'The CSC document list is standard; the failures are usually verification mismatches and missed HEC steps.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Passport** — valid well beyond the program start; the name must match every other document character-for-character',
              '**Transcripts + degrees** — notarized English translations; HEC attestation where the route requires it (check the current HEC notice [verify])',
              '**Study plan** — 800-1,500 words, specific to each target university; generic plans are the most common weakness',
              '**Recommendation letters** — two (professors or supervisors); PhD applicants strengthen files with a supervisor pre-match',
              '**Physical examination form** — the official CSC form completed by a licensed physician',
              '**Police clearance certificate** — from Pakistani authorities, within validity',
              '**Common mistakes** — waiting for HEC\'s deadline week to start documents; name mismatches between passport and HEC records; sitting the CSCA too late for the CSC deadline; skipping the pre-admission letter on the Type B route',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The HEC route\'s earlier deadline means every upstream step (degree verification, CSCA sitting, study plan) needs to start months sooner than friends applying to other countries tell you. Build the calendar backwards from December 2026, not from spring 2027.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How do Pakistani students apply for the CSC scholarship?',
        a: 'Through one of two routes: (1) the HEC route — apply on the HEC portal when the CSC batch opens (agency no. 5861 [verify]); HEC forwards nominations to the Chinese side; or (2) the university route (Type B) — apply directly to your target Chinese university, which nominates you to CSC. The routes are not mutually exclusive.',
      },
      {
        q: 'What is the CSC deadline for Pakistan?',
        a: 'The HEC route is reported to close earlier than the global CSC window, around December-January [verify on HEC.gov.pk for the current cycle]. University (Type B) deadlines fall roughly January-April 2027 and vary by university — check each target\'s international-student page.',
      },
      {
        q: 'Do Pakistani bachelor\'s applicants need the CSCA?',
        a: 'Yes — a CSCA score is required for CSC scholarship undergraduate applications. Math is required for everyone; Physics and/or Chemistry depend on the university. For September 2027, sit the November 2026 (register Oct 15-21, Beijing time), December 2026, or January 2027 sitting — earlier if you are on the HEC route. Free practice: cscaprep.academy',
      },
      {
        q: 'Is IELTS required for the CSC scholarship from Pakistan?',
        a: 'It depends on the program, not the scholarship. English-taught programs typically require IELTS/TOEFL or equivalent evidence; Chinese-taught programs require HSK. The CSC itself asks for language proof matching your program\'s medium of instruction.',
      },
      {
        q: 'Can I apply for CSC through HEC and a university at the same time?',
        a: 'Yes — the two routes run in parallel, and many applicants file both to maximize chances. If both succeed, you accept one and decline the other. Never hide a dual application: declare it if asked, since both nominations land in the same CSC system.',
      },
      {
        q: 'What does the CSC scholarship cover for Pakistani students?',
        a: 'The same package as for any nationality: full tuition waiver, on-campus dorm, a monthly stipend tiered by degree level [verify amounts against the current CSC notice], comprehensive health insurance, and — for most bilateral awards — round-trip airfare. The university (Type B) route often excludes airfare.',
      },
    ],
    howToSteps: [
      {
        name: 'Pick your route(s) and read the current notices',
        text: 'Open HEC.gov.pk for the current CSC batch announcement (deadline, eligibility, required attestations [verify]) and your target universities\' pages for their Type B deadlines. Write both dates down.',
      },
      {
        name: 'Book the CSCA sitting (bachelor\'s applicants)',
        text: 'Register at csca.cn in the October 15-21 window for the November 14-15 sitting — the December and January sittings are backups but collide with the HEC deadline. Free mocks: cscaprep.academy',
      },
      {
        name: 'Start university applications in parallel',
        text: 'A pre-admission letter is expected for 2026/27 CSC applications [verify]. Apply to 3-5 universities as soon as their portals open so the letter exists before the CSC deadline.',
      },
      {
        name: 'Prepare and verify the document package',
        text: 'Passport, notarized transcripts + degrees (HEC attestation where required), study plan tailored per university, two recommendation letters, physical exam form, police clearance. Name must match everywhere character-for-character.',
      },
      {
        name: 'Submit HEC (if applying) before its deadline',
        text: 'File the HEC portal application with every attachment complete — incomplete HEC files are rejected, not deferred. Do this before the reported December-January close [verify].',
      },
      {
        name: 'Submit Type B applications by each university\'s deadline',
        text: 'January-April 2027 depending on the university. Attach the pre-admission letter (or proof it is under review) and your CSCA score where required.',
      },
      {
        name: 'Handle results, visa, and departure',
        text: 'On success: accept, receive the admission notice + JW201, apply for the X1 visa at the Chinese visa centre in Pakistan, and convert the X1 to a residence permit within 30 days of arrival in China.',
      },
    ],
    ctaTitle: 'Planning the CSC route from Pakistan?',
    ctaSubtitle:
      'SICA counselors map your HEC vs Type B strategy, check your CSCA sitting against your deadlines, and review the document package before submission. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC Scholarship 2027: complete guide',
        description: 'What CSC covers, the four application channels, and the general timeline.',
      },
      {
        href: '/csca-exam-dates',
        label: 'CSCA exam dates 2026-27',
        description: 'Next sittings, registration windows, and which sitting fits your deadline.',
      },
      {
        href: '/scholarships-for/pakistan',
        label: 'Scholarships for Pakistani students',
        description: 'Every scholarship in the SICA catalog open to Pakistani applicants.',
      },
    ],
  },
  zh: {
    slug: 'csc-scholarship-pakistan',
    eyebrow: '指南 · 巴基斯坦',
    title: '2027 巴基斯坦学生 CSC 奖学金申请指南',
    description:
      '2027 年巴基斯坦学生的中国政府奖学金（CSC）：HEC 渠道与大学渠道对比、截止时间、CSCA 要求、材料清单与常见失误。',
    subtitle:
      '巴基斯坦申请者可通过两条渠道申请中国政府奖学金（CSC）：HEC 渠道（机构号 5861），据报截止更早（12-1 月）[待核实]；大学（Type B）渠道，截止约在 2027 年 1-4 月且因校而异。本科申请者需提交 CSCA 成绩——下一批场次为 2026 年 11 月、12 月与 2027 年 1 月。',
    stats: [
      { value: '2 条渠道', label: 'HEC vs 大学（Type B）' },
      { value: '12-1 月', label: 'HEC 截止（据报）[待核实]' },
      { value: '2027 年 1-4 月', label: 'Type B 截止（因校而异）' },
      { value: 'CSCA', label: '本科申请者必考' },
    ],
    quickAnswer:
      '巴基斯坦学生通过两条渠道申请中国政府奖学金（CSC）。渠道一——HEC 渠道（巴基斯坦高等教育委员会，CSC 机构号 5861 [待核实]）：据报截止更早，约在 12-1 月 [以 HEC.gov.pk 为准]。渠道二——大学渠道（Type B）：直接向目标中国大学申请，截止约在 2027 年 1-4 月且因校而异 [逐校核实]。本科申请者必须提交 CSCA 成绩——应参加 2026 年 11 月（报名 10 月 15-21 日北京时间）、12 月或 2027 年 1 月场次。2026/27 起预计需附接收大学的预录取函 [待核实]。',
    keyTakeaways: [
      '两条申请渠道：HEC（机构号 5861，截止更早）与大学 Type B（2027 年 1-4 月，因校而异）',
      'HEC 渠道截止据报为 12-1 月 [在 HEC.gov.pk 核实]——整条时间线比多数国家更早',
      '本科申请者：CSC 奖学金须提交 CSCA 成绩——下一批场次 2026 年 11 月 14-15 日（报名 10 月 15-21 日）、12 月 19-20 日、2027 年 1 月 23-24 日',
      '2026/27 起预计需接收大学预录取函 [待核实]——大学申请并行推进',
      '材料按 CSC 标准清单：护照、成绩单、学习计划、推荐信、体检表、无犯罪证明',
      '符合条件可双渠道并行申请——两者不互斥，若都获批则择一',
    ],
    sections: [
      {
        id: 'two-routes',
        h2: '两条渠道：HEC vs 大学（Type B）',
        intro:
          '巴基斯坦经 HEC 走双边渠道提交 CSC 申请，中国大学也可直接提名巴基斯坦学生。两条渠道在截止、竞争与材料上各有不同。',
        blocks: [
          {
            type: 'table',
            caption: '巴基斯坦申请者：HEC 渠道 vs 大学（Type B）渠道',
            columns: ['维度', 'HEC 渠道（双边）', '大学渠道（Type B）'],
            rows: [
              ['申请入口', 'HEC 门户（机构号 5861 [待核实]）', '目标大学国际生申请门户'],
              ['截止', '据报 12-1 月 [以 HEC.gov.pk 为准]', '约 2027 年 1-4 月，因校而异 [待核实]'],
              ['提名方', 'HEC → 中国使馆 → CSC', '大学 → CSC'],
              ['机票', '多数双边资助含往返机票', '通常不含'],
              ['适合人群', '符合 HEC 筛选条件的申请者', '目标明确锁定特定大学的申请者'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**两条渠道不互斥**——许多申请者双线提交；若都成功则择一',
              '**HEC 有自己的资格门槛**（学位认证、HEC 认可院校）——以当期公告为准 [待核实]',
              '**Type B 需要大学提前配合**——预录取函（2026/27 起预计需要 [待核实]）意味着大学申请必须在 CSC 截止前推进到位',
            ],
          },
        ],
      },
      {
        id: 'timeline',
        h2: '2027 年 9 月入学时间线',
        intro:
          '巴基斯坦最早的截止让日历成为最大难点。从 2026 年 12 月倒推。',
        blocks: [
          {
            type: 'table',
            caption: '巴基斯坦 CSC 时间线——2027 年 9 月入学',
            columns: ['时间', '动作'],
            rows: [
              ['现在-2026 年 10 月', '筛选 3-5 所大学；准备材料；按需完成 HEC 学位认证'],
              ['2026 年 10 月 15-21 日', '11 月 14-15 日 CSCA 场次的报名窗口（北京时间）——本科申请者'],
              ['2026 年 11 月', '参加 CSCA；启动大学申请（预录取轨道）'],
              ['2026 年 12 月-2027 年 1 月', 'HEC 渠道截止（据报 [待核实]）——截止前提交'],
              ['2026 年 12 月', 'CSCA 12 月 19-20 日场次（备份）——成绩须赶在 CSC 截止前'],
              ['2027 年 1-4 月', 'Type B 截止（因校而异）——逐校提交'],
              ['2027 年 5-6 月', '出结果；接受录取，领取 JW201 与录取通知'],
              ['2027 年 7-8 月', '签证中心办 X1 签证；9 月赴华报到'],
            ],
          },
        ],
      },
      {
        id: 'csca-bachelors',
        h2: '本科申请者的 CSCA 要求',
        intro:
          'CSC 奖学金本科申请必须提交 CSCA 成绩——对巴基斯坦而言这与 HEC 的早截止直接相关。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**是什么**——CSCA（中国学业水平评估），国家留学基金委组织：数学全员必考；物理和/或化学取决于大学',
              '**何时考**——已确认：2026 年 11 月 14-15 日（报名 10 月 15-21 日北京时间）、12 月 19-20 日、2027 年 1 月 23-24 日。若 HEC 截止在 12-1 月，11 月场次是稳妥选择',
              '**模式**——以居家线上、真人监考为主；费用单科 450 元、两科及以上 700 元（官网 csca.cn）',
              '**免费练习**——CSCA Prep（https://cscaprep.academy）提供每场次的免费模拟与学习计划',
              '**硕博申请者**——CSCA 强制令覆盖本科招生；研究生要求按各项目规则执行',
            ],
          },
        ],
      },
      {
        id: 'documents-mistakes',
        h2: '材料清单与巴基斯坦申请的常见失误',
        intro:
          'CSC 材料清单是标准的；失败多因认证不一致与错过 HEC 步骤。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**护照**——有效期远超项目开始；姓名与所有其他文件逐字一致',
              '**成绩单 + 学位证**——公证英文翻译；渠道要求时办理 HEC 认证（以当期通知为准 [待核实]）',
              '**学习计划**——800-1,500 字，针对每所目标大学具体撰写；通用模板是最常见的弱点',
              '**推荐信**——两封（教授或主管）；博士申请者配合导师预匹配更有竞争力',
              '**体检表**——官方 CSC 表格，由执业医师填写',
              '**无犯罪证明**——巴基斯坦官方出具，注意有效期',
              '**常见失误**——等到 HEC 截止周才开始备材料；护照与 HEC 记录姓名不一致；CSCA 考得太晚赶不上 CSC 截止；Type B 渠道漏掉预录取函',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'HEC 渠道更早的截止意味着每个前置步骤（学位认证、CSCA 考试、学习计划）都要比申请其他国家的朋友更早启动。从 2026 年 12 月倒排日历，而不是 2027 年春天。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '巴基斯坦学生怎么申请 CSC 奖学金？',
        a: '两条渠道：(1) HEC 渠道——CSC 批次开放时在 HEC 门户申请（机构号 5861 [待核实]），HEC 向中方提名；(2) 大学渠道（Type B）——直接向目标中国大学申请，由大学向 CSC 提名。两条渠道不互斥。',
      },
      {
        q: '巴基斯坦的 CSC 截止时间？',
        a: 'HEC 渠道据报比全球 CSC 窗口更早关闭，约在 12-1 月 [当期以 HEC.gov.pk 为准]。大学（Type B）截止约在 2027 年 1-4 月且因校而异——查每所目标大学的国际生页面。',
      },
      {
        q: '巴基斯坦本科申请者需要 CSCA 吗？',
        a: '需要——CSC 奖学金本科申请必须提交 CSCA 成绩。数学全员必考；物理和/或化学因校而异。2027 年 9 月入学应参加 2026 年 11 月（报名 10 月 15-21 日北京时间）、12 月或 2027 年 1 月场次——走 HEC 渠道者更应尽早。免费练习：cscaprep.academy',
      },
      {
        q: '巴基斯坦申请 CSC 需要 IELTS 吗？',
        a: '取决于项目而非奖学金本身。英文授课项目通常要求 IELTS/托福或同等证明；中文授课项目要求 HSK。CSC 要求语言证明与项目授课语言匹配。',
      },
      {
        q: '可以同时走 HEC 和大学两条渠道吗？',
        a: '可以——两条渠道并行，许多申请者双线提交以提高机会。若都成功，接受其一、婉拒另一。不要隐瞒双申请：被问及时如实申报，因为两份提名进入同一个 CSC 系统。',
      },
      {
        q: 'CSC 奖学金为巴基斯坦学生覆盖什么？',
        a: '与任何国籍相同的资助包：全额学费减免、校内住宿、按学位分档的月度津贴 [数额以当期 CSC 通知核实]、综合医疗保险，多数双边资助还含往返机票。大学（Type B）渠道通常不含机票。',
      },
    ],
    howToSteps: [
      {
        name: '选定渠道并研读当期公告',
        text: '打开 HEC.gov.pk 查看当期 CSC 批次公告（截止、资格、认证要求 [待核实]），同时查目标大学的 Type B 截止。把两个日期都写下来。',
      },
      {
        name: '报名 CSCA 场次（本科申请者）',
        text: '在 10 月 15-21 日窗口到 csca.cn 报名 11 月 14-15 日场次——12 月与 1 月场次是备份，但与 HEC 截止冲突。免费模拟：cscaprep.academy',
      },
      {
        name: '并行启动大学申请',
        text: '2026/27 起 CSC 申请预计需附预录取函 [待核实]。大学门户一开放就申请 3-5 所，确保函件赶在 CSC 截止前到位。',
      },
      {
        name: '准备并认证材料包',
        text: '护照、公证成绩单 + 学位证（按需 HEC 认证）、按校定制的学习计划、两封推荐信、体检表、无犯罪证明。姓名处处逐字一致。',
      },
      {
        name: 'HEC 截止前提交（如走该渠道）',
        text: '在 HEC 门户提交完整附件的申请——不完整的 HEC 材料会被直接拒绝而非顺延。在据报的 12-1 月截止前完成 [待核实]。',
      },
      {
        name: '按各校截止提交 Type B 申请',
        text: '2027 年 1-4 月，因校而异。附预录取函（或审核中证明）与要求的 CSCA 成绩。',
      },
      {
        name: '处理结果、签证与出发',
        text: '获资助后：接受录取、领取录取通知 + JW201、在巴基斯坦的中国签证中心办 X1 签证，抵华后 30 天内换发居留许可。',
      },
    ],
    ctaTitle: '正在规划巴基斯坦的 CSC 申请？',
    ctaSubtitle:
      'SICA 顾问帮你制定 HEC vs Type B 策略、把 CSCA 场次对准截止、并在提交前审查材料包。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC 奖学金 2027 完全指南',
        description: 'CSC 覆盖内容、四大申请渠道与通用时间线。',
      },
      {
        href: '/csca-exam-dates',
        label: 'CSCA 考试时间 2026-27',
        description: '下一批场次、报名窗口与适合你截止的选择。',
      },
      {
        href: '/scholarships-for/pakistan',
        label: '巴基斯坦学生奖学金',
        description: 'SICA 目录中面向巴基斯坦申请者的全部奖学金。',
      },
    ],
  },
};

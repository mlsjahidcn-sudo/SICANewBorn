import type { LocalizedGuide } from './types';

/**
 * "China University Admission Requirements by Degree Level" —
 * listicle guide. Target queries: "china university admission
 * requirements", "china bachelor admission", "china master
 * admission", "china phd admission", "china university gpa
 * requirements".
 *
 * Different angle from /guides/application (which is a 12-step
 * process guide): this page is the requirements cheat-sheet by
 * degree level — GPA, language test, work experience, and
 * recommendation letters compared across bachelor / master / PhD.
 */
export const admissionRequirementsGuide: LocalizedGuide = {
  en: {
    slug: 'china-university-admission-requirements',
    eyebrow: 'GUIDE · ADMISSIONS',
    title: 'China University Admission Requirements by Degree Level (2026)',
    description:
      'Bachelor\'s, master\'s, and PhD admission requirements at Chinese universities — GPA thresholds, language test scores, work experience, and recommendation letters.',
    subtitle:
      'A clear cheat-sheet for what Chinese universities look for at each degree level. Use this to gauge your competitiveness before applying.',
    stats: [
      { value: '3.0+', label: 'Bachelor\'s GPA (most programs)' },
      { value: '3.3+', label: 'Master\'s GPA (top programs)' },
      { value: '5+ yrs', label: 'Master\'s work experience (typical)' },
      { value: '4 docs', label: 'PhD package: proposal, refs, pubs, CV' },
    ],
    quickAnswer:
      'Chinese university admission requirements vary significantly by degree level. Bachelor\'s: high school diploma with strong grades (70%+ average, science background for STEM programs), IELTS 6.0+ or TOEFL 80+ for English-medium programs, no HSK required at intake, no work experience needed. Master\'s: bachelor\'s degree (GPA 3.0+, 75%+), GRE/GMAT optional, IELTS 6.5+ or TOEFL 90+, 2-3 recommendation letters, statement of purpose. PhD: master\'s degree (GPA 3.3+), 1,500-3,000 word research proposal, 3 academic recommendation letters, publications preferred, supervisor matching critical. Engineering and business are most flexible on work experience; MBAs typically want 3-7 years.',
    keyTakeaways: [
      'Bachelor\'s admission is GPA + language-test focused; no work experience required',
      'Master\'s admission is holistic: GPA + language + recommendations + statement of purpose',
      'PhD admission is research-focused: proposal + supervisor match + publications matter most',
      'IELTS 6.0+ (TOEFL 80+) is the standard for English-medium bachelor\'s; 6.5+ (90+) for master\'s',
      'Most Chinese universities accept 3-year bachelor\'s degrees (common in UK, India, Pakistan) — no extra foundation year required',
      'GMAT/GRE are optional for most master\'s programs at Chinese universities; some waive for qualified applicants',
    ],
    sections: [
      {
        id: 'bachelors-requirements',
        h2: 'Bachelor\'s admission requirements',
        intro:
          'Bachelor\'s admission to Chinese universities is the most standardized — high school diploma, GPA, language proficiency, and (for some programs) entrance exam. Here is the full checklist.',
        blocks: [
          {
            type: 'table',
            caption: 'Bachelor\'s admission requirements at Chinese universities (English-medium programs)',
            columns: ['Component', 'Minimum', 'Recommended (top-20)', 'Notes'],
            rows: [
              ['High school diploma', 'Required', 'Required', 'Notarized English translation; some schools accept 3-year secondary certificates'],
              ['High school GPA', '2.8+ / 4.0 (70%+)', '3.3+ / 4.0 (80%+)', 'Top-10 schools want 85%+; some accept 70%'],
              ['HSK (Chinese proficiency)', 'Not required for English-medium', 'HSK 4-5 preferred for bilingual programs', 'Some universities require HSK 4 by year 3-4'],
              ['IELTS / TOEFL', 'IELTS 5.5+ / TOEFL 70+', 'IELTS 6.5+ / TOEFL 90+', 'Required for English-medium; waived for native speakers'],
              ['Science background', 'Required for STEM', 'Strong (advanced courses)', 'Biology + chemistry for medicine; physics for engineering; math for CS'],
              ['Personal statement', '500-800 words', '1,000-1,500 words', 'Why this university, why this program, career goals'],
              ['Recommendation letters', '1-2 (high school teachers)', '2 (1 academic + 1 counselor)', 'For top programs: from science/math teachers'],
              ['Entrance exam', 'Some schools require', 'Pass if required', 'Math, English, or subject-specific; varies by school'],
              ['Interview', 'Some top programs', 'Strong performance', 'Video or in-person; behavioral + academic'],
              ['Work experience', 'Not required', 'Not required', 'Internships strengthen the application'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Age limits: most bachelor\'s programs accept students 18-25. Some programs (medicine, MBBS) have stricter age caps. Joint-venture programs (UNNC, XJTLU) follow UK admission cycles and may have different age cutoffs.',
          },
        ],
      },
      {
        id: 'masters-requirements',
        h2: 'Master\'s admission requirements',
        intro:
          'Master\'s admission is more holistic than bachelor\'s — academic record, language test, recommendations, statement of purpose, and (for some programs) work experience. Here is the full picture.',
        blocks: [
          {
            type: 'table',
            caption: 'Master\'s admission requirements at Chinese universities (English-medium programs)',
            columns: ['Component', 'Minimum', 'Recommended (top-20)', 'Notes'],
            rows: [
              ['Bachelor\'s degree', 'Required (3- or 4-year)', 'Required (4-year preferred)', '3-year UK/India/Pakistan bachelor\'s accepted; community college + transfer accepted at some schools'],
              ['Bachelor\'s GPA', '3.0+ / 4.0 (75%+)', '3.3+ / 4.0 (80%+)', 'Top-10 schools want 3.5+; some accept 2.8+ with strong work experience'],
              ['GRE / GMAT', 'Optional (300+ if submitted)', 'Optional (320+ if submitted)', 'Waived for most programs; required for top-5 business schools'],
              ['IELTS / TOEFL', 'IELTS 6.0+ / TOEFL 80+', 'IELTS 6.5+ / TOEFL 90+', 'Required for English-medium; some waive for 4-year English-taught undergrad'],
              ['Work experience', 'Not required (most programs)', '2-3 years (MBA / business / management)', 'Engineering + sciences: optional; MBA: typically 3-7 years'],
              ['Research proposal / study plan', 'Required for thesis track', 'Strong (1,500-2,000 words)', 'Master\'s thesis track requires a research proposal; coursework track does not'],
              ['Personal statement', '800-1,200 words', '1,200-1,500 words', 'Why this program, why China, career goals, research interests'],
              ['Recommendation letters', '2 (1 academic + 1 work)', '2-3 (1 academic + 1 research + 1 work)', 'For thesis track: research supervisor reference is critical'],
              ['CV / Resume', 'Required', 'Detailed (research, work, publications)', 'Publications strongly preferred for thesis track'],
              ['Interview', 'Some programs', 'Strong performance', 'Video or in-person; research + behavioral questions'],
              ['Portfolio / work samples', 'Required for design, art, architecture', 'Strong portfolio', '5-10 pieces for design programs'],
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'GMAT waiver: most Chinese MBA programs waive GMAT for applicants with 7+ years of strong work experience, a graduate degree, or exceptional undergrad record (GPA 3.5+). CEIBS, Antai, and Peking GSM are the most flexible.',
          },
        ],
      },
      {
        id: 'phd-requirements',
        h2: 'PhD admission requirements',
        intro:
          'PhD admission is research-focused — the #1 factor is a strong research proposal matched to a supervisor. Publications matter; standardized tests matter less.',
        blocks: [
          {
            type: 'table',
            caption: 'PhD admission requirements at Chinese universities (English-medium programs)',
            columns: ['Component', 'Minimum', 'Strong', 'Notes'],
            rows: [
              ['Master\'s degree', 'Required', 'Required', 'Some top universities accept exceptional bachelor\'s holders (4-year direct PhD)'],
              ['Master\'s GPA', '3.3+ / 4.0 (80%+)', '3.5+ / 4.0 (85%+)', 'Top-5 schools want 3.7+; research output matters more than GPA at this level'],
              ['GRE / GMAT', 'Optional', 'Optional', 'Waived for most PhD programs; required for some funded positions'],
              ['IELTS / TOEFL', 'IELTS 6.5+ / TOEFL 90+', 'IELTS 7.0+ / TOEFL 100+', 'Required for English-medium; native speakers exempt'],
              ['Research proposal', 'Required (1,500-3,000 words)', 'Strong (with clear methodology)', 'The #1 factor in PhD admission — must be a coherent, feasible research question'],
              ['Publications', 'Optional (preferred)', 'Strong (1-3 papers in peer-reviewed venues)', 'Q1/Q2 journal papers or top-tier conference papers preferred'],
              ['Recommendation letters', '3 (academic, all research supervisors)', '3 (research supervisors, all familiar with your work)', 'Critical: references from active researchers carry 10x weight'],
              ['CV / Resume', 'Required', 'Detailed (research, work, publications, awards)', 'Include all research projects, even unpublished'],
              ['Supervisor matching', 'Required', 'Required (pre-matched before applying)', 'Contact 3-5 potential supervisors 6-9 months in advance'],
              ['Interview', 'Required', 'Strong performance', 'Research presentation + Q&A; 30-60 minutes'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Supervisor matching is the #1 PhD admission factor. Email 3-5 potential supervisors 6-9 months before the deadline. A supervisor who is excited about your proposal will fight for your admission + scholarship. Apply without supervisor match = auto-reject at most top universities.',
          },
        ],
      },
      {
        id: 'common-rejection-reasons',
        h2: 'Common rejection reasons and how to avoid them',
        intro:
          'Most rejections at Chinese universities are preventable. Here are the top 10 reasons international applications get rejected, and how to fix them.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**GPA below the program threshold** — Fix: research the program\'s stated minimum; apply to programs where you meet or exceed the average',
              '**English test score below requirement** — Fix: retake IELTS/TOEFL 3-6 months before applying; many programs waive for 4-year English-taught undergrad',
              '**Generic personal statement** — Fix: tailor each essay to the specific program + supervisor; mention specific faculty, research, or facilities you want to work with',
              '**Weak or generic recommendation letters** — Fix: choose referees who know your work; provide them with your CV, statement, and the program\'s research areas',
              '**Missing documents** — Fix: use the program\'s official checklist; notarize translations; send transcripts directly from the institution',
              '**Applying to one program only** — Fix: apply to 3-5 programs in parallel; acceptance rates are 10-40% at top schools',
              '**Missing the deadline** — Fix: rolling admissions start in November; top-5 schools close by April for September intake; apply 6-9 months early',
              '**No research proposal (PhD)** — Fix: contact potential supervisors 6-9 months in advance; co-develop the proposal with your prospective supervisor',
              '**No scholarships applied** — Fix: apply for CSC + university-specific + provincial scholarships in parallel; most universities waive 50-100% of tuition for top applicants',
              '**No financial documentation** — Fix: include bank statements showing ability to cover tuition + living for 1 year; some scholarships require this as a backup',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What GPA do I need for a Chinese university?',
        a: 'Bachelor\'s: minimum 2.8/4.0 (70%+); top-20 schools want 3.3+ (80%+). Master\'s: minimum 3.0/4.0 (75%+); top-20 schools want 3.3+ (80%+); top-5 want 3.5+. PhD: minimum 3.3/4.0 (80%+); top-5 want 3.5+ (research output matters more than GPA at this level). Note: GPA requirements vary by program — engineering is typically more flexible, while business + MBA programs are stricter.',
      },
      {
        q: 'What IELTS / TOEFL score do I need?',
        a: 'Bachelor\'s English-medium: minimum IELTS 5.5+ / TOEFL 70+; top-20 want IELTS 6.5+ / TOEFL 90+. Master\'s: minimum IELTS 6.0+ / TOEFL 80+; top-20 want IELTS 6.5+ / TOEFL 90+. PhD: minimum IELTS 6.5+ / TOEFL 90+; top programs want IELTS 7.0+ / TOEFL 100+. Native English speakers + graduates of 4-year English-taught programs are typically exempt.',
      },
      {
        q: 'Do I need GRE / GMAT for a Chinese university?',
        a: 'For most master\'s programs, GRE/GMAT are optional. If submitted, 300+ is competitive; 320+ is strong. For top-5 business schools (CEIBS, Peking GSM, Tsinghua SEM, Fudan), GMAT is recommended (680+) but often waived for qualified applicants. For PhD, GRE is optional and rarely required. Engineering + science programs almost never require standardized tests.',
      },
      {
        q: 'Do I need work experience for a Chinese university?',
        a: 'Bachelor\'s: no work experience required. Master\'s: optional for most programs (engineering, sciences, even business research tracks); MBA programs typically want 3-7 years of work experience. PhD: research experience matters; work experience is a plus but not required. Internships strengthen bachelor\'s applications but are not required.',
      },
      {
        q: 'How important is the personal statement?',
        a: 'Very important. The personal statement (or statement of purpose) is the #1 differentiator after GPA + language test. A generic personal statement is the fastest way to get rejected. A strong one explains (1) why this specific program, (2) why this specific university (mention specific faculty, labs, facilities), (3) your research interests, (4) your career goals. Most successful applications spend 4-8 weeks writing + 3+ rounds of editing.',
      },
      {
        q: 'How important are recommendation letters?',
        a: 'Critical, especially for PhD and master\'s thesis-track programs. For bachelor\'s: 1-2 letters from high school teachers (science/math preferred for STEM). For master\'s: 2 letters (1 academic + 1 work/research). For PhD: 3 letters from research supervisors who can speak to your research ability. Choose referees who know your work; provide them with your CV + statement + the program\'s research areas.',
      },
      {
        q: 'Can I apply to multiple Chinese universities at once?',
        a: 'Yes — most international students apply to 3-5 universities in parallel. Chinese universities do not have a centralized application system (like the US Common App or UK UCAS), so each application is separate. The Chinese Scholarship Council (CSC) portal does allow one CSC application per year, but you can still apply to multiple universities. Apply 6-9 months before your target intake; top-5 schools close by April for September.',
      },
      {
        q: 'Do Chinese universities accept 3-year bachelor\'s degrees?',
        a: 'Yes — most Chinese universities accept 3-year bachelor\'s degrees from UK, India, Pakistan, Bangladesh, and other countries that follow the 3-year undergraduate model. This is one of the advantages of studying in China vs the US/Canada (where 4-year bachelor\'s is typically required for master\'s admission). Note: some top programs (Tsinghua, Peking) may require 16 years of formal education (12 + 4); check specific program requirements.',
      },
    ],
    howToSteps: [
      {
        name: 'Identify your target degree level',
        text: 'Bachelor\'s / Master\'s / PhD — each has different requirements. Use the tables in sections 1-3 to check the minimum + recommended requirements for your target degree level.',
      },
      {
        name: 'Take the language test 6 months in advance',
        text: 'IELTS 6.0-6.5+ (TOEFL 80-90+) is the standard. Book your test 6 months before the application deadline. Most programs accept scores within 2 years.',
      },
      {
        name: 'Prepare the document package',
        text: 'Bachelor\'s: high school diploma + transcripts (notarized), personal statement, 2 recommendation letters. Master\'s: bachelor\'s diploma + transcripts, statement of purpose, 2-3 recommendation letters, CV. PhD: master\'s diploma + transcripts, research proposal (1,500-3,000 words), 3 academic recommendation letters, CV with publications.',
      },
      {
        name: 'Contact potential supervisors (PhD + thesis-track master\'s)',
        text: 'PhD and thesis-track master\'s admission depends on supervisor match. Email 3-5 potential supervisors 6-9 months before the deadline with: (1) your CV, (2) your research interests, (3) the program you\'re applying to. A supervisor who is excited about your research will fight for your admission + funding.',
      },
      {
        name: 'Write a tailored personal statement',
        text: 'Avoid generic statements. Each essay should explain: (1) why this specific program, (2) why this specific university (mention specific faculty, labs, facilities), (3) your research interests, (4) your career goals. Allow 4-8 weeks writing + 3+ rounds of editing. Have a native English speaker proofread.',
      },
      {
        name: 'Apply to 3-5 universities in parallel',
        text: 'Top-5 schools: 10-25% acceptance rate. Top-20 schools: 25-50%. Apply to 3-5 programs in parallel to maximize chances. Each application is separate (no Common App for Chinese universities).',
      },
      {
        name: 'Apply for CSC + university + provincial scholarships',
        text: 'CSC covers full tuition + dorm + ¥2,500-3,500/month stipend + airfare. University-specific waivers cover 50-100% of tuition. Provincial scholarships (Beijing, Shanghai, Jiangsu, Zhejiang, Guangdong) cover ¥20,000-50,000/year. Apply for all three in parallel — they don\'t auto-apply.',
      },
      {
        name: 'Prepare for the interview',
        text: 'Most programs require an interview (video or in-person). For PhD: research presentation + Q&A. For master\'s: research + behavioral questions. For bachelor\'s: behavioral + academic questions. Practice with current students or alumni. 30-60 minutes typical.',
      },
    ],
    ctaTitle: 'Ready to apply to a Chinese university?',
    ctaSubtitle:
      'SICA counselors help you assess your competitiveness, choose target programs, prepare your application package, and apply for CSC + university + provincial scholarships. Free initial consultation.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/application',
        label: 'How to apply to Chinese universities',
        description: 'Step-by-step timeline, document checklist, language requirements, application channels, and post-admission steps.',
      },
      {
        href: '/guides/scholarships',
        label: 'Scholarships to study in China',
        description: 'CSC, Confucius, university-specific, and provincial scholarships — what each covers and how to apply.',
      },
      {
        href: '/best-universities-china',
        label: 'Best universities in China',
        description: 'Every Chinese university ranked by domestic ranking + QS World — the canonical 2026 ranking.',
      },
    ],
  },
  zh: {
    slug: 'china-university-admission-requirements',
    eyebrow: '指南 · 录取',
    title: '2026 中国大学录取要求（按学位层级）',
    description:
      '中国大学本科、硕士、博士录取要求——GPA 门槛、语言成绩、工作经验、推荐信。',
    subtitle:
      '清晰列出中国大学在每个学位层级看重什么。用本文在申请前评估自身竞争力。',
    stats: [
      { value: '3.0+', label: '本科 GPA（多数项目）' },
      { value: '3.3+', label: '硕士 GPA（顶尖项目）' },
      { value: '5+ 年', label: '硕士工作经验（典型）' },
      { value: '4 件', label: '博士材料：计划、推荐、发表、简历' },
    ],
    quickAnswer:
      '中国大学录取要求按学位层级差异显著。本科：高中毕业 + 强成绩（70%+ 平均，STEM 需理科背景）+ 雅思 6.0+/托福 80+（英文授课）+ 入学时无需 HSK + 无工作经验。硕士：学士学位（GPA 3.0+，75%+）+ GRE/GMAT 可选 + 雅思 6.5+/托福 90+ + 2-3 封推荐信 + 目标陈述。博士：硕士学位（GPA 3.3+）+ 1,500-3,000 字研究计划 + 3 封学术推荐信 + 优先发表 + 导师匹配最关键。工程与商科对工作经验最灵活；MBA 通常要 3-7 年。',
    keyTakeaways: [
      '本科录取聚焦 GPA + 语言成绩；无需工作经验',
      '硕士录取综合考量：GPA + 语言 + 推荐 + 目标陈述',
      '博士录取聚焦研究：计划 + 导师匹配 + 发表最重要',
      '雅思 6.0+（托福 80+）是英文授课本科标准；6.5+（90+）是硕士标准',
      '多数中国大学接受 3 年制学士学位（英、印、巴常见）——无需预科',
      'GRE/GMAT 对多数中国硕士项目可选；部分对合格申请者免',
    ],
    sections: [
      {
        id: 'bachelors-requirements',
        h2: '本科录取要求',
        intro:
          '中国大学本科录取最为标准化——高中毕业、GPA、语言成绩，以及（部分项目）入学考试。完整清单如下。',
        blocks: [
          {
            type: 'table',
            caption: '中国大学本科录取要求（英文授课项目）',
            columns: ['项目', '最低', '推荐（前 20）', '备注'],
            rows: [
              ['高中毕业证书', '必需', '必需', '公证英文翻译；部分学校接受 3 年制中等学历'],
              ['高中 GPA', '2.8+ / 4.0（70%+）', '3.3+ / 4.0（80%+）', '前 10 校要 85%+；部分接受 70%'],
              ['HSK（中文）', '英文授课无需', '双语项目偏好 HSK 4-5', '部分大学第 3-4 年要求 HSK 4'],
              ['IELTS / TOEFL', 'IELTS 5.5+ / TOEFL 70+', 'IELTS 6.5+ / TOEFL 90+', '英文授课必需；母语者免'],
              ['理科背景', 'STEM 项目必需', '强（高级课程）', '医学要生物 + 化学；工程要物理；CS 要数学'],
              ['个人陈述', '500-800 字', '1,000-1,500 字', '为何该校、为何该项目、职业目标'],
              ['推荐信', '1-2 封（高中教师）', '2 封（1 学术 + 1 顾问）', '顶尖项目：理科/数学教师'],
              ['入学考试', '部分学校要求', '如要求需通过', '数学、英语或学科；因校而异'],
              ['面试', '部分顶尖项目', '表现优秀', '视频或现场；行为 + 学术'],
              ['工作经验', '无需', '无需', '实习可加分'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '年龄限制：多数本科项目接受 18-25 岁学生。部分项目（医学、MBBS）年龄更严。合办项目（UNNC、XJTLU）按英国录取周期，年龄限制可能不同。',
          },
        ],
      },
      {
        id: 'masters-requirements',
        h2: '硕士录取要求',
        intro:
          '硕士录取比本科更综合——学业记录、语言成绩、推荐信、目标陈述，以及（部分项目）工作经验。完整内容如下。',
        blocks: [
          {
            type: 'table',
            caption: '中国大学硕士录取要求（英文授课项目）',
            columns: ['项目', '最低', '推荐（前 20）', '备注'],
            rows: [
              ['学士学位', '必需（3 或 4 年制）', '必需（4 年制优先）', '3 年制英/印/巴学士接受；部分学校接受社区学院 + 转学'],
              ['学士 GPA', '3.0+ / 4.0（75%+）', '3.3+ / 4.0（80%+）', '前 10 校要 3.5+；部分接受 2.8+（工作经验强者）'],
              ['GRE / GMAT', '可选（如提交 300+）', '可选（如提交 320+）', '多数项目免；前 5 商学院要求'],
              ['IELTS / TOEFL', 'IELTS 6.0+ / TOEFL 80+', 'IELTS 6.5+ / TOEFL 90+', '英文授课必需；4 年英文本科可免'],
              ['工作经验', '多数项目无需', '2-3 年（MBA / 商科 / 管理）', '工程 + 理科：可选；MBA：典型 3-7 年'],
              ['研究计划 / 学习计划', '论文轨道必需', '强（1,500-2,000 字）', '硕士论文轨道需研究计划；授课轨道无需'],
              ['个人陈述', '800-1,200 字', '1,200-1,500 字', '为何该项目、为何中国、职业目标、研究兴趣'],
              ['推荐信', '2 封（1 学术 + 1 工作）', '2-3 封（1 学术 + 1 研究 + 1 工作）', '论文轨道：研究导师推荐关键'],
              ['简历', '必需', '详尽（研究、工作、发表）', '发表对论文轨道强烈推荐'],
              ['面试', '部分项目', '表现优秀', '视频或现场；研究 + 行为问题'],
              ['作品集', '设计、艺术、建筑必需', '强作品集', '设计项目 5-10 件'],
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'GMAT 豁免：多数中国 MBA 项目对 7+ 年强工作经验 + 研究生学位 + 本科 GPA 3.5+ 的申请者免 GMAT。CEIBS、安泰、北大光华在豁免政策上最灵活。',
          },
        ],
      },
      {
        id: 'phd-requirements',
        h2: '博士录取要求',
        intro:
          '博士录取聚焦研究——首要因素是强研究计划 + 导师匹配。发表重要；标准化考试次要。',
        blocks: [
          {
            type: 'table',
            caption: '中国大学博士录取要求（英文授课项目）',
            columns: ['项目', '最低', '强', '备注'],
            rows: [
              ['硕士学位', '必需', '必需', '部分顶尖大学接受优秀本科直博（4 年制）'],
              ['硕士 GPA', '3.3+ / 4.0（80%+）', '3.5+ / 4.0（85%+）', '前 5 校要 3.7+；研究产出比 GPA 更重要'],
              ['GRE / GMAT', '可选', '可选', '多数博士项目免；部分资助岗位要求'],
              ['IELTS / TOEFL', 'IELTS 6.5+ / TOEFL 90+', 'IELTS 7.0+ / TOEFL 100+', '英文授课必需；母语者免'],
              ['研究计划', '必需（1,500-3,000 字）', '强（方法清晰）', '博士录取首要因素——必须是连贯可行的研究问题'],
              ['发表', '可选（优先）', '强（同行评议期刊 1-3 篇）', 'Q1/Q2 期刊或顶会论文优先'],
              ['推荐信', '3 封（学术研究导师）', '3 封（熟悉工作的研究导师）', '关键：活跃研究者的推荐权重大 10 倍'],
              ['简历', '必需', '详尽（研究、工作、发表、奖项）', '列所有研究项目（含未发表）'],
              ['导师匹配', '必需', '必需（申请前预匹配）', '申请前 6-9 个月联系 3-5 位潜在导师'],
              ['面试', '必需', '表现优秀', '研究展示 + 问答；30-60 分钟'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '导师匹配是博士录取首要因素。申请截止前 6-9 个月联系 3-5 位潜在导师。对你的研究感兴趣的导师会为你的录取 + 奖学金争取名额。无导师匹配申请 = 多数顶尖大学自动拒。',
          },
        ],
      },
      {
        id: 'common-rejection-reasons',
        h2: '常见拒录原因与如何避免',
        intro:
          '中国大学的多数拒录可预防。下面是国际生申请被拒的前 10 大原因及解决办法。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**GPA 低于项目门槛**——解决：研究项目明示的最低要求；申请达到或超过平均水平的目标项目',
              '**英语成绩低于要求**——解决：申请前 3-6 个月重考雅思/托福；多数项目对 4 年英文本科免',
              '**通用个人陈述**——解决：每篇文书针对具体项目 + 导师定制；提及具体教师、研究或设施',
              '**弱或通用推荐信**——解决：选择了解你工作的推荐人；向他们提供简历、陈述与项目研究方向',
              '**材料缺失**——解决：使用项目官方清单；公证翻译；成绩单由学校直接寄送',
              '**仅申请一个项目**——解决：同时申请 3-5 个项目；顶尖学校录取率 10-40%',
              '**错过截止日期**——解决：滚动录取 11 月开始；前 5 校 4 月截止 9 月入学；提前 6-9 个月申请',
              '**无研究计划（博士）**——解决：申请前 6-9 个月联系潜在导师；与导师共同制定计划',
              '**未申请奖学金**——解决：并行申请 CSC + 院校 + 省市奖学金；多数大学为顶尖申请者减免 50-100% 学费',
              '**无财务证明**——解决：附银行流水证明能覆盖 1 年学费 + 生活费；部分奖学金需要此作为后备',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国大学需要多少 GPA？',
        a: '本科：最低 2.8/4.0（70%+）；前 20 校要 3.3+（80%+）。硕士：最低 3.0/4.0（75%+）；前 20 校要 3.3+（80%+）；前 5 要 3.5+。博士：最低 3.3/4.0（80%+）；前 5 要 3.5+（研究产出比 GPA 更重要）。GPA 要求因项目而异——工程最灵活，商科 + MBA 最严。',
      },
      {
        q: '需要多少雅思/托福？',
        a: '本科英文授课：最低雅思 5.5+ / 托福 70+；前 20 要雅思 6.5+ / 托福 90+。硕士：最低雅思 6.0+ / 托福 80+；前 20 要雅思 6.5+ / 托福 90+。博士：最低雅思 6.5+ / 托福 90+；顶尖项目要雅思 7.0+ / 托福 100+。母语英语者 + 4 年英文授课本科毕业通常豁免。',
      },
      {
        q: '中国大学需要 GRE/GMAT 吗？',
        a: '多数硕士项目，GRE/GMAT 可选。如提交，300+ 有竞争力；320+ 强。前 5 商学院（CEIBS、北大光华、清华经管、复旦）推荐 GMAT（680+），但常对合格申请者免。博士 GRE 可选且罕见要求。工程 + 理科项目几乎从不要求标准化考试。',
      },
      {
        q: '中国大学需要工作经验吗？',
        a: '本科：无需工作经验。硕士：多数项目可选（工程、理科、甚至商科研究轨道）；MBA 典型要 3-7 年工作经验。博士：研究经验重要；工作经验加分但非必需。实习能强化本科申请但非必需。',
      },
      {
        q: '个人陈述多重要？',
        a: '非常重要。个人陈述（或目标陈述）是 GPA + 语言成绩后的首要差异化因素。通用 PS 是最快的拒录方式。强 PS 解释（1）为何这个具体项目，（2）为何这个具体大学（提及具体教师、实验室、设施），（3）你的研究兴趣，（4）你的职业目标。多数成功申请花 4-8 周写作 + 3 轮以上修改。',
      },
      {
        q: '推荐信多重要？',
        a: '关键，尤其对博士与硕士论文轨道。本科：1-2 封（高中教师，STEM 优选理科/数学教师）。硕士：2 封（1 学术 + 1 工作/研究）。博士：3 封研究导师推荐信（能评价你的研究能力）。选择了解你工作的推荐人；向他们提供简历 + 陈述 + 项目研究方向。',
      },
      {
        q: '可以同时申请多所中国大学吗？',
        a: '可以——多数国际生同时申请 3-5 所大学。中国大学没有像美国 Common App 或英国 UCAS 那样的集中申请系统，每个申请独立。CSC 系统每年允许一份 CSC 申请，但你可以申请多所大学。建议提前 6-9 个月申请目标入学；前 5 校 4 月截止 9 月入学。',
      },
      {
        q: '中国大学接受 3 年制学士学位吗？',
        a: '接受——多数中国大学接受来自英国、印度、巴基斯坦、孟加拉等国的 3 年制学士学位。这是来华读硕 vs 美加的优势之一（美加硕士通常要求 4 年制学士）。注：部分顶尖项目（清华、北大）可能要求 16 年正式教育（12+4）；查询具体项目要求。',
      },
    ],
    howToSteps: [
      {
        name: '确定目标学位层级',
        text: '本科 / 硕士 / 博士——每个有不同要求。使用第 1-3 节表格检查目标学位层级的最低 + 推荐要求。',
      },
      {
        name: '提前 6 个月备考语言',
        text: '雅思 6.0-6.5+（托福 80-90+）是标准。申请截止前 6 个月报考。多数项目接受 2 年内的成绩。',
      },
      {
        name: '准备申请材料',
        text: '本科：高中毕业证 + 成绩单（公证）、个人陈述、2 封推荐信。硕士：学士毕业证 + 成绩单、目标陈述、2-3 封推荐信、简历。博士：硕士毕业证 + 成绩单、研究计划（1,500-3,000 字）、3 封学术推荐信、含发表的简历。',
      },
      {
        name: '联系潜在导师（博士 + 论文轨道硕士）',
        text: '博士与论文轨道硕士录取取决于导师匹配。申请截止前 6-9 个月联系 3-5 位潜在导师，附：（1）简历，（2）研究兴趣，（3）目标项目。对你的研究感兴趣的导师会为你的录取 + 资助争取名额。',
      },
      {
        name: '撰写有针对性的个人陈述',
        text: '避免通用陈述。每篇陈述应解释：（1）为何这个具体项目，（2）为何这个具体大学（提及具体教师、实验室、设施），（3）你的研究兴趣，（4）你的职业目标。预留 4-8 周写作 + 3 轮以上修改。母语英语者校对。',
      },
      {
        name: '同时申请 3-5 所大学',
        text: '前 5 校：10-25% 录取率。前 20 校：25-50%。同时申请 3-5 个项目以最大化概率。每个申请独立（中国大学无通用申请系统）。',
      },
      {
        name: '并行申请 CSC + 院校 + 省市奖学金',
        text: 'CSC 覆盖全额学费 + 住宿 + ¥2,500-3,500/月补贴 + 机票。院校减免 50-100% 学费。省市奖学金（北京、上海、江苏、浙江、广东）¥20,000-50,000/年。并行申请——不会自动申请。',
      },
      {
        name: '准备面试',
        text: '多数项目要求面试（视频或现场）。博士：研究展示 + 问答。硕士：研究 + 行为问题。本科：行为 + 学术问题。与在校生或校友练习。30-60 分钟典型。',
      },
    ],
    ctaTitle: '准备好申请中国大学了吗？',
    ctaSubtitle:
      'SICA 顾问可帮你评估竞争力、选择目标项目、准备申请材料、申请 CSC + 院校 + 省市奖学金。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/guides/application',
        label: '中国大学申请全流程',
        description: '逐步时间线、材料清单、语言要求、申请渠道、录取后步骤。',
      },
      {
        href: '/guides/scholarships',
        label: '中国留学奖学金',
        description: 'CSC、孔子学院、院校、省市奖学金——各自覆盖什么，怎么申请。',
      },
      {
        href: '/best-universities-china',
        label: '中国最好的大学',
        description: '所有中国大学按国内排名 + QS 世界排名——2026 标准排名表。',
      },
    ],
  },
};
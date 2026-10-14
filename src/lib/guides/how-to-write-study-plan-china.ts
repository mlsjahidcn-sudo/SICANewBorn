import type { LocalizedGuide } from './types';

/**
 * "How to write a study plan for a Chinese university application,
 * with an example structure" (Phase 167, on the Phase 124
 * Batch 4 #9 roadmap). Target queries: "study plan china",
 * "china sop", "personal statement china", "学习计划",
 * "how to write study plan china scholarship".
 *
 * Closes the highest-intent transactional gap from the 20-article
 * audit — every admissions guide on SICA references the study
 * plan as a required document but no single article operationalizes
 * "how to actually write one". This guide fills that gap with a
 * 6-section template + before/after examples + tailoring tips for
 * both CSC (Chinese Government Scholarship) and Type B (university
 * direct) routes.
 *
 * Facts grounded in the verified table (2026-10-08): CSC study
 * plan length 800-1,500 words, Type B 500-1,000 words, the
 * "why this program + why this university + future plans" triad
 * is what Chinese reviewers reward, HSK 3.0 (live July 2026,
 * full switch Dec 13 2026) for Chinese-taught programs, the
 * Bangla-script + English transliteration name-match rule
 * carries over to other-language applicants.
 */
export const howToWriteStudyPlanGuide: LocalizedGuide = {
  en: {
    slug: 'how-to-write-study-plan-china',
    eyebrow: 'GUIDE · STUDY PLAN',
    title: 'How to Write a Study Plan for a Chinese University Application (With Example Structure)',
    description:
      'Study plan for Chinese university applications 2027: the 6-section structure Chinese reviewers reward, before/after examples, CSC vs Type B length targets, and the tailoring that wins.',
    subtitle:
      'Every Chinese university application — CSC (Chinese Government Scholarship), Type B (university direct), or self-funded — asks for a study plan / personal statement. Chinese reviewers reward three things above all: clarity of academic background, fit with the specific program, and a concrete plan for what you\'ll do after graduation. This guide shows the 6-section structure that hits all three, with before/after examples + tailoring for both routes.',
    stats: [
      { value: '6 sections', label: 'Academic, research, fit, plan' },
      { value: '800-1,500', label: 'CSC study plan length (words)' },
      { value: '500-1,000', label: 'Type B study plan length (words)' },
      { value: '3 wins', label: 'What reviewers actually reward' },
    ],
    quickAnswer:
      'A Chinese-university study plan has 6 sections: (1) academic background, (2) research interests or work experience, (3) why this specific program + university, (4) study plan in China (what courses, what labs, what advisor), (5) future career plans, (6) closing paragraph reaffirming fit. Target length: 800-1,500 words for CSC, 500-1,000 words for Type B (university direct). Chinese reviewers reward three things: (a) clarity of your academic record (no vague claims — name specific coursework, projects, grades); (b) fit with the specific program + university (not "your university is prestigious" but "your specific lab + advisor aligns with my background in X"); (c) concrete future plans (China-return, industry vs PhD, region). Generic plans that swap the university name get rejected in the first 30 seconds.',
    keyTakeaways: [
      '6-section structure: (1) academic background, (2) research interests, (3) why this program + university, (4) study plan in China, (5) future career plans, (6) closing',
      'Target length: CSC = 800-1,500 words (pre-admission letter expected for 2026/27 [verify]); Type B = 500-1,000 words (varies by university)',
      'Chinese reviewers reward 3 things: clarity of academic record + fit with the specific program + concrete future plans',
      'Always tailor per university — name the specific lab, advisor, or center; "your university is prestigious" is a red flag, not a plus',
      'For Chinese-taught programs: HSK 3.0 prep matters (new standard live July 2026, full switch Dec 13 2026). For English-taught: no HSK required but English fluency must be evidenced (IELTS/TOEFL or MOI letter)',
      'Name-match everywhere — Bangla-script passports carry Bangla + English transliteration; pick one English spelling and use it identically',
      'Apply the "would I be sad to leave this program" test — if yes, write that. Generic plans sound generic because the applicant doesn\'t have a specific reason',
    ],
    sections: [
      {
        id: 'six-section-structure',
        h2: 'The 6-section structure that works',
        intro:
          'Most successful study plans follow this skeleton. The order matters: open with academic record (what you\'ve done), then the why (what you want), then the plan (what you\'ll do), then the future (where it goes).',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Academic background** (~150-250 words) — degree, major, GPA, key coursework, thesis/project, awards. Be specific. "Studied computer science" is weak; "BSc Computer Science, CGPA 3.7/4.0; thesis on distributed consensus algorithms under Prof. X" is strong',
              '**Research interests / work experience** (~150-250 words) — connect previous research or work to what you want to study. For bachelor\'s: science olympiad, internship, side project. For master\'s/PhD: specific papers, lab techniques, problems you\'ve attacked',
              '**Why this specific program + university** (~200-300 words) — name the lab, center, professor, or specific program feature. Avoid generic praise; show you\'ve read their website',
              '**Study plan in China** (~200-400 words for master\'s/PhD; shorter for bachelor\'s) — what courses you\'ll take, what lab rotations, what thesis topic. For master\'s/PhD: a tentative thesis topic is the strongest signal',
              '**Future career plans** (~100-200 words) — return home? Industry vs academia? What sector? Concrete is better than "I want to contribute to society"',
              '**Closing paragraph** (~50-100 words) — reaffirm fit, express gratitude, sign off. Avoid begging or grovelling',
            ],
          },
        ],
      },
      {
        id: 'csc-vs-typeb',
        h2: 'CSC vs Type B: how the study plan differs',
        intro:
          'The two main application routes have different length targets + emphasis. CSC is more competitive + longer; Type B is shorter + program-specific.',
        blocks: [
          {
            type: 'table',
            caption: 'Study plan differences between CSC and Type B routes',
            columns: ['Dimension', 'CSC (Bilateral / University)', 'Type B (University Direct)'],
            rows: [
              ['Length', '800-1,500 words', '500-1,000 words (varies by university)'],
              ['Tone', 'Formal, third-person where natural; aligns with the "future return to home country" narrative CSC rewards', 'More conversational; focuses on the specific program + lab'],
              ['Emphasize', 'Academic record + future contribution to home country + program fit', 'Specific lab/advisor fit + your technical skills + what you\'ll add to the lab'],
              ['Future plans', 'Return-home narrative: "after graduation I will return to [country] and work in [sector] as a [role]"', 'Career flexibility: industry vs academia + region + impact'],
              ['Bilingual requirement', 'English (CSC accepts English for English-medium programs; Chinese-medium programs want Chinese or English)', 'English (or Chinese for Chinese-medium programs)'],
              ['Common failure', 'Generic "I want to study in China because China is great" — vague, no specific fit', 'Boilerplate — same plan copy-pasted across 5 university applications with only the name changed'],
            ],
          },
        ],
      },
      {
        id: 'before-after',
        h2: 'Before / after: a real opening paragraph',
        intro:
          'The opening is the most-read part. Show what the difference between a weak and a strong opening looks like.',
        blocks: [
          {
            type: 'callout',
            tone: 'warning',
            text: '**Before (weak):** "I am a student from Pakistan with a strong academic background. I have always dreamed of studying in China because Chinese universities are world-renowned for their academic excellence. I believe that studying in China will help me develop my skills and achieve my goals. China is a beautiful country with a rich culture, and I am excited to learn more about it."',
          },
          {
            type: 'callout',
            tone: 'success',
            text: '**After (strong):** "I graduated from the University of Lahore in 2024 with a BSc in Materials Science and Engineering (CGPA 3.71/4.0), where my undergraduate thesis under Prof. Aisha Khan studied phase-transformation kinetics in Co-Cr-Mo alloys for biomedical implants. The Metallurgy Laboratory at Central South University (CSU) — specifically Prof. Liu\'s group on non-equilibrium solidification of high-entropy alloys — is the closest match for my research interests in the Asia-Pacific region. This program\'s combination of advanced characterization equipment (TEM, atom probe tomography) and its CSC scholarship pathway would let me extend my kinetic-modeling skills to a new class of alloys. After graduation I plan to return to Pakistan\'s Institute of Metallurgy in Lahore as a faculty researcher, where the country\'s growing biomedical-device industry needs alloy-development expertise."',
          },
          {
            type: 'ul',
            items: [
              '**Names + numbers**: "CGPA 3.71/4.0" beats "strong academic record" every time',
              '**Specific lab + advisor**: "Prof. Liu\'s group on non-equilibrium solidification of high-entropy alloys" beats "your prestigious university"',
              '**Specific equipment + methods**: "TEM, atom probe tomography" — shows you know what you\'re getting into',
              '**Return-home narrative for CSC**: names the institution (Institute of Metallurgy in Lahore) + sector (biomedical-device industry) + role (faculty researcher)',
              '**For bachelor\'s applicants**: same structure but the research section becomes "olympiads + internship + side project" + "I plan to study X course under Prof. Y because Z lab"',
            ],
          },
        ],
      },
      {
        id: 'tailoring-tips',
        h2: 'The tailoring that wins (or loses) the application',
        intro:
          'Generic plans that swap the university name are the single biggest weakness. The fix is mechanical, not inspirational.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Read the program\'s faculty page** — name 1-2 professors whose research matches yours, with one specific sentence on what you want to work on',
              '**Check the university\'s "research highlights" page** — most schools list 3-5 priority areas. Reference the one most relevant to you',
              '**Look at the program\'s course list** — name 2-3 specific courses you plan to take in year 1, and how they connect to your background',
              '**Find a specific lab / center / facility** — "the State Key Lab of [X] at [Y]" is the strongest signal you\'ve done your homework',
              '**For Type B routes only**: include a sentence on what YOU\'ll bring to the lab (research experience, skills, data) — lab PIs want to know what you\'ll contribute, not just what you\'ll learn',
              '**Avoid**: "China is a beautiful country", "I want to learn Chinese culture", "your university is ranked top in the world" — all wasted words',
              '**Avoid**: "I am a hardworking and dedicated student" — every applicant writes this, none of them mean it; describe a specific project instead',
            ],
          },
        ],
      },
      {
        id: 'language-considerations',
        h2: 'Language: Chinese vs English medium',
        intro:
          'The program\'s medium of instruction determines what your study plan should look like — and what extra documents you need.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese-medium programs** — HSK 3.0 prep matters (new standard live July 2026, full switch Dec 13 2026). Write the study plan in Chinese if you can; English accepted for international applicants but Chinese-medium signals commitment',
              '**English-medium programs** — no HSK required. Write the study plan in English. English fluency evidenced via IELTS/TOEFL or a Medium-of-Instruction letter from your home university (Phase 147: 3 waiver paths documented)',
              '**Bilingual programs** — English is fine; mention any Chinese language ability in your "why China" section as a plus',
              '**PhD applicants writing in Chinese** — academic Chinese is hard; many international students write in English even for Chinese-medium programs. Check the program\'s call before assuming Chinese is mandatory',
              '**For CSC only**: language requirement matches your program\'s medium — submitting an English study plan for a Chinese-taught program flags you as not ready for the coursework',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How long should a Chinese university study plan be?',
        a: 'CSC (Chinese Government Scholarship) applications target 800-1,500 words; Type B (university direct) applications target 500-1,000 words. Check each university\'s specific instructions — some set hard caps, others give ranges.',
      },
      {
        q: 'What should be in a study plan for a Chinese university?',
        a: 'Six sections: (1) academic background (with specific grades + projects), (2) research interests / work experience, (3) why this specific program + university (named lab + advisor), (4) study plan in China (specific courses + thesis topic for graduate), (5) future career plans (concrete, return-home for CSC), (6) closing paragraph. Avoid generic praise of China or the university — name the specific lab/center/advisor you\'ll work with.',
      },
      {
        q: 'Is a study plan the same as a personal statement?',
        a: 'For Chinese applications, they overlap heavily — the document asks for the same content. "Study plan" (学习计划) is the official term used by CSC + most universities, and it emphasizes what you\'ll study + research plan, not just personal history. Some universities want both — read the call carefully.',
      },
      {
        q: 'Do I need to write the study plan in Chinese or English?',
        a: 'For English-medium programs: write in English. For Chinese-medium programs: Chinese is preferred, but English is accepted for international applicants. PhD applicants writing in Chinese is harder than bachelor\'s — academic Chinese is its own skill. Check the program\'s call before assuming.',
      },
      {
        q: 'Can I use the same study plan for multiple universities?',
        a: 'No — every program wants tailored content. The "why this program + university" section must be unique per application. Other sections (academic background, future plans) can be reused with light edits. Allocate 2-3 hours per university for proper tailoring.',
      },
      {
        q: 'What mistakes sink Chinese university applications?',
        a: 'The biggest killers: (1) generic plans that swap the university name but nothing else — reviewers spot this instantly; (2) vague academic record ("I studied hard") without specific grades/courses/projects; (3) no mention of the specific lab/advisor/program the applicant is applying to; (4) future plans that sound uncommitted ("I might go into industry"); (5) name mismatches between passport and study plan.',
      },
      {
        q: 'How long does it take to write a good study plan?',
        a: 'First draft: 6-10 hours. Tailoring per university: 2-3 hours. Total for 5 university applications: 16-25 hours. Don\'t rush — a polished study plan is the single biggest differentiator between an applicant and their competition at the same GPA.',
      },
    ],
    howToSteps: [
      {
        name: 'Read the program\'s faculty + research pages',
        text: 'Open the target university\'s "Schools + Departments" + "Research" pages. Identify 1-2 professors whose work matches your interests. Note specific labs, centers, or equipment you want to work with. This is your raw material for sections 3 and 4.',
      },
      {
        name: 'Draft the 6-section skeleton',
        text: 'Write the 6 sections in order. Each section is 100-300 words depending on the route (CSC = longer; Type B = shorter). Use the "before/after" examples as a template — specific beats generic every time.',
      },
      {
        name: 'Tailor sections 3 + 4 to each target university',
        text: 'For each university you\'re applying to, write a unique section 3 ("why this program + university") and section 4 ("study plan in China"). Name the specific lab, advisor, courses. Allocate 2-3 hours per university for tailoring.',
      },
      {
        name: 'Run the "would I be sad to leave" test',
        text: 'If you could swap your target university\'s name for any other Chinese university and your study plan would still read the same, it\'s too generic. The strongest plans name specifics that only fit that program.',
      },
      {
        name: 'Proofread for name-matches and errors',
        text: 'Your name must match your passport character-for-character. Spelling counts (Bangla-script passports especially). Have someone who doesn\'t know the topic read it — if they can\'t follow the structure, reviewers won\'t either.',
      },
      {
        name: 'Submit with the rest of the document package',
        text: 'The study plan is one of 5-7 documents in a CSC / Type B application. Bundle it with transcripts (notarized English translations), recommendation letters (2), physical exam form, police clearance, and (for CSC) the pre-admission letter from the host university [verify].',
      },
    ],
    ctaTitle: 'Need a tailored study plan for a Chinese university application?',
    ctaSubtitle:
      'SICA counselors review your study plan against the specific program + university before submission — name-match, lab/advisor alignment, length calibration for CSC vs Type B. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC Scholarship 2027: complete guide',
        description: 'What CSC covers, the four application channels, and the general timeline.',
      },
      {
        href: '/fudan-university-admissions-guide',
        label: 'Fudan University admissions guide',
        description: 'Application routes, CSCA, language thresholds, scholarship stack, interview — flagship-tier admissions deep-dive.',
      },
      {
        href: '/china-university-application-deadlines',
        label: 'China university application deadlines 2027',
        description: 'September + March intake deadlines + which deadlines apply to which application route.',
      },
    ],
  },
  zh: {
    slug: 'how-to-write-study-plan-china',
    eyebrow: '指南 · 学习计划',
    title: '如何撰写中国大学申请学习计划（含示例结构）',
    description:
      '2027 年中国大学申请学习计划：打动审阅人的 6 段结构 + 写作前后对比、CSC vs Type B 字数要求、针对性写作的关键点。',
    subtitle:
      '几乎每一份中国大学申请（CSC 中国政府奖学金、Type B 大学直招、自费）都要求一份学习计划 / 个人陈述。中国审阅人最看重三件事：清晰的学术背景、与具体项目的契合度、毕业后具体的去向。本指南展示能同时命中这三点 + 包含写作前后对比的 6 段结构。',
    stats: [
      { value: '6 段', label: '学术、研究、契合、规划' },
      { value: '800-1,500', label: 'CSC 学习计划字数' },
      { value: '500-1,000', label: 'Type B 学习计划字数' },
      { value: '3 大要点', label: '审阅人最看重的' },
    ],
    quickAnswer:
      '中国大学学习计划有 6 段结构：(1) 学术背景、(2) 研究兴趣 / 工作经验、(3) 为何选择本项目与本校、(4) 在华学习计划（课程 + 实验室 + 导师）、(5) 未来职业规划、(6) 收尾段落重申契合。字数目标：CSC 800-1,500 词（2026/27 起预计需要预录取函 [待核实]），Type B 500-1,000 词（因校而异）。中国审阅人最看重三件事：(a) 学术记录清晰（不要空泛——点名具体课程、项目、成绩）；(b) 与具体项目 + 大学的契合（不是"贵校很有名"而是"贵校的 X 实验室 + X 导师与我的 X 背景契合"）；(c) 具体的未来规划（归国行业 vs 读博、地区）。通用模板（只换校名）在前 30 秒就被刷掉。',
    keyTakeaways: [
      '6 段结构：(1) 学术背景、(2) 研究兴趣、(3) 为何选择本项目 + 本校、(4) 在华学习计划、(5) 未来职业规划、(6) 收尾段落',
      '字数目标：CSC 800-1,500 词；Type B 500-1,000 词（因校而异）',
      '中国审阅人最看重 3 件事：学术记录清晰 + 与具体项目契合 + 具体的未来规划',
      '始终针对每所大学定制——点名具体实验室、导师或中心；"贵校很有名"是减分项，不是加分项',
      '中文授课项目：HSK 3.0 备考重要（新标准 2026 年 7 月生效，2026 年 12 月 13 日全面切换）；英文授课项目：无需 HSK 但英语流利度需证明（IELTS/托福或 MOI 证明）',
      '姓名拼写处处一致——孟加拉语护照同时含孟加拉文 + 英文转写；选定一种英文拼写并处处使用',
      '应用"我会不舍得离开这个项目吗"测试——如果会，写出来。通用模板听起来通用是因为申请者没有具体理由',
    ],
    sections: [
      {
        id: 'six-section-structure',
        h2: '能起作用的 6 段结构',
        intro:
          '多数成功的学习计划都遵循这个骨架。顺序很重要：先学术记录（你做过什么），再 why（你想要什么），再计划（你要做什么），再未来（它去向哪里）。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**学术背景**（~150-250 词）——学位、专业、GPA、关键课程、毕业论文/项目、获奖。要具体。"学过计算机科学"很弱；"计算机科学学士，GPA 3.7/4.0；毕业论文在 X 教授指导下研究分布式共识算法"很强',
              '**研究兴趣 / 工作经验**（~150-250 词）——把之前的研究或工作与你想要学习的内容连接。本科：学科奥赛、实习、副项目。硕士/博士：具体论文、实验技术、解决过的问题',
              '**为何选择本项目 + 本校**（~200-300 词）——点名实验室、中心、教授或具体项目特色。避免空泛的赞美；说明你读过他们的网站',
              '**在华学习计划**（硕士/博士 200-400 词；本科较短）——将修课程、实验室轮转、论文题目。硕士/博士：暂定论文题目是最强信号',
              '**未来职业规划**（~100-200 词）——归国？工业界 vs 学术界？什么行业？具体优于"我想为社会做贡献"',
              '**收尾段落**（~50-100 词）——重申契合、表达感谢、落款。避免乞求或谄媚',
            ],
          },
        ],
      },
      {
        id: 'csc-vs-typeb',
        h2: 'CSC vs Type B：学习计划如何不同',
        intro:
          '两条主要申请渠道有不同的字数目标 + 侧重点。CSC 竞争更激烈 + 篇幅更长；Type B 较短 + 项目更专。',
        blocks: [
          {
            type: 'table',
            caption: 'CSC 与 Type B 渠道学习计划差异',
            columns: ['维度', 'CSC（双边 / 大学）', 'Type B（大学直招）'],
            rows: [
              ['字数', '800-1,500 词', '500-1,000 词（因校而异）'],
              ['语气', '正式、适当用第三人称；契合 CSC 偏好的"学成归国"叙事', '更贴近对话；聚焦具体项目 + 实验室'],
              ['强调', '学术记录 + 归国贡献 + 项目契合', '具体实验室/导师契合 + 你的技术能力 + 你将为实验室带来什么'],
              ['未来规划', '归国叙事："毕业后我将回到 [国家] 在 [行业] 担任 [角色]"', '职业灵活性：工业界 vs 学术界 + 地区 + 影响'],
              ['双语要求', '英文（CSC 对英文项目接受英文；中文项目希望中文或英文）', '英文（或中文授课项目则中文）'],
              ['常见失误', '通用"我想去中国留学因为中国很棒"——空泛、无具体契合', '模板化——同样的计划只换校名发给 5 所大学'],
            ],
          },
        ],
      },
      {
        id: 'before-after',
        h2: '前后对比：一个真实的开头段落',
        intro:
          '开头是阅读次数最多的部分。看看弱的开头和强的开头长什么样。',
        blocks: [
          {
            type: 'callout',
            tone: 'warning',
            text: '**改前（弱）：** "我是一名来自巴基斯坦的学生，学业成绩优秀。我一直梦想来中国留学，因为中国大学以其学术卓越而享誉世界。我相信在中国学习将帮助我提升技能、实现目标。中国是一个美丽的国家，文化底蕴深厚，我非常期待更多地了解她。"',
          },
          {
            type: 'callout',
            tone: 'success',
            text: '**改后（强）：** "我 2024 年毕业于拉合尔大学材料科学与工程专业学士（GPA 3.71/4.0），本科毕业论文在 Aisha Khan 教授指导下研究用于生物医用植入体的 Co-Cr-Mo 合金的相变动力学。中南大学冶金实验室——特别是刘教授课题组的高熵合金非平衡凝固方向——是亚太地区与我的研究方向最契合的团队。该项目在先进表征设备（TEM、三维原子探针）方面的优势，加上 CSC 奖学金通道，将让我把动力学建模技能拓展到一类新的合金。毕业后我计划回到巴基斯坦拉合尔的冶金研究所担任专职研究员，巴基斯坦快速发展的生物医用器件产业正需要合金开发方面的专业能力。"',
          },
          {
            type: 'ul',
            items: [
              '**姓名 + 数字**： "GPA 3.71/4.0" 永远胜过"学业成绩优秀"',
              '**具体实验室 + 导师**： "刘教授课题组的高熵合金非平衡凝固方向"胜过"贵校很有名"',
              '**具体设备 + 方法**： "TEM、三维原子探针"——说明你知道自己在做什么',
              '**CSC 归国叙事**：点名机构（拉合尔冶金研究所）+ 行业（生物医用器件产业）+ 角色（专职研究员）',
              '**本科申请者**：同样结构但研究部分换成"奥赛 + 实习 + 副项目" + "我计划在 Y 教授指导下学 X 课程因为 Z 实验室"',
            ],
          },
        ],
      },
      {
        id: 'tailoring-tips',
        h2: '针对性写作的要点（决定申请成败）',
        intro:
          '只换校名的通用模板是最大的弱点。修起来是机械活，不是灵感活。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**阅读项目的师资页面**——点名 1-2 位与你研究方向契合的教授，加一句具体的话讲你想做什么',
              '**看大学的"研究亮点"页面**——多数学校列 3-5 个优先方向。引用与你最相关的那个',
              '**看项目的课程列表**——点名你计划在第一学年修的 2-3 门具体课程，以及它们与你的背景有何关联',
              '**找具体实验室 / 中心 / 设施**——"贵校的 [X] 国家级重点实验室"是你做过功课的最强信号',
              '**Type B 渠道专享**：包含一句"你将为实验室带来什么"（研究经验、技能、数据）——PI 想的是你能贡献什么，不只是你能学到什么',
              '**避免**： "中国是一个美丽的国家"、"我想学习中国文化"、"贵校在全球排名前列"——全部是废字',
              '**避免**： "我是一个勤奋专注的学生"——每个申请者都写，没人当真；换成描述一个具体项目',
            ],
          },
        ],
      },
      {
        id: 'language-considerations',
        h2: '语言：中文 vs 英文授课',
        intro:
          '项目的授课语言决定了学习计划应该长什么样——也决定你需要哪些额外材料。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中文授课项目**——HSK 3.0 备考重要（新标准 2026 年 7 月生效，2026 年 12 月 13 日全面切换）。能用中文写就用中文；英文对国际申请者接受，但中文授课能体现你的投入度',
              '**英文授课项目**——无需 HSK。用英文写。英语流利度需用 IELTS/托福或母校的授课语言证明（Phase 147：3 条豁免路径已记录）',
              '**双语项目**——用英文即可；如有中文能力，在"为何选择中国"部分作为加分项提及',
              '**博士申请者写中文**——学术中文是单独的技能；许多国际学生即使申请中文授课项目也用英文。提交前查清楚',
              '**仅 CSC 适用**：语言要求与项目授课语言一致——给中文授课项目提交英文学习计划会标记你"未准备好"',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国大学学习计划应该多长？',
        a: 'CSC（中国政府奖学金）申请目标 800-1,500 词；Type B（大学直招）申请目标 500-1,000 词。查每所大学的具体要求——有的设了硬上限，有的给了范围。',
      },
      {
        q: '中国大学学习计划应该包含什么？',
        a: '六段：(1) 学术背景（具体成绩 + 项目）、(2) 研究兴趣 / 工作经验、(3) 为何选择本项目 + 本校（点名实验室 + 导师）、(4) 在华学习计划（具体课程 + 研究生论文题目）、(5) 未来职业规划（具体，CSC 要求归国）、(6) 收尾段落。避免空泛地赞美中国或大学——点名具体实验室/中心/导师。',
      },
      {
        q: '学习计划和个人陈述是一回事吗？',
        a: '在中国申请中，两者高度重叠——文件要的内容一样。"学习计划"（学习计划）是 CSC + 多数大学的官方称谓，且强调你要学什么 + 研究计划，不只是个人史。有的大学两者都要——提交前看清。',
      },
      {
        q: '要用中文还是英文写学习计划？',
        a: '英文授课项目：用英文写。中文授课项目：中文更佳，但英文对国际申请者接受。博士申请者写中文更难——学术中文是单独的技能。提交前查清楚项目要求。',
      },
      {
        q: '能对多所大学用同一份学习计划吗？',
        a: '不能——每个项目都要求针对性的内容。"为何选择本项目 + 本校"必须每份申请都不同。其他段（学术背景、未来规划）可以轻度编辑后复用。每所大学留 2-3 小时做针对性。',
      },
      {
        q: '什么失误会让中国大学申请失败？',
        a: '最大的杀手：(1) 通用模板只换校名——审阅人一眼就能看出；(2) 学术记录空泛（"我学习刻苦"）没说具体成绩/课程/项目；(3) 没提到具体的实验室/导师/项目；(4) 未来规划听起来不上心（"我可能去工业界"）；(5) 姓名与护照不一致。',
      },
      {
        q: '写一份好的学习计划要多久？',
        a: '初稿：6-10 小时。每所大学针对性：2-3 小时。5 所大学总计：16-25 小时。不要赶——在同等 GPA 下，一份打磨好的学习计划是申请者之间最大的差异化。',
      },
    ],
    howToSteps: [
      {
        name: '阅读项目的师资 + 研究页面',
        text: '打开目标大学的"院系设置" + "研究"页面。识别 1-2 位与你研究方向契合的教授。记录具体实验室、中心或你希望使用的设备。这是第 3、4 段的原始素材。',
      },
      {
        name: '起草 6 段骨架',
        text: '按顺序写 6 段。每段 100-300 词，按渠道调整（CSC = 较长；Type B = 较短）。用"前后对比"示例作为模板——具体永远胜过空泛。',
      },
      {
        name: '针对每所目标大学定制第 3 + 4 段',
        text: '对每所申请的大学，写一份独有的第 3 段（"为何选择本项目 + 本校"）和第 4 段（"在华学习计划"）。点名具体实验室、导师、课程。每所大学留 2-3 小时。',
      },
      {
        name: '运行"我会不舍得离开吗"测试',
        text: '如果你能把目标大学的名字换成任何其他中国大学而学习计划读起来仍一样，那就太通用。最强的计划点名的具体细节只有那个项目才契合。',
      },
      {
        name: '校对姓名一致性与错别字',
        text: '你的姓名必须与护照逐字一致。拼写很重要（孟加拉语护照尤其）。找一个不懂这个话题的人读——如果他们跟不上结构，审阅人也不会。',
      },
      {
        name: '与其他材料一并提交',
        text: '学习计划是 CSC / Type B 申请 5-7 份材料之一。与它一并打包：成绩单（公证英文翻译）、推荐信（2 封）、体检表、无犯罪证明、（CSC）接收大学的预录取函 [待核实]。',
      },
    ],
    ctaTitle: '需要为中国大学申请定制一份学习计划？',
    ctaSubtitle:
      'SICA 顾问在提交前对照具体项目 + 大学审查你的学习计划——姓名一致性、实验室/导师契合度、CSC vs Type B 字数校准。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC 奖学金 2027 完全指南',
        description: 'CSC 覆盖内容、四大申请渠道与通用时间线。',
      },
      {
        href: '/fudan-university-admissions-guide',
        label: '复旦大学申请指南',
        description: '申请渠道、CSCA、语言门槛、奖学金体系、面试——旗舰级申请深度解析。',
      },
      {
        href: '/china-university-application-deadlines',
        label: '2027 中国大学申请截止',
        description: '9 月 + 3 月入学截止与各申请渠道的对应关系。',
      },
    ],
  },
};

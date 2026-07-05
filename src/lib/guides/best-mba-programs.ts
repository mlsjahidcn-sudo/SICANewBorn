import type { LocalizedGuide } from './types';

/**
 * "Best MBA Programs in China for International Students" —
 * long-form guide. Target queries: "mba in china", "best mba
 * china english", "international mba china", "china mba for
 * international students".
 *
 * Page wrapper filters programs to discipline=Business AND
 * name contains "MBA" / "Master" + injects the live list into
 * the `mba-programs-table` block at render time.
 */
export const bestMbaGuide: LocalizedGuide = {
  en: {
    slug: 'best-mba-programs-china',
    eyebrow: 'GUIDE · MBA',
    title: 'Best MBA Programs in China for International Students (2026)',
    description:
      'Every English-medium MBA program at top Chinese universities — duration, tuition, scholarships, GMAT/GRE requirements, and admissions strategy.',
    subtitle:
      'A 1-2 year MBA in English from a Chinese university — at 1/5 the cost of a US MBA, with C9 League brand recognition and emerging-market network.',
    stats: [
      { value: '¥60-120K', label: 'Total MBA tuition (USD 8.5-17K)' },
      { value: '1-2 yrs', label: 'Program length' },
      { value: 'LIVE', label: 'MBA programs in catalog' },
      { value: '15+', label: 'Universities with English MBA' },
    ],
    quickAnswer:
      'Top MBA programs in China for international students include CEIBS (Shanghai), Peking University GSM (光华), Tsinghua SEM, Fudan, Shanghai Jiao Tong Antai, and Lingnan (Sun Yat-sen). Tuition runs ¥60,000-120,000 total for the full program (USD 8,500-17,000) — about 1/5 of a US MBA. Most programs are 1-2 years, taught in English, and accept GMAT/GRE scores (some waive for qualified applicants). The C9 League brand recognition transfers globally, and the emerging-market peer network (China + ASEAN + Africa + LatAm) is a strong career differentiator. Apply 6-9 months in advance; rolling admissions.',
    keyTakeaways: [
      'CEIBS, Peking GSM, Tsinghua SEM, Fudan, and Antai (SJTU) are the consensus top-5 for international MBA students',
      'Tuition ¥60,000-120,000 total — about 1/5 the cost of a US MBA program',
      '1-2 year programs taught in English with GMAT/GRE required (some schools waive)',
      'C9 League brand recognition transfers globally + emerging-market peer network',
      'CSC scholarship can fund MBA fully — covers tuition + dorm + ¥3,000/month stipend',
      'Most programs accept 3-7 years of work experience; rolling admissions September-May',
    ],
    sections: [
      {
        id: 'why-mba-china',
        h2: 'Why an MBA in China?',
        intro:
          'An MBA from a top Chinese university gives you three things a US/UK MBA doesn\'t: C9 League brand recognition at 1/5 the cost, deep emerging-market network access, and on-the-ground exposure to the world\'s second-largest economy.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Cost** — full program tuition ¥60,000-120,000 (USD 8,500-17,000) vs USD 100,000-150,000 at top US MBAs. Living costs in China add ¥30,000-60,000/year — still a fraction of the total.',
              '**Brand** — Peking GSM (光华), Tsinghua SEM, Fudan, Shanghai Jiao Tong Antai are all C9 League universities. Their MBAs are recognized across Asia and increasingly in Europe/North America.',
              '**Network** — the average Chinese MBA cohort is 30-50% international students (vs 20-30% at US MBAs), with heavy representation from ASEAN, Africa, and Latin America. The emerging-market network you build is a strong differentiator for consulting, finance, and tech roles in those regions.',
              '**Career outcomes** — top Chinese MBA programs place 80-90% of graduates within 3 months, with median post-MBA salaries of ¥400,000-800,000/year in China (USD 56,000-112,000). International graduates often return home with a China-network premium.',
            ],
          },
          {
            type: 'h3',
            text: 'Trade-offs to consider',
            body:
              'Three honest trade-offs: (1) the MBA is "China-anchored" — most case studies, faculty expertise, and career services are oriented to the China market. If you want a US-anchored MBA, look at joint-venture programs (CEIBS is partly US-faculty-driven). (2) The international network is heavy on emerging markets — if you want a US/Western peer group, China is the wrong choice. (3) Language: outside CEIBS, most programs are partially Chinese-taught by year 2 — plan for HSK 4-5 to fully participate.',
          },
        ],
      },
      {
        id: 'admissions-requirements',
        h2: 'Admissions requirements: who gets in',
        intro:
          'Chinese MBA programs look at four things: work experience, undergraduate GPA, GMAT/GRE scores, and English proficiency. Here is the typical profile for a top-5 program.',
        blocks: [
          {
            type: 'table',
            caption: 'Typical MBA admissions profile at top Chinese universities',
            columns: ['Component', 'Typical requirement', 'Notes'],
            rows: [
              ['Work experience', '3-7 years', '5+ preferred for top-5; some programs accept 2+'],
              ['Undergraduate GPA', '3.0+ / 4.0', 'Top programs want 3.3+; some accept 2.8+ with strong work experience'],
              ['GMAT', '600-700+', 'Top programs want 680+; some waive for qualified applicants (7+ years experience, strong undergrad)'],
              ['GRE', 'Verbal 155+, Quant 160+', 'Equivalent to GMAT 600-700'],
              ['TOEFL / IELTS', 'TOEFL 90+ / IELTS 6.5+', 'Required if undergrad not in English'],
              ['Recommendation letters', '2-3', 'From current/former managers — academic refs less important for MBA'],
              ['Personal statement / essays', '2-4 essays', 'Why MBA, why China, career goals'],
              ['Interview', 'Required', 'On-site or video; behavioral + case questions'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'GMAT waiver: most top Chinese MBA programs waive GMAT for applicants with 7+ years of work experience, strong undergraduate record (GPA 3.5+), and/or a graduate degree. CEIBS and Antai are the most flexible on waivers.',
          },
        ],
      },
      {
        id: 'mba-programs-table',
        h2: 'All MBA and Master\'s in Business programs in the SICA catalog',
        intro:
          'Every business-focused master\'s program taught in English at Chinese universities in the SICA catalog. Sorted by parent university\'s domestic ranking, lowest (= best) first.',
        blocks: [
          {
            type: 'table',
            caption: 'English-medium MBA and Master\'s in Business programs at top Chinese universities',
            columns: ['Program', 'University', 'Degree', 'Duration', 'Tuition', 'Language'],
            rows: [['(loading from SICA database…)', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'CEIBS (China Europe International Business School) and joint-venture MBA programs at top Chinese universities accept GMAT/GRE scores or waive based on work experience. Talk to SICA for the full shortlist including CEIBS and joint-venture programs.',
          },
        ],
      },
      {
        id: 'cost-and-roi',
        h2: 'Cost and ROI: is an MBA in China worth it?',
        intro:
          'Total cost of an MBA in China runs ¥90,000-180,000 (USD 12,500-25,000) for a top program. Median post-MBA salary ¥400,000-800,000/year — payback period is typically 6-18 months.',
        blocks: [
          {
            type: 'table',
            caption: 'Total cost comparison: MBA in China vs US/UK (USD)',
            columns: ['Program', 'Tuition total', 'Living (1-2 yrs)', 'Total cost', 'Payback period'],
            rows: [
              ['China MBA (top-5)', '$8,500-17,000', '$8,000-15,000', '$16,500-32,000', '6-18 months'],
              ['China MBA (mid-tier)', '$5,000-12,000', '$5,000-10,000', '$10,000-22,000', '4-12 months'],
              ['US MBA (M7 top schools)', '$140,000-160,000', '$60,000-90,000', '$200,000-250,000', '36-60 months'],
              ['UK MBA (top 5)', '$60,000-90,000', '$40,000-60,000', '$100,000-150,000', '24-40 months'],
              ['INSEAD / LBS (1-year)', '$80,000-100,000', '$40,000-60,000', '$120,000-160,000', '20-36 months'],
            ],
          },
          {
            type: 'p',
            text: 'Practical takeaway: MBA in China offers the best payback period in the global MBA market — 6-18 months vs 24-60 months at US/UK programs. The trade-off is geographic focus (China + emerging markets) over global placement. If your career is China-anchored or emerging-market-focused, this is the best ROI in business education.',
          },
        ],
      },
      {
        id: 'mba-scholarships',
        h2: 'MBA scholarships: how to fund the program',
        intro:
          'Three scholarship layers stack — apply for all three in parallel to maximize your chance of a fully funded seat.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese Government Scholarship (CSC)** — fully funded: tuition + dorm + ¥3,000/month stipend + round-trip airfare. ~3,000 awards per year across all Chinese universities; MBA students get a meaningful share. Highly competitive; apply by mid-April for September intake.',
              '**University-specific MBA scholarships** — CEIBS Merit Scholarship, Peking GSM Excellence Award, Tsinghua SEM named scholarships, Fudan MBA Fellowship — typically waive 25-100% of tuition for top applicants. Application is automatic when you apply for admission.',
              '**Corporate sponsorships** — many large Chinese companies (especially in tech, finance, manufacturing) sponsor international MBA students in exchange for a 2-3 year post-MBA work commitment. Check with your target employer or SICA for current openings.',
              '**International scholarship programs** — joint-venture MBA programs (CEIBS, Antai-CEIBS) qualify for some international scholarships (e.g., GMAC Foundation, country-specific leadership programs).',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the best MBA in China for international students?',
        a: 'CEIBS (China Europe International Business School, Shanghai) is the consensus #1 for international MBA students — joint-venture with European and US partners, English-medium, top-ranked globally. Peking University GSM (光华), Tsinghua SEM, Fudan MBA, and Shanghai Jiao Tong Antai are the next tier. All five are recognized globally and accepted by multinational employers.',
      },
      {
        q: 'How much does an MBA in China cost?',
        a: 'Full program tuition for a top-5 MBA in China runs ¥60,000-120,000 (USD 8,500-17,000). Mid-tier programs run ¥30,000-80,000 (USD 4,200-11,000). Add living costs of ¥30,000-60,000/year for a 1-2 year program. Total all-in: USD 12,000-32,000 — about 1/5 of a US MBA.',
      },
      {
        q: 'Is an MBA in China taught in English?',
        a: 'Yes — all top MBA programs in China are taught in English. CEIBS, Peking GSM, Tsinghua SEM, Fudan, Antai, and Lingnan are all 100% English-medium. Some lower-tier programs may have partial Chinese instruction in year 2 — check the specific school\'s curriculum.',
      },
      {
        q: 'Do I need GMAT for an MBA in China?',
        a: 'Most top Chinese MBA programs require GMAT (typically 600-700+, with 680+ for the most competitive) or GRE equivalent. However, most programs waive GMAT for applicants with 7+ years of strong work experience, a graduate degree, or exceptional undergraduate record (GPA 3.5+). CEIBS and Antai are the most flexible on waivers.',
      },
      {
        q: 'How long is an MBA in China?',
        a: 'Most MBA programs in China are 2 years full-time, with some 1-year accelerated options at CEIBS and Antai. Part-time/executive MBA options run 2-3 years and are designed for working professionals. International students typically enroll in the full-time 2-year program.',
      },
      {
        q: 'Is an MBA from China recognized globally?',
        a: 'Top Chinese MBA programs (CEIBS, Peking GSM, Tsinghua SEM, Fudan, Antai) are recognized globally — CEIBS is ranked in the Financial Times Global MBA top 5, and Peking/Tsinghua/Fudan are recognized by every multinational employer. AMBA, EQUIS, and AACSB accreditations are held by most top Chinese MBA programs. For immigration purposes (US H-1B, UK skilled worker, Canada CRS), Chinese MBA degrees from top universities qualify for education points.',
      },
      {
        q: 'Can I work while doing an MBA in China?',
        a: 'Under the X1 student visa, you can work ≤20 hours/week on campus with permission. Many MBA students take on research assistant roles, TA positions, or part-time consulting projects through their university. Full-time off-campus work is restricted but possible with prior approval. The MBA program itself typically includes industry projects, internships, and consulting engagements that count as practical work experience.',
      },
      {
        q: 'What are the post-MBA salary outcomes in China?',
        a: 'Top Chinese MBA programs report 80-90% placement within 3 months, with median post-MBA salaries of ¥400,000-800,000/year (USD 56,000-112,000) in China. International graduates often return to their home markets with a 20-50% salary uplift vs pre-MBA. Top sectors: consulting, finance, tech, manufacturing, healthcare. Career outcomes are strongest for graduates who combine the MBA with pre-existing work experience in their target industry.',
      },
    ],
    howToSteps: [
      {
        name: 'Shortlist 3-5 target programs',
        text: 'Use the table on this page to identify 3-5 MBA programs that match your target industry, budget, and career stage. Top picks for international students: CEIBS, Peking GSM, Tsinghua SEM, Fudan, Antai.',
      },
      {
        name: 'Take GMAT/GRE 6 months in advance',
        text: 'GMAT 600-700+ (or GRE equivalent Verbal 155+ / Quant 160+) is the typical requirement. Book your test 6 months before the application deadline. Most programs accept scores up to 5 years old. Allow 2-3 attempts if needed.',
      },
      {
        name: 'Gather work-experience documentation',
        text: 'Most top MBA programs want 3-7 years of progressive work experience. Prepare: resume (1-2 pages, leadership focus), 2-3 recommendation letters (from current/former managers), and proof of employment (offer letters, promotion records).',
      },
      {
        name: 'Write essays + personal statement',
        text: 'Most programs require 2-4 essays: Why MBA, Why China, Career Goals, and one optional/creative essay. Tailor each essay to the specific school — generic essays are immediately obvious. Allow 2-4 weeks of editing time.',
      },
      {
        name: 'Apply for CSC scholarship in parallel',
        text: 'CSC covers MBA tuition + dorm + ¥3,000/month stipend + airfare. Apply via the CSC portal (campuschina.org) by mid-April for September intake. University-specific waivers are automatic.',
      },
      {
        name: 'Submit applications (rolling)',
        text: 'Most top Chinese MBA programs have rolling admissions September-May. Apply 6-9 months in advance. Interview invitations come within 4-6 weeks; decisions within 2-3 weeks after interview.',
      },
      {
        name: 'Prepare for the interview',
        text: 'Most programs require a behavioral + case interview (on-site or video). Behavioral: tell your story, why MBA, why this school, why now. Case: market sizing, business strategy, China-market scenarios. Practice with current students or alumni.',
      },
      {
        name: 'Plan for arrival + visa',
        text: 'Admitted students receive an admission notice + JW202 within 4 weeks. Apply for X1 visa at your local Chinese embassy. Plan to arrive 1-2 weeks before orientation for dorm move-in, banking, residence permit setup.',
      },
    ],
    ctaTitle: 'Ready to apply for an MBA in China?',
    ctaSubtitle:
      'SICA counselors help you shortlist MBA programs, prepare your application package (GMAT/GRE, essays, recommendations), and apply for CSC + university-specific scholarships. Free initial consultation.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/scholarships',
        label: 'Scholarships to study in China',
        description: 'CSC, Confucius, university-specific, and provincial scholarships — what each covers and how to apply.',
      },
      {
        href: '/guides/application',
        label: 'How to apply to Chinese universities',
        description: 'Step-by-step timeline, document checklist, language requirements, application channels, and post-admission steps.',
      },
      {
        href: '/cheapest-universities-china',
        label: 'Cheapest universities in China',
        description: 'Every Chinese university ranked by undergraduate tuition — including dorm + insurance estimates.',
      },
    ],
  },
  zh: {
    slug: 'best-mba-programs-china',
    eyebrow: '指南 · MBA',
    title: '2026 来华留学最好的 MBA 项目',
    description:
      '中国顶尖大学的全英文授课 MBA 项目——学制、学费、奖学金、GMAT/GRE 要求、申请策略。',
    subtitle:
      '中国顶尖大学 1-2 年英文授课 MBA——成本仅为美国 MBA 的五分之一，C9 联盟品牌认可 + 新兴市场校友网络。',
    stats: [
      { value: '¥6-12 万', label: 'MBA 总学费（8,500-17,000 美元）' },
      { value: '1-2 年', label: '学制' },
      { value: '实时', label: '目录 MBA 项目数' },
      { value: '15+', label: '开设英文 MBA 的大学' },
    ],
    quickAnswer:
      '面向国际生的中国顶尖 MBA 项目包括：中欧国际工商学院（CEIBS，上海）、北大光华管理学院、清华经管学院、复旦管理学院、上海交大安泰经济与管理学院，以及中山大学岭南学院。学费 ¥60,000-120,000（约 8,500-17,000 美元），约为美国 MBA 的五分之一。多数项目 1-2 年，全英文授课，接受 GMAT/GRE（部分院校对合格申请者免试）。C9 联盟品牌全球通用，且新兴市场（中国 + 东盟 + 非洲 + 拉美）校友网络是咨询、金融、科技岗位的差异化优势。建议提前 6-9 个月申请；多数项目滚动录取。',
    keyTakeaways: [
      'CEIBS、北大光华、清华经管、复旦、上海交大安泰是国际生 MBA 的前 5 名共识',
      '学费 ¥60,000-120,000——约为美国 MBA 的五分之一',
      '1-2 年英文授课，GMAT/GRE 必备（部分院校可免）',
      'C9 联盟品牌全球通用 + 新兴市场校友网络',
      'CSC 奖学金可全额资助 MBA——覆盖学费 + 住宿 + ¥3,000/月生活补贴',
      '多数项目接受 3-7 年工作经验；滚动录取 9 月-5 月',
    ],
    sections: [
      {
        id: 'why-mba-china',
        h2: '为什么选择来华攻读 MBA？',
        intro:
          '中国顶尖大学 MBA 给你三件美英 MBA 给不了的东西：五分之一成本的 C9 联盟品牌、深度新兴市场校友网络、世界第二大经济市场的实地接触。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**成本**——总学费 ¥60,000-120,000（8,500-17,000 美元），相比美国顶尖 MBA 100,000-150,000 美元。加上中国 ¥30,000-60,000/年的生活费，仍只是总数的一小部分。',
              '**品牌**——北大光华、清华经管、复旦、上海交大安泰均为 C9 联盟高校。其 MBA 在亚洲及欧美认可度持续上升。',
              '**网络**——中国 MBA 班级平均 30-50% 为国际生（美国 MBA 仅 20-30%），东盟、非洲、拉美国际生占比高。在这些地区做咨询、金融、科技，新兴市场校友网络是关键差异化。',
              '**职业成果**——顶尖中国 MBA 项目毕业 3 个月内就业率 80-90%，中国地区硕士后中位年薪 ¥400,000-800,000（56,000-112,000 美元）。国际生毕业后回国，中国校友资源溢价 20-50%。',
            ],
          },
          {
            type: 'h3',
            text: '需要权衡的方面',
            body:
              '三个诚实权衡：（1）MBA"以中国为锚"——多数案例、师资、就业服务面向中国市场。如要美式 MBA，看合办项目（CEIBS 偏美式师资）；（2）国际网络以新兴市场为主——若要美/欧校友圈，中国不是合适选择；（3）语言：除 CEIBS 外，多数项目第 2 年部分中文授课——需 HSK 4-5 才能充分参与。',
          },
        ],
      },
      {
        id: 'admissions-requirements',
        h2: '申请条件：谁能进',
        intro:
          '中国 MBA 项目看四件事：工作经验、本科 GPA、GMAT/GRE 成绩、英语水平。',
        blocks: [
          {
            type: 'table',
            caption: '中国顶尖 MBA 项目典型申请条件',
            columns: ['项目', '典型要求', '备注'],
            rows: [
              ['工作经验', '3-7 年', '前 5 项目偏好 5+；部分接受 2+'],
              ['本科 GPA', '3.0+ / 4.0', '顶尖项目要求 3.3+；部分接受 2.8+（工作经验强者）'],
              ['GMAT', '600-700+', '顶尖项目要求 680+；部分对合格申请者免试（7+ 工作经验 + 强本科）'],
              ['GRE', '语文 155+，数学 160+', '相当于 GMAT 600-700'],
              ['TOEFL / IELTS', 'TOEFL 90+ / IELTS 6.5+', '本科非英语授课者必备'],
              ['推荐信', '2-3 封', '现/前任经理（MBA 不太看学术推荐）'],
              ['个人陈述 / 文书', '2-4 篇', '为何读 MBA、为何中国、职业目标'],
              ['面试', '必备', '现场或视频；行为 + 案例'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'GMAT 豁免：多数中国顶尖 MBA 项目对 7+ 年工作经验 + GPA 3.5+ 本科 / 或研究生学位的申请者免 GMAT。CEIBS 与安泰在豁免政策上最灵活。',
          },
        ],
      },
      {
        id: 'mba-programs-table',
        h2: 'SICA 目录中所有 MBA 及商科硕士项目',
        intro:
          'SICA 目录中所有英文授课的商科硕士项目。按母大学国内排名升序排列。',
        blocks: [
          {
            type: 'table',
            caption: '中国顶尖大学英文授课 MBA 与商科硕士项目',
            columns: ['项目', '大学', '学位', '学制', '学费', '授课语言'],
            rows: [['（从 SICA 数据库加载中…）', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'CEIBS（中欧国际工商学院）及顶尖大学合办 MBA 接受 GMAT/GRE 或对合格申请者免试。联系 SICA 获取完整名单（含 CEIBS 及合办项目）。',
          },
        ],
      },
      {
        id: 'cost-and-roi',
        h2: '成本与回报：来华 MBA 值不值？',
        intro:
          '顶尖 MBA 来华总成本 ¥90,000-180,000（12,500-25,000 美元）。硕士后中位年薪 ¥400,000-800,000——回收期通常 6-18 个月。',
        blocks: [
          {
            type: 'table',
            caption: '总成本对比：中国 MBA vs 美英 MBA（美元）',
            columns: ['项目', '总学费', '生活费（1-2 年）', '总成本', '回收期'],
            rows: [
              ['中国 MBA（前 5）', '$8,500-17,000', '$8,000-15,000', '$16,500-32,000', '6-18 个月'],
              ['中国 MBA（中等）', '$5,000-12,000', '$5,000-10,000', '$10,000-22,000', '4-12 个月'],
              ['美国 MBA（M7 顶尖）', '$140,000-160,000', '$60,000-90,000', '$200,000-250,000', '36-60 个月'],
              ['英国 MBA（前 5）', '$60,000-90,000', '$40,000-60,000', '$100,000-150,000', '24-40 个月'],
              ['INSEAD / LBS（1 年）', '$80,000-100,000', '$40,000-60,000', '$120,000-160,000', '20-36 个月'],
            ],
          },
          {
            type: 'p',
            text: '实用结论：中国 MBA 在全球 MBA 市场中提供最佳投资回报期——6-18 个月 vs 美英项目 24-60 个月。权衡是地理聚焦（中国 + 新兴市场）vs 全球就业。若你的职业以中国或新兴市场为锚，这是商业教育的最佳 ROI。',
          },
        ],
      },
      {
        id: 'mba-scholarships',
        h2: 'MBA 奖学金：如何为项目筹款',
        intro:
          '三层奖学金可叠加——并行申请所有三种以最大化获得全额资助的机会。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中国政府奖学金（CSC）**——全额资助：学费 + 住宿 + ¥3,000/月生活补贴 + 往返机票。每年约 3,000 个名额；MBA 学生占可观比例。竞争激烈；9 月入学请于 4 月中前申请。',
              '**院校 MBA 奖学金**——CEIBS 优秀奖学金、北大光华卓越奖学金、清华经管冠名奖学金、复旦 MBA Fellowship——通常为顶尖申请者减免 25-100% 学费。随入学申请自动评审。',
              '**企业资助**——许多大型中国企业（尤其科技、金融、制造）资助国际 MBA 学生，条件是毕业后为公司服务 2-3 年。向目标雇主或 SICA 查询当前项目。',
              '**国际奖学金项目**——合办 MBA 项目（CEIBS、安泰-CEIBS）符合部分国际奖学金条件（如 GMAC 基金会、各国领袖项目）。',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国最好的 MBA 是哪个？',
        a: '中欧国际工商学院（CEIBS，上海）是国际 MBA 学生的共识第一——与欧美伙伴合办、英文授课、全球排名顶尖。北京大学光华管理学院、清华经管学院、复旦 MBA、上海交大安泰紧随其后。前五名均全球认可，被跨国雇主普遍接受。',
      },
      {
        q: '中国 MBA 多少钱？',
        a: '前 5 MBA 总学费 ¥60,000-120,000（8,500-17,000 美元）。中等项目 ¥30,000-80,000（4,200-11,000 美元）。1-2 年项目生活费 ¥30,000-60,000/年。全部费用：12,000-32,000 美元——约为美国 MBA 的五分之一。',
      },
      {
        q: '中国 MBA 是英文授课吗？',
        a: '是——中国所有顶尖 MBA 项目均英文授课。CEIBS、北大光华、清华经管、复旦、安泰、岭南均为 100% 英文授课。部分中等项目第 2 年可能有部分中文授课——查询具体院校课程。',
      },
      {
        q: '中国 MBA 需要 GMAT 吗？',
        a: '多数中国顶尖 MBA 项目要求 GMAT（典型 600-700+，最竞争项目 680+）或同等 GRE。但多数项目对 7+ 年工作经验 + 本科 GPA 3.5+ / 研究生学位的申请者免 GMAT。CEIBS 与安泰在豁免政策上最灵活。',
      },
      {
        q: '中国 MBA 学制多长？',
        a: '多数中国 MBA 项目为 2 年全日制，CEIBS 与安泰有 1 年加速选项。在职/高管 MBA 选项 2-3 年，面向在职专业人士。国际生通常报读全日制 2 年项目。',
      },
      {
        q: '中国 MBA 全球认可吗？',
        a: '中国顶尖 MBA 项目（CEIBS、北大光华、清华经管、复旦、安泰）全球认可——CEIBS 排名 Financial Times 全球 MBA 前 5；北大/清华/复旦获所有跨国雇主认可。多数顶尖中国 MBA 项目持有 AMBA、EQUIS、AACSB 认证。就移民而言（中国 H-1B、英国技术工人、加拿大 CRS），顶尖中国大学的 MBA 学位符合教育加分条件。',
      },
      {
        q: '来华读 MBA 可以兼职吗？',
        a: '持 X1 学生签证经学校批准后可做 ≤20 小时/周的校内兼职。许多 MBA 学生承担研究助理、助教或兼职咨询项目。全职校外工作受限但可申请提前批准。MBA 项目本身通常包含行业项目、实习、咨询委约——都算作实际工作经验。',
      },
      {
        q: '中国 MBA 毕业后薪资如何？',
        a: '顶尖中国 MBA 项目报告 3 个月内就业率 80-90%，中国地区硕士后中位年薪 ¥400,000-800,000（56,000-112,000 美元）。国际生毕业后通常回国，薪资较读 MBA 前提升 20-50%。热门行业：咨询、金融、科技、制造、医疗。职业成果对结合 MBA 与目标行业既有工作经验的毕业生最强。',
      },
    ],
    howToSteps: [
      {
        name: '初选 3-5 个目标项目',
        text: '使用本页表格挑选 3-5 个符合目标行业、预算、职业阶段的 MBA 项目。国际生首选：CEIBS、北大光华、清华经管、复旦、安泰。',
      },
      {
        name: '提前 6 个月备考 GMAT/GRE',
        text: 'GMAT 600-700+（或 GRE 语文 155+ / 数学 160+）是典型要求。申请截止前 6 个月报考。多数项目接受 5 年内的成绩。允许 2-3 次尝试。',
      },
      {
        name: '整理工作经验材料',
        text: '多数顶尖 MBA 项目希望 3-7 年递进式工作经验。准备：简历（1-2 页，强调领导力）、2-3 封推荐信（现/前任经理）、在职证明（offer、晋升记录）。',
      },
      {
        name: '撰写文书 + 个人陈述',
        text: '多数项目要求 2-4 篇文书：为何读 MBA、为何中国、职业目标，加 1 篇可选/创意文书。每篇文书针对具体学校定制——通用文书会被立即识破。预留 2-4 周修改时间。',
      },
      {
        name: '并行申请 CSC 奖学金',
        text: 'CSC 覆盖 MBA 学费 + 住宿 + ¥3,000/月生活补贴 + 往返机票。9 月入学请于 4 月中前通过 CSC 系统（campuschina.org）申请。院校学费减免自动评审。',
      },
      {
        name: '提交申请（滚动）',
        text: '多数中国顶尖 MBA 项目 9 月-5 月滚动录取。提前 6-9 个月申请。面试邀请 4-6 周内发出；面试后 2-3 周内出结果。',
      },
      {
        name: '准备面试',
        text: '多数项目要求行为 + 案例面试（现场或视频）。行为面：讲你的故事、为何 MBA、为何这所、为何现在。案例：市场估算、商业策略、中国市场情景。和在校生或校友练习。',
      },
      {
        name: '规划抵华 + 签证',
        text: '录取学生 4 周内收到录取通知书 + JW202。在本国中国大使馆申请 X1 签证。建议开学前 1-2 周到达，完成入住、银行开户、居留许可。',
      },
    ],
    ctaTitle: '准备好申请来华 MBA 了吗？',
    ctaSubtitle:
      'SICA 顾问可帮你筛选 MBA 项目、准备申请材料（GMAT/GRE、文书、推荐信）、申请 CSC 与院校奖学金。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/guides/scholarships',
        label: '中国留学奖学金',
        description: 'CSC、孔子学院、院校、省市奖学金——各自覆盖什么，怎么申请。',
      },
      {
        href: '/guides/application',
        label: '中国大学申请全流程',
        description: '逐步时间线、材料清单、语言要求、申请渠道、录取后步骤。',
      },
      {
        href: '/cheapest-universities-china',
        label: '中国最便宜的大学',
        description: '所有中国大学按本科学费排序——含住宿与保险估算。',
      },
    ],
  },
};
import type { LocalizedGuide } from './types';

/**
 * "PhD in China for International Students" — long-form listicle.
 * Target queries: "phd in china", "fully funded phd china", "phd
 * china international students", "china phd scholarship", "phd
 * supervisor china".
 *
 * Page wrapper filters programs to degree=PhD and groups by
 * discipline, ranked by parent university's domestic ranking. The
 * table injects the live list into the `phd-programs-table` block
 * at render time.
 */
export const phdInChinaGuide: LocalizedGuide = {
  en: {
    slug: 'phd-in-china-international-students',
    eyebrow: 'GUIDE · PhD',
    title: 'PhD in China for International Students — Programs, Funding, and Admissions (2026)',
    description:
      'Fully-funded PhD programs at Chinese universities — research areas, stipend levels, supervisor matching, CSC scholarship, and the 6-9 month application timeline.',
    subtitle:
      'A 3-5 year PhD at a Chinese research university — typically fully-funded (tuition waived + ¥3,000-7,000/month stipend) with English-medium research and direct access to China\'s R&D ecosystem.',
    stats: [
      { value: '¥0', label: 'Typical PhD tuition (waived)' },
      { value: '¥3-7K/mo', label: 'PhD stipend range' },
      { value: '3-5 yrs', label: 'PhD duration' },
      { value: 'LIVE', label: 'PhD programs in catalog' },
    ],
    quickAnswer:
      'PhD programs at Chinese universities are typically fully-funded for international students — tuition waived, dorm provided, monthly stipend of ¥3,000-7,000, plus round-trip airfare and health insurance. Top research universities (C9 League + ~30 strong research universities) offer English-medium PhDs across STEM, social sciences, and humanities. The application is research-proposal-driven: identify 3-5 potential supervisors, email them 6-9 months before the deadline with a 1,500-3,000 word research proposal, and get a supervisor match before admission. Chinese Government Scholarship (CSC) and university-funded positions make this one of the most affordable fully-funded PhD paths globally.',
    keyTakeaways: [
      'Most PhD programs at Chinese research universities are fully-funded (tuition waived + stipend + dorm + airfare)',
      'Stipend ¥3,000-7,000/month depending on program + scholarship tier (CSC, university, supervisor grant)',
      '3-5 years duration (4 typical for STEM, 3-4 for humanities/social sciences)',
      'Application is research-proposal-driven: supervisor matching is the #1 factor',
      'English-medium PhDs available in STEM, business, social sciences, and humanities at top universities',
      'CSC scholarship covers full PhD funding + 1,000+ awards/year for international doctoral students',
    ],
    sections: [
      {
        id: 'why-phd-china',
        h2: 'Why pursue a PhD in China?',
        intro:
          'A PhD from a Chinese research university gives you three things PhDs from Western countries don\'t: direct access to the world\'s second-largest R&D ecosystem, fully-funded packages at top-tier quality, and a 3-5 year window inside the world\'s largest emerging-market network.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Funding** — the standard PhD package at a top Chinese university is fully-funded: tuition waived, on-campus dorm provided, monthly stipend ¥3,000-7,000, health insurance, and (for CSC scholars) round-trip airfare. Compare to US PhDs (which fund but at $30-40K/year stipend for top programs only) or UK PhDs (often self-funded outside STEM).',
              '**Research scale** — China is the world\'s #2 R&D spender (¥3.3 trillion in 2024, ~USD 460B), with strengths in AI, quantum, materials science, biotech, energy, and aerospace. PhD students at top universities get access to national labs, industry partnerships, and equipment budgets that few Western programs can match.',
              '**Career outcomes** — China-trained PhDs work across Chinese tech giants (Huawei, Tencent, Alibaba, ByteDance), multinationals with China R&D (Microsoft Research Asia, IBM China, Google AI China), Chinese universities, and increasingly international academia. The China-network premium is strongest for careers targeting China, ASEAN, Africa, and Belt-and-Road markets.',
              '**English-medium research** — top Chinese universities have shifted to English as the default research language over the past decade. PhD coursework, lab meetings, and dissertation writing are typically all in English, with Chinese language courses available as supplementary support.',
            ],
          },
          {
            type: 'h3',
            text: 'Trade-offs to consider',
            body:
              'Three honest trade-offs: (1) supervisor dependency — your PhD experience is heavily shaped by your supervisor. A great supervisor opens doors; a mismatched one stalls your career for 3-5 years. Vet 3-5 supervisors before committing. (2) Geographic focus — most China PhD careers stay anchored to China or emerging markets. If your goal is a US/European tenure-track position, US PhDs still carry more prestige. (3) Language — research is English, but daily life in China requires HSK 3-4 minimum for full participation in social, administrative, and (most importantly) faculty networking.',
          },
        ],
      },
      {
        id: 'phd-funding',
        h2: 'Fully-funded PhD packages: what you get',
        intro:
          'The standard PhD funding package at a top Chinese research university covers tuition, dorm, stipend, insurance, and airfare. Here is the breakdown — by scholarship tier.',
        blocks: [
          {
            type: 'table',
            caption: 'Standard PhD funding packages at Chinese research universities (USD/year)',
            columns: ['Component', 'CSC scholarship', 'University-funded', 'Supervisor-funded', 'Self-funded'],
            rows: [
              ['Tuition (¥30-50K/yr)', '✓ Waived', '✓ Waived', '✓ Waived', '~ $4,200-7,000'],
              ['On-campus dorm (¥4-12K/yr)', '✓ Provided', '✓ Provided', '✓ Provided', '~ $560-1,700'],
              ['Monthly stipend (¥/month)', '¥3,000 (CSC base)', '¥3,000-5,000', '¥4,000-7,000', 'None'],
              ['Health insurance (¥800/yr)', '✓ Covered', '✓ Covered', '✓ Covered', '~ $115'],
              ['Settlement allowance (one-time)', '¥1,500-3,000', 'Varies', 'Varies', 'None'],
              ['Round-trip airfare', '✓ Provided', '✗ Rare', '✗ Rare', 'Self-paid'],
              ['Annual conference travel', 'Application-based', 'Application-based', 'Often included', 'Self-paid'],
              ['Annual total value (USD)', '$8,000-12,000', '$6,000-9,000', '$9,000-13,000', '$5,000-9,000 out of pocket'],
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Stacking is common: top PhD applicants often receive CSC + university top-up + supervisor grant, taking their total monthly stipend to ¥5,000-7,000+ — competitive with Western PhD stipends, plus full tuition/dorm coverage.',
          },
        ],
      },
      {
        id: 'supervisor-matching',
        h2: 'Supervisor matching: the #1 PhD admission factor',
        intro:
          'Unlike bachelor\'s or master\'s programs where you apply to the department, PhD admission in China is driven by supervisor matching. A supervisor who wants you will fight for your admission, your funding, and (often) your scholarship. Apply without a supervisor match = auto-reject at most top universities.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Build a longlist of potential supervisors (3-9 months before deadline)** — Search each university\'s faculty page for PhD supervisors in your target research area. Read their last 3-5 papers to understand their current research direction. Filter by: research area match, publication output (h-index, top-venue papers), funding level (do they have active grants?), and lab size (2-8 students is typically best for mentoring quality).',
              '**Email 5-10 supervisors with a tailored pitch (6 months before)** — Send a 400-600 word email: (1) one paragraph introducing your background, (2) 2-3 sentences on why their research specifically interests you (cite a paper!), (3) a short research-proposal sketch (200-300 words), (4) CV attached. Generic emails are auto-declined; emails that reference a specific paper or research direction get replies.',
              '**Iterate based on supervisor responses (4-5 months before)** — Most supervisors reply within 2-3 weeks. If 1-2 supervisors express interest, schedule a 30-minute video call to discuss the proposal in depth. If interest is lukewarm, ask for feedback and iterate. If no replies after 3 weeks, email 5-10 more supervisors.',
              '**Get a provisional supervisor match (3-4 months before deadline)** — Once a supervisor confirms they will supervise you and "accept you into their lab pending admission", you submit your PhD application with that supervisor as the named PI. Most top universities require this supervisor pre-match before the application is reviewed.',
              '**Submit the formal application (per deadline)** — Application package: research proposal (1,500-3,000 words finalized with supervisor input), master\'s transcript, 3 academic recommendation letters, CV with publications, language test (IELTS 6.5+ / TOEFL 90+). For CSC, parallel application via campuschina.org.',
              '**Pass the interview (2-4 weeks after submission)** — Most PhD programs require a 30-60 minute research interview: present your proposal (15-20 min) + Q&A. Interviewers include the supervisor + 2-3 faculty from the department. Strong proposal + supervisor support = typical admit.',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Never apply to a Chinese PhD program without a confirmed supervisor. The admission committee typically defers to the supervisor\'s recommendation — no match, no admission, regardless of paper credentials.',
          },
        ],
      },
      {
        id: 'phd-programs-table',
        h2: 'All PhD programs in the SICA catalog',
        intro:
          'Every PhD program taught in English at Chinese universities in the SICA catalog. Grouped by discipline and sorted by parent university\'s domestic ranking, lowest (= best) first.',
        blocks: [
          {
            type: 'table',
            caption: 'English-medium PhD programs at top Chinese universities',
            columns: ['Program', 'University', 'Discipline', 'Duration', 'Tuition', 'Language'],
            rows: [['(loading from SICA database…)', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'PhD programs at C9 League universities (Tsinghua, Peking, Fudan, Shanghai Jiao Tong, USTC, Zhejiang, Nanjing, Harbin Institute of Technology, Xi\'an Jiaotong) and ~30 strong research universities are typically fully-funded with monthly stipend, dorm, and airfare included. Talk to SICA for matching supervisors + CSC application strategy.',
          },
        ],
      },
      {
        id: 'phd-scholarships',
        h2: 'PhD scholarships: how to fund your doctorate',
        intro:
          'Three scholarship layers cover most PhD funding needs. Apply for all three in parallel to maximize your funding package and lock in a fully-funded seat.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese Government Scholarship (CSC) PhD program** — fully-funded PhD: tuition waived + ¥3,000/month stipend + dorm + airfare + insurance. ~1,000 awards per year for international PhD students across all Chinese universities. Apply 9-12 months before the start date via campuschina.org or through your target university\'s international student office.',
              '**University-funded PhD positions** — most research universities fund 30-60% of international PhD students through their own scholarships (e.g., Tsinghua University Doctoral Fellowship, Peking University Chancellor\'s Scholarship, Zhejiang University PhD Fellowship). ¥3,000-5,000/month stipend + full tuition waiver + dorm. Application is automatic when you apply for admission — no separate form.',
              '**Supervisor research-grant positions** — many PIs fund PhD students directly from their research grants (national key R&D projects, NSFC grants, industry partnerships). These are the best-funded positions (¥4,000-7,000/month + bonus for top journals). Secured by emailing the supervisor directly and being a strong fit for their active research projects.',
              '**External international scholarships** — PhD students at Chinese universities qualify for external scholarships from their home countries (e.g., Fulbright, Commonwealth, DAAD) and from international foundations (e.g., Gates, Rotary). Can be stacked with CSC or university funding, but most award a PhD supplement rather than the full package.',
            ],
          },
        ],
      },
      {
        id: 'phd-timeline',
        h2: 'PhD application timeline: 9-12 months before start',
        intro:
          'PhD applications are far more time-intensive than bachelor\'s or master\'s because of supervisor matching and research proposal development. Plan 9-12 months ahead for September intake; 12-18 months for top-5 universities.',
        blocks: [
          {
            type: 'table',
            caption: 'PhD application timeline by month before deadline',
            columns: ['Months out', 'Action', 'Outcome'],
            rows: [
              ['12-9 months', 'Build longlist of 10-15 potential supervisors', 'Database of emails + research areas'],
              ['9-6 months', 'Email 5-10 supervisors with tailored pitch', '2-4 replies; 1-3 video calls'],
              ['6-4 months', 'Iterate on research proposal with interested supervisor', 'Confirmed supervisor pre-match'],
              ['4-2 months', 'Finalize proposal; gather transcripts, refs, CV, language test', 'Complete application package'],
              ['2-0 months', 'Submit PhD application + parallel CSC scholarship', 'Application under review'],
              ['0-1 month', 'PhD interview (research presentation + Q&A)', 'Decision within 2-4 weeks'],
              ['1-3 months', 'Receive admission + funding package', 'X1 visa application'],
              ['3-6 months', 'Arrive in China, settle in, start research', 'PhD program begins'],
            ],
          },
          {
            type: 'p',
            text: 'Practical advice: PhD applications are research-proposal-heavy and labor-intensive. Start 9-12 months before the deadline for the smoothest path. Apply to 3-5 PhD programs in parallel (with different supervisors) — most successful PhD applicants have 2-3 admit offers to choose between.',
          },
        ],
      },
      {
        id: 'career-after-phd',
        h2: 'Career outcomes after a PhD in China',
        intro:
          'A PhD from a top Chinese research university opens three career paths: Chinese academia, multinational R&D labs in China, and international academic/industry positions. The China-network premium is strongest for the first two; the third is achievable but requires deliberate effort to build non-China connections during your PhD.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese academia** — Postdoc at a Chinese university (¥200-400K/year) → associate professor track. Tenure-track positions at top Chinese universities are increasingly competitive but plentiful at the 30+ "Double First-Class" universities. Strongest path for staying in China long-term.',
              '**Multinational R&D in China** — Microsoft Research Asia, IBM China Research Lab, Google AI China, Intel Labs China, plus Chinese tech giants (Huawei, Tencent, Alibaba, ByteDance, Baidu) hire PhDs heavily. Salary range ¥500K-1.5M/year depending on company and seniority. The strongest path for industry careers in China.',
              '**International academia** — University faculty positions in the US, UK, EU, Singapore, Hong Kong. Doable but requires deliberate publication strategy (top-tier journals/conferences), international conference attendance, and active networking with non-China labs during your PhD. China PhDs are increasingly recognized in international academia, especially in STEM.',
              '**Industry R&D globally** — PhDs from top Chinese universities (especially Tsinghua, Peking, USTC, Zhejiang) are hired by R&D labs in the US, Europe, Singapore, and Japan. Strong publications + recommendation letters are the deciding factors.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Most PhD graduates from top Chinese universities stay in China for their first job (industry or academia). International moves are easier after 1-2 years of post-PhD experience + a strong publication record than immediately after graduation.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is a PhD in China fully funded?',
        a: 'Yes, for most PhD students at top research universities. The standard funding package covers tuition waiver, on-campus dorm, monthly stipend (¥3,000-7,000), health insurance, and (for CSC scholars) round-trip airfare. Total package value is roughly $8,000-13,000 USD/year — comparable to or better than many Western PhD stipends.',
      },
      {
        q: 'How long is a PhD in China?',
        a: 'PhD programs at Chinese universities are 3-5 years. STEM PhDs typically run 4 years (some 3-year accelerated options). Humanities and social sciences PhDs run 3-4 years. PhDs with industry partnerships or joint-venture structures can extend to 5 years. The dissertation defense usually happens in year 3.5-4 for STEM.',
      },
      {
        q: 'Do I need publications to apply for a PhD in China?',
        a: 'Publications are preferred but not required at the application stage. Most PhD programs admit students with research potential (master\'s thesis + research proposal), not publication record. However, publications during your PhD are expected for graduation — most Chinese PhD programs require 1-2 publications in peer-reviewed venues before dissertation defense.',
      },
      {
        q: 'Can I work during my PhD in China?',
        a: 'PhD students at Chinese universities are typically funded (stipend) and considered part-time research staff (RA or TA roles). Off-campus work is restricted but possible with university permission. Many PhD students do consulting or industry research projects through their supervisor — these typically fall under the funding umbrella and don\'t require separate permission.',
      },
      {
        q: 'Is English the language of instruction for PhDs in China?',
        a: 'Yes — most PhD programs at top Chinese universities are taught and researched in English, especially STEM and business. Humanities and social sciences PhDs often have a Chinese language requirement (HSK 4-5 by year 2-3), but research and dissertation writing can typically be in English. Daily life in China benefits from HSK 3-4 for full social and administrative participation.',
      },
      {
        q: 'How competitive is the CSC scholarship for PhD students?',
        a: 'CSC PhD scholarships are competitive — roughly 1,000-1,500 awards per year across all Chinese universities and disciplines. Acceptance rate varies by destination university: top-5 universities have ~10-20% acceptance; mid-tier research universities have ~30-50%. A strong supervisor pre-match + research proposal + academic record typically yields 1-2 admits + CSC funding.',
      },
      {
        q: 'What\'s the difference between CSC PhD scholarship and university-funded PhD?',
        a: 'CSC PhD scholarship is funded by the Chinese government via the China Scholarship Council and is portable — you can take it to any participating Chinese university. University-funded PhDs are funded by the host university\'s own scholarship budget. Stipend levels are similar (¥3,000-5,000/month), but CSC adds airfare and a settlement allowance. Some students get both, with CSC as the base + university top-up.',
      },
      {
        q: 'Can I transfer credits from my home country PhD to a Chinese PhD?',
        a: 'Credit transfer is uncommon at the PhD level. PhDs are research-degree programs — what transfers is research experience and publications, not coursework credits. Most PhD applicants with prior research experience (master\'s thesis + publications) can apply for advanced standing, potentially shortening the PhD by 6-12 months. This is negotiated with the supervisor after admission.',
      },
    ],
    howToSteps: [
      {
        name: 'Identify your target research area',
        text: 'Define a 2-3 sentence research interest statement: field (e.g., AI, biotech, materials), specific subfield (e.g., reinforcement learning, CRISPR, perovskite solar cells), and preferred methodology (experimental, computational, theoretical). This becomes the filter for supervisor matching.',
      },
      {
        name: 'Build a longlist of 10-15 potential supervisors',
        text: 'Search each top Chinese university\'s faculty page for professors in your research area. Read their last 3-5 papers. Filter by: research area match, publication output (h-index, top-venue papers), current funding, lab size. Build a spreadsheet with: name, university, email, 1-sentence research summary, 2-3 most relevant papers.',
      },
      {
        name: 'Email 5-10 supervisors with a tailored pitch (9-6 months before deadline)',
        text: 'Send a 400-600 word email: (1) one paragraph introducing your background + research experience, (2) 2-3 sentences on why their research specifically interests you (cite a recent paper), (3) a short research-proposal sketch (200-300 words), (4) CV attached. Generic emails get ignored; specific pitches get replies.',
      },
      {
        name: 'Iterate on the research proposal with interested supervisors',
        text: 'For supervisors who reply with interest, schedule a 30-minute video call to discuss the proposal. After the call, refine the proposal based on their feedback. A strong proposal is 1,500-3,000 words with: research question, literature review, methodology, expected contributions, timeline.',
      },
      {
        name: 'Get a confirmed supervisor pre-match (4 months before deadline)',
        text: 'Once a supervisor agrees to supervise you pending admission, you have your pre-match. This is required for most top Chinese PhD programs. Apply only to programs where you have a supervisor pre-match — no-match applications are typically auto-rejected.',
      },
      {
        name: 'Prepare the application package',
        text: 'Master\'s transcript (notarized English translation), 3 academic recommendation letters (research supervisors), CV with publications (even unpublished work), language test (IELTS 6.5+ / TOEFL 90+), the 1,500-3,000 word research proposal finalized with supervisor input, copy of passport.',
      },
      {
        name: 'Submit PhD application + apply for CSC in parallel',
        text: 'Most Chinese universities have application portals opening 6-8 months before intake. Submit 4-6 weeks before the deadline. For CSC, apply separately via campuschina.org (Chinese universities) or via your home country\'s Chinese embassy. CSC deadlines are typically 4 months before intake.',
      },
      {
        name: 'Pass the research interview + receive admission',
        text: 'Most PhD programs require a 30-60 minute interview: 15-20 minute research presentation + Q&A. Strong presentation + supervisor support typically yields an admit within 2-4 weeks. Confirm admission + funding package, then apply for X1 visa and plan arrival.',
      },
    ],
    ctaTitle: 'Ready to pursue a PhD in China?',
    ctaSubtitle:
      'SICA counselors help you identify target supervisors, draft a competitive research proposal, apply for CSC + university-funded PhD positions, and navigate the application timeline. Free initial consultation.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/chinese-government-scholarship-csc',
        label: 'Chinese Government Scholarship (CSC)',
        description: 'The CSC fully funds PhDs — tuition + stipend + dorm + airfare. Eligibility, deadlines, application channels.',
      },
      {
        href: '/best-universities-china',
        label: 'Best universities in China',
        description: 'Every Chinese university ranked by domestic ranking + QS World — the canonical 2026 ranking.',
      },
      {
        href: '/guides/scholarships',
        label: 'Scholarships to study in China',
        description: 'CSC, Confucius, university-specific, and provincial scholarships — what each covers and how to apply.',
      },
    ],
  },
  zh: {
    slug: 'phd-in-china-international-students',
    eyebrow: '指南 · 博士',
    title: '2026 来华攻读博士（国际生）—— 项目、奖学金与申请',
    description:
      '中国大学全额资助博士项目——研究方向、津贴水平、导师匹配、CSC 奖学金、6-9 个月申请时间线。',
    subtitle:
      '中国研究型大学 3-5 年博士——通常全额资助（学费全免 + ¥3,000-7,000/月津贴），英文研究，直接进入中国研发生态。',
    stats: [
      { value: '¥0', label: '博士学费（通常全免）' },
      { value: '¥3-7K/月', label: '博士津贴范围' },
      { value: '3-5 年', label: '博士学制' },
      { value: '实时', label: '目录博士项目数' },
    ],
    quickAnswer:
      '中国大学博士项目对国际生通常全额资助——学费全免、住宿提供、月津贴 ¥3,000-7,000、含往返机票与医疗保险。顶尖研究型大学（C9 联盟 + 约 30 所强研究型高校）在 STEM、社科、人文各领域提供英文授课博士。申请以研究计划为驱动：在截止日前 6-9 个月联系 3-5 位潜在导师，提交 1,500-3,000 字研究计划，并在申请前获得导师预匹配。中国政府奖学金（CSC）与院校资助型博士名额使此路径成为全球最具性价比的全额资助博士路径之一。',
    keyTakeaways: [
      '中国研究型大学多数博士项目全额资助（学费免 + 津贴 + 住宿 + 机票）',
      '津贴 ¥3,000-7,000/月（视项目 + 奖学金层级：CSC、院校、导师资助）',
      '学制 3-5 年（STEM 通常 4 年，人文社科 3-4 年）',
      '申请以研究计划为主线：导师匹配是首要因素',
      '顶尖大学提供 STEM、商科、社科、人文英文授课博士',
      'CSC 奖学金覆盖全额博士资助 + 每年 1,000+ 国际博士生名额',
    ],
    sections: [
      {
        id: 'why-phd-china',
        h2: '为什么来华攻读博士？',
        intro:
          '中国研究型大学的博士给你三件西方博士给不了的东西：直接进入世界第二大研发生态的通道、全额资助的顶尖项目质量、3-5 年身处全球最大新兴市场网络的窗口。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**资助**——顶尖中国大学的标准博士包为全额资助：学费全免、校内住宿提供、月津贴 ¥3,000-7,000、医疗保险、（CSC 学者）含往返机票。比较美国博士（资助但顶尖项目仅 $30-40K/年津贴）或英国博士（STEM 之外通常自费）。',
              '**研究规模**——中国是世界第二大研发投入国（2024 年 ¥3.3 万亿，约 4,600 亿美元），在 AI、量子、材料科学、生物科技、能源、航空航天领域领先。顶尖大学的博士生可使用国家重点实验室、行业合作伙伴关系，设备预算远超多数西方项目。',
              '**职业成果**——中国培养的博士就职于中国科技巨头（华为、腾讯、阿里巴巴、字节跳动）、驻华跨国研发（微软亚洲研究院、IBM 中国、谷歌 AI 中国）、中国高校、国际学术界。围绕中国、东盟、非洲与一带一路市场的职业，中国校友资源溢价值最强。',
              '**英文研究**——过去十年顶尖中国大学已转向以英文为默认研究语言。博士课程、实验室组会、论文写作通常均为英文。中文课程作为辅助支持。',
            ],
          },
          {
            type: 'h3',
            text: '需要权衡的方面',
            body:
              '三个诚实权衡：（1）导师依赖——博士经历很大程度上由导师塑造。好的导师打开大门；不匹配的导师会卡你职业 3-5 年。签约前要审 3-5 位导师；（2）地域重心——多数中国博士职业仍锚定中国或新兴市场。若要欧美终身教职，美国博士仍具更高声望；（3）语言——研究为英文，但在中国日常生活需至少 HSK 3-4 才能充分参与社交、办事，尤其是教师人脉。',
          },
        ],
      },
      {
        id: 'phd-funding',
        h2: '全额资助博士包：你将获得什么',
        intro:
          '顶尖中国研究型大学的标准博士资助包覆盖学费、住宿、津贴、保险与机票。下面按奖学金层级拆分。',
        blocks: [
          {
            type: 'table',
            caption: '中国研究型大学标准博士资助包（美元/年）',
            columns: ['项目', 'CSC 奖学金', '院校资助', '导师资助', '自费'],
            rows: [
              ['学费（¥30-50K/年）', '✓ 全免', '✓ 全免', '✓ 全免', '约 $4,200-7,000'],
              ['校内住宿（¥4-12K/年）', '✓ 提供', '✓ 提供', '✓ 提供', '约 $560-1,700'],
              ['月津贴（¥/月）', '¥3,000（CSC 基础）', '¥3,000-5,000', '¥4,000-7,000', '无'],
              ['医疗保险（¥800/年）', '✓ 覆盖', '✓ 覆盖', '✓ 覆盖', '约 $115'],
              ['安置费（一次性）', '¥1,500-3,000', '视情况', '视情况', '无'],
              ['往返机票', '✓ 提供', '✗ 罕见', '✗ 罕见', '自费'],
              ['年度学术会议差旅', '依申请', '依申请', '通常含', '自费'],
              ['年总价值（美元）', '$8,000-12,000', '$6,000-9,000', '$9,000-13,000', '$5,000-9,000 自付'],
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '叠加很常见：顶尖博士申请者常拿到 CSC + 院校追加 + 导师资助，使月津贴合计达 ¥5,000-7,000+——与西方博士津贴持平，并含学费与住宿全免。',
          },
        ],
      },
      {
        id: 'supervisor-matching',
        h2: '导师匹配：博士录取首要因素',
        intro:
          '不同于本科或硕士（按系招生），中国博士录取由导师匹配驱动。导师要你，会为你的录取、资助、奖学金去争。无导师匹配申请 = 多数顶尖大学自动拒。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**建立潜在导师长名单（截止日前 9-12 个月）**——搜索每所大学教师页面找你研究方向的博士导师。读他们最近 3-5 篇论文了解当前研究方向。筛选维度：研究方向匹配、论文产出（h-index、顶刊论文）、资助水平（有无在研项目）、实验室规模（2-8 名学生通常最佳，导学质量最优）。',
              '**邮件联系 5-10 位导师，附量身定制 pitch（截止日前 6-9 个月）**——400-600 字邮件：（1）一段介绍你的背景；（2）2-3 句说明你为何对他们研究感兴趣（引用一篇论文！）；（3）简短的研究计划提纲（200-300 字）；（4）附简历。通用邮件会被自动忽略；引用具体论文的邮件会得到回复。',
              '**根据导师反馈迭代（截止日前 4-5 个月）**——多数导师 2-3 周内回复。若 1-2 位表达兴趣，安排 30 分钟视频会议深入讨论。若兴趣一般，征求反馈并迭代。若 3 周后无回复，再联系 5-10 位。',
              '**获得临时导师匹配（截止日前 3-4 个月）**——一旦导师确认"愿意指导你并预录取你进入实验室"，申请时将其署名为导师。多数顶尖大学要求此导师预匹配后才评审申请。',
              '**提交正式申请（按截止日）**——申请材料：研究计划（与导师合作完成的 1,500-3,000 字终稿）、硕士成绩单、3 封学术推荐信、含发表的简历、语言成绩（雅思 6.5+ / 托福 90+）。CSC 通过 campuschina.org 平行申请。',
              '**通过面试（提交后 2-4 周）**——多数博士项目要求 30-60 分钟研究面试：15-20 分钟展示研究计划 + Q&A。面试官包括导师与 2-3 名系内教师。强计划 + 导师支持 = 典型录取。',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '绝不在没有确认导师的情况下申请中国博士项目。录取委员会通常尊重导师推荐——无匹配，无论论文背景如何，均不予录取。',
          },
        ],
      },
      {
        id: 'phd-programs-table',
        h2: 'SICA 目录中所有博士项目',
        intro:
          'SICA 目录中所有英文授课的中国大学博士项目。按学科分组，按母大学国内排名升序排列。',
        blocks: [
          {
            type: 'table',
            caption: '中国顶尖大学英文授课博士项目',
            columns: ['项目', '大学', '学科', '学制', '学费', '授课语言'],
            rows: [['(从 SICA 数据库加载中…)', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'C9 联盟（清华、北大、复旦、上海交大、中科大、浙江大学、南大、哈工大、西安交大）及约 30 所强研究型大学的博士项目通常全额资助，含月津贴、住宿、机票。联系 SICA 匹配导师 + 制定 CSC 申请策略。',
          },
        ],
      },
      {
        id: 'phd-scholarships',
        h2: '博士奖学金：如何筹款',
        intro:
          '三种奖学金覆盖多数博士资助需求。并行申请以最大化资助包，确定全额资助位置。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中国政府奖学金（CSC）博士项目**——全额资助博士：学费免 + ¥3,000/月津贴 + 住宿 + 机票 + 保险。每年约 1,000 个名额给国际博士，覆盖中国所有大学。在开学前 9-12 个月通过 campuschina.org 或目标学校国际学生办公室申请。',
              '**院校资助博士岗位**——多数研究型大学资助 30-60% 国际博士生，来自其自有奖学金（如清华大学博士奖学金、北大校长奖学金、浙大博士奖学金）。月津贴 ¥3,000-5,000 + 学费全免 + 住宿。随入学申请自动评审——无需单独表格。',
              '**导师研究项目资助岗位**——许多 PI 直接用科研经费资助博士生（国家重点研发计划、NSFC 项目、企业合作）。这是最丰厚的位置（¥4,000-7,000/月 + 顶刊奖金）。通过邮件直接联系导师 + 强烈契合他们在研项目获得。',
              '**外部国际奖学金**——在中国大学读博可申请本国奖学金（如 Fulbright、Commonwealth、DAAD）与国际基金会（如盖茨、扶轮）。可与 CSC 或院校资助叠加，但多数作为博士补充而非全额资助。',
            ],
          },
        ],
      },
      {
        id: 'phd-timeline',
        h2: '博士申请时间线：开学前 9-12 个月',
        intro:
          '博士申请远比本科/硕士耗时，因导师匹配与研究计划开发。9 月入学请计划提前 9-12 个月；前 5 大学请提前 12-18 个月。',
        blocks: [
          {
            type: 'table',
            caption: '博士申请月度时间线',
            columns: ['提前月数', '动作', '成果'],
            rows: [
              ['12-9 个月', '建立 10-15 位潜在导师长名单', '邮件 + 研究方向数据库'],
              ['9-6 个月', '邮件联系 5-10 位导师，附量身定制 pitch', '2-4 封回复；1-3 次视频'],
              ['6-4 个月', '与感兴趣导师迭代研究计划', '确认导师预匹配'],
              ['4-2 个月', '定稿计划；收集成绩单、推荐信、简历、语言成绩', '完整申请包'],
              ['2-0 个月', '提交博士申请 + 平行申请 CSC 奖学金', '申请审核中'],
              ['0-1 个月', '博士面试（研究展示 + Q&A）', '2-4 周内出结果'],
              ['1-3 个月', '收到录取 + 资助包', '申请 X1 签证'],
              ['3-6 个月', '抵华、安顿、开始研究', '博士项目开课'],
            ],
          },
          {
            type: 'p',
            text: '实用建议：博士申请重研究计划且劳动密集。建议截止日前 9-12 个月开始。同时申请 3-5 个博士项目（配合不同导师）——多数成功博士申请者有 2-3 份录取可选。',
          },
        ],
      },
      {
        id: 'career-after-phd',
        h2: '博士毕业后的职业路径',
        intro:
          '顶尖中国研究型大学的博士打开三条职业路径：中国学术界、驻华跨国研发实验室、国际学术/产业岗位。中国校友资源溢价值对前两条最强；第三条可达，但需博士期间刻意建立非华人脉。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中国学术界**——中国大学博后（¥20-40 万/年）→ 副教授轨道。30+ "双一流"大学的终身教职竞争激烈但充足。在中国长期发展最强路径。',
              '**跨国研发驻华**——微软亚研院、IBM 中国研究院、谷歌 AI 中国、英特尔中国实验室，以及中国科技巨头（华为、腾讯、阿里、字节、百度）大量招聘博士。年薪 ¥50-150 万视公司与资历。在中国工业界最强路径。',
              '**国际学术界**——美、英、欧盟、新加坡、香港的大学教职。可达但需刻意出版策略（顶刊/顶会）、国际会议出席、博士期间与海外实验室积极合作。中国博士在国际学术界认知度持续提升，尤其 STEM。',
              '**全球产业研发**——顶尖中国大学博士（尤其清华、北大、中科大、浙大）被美、欧、新、日 R&D 实验室招聘。强发表 + 推荐信是决定因素。',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '顶尖中国大学的多数博士毕业生首份工作留在中国（产业或学术）。国际流动在 1-2 年博后经验 + 强发表后比毕业即出国更易。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国博士全额资助吗？',
        a: '是的，顶尖研究型大学的多数博士生全额资助。标准资助包覆盖学费全免、校内住宿、月津贴（¥3,000-7,000）、医疗保险、（CSC 学者）往返机票。总价值约 $8,000-13,000 美元/年——与许多西方博士津贴相当或更优。',
      },
      {
        q: '中国博士学制多长？',
        a: '中国大学博士项目 3-5 年。STEM 博士通常 4 年（少数 3 年加速选项）。人文社科博士 3-4 年。产业合作或合办结构的博士可延至 5 年。STEM 论文答辩通常在第 3.5-4 年。',
      },
      {
        q: '申请中国博士需要发表吗？',
        a: '发表优先但申请阶段非必需。多数博士项目录取看研究潜力（硕士论文 + 研究计划），而非发表记录。但博士期间有发表要求——多数中国博士项目要求答辩前发表 1-2 篇同行评议论文。',
      },
      {
        q: '中国博士期间能兼职吗？',
        a: '中国大学博士通常有资助（津贴）并被视为兼职研究人员（RA 或 TA 角色）。校外工作受限但可经学校批准。许多博士生通过导师做咨询或产业研究项目——这些通常归入资助范围内，无需单独批准。',
      },
      {
        q: '中国博士是英文授课吗？',
        a: '是——顶尖大学的多数博士项目教学与研究为英文，尤其 STEM 与商科。人文社科博士常需中文要求（HSK 4-5，第 2-3 年前），但研究与论文通常可用英文。在中国日常生活受益于 HSK 3-4。',
      },
      {
        q: 'CSC 博士奖学金有多大竞争力？',
        a: 'CSC 博士奖学金有竞争力——每年约 1,000-1,500 个名额面向中国所有大学与学科。录取率随目标大学变化：前 5 大约 10-20%；中档研究型大学约 30-50%。强导师预匹配 + 研究计划 + 学术记录通常带来 1-2 份录取 + CSC 资助。',
      },
      {
        q: 'CSC 博士奖学金与院校资助博士的区别？',
        a: 'CSC 博士奖学金由中国政府通过 CSC 资助，可携带至任何参与的中国大学。院校资助博士由接收大学自有奖学金预算资助。津贴水平相近（¥3,000-5,000/月），但 CSC 含机票与安置费。某些学生两者都拿，CSC 作基础 + 院校追加。',
      },
      {
        q: '我能把本国博士学分转入中国博士吗？',
        a: '博士阶段学分转认不常见。博士是研究学位——能转入的是研究经历与发表，而非课程学分。有研究经历（硕士论文 + 发表）的博士申请人可申请高阶资格，可能将博士缩短 6-12 个月。这在录取后与导师协商。',
      },
    ],
    howToSteps: [
      {
        name: '确定目标研究方向',
        text: '用 2-3 句话定义你的研究兴趣声明：领域（如 AI、生物科技、材料）、具体子方向（如强化学习、CRISPR、钙钛矿太阳能电池）、首选方法（实验、计算、理论）。这是导师匹配的筛选条件。',
      },
      {
        name: '建立 10-15 位潜在导师长名单',
        text: '搜索每所顶尖中国大学的教师页找你研究领域的教授。读他们最近 3-5 篇论文。筛选维度：研究方向匹配、论文产出（h-index、顶刊论文）、在研资助、实验室规模。建表格含：姓名、大学、邮箱、1 句研究方向、2-3 篇最相关论文。',
      },
      {
        name: '邮件 5-10 位导师，附量身定制 pitch（截止日前 9-6 个月）',
        text: '400-600 字邮件：（1）一段介绍你的背景与研究经历；（2）2-3 句说明你为何对他们研究感兴趣（引用一篇近期论文）；（3）简短的研究计划提纲（200-300 字）；（4）附简历。通用邮件被忽略；具体 pitch 会得到回复。',
      },
      {
        name: '与感兴趣导师迭代研究计划',
        text: '对回复表达兴趣的导师，安排 30 分钟视频会议讨论计划。会后根据反馈精修计划。强计划 1,500-3,000 字，含：研究问题、文献综述、方法、预期贡献、时间表。',
      },
      {
        name: '获得确认导师预匹配（截止日前 4 个月）',
        text: '一旦导师同意"预录取你"，即获预匹配。多数顶尖中国博士项目要求。只申请有导师预匹配的项目——无匹配申请通常自动拒绝。',
      },
      {
        name: '准备申请材料',
        text: '硕士成绩单（公证英文翻译）、3 封学术推荐信（研究导师）、含发表的简历（即使未发表工作）、语言成绩（雅思 6.5+ / 托福 90+）、与导师协作完成的 1,500-3,000 字研究计划、护照复印件。',
      },
      {
        name: '提交博士申请 + 平行申请 CSC',
        text: '多数中国大学的申请门户在入学前 6-8 个月开放。截止日前 4-6 周提交。CSC 通过 campuschina.org（中国大学）或本国中国大使馆单独申请。CSC 截止日通常在入学前 4 个月。',
      },
      {
        name: '通过研究面试 + 收到录取',
        text: '多数博士项目要求 30-60 分钟面试：15-20 分钟研究展示 + Q&A。强展示 + 导师支持通常 2-4 周内拿录取。确认录取 + 资助包，然后申请 X1 签证并规划抵达。',
      },
    ],
    ctaTitle: '准备好来华攻读博士了吗？',
    ctaSubtitle:
      'SICA 顾问可帮你识别目标导师、起草有竞争力的研究计划、申请 CSC + 院校资助博士岗位、并规划申请时间线。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/chinese-government-scholarship-csc',
        label: '中国政府奖学金（CSC）',
        description: 'CSC 全额资助博士——学费 + 津贴 + 住宿 + 机票。资格、截止日、申请渠道。',
      },
      {
        href: '/best-universities-china',
        label: '中国最好的大学',
        description: '所有中国大学按国内排名 + QS 世界排名——2026 标准排名表。',
      },
      {
        href: '/guides/scholarships',
        label: '中国留学奖学金',
        description: 'CSC、孔子学院、院校、省市奖学金——各自覆盖什么，怎么申请。',
      },
    ],
  },
};

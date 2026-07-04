import type { LocalizedGuide } from './types';

/**
 * "Best Universities in China for International Students" —
 * long-form guide. Target queries: "best universities china",
 * "top universities china ranking 2026", "china university
 * ranking for international students".
 *
 * Page wrapper fetches the live university list from the DB and
 * injects it into the `best-universities-table` block at render
 * time, sorted ASC by domestic ranking (QS World as tiebreaker).
 */
export const bestUniversitiesGuide: LocalizedGuide = {
  en: {
    slug: 'best-universities-china',
    eyebrow: 'GUIDE · RANKINGS',
    title: 'Best Universities in China for International Students (2026 Ranking)',
    description:
      'Every Chinese university in the SICA catalog ranked by domestic ranking, with QS World Ranking, international student population, and city — the canonical 2026 ranking.',
    subtitle:
      'How to read three independent ranking systems (domestic, QS, ARWU), how to match a university to your goals, and which schools have the strongest English-medium programs.',
    stats: [
      { value: 'QS top 20', label: 'Tsinghua + Peking global rank' },
      { value: '~15', label: 'Chinese universities in QS top 200' },
      { value: 'LIVE', label: 'Universities ranked below' },
      { value: '5K+', label: 'Top intl. student populations' },
    ],
    quickAnswer:
      'For international students, the "best" Chinese university depends on what you are optimizing for: Tsinghua and Peking lead on combined domestic + QS World ranking (both top 20 globally). Fudan, Shanghai Jiao Tong, Zhejiang, and Wuhan are excellent choices for English-medium master\'s programs and have 5,000+ international students each. For bachelor\'s English-medium programs, consider the joint-venture universities: University of Nottingham Ningbo China (UNNC), Xi\'an Jiaotong-Liverpool University (XJTLU), and Wenzhou-Kean. Always check that the university is MOE-listed and (for medicine) WHO-recognized — this page filters only those.',
    keyTakeaways: [
      'Tsinghua + Peking are #1 and #2 by combined domestic + QS World ranking',
      'Fudan, Shanghai Jiao Tong, Zhejiang, Wuhan are best for English-medium master\'s with 5K+ intl students each',
      'Joint-venture universities (UNNC, XJTLU) are the safest picks for full-English-medium bachelor\'s',
      '~15 Chinese universities rank in the QS World top 200 — all accept international students',
      'Domestic ranking drives employer perception in China; QS World drives global CV + immigration points',
      'Top universities waive 50-100% of tuition for outstanding applicants via their own scholarship programs',
    ],
    sections: [
      {
        id: 'how-best-is-decided',
        h2: 'How "best" is decided: three ranking systems',
        intro:
          'Chinese universities are evaluated by three independent ranking systems, and the same school can rank very differently across them. Here is what each one measures.',
        blocks: [
          {
            type: 'table',
            caption: 'Three ranking systems for Chinese universities',
            columns: ['Ranking', 'Publisher', 'Used for', 'Weight on'],
            rows: [
              ['Domestic ranking (CN Rank)', 'Ministry of Education / CUSR consensus', 'Government funding + Chinese employer perception', 'Research output + faculty quality + alumni outcomes'],
              ['QS World University Ranking', 'Quacquarelli Symonds (UK)', 'Global CV + immigration points (most countries)', 'Academic reputation + employer reputation + citations + international faculty/student ratio'],
              ['ARWU (Shanghai Ranking)', 'Shanghai Jiao Tong University', 'Research output + Nobel/Fields affiliations', 'Research output + Nature/SCI publications + highly-cited researchers'],
            ],
          },
          {
            type: 'p',
            text: 'Practical takeaway: if your goal is to work in China after graduation, domestic ranking matters most. If your goal is to use the degree for immigration points or global recognition, QS World matters most. This page ranks by domestic ranking (smallest = best), with QS World surfaced as a secondary column for comparison.',
          },
        ],
      },
      {
        id: 'best-universities-table',
        h2: 'All universities ranked by domestic ranking',
        intro:
          'Every university in the SICA catalog with published ranking data, sorted by best (smallest) domestic ranking first. QS World Ranking is included as a tiebreaker.',
        blocks: [
          {
            type: 'table',
            caption: 'Universities ranked by domestic ranking (best first; QS World as tiebreaker)',
            columns: ['#', 'University', 'City', 'CN rank', 'QS World', 'Intl. students', 'Type'],
            rows: [['(loading from SICA database…)', '—', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Use the live /universities page to filter by city, ranking range, type (public/private), and tags (985/211/DFC). This page gives the canonical overview; the filter page is for shortlisting.',
          },
        ],
      },
      {
        id: 'top-picks-by-goal',
        h2: 'Top picks by goal: engineering, business, medicine',
        intro:
          'Different fields have different top schools. Here is the consensus shortlist for the three highest-demand areas among international students.',
        blocks: [
          {
            type: 'table',
            caption: 'Top Chinese universities by field (international-student focused)',
            columns: ['Field', 'Top tier', 'Strong alternatives', 'Joint-venture options'],
            rows: [
              ['Engineering (CS, EE, Mechanical)', 'Tsinghua, Zhejiang, Shanghai Jiao Tong, Harbin IT, Huazhong', 'USTC, Beihang, Xi\'an Jiaotong, Southeast, Tianjin', 'XJTLU (CS), UNNC (Engineering)'],
              ['Business / MBA / Finance', 'Peking (Guanghua), Tsinghua (SEM), CEIBS, Fudan, Shanghai Jiao Tong (Antai)', 'Renmin (RUC), Zhongshan, Wuhan, Tongji, Shanghai Univ of Finance', 'Antai-CEIBS, UNNC (Finance), XJTLU (Business)'],
              ['Medicine (English MBBS)', 'Fudan, Shanghai Jiao Tong, Zhejiang, Sun Yat-sen', 'Zhengzhou, Yangzhou, Xuzhou Medical, Guangzhou Medical', 'None — joint ventures rarely offer medical degrees'],
              ['Sciences (Physics, Chem, Bio)', 'Peking, Tsinghua, USTC, Fudan, Nanjing', 'Wuhan, Sun Yat-sen, Xiamen, Nankai', 'XJTLU (Applied Sciences)'],
              ['Liberal Arts / Humanities', 'Peking, Fudan, Tsinghua, Nanjing, Sun Yat-sen', 'East China Normal, Wuhan, Zhejiang, Nankai', 'UNNC (Humanities), XJTLU (Liberal Arts)'],
            ],
          },
        ],
      },
      {
        id: 'international-student-factors',
        h2: 'What international students should weight differently',
        intro:
          'Domestic ranking tells you what Chinese employers think. For international students, three other factors often matter more: international student population, English-medium availability, and city tier.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**International student population** — universities with 3,000+ international students (Zhejiang, Xiamen, Wuhan, Fudan, Beijing Normal, etc.) have stronger international student offices, English-speaking counselors, dedicated dorms, halal/kosher/vegetarian cafeteria options, and a more diverse peer group. The table on this page lists intl. student count where available.',
              '**English-medium availability** — all universities in the top 20 offer at least 20-40 English-medium programs at the master\'s level. Bachelor\'s English-medium availability is narrower. The safest bachelor picks are the joint-venture universities: UNNC (University of Nottingham Ningbo China), XJTLU (Xi\'an Jiaotong-Liverpool University), Wenzhou-Kean, UIC (BNU-HKBH United International College).',
              '**City tier** — top universities cluster in Beijing (Peking, Tsinghua, Renmin, BNU), Shanghai (Fudan, SJTU, Tongji, ECNU), and Hangzhou (Zhejiang). These are also the most expensive cities to live in. If budget is a concern, consider universities in Wuhan, Xi\'an, Changsha, Hefei (USTC) — still top-30 domestic rank, ~40% lower living costs.',
              '**Scholarship depth** — top universities have the largest scholarship pools. Tsinghua (Schwarzman Scholars, full tuition + stipend + airfare), Peking (Yenching Academy, full funding), Fudan (Excellence Fellowship, full tuition), Shanghai Jiao Tong (named awards) all have dedicated international-student funding lines. Smaller cities\' top schools (USTC, Wuhan) also have generous but less famous programs.',
            ],
          },
        ],
      },
      {
        id: 'joint-venture-universities',
        h2: 'Joint-venture universities: the safest pick for English-medium bachelor\'s',
        intro:
          'Four universities in China are operated as joint ventures with top Western institutions. They teach entirely in English, follow the foreign partner\'s curriculum, and grant degrees that are jointly awarded.',
        blocks: [
          {
            type: 'table',
            caption: 'China\'s four top joint-venture universities',
            columns: ['University', 'Location', 'Foreign partner', 'Degree', 'Annual tuition'],
            rows: [
              ['University of Nottingham Ningbo China (UNNC)', 'Ningbo, Zhejiang', 'University of Nottingham (UK)', 'Same as Nottingham UK; joint-awarded', '¥100,000/year'],
              ['Xi\'an Jiaotong-Liverpool University (XJTLU)', 'Suzhou, Jiangsu', 'University of Liverpool (UK)', 'Same as Liverpool UK; joint-awarded', '¥88,000/year'],
              ['Wenzhou-Kean University', 'Wenzhou, Zhejiang', 'Kean University (USA)', 'Same as Kean USA; joint-awarded', '¥68,000/year'],
              ['UIC (BNU-HKBH United International College)', 'Zhuhai, Guangdong', 'Hong Kong Baptist University', 'Same as HKBU; joint-awarded', '¥80,000/year'],
            ],
          },
          {
            type: 'p',
            text: 'Joint-venture tuition looks high (¥68,000-100,000/year vs ¥14,000-45,000 at standard universities), but the total experience is closer to a UK/US undergrad: full English instruction, foreign-faculty professors, smaller class sizes, and a globally-portable degree. They are the safest pick for international students who want zero language friction.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the #1 university in China for international students?',
        a: 'By combined domestic ranking + international student community + English-medium program availability, Tsinghua University and Peking University consistently top the list. Both rank in the QS World top 20 and accept 3,000-4,000 international students per year. For international students specifically (rather than Chinese applicants), Fudan, Shanghai Jiao Tong, Zhejiang, and Wuhan are also excellent picks — all ranked in the QS top 200, all with 5,000+ international students, all with strong English-medium master\'s programs.',
      },
      {
        q: 'How are Chinese universities ranked?',
        a: 'Three independent ranking systems matter: (1) domestic ranking from the Ministry of Education / CUSR (used for government funding + Chinese employer perception); (2) QS World University Ranking (used for global CV + immigration points in many countries); (3) ARWU Shanghai Ranking (used for research output). The same university can rank differently across the three — Tsinghua is #1 domestically, #20 in QS, #22 in ARWU. For international students, we recommend using domestic ranking as the primary signal (since it determines job-market perception in China) and QS as the secondary (since it determines global recognition).',
      },
      {
        q: 'Are the best universities in China taught in English?',
        a: 'Yes — Tsinghua, Peking, Fudan, Shanghai Jiao Tong, Zhejiang, Nanjing, USTC, Wuhan, Sun Yat-sen, and all other QS-top-200 Chinese universities offer at least 20-40 English-medium programs each at the master\'s level. Bachelor\'s English-medium availability is narrower (typically 5-15 programs per top university). For maximum English-medium flexibility at the bachelor\'s level, consider the joint-venture programs: University of Nottingham Ningbo China (UNNC), Xi\'an Jiaotong-Liverpool University (XJTLU), Wenzhou-Kean University, and UIC (Beijing Normal-Hong Kong Baptist).',
      },
      {
        q: 'How much does it cost to attend a top Chinese university?',
        a: 'Bachelor tuition at Tsinghua / Peking / Fudan runs ¥30,000-50,000/year for English-medium programs (Chinese-medium tracks are cheaper, ¥20,000-26,000/year). Master\'s tuition runs ¥30,000-60,000/year for English-medium programs. All-in budget including dorm + insurance + living costs: ¥80,000-130,000/year at Tier 1 universities vs ¥40,000-65,000/year at Tier 2. Apply early — top universities waive 50-100% of tuition for outstanding applicants via their own scholarship programs.',
      },
      {
        q: 'Do top Chinese universities offer scholarships to international students?',
        a: 'Yes, and they are generous. (1) Chinese Government Scholarship (CSC) — covers tuition + dorm + ¥2,500-3,500/month stipend; ~3,000 awards per year across all Chinese universities; Tsinghua/Peking/Fudan get the largest share. (2) University-specific scholarships — Tsinghua\'s Schwarzman Scholars (fully funded 1-year master\'s), Peking\'s Yenching Academy, Fudan\'s Excellence Fellowship, Shanghai Jiao Tong\'s various named awards — typically waive 50-100% of tuition + monthly stipend for top applicants. (3) Confucius Institute Scholarship — for Chinese language and culture programs.',
      },
      {
        q: 'Which Chinese university is best for engineering / business / medicine?',
        a: 'Engineering: Tsinghua, Zhejiang, Shanghai Jiao Tong, Harbin Institute of Technology, Huazhong University of Science and Technology — all in QS top 100 for Engineering. Business: Peking (GSM), Tsinghua (SEM), Fudan, Shanghai Jiao Tong (Antai), CEIBS, Lingnan (Sun Yat-sen) — joint-venture MBAs (CEIBS, Antai) are particularly strong. Medicine (English-medium MBBS): Fudan, Zhengzhou, Yangzhou, Xuzhou Medical — all MOE-listed, all WHO-recognized, all 6-year English tracks.',
      },
      {
        q: 'How hard is it to get into a top Chinese university?',
        a: 'Harder than you might think for the very top schools (Tsinghua, Peking). Acceptance rates for international applicants sit around 10-15% for English-medium programs at top-5 schools. For Fudan / Shanghai Jiao Tong / Zhejiang / Nanjing / Wuhan, acceptance rates are 25-40% — comparable to a strong US public university. Strong academics (GPA 3.5+), English proficiency (IELTS 6.5+ / TOEFL 90+), and a clear statement of purpose are the deciding factors. Apply to 3-5 schools in parallel to maximize your chances.',
      },
      {
        q: 'Do employers recognize degrees from top Chinese universities?',
        a: 'Yes — and increasingly so. C9 League universities (the Chinese Ivy League: Peking, Tsinghua, Fudan, Shanghai Jiao Tong, Zhejiang, USTC, Nanjing, Harbin Institute of Technology, Xi\'an Jiaotong) are recognized by every Fortune 500 employer in Asia. QS-top-200 Chinese universities are widely recognized by multinationals globally. For immigration / further study purposes, Chinese bachelor\'s degrees from MOE-listed universities are accepted in the US, UK, Canada, Australia, EU, Singapore, and most Asian countries for further study and skilled-immigration points.',
      },
    ],
    howToSteps: [
      {
        name: 'Decide your ranking dimension',
        text: 'Pick your primary lens: domestic ranking (best for working in China after graduation), QS World (best for global CV + immigration points), or research output / ARWU (best for academia). This page ranks by domestic ranking first; check the QS World column for the secondary signal.',
      },
      {
        name: 'Shortlist by field, not just by rank',
        text: 'Different fields have different top schools. The table in section 3 ("Top picks by goal") gives you the consensus shortlist for engineering, business, medicine, sciences, and humanities. Shortlist 3-5 universities per field.',
      },
      {
        name: 'Filter by English-medium availability',
        text: 'Visit each university\'s /programs page and filter by "language: English". For master\'s, expect 20-40 English programs per top-20 university. For bachelor\'s, expect 5-15 — or use the joint-venture universities for full English coverage.',
      },
      {
        name: 'Check scholarship depth',
        text: 'Top universities have the largest scholarship pools. Tsinghua (Schwarzman), Peking (Yenching), Fudan (Excellence), Shanghai Jiao Tong (named awards) all run dedicated international-student funding lines. Smaller cities\' top schools (USTC, Wuhan) also have generous but less famous programs.',
      },
      {
        name: 'Apply for CSC scholarship in parallel',
        text: 'CSC covers tuition + dorm + ¥2,500-3,500/month stipend + airfare for ~3,000 international students per year. Apply via the CSC portal (campuschina.org) by mid-April for September intake. Same deadlines as university admissions but a separate system.',
      },
      {
        name: 'Submit applications to 3-5 universities',
        text: 'Most international students apply to 3-5 universities in parallel. Acceptance rates at top-5 schools (Tsinghua, Peking) are 10-15%; at Fudan, SJTU, Zhejiang, Wuhan they\'re 25-40%. Strong academics (GPA 3.5+), English (IELTS 6.5+ / TOEFL 90+), and a clear statement of purpose are the deciding factors.',
      },
      {
        name: 'Consider joint-venture universities for English-medium bachelor\'s',
        text: 'UNNC (Nottingham), XJTLU (Liverpool), Wenzhou-Kean, and UIC (BNU-HKBH) are the safest picks for full English-medium bachelor\'s degrees with globally-portable credentials. Higher tuition (¥68,000-100,000/year) but the experience is closer to a UK/US undergrad.',
      },
      {
        name: 'Plan for city cost differences',
        text: 'Top universities cluster in Tier 1 cities (Beijing, Shanghai, Hangzhou) where living costs are highest. If budget matters, consider Wuhan (Wuhan University, Huazhong UST), Xi\'an (Xi\'an Jiaotong), Hefei (USTC) — still top-30 domestic rank at ~40% lower living costs.',
      },
    ],
    ctaTitle: 'Need help choosing?',
    ctaSubtitle:
      'SICA counselors help you match the right university to your goals, budget, and English/Chinese language level. Free initial consultation.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/mbbs-in-china',
        label: 'MBBS in China for international students',
        description: 'English-medium MBBS programs at MOE-listed universities — the canonical 2026 guide.',
      },
      {
        href: '/cheapest-universities-china',
        label: 'Cheapest universities in China',
        description: 'Every Chinese university ranked by undergraduate tuition — including dorm + insurance estimates.',
      },
      {
        href: '/guides/application',
        label: 'How to apply to Chinese universities',
        description: 'Step-by-step timeline, document checklist, language requirements, application channels, and post-admission steps.',
      },
    ],
  },
  zh: {
    slug: 'best-universities-china',
    eyebrow: '指南 · 排名',
    title: '2026 来华留学最好的大学（排名）',
    description:
      'SICA 目录中所有中国大学按国内排名排序，含 QS 世界排名、国际学生人数、城市——2026 标准排名表。',
    subtitle:
      '如何读懂三套独立排名体系（国内、QS、ARWU），如何根据目标匹配大学，哪些学校的英文授课项目最强。',
    stats: [
      { value: 'QS 前 20', label: '清华 + 北大全球排名' },
      { value: '约 15 所', label: '中国大学进入 QS 前 200' },
      { value: '实时', label: '下方排名大学数' },
      { value: '5K+', label: '顶尖国际生人数' },
    ],
    quickAnswer:
      '对国际生而言，"最好"的中国大学取决于你看重的因素：清华与北大在综合国内 + QS 世界排名上领先（均全球前 20）。复旦、上海交大、浙江大学、武汉大学是英文授课硕士项目 + 5,000+ 国际生人数的优秀选择。若需全英文本科项目，中外合办大学最稳妥：宁波诺丁汉大学（UNNC）、西交利物浦大学（XJTLU）、温州肯恩大学。务必确认学校是教育部认可的、（医学专业）WHO 认证——本页已做此筛选。',
    keyTakeaways: [
      '清华 + 北大在综合国内 + QS 世界排名上位居前二',
      '复旦、上海交大、浙大、武大是英文授课硕士项目 + 5K+ 国际生人数的最佳选择',
      '中外合办大学（UNNC、XJTLU）是全英文授课本科的最稳妥选择',
      '约 15 所中国大学进入 QS 世界前 200——均招收国际生',
      '国内排名决定中国雇主认可度；QS 世界决定全球简历 + 移民加分',
      '顶尖大学通过自有奖学金项目为优秀申请者减免 50-100% 学费',
    ],
    sections: [
      {
        id: 'how-best-is-decided',
        h2: '"最好"的判定：三套排名体系',
        intro:
          '中国大学由三套独立排名体系评价，同一所学校在不同体系下排名可能差异很大。',
        blocks: [
          {
            type: 'table',
            caption: '中国大学三套排名体系',
            columns: ['排名', '发布机构', '用途', '权重'],
            rows: [
              ['国内排名（CN Rank）', '教育部 / CUSR 共识', '政府拨款 + 中国雇主认可', '研究产出 + 师资 + 校友成果'],
              ['QS 世界大学排名', 'Quacquarelli Symonds（英国）', '全球简历 + 移民加分（多数国家）', '学术声誉 + 雇主声誉 + 引用 + 国际师资/学生比例'],
              ['ARWU 上海交大排名', '上海交通大学', '研究产出 + 诺奖/菲尔兹关联', '研究产出 + Nature/SCI 论文 + 高被引学者'],
            ],
          },
          {
            type: 'p',
            text: '实用建议：目标是留在中国工作——国内排名最重要；目标是用于移民加分或全球认可——QS 世界最重要。本页按国内排名排序（数字越小越好），QS 世界作为副列展示便于对比。',
          },
        ],
      },
      {
        id: 'best-universities-table',
        h2: '所有大学按国内排名排序',
        intro:
          'SICA 目录中所有公布了排名数据的大学，按国内排名由小到大排序（数字越小越好）。QS 世界排名作为第二排序键。',
        blocks: [
          {
            type: 'table',
            caption: '按国内排名排序（国内优先，QS 世界为第二键）',
            columns: ['#', '大学', '城市', '国内排名', 'QS 世界', '国际生人数', '类型'],
            rows: [['（从 SICA 数据库加载中…）', '—', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '使用 live /universities 页面按城市、排名区间、类型（公立/私立）、标签（985/211/DFC）筛选。本页提供标准总览；筛选页用于缩选。',
          },
        ],
      },
      {
        id: 'top-picks-by-goal',
        h2: '按目标选顶尖：工科、商科、医学',
        intro:
          '不同学科的顶尖学校不同。下面是国际生关注度最高的三大领域的共识短名单。',
        blocks: [
          {
            type: 'table',
            caption: '中国大学各领域顶尖（聚焦国际生）',
            columns: ['领域', '第一梯队', '强力备选', '中外合办选项'],
            rows: [
              ['工科（CS、电气、机械）', '清华、浙大、上海交大、哈工大、华中科技', '中科大、北航、西安交大、东南、天津', 'XJTLU（CS）、UNNC（工程）'],
              ['商科 / MBA / 金融', '北大光华、清华经管、CEIBS、复旦、上海交大安泰', '人大、中山、武汉、同济、上海财大', '安泰-CEIBS、UNNC（金融）、XJTLU（商科）'],
              ['医学（英文 MBBS）', '复旦、上海交大、浙大、中山大学', '郑州、扬州、徐州医科、广州医科', '无——合办大学极少提供医学学位'],
              ['理科（物理、化学、生物）', '北大、清华、中科大、复旦、南大', '武大、中山、厦大、南开', 'XJTLU（应用科学）'],
              ['文科 / 人文', '北大、复旦、清华、南大、中山', '华东师大、武汉、浙大、南开', 'UNNC（人文）、XJTLU（文科）'],
            ],
          },
        ],
      },
      {
        id: 'international-student-factors',
        h2: '国际生应该额外考虑的三个因素',
        intro:
          '国内排名告诉你中国雇主的想法。对国际生来说，另外三个因素通常更重要：国际学生人数、英文授课可得性、城市层级。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**国际学生人数**——国际生超过 3,000 人的大学（浙大、厦大、武大、复旦、北师大等）通常国际学生办公室更强、辅导员会英文、有专门的国际生宿舍、清真/犹太/素食食堂选项、同伴群体更多元。本页表格列出国际生人数（若有数据）。',
              '**英文授课可得性**——前 20 名大学每所至少提供 20-40 个英文授课硕士项目。本科英文授课可得性更窄。最稳妥的本科选择是中外合办大学：UNNC（宁波诺丁汉）、XJTLU（西交利物浦）、温州肯恩、UIC（北师香港浸大）。',
              '**城市层级**——顶尖大学集中在北京（北大、清华、人大、北师大）、上海（复旦、上海交大、同济、华师大）、杭州（浙大），这些城市生活成本也最高。如预算紧张，考虑武汉（武大、华中科技）、西安（西安交大）、长沙（中南）、合肥（中科大）——国内排名仍在前 30，生活费低约 40%。',
              '**奖学金厚度**——顶尖大学奖学金池最大。清华苏世民学院（全额学费 + 月补贴 + 往返机票）、北大燕京学堂（全额资助）、复旦卓越奖学金（全额学费）、上海交大各类冠名奖学金均设有专门的国际生资助线。二三线城市的顶尖学校（中科大、武大）也有丰厚但知名度较低的项目。',
            ],
          },
        ],
      },
      {
        id: 'joint-venture-universities',
        h2: '中外合办大学：英文授课本科的最稳妥选择',
        intro:
          '中国有 4 所大学作为与西方顶尖机构的合资项目运营。全英文教学，遵循外方合作院校的课程，授予双方共同颁发的学位。',
        blocks: [
          {
            type: 'table',
            caption: '中国 4 所顶尖中外合办大学',
            columns: ['大学', '所在地', '外方合作', '学位', '年学费'],
            rows: [
              ['宁波诺丁汉大学（UNNC）', '宁波，浙江', '英国诺丁汉大学', '与诺丁汉英国本部相同；共同颁发', '¥100,000/年'],
              ['西交利物浦大学（XJTLU）', '苏州，江苏', '英国利物浦大学', '与利物浦英国本部相同；共同颁发', '¥88,000/年'],
              ['温州肯恩大学', '温州，浙江', '美国肯恩大学', '与肯恩美国本部相同；共同颁发', '¥68,000/年'],
              ['UIC（北师香港浸大联合国际学院）', '珠海，广东', '香港浸会大学', '与浸会相同；共同颁发', '¥80,000/年'],
            ],
          },
          {
            type: 'p',
            text: '合办大学学费看似高（¥68,000-100,000/年 vs 普通大学 ¥14,000-45,000），但整体体验更接近英美本科：全英文教学、外籍师资授课、小班教学、全球通用的学位。对希望零语言障碍的国际生是最稳妥的选择。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国最好的大学是哪所？',
        a: '综合国内排名、国际学生社区、英文授课项目可得性，清华大学与北京大学始终位居榜首。两校均位列 QS 世界前 20，每年招收 3,000-4,000 名国际生。专就国际生而言（而非中国考生），复旦、上海交大、浙江大学、武汉大学也是极佳选择——均位列 QS 前 200，国际生均超 5,000 人，英文授课硕士项目实力雄厚。',
      },
      {
        q: '中国大学排名怎么算？',
        a: '三套独立排名体系值得关注：（1）国内排名（教育部 / CUSR 共识），用于政府拨款 + 中国雇主认可；（2）QS 世界大学排名，用于全球简历 + 多个国家移民加分；（3）ARWU 上海交大排名，用于研究产出。同一所大学在不同体系下排名不同——清华国内第 1、QS 第 20、ARWU 第 22。对国际生，建议以国内排名为主信号（决定在中国就业市场的认可度），QS 为副（决定全球认可度）。',
      },
      {
        q: '最好的中国大学是英文授课吗？',
        a: '是——清华、北大、复旦、上海交大、浙大、南大、中科大、武大、中山大学等 QS 前 200 中国大学每所至少提供 20-40 个英文授课硕士项目。本科英文授课可得性更窄（顶尖大学通常 5-15 个）。若本科阶段希望最大英文授课灵活性，可考虑中外合办项目：宁波诺丁汉大学（UNNC）、西交利物浦大学（XJTLU）、温州肯恩大学、北师香港浸大（UIC）。',
      },
      {
        q: '就读中国顶尖大学要多少钱？',
        a: '清华、北大、复旦本科英文授课项目学费 ¥30,000-50,000/年（中文授课项目较便宜，¥20,000-26,000/年）。英文授课硕士 ¥30,000-60,000/年。含住宿 + 保险 + 生活费的合计预算：Tier 1 大学 ¥80,000-130,000/年，Tier 2 ¥40,000-65,000/年。尽早申请——顶尖大学通过自有奖学金项目为优秀申请者减免 50-100% 学费。',
      },
      {
        q: '中国顶尖大学有国际生奖学金吗？',
        a: '有，且非常丰厚。（1）中国政府奖学金（CSC）——覆盖学费 + 住宿 + ¥2,500-3,500/月生活补贴；每年约 3,000 个名额；清华/北大/复旦占比最大。（2）院校奖学金——清华苏世民学者（1 年制全额硕士）、北大燕京学堂、复旦卓越奖学金、上海交大各类冠名奖学金——通常减免 50-100% 学费 + 月度补贴。（3）孔子学院奖学金——针对中文与文化项目。',
      },
      {
        q: '工科 / 商科 / 医学哪个中国大学最好？',
        a: '工科：清华、浙大、上海交大、哈工大、华中科技大学——均位列 QS 工科前 100。商科：北大光华、清华经管、复旦、上海交大安泰、中欧国际工商学院（CEIBS）、中山大学岭南——合办 MBA（CEIBS、安泰）尤为突出。医学（英文授课 MBBS）：复旦、郑州、扬州、徐州医科大学——均教育部认可、WHO 认证、6 年制英文授课。',
      },
      {
        q: '考入中国顶尖大学难吗？',
        a: '前 5 名（清华、北大）比想象中难。国际申请者录取率约 10-15%（英文授课项目）。复旦、上海交大、浙大、南大、武大录取率 25-40%——与美国强公立大学相当。决定因素是优秀学业（GPA 3.5+）、英语水平（雅思 6.5+ / 托福 90+）、清晰的个人陈述。建议同时申请 3-5 所以最大化录取概率。',
      },
      {
        q: '中国顶尖大学学历雇主认可吗？',
        a: '认可，且越来越被认可。C9 联盟大学（中国版常春藤：北大、清华、复旦、上海交大、浙大、中科大、南大、哈工大、西安交大）被亚洲所有财富 500 强雇主认可。QS 前 200 中国大学被全球跨国公司广泛认可。就移民 / 升学而言，教育部认可中国大学的学士学位在美国、英国、加拿大、澳大利亚、欧盟、新加坡及多数亚洲国家都被接受用于深造与技能移民加分。',
      },
    ],
    howToSteps: [
      {
        name: '选定排名维度',
        text: '选择主排名维度：国内排名（最适合留华工作）、QS 世界（最适合全球简历 + 移民加分）、研究产出 / ARWU（最适合学术）。本页按国内排名优先；QS 世界列作为副信号。',
      },
      {
        name: '按学科初选',
        text: '不同学科顶尖学校不同。第 3 节"按目标选顶尖"表格给出工科、商科、医学、理科、文科的共识短名单。每个学科初选 3-5 所大学。',
      },
      {
        name: '按英文授课筛选',
        text: '访问各校 /programs 页面按"语言：English"筛选。硕士阶段预计每所前 20 名大学有 20-40 个英文项目；本科阶段预计 5-15 个——或考虑中外合办大学获得完整英文覆盖。',
      },
      {
        name: '查看奖学金厚度',
        text: '顶尖大学奖学金池最大。清华（苏世民）、北大（燕京）、复旦（卓越）、上海交大（冠名奖学金）均设有专门的国际生资助线。二三线城市的顶尖学校（中科大、武大）也有丰厚但知名度较低的项目。',
      },
      {
        name: '并行申请 CSC 奖学金',
        text: 'CSC 覆盖学费 + 住宿 + ¥2,500-3,500/月生活补贴 + 往返机票，每年约 3,000 个国际生名额。9 月入学请于 4 月中前通过 CSC 系统（campuschina.org）申请。申请时间线与学校类似但走单独系统。',
      },
      {
        name: '同时申请 3-5 所大学',
        text: '多数国际生同时申请 3-5 所大学。前 5 名（清华、北大）录取率 10-15%；复旦、上海交大、浙大、南大、武大录取率 25-40%。决定因素是优秀学业（GPA 3.5+）、英语（雅思 6.5+ / 托福 90+）、清晰的个人陈述。',
      },
      {
        name: '考虑中外合办大学获取英文授课本科',
        text: 'UNNC（诺丁汉）、XJTLU（利物浦）、温州肯恩、UIC（北师香港浸大）是英文授课本科 + 全球通用学位的最稳妥选择。学费较高（¥68,000-100,000/年）但体验更接近英美本科。',
      },
      {
        name: '考虑城市成本差异',
        text: '顶尖大学集中在一线城市（北京、上海、杭州），生活成本也最高。预算紧张时考虑武汉（武大、华中科技）、西安（西安交大）、合肥（中科大）——国内排名仍在前 30，生活费低约 40%。',
      },
    ],
    ctaTitle: '需要帮你选校？',
    ctaSubtitle:
      'SICA 顾问可帮你根据目标、预算、英文/中文水平匹配合适大学。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/mbbs-in-china',
        label: '来华攻读临床医学学士（MBBS）',
        description: '教育部认可大学的英文授课 MBBS 项目——2026 标准指南。',
      },
      {
        href: '/cheapest-universities-china',
        label: '中国最便宜的大学',
        description: '所有中国大学按本科学费排序——含住宿与保险估算。',
      },
      {
        href: '/guides/application',
        label: '中国大学申请全流程',
        description: '逐步时间线、材料清单、语言要求、申请渠道、录取后步骤。',
      },
    ],
  },
};
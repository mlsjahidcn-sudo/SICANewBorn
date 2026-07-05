import type { LocalizedGuide } from './types';

/**
 * "Top Engineering Universities in China for International Students"
 * — long-form guide. Target queries: "engineering universities china",
 * "best engineering programs china", "study engineering in china",
 * "computer science china".
 *
 * Page wrapper filters programs to engineering disciplines and
 * injects the live list into the `engineering-programs-table`
 * block at render time.
 */
export const topEngineeringGuide: LocalizedGuide = {
  en: {
    slug: 'top-engineering-universities-china',
    eyebrow: 'GUIDE · ENGINEERING',
    title: 'Top Engineering Universities in China for International Students (2026)',
    description:
      'Every English-medium Engineering and Computer Science program at top Chinese universities — discipline, duration, tuition, scholarships.',
    subtitle:
      'China produces more engineering graduates than any country in the world — and the top programs are now taught in English, ranked in QS top 100, and 1/5 the cost of US equivalents.',
    stats: [
      { value: 'QS top 100', label: 'Chinese engineering programs' },
      { value: '7 fields', label: 'Engineering disciplines (CS, EE, ME, Civil, ...)' },
      { value: 'LIVE', label: 'Programs in catalog' },
      { value: '50-100%', label: 'Scholarship coverage available' },
    ],
    quickAnswer:
      'Top engineering universities in China for international students are Tsinghua, Zhejiang, Shanghai Jiao Tong, Harbin Institute of Technology, and Huazhong University of Science and Technology — all in the QS Engineering top 100. Engineering is the largest English-medium program category at Chinese universities, with bachelor\'s, master\'s, and PhD tracks in Computer Science, Electrical Engineering, Mechanical Engineering, Civil Engineering, Biomedical Engineering, Chemical Engineering, and Materials Science. Tuition runs ¥20,000-50,000/year for English-medium tracks — about 1/5 of US engineering tuition. CSC and university-specific scholarships cover 50-100% for top applicants. Apply 6-9 months in advance.',
    keyTakeaways: [
      'Tsinghua, Zhejiang, SJTU, HIT, Huazhong are the consensus top-5 engineering universities for international students',
      'Computer Science is the largest English-medium engineering discipline; EE, ME, Civil, Biomedical, Chemical, Materials also widely available',
      'Tuition ¥20,000-50,000/year for English-medium tracks — about 1/5 of US engineering tuition',
      'Master\'s and PhD tracks dominate (most bachelor\'s engineering programs are Chinese-medium)',
      'CSC scholarship can fund engineering fully — covers tuition + dorm + ¥2,500-3,500/month stipend',
      'QS top 100 ranking + tuition affordability = best engineering ROI in the global market',
    ],
    sections: [
      {
        id: 'why-engineering-china',
        h2: 'Why engineering in China?',
        intro:
          'China graduates ~5x more engineers per year than the US, and the top Chinese engineering programs are now globally ranked, taught in English, and cost 1/5 of US equivalents. Here is why serious engineering students choose China.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Scale** — China produces ~1.5 million STEM graduates per year, vs ~300K in the US. The top engineering universities (Tsinghua, Zhejiang, SJTU) have 5,000+ faculty and ~50,000 engineering students each.',
              '**Research intensity** — Tsinghua, Zhejiang, SJTU, Huazhong, and HIT are all in the QS Engineering top 100 globally. Research output (Nature/SCI publications, patents, citations) is on par with top US engineering schools.',
              '**Cost** — English-medium engineering master\'s programs run ¥30,000-60,000/year, bachelor\'s ¥20,000-40,000/year. Total 2-year master\'s: ¥60,000-120,000 (USD 8,500-17,000). US engineering MS: USD 60,000-100,000/year.',
              '**Industry exposure** — Chinese engineering universities partner directly with the country\'s industrial base: Huawei, Alibaba, Tencent, BYD, CATL, CRRC. Master\'s students typically work on industry-funded research projects; bachelor\'s students have internship pipelines into top Chinese tech and manufacturing companies.',
              '**Career outcomes** — top engineering MS graduates place 90%+ within 3 months, with median salaries ¥300,000-600,000/year in China (USD 42,000-84,000). International graduates often leverage the combination of China experience + technical skills for emerging-market engineering careers.',
            ],
          },
        ],
      },
      {
        id: 'top-engineering-fields',
        h2: 'Top engineering fields by demand',
        intro:
          'Engineering in China spans 7+ major disciplines. Here is the international-student demand breakdown for each, and the universities that lead the field.',
        blocks: [
          {
            type: 'table',
            caption: 'Top engineering fields at Chinese universities (international-student demand)',
            columns: ['Field', 'Demand', 'Top universities', 'Avg. tuition (master\'s/year)'],
            rows: [
              ['Computer Science / AI', 'Very high', 'Tsinghua, Zhejiang, SJTU, Nanjing, USTC, Huazhong', '¥30,000-50,000'],
              ['Electrical / Electronic Engineering', 'High', 'Tsinghua, Zhejiang, USTC, Beihang, Xidian', '¥25,000-45,000'],
              ['Mechanical Engineering', 'Medium', 'SJTU, HIT, Tsinghua, Huazhong, Xi\'an Jiaotong', '¥20,000-40,000'],
              ['Civil Engineering / Architecture', 'Medium', 'Tongji, Tsinghua, Harbin, Southeast', '¥20,000-40,000'],
              ['Biomedical Engineering', 'High (growing)', 'SJTU, Tsinghua, Zhejiang, Fudan, SCUT', '¥30,000-50,000'],
              ['Chemical Engineering', 'Medium', 'Tsinghua, Zhejiang, ECUST, Tianjin', '¥20,000-40,000'],
              ['Materials Science', 'Medium', 'Tsinghua, SJTU, USTC, Zhejiang, HIT', '¥25,000-45,000'],
              ['Aerospace / Aeronautical', 'Niche', 'BUAA, Northwestern Polytechnical, Nanjing Aero', '¥25,000-45,000'],
            ],
          },
          {
            type: 'p',
            text: 'Practical takeaway: Computer Science and Electrical Engineering are the highest-demand fields by international-student volume. If you want maximum choice + scholarship opportunities, target CS or EE; if you want a more specialized niche (biomedical, materials, aerospace), competition is lower and funding more generous.',
          },
        ],
      },
      {
        id: 'engineering-programs-table',
        h2: 'All Engineering and Computer Science programs in the SICA catalog',
        intro:
          'Every engineering-focused program taught in English at Chinese universities in the SICA catalog. Sorted by parent university\'s domestic ranking, lowest (= best) first.',
        blocks: [
          {
            type: 'table',
            caption: 'English-medium Engineering and Computer Science programs at top Chinese universities',
            columns: ['Program', 'University', 'Discipline', 'Degree', 'Duration', 'Language'],
            rows: [['(loading from SICA database…)', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Looking for a specific sub-field? Use the live /programs page and filter by discipline (Computer Science, Engineering, Civil Engineering, etc.) to see the full catalog.',
          },
        ],
      },
      {
        id: 'admissions-engineering',
        h2: 'Engineering admissions: what you need',
        intro:
          'Engineering programs at top Chinese universities have moderate selectivity (top-5: 15-25% international acceptance rate; mid-tier: 30-50%). Here is what they look for.',
        blocks: [
          {
            type: 'table',
            caption: 'Typical engineering admissions profile at top Chinese universities',
            columns: ['Component', 'Bachelor\'s', 'Master\'s', 'PhD'],
            rows: [
              ['Undergraduate GPA', '3.0+ / 4.0 (70%+)', '3.0+ / 4.0 (75%+)', '3.3+ / 4.0'],
              ['GRE / GMAT', 'Optional', 'Optional (300+ if submitted)', 'Optional (310+ if submitted)'],
              ['TOEFL / IELTS', 'TOEFL 80+ / IELTS 6.0+', 'TOEFL 85+ / IELTS 6.5+', 'TOEFL 90+ / IELTS 6.5+'],
              ['Math/Physics background', 'Strong (advanced courses)', 'Strong undergrad + recommended research', 'Required (research proposal, publications preferred)'],
              ['Research proposal', 'Not required', 'Required for thesis track', 'Required (1,500-3,000 words)'],
              ['Recommendation letters', '2 (science teachers)', '2 (1 academic + 1 research/work)', '3 (academic referees)'],
              ['Internship / research', 'Recommended', 'Strongly preferred', 'Required (publications preferred)'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Master\'s engineering in China is the most scholarship-friendly path for international students — most departments have industry-funded RA positions that cover tuition + ¥2,000-4,000/month stipend. PhD programs are almost always fully funded (university RA or CSC scholarship).',
          },
        ],
      },
      {
        id: 'engineering-scholarships',
        h2: 'Engineering scholarships: the most-funded field in China',
        intro:
          'Engineering is by far the most-funded field for international scholarships in China — every top engineering university has multiple scholarship lines. Apply for all of them in parallel.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese Government Scholarship (CSC)** — fully funded: tuition + dorm + ¥2,500-3,500/month stipend + airfare. ~1,000 engineering awards per year across all Chinese universities. Top engineering schools (Tsinghua, Zhejiang, SJTU, Huazhong) get the largest share.',
              '**University-specific engineering scholarships** — Tsinghua\'s Schwarzman Scholars (master\'s, fully funded), Zhejiang\'s Excellence Program, SJTU\'s various named awards, Huazhong\'s HUST-CSC dual scholarships — typically waive 50-100% of tuition + monthly stipend for top applicants.',
              '**Industry-sponsored RA positions** — Huawei, Alibaba, Tencent, BYD, CATL, and other Chinese tech/manufacturing giants fund engineering RA positions at top universities. Master\'s students typically earn ¥2,000-4,000/month tax-free + tuition coverage. PhD students typically earn ¥4,000-8,000/month + full tuition.',
              '**Belt & Road / country-specific scholarships** — Pakistan, Bangladesh, Indonesia, Egypt, Nigeria, and several African countries have dedicated engineering scholarships for study in China. Check your home-country\'s Ministry of Education or relevant agency.',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the best engineering university in China for international students?',
        a: 'Tsinghua University is the consensus #1 for engineering (QS World #20, Engineering #15 globally). Other top picks: Zhejiang University (QS Engineering top 50), Shanghai Jiao Tong (top 50), Harbin Institute of Technology (top 100), Huazhong University of Science and Technology (top 100). For specific fields: Computer Science — Tsinghua, Zhejiang, SJTU; Electrical Engineering — Tsinghua, USTC, Beihang; Mechanical — SJTU, HIT, Tsinghua; Biomedical — SJTU, Tsinghua, Zhejiang.',
      },
      {
        q: 'Is engineering taught in English in China?',
        a: 'Master\'s and PhD engineering programs at top Chinese universities are widely taught in English (especially Computer Science, Electrical Engineering, Materials, Biomedical). Bachelor\'s engineering programs are more selective on English-medium availability — top research universities (Tsinghua, Zhejiang, SJTU, Huazhong) and joint-venture programs (XJTLU, UNNC) offer the most English-medium options.',
      },
      {
        q: 'How much does engineering cost in China?',
        a: 'Tuition for English-medium engineering master\'s programs runs ¥30,000-60,000/year, bachelor\'s ¥20,000-40,000/year, PhD ¥25,000-50,000/year. Total 2-year master\'s: ¥60,000-120,000 (USD 8,500-17,000). US engineering MS: USD 60,000-100,000/year. Most engineering students fund their degree via RA positions that cover tuition + ¥2,000-4,000/month stipend.',
      },
      {
        q: 'Can I get a scholarship for engineering in China?',
        a: 'Yes — engineering is the most-funded field for international scholarships in China. (1) CSC scholarship — fully funded, ~1,000 engineering awards per year. (2) University-specific engineering scholarships — typically waive 50-100% of tuition + monthly stipend. (3) Industry-sponsored RA positions at Huawei, Alibaba, Tencent, BYD, CATL — cover tuition + ¥2,000-4,000/month for master\'s; ¥4,000-8,000/month for PhD. (4) Country-specific scholarships (Belt & Road, Pakistan, Bangladesh, etc.). SICA helps you stack all four.',
      },
      {
        q: 'How hard is it to get into engineering at a top Chinese university?',
        a: 'Moderate selectivity for international applicants: top-5 schools (Tsinghua, Zhejiang, SJTU, HIT, Huazhong) acceptance rates 15-25%; mid-tier top-30 schools 30-50%. Strong math/physics background (undergraduate GPA 3.3+), English proficiency (TOEFL 85+ / IELTS 6.5+), and for research-oriented programs, a clear statement of purpose + recommendation letters from research supervisors are the deciding factors. Apply 6-9 months in advance; rolling admissions.',
      },
      {
        q: 'Do employers recognize engineering degrees from China?',
        a: 'Yes — and increasingly so. QS-top-100 engineering universities (Tsinghua, Zhejiang, SJTU, Huazhong) are recognized globally. C9 League engineering programs are recognized by every Fortune 500 employer in Asia and most multinationals globally. For immigration purposes (US H-1B, UK skilled worker, Canada CRS), engineering MS degrees from MOE-listed universities qualify for education points + STEM occupation extensions.',
      },
      {
        q: 'What are the career outcomes for engineering MS in China?',
        a: 'Top engineering MS programs report 90%+ placement within 3 months, with median post-MS salaries of ¥300,000-600,000/year in China (USD 42,000-84,000). Top sectors: tech (Huawei, Alibaba, Tencent), manufacturing (BYD, CATL, Foxconn), finance (quant roles), consulting, automotive (autonomous driving, EVs). International graduates often leverage the China experience for emerging-market engineering careers or return home with a 30-50% salary uplift.',
      },
      {
        q: 'Should I do a bachelor\'s or master\'s in engineering in China?',
        a: 'It depends on your language and career goals. Master\'s: most engineering master\'s programs are taught in English; 2-year duration; scholarship-funded (RA or CSC); strongest career outcomes. Bachelor\'s: most engineering bachelor\'s programs are taught in Chinese (a few English-medium options at top-10 schools); 4-year duration; less scholarship funding; smoother pathway to top Chinese tech employers via 4-year university network. For most international students, master\'s is the better ROI.',
      },
    ],
    howToSteps: [
      {
        name: 'Pick your engineering field',
        text: 'Use the table in section 2 to identify your target field. CS/EE are highest-demand; biomedical/materials are niche with lower competition. Choose based on your undergraduate background + career goals.',
      },
      {
        name: 'Shortlist 3-5 universities',
        text: 'Top-5 (most selective): Tsinghua, Zhejiang, SJTU, HIT, Huazhong. Mid-tier top-20: USTC, Beihang, Xidian, Nanjing, Tongji. Joint-venture: XJTLU (CS/EE), UNNC (Engineering). Target 3-5 schools in parallel.',
      },
      {
        name: 'Prepare application materials',
        text: 'Bachelor\'s: high school transcripts (notarized), math/physics background proof, TOEFL/IELTS 80+/6.0+, 2 recommendation letters. Master\'s: bachelor\'s transcripts + degree, TOEFL/IELTS 85+/6.5+, GRE (optional), 2 recommendation letters, statement of purpose, CV. PhD: master\'s + research proposal (1,500-3,000 words) + 3 academic recommendation letters.',
      },
      {
        name: 'Apply for CSC + university scholarships in parallel',
        text: 'CSC fully funds engineering — apply via campuschina.org by mid-April. University-specific scholarships are automatic with admission. Apply 6-9 months in advance for September intake.',
      },
      {
        name: 'Look for industry-funded RA positions',
        text: 'Most engineering master\'s students fund their degree via RA positions sponsored by Huawei, Alibaba, Tencent, BYD, CATL, or other Chinese tech/manufacturing companies. Contact your target department directly, or ask SICA for current openings. RA typically covers tuition + ¥2,000-4,000/month tax-free stipend.',
      },
      {
        name: 'Submit applications (rolling)',
        text: 'Most engineering master\'s programs have rolling admissions September-May. Top programs close early (March-April for September intake). Submit 6-9 months in advance.',
      },
      {
        name: 'Prepare for interview + research proposal review',
        text: 'PhD applicants: research proposal is the #1 factor — work with a prospective supervisor before submitting. Master\'s applicants: statement of purpose + interview (behavioral + technical). Most interviews are video-based.',
      },
      {
        name: 'Plan for arrival + visa',
        text: 'Admitted students receive admission notice + JW202 within 4 weeks. Apply for X1 visa at your local Chinese embassy. Plan to arrive 1-2 weeks before orientation for dorm move-in, lab assignment, RA contract setup.',
      },
    ],
    ctaTitle: 'Ready to apply for engineering in China?',
    ctaSubtitle:
      'SICA counselors help you shortlist engineering programs, prepare your application package, and apply for CSC + university + industry-funded scholarships. Free initial consultation.',
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
    slug: 'top-engineering-universities-china',
    eyebrow: '指南 · 工程',
    title: '2026 来华留学最好的工程大学',
    description:
      '中国顶尖大学的全英文授课工程与计算机科学项目——专业、学制、学费、奖学金。',
    subtitle:
      '中国每年培养的工程师数量超过任何国家——顶尖项目现英文授课、QS 前 100 排名、学费仅美国五分之一。',
    stats: [
      { value: 'QS 前 100', label: '中国工程类项目' },
      { value: '7 大学科', label: '工程方向（CS、EE、ME、土木...）' },
      { value: '实时', label: '目录项目数' },
      { value: '50-100%', label: '可申请奖学金比例' },
    ],
    quickAnswer:
      '面向国际生的中国顶尖工程大学：清华、浙大、上海交大、哈工大、华中科技大学——均位列 QS 工程前 100。工程是中国大学最大英文授课项目类别，本科、硕士、博士覆盖计算机科学、电气工程、机械工程、土木工程、生物医学工程、化学工程、材料科学。学费 ¥20,000-50,000/年——约为美国工程的五分之一。CSC 与院校奖学金为优秀申请者减免 50-100%。建议提前 6-9 个月申请。',
    keyTakeaways: [
      '清华、浙大、上海交大、哈工大、华中科技是国际生工程类前 5 名共识',
      '计算机科学是最大的英文授课工程方向；EE、ME、土木、生物医学、化学、材料也广泛可得',
      '学费 ¥20,000-50,000/年——约为美国工程的五分之一',
      '硕士与博士为主（多数本科工程为中文授课）',
      'CSC 奖学金可全额资助工程——覆盖学费 + 住宿 + ¥2,500-3,500/月生活补贴',
      'QS 前 100 排名 + 可负担学费 = 全球工程类最佳 ROI',
    ],
    sections: [
      {
        id: 'why-engineering-china',
        h2: '为什么选择来华攻读工程？',
        intro:
          '中国每年毕业的工程师数量是美国的 5 倍，顶尖工程大学已全球排名、英文授课、学费仅美国五分之一。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**规模**——中国每年毕业约 150 万 STEM 学生，美国约 30 万。顶尖工程大学（清华、浙大、上海交大）有 5,000+ 师资 + ~50,000 工科学生。',
              '**研究强度**——清华、浙大、上海交大、华中、哈工大均位列 QS 工程前 100。研究产出（Nature/SCI 论文、专利、引用）与美国顶尖工程学校持平。',
              '**成本**——英文授课工程硕士 ¥30,000-60,000/年，本科 ¥20,000-40,000/年。2 年硕士总费用：¥60,000-120,000（8,500-17,000 美元）。美国工程硕士：60,000-100,000 美元/年。',
              '**行业接触**——中国工程大学直接与本国产业基地合作：华为、阿里、腾讯、比亚迪、宁德时代、中车。硕士生通常参与企业资助的科研项目；本科生通过 4 年大学网络进入顶尖中国科技与制造企业实习。',
              '**职业成果**——顶尖工程硕士毕业 3 个月内就业率 90%+，中国地区中位年薪 ¥300,000-600,000（42,000-84,000 美元）。国际生常利用中国经验 + 技术技能在新兴市场工程职业或回国就业中获益。',
            ],
          },
        ],
      },
      {
        id: 'top-engineering-fields',
        h2: '工程领域需求排行',
        intro:
          '中国工程涵盖 7+ 主要学科。下面是国际生需求分布及顶尖大学。',
        blocks: [
          {
            type: 'table',
            caption: '中国大学工程领域国际生需求',
            columns: ['领域', '需求', '顶尖大学', '硕士平均学费/年'],
            rows: [
              ['计算机科学 / AI', '极高', '清华、浙大、上海交大、南大、中科大、华中科技', '¥30,000-50,000'],
              ['电气 / 电子工程', '高', '清华、浙大、中科大、北航、西电', '¥25,000-45,000'],
              ['机械工程', '中', '上海交大、哈工大、清华、华中、西安交大', '¥20,000-40,000'],
              ['土木工程 / 建筑', '中', '同济、清华、哈工大、东南', '¥20,000-40,000'],
              ['生物医学工程', '高（增长中）', '上海交大、清华、浙大、复旦、华南理工', '¥30,000-50,000'],
              ['化学工程', '中', '清华、浙大、华东理工、天津大学', '¥20,000-40,000'],
              ['材料科学', '中', '清华、上海交大、中科大、浙大、哈工大', '¥25,000-45,000'],
              ['航空航天', '小众', '北航、西北工大、南航', '¥25,000-45,000'],
            ],
          },
          {
            type: 'p',
            text: '实用结论：CS 与 EE 是国际生需求最大的领域。若要最大选择 + 奖学金机会，瞄准 CS 或 EE；若要更专业的小众方向（生物医学、材料、航空航天），竞争更低、资助更丰厚。',
          },
        ],
      },
      {
        id: 'engineering-programs-table',
        h2: 'SICA 目录中所有工程与计算机科学项目',
        intro:
          'SICA 目录中所有英文授课的工程类项目。按母大学国内排名升序排列。',
        blocks: [
          {
            type: 'table',
            caption: '中国顶尖大学英文授课工程与计算机科学项目',
            columns: ['项目', '大学', '学科', '学位', '学制', '授课语言'],
            rows: [['（从 SICA 数据库加载中…）', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '寻找特定子领域？使用 live /programs 页面按学科筛选（计算机科学、工程、土木工程等）查看完整目录。',
          },
        ],
      },
      {
        id: 'admissions-engineering',
        h2: '工程类申请条件：你需要什么',
        intro:
          '中国顶尖大学工程类项目中等选择性（前 5 名：国际生录取率 15-25%；中等：30-50%）。',
        blocks: [
          {
            type: 'table',
            caption: '中国顶尖大学工程类典型申请条件',
            columns: ['项目', '本科', '硕士', '博士'],
            rows: [
              ['本科 GPA', '3.0+ / 4.0（70%+）', '3.0+ / 4.0（75%+）', '3.3+ / 4.0'],
              ['GRE / GMAT', '可选', '可选（如提交 300+）', '可选（如提交 310+）'],
              ['TOEFL / IELTS', 'TOEFL 80+ / IELTS 6.0+', 'TOEFL 85+ / IELTS 6.5+', 'TOEFL 90+ / IELTS 6.5+'],
              ['数学 / 物理背景', '强（高级课程）', '强本科 + 推荐科研', '必需（研究计划、发表优先）'],
              ['研究计划', '不要求', '论文轨道必需', '必需（1,500-3,000 字）'],
              ['推荐信', '2 封（理科教师）', '2 封（1 学术 + 1 科研/工作）', '3 封（学术推荐人）'],
              ['实习 / 科研', '推荐', '强烈推荐', '必需（发表优先）'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '中国工程硕士是最受国际生奖学金友好的路径——多数院系有企业资助的 RA 岗位，覆盖学费 + ¥2,000-4,000/月补贴。博士项目几乎全部全额资助（大学 RA 或 CSC 奖学金）。',
          },
        ],
      },
      {
        id: 'engineering-scholarships',
        h2: '工程类奖学金：中国最受资助的领域',
        intro:
          '工程是中国国际生奖学金最受资助的领域——每所顶尖工程大学都有多条奖学金线。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中国政府奖学金（CSC）**——全额资助：学费 + 住宿 + ¥2,500-3,500/月补贴 + 机票。每年约 1,000 个工程名额。顶尖工程学校（清华、浙大、上海交大、华中）占比最大。',
              '**院校工程奖学金**——清华苏世民学者（硕士全额资助）、浙大卓越项目、上海交大各类冠名奖学金、华中 HUST-CSC 双奖学金——通常为顶尖申请者减免 50-100% 学费 + 月度补贴。',
              '**企业资助 RA 岗位**——华为、阿里、腾讯、比亚迪、宁德时代等中国科技/制造巨头资助顶尖大学的工程 RA。硕士通常 ¥2,000-4,000/月免税 + 学费覆盖；博士通常 ¥4,000-8,000/月 + 全额学费。',
              '**一带一路 / 国别奖学金**——巴基斯坦、孟加拉、印尼、埃及、尼日利亚及多个非洲国家设有来华工程专项。咨询本国教育部或相关机构。',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国最好的工程大学是哪所？',
        a: '清华大学是工程类共识第一（QS 世界第 20，工程第 15）。其他首选：浙江大学（QS 工程前 50）、上海交大（前 50）、哈工大（前 100）、华中科技大学（前 100）。分领域：计算机科学——清华、浙大、上海交大；电气工程——清华、中科大、北航；机械——上海交大、哈工大、清华；生物医学——上海交大、清华、浙大。',
      },
      {
        q: '中国工程是英文授课吗？',
        a: '顶尖大学的硕士与博士工程类项目广泛英文授课（尤其计算机、电气、材料、生物医学）。本科工程类对英文授课更挑剔——顶尖研究型大学（清华、浙大、上海交大、华中）及中外合办项目（XJTLU、UNNC）提供最多英文授课选项。',
      },
      {
        q: '中国工程学费多少？',
        a: '英文授课工程硕士学费 ¥30,000-60,000/年，本科 ¥20,000-40,000/年，博士 ¥25,000-50,000/年。2 年硕士总费用：¥60,000-120,000（8,500-17,000 美元）。美国工程硕士：60,000-100,000 美元/年。多数工程学生通过 RA 岗位资助学位——覆盖学费 + ¥2,000-4,000/月补贴。',
      },
      {
        q: '中国工程可以申请奖学金吗？',
        a: '可以——工程是中国国际生奖学金最受资助的领域。（1）CSC 奖学金——全额资助，每年约 1,000 个工程名额；（2）院校工程奖学金——通常减免 50-100% 学费 + 月度补贴；（3）企业资助 RA 岗位（华为、阿里、腾讯、比亚迪、宁德时代）——覆盖硕士学费 + ¥2,000-4,000/月；博士学费 + ¥4,000-8,000/月；（4）国别奖学金（一带一路、巴基斯坦、孟加拉等）。SICA 可助你叠加申请。',
      },
      {
        q: '考入中国顶尖工程大学难吗？',
        a: '国际申请者中等选择性：前 5 名（清华、浙大、上海交大、哈工大、华中）录取率 15-25%；中等前 30 名 30-50%。强数学/物理背景（本科 GPA 3.3+）、英语（TOEFL 85+ / IELTS 6.5+），以及研究导向项目中的明确目标陈述 + 科研导师推荐信是决定因素。建议提前 6-9 个月申请；滚动录取。',
      },
      {
        q: '中国工程学位雇主认可吗？',
        a: '认可，且越来越被认可。QS 前 100 工程大学（清华、浙大、上海交大、华中）全球认可。C9 联盟工程学位被亚洲所有财富 500 强雇主及全球多数跨国公司认可。就移民而言（中国 H-1B、英国技术工人、加拿大 CRS），教育部认可大学的工程硕士学位符合教育加分 + STEM 职业延期条件。',
      },
      {
        q: '中国工程硕士毕业后薪资如何？',
        a: '顶尖工程硕士项目报告 3 个月内就业率 90%+，中国地区中位年薪 ¥300,000-600,000（42,000-84,000 美元）。热门行业：科技（华为、阿里、腾讯）、制造（比亚迪、宁德时代、富士康）、金融（量化岗位）、咨询、汽车（自动驾驶、电动车）。国际生常利用中国经验在新兴市场工程职业或回国就业中获益 30-50% 薪资提升。',
      },
      {
        q: '本科还是硕士来华读工程？',
        a: '取决于语言与职业目标。硕士：多数工程硕士英文授课；2 年学制；奖学金资助（RA 或 CSC）；最强职业成果。本科：多数工程本科中文授课（少数顶尖前 10 校英文授课）；4 年学制；奖学金资助较少；通过 4 年大学网络进入顶尖中国科技雇主更顺畅。对多数国际生而言，硕士 ROI 更高。',
      },
    ],
    howToSteps: [
      {
        name: '选定工程方向',
        text: '使用第 2 节表格识别目标方向。CS/EE 需求最高；生物医学/材料小众且竞争更低。根据本科背景 + 职业目标选择。',
      },
      {
        name: '初选 3-5 所大学',
        text: '前 5 名（最高竞争）：清华、浙大、上海交大、哈工大、华中科技。中等前 20 名：中科大、北航、西电、南大、同济。中外合办：XJTLU（CS/EE）、UNNC（工程）。同时申请 3-5 所。',
      },
      {
        name: '准备申请材料',
        text: '本科：高中成绩单（公证）、数学/物理背景证明、TOEFL/IELTS 80+/6.0+、2 封推荐信。硕士：本科成绩单 + 学位、TOEFL/IELTS 85+/6.5+、GRE（可选）、2 封推荐信、目标陈述、简历。博士：硕士 + 研究计划（1,500-3,000 字）+ 3 封学术推荐信。',
      },
      {
        name: '并行申请 CSC + 院校奖学金',
        text: 'CSC 全额资助工程——4 月中前通过 campuschina.org 申请。院校奖学金随入学自动评审。9 月入学请提前 6-9 个月申请。',
      },
      {
        name: '寻找企业资助 RA 岗位',
        text: '多数工程硕士通过 RA 岗位资助学位——由华为、阿里、腾讯、比亚迪、宁德时代等中国科技/制造企业资助。直接联系目标院系或向 SICA 查询当前岗位。RA 通常覆盖学费 + ¥2,000-4,000/月免税补贴。',
      },
      {
        name: '提交申请（滚动）',
        text: '多数工程硕士项目 9 月-5 月滚动录取。顶尖项目 3-4 月截止 9 月入学。提前 6-9 个月提交。',
      },
      {
        name: '准备面试 + 研究计划评审',
        text: '博士申请人：研究计划是第一要素——提交前与潜在导师对接。硕士申请人：目标陈述 + 面试（行为 + 技术）。多数面试为视频形式。',
      },
      {
        name: '规划抵华 + 签证',
        text: '录取学生 4 周内收到录取通知书 + JW202。在本国中国大使馆申请 X1 签证。建议开学前 1-2 周到达，完成入住、实验室分配、RA 合同签订。',
      },
    ],
    ctaTitle: '准备好申请来华工程了吗？',
    ctaSubtitle:
      'SICA 顾问可帮你筛选工程类项目、准备申请材料、申请 CSC + 院校 + 企业资助奖学金。首次咨询免费。',
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
import type { LocalizedGuide } from './types';

/**
 * "Part-time work & post-study visa for international students in China" —
 * process guide. Target queries: "part time work international student china",
 * "x1 visa work permit china", "勤工助学", "post study work visa china",
 * "china work permit foreign graduate", "work after graduation china",
 * "stay back visa china", "china z visa work", "china residence permit work".
 *
 * China updated its part-time work rules in 2017-2018 and again in 2023
 * (Beijing/Shanghai pilot), allowing X1 visa holders to work up to 16
 * hours/week on campus and 24 hours/week off campus during holidays.
 * Post-study, graduates can switch to a work residence permit (Z visa +
 * work permit + residence permit) or apply for an entrepreneurship visa
 * or stay-back visa (some cities). This guide walks through both the
 * during-study and post-study paths, the documents, the income tax, and
 * the realistic career outcomes.
 */
export const partTimeWorkGuide: LocalizedGuide = {
  en: {
    slug: 'part-time-work',
    eyebrow: 'GUIDE · WORK & CAREER',
    title: 'Part-time Work & Post-Study Visa for International Students in China (2026)',
    description:
      "Work legally during your X1 visa, switch to a Z work visa after graduation, and explore entrepreneurship / stay-back visa options. Rules, hours, income tax, and the realistic career outcomes.",
    subtitle:
      "Two stories in one: how to earn during your degree (勤工助学 + off-campus part-time) and how to stay in China after you graduate (Z work visa, entrepreneurship visa, stay-back visa). Both are realistic but require paperwork most guides don't cover.",
    stats: [
      { value: '16h/wk', label: 'On-campus part-time limit (X1)' },
      { value: '24h/wk', label: 'Off-campus during holidays (pilot cities)' },
      { value: '¥40K+', label: 'Monthly cost of a Z work permit' },
      { value: '60+', label: 'Cities with stay-back visa options' },
    ],
    quickAnswer:
      "During your X1 visa: you can work up to 16 hours/week on campus (research assistant, TA, library staff — called 勤工助学) with just your university international office's approval. Off-campus part-time work is allowed in pilot cities (Beijing, Shanghai, Tianjin, Hubei, Jiangsu, Zhejiang, Shandong, Guangdong, Fujian) during holidays up to 24 hours/week, but requires both the university and the local public security bureau approval plus a part-time work permit. After graduation: switch to a Z visa + work permit + residence permit (the standard employer-sponsored path) or apply for an entrepreneurship/stay-back visa (foreigner residence permit for innovation/in创业) if you start a business in a free trade zone. Realistic outcomes: most international graduates who want to stay find a job at a multinational, a Chinese tech company, or an education institution. Income tax on part-time earnings is 3-45% progressive; 勤工助学 income is partially exempt.",
    keyTakeaways: [
      "X1 visa holders can work on campus up to 16 hours/week with university approval (勤工助学)",
      "Off-campus part-time work is allowed in 9 pilot cities during holidays up to 24 hours/week",
      "Required: university approval + part-time work permit + public security bureau notification",
      "勤工助学 income is partially tax-exempt (¥800-3,500/month deduction depending on the month)",
      "After graduation, switch to a Z visa + work permit + residence permit (the standard employer path)",
      "Z work permit costs ¥40K-60K (mostly borne by the employer), takes 2-4 months to process",
      "Entrepreneurship visa available in 60+ free trade zones; 1+ year business plan + ¥50K+ registered capital",
      "Stay-back visa options: Beijing 海归 (returning-talent) permit, Shanghai 留学人员, Shenzhen 孔雀计划, Hangzhou 全球引才",
    ],
    sections: [
      {
        id: 'x1-basics',
        h2: 'What your X1 visa lets you do (and not do)',
        intro:
          "The X1 visa is a long-term student visa (valid for the duration of study, >180 days). It explicitly allows part-time work and internships under conditions, but the conditions are not the same as for tourists or short-term students. Get them wrong and you risk fines, deportation, or future-visa refusal.",
        blocks: [
          {
            type: 'table',
            caption: 'X1 vs X2 vs Z visa work rights',
            columns: ['Visa type', 'Work rights during study', 'Post-study path'],
            rows: [
              ['X1 (long-term, >180 days)', 'On-campus 16h/wk + off-campus 24h/wk in pilot cities', 'Switch to Z work visa or stay-back'],
              ['X2 (short-term, <180 days)', 'No part-time work allowed', 'Must leave; can reapply as X1 if enrolled longer'],
              ['Z (work)', 'Full work rights, employer-sponsored', 'Renewable, can lead to permanent residence'],
              ['F (business)', 'Business activities only, no employment', 'Switch to Z if you get a job offer'],
            ],
          },
          {
            type: 'h3',
            text: 'The 3 baseline rules',
            body:
              "(1) You must have a valid residence permit (居留许可), not just the X1 visa stamp — the residence permit is the in-country ID. (2) You cannot work in any role that violates Chinese labor law (minors, dangerous industries, etc.). (3) You cannot work for an employer that doesn't have a foreigner work permit quota, which excludes most small businesses and informal employers.",
          },
          {
            type: 'h3',
            text: 'What counts as part-time work',
            body:
              "Anything you get paid for: research assistant, teaching assistant, tutoring (Chinese or your native language), library staff, dorm RA, restaurant server, café barista, language school teacher, marketing intern, software engineering intern, translation work. Unpaid internships don't require a work permit but should still go through your university international office for record-keeping.",
          },
        ],
      },
      {
        id: 'on-campus',
        h2: 'On-campus part-time (勤工助学): the easy path',
        intro:
          "On-campus work is the simplest and most common path for international students. The university itself is the employer, the paperwork is light, and the income is partially tax-exempt. Most international students earn ¥2,000-6,000/month through on-campus work.",
        blocks: [
          {
            type: 'h3',
            text: 'How to find an on-campus job',
            body:
              "Three main channels: (1) Your university's international student affairs office (留学生办公室) — they post openings weekly. (2) The student affairs office (学生处) — same openings, Chinese students apply too. (3) Direct contact — email professors you want to work with, ask about research assistant or TA roles. Most professors hire from their existing students first.",
          },
          {
            type: 'h3',
            text: 'Common on-campus roles',
            body:
              "Research assistant (科研助理): ¥2,500-5,000/month, 10-15h/wk, work with a professor on their research. Teaching assistant (助教): ¥2,000-4,000/month, 8-12h/wk, grade papers, run tutorials, hold office hours. Language tutor (语言辅导): ¥100-200/hour, flexible, tutor other students in your native language. Library assistant (图书馆助理): ¥2,000-3,000/month, 8-12h/wk, shelving, front desk. Dorm RA (宿舍管理): free housing + ¥1,000-2,000 stipend, requires Chinese fluency.",
          },
          {
            type: 'h3',
            text: 'The 4-step approval process',
            body:
              "(1) Get the job offer from the professor or department. (2) Submit a part-time work application to your international student affairs office — usually a 1-page form with: your name, passport number, residence permit number, employer (university department), job description, hours/week, duration. (3) The office reviews and approves within 3-5 working days. (4) You can start working; the office notifies the public security bureau within 10 days.",
          },
          {
            type: 'callout',
            tone: 'info',
            text: "Keep a copy of the approval form. If the public security bureau does a routine check on your residence permit, the form proves you're working legally. Without it, you're treated as unauthorized worker.",
          },
        ],
      },
      {
        id: 'off-campus',
        h2: 'Off-campus part-time: the pilot-city path',
        intro:
          "Since 2017, China has run a pilot program allowing X1 visa holders to work off campus during holidays in selected cities. The rules were expanded in 2023. The paperwork is heavier than on-campus work, and the hours cap is strict.",
        blocks: [
          {
            type: 'h3',
            text: 'The 9 pilot cities/provinces',
            body:
              "Beijing, Shanghai, Tianjin (Tianjin municipality), Hubei province (Wuhan), Jiangsu province (Nanjing, Suzhou, Wuxi), Zhejiang province (Hangzhou, Ningbo), Shandong province (Jinan, Qingdao), Guangdong province (Guangzhou, Shenzhen), Fujian province (Xiamen, Fuzhou). Outside these 9, off-campus part-time work is not allowed even with university approval.",
          },
          {
            type: 'h3',
            text: 'The 5-step approval process',
            body:
              "(1) Get an offer from a registered Chinese employer (must have a foreigner work permit quota, must be in one of the 9 pilot cities). (2) Apply to your university international office for off-campus work approval. (3) The university notifies the local public security bureau. (4) Apply for a 外国人就业证 (foreign employment certificate) at the local labor bureau — takes 10-15 working days. (5) Start work. The whole process takes 3-6 weeks.",
          },
          {
            type: 'h3',
            text: 'Hour and income rules',
            body:
              "Maximum 24 hours/week during official school holidays (summer, winter, spring festival). Outside holidays: 8 hours/week (weekends only, some cities). Income is taxed at 3-45% progressive. 勤工助学 income (on-campus) gets a special tax-free threshold of ¥800-3,500/month. Off-campus part-time income is fully taxable from the first yuan but the first ¥5,000/month is usually below the tax threshold.",
          },
          {
            type: 'callout',
            tone: 'warning',
            text: "Working off-campus without a permit is treated as illegal employment. Penalties: ¥5,000-20,000 fine, deportation, 5-10 year entry ban. The risk is real — public security bureau spot-checks on language schools, tutoring centers, and restaurant chains have caught students. Always do the paperwork.",
          },
        ],
      },
      {
        id: 'internships',
        h2: 'Internships: separate from part-time work',
        intro:
          "Internships (实习) have a different legal basis from part-time work. They're tied to your academic program, often paid, and usually don't require a separate work permit. The employer must be a registered Chinese entity and the internship must relate to your field of study.",
        blocks: [
          {
            type: 'h3',
            text: 'Curricular internships (curriculum-required)',
            body:
              "Most degree programs require 1-3 months of internship for graduation. These are mandatory, your university arranges the placement or approves your own, and the legal basis is the X1 visa + university-issued internship certificate. Income is taxed like normal wages. Some companies offer housing or meal subsidies on top.",
          },
          {
            type: 'h3',
            text: 'Optional internships (curriculum-not-required)',
            body:
              "Common for master's and PhD students. Same rules as off-campus part-time: pilot cities only, public security bureau notification, no separate work permit. Most international students do internships in tech (ByteDance, Tencent, Alibaba, Meituan, Huawei), finance (multinational banks), consulting (McKinsey, BCG, Bain), or education (New Oriental, Wall Street English, EF). Stipends range from ¥150-500/day depending on the company and role.",
          },
          {
            type: 'h3',
            text: 'The 4-week summer internship cycle',
            body:
              "Major Chinese tech companies run summer internship programs in June-August. Applications open February-March. The 4-week minimum is typical; 8-12 weeks is more useful. Some companies convert top interns to full-time offers (return offer) for after graduation. International students from top universities (QS Top 200) get preferential treatment in some company pipelines.",
          },
        ],
      },
      {
        id: 'post-study-z-visa',
        h2: 'After graduation: the Z work visa path',
        intro:
          "The Z visa is the standard employer-sponsored work visa. It requires a Chinese employer to sponsor your work permit, then issue a Z visa invitation, then you apply at a Chinese consulate abroad, then enter China and convert to a residence permit for work. The whole process takes 2-4 months from job offer to residence permit.",
        blocks: [
          {
            type: 'h3',
            text: 'The 5-step Z visa path',
            body:
              "(1) Get a job offer from a registered Chinese employer. (2) The employer applies for a foreigner work permit (外国人工作许可证) at the local labor bureau. Cost to employer: ¥40,000-60,000 (this is the bulk of the work permit fee structure, including government processing). Takes 2-4 weeks. (3) The employer issues a Z visa invitation letter (PU letter or formal invitation). (4) Apply for a Z visa at a Chinese consulate abroad (your home country, not Hong Kong/Macao). Takes 4-7 working days. (5) Enter China on the Z visa, then apply for a residence permit for work within 30 days. The residence permit is the in-country ID, valid 1-5 years.",
          },
          {
            type: 'h3',
            text: 'What the employer needs from you',
            body:
              "Bachelor's degree minimum (some roles require master's), 2+ years of work experience for most roles (fresh graduates can skip this for some entry-level positions), clean criminal record, medical examination. The employer submits your documents to the labor bureau. Top-tier universities (QS Top 200) and STEM degrees qualify for the fast-track (A-level work permit, 1-2 week processing instead of 4).",
          },
          {
            type: 'h3',
            text: 'The realistic employer mix',
            body:
              "Multinational companies (60%): Microsoft, Google, Apple, Amazon, PwC, Deloitte, HSBC, Standard Chartered, etc. — usually English-medium work, expat-friendly policies. Chinese tech (15%): ByteDance, Tencent, Alibaba, Meituan, JD, Pinduoduo — competitive salaries (¥300-800K/year for fresh master's), intense work culture. Education (10%): universities, international schools, language training centers — ¥200-400K/year. State-owned enterprises (5%): more bureaucracy, lower pay, high stability. Startups (10%): variable, often equity-heavy, higher risk.",
          },
          {
            type: 'callout',
            tone: 'info',
            text: "Fresh international graduates with a master's from a top-200 university and Chinese fluency (HSK 5+) are competitive for Chinese tech and education roles. Bachelor's-only candidates are more limited to entry-level positions or education roles.",
          },
        ],
      },
      {
        id: 'entrepreneur-visa',
        h2: 'Stay-back visa: entrepreneurship, talent, and free trade zones',
        intro:
          "If you don't have a Z-visa job offer, several cities offer stay-back visas for graduates, entrepreneurs, and foreign talent. Each has its own criteria; the right one depends on your background, your city, and your long-term plan.",
        blocks: [
          {
            type: 'h3',
            text: 'The foreigner residence permit for innovation/in创业',
            body:
              "Available in 60+ free trade zones (FTZs) and innovation cities. Requirements: bachelor's degree or above, business plan approved by the local innovation committee, registered capital ¥50,000+ (varies by city), office space in the FTZ, 1+ year business plan. Validity: 2-5 years. Renewable. Allows the holder to live in China and operate a business. Spouse and minor children can join on family reunion visas. Common cities: Shanghai Pudong FTZ, Beijing Zhongguancun, Shenzhen Qianhai, Hangzhou, Suzhou, Chengdu, Wuhan.",
          },
          {
            type: 'h3',
            text: 'The 海归 / returning-talent permit',
            body:
              "Some cities issue returning-talent permits to foreign graduates of their universities. The permit is 1-3 years, renewable, allows the holder to work in any industry, start a business, or stay without an employer. Examples: Beijing 海归 (Hai Gui) — for graduates of Beijing universities. Shanghai 留学人员 — for Shanghai university graduates. Hangzhou 全球引才 (Global Talent Recruitment) — for top-100 university graduates. Each has its own application process; check the local public security bureau exit-entry administration office.",
          },
          {
            type: 'h3',
            text: 'The realistic path to permanent residence',
            body:
              "After 4 consecutive years on a Z work residence permit, you can apply for Chinese permanent residence (中国绿卡, literally 'green card'). Requirements: stable income, clean record, employer sponsorship, no criminal history. Processing time: 6-12 months. Or after 3 years of investment (¥500K+ in a Chinese business) or 5 years of marriage to a Chinese national. The Chinese green card is hard to get but extremely valuable — it removes most work restrictions and renews every 5 years automatically.",
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Can international students work part-time in China on an X1 visa?',
        a: "Yes, with conditions. On-campus work (勤工助学) is allowed up to 16 hours/week with university international office approval. Off-campus part-time work is allowed in 9 pilot cities/provinces (Beijing, Shanghai, Tianjin, Hubei, Jiangsu, Zhejiang, Shandong, Guangdong, Fujian) during official school holidays up to 24 hours/week, with both university and public security bureau approval. Outside these rules, work is illegal and can result in fines, deportation, or future-visa denial.",
      },
      {
        q: 'What is 勤工助学?',
        a: "勤工助学 is the official term for on-campus part-time work by students. The university itself is the employer. Common roles: research assistant, teaching assistant, library staff, language tutor. Income is partially tax-exempt (¥800-3,500/month free depending on the month). Approval is via the university international student affairs office; takes 3-5 working days. The easiest and most common path for international students to earn while studying.",
      },
      {
        q: 'How many hours can international students work in China?',
        a: "On-campus: up to 16 hours/week during term, more during holidays. Off-campus (pilot cities only): up to 24 hours/week during official school holidays, 8 hours/week (weekends only) outside holidays. Anything above these caps is unauthorized employment.",
      },
      {
        q: 'Do international students pay income tax on part-time earnings in China?',
        a: "Yes. China's individual income tax is 3-45% progressive. 勤工助学 income gets a special monthly threshold (¥800-3,500 depending on the month). Off-campus part-time income is fully taxable from the first yuan but the first ¥5,000/month is usually below the tax threshold. Your employer withholds the tax; you can file an annual reconciliation in March-April to claim refunds if over-withheld.",
      },
      {
        q: 'Can international students stay in China after graduation?',
        a: "Yes, three main paths. (1) Z work visa — employer-sponsored, requires a job offer and a work permit (¥40-60K, 2-4 months processing). (2) Entrepreneurship/stay-back visa — 60+ free trade zones and innovation cities offer 2-5 year residence permits for graduates starting a business. (3) Returning-talent permits — Beijing 海归, Shanghai 留学人员, etc. for graduates of local universities. After 4 years on a Z work residence permit, you can apply for permanent residence.",
      },
      {
        q: 'How much does a Z work permit cost?',
        a: "The work permit itself has government fees of ¥400-1,500 depending on the city and processing speed. The ¥40,000-60,000 figure that often gets quoted is the total cost to the employer including legal/administrative costs, document translation, and government processing. The employer typically bears this. Processing time: 2-4 weeks for A-level (top-200 university STEM graduates), 4-8 weeks for B-level. After the work permit, you apply for a Z visa abroad and then a residence permit in China.",
      },
      {
        q: 'Which Chinese cities are best for international graduates to find work?',
        a: "Beijing, Shanghai, Shenzhen, Guangzhou, Hangzhou, Chengdu are the top 6. Beijing and Shanghai have the most multinational employers and the highest concentration of English-speaking work. Shenzhen has the strongest tech scene (Huawei, Tencent, BYD, DJI) and is more entrepreneur-friendly. Hangzhou (Alibaba, NetEase) and Chengdu (more relaxed lifestyle) are rising. All 6 are in the off-campus part-time pilot program.",
      },
      {
        q: 'What is the Chinese green card?',
        a: "Chinese permanent residence (中国绿卡). Eligibility: 4 consecutive years on a Z work residence permit + stable income + clean record; OR 3 years of investment (¥500K+ in a Chinese business); OR 5 years of marriage to a Chinese national. Processing time: 6-12 months. Validity: 5 years (renewable automatically). The green card removes most work restrictions, allows free entry/exit, and qualifies the holder for the same social services as Chinese citizens.",
      },
    ],
    howToSteps: [
      {
        name: 'Confirm your visa and city',
        text: 'X1 visa with valid residence permit is required for any part-time work. Off-campus part-time is only allowed in 9 pilot cities/provinces: Beijing, Shanghai, Tianjin, Hubei, Jiangsu, Zhejiang, Shandong, Guangdong, Fujian. Outside these, focus on on-campus 勤工助学 work.',
      },
      {
        name: 'Find the right on-campus job',
        text: 'Check your university international student affairs office weekly for openings. Email professors you want to work with for research/TA roles. Common roles: research assistant (¥2,500-5,000/month), teaching assistant (¥2,000-4,000/month), language tutor (¥100-200/hour), library assistant (¥2,000-3,000/month).',
      },
      {
        name: 'Submit the part-time work application',
        text: '1-page form to the international student affairs office: name, passport, residence permit, employer (university department), job description, hours/week, duration. Approval: 3-5 working days. Keep a copy of the form.',
      },
      {
        name: 'For off-campus work in pilot cities: get a work permit',
        text: 'Get a job offer from a registered Chinese employer with a foreigner work permit quota. Apply to the university for off-campus approval. The university notifies the public security bureau. Apply for the foreigner employment certificate at the local labor bureau (10-15 working days).',
      },
      {
        name: 'For internships: align with your academic program',
        text: 'Curricular internships (curriculum-required): university arranges or approves. Optional internships: same rules as off-campus part-time. Apply 2-3 months in advance; major Chinese tech companies recruit February-March for June-August programs.',
      },
      {
        name: '6 months before graduation: plan your post-study path',
        text: "Three options: (1) Z work visa — start applying for jobs that will sponsor your work permit. (2) Entrepreneurship/stay-back visa — develop a business plan, identify a free trade zone, secure registered capital. (3) Returning-talent permit — check your university host city for programs.",
      },
      {
        name: 'For Z visa path: complete the work permit + visa + residence permit sequence',
        text: 'Employer applies for work permit (2-4 weeks for A-level, 4-8 weeks for B-level). Employer issues Z visa invitation. Apply for Z visa at a Chinese consulate abroad (4-7 working days). Enter China, then apply for a residence permit for work within 30 days (residence permit is your in-country ID, valid 1-5 years).',
      },
      {
        name: 'After 4 years on Z work residence: apply for permanent residence',
        text: 'Requirements: 4 consecutive years on a Z work residence permit, stable income, clean record, employer sponsorship, no criminal history. Processing: 6-12 months. Alternative: 3 years of investment (¥500K+) or 5 years of marriage to a Chinese national. The Chinese green card is hard to get but extremely valuable — it removes most work restrictions and qualifies you for the same social services as Chinese citizens.',
      },
    ],
    ctaTitle: 'Need help planning your career in China?',
    ctaSubtitle:
      "SICA can connect you with companies that sponsor Z work permits, advise on the right free trade zone for your business plan, and walk you through the 30-day post-graduation residence permit process.",
    ctaApplyLabel: 'Start with free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/visa',
        label: 'Student visa (X1 / X2)',
        description: 'Document checklist, fees, processing times, residence permit, work rights, and renewals.',
      },
      {
        href: '/guides/scholarships',
        label: 'Scholarships to study in China',
        description: 'CSC, Confucius Institute, university-specific, and provincial scholarships — what each covers and how to apply.',
      },
      {
        href: '/guides/application',
        label: 'How to apply',
        description: 'The full application timeline, document checklist, and scholarship paths.',
      },
    ],
  },

  zh: {
    slug: 'part-time-work',
    eyebrow: '指南 · 兼职与职业',
    title: '中国留学生兼职与毕业后工签指南（2026）',
    description:
      '持X1签证合法打工、毕业后转Z工签、创业/留居签证选项。规则、工时、个税、真实就业去向。',
    subtitle:
      '一篇文章两个故事：学位期间怎么赚（勤工助学 + 校外兼职），毕业后怎么留（Z工签、创业签、留居签）。两条路都可行，但都需要多数攻略没讲的材料流程。',
    stats: [
      { value: '16h/周', label: '校内兼职上限（X1）' },
      { value: '24h/周', label: '试点城市假期校外' },
      { value: '¥4万+', label: 'Z工签总成本' },
      { value: '60+', label: '提供留居签的城市' },
    ],
    quickAnswer:
      '持X1签证期间：校内可做16小时/周（科研助理、助教、图书馆员——勤工助学），只需学校国际办批准。校外兼职允许在试点城市（北京、上海、天津、湖北、江苏、浙江、山东、广东、福建）假期期间24小时/周，但需要学校和当地公安批准+兼职就业证。毕业后：转Z签证+工作许可+居留许可（标准雇主路径），或申请创业/留居签（外国人创新/创业居留许可）在自贸区创业。真实就业去向：多数想留的毕业生进入跨国公司、中国科技公司或教育机构。兼职收入个税3-45%累进；勤工助学收入部分免税。',
    keyTakeaways: [
      'X1持证人可校内工作16小时/周，需学校批准（勤工助学）',
      '9个试点城市假期允许校外24小时/周',
      '需备：学校批准+兼职就业证+公安备案',
      '勤工助学收入部分免税（¥800-3,500/月视当月）',
      '毕业后转Z签证+工作许可+居留许可（标准雇主路径）',
      'Z工签总成本¥4-6万（多由雇主承担），处理2-4个月',
      '60+自贸区有创业签；1年以上商业计划+¥5万+注册资本',
      '留居签选项：北京海归、上海留学人员、深圳孔雀计划、杭州全球引才',
    ],
    sections: [
      {
        id: 'x1-basics',
        h2: 'X1签证允许做什么、不能做什么',
        intro:
          'X1签证是长期学习签证（覆盖整个学习期，>180天）。它明确允许在条件满足时做兼职和实习，但条件与旅游签或短期学生签不同。搞错了会罚款、遣返、未来拒签。',
        blocks: [
          {
            type: 'table',
              caption: 'X1 vs X2 vs Z签证工作权益',
              columns: ['签证类型', '在学期间工作权益', '毕业后路径'],
              rows: [
                ['X1 (长期, >180天)', '校内16h/周 + 试点城市校外24h/周', '转Z工签或留居签'],
                ['X2 (短期, <180天)', '不允许兼职', '必须离境；如入学更长可重新申请X1'],
                ['Z (工作)', '完整工作权，雇主担保', '可续签，可转永居'],
                ['F (商务)', '仅商务活动，不可受雇', '如获工作offer可转Z'],
              ],
          },
          {
            type: 'h3',
            text: '3条基本规则',
            body:
              '（1）必须有有效居留许可，不仅是X1签证盖章——居留许可是国内身份证件。（2）不能做违反中国劳动法的工作（未成年、危险行业等）。（3）不能为没有外国人工作许可配额雇主工作，这排除了多数小企业和非正式雇主。',
          },
          {
            type: 'h3',
            text: '什么算兼职',
            body:
              '任何有报酬的工作：科研助理、助教、家教（中文或母语）、图书馆员、宿舍管理员、餐厅服务员、咖啡师、语言学校老师、市场实习、软工实习、翻译。无薪实习不要求工作证但应通过学校国际办备案。',
          },
        ],
      },
      {
        id: 'on-campus',
        h2: '校内兼职（勤工助学）：最易路径',
        intro:
          '校内工作是国际学生最简单、最常见的路径。学校本身就是雇主，材料少，收入部分免税。多数国际学生通过校内工作月入¥2,000-6,000。',
        blocks: [
          {
            type: 'h3',
            text: '怎么找到校内工作',
            body:
              '三个主要渠道：（1）学校国际学生事务办公室（留学生办公室）——每周发布岗位。（2）学生处——同样岗位，中国学生也申请。（3）直接联系——邮件联系你想合作的教授，问科研助理或助教岗。多数教授先从已有学生中招聘。',
          },
          {
            type: 'h3',
            text: '常见校内岗位',
            body:
              '科研助理：¥2,500-5,000/月，10-15h/周，与教授合作科研。助教：¥2,000-4,000/月，8-12h/周，批改作业、主持辅导课、坐班答疑。语言辅导：¥100-200/小时，时间灵活，辅导其他学生你的母语。图书馆助理：¥2,000-3,000/月，8-12h/周，上架、前台。宿舍管理员：免住宿+¥1,000-2,000津贴，要求中文流利。',
          },
          {
            type: 'h3',
            text: '4步批准流程',
            body:
              '（1）拿到教授或部门的offer。（2）向学校国际学生事务办公室提交兼职申请表——通常1页，包括：姓名、护照号、居留许可号、雇主（学校部门）、工作描述、h/周、持续时间。（3）办公室3-5个工作日内审核批准。（4）可开始工作，办公室10天内通知公安。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '保留批准表复印件。如果公安例行检查居留许可，这张表能证明你合法工作。否则视为未经授权的工人。',
          },
        ],
      },
      {
        id: 'off-campus',
        h2: '校外兼职：试点城市路径',
        intro:
          '2017年起，中国在选定城市试点允许X1持证人假期期间校外工作。2023年扩大范围。材料比校内工作繁重，工时上限严格。',
        blocks: [
          {
            type: 'h3',
            text: '9个试点城市/省份',
            body:
              '北京、上海、天津（直辖市）、湖北（武汉）、江苏（南京、苏州、无锡）、浙江（杭州、宁波）、山东（济南、青岛）、广东（广州、深圳）、福建（厦门、福州）。这9个以外地区，即便学校批准也不允许校外兼职。',
          },
          {
            type: 'h3',
            text: '5步批准流程',
            body:
              '（1）拿到中国注册雇主的offer（必须有外国人工作许可配额，9试点城市之一）。（2）向学校国际办申请校外工作批准。（3）学校通知当地公安。（4）到当地劳动局申请"外国人就业证"——10-15个工作日。（5）开始工作。全程3-6周。',
          },
          {
            type: 'h3',
            text: '工时和收入规则',
            body:
              '官方寒暑假期间上限24小时/周。非假期：8小时/周（仅周末，部分城市）。收入3-45%累进个税。勤工助学收入享受月度起征点（¥800-3,500）。校外兼职收入从第一元起全额计税，但前¥5,000/月通常低于起征点。',
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '无证校外工作视为非法就业。处罚：¥5,000-20,000罚款、遣返、5-10年禁入。风险真实——公安对语言学校、家教中心、餐厅的抽查抓过学生。务必办手续。',
          },
        ],
      },
      {
        id: 'internships',
        h2: '实习：与兼职分离',
        intro:
          '实习（实习）法律基础与兼职不同。与学业挂钩，常有报酬，通常不要求单独工作证。雇主必须是注册中国实体，且实习必须与专业相关。',
        blocks: [
          {
            type: 'h3',
            text: '课程实习（培养方案要求）',
            body:
              '多数学位项目要求1-3个月实习才能毕业。这些是强制的，学校安排或批准你自行找，法律依据是X1签证+学校开具的实习证明。收入按正常工资计税。部分公司额外提供住宿或餐补。',
          },
          {
            type: 'h3',
            text: '非课程实习',
            body:
              '硕士、博士常见。规则同校外兼职：仅试点城市，需公安备案，不需单独工作证。多数国际学生实习去科技公司（字节、腾讯、阿里、美团、华为）、金融（跨国银行）、咨询（麦肯锡、BCG、贝恩）、教育（新东方、华尔街英语、EF）。津贴¥150-500/天视公司岗位。',
          },
          {
            type: 'h3',
            text: '4周暑期实习周期',
            body:
              '中国主要科技公司6-8月开暑期实习项目。2-3月开放申请。4周是最短，8-12周更有用。部分公司把优秀实习生转正（return offer）毕业后留用。顶尖大学（QS Top 200）的国际学生有些公司会优先考虑。',
          },
        ],
      },
      {
        id: 'post-study-z-visa',
        h2: '毕业后：Z工签路径',
        intro:
          'Z签证是标准雇主担保工作签证。需要中国雇主为你担保工作许可，然后发Z签邀请函，你到中国驻外使馆申请Z签，入境后30天内转居留许可。全程从拿到offer到居留许可2-4个月。',
        blocks: [
          {
            type: 'h3',
            text: '5步Z签路径',
            body:
              '（1）拿到中国注册雇主offer。（2）雇主向当地劳动局申请"外国人工作许可证"。雇主总成本：¥40,000-60,000（含政府处理费等）。2-4周。（3）雇主发Z签邀请函（PU函或正式邀请函）。（4）到中国驻外使馆（本国家，不含港澳）申请Z签，4-7个工作日。（5）持Z签入境，30天内申请工作类居留许可。居留许可是国内身份证件，有效1-5年。',
          },
          {
            type: 'h3',
            text: '雇主需要你提供什么',
            body:
              '至少本科（部分岗位要求硕士）、多数岗位2年以上工作经验（应届生部分入门岗可免）、无犯罪记录、体检合格。雇主把材料提交劳动局。顶尖大学（QS Top 200）理工学位可走快速通道（A级工作许可，1-2周处理代替4周）。',
          },
          {
            type: 'h3',
            text: '真实雇主组合',
            body:
              '跨国公司（60%）：微软、谷歌、苹果、亚马逊、普华永道、德勤、汇丰、渣打等——通常英语工作，老外友好。中国科技（15%）：字节、腾讯、阿里、美团、京东、拼多多——竞争薪酬（硕士应届¥30-80万/年），高强度工作文化。教育（10%）：大学、国际学校、语言培训中心——¥20-40万/年。国企（5%）：流程多、薪酬低、稳定。创业公司（10%）：变化大、常有期权，高风险。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '顶尖大学硕士毕业、中文流利（HSK 5+）的国际学生在中国科技和教育岗位有竞争力。仅本科学位更适合入门岗或教育岗。',
          },
        ],
      },
      {
        id: 'entrepreneur-visa',
        h2: '留居签：创业、人才、自贸区',
        intro:
          '没有Z签工作offer，几个城市为毕业生、创业者、外国人才提供留居签。每种条件不同，合适的选择取决于你的背景、城市和长期规划。',
        blocks: [
          {
            type: 'h3',
            text: '外国人创新/创业居留许可',
            body:
              '60+自贸区（FTZ）和创新城市提供。要求：本科及以上、商业计划获当地创新委员会批准、注册资本¥5万+（视城市）、自贸区办公场所、1年以上商业计划。有效期：2-5年，可续。允许在境内生活和经营企业。配偶和未成年子女可办家庭团聚签随行。常见城市：上海浦东FTZ、北京中关村、深圳前海、杭州、苏州、成都、武汉。',
          },
          {
            type: 'h3',
            text: '海归/留学人员证',
            body:
              '部分城市为本地大学毕业的外国学生发放海归证。证件1-3年，可续，允许在任何行业工作、创业或无雇主居留。例子：北京海归——北京高校毕业生。上海留学人员——上海高校毕业生。杭州全球引才——Top 100高校毕业生。每种申请流程不同；查当地公安出入境管理办公室。',
          },
          {
            type: 'h3',
            text: '真实永居路径',
            body:
              '持Z工签居留许可连续4年后，可申请中国永久居留（中国绿卡，字面意思"绿卡"）。要求：稳定收入、无犯罪记录、雇主担保、无犯罪历史。处理时间6-12个月。或3年投资（¥50万+投入中国企业）或5年与中国人结婚。绿卡难拿但价值极高——取消多数工作限制、自由出入境、享受与中国公民同等社会服务。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '持X1签证国际学生能在中做兼职吗？',
        a: '能，但有条件。校内工作（勤工助学）允许16h/周，需学校国际办批准。校外兼职允许9试点城市/省（北京、上海、天津、湖北、江苏、浙江、山东、广东、福建）官方寒暑假期间24h/周，需学校和公安双重批准。规则外工作属于非法，可罚款、遣返或未来拒签。',
      },
      {
        q: '什么是勤工助学？',
        a: '勤工助学是学生校内兼职的官方称呼。学校本身就是雇主。常见岗位：科研助理、助教、图书馆员、家教。收入部分免税（¥800-3,500/月视当月）。通过学校国际学生事务办公室批准，3-5个工作日。国际学生最简单最常见的在学期间赚钱方式。',
      },
      {
        q: '国际学生每周可工作几小时？',
        a: '校内：学期内16h/周，假期更多。校外（仅试点城市）：官方寒暑假24h/周，非假期8h/周（仅周末）。超过上限属未经授权就业。',
      },
      {
        q: '国际学生兼职要交个税吗？',
        a: '要。中国个税3-45%累进。勤工助学收入享受月度起征点（¥800-3,500）。校外兼职收入从第一元全额计税，但前¥5,000/月通常低于起征点。雇主代扣代缴；3-4月年度汇算清缴可申请多缴退税。',
      },
      {
        q: '国际学生毕业后能留在中国吗？',
        a: '能，三条主要路径。（1）Z工签——雇主担保，需要offer和工作许可（¥4-6万，2-4个月处理）。（2）创业/留居签——60+自贸区和创新城市提供2-5年居留许可给创业的毕业生。（3）海归证——北京海归、上海留学人员等给本地高校毕业生。持Z工签居留4年后可申请永居。',
      },
      {
        q: 'Z工签要多少钱？',
        a: '工作许可本身政府费¥400-1,500视城市和处理速度。常见的¥4-6万数字是雇主总成本（含法律/行政费、文件翻译、政府处理），雇主通常承担。处理时间：A级（Top 200大学理工毕业生）2-4周，B级4-8周。拿到工作许可后，到中国驻外使馆申请Z签，然后境内申请居留许可。',
      },
      {
        q: '哪些中国城市最适合国际毕业生就业？',
        a: '北京、上海、深圳、广州、杭州、成都前6。北京和上海跨国雇主最多、英语工作最集中。深圳科技最强（华为、腾讯、比亚迪、大疆），创业友好。杭州（阿里、网易）和成都（生活方式更放松）正在崛起。6个都在校外兼职试点城市范围内。',
      },
      {
        q: '中国绿卡是什么？',
        a: '中国永久居留。资格：Z工签居留4年+稳定收入+无犯罪记录；或3年投资（¥50万+投入中国企业）；或5年与中国人结婚。处理时间6-12个月。有效期5年（自动续）。绿卡取消多数工作限制、允许自由出入境、享受与中国公民同等社会服务。',
      },
    ],
    howToSteps: [
      { name: '确认签证和城市', text: 'X1签证+有效居留许可是任何兼职的前提。校外兼职仅9试点城市/省：北京、上海、天津、湖北、江苏、浙江、山东、广东、福建。这之外，专注校内勤工助学。' },
      { name: '找对校内工作', text: '每周看学校国际学生事务办公室的岗位。邮件联系你想合作的教授科研/助教岗。常见岗位：科研助理（¥2,500-5,000/月）、助教（¥2,000-4,000/月）、家教（¥100-200/小时）、图书馆助理（¥2,000-3,000/月）。' },
      { name: '提交兼职申请', text: '1页表交给国际学生事务办公室：姓名、护照、居留许可、雇主（学校部门）、工作描述、h/周、持续时间。批准3-5个工作日。保留复印件。' },
      { name: '试点城市校外工作：办工作证', text: '拿到有外国人工作许可配额的中国注册雇主offer。向学校申请校外批准。学校通知公安。到当地劳动局申请"外国人就业证"（10-15个工作日）。' },
      { name: '实习：与培养方案对齐', text: '课程实习（培养方案要求）：学校安排或批准。非课程实习：同校外兼职规则。提前2-3月申请；中国主要科技公司2-3月招6-8月实习。' },
      { name: '毕业前6个月：规划毕业后路径', text: '三个选项：（1）Z工签——开始申请会担保工作许可的岗位。（2）创业/留居签——写商业计划、找自贸区、备注册资本。（3）海归证——查你大学的所在城市项目。' },
      { name: 'Z签路径：完成工作许可+签证+居留许可序列', text: '雇主申请工作许可（A级2-4周、B级4-8周）。雇主发Z签邀请函。到中国驻外使馆申请Z签（4-7个工作日）。入境后30天内申请工作类居留许可（1-5年有效）。' },
      { name: '持Z工签居留4年后：申请永居', text: '要求：Z工签居留4年连续+稳定收入+无犯罪记录+雇主担保+无犯罪历史。处理6-12个月。或3年投资（¥50万+）或5年与中国人结婚。中国绿卡难拿但价值极高——取消多数工作限制、享受与中国公民同等社会服务。' },
    ],
    ctaTitle: '需要在中国规划职业的帮助？',
    ctaSubtitle:
      'SICA可以连接你与担保Z工签的公司、为你的商业计划建议合适自贸区、带你走完30天毕业后居留许可流程。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      { href: '/guides/visa', label: '学生签证 (X1 / X2)', description: '材料清单、费用、办理时长、居留许可、兼职、续签。' },
      { href: '/guides/scholarships', label: '中国留学奖学金', description: 'CSC、孔子学院、院校、省市奖学金——各自覆盖什么，怎么申请。' },
      { href: '/guides/application', label: '如何申请', description: '完整申请时间线、材料清单、奖学金路径。' },
    ],
  },
};

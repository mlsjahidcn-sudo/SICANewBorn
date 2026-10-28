import type { LocalizedGuide } from './types';
// [verify] Editorial claims previously marked for confirmation — re-check official notices before relying on figures or dates.

/**
 * Short SERP answer: age limits + study gaps for China.
 * Target query: "age limit to study in china".
 */
export const ageLimitToStudyInChinaGuide: LocalizedGuide = {
  en: {
    slug: 'age-limit-to-study-in-china',
    eyebrow: 'GUIDE · ADMISSIONS · FAQ',
    title: 'Age Limit to Study in China (and Study Gaps)',
    description:
      'Age limits for studying in China 2027: CSC bachelor’s ≤25, master’s ≤35, PhD ≤40; university self-funded rules; how study gaps are handled.',
    seoTitle: 'Age Limit to Study in China 2027 | SICA',
    seoDescription:
      'China study age limits: CSC ≤25 / ≤35 / ≤40, typical university ranges, MBBS caps, and whether a study gap blocks admission.',
    subtitle:
      'Short answer first: Chinese universities rarely ban mature students outright, but CSC scholarships and some degree tracks publish hard age caps. Study gaps are usually fine if you can explain them.',
    stats: [
      { value: '≤25', label: 'CSC bachelor’s (typical)' },
      { value: '≤35', label: 'CSC master’s (typical)' },
      { value: '≤40', label: 'CSC PhD (typical)' },
      { value: 'Gap OK', label: 'If explained + documented' },
    ],
    quickAnswer:
      'There is **no single national age ban** for every Chinese university program. For the **Chinese Government Scholarship (CSC)**, the working caps are usually **bachelor’s ≤25, master’s ≤35, PhD ≤40** (as of the year of enrollment; confirm each notice). Self-funded university admission is often more flexible — many bachelor’s programs prefer roughly **18–25**, while master’s/PhD accept older applicants if academics and language fit. **Study gaps** (1–3+ years) are common and accepted when you show work, exams, family care, or language prep with dates. MBBS and some medicine tracks can be stricter — check the school’s admission notice.',
    keyTakeaways: [
      'CSC age caps are the ones applicants hit most often (≤25 / ≤35 / ≤40)',
      'Self-funded university rules vary; read the program notice, not only CSC rules',
      'A gap year is not automatic rejection — unexplained multi-year blanks are the risk',
      'Age is usually calculated as of 1 September of the intake year',
      'Medicine / MBBS may add tighter caps — confirm before paying fees',
    ],
    sections: [
      {
        id: 'csc-age',
        h2: 'CSC scholarship age limits',
        intro: 'If you need full funding, start here.',
        blocks: [
          {
            type: 'table',
            caption: 'Typical CSC age caps (confirm on your country / university notice)',
            columns: ['Level', 'Usual maximum age', 'Notes'],
            rows: [
              ['Bachelor’s', '≤25', 'Often as of 1 Sep of the enrollment year'],
              ['Master’s / general scholar', '≤35', 'Some categories differ'],
              ['PhD / senior scholar', '≤40', 'Supervisor match still matters more than age'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Country bilateral notices and Type B university programs can tweak wording. If you are one year over a published cap, assume CSC will refuse — do not rely on informal “flexibility” promises.',
          },
        ],
      },
      {
        id: 'university-age',
        h2: 'University (self-funded) age rules',
        intro: 'Outside CSC, age is a soft filter more often than a hard wall.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Bachelor’s** — many schools expect recent high-school graduates (~18–25); older applicants may need a strong gap explanation',
              '**Master’s / PhD** — age rarely blocks if GPA, language, and research fit',
              '**Language / foundation year** — often the most flexible track before a degree',
              '**Always check** — the admitting college’s PDF notice beats any blog summary',
            ],
          },
          {
            type: 'links',
            items: [
              { label: 'Admission requirements by degree', href: '/china-university-admission-requirements' },
              { label: 'CSC Scholarship 2027/2028', href: '/chinese-government-scholarship-csc' },
            ],
          },
        ],
      },
      {
        id: 'study-gap',
        h2: 'Study gaps: what works',
        intro: 'Gaps are normal. Silence about them is not.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1–2 years** — usually fine (work, IELTS/HSK, family, retakes)',
              '**3+ years** — still possible with a dated CV, employer letters, or certificates',
              '**What to write** — one short paragraph in the study plan: dates + what you did + why you are ready now',
              '**What fails** — blank years with no story, or conflicting dates across CV / transcript / form',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Name and date consistency matter more than the gap length. Mismatched timelines trigger document returns at both university and visa stages.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the age limit to study in China?',
        a: 'There is no one age for all programs. CSC typically uses ≤25 (bachelor’s), ≤35 (master’s), ≤40 (PhD). Self-funded university programs are often more flexible — always read the specific admission notice.',
      },
      {
        q: 'Can I study in China at 30?',
        a: 'Yes for many master’s and PhD programs, and for self-funded routes. CSC master’s usually allows up to 35; CSC bachelor’s usually does not at age 30.',
      },
      {
        q: 'Does a study gap affect China university admission?',
        a: 'A explained gap rarely blocks admission. Unexplained multi-year blanks, or gaps that contradict your CV, cause problems. Document work, exams, or caregiving with dates.',
      },
      {
        q: 'Is there a special age limit for MBBS in China?',
        a: 'Some medical faculties publish tighter age preferences than general bachelor’s programs. Verify the current MOE-listed university’s notice before applying.',
      },
    ],
    howToSteps: [
      {
        name: 'Decide funding route',
        text: 'CSC → check the ≤25 / ≤35 / ≤40 caps. Self-funded → read the university notice.',
      },
      {
        name: 'Calculate age for the intake year',
        text: 'Use the date rule in the notice (often 1 September of the enrollment year).',
      },
      {
        name: 'Explain any gap in one paragraph',
        text: 'Add dated activities to your CV and study plan so timelines match.',
      },
    ],
    ctaTitle: 'Not sure if your age or gap fits?',
    ctaSubtitle:
      'SICA counselors map CSC vs self-funded options for your profile in a free 10-minute consult.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC Scholarship 2027/2028',
        description: 'Where the ≤25 / ≤35 / ≤40 caps usually appear.',
      },
      {
        href: '/how-to-write-study-plan-china',
        label: 'Study plan for China',
        description: 'Where to explain a study gap cleanly.',
      },
      {
        href: '/china-university-admission-requirements',
        label: 'Admission requirements by degree',
        description: 'GPA, language, and documents by level.',
      },
    ],
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
  },
  zh: {
    slug: 'age-limit-to-study-in-china',
    eyebrow: '指南 · 招生 · 问答',
    title: '来华留学年龄限制（含学籍空档）',
    description:
      '2027 年来华留学年龄：CSC 本科 ≤25、硕士 ≤35、博士 ≤40；自费院校规则；学籍空档如何说明。',
    seoTitle: '来华留学年龄限制 2027 | SICA',
    seoDescription:
      '中国留学年龄限制：CSC ≤25/≤35/≤40、院校常见区间、MBBS 上限，以及空档年是否影响录取。',
    subtitle:
      '先给短答案：中国高校很少“一刀切”禁止大龄学生，但 CSC 与部分学位项目有硬性年龄上限。学籍空档通常可以，关键是说清楚。',
    stats: [
      { value: '≤25', label: 'CSC 本科（常见）' },
      { value: '≤35', label: 'CSC 硕士（常见）' },
      { value: '≤40', label: 'CSC 博士（常见）' },
      { value: '空档可', label: '说明清楚即可' },
    ],
    quickAnswer:
      '**没有**适用于所有中国大学项目的统一年龄禁令。**中国政府奖学金（CSC）**常见上限为**本科 ≤25、硕士 ≤35、博士 ≤40**（按入学年计算；以各通知为准）。自费录取往往更灵活——许多本科偏好约 **18–25**，硕博在学业与语言达标时可接受更大年龄。**学籍空档**（1–3 年及以上）很常见，只要能用工作、考试、家庭事务或语言培训等写清日期即可。MBBS 等医学项目可能更严——以招生简章为准。',
    keyTakeaways: [
      '申请人最常撞上的是 CSC 年龄上限（≤25 / ≤35 / ≤40）',
      '自费院校规则各异；看项目通知，不要只看 CSC',
      '空档年不会自动拒录——说不清的多年空白才是风险',
      '年龄通常按入学年 9 月 1 日计算',
      '医学 / MBBS 可能更严——缴费前务必确认',
    ],
    sections: [
      {
        id: 'csc-age',
        h2: 'CSC 奖学金年龄限制',
        intro: '若需要全额资助，从这里开始。',
        blocks: [
          {
            type: 'table',
            caption: 'CSC 常见年龄上限（以本国/高校通知为准）',
            columns: ['层次', '常见上限', '说明'],
            rows: [
              ['本科', '≤25', '常按入学年 9 月 1 日计算'],
              ['硕士 / 普通进修', '≤35', '部分类别不同'],
              ['博士 / 高级进修', '≤40', '导师匹配往往比年龄更关键'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '双边国家通知与 Type B 高校项目可能改写表述。若已超过公布上限一年，应按 CSC 拒件处理——不要依赖口头“可以通融”。',
          },
        ],
      },
      {
        id: 'university-age',
        h2: '高校（自费）年龄规则',
        intro: '在 CSC 之外，年龄更多是软筛选而非硬墙。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**本科**——许多学校期望应届高中毕业生（约 18–25）；更大年龄需有力空档说明',
              '**硕士 / 博士**——GPA、语言与研究匹配达标时，年龄很少成为硬障碍',
              '**语言 / 预科**——进入学位前往往最灵活',
              '**务必核对**——招生学院 PDF 通知优于任何博客摘要',
            ],
          },
          {
            type: 'links',
            items: [
              { label: '分学位录取要求', href: '/china-university-admission-requirements' },
              { label: 'CSC 奖学金 2027/2028', href: '/chinese-government-scholarship-csc' },
            ],
          },
        ],
      },
      {
        id: 'study-gap',
        h2: '学籍空档：怎样说明有效',
        intro: '空档很正常；对空档沉默不正常。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1–2 年**——通常无妨（工作、雅思/HSK、家庭、重考）',
              '**3 年及以上**——附带注明日期的简历、在职证明或证书仍可申请',
              '**怎么写**——学习计划中一小段：时间 + 做了什么 + 为何现在准备好',
              '**易失败点**——无故事的空白年，或简历/成绩单/表格日期互相矛盾',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '来华留学年龄限制是多少？',
        a: '没有适用于所有项目的单一年龄。CSC 常见为本科 ≤25、硕士 ≤35、博士 ≤40。自费院校往往更灵活——务必阅读具体招生通知。',
      },
      {
        q: '30 岁还能来华留学吗？',
        a: '许多硕博与自费路径可以。CSC 硕士通常允许到 35；CSC 本科在 30 岁通常不行。',
      },
      {
        q: '学籍空档影响中国大学录取吗？',
        a: '说明清楚的空档很少直接拒录。说不清的多年空白，或与简历矛盾的空档，才会出问题。用日期记录工作、考试或照护等活动。',
      },
      {
        q: '中国 MBBS 有特别年龄限制吗？',
        a: '部分医学院可能比普通本科更严。申请前核实现行教育部名单内大学的招生通知。',
      },
    ],
    howToSteps: [
      {
        name: '确定资助路径',
        text: '走 CSC → 核对 ≤25 / ≤35 / ≤40。自费 → 阅读大学通知。',
      },
      {
        name: '按入学年计算年龄',
        text: '使用通知中的日期规则（常见为入学年 9 月 1 日）。',
      },
      {
        name: '用一段话说明空档',
        text: '在简历与学习计划中补上注明日期的活动，保持时间线一致。',
      },
    ],
    ctaTitle: '不确定年龄或空档是否合适？',
    ctaSubtitle: 'SICA 顾问可在 10 分钟免费咨询中帮你对照 CSC 与自费选项。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC 奖学金 2027/2028',
        description: '≤25 / ≤35 / ≤40 上限通常出现的位置。',
      },
      {
        href: '/how-to-write-study-plan-china',
        label: '赴华学习计划',
        description: '如何干净说明学籍空档。',
      },
      {
        href: '/china-university-admission-requirements',
        label: '分学位录取要求',
        description: '各层次 GPA、语言与材料。',
      },
    ],
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
  },
};

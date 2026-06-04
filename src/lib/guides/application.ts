import type { LocalizedGuide } from './types';

/**
 * "How to apply to Chinese universities" — process guide.
 * Target queries: "apply to chinese university", "china university
 * application", "china admission requirements", "china application
 * deadline".
 */
export const applicationGuide: LocalizedGuide = {
  en: {
    slug: 'application',
    eyebrow: 'GUIDE · APPLICATIONS',
    title: 'How to Apply to Chinese Universities: Step-by-Step (2026)',
    description:
      'Step-by-step application guide for Chinese universities: timeline, required documents, language tests, application channels, and what to do after you are admitted.',
    subtitle:
      'Every document, every deadline, every form — mapped out so nothing falls through the cracks.',
    stats: [
      { value: '8-12 wks', label: 'Document prep time' },
      { value: '12 mo', label: 'Recommended lead time' },
      { value: 'May 31', label: 'Typical fall deadline' },
      { value: '5%', label: 'Acceptance rate (top 10)' },
    ],
    quickAnswer:
      'The Chinese university application runs December through May for September intake. You apply online (most use studyinchina.edu.cn or the university portal), submit transcripts, a personal statement, two recommendation letters, language test scores (IELTS/TOEFL for English programs, HSK 4-5 for Chinese), and a physical examination form. Bachelor\'s applicants need a high school diploma; master\'s applicants need a bachelor\'s degree; PhD applicants need a master\'s plus a research proposal. Universities issue admission notices and the JW202 visa form by June-August. Apply for scholarships in parallel, since CSC and university awards have similar deadlines but separate application systems.',
    keyTakeaways: [
      'Start preparing documents 4-6 months before your target application window',
      'Most universities use the Study in China portal (studyinchina.edu.cn)',
      'Bachelor\'s deadline: end of May. Master\'s and PhD: end of March (top schools) to May',
      'CSC scholarship has a separate, earlier application (typically April 15)',
      'You can apply to multiple universities at once (typically 3-5 is normal)',
      'Always apply for scholarships in parallel — they don\'t auto-apply',
    ],
    sections: [
      {
        id: 'application-timeline',
        h2: 'Application timeline: 12 months at a glance',
        intro:
          'If you are starting in September, the process really starts the previous September. Here is the recommended calendar.',
        blocks: [
          {
            type: 'table',
            caption: 'Recommended 12-month timeline for September intake',
            columns: ['When', 'What to do', 'Notes'],
            rows: [
              ['September (T-12 mo)', 'Shortlist 5-8 universities and programs', 'Use the SICA directory + filter by ranking, city, language'],
              ['October (T-11 mo)', 'Take IELTS/TOEFL/HSK if needed', 'Book the test early — slots fill up before December'],
              ['November (T-10 mo)', 'Request transcripts + start personal statement', 'Allow 4-6 weeks for official transcripts to arrive'],
              ['December (T-9 mo)', 'Universities open applications; ask for recommendation letters', 'Most schools go live in mid-December'],
              ['January-March (T-8 to T-6 mo)', 'Submit applications + apply for CSC', 'CSC deadline is typically April 15'],
              ['April-May (T-5 to T-4 mo)', 'Final submissions + wait for admissions', 'Some schools issue rolling admissions from March'],
              ['June-July (T-3 to T-2 mo)', 'Receive admission notice + JW202', 'Apply for student visa once you have these documents'],
              ['August (T-1 mo)', 'Visa in hand, book flights, prepare for arrival', 'Arrive 1-2 weeks before orientation'],
              ['September (T-0)', 'Start of program', 'Mandatory orientation week covers registration, residence permit, banking'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'If you are applying for a March intake, the timeline shifts by 6 months. The application window is typically October-December of the previous year.',
          },
        ],
      },
      {
        id: 'required-documents',
        h2: 'Required documents: the complete checklist',
        intro:
          'Every Chinese university has slightly different requirements, but this 11-item list covers what 95% of programs ask for.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Passport** — valid for at least 1 year beyond program start, with at least 2 blank pages',
              '**High school diploma** (bachelor\'s) / **bachelor\'s degree** (master\'s) / **master\'s degree** (PhD) — notarized English translation required',
              '**Official transcripts** — all years of study, with English translation, sent directly from the institution',
              '**Personal statement** — 800-1,200 words for bachelor\'s, 1,500-2,000 for master\'s, 2,000-3,000 for PhD',
              '**Two recommendation letters** — academic referees (professors, advisors) for bachelor\'s and master\'s; three for PhD',
              '**Language test scores** — IELTS 6.0+ or TOEFL 80+ for English programs; HSK 4-5 for Chinese',
              '**Physical examination form** — use the university\'s form, completed by a licensed doctor',
              '**Study plan / research proposal** — required for master\'s and PhD; 1,500-3,000 words',
              '**CV / Resume** — academic background, research, work experience, publications',
              '**Portfolio or work samples** — required for arts, architecture, design programs',
              '**Passport-style photos** — white background, taken within the last 6 months',
            ],
          },
          {
            type: 'h3',
            text: 'Document-specific notes',
            body:
              'Notarized translations: many Chinese universities require documents notarized by a public notary in addition to translation. Check the specific school\'s requirements. Some universities accept notarized translations done in China after you arrive, but this delays the visa process.',
          },
        ],
      },
      {
        id: 'language-requirements',
        h2: 'Language requirements: English vs Chinese programs',
        intro:
          'About 60% of SICA partner universities offer English-taught programs. The other 40% require Chinese language proficiency.',
        blocks: [
          {
            type: 'h3',
            text: 'For English-taught programs',
            body:
              'Most bachelor\'s programs require IELTS 6.0+ or TOEFL 80+. Top programs (Tsinghua, Peking, Fudan) often ask for IELTS 6.5+ or TOEFL 92+. Some universities waive language requirements for applicants from English-speaking countries or those who completed secondary education in English.',
          },
          {
            type: 'h3',
            text: 'For Chinese-taught programs',
            body:
              'Bachelor\'s programs usually require HSK 4 (180+). Master\'s programs require HSK 5 (180+) or HSK 6. If you don\'t have the HSK level, you can apply for a 1-year Chinese language preparatory program (many universities offer these on scholarship).',
          },
          {
            type: 'h3',
            text: 'Bilingual programs',
            body:
              'Many MBAs and executive programs are bilingual (Chinese + English), so the language requirements are often lower. Check the program-specific requirements.',
          },
        ],
      },
      {
        id: 'application-channels',
        h2: 'Where to apply: the 3 main channels',
        intro:
          'There are three primary ways international students apply to Chinese universities. Most use a combination.',
        blocks: [
          {
            type: 'h3',
            text: '1. Study in China portal (studyinchina.edu.cn)',
            body:
              'Run by the China Scholarship Council, this is the official national platform. Most universities list programs here. You create an account, fill in personal info, upload documents, and pay the application fee (typically ¥400-800 per program).',
          },
          {
            type: 'h3',
            text: '2. University direct portals',
            body:
              'Top universities (Tsinghua, Peking, Fudan) often have their own portals and require direct application in addition to the CSC portal. Always check the university\'s international student website for the application channel.',
          },
          {
            type: 'h3',
            text: '3. Agents and consultants (like SICA)',
            body:
              'Licensed education agencies can help you compile documents, apply to multiple programs, and handle scholarship applications. SICA works with students across 40+ countries and has relationships with 9+ top Chinese universities.',
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Be cautious of unlicensed agents who promise guaranteed admission or scholarships — these are red flags. Always verify the agent\'s credentials and ask for references from past students.',
          },
        ],
      },
      {
        id: 'application-fees',
        h2: 'Application fees and what they cover',
        intro:
          'Application fees in China are modest by international standards. Here is the typical breakdown.',
        blocks: [
          {
            type: 'table',
            caption: 'Typical application fees in CNY (2026)',
            columns: ['Channel', 'Fee', 'What it covers'],
            rows: [
              ['CSC portal (studyinchina.edu.cn)', '¥400-800 per program', 'Document review + portal processing'],
              ['University direct portal', '¥400-1,200 per program', 'Same as CSC, sometimes includes assessment'],
              ['Service agents (SICA etc.)', '$200-500 per application', 'Document prep + submission + follow-up'],
              ['Language test (IELTS/TOEFL/HSK)', '$50-250', 'Standardized test fee'],
              ['Document notarization', '$50-200 per document', 'Translation + notary + apostille (if required)'],
              ['Medical examination', '$50-150', 'Physical exam + bloodwork + chest X-ray'],
            ],
          },
        ],
      },
      {
        id: 'after-admission',
        h2: 'After admission: from acceptance to arrival',
        intro:
          'Once you have the admission notice, the next 60 days matter. Here is the sequence.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Receive Admission Notice + JW202 form** — usually emailed or mailed in June-July',
              '**Apply for the X1 or X2 student visa** at your nearest Chinese embassy or consulate',
              '**Pay the tuition deposit** — typically 20-30% of annual tuition, due within 30 days of admission',
              '**Book accommodation** — apply for the on-campus dorm through the university portal',
              '**Buy health insurance** — most universities require you to buy a specific plan; cost ~¥800/year',
              '**Arrange travel** — arrive 1-2 weeks before the start date to settle in',
              '**Complete online pre-registration** — universities send a link 2-3 weeks before orientation',
              '**Attend orientation** — mandatory; covers residence permit, bank account, SIM card, course registration',
            ],
          },
          {
            type: 'h3',
            text: 'Documents to bring in person',
            body:
              'Pack the originals of every document you submitted (passport, diplomas, transcripts, recommendation letters, language scores, medical form). Universities verify originals during on-site registration. Bring 10-15 passport-style photos for various forms.',
          },
        ],
      },
      {
        id: 'rejection-and-appeals',
        h2: 'Rejections and what to do',
        intro:
          'Rejections happen. Here is how to handle them and what your options are.',
        blocks: [
          {
            type: 'p',
            text: 'Top Chinese universities (Tsinghua, Peking) have acceptance rates of 3-7% for international students. Most other top-100 universities have rates of 15-30%. A rejection is not personal — it usually means you didn\'t match the program\'s specific profile that year.',
          },
          {
            type: 'h3',
            text: 'Your options after a rejection',
            body:
              'Three practical paths: (1) apply to less competitive programs within the same university (e.g., a different major at the same school), (2) apply to a similar program at a slightly lower-ranked university, or (3) re-apply next year with stronger credentials (better test scores, more work experience, stronger recommendation letters).',
          },
          {
            type: 'h3',
            text: 'How to strengthen a re-application',
            body:
              'Improve your language test score (a 0.5 IELTS bump or HSK level jump can change outcomes), add a year of relevant work or research experience, retake the GRE/GMAT if the program requires it, and have your recommenders address any specific weakness from the previous cycle.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'When should I start applying to Chinese universities?',
        a: 'Start preparing documents 4-6 months before the deadline. For September intake, the deadline is typically May 31 at most universities, with the application opening in December. For top-10 universities (Tsinghua, Peking), master\'s and PhD deadlines are often March 15. A 12-month lead time is the most comfortable schedule.',
      },
      {
        q: 'What documents do I need to apply to a Chinese university?',
        a: 'The standard package: passport, academic transcripts (notarized English translation), diploma/degree, personal statement, two recommendation letters, language test scores (IELTS/TOEFL or HSK), physical examination form on the university\'s template, study plan or research proposal (master\'s/PhD), CV, and passport-style photos. Arts programs also require a portfolio.',
      },
      {
        q: 'Do I need IELTS for Chinese universities?',
        a: 'Yes, for English-taught programs. Most bachelor\'s programs require IELTS 6.0+ or TOEFL 80+. Master\'s and PhD programs at top universities often ask for IELTS 6.5+ or TOEFL 92+. Chinese-taught programs instead require HSK 4-5. Some universities waive the requirement for students from English-speaking countries.',
      },
      {
        q: 'Can I apply to multiple Chinese universities at once?',
        a: 'Yes, and most students do. Most universities allow 3-5 simultaneous applications through the CSC portal. You\'ll pay the application fee (¥400-800) for each program. Having a SICA counselor coordinate this saves time and avoids duplicate document submissions.',
      },
      {
        q: 'How do I apply for a Chinese Government Scholarship (CSC)?',
        a: 'CSC has a separate application from the university admission. You apply through studyinchina.edu.cn (Chinese Government Scholarship category) or via your home country\'s CSC agency. Required documents: CSC Application Form, Admission Notice (or pre-admission from the university), transcripts, language scores, personal statement, recommendation letters, and a study plan. Deadline: typically April 15 for September intake.',
      },
      {
        q: 'How much is the application fee?',
        a: '¥400-800 per program (about $60-110 USD) for the CSC portal. University direct portals charge ¥400-1,200. Some universities waive the fee for scholarship applicants. SICA\'s full-service package (multiple applications + scholarships + visa help) is $200-500 per application.',
      },
      {
        q: 'What happens after I get admitted?',
        a: 'You receive the Admission Notice and JW202 form. You then apply for the X1 or X2 student visa, pay the tuition deposit (typically 20-30%), book the on-campus dorm, buy health insurance, and prepare to travel. Universities run a mandatory orientation 1-2 weeks before classes start.',
      },
      {
        q: 'Can I apply without IELTS or TOEFL?',
        a: 'For English-taught programs, no — you need an English proficiency score. For Chinese-taught programs, you need HSK instead. Some universities offer conditional admission: you take a 1-year language program, then enter the degree program once you reach the required language level. The language year is often free under a CSC preparatory scholarship.',
      },
    ],
    howToSteps: [
      {
        name: 'Shortlist programs and universities',
        text:
          'Match your field, ranking preference, city, language, and budget. Aim for 3-5 serious options and 1-2 backups.',
      },
      {
        name: 'Take the required language test',
        text:
          'IELTS 6.0+/TOEFL 80+ for English programs; HSK 4-5 for Chinese. Book the test 2-3 months before the application deadline.',
      },
      {
        name: 'Prepare your documents',
        text:
          'Gather transcripts, personal statement, recommendation letters, and the medical exam. Allow 8-12 weeks for the full set.',
      },
      {
        name: 'Apply online',
        text:
          'Create an account on studyinchina.edu.cn (or the university\'s portal) and submit your application before the deadline.',
      },
      {
        name: 'Apply for scholarships in parallel',
        text:
          'CSC, university, and provincial scholarships have separate applications. CSC deadline is typically April 15.',
      },
      {
        name: 'Wait for the admission decision',
        text:
          'Universities review applications on a rolling basis from March to June. Top programs may take longer.',
      },
      {
        name: 'Receive your admission package',
        text:
          'You\'ll get the Admission Notice, JW202 form, and a visa application guide. These are required for the student visa.',
      },
      {
        name: 'Apply for the X1 or X2 student visa',
        text:
          'Book an appointment at your nearest Chinese embassy or consulate. Bring the Admission Notice, JW202, passport, and the visa form.',
      },
      {
        name: 'Prepare for arrival',
        text:
          'Pay the deposit, book the dorm, buy insurance, and arrange travel. Arrive 1-2 weeks before orientation.',
      },
    ],
    ctaTitle: 'Skip the guesswork — let SICA handle the paperwork',
    ctaSubtitle:
      'Our counselors help you shortlist programs, compile documents, and apply to multiple universities and scholarships in parallel.',
    ctaApplyLabel: 'Start with free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/study-in-china',
        label: 'Why study in China',
        description: 'Top universities, costs, scholarships, student life, career outcomes.',
      },
      {
        href: '/guides/visa',
        label: 'Student visa (X1 / X2)',
        description: 'Document checklist, fees, processing times, and renewal rules.',
      },
      {
        href: '/scholarships',
        label: 'Browse scholarships',
        description: '50+ Chinese Government, university, and provincial scholarship programs.',
      },
    ],
  },

  zh: {
    slug: 'application',
    eyebrow: '指南 · 申请流程',
    title: '中国大学申请完整流程：分步指南（2026）',
    description:
      '中国大学申请分步指南：时间线、所需材料、语言考试、申请渠道、录取后流程。',
    subtitle: '每份材料、每个截止日、每张表格——一网打尽，再无遗漏。',
    stats: [
      { value: '8-12周', label: '材料准备时长' },
      { value: '12个月', label: '推荐准备周期' },
      { value: '5月31日', label: '秋季入学截止' },
      { value: '5%', label: '前10高校录取率' },
    ],
    quickAnswer:
      '中国大学9月入学的申请期是12月到次年5月。申请主要通过studyinchina.edu.cn或学校官方系统在线提交，需提交成绩单、个人陈述、两封推荐信、语言成绩（英文项目需雅思/托福，中文项目需HSK 4-5）和体检表。本科申请需高中毕业证，硕士需学士学位，博士需硕士学位加研究计划。学校6-8月发放录取通知书和JW202签证申请表。建议同步申请奖学金——CSC和院校奖截止日相近但走不同系统。',
    keyTakeaways: [
      '建议提前4-6个月开始准备材料',
      '大多数学校使用Study in China平台（studyinchina.edu.cn）',
      '本科截止：5月底；硕博：3月底（顶尖）到5月',
      'CSC奖学金申请单走系统，截止更早（一般4月15日）',
      '可以同时申请多所学校（一般3-5所）',
      '奖学金不会自动同步申请——必须单独提交',
    ],
    sections: [
      {
        id: 'application-timeline',
        h2: '申请时间线：12个月全局规划',
        intro: '如果目标是次年9月入学，其实前一年9月就要开始。下面是推荐日历。',
        blocks: [
          {
            type: 'table',
            caption: '9月入学推荐12个月时间线',
            columns: ['时间', '做什么', '备注'],
            rows: [
              ['9月 (T-12月)', '筛选5-8所大学和专业', '用SICA目录按排名、城市、授课语言筛选'],
              ['10月 (T-11月)', '参加雅思/托福/HSK考试', '提前报名——考位12月前会紧张'],
              ['11月 (T-10月)', '申请成绩单+开始写个人陈述', '官方成绩单寄达需4-6周'],
              ['12月 (T-9月)', '大学开放申请，请老师写推荐信', '大部分学校12月中旬上线'],
              ['1-3月 (T-8至T-6月)', '提交申请+申CSC', 'CSC截止日通常为4月15日'],
              ['4-5月 (T-5至T-4月)', '完成提交+等待录取', '部分学校3月起滚动录取'],
              ['6-7月 (T-3至T-2月)', '收到录取通知+JW202', '拿到后立即申请学生签证'],
              ['8月 (T-1月)', '签证到手，订机票，准备出发', '开学前1-2周到达'],
              ['9月 (T-0)', '正式开学', '新生说明会涵盖注册、居留许可、银行卡'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '3月入学的项目时间线整体前移6个月。申请窗口通常为前一年10-12月。',
          },
        ],
      },
      {
        id: 'required-documents',
        h2: '所需材料：完整清单',
        intro: '每所中国大学要求略有差异，但下面11项涵盖95%项目的需求。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**护照** — 有效期至少比项目开始日多1年，至少2页空白',
              '**高中毕业证**（本科）/ **学士学位证**（硕士）/ **硕士学位证**（博士）— 需公证英文翻译',
              '**官方成绩单** — 全部学年，英文翻译，由学校直接寄送',
              '**个人陈述** — 本科800-1,200字；硕士1,500-2,000字；博士2,000-3,000字',
              '**两封推荐信** — 学术推荐人（教授、导师），博士需3封',
              '**语言成绩** — 英文项目需雅思6.0+或托福80+；中文项目需HSK 4-5',
              '**体检表** — 使用学校指定表格，由正规医院医生填写',
              '**学习计划/研究计划** — 硕士、博士要求，1,500-3,000字',
              '**简历** — 学术背景、研究、工作经验、发表',
              '**作品集或作品样例** — 艺术、建筑、设计专业要求',
              '**证件照** — 白底，6个月内拍摄',
            ],
          },
          {
            type: 'h3',
            text: '材料说明',
            body:
              '公证翻译：很多中国大学除翻译外还要求公证。建议先确认学校具体要求。部分学校接受到达中国后再公证，但会延误签证办理。',
          },
        ],
      },
      {
        id: 'language-requirements',
        h2: '语言要求：英文 vs 中文授课',
        intro: 'SICA合作院校中约60%提供英文授课项目，其余40%要求中文。',
        blocks: [
          {
            type: 'h3',
            text: '英文授课项目',
            body:
              '本科一般要求雅思6.0+或托福80+。顶尖项目（清华、北大、复旦）常要求雅思6.5+或托福92+。母语为英语的国家或在英语国家完成学业的学生可申请豁免。',
          },
          {
            type: 'h3',
            text: '中文授课项目',
            body:
              '本科一般要求HSK 4（180分+）。硕士一般要求HSK 5（180分+）或HSK 6。未达标可先读1年语言预科（多校设有奖学金资助）。',
          },
          {
            type: 'h3',
            text: '双语项目',
            body:
              '很多MBA和高管项目是双语（中英），语言要求较低。请查看具体项目要求。',
          },
        ],
      },
      {
        id: 'application-channels',
        h2: '在哪里申请：3大主渠道',
        intro: '国际生申请中国大学主要有3种方式。大多数人会组合使用。',
        blocks: [
          {
            type: 'h3',
            text: '1. Study in China平台（studyinchina.edu.cn）',
            body:
              '由国家留学基金管理委运营，是官方国家平台。大多数学校在此发布项目。注册账户、填信息、上传材料、付申请费（每项目¥400-800）。',
          },
          {
            type: 'h3',
            text: '2. 学校官方招生系统',
            body:
              '顶尖大学（清华、北大、复旦）通常有自己的系统，要求在CSC平台之外直接申请。请务必查看学校国际生官网的具体渠道。',
          },
          {
            type: 'h3',
            text: '3. 留学机构（如SICA）',
            body:
              '正规留学机构能帮你整理材料、多项目申请、奖学金申请。SICA服务于40+国家的学生，与9+所中国顶尖大学有合作关系。',
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '警惕那些承诺"保录"或"保奖"的不正规机构——这是危险信号。请核实机构资质并要过往学生的推荐。',
          },
        ],
      },
      {
        id: 'application-fees',
        h2: '申请费：多少钱、含什么',
        intro: '中国大学申请费在国际市场属中低水平。下面是典型拆分。',
        blocks: [
          {
            type: 'table',
            caption: '2026年典型申请费（人民币）',
            columns: ['渠道', '费用', '含什么'],
            rows: [
              ['CSC平台（studyinchina.edu.cn）', '每项目¥400-800', '材料审核+平台处理'],
              ['学校官方系统', '每项目¥400-1,200', '同CSC，有时含评估'],
              ['留学机构（SICA等）', '每项目$200-500', '材料准备+提交+跟进'],
              ['语言考试（雅思/托福/HSK）', '$50-250', '标准化考试费'],
              ['材料公证', '每份$50-200', '翻译+公证+附加认证（如需）'],
              ['体检', '$50-150', '体检+抽血+胸片'],
            ],
          },
        ],
      },
      {
        id: 'after-admission',
        h2: '录取后：从录取到入学',
        intro: '拿到录取通知后，接下来60天很关键。下面是流程顺序。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**收到录取通知书+JW202表** — 一般6-7月通过邮件或快递寄送',
              '**申请X1或X2学生签证** — 在最近的使领馆办理',
              '**缴学费定金** — 通常是全年学费的20-30%，录取后30天内',
              '**预订宿舍** — 通过学校系统申请校内宿舍',
              '**购买医保** — 大多数学校要求购买指定计划，~¥800/年',
              '**安排行程** — 开学前1-2周到达',
              '**完成在线预注册** — 开学前2-3周学校会发链接',
              '**参加新生说明会** — 强制参加，涵盖居留许可、银行卡、电话卡、选课',
            ],
          },
          {
            type: 'h3',
            text: '随身携带的原件',
            body:
              '把所有提交过的材料原件都带上（护照、毕业证、成绩单、推荐信、语言成绩、体检表）。注册时学校会核验原件。再带10-15张证件照备用。',
          },
        ],
      },
      {
        id: 'rejection-and-appeals',
        h2: '被拒了怎么办',
        intro: '拒信是常事。下面是怎么应对、有哪些选择。',
        blocks: [
          {
            type: 'p',
            text: '顶尖中国大学（清华、北大）国际生录取率仅3-7%。其他QS前100一般在15-30%。拒信不是针对个人——通常只是当年与项目要求不太匹配。',
          },
          {
            type: 'h3',
            text: '被拒后的三条路',
            body:
              '三条实用途径：(1) 申请同校其他竞争较小的项目；(2) 申请排名稍低学校的类似项目；(3) 明年再申，用更强的背景冲刺（更高语言成绩、更多工作/研究经验、更有力的推荐信）。',
          },
          {
            type: 'h3',
            text: '如何加强二次申请',
            body:
              '提升语言成绩（雅思涨0.5或HSK升级都可能改变结果）、积累1年相关工作或研究经历、重考GRE/GMAT（如需）、让推荐人在信中针对上次具体短板回应。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '什么时候开始申请中国大学？',
        a: '建议提前4-6个月准备材料。9月入学的截止日一般是5月31日，12月开放申请。顶尖10校（清华、北大）的硕博截止更早，常为3月15日。12个月的准备周期最从容。',
      },
      {
        q: '申请中国大学需要哪些材料？',
        a: '标准清单：护照、成绩单（公证英文翻译）、学历学位证、个人陈述、两封推荐信、语言成绩（雅思/托福或HSK）、学校指定体检表、学习计划或研究计划（硕博）、简历、证件照。艺术类专业还需要作品集。',
      },
      {
        q: '中国大学需要雅思吗？',
        a: '英文授课项目需要。大多数本科要求雅思6.0+或托福80+。顶尖学校硕博常要求雅思6.5+或托福92+。中文授课项目需要HSK 4-5。母语为英语国家学生可豁免。',
      },
      {
        q: '可以同时申请多所中国大学吗？',
        a: '可以，大多数学生都这样做。通过CSC平台，大多数学校允许同时申请3-5个项目。每项目要交申请费（¥400-800）。让SICA顾问统筹能省时间、避免重复上传。',
      },
      {
        q: 'CSC政府奖学金怎么申请？',
        a: 'CSC与大学录取是独立的两套申请。通过studyinchina.edu.cn的"中国政府奖学金"类别或本国CSC机构申请。所需：CSC申请表、录取通知书（或预录取）、成绩单、语言成绩、个人陈述、推荐信、学习计划。截止日一般为4月15日。',
      },
      {
        q: '申请费多少钱？',
        a: 'CSC平台每项目¥400-800（约$60-110美元）。学校直接申请¥400-1,200。部分学校对奖学金申请者免申请费。SICA的全流程服务（多项目+奖学金+签证）$200-500/项目。',
      },
      {
        q: '录取后怎么办？',
        a: '收到录取通知书和JW202表。然后申请X1或X2学生签证，缴学费定金（一般20-30%），预订校内宿舍，购买医保，安排行程。开学前1-2周有强制新生说明会。',
      },
      {
        q: '没有雅思或托福能申请吗？',
        a: '英文授课项目必须有英语成绩。中文授课项目需HSK。部分大学提供有条件录取：先读1年语言项目，达到要求后再入读学位。语言年常可走CSC预科奖学金。',
      },
    ],
    howToSteps: [
      { name: '筛选专业和大学', text: '匹配专业、排名、城市、语言、预算。3-5个主申+1-2个保底。' },
      { name: '参加语言考试', text: '英文项目需雅思6.0+/托福80+；中文项目需HSK 4-5。提前2-3个月报考。' },
      { name: '准备申请材料', text: '成绩单、个人陈述、推荐信、体检。预留8-12周。' },
      { name: '在线提交', text: '在studyinchina.edu.cn或学校招生系统注册并提交申请。' },
      { name: '同步申请奖学金', text: 'CSC、院校奖、省级奖是独立申请。CSC截止通常为4月15日。' },
      { name: '等待录取', text: '大学3-6月滚动审核，顶尖项目可能更久。' },
      { name: '收到录取材料', text: '录取通知书、JW202表、签证指南。办学生签证必备。' },
      { name: '申请X1或X2学生签证', text: '预约最近的使领馆。带录取通知书、JW202、护照、签证表。' },
      { name: '准备出发', text: '缴定金、订宿舍、买保险、订机票。开学前1-2周到达。' },
    ],
    ctaTitle: '跳过猜测——让SICA帮你搞定文书',
    ctaSubtitle: 'SICA顾问帮你筛选项目、整理材料、并行申请多所大学和奖学金。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      { href: '/guides/study-in-china', label: '为什么来中国留学', description: '顶尖大学、学费、奖学金、校园生活、职业发展。' },
      { href: '/guides/visa', label: '学生签证 (X1 / X2)', description: '材料清单、费用、办理时长、续签规则。' },
      { href: '/scholarships', label: '浏览奖学金', description: '50+项中国政府、大学、省级奖学金。' },
    ],
  },
};

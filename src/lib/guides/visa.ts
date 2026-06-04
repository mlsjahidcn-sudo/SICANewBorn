import type { LocalizedGuide } from './types';

/**
 * "China student visa (X1 / X2)" — process guide.
 * Target queries: "china student visa", "x1 visa china", "x2 visa
 * china", "china student visa requirements", "china residence
 * permit".
 */
export const visaGuide: LocalizedGuide = {
  en: {
    slug: 'visa',
    eyebrow: 'GUIDE · STUDENT VISA',
    title: 'China Student Visa (X1 / X2): Complete Application Guide',
    description:
      'How to apply for a Chinese student visa: X1 vs X2, required documents, fees, processing times, residence permit, work rights, and renewals.',
    subtitle:
      'Once you have your admission notice, this is the next 4-7 days that matter.',
    stats: [
      { value: 'X1 / X2', label: 'Two student visa types' },
      { value: '$25-90', label: 'Standard visa fee' },
      { value: '4-7 days', label: 'Processing time' },
      { value: '30 days', label: 'Must apply for residence permit' },
    ],
    quickAnswer:
      'The X1 visa is for programs longer than 180 days (most full-time degrees); X2 is for 30-180 days (language programs, exchange, short courses). You need an Admission Notice and JW202 form from your university, a valid passport, a completed visa application form, a recent photo, and a physical examination form. The visa costs $25-90 USD depending on nationality (varies by reciprocity) and is processed in 4-7 business days. After arriving in China, you must apply for a Residence Permit within 30 days — this allows you to stay for the full duration of your program and includes a multi-entry permit.',
    keyTakeaways: [
      'X1 = programs over 180 days (most full degrees). X2 = 30-180 day programs',
      'You need the Admission Notice AND the JW202 form from your university',
      'Apply at your nearest Chinese embassy or consulate — processing is 4-7 business days',
      'Visa fee is $25-90 USD, depending on your nationality',
      'After arrival, apply for a Residence Permit within 30 days (X1 holders)',
      'You can work part-time on campus (8 hrs/week) with university approval',
    ],
    sections: [
      {
        id: 'x1-vs-x2',
        h2: 'X1 vs X2: which visa do you need?',
        intro:
          'Chinese student visas split into two categories. Picking the wrong one creates a real problem — you would have to leave China and re-apply.',
        blocks: [
          {
            type: 'table',
            caption: 'X1 vs X2 visa comparison',
            columns: ['Feature', 'X1 (long-term study)', 'X2 (short-term study)'],
            rows: [
              ['Program length', '180+ days', '30-180 days'],
              ['Typical for', 'Bachelor, master, PhD, 1-year language', 'Semester exchange, summer program, short course'],
              ['Initial validity', '30 days (single entry)', '30-180 days (single or multiple entry)'],
              ['Required after arrival', 'Residence Permit within 30 days', 'None — exit and re-enter on visa expiry'],
              ['Work rights', 'On-campus part-time with university approval', 'Generally no'],
              ['Renewal', 'Through Residence Permit, renewable annually', 'Re-apply from outside China'],
              ['Family accompaniment', 'Spouse and minor children can apply for family visa', 'Generally not eligible'],
            ],
          },
          {
            type: 'h3',
            text: 'How to choose',
            body:
              'For 99% of international students in a full-time degree program, the answer is X1. The only common X2 case is a semester exchange or a 1-2 month summer program. If you are unsure, ask your university\'s international office — they issue the right JW202 form for your program.',
          },
        ],
      },
      {
        id: 'required-documents',
        h2: 'Required documents: the visa application package',
        intro:
          'Most embassies require the same core documents. Some add country-specific items (financial proof, police clearance).',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Passport** — original, valid for at least 1 year beyond program start, with at least 2 blank pages',
              '**Visa Application Form** — completed online at the embassy\'s website or the COVA system, then printed and signed',
              '**Admission Notice** — the original or a certified copy from the Chinese university',
              '**JW201 or JW202 form** — issued by the university. JW201 for CSC scholars; JW202 for self-funded',
              '**Physical Examination Form** — the same one used for university admission, completed by a licensed doctor',
              '**Passport-style photo** — white background, taken within the last 6 months (usually 48x33mm)',
              '**Proof of financial means** — bank statement showing ~$5,000-10,000 USD equivalent (some embassies require this)',
              '**Travel insurance** — some embassies require proof of insurance covering at least the first month in China',
              '**Police clearance certificate** — for students from countries where this is required (Pakistan, Nigeria, Bangladesh, and a few others)',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Document requirements vary by embassy. Always check the specific embassy website for your country before applying. Some embassies process student visa applications only on certain days or by appointment.',
          },
        ],
      },
      {
        id: 'application-process',
        h2: 'How to apply: step-by-step',
        intro:
          'The application is straightforward once you have your documents. Most embassies have moved to online submission with a drop-off appointment.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Check your embassy\'s specific requirements** — most have a dedicated "student visa" page on their website',
              '**Fill in the visa application form online** — COVA (China Online Visa Application) is the standard system for most embassies',
              '**Book an appointment** — many embassies require one, especially for student visa or first-time applicants',
              '**Print the form and gather your documents** — original Admission Notice + JW202 are the critical two',
              '**Attend the appointment** — submit the application, pay the fee, and have your biometrics (photo + fingerprints) taken',
              '**Wait for processing** — standard is 4-7 business days, but it can stretch to 2-3 weeks in peak season (June-August)',
              '**Pick up your passport** — most embassies offer a tracking number or email notification',
            ],
          },
          {
            type: 'h3',
            text: 'Express processing',
            body:
              'Some embassies offer 1-3 day express processing for an additional fee ($20-50). It\'s worth the cost if your program start date is close.',
          },
        ],
      },
      {
        id: 'visa-fees',
        h2: 'Visa fees and processing times',
        intro:
          'Visa fees follow the principle of reciprocity — what Chinese citizens pay for a US or UK visa, you pay for a Chinese visa. Most countries pay $25-90.',
        blocks: [
          {
            type: 'table',
            caption: 'Typical student visa fees and processing times (2026)',
            columns: ['Country / region', 'Standard fee (USD)', 'Express fee', 'Processing time'],
            rows: [
              ['United States', '$140', '$165', '4-7 business days'],
              ['United Kingdom', '£151 (~190 USD)', '+£30', '5-10 business days'],
              ['Canada', '$90', '$115', '4-7 business days'],
              ['Australia', '$110', '$140', '4-7 business days'],
              ['European Union (most)', '€60-90', '+€20-40', '4-7 business days'],
              ['Pakistan', '$80', '$110', '5-10 business days'],
              ['Bangladesh', '$60', '$90', '5-10 business days'],
              ['Nigeria', '$90', '$120', '5-10 business days'],
              ['Russia', '$90', '$120', '5-10 business days'],
              ['Most African countries', '$60-80', '+20-30', '5-10 business days'],
              ['Most Asian countries', '$30-60', '+15-25', '3-7 business days'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Fees are updated periodically. Always check the embassy\'s website for the current rate. Some countries also offer multi-entry options at higher cost.',
          },
        ],
      },
      {
        id: 'residence-permit',
        h2: 'After arrival: the Residence Permit (X1 holders)',
        intro:
          'Your X1 visa is valid for 30 days. Within those 30 days, you must apply for a Residence Permit — a longer-term document that covers your entire program.',
        blocks: [
          {
            type: 'p',
            text: 'The Residence Permit is issued by the local Public Security Bureau (PSB) Exit-Entry Administration. Your university\'s international student office will help you schedule the appointment and prepare the documents. The process takes 7-15 business days.',
          },
          {
            type: 'h3',
            text: 'Required documents for the Residence Permit',
            body:
              'Your passport with the X1 visa, the Admission Notice, JW202, the physical examination form, a recent photo, a registration form from the local police station (your university helps with this), the housing registration form from the dormitory, and a Residence Permit application form filled in at the PSB.',
          },
          {
            type: 'h3',
            text: 'How long is the Residence Permit valid?',
            body:
              'The permit is usually valid for the duration of your program (1-4 years for a bachelor\'s, 2-3 for a master\'s, 3-5 for a PhD). It is a multiple-entry document, meaning you can leave and re-enter China freely during its validity.',
          },
        ],
      },
      {
        id: 'work-rights',
        h2: 'Work rights: what you can (and cannot) do',
        intro:
          'Student visas allow limited work. Here is what is permitted, what is not, and what counts as "work" in China.',
        blocks: [
          {
            type: 'h3',
            text: 'What is allowed',
            body:
              'On-campus part-time work (research assistant, library, English tutor, cafeteria staff): up to 8 hours per week, with university approval. Off-campus internships related to your field of study: with university approval and a separate internship permit from the PSB. Entrepreneurship on a student visa: limited — you can\'t operate a full business, but small freelance consulting and online tutoring are tolerated.',
          },
          {
            type: 'h3',
            text: 'What is not allowed',
            body:
              'Full-time employment, self-employment that competes with local businesses, work outside your field of study, and any work without university approval. Violations can lead to visa revocation and deportation.',
          },
          {
            type: 'h3',
            text: 'Typical student earnings',
            body:
              'On-campus jobs pay ¥20-50/hour. Tutoring English is at the higher end (¥50-150/hour for private lessons). Internships in tech or finance can pay ¥200-500/day for graduate students. Even with these rates, the work is meant to supplement living expenses, not replace a salary.',
          },
        ],
      },
      {
        id: 'renewal-and-extension',
        h2: 'Renewal, extension, and re-application',
        intro:
          'Here is what to do when your Residence Permit or visa is about to expire.',
        blocks: [
          {
            type: 'h3',
            text: 'Renewing the Residence Permit (X1)',
            body:
              'Apply 30 days before the permit expires. The process is faster than the initial application (3-7 business days). Required: passport, current Residence Permit, university enrollment verification, and a recent photo. Universities have a dedicated team for this — start at the international student office.',
          },
          {
            type: 'h3',
            text: 'Extending the X2 visa',
            body:
              'X2 cannot be extended in China. You must leave the country before the visa expires, then re-apply from your home country (or another country\'s Chinese embassy) for a new visa.',
          },
          {
            type: 'h3',
            text: 'Changing programs or universities',
            body:
              'If you transfer to a different program or university, your Residence Permit must be re-issued. The process takes 7-15 business days. The new university provides an updated Admission Notice and JW202 form.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the X1 visa for China?',
        a: 'The X1 visa is the Chinese long-term student visa, valid for programs over 180 days — most bachelor\'s, master\'s, and PhD programs, plus 1-year language programs. The visa is initially valid for 30 days, after which you must apply for a Residence Permit to stay for the full duration of your program. The Residence Permit is multiple-entry, so you can travel freely in and out of China during your studies.',
      },
      {
        q: 'What is the X2 visa for China?',
        a: 'The X2 visa is the short-term student visa for programs of 30-180 days — semester exchanges, summer programs, short-term language courses, and research visits. The visa is valid for the program duration and does not require a Residence Permit. You cannot extend an X2 visa in China; you would need to re-apply from outside the country.',
      },
      {
        q: 'How much does a Chinese student visa cost?',
        a: 'Visa fees follow reciprocity: $140 USD for US citizens, £151 for UK, €60-90 for most EU, $90 for Canadians, $30-60 for most Asian countries, $60-80 for most African countries. Express processing adds $20-50. Always check your specific embassy for the current rate.',
      },
      {
        q: 'How long does it take to get a Chinese student visa?',
        a: 'Standard processing is 4-7 business days at most embassies. Express processing (1-3 days) is available for an extra $20-50 fee. Peak season (June-August, before September intake) can extend processing to 2-3 weeks. Apply as soon as you have your Admission Notice and JW202 form.',
      },
      {
        q: 'What documents do I need for a Chinese student visa?',
        a: 'Passport valid for 1+ year, completed visa application form, Admission Notice from the university, JW201 or JW202 form, physical examination form, passport-style photo, proof of financial means ($5,000-10,000 USD equivalent), and — for some countries — a police clearance certificate. Check your specific embassy for country-specific requirements.',
      },
      {
        q: 'Can I work on a Chinese student visa?',
        a: 'Yes, with limits. On-campus part-time work (research, library, tutoring) is allowed up to 8 hours per week with university approval. Off-campus internships related to your field of study require a separate internship permit. You cannot work full-time or operate a business. Most students earn ¥1,000-3,000/month from part-time work.',
      },
      {
        q: 'What is a Residence Permit in China?',
        a: 'The Residence Permit is the document that allows X1 visa holders to stay in China for the full duration of their program (1-5 years, depending on the program). You must apply within 30 days of arrival at the local Public Security Bureau. The Permit is multiple-entry, so you can leave and re-enter China freely during its validity. It must be renewed annually (or for the program duration if shorter).',
      },
      {
        q: 'What if my visa is rejected?',
        a: 'A rejection is rare for student visas if you have a valid Admission Notice and JW202. Common reasons for rejection: incomplete documents, mismatched information, financial proof below the threshold, or security concerns from your home country. If rejected, the embassy will provide a reason. Address the issue and re-apply — there is no appeal process, but re-application is straightforward.',
      },
    ],
    howToSteps: [
      {
        name: 'Receive your Admission Notice and JW202',
        text:
          'The university issues these documents after you accept admission. JW201 is for CSC scholars; JW202 is for self-funded students.',
      },
      {
        name: 'Check your embassy\'s specific requirements',
        text:
          'Every embassy has slightly different requirements. Some require financial proof, police clearance, or biometrics.',
      },
      {
        name: 'Complete the visa application form online',
        text:
          'Use the China Online Visa Application (COVA) system. Print the form and sign it.',
      },
      {
        name: 'Book an appointment',
        text:
          'Many embassies require appointments, especially for first-time applicants or student visa categories.',
      },
      {
        name: 'Gather your documents',
        text:
          'Passport, application form, Admission Notice, JW202, physical exam form, photo, and any country-specific items.',
      },
      {
        name: 'Submit your application',
        text:
          'Attend the appointment, submit the documents, pay the fee, and have biometrics taken.',
      },
      {
        name: 'Wait for processing',
        text:
          '4-7 business days for standard processing. Some embassies offer 1-3 day express service for an extra fee.',
      },
      {
        name: 'Collect your passport with the visa',
        text:
          'The visa is valid for 30 days from entry. Plan your travel accordingly.',
      },
      {
        name: 'Apply for a Residence Permit within 30 days of arrival',
        text:
          'X1 holders must visit the local Public Security Bureau (PSB) to apply for a Residence Permit. Your university\'s international office will guide you through it.',
      },
    ],
    ctaTitle: 'Need help with the visa paperwork?',
    ctaSubtitle:
      'SICA counselors review your documents, schedule embassy appointments, and walk you through the Residence Permit process on arrival.',
    ctaApplyLabel: 'Get visa help',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/application',
        label: 'How to apply',
        description: 'Step-by-step application guide, documents, and timeline.',
      },
      {
        href: '/guides/study-in-china',
        label: 'Why study in China',
        description: 'Top universities, costs, scholarships, student life, career outcomes.',
      },
      {
        href: '/scholarships',
        label: 'Browse scholarships',
        description: '50+ Chinese Government, university, and provincial scholarship programs.',
      },
    ],
  },

  zh: {
    slug: 'visa',
    eyebrow: '指南 · 学生签证',
    title: '中国学生签证 (X1 / X2)：完整申请指南',
    description:
      '中国学生签证申请攻略：X1 vs X2、所需材料、费用、办理时长、居留许可、兼职、续签。',
    subtitle: '拿到录取通知后，这4-7天决定你能否顺利入学。',
    stats: [
      { value: 'X1 / X2', label: '两类学生签证' },
      { value: '$25-90', label: '标准签证费' },
      { value: '4-7天', label: '办理时长' },
      { value: '30天', label: '必须申请居留许可' },
    ],
    quickAnswer:
      'X1签证适用于180天以上项目（多数全日制学位），X2适用于30-180天（语言、交换、短期课程）。你需要大学的录取通知书和JW202表、有效护照、签证申请表、近照、体检表。签证费$25-90美元（按国籍有差异），4-7个工作日出签。入境后30天内必须申请居留许可——这是你整个项目期间的身份证明，并可多次出入境。',
    keyTakeaways: [
      'X1 = 180天以上项目（多数学位）；X2 = 30-180天',
      '必须持录取通知书 + JW202表',
      '在最近的中国使领馆办理，4-7个工作日出签',
      '签证费$25-90美元，按国籍有别',
      '入境后30天内申请居留许可（X1持有人）',
      '校内兼职每周8小时（需学校批准）',
    ],
    sections: [
      {
        id: 'x1-vs-x2',
        h2: 'X1 vs X2：你需要哪种？',
        intro: '中国学生签证分两类。选错会出大问题——你必须离境重新申请。',
        blocks: [
          {
            type: 'table',
            caption: 'X1 vs X2 签证对比',
            columns: ['特征', 'X1 (长期学习)', 'X2 (短期学习)'],
            rows: [
              ['项目长度', '180天以上', '30-180天'],
              ['典型用途', '本科、硕士、博士、1年语言', '学期交换、暑期项目、短期班'],
              ['首次有效期', '30天（单次入境）', '30-180天（单次或多次入境）'],
              ['入境后必办', '30天内办居留许可', '无需——签证到期离境'],
              ['兼职', '校内兼职（需学校批准）', '一般不允许'],
              ['续签', '走居留许可，每年可续', '需离境重新申请'],
              ['家属陪同', '配偶和未成年子女可办陪读签证', '一般不符合'],
            ],
          },
          {
            type: 'h3',
            text: '怎么选',
            body:
              '99%的全日制学位国际生选X1。X2的常见情况是学期交换或1-2个月暑期项目。不确定就问学校国际处——他们会按你的项目发对应JW202表。',
          },
        ],
      },
      {
        id: 'required-documents',
        h2: '所需材料：签证申请包',
        intro: '大多数使领馆要求相同的核心材料。部分会增加国别项目（资金证明、无犯罪记录）。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**护照** — 原件，有效期至少比项目开始日多1年，至少2页空白',
              '**签证申请表** — 在线（COVA系统）填好，签字后打印',
              '**录取通知书** — 中国大学原件或认证件',
              '**JW201或JW202表** — 学校出具。CSC奖学金用JW201；自费用JW202',
              '**体检表** — 与入学申请共用一份',
              '**证件照** — 白底，6个月内（一般48x33mm）',
              '**资金证明** — 银行流水显示约$5,000-10,000美元等值（部分使领馆要求）',
              '**旅行保险** — 部分使领馆要求证明首月已保险',
              '**无犯罪记录证明** — 部分国家（巴基斯坦、尼日利亚、孟加拉等）要求',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '材料要求因馆而异。提交前请查本国使领馆官网。部分使领馆只在特定日期或预约办理学生签证。',
          },
        ],
      },
      {
        id: 'application-process',
        h2: '怎么申请：分步流程',
        intro: '材料齐了之后流程不复杂。大多数使领馆已转为在线提交+预约递交。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**查询本国使领馆具体要求** — 大多有专门的"学生签证"页面',
              '**在线填写签证申请表** — COVA（China Online Visa Application）是多数使领馆的标准系统',
              '**预约递签时间** — 很多使领馆要求预约，尤其是学生签证或首次申请',
              '**打印表格并准备材料** — 录取通知书+JW202是核心',
              '**按预约时间递签** — 提交、缴费、采集生物信息（照片+指纹）',
              '**等待审理** — 标准4-7个工作日，旺季（6-8月）可能延至2-3周',
              '**领取护照** — 使领馆会提供查询号或邮件通知',
            ],
          },
          {
            type: 'h3',
            text: '加急办理',
            body:
              '部分使领馆提供1-3天加急服务，额外$20-50。开学日临近时值得花钱。',
          },
        ],
      },
      {
        id: 'visa-fees',
        h2: '签证费与办理时长',
        intro: '签证费按对等原则——中国公民付多少美/英签证费，你付多少中国签证费。大多数国家$25-90。',
        blocks: [
          {
            type: 'table',
            caption: '2026年典型学生签证费与办理时长',
            columns: ['国家/地区', '标准费 (USD)', '加急费', '办理时长'],
            rows: [
              ['美国', '$140', '$165', '4-7个工作日'],
              ['英国', '£151 (~190 USD)', '+£30', '5-10个工作日'],
              ['加拿大', '$90', '$115', '4-7个工作日'],
              ['澳大利亚', '$110', '$140', '4-7个工作日'],
              ['欧盟（多数）', '€60-90', '+€20-40', '4-7个工作日'],
              ['巴基斯坦', '$80', '$110', '5-10个工作日'],
              ['孟加拉国', '$60', '$90', '5-10个工作日'],
              ['尼日利亚', '$90', '$120', '5-10个工作日'],
              ['俄罗斯', '$90', '$120', '5-10个工作日'],
              ['多数非洲国家', '$60-80', '+20-30', '5-10个工作日'],
              ['多数亚洲国家', '$30-60', '+15-25', '3-7个工作日'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '费用定期更新。提交前请查使领馆官网。部分国家还提供多次入境选项，费用更高。',
          },
        ],
      },
      {
        id: 'residence-permit',
        h2: '入境后：居留许可（X1持有人）',
        intro: '你的X1签证有效期30天。在这30天内必须办居留许可——这是你整个项目期间的身份证明。',
        blocks: [
          {
            type: 'p',
            text: '居留许可由当地公安局出入境管理部签发。学校国际处会帮你预约并准备材料。流程7-15个工作日。',
          },
          {
            type: 'h3',
            text: '居留许可所需材料',
            body:
              '护照（贴X1签证）、录取通知书、JW202、体检表、近照、当地派出所登记单（学校协助）、宿舍住宿登记、公安局填写的居留许可申请表。',
          },
          {
            type: 'h3',
            text: '居留许可有效期',
            body:
              '通常与项目时长一致（本科1-4年、硕士2-3年、博士3-5年）。这是多次入境文件——有效期内可自由出入境。',
          },
        ],
      },
      {
        id: 'work-rights',
        h2: '兼职：能做与不能做',
        intro: '学生签证允许有限度的兼职。下面是允许的、不允许的、什么算"工作"。',
        blocks: [
          {
            type: 'h3',
            text: '允许的',
            body:
              '校内兼职（科研助理、图书馆、英文辅导、食堂）：每周最多8小时，需学校批准。校外专业相关实习：需学校批准并向公安局办单独的实习许可。学生创业：受限——不能开公司，但小规模咨询、线上辅导一般被默许。',
          },
          {
            type: 'h3',
            text: '不允许的',
            body:
              '全职就业、与本地企业竞争的自雇、专业外的工作、无学校批准的任何工作。违规会导致签证撤销并被遣返。',
          },
          {
            type: 'h3',
            text: '学生典型收入',
            body:
              '校内兼职时薪¥20-50。英文家教偏高端（私教¥50-150/小时）。研究生在科技或金融实习日薪¥200-500。即便如此，兼职仅用于补贴生活费，不替代正式工资。',
          },
        ],
      },
      {
        id: 'renewal-and-extension',
        h2: '续签、延期与重新申请',
        intro: '下面是居留许可或签证到期前的处理办法。',
        blocks: [
          {
            type: 'h3',
            text: '续签居留许可（X1）',
            body:
              '到期前30天申请。比首次办理快（3-7个工作日）。所需：护照、现有居留许可、学校在读证明、近照。从国际处开始走流程。',
          },
          {
            type: 'h3',
            text: '延长X2签证',
            body:
              'X2不能在中国境内延长。必须先出境，再从本国（或其他国家中国使领馆）重新申请。',
          },
          {
            type: 'h3',
            text: '转专业或转学',
            body:
              '转到不同项目或大学时，居留许可必须重办。流程7-15个工作日。新学校提供新录取通知书和JW202。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '什么是X1签证？',
        a: 'X1是中国长期学生签证，适用于180天以上项目——多数本科、硕士、博士，以及1年语言项目。签证首次有效期30天，入境后30天内必须办居留许可，涵盖整个项目期间。居留许可可多次入境。',
      },
      {
        q: '什么是X2签证？',
        a: 'X2是短期学生签证，适用于30-180天项目——学期交换、暑期项目、短期语言班、研究访问。签证有效期等于项目时长，无需办居留许可。X2不能在中国境内延长——必须离境重新申请。',
      },
      {
        q: '中国学生签证多少钱？',
        a: '签证费按对等原则：美国公民$140、英国£151、欧盟多数€60-90、加拿大$90、亚洲多数$30-60、非洲多数$60-80。加急+$20-50。请以本国使领馆最新公告为准。',
      },
      {
        q: '中国学生签证多久能下来？',
        a: '标准审理4-7个工作日。加急1-3天（+$20-50）。旺季（6-8月，9月入学前）可能延至2-3周。拿到录取通知书和JW202后立即申请。',
      },
      {
        q: '办中国学生签证需要什么材料？',
        a: '护照（1年+有效期）、签证申请表、录取通知书、JW201或JW202、体检表、证件照、资金证明（$5,000-10,000美元等值），部分国家需无犯罪记录证明。请以本国使领馆要求为准。',
      },
      {
        q: '学生签证能打工吗？',
        a: '可以，但有限制。校内兼职（科研、图书馆、家教）每周最多8小时，需学校批准。校外相关专业实习需办单独的实习许可。不能全职或开公司。学生月收入一般在¥1,000-3,000。',
      },
      {
        q: '什么是居留许可？',
        a: '居留许可是X1签证持有人能在中国合法居留整个项目期间（1-5年）的证明。入境后30天内必须到当地公安局申请。居留许可可多次入境——有效期内可自由出入境。需每年（或按项目时长）续签。',
      },
      {
        q: '签证被拒了怎么办？',
        a: '学生签证拒签很罕见，只要有有效的录取通知书和JW202。常见拒签原因：材料不齐、信息不符、资金证明不够、本国安全顾虑。被拒后使领馆会给出原因。补齐后重新申请——没有申诉流程，但重新申请很简单。',
      },
    ],
    howToSteps: [
      { name: '收到录取通知书和JW202', text: '录取确认后学校出具。CSC奖学金用JW201；自费生用JW202。' },
      { name: '查询本国使领馆要求', text: '每个使领馆略不同。部分需资金证明、无犯罪记录、生物信息。' },
      { name: '在线填签证申请表', text: '用COVA（China Online Visa Application）系统。打印签字。' },
      { name: '预约递签', text: '很多使领馆要求预约，尤其是首次申请或学生签证类别。' },
      { name: '准备材料', text: '护照、申请表、录取通知书、JW202、体检表、证件照，以及国别特殊项目。' },
      { name: '提交申请', text: '按预约递签、交材料、缴费、采生物信息。' },
      { name: '等待审理', text: '标准4-7个工作日，部分使领馆提供1-3天加急（额外收费）。' },
      { name: '领取护照', text: '签证从入境起30天有效。相应安排行程。' },
      { name: '入境后30天内办居留许可', text: 'X1持有人必须到当地公安局出入境办居留许可。学校国际处全程指导。' },
    ],
    ctaTitle: '签证材料需要人帮忙核对？',
    ctaSubtitle: 'SICA顾问审核你的材料、预约使领馆、协助入境后办居留许可。',
    ctaApplyLabel: '申请签证协助',
    ctaContactLabel: '联系顾问',
    related: [
      { href: '/guides/application', label: '如何申请', description: '申请流程、材料、时间线分步指南。' },
      { href: '/guides/study-in-china', label: '为什么来中国留学', description: '顶尖大学、学费、奖学金、校园生活、职业发展。' },
      { href: '/scholarships', label: '浏览奖学金', description: '50+项中国政府、大学、省级奖学金。' },
    ],
  },
};

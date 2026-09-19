import type { LocalizedGuide } from './types';

/**
 * "Does the CSCA apply to English-taught programs?" — Batch 4,
 * article #17 of the 20-article CSCA cluster
 * (docs/csca-content-plan.md).
 * Target queries: "csca english taught", "csca international
 * program", "english taught china csca".
 *
 * Static content. Applies-regardless-of-language is from the
 * cluster's verified baseline; combination variance for
 * English-taught degrees is framed as typical patterns to verify
 * per program.
 */
export const cscaEnglishTaughtGuide: LocalizedGuide = {
  en: {
    slug: 'csca-english-taught-programs',
    eyebrow: 'GUIDE · CSCA × ENGLISH-TAUGHT',
    title: 'Does the CSCA Apply to English-Taught Programs? Yes — Here\'s What You Actually Sit',
    description:
      'The CSCA is mandatory for English-taught bachelor\'s applicants too — IELTS/TOEFL does not exempt it. What English-taught candidates sit (usually fundamentals without the Chinese track), how the two tests stack, and the verification checklist.',
    subtitle:
      'The most persistent myth about the CSCA: that English-taught degree applicants are exempt. They are not — the mandate applies to international bachelor\'s applicants regardless of teaching language. What changes for English-taught candidates is the shape of the exam: most programs require the fundamentals (Mathematics plus program-specific sciences) without the Professional Chinese track, and your language evidence comes from IELTS/TOEFL instead of HSK. But combinations vary more across English-taught programs than any other category, which makes written verification per program the single most important step in your plan.',
    stats: [
      { value: 'Yes', label: 'The CSCA applies — English-taught too' },
      { value: 'IELTS/TOEFL', label: 'Your language test — not HSK' },
      { value: 'Fundamentals', label: 'What most English-taught candidates sit' },
      { value: 'Varies most', label: 'Combinations across English programs' },
    ],
    quickAnswer:
      'Yes — the CSCA applies to English-taught bachelor\'s programs. The mandate covers international applicants regardless of teaching language, and IELTS/TOEFL scores do not exempt it. What differs is the exam\'s shape: English-taught candidates typically sit the fundamental subjects — Mathematics (compulsory for everyone) plus the sciences their program names — often without the Professional Chinese track, though some programs do list it. Language requirements stack separately: IELTS/TOEFL for English-taught admission, exactly as HSK serves Chinese-taught programs. Because subject combinations for English-taught degrees vary more between universities than for Chinese-taught ones, verify each target program\'s combination in writing before you register for any session.',
    keyTakeaways: [
      'The CSCA mandate covers all international bachelor\'s applicants — English-taught programs included',
      'IELTS/TOEFL never exempts the CSCA; it is your language evidence, a separate requirement',
      'English-taught candidates usually sit fundamentals only: Math + program-named sciences, often without Professional Chinese',
      'Some English-taught programs DO list the Chinese track — the variance across English programs is the widest of any category',
      'Typical stack: CSCA fundamentals + IELTS/TOEFL + transcripts; total standardized cost stays modest',
      'Verify each program\'s combination in writing — assumptions are the #1 English-taught registration error',
    ],
    sections: [
      {
        id: 'the-mandate',
        h2: 'The mandate covers teaching languages equally',
        intro:
          'Start from the rule, then see why the myth persists.',
        blocks: [
          {
            type: 'p',
            text: 'The CSCA was designed as a universal academic yardstick for China\'s international bachelor\'s intake — and the intake is majority English-taught. Exempting English-taught applicants would have hollowed out the reform on day one, so the requirement applies to every bachelor\'s applicant regardless of whether their degree is taught in Chinese or English. The confusion is understandable: English proficiency tests have historically been the only standardized requirement for English-taught admission, and "I already have IELTS" feels like it should settle the matter. It settles the language matter; the academic-standardization matter is what the CSCA exists for.',
          },
          {
            type: 'ul',
            items: [
              '**Applies to** — English-taught bachelor\'s programs across business, engineering, medicine, computer science, and every other faculty',
              '**Also applies to** — CSC scholarship applicants through English-taught places; the scholarship mandate is not language-specific',
              '**Does not apply to** — master\'s and PhD applicants (outside the mandate); Chinese-language program applicants holding the HSK-4 exemption',
              '**The myth\'s origin** — pre-2026, English-taught admission genuinely ran on transcripts + IELTS alone; the CSCA is the new layer on top',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'If any source — agent, blog, or video — tells you English-taught programs skip the CSCA, treat it as outdated or wrong. Confirm with the university\'s admissions office and get the answer in writing.',
          },
        ],
      },
      {
        id: 'what-you-sit',
        h2: 'What English-taught candidates actually sit',
        intro:
          'The exam shape bends toward fundamentals — with real variance across programs. Here are the observed patterns.',
        blocks: [
          {
            type: 'table',
            caption: 'Observed CSCA shapes for English-taught programs (verify every one)',
            columns: ['Program family', 'Common combination', 'Notes'],
            rows: [
              ['Business / economics / management', 'Math (sometimes fundamentals-only)', 'Some programs list the Humanities Chinese track; many don\'t'],
              ['Engineering / computer science', 'Math + Physics', 'Occasionally STEM Chinese listed even for English-taught'],
              ['Medicine / MBBS', 'Math + Chemistry', 'The standard medicine route; see the MBBS guide'],
              ['International economics / trade', 'Math; sometimes + Humanities Chinese', 'China-facing programs often keep the language signal'],
              ['Design / media / humanities', 'Math + program-specific; combinations vary widely', 'The widest variance of any family — verify individually'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**The common core** — Mathematics appears in essentially every combination; it is compulsory for all candidates regardless of program language',
              '**The Chinese track question** — for English-taught degrees it is usually absent, but a meaningful minority of programs (especially China-facing business and international-relations programs) keep it; never assume either way',
              '**The union strategy** — when your list mixes combinations, register for the union of required subjects in one session; the ¥700 band makes the second, third, fourth subject nearly free',
              '**One written answer per program** — the email template: "For the [program] taught in English, which CSCA subjects are required for admission?" File every reply',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Candidates holding HSK 4–5 can also ask whether their score waives the Professional Chinese subject where a program lists it — the waiver route applies to English-taught applicants the same as anyone.',
          },
        ],
      },
      {
        id: 'stacking',
        h2: 'How IELTS/TOEFL and the CSCA stack',
        intro:
          'Two tests, two jobs, one calendar. The stacking is clean if you sequence them deliberately.',
        blocks: [
          {
            type: 'table',
            caption: 'The English-taught test stack',
            columns: ['Requirement', 'Test', 'What it certifies'],
            rows: [
              ['Academic competency', 'CSCA (program combination)', 'Math/science readiness on China\'s yardstick'],
              ['English proficiency', 'IELTS 6.0–6.5 / TOEFL 80–90 (typical thresholds)', 'Classroom English for the degree'],
              ['Academic record', 'Transcripts / A-Level / IB / equivalents', 'Your school-level performance'],
              ['Chinese proficiency', 'Not required (unless the program lists the Chinese track)', '—'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Neither covers the other** — IELTS does not exempt the CSCA; the CSCA does not replace IELTS. Plan them as two independent line items',
              '**Sequencing that works** — CSCA first when sessions are scarce (they are: 5/year), language test second (IELTS/TOEFL runs year-round nearly everywhere)',
              '**Retest economics** — IELTS/TOEFL retests are fast and available; CSCA retests wait for sessions. Put your scarce retake capacity on the CSCA',
              '**Total cost picture** — CSCA ¥700 (all subjects) + one language test ≈ $300–400; the English-taught stack is one of the cheaper international admission packages anywhere',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The one-calendar rule: map CSCA sessions and IELTS/TOEFL dates on the same page with your program deadlines. Both tests must LAND before deadlines; only their prep overlaps productively.',
          },
        ],
      },
      {
        id: 'prep-differences',
        h2: 'What English-taught candidates prepare differently',
        intro:
          'Without the Chinese track, your prep is the fundamentals system — with one habit change: everything reads in English plus symbol notation.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Fundamentals system unchanged** — the Math/Physics/Chemistry guides\' frameworks (diagnose, no-calculator, three-pass clock, mocks) apply exactly as written',
              '**Lighter notation burden** — without the Chinese track you still meet Chinese stems and diagram labels, but the vocabulary pressure is a fraction of the full-track candidate\'s; the ~60-term math glossary covers most of it',
              '**The glossary is still required** — "no Chinese track" does not mean "no Chinese on the paper"; stems and figures carry scenario terms you will want to read at speed',
              '**Skip the HSK entirely** — unless you are chasing a waiver for a program that lists the Chinese track, HSK preparation is wasted budget for English-taught candidates',
              '**More verification, less language prep** — the time English-taught candidates save on Chinese study should flow into program-combination verification and extra mock cycles',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'English-taught candidates have the leanest prep load of any category — typically one fundamentals subject set plus format training. The risk is not difficulty; it is assuming there is nothing to prepare.',
          },
        ],
      },
      {
        id: 'verification-checklist',
        h2: 'The English-taught verification checklist',
        intro:
          'Because combinations vary most in this category, verification is the plan. Six checks, one email each.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**CSCA required at all?** — confirm the program applies the mandate to its English-taught intake (nearly universal, but get it on record)',
              '**Exact subject combination** — which fundamentals, whether the Professional Chinese track is listed, and whether any waiver applies',
              '**Language thresholds** — IELTS/TOEFL minimum and whether specific scores gate scholarship consideration',
              '**Application deadline shape** — rolling vs fixed; English-taught programs often run earlier deadlines than assumed',
              '**Whether old scores help** — SAT/AP/A-Level treatment in the file, per the international-tests guide',
              '**Scholarship stacking** — which scholarships accept English-taught applicants and their CSCA expectations (the CSC mandate includes English-taught places)',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'One email per program per cycle, all answers filed. The English-taught category changes fastest because universities are still settling their combinations — last year\'s answer can be this year\'s rejected registration.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Do English-taught programs require the CSCA?',
        a: 'Yes — the CSCA applies to international bachelor\'s applicants regardless of teaching language. English-taught candidates typically sit the fundamentals (Math plus program-named sciences), often without the Professional Chinese track, and provide IELTS/TOEFL as language evidence.',
      },
      {
        q: 'Does my IELTS or TOEFL score exempt me from the CSCA?',
        a: 'No — English proficiency tests and the CSCA certify different things and stack as separate requirements. IELTS/TOEFL covers the language line for English-taught admission; the CSCA is the academic yardstick and remains mandatory.',
      },
      {
        q: 'Which CSCA subjects do English-taught business programs require?',
        a: 'Commonly Mathematics, sometimes fundamentals-only, and sometimes with the Humanities Chinese track — this family has real variance. Verify each program\'s exact combination in writing before registering.',
      },
      {
        q: 'Do I need to learn Chinese for an English-taught degree\'s CSCA?',
        a: 'Not as a study requirement — but you will still meet Chinese scenario terms on stems and diagram labels. The ~60-term notation glossary from the Math guide covers most of the reading friction without a full Chinese course.',
      },
      {
        q: 'Should I take HSK anyway to strengthen my application?',
        a: 'Only if a program on your list keeps the Professional Chinese track (where a qualifying HSK can waive it) or you have specific scholarship reasons. Otherwise HSK prep is wasted budget for English-taught candidates.',
      },
      {
        q: 'What should I sit first, the CSCA or IELTS/TOEFL?',
        a: 'Usually the CSCA — sessions run only 5 times a year while IELTS/TOEFL dates are plentiful. Bank the scarce exam first, then schedule the language test with a retest window before your deadlines.',
      },
    ],
    howToSteps: [
      {
        name: 'Kill the exemption myth in your own plan',
        text: 'Write "CSCA applies — English-taught included" at the top of your planning doc. Every downstream decision changes once this is internalized; assuming otherwise costs a session.',
      },
      {
        name: 'Run the verification email per program',
        text: 'Ask each target program for its required CSCA subjects, language threshold, and deadline shape in one email. File the written replies — they are your registration list and your evidence.',
      },
      {
        name: 'Register the union of subjects in one session',
        text: 'Collect every required subject across your list and sit them together — the ¥700 band prices the second and third subject at almost nothing.',
      },
      {
        name: 'Prep fundamentals with the subject guides\' systems',
        text: 'Diagnose, patch the weakest, train the no-calculator clock, run mocks — the standard fundamentals system, unchanged by your teaching language.',
      },
      {
        name: 'Build the light glossary, skip the full language track',
        text: 'The math/scenario term list covers stem and diagram reading for fundamentals papers. Skip HSK unless a waiver or program requirement makes it relevant.',
      },
      {
        name: 'Sequence CSCA first, language test second',
        text: 'Bank the scarce exam (5 sessions/year) before the flexible one (year-round IELTS/TOEFL). Map both on one calendar against your program deadlines, with a language retest window held back.',
      },
    ],
    ctaTitle: 'Applying to English-taught programs in China?',
    ctaSubtitle:
      'SICA counselors verify your programs\' CSCA combinations in writing, build the lean English-taught exam stack, and sequence the CSCA and IELTS/TOEFL against your deadlines. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The flagship overview: subjects, format, scoring, fees, and the CSC requirement.',
      },
      {
        href: '/csca-exam-exemptions',
        label: 'Who must take the CSCA — and who is exempt',
        description: 'The full exemption rules — including where English-taught candidates can still waive subjects.',
      },
      {
        href: '/csca-vs-sat-a-level-ib',
        label: 'CSCA vs SAT, A-Level & IB',
        description: 'How international scores stack with the CSCA for the same English-taught applications.',
      },
    ],
  },
  zh: {
    slug: 'csca-english-taught-programs',
    eyebrow: '指南 · CSCA × 英文授课',
    title: '英文授课项目要考 CSCA 吗？要——你实际考什么看这里',
    description:
      '英文授课本科申请者同样强制考 CSCA——雅思/托福不能豁免它。英文授课考生考什么（通常基础科、不含中文轨）、两类考试如何叠加，以及核验清单。',
    subtitle:
      '关于 CSCA 最顽固的误解：英文授课学位申请者可豁免。不能——强制令覆盖国际本科申请者，与授课语言无关。英文授课考生变的是考试形状：多数项目要求基础科（数学加项目指定理科）、不含专业中文轨，语言证明来自雅思/托福而非 HSK。但英文授课项目的组合差异比任何类别都大，这让「逐项目书面核验」成为你计划中最重要的单一步骤。',
    stats: [
      { value: '要', label: 'CSCA 适用——英文授课也是' },
      { value: '雅思/托福', label: '你的语言考试——不是 HSK' },
      { value: '基础科', label: '多数英文授课考生考的' },
      { value: '差异最大', label: '英文项目间的组合' },
    ],
    quickAnswer:
      '要——CSCA 适用于英文授课本科项目。强制令覆盖国际申请者、与授课语言无关，雅思/托福成绩不能豁免它。不同的是考试的形状：英文授课考生通常考基础科——数学（人人必考）加项目点名的理科——常不含专业中文轨，但部分项目确实列出。语言要求独立叠加：英文授课录取要雅思/托福，正如中文授课要 HSK。由于英文授课学位的科目组合在大学间差异最大，报名任何场次之前逐项目书面核验组合。',
    keyTakeaways: [
      'CSCA 强制令覆盖所有国际本科申请者——含英文授课项目',
      '雅思/托福永不豁免 CSCA；它是你的语言证明，是另一项要求',
      '英文授课考生通常只考基础科：数学 + 项目点名理科，常无专业中文',
      '部分英文授课项目确实列出中文轨——这一类的组合差异全场最大',
      '典型组合：CSCA 基础科 + 雅思/托福 + 成绩单；标准化总成本依然不高',
      '逐项目书面核验组合——假设是英文授课报名的头号错误',
    ],
    sections: [
      {
        id: 'the-mandate',
        h2: '强制令平等覆盖授课语言',
        intro:
          '从规则出发，再看误解为何顽固。',
        blocks: [
          {
            type: 'p',
            text: 'CSCA 被设计为中国国际本科招生的通用学术尺——而招生主体正是英文授课。豁免英文授课申请者会让改革在第一天就被掏空，所以要求覆盖每一位本科申请者，无论学位用中文还是英文授课。混淆可以理解：英语水平考试历来是英文授课录取唯一的标准化要求，「我已有雅思」似乎应该一锤定音。它锤定的是语言问题；而学术标准化问题正是 CSCA 存在的理由。',
          },
          {
            type: 'ul',
            items: [
              '**适用于**——商科、工科、医学、计算机及所有院系的英文授课本科项目',
              '**同样适用于**——经英文授课名额申 CSC 奖学金者；奖学金强制令与语言无关',
              '**不适用于**——硕士与博士申请者（不在强制令内）；持 HSK-4 豁免的中文授课项目申请者',
              '**误解的来源**——2026 年前，英文授课录取确实只跑成绩单 + 雅思；CSCA 是叠加其上的新层',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '若任何来源——中介、博客或视频——告诉你英文授课项目免 CSCA，把它当过时或错误处理。向大学招生办确认并拿到书面答复。',
          },
        ],
      },
      {
        id: 'what-you-sit',
        h2: '英文授课考生实际考什么',
        intro:
          '考试形状向基础科倾斜——但项目间存在真实差异。以下是观察到的模式。',
        blocks: [
          {
            type: 'table',
            caption: '英文授课项目的 CSCA 形状（逐一核验）',
            columns: ['项目族', '常见组合', '说明'],
            rows: [
              ['商科 / 经济 / 管理', '数学（有时仅基础科）', '部分项目列人文中文轨；多数不列'],
              ['工科 / 计算机', '数学 + 物理', '英文授课也偶尔列理工中文'],
              ['医学 / MBBS', '数学 + 化学', '标准医学路线；见 MBBS 指南'],
              ['国际经济 / 贸易', '数学；有时加人文中文', '面向中国的项目常保留语言信号'],
              ['设计 / 传媒 / 人文', '数学 + 项目指定；组合差异大', '全场差异最大的一族——逐一核验'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**公共核心**——数学出现在几乎每个组合里；它对全部考生必考、与项目语言无关',
              '**中文轨问题**——英文授课学位通常没有，但相当少数的项目（尤其面向中国的商科与国际关系）保留；两头都别假设',
              '**并集策略**——清单组合混合时，一场报所需科目的并集；¥700 档让第二、三、四科几乎免费',
              '**每项目一封书面答复**——邮件模板：「对英文授课的 [项目]，录取要求哪些 CSCA 科目？」每一封答复都归档',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '持 HSK 4-5 的考生还可以问：在列出中文轨的项目上，你的分数能否免考专业中文——免考通道对英文授课申请者一视同仁。',
          },
        ],
      },
      {
        id: 'stacking',
        h2: '雅思/托福与 CSCA 如何叠加',
        intro:
          '两场考试、两个职责、一本日历。刻意排序，叠加就很干净。',
        blocks: [
          {
            type: 'table',
            caption: '英文授课的考试栈',
            columns: ['要求', '考试', '认证什么'],
            rows: [
              ['学术能力', 'CSCA（项目组合）', '中国尺上的数理就绪度'],
              ['英语水平', '雅思 6.0-6.5 / 托福 80-90（典型阈值）', '学位课堂英语'],
              ['学业记录', '成绩单 / A-Level / IB / 同等', '你的校龄表现'],
              ['中文水平', '不要求（除非项目列中文轨）', '—'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**互不覆盖**——雅思不免 CSCA；CSCA 不替代雅思。把它们作为两条独立清单项规划',
              '**可行的排序**——先 CSCA（场次稀缺：一年 5 次），后语言考试（雅思/托福几乎全球全年可考）',
              '**重考经济学**——雅思/托福重考快且多；CSCA 重考要等场次。把稀缺的重考容量留给 CSCA',
              '**总成本画像**——CSCA ¥700（全科）+ 一次语言考试 ≈ $300-400；英文授课栈是国际录取包里最便宜的之一',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '「一本日历」法则：把 CSCA 场次、雅思/托福日期与项目截止画在同一页上。两场考试都必须在截止前落地；只有备考阶段才会有效重叠。',
          },
        ],
      },
      {
        id: 'prep-differences',
        h2: '英文授课考生备考有何不同',
        intro:
          '没有中文轨，你的备考就是基础科体系——只需一个习惯改变：一切以英文加符号记号阅读。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**基础科体系不变**——数学/物理/化学指南的框架（诊断、无计算器、三轮时钟、模考）原样适用',
              '**更轻的术语负担**——没有中文轨，你仍会遇到中文题干与图形标注，但词汇压力只有全轨考生的一小部分；约 60 词的数学术语表覆盖大部分',
              '**术语表仍然必需**——「无中文轨」不等于「卷面无中文」；题干与图形携带你想要快速读懂的场景词',
              '**完全跳过 HSK**——除非为列出中文轨的项目冲免考，否则 HSK 备考对英文授课考生是浪费预算',
              '**多核验、少语言备考**——英文授课考生从中文学习中省下的时间，应流向项目组合核验与额外的模考轮次',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '英文授课考生是所有类别里备考负担最轻的——通常一套基础科加形式训练。风险不在难度；在于以为没东西可备。',
          },
        ],
      },
      {
        id: 'verification-checklist',
        h2: '英文授课核验清单',
        intro:
          '因为这一类的组合差异最大，核验就是计划本身。六项检查，各一封邮件。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**到底要不要 CSCA？**——确认该项目对其英文授课批次适用强制令（几乎普遍，但要落在记录上）',
              '**确切科目组合**——哪些基础科、是否列专业中文轨、是否有免考适用',
              '**语言阈值**——雅思/托福最低分，以及特定分数是否决定奖学金评审',
              '**申请截止形状**——滚动还是固定；英文授课项目的截止常比想象的早',
              '**旧成绩是否有用**——SAT/AP/A-Level 在档案中的处理，见国际考试对比指南',
              '**奖学金叠加**——哪些奖学金接受英文授课申请者及其 CSCA 预期（CSC 强制令含英文授课名额）',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '每周期每项目一封邮件，答复全部归档。英文授课类别变化最快，因为大学仍在敲定组合——去年的答案可能是今年的废报名。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '英文授课项目要 CSCA 吗？',
        a: '要——CSCA 与授课语言无关地适用于国际本科申请者。英文授课考生通常考基础科（数学加项目点名理科），常不含专业中文轨，语言另附雅思/托福。',
      },
      {
        q: '雅思或托福能免考 CSCA 吗？',
        a: '不能——英语水平考试与 CSCA 认证不同的东西、作为独立要求叠加。雅思/托福覆盖英文授课的语言线；CSCA 是学术尺、仍然强制。',
      },
      {
        q: '英文授课商科项目要求哪些 CSCA 科目？',
        a: '常见为数学、有时仅基础科、有时带人文中文轨——这一族确有差异。报名前逐项目书面核验确切组合。',
      },
      {
        q: '读英文授课学位还要为 CSCA 学中文吗？',
        a: '不需要作为学习要求——但基础科卷面仍会有中文场景词与图形标注。数学指南的约 60 词术语表覆盖大部分阅读摩擦，无需整门中文课。',
      },
      {
        q: '要不要顺手考个 HSK 增强申请？',
        a: '只有当清单上有项目保留专业中文轨（合格 HSK 可免考）或有具体奖学金理由时才值得。否则 HSK 备考对英文授课考生是浪费预算。',
      },
      {
        q: '先考 CSCA 还是先考雅思/托福？',
        a: '通常先 CSCA——一年只有 5 个场次而雅思/托福考位充足。先拿下稀缺的考试，再排语言测试并在截止前留重考窗口。',
      },
    ],
    howToSteps: [
      {
        name: '在自己的计划里杀死豁免神话',
        text: '在规划文档顶端写下「CSCA 适用——含英文授课」。内化这一点后，每个下游决策都会改变；假设豁免的代价是一场考试。',
      },
      {
        name: '逐项目跑核验邮件',
        text: '向每个目标项目一封邮件要三件事：要求的 CSCA 科目、语言阈值、截止形状。书面答复归档——它们是你的报名清单与证据。',
      },
      {
        name: '一场报下科目的并集',
        text: '汇总清单上所有要求的科目一起考——¥700 档让第二、三科几乎不要钱。',
      },
      {
        name: '按科目指南的体系备考基础科',
        text: '诊断、补最弱、练无计算器时钟、跑模考——标准基础科体系，不因授课语言改变。',
      },
      {
        name: '建轻量术语表，跳过完整语言轨',
        text: '数学/场景词表覆盖基础科卷的题干与图形阅读。除非免考或项目要求使其相关，否则跳过 HSK。',
      },
      {
        name: '先 CSCA 后语言考试排序',
        text: '先存稀缺的考试（一年 5 场），再排灵活的（全年可考的雅思/托福）。把两者画在同一本日历上对着项目截止，语言重考窗口留到最后。',
      },
    ],
    ctaTitle: '正在申请中国的英文授课项目？',
    ctaSubtitle:
      'SICA 顾问书面核验你项目的 CSCA 组合、搭建精简的英文授课考试栈，并把 CSCA 与雅思/托福排进你的截止日历。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '旗舰总览：科目、形式、计分、费用与 CSC 要求。',
      },
      {
        href: '/csca-exam-exemptions',
        label: '谁必须参加 CSCA——谁可豁免',
        description: '完整豁免规则——含英文授课考生仍可免考的情形。',
      },
      {
        href: '/csca-vs-sat-a-level-ib',
        label: 'CSCA 对比 SAT、A-Level 与 IB',
        description: '同一批英文授课申请中国际成绩如何与 CSCA 叠加。',
      },
    ],
  },
};

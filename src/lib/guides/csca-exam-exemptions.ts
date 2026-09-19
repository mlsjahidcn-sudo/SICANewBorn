import type { LocalizedGuide } from './types';

/**
 * "Who must take the CSCA — and who is exempt" — Batch 1, article
 * #5 of the 20-article CSCA cluster (docs/csca-content-plan.md).
 * Target queries: "csca exemption", "csca hsk waiver", "who must
 * take csca", "csca english taught programs".
 *
 * Static content. Exemption rules are from launch-period official
 * notices and are still applied inconsistently across universities —
 * every section carries the "get it in writing" qualifier that the
 * flagship established.
 */
export const cscaExemptionsGuide: LocalizedGuide = {
  en: {
    slug: 'csca-exam-exemptions',
    eyebrow: 'GUIDE · CSCA EXEMPTIONS',
    title: 'Who Must Take the CSCA Exam — and Who Is Exempt (HSK 4 Route, Waivers, Edge Cases)',
    description:
      'Most international bachelor\'s applicants must sit the CSCA from 2026 — but Chinese-language program applicants with HSK 4 are exempt, and qualifying HSK scores can waive Professional Chinese. Full rules, edge cases, and how to secure a written waiver.',
    subtitle:
      'The CSCA is mandatory for most international applicants to Chinese bachelor\'s programs from the 2026 intake — including English-taught programs and CSC scholarship applicants. The two published exemptions: applicants to Chinese-language programs may skip the exam entirely with a valid HSK 4, and a qualifying HSK score can waive the Professional Chinese subject for degree applicants (fundamentals still required). Everything else is university discretion — get it in writing.',
    stats: [
      { value: '2026+', label: 'Intakes covered by the mandate' },
      { value: 'HSK 4', label: 'Exemption threshold for language programs' },
      { value: '2', label: 'Published exemption routes' },
      { value: '100%', label: 'Of waivers should be in writing' },
    ],
    quickAnswer:
      'From the 2026 intake, most international students applying to Chinese bachelor\'s degrees must take the CSCA — including English-taught program applicants and CSC scholarship applicants. Two exemptions are published: applicants to Chinese-language (Chinese-taught preparatory or language) undergraduate programs may be exempt from the exam if they hold a valid HSK Level 4 certificate, and degree applicants with a qualifying HSK score can have the Professional Chinese subject waived (they still sit Mathematics and any required Physics/Chemistry). Master\'s and PhD applicants are not currently covered by the CSCA mandate. Universities may also grant individual waivers case-by-case — but a waiver only counts if the university confirms it in writing before you skip registration.',
    keyTakeaways: [
      'Default rule: CSCA is required for international bachelor\'s applicants from 2026 — English-taught programs included, CSC scholarship applicants explicitly included',
      'Full exemption route: Chinese-language program applicants with a valid HSK 4 certificate can skip the exam',
      'Partial exemption route: a qualifying HSK score can waive Professional Chinese — Mathematics (and program-required Physics/Chemistry) remain compulsory',
      'Exemption rules were announced at launch and are applied inconsistently across universities — always confirm in writing',
      'Master\'s, PhD, and most non-degree applicants are outside the CSCA mandate as published',
      'If exempt, submit the HSK certificate (or waiver letter) with your application instead of a CSCA score report',
    ],
    sections: [
      {
        id: 'who-must',
        h2: 'Who must take the CSCA — the default rule',
        intro:
          'Start from the default: if you are an international applicant to a Chinese bachelor\'s degree from the 2026 intake onward, plan to sit the CSCA.',
        blocks: [
          {
            type: 'table',
            caption: 'Who is covered by the CSCA mandate (as published at launch)',
            columns: ['Applicant type', 'CSCA required?', 'Notes'],
            rows: [
              ['Bachelor\'s applicant (Chinese-taught)', 'Yes', 'Professional Chinese + fundamentals; HSK-based waivers possible'],
              ['Bachelor\'s applicant (English-taught)', 'Yes', 'Required subject combination + IELTS/TOEFL for language'],
              ['CSC scholarship applicant (bachelor\'s)', 'Yes — explicitly', 'Score must accompany the scholarship application'],
              ['Chinese-language / preparatory program applicant', 'May be exempt', 'Valid HSK 4 certificate per the published exemption'],
              ['Master\'s applicant', 'No (as published)', 'Outside the mandate — program-specific tests may apply'],
              ['PhD applicant', 'No (as published)', 'Supervisor/admission-test driven, not CSCA'],
              ['Exchange / one-semester students', 'Generally no', 'Non-degree mobility — confirm with the host university'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Mathematics is compulsory for every CSCA candidate regardless of major or teaching language — there is no published subject-level opt-out for Math. If you are exempt from anything, it is the Chinese track, never the fundamentals.',
          },
        ],
      },
      {
        id: 'hsk4-exemption',
        h2: 'The HSK 4 exemption for Chinese-language program applicants',
        intro:
          'The one published full-exemption route: applicants to Chinese-language undergraduate programs can skip the CSCA with a valid HSK Level 4 certificate.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Who it covers** — applicants to Chinese-language (语言/预科) undergraduate programs, where the program itself is Chinese language study rather than a degree taught in Chinese',
              '**The threshold** — a valid HSK Level 4 certificate at application time. Expired certificates may be rejected; HSK scores have a validity window, so check yours before relying on it',
              '**What "exempt" means** — no CSCA registration, no fee, no score report; the HSK certificate itself is the language evidence in your application',
              '**What it does NOT cover** — degree programs (business, engineering, medicine…) taught in Chinese are not "Chinese-language programs" for this purpose; degree applicants should look at the Professional Chinese waiver below instead',
              '**Still confirm** — the exemption was announced at launch and universities apply it unevenly; some may still prefer or require the CSCA for their own language-track admissions',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Do not conflate "I have HSK 4" with "I am exempt." The exemption is tied to the PROGRAM TYPE (Chinese-language programs), not just the certificate. A business applicant with HSK 4 is not automatically exempt — they may qualify for the subject-level waiver instead.',
          },
        ],
      },
      {
        id: 'professional-chinese-waiver',
        h2: 'The Professional Chinese waiver for degree applicants',
        intro:
          'Degree applicants with strong certified Chinese can have the Professional Chinese subject waived — but the fundamental subjects remain.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**The rule as published** — a qualifying HSK score can waive the Professional Chinese subject (the 80-question Humanities or STEM Chinese paper)',
              '**What remains** — Mathematics (compulsory for all) plus any program-required Physics/Chemistry. The waiver shrinks the sitting; it does not remove it',
              '**Why this design** — universities still need a standardized read on Math and sciences; what the waiver removes is the language-proficiency signal, which the HSK already certifies',
              '**Practical math** — waiving Professional Chinese cuts your sitting from ~4 subjects to 2–3; at the ¥700 band the fee is unchanged, but prep load and test-day fatigue drop meaningfully',
              '**Which HSK level qualifies** — launch notices referenced "a qualifying HSK score" without a universal published cutoff; treat HSK 5 as the safe planning benchmark for degree-track waivers and confirm the exact bar with each university',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'If your HSK is strong enough to waive Professional Chinese, sit Math + your program\'s science subjects only — and attach the HSK certificate wherever the application asks for language evidence. SICA counselors map which of your target universities accept the waiver.',
          },
        ],
      },
      {
        id: 'english-taught',
        h2: 'English-taught programs — required, not exempt',
        intro:
          'The most common misunderstanding: applicants to English-taught degrees assume IELTS/TOEFL exempts them. It does not.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**The mandate covers teaching languages** — the CSCA applies to international bachelor\'s applicants regardless of whether the degree is taught in Chinese or English',
              '**What English-taught applicants typically sit** — the subject combination their program requires (commonly Mathematics plus Physics and/or Chemistry); some programs specify the STEM Chinese track, others accept a fundamentals-only combination — check the program page',
              '**Language evidence stacks separately** — IELTS/TOEFL (or equivalent) remains the language requirement for English-taught admission; the CSCA does not replace it and it does not replace the CSCA',
              '**CSC scholarship through English-taught programs** — still CSCA-required; the scholarship mandate is not limited to Chinese-taught degrees',
              '**Planning implication** — English-taught applicants juggle two standardized tracks (CSCA subjects + IELTS/TOEFL); sequence them so one weak attempt does not cascade into both deadlines',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'If a program\'s listing is silent about CSCA subjects for English-taught applicants, email admissions before registering — subject combinations for English-taught degrees vary more between universities than for Chinese-taught ones.',
          },
        ],
      },
      {
        id: 'university-discretion',
        h2: 'University-level waivers — how to ask (and get it in writing)',
        intro:
          'Beyond the two published routes, universities may grant individual waivers case-by-case. A verbal assurance is worth nothing; a written one is gold.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Identify the right office** — the international students\' admissions office of your target university (their email is on the program page). For CSC applicants, copy the scholarship coordinator if one is listed.',
              '**Make the ask specific** — state your program, intake, and exactly what you are asking: full exemption (with reason, e.g., HSK-4 language-program route) or Professional Chinese waiver (with your HSK level and score).',
              '**Attach evidence** — HSK certificate scan, transcript, or anything that supports the request. Universities grant waivers on documents, not descriptions.',
              '**Ask the closing question** — "Could you confirm in writing whether I am required to sit the CSCA for this application?" Their reply is your waiver letter. Save it with application records.',
              '**Register only for what remains** — if the waiver covers Professional Chinese, register for Math + required sciences; if full exemption is confirmed, register for nothing and attach the letter instead of a score report.',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Waiver rules were announced at launch and are still applied inconsistently across universities. Never skip registration on the basis of a rumor, an agent\'s claim, or last year\'s policy — an unwritten exemption is a rejected application waiting to happen.',
          },
        ],
      },
      {
        id: 'edge-cases',
        h2: 'Edge cases and open questions',
        intro:
          'Some applicant categories sit in gray zones. The safe treatment for each is below — plus the caveat that these evolve as universities operationalize the exam.',
        blocks: [
          {
            type: 'table',
            caption: 'Gray zones and the safe default',
            columns: ['Situation', 'Safe default', 'Confirm with'],
            rows: [
              ['Expired HSK certificate', 'Treat as invalid for the exemption; retest or sit CSCA', 'University admissions + HSK test center'],
              ['Transfer student from another university', 'Likely required if re-applying to bachelor\'s', 'Both universities\' admissions offices'],
              ['Gap-year / re-applicant with old scores', 'CSCA scores follow the report you submit; HSK validity may have lapsed', 'Target university'],
              ['Chinese-language program → degree program upgrade', 'The degree application is a new CSCA event; the HSK-4 exemption applied to the language program only', 'University admissions'],
              ['Applicants of Chinese descent / from HK, Macao, Taiwan', 'Category rules differ from standard international applicants', 'University admissions + relevant dispatching authority'],
              ['Foundation/bridging program then bachelor\'s', 'The bridging year may fall under the language-program exemption; the bachelor\'s after it usually does not', 'Program coordinator'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Gray zones resolve in one direction: whoever answers in writing owns the decision. An email from the admissions office settles every row of this table; a forum post settles none.',
          },
        ],
      },
      {
        id: 'if-exempt',
        h2: 'If you are exempt — what to submit instead',
        intro:
          'Exemption does not mean submitting nothing. Your application swaps the CSCA score report for alternative evidence.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Full exemption (language-program route)** — the valid HSK 4 certificate becomes the language pillar of your application, alongside transcripts and references',
              '**Professional Chinese waiver** — HSK certificate (language) + CSCA score report covering Math and required sciences (academic) — two documents where other applicants send one',
              '**Written waiver confirmation** — attach the university\'s email/letter so no reviewer wonders why a mandatory exam is missing from the file',
              '**CSC scholarship files** — scholarship screening checks completeness mechanically; a waiver claim without the written confirmation attached reads as a missing score, so include it',
              '**Keep validity in mind** — HSK certificates carry a validity window; if yours expires between the waiver decision and enrollment, retest before registration week at the university',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Exemption, done right, saves a full prep cycle — done wrong, it voids an application. The difference is one email, answered in writing, before the registration window closes.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Do I have to take the CSCA if I have HSK 4?',
        a: 'It depends on your program type. Applicants to Chinese-language (language/preparatory) undergraduate programs may be fully exempt with a valid HSK 4. Applicants to degree programs (business, engineering, etc.) with HSK 4 are not automatically exempt — but a qualifying HSK score can waive the Professional Chinese subject, leaving Mathematics and required sciences. Confirm with the university in writing.',
      },
      {
        q: 'Are English-taught programs exempt from the CSCA?',
        a: 'No. The CSCA applies to international bachelor\'s applicants regardless of teaching language. English-taught applicants sit their program\'s required subject combination (often Mathematics + sciences) and separately provide IELTS/TOEFL as language evidence.',
      },
      {
        q: 'Do master\'s and PhD applicants need the CSCA?',
        a: 'Not under the mandate as published — the CSCA targets undergraduate (bachelor\'s) admissions from the 2026 intake. Master\'s and PhD admission runs on program-specific requirements, supervisor matching, and (for some programs) university entrance tests.',
      },
      {
        q: 'What HSK level waives the Professional Chinese subject?',
        a: 'Launch notices specify "a qualifying HSK score" without a single published universal cutoff. HSK 5 is the safe planning benchmark for degree-track waivers, but the exact bar is university-specific — ask each target school and save the written answer.',
      },
      {
        q: 'My HSK certificate is expired — can I still use it for the exemption?',
        a: 'Probably not. HSK scores carry a validity window, and expired certificates are routinely rejected for exemption purposes. Either retest before the application deadline or plan to sit the CSCA instead.',
      },
      {
        q: 'If I\'m exempt, do I still register for the CSCA?',
        a: 'No — if the university confirms a full exemption in writing, you skip registration entirely and submit the HSK certificate (plus the waiver confirmation) with your application. For a partial waiver, you register only for the remaining subjects.',
      },
      {
        q: 'Is Mathematics ever waived?',
        a: 'No. Mathematics is compulsory for every CSCA candidate as published — regardless of major, teaching language, or HSK level. Exemptions touch the Professional Chinese subject or the whole exam for language-program applicants, never the fundamentals.',
      },
      {
        q: 'Do CSC scholarship applicants get any exemption?',
        a: 'No — the opposite: from the 2026 intake, CSC bachelor\'s scholarship applicants are explicitly required to submit CSCA scores. There is no published scholarship-based exemption route.',
      },
    ],
    howToSteps: [
      {
        name: 'Classify your program type',
        text: 'Determine honestly which bucket you are in: Chinese-language program, Chinese-taught degree, or English-taught degree. The bucket decides which exemption route (if any) can apply — HSK 4 alone decides nothing.',
      },
      {
        name: 'Check your HSK certificate\'s validity',
        text: 'HSK scores carry a validity window. If yours is expired or expires before enrollment, either retest early or plan a CSCA sitting. An invalid certificate is the most common way exemptions fall apart late.',
      },
      {
        name: 'Email the university\'s international admissions office',
        text: 'State program, intake, and the precise ask (full exemption or Professional Chinese waiver), and attach your HSK certificate scan. Ask the closing question: "Please confirm in writing whether I must sit the CSCA for this application."',
      },
      {
        name: 'Wait for the written answer before deciding anything',
        text: 'No registration decisions until the reply lands. A verbal or forum-sourced exemption is not an exemption. Most offices answer within days; the wait fits comfortably inside a normal application timeline.',
      },
      {
        name: 'Register only for the subjects that remain',
        text: 'Full exemption → no registration; attach the waiver letter instead of a score report. Partial waiver → register for Math + required sciences only, and pay the same attention to the session choice (see the dates guide).',
      },
      {
        name: 'Build the evidence pack into your application',
        text: 'Wherever the application asks for test scores, file: HSK certificate (language) + CSCA report for remaining subjects (academic) + the written waiver confirmation. For CSC files, completeness is checked mechanically — the letter prevents your file reading as "missing score".',
      },
    ],
    ctaTitle: 'Not sure whether you\'re exempt?',
    ctaSubtitle:
      'SICA counselors assess your program type and HSK position, draft the waiver request to your target universities, and rebuild your exam plan around the written answers. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The flagship overview: subjects, format, scoring, fees, exemptions, and the CSC requirement.',
      },
      {
        href: '/guides/hsk',
        label: 'HSK Chinese proficiency test guide',
        description: 'Levels, validity, and how HSK 4–6 unlocks the exemption and waiver routes.',
      },
      {
        href: '/csca-english-taught-programs',
        label: 'CSCA for English-taught programs',
        description: 'What English-taught applicants sit — and how it stacks with IELTS/TOEFL.',
      },
    ],
  },
  zh: {
    slug: 'csca-exam-exemptions',
    eyebrow: '指南 · CSCA 豁免',
    title: '谁必须参加 CSCA 考试——谁可豁免（HSK 4 通道、免考与边缘情形）',
    description:
      '自 2026 级起多数国际本科申请者须参加 CSCA——但持 HSK 4 的中文授课项目申请者可豁免，合格 HSK 成绩可免专业中文科目。完整规则、边缘情形与书面豁免确认方法。',
    subtitle:
      '自 2026 级起，多数申请中国本科的国际学生必须参加 CSCA——含英文授课项目与 CSC 奖学金申请者。两条已公布豁免：中文授课（语言/预科）项目申请者凭有效 HSK 4 可整体豁免；学位申请者凭合格 HSK 成绩可免专业中文科目（基础科仍须考）。其余均属大学个案裁量——务必拿到书面确认。',
    stats: [
      { value: '2026 级起', label: '强制令覆盖的入学批次' },
      { value: 'HSK 4', label: '语言类项目豁免门槛' },
      { value: '2 条', label: '已公布的豁免通道' },
      { value: '100%', label: '豁免都应落到书面' },
    ],
    quickAnswer:
      '自 2026 级起，多数申请中国本科的国际学生必须参加 CSCA——含英文授课项目申请者与 CSC 奖学金申请者。两条已公布豁免：中文授课（语言/预科）本科项目申请者凭有效 HSK 4 证书可豁免考试；学位申请者凭合格 HSK 成绩可免考专业中文科目（数学与项目要求的物理/化学仍须考）。硕士与博士申请者目前不在强制令范围内。大学还可个案审批豁免——但豁免只有在你跳过报名前拿到大学书面确认才算数。',
    keyTakeaways: [
      '默认规则：2026 级起的国际本科申请者须考 CSCA——含英文授课项目，CSC 奖学金申请者明确包含',
      '整体豁免通道：中文授课项目申请者凭有效 HSK 4 证书可免考',
      '部分豁免通道：合格 HSK 成绩可免专业中文——数学（及项目要求的物理/化学）仍为必考',
      '豁免规则为启动时公布，各校执行不一——务必书面确认',
      '硕士、博士及多数非学位申请者不在已公布的 CSCA 强制令范围内',
      '如获豁免，改以 HSK 证书（或豁免确认函）替代 CSCA 成绩单随申请提交',
    ],
    sections: [
      {
        id: 'who-must',
        h2: '谁必须参加 CSCA——默认规则',
        intro:
          '从默认情形出发：只要你自 2026 级起申请中国学士学位，就按「要考」来规划。',
        blocks: [
          {
            type: 'table',
            caption: 'CSCA 强制令覆盖人群（启动时公布口径）',
            columns: ['申请者类型', '是否须考？', '说明'],
            rows: [
              ['本科申请者（中文授课）', '是', '专业中文 + 基础科；可走 HSK 类免考'],
              ['本科申请者（英文授课）', '是', '要求科目组合 + 雅思/托福作语言证明'],
              ['CSC 奖学金申请者（本科）', '是——明确', '成绩须随奖学金申请提交'],
              ['中文授课语言/预科项目申请者', '可豁免', '凭有效 HSK 4 证书（已公布豁免）'],
              ['硕士申请者', '否（公布口径）', '不在强制令内——项目自有测试可能适用'],
              ['博士申请者', '否（公布口径）', '导师/项目考核驱动，非 CSCA'],
              ['交换/一学期学生', '一般否', '非学位流动——与接收大学确认'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '数学对每位 CSCA 考生必考——无论专业或授课语言，没有公布的数学科目豁免。能免的是中文轨，绝不是基础科。',
          },
        ],
      },
      {
        id: 'hsk4-exemption',
        h2: '中文授课项目申请者的 HSK 4 豁免',
        intro:
          '唯一已公布的整体豁免通道：中文授课本科项目申请者凭有效 HSK 4 证书可免考 CSCA。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**覆盖人群**——申请中文授课语言类（语言/预科）本科项目者，项目本身就是汉语学习而非用汉语授课的学位',
              '**门槛**——申请时持有效 HSK 4 证书。过期证书可能被拒；HSK 成绩有有效期，依赖前先核验',
              '**「豁免」意味着什么**——不报名、不缴费、不交成绩单；HSK 证书本身就是申请中的语言证明',
              '**不覆盖什么**——用中文授课的学位项目（商科、工科、医学……）不属于此处的「中文授课项目」；学位申请者应看下面的专业中文免考',
              '**仍需确认**——该豁免为启动时公布，各校执行不一；部分大学对自己的语言轨招生仍可能要求 CSCA',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '不要把「我有 HSK 4」等同于「我豁免」。豁免绑定的是项目类型（中文授课语言类项目），不只是一张证书。持 HSK 4 的商科申请者并不自动豁免——他们可能符合的是科目级免考。',
          },
        ],
      },
      {
        id: 'professional-chinese-waiver',
        h2: '学位申请者的专业中文免考',
        intro:
          '中文水平过硬且有证书的学位申请者可免考专业中文——但基础科保留。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**公布规则**——合格 HSK 成绩可免考专业中文科目（80 题的人文/理工中文卷）',
              '**保留什么**——数学（人人必考）加项目要求的物理/化学。免考缩减考试规模，但不取消考试',
              '**为何这样设计**——大学仍需要对数理的标准化读数；免考去掉的是语言信号，而 HSK 已经认证了语言',
              '**实操账**——免掉专业中文把你的考试从约 4 科缩到 2-3 科；¥700 档费用不变，但备考量与考日疲劳显著下降',
              '**何种 HSK 级别够格**——启动通知只写「合格 HSK 成绩」而无统一公布线；学位轨免考以 HSK 5 作为安全规划基准，具体门槛逐校书面确认',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '若你的 HSK 足以免考专业中文，只需考数学 + 项目要求的理科——并在申请的语言证明处附上 HSK 证书。SICA 顾问梳理哪些目标院校接受免考。',
          },
        ],
      },
      {
        id: 'english-taught',
        h2: '英文授课项目——必考，不豁免',
        intro:
          '最常见的误解：英文授课学位申请者以为雅思/托福能让自己免考。不能。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**强制令覆盖授课语言**——CSCA 适用于国际本科申请者，无论学位用中文还是英文授课',
              '**英文授课考生通常考什么**——项目要求的科目组合（常见数学加物理/化学）；部分项目指定理工中文轨，另一些接受仅基础科的组合——以项目页为准',
              '**语言证明单独叠加**——雅思/托福（或同等）仍是英文授课的语言要求；CSCA 不替代它，它也不替代 CSCA',
              '**经英文授课项目申 CSC 奖学金**——同样须考 CSCA；奖学金强制令不限于中文授课学位',
              '**规划含义**——英文授课申请者要同时跑两条标准化线（CSCA 科目 + 雅思/托福）；排好先后，避免一次失误连锁拖垮两条截止线',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '若项目页对英文授课申请者的 CSCA 科目沉默，报名前先邮件招生办——英文授课学位的科目组合在大学之间的差异比中文授课更大。',
          },
        ],
      },
      {
        id: 'university-discretion',
        h2: '大学个案豁免——怎么问（并落到书面）',
        intro:
          '两条公布通道之外，大学可个案审批豁免。口头保证一文不值；书面确认才是金子。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**找准办公室**——目标大学国际学生招生办公室（邮箱在项目页）。CSC 申请者可同时抄送奖学金协调人（如有列明）。',
              '**把请求问具体**——写明项目、入学批次与确切请求：整体豁免（附理由，如 HSK-4 语言项目通道）还是专业中文免考（附 HSK 级别与分数）。',
              '**附证据**——HSK 证书扫描件、成绩单或任何支持材料。大学凭文件批豁免，不凭描述。',
              '**问出收尾问题**——「请书面确认该项目申请我是否必须参加 CSCA。」对方的回复就是你的豁免确认函。与申请材料一起保存。',
              '**只报剩下的科目**——免考覆盖专业中文，就只报数学 + 必需理科；确认整体豁免，就什么都不报，以确认函替代成绩单。',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '豁免规则为启动时公布，各校执行仍不一致。绝不凭传闻、中介说法或去年的政策跳过报名——没有书面依据的豁免，等于一份注定被拒的申请。',
          },
        ],
      },
      {
        id: 'edge-cases',
        h2: '边缘情形与悬而未决的问题',
        intro:
          '部分申请者类别处于灰色地带。每类的安全处理如下——并注意随大学落地执行，规则会继续演进。',
        blocks: [
          {
            type: 'table',
            caption: '灰色地带与安全默认',
            columns: ['情形', '安全默认', '向谁确认'],
            rows: [
              ['HSK 证书过期', '按无效处理豁免资格；重考或参加 CSCA', '大学招生办 + HSK 考点'],
              ['他校转学申请者', '重新申请本科时大概率须考', '两校招生办'],
              ['间隔年/持旧成绩再申请者', 'CSCA 以你提交的成绩单为准；HSK 有效期可能已过', '目标大学'],
              ['语言项目→学位项目升级', '学位申请是新的 CSCA 事件；HSK-4 豁免只覆盖语言项目阶段', '大学招生办'],
              ['华裔/港澳台申请者', '类别规则与普通国际申请者不同', '大学招生办 + 相关派遣机关'],
              ['预科/ bridges 项目后接本科', '预科年可能适用语言项目豁免；其后的本科通常不适用', '项目协调人'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '灰色地带只向一个方向解决：谁书面作答，谁说了算。招生办的一封邮件能敲定上表每一行；论坛帖子一行都定不了。',
          },
        ],
      },
      {
        id: 'if-exempt',
        h2: '获豁免后——提交什么替代',
        intro:
          '豁免不等于什么都不交。你的申请把 CSCA 成绩单换成替代证据。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**整体豁免（语言项目通道）**——有效 HSK 4 证书成为申请的语言支柱，与成绩单、推荐信并列',
              '**专业中文免考**——HSK 证书（语言）+ 覆盖数学与必需理科的 CSCA 成绩单（学术）——别人交一份，你交两份',
              '**书面豁免确认**——附上大学的邮件/函件，免得任何审核疑惑为何必考成绩缺失',
              '**CSC 奖学金材料**——奖学金审查机械化查完整性；没有书面确认的豁免会被读成「缺成绩」，所以确认函必须附上',
              '**留意有效期**——HSK 证书有有效期窗口；若在豁免决定与入学注册之间过期，在大学注册周前重考',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '豁免做对了，省下整个备考周期；做错了，废掉一份申请。两者的差别只是报名窗口关闭前的一封邮件和一句书面答复。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '我有 HSK 4 还要考 CSCA 吗？',
        a: '取决于项目类型。中文授课（语言/预科）本科项目申请者凭有效 HSK 4 可整体豁免。持 HSK 4 的学位项目（商科、工科等）申请者不自动豁免——但合格 HSK 成绩可免专业中文科目，数学与必需理科仍须考。务必向大学书面确认。',
      },
      {
        q: '英文授课项目能豁免 CSCA 吗？',
        a: '不能。CSCA 适用于国际本科申请者，不论授课语言。英文授课申请者考项目要求的科目组合（常为数学 + 理科），语言上另行提供雅思/托福。',
      },
      {
        q: '硕士和博士申请者要考 CSCA 吗？',
        a: '按公布口径不需要——CSCA 面向自 2026 级起的本科（学士）招生。硕士与博士录取走项目自有要求、导师匹配及（部分项目的）校内考试。',
      },
      {
        q: '什么 HSK 级别能免专业中文？',
        a: '启动通知只写「合格 HSK 成绩」，没有统一公布的通用线。学位轨免考以 HSK 5 作为安全规划基准，但具体门槛因校而异——逐校询问并保存书面答复。',
      },
      {
        q: '我的 HSK 证书过期了，还能用于豁免吗？',
        a: '大概率不能。HSK 成绩有有效期，过期证书在豁免审核中常被拒。要么在申请截止前重考，要么规划参加 CSCA。',
      },
      {
        q: '如果获豁免，还需要报名 CSCA 吗？',
        a: '不需要——大学书面确认整体豁免后，你完全跳过报名，以 HSK 证书（加豁免确认函）随申请提交。部分免考则只报剩余科目。',
      },
      {
        q: '数学有豁免吗？',
        a: '没有。按公布口径，数学对每位 CSCA 考生必考——无论专业、授课语言或 HSK 级别。豁免只涉及专业中文科目，或针对语言类项目申请者的整体豁免，从不涉及基础科。',
      },
      {
        q: 'CSC 奖学金申请者有豁免吗？',
        a: '没有——恰恰相反：自 2026 级起，CSC 本科奖学金申请者被明确要求提交 CSCA 成绩。没有公布的基于奖学金的豁免通道。',
      },
    ],
    howToSteps: [
      {
        name: '判定你的项目类型',
        text: '如实归入三桶之一：中文授课语言类项目、中文授课学位、英文授课学位。桶决定了哪条豁免通道（如有）可能适用——仅一张 HSK 4 说明不了任何事。',
      },
      {
        name: '核验 HSK 证书有效期',
        text: 'HSK 成绩有有效期。若已过期或在入学前过期，要么提早重考，要么规划 CSCA。证书失效是豁免在后期崩塌的最常见方式。',
      },
      {
        name: '邮件大学国际招生办',
        text: '写明项目、入学批次与确切请求（整体豁免或专业中文免考），附 HSK 证书扫描件。问出收尾问题：「请书面确认该项目申请我是否必须参加 CSCA。」',
      },
      {
        name: '等书面答复再决定任何事',
        text: '回复到手前不做任何报名决定。口头或论坛来源的豁免不是豁免。多数办公室数日内答复；等待时间完全放得进正常申请时间线。',
      },
      {
        name: '只报剩余科目',
        text: '整体豁免 → 不报名；以豁免函替代成绩单。部分免考 → 只报数学 + 必需理科，并对场次选择保持同样的严谨（见时间指南）。',
      },
      {
        name: '把证据包做进申请材料',
        text: '在申请要求考试成绩的位置归档：HSK 证书（语言）+ 剩余科目的 CSCA 成绩单（学术）+ 书面豁免确认。CSC 材料按完整性机械化审查——确认函防止材料被读成「缺成绩」。',
      },
    ],
    ctaTitle: '不确定自己是否豁免？',
    ctaSubtitle:
      'SICA 顾问评估你的项目类型与 HSK 位置、代拟发往目标大学的豁免请求，并按书面答复重构你的考试计划。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '旗舰总览：科目、形式、计分、费用、豁免与 CSC 要求。',
      },
      {
        href: '/guides/hsk',
        label: 'HSK 汉语水平考试指南',
        description: '级别、有效期，以及 HSK 4-6 如何解锁豁免与免考通道。',
      },
      {
        href: '/csca-english-taught-programs',
        label: '英文授课项目的 CSCA',
        description: '英文授课申请者考什么——以及如何与雅思/托福叠加。',
      },
    ],
  },
};

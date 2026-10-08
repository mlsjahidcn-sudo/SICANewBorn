import type { LocalizedGuide } from './types';

/**
 * "China student visa X1 vs X2 and JW202" — Phase 147 SEO Task 5 #4.
 * Target queries: "x1 vs x2 visa china", "china student visa 180
 * days", "jw201 vs jw202", "x1 residence permit 30 days".
 *
 * Facts (verified table): X1 = study >180 days, must convert to a
 * residence permit within 30 days of entry; X2 = <=180 days; X1
 * needs admission notice + JW201 (CSC scholars) or JW202.
 */
export const x1x2VisaGuide: LocalizedGuide = {
  en: {
    slug: 'x1-vs-x2-student-visa-china',
    eyebrow: 'GUIDE · VISA',
    title: 'China Student Visa: X1 vs X2 and JW201 vs JW202',
    description:
      'X1 vs X2 China student visa explained: the 180-day rule, documents, the 30-day residence-permit conversion, and the difference between JW201 and JW202 forms.',
    subtitle:
      'The X1 visa covers study longer than 180 days — degree programs — and must be converted to a residence permit within 30 days of entering China. The X2 covers 180 days or less. Your admission notice comes with JW201 (if you hold a CSC scholarship) or JW202 (university admission), and the form your visa application needs depends on which one you hold.',
    stats: [
      { value: 'X1', label: 'Study >180 days → residence permit' },
      { value: 'X2', label: 'Study ≤180 days' },
      { value: '30 days', label: 'To convert X1 after entry' },
      { value: 'JW201/202', label: 'CSC scholars vs university admits' },
    ],
    quickAnswer:
      'China issues two student visas. X1 is for study longer than 180 days (degree programs, scholarship years): it is an entry visa, and within 30 days of arriving in China you must convert it into a residence permit at the local entry-exit administration — the permit, not the visa, covers your stay. X2 is for study of 180 days or less (one-semester language programs, exchanges) and cannot be extended into a degree stay. The X1 application requires your admission notice plus JW201 (Chinese Government Scholarship holders) or JW202 (university-admitted students); JW201/JW202 are issued by the admitting side and sent with your admission notice.',
    keyTakeaways: [
      'X1 = study >180 days; X2 = ≤180 days — the duration printed on your admission notice decides',
      'X1 must be converted to a residence permit within 30 days of entry — missing the window is an overstay',
      'X1 documents: passport, admission notice, JW201 (CSC scholars) or JW202 (university admits), photo, forms',
      'JW201 = your funding is a Chinese Government Scholarship; JW202 = you were admitted directly by the university',
      'X2 suits one-semester language and exchange programs; it does not convert into a degree residence permit',
      'Apply at the Chinese embassy/consulate or visa centre in your country; processing is typically days, not weeks',
    ],
    sections: [
      {
        id: 'x1-vs-x2',
        h2: 'X1 vs X2: the 180-day rule',
        intro:
          'The only question that decides your visa type: is your program longer than 180 days?',
        blocks: [
          {
            type: 'table',
            caption: 'X1 vs X2 student visa',
            columns: ['Dimension', 'X1', 'X2'],
            rows: [
              ['Program length', 'Longer than 180 days', '180 days or shorter'],
              ['Typical use', 'Bachelor\'s, master\'s, PhD, CSC scholarship years', 'One-semester language, exchange, short programs'],
              ['After entry', 'Convert to residence permit within 30 days', 'No conversion; leave or extend per rules when it expires'],
              ['Work rights', 'Study-related part-time work under conditions', 'Highly restricted'],
              ['Companion forms', 'Admission notice + JW201 or JW202', 'Admission notice (+ JW202 for short enrolments)'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The X1 visa itself is not your right to stay — it is your right to enter. The residence permit you convert it into within 30 days is what covers the whole program. Universities help with the conversion during orientation week; do not skip it.',
          },
        ],
      },
      {
        id: 'jw201-jw202',
        h2: 'JW201 vs JW202: which form you get',
        intro:
          'Both forms are issued on the Chinese side and mailed with (or after) your admission notice. Which one depends on how you were admitted.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**JW201** — issued when your funding is a Chinese Government Scholarship (CSC): the scholarship machinery generates it with the admission notice',
              '**JW202** — issued when a university admitted you directly (self-funded or university-funded): the university\'s international office applies for it',
              '**Self-funded students get JW202** — if an agent promises a JW201 without a scholarship, that is a fabrication',
              '**Both work for the X1 application** — take the original (or the electronic version the university sends) plus the admission notice to the embassy',
              '**Timing** — forms can arrive weeks after the admission notice; plan the visa application so the 30-day conversion window still fits before your program starts',
            ],
          },
        ],
      },
      {
        id: 'conversion-30-days',
        h2: 'The 30-day residence-permit conversion',
        intro:
          'Arriving on X1 starts a 30-day clock. Here is what the conversion needs.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Where** — the local Public Security Bureau entry-exit administration in your university\'s city; international-student offices run this during orientation',
              '**Documents** — passport with X1, admission notice, JW201/JW202, registration form of temporary residence (issued by your dorm or police station), physical-exam report where required, photo, fee',
              '**Timing** — apply within the 30 days; the permit typically issues in days to a couple of weeks',
              '**Result** — a residence permit valid for the duration of your program, usually with multiple entry',
              '**Miss it?** — late conversion is treated as overstay: fines, possible deportation, and future-visa damage. If your arrival is delayed, tell the international office immediately',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the difference between X1 and X2 visas?',
        a: 'Program length. X1 covers study longer than 180 days (degree programs) and must be converted to a residence permit within 30 days of entry. X2 covers 180 days or less (one-semester language, exchanges) and does not convert into a degree stay.',
      },
      {
        q: 'How long can I stay in China on an X1 visa?',
        a: 'The X1 itself is an entry visa — after entering, you have 30 days to convert it into a residence permit, which is the document that actually covers your program duration (typically with multiple entry). Do not plan travel on a bare X1 beyond the conversion window.',
      },
      {
        q: 'What is the difference between JW201 and JW202?',
        a: 'JW201 is issued to Chinese Government Scholarship (CSC) students; JW202 to students admitted directly by a university (self-funded or university-funded). Both accompany the admission notice and both satisfy the X1 application — the difference is only who funds you.',
      },
      {
        q: 'What documents do I need for the X1 visa?',
        a: 'Passport (valid beyond the program), the admission notice, the JW201 or JW202 form, a completed visa application form with photo, and any fees. Some embassies add a physical-exam form — check your local Chinese embassy/visa-centre requirements.',
      },
      {
        q: 'Can I switch from X2 to X1 inside China?',
        a: 'Not directly in the normal flow — an X2 is a short-stay visa and does not convert into a degree residence permit. A semester of language study on X2 typically means applying for the degree program from outside and entering on a fresh X1.',
      },
    ],
    howToSteps: [
      {
        name: 'Check which visa your program needs',
        text: 'Look at the duration on your admission notice: over 180 days → X1; 180 or fewer → X2. Degree programs and CSC scholarships are always X1.',
      },
      {
        name: 'Collect admission notice + JW201/JW202',
        text: 'The form follows your funding: JW201 with a CSC scholarship, JW202 for direct university admission. If it has not arrived weeks after the notice, email the international office.',
      },
      {
        name: 'Apply at your Chinese embassy/visa centre',
        text: 'Passport, admission notice, JW form, application form + photo, fee. Processing is typically days — apply as soon as documents are complete, not the week before your flight.',
      },
      {
        name: 'Enter China and register your address',
        text: 'On arrival, your dorm or the local police station issues the registration form of temporary residence — a required input for the permit conversion.',
      },
      {
        name: 'Convert X1 to a residence permit within 30 days',
        text: 'Go with the international office to the entry-exit administration with passport, notices, JW form, registration, and photo. The permit then covers your whole program.',
      },
    ],
    ctaTitle: 'Sorting out the visa step?',
    ctaSubtitle:
      'SICA counselors check your admission letter\'s visa implications, track the JW201/JW202 timing, and walk you through the 30-day conversion. First consultation free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/visa',
        label: 'China student visa guide',
        description: 'The full visa walkthrough: documents, fees, renewals, work rights.',
      },
      {
        href: '/guides/application',
        label: 'How to apply to Chinese universities',
        description: 'The application timeline that produces the admission notice + JW form.',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC Scholarship 2027',
        description: 'CSC scholars receive the JW201 — see how the scholarship works.',
      },
    ],
  },
  zh: {
    slug: 'x1-vs-x2-student-visa-china',
    eyebrow: '指南 · 签证',
    title: '中国学生签证：X1 与 X2 及 JW201/JW202',
    description:
      'X1 与 X2 中国学生签证详解：180 天规则、所需材料、入境 30 天换发居留许可，及 JW201 与 JW202 表的区别。',
    subtitle:
      'X1 签证适用于超过 180 天的学习（学位项目），入境后 30 天内必须换发居留许可。X2 适用于 180 天及以内。录取通知书随附 JW201（CSC 奖学金生）或 JW202（大学录取生），签证申请所需的表取决于你持有哪一张。',
    stats: [
      { value: 'X1', label: '学习 >180 天 → 居留许可' },
      { value: 'X2', label: '学习 ≤180 天' },
      { value: '30 天', label: '入境后换发时限' },
      { value: 'JW201/202', label: 'CSC 奖学金 vs 大学录取' },
    ],
    quickAnswer:
      '中国签发两种学生签证。X1 适用于超过 180 天的学习（学位项目、奖学金学年）：它是入境签证，入境后 30 天内必须到当地出入境管理部门换发居留许可——覆盖你在华停留的是居留许可而非签证本身。X2 适用于 180 天及以内（一学期语言班、交换），不能转为学位停留。X1 申请需要录取通知书加 JW201（中国政府奖学金持有者）或 JW202（大学录取学生）；JW201/JW202 由录取方出具并随录取通知寄送。',
    keyTakeaways: [
      'X1 = 学习 >180 天；X2 = ≤180 天——录取通知上的时长决定签证类型',
      'X1 入境后 30 天内必须换发居留许可——错过窗口即超期',
      'X1 材料：护照、录取通知、JW201（CSC 奖学金生）或 JW202（大学录取生）、照片、表格',
      'JW201 = 中国政府奖学金资助；JW202 = 大学直接录取',
      'X2 适合一学期语言与交换项目；不能转为学位居留许可',
      '在本国中国使领馆/签证中心申请；处理通常只需数个工作日',
    ],
    sections: [
      {
        id: 'x1-vs-x2',
        h2: 'X1 与 X2：180 天规则',
        intro:
          '决定签证类型的唯一问题：你的项目是否超过 180 天？',
        blocks: [
          {
            type: 'table',
            caption: 'X1 与 X2 学生签证对比',
            columns: ['维度', 'X1', 'X2'],
            rows: [
              ['项目时长', '超过 180 天', '180 天及以内'],
              ['典型用途', '本科、硕士、博士、CSC 奖学金学年', '一学期语言、交换、短期项目'],
              ['入境后', '30 天内换发居留许可', '无需换发；到期按规则离境或延期'],
              ['打工权利', '条件下允许学业相关兼职', '严格受限'],
              ['随附表格', '录取通知 + JW201 或 JW202', '录取通知（+ 短期注册的 JW202）'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'X1 签证本身不是你的停留资格——它是你的入境资格。入境后 30 天内换发的居留许可才是覆盖整个项目的证件。大学会在开学周协助办理；切勿缺席。',
          },
        ],
      },
      {
        id: 'jw201-jw202',
        h2: 'JW201 与 JW202：你拿到哪张表',
        intro:
          '两张表都由中方出具，随录取通知寄送（或稍后寄送）。拿哪张取决于你的录取方式。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**JW201**——资助为中国政府奖学金（CSC）时出具：奖学金系统随录取通知生成',
              '**JW202**——大学直接录取（自费或校级资助）时出具：由大学国际学生办公室申请',
              '**自费学生拿 JW202**——若中介承诺无奖学金却给 JW201，那是伪造',
              '**两张都可用于 X1 申请**——带原件（或大学发送的电子版）加录取通知到使馆',
              '**时间点**——表格可能比录取通知晚数周寄到；规划签证申请时给 30 天换发窗口留足时间',
            ],
          },
        ],
      },
      {
        id: 'conversion-30-days',
        h2: '30 天居留许可换发',
        intro:
          '持 X1 入境即启动 30 天倒计时。换发需要这些。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**办理地点**——大学所在城市的公安局出入境管理部门；国际学生办公室在开学周统一组织',
              '**材料**——X1 签证护照、录取通知、JW201/JW202、临时住宿登记表（宿舍或派出所出具）、按需的体检报告、照片、费用',
              '**时限**——30 天内申请；许可通常数日至两周内出证',
              '**结果**——有效期覆盖整个项目的居留许可，通常可多次出入境',
              '**错过了？**——逾期换发按超期处理：罚款、可能遣返、影响未来签证。若入境延迟，立即告知国际学生办公室',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'X1 和 X2 签证有什么区别？',
        a: '项目时长。X1 覆盖超过 180 天的学习（学位项目），入境后 30 天内须换发居留许可。X2 覆盖 180 天及以内（一学期语言、交换），不能转为学位停留。',
      },
      {
        q: 'X1 签证可以在华停留多久？',
        a: 'X1 本身是入境签证——入境后有 30 天换发居留许可，后者才是覆盖整个项目时长的证件（通常可多次出入境）。不要在 bare X1 上安排超出换发窗口的行程。',
      },
      {
        q: 'JW201 和 JW202 有什么区别？',
        a: 'JW201 出具给中国政府奖学金（CSC）学生；JW202 出具给大学直接录取的学生（自费或校级资助）。两者都随录取通知使用、都满足 X1 申请——区别只在资助来源。',
      },
      {
        q: '办 X1 签证需要什么材料？',
        a: '护照（有效期覆盖项目期）、录取通知、JW201 或 JW202 表、填写完整的签证申请表与照片、费用。部分使馆加实体检表——以当地中国使领馆/签证中心要求为准。',
      },
      {
        q: '可以在中国境内从 X2 转 X1 吗？',
        a: '常规流程不能直接转——X2 是短期停留签证，不能换发为学位居留许可。X2 语言班学期结束后申请学位项目，通常需在境外重新申请并持新 X1 入境。',
      },
    ],
    howToSteps: [
      {
        name: '确认项目对应哪种签证',
        text: '看录取通知上的时长：超过 180 天 → X1；180 天及以内 → X2。学位项目与 CSC 奖学金一律 X1。',
      },
      {
        name: '收齐录取通知 + JW201/JW202',
        text: '表格随资助走：CSC 奖学金得 JW201，大学直接录取得 JW202。若通知到手数周仍未收到表，邮件国际学生办公室。',
      },
      {
        name: '到中国使领馆/签证中心申请',
        text: '护照、录取通知、JW 表、申请表 + 照片、费用。处理通常只需数日——材料齐了就办，不要拖到起飞前一周。',
      },
      {
        name: '入境并登记住宿地址',
        text: '抵华后由宿舍或辖区派出所出具临时住宿登记表——换发居留许可的必备材料。',
      },
      {
        name: '30 天内将 X1 换发为居留许可',
        text: '随国际学生办公室到出入境管理部门，带护照、通知、JW 表、登记表与照片。居留许可随后覆盖整个项目。',
      },
    ],
    ctaTitle: '正在办签证这一步？',
    ctaSubtitle:
      'SICA 顾问核对录取函对应的签证类型、跟踪 JW201/JW202 寄送时间、并指导 30 天换发流程。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/guides/visa',
        label: '中国学生签证指南',
        description: '完整签证流程：材料、费用、延期、打工权利。',
      },
      {
        href: '/guides/application',
        label: '中国大学申请流程',
        description: '产出录取通知 + JW 表的申请时间线。',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC 奖学金 2027',
        description: 'CSC 奖学金生领取 JW201——了解奖学金如何运作。',
      },
    ],
  },
};

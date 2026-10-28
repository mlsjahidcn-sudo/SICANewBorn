import type { LocalizedGuide } from './types';
// [verify] Editorial claims previously marked for confirmation — re-check official notices before relying on figures or dates.

/**
 * Documents + Apostille / attestation for China admission from Pakistan
 * (with BD/NG comparison notes).
 * Target query: "documents required to study in china from pakistan".
 */
export const documentsRequiredPakistanGuide: LocalizedGuide = {
  en: {
    slug: 'documents-required-to-study-in-china-from-pakistan',
    eyebrow: 'GUIDE · PAKISTAN · DOCUMENTS',
    title: 'Documents Required to Study in China from Pakistan (Attestation & Apostille)',
    description:
      'Documents to study in China from Pakistan 2027: academic attestation, Apostille, police certificate, translations, and how Bangladesh/Nigeria packs differ.',
    seoTitle: 'Documents to Study in China from Pakistan | SICA',
    seoDescription:
      'Pakistan → China admission documents: HEC/IBCC attestation, MoFA Apostille, police certificate, translations, plus BD/NG notes.',
    subtitle:
      'University admission and the X1 visa both fail on weak paper trails. This page is the Pakistan-first pack: what to attest, when Apostille applies, police certificates, and certified translations — with short Bangladesh and Nigeria notes.',
    stats: [
      { value: 'Attest', label: 'IBCC / HEC then MoFA' },
      { value: 'Apostille', label: 'MoFA QR must verify' },
      { value: 'Police', label: 'Non-criminal record' },
      { value: 'Translate', label: 'EN/ZH notarised copies' },
    ],
    quickAnswer:
      'From **Pakistan**, Chinese universities typically want: passport, transcripts and diplomas with **IBCC** (school) or **HEC** (degree) attestation, **Ministry of Foreign Affairs** attestation / **Apostille**, English (or Chinese) notarised translations, study plan, recommendation letters, language scores (IELTS/TOEFL or HSK), and later a physical-examination form. Many files also need a **police character / non-criminal certificate** — if Apostilled, **scan the MoFA QR yourself** before submission (Chinese Embassy in Pakistan lists broken QR codes as a top return reason). Start attestation **8–12 weeks** before deadlines.',
    keyTakeaways: [
      'School docs → IBCC; university degrees → HEC; then MoFA attestation/Apostille',
      'Always verify Apostille QR content matches your certificate',
      'Police certificate timing matters — many expire within months',
      'Translations must match passport name spelling exactly',
      'Visa stage adds JW201/JW202 + US$2,500/year funds if self-funded',
    ],
    sections: [
      {
        id: 'core-pack',
        h2: 'Core admission document pack',
        intro: 'What universities ask for before they issue an offer.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Passport** — biodata page; valid well beyond intake',
              '**Highest diploma / degree** — matric/intermediate or bachelor’s/master’s as applicable',
              '**Full transcripts** — all semesters; grading scale noted',
              '**Study plan / personal statement**',
              '**Recommendation letters** (usually 2)',
              '**Language evidence** — IELTS/TOEFL for English-taught; HSK for Chinese-taught',
              '**CV** — dated; gaps explained',
              '**Photos** — passport-style per university template',
              '**Physical examination form** — often after offer / before visa or registration',
            ],
          },
          {
            type: 'links',
            items: [
              { label: 'How to write a study plan', href: '/how-to-write-study-plan-china' },
              { label: 'CSC recommendation letter sample', href: '/csc-recommendation-letter-sample' },
              { label: 'Medical check form', href: '/medical-check-physical-examination-form' },
            ],
          },
        ],
      },
      {
        id: 'pakistan-attestation',
        h2: 'Pakistan attestation & Apostille path',
        intro: 'Order matters. Skipping a step forces a full re-run.',
        blocks: [
          {
            type: 'table',
            caption: 'Typical Pakistan attestation chain for China applications',
            columns: ['Document type', 'First stamp', 'Then', 'Watch-outs'],
            rows: [
              [
                'Matric / Intermediate',
                'IBCC',
                'MoFA attestation or Apostille',
                'Name must match passport English spelling',
              ],
              [
                'Bachelor’s / master’s degree & transcript',
                'HEC',
                'MoFA attestation or Apostille',
                'CSC and many universities require HEC',
              ],
              [
                'Police character certificate',
                'Issuing police authority',
                'MoFA Apostille (when required)',
                'QR must open YOUR certificate',
              ],
              [
                'Translations',
                'Sworn / notarised translator',
                'Sometimes notary + MoFA',
                'University language: EN or ZH',
              ],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Chinese Embassy in Pakistan: Apostilled police certificates whose QR shows blank content or another person’s file are a documented return reason. Scan before you submit.',
          },
          {
            type: 'links',
            items: [
              {
                label: 'Embassy returned-visa reasons (police QR + funds)',
                href: 'https://pk.china-embassy.gov.cn/eng/lsfw/va/202504/t20250428_11606302.htm',
              },
              { label: 'China X1 visa from Pakistan', href: '/china-student-visa-pakistan' },
            ],
          },
        ],
      },
      {
        id: 'police-translations',
        h2: 'Police certificate and translations',
        intro: 'Two items that quietly expire or mismatch.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Police / non-criminal record** — request early; many Chinese universities and visa posts want a document issued within the last 6 months',
              '**Apostille check** — phone camera on the MoFA QR; content must match name and ID',
              '**Translations** — every stamp page; do not translate only the first page of a multi-page transcript',
              '**Name lock** — pick one English spelling from the passport and use it on HEC, MoFA, CSC, and university forms',
            ],
          },
        ],
      },
      {
        id: 'bd-ng',
        h2: 'Bangladesh and Nigeria (short comparison)',
        intro: 'Same China checklist; different home attestation brands.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Bangladesh** — education boards / UGC paths + MoFA attestation; Dhaka VAC X1 list adds US$2,500/year bank proof for self-funded visa stage',
              '**Nigeria** — WAEC/NECO and degree verification + MoFA legalisation as required by the Chinese mission; keep police report timing tight',
              '**Shared China side** — notarised EN/ZH copies, clean JW201/JW202, no altered forms',
            ],
          },
          {
            type: 'links',
            items: [
              { label: 'X1 visa — Bangladesh', href: '/china-student-visa-bangladesh' },
              { label: 'X1 visa — Nigeria', href: '/china-student-visa-nigeria' },
            ],
          },
        ],
      },
      {
        id: 'timeline',
        h2: '8–12 week timeline',
        intro: 'Work backward from the earliest CSC or university deadline.',
        blocks: [
          {
            type: 'ol',
            items: [
              'Week 1–2 — request transcripts, police certificate, book medical if needed',
              'Week 3–6 — IBCC/HEC + MoFA Apostille; order translations',
              'Week 7–8 — upload university / CSC file; chase pre-admission if required',
              'After offer — JW201/JW202, visa appointment, funds proof if self-funded',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What documents are required to study in China from Pakistan?',
        a: 'Passport, attested transcripts and diplomas (IBCC or HEC then MoFA/Apostille), translations, study plan, recommendation letters, language scores, and often a police certificate and medical form. Visa stage adds admission notice + JW201/JW202 and funds proof if self-funded.',
      },
      {
        q: 'Do I need Apostille for China from Pakistan?',
        a: 'Many China-bound academic and police documents now go through MoFA Apostille. Always confirm the receiving university and Chinese mission’s current list, and verify the Apostille QR before submission.',
      },
      {
        q: 'Is HEC attestation mandatory?',
        a: 'For degree-holder applications (especially CSC), HEC attestation of university documents is the standard expectation. School-level credentials usually go through IBCC instead.',
      },
      {
        q: 'How long does attestation take?',
        a: 'Plan 8–12 weeks end-to-end including translations. Peak CSC season is slower — start earlier if you need a pre-admission letter too.',
      },
    ],
    howToSteps: [
      {
        name: 'List every document the university/CSC wants',
        text: 'Separate school-level vs degree-level items so IBCC and HEC do not get mixed up.',
      },
      {
        name: 'Attest then Apostille',
        text: 'IBCC or HEC first, then MoFA. Verify every QR.',
      },
      {
        name: 'Translate and name-lock',
        text: 'Notarise EN/ZH copies using the exact passport spelling.',
      },
      {
        name: 'Add visa-stage papers after offer',
        text: 'JW form, funds if self-funded, medical form as required.',
      },
    ],
    ctaTitle: 'Need a Pakistan document checklist for your intake?',
    ctaSubtitle:
      'SICA counselors sequence IBCC/HEC, Apostille, and CSC uploads so you do not miss the Nov–Mar pre-admission window. First consult free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/china-student-visa-pakistan',
        label: 'China X1 visa from Pakistan',
        description: 'Funds proof and embassy return reasons.',
      },
      {
        href: '/pre-admission-letter-csc-2027',
        label: 'CSC pre-admission letter 2027',
        description: 'What to email universities with your attested pack.',
      },
      {
        href: '/guides/application',
        label: 'Application process guide',
        description: 'End-to-end university application steps.',
      },
    ],
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
  },
  zh: {
    slug: 'documents-required-to-study-in-china-from-pakistan',
    eyebrow: '指南 · 巴基斯坦 · 材料',
    title: '从巴基斯坦赴华留学所需材料（认证与海牙认证）',
    description:
      '2027 年巴基斯坦赴华材料：学历认证、海牙认证、无犯罪记录、翻译，以及孟加拉/尼日利亚差异简述。',
    seoTitle: '巴基斯坦赴华留学材料清单 | SICA',
    seoDescription:
      '巴基斯坦→中国录取材料：HEC/IBCC 认证、外交部海牙认证、警察证、翻译，并附孟/尼说明。',
    subtitle:
      '大学录取与 X1 签证都会毁在薄弱的材料链上。本页以巴基斯坦为主：认证什么、何时需要海牙认证、警察证与公证翻译——并附孟加拉、尼日利亚短对比。',
    stats: [
      { value: '认证', label: 'IBCC / HEC → 外交部' },
      { value: '海牙', label: '外交部二维码须可验' },
      { value: '警察证', label: '无犯罪记录' },
      { value: '翻译', label: '中/英公证件' },
    ],
    quickAnswer:
      '从**巴基斯坦**申请中国大学，通常需要：护照、经 **IBCC**（中学）或 **HEC**（学位）认证的成绩单与文凭、**外交部**认证 / **海牙认证（Apostille）**、英文（或中文）公证翻译、学习计划、推荐信、语言成绩（雅思/托福或 HSK），以及随后的体检表。许多材料还需要**无犯罪记录 / 品行证明**——若已海牙认证，提交前**自行扫描外交部二维码**（中国驻巴使馆将失效二维码列为常见退件原因）。建议在截止日前 **8–12 周**启动认证。',
    keyTakeaways: [
      '中学材料走 IBCC；大学学位走 HEC；再到外交部认证/海牙认证',
      '务必核验海牙认证二维码内容与本人证件一致',
      '警察证有时效——许多数月内失效',
      '翻译姓名拼写须与护照完全一致',
      '签证阶段另需 JW201/JW202；自费另备每学年 2,500 美元资金证明',
    ],
    sections: [
      {
        id: 'core-pack',
        h2: '核心录取材料包',
        intro: '大学发录取前通常要求这些。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**护照**——个人信息页；有效期覆盖入学后足够时长',
              '**最高学历证明**——中学或学士/硕士（视申请层次）',
              '**完整成绩单**——各学期；注明评分标准',
              '**学习计划 / 个人陈述**',
              '**推荐信**（通常 2 封）',
              '**语言证明**——英文授课用雅思/托福；中文授课用 HSK',
              '**简历**——注明日期；空档有说明',
              '**照片**——按大学模板',
              '**外国人体格检查表**——常在录取后 / 签证或报到前',
            ],
          },
        ],
      },
      {
        id: 'pakistan-attestation',
        h2: '巴基斯坦认证与海牙认证路径',
        intro: '顺序很重要。跳步往往要整套重做。',
        blocks: [
          {
            type: 'table',
            caption: '赴华申请常见巴基斯坦认证链',
            columns: ['材料类型', '第一步', '然后', '注意'],
            rows: [
              ['中学（Matric / Intermediate）', 'IBCC', '外交部认证或海牙认证', '姓名须与护照英文拼写一致'],
              ['学士/硕士学位与成绩单', 'HEC', '外交部认证或海牙认证', 'CSC 与许多高校要求 HEC'],
              ['警察品行证明', '出具机关', '外交部海牙认证（如需要）', '二维码须打开“你的”证件'],
              ['翻译件', '宣誓/公证翻译', '有时再公证 + 外交部', '大学语言：英或中'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '中国驻巴基斯坦使馆：海牙认证警察证二维码显示空白或他人信息，是有据可查的退件原因。提交前先扫。',
          },
        ],
      },
      {
        id: 'police-translations',
        h2: '警察证与翻译',
        intro: '两样最容易过期或对不上。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**无犯罪记录**——尽早办理；许多中国高校与签证点要求近 6 个月内出具 [核实]',
              '**海牙核验**——手机扫描外交部二维码；内容须匹配姓名与证件',
              '**翻译**——含盖章页；勿只译多页成绩单的第一页',
              '**姓名锁定**——以护照英文拼写为准，贯穿 HEC、外交部、CSC 与大学表格',
            ],
          },
        ],
      },
      {
        id: 'bd-ng',
        h2: '孟加拉与尼日利亚（短对比）',
        intro: '中国侧清单相同；本国认证品牌不同。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**孟加拉**——教育委员会 / UGC 路径 + 外交部认证；达卡签证中心 X1 另要求自费生每学年 2,500 美元银行证明',
              '**尼日利亚**——WAEC/NECO 与学位核验 + 按中国使领馆要求的外交部认证；警察证时效要紧',
              '**中国侧共性**——中/英公证件、干净的 JW201/JW202、禁止涂改',
            ],
          },
        ],
      },
      {
        id: 'timeline',
        h2: '8–12 周时间线',
        intro: '从最早的 CSC 或大学截止日期倒推。',
        blocks: [
          {
            type: 'ol',
            items: [
              '第 1–2 周——申请成绩单、警察证，按需预约体检',
              '第 3–6 周——IBCC/HEC + 外交部海牙认证；安排翻译',
              '第 7–8 周——上传大学 / CSC 材料；如需则追预录取',
              '录取后——JW201/JW202、签证预约；自费准备资金证明',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '从巴基斯坦赴华留学需要哪些材料？',
        a: '护照、经认证的成绩单与文凭（IBCC 或 HEC 再到外交部/海牙认证）、翻译件、学习计划、推荐信、语言成绩，以及常需的警察证与体检表。签证阶段另加录取通知 + JW201/JW202，自费另加资金证明。',
      },
      {
        q: '从巴基斯坦赴华需要海牙认证吗？',
        a: '许多学术与警察类材料现走外交部海牙认证。务必确认接收大学与中国使领馆现行清单，并在提交前核验二维码。',
      },
      {
        q: 'HEC 认证必须吗？',
        a: '学位持有者申请（尤其 CSC）通常要求大学材料经 HEC 认证。中学学历一般走 IBCC。',
      },
      {
        q: '认证要多久？',
        a: '含翻译建议预留 8–12 周。CSC 高峰更慢——若还需要预录取通知，请更早启动。',
      },
    ],
    howToSteps: [
      {
        name: '列出大学/CSC 要求的全部材料',
        text: '区分中学与学位材料，避免 IBCC 与 HEC 混用。',
      },
      {
        name: '先认证再海牙认证',
        text: '先 IBCC 或 HEC，再外交部。逐一核验二维码。',
      },
      {
        name: '翻译并锁定姓名',
        text: '按护照拼写办理中/英公证翻译。',
      },
      {
        name: '录取后再补签证材料',
        text: 'JW 表；自费资金证明；按需体检表。',
      },
    ],
    ctaTitle: '需要按入学季定制的巴基斯坦材料清单？',
    ctaSubtitle:
      'SICA 顾问帮你排期 IBCC/HEC、海牙认证与 CSC 上传，避免错过 11–3 月预录取窗口。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/china-student-visa-pakistan',
        label: '从巴基斯坦办中国 X1',
        description: '资金证明与使馆退件原因。',
      },
      {
        href: '/pre-admission-letter-csc-2027',
        label: 'CSC 2027 预录取通知书',
        description: '认证材料齐备后如何给大学发邮件。',
      },
      {
        href: '/guides/application',
        label: '申请流程指南',
        description: '大学申请端到端步骤。',
      },
    ],
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
  },
};

import type { Guide, LocalizedGuide } from './types';
// [verify] Editorial claims previously marked for confirmation — re-check official notices before relying on figures or dates.

/**
 * Per-country China X1 student visa guides for Pakistan, Bangladesh,
 * and Nigeria. Shared structure; country-specific apply channel,
 * funds rule framing, and return reasons.
 *
 * Target queries:
 * - "china student visa from pakistan"
 * - "china student visa bangladesh" / Dhaka X1 checklist
 * - "china student visa nigeria"
 *
 * Grounded sources (cited in-page):
 * - Dhaka VAC X1 checklist (visaforchina.cn DAC4) — bank statement
 *   ≥ US$2,500 per study year for self-funded applicants
 * - Chinese Embassy in Pakistan "Most Common Reasons for the
 *   Returned Visa Application" (2025-04-28) — JW alteration,
 *   apostille QR failures, blurry photos, self-funded without
 *   funds proof, fake funds (US$2,500 / academic year)
 */

export type VisaCountryId = 'pakistan' | 'bangladesh' | 'nigeria';

interface VisaCountryConfig {
  id: VisaCountryId;
  slug: string;
  countryEn: string;
  countryZh: string;
  adjectiveEn: string;
  adjectiveZh: string;
  applyWhereEn: string;
  applyWhereZh: string;
  applyWhereDetailEn: string;
  applyWhereDetailZh: string;
  fundsNoteEn: string;
  fundsNoteZh: string;
  returnExtraEn: string[];
  returnExtraZh: string[];
  sourceLinks: Array<{ label: string; href: string }>;
  sourceLinksZh: Array<{ label: string; href: string }>;
  seoQueryHint: string;
}

const COUNTRIES: Record<VisaCountryId, VisaCountryConfig> = {
  pakistan: {
    id: 'pakistan',
    slug: 'china-student-visa-pakistan',
    countryEn: 'Pakistan',
    countryZh: '巴基斯坦',
    adjectiveEn: 'Pakistani',
    adjectiveZh: '巴基斯坦',
    applyWhereEn: 'Chinese Embassy in Pakistan / authorised visa centre',
    applyWhereZh: '中国驻巴基斯坦使馆 / 授权签证中心',
    applyWhereDetailEn:
      'Submit through the Chinese Embassy in Pakistan (or the visa centre it designates). Follow the current embassy notice for appointment booking, fees, and whether biometrics are collected on the day.',
    applyWhereDetailZh:
      '通过中国驻巴基斯坦使馆（或其指定的签证中心）提交。预约、费用与是否当场采集生物识别，以使馆最新通知为准。',
    fundsNoteEn:
      'The Chinese Embassy in Pakistan states the X-visa self-funded standard as **US$2,500 per academic year**, calculated for your full study duration. Scholarship holders whose JW201/JW202 is ticked “scholarship” normally do not submit a separate bank statement.',
    fundsNoteZh:
      '中国驻巴基斯坦使馆写明：自费 X 签证资金证明标准为**每学年 2,500 美元**，按在校学习总时长累计。JW201/JW202 勾选“奖学金”的奖学金生通常无需另交银行流水。',
    returnExtraEn: [
      '**Altered JW201/JW202** — any hand edit, white-out, or photocopy alteration is a top return reason; request a reissue from the university',
      '**Apostilled police certificate QR fails** — scan the MoFA Pakistan apostille QR yourself before submission; if it shows blank content or another person’s certificate, fix it with MoFA first',
      '**Blurry / unqualified ID photo** on the visa form — identity verification fails and the file is returned',
      '**JW ticked “self-funded” with no bank proof** — either supply the US$2,500/year statement or ask the school to correct the funding tick to “scholarship” if you truly hold one',
      '**Fake or mismatched bank statements** — embassy notice explicitly flags fabricated funds proof',
    ],
    returnExtraZh: [
      '**涂改 JW201/JW202**——手改、涂改液、复印件篡改均为常见退件原因；应向学校申请重新出具',
      '**已加签警察证二维码失效**——提交前自行扫描巴基斯坦外交部加签二维码；若显示空白或他人证件，先联系外交部更正',
      '**签证表证件照模糊不合格**——身份核验失败即退件',
      '**JW 勾选“自费”却无资金证明**——补交每学年 2,500 美元标准的银行证明，或若确有奖学金则请学校将资助勾选项改为“奖学金”',
      '**伪造或不匹配的银行流水**——使馆通知明确点名虚假资金证明',
    ],
    sourceLinks: [
      {
        label: 'Chinese Embassy in Pakistan — returned visa reasons (X visa chapter)',
        href: 'https://pk.china-embassy.gov.cn/eng/lsfw/va/202504/t20250428_11606302.htm',
      },
      {
        label: 'Dhaka VAC X1 checklist (US$2,500 / year bank statement rule)',
        href: 'https://www.visaforchina.cn/DAC4_EN/qianzhengyewu/jichuzhishi/banliliucheng/551675378507321366.html',
      },
      { label: 'SICA: X1 vs X2 and JW201/JW202', href: '/x1-vs-x2-student-visa-china' },
      { label: 'SICA: JW202 and residence permit', href: '/china-student-visa-jw202-residence-permit' },
    ],
    sourceLinksZh: [
      {
        label: '中国驻巴基斯坦使馆——常见退件原因（X 签证章节）',
        href: 'https://pk.china-embassy.gov.cn/eng/lsfw/va/202504/t20250428_11606302.htm',
      },
      {
        label: '达卡签证中心 X1 清单（每学年 2,500 美元银行证明）',
        href: 'https://www.visaforchina.cn/DAC4_EN/qianzhengyewu/jichuzhishi/banliliucheng/551675378507321366.html',
      },
      { label: 'SICA：X1 与 X2 及 JW201/JW202', href: '/x1-vs-x2-student-visa-china' },
      { label: 'SICA：JW202 与居留许可', href: '/china-student-visa-jw202-residence-permit' },
    ],
    seoQueryHint: 'china student visa from pakistan',
  },
  bangladesh: {
    id: 'bangladesh',
    slug: 'china-student-visa-bangladesh',
    countryEn: 'Bangladesh',
    countryZh: '孟加拉国',
    adjectiveEn: 'Bangladeshi',
    adjectiveZh: '孟加拉',
    applyWhereEn: 'Chinese Visa Application Service Center, Dhaka (DAC4)',
    applyWhereZh: '中国签证申请服务中心·达卡（DAC4）',
    applyWhereDetailEn:
      'Most applicants in Bangladesh file at the Chinese Visa Application Service Center in Dhaka (visaforchina.cn DAC4). Hours are typically Sunday–Thursday; confirm current submission windows on the centre site before booking.',
    applyWhereDetailZh:
      '在孟加拉国，多数申请人在达卡中国签证申请服务中心（visaforchina.cn DAC4）递交。通常周日–周四办公；预约前在中心网站确认最新递交时段。',
    fundsNoteEn:
      'The Dhaka VAC X1 checklist requires self-funded applicants to submit a **bank statement proving at least US$2,500 for each year** of study in China. Scholarship applicants should bring scholarship proof instead.',
    fundsNoteZh:
      '达卡签证中心 X1 清单要求自费申请人提交**证明每年至少 2,500 美元**的银行对账单。奖学金申请人改交奖学金证明。',
    returnExtraEn: [
      '**Missing original JW201/JW202 + admission letter** — Dhaka checklist asks for originals and one copy when you hand in the passport',
      '**Bank statement below US$2,500 × study years** — top up or get a sponsor letter that the centre accepts',
      '**Applying in Bangladesh on a non-Bangladeshi passport** without proof of legal stay (residence / work / student status)',
      '**Dual nationals** — bring all valid passports; previous passports may be requested',
      '**Altered JW forms** — same red flag as other missions; never edit the form yourself',
    ],
    returnExtraZh: [
      '**缺少 JW201/JW202 与录取通知原件**——达卡清单要求递交护照时出示原件并各留一份复印件',
      '**银行证明低于 2,500 美元 × 学年数**——补足金额或按中心要求提供可接受的资助证明 [核实]',
      '**持非孟加拉护照在孟加拉申请**却无法证明合法停留（居留 / 工作 / 学生身份）',
      '**双重国籍**——携带全部有效护照；可能还要求旧护照',
      '**涂改 JW 表**——与其他使领馆同样是红线；切勿自行修改',
    ],
    sourceLinks: [
      {
        label: 'Dhaka VAC — (X1) Long term study checklist',
        href: 'https://www.visaforchina.cn/DAC4_EN/qianzhengyewu/jichuzhishi/banliliucheng/551675378507321366.html',
      },
      {
        label: 'Chinese Embassy in Pakistan — X visa return reasons (funds / JW patterns)',
        href: 'https://pk.china-embassy.gov.cn/eng/lsfw/va/202504/t20250428_11606302.htm',
      },
      { label: 'SICA: X1 vs X2 and JW201/JW202', href: '/x1-vs-x2-student-visa-china' },
      { label: 'SICA: CSC for Bangladeshi students', href: '/csc-scholarship-bangladesh' },
    ],
    sourceLinksZh: [
      {
        label: '达卡签证中心——（X1）长期学习材料清单',
        href: 'https://www.visaforchina.cn/DAC4_EN/qianzhengyewu/jichuzhishi/banliliucheng/551675378507321366.html',
      },
      {
        label: '中国驻巴基斯坦使馆——X 签证退件原因（资金 / JW 模式）',
        href: 'https://pk.china-embassy.gov.cn/eng/lsfw/va/202504/t20250428_11606302.htm',
      },
      { label: 'SICA：X1 与 X2 及 JW201/JW202', href: '/x1-vs-x2-student-visa-china' },
      { label: 'SICA：孟加拉学生 CSC 奖学金', href: '/csc-scholarship-bangladesh' },
    ],
    seoQueryHint: 'china student visa bangladesh',
  },
  nigeria: {
    id: 'nigeria',
    slug: 'china-student-visa-nigeria',
    countryEn: 'Nigeria',
    countryZh: '尼日利亚',
    adjectiveEn: 'Nigerian',
    adjectiveZh: '尼日利亚',
    applyWhereEn: 'Chinese Embassy / Consulate or authorised VAC in Nigeria',
    applyWhereZh: '中国驻尼日利亚使领馆或授权签证中心',
    applyWhereDetailEn:
      'File at the Chinese Embassy or Consulate serving your region in Nigeria, or the visa centre they designate. Confirm the current appointment system and document list on the mission’s notice before you travel to the centre.',
    applyWhereDetailZh:
      '向服务你所在地区的中国驻尼日利亚使领馆或其指定签证中心递交。出行前在使领馆通知中确认最新预约方式与材料清单。',
    fundsNoteEn:
      'Treat **US$2,500 per academic year** as the working self-funded benchmark used on China student-visa checklists (Dhaka VAC and the Pakistan embassy X-visa notice). Nigerian posts may phrase the same requirement as a multi-year bank balance — multiply years × US$2,500 and keep statements recent.',
    fundsNoteZh:
      '以**每学年 2,500 美元**作为自费学生签证的通行工作标准（达卡签证中心与驻巴使馆 X 签证通知均如此表述）。尼日利亚使领馆可能要求多年累计余额——按学年数 × 2,500 美元准备，并保持流水较新。',
    returnExtraEn: [
      '**JW funding tick vs reality** — if JW says self-funded, bring bank proof; if you have a scholarship, the form must say so',
      '**Name / DOB / passport number mismatches** across the online form, passport, and JW — a common return trigger everywhere',
      '**Unclear or edited JW201/JW202** — never alter; request a clean reissue',
      '**Weak or fabricated funds proof** — use genuine statements covering US$2,500 × years of study',
      '**Police / non-criminal certificate issues** — if your post requires apostille or attestation, verify QR / stamps before submission',
    ],
    returnExtraZh: [
      '**JW 资助勾选与实际情况不符**——勾选自费须带银行证明；若有奖学金，表格必须如实勾选',
      '**在线表格、护照与 JW 上姓名 / 出生日期 / 护照号不一致**——各地常见退件点',
      '**JW201/JW202 不清晰或被涂改**——切勿自行修改；申请重新出具',
      '**资金证明薄弱或伪造**——使用真实流水，覆盖 2,500 美元 × 学年数',
      '**无犯罪记录证明问题**——若使领馆要求加签/认证，提交前核验二维码与印章',
    ],
    sourceLinks: [
      {
        label: 'Dhaka VAC X1 checklist (US$2,500 / year funds rule)',
        href: 'https://www.visaforchina.cn/DAC4_EN/qianzhengyewu/jichuzhishi/banliliucheng/551675378507321366.html',
      },
      {
        label: 'Chinese Embassy in Pakistan — X visa return reasons',
        href: 'https://pk.china-embassy.gov.cn/eng/lsfw/va/202504/t20250428_11606302.htm',
      },
      { label: 'SICA: X1 vs X2 and JW201/JW202', href: '/x1-vs-x2-student-visa-china' },
      { label: 'SICA: CSC for Nigerian students', href: '/csc-scholarship-nigeria' },
    ],
    sourceLinksZh: [
      {
        label: '达卡签证中心 X1 清单（每学年 2,500 美元资金规则）',
        href: 'https://www.visaforchina.cn/DAC4_EN/qianzhengyewu/jichuzhishi/banliliucheng/551675378507321366.html',
      },
      {
        label: '中国驻巴基斯坦使馆——X 签证退件原因',
        href: 'https://pk.china-embassy.gov.cn/eng/lsfw/va/202504/t20250428_11606302.htm',
      },
      { label: 'SICA：X1 与 X2 及 JW201/JW202', href: '/x1-vs-x2-student-visa-china' },
      { label: 'SICA：尼日利亚学生 CSC 奖学金', href: '/csc-scholarship-nigeria' },
    ],
    seoQueryHint: 'china student visa nigeria',
  },
};

function siblingVisaLinks(id: VisaCountryId): Array<{ href: string; label: string; description: string }> {
  const others = (Object.keys(COUNTRIES) as VisaCountryId[]).filter((c) => c !== id);
  return others.map((c) => ({
    href: `/${COUNTRIES[c].slug}`,
    label: `China X1 student visa — ${COUNTRIES[c].countryEn}`,
    description: `Documents, US$2,500/year funds, and return reasons for ${COUNTRIES[c].adjectiveEn} applicants.`,
  }));
}

function siblingVisaLinksZh(id: VisaCountryId): Array<{ href: string; label: string; description: string }> {
  const others = (Object.keys(COUNTRIES) as VisaCountryId[]).filter((c) => c !== id);
  return others.map((c) => ({
    href: `/${COUNTRIES[c].slug}`,
    label: `中国 X1 学生签证——${COUNTRIES[c].countryZh}`,
    description: `${COUNTRIES[c].adjectiveZh}申请人的材料、每学年 2,500 美元资金证明与退件原因。`,
  }));
}

function buildEn(cfg: VisaCountryConfig): Guide {
  const yearsExample = '4-year degree → about US$10,000 shown across statements';
  return {
    slug: cfg.slug,
    eyebrow: `GUIDE · ${cfg.countryEn.toUpperCase()} · VISA`,
    title: `China X1 Student Visa from ${cfg.countryEn}: Documents, US$2,500 Funds & Return Reasons`,
    description: `China X1 student visa from ${cfg.countryEn}: document checklist, US$2,500-per-year proof of funds, JW201/JW202 rules, and why applications get returned.`,
    seoTitle: `China X1 Student Visa from ${cfg.countryEn} | SICA`,
    seoDescription: `China X1 student visa from ${cfg.countryEn}: documents, US$2,500/year bank proof, JW201/JW202, and the return reasons embassies cite most.`,
    subtitle: `For ${cfg.adjectiveEn} students starting a degree in China (study >180 days). Covers the X1 file, the US$2,500-per-academic-year funds rule for self-funded applicants, and the mistakes that send files back.`,
    stats: [
      { value: 'X1', label: 'Degree study >180 days' },
      { value: 'US$2,500', label: 'Per academic year (self-funded)' },
      { value: 'JW201/202', label: 'Required with admission letter' },
      { value: '30 days', label: 'Residence-permit conversion after entry' },
    ],
    quickAnswer: `Degree programs in China need an **X1** student visa (study longer than 180 days). From ${cfg.countryEn}, apply at the ${cfg.applyWhereEn} with your passport, admission notice, original JW201 or JW202, photo, and forms. Self-funded applicants must show bank funds of about **US$2,500 per academic year** of study (${yearsExample}). Scholarship holders whose JW form is marked “scholarship” usually skip the bank statement. After entry, convert the X1 into a residence permit within 30 days. Files are commonly returned for altered JW forms, bad photos, apostille QR failures, and missing or fake funds proof.`,
    keyTakeaways: [
      `Target query intent: "${cfg.seoQueryHint}" — country-specific X1 ops, not the global visa overview`,
      'X1 = study >180 days; convert to a residence permit within 30 days of entry',
      'Core pack: passport + admission letter + JW201 (CSC) or JW202 (university) + photo + forms',
      'Self-funded: bank statement ≈ US$2,500 × number of academic years',
      'Never alter a JW form; request a clean reissue from the university',
      'Scan apostille / attestation QR codes yourself before you submit',
    ],
    sections: [
      {
        id: 'who-needs-x1',
        h2: `Who needs an X1 visa from ${cfg.countryEn}?`,
        intro: 'If your program runs longer than 180 days, you need X1 — not X2.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**X1** — bachelor’s, master’s, PhD, and most CSC scholarship years (study >180 days)',
              '**X2** — language or exchange programs of 180 days or less; does not convert into a degree residence permit',
              '**After entry on X1** — apply for a foreigners’ residence permit within 30 days at the local exit-entry administration',
              `**Apply channel** — ${cfg.applyWhereEn}`,
            ],
          },
          {
            type: 'links',
            items: [
              { label: 'SICA: X1 vs X2 deep dive', href: '/x1-vs-x2-student-visa-china' },
              { label: 'SICA: JW202 + residence permit', href: '/china-student-visa-jw202-residence-permit' },
            ],
          },
        ],
      },
      {
        id: 'documents',
        h2: 'Document checklist',
        intro: `What ${cfg.adjectiveEn} applicants should assemble before the appointment.`,
        blocks: [
          {
            type: 'ol',
            items: [
              '**Passport** — typically ≥6 months validity and blank visa pages',
              '**ID photo** — recent colour, forward-facing, light background; size rules vary (Dhaka lists 48mm × 33mm) — follow your centre’s template',
              '**Admission letter** — original + copy when the centre requires it',
              '**Form JW201 or JW202** — original + copy; never hand-altered',
              '**Scholarship proof** — if funded; otherwise bank statement (next section)',
              '**Online visa form** — names, passport number, and dates must match the passport and JW exactly',
              '**Legal stay proof** — if you apply outside your country of citizenship',
            ],
          },
          {
            type: 'p',
            text: cfg.applyWhereDetailEn,
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Consular officers can demand originals, interviews, or extra proof (tax records, relationship evidence). Build a clean primary file; keep spare originals ready.',
          },
        ],
      },
      {
        id: 'proof-of-funds',
        h2: 'Proof of funds: US$2,500 per academic year',
        intro: 'This is the number self-funded students search for — and the number posts cite when returning weak files.',
        blocks: [
          {
            type: 'p',
            text: cfg.fundsNoteEn,
          },
          {
            type: 'table',
            caption: 'How to size the bank statement',
            columns: ['Study length', 'Minimum working total', 'Notes'],
            rows: [
              ['1 academic year', '≈ US$2,500', 'Language + foundation years still count'],
              ['4-year bachelor’s', '≈ US$10,000', 'Show balance / average that covers the total'],
              ['2-year master’s', '≈ US$5,000', 'Keep statements recent (often last 3–6 months)'],
              ['Scholarship (JW = scholarship)', 'Usually none', 'Bring award letter; fix JW if wrongly ticked self-funded'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'If JW201/JW202 is ticked “self-funded” but you hold a school scholarship, ask the university to reissue the form. Submitting without funds proof while the form says self-funded is a documented return reason.',
          },
          {
            type: 'ul',
            items: [
              'Use **genuine** statements from your bank — fabricated funds proof is explicitly listed as a return reason',
              'Name on the account should match the applicant (or a sponsor package the mission accepts)',
              'Currency can be local equivalent; officers care about the USD-equivalent coverage',
            ],
          },
        ],
      },
      {
        id: 'return-reasons',
        h2: 'Why X1 applications get returned',
        intro: 'Fix these before you pay the fee.',
        blocks: [
          {
            type: 'ul',
            items: cfg.returnExtraEn,
          },
          {
            type: 'links',
            items: cfg.sourceLinks,
          },
        ],
      },
      {
        id: 'after-entry',
        h2: 'After you land in China',
        intro: 'The visa gets you in; the residence permit keeps you there.',
        blocks: [
          {
            type: 'ol',
            items: [
              'Register your address (dorm or local police station) — you need the temporary residence registration form',
              'Complete any university medical / orientation steps they schedule',
              'Apply for the residence permit within **30 days** of entry with the international student office',
              'Do not travel on a bare X1 past the conversion window',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: `How much bank balance do I need for a China student visa from ${cfg.countryEn}?`,
        a: 'Plan on about US$2,500 per academic year of study for self-funded applicants, as stated on the Dhaka X1 checklist and the Chinese Embassy in Pakistan’s X-visa return-reasons notice. Multiply by your program length. Scholarship holders whose JW form is marked scholarship usually do not need a separate statement.',
      },
      {
        q: 'Do I need JW201 or JW202?',
        a: 'CSC (Chinese Government Scholarship) students normally receive JW201. Students admitted directly by a university (self-funded or university scholarship) receive JW202. Both work for X1; never alter either form.',
      },
      {
        q: `Where do ${cfg.adjectiveEn} students apply?`,
        a: cfg.applyWhereDetailEn,
      },
      {
        q: 'What happens if my visa file is returned?',
        a: 'Fix the exact defect (new JW, clearer photo, working apostille QR, correct funds proof), then rebook. Do not resubmit the same broken scan — returned reasons are checked again.',
      },
      {
        q: 'Is X1 enough to stay for the whole degree?',
        a: 'No. X1 is an entry visa. Within 30 days of arrival you must convert it into a residence permit that covers the program.',
      },
    ],
    howToSteps: [
      {
        name: 'Confirm you need X1',
        text: 'Program longer than 180 days → X1. Collect the admission notice and wait for JW201 or JW202.',
      },
      {
        name: 'Build the document pack',
        text: 'Passport, photo, admission letter, clean JW form, online form. Add scholarship proof or US$2,500/year bank evidence.',
      },
      {
        name: 'Pre-check return traps',
        text: 'Scan apostille QRs, verify photo quality, confirm JW funding tick matches reality, never edit the JW.',
      },
      {
        name: `Submit in ${cfg.countryEn}`,
        text: `Book and file at the ${cfg.applyWhereEn}. Bring originals and copies as listed.`,
      },
      {
        name: 'Enter China and convert within 30 days',
        text: 'Register address, then apply for the residence permit with your university’s international office.',
      },
    ],
    ctaTitle: `Need help with your ${cfg.countryEn} → China X1 file?`,
    ctaSubtitle:
      'SICA counselors check JW funding ticks, funds math, and document consistency before you book the embassy appointment. First consultation free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      ...siblingVisaLinks(cfg.id),
      {
        href: '/guides/visa',
        label: 'China student visa overview',
        description: 'Global X1/X2 process guide.',
      },
      {
        href: '/medical-check-physical-examination-form',
        label: 'Medical check & physical examination form',
        description: 'The health form many long-stay files also need.',
      },
    ],
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
  };
}

function buildZh(cfg: VisaCountryConfig): Guide {
  return {
    slug: cfg.slug,
    eyebrow: `指南 · ${cfg.countryZh} · 签证`,
    title: `从${cfg.countryZh}办理中国 X1 学生签证：材料、每学年 2,500 美元资金与退件原因`,
    description: `从${cfg.countryZh}办理中国 X1 学生签证：材料清单、每学年 2,500 美元资金证明、JW201/JW202 规则，以及常见退件原因。`,
    seoTitle: `从${cfg.countryZh}办中国 X1 学生签证 | SICA`,
    seoDescription: `从${cfg.countryZh}办理中国 X1：材料、每学年 2,500 美元银行证明、JW201/JW202，以及使馆最常退件的原因。`,
    subtitle: `面向在中国就读学位（学习超过 180 天）的${cfg.adjectiveZh}学生。涵盖 X1 材料包、自费生每学年 2,500 美元资金规则，以及导致退件的失误。`,
    stats: [
      { value: 'X1', label: '学位学习 >180 天' },
      { value: 'US$2,500', label: '每学年（自费）' },
      { value: 'JW201/202', label: '须与录取通知一并提交' },
      { value: '30 天', label: '入境后换发居留许可' },
    ],
    quickAnswer: `在中国攻读学位通常需要 **X1** 学生签证（学习超过 180 天）。在${cfg.countryZh}，于${cfg.applyWhereZh}递交护照、录取通知、JW201 或 JW202 原件、照片与表格。自费申请人须准备约**每学年 2,500 美元**的银行资金证明（按学制累计）。JW 表勾选“奖学金”的奖学金生通常可免交银行流水。入境后 30 天内将 X1 换发为居留许可。常见退件原因包括涂改 JW、照片不合格、加签二维码失效，以及缺失或伪造资金证明。`,
    keyTakeaways: [
      'X1 = 学习超过 180 天；入境后 30 天内换发居留许可',
      '核心材料：护照 + 录取通知 + JW201（CSC）或 JW202（大学）+ 照片 + 表格',
      '自费：银行证明 ≈ 2,500 美元 × 学年数',
      '切勿涂改 JW；向学校申请重新出具',
      '提交前自行扫描加签 / 认证二维码',
    ],
    sections: [
      {
        id: 'who-needs-x1',
        h2: `谁需要从${cfg.countryZh}办理 X1？`,
        intro: '项目超过 180 天即办 X1，不是 X2。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**X1**——本科、硕士、博士及多数 CSC 奖学金学年（学习 >180 天）',
              '**X2**——180 天及以内的语言或交换；不能转为学位居留许可',
              '**持 X1 入境后**——30 天内到当地出入境管理部门申办外国人居留许可',
              `**办理渠道**——${cfg.applyWhereZh}`,
            ],
          },
          {
            type: 'links',
            items: [
              { label: 'SICA：X1 与 X2 详解', href: '/x1-vs-x2-student-visa-china' },
              { label: 'SICA：JW202 与居留许可', href: '/china-student-visa-jw202-residence-permit' },
            ],
          },
        ],
      },
      {
        id: 'documents',
        h2: '材料清单',
        intro: `${cfg.adjectiveZh}申请人预约前应备齐的材料。`,
        blocks: [
          {
            type: 'ol',
            items: [
              '**护照**——通常有效期不少于 6 个月，并有空白签证页',
              '**证件照**——近期彩色、正面、浅色背景；尺寸以当地中心要求为准（达卡列 48mm×33mm）',
              '**录取通知书**——按要求带原件与复印件',
              '**JW201 或 JW202**——原件与复印件；切勿手改',
              '**奖学金证明**——若受资助；否则准备银行证明（见下节）',
              '**在线签证表格**——姓名、护照号、日期须与护照及 JW 完全一致',
              '**合法停留证明**——若在非国籍国申请',
            ],
          },
          { type: 'p', text: cfg.applyWhereDetailZh },
          {
            type: 'callout',
            tone: 'info',
            text: '领事官员可要求原件、面谈或补充材料（税单、关系证明等）。主材料包保持干净，并备好备用原件。',
          },
        ],
      },
      {
        id: 'proof-of-funds',
        h2: '资金证明：每学年 2,500 美元',
        intro: '自费学生最常搜索的数字——也是使馆退件时经常引用的标准。',
        blocks: [
          { type: 'p', text: cfg.fundsNoteZh },
          {
            type: 'table',
            caption: '如何估算银行证明金额',
            columns: ['学制', '工作估算总额', '说明'],
            rows: [
              ['1 学年', '约 2,500 美元', '语言 / 预科年同样计入'],
              ['4 年本科', '约 10,000 美元', '余额 / 流水需覆盖总额'],
              ['2 年硕士', '约 5,000 美元', '流水宜较新（常见近 3–6 个月）'],
              ['奖学金（JW=奖学金）', '通常无需', '携带录取证明；若误勾自费请学校改表'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '若 JW201/JW202 勾选“自费”但你持有校方奖学金，请学校重新出具表格。表上写自费却不交资金证明，是有据可查的退件原因。',
          },
        ],
      },
      {
        id: 'return-reasons',
        h2: 'X1 申请为何被退回',
        intro: '缴费前先排除这些问题。',
        blocks: [
          { type: 'ul', items: cfg.returnExtraZh },
          { type: 'links', items: cfg.sourceLinksZh },
        ],
      },
      {
        id: 'after-entry',
        h2: '抵达中国之后',
        intro: '签证负责入境；居留许可负责停留。',
        blocks: [
          {
            type: 'ol',
            items: [
              '登记住宿地址（宿舍或派出所）——需要临时住宿登记表',
              '完成学校安排的体检 / 报到步骤',
              '入境 **30 天**内随国际学生办公室申请居留许可',
              '不要在未换发居留许可的情况下持裸 X1 超期停留或远途旅行',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: `从${cfg.countryZh}办中国学生签证需要多少银行存款？`,
        a: '自费申请人可按每学年约 2,500 美元准备（达卡 X1 清单与中国驻巴基斯坦使馆 X 签证退件通知均如此表述），再乘以学制年数。JW 勾选奖学金的持证人通常无需另交流水。',
      },
      {
        q: '需要 JW201 还是 JW202？',
        a: 'CSC（中国政府奖学金）学生通常持 JW201；大学直接录取（自费或校级奖学金）持 JW202。两者均可办 X1；切勿涂改。',
      },
      {
        q: `${cfg.adjectiveZh}学生在哪里递交？`,
        a: cfg.applyWhereDetailZh,
      },
      {
        q: '签证材料被退回怎么办？',
        a: '针对具体缺陷整改（新 JW、合格照片、有效加签二维码、正确资金证明）后重新预约。不要原样再交同一份坏扫描件。',
      },
      {
        q: '持 X1 能否覆盖整个学位期间？',
        a: '不能。X1 是入境签证。抵达后 30 天内须换发覆盖学制的居留许可。',
      },
    ],
    howToSteps: [
      {
        name: '确认需要 X1',
        text: '项目超过 180 天 → X1。收齐录取通知并等待 JW201 或 JW202。',
      },
      {
        name: '准备材料包',
        text: '护照、照片、录取通知、干净的 JW、在线表格；另加奖学金证明或每学年 2,500 美元银行证明。',
      },
      {
        name: '预检退件风险',
        text: '扫描加签二维码、核验照片、确认 JW 资助勾选与事实一致，切勿涂改 JW。',
      },
      {
        name: `在${cfg.countryZh}递交`,
        text: `预约并前往${cfg.applyWhereZh}，按清单携带原件与复印件。`,
      },
      {
        name: '入境后 30 天内换发',
        text: '登记住宿，再随大学国际学生办公室申请居留许可。',
      },
    ],
    ctaTitle: `需要协助办理${cfg.countryZh}→中国 X1 材料？`,
    ctaSubtitle:
      'SICA 顾问在预约使馆前帮你核对 JW 资助勾选、资金测算与材料一致性。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      ...siblingVisaLinksZh(cfg.id),
      {
        href: '/guides/visa',
        label: '中国学生签证总览',
        description: '全球 X1/X2 流程指南。',
      },
      {
        href: '/medical-check-physical-examination-form',
        label: '体检与《外国人体格检查表》',
        description: '许多长期停留材料包也会用到。',
      },
    ],
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
  };
}

export function buildChinaStudentVisaCountryGuide(id: VisaCountryId): LocalizedGuide {
  const cfg = COUNTRIES[id];
  return { en: buildEn(cfg), zh: buildZh(cfg) };
}

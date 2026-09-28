import type { LocalizedGuide } from './types';

/**
 * "Student health care in China" — Phase 121, Batch 1, article #4
 * of the new study-in-china expansion cluster.
 * Target queries: "china student health insurance", "international
 * student insurance china", "china university clinic", "china
 * student hospital".
 */
export const studentHealthCareChinaGuide: LocalizedGuide = {
  en: {
    slug: 'student-health-care-china',
    eyebrow: 'GUIDE · HEALTH CARE',
    title: 'Student Health Care in China — Insurance, Clinics, Hospitals, and Mental Health Support',
    description:
      'What every international student needs to know about health care in China: the insurance schemes (university vs commercial vs public), what is and is not covered, how to actually use the insurance at a hospital, the campus clinic first, and the mental health support that exists on most campuses.',
    subtitle:
      'Health care for international students in China runs on a layered system — most universities include a basic insurance plan in tuition (Comprehensive Insurance for Incoming Students to China), commercial top-ups cover gaps, public hospitals handle serious cases, and campus clinics handle everyday issues. This guide walks through each layer, what it costs, what it covers, and how to actually navigate the system — including the mental health support most campuses provide but few students know to ask about.',
    stats: [
      { value: '3 layers', label: 'Insurance / campus / public' },
      { value: '~¥800/yr', label: 'Standard scheme cost' },
      { value: 'Campus first', label: 'Where to start' },
      { value: 'Yes', label: 'Mental health support exists' },
    ],
    quickAnswer:
      'International students in China typically have three health-care layers: a basic insurance scheme (the most common is the Comprehensive Insurance for Incoming Students to China, often bundled with tuition; ~¥800/year), an optional commercial top-up for gaps and pre-existing conditions, and the public hospital system for serious cases. Start at the campus clinic — most universities have one staffed by licensed doctors, with multilingual support at major institutions, and most prescription drugs and basic visits are covered under the bundled scheme. Public hospitals are where serious cases go, with a tiered system (Tier 3 = best, often with international-patient departments). Mental health support exists on most campuses but is underused — ask the international student office for the counseling center location, hours, and how to book.',
    keyTakeaways: [
      'Most universities bundle a basic health insurance scheme (~¥800/year) with tuition — check what is and is not covered',
      'Three layers: university insurance scheme + commercial top-up + public hospital system',
      'Campus clinic first — most have licensed doctors, English-speaking staff at major universities, and the basic scheme covers most visits',
      'Public hospitals are for serious cases — Tier 3 teaching hospitals have international-patient departments',
      'Mental health support exists on most campuses but is underused — ask the international student office',
      'Keep your insurance card (paper or digital) on you; the public hospital system does not bill you first and reimburse later — it bills the insurer directly',
    ],
    sections: [
      {
        id: 'three-layers',
        h2: 'The three-layer system — insurance, campus clinic, public hospital',
        intro:
          'How the system fits together: a low-cost basic insurance scheme, an optional commercial top-up, and a campus clinic that handles everyday issues, with public hospitals for serious care.',
        blocks: [
          {
            type: 'table',
            caption: 'The three layers at a glance',
            columns: ['Layer', 'What it covers', 'Typical cost'],
            rows: [
              ['University insurance scheme (often bundled with tuition)', 'Outpatient visits at designated hospitals, hospitalization at designated facilities, accidental injury; some prescription drugs', '~¥800/year (often included in tuition)'],
              ['Commercial top-up', 'Pre-existing conditions excluded from the basic scheme, dental, vision, expanded hospital networks, faster reimbursement', '¥2,000–¥5,000/year depending on coverage'],
              ['Campus clinic', 'Everyday issues — colds, vaccinations, basic screenings, prescription refills; some campuses have mental-health counseling', 'Free or low-cost; usually covered by the university scheme'],
              ['Public hospital (Tier 3)', 'Serious medical events, surgeries, specialty care, emergency services', 'Paid through the insurance scheme; out-of-pocket for uncovered items'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**The basic scheme is the foundation** — most international students are auto-enrolled at registration; check the international student office paperwork for the certificate',
              '**Read the exclusions carefully** — most basic schemes exclude pre-existing conditions, dental, vision, cosmetic procedures, and elective care; commercial top-ups cover these',
              '**Designated hospitals matter** — the basic scheme only pays in full at network hospitals; off-network hospitals mean partial reimbursement only',
              '**Public hospital Tier 3 (三级甲等)** — the teaching hospitals, often with international-patient departments; the highest level of care available',
              '**The basic scheme is mandatory but minimal** — it covers emergencies, not comfort; commercial top-up is standard practice for international students',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The first day at the international student office: collect your insurance certificate, ask which hospitals are designated network, and save the insurance hotline number. Most medical-bill surprises come from "I didn\'t know this hospital wasn\'t in network."',
          },
        ],
      },
      {
        id: 'how-to-use',
        h2: 'How to actually use the insurance at a hospital',
        intro:
          'The system is direct billing, not reimburse-after-the-fact. Here is what actually happens when you go.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Start at the campus clinic** — describe your symptoms; the doctor triages and either treats directly, prescribes medication, or refers to a network hospital',
              '**Take your insurance certificate and student ID to the network hospital** — the hospital billing desk bills the insurer directly for covered items; you pay only the deductible or uncovered items',
              '**For emergencies** — go directly to the nearest Tier 3 hospital emergency room; the insurance covers emergency care regardless of network, with notification to the international student office',
              '**For prescriptions** — present your insurance certificate at the hospital pharmacy; covered drugs are billed directly, others are paid out of pocket',
              '**For follow-up visits** — keep all receipts and medical records; some commercial top-ups reimburse follow-up care that the basic scheme does not cover',
              '**For non-emergency referrals** — the campus clinic doctor\'s referral letter is usually required for specialist visits to be covered; check before booking',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The system bills the insurer directly at the hospital — there is no upfront payment followed by reimbursement for covered care. If a hospital asks you to pay in full and submit receipts later, that is a sign you are out of network.',
          },
        ],
      },
      {
        id: 'campus-clinic',
        h2: 'The campus clinic — your everyday first stop',
        intro:
          'Most universities have an on-campus clinic staffed by licensed Chinese doctors. Here is what to expect and what they can handle.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Common services** — colds, flu, vaccinations, blood pressure checks, basic lab tests, prescription refills, first aid, mental-health counseling referrals',
              '**Language** — major universities (Tsinghua, Peking, Fudan, Shanghai Jiao Tong, etc.) have English-speaking staff or designated international-patient coordinators; smaller universities may rely on translation apps and bilingual student helpers',
              '**Hours** — most campus clinics operate during business hours with on-call coverage for after-hours emergencies; check the university international student handbook',
              '**Cost** — basic visits and covered prescriptions are free or low-cost; non-covered drugs (some imported brands) cost out of pocket',
              '**Referrals** — for anything beyond basic care, the clinic refers to a network Tier 3 hospital; the referral letter is the entry ticket for specialist coverage',
              '**Health records** — the clinic keeps a record of your visits; useful for scholarship renewals, residence permit renewals, and ongoing care coordination',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Use the campus clinic for everyday issues. The English-language barrier is real at smaller universities but workable — most campus clinic staff handle international students regularly and have informal translation routines.',
          },
        ],
      },
      {
        id: 'public-hospitals',
        h2: 'Public hospitals — when you need serious care',
        intro:
          'The public hospital system is tiered (Tier 3 is the highest, often with international-patient departments). Knowing how it works ahead of time prevents panic when you need it.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Tier 3 (三级甲等 三甲) — the teaching hospitals** — best equipment and specialists; usually have international-patient departments with English-speaking staff; the right destination for serious care',
              '**Tier 2 (二级) — regional hospitals** — good for routine specialist care; English support less common',
              '**Tier 1 (一级) — community clinics** — equivalent to the campus clinic for basic issues',
              '**International-patient departments** — most Tier 3 hospitals have one; they help with registration, billing, and insurance coordination in English',
              '**Direct billing** — show your insurance certificate at registration; the hospital bills the insurer for covered items; you pay only the deductible or uncovered portion',
              '**Appointments vs walk-ins** — appointments get shorter waits and more specialist availability; walk-ins work for urgent issues but expect longer waits',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Save the international-patient department phone number of your nearest Tier 3 hospital in your phone on day one. When serious symptoms hit, calling ahead to confirm the insurance is accepted and the right specialist is available saves hours.',
          },
        ],
      },
      {
        id: 'mental-health',
        h2: 'Mental health support — the underused resource',
        intro:
          'Most Chinese university campuses have counseling centers, often with English-speaking counselors at major institutions. The resource exists; it is underused because international students do not know to ask.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Campus counseling centers** — most universities have one; the international student office has the location, hours, and how to book',
              '**Confidentiality** — Chinese campus counseling follows similar confidentiality standards to Western universities; check the policy at your specific school',
              '**English-speaking counselors** — major universities have them; smaller universities may have Chinese-speaking counselors with translation support',
              '**Common issues international students face** — culture shock, academic pressure, isolation, language frustration, family separation, financial stress; all within the normal scope of campus counseling',
              '**When to escalate** — if the campus counselor recommends specialist care, the international-patient department of a Tier 3 hospital has psychiatric services',
              '**Peer and community support** — international student associations, student-run mental health groups, and faith communities (where applicable) provide informal support',
              '**Crisis resources** — most countries have a 24/7 mental health hotline accessible internationally; your home university\'s counseling service may also offer remote sessions',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Ask in the first week: "Where is the campus counseling center, how do I book, and who is the English-speaking counselor?" Most international students never ask, and most universities have the resource ready.',
          },
        ],
      },
      {
        id: 'practical',
        h2: 'Practical checklist for the first week',
        intro:
          'Six things to do in week one that save real trouble later.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Collect your insurance certificate** from the international student office; save a digital copy in your phone and email',
              '**Save the insurance hotline number** for the scheme\'s English-language support line (often on the certificate)',
              '**Locate the campus clinic** on a campus map; note hours, walk-in vs appointment, and the emergency after-hours number',
              '**Find the international-patient department contact** of your nearest Tier 3 hospital — phone and address saved in your phone',
              '**Confirm the campus counseling center location, hours, and how to book**; ask specifically about English-speaking counselors',
              '**Keep your vaccination records** accessible — the campus clinic may need them for boosters and the residence permit process',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The first-week checklist takes 90 minutes. It saves days of confusion when something does go wrong — and something eventually does, whether it is a fever, a sprained ankle, or a rough week.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Do international students in China get health insurance?',
        a: 'Yes — most universities bundle a basic insurance scheme with tuition (commonly the Comprehensive Insurance for Incoming Students to China, ~¥800/year). It covers outpatient visits, hospitalization at network hospitals, and accidental injury. Commercial top-ups cover gaps like dental, vision, and pre-existing conditions.',
      },
      {
        q: 'Is the basic insurance enough?',
        a: 'For emergencies and basic care, yes. For dental, vision, pre-existing conditions, and elective procedures, no — most international students also carry a commercial top-up (¥2,000–¥5,000/year). Think of the basic scheme as mandatory-and-minimal.',
      },
      {
        q: 'Where do I go first when I feel sick?',
        a: 'The campus clinic. Most universities have one with licensed doctors, English-speaking staff at major institutions, and basic visits covered under the bundled insurance. They triage and refer to network hospitals for serious issues.',
      },
      {
        q: 'What does "designated network hospital" mean?',
        a: 'The basic insurance scheme only pays in full at network (designated) hospitals. Off-network hospitals mean partial reimbursement only. The international student office has the network list — save it.',
      },
      {
        q: 'Do I pay upfront and get reimbursed later?',
        a: 'No — the system bills the insurer directly at the hospital for covered care. You pay only the deductible or uncovered portion. If a hospital asks for full upfront payment and reimbursement later, you are out of network.',
      },
      {
        q: 'Does the insurance cover mental health?',
        a: 'It depends on the scheme and the provider. Some basic schemes include limited mental health coverage at designated providers; commercial top-ups usually expand it. Most university campuses have counseling centers with English-speaking counselors — ask the international student office.',
      },
      {
        q: 'What is a Tier 3 hospital?',
        a: 'A 三级甲等 / 三甲 hospital is the highest tier in China\'s public hospital system — the teaching hospitals with the best equipment and specialists. Most have international-patient departments. They are the right destination for serious care.',
      },
      {
        q: 'Are emergency room visits covered?',
        a: 'Yes — emergency care is covered regardless of network, with notification to the international student office. Save the insurance hotline number for confirmation.',
      },
      {
        q: 'How do I find an English-speaking doctor?',
        a: 'Major university campuses have English-speaking staff at the campus clinic; Tier 3 hospitals with international-patient departments have English-speaking coordinators. The international student office can also refer you to specific doctors used by other international students.',
      },
      {
        q: 'What is the most common health-care mistake international students make?',
        a: 'Waiting too long before going to the campus clinic, then ending up in an emergency room that is out of network. The campus clinic exists exactly to triage and refer — using it saves both your health and your wallet.',
      },
    ],
    howToSteps: [
      {
        name: 'Collect your insurance certificate in week one',
        text: 'From the international student office; save a digital copy in your phone and email. Save the insurance hotline number for English-language support.',
      },
      {
        name: 'Locate the campus clinic and learn its hours',
        text: 'Most universities have an on-campus clinic with licensed doctors; note walk-in vs appointment, after-hours emergency number, and English-speaking availability.',
      },
      {
        name: 'Find the international-patient department of your nearest Tier 3 hospital',
        text: 'Save the phone and address in your phone. When serious symptoms hit, calling ahead to confirm insurance acceptance and specialist availability saves hours.',
      },
      {
        name: 'Confirm the network hospital list',
        text: 'The basic scheme only pays in full at network hospitals; off-network means partial reimbursement. Get the list from the international student office.',
      },
      {
        name: 'Ask about mental health support in week one',
        text: 'Where is the counseling center, how do I book, and who is the English-speaking counselor? Most international students never ask and the resource goes unused.',
      },
      {
        name: 'Keep your vaccination records accessible',
        text: 'The campus clinic may need them for boosters and the residence permit process. Carry the physical record and a digital copy.',
      },
    ],
    ctaTitle: 'Want a pre-arrival health-care plan?',
    ctaSubtitle:
      'SICA counselors review the insurance scheme bundled with your tuition, flag gaps that need a commercial top-up, and help you map the campus clinic + nearest Tier 3 hospital. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/health-insurance',
        label: 'Health insurance in China — overview',
        description: 'The original process guide covering insurance schemes and what is covered.',
      },
      {
        href: '/mental-health-support-china',
        label: 'Mental health support for international students',
        description: 'The dedicated deep dive into campus counseling, hotlines, and the underused resource.',
      },
      {
        href: '/first-week-in-china-survival-guide',
        label: 'First week in China survival guide',
        description: 'The complete pre-arrival through first-7-days checklist.',
      },
    ],
  },
  zh: {
    slug: 'student-health-care-china',
    eyebrow: '指南 · 医疗',
    title: '国际学生医疗——保险、校医院、就医与心理支持',
    description:
      '国际学生需要知道的中国医疗：保险方案（学校/商业/公立）、保与不保、医保实际怎么用、先去校医院，以及多数校园都有的心理支持。',
    subtitle:
      '国际学生在中国看病靠分层体系：多数大学学费里含基础医保（来华留学生综合保险）、商业补充险覆盖缺口、公立医院处理重症、校医院处理日常。本指南逐一拆开每一层、保什么、花多少、怎么用——包括多数校园都有但很少学生主动问的心理支持。',
    stats: [
      { value: '三层', label: '保险 / 校医院 / 公立' },
      { value: '约 ¥800/年', label: '基础方案费用' },
      { value: '先去校医院', label: '首选去处' },
      { value: '有', label: '心理支持存在' },
    ],
    quickAnswer:
      '国际学生在中国通常有三层医疗：基础医保方案（最常见是来华留学生综合保险，多数含在学费里，约 ¥800/年）、可选商业补充险（覆盖缺口与既往症）、公立医院系统处理重症。先去校医院——多数大学有持照医生坐诊，重大机构有中文+英文支持，基础方案覆盖多数就诊与处方药。公立医院用于重症，三级甲等是顶层——多数有国际医疗部（VIP/国际部）。多数校园都设有心理咨询中心，但使用率低——问国际学生办在哪、几点、怎么约。',
    keyTakeaways: [
      '多数大学学费里含基础医保（约 ¥800/年）——查清保与不保',
      '三层：学校医保 + 商业补充 + 公立医院',
      '先去校医院——多数有持照医生，重大机构有英文人员，基础方案覆盖多数就诊',
      '公立医院用于重症——三级甲等教学医院通常有国际医疗部',
      '多数校园都设有心理支持，但使用率低——问国际学生办',
      '随身带医保卡（纸质或电子）；公立医院不先自付后报销——直接走医保结算',
    ],
    sections: [
      {
        id: 'three-layers',
        h2: '三层体系——保险、校医院、公立医院',
        intro:
          '体系如何组合：低成本基础方案、可选商业补充、处理日常的校医院，处理重症的公立医院。',
        blocks: [
          {
            type: 'table',
            caption: '三层一览',
            columns: ['层', '保什么', '典型费用'],
            rows: [
              ['学校医保方案（多含在学费里）', '定点医院门诊、定点医院住院、意外伤害、部分处方药', '约 ¥800/年（通常含在学费里）'],
              ['商业补充险', '基础方案除外的既往症、牙科、视力、扩大的医院网络、更快理赔', '¥2,000-5,000/年（视覆盖而定）'],
              ['校医院', '日常问题——感冒、疫苗、基础体检、处方续方；部分校园有心理咨询', '免费或低价；通常由学校方案覆盖'],
              ['公立医院（三级甲等）', '重大医疗事件、手术、专科、急诊', '走医保结算；不保项自付'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**基础方案是底盘**——多数国际学生在校注册时自动参保；查国际学生办的资料找保险凭证',
              '**细看除外责任**——基础方案通常排除既往症、牙科、视力、美容与择期手术；商业补充险覆盖这些',
              '**定点医院很关键**——基础方案只在定点医院全报；非定点医院只部分报',
              '**公立医院三级甲等（三甲）**——教学医院、专科最好、通常有国际医疗部——重症的首选',
              '**基础方案必缴但保障最低**——它覆盖紧急情况，不覆盖舒适；商业补充险是国际学生的标配',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '在国际学生办第一天做的事：拿保险凭证、问定点医院清单、存保险热线电话。多数医疗账单意外都来自「我不知道这家医院不是定点」。',
          },
        ],
      },
      {
        id: 'how-to-use',
        h2: '医保在医院实际怎么用',
        intro:
          '体系是直接结算，不是先垫后报。真正去医院时是这样的。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**先去校医院**——描述症状；医生分诊，要么直接治疗，要么开药，要么转诊到定点医院',
              '**带保险凭证与学生证去定点医院**——医院收费窗口直接对保险公司结算覆盖项；你只付起付线与不保项',
              '**急诊**——直接去最近的三甲医院急诊；无论是否定点，急诊都在保，但需告知国际学生办',
              '**处方药**——医院药房出示保险凭证；覆盖的药直接结算，其他自付',
              '**复诊**——保留所有收据与病历；基础方案不保的部分可走商业补充险',
              '**非急诊转诊**——专科就诊通常需要校医院转诊单；预约前先确认',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '体系在医院直接对保险公司结算覆盖项——不是先自付后报销。如果医院让你先全额付再回去报销，说明你不在定点。',
          },
        ],
      },
      {
        id: 'campus-clinic',
        h2: '校医院——日常第一站',
        intro:
          '多数大学有校医院，由持照中国医生坐诊。这里是你期待的与能处理的。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**常见服务**——感冒、流感、疫苗、血压、基础化验、处方续方、急救、心理转诊',
              '**语言**——重大大学（清华、北大、复旦、上交等）有英文人员或国际患者协调员；小一些的学校用翻译 App 与双语学生志愿者',
              '**时间**——多数校医院上班时间营业，夜间有值班应急；查你大学国际学生手册',
              '**费用**——基础就诊与覆盖的处方药免费或低价；非覆盖药（部分进口品牌）自付',
              '**转诊**——基础范围外的病情，校医院转诊到定点三甲医院；转诊单是专科覆盖的入场券',
              '**健康档案**——校医院保留你的就诊记录；用于奖学金续签、居留许可续期、连续治疗协调',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '日常问题先去校医院。英语障碍在小一些的学校确实存在，但多数校医院员工常接触国际学生，都有自己的非正式翻译流程。',
          },
        ],
      },
      {
        id: 'public-hospitals',
        h2: '公立医院——需要重症时',
        intro:
          '公立医院是分级的（三甲最高，常有国际医疗部）。提前知道怎么走，关键时刻就不慌。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**三甲（三级甲等）——教学医院**——设备与专家最好；通常有国际医疗部有英文人员；重症首选',
              '**二甲（二级）——地区医院**——常规专科好；英文支持较少',
              '**一甲（一级）——社区诊所**——与校医院类似，处理基础问题',
              '**国际医疗部**——多数三甲医院有；协助挂号、结算、医保协调，全程英文',
              '**直接结算**——挂号时出示保险凭证；医院对保险公司结算覆盖项；你只付起付线与不保部分',
              '**预约 vs 现场**——预约等待短、专家多；现场用于急诊但要排长队',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
              text: '落地第一天就存好最近三甲医院国际医疗部的电话与地址。重症发生时，先打电话确认医保可用与专家有号，能省下数小时。',
          },
        ],
      },
      {
        id: 'mental-health',
        h2: '心理支持——被低估的资源',
        intro:
          '多数中国大学校园都有心理咨询中心，重大机构还有英文咨询师。资源存在但使用率低，因为国际学生不知道问。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**校园心理咨询中心**——多数大学有；国际学生办知道位置、时间、预约方式',
              '**保密性**——中国校园咨询遵循类似西方的保密标准；查你具体学校的政策',
              '**英文咨询师**——重大大学有；小一些的学校可能是中文咨询师加翻译支持',
              '**国际学生常见问题**——文化冲击、学业压力、孤立、语言挫败感、与家人分离、经济压力——都在校园咨询的正常范围',
              '**何时升级**——校园咨询师建议转专科时，三甲医院国际医疗部有精神科',
              '**同伴与社群支持**——国际学生社团、学生心理社团、（适用的）信仰社区提供非正式支持',
              '**危机资源**——多数国家有 24 小时可从海外拨打的心理热线；母大学的咨询中心也常提供远程服务',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '第一周就问：「校园心理咨询中心在哪、怎么约、英文咨询师是谁？」多数国际学生不问，这个资源就用不上。',
          },
        ],
      },
      {
        id: 'practical',
        h2: '第一周实操清单',
        intro:
          '第一周做的六件事，真正出事时能省事。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**收集保险凭证**——从国际学生办；手机里存一份电子版，邮箱再存一份',
              '**存医保热线电话**——找方案的英文客服号码（通常在凭证上）',
              '**找到校医院位置**——看校园地图；记营业时间、现场/预约、下班急诊电话',
              '**找最近三甲医院国际医疗部联系方式**——电话与地址存进手机',
              '**确认定点医院清单**——基础方案只在定点医院全报；非定点部分报销。清单在国际学生办',
              '**可拿到疫苗记录**——校医院可能需要补打疫苗与办居留许可；纸质与电子版都要有',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '第一周清单花 90 分钟。出事时省下几天混乱——不管那事是发烧、扭伤、还是难熬的一周。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '国际学生在中国有医保吗？',
        a: '有——多数大学学费含基础医保（最常见是来华留学生综合保险，约 ¥800/年）。覆盖定点医院门诊、定点住院、意外伤害。商业补充险覆盖牙科、视力、既往症等缺口。',
      },
      {
        q: '基础医保够吗？',
        a: '紧急与基础医疗够。牙科、视力、既往症、择期手术不够——多数国际学生另外买商业补充险（¥2,000-5,000/年）。把基础方案想成「必缴且最低保障」。',
      },
      {
        q: '不舒服先去哪？',
        a: '校医院。多数大学校医院有持照医生、重大机构有英文人员，基础方案覆盖就诊。他们分诊并转诊到定点医院。',
      },
      {
        q: '「定点医院」什么意思？',
        a: '基础方案只在定点医院全报。非定点医院只部分报销。定点医院清单在国际学生办。',
      },
      {
        q: '需要先自付后报销吗？',
        a: '不需要——体系在医院直接对保险公司结算覆盖项。你只付起付线与不保部分。如果医院让你全额先付后报销，你不在定点。',
      },
      {
        q: '医保覆盖心理治疗吗？',
        a: '取决于方案与保险公司。部分基础方案在定点机构含有限心理覆盖；商业补充险通常扩到更多。多数校园都有心理咨询中心，重大机构有英文咨询师——问国际学生办。',
      },
      {
        q: '三甲是什么？',
        a: '三级甲等医院是中国公立医院最高层——教学医院，设备与专家最好。多数有国际医疗部。是重症首选。',
      },
      {
        q: '急诊在保吗？',
        a: '在保——无论是否定点，急诊都覆盖，但要通知国际学生办。存好医保热线电话用来确认。',
      },
      {
        q: '怎么找英文医生？',
        a: '重大大学校医院有英文人员；三甲医院的国际医疗部有英文协调员。国际学生办也能介绍其他国际学生常用医生。',
      },
      {
        q: '国际学生最常见的医疗错误？',
        a: '在校医院去得太晚，最后进了非定点的急诊。校医院存在就是为了分诊与转诊——用它，省健康、省钱。',
      },
    ],
    howToSteps: [
      {
        name: '第一周拿到保险凭证',
        text: '从国际学生办；手机与邮箱各存一份。存好方案的英文热线电话。',
      },
      {
        name: '找到校医院与时间',
        text: '多数大学有校医院由持照医生坐诊；记现场/预约、下班急诊、是否英文人员。',
      },
      {
        name: '找最近三甲医院的国际医疗部',
        text: '电话与地址存进手机。重症先打电话确认医保可用与专家有号，能省数小时。',
      },
      {
        name: '确认定点医院清单',
        text: '基础方案只在定点医院全报；非定点只部分报。清单在国际学生办。',
      },
      {
        name: '第一周就问心理支持',
        text: '心理咨询中心在哪、怎么约、英文咨询师是谁？多数国际学生不问，这个资源就用不上。',
      },
      {
        name: '可拿到疫苗记录',
        text: '校医院可能需要补打疫苗与办居留许可；纸质与电子版都要有。',
      },
    ],
    ctaTitle: '需要一个到校前的医疗计划？',
    ctaSubtitle:
      'SICA 顾问审核你学费里含的医保方案、标记需要商业补充的缺口，并帮你定位校医院与最近三甲医院。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/guides/health-insurance',
        label: '中国医保——总览',
        description: '覆盖医保方案与保什么的原版流程指南。',
      },
      {
        href: '/mental-health-support-china',
        label: '国际学生心理支持',
        description: '校园心理咨询、热线与被低估资源的深入指南。',
      },
      {
        href: '/first-week-in-china-survival-guide',
        label: '第一周在中国生存指南',
        description: '完整到校前到前 7 天清单。',
      },
    ],
  },
};

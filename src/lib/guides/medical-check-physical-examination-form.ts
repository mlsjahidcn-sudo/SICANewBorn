import type { LocalizedGuide } from './types';

/**
 * "Medical check and the physical examination form for a China
 * student visa" (Phase 171, article #14 from the 20-article
 * audit). Phase 139-162 referenced this as a required document
 * in 4+ guides (visa, mbbs, jw202, csc-pakistan) but never
 * operationalized "how to do it, what the form contains, where
 * to do it, country-specific requirements". This standalone
 * closes that gap.
 *
 * Target queries: "china student visa medical check",
 * "physical examination form china", "china university medical
 * exam international students", "medical exam china visa",
 * "体检表", "physical examination form for china visa".
 */
export const medicalCheckPhysicalExaminationGuide: LocalizedGuide = {
  en: {
    slug: 'medical-check-physical-examination-form',
    eyebrow: 'GUIDE · MEDICAL CHECK',
    title: 'Medical Check and the Physical Examination Form for a China Student Visa',
    description:
      'Medical check + physical examination form for a China student visa: where to do it (home country vs entry port in China), what the form contains (blood tests + chest X-ray + ECG + vaccinations), country-specific approved hospitals, validity period, common rejections, and how to avoid them.',
    seoTitle: 'Medical Check and the Physical Examination Form',
    seoDescription: 'Medical check + physical examination form for a China student visa: where to do it (home country vs entry port in China), what the form contains (blood',
    subtitle:
      'Every China student visa application requires a physical examination form completed within the last 6 months. The form is straightforward — blood tests + chest X-ray + ECG + vaccinations + physical measurements — but country-specific approved-hospital lists catch most international applicants off-guard. This guide covers where to do the medical check, what the form contains, which hospitals are approved in Pakistan / Nigeria / Bangladesh / India / other countries, the 6-month validity window, and the 5 most common rejection reasons.',
    stats: [
      { value: '6 months', label: 'Validity window (form must be < 6 months old)' },
      { value: '~¥300-800', label: 'Medical check cost (varies by country)' },
      { value: '8-12 tests', label: 'Per sitting (blood + X-ray + ECG + measurements)' },
      { value: '2 weeks', label: 'Typical turnaround from check to certificate' },
    ],
    quickAnswer:
      'The China student visa physical examination form is the official CSC / MOE template with 8-12 medical checks: physical measurements (height, weight, blood pressure, vision, hearing), blood tests (HIV, hepatitis B, syphilis, blood type), chest X-ray, ECG, vaccination record. The form must be completed by a licensed physician at an approved hospital — your embassy has the approved-hospital list per country. Cost varies by country: Pakistan ~PKR 5,000-15,000 (PKR 3,000-10,000 at approved hospitals + translation fees); Nigeria ~NGN 20,000-50,000; Bangladesh ~BDT 3,000-8,000; India ~INR 1,500-4,000. Validity is 6 months from the check date — get the check within 4-6 months of your visa application to ensure freshness. Common rejections: missing blood test results, no vaccination record, wrong hospital (not on the approved list), expired form, illegible scans. Plan 2-3 weeks turnaround + 1 week buffer.',
    keyTakeaways: [
      'The physical examination form is the official Chinese government template — downloaded from your embassy\'s website or the CSC portal; must be completed by a licensed physician at an approved hospital',
      '8-12 medical checks: physical measurements + blood tests (HIV, hepatitis B, syphilis, blood type) + chest X-ray + ECG + vaccination record',
      'Validity is 6 months from the check date — schedule the medical check within 4-6 months of your visa application',
      'Approved hospital list varies by country — your embassy + the Chinese embassy in your home country have the current approved list; non-approved-hospital forms get rejected',
      'Cost varies by country: Pakistan ~PKR 5,000-15,000; Nigeria ~NGN 20,000-50,000; Bangladesh ~BDT 3,000-8,000; India ~INR 1,500-4,000',
      'Bring your passport + 4 passport photos to the medical check (most approved hospitals require them)',
      'Common rejections: missing blood test results, no vaccination record, wrong hospital (not on approved list), expired form (>6 months), illegible scans, missing physician signature or hospital stamp',
      'Plan 2-3 weeks turnaround + 1 week buffer for visa submission — same-day issuance is not guaranteed at most approved hospitals',
    ],
    sections: [
      {
        id: 'where-to-do-it',
        h2: 'Where to do the medical check: home country vs entry port',
        intro:
          'Two viable paths — do it in your home country before applying for the visa, or do it at the entry port within 7 days of arriving in China. Most applicants do it at home for convenience.',
        blocks: [
          {
            type: 'table',
            caption: 'Where to do the medical check: home country vs entry port in China',
            columns: ['Dimension', 'Home country (before visa application)', 'Entry port (after arrival in China)'],
            rows: [
              ['Recommended for', 'Most international applicants (simpler logistics)', 'Applicants with difficulty finding an approved hospital at home'],
              ['Approved hospital', 'Must be on the Chinese embassy\'s approved-hospital list for your country', 'Beijing / Tianjin entry-port designated hospitals'],
              ['Cost', 'Varies by country (Pakistan ~PKR 5,000-15,000; Nigeria ~NGN 20,000-50,000; Bangladesh ~BDT 3,000-8,000; India ~INR 1,500-4,000)', '~¥500-800 RMB'],
              ['Turnaround', '2-3 weeks typical (varies by country)', 'Same day to 1 week'],
              ['Validity', '6 months from the check date', '6 months from the check date'],
              ['Logistics', 'Bring passport + 4 passport photos + vaccination record + form template (from embassy website)', 'Bring passport + X1 visa + admission notice + 4 photos'],
              ['Risk', 'Form rejected if hospital not on approved list', 'Must complete within 7 days of arrival; can\'t leave the entry port city until cleared'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'For most international applicants, doing the medical check at home BEFORE visa application is the easier path — no entry-port restriction, can submit the form with the rest of the visa package. The entry-port path is for applicants whose home country doesn\'t have an approved hospital nearby.',
          },
        ],
      },
      {
        id: 'what-the-form-contains',
        h2: 'What the physical examination form contains',
        intro:
          'The form is 2-3 pages, 8-12 medical checks, in both English and Chinese. Standardized across all embassies.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Page 1 — Personal info + physical measurements** — full name (passport-matching English transliteration), date of birth, nationality, passport number; height, weight, BMI, blood pressure, heart rate, vision (left/right), hearing, color vision',
              '**Page 2 — Blood tests** — HIV (required), hepatitis B surface antigen + antibody (required), syphilis (VDRL or RPR, required), blood type (ABO + Rh, required); some programs add CBC + liver function + kidney function',
              '**Page 3 — Imaging + ECG** — chest X-ray (PA + lateral, required; tuberculosis screening); ECG (12-lead, required for some programs); some programs add ultrasound (liver / kidney)',
              '**Page 4 — Vaccination record + physician signature** — MMR, hepatitis B series, tetanus, varicella (some programs require proof of COVID-19 vaccination too); physician signature + hospital stamp + date',
              '**Critical**: every check must be completed + signed + stamped within the 6-month validity window — incomplete forms get rejected',
              '**Critical**: the physician must be a licensed MD (or equivalent); forms signed by nurse practitioners, lab technicians, or unlicensed practitioners get rejected',
              '**Critical**: hospital stamp must be the official embossed or ink stamp — not a sticker or photocopy',
            ],
          },
        ],
      },
      {
        id: 'country-specific-hospitals',
        h2: 'Approved hospitals by country',
        intro:
          'Approved-hospital lists are updated annually by each Chinese embassy. Check the embassy\'s website for the current list before scheduling your check.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Pakistan** — embassy-approved hospitals include Aga Khan University Hospital (Karachi), Shifa International Hospital (Islamabad), Lahore General Hospital, Aitchison Hospital affiliated clinics, Pakistan Institute of Medical Sciences (PIMS, Islamabad). Most major city teaching hospitals are on the list. Cost: ~PKR 5,000-15,000 including translation + form filling',
              '**Nigeria** — embassy-approved hospitals include University College Hospital (UCH, Ibadan), Lagos University Teaching Hospital (LUTH), National Hospital Abuja, Aminu Kano Teaching Hospital, University of Nigeria Teaching Hospital (Enugu). Federal teaching hospitals are the safest. Cost: ~NGN 20,000-50,000',
              '**Bangladesh** — embassy-approved hospitals include Square Hospital (Dhaka), United Hospital (Dhaka), Apollo Hospitals Dhaka, BIRDEM, Bangabandhu Sheikh Mujib Medical University (BSMMU) hospital. Cost: ~BDT 3,000-8,000',
              '**India** — embassy-approved hospitals include Apollo Hospitals (multiple cities), Fortis Healthcare, Max Healthcare, AIIMS (multiple cities), Medanta. Tier-2 city government hospitals are also accepted. Cost: ~INR 1,500-4,000',
              '**Pakistan + Nigeria + Bangladesh specific check** — contact the Chinese embassy in your country\'s consular section for the current approved-hospital list (lists are updated annually, sometimes more often)',
              '**In China (entry-port path)** — Beijing International Travel Healthcare Center (北京国际旅行卫生保健中心); Tianjin International Travel Healthcare Center. These are the designated entry-port facilities for international students',
              '**If your hospital is not on the list** — call the Chinese embassy in your country to ask if an exception can be made; most embassies are flexible if the form meets CSC standards + the hospital is government-affiliated',
            ],
          },
        ],
      },
      {
        id: 'rejection-reasons',
        h2: '5 common rejection reasons (and how to avoid them)',
        intro:
          'These are the failure modes the Chinese embassy / visa office sees most often. Avoid them upfront.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Hospital not on the approved list** — solution: call the embassy in advance to confirm your hospital is approved; if not, find an alternative',
              '**Missing blood test results** — most common rejection; HIV + hepatitis B + syphilis are mandatory. Solution: confirm the hospital completes all 3 blood tests + you receive the results on the same form',
              '**No vaccination record** — especially MMR + hepatitis B series. Solution: bring your childhood vaccination record to the check; if incomplete, get the missing vaccines before the check (some hospitals do this)',
              '**Form expired (>6 months)** — solution: schedule the check within 4-6 months of your visa application; don\'t do it too early',
              '**Illegible scans + missing signature** — solution: request high-resolution scans + confirm the physician signed + stamped the form before leaving the hospital',
              '**Missing translation** — the form is bilingual (English + Chinese) but the physician\'s notes are often in English only; some embassies require certified translation. Solution: ask the hospital for both English + Chinese stamps + signatures',
              '**Photo missing** — most embassies require 4 recent passport photos attached to the form. Solution: bring 6+ photos to be safe',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Where do I get the China student visa physical examination form?',
        a: 'Download from your home country\'s Chinese embassy website, or from the CSC portal (csca.cn), or from the Chinese embassy / consulate nearest you. Most embassies have the official PDF template with English + Chinese side-by-side. Print it + bring it to the approved hospital — the physician completes the medical sections on the form itself (don\'t fill it in yourself).',
      },
      {
        q: 'How much does the medical check cost?',
        a: 'Varies by country: Pakistan ~PKR 5,000-15,000; Nigeria ~NGN 20,000-50,000; Bangladesh ~BDT 3,000-8,000; India ~INR 1,500-4,000. In China (entry-port path): ~¥500-800 RMB. The cost includes the physical exam + blood tests + chest X-ray + ECG + vaccination record + physician signature + hospital stamp. Translation fees are usually extra.',
      },
      {
        q: 'How long is the medical check form valid?',
        a: '6 months from the date of the check. Schedule the check within 4-6 months of your visa application to ensure freshness. If the check expires before your visa is processed, you\'ll need to redo it — most embassies reject expired forms outright.',
      },
      {
        q: 'Can I do the medical check in China instead of at home?',
        a: 'Yes — Beijing International Travel Healthcare Center (北京国际旅行卫生保健中心) and Tianjin International Travel Healthcare Center are the designated entry-port facilities for international students. The catch: you must complete the check within 7 days of arriving in China + can\'t leave the entry-port city until cleared. Most applicants do the check at home for convenience.',
      },
      {
        q: 'What if my hospital is not on the embassy-approved list?',
        a: 'Call the Chinese embassy in your country in advance to ask if an exception can be made; most embassies are flexible if the form meets CSC standards + the hospital is government-affiliated. If not, find an alternative approved hospital — most countries have multiple options in major cities.',
      },
      {
        q: 'What happens if my medical check fails?',
        a: 'Common failure modes: HIV positive, active tuberculosis, hepatitis B active infection, severe vision/hearing impairment, certain chronic conditions (depending on the program). If the form shows a positive result for a disqualifying condition, the visa is denied. Some conditions (controlled hepatitis B, mild TB history) can be waived with additional documentation — consult a specialist before re-applying.',
      },
      {
        q: 'Can I use an old medical check from another visa application?',
        a: 'Only if it\'s within the 6-month validity window AND meets all the requirements of the current Chinese student visa. Many countries have different medical check requirements; a US F-1 visa medical, for example, may not meet Chinese student visa requirements. Use the Chinese-specific form at an approved hospital.',
      },
    ],
    howToSteps: [
      {
        name: 'Download the official form from your Chinese embassy',
        text: 'Visit your home country\'s Chinese embassy website. Download the "Physical Examination Form for Foreigners" (外国人身体检查记录). Print 2-3 copies. The form is bilingual (English + Chinese side-by-side); the physician completes the medical sections.',
      },
      {
        name: 'Find an approved hospital + schedule the check',
        text: 'Contact the Chinese embassy\'s consular section for the current approved-hospital list in your area. Schedule the medical check — bring passport + 4 passport photos + your vaccination record + the printed form. Some hospitals require booking 1-2 weeks in advance.',
      },
      {
        name: 'Complete the medical check at the approved hospital',
        text: 'Arrive at the hospital with your passport + photos + vaccination record. The physician completes all 8-12 medical checks + signs + stamps the form. Most checks take 1-2 hours; blood test results may be sent separately (1-2 weeks).',
      },
      {
        name: 'Get the official certificate + scan',
        text: 'Once all results are in (typically 1-2 weeks), return to the hospital to collect the signed + stamped + sealed form. Scan at high resolution (300+ DPI) + keep multiple copies. The original goes with your visa application; copies are for your records.',
      },
      {
        name: 'Submit with your visa application',
        text: 'Include the original medical check form + 4 photos in your X1 visa application package at the Chinese embassy / visa centre. The form + photos are typically the last items added — most embassies want everything else in order before adding the medical section.',
      },
      {
        name: 'Validity + expiration tracking',
        text: 'The form is valid for 6 months from the check date. If your visa processing takes longer than 6 months, you may need to redo the check. Most applicants do the check 2-3 months before visa application to balance freshness + processing time.',
      },
      {
        name: 'Plan for the entry-port check (if doing it in China)',
        text: 'If you skipped the home-country check + plan to do it in China: arrive at Beijing Capital or Tianjin Binhai, go directly to the International Travel Healthcare Center, complete the check within 7 days of arrival, get the certificate, then convert X1 to residence permit within 30 days.',
      },
    ],
    ctaTitle: 'Need help with the China student visa medical check?',
    ctaSubtitle:
      'SICA counselors review your country-specific approved-hospital list + check-date timing (to fit the 6-month validity window) + flag common rejection risks before you book. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/china-student-visa-jw202-residence-permit',
        label: 'China student visa: JW202 + residence permit',
        description: 'The full visa process: JW202 form, X1 visa, 30-day residence permit conversion.',
      },
      {
        href: '/guides/visa',
        label: 'China student visa (X1 / X2) guide',
        description: 'The complete visa guide: X1 / X2 / Z / F visa types, application routes, document package.',
      },
      {
        href: '/mbbs-in-china',
        label: 'MBBS in China: English-taught, MOE-listed, CSCA',
        description: 'The medical program guide — has stricter medical check requirements than other programs.',
      },
    ],
  },
  zh: {
    slug: 'medical-check-physical-examination-form',
    eyebrow: '指南 · 体检',
    title: '中国学生签证体检与身体检查记录',
    description:
      '中国学生签证体检 + 身体检查记录：在哪里做（本国 vs 中国入境口岸）、体检包含什么（血液检查 + 胸透 + 心电图 + 疫苗记录）、按国认可的医院、6 个月有效期、常见拒签原因与避免方式。',
    seoTitle: '中国学生签证体检与身体检查记录',
    seoDescription: '中国学生签证体检 + 身体检查记录：在哪里做（本国 vs 中国入境口岸）、体检包含什么（血液检查 + 胸透 + 心电图 + 疫苗记录）、按国认可的医院、6',
    subtitle:
      '每个中国学生签证申请都需要一份最近 6 个月内的身体检查记录。表格简单——血液检查 + 胸透 + 心电图 + 疫苗 + 体检——但按国认可的医院名单出乎大多数国际申请者意料。本指南涵盖在哪里做体检、表格包含什么、巴基斯坦 / 尼日利亚 / 孟加拉国 / 印度 / 其他国家哪些医院认可、6 个月有效期、以及 5 个最常见的拒签原因。',
    stats: [
      { value: '6 个月', label: '有效期窗口（表格必须 < 6 个月）' },
      { value: '~¥300-800', label: '体检费用（按国不同）' },
      { value: '8-12 项', label: '每场次（血液 + X 光 + 心电图 + 体检）' },
      { value: '2 周', label: '从体检到证书的典型周转' },
    ],
    quickAnswer:
      '中国学生签证体检是官方 CSC / MOE 模板，含 8-12 项医学检查：体检（身高、体重、血压、视力、听力）+ 血液检查（HIV、乙肝、梅毒、血型）+ 胸透 + 心电图 + 疫苗记录。表格必须由认可的医院执业医师填写——你国大使馆有按国认可的医院名单。费用因国而异：巴基斯坦 ~PKR 5,000-15,000；尼日利亚 ~NGN 20,000-50,000；孟加拉国 ~BDT 3,000-8,000；印度 ~INR 1,500-4,000。有效期是体检之日起 6 个月——体检后 4-6 个月内签证申请以确保新鲜。常见拒签：缺失血液检查结果、无疫苗记录、医院不在认可名单、表格过期、扫描不清晰。规划 2-3 周周转 + 1 周缓冲。',
    keyTakeaways: [
      '体检表是官方中国政府的模板——从你国大使馆网站或 CSC 门户下载；必须由认可医院执业医师填写',
      '8-12 项医学检查：体检 + 血液检查（HIV、乙肝、梅毒、血型）+ 胸透 + 心电图 + 疫苗记录',
      '有效期是体检之日起 6 个月——体检后 4-6 个月内签证申请',
      '认可的医院名单因国而异——你国大使馆 + 中国驻你国大使馆有当前名单；非认可医院的表格会被拒',
      '费用因国而异：巴基斯坦 ~PKR 5,000-15,000；尼日利亚 ~NGN 20,000-50,000；孟加拉国 ~BDT 3,000-8,000；印度 ~INR 1,500-4,000',
      '带护照 + 4 张护照照片到体检（多数认可医院要求）',
      '常见拒签：缺失血液检查结果、无疫苗记录、医院不在认可名单、表格过期（>6 个月）、扫描不清晰、缺医师签名或医院盖章',
      '规划 2-3 周周转 + 1 周缓冲用于签证提交——多数认可医院不保证当日出具',
    ],
    sections: [
      {
        id: 'where-to-do-it',
        h2: '在哪里做体检：本国 vs 入境口岸',
        intro:
          '两条可行路径——在申请签证前于本国做，或抵华后 7 天内在入境口岸做。多数申请者出于便利在本国做。',
        blocks: [
          {
            type: 'table',
            caption: '在哪里做体检：本国 vs 中国入境口岸',
            columns: ['维度', '本国（签证申请前）', '入境口岸（抵华后）'],
            rows: [
              ['适合人群', '多数国际申请者（后勤更简单）', '本国找不到认可医院的申请者'],
              ['认可医院', '必须在中国驻你国大使馆认可医院名单上', '北京 / 天津入境口岸指定医院'],
              ['费用', '因国而异（巴基斯坦 ~PKR 5,000-15,000；尼日利亚 ~NGN 20,000-50,000；孟加拉国 ~BDT 3,000-8,000；印度 ~INR 1,500-4,000）', '~¥500-800 人民币'],
              ['周转', '典型 2-3 周（因国而异）', '当日到 1 周'],
              ['有效期', '体检之日起 6 个月', '体检之日起 6 个月'],
              ['后勤', '带护照 + 4 张护照照片 + 疫苗记录 + 表格模板（从大使馆网站）', '带护照 + X1 签证 + 录取通知 + 4 张照片'],
              ['风险', '医院不在认可名单则表格被拒', '必须抵华后 7 天内完成；未通过前不能离开入境口岸城市'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '对多数国际申请者，在本国签证申请前做体检是更简单的路径——无入境口岸限制，可与签证材料一并提交。入境口岸路径适用于本国附近找不到认可医院的申请者。',
          },
        ],
      },
      {
        id: 'what-the-form-contains',
        h2: '体检表包含什么',
        intro:
          '表格 2-3 页，8-12 项医学检查，中英双语。所有大使馆标准化。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**第 1 页——个人信息 + 体检**——全名（护照一致的英语转写）、出生日期、国籍、护照号；身高、体重、BMI、血压、心率、视力（左/右）、听力、色觉',
              '**第 2 页——血液检查**——HIV（必查）、乙肝表面抗原 + 抗体（必查）、梅毒（VDRL 或 RPR，必查）、血型（ABO + Rh，必查）；部分项目加 CBC + 肝功能 + 肾功能',
              '**第 3 页——影像 + 心电图**——胸透（PA + 侧位，必查；结核筛查）；心电图（12 导联，部分项目必查）；部分项目加超声（肝 / 肾）',
              '**第 4 页——疫苗记录 + 医师签名**——MMR、乙肝系列、破伤风、水痘（部分项目要求 COVID-19 接种证明）；医师签名 + 医院盖章 + 日期',
              '**关键**：每项检查必须在 6 个月有效期内完成 + 签字 + 盖章——不完整的表格被拒',
              '**关键**：医师必须是执照 MD（或等效）；由执业护士、实验技术员或无执照者签名的表格被拒',
              '**关键**：医院盖章必须是官方凸印或印章——不是贴纸或复印件',
            ],
          },
        ],
      },
      {
        id: 'country-specific-hospitals',
        h2: '按国认可的医院',
        intro:
          '认可的医院名单由中国大使馆每年更新。预约前查大使馆网站的当前名单。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**巴基斯坦**——大使馆认可医院包括 Aga Khan University Hospital（卡拉奇）、Shifa International Hospital（伊斯兰堡）、Lahore General Hospital、Aitchison Hospital 关联诊所、PIMS（伊斯兰堡）。主要城市教学医院大多在名单上。费用：~PKR 5,000-15,000 含翻译 + 填表',
              '**尼日利亚**——大使馆认可医院包括 UCH（伊巴丹）、LUTH（拉各斯）、National Hospital Abuja、Aminu Kano Teaching Hospital、UNTH（埃努古）。联邦教学医院最保险。费用：~NGN 20,000-50,000',
              '**孟加拉国**——大使馆认可医院包括 Square Hospital（达卡）、United Hospital（达卡）、Apollo Hospitals Dhaka、BIRDEM、BSMMU 医院。费用：~BDT 3,000-8,000',
              '**印度**——大使馆认可医院包括 Apollo Hospitals（多个城市）、Fortis Healthcare、Max Healthcare、AIIMS（多个城市）、Medanta。Tier-2 城市政府医院也接受。费用：~INR 1,500-4,000',
              '**巴基斯坦 + 尼日利亚 + 孟加拉国具体查询**——联系你国的中国大使馆领事处获取当前认可的医院名单（名单每年更新，有时更频繁）',
              '**在中国（入境口岸路径）**——北京国际旅行卫生保健中心、天津国际旅行卫生保健中心。国际学生指定入境口岸设施',
              '**如果你的医院不在名单上**——提前致电你国中国大使馆询问是否可以例外；多数大使馆灵活处理如果表格符合 CSC 标准 + 医院政府关联',
            ],
          },
        ],
      },
      {
        id: 'rejection-reasons',
        h2: '5 个常见拒签原因（与避免方式）',
        intro:
          '这些是中国大使馆 / 签证处最常见的失败模式。提前避免。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**医院不在认可名单**——解决：提前致电大使馆确认你的医院认可；否则换医院',
              '**缺失血液检查结果**——最常见拒签；HIV + 乙肝 + 梅毒是必查。解决：确认医院完成全部 3 项血液检查 + 你在同张表上拿到结果',
              '**无疫苗记录**——尤其 MMR + 乙肝系列。解决：带童年疫苗记录到体检；如不完整，在体检前补种缺失的（部分医院可做）',
              '**表格过期（>6 个月）**——解决：签证申请前 4-6 个月内做体检；不要做太早',
              '**扫描不清晰 + 缺签名**——解决：要求高分辨率扫描 + 离开医院前确认医师签字 + 盖章',
              '**缺翻译**——表格是中英双语，但医师备注通常只有英文；部分大使馆要求认证翻译。解决：要求医院出具中英双语盖章 + 签字',
              '**缺照片**——多数大使馆要求 4 张近期护照照片附在表格上。解决：带 6+ 张照片以保安全',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '哪里拿中国学生签证体检表？',
        a: '从你国中国大使馆网站下载，或从 CSC 门户（csca.cn），或从最近的中国大使馆 / 领事馆。多数大使馆有官方 PDF 模板，中英双语并排。打印后带到认可医院——医师填写医学部分（不要自己填）。',
      },
      {
        q: '体检费用多少？',
        a: '因国而异：巴基斯坦 ~PKR 5,000-15,000；尼日利亚 ~NGN 20,000-50,000；孟加拉国 ~BDT 3,000-8,000；印度 ~INR 1,500-4,000。在中国（入境口岸路径）：~¥500-800 人民币。费用含体检 + 血液检查 + 胸透 + 心电图 + 疫苗记录 + 医师签名 + 医院盖章。翻译费通常另算。',
      },
      {
        q: '体检表有效期多长？',
        a: '体检之日起 6 个月。签证申请前 4-6 个月内做体检以确保新鲜。如果体检在签证处理完成前过期，你需要重做——多数大使馆直接拒签过期表格。',
      },
      {
        q: '能在国内做体检替代本国的吗？',
        a: '可以——北京国际旅行卫生保健中心 + 天津国际旅行卫生保健中心是国际学生的指定入境口岸设施。问题：你必须在抵华后 7 天内完成 + 在通过前不能离开入境口岸城市。多数申请者出于便利在本国做。',
      },
      {
        q: '如果我的医院不在大使馆认可名单上怎么办？',
        a: '提前致电你国中国大使馆询问是否可以例外；多数大使馆灵活处理如果表格符合 CSC 标准 + 医院政府关联。否则换替代认可医院——多数国家主要城市有多个选择。',
      },
      {
        q: '如果我的体检不通过会怎样？',
        a: '常见失败模式：HIV 阳性、活动性结核、活动性乙肝感染、严重视力/听力障碍、某些慢性病（取决于项目）。如果表格对不合格条件显示阳性，签证被拒。某些情况（控制良好的乙肝、轻微结核史）可凭额外文件豁免——重新申请前咨询专科医生。',
      },
      {
        q: '能用其他签证申请的旧体检吗？',
        a: '只有在 6 个月有效期内 + 符合当前中国学生签证的所有要求时才能用。多数国家有不同的体检要求；比如美国 F-1 签证体检可能不符合中国学生签证要求。使用针对中国签证的特定表格在认可医院做。',
      },
    ],
    howToSteps: [
      {
        name: '从中国大使馆下载官方表格',
        text: '访问你国中国大使馆网站。下载《外国人身体检查记录》。打印 2-3 份。表格中英双语并排；医师填写医学部分。',
      },
      {
        name: '找认可医院 + 预约体检',
        text: '联系中国大使馆领事处获取你所在地区当前认可的医院名单。预约体检——带护照 + 4 张护照照片 + 你的疫苗记录 + 打印的表格。部分医院需要提前 1-2 周预约。',
      },
      {
        name: '在认可医院完成体检',
        text: '带护照 + 照片 + 疫苗记录到医院。医师完成全部 8-12 项检查 + 在表格上签字 + 盖章。多数检查需 1-2 小时；血液检查结果可能单独出（1-2 周）。',
      },
      {
        name: '拿官方证书 + 扫描',
        text: '所有结果回来后（通常 1-2 周），回医院领取已签字 + 盖章 + 密封的表格。高分辨率扫描（300+ DPI）+ 保留多份副本。正本随签证申请走；副本自留。',
      },
      {
        name: '随签证申请一并提交',
        text: '把体检表原件 + 4 张照片附在 X1 签证申请材料包里到中国大使馆 / 签证中心。体检表 + 照片通常是最后加的——多数大使馆要求其他材料齐全后再加体检部分。',
      },
      {
        name: '有效期 + 过期跟踪',
        text: '体检表自体检之日起 6 个月内有效。如果签证处理超过 6 个月，你可能需要重做。多数申请者在签证申请前 2-3 个月做体检以平衡新鲜度 + 处理时间。',
      },
      {
        name: '规划入境口岸体检（如在中国做）',
        text: '如果跳过本国体检 + 计划在中国做：抵达北京首都机场或天津滨海机场后，直接去国际旅行卫生保健中心，抵华后 7 天内完成体检，拿证书，然后在 30 天内把 X1 换成居留许可。',
      },
    ],
    ctaTitle: '需要中国学生签证体检的帮助？',
    ctaSubtitle:
      'SICA 顾问审查你按国认可的医院名单 + 体检日期时机（贴合 6 个月有效期）+ 在预约前标记常见拒签风险。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/china-student-visa-jw202-residence-permit',
        label: '中国学生签证：JW202 + 居留许可',
        description: '完整签证流程：JW202 表、X1 签证、30 天居留许可转换。',
      },
      {
        href: '/guides/visa',
        label: '中国学生签证（X1 / X2）指南',
        description: '完整签证指南：X1 / X2 / Z / F 签证类型、申请渠道、材料包。',
      },
      {
        href: '/mbbs-in-china',
        label: 'MBBS in China：英文授课、MOE 认证、CSCA',
        description: '医学项目指南——体检要求比其他项目更严。',
      },
    ],
  },
};

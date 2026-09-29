import type { LocalizedGuide } from './types';

/**
 * "Peking University vs Tsinghua University" — regional/comparison
 * article #1 of 4 (docs/regional-comparisons-4-article-plan.md).
 * Target queries: "peking university vs tsinghua", "pkU or tsinghua
 * for international students", "which is better peking or tsinghua",
 * "tsinghua vs peking university for [subject]".
 *
 * Static comparison content. Facts (deadlines, tuition bands, CSCA
 * combinations, scholarship stacks) mirror the shipped university
 * profiles and Phase 136 admissions guides — the comparison never
 * introduces numbers that contradict them. Ranking language stays
 * tier-based ("China's top two") per the no-invented-rankings rule.
 */
export const pekingUniversityVsTsinghuaGuide: LocalizedGuide = {
  en: {
    slug: 'peking-university-vs-tsinghua',
    eyebrow: 'COMPARISON · PKU VS TSINGHUA',
    title: 'Peking University vs Tsinghua University — Which One Should International Students Apply To?',
    description:
      'Peking vs Tsinghua compared for international applicants: strengths by subject, CSCA combinations, deadlines, tuition, scholarships, and who should pick which.',
    subtitle:
      'They are China\'s two most famous universities, they sit on adjacent campuses in northwest Beijing, and international applicants ask the same question every cycle: Peking University or Tsinghua? The honest answer is that the comparison is not "which is better" — the pair trades the top two spots in Chinese rankings depending on the year and the metric — but "which one fits your subject, your CSCA combination, and your study plan." This guide compares them on the dimensions that actually change an application decision: academic identity, subject-level strength, admissions requirements, deadlines, cost, scholarships, and campus life.',
    stats: [
      { value: '1898 / 1911', label: 'PKU / Tsinghua founded' },
      { value: 'Top 2', label: 'Consistently China\'s highest-ranked pair' },
      { value: 'Adjacent', label: 'Campuses, Haidian district, Beijing' },
      { value: '¥30k–60k', label: 'Bachelor\'s tuition per year (both)' },
    ],
    quickAnswer:
      'Peking University is China\'s comprehensive flagship — strongest in humanities, social sciences, basic sciences, and medicine — while Tsinghua is its engineering and applied-science powerhouse, strongest in engineering, computer science, and architecture. Both require the CSCA from the 2026 intake (with different subject combinations per program), both run most fall-intake deadlines from March 31 to May 31 with competitive programs closing as early as January 31, and both charge essentially the same tuition (~¥30,000–¥60,000/year for international bachelor\'s). For most applicants the decision is made by intended major, not by prestige: humanities, sciences, and medicine lean PKU; engineering, CS, and architecture lean Tsinghua.',
    keyTakeaways: [
      'PKU = comprehensive flagship (humanities, social sciences, basic sciences, medicine); Tsinghua = engineering/applied-science flagship (engineering, CS, architecture)',
      'Neither is "better" overall — the pair trades the #1–2 spots in Chinese rankings by year and metric; subject fit decides',
      'Both require the CSCA from 2026: PKU combos center on Humanities Chinese + Math (humanities) or Math + Physics/Chemistry (sciences); Tsinghua combos center on STEM Chinese + Math + Physics (engineering/CS) or + Chemistry (chemical/materials/life)',
      'Deadlines overlap: most programs March 31 – May 31; the most competitive (Yenching, PHBS, applied math, AI at PKU; top master\'s at Tsinghua) close as early as January 31',
      'Costs are near-identical: ~¥30,000–¥60,000/year bachelor\'s tuition, same dorm bands, same Beijing living costs, same CSC + university + Beijing Government scholarship stack',
      'The symmetric elite English-taught master\'s programs: PKU\'s Yenching Academy (Chinese Studies) vs Tsinghua\'s Schwarzman Scholars (global affairs, fully funded)',
    ],
    sections: [
      {
        id: 'at-a-glance',
        h2: 'Peking vs Tsinghua at a glance',
        intro:
          'One table, the whole comparison. Every row is a dimension applicants actually weigh — and most of them end in a tie.',
        blocks: [
          {
            type: 'table',
            caption: 'Side by side',
            columns: ['Dimension', 'Peking University (PKU)', 'Tsinghua University (THU)'],
            rows: [
              ['Founded', '1898 (Jingshi Daxuetang — China\'s first national university)', '1911 (Tsinghua School, a study-abroad preparatory school)'],
              ['Identity', 'Comprehensive flagship: humanities, social sciences, basic sciences, medicine', 'Engineering and applied-science flagship: engineering, CS, architecture'],
              ['Campus', 'Haidian, Beijing (Weiming Lake campus)', 'Haidian, Beijing — adjacent to PKU'],
              ['Rankings', 'China\'s top two alongside Tsinghua; order varies by ranking and year', 'China\'s top two alongside PKU; order varies by ranking and year'],
              ['Bachelor\'s tuition (intl.)', '~¥30,000–¥60,000/year', '~¥30,000–¥60,000/year'],
              ['Most fall-intake deadlines', 'March 31 – May 31; competitive programs by Jan 31', 'March 31 – May 31; competitive programs as early as Jan 31'],
              ['CSCA (from 2026 intake)', 'Humanities Chinese + Math (humanities); Math + Physics/Chemistry (sciences)', 'STEM Chinese + Math + Physics (engineering/CS); + Chemistry (chemical/materials/life sciences)'],
              ['Chinese-taught language bar', 'HSK 5+ typical', 'HSK 5+ typical'],
              ['English-taught language bar', 'IELTS 6.5+ / TOEFL 90+ typical', 'IELTS 6.5+ / TOEFL 90+ typical'],
              ['Flagship English master\'s', 'Yenching Academy (Chinese Studies)', 'Schwarzman Scholars (global affairs; fully funded)'],
              ['Application fee', '~¥400–¥800', '~¥500–¥800'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The one-sentence version: PKU is where China studies itself — humanities, sciences, medicine; Tsinghua is where China builds — engineering, computing, architecture. Both are the top of the system, and both cost about the same to attend.',
          },
        ],
      },
      {
        id: 'identity',
        h2: 'Two identities: the university of the humanities vs the university of engineering',
        intro:
          'The rivalry is real, but it started as a division of labor. Understanding each school\'s founding purpose explains almost every difference that follows.',
        blocks: [
          {
            type: 'h3',
            text: 'Peking University — the national comprehensive university',
            body: 'Founded in 1898 as the Imperial University of Peking (Jingshi Daxuetang), PKU is the oldest institution in China\'s modern university system and has carried the flag for the humanities, social sciences, and basic sciences ever since. Its law school, economics department, Chinese literature department, and pure-math and physics programs are among the most selective in the country, and its Health Science Center runs one of China\'s strongest medical faculties. Campus culture has a famously liberal-arts, debate-forward character.',
          },
          {
            type: 'h3',
            text: 'Tsinghua University — the engineering powerhouse',
            body: 'Tsinghua opened in 1911 as a preparatory school sending students to the United States, became a full university in 1928, and was rebuilt after 1952 as China\'s premier engineering school — a position it has never relinquished. Mechanical, electrical, civil, chemical, and materials engineering plus computer science and architecture form its core; the campus self-identifies with the slogan tradition of "invincible engineers." Its ties to China\'s industrial and state engineering establishment are the deepest of any university.',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Both are members of the C9 League and the Double First-Class initiative\'s top tier. In international rankings the two sit close together at the top of mainland China — the exact ordering changes by ranking and by year, so choose by fit, not by a single league table.',
          },
        ],
      },
      {
        id: 'academics',
        h2: 'Who is stronger in which subject?',
        intro:
          'Relative strength by discipline — the dimension that should drive your decision. Both universities are excellent nearly everywhere; "stronger" here means the stronger national reputation and research depth in that field.',
        blocks: [
          {
            type: 'table',
            caption: 'Relative strength by field',
            columns: ['Field', 'Lean', 'Why'],
            rows: [
              ['Humanities (lit, history, philosophy)', 'PKU', 'The national center for Chinese humanities scholarship'],
              ['Social sciences (econ, polisci, sociology)', 'PKU', 'Flagship departments; strongest peer group'],
              ['Mathematics & basic physics/chemistry', 'Both / PKU edge', 'PKU\'s tradition in pure sciences; Tsinghua has invested heavily and closed much of the gap'],
              ['Computer science', 'Tsinghua', 'China\'s top CS program; dominant in systems, AI research output'],
              ['Engineering (mech, elec, civil, materials)', 'Tsinghua', 'The historic core; deepest industry and state links'],
              ['Architecture', 'Tsinghua', 'Founded by Liang Sicheng; China\'s reference school'],
              ['Medicine', 'PKU', 'PKU Health Science Center + affiliated hospital system'],
              ['Business / management', 'Both', 'Guanghua (PKU) vs PBCSF & SEM (Tsinghua) — both elite; PHBS sits in Shenzhen'],
              ['Journalism & communication', 'PKU', 'Long-established school; Tsinghua\'s program is newer'],
              ['Public policy / global affairs', 'Both', 'Tsinghua\'s Schwarzman vs PKU\'s Yenching — different flavors, both elite'],
            ],
          },
          {
            type: 'p',
            text: 'The practical read: an applicant to electrical engineering, computer science, or architecture is applying to Tsinghua\'s historical home turf; an applicant to literature, economics, law, or medicine is applying to PKU\'s. Applicants in math and the basic sciences can genuinely go either way and should compare the specific research groups and English-taught options in their subfield.',
          },
        ],
      },
      {
        id: 'admissions',
        h2: 'Admissions: CSCA combinations, deadlines, and language bars',
        intro:
          'For international applicants the mechanics are strikingly similar — same exam, same deadline band, same language thresholds. The differences are in the CSCA subject combinations and a few program-specific windows.',
        blocks: [
          {
            type: 'h3',
            text: 'CSCA requirements from the 2026 intake',
            body: 'Both universities require the CSCA for bachelor\'s admission from the 2026 intake. What differs is the subject combination each program specifies. PKU\'s humanities programs typically ask for Humanities Chinese + Math; its science programs Math + Physics or Chemistry. Tsinghua\'s engineering and CS programs typically ask for STEM Chinese + Math + Physics; chemical, materials, and life-science programs add or swap Chemistry. Always verify the exact combination on the program page before booking CSCA subjects — a wrong combination can disqualify an otherwise strong file.',
          },
          {
            type: 'table',
            caption: 'Typical CSCA combinations by direction',
            columns: ['Direction', 'Peking University', 'Tsinghua University'],
            rows: [
              ['Humanities / social sciences', 'Humanities Chinese + Math', 'Humanities Chinese + Math (per program)'],
              ['Engineering / CS', 'Math + Physics (per program)', 'STEM Chinese + Math + Physics'],
              ['Chemical / materials / life sciences', 'Math + Chemistry', 'STEM Chinese + Math + Chemistry'],
              ['Medicine', 'Math + Chemistry (Health Science Center programs)', 'N/A at undergrad level for most tracks'],
            ],
          },
          {
            type: 'h3',
            text: 'Deadlines',
            body: 'Both universities run most fall-intake programs on a March 31 – May 31 close, with the most competitive programs pulling forward: at PKU, Yenching Academy, PHBS, applied math, and AI programs are safest submitted by January 31; at Tsinghua, competitive master\'s programs can close between January 31 and April 15. Schwarzman Scholars runs its own global deadline in late May. Verify every date on the official portal for your cycle — windows shift year to year.',
          },
          {
            type: 'ul',
            items: [
              'PKU portal: studyatpku.com (all routes — direct, CSC, embassy nomination — through one portal)',
              'Tsinghua portal: the Tsinghua ISO portal for direct and CSC routes; schwarzmanscholars.org for Schwarzman',
              'Application fee: ~¥400–¥800 at PKU, ~¥500–¥800 at Tsinghua per application cycle',
              'Documents are near-identical: passport, transcripts, 800–1,500-word study plan, 2 recommendation letters (associate professor or above), language evidence',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'You can apply to both in the same cycle — the portals, fees, and reviews are fully separate. The shared document set (transcripts, recommendations, study plan) means the marginal cost of a second flagship application is mostly the fee.',
          },
        ],
      },
      {
        id: 'cost-scholarships',
        h2: 'Cost and scholarships: effectively a tie',
        intro:
          'Same city, same tuition bands, same government scholarship stack. Money should almost never be the deciding factor between these two.',
        blocks: [
          {
            type: 'table',
            caption: 'Cost comparison (international students, per year)',
            columns: ['Cost item', 'Peking University', 'Tsinghua University'],
            rows: [
              ['Bachelor\'s tuition', '~¥30,000–¥60,000', '~¥30,000–¥60,000'],
              ['Master\'s tuition', '~¥35,000–¥80,000', '~¥35,000–¥80,000'],
              ['Dormitory', '~¥1,200–¥3,000/month (double)', '~¥1,200–¥3,000/month (double)'],
              ['Food & daily living (Beijing)', '~¥1,500–¥3,000/month', '~¥1,500–¥3,000/month'],
              ['Application fee', '~¥400–¥800', '~¥500–¥800'],
            ],
          },
          {
            type: 'h3',
            text: 'The scholarship stack is the same three layers',
            body: 'Both universities sit inside the same funding pyramid: the Chinese Government Scholarship (CSC — tuition waiver, dorm, and a monthly stipend around ¥2,000–3,000), each university\'s own international-student scholarships (partial-to-full tuition waivers), and the Beijing Government Scholarship (tuition waiver plus ~¥3,000/month stipend, one year, renewable). A strong applicant stacks nominations across layers rather than betting on one.',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The asymmetric exception: Tsinghua\'s Schwarzman Scholars is fully funded at a different level — tuition, dorm, stipend, airfare, laptop, insurance, and course materials. PKU\'s closest counterpart, the Yenching Academy, is also fully funded for its admitted cohort. Both admit tiny classes and run their own selection calendars.',
          },
        ],
      },
      {
        id: 'campus-life',
        h2: 'Campus life: two campuses, one neighborhood',
        intro:
          'The universities sit next to each other in Haidian district — students literally walk between them — so the city experience is shared. The campus characters differ.',
        blocks: [
          {
            type: 'ul',
            items: [
              'PKU\'s campus is built around Weiming Lake and historic Qing-era grounds — compact, garden-like, humanities-coded',
              'Tsinghua\'s campus is larger and more spread out, with the engineering-faculty scale to match',
              'Both feed the same Wudaokou student economy: cheap food, cafés, and the densest student district in China',
              'Beijing internships (government, state media, HQs, tech) are equally accessible from both — Tsinghua has a slight edge for tech-neighborhood proximity, PKU for policy and culture',
              'Winters are Beijing winters everywhere: dry, cold, and the same for both campuses',
            ],
          },
          {
            type: 'p',
            text: 'If campus visit days or virtual tours are offered in your application cycle, take them at both — applicants consistently report the two campuses "feel" different in ways no ranking captures, and the feel is a legitimate tiebreaker when the academic fit is equal.',
          },
        ],
      },
      {
        id: 'decision',
        h2: 'Decision framework: choose PKU or Tsinghua in four questions',
        intro:
          'Work through these in order. Most applicants find the answer emerges by question two.',
        blocks: [
          {
            type: 'ol',
            items: [
              'What is your intended subject? Humanities, social sciences, medicine, or pure sciences lean PKU; engineering, CS, or architecture lean Tsinghua. Math and basic sciences: compare specific departments.',
              'Does your CSCA combination match your target programs? Your exam subjects constrain which programs can receive your file — check both universities\' combinations before finalizing subjects.',
              'Do the current-cycle deadlines work? Both are March 31 – May 31 for most programs, but the competitive-program pulls (Jan 31 at PKU for Yenching/PHBS/math/AI; Jan 31–April 15 at Tsinghua) may order your calendar.',
              'Is there a specific program that only exists at one? Schwarzman (Tsinghua) has no PKU equivalent; Yenching (PKU) has no Tsinghua equivalent; PHBS is in Shenzhen, not Beijing. Program uniqueness beats general prestige.',
            ],
          },
          {
            type: 'ul',
            items: [
              'Choose PKU if: your subject is humanities/social sciences/medicine, you want the classic comprehensive-university environment, or you are targeting Yenching, Guanghua, or PHBS',
              'Choose Tsinghua if: your subject is engineering/CS/architecture, you want the deepest industry links, or you are targeting Schwarzman or SEM',
              'Choose both if: budget allows — the shared document set makes the second application cheap, and offers can be compared with scholarships on the table',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The honest closing note: for most international applicants, the profile decides. A file built for electrical engineering reads as a Tsinghua file; a file built for economics reads as a PKU file. Build the strongest application for your actual subject, and the university question usually answers itself.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Which university is better overall, Peking or Tsinghua?',
        a: 'Neither — they are consistently China\'s top two, and the ordering changes with the ranking and the year. Internationally both sit at the top of mainland China. Subject fit (humanities/sciences/medicine at PKU, engineering/CS/architecture at Tsinghua) is the decision that actually matters.',
      },
      {
        q: 'Is Tsinghua harder to get into than Peking University for international students?',
        a: 'Both are extremely selective, and difficulty varies more by program than by university — a CS program at either is more competitive than a niche humanities program at either. Treat them as equally hard, apply where your profile is strongest, and apply to both if the budget allows.',
      },
      {
        q: 'Do both universities require the CSCA?',
        a: 'Yes. From the 2026 intake the CSCA is required for bachelor\'s admission at both. The subject combinations differ by program — PKU typically pairs Humanities Chinese + Math (humanities) or Math + Physics/Chemistry (sciences), while Tsinghua pairs STEM Chinese + Math + Physics (engineering/CS) or + Chemistry (chemical/materials/life sciences). Verify the combination for your specific program before booking exam subjects.',
      },
      {
        q: 'Can I apply to both PKU and Tsinghua in the same year?',
        a: 'Yes. They use separate portals (studyatpku.com and the Tsinghua ISO portal), separate fees (~¥400–¥800 and ~¥500–¥800), and fully independent reviews. The transcripts, recommendation letters, and study plan overlap almost completely, so the second application mainly costs the fee.',
      },
      {
        q: 'Which is better for computer science?',
        a: 'Tsinghua is generally regarded as China\'s top CS program, with the strongest systems and AI research output. PKU\'s CS is also elite and pairs well with its math strength — applicants interested in theory sometimes prefer it — but the default lean for CS is Tsinghua.',
      },
      {
        q: 'Which is better for medicine?',
        a: 'Peking University. The PKU Health Science Center plus its affiliated-hospital system is one of China\'s strongest medical faculties; Tsinghua\'s medical school is much newer and smaller. For MBBS-track applicants the comparison is usually PKU vs other medical universities, not PKU vs Tsinghua.',
      },
      {
        q: 'Do tuition and living costs differ between the two?',
        a: 'Not meaningfully. Both charge ~¥30,000–¥60,000/year for international bachelor\'s students, similar master\'s bands, comparable dorm rates, and identical Beijing living costs. The scholarship stack (CSC, university scholarships, Beijing Government Scholarship) is also the same at both — money should not decide this comparison.',
      },
      {
        q: 'What are the English-taught options at each?',
        a: 'Both offer extensive English-taught master\'s programs and a growing set at bachelor\'s level. The flagship fully funded English programs are PKU\'s Yenching Academy (a master\'s in Chinese Studies) and Tsinghua\'s Schwarzman Scholars (a master\'s in global affairs with tuition, dorm, stipend, and travel covered). Both admit small cohorts with their own application calendars.',
      },
    ],
    howToSteps: [
      {
        name: 'Pick your subject first',
        text: 'Decide your intended discipline before the university — subject fit is the strongest predictor of both admission and satisfaction, and it narrows the PKU-vs-Tsinghua question immediately.',
      },
      {
        name: 'Verify the CSCA combination for your target programs',
        text: 'Look up the exact CSCA subject combination each target program specifies at both universities, then book exam subjects that keep both doors open where possible.',
      },
      {
        name: 'Build the shared document set',
        text: 'Prepare transcripts, two recommendation letters (associate professor or above), an 800–1,500-word study plan, passport copy, and language evidence (HSK 5+ for Chinese-taught; IELTS 6.5+ / TOEFL 90+ for English-taught) — one set serves both applications.',
      },
      {
        name: 'Apply to both if the budget allows',
        text: 'Submit at studyatpku.com and the Tsinghua ISO portal in the same cycle. The marginal cost is the second application fee; the upside is comparing real offers with scholarships attached.',
      },
      {
        name: 'Submit competitive programs by January 31',
        text: 'Most programs run March 31 – May 31, but the most competitive ones (Yenching, PHBS, applied math, AI at PKU; top master\'s programs at Tsinghua) close as early as January 31 — build your calendar around the earliest date you are targeting.',
      },
      {
        name: 'Compare offers with the full scholarship stack',
        text: 'When decisions arrive, compare packages across all three funding layers (CSC, university scholarship, Beijing Government Scholarship) plus program fit — a partially funded offer at the better-fit program often beats a bare admission elsewhere.',
      },
    ],
    ctaTitle: 'Choosing between PKU and Tsinghua?',
    ctaSubtitle:
      'SICA counselors map your target subject to the right university, verify each program\'s CSCA combination and deadline, and strengthen your study plan for whichever campus fits. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/peking-university-admissions-guide',
        label: 'Peking University admissions guide',
        description: 'Application routes, deadlines, documents, and the CSCA matrix for PKU.',
      },
      {
        href: '/tsinghua-university-admissions-guide',
        label: 'Tsinghua University admissions guide',
        description: 'The standard route plus the separate Schwarzman Scholars stream.',
      },
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The exam both universities require, and how combinations map to programs.',
      },
    ],
  },
  zh: {
    slug: 'peking-university-vs-tsinghua',
    eyebrow: '对比 · 北大 VS 清华',
    title: '北京大学 vs 清华大学 — 国际学生该申请哪一所？',
    description:
      '北大与清华全方位对比：学科优势、CSCA科目组合、申请截止日期、学费、奖学金，以及如何做出选择的决策框架。',
    subtitle:
      '它们是中国最有名的两所大学，校园在北京西北部相邻而建，每届国际申请者都会问同一个问题：选北大还是选清华？诚实的答案是：这场对比从来不是"哪所更好"——两校在中国各类排名中轮流占据前两位——而是"哪一所更适合你的专业、你的CSCA科目组合和你的学习计划"。本指南从真正影响申请决策的维度进行比较：学术定位、学科实力、录取要求、截止日期、费用、奖学金与校园生活。',
    stats: [
      { value: '1898 / 1911', label: '北大 / 清华建校' },
      { value: '前二', label: '常年位居中国高校前两名' },
      { value: '相邻', label: '同在北京海淀区，校园相邻' },
      { value: '¥3–6万', label: '本科学费/年（两校相同）' },
    ],
    quickAnswer:
      '北京大学是中国综合性旗舰高校——人文、社科、基础学科与医学最强；清华则是工程与应用科学旗舰——工程、计算机与建筑最强。自2026级起两校都要求CSCA成绩（不同专业的科目组合不同），多数秋季入学项目的截止日期都在3月31日至5月31日之间，竞争最激烈的项目最早1月31日截止，且两校国际本科生学费基本相同（约¥30,000–¥60,000/年）。对多数申请者而言，决定因素是目标专业而非名气：人文、理科、医学倾向北大；工程、计算机、建筑倾向清华。',
    keyTakeaways: [
      '北大 = 综合性旗舰（人文、社科、基础理科、医学）；清华 = 工程与应用科学旗舰（工程、计算机、建筑）',
      '两校没有绝对的"更好"——中国各类排名中轮流占据前两名，专业匹配度才是决定因素',
      '自2026级起两校都要求CSCA：北大组合以人文中文+数学（文科）或数学+物理/化学（理科）为主；清华组合以理工中文+数学+物理（工程/计算机）或+化学（化工/材料/生命）为主',
      '截止日期高度重叠：多数项目3月31日–5月31日；最竞争的项目（燕京学堂、汇丰商学院、数学、AI方向；清华热门硕士）最早1月31日截止',
      '费用几乎一致：本科约¥30,000–¥60,000/年，宿舍区间相同，同处北京生活成本相同，奖学金体系（CSC+校级+北京市政府）也相同',
      '对称的精英英语授课硕士项目：北大燕京学堂（中国学）vs 清华苏世民书院（全球事务，全额资助）',
    ],
    sections: [
      {
        id: 'at-a-glance',
        h2: '北大 vs 清华 一览',
        intro: '一张表看完整对比。每一行都是申请者真正权衡的维度——而其中多数行打成了平手。',
        blocks: [
          {
            type: 'table',
            caption: '并排对比',
            columns: ['维度', '北京大学', '清华大学'],
            rows: [
              ['建校时间', '1898年（京师大学堂——中国第一所国立大学）', '1911年（清华学堂，留美预备学校）'],
              ['定位', '综合性旗舰：人文、社科、基础理科、医学', '工程与应用科学旗舰：工程、计算机、建筑'],
              ['校园', '北京海淀（未名湖校区）', '北京海淀——与北大相邻'],
              ['排名', '与清华并列中国前二；不同排名、不同年份互有先后', '与北大并列中国前二；不同排名、不同年份互有先后'],
              ['本科国际生学费', '约¥30,000–¥60,000/年', '约¥30,000–¥60,000/年'],
              ['多数秋季入学截止', '3月31日–5月31日；竞争项目1月31日前', '3月31日–5月31日；竞争项目最早1月31日'],
              ['CSCA（2026级起）', '人文中文+数学（文科）；数学+物理/化学（理科）', '理工中文+数学+物理（工程/计算机）；+化学（化工/材料/生命）'],
              ['中文授课语言门槛', '通常HSK 5级以上', '通常HSK 5级以上'],
              ['英文授课语言门槛', '通常IELTS 6.5+ / TOEFL 90+', '通常IELTS 6.5+ / TOEFL 90+'],
              ['旗舰英语硕士项目', '燕京学堂（中国学）', '苏世民书院（全球事务；全额资助）'],
              ['申请费', '约¥400–¥800', '约¥500–¥800'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '一句话总结：北大是中国研究自身的殿堂——人文、理科、医学；清华是中国工程建设的引擎——工程、计算、建筑。两校都站在体系顶端，就读成本也几乎相同。',
          },
        ],
      },
      {
        id: 'identity',
        h2: '两种身份：人文之校 vs 工程之校',
        intro: '两校的竞争关系真实存在，但它最初源于一次分工。理解各自的建校使命，几乎可以解释后面所有的差异。',
        blocks: [
          {
            type: 'h3',
            text: '北京大学——国家的综合性大学',
            body: '北大1898年以京师大学堂之名建校，是中国现代大学体系中历史最悠久的高校，此后一直高举人文、社科与基础理科的大旗。它的法学院、经济学院、中国文学系以及纯数学、物理项目位列全国录取门槛最高的行列，医学部拥有中国最强的医学教育体系之一。校园文化带有著名的文人气质与思辨传统。',
          },
          {
            type: 'h3',
            text: '清华大学——工程强校',
            body: '清华1911年以留美预备学校起步，1928年成为完整大学，1952年院系调整后重建为中国最高工程学府——这一地位从未动摇。机械、电气、土木、化工、材料等工程学科加上计算机与建筑构成其核心；校园里流传着"土木建筑机械，无所不能"的工程师传统口号。它与中国工业体系和国家工程系统的联系是全国高校中最深的。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '两校均为C9联盟成员和"双一流"建设顶尖层次。在国际排名中，两校在中国大陆高校中并肩位于前列——具体排序随排名与年份变化，请按匹配度选择，而不是依赖某一张榜单。',
          },
        ],
      },
      {
        id: 'academics',
        h2: '各学科谁更强？',
        intro: '按学科看相对实力——这才是真正应该驱动你决策的维度。两校几乎在所有领域都很出色，这里的"更强"指该领域更强的全国性声誉与研究深度。',
        blocks: [
          {
            type: 'table',
            caption: '分学科相对优势',
            columns: ['学科领域', '倾向', '原因'],
            rows: [
              ['人文（文学、历史、哲学）', '北大', '中国人文学术的国家中心'],
              ['社科（经济、政治、社会）', '北大', '旗舰院系；最强的同侪群体'],
              ['数学与基础物理/化学', '两校/北大略强', '北大的纯理科传统；清华近年大力投入，差距明显缩小'],
              ['计算机科学', '清华', '中国顶尖CS项目；系统与AI研究产出领先'],
              ['工程（机械、电气、土木、材料）', '清华', '历史核心；产业与国家工程系统联系最深'],
              ['建筑学', '清华', '梁思成创办；全国标杆院系'],
              ['医学', '北大', '北大医学部+附属医院体系'],
              ['商科/管理', '两校', '光华（北大）vs 五道口与经管（清华）——均为顶尖；北大汇丰位于深圳'],
              ['新闻传播', '北大', '建系悠久；清华项目较新'],
              ['公共政策/全球事务', '两校', '清华苏世民 vs 北大燕京——路线不同，同为精英项目'],
            ],
          },
          {
            type: 'p',
            text: '实际判断：申请电气工程、计算机或建筑，就是申请清华的历史主场；申请文学、经济、法律或医学，就是申请北大的主场。数学与基础理科的申请者两边都可以认真考虑，应当对比具体研究方向和英语授课选项后再决定。',
          },
        ],
      },
      {
        id: 'admissions',
        h2: '录取：CSCA组合、截止日期与语言门槛',
        intro: '对国际申请者而言，两校的申请机制惊人地相似——同一门考试、同一截止区间、同样的语言门槛。差异在CSCA科目组合和个别项目的时间窗口。',
        blocks: [
          {
            type: 'h3',
            text: '2026级起的CSCA要求',
            body: '自2026级起，两校的本科录取都要求CSCA成绩，区别在于各专业指定的科目组合。北大文科专业通常要求人文中文+数学；理科专业要求数学+物理或化学。清华工程与计算机专业通常要求理工中文+数学+物理；化工、材料与生命科学专业加考或改考化学。报名CSCA科目之前务必在项目官页核对确切组合——科目选错可能直接让一份优秀申请失去资格。',
          },
          {
            type: 'table',
            caption: '按方向的典型CSCA组合',
            columns: ['方向', '北京大学', '清华大学'],
            rows: [
              ['人文/社科', '人文中文+数学', '人文中文+数学（因项目而异）'],
              ['工程/计算机', '数学+物理（因项目而异）', '理工中文+数学+物理'],
              ['化工/材料/生命科学', '数学+化学', '理工中文+数学+化学'],
              ['医学', '数学+化学（医学部项目）', '本科阶段多数方向不适用'],
            ],
          },
          {
            type: 'h3',
            text: '截止日期',
            body: '两校多数秋季入学项目都在3月31日至5月31日之间截止，但最竞争的项目会提前：北大的燕京学堂、汇丰商学院、数学与AI方向最保险在1月31日前提交；清华的热门硕士项目可能在1月31日至4月15日之间截止。苏世民书院有独立的全球申请日程，截止日期在5月下旬。每个日期都要在你的申请季到官方门户核实——窗口逐年调整。',
          },
          {
            type: 'ul',
            items: [
              '北大门户：studyatpku.com（直接申请、CSC、使馆推荐三条路线共用一个门户）',
              '清华门户：清华国际学生招生门户（直接申请与CSC路线）；苏世民书院为 schwarzmanscholars.org',
              '申请费：北大约¥400–¥800，清华约¥500–¥800（每申请季）',
              '材料清单几乎一致：护照、成绩单、800–1,500字学习计划、2封推荐信（副教授及以上）、语言证明',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '同一申请季你可以同时申请两校——门户、费用与评审完全独立。共享的材料（成绩单、推荐信、学习计划）意味着第二所旗舰高校申请的边际成本基本只剩申请费。',
          },
        ],
      },
      {
        id: 'cost-scholarships',
        h2: '费用与奖学金：实质上的平手',
        intro: '同城、同学费区间、同一政府奖学金体系。在这两所之间，钱几乎不应该是决定因素。',
        blocks: [
          {
            type: 'table',
            caption: '费用对比（国际学生，每年）',
            columns: ['费用项目', '北京大学', '清华大学'],
            rows: [
              ['本科学费', '约¥30,000–¥60,000', '约¥30,000–¥60,000'],
              ['硕士学费', '约¥35,000–¥80,000', '约¥35,000–¥80,000'],
              ['宿舍', '约¥1,200–¥3,000/月（双人间）', '约¥1,200–¥3,000/月（双人间）'],
              ['伙食与日常（北京）', '约¥1,500–¥3,000/月', '约¥1,500–¥3,000/月'],
              ['申请费', '约¥400–¥800', '约¥500–¥800'],
            ],
          },
          {
            type: 'h3',
            text: '奖学金是同样的三层体系',
            body: '两校处在同一个资助金字塔中：中国政府奖学金（CSC——学费减免、住宿加每月约¥2,000–3,000生活补助）、各校自设的国际学生奖学金（部分至全额学费减免），以及北京市政府奖学金（学费减免加约¥3,000/月补助，一年期可续）。强申请者的做法是在三层之间组合提名，而不是押注单一渠道。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '不对称的例外：清华苏世民书院是另一个量级的全额资助——学费、住宿、生活补助、往返机票、笔记本电脑、保险与教材全覆盖。北大最接近的对等项目燕京学堂对录取者同样全额资助。两者录取名额都极少，且使用独立的选拔日程。',
          },
        ],
      },
      {
        id: 'campus-life',
        h2: '校园生活：两个校园，一个街区',
        intro: '两校校园在海淀区紧挨着——学生真的可以步行互访——所以城市体验是共享的，差别在校园气质。',
        blocks: [
          {
            type: 'ul',
            items: [
              '北大校园以未名湖和清代园林建筑为核心——紧凑、园林式、人文气质',
              '清华校园更大更舒展，与工程院系的体量相匹配',
              '两校共享同一个五道口学生生活圈：便宜餐饮、咖啡馆，以及全中国密度最高的学生街区',
              '北京的实习资源（政府、国家媒体、企业总部、科技公司）从两校出发同样便利——清华离科技园区略近，北大离政策与文化机构略近',
              '北京的冬天对两个校园一视同仁：干燥、寒冷、体验相同',
            ],
          },
          {
            type: 'p',
            text: '如果你的申请季里两校提供校园开放日或线上宣讲，两边都参加——申请者普遍反馈两个校园的"气质"差异是任何排名都无法体现的，而在学术匹配度接近时，这种气质差异是正当的决定因素。',
          },
        ],
      },
      {
        id: 'decision',
        h2: '决策框架：四个问题选定北大或清华',
        intro: '按顺序回答这四个问题。多数申请者在第二问时答案就已浮现。',
        blocks: [
          {
            type: 'ol',
            items: [
              '你的目标专业是什么？人文、社科、医学或纯理科倾向北大；工程、计算机或建筑倾向清华。数学与基础理科：对比具体院系。',
              '你的CSCA组合与目标项目匹配吗？考试科目决定了哪些项目能接收你的申请——在最终确定科目之前，先核对两校的项目组合要求。',
              '当前申请季的截止日期可行吗？两校多数项目都是3月31日–5月31日，但竞争项目的提前截止（北大燕京/汇丰/数学/AI为1月31日；清华1月31日–4月15日）会决定你的时间表。',
              '是否存在只在一校开设的项目？苏世民（清华）在北大没有对等项；燕京（北大）在清华没有对等项；北大汇丰在深圳而非北京。项目的独特性胜过综合名气。',
            ],
          },
          {
            type: 'ul',
            items: [
              '选北大，如果：你的专业是人文/社科/医学，你想要经典综合性大学的环境，或者你的目标是燕京学堂、光华或汇丰',
              '选清华，如果：你的专业是工程/计算机/建筑，你想要最深的产业联系，或者你的目标是苏世民或经管学院',
              '两所都申，如果：预算允许——共享材料让第二份申请很便宜，而且可以在手握奖学金的情况下对比录取结果',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '诚实的结语：对多数国际申请者来说，申请材料本身会替你做决定。为电气工程打造的申请天然是"清华型"材料；为经济学打造的申请天然是"北大型"材料。为你真正的目标专业打造最强的申请，选校问题通常会自行消解。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '北大和清华到底哪所更好？',
        a: '都不绝对——两校常年并列中国前两名，排序随排名和年份变化。国际上两校也并肩位于中国大陆高校最前列。真正重要的是专业匹配（北大的人文/理科/医学，清华的工程/计算机/建筑），而不是综合名气。',
      },
      {
        q: '对国际学生来说清华比北大更难考吗？',
        a: '两校都极其挑剔，而且难度差异主要来自具体项目而非学校——两校的计算机项目都比两校的冷门文科项目更竞争。把它们当作同等难度，向材料最强的一侧申请；预算允许多申一所就都申。',
      },
      {
        q: '两校都要求CSCA吗？',
        a: '是的。自2026级起，两校本科录取都要求CSCA。科目组合因项目而异——北大通常为人文中文+数学（文科）或数学+物理/化学（理科）；清华通常为理工中文+数学+物理（工程/计算机）或+化学（化工/材料/生命）。报名考试科目之前务必核对目标项目的确切组合。',
      },
      {
        q: '可以同年同时申请北大和清华吗？',
        a: '可以。两校使用独立门户（studyatpku.com与清华国际学生招生门户）、独立申请费（约¥400–¥800与约¥500–¥800），评审完全独立。成绩单、推荐信和学习计划几乎完全复用，第二份申请的成本主要就是申请费。',
      },
      {
        q: '计算机科学哪所更强？',
        a: '清华通常被认为是中国最强的CS项目，系统与AI研究产出领先。北大CS同样属于顶尖，且与其数学实力互补——对理论方向感兴趣的申请者有时更偏好北大——但CS方向的默认倾向是清华。',
      },
      {
        q: '医学哪所更强？',
        a: '北京大学。北大医学部及其附属医院体系是中国最强的医学教育体系之一；清华医学院成立较晚、规模较小。对MBBS方向的申请者，比较对象通常是北大与其他医科大学，而不是北大与清华。',
      },
      {
        q: '两校的学费和生活成本有差别吗？',
        a: '没有实质差别。两校国际本科生学费均约¥30,000–¥60,000/年，硕士区间相近，宿舍标准相当，北京生活成本相同。奖学金体系（CSC、校级奖学金、北京市政府奖学金）也完全一致——费用不应成为这场对比的决定因素。',
      },
      {
        q: '两校有哪些英语授课选择？',
        a: '两校都有大量英语授课硕士项目，本科层次也在增加。旗舰全额资助英语项目是北大燕京学堂（中国学硕士）与清华苏世民书院（全球事务硕士，学费、住宿、生活补助与差旅全包）。两者录取名额都很少，且使用独立的申请日程。',
      },
    ],
    howToSteps: [
      {
        name: '先定专业',
        text: '在选校之前先确定目标学科——专业匹配度是录取率与就读满意度最强的预测指标，而且它能让"北大还是清华"的问题立刻收窄。',
      },
      {
        name: '核对目标项目的CSCA组合',
        text: '查询两校目标项目各自指定的CSCA科目组合，然后报考能同时保留两边机会的科目。',
      },
      {
        name: '准备共享材料',
        text: '准备成绩单、两封推荐信（副教授及以上）、800–1,500字学习计划、护照复印件和语言证明（中文授课HSK 5+；英文授课IELTS 6.5+ / TOEFL 90+）——一套材料服务两份申请。',
      },
      {
        name: '预算允许就两校都申',
        text: '同一申请季在studyatpku.com和清华国际学生招生门户同时提交。边际成本只是第二笔申请费；收益是拿到附带奖学金的真实录取结果后再做比较。',
      },
      {
        name: '竞争项目1月31日前提交',
        text: '多数项目3月31日–5月31日截止，但最竞争的项目（北大燕京、汇丰、数学、AI；清华热门硕士）最早1月31日截止——以你目标中最早的日期来倒排时间表。',
      },
      {
        name: '用完整奖学金体系比较录取结果',
        text: '放榜后，把三层资助渠道（CSC、校级奖学金、北京市政府奖学金）连同项目匹配度一起比较——一个更匹配项目上的部分资助录取，往往好过另一边的光秃录取。',
      },
    ],
    ctaTitle: '正在北大与清华之间选择？',
    ctaSubtitle:
      'SICA顾问帮你把目标专业匹配到合适的学校，核对每个项目的CSCA组合与截止日期，并为更合适的校园打磨你的学习计划。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/peking-university-admissions-guide',
        label: '北京大学申请指南',
        description: '北大的申请路线、截止日期、材料清单与CSCA矩阵。',
      },
      {
        href: '/tsinghua-university-admissions-guide',
        label: '清华大学申请指南',
        description: '标准申请路线，以及独立的苏世民书院申请通道。',
      },
      {
        href: '/csca-exam',
        label: 'CSCA考试完全指南',
        description: '两校都要求的考试，以及科目组合如何对应项目。',
      },
    ],
  },
};

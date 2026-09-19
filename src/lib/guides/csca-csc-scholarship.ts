import type { LocalizedGuide } from './types';

/**
 * "CSCA for CSC scholarship applicants" — Batch 4, article #15 of
 * the 20-article CSCA cluster (docs/csca-content-plan.md).
 * Target queries: "csca scholarship", "csc scholarship csca score",
 * "chinese government scholarship exam".
 *
 * Static content. CSC facts (mandatory scores from 2026 intake,
 * Jan–Apr deadline cluster, two channels) from the cluster's
 * verified baseline; CSC coverage figures from the flagship CSC
 * guide.
 */
export const cscaCscScholarshipGuide: LocalizedGuide = {
  en: {
    slug: 'csca-csc-scholarship',
    eyebrow: 'GUIDE · CSCA × CSC',
    title: 'CSCA for CSC Scholarship Applicants — Scores, Timeline, and the January–April Crunch',
    description:
      'From the 2026 intake, CSC (Chinese Government Scholarship) bachelor\'s applicants must submit CSCA scores — no score, no shortlist. The deadline timeline, session planning for the Jan–Apr crunch, channel-specific rules, and the retake calculus.',
    subtitle:
      'The CSC scholarship is China\'s most competitive full funding — tuition, dorm, monthly stipend, and airfare — and from the 2026 intake its bachelor\'s applicants must submit CSCA scores with the scholarship application. That single rule compresses your entire calendar: CSC deadlines cluster in January–April, which effectively forces scholarship candidates into the earliest CSCA sessions of each year and leaves room for at most one fallback sitting. This guide maps the crunch, the channel differences, and the score targets that make a scholarship file competitive.',
    stats: [
      { value: 'Jan–Apr', label: 'CSC deadline window' },
      { value: '1', label: 'Fallback sitting — at most' },
      { value: '¥2,500–3,500', label: 'Monthly stipend at stake' },
      { value: 'Mandatory', label: 'Scores, from the 2026 intake' },
    ],
    quickAnswer:
      'From the 2026 intake, applicants to the CSC (Chinese Government Scholarship) at bachelor\'s level must sit the CSCA and submit their score report with the scholarship application — through both main channels (the embassy/Bilateral route and the university/Chinese University Program route). A file without CSCA scores is incomplete and does not shortlist, regardless of other strengths. Because CSC deadlines cluster between January and April, scholarship candidates should sit the earliest CSCA session of the calendar year, keeping at most one fallback sitting before the April deadlines. Competitive scholarship scores typically sit 5–10 points above the admission bands for the same tier — a fully-funded place is scarcer than an admission, so the line is higher.',
    keyTakeaways: [
      'CSC bachelor\'s applicants must submit CSCA scores from the 2026 intake — both the embassy and university channels require them',
      'No score = no shortlist: scholarship screening checks completeness mechanically',
      'CSC deadlines cluster January–April; the earliest CSCA session of the year is effectively mandatory',
      'Plan for one fallback sitting at most — the second session of the year barely clears April deadlines; the third does not',
      'Scholarship-competitive scores sit ~5–10 points above the tier\'s admission band (80+ tiers expect ~85–90)',
      'Pair the CSCA score with the full CSC package: university offer, study plan, references, physical exam — the score is one part of a mechanical checklist',
    ],
    sections: [
      {
        id: 'why-mandatory',
        h2: 'Why the CSCA is mandatory for CSC applicants',
        intro:
          'The scholarship is the highest-stakes use of the exam: CSC funding decisions need a comparable academic signal across a global pool.',
        blocks: [
          {
            type: 'p',
            text: 'The CSC awards roughly 3,000 fully-funded places a year across every degree level, reviewed centrally with input from universities and embassies. Before the CSCA, scholarship reviewers compared applicants on transcripts from incompatible school systems — the same comparison problem universities faced, at a bigger scale and with more money attached. From the 2026 intake, the CSCA score report is the standardized academic signal in every bachelor\'s scholarship file, and its absence is treated as a missing document, not a nuance.',
          },
          {
            type: 'ul',
            items: [
              '**Both channels** — the Bilateral Program (via your country\'s Chinese embassy / dispatching authority) and the Chinese University Program (via the host university\'s international office) both require CSCA scores for bachelor\'s applicants',
              '**Mechanical screening** — early-stage scholarship review is checklist-driven: eligibility, documents, scores. Incomplete files exit before any human judges their quality',
              '**No scholarship-based exemption** — there is no published route that waives the CSCA because of scholarship status; the exemption routes (HSK-4 language programs, university waivers) apply the same as for self-funded applicants, if at all',
              '**English-taught CSC places** — the requirement is not limited to Chinese-taught programs; English-taught scholarship places also require the score report',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The single most common CSC + CSCA failure is timing, not quality: a strong score that arrives after the deadline helps nobody. Build the calendar backwards from January, not from your preferred test date.',
          },
        ],
      },
      {
        id: 'the-crunch',
        h2: 'The January–April crunch, mapped',
        intro:
          'CSC timing is not flexible, so the exam calendar has exactly one correct shape. Here it is, backwards.',
        blocks: [
          {
            type: 'table',
            caption: 'The scholarship-calendar spine (for a September intake)',
            columns: ['When', 'What happens', 'Your move'],
            rows: [
              ['Prior spring–summer', 'Universities open September-intake applications; CSC notice preview', 'Sit the CSCA early if the previous session fits — a banked score removes all schedule risk'],
              ['Autumn', 'University applications run; pre-admission contacts', 'Finish university applications early; request pre-admission letters where the channel rewards them'],
              ['Dec – early Jan', 'First CSCA session of the year (recent pattern: a January sitting)', 'PRIMARY SITTING — registered the week the window opens'],
              ['Jan – Feb', 'Embassy (Bilateral) deadlines begin', 'Submit scholarship files with first-session scores'],
              ['Mar', 'Second CSCA session (recent pattern: a March sitting)', 'FALLBACK SITTING — only if attempt 1 underperformed; barely clears April deadlines'],
              ['Apr', 'University-channel CSC deadlines cluster', 'All files complete: scores attached, pre-admission letters in, references done'],
              ['May – Jun', 'Results; university placement confirmed', 'Accept, plan the visa (JW201 for CSC), prepare arrival'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**The two-sitting reality** — session 1 is the plan, session 2 is the insurance; a third sitting lands after April and only serves next year\'s cycle or self-funded applications',
              '**Register early regardless** — overseas center seats for the January session are the scarcest resource in the whole scholarship calendar',
              '**Bank-a-score strategy** — candidates who can sit a session 6+ months before deadlines remove the crunch entirely; this is the single highest-value scheduling decision available',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Exact session dates are announced per cycle on the official portal — the pattern above reflects recent cycles, not a guarantee. Re-verify the calendar the moment your cycle\'s announcements appear.',
          },
        ],
      },
      {
        id: 'channel-differences',
        h2: 'Channel differences that change your CSCA plan',
        intro:
          'The two CSC channels share the exam requirement but differ in deadline shape, pre-admission expectations, and who reads your file first.',
        blocks: [
          {
            type: 'table',
            caption: 'Bilateral vs Chinese University Program for a CSCA candidate',
            columns: ['Dimension', 'Embassy (Bilateral)', 'University (CUP)'],
            rows: [
              ['Where you apply', 'Chinese embassy / home-country dispatching authority', 'Target university\'s international student office'],
              ['Typical deadline shape', 'Earlier — January to March', 'February to April, top universities earlier'],
              ['Who reads your file first', 'Home-country selection committee', 'University admissions / scholarship office'],
              ['Pre-admission letter', 'Often strengthened by one; channel rules vary by country', 'Frequently expected — apply to the university first'],
              ['CSCA score use', 'Country quota competition — your score vs your compatriots\'', 'University program competition — your score vs the program pool'],
              ['CSCA planning note', 'Earlier deadlines → earliest session non-negotiable', 'Slightly more room, but top universities close fast'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Apply both channels** — they are not mutually exclusive; most successful candidates run embassy and university applications in parallel, holding one CSCA report that serves both',
              '**Quota dynamics at embassies** — bilateral places are allocated by country; in high-quota countries the effective score line can be high, making your CSCA score the differentiator',
              '**University-first sequencing** — for the CUP channel, secure the university admission application first (many channels expect a pre-admission offer), then submit CSC materials through it',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Deadlines differ per country and per university — the table\'s shapes are typical, not universal. Confirm your country\'s embassy notice and each university\'s CSC page every cycle.',
          },
        ],
      },
      {
        id: 'score-targets',
        h2: 'What CSCA score makes a scholarship file competitive?',
        intro:
          'Scholarship lines sit above admission lines. Here is the practical arithmetic.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**The rule of thumb** — competitive CSC scores run 5–10 points above the tier\'s admission band: an 80+ tier expects roughly 85–90, a 70+ tier roughly 75–85',
              '**Quota cuts both ways** — at your embassy, you compete against compatriots; in smaller-quota countries, a solid 75+ can outperform an 85 in an oversubscribed country. Research your country\'s quota history',
              '**Required subjects only** — scholarship reviewers read the subjects your program requires; an 88 Math / 85 Physics profile outweighs a flat 80 everywhere for an engineering place',
              '**The score is a gate, not the prize** — past the screen, study-plan quality, references, and program fit drive the final ranking; a 90 with a generic study plan loses to an 82 with a sharp one',
              '**Self-funded fallback** — if the retake math fails and your score lands below the scholarship bar, the same report still powers self-funded applications; CSC re-attempt next cycle is a plan, not a defeat',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Target-setting for CSC: use the scores guide\'s method (research, max-of-list + 10) and then add the scholarship premium of 5–10. For most top-tier CSC ambitions that means walking into the January session aiming at 85–90 in required subjects.',
          },
        ],
      },
      {
        id: 'file-checklist',
        h2: 'The CSC + CSCA file checklist',
        intro:
          'Scholarship screening is completeness-driven. Everything below is a checklist line, and every line is a place files die.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**CSCA score report** — downloaded from the portal, attached to the scholarship application AND university application; keep the original PDF',
              '**University admission or pre-admission** — per channel expectations; apply to universities early enough that offers/pre-admission letters land before CSC deadlines',
              '**Study plan** — program-specific, 500–1,500 words; the score gets you past the screen, this wins the ranking',
              '**References** — 1–2 academic referees briefed early enough to write before January–April',
              '**Physical exam form** — the standard foreigner physical examination form, completed at an authorized hospital within its validity window',
              '**Passport + documents** — validity well beyond the intake; transcripts and certificates with certified translations where required',
              '**Channel-specific forms** — the embassy\'s dispatching forms or the university\'s CSC application number from the official CSC portal, per your channel\'s instructions',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Every channel publishes its own document list — the checklist above is the common spine, not a substitute for your embassy\'s or university\'s official list. Reconcile your checklist against theirs line by line, every cycle.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Do CSC scholarship applicants have to take the CSCA?',
        a: 'Yes — from the 2026 intake, bachelor\'s-level CSC applicants must sit the CSCA and submit scores through both main channels (embassy/Bilateral and university/Chinese University Program). A scholarship file without the score report is incomplete and does not shortlist.',
      },
      {
        q: 'Which CSCA session should CSC applicants sit?',
        a: 'The earliest session of the calendar year — recently a January sitting. CSC deadlines cluster January–April, so the first session is the primary attempt and the second (often March) is the only realistic fallback; a third lands after deadlines.',
      },
      {
        q: 'What CSCA score do I need for the CSC scholarship?',
        a: 'Competitive scholarship scores typically run 5–10 points above the admission band for your target tier — roughly 85–90 for top-tier ambitions, 75–85 for strong mid-tier programs. Embassy-channel competition is by country quota, so research your country\'s historical quota and cut-off behavior.',
      },
      {
        q: 'Can I get a CSC without a CSCA score if I apply late?',
        a: 'No published route waives the requirement — a file without scores is incomplete at screening. If your cycle\'s sessions have passed, the realistic options are self-funded application with your existing scores (if you have any) or the next cycle with a planned CSCA sitting.',
      },
      {
        q: 'Should I apply through the embassy or the university?',
        a: 'Both, in parallel — they are separate competitions reading the same CSCA report. The embassy channel runs earlier deadlines and country-quota competition; the university channel runs later deadlines and program-pool competition. Together they maximize your draw chances.',
      },
      {
        q: 'Does an English-taught CSC place need the CSCA too?',
        a: 'Yes — the mandate is not limited to Chinese-taught programs. English-taught scholarship applicants submit the same score report for their program\'s subject combination, alongside IELTS/TOEFL as language evidence.',
      },
      {
        q: 'If I miss the CSC deadline, is my CSCA score wasted?',
        a: 'No — the same report powers self-funded university applications immediately, and it remains your academic signal for next cycle\'s CSC attempt (verify any recency preference per university). A missed deadline costs the scholarship cycle, not the score.',
      },
    ],
    howToSteps: [
      {
        name: 'Fix the calendar spine before anything else',
        text: 'Write down: first CSCA session of your cycle (register the week its window opens), your embassy\'s deadline, each university\'s CSC deadline. Everything else in the plan is sequenced against these three dates.',
      },
      {
        name: 'Choose your channels and confirm their lists',
        text: 'Run embassy and university channels in parallel. Pull each one\'s official document list and reconcile it against the common spine — channel-specific forms are where incomplete files originate.',
      },
      {
        name: 'Set a scholarship-grade score target',
        text: 'Use the scores-guide method and add the 5–10 point scholarship premium. For top-tier ambitions: walking into the January session aiming at 85–90 in required subjects.',
      },
      {
        name: 'Bank a score early if at all possible',
        text: 'If a session lands 6+ months before deadlines, sit it — a banked score converts the crunch into a normal application season and leaves the year\'s sessions as pure upside.',
      },
      {
        name: 'Prepare the full file while you prep the exam',
        text: 'Study plan, briefed referees, physical exam form, certified translations — these have their own lead times and none of them can be done in the final week. Run them as a parallel track to CSCA prep.',
      },
      {
        name: 'Execute the two-sitting insurance plan',
        text: 'Sit session 1 as the primary attempt. If scores miss the target, register session 2 immediately and resit only weak subjects. If session 2 also falls short, pivot the file to self-funded applications and re-attempt CSC next cycle.',
      },
    ],
    ctaTitle: 'Chasing the CSC scholarship?',
    ctaSubtitle:
      'SICA counselors plan the two-channel strategy, set scholarship-grade score targets, and keep the exam, university, and scholarship calendars from colliding. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/chinese-government-scholarship-csc',
        label: 'Chinese Government Scholarship (CSC) — full guide',
        description: 'Coverage, categories, channels, and the full application process.',
      },
      {
        href: '/csca-exam-dates',
        label: 'CSCA exam dates & registration windows',
        description: 'The session lattice behind the January–April crunch.',
      },
      {
        href: '/csca-scores-and-cutoffs',
        label: 'CSCA scores & university cutoffs',
        description: 'The target-setting method, upgraded with the scholarship premium.',
      },
    ],
  },
  zh: {
    slug: 'csca-csc-scholarship',
    eyebrow: '指南 · CSCA × CSC',
    title: 'CSC 奖学金申请者的 CSCA——成绩、时间线与 1-4 月截止挤压',
    description:
      '自 2026 级起，CSC（中国政府奖学金）本科申请者必须提交 CSCA 成绩——无成绩即不入围。截止时间线、1-4 月挤压的场次规划、渠道差异与重考算术。',
    subtitle:
      'CSC 奖学金是中国竞争最激烈的全额资助——学费、住宿、月津贴与机票——自 2026 级起其本科申请者必须随奖学金申请提交 CSCA 成绩。这一条规则压缩了你的整个日历：CSC 截止集中在 1-4 月，这事实上把奖学金考生锁定在每年最早的 CSCA 场次，且最多只留一次兜底场次。本指南绘制挤压地图、渠道差异，以及让奖学金档案有竞争力的分数目标。',
    stats: [
      { value: '1-4 月', label: 'CSC 截止窗口' },
      { value: '1 次', label: '兜底场次——至多' },
      { value: '¥2,500-3,500', label: '月津贴在赌桌上' },
      { value: '强制', label: '成绩，自 2026 级起' },
    ],
    quickAnswer:
      '自 2026 级起，本科层次 CSC（中国政府奖学金）申请者必须参加 CSCA 并随奖学金申请提交成绩——两条主渠道（使馆/双边与大学/中国大学项目）皆然。缺成绩的材料不完整、不入围，无论其他条件多强。由于 CSC 截止集中在 1-4 月，奖学金考生应参加年内最早的 CSCA 场次，在 4 月截止前最多留一次兜底场次。有竞争力的奖学金分数通常比同层次录取带高 5-10 分——全额资助名额比录取更稀缺，所以线更高。',
    keyTakeaways: [
      '2026 级起 CSC 本科申请者必须提交 CSCA 成绩——使馆与大学两渠道皆要求',
      '无成绩 = 不入围：奖学金筛选机械化查完整性',
      'CSC 截止集中在 1-4 月；年内最早场次事实上是必选项',
      '最多按一次兜底场次规划——第二场勉强赶上 4 月截止，第三场赶不上',
      '有竞争力的奖学金分数比该层次录取带高约 5-10 分（80+ 层次预期 85-90）',
      'CSCA 成绩只是完整 CSC 材料包的一部分：大学 offer、学习计划、推荐信、体检——成绩是机械清单的一项',
    ],
    sections: [
      {
        id: 'why-mandatory',
        h2: '为什么 CSC 申请者必考 CSCA',
        intro:
          '奖学金是这场考试风险最高的用途：CSC 资助决策需要跨全球申请者池的可比学术信号。',
        blocks: [
          {
            type: 'p',
            text: 'CSC 每年在所有学位层级发放约 3,000 个全额资助名额，由中央统筹、大学与使馆参与评审。在 CSCA 之前，奖学金评审者比较的是互不兼容学制的成绩单——与大学面对的同一个比较难题，只是规模更大、金额更高。自 2026 级起，CSCA 成绩单是每份本科奖学金材料中的标准化学术信号，缺失按缺件处理，而不是酌情事项。',
          },
          {
            type: 'ul',
            items: [
              '**两条渠道**——双边项目（经本国中国使馆/派遣机关）与中国大学项目（经接收大学国际办公室）对本科申请者都要求 CSCA 成绩',
              '**机械化筛选**——奖学金初筛按清单执行：资格、材料、成绩。不完整的材料在任何人工评审之前就出局',
              '**无奖学金豁免**——没有因奖学金身份而免除 CSCA 的公布通道；豁免通道（HSK-4 语言项目、大学个案豁免）与自费申请者适用条件相同——如果有',
              '**英文授课 CSC 名额**——要求不限于中文授课项目；英文授课奖学金名额同样要求成绩单',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'CSC + CSCA 最常见的失败不是质量而是时间：强成绩在截止后才到，毫无用处。从 1 月倒排日历，而不是从你偏好的考试日顺排。',
          },
        ],
      },
      {
        id: 'the-crunch',
        h2: '1-4 月挤压，逐段拆解',
        intro:
          'CSC 时间不弹性，所以考试日历只有一种正确形状。从后往前看。',
        blocks: [
          {
            type: 'table',
            caption: '奖学金日历主线（对应 9 月入学）',
            columns: ['时间', '发生什么', '你的动作'],
            rows: [
              ['前一年春夏', '大学开放 9 月入学申请；CSC 通知预览', '若上一场次合适就尽早考 CSCA——存下成绩消除全部排期风险'],
              ['秋季', '大学申请滚动进行；预录取联络', '尽早完成大学申请；渠道有要求时申请预录取函'],
              ['12 月-1 月初', '年内第一场 CSCA（近期规律：1 月场次）', '主考场次——窗口开放首周报名'],
              ['1-2 月', '使馆（双边）截止开始', '携首场成绩提交奖学金材料'],
              ['3 月', '第二场 CSCA（近期规律：3 月场次）', '兜底场次——仅当首场不达标；勉强赶上 4 月截止'],
              ['4 月', '大学渠道 CSC 截止扎堆', '全部材料齐备：成绩已附、预录取函到位、推荐信完成'],
              ['5-6 月', '结果；大学Placement确认', '接受、办签证（CSC 为 JW201）、准备抵达'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**两场现实**——第一场是计划，第二场是保险；第三场落在 4 月之后，只服务于下一周期或自费申请',
              '**无论如何早报名**——1 月场次的境外考位是整个奖学金日历里最稀缺的资源',
              '**存分策略**——能在截止前 6 个月以上的场次考试的考生，直接消除挤压；这是可用的最高价值排期决策',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '确切场次日期逐周期在官方门户公布——上表反映近期规律，不是保证。你的周期公告一出现，立即重新核验日历。',
          },
        ],
      },
      {
        id: 'channel-differences',
        h2: '改变你 CSCA 计划的渠道差异',
        intro:
          '两条 CSC 渠道共享考试要求，但在截止形状、预录取预期与谁先读你的材料上不同。',
        blocks: [
          {
            type: 'table',
            caption: '双边 vs 中国大学项目：CSCA 考生视角',
            columns: ['维度', '使馆（双边）', '大学（CUP）'],
            rows: [
              ['向谁申请', '中国使馆/本国派遣机关', '目标大学国际学生办公室'],
              ['截止形状', '更早——1 至 3 月', '2 至 4 月，顶尖大学更早'],
              ['谁先读你的材料', '本国遴选委员会', '大学招生/奖学金办公室'],
              ['预录取函', '常有加分；各国渠道规则不同', '常被期待——先向大学提交入学申请'],
              ['CSCA 成绩用法', '国别配额竞争——你的分 vs 同国申请者', '大学项目竞争——你的分 vs 项目池'],
              ['CSCA 规划提示', '截止更早 → 最早场次没有商量余地', '略有余量，但顶尖大学关闸快'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**双渠道并申**——两者不互斥；多数成功考生并行运作使馆与大学申请，一份 CSCA 成绩单服务两边',
              '**配额的双刃性**——在使馆你与同胞竞争；在小配额国家，扎实的 75+ 可能胜过超额国家里的 85。研究你国家的配额历史',
              '**大学先行的顺序**——CUP 渠道先把大学入学申请拿下（许多渠道期待预录取 offer），再经它提交 CSC 材料',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '截止日期各国各校不同——上表是典型形状而非普遍规律。每个周期都重新核验你国家的使馆通知与各校 CSC 页面。',
          },
        ],
      },
      {
        id: 'score-targets',
        h2: '多少 CSCA 分数才让奖学金档案有竞争力？',
        intro:
          '奖学金线高于录取线。算术如下。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**经验法则**——有竞争力的 CSC 分数比该层次录取带高 5-10 分：80+ 层次预期约 85-90，70+ 层次约 75-85',
              '**配额双向作用**——在使馆你与同胞竞争；在小配额国家扎实的 75+ 可能胜过超额国家的 85。查你国家的配额历史',
              '**只看必考科**——评审者读项目要求的科目；对工科名额而言，88 数学/85 物理的画像重于处处 80 的平均',
              '**成绩是门槛不是奖杯**——过筛之后，学习计划质量、推荐信与项目匹配驱动最终排名；90 分加泛泛的学习计划会输给 82 分加精准的学习计划',
              '**自费兜底**——若重算术失败、分数低于奖学金线，同一份成绩单仍驱动自费申请；下周期再战 CSC 是计划，不是失败',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'CSC 目标设定：用分数指南的方法（调研、清单最大值 + 10），再加 5-10 分的奖学金溢价。对多数顶尖 CSC 目标，意味着走进 1 月场次时必考科瞄准 85-90。',
          },
        ],
      },
      {
        id: 'file-checklist',
        h2: 'CSC + CSCA 材料清单',
        intro:
          '奖学金筛选由完整性驱动。下面每一项都是清单行，每一行都是材料死掉的地方。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**CSCA 成绩单**——从门户下载，附到奖学金申请与大学申请两处；保留原始 PDF',
              '**大学录取或预录取**——按渠道预期；尽早点申大学，让 offer/预录取函在 CSC 截止前到位',
              '**学习计划**——针对项目、500-1,500 字；成绩让你过筛，它让你赢得排名',
              '**推荐信**——1-2 位学术推荐人提早打招呼，让他们能在 1-4 月前写完',
              '**体检表**——标准《外国人体格检查表》，在授权医院、有效期内完成',
              '**护照 + 文件**——有效期远超入学时间；成绩单与证书按需附认证翻译',
              '**渠道专属表格**——使馆的派遣表格或官方 CSC 门户的大学申请号，按你渠道的说明',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '每个渠道发布自己的材料清单——上面是公共主线，不能替代你使馆或大学的官方清单。每个周期都与官方清单逐行对账。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'CSC 奖学金申请者必须考 CSCA 吗？',
        a: '是——自 2026 级起，本科层次 CSC 申请者必须参加 CSCA 并经两条主渠道（使馆/双边与大学/中国大学项目）提交成绩。缺成绩单的奖学金材料不完整、不入围。',
      },
      {
        q: 'CSC 申请者应参加哪场 CSCA？',
        a: '年内最早的一场——近期规律为 1 月场次。CSC 截止集中在 1-4 月，所以第一场是主考，第二场（常为 3 月）是唯一现实的兜底；第三场落在截止之后。',
      },
      {
        q: 'CSC 奖学金需要多少 CSCA 分？',
        a: '有竞争力的奖学金分数通常比目标层次录取带高 5-10 分——顶尖野心约 85-90，强中游项目约 75-85。使馆渠道按国别配额竞争，请研究你国家的配额历史与切线行为。',
      },
      {
        q: '申请晚了、没有 CSCA 成绩还能拿 CSC 吗？',
        a: '没有公布的豁免通道——缺成绩的材料在筛选即不完整。若你周期的场次已过，现实选项是：用既有成绩走自费申请（如有），或规划 CSCA 场次进入下一周期。',
      },
      {
        q: '该走使馆还是大学渠道？',
        a: '两条都走，并行——这是读同一份 CSCA 成绩单的两个独立竞争。使馆渠道截止更早、按国别配额竞争；大学渠道截止更晚、按项目池竞争。并行让命中率最大化。',
      },
      {
        q: '英文授课的 CSC 名额也要 CSCA 吗？',
        a: '要——强制令不限于中文授课项目。英文授课奖学金申请者按其项目的科目组合提交同一份成绩单，语言上另附雅思/托福。',
      },
      {
        q: '错过 CSC 截止，CSCA 成绩就浪费了吗？',
        a: '没有——同一份成绩单立即驱动自费大学申请，也是下周期 CSC 尝试的学术信号（各校如有时效偏好会写明）。错过截止损失的是奖学金周期，不是成绩。',
      },
    ],
    howToSteps: [
      {
        name: '先钉死日历主线，再做其他一切',
        text: '写下三个日期：你周期内第一场 CSCA（窗口开放首周报名）、你使馆的截止、各大学的 CSC 截止。计划中的一切都对着这三个日期排序。',
      },
      {
        name: '选定渠道并核对其清单',
        text: '使馆与大学渠道并行运作。拉取各自的官方材料清单，与公共主线对账——渠道专属表格是缺件材料的源头。',
      },
      {
        name: '定一个奖学金级别的分数目标',
        text: '用分数指南的方法再加 5-10 分奖学金溢价。顶尖野心：走进 1 月场次时必考科瞄准 85-90。',
      },
      {
        name: '尽可能早地存下一份成绩',
        text: '若有场次落在截止前 6 个月以上，去考——存下的成绩把挤压变成正常的申请季，年内其余场次全是纯上行。',
      },
      {
        name: '备考考试的同时并行备料',
        text: '学习计划、打好招呼的推荐人、体检表、认证翻译——这些各有前置时间，没有一件能拖到最后一周。作为 CSCA 备考的并行轨运行。',
      },
      {
        name: '执行两场保险计划',
        text: '第一场为主考。分数不达标就立即报名第二场、只重考弱科。第二场也不足，把材料转向自费申请，下周期再战 CSC。',
      },
    ],
    ctaTitle: '正在冲刺 CSC 奖学金？',
    ctaSubtitle:
      'SICA 顾问规划双渠道策略、设定奖学金级分数目标，让考试、大学与奖学金三本日历互不相撞。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/chinese-government-scholarship-csc',
        label: '中国政府奖学金（CSC）完整指南',
        description: '覆盖、类别、渠道与完整申请流程。',
      },
      {
        href: '/csca-exam-dates',
        label: 'CSCA 考试时间与报名窗口',
        description: '1-4 月挤压背后的场次格子。',
      },
      {
        href: '/csca-scores-and-cutoffs',
        label: 'CSCA 分数与大学划线',
        description: '目标设定方法，叠加奖学金溢价。',
      },
    ],
  },
};

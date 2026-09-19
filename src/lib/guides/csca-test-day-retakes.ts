import type { LocalizedGuide } from './types';

/**
 * "CSCA test day & retake policy" — Batch 4, article #18 of the
 * 20-article CSCA cluster (docs/csca-content-plan.md).
 * Target queries: "csca test day", "csca retake", "csca resit",
 * "csca what to bring".
 *
 * Static content. Test-day rules from launch-period notices
 * (passport + printed ticket, no calculators/electronics, MCQ
 * answer sheets); retake mechanics from the 5-session baseline —
 * attempt limits framed as "none published".
 */
export const cscaTestDayGuide: LocalizedGuide = {
  en: {
    slug: 'csca-test-day-retakes',
    eyebrow: 'GUIDE · CSCA TEST DAY',
    title: 'CSCA Test Day & Retakes — What to Bring, Answer-Sheet Discipline, and the Resit Playbook',
    description:
      'The complete CSCA test-day kit: what to bring, what stays outside, answer-sheet rules that protect your score, and the retake playbook — resit mechanics, session math, and how universities read your second report.',
    subtitle:
      'Test day is where months of preparation either converts to points or leaks away on logistics: the wrong passport, a screen-only admission ticket, a mis-bubbled subject code. The rules follow the standard Chinese national-exam playbook — strict ID checks, no electronics, multiple-choice answer sheets only — and the retake system is forgiving in theory (5 sessions a year, no published attempt limit) but unforgiving in calendar terms. This guide covers the kit, the answer-sheet discipline that protects every point you earned, what happens after the exam, and the resit playbook for a second attempt.',
    stats: [
      { value: '30–45 min', label: 'Arrive before reporting time' },
      { value: '2 + 1', label: 'Passport + printed ticket + pencils' },
      { value: '0', label: 'Electronics in the room' },
      { value: '5×/year', label: 'Retake opportunities' },
    ],
    quickAnswer:
      'Bring to the CSCA: your original passport (the exact one used at registration), the printed admission ticket, and pencils/eraser as instructed on the ticket. Phones, smartwatches, calculators (banned in all subjects), notes, and dictionaries stay outside the exam room. Each subject runs about 60 minutes of multiple choice on a bubble-sheet; double-check the subject code before bubbling, because a mis-bubbled code cannot be corrected after submission. Results release via the registration portal per session, and you download and submit the report to universities yourself. If your score disappoints, you can resit: the exam runs 5 sessions a year with no published attempt limit, you may re-register for only your weak subjects, and universities read the report you choose to submit — the binding constraint is calendar, since the retake must land before your still-open application deadlines.',
    keyTakeaways: [
      'Kit: original passport (registration-exact), PRINTED admission ticket, pencils/eraser — arrive 30–45 minutes early',
      'Banned in the room: phones, smartwatches, calculators (all subjects), notes, dictionaries',
      'Answer-sheet discipline: verify the subject code, bubble fully, batch your bubbling every 8–10 questions',
      'Multiple subjects may share one exam day — your personal timetable is on the admission ticket',
      'Results release per session on the portal; you download and forward the report to universities yourself',
      'Retakes: 5 sessions/year, no published attempt limit, weak subjects only — the calendar, not the rules, is the constraint',
    ],
    sections: [
      {
        id: 'the-kit',
        h2: 'The test-day kit — bring exactly this',
        intro:
          'Three items get you into the room. Every deviation from this list is a known failure story.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Original passport** — the exact document used at registration, physically present, undamaged, and unexpired; photocopies and phone photos do not pass check-in',
              '**Printed admission ticket** — downloaded from the portal shortly before the test and printed on paper; screens-only tickets are refused at some desks. Verify every field when you print it: name, passport number, center address, subject list, reporting time',
              '**Pencils + eraser** — as instructed on your ticket (answer sheets are machine-read); bring spares — a dropped-and-broken pencil mid-paper is a preventable crisis',
              '**Water/snack for breaks (if allowed)** — check the ticket and center rules; food and drink typically stay out of the exam room itself',
              '**Route plan + margin** — know the center location, transport, and arrive 30–45 minutes before the reporting time; late arrival rules are strict and unappealable',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The most common denial story: a renewed passport between registration and test day so the ticket no longer matches the document in hand. If your passport renews, contact portal support BEFORE test day to re-issue the ticket against the current document.',
          },
        ],
      },
      {
        id: 'banned-items',
        h2: 'What stays outside the room',
        intro:
          'The banned list is short and absolute. Chinese national-exam rules do not negotiate.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Calculators — all subjects** — including Mathematics, Physics, and Chemistry; the papers are engineered for clean numbers, and invigilators enforce this without exceptions',
              '**Phones and smartwatches** — not merely face-down: they do not come into the room at all; leave them with a companion or per the center\'s storage instructions',
              '**Notes, books, dictionaries** — including paper dictionaries; the exam assumes no lookup aids of any kind',
              '**Smart rings/bands and headphones** — anything with connectivity or storage follows the electronics rule',
              '**Your own scratch paper** — rough work goes in the designated areas of the question booklet or on sheets the center provides',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The spirit of the rule: nothing that stores, transmits, or looks anything up. When in doubt about an item (medical devices, jewelry), ask the center in advance — a pre-test email beats a gate argument.',
          },
        ],
      },
      {
        id: 'answer-sheet',
        h2: 'Answer-sheet discipline — protecting points you already earned',
        intro:
          'All CSCA subjects are machine-read bubble sheets. The sheet has its own failure modes, and none of them are recoverable after submission.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Verify the subject code first** — before answering anything, check the sheet\'s subject/section code matches the paper in front of you; sessions with multiple subjects per day make mix-ups possible, and mis-bubbled codes cannot be corrected afterward',
              '**Bubble fully and darkly** — machine-read sheets need complete fills; half-filled bubbles are the classic "I knew it but scored it wrong" loss',
              '**One row at a time** — check that question 23\'s answer sits on row 23 every time you skip and return; skipped-question misalignment cascades silently',
              '**Batch your bubbling** — fill answers every 8–10 questions rather than one-by-one (slow) or only at the end (risky: time can expire before you bubble at all)',
              '**Erases must be clean** — changed answers need fully erased old marks; ghost marks machine-read as double answers',
              '**Final pass: coverage check** — with minutes left, verify every question row has a bubble; an unattempted row scores the same as a wrong one, so never leave blanks',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Answer-sheet errors are the only way a well-prepared candidate scores catastrophically low. The discipline above costs perhaps 3 minutes per paper and protects the entire prep investment.',
          },
        ],
      },
      {
        id: 'during-the-day',
        h2: 'During the day — timing, breaks, multi-subject days',
        intro:
          'Your admission ticket carries your personal timetable. Multiple subjects may share one day.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Per-subject duration ~60 minutes** — with reporting, check-in, and transitions, a multi-subject day is a full-day commitment; plan food and rest around the ticket\'s schedule',
              '**Personal timetable on the ticket** — subject order and times are per candidate; do not assume your friend\'s schedule matches yours',
              '**Per-paper resets** — each subject gets fresh answer-sheet checks; treat every paper as its own exam with its own three-pass pacing (see the subject guides)',
              '**Energy management** — a 3–4 subject day is a mental marathon: the third paper\'s clock discipline decays if you skipped food and water at breaks',
              '**When something goes wrong** — raise your hand immediately: wrong paper version, missing pages, timing disputes — invigilators resolve issues in-room, not afterward',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Simulate this in your mocks: full subject sets back-to-back under exam rules. The fatigue profile of question 40 on your third paper is untrainable any other way.',
          },
        ],
      },
      {
        id: 'after-the-exam',
        h2: 'After the exam — results and the report',
        intro:
          'The exam\'s end is the report\'s supply chain. Three steps, all candidate-driven.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Results per session on the portal** — release windows are announced when sessions open; log in and download as soon as yours is available',
              '**Download the report immediately** — keep the PDF in your application folder; this is the artifact every university and scholarship file will use',
              '**Submit it yourself** — attach the report to each university application; there is no automatic transmission to universities at launch',
              '**Check the report\'s fields** — name, passport number, and per-subject scores; discrepancies go to portal support immediately with your registration records',
              '**Update your application tracker** — every school that now has your score moves to "submitted"; every deadline still open gets the report before it closes',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'A good score that never gets attached to an application is functionally a bad score. The scores guide\'s attachment checklist exists precisely for this step — use it.',
          },
        ],
      },
      {
        id: 'retake-playbook',
        h2: 'The retake playbook',
        intro:
          'Five sessions a year and no published attempt limit make retaking routine. The playbook is about doing it surgically.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**No published attempt limit** — the rules do not cap attempts; the calendar does all the limiting that matters',
              '**Resit weak subjects only** — re-registration lets you sit just the subjects you want to replace; strong subjects keep their scores',
              '**Universities read what you submit** — a cleaner second report replaces the weak one for every deadline still open; old reports don\'t haunt you unless you send them',
              '**Diagnose before re-booking** — classify your misses (knowledge / arithmetic / misread / timing) from your mock and real-paper error logs; a timing-dominated miss needs clock drills, not another content pass',
              '**The session math** — the retake must land before your earliest still-open deadline; with sessions ~2–3 months apart, that usually allows exactly one resit per application cycle',
              '**CSC applicants: near-zero margin** — the January–April scholarship window leaves at most one fallback sitting (see the CSC guide); plan primary attempts even more conservatively',
              '**When retakes stop paying** — two attempts in the same score band means the constraint is method, not knowledge; fix the method before buying attempt three',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The retake decision rule: register the next session on results day if (a) the gap to target is ≤10 points, (b) at least one subject dominates the miss log, and (c) a session lands before your deadlines. All three or skip.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What should I bring to the CSCA exam?',
        a: 'Your original passport (the exact document used at registration), the printed admission ticket, and pencils plus eraser as instructed on the ticket. Arrive 30–45 minutes before the reporting time. Everything else — phones, bags, notes — follows the center\'s storage rules and stays out of the exam room.',
      },
      {
        q: 'Can I use a calculator on the CSCA?',
        a: 'No — calculators are banned in every subject, including Mathematics, Physics, and Chemistry. Papers are engineered for clean numbers and mental arithmetic; prep should include no-calculator drills from the start.',
      },
      {
        q: 'Can I bring my phone into the exam room?',
        a: 'No — phones and smartwatches do not enter the room at all, not even switched off or face-down. Leave them per the center\'s instructions or with a companion.',
      },
      {
        q: 'What happens if I bubble the wrong subject code on the answer sheet?',
        a: 'A mis-bubbled subject code cannot be corrected after submission — the sheet may read as a different subject or an invalid paper. Check the code against your paper before answering anything, especially on multi-subject days.',
      },
      {
        q: 'How many times can I retake the CSCA?',
        a: 'There is no published attempt limit — the exam runs 5 sessions a year and you may resit in later sessions, typically only your weak subjects. The real constraint is calendar: your retake must land before your still-open application deadlines.',
      },
      {
        q: 'Do universities see all my CSCA attempts?',
        a: 'No — universities evaluate the score report you choose to submit. A cleaner retake report replaces an earlier weak one for any application deadline still open; earlier reports don\'t follow you unless you send them.',
      },
      {
        q: 'Is it worth retaking if I\'m 5 points below my target?',
        a: 'Usually yes, if the decision rule passes: gap ≤10 points, at least one subject dominates your miss log, and a session lands before your deadlines. Below that gap, your report is already competitive — spend the calendar on applications instead.',
      },
      {
        q: 'When do CSCA results come out?',
        a: 'Per session, through the official registration portal — the release window is announced when each session opens. Download the report as soon as it is available and attach it to your applications yourself; universities do not receive scores automatically.',
      },
    ],
    howToSteps: [
      {
        name: 'Print and verify the admission ticket the day it drops',
        text: 'When the portal issues tickets, print immediately and check every field against your passport: name, number, center, subjects, reporting time. Errors found now are fixable; errors found at the door are not.',
      },
      {
        name: 'Assemble the kit the night before',
        text: 'Original passport, printed ticket, two pencils, eraser, route plan with 30–45 minutes of margin. Pack everything in one place — morning-of assembly is where passports get left behind.',
      },
      {
        name: 'Execute answer-sheet discipline in every paper',
        text: 'Subject code first, full bubbles, one-row checks after every skip, batched bubbling every 8–10 questions, clean erases, and a final coverage pass. Three minutes per paper that protect the whole investment.',
      },
      {
        name: 'Manage the multi-subject day',
        text: 'Eat and hydrate at breaks; reset your pacing per paper; treat paper three\'s clock with the same respect as paper one. Simulate this exact profile in your mocks beforehand.',
      },
      {
        name: 'Download the report the day it releases',
        text: 'Log into the portal when results open, verify the fields, and file the PDF with your application records. Then run the attachment checklist across every open application.',
      },
      {
        name: 'Apply the retake decision rule on results day',
        text: 'Gap ≤10 points + one dominant weak subject + a session before your deadlines = register immediately and resit only the weak subjects. Miss any condition, and your calendar is better spent on applications.',
      },
    ],
    ctaTitle: 'Want a second pair of eyes on your test-day plan?',
    ctaSubtitle:
      'SICA counselors run pre-test logistics checks, plan your session-and-retake lattice against application deadlines, and manage score delivery to every university on your list. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/csca-exam-registration',
        label: 'How to register for the CSCA',
        description: 'The portal walkthrough that produces the ticket you\'ll bring on test day.',
      },
      {
        href: '/csca-exam-dates',
        label: 'CSCA exam dates & registration windows',
        description: 'The session lattice your retake decision depends on.',
      },
      {
        href: '/csca-scores-and-cutoffs',
        label: 'CSCA scores & university cutoffs',
        description: 'What your report needs to achieve and how to submit it.',
      },
    ],
  },
  zh: {
    slug: 'csca-test-day-retakes',
    eyebrow: '指南 · CSCA 考试日',
    title: 'CSCA 考试日与重考——携带清单、答题卡纪律与重考打法',
    description:
      '完整的 CSCA 考试日装备：带什么、禁什么、保护分数的答题卡规则，以及重考打法——重考机制、场次算术与大学如何读你的第二份成绩单。',
    subtitle:
      '考试日是数月备考兑换成分数、或因后勤漏光的地方：错的护照、只存屏幕的准考证、涂错的科目代码。规则遵循中国国家级考试的标准打法——严格核验身份证件、禁电子设备、仅选择题答题卡；重考系统理论上宽容（一年 5 场、无公布的次数上限）但日历上毫不留情。本指南覆盖装备清单、保护你已赚到每一分的答题卡纪律、考试后发生什么，以及第二次尝试的重考打法。',
    stats: [
      { value: '30-45 分钟', label: '提早于报到时间到场' },
      { value: '2 + 1', label: '护照 + 纸质准考证 + 铅笔' },
      { value: '0', label: '件电子设备入场' },
      { value: '5 次/年', label: '重考机会' },
    ],
    quickAnswer:
      'CSCA 携带：报名所用护照原件（逐字同一本）、打印的准考证、按准考证要求的铅笔与橡皮。手机、智能手表、计算器（全科禁用）、笔记与词典不得进入考场。每科约 60 分钟选择题、机读答题卡；涂卡前核对科目代码，涂错提交后无法更正。成绩按场次经报名门户发布，由你下载并自行提交给大学。分数不理想可以重考：一年 5 场、无公布的次数上限、可只重考弱科，大学以你选择提交的成绩单为准——真正的约束是日历，因为重考必须落在你仍开放的申请截止之前。',
    keyTakeaways: [
      '装备：护照原件（与报名逐字一致）、打印的准考证、铅笔与橡皮——提早 30-45 分钟到场',
      '考场禁带：手机、智能手表、计算器（全科）、笔记、词典',
      '答题卡纪律：核对科目代码、涂满、每 8-10 题批量涂卡',
      '多科可能同日进行——你的个人时间表在准考证上',
      '成绩按场次在门户发布；由你下载并把报告交给大学',
      '重考：一年 5 场、无公布次数上限、只重考弱科——约束是日历不是规则',
    ],
    sections: [
      {
        id: 'the-kit',
        h2: '考试日装备——精确带这些',
        intro:
          '三样东西让你入场。对这个清单的每一次偏离都有已知的事故故事。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**护照原件**——报名所用同一本、实体在场、无破损、未过期；复印件与手机照片过不了检录',
              '**打印的准考证**——考前从门户下载并打印纸质版；仅凭屏幕在一些检录台会被拒。打印时逐项核对：姓名、护照号、考点地址、科目清单、报到时间',
              '**铅笔 + 橡皮**——按准考证要求（答题卡机读）；带备用——考中笔断是可预防的危机',
              '**休息时段的水/食物（如允许）**——查准考证与考点规则；食品饮品通常不得进入考场本身',
              '**路线规划 + 余量**——熟悉考点位置与交通，提早 30-45 分钟到达报到；迟到规则严格且无申诉',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '最常见的被拒故事：报名与考试之间护照到期换发，准考证与手中证件不再匹配。若护照换发，考前联系门户支持按现证件重出准考证。',
          },
        ],
      },
      {
        id: 'banned-items',
        h2: '什么留在场外',
        intro:
          '禁带清单很短且绝对。中国国家级考试规则不容商量。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**计算器——全科**——含数学、物理、化学；试卷按整洁数字设计，监考执行无例外',
              '**手机与智能手表**——不只是屏幕朝下：它们完全不进考场；交给同伴或按考点存储说明处理',
              '**笔记、书籍、词典**——含纸质词典；考试默认没有任何查询辅助',
              '**智能戒指/手环与耳机**——任何带连接或存储功能的物品都按电子设备规则处理',
              '**自带的草稿纸**——演算写在题本的指定区域或考点提供的纸上',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '规则精神：任何存储、传输或查询的东西都不行。对某件物品有疑问（医疗设备、饰品），提前问考点——考前一封邮件胜过大门口的争执。',
          },
        ],
      },
      {
        id: 'answer-sheet',
        h2: '答题卡纪律——保护你已赚到的分',
        intro:
          'CSCA 各科都是机读答题卡。答题卡有自己的故障模式，且提交后无一可逆。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**先核对科目代码**——答题前，核对答题卡的科目/部分代码与面前的试卷一致；一日多科的场次让混涂成为可能，涂错提交后无法更正',
              '**涂满涂黑**——机读卡需要完整填充；半涂的选项是经典的「我会做但分不对」损失',
              '**逐行对位**——每次跳题返回时核对第 23 题的答案仍在第 23 行；跳题错位会静默级联',
              '**批量涂卡**——每 8-10 题涂一次，不逐题涂（慢）也不留到最后（危险：时间可能在涂卡前耗尽）',
              '**擦除必须干净**——改答案要把旧标记擦净；残影会被机读成多选',
              '**末轮覆盖检查**——剩余几分钟时核对每题行都有涂卡；空题与错题同分，所以绝不留空',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '答题卡错误是准备充分的考生灾难性低分的唯一途径。上述纪律每卷约花 3 分钟，保护的是整个备考投入。',
          },
        ],
      },
      {
        id: 'during-the-day',
        h2: '考试当天——计时、休息与多科日',
        intro:
          '准考证上有你的个人时间表。多科可能同日进行。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**单科约 60 分钟**——加上报到、检录与转场，多科日是全天承诺；按准考证时间表安排饮食与休息',
              '**准考证即个人时间表**——科目顺序与时间逐人不同；不要假设你朋友的场次安排与你一致',
              '**逐卷重置**——每科都有全新的答题卡核对；把每张卷当作独立考试、各自跑三轮节奏（见科目指南）',
              '**能量管理**——3-4 科的一天是精神马拉松：休息时没吃没喝，第三张卷的计时纪律就会衰减',
              '**出问题立即举手**——卷子版本不对、缺页、计时争议——监考当场解决问题，事后不解决',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '在模考中模拟这一点：全科目套卷按考试规则连续考完。第三张卷第 40 题的疲劳曲线没有别的训练方式。',
          },
        ],
      },
      {
        id: 'after-the-exam',
        h2: '考试之后——成绩与成绩单',
        intro:
          '考试结束就是成绩单供应链的开始。三步，全部由考生驱动。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**成绩按场次上门户**——发布窗口随场次开放公告；可下载当天立即登录下载',
              '**立即下载成绩单**——把 PDF 存进申请文件夹；这是每所大学与奖学金材料要用的物件',
              '**由你提交**——把报告附到每份大学申请；启动时没有向大学的自动传送',
              '**核对报告字段**——姓名、护照号、各科分数；出入立即携报名记录联系门户支持',
              '**更新申请追踪表**——已收到你分数的每所学校标记「已提交」；每个仍开放的截止日在关闸前拿到报告',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '从未被附进申请的好成绩，功能上就是坏成绩。分数指南的附带清单正是为这一步准备的——用它。',
          },
        ],
      },
      {
        id: 'retake-playbook',
        h2: '重考打法',
        intro:
          '一年五场且无公布次数上限让重考成为常规操作。打法核心是外科手术式地做。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**无公布次数上限**——规则不封顶尝试次数；真正做限制的是日历',
              '**只重考弱科**——重新报名时可以只坐你想替换的科目；强科成绩保留',
              '**大学读你提交的那份**——更干净的第二份报告为每个仍开放的截止日替换弱分；旧报告不送就不会跟着你',
              '**订位前先诊断**——用模考与真实试卷的错误日志把失分分类（知识/算术/读题/计时）；计时主导的失分需要练钟，不是再过一遍内容',
              '**场次算术**——重考必须落在你最早仍开放的截止前；场次间隔约 2-3 个月，每个申请周期通常只允许一次重考',
              '**CSC 申请者：余量近乎为零**——1-4 月奖学金窗口至多留一次兜底（见 CSC 指南）；主考更要保守规划',
              '**重考何时不再划算**——两次尝试落在同一分数带，说明约束是方法不是知识；订第三场之前先换方法',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '重考决策规则：出分当天，若 (a) 与目标差距 ≤10 分、(b) 至少一门弱科主导失分日志、(c) 有场次落在截止前——立即报名、只重考弱科。三条不全，跳过。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'CSCA 考试要带什么？',
        a: '报名所用护照原件、打印的准考证、按准考证要求的铅笔与橡皮。提早 30-45 分钟到达报到。其他一切——手机、包、笔记——按考点存储规则处理，不得进入考场。',
      },
      {
        q: 'CSCA 可以用计算器吗？',
        a: '不能——包括数学、物理、化学在内全科禁用。试卷按整洁数字与心算设计；备考应从一开始就含无计算器训练。',
      },
      {
        q: '手机能带进考场吗？',
        a: '不能——手机与智能手表完全不进考场，关机或屏幕朝下也不行。按考点说明存放或交给同伴。',
      },
      {
        q: '答题卡科目代码涂错了怎么办？',
        a: '涂错的科目代码提交后无法更正——答题卡可能被读成另一科目或无效卷。答题前先核对代码与试卷一致，尤其在多科日。',
      },
      {
        q: 'CSCA 可以重考几次？',
        a: '没有公布的次数上限——考试一年 5 场，可在后续场次重考、通常只考弱科。真正的约束是日历：重考必须落在你仍开放的申请截止之前。',
      },
      {
        q: '大学看得到我所有 CSCA 尝试吗？',
        a: '看不到——大学评估你选择提交的成绩单。更干净的重考报告可为任何仍开放的申请截止替换早先的弱分；旧报告不送就不会跟着你。',
      },
      {
        q: '离目标差 5 分，值得重考吗？',
        a: '通常值得，只要决策规则通过：差距 ≤10 分、至少一门弱科主导失分日志、且有场次落在截止前。差距更小时，你的报告已具竞争力——把日历花在申请上。',
      },
      {
        q: 'CSCA 成绩什么时候出？',
        a: '按场次经官方报名门户发布——发布窗口随每场开放公告。成绩一可下载就下载，并自行附到申请中；大学不会自动收到分数。',
      },
    ],
    howToSteps: [
      {
        name: '准考证发布当天打印并核对',
        text: '门户发放准考证后立即打印，逐项对照护照：姓名、号码、考点、科目、报到时间。现在发现的错误可修；门口发现的不能。',
      },
      {
        name: '前一晚装好装备',
        text: '护照原件、打印准考证、两支铅笔、橡皮、含 30-45 分钟余量的路线规划。全部装进同一个地方——当天早上现装就是护照被落下的方式。',
      },
      {
        name: '每张卷执行答题卡纪律',
        text: '先科目代码、涂满、每次跳题后逐行核对、每 8-10 题批量涂卡、擦净改痕、末轮覆盖检查。每卷约 3 分钟，保护全部投入。',
      },
      {
        name: '管理多科日',
        text: '休息时吃喝；逐卷重置节奏；第三张卷的时钟与第一张同等尊重。此前在模考中完整模拟这个强度。',
      },
      {
        name: '成绩发布当天下载',
        text: '门户开放结果时登录、核对字段、把 PDF 归档进申请记录。然后对着每个开放申请跑附带清单。',
      },
      {
        name: '出分当天执行重考决策规则',
        text: '差距 ≤10 分 + 一门主导弱科 + 截止前有场次 = 立即报名、只重考弱科。任一条件不满足，日历更适合花在申请上。',
      },
    ],
    ctaTitle: '需要第二双眼睛检查你的考试日计划？',
    ctaSubtitle:
      'SICA 顾问做考前后勤检查、把场次与重考格子排进申请截止，并管理成绩向清单上每所大学的送达。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/csca-exam-registration',
        label: 'CSCA 报名流程详解',
        description: '产出你要带进考场的准考证的门户 walkthrough。',
      },
      {
        href: '/csca-exam-dates',
        label: 'CSCA 考试时间与报名窗口',
        description: '重考决策依赖的场次格子。',
      },
      {
        href: '/csca-scores-and-cutoffs',
        label: 'CSCA 分数与大学划线',
        description: '你的成绩单需要达到什么、以及如何提交。',
      },
    ],
  },
};

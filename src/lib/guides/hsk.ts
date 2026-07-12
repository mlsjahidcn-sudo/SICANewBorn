import type { LocalizedGuide } from './types';

/**
 * "HSK Chinese language test prep for international students in China" —
 * process guide. Target queries: "hsk test prep", "hsk 4", "hsk 5", "hsk 6",
 * "hsk exam dates", "chinese proficiency test international student",
 * "hsk scholarship requirement", "how to pass hsk", "hsk study plan",
 * "chinese language test for china university".
 *
 * The HSK (Hanyu Shuiping Kaoshi 汉语水平考试) is the standardized Chinese
 * proficiency test required by almost every Chinese-taught degree program
 * and most CSC scholarship applications. The 2021 revision (HSK 3.0) added
 * the 7-9 levels for advanced learners and the HSKK oral test. This guide
 * walks through the 6 levels that matter for international students (HSK
 * 1-6), the exam format, the score requirements by program type, study
 * plans for each level, and the 10 best free + paid prep resources.
 */
export const hskGuide: LocalizedGuide = {
  en: {
    slug: 'hsk',
    eyebrow: 'GUIDE · CHINESE LANGUAGE',
    title: 'HSK Chinese Language Test Prep for International Students in China (2026)',
    description:
      "The Hanyu Shuiping Kaoshi (HSK) is the standardized Chinese proficiency test for Chinese-taught programs. Exam format, score requirements, study plans for HSK 1-6, and 10 best free + paid prep resources.",
    subtitle:
      "If you're applying to a Chinese-taught program, you need an HSK score. If you're applying for the CSC scholarship, you need HSK 4 or 5. This guide tells you exactly which level you need, how to get there, and what the test actually feels like.",
    stats: [
      { value: 'HSK 4+', label: 'CSC scholarship minimum' },
      { value: 'HSK 5+', label: 'Top university degree minimum' },
      { value: '~120h', label: 'Study time per HSK level' },
      { value: '$15-50', label: 'HSK exam fee (varies by country)' },
    ],
    quickAnswer:
      "The HSK (Hanyu Shuiping Kaoshi 汉语水平考试) is China's standardized Chinese proficiency test, required by most Chinese-taught programs and CSC scholarship applications. There are 6 levels that matter for international students (HSK 1-6, with 7-9 added in 2021 for advanced learners). HSK 4 (vocabulary ~1,200 words) is the CSC scholarship minimum; HSK 5 (~2,500 words) is the typical minimum for top-university degree programs; HSK 6 (~5,000+ words) is for advanced research and most competitive programs. The test is paper-based or computer-based, 2 hours for HSK 4-6 (listening + reading + writing), scored out of 300 (pass = 180 for HSK 4-5, 240 for HSK 6). Study time per level: 80-150 hours. Exam fee: $15-50 depending on country. Best prep resources: HSK Standard Course textbooks (official), HelloChinese app (free for HSK 1-3), ChineseSkill, Anki flashcards, iTalki for tutoring, and the official HSK online mock tests.",
    keyTakeaways: [
      "HSK 1-3 are beginner levels; HSK 4 is the practical minimum for most degree programs",
      "HSK 4 = 1,200 words; HSK 5 = 2,500 words; HSK 6 = 5,000+ words",
      "CSC scholarship requires HSK 4+ (some categories 3+); most top unis want HSK 5+",
      "Test format: listening (35 min) + reading (60 min) + writing (45 min, HSK 4-6 only)",
      "Score: 300 total, pass = 180 for HSK 4-5, 240 for HSK 6; valid 2 years",
      "Study time: 80-150 hours per HSK level depending on your native language",
      "Best free resources: official HSK Standard Course textbooks, HelloChinese app, YouTube channels like Mandarin Corner",
      "Best paid resources: iTalki tutoring ($10-30/hour), Anki decks, HSK mock test bundles ($20-50)",
    ],
    sections: [
      {
        id: 'what-is-hsk',
        h2: 'What is the HSK and why does it matter?',
        intro:
          "The HSK (Hanyu Shuiping Kaoshi 汉语水平考试) is China's official Chinese proficiency test for non-native speakers, run by the Chinese Ministry of Education through Hanban/Confucius Institute Headquarters. Every Chinese university requires an HSK score for admission to a Chinese-taught program, and most CSC scholarship applications have a minimum HSK level.",
        blocks: [
          {
            type: 'h3',
            text: 'The 6 levels that matter for international students',
            body:
              "HSK 1: 150 words, basic phrases. Suitable for short-term language programs. HSK 2: 300 words, simple conversations. HSK 3: 600 words, daily life topics. HSK 4: 1,200 words, can read simple articles and converse on familiar topics. HSK 5: 2,500 words, can read newspapers and discuss academic topics. HSK 6: 5,000+ words, near-native proficiency for academic and professional contexts. Levels 7-9 (added 2021) are for advanced learners, mostly relevant for Chinese teachers and researchers.",
          },
          {
            type: 'h3',
            text: 'What each level lets you do',
            body:
              "HSK 1-2: basic survival Chinese, ordering food, asking directions. HSK 3: travel in China independently, hold basic conversations. HSK 4: attend Chinese-taught lectures with preparation, write simple essays. HSK 5: attend Chinese-taught degree programs (most common requirement), pass most CSC scholarship interviews. HSK 6: attend top Chinese-taught programs, work in Chinese-language professional environments, study for advanced degrees in Chinese.",
          },
          {
            type: 'h3',
            text: 'The HSKK oral test (often required too)',
            body:
              "The HSKK (HSK Speaking Test) is a separate oral proficiency test, often required alongside HSK 4-6 for degree programs. Three levels: HSKK Beginner (HSK 1-2), HSKK Intermediate (HSK 3-4), HSKK Advanced (HSK 5-6). The test is 20-25 minutes, recorded, scored out of 100. Most international students take HSKK Intermediate or Advanced. The exam is the same cost as the HSK and is offered at the same test centers.",
          },
        ],
      },
      {
        id: 'exam-format',
        h2: 'Exam format: what the test actually looks like',
        intro:
          "The HSK 1-3 tests listening + reading. HSK 4-6 tests listening + reading + writing. The HSKK tests speaking. The test is paper-based at most international centers and computer-based at mainland China centers. Computer-based results come back in 2 weeks; paper-based in 4-6 weeks.",
        blocks: [
          {
            type: 'table',
            caption: 'HSK 4-6 exam format',
            columns: ['Section', 'Time', 'Questions', 'Score'],
            rows: [
              ['Listening (听力)', '30-35 min', '45 questions (HSK 4) / 50 (HSK 5-6)', '100 points'],
              ['Reading (阅读)', '40-60 min', '40 questions (HSK 4) / 45 (HSK 5-6)', '100 points'],
              ['Writing (书写, HSK 4-6 only)', '40-45 min', '10 questions (HSK 4) / 10 (HSK 5-6)', '100 points'],
              ['Total', '~135 min', '~95 questions', '300 points'],
            ],
          },
          {
            type: 'h3',
            text: 'Section 1: Listening (听力)',
            body:
              "4-5 short dialogues and 3-4 long dialogues/passages. Multiple-choice questions. For HSK 4, questions are at a slower pace. For HSK 5-6, native-speed recordings with background noise, multiple speakers, and longer passages. Tips: preview the questions during the 5-minute intro; focus on numbers, times, and specific nouns; don't get stuck on questions you missed.",
          },
          {
            type: 'h3',
            text: 'Section 2: Reading (阅读)',
            body:
              "Skim for detail. HSK 4: short paragraphs (100-200 chars) with 3-4 multiple-choice questions each. HSK 5: longer paragraphs (300-500 chars) with 4-5 questions, plus fill-in-the-blank sentences. HSK 6: full passages (500-1000 chars) with detailed comprehension questions, plus 5-10 cloze tests (fill in the missing word in a passage). Time pressure is real — practice skimming.",
          },
          {
            type: 'h3',
            text: 'Section 3: Writing (书写)',
            body:
              "Word order rearrangement (rearrange 4-6 given words into a grammatically correct sentence), fill-in-the-blank sentences with the correct word form, and a 80-100 character essay (HSK 4) or 200-300 character essay (HSK 5-6). The essay topic is usually a personal reflection (your favorite hobby, a memorable trip) — pre-write 3-4 templates before the test.",
          },
        ],
      },
      {
        id: 'score-requirements',
        h2: 'Score requirements by program type',
        intro:
          "The HSK score you need depends on the program, the university, and the scholarship. Here's a realistic breakdown by common international student paths.",
        blocks: [
          {
            type: 'table',
            caption: 'HSK score requirements by program type',
            columns: ['Program type', 'HSK minimum', 'HSKK minimum', 'Notes'],
            rows: [
              ['CSC scholarship (bilateral programs)', 'HSK 4 (≥180)', 'Required for HSK 4+', 'Belt and Road countries sometimes accept HSK 3'],
              ['CSC scholarship (university programs)', 'HSK 5 (≥200)', 'Recommended', 'Top unis want 240+'],
              ['CSC scholarship (pre-college / 1+ year)', 'HSK 3 (≥180)', 'Optional', 'Foundation year for Chinese-taught degree'],
              ['Chinese-taught Bachelor (most unis)', 'HSK 4 (≥180)', 'Required', 'HSK 5 preferred for competitive programs'],
              ['Chinese-taught Bachelor (top 20 unis)', 'HSK 5 (≥210)', 'Required', 'Peking, Tsinghua, Fudan, etc. often want 240+'],
              ['Chinese-taught Master (most unis)', 'HSK 5 (≥180)', 'Required', 'HSK 6 preferred for research degrees'],
              ['Chinese-taught PhD', 'HSK 5 (≥200) + interview', 'Required', 'Most unis also require published research'],
              ['English-taught program', 'None (HSK 0)', 'None', 'No HSK required, but HSK 3+ helps daily life'],
              ['Confucius Institute scholarship', 'HSK 2-3 (varies)', 'Optional', 'For 1+ year Chinese language study'],
            ],
          },
          {
            type: 'h3',
            text: 'What the scores mean',
            body:
              "HSK 4: 180 (pass) / 240 (good) / 270+ (excellent). HSK 5: 180 (pass) / 240 (good) / 270+ (excellent). HSK 6: 240 (pass) / 270 (good) / 290+ (excellent). Most universities accept the pass threshold; competitive programs want 210+. For CSC, the application requires the pass threshold but the actual interview success correlates with 240+.",
          },
          {
            type: 'h3',
            text: 'HSK validity',
            body:
              "HSK scores are valid for 2 years from the test date. If you took HSK 5 in 2024 and apply for a 2026 program, you need to retake. Some universities accept older scores for the application but require a recent HSK for enrollment. Always check the specific program's requirements.",
          },
        ],
      },
      {
        id: 'study-plans',
        h2: 'Study plans: realistic timelines by level',
        intro:
          "Study time per HSK level depends on your native language, prior Chinese exposure, and study intensity. Korean and Japanese speakers progress faster (related grammar and characters). English speakers need the most time. The numbers below are for full-time study (4-6 hours/day, 5 days/week).",
        blocks: [
          {
            type: 'h3',
            text: 'HSK 1-2: 1-2 months',
            body:
              "150-300 words, basic pinyin, simple sentences (你好, 谢谢, 你叫什么名字, 我是...). Use HelloChinese app (free for HSK 1-2 content), the HSK Standard Course 1 + 2 textbooks, and 30 minutes/day of listening practice. Goal: read pinyin, recognize 200 characters, hold a 2-minute self-introduction. Total study time: 80-100 hours.",
          },
          {
            type: 'h3',
            text: 'HSK 3: 2-3 months',
            body:
              "600 words, basic grammar (了, 过, 把, 被, 虽然...但是...). HSK Standard Course 3 + Anki flashcards (free HSK 3 decks). Add 30 minutes/day of native content: Chinese TV shows with subtitles (like iPartment 爱情公寓), short videos on Bilibili. Goal: hold a 5-minute conversation, read 200-character articles. Total: 100-150 hours.",
          },
          {
            type: 'h3',
            text: 'HSK 4: 3-4 months (the big jump)',
            body:
              "1,200 words, complex grammar (不但...而且, 既然...就, 无论...都), and 600 simplified characters. HSK Standard Course 4 (the most important textbook for international students) + Anki HSK 4 deck + 5 official HSK 4 mock tests (each takes 2 hours). Add 1 hour/day of listening (Chinese podcasts like ChinesePod, news). Goal: read news headlines, follow a Chinese TV show without subtitles, write 80-character essays. Total: 150-200 hours.",
          },
          {
            type: 'h3',
            text: 'HSK 5: 4-6 months',
            body:
              "2,500 words, formal writing (连...都/也, 凡是...都, 一旦...就), and 1,200+ simplified characters. HSK Standard Course 5 + 10 official HSK 5 mock tests + 1 hour/day of newspaper reading (人民日报, China Daily bilingual). Add writing practice: write 200-character essays weekly, get feedback from a tutor on iTalki ($15-25/hour). Goal: read newspaper articles independently, write 200-character essays with few errors. Total: 200-300 hours.",
          },
          {
            type: 'h3',
            text: 'HSK 6: 6-12 months (advanced)',
            body:
              "5,000+ words, literary Chinese (之, 其, 乃), and 2,500+ characters. HSK Standard Course 6 + 15 official HSK 6 mock tests + read Chinese novels (start with Yu Hua's short stories, then Liu Cixin's 三体). Add advanced writing: 300-character essays on abstract topics, formal letters, news commentary. Total: 300-500 hours.",
          },
        ],
      },
      {
        id: 'best-resources',
        h2: 'Best prep resources: free and paid',
        intro:
          "Free resources get you to HSK 4. Paid resources (tutoring, mock test bundles) are how you break into HSK 5-6 territory. Here's the curated short list.",
        blocks: [
          {
            type: 'h3',
            text: 'Free resources (sufficient for HSK 1-4)',
            body:
              "HelloChinese app (iOS/Android) — gamified HSK 1-3 prep, free tier is enough. Du Chinese app — reading practice with graded content. HSK Standard Course textbooks (official, 1-6, ~$10-15 each on Amazon or directly from BLCU Press). Anki HSK decks (free, search 'HSK 4 Anki' on Reddit). YouTube: Mandarin Corner (real Chinese conversations with subtitles), Chinese Zero to Hero (HSK 1-3 grammar). Pleco app (free dictionary, the only Chinese dictionary app you need).",
          },
          {
            type: 'h3',
            text: 'Paid resources (essential for HSK 5-6)',
            body:
              "iTalki tutoring (~$10-30/hour for community tutors, $20-50 for professional teachers) — the single best investment for HSK 4-6 speaking + writing feedback. HSK mock test bundles (~$20-50, search 'HSK 5 past papers' on Taobao for the Chinese-published official versions). HSK Online (official Hanban platform, $30-100/level) — full mock tests with detailed explanations. Coursera Chinese for Beginners (free audit, $50 certificate) — supplementary for HSK 1-2. Hack Chinese app ($5/month) — character writing practice with spaced repetition.",
          },
          {
            type: 'h3',
            text: 'The official HSK test centers and dates',
            body:
              "The HSK is offered 8-10 times per year in most countries, monthly in mainland China. The main test windows are March, April, June, July, September, October, November, December (varies by country). Test centers: Confucius Institutes (200+ worldwide), Chinese embassy cultural offices, university Chinese language programs. In China, the test is run at most major universities' international student centers. Registration: 4-6 weeks before the test date, $15-50 fee (varies by country and level). Results: 2 weeks (computer-based) or 4-6 weeks (paper-based).",
          },
          {
            type: 'callout',
            tone: 'info',
            text: "Register for the HSK 2-3 months before your application deadline. Don't wait until the last test date — if you score lower than expected, you need time to retake. Most students need 2 attempts to hit their target score on HSK 4-6.",
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the HSK test?',
        a: "The HSK (Hanyu Shuiping Kaoshi 汉语水平考试) is China's official Chinese proficiency test for non-native speakers, run by the Chinese Ministry of Education. There are 6 levels that matter for international students (HSK 1-6), with 7-9 added in 2021 for advanced learners. Most Chinese-taught degree programs require HSK 4-5; the CSC scholarship requires HSK 4+. The test is paper-based or computer-based, 2 hours for HSK 4-6 (listening + reading + writing), scored out of 300.",
      },
      {
        q: 'Which HSK level do I need for a Chinese-taught degree?',
        a: "Most Chinese-taught bachelor's programs require HSK 4 (≥180). Top universities (Peking, Tsinghua, Fudan, etc.) want HSK 5 (≥210) for bachelor's and HSK 5 (≥180) for master's. PhD programs typically require HSK 5 (≥200) plus an interview and often published research. For the CSC scholarship, the minimum is HSK 4 (≥180) for bilateral programs and HSK 5 (≥200) for university programs.",
      },
      {
        q: 'How long does it take to prepare for the HSK 4?',
        a: "100-200 hours of study for English speakers, 60-120 hours for Korean/Japanese speakers. Most students studying full-time (4-6 hours/day) reach HSK 4 in 3-4 months. Part-time study (1-2 hours/day) takes 6-9 months. The biggest jump is HSK 3 → HSK 4: the vocabulary doubles and the grammar gets significantly more complex.",
      },
      {
        q: 'How much does the HSK test cost?',
        a: "HSK exam fees vary by country and test level. Typical range: HSK 1-2 $15-25; HSK 3-4 $25-40; HSK 5-6 $35-50. In China, the fee is lower (¥200-450 total for HSK 4-6). HSKK (oral test) is the same cost as the HSK at the same level. CSC scholarship applicants can request a fee waiver through the Chinese embassy in their country — common for students from Belt and Road countries.",
      },
      {
        q: 'Is the HSK harder than IELTS/TOEFL?',
        a: "Comparable in length (2 hours) and stress level, but the scoring curve is different. HSK 4 is roughly equivalent to B2 (intermediate) on the CEFR scale; HSK 5 is C1; HSK 6 is C2. Most international students find HSK 4-5 comparable to IELTS 6-7 in study time. The Chinese writing system is the biggest hurdle — 1,200 simplified characters for HSK 4, 2,500+ for HSK 5, 5,000+ for HSK 6.",
      },
      {
        q: 'How long is the HSK score valid?',
        a: "2 years from the test date. If you take HSK 5 in 2024 and apply for a 2026 program, you need to retake. The validity is enforced by most universities during enrollment. Plan your HSK test 3-6 months before your application deadline to ensure your score is current at enrollment.",
      },
      {
        q: 'Can I take the HSK online?',
        a: "Yes, the HSK is available online through the official HSK Online platform (chinesetest.cn) and approved partners like iHuman. The online test is the same format as the in-person computer-based test, with proctoring via webcam. Most international students prefer the online version for convenience, but the in-person test is more widely accepted by universities and embassies. Some CSC scholarship programs require in-person HSK — check the specific application requirements.",
      },
      {
        q: 'Do I need HSK for an English-taught program in China?',
        a: "No — English-taught programs (the vast majority of STEM master's at top universities) don't require HSK. You apply with IELTS/TOEFL + your degree + work experience. However, learning HSK 2-3 makes daily life dramatically easier: ordering food, asking directions, dealing with bureaucracy, building friendships with Chinese classmates. Most students find that even 3 months of basic Chinese study makes their China experience 3x better.",
      },
    ],
    howToSteps: [
      {
        name: 'Identify the HSK level you need',
        text: "Check your target program requirements. CSC scholarship: HSK 4+ (bilateral) or HSK 5+ (university). Chinese-taught bachelor's: HSK 4 minimum, HSK 5 preferred. Chinese-taught master's: HSK 5. PhD: HSK 5+ plus interview. English-taught: none. Once you know the target, plan backwards from your application deadline.",
      },
      {
        name: 'Choose your prep method',
        text: "Free (sufficient for HSK 1-4): HelloChinese app + HSK Standard Course textbooks + Anki flashcards. Paid (essential for HSK 5-6): iTalki tutoring ($15-30/hour) + official HSK mock tests. Combine: 1-2 hours/day self-study + 1 hour/week with a tutor.",
      },
      {
        name: 'Build your study schedule',
        text: "Full-time (4-6h/day): reach HSK 4 in 3-4 months, HSK 5 in 6-9 months, HSK 6 in 12-18 months. Part-time (1-2h/day): double those timelines. Consistency > intensity: 1 hour every day beats 7 hours on Saturday.",
      },
      {
        name: 'Master the foundational skills first',
        text: "Pinyin (4 weeks) → Characters (write the first 300 by hand, then move to recognition-only) → Vocabulary (Anki spaced repetition) → Grammar (HSK Standard Course grammar sections) → Listening (ChinesePod or podcasts) → Speaking (iTalki) → Writing (start at HSK 3+ with sentence → paragraph → essay progression).",
      },
      {
        name: 'Take your first full-length mock test',
        text: "After 60-80% of prep, take an official HSK mock test under timed conditions. Most students score 30-50 points below their target on the first try. The mock test tells you where to focus: weak listening = more listening practice; weak reading = more reading practice; weak writing = more essay practice with a tutor.",
      },
      {
        name: 'Register for the HSK 8-12 weeks before your deadline',
        text: "Test dates are monthly in mainland China, 8-10 times per year internationally. Register on chinesetest.cn or through your local Confucius Institute. $15-50 fee depending on country and level. 4-6 weeks before the test, your prep should be 90% mock tests + targeted weakness practice.",
      },
      {
        name: 'Take the test + use the results strategically',
        text: "On test day: arrive 30 min early, bring passport + admission ticket + 2B pencils + eraser. The test is 2 hours (HSK 4-6) + 30 min for check-in. Results in 2 weeks (computer-based) or 4-6 weeks (paper-based). If you hit your target: apply. If you missed: register for the next test date 2-3 months later and focus on the weak section.",
      },
      {
        name: 'For the HSKK oral test (often required)',
        text: "HSKK is a 20-25 minute oral test, recorded. HSKK Beginner (HSK 1-2), Intermediate (HSK 3-4), Advanced (HSK 5-6). Same test centers, same dates, same fee. Prep: iTalki conversation practice + 5-10 mock HSKK recordings (YouTube). Most international students take HSKK at the same time as the HSK — bundle them.",
      },
    ],
    ctaTitle: 'Need help with your HSK study plan?',
    ctaSubtitle:
      'SICA can map the HSK level required for your target program + university + scholarship, recommend a study plan that fits your timeline, and connect you with vetted iTalki tutors who specialize in HSK prep.',
    ctaApplyLabel: 'Start with free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/scholarships',
        label: 'Scholarships to study in China',
        description: 'CSC, Confucius Institute, university-specific, and provincial scholarships — what each covers and how to apply.',
      },
      {
        href: '/guides/application',
        label: 'How to apply',
        description: 'The full application timeline, document checklist, and scholarship paths.',
      },
      {
        href: '/guides/visa',
        label: 'Student visa (X1 / X2)',
        description: 'Document checklist, fees, processing times, residence permit, work rights, and renewals.',
      },
    ],
  },

  zh: {
    slug: 'hsk',
    eyebrow: '指南 · 汉语水平考试',
    title: '中国留学生HSK汉语水平考试备考指南（2026）',
    description:
      'HSK是中文授课项目的标准化汉语考试。考试形式、分数要求、HSK 1-6备考计划、10个最佳免费+付费资源。',
    subtitle:
      '如果你申请中文授课项目，你需要HSK成绩。如果你申请CSC奖学金，你需要HSK 4或5。本文告诉你具体需要哪个级别、怎么达到、考试的真正感受。',
    stats: [
      { value: 'HSK 4+', label: 'CSC奖学金最低要求' },
      { value: 'HSK 5+', label: '顶尖大学学位课最低要求' },
      { value: '~120小时', label: '每级HSK学习时长' },
      { value: '$15-50', label: 'HSK考试费（视国家）' },
    ],
    quickAnswer:
      'HSK（汉语水平考试）是中国针对母语非汉语者的标准化汉语水平考试，多数中文授课项目和CSC奖学金申请都要求。国际学生相关6级（HSK 1-6，2021年新增7-9为高级）。HSK 4（词汇~1200）是CSC奖学金最低；HSK 5（~2500）是顶尖大学学位课典型最低；HSK 6（5000+）是高级研究和多数竞争性项目。考试为纸笔或机考，HSK 4-6共2小时（听力+阅读+写作），满分300（HSK 4-5通过=180，HSK 6通过=240）。每级学习时间：80-150小时。考试费：$15-50视国家。最佳备考资源：HSK标准教程（官方）、HelloChinese App（HSK 1-3免费）、ChineseSkill、Anki记忆卡、iTalki家教（口语）、官方HSK在线模拟题。',
    keyTakeaways: [
      'HSK 1-3初级；HSK 4是多数学位项目实际最低',
      'HSK 4 = 1200词；HSK 5 = 2500词；HSK 6 = 5000+词',
      'CSC奖学金要求HSK 4+（部分类别3+）；多数顶尖大学要HSK 5+',
      '考试形式：听力（35分钟）+阅读（60分钟）+写作（45分钟，HSK 4-6）',
      '分数：300总分，HSK 4-5通过=180，HSK 6通过=240；有效期2年',
      '学习时间：每级80-150小时（视母语）',
      '最佳免费资源：官方HSK标准教程、HelloChinese App、YouTube Mandarin Corner',
      '最佳付费资源：iTalki家教（$10-30/小时）、Anki牌组、HSK模拟题包（$20-50）',
    ],
    sections: [
      {
        id: 'what-is-hsk',
        h2: '什么是HSK，为什么重要？',
        intro:
          'HSK（汉语水平考试）是中国面向母语非汉语者的官方汉语水平考试，由中国教育部通过汉办/孔子学院总部举办。每所中国大学的中文授课项目都要求HSK成绩，多数CSC奖学金申请有最低HSK级别。',
        blocks: [
          {
            type: 'h3',
            text: '国际学生相关的6个级别',
            body:
              'HSK 1：150词，基础短语。适合短期语言项目。HSK 2：300词，简单对话。HSK 3：600词，日常话题。HSK 4：1200词，能读简单文章、就熟悉话题对话。HSK 5：2500词，能读报纸、讨论学术话题。HSK 6：5000+词，接近母语水平，适用于学术和专业场景。7-9级（2021年新增）为高级学习者，主要面向对外汉语教师和研究人员。',
          },
          {
            type: 'h3',
            text: '每个级别能做什么',
            body:
              'HSK 1-2：基础生存汉语，点菜、问路。HSK 3：在中国独立旅行、基本对话。HSK 4：有准备地听中文授课、写简单短文。HSK 5：读中文授课学位项目（最常见要求），通过多数CSC奖学金面试。HSK 6：读顶尖中文授课项目、在中文专业环境工作、用中文攻读高级学位。',
          },
          {
            type: 'h3',
            text: 'HSKK口语考试（常被要求）',
            body:
              'HSKK（HSK口语考试）是单独的口语水平考试，常与HSK 4-6配套要求。3级：HSKK初级（HSK 1-2）、HSKK中级（HSK 3-4）、HSKK高级（HSK 5-6）。考试20-25分钟，录音，满分100。多数国际学生考HSKK中级或高级。考试费用与HSK相同，在相同考点举行。',
          },
        ],
      },
      {
        id: 'exam-format',
        h2: '考试形式：考试的真正样貌',
        intro:
          'HSK 1-3考听力+阅读。HSK 4-6考听力+阅读+写作。HSKK考口语。考试在多数国际考点为纸笔，国内考点为机考。机考成绩2周出，纸笔4-6周。',
        blocks: [
          {
            type: 'table',
              caption: 'HSK 4-6考试形式',
              columns: ['部分', '时间', '题数', '分值'],
              rows: [
                ['听力', '30-35分钟', '45题（HSK 4）/ 50题（HSK 5-6）', '100分'],
                ['阅读', '40-60分钟', '40题（HSK 4）/ 45题（HSK 5-6）', '100分'],
                ['写作（仅HSK 4-6）', '40-45分钟', '10题（HSK 4）/ 10题（HSK 5-6）', '100分'],
                ['总分', '~135分钟', '~95题', '300分'],
              ],
          },
          {
            type: 'h3',
            text: '第1部分：听力',
            body:
              '4-5段短对话和3-4段长对话/短文。选择题。HSK 4语速较慢。HSK 5-6为母语速度、含背景噪音、多个说话者、更长短文。技巧：5分钟导览时预读题目；聚焦数字、时间和具体名词；不要卡在漏听的题上。',
          },
          {
            type: 'h3',
            text: '第2部分：阅读',
            body:
              '略读找细节。HSK 4：短文（100-200字）配3-4道选择题。HSK 5：长文（300-500字）配4-5题，含填空句。HSK 6：完整短文（500-1000字）配细节理解题，加5-10道完形填空（补全短文缺词）。时间压力真实——练习略读。',
          },
          {
            type: 'h3',
            text: '第3部分：写作',
            body:
              '语序排列（把4-6个词重排为语法正确句）、根据正确词形填空句、80-100字短文（HSK 4）或200-300字短文（HSK 5-6）。作文题目通常是个人反思（你最喜欢的爱好、一次难忘旅行）——考前预先写3-4个模板。',
          },
        ],
      },
      {
        id: 'score-requirements',
        h2: '按项目类型的分数要求',
        intro:
          '你需要的HSK分数取决于项目、大学、奖学金。下面按常见国际学生路径给出实际分级。',
        blocks: [
          {
            type: 'table',
              caption: '按项目类型的HSK分数要求',
              columns: ['项目类型', 'HSK最低', 'HSKK最低', '备注'],
              rows: [
                ['CSC奖学金（双边项目）', 'HSK 4 (≥180)', 'HSK 4+要求', '一带一路国家有时接受HSK 3'],
                ['CSC奖学金（大学项目）', 'HSK 5 (≥200)', '建议', '顶尖大学要240+'],
                ['CSC奖学金（预科/1年以上）', 'HSK 3 (≥180)', '可选', '中文授课学位的基础年'],
                ['中文授课本科（多数大学）', 'HSK 4 (≥180)', '要求', '竞争性项目偏好HSK 5'],
                ['中文授课本科（前20大学）', 'HSK 5 (≥210)', '要求', '北大、清华、复旦等常要240+'],
                ['中文授课硕士（多数大学）', 'HSK 5 (≥180)', '要求', '研究型学位偏好HSK 6'],
                ['中文授课博士', 'HSK 5 (≥200) + 面试', '要求', '多数大学还要已发表科研'],
                ['英文授课项目', '无（HSK 0）', '无', '不要求HSK，但HSK 3+对日常生活有用'],
                ['孔子学院奖学金', 'HSK 2-3 (视情况)', '可选', '1年以上汉语学习'],
              ],
          },
          {
            type: 'h3',
            text: '分数含义',
            body:
              'HSK 4：180（通过）/ 240（良好）/ 270+（优秀）。HSK 5：180（通过）/ 240（良好）/ 270+（优秀）。HSK 6：240（通过）/ 270（良好）/ 290+（优秀）。多数大学接受通过线；竞争性项目要210+。CSC申请要求通过线，但实际面试成功与240+相关。',
          },
          {
            type: 'h3',
            text: 'HSK有效期',
            body:
              'HSK成绩从考试日起2年有效。如果2024年考HSK 5、2026年入学，需要重考。部分大学申请接受旧成绩但入学要新成绩。务必查具体项目要求。',
          },
        ],
      },
      {
        id: 'study-plans',
        h2: '备考计划：按级别的真实时间表',
        intro:
          '每级HSK学习时间取决于母语、汉语基础、学习强度。韩国和日本学习者更快（语法和汉字相关）。英语学习者最慢。下面是全日制学习（4-6小时/天，5天/周）的数字。',
        blocks: [
          {
            type: 'h3',
            text: 'HSK 1-2：1-2个月',
            body:
              '150-300词，基础拼音，简单句（你好、谢谢、你叫什么名字、我是…）。用HelloChinese App（HSK 1-2内容免费）、HSK标准教程1+2教材、每天30分钟听力练习。目标：读拼音、认200汉字、2分钟自我介绍。总学习时间：80-100小时。',
          },
          {
            type: 'h3',
            text: 'HSK 3：2-3个月',
            body:
              '600词，基础语法（了、过、把、被、虽然…但是…）。HSK标准教程3+Anki记忆卡（免费HSK 3牌组）。加每天30分钟中文内容：带字幕的中文剧（如《爱情公寓》）、B站短视频。目标：5分钟对话、读200字文章。总：100-150小时。',
          },
          {
            type: 'h3',
            text: 'HSK 4：3-4个月（最大跳）',
            body:
              '1200词，复杂语法（不但…而且…、既然…就…、无论…都…），600简化字。HSK标准教程4（国际学生最重要的教材）+Anki HSK 4牌组+5套官方HSK 4模拟题（每套2小时）。加每天1小时听力（ChinesePod播客、新闻）。目标：读新闻标题、无字幕追中文剧、写80字短文。总：150-200小时。',
          },
          {
            type: 'h3',
            text: 'HSK 5：4-6个月',
            body:
              '2500词，正式写作（连…都/也、凡是…都、一旦…就…），1200+简化字。HSK标准教程5+10套官方HSK 5模拟题+每天1小时读报（《人民日报》、中国日报双语版）。加写作练习：每周写200字短文，在iTalki上找家教批改（$15-25/小时）。目标：独立读报、200字短文少错。总：200-300小时。',
          },
          {
            type: 'h3',
            text: 'HSK 6：6-12个月（高级）',
            body:
              '5000+词，文言（之、其、乃），2500+字。HSK标准教程6+15套官方HSK 6模拟题+读中文小说（从余华短篇开始，再看刘慈欣《三体》）。加高级写作：300字抽象话题作文、正式信函、时事评论。总：300-500小时。',
          },
        ],
      },
      {
        id: 'best-resources',
        h2: '最佳资源：免费与付费',
        intro:
          '免费资源能让你到HSK 4。付费资源（家教、模拟题包）是进入HSK 5-6的途径。下面是精选短名单。',
        blocks: [
          {
            type: 'h3',
            text: '免费资源（够HSK 1-4）',
            body:
              'HelloChinese App（iOS/Android）——游戏化HSK 1-3备考，免费版够用。Du Chinese App——分级阅读练习。HSK标准教程教材（官方，1-6，每本$10-15在亚马逊或北语社直购）。Anki HSK牌组（免费，Reddit搜"HSK 4 Anki"）。YouTube：Mandarin Corner（带字幕的真实汉语对话）、Chinese Zero to Hero（HSK 1-3语法）。Pleco App（免费词典，唯一需要的汉语词典App）。',
          },
          {
            type: 'h3',
            text: '付费资源（HSK 5-6必需）',
            body:
              'iTalki家教（社区家教~$10-30/小时，专业教师$20-50）——HSK 4-6口语+写作反馈的最佳投资。HSK模拟题包（~$20-50，淘宝搜"HSK 5 历年真题"找中国出版的官方版）。HSK Online（官方汉办平台，$30-100/级）——含详细解析的完整模拟题。Coursera Chinese for Beginners（免费旁听，$50证书）——HSK 1-2补充。Hack Chinese App（$5/月）——间隔重复汉字书写练习。',
          },
          {
            type: 'h3',
            text: '官方HSK考点和日期',
            body:
              'HSK在多数国家每年8-10次，国内每月一次。主要考试窗口：3、4、6、7、9、10、11、12月（视国家）。考点：孔子学院（全球200+）、中国大使馆文化处、大学汉语项目。在中国，多数重点大学的留学生中心都设考点。报名：考前4-6周，$15-50费用（视国家和级别）。出分：2周（机考）或4-6周（纸笔）。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '在申请截止日前2-3个月报名HSK。不要等最后一次考试——如果成绩低于预期，你需要时间重考。多数学生HSK 4-6需要2次才能达到目标。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'HSK是什么考试？',
        a: 'HSK（汉语水平考试）是中国面向母语非汉语者的官方汉语水平考试，由中国教育部主办。国际学生相关6级（HSK 1-6，2021年新增7-9为高级）。多数中文授课学位项目要求HSK 4-5；CSC奖学金要求HSK 4+。考试为纸笔或机考，HSK 4-6共2小时（听力+阅读+写作），满分300。',
      },
      {
        q: '中文授课学位需要哪个HSK级别？',
        a: '多数中文授课本科要求HSK 4（≥180）。顶尖大学（北大、清华、复旦等）本科要HSK 5（≥210），硕士要HSK 5（≥180）。博士通常要HSK 5（≥200）加面试，常要求已发表科研。CSC奖学金最低：双边项目HSK 4（≥180）、大学项目HSK 5（≥200）。',
      },
      {
        q: '备考HSK 4需要多长时间？',
        a: '英语母语者100-200小时，韩语/日语母语者60-120小时。全日制学习（4-6小时/天）多数学生3-4个月达HSK 4。业余学习（1-2小时/天）要6-9个月。最大跳是HSK 3→HSK 4：词汇翻倍、语法显著变难。',
      },
      {
        q: 'HSK考试多少钱？',
        a: 'HSK考试费因国家和级别而异。典型范围：HSK 1-2 $15-25；HSK 3-4 $25-40；HSK 5-6 $35-50。在国内费用较低（HSK 4-6总共¥200-450）。HSKK（口语）和HSK同级同费。CSC奖学金申请者可向中国驻本国大使馆申请免考试费——一带一路国家学生常见。',
      },
      {
        q: 'HSK比IELTS/TOEFL难吗？',
        a: '时长（2小时）和压力水平相当，但评分曲线不同。HSK 4大致相当于CEFR B2（中级）；HSK 5是C1；HSK 6是C2。多数国际学生发现HSK 4-5在学习时间上与IELTS 6-7相当。汉字体系是最大障碍——HSK 4要1200简化字，HSK 5要2500+，HSK 6要5000+。',
      },
      {
        q: 'HSK成绩有效期多长？',
        a: '从考试日起2年。2024年考HSK 5、2026年入学需要重考。多数大学在入学时强制要求成绩在有效期内。提前3-6个月规划HSK考试，确保入学时成绩有效。',
      },
      {
        q: 'HSK可以线上考吗？',
        a: '可以。HSK通过官方HSK Online平台（chinesetest.cn）和iHuman等认证合作伙伴提供线上考试。线上考试与现场机考形式相同，含摄像头监考。多数国际学生为方便选线上，但现场考试被大学和使馆接受更广。部分CSC项目要求现场HSK——查具体申请要求。',
      },
      {
        q: '英文授课项目需要HSK吗？',
        a: '不需要。英文授课项目（顶尖大学STEM硕士的多数）不要求HSK。你用IELTS/TOEFL+学位+工作经验申请。但学HSK 2-3让日常生活便利得多：点菜、问路、办手续、与中国同学交朋友。多数学生发现即便3个月基础汉语学习，中国体验也好3倍。',
      },
    ],
    howToSteps: [
      { name: '确定需要的HSK级别', text: '查目标项目要求。CSC奖学金：HSK 4+（双边）或HSK 5+（大学）。中文授课本科：HSK 4最低，HSK 5偏好。中文授课硕士：HSK 5。博士：HSK 5+加面试。英文授课：无。确定目标后，从申请截止日倒推。' },
      { name: '选择备考方式', text: '免费（够HSK 1-4）：HelloChinese App+HSK标准教程+Anki记忆卡。付费（HSK 5-6必需）：iTalki家教（$15-30/小时）+官方HSK模拟题。组合：每天1-2小时自学+每周1小时家教。' },
      { name: '制定学习计划', text: '全日制（4-6h/天）：HSK 4要3-4月，HSK 5要6-9月，HSK 6要12-18月。业余（1-2h/天）：时间翻倍。坚持 > 强度：每天1小时好过每周六突击7小时。' },
      { name: '先掌握基础技能', text: '拼音（4周）→ 汉字（前300手写，之后只认）→ 词汇（Anki间隔重复）→ 语法（HSK标准教程语法部分）→ 听力（ChinesePod或播客）→ 口语（iTalki）→ 写作（HSK 3+开始：句子→段落→短文进阶）。' },
      { name: '参加第一次完整模拟考', text: '备考60-80%后，按计时条件做一套官方HSK模拟题。多数学生首次比目标低30-50分。模拟考告诉你重点：听力弱 = 多练听力；阅读弱 = 多练阅读；写作弱 = 多找家教练作文。' },
      { name: '提前8-12周报名HSK', text: '考试日期：国内每月一次，国际每年8-10次。在chinesetest.cn或当地孔子学院报名。$15-50费用视国家和级别。考前4-6周，备考应为90%模拟题+针对弱项练习。' },
      { name: '参加考试+策略性使用成绩', text: '考试当天：提前30分钟到，带护照+准考证+2B铅笔+橡皮。考试2小时（HSK 4-6）+30分钟签到。出分2周（机考）或4-6周（纸笔）。达标：申请。未达标：报名下次考试2-3月后，专注弱项。' },
      { name: 'HSKK口语考试（常被要求）', text: 'HSKK是20-25分钟口语考试，录音。HSKK初级（HSK 1-2）、中级（HSK 3-4）、高级（HSK 5-6）。同考点、同日期、同费。备考：iTalki对话练习+5-10个HSKK模拟录音（YouTube）。多数国际学生和HSK同时考HSKK——捆绑报名。' },
    ],
    ctaTitle: '需要HSK备考规划帮助？',
    ctaSubtitle:
      'SICA可以为你目标项目+大学+奖学金匹配HSK级别要求，推荐适合你时间的学习计划，连接专做HSK备考的iTalki认证家教。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      { href: '/guides/scholarships', label: '中国留学奖学金', description: 'CSC、孔子学院、院校、省市奖学金——各自覆盖什么，怎么申请。' },
      { href: '/guides/application', label: '如何申请', description: '完整申请时间线、材料清单、奖学金路径。' },
      { href: '/guides/visa', label: '学生签证 (X1 / X2)', description: '材料清单、费用、办理时长、居留许可、兼职、续签。' },
    ],
  },
};

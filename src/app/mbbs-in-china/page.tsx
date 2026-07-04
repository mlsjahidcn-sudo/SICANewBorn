import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  ArrowRight,
  Award,
  Banknote,
  ChevronRight,
  Clock,
  Globe,
  GraduationCap,
  MapPin,
} from 'lucide-react';
import { getAllPrograms, getAllUniversities } from '@/lib/data-fetcher';
import { FAQ, type FAQItem } from '@/components/listicles/faq';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

// Server-rendered page. Re-validates every 60s so newly-added
// MBBS programs appear without a redeploy.
type Locale = 'en' | 'zh';

const COPY: Record<
  Locale,
  {
    breadcrumbHome: string;
    breadcrumbCurrent: string;
    eyebrow: string;
    h1: string;
    subhead: string;
    leadParagraph: string;
    sectionTable: string;
    sectionFaq: string;
    sectionFaqHint: string;
    ctaTitle: string;
    ctaBody: string;
    ctaAssessment: string;
    ctaContact: string;
    ctaBrowse: string;
    badgeScholarship: string;
    colProgram: string;
    colUniversity: string;
    colDuration: string;
    colTuition: string;
    colLanguage: string;
    emptyState: string;
    emptyStateLink: string;
    footerFactsTitle: string;
    factRecognizedTitle: string;
    factRecognizedBody: string;
    factEnglishTitle: string;
    factEnglishBody: string;
    factInternshipTitle: string;
    factInternshipBody: string;
    programPageLink: string;
  }
> = {
  en: {
    breadcrumbHome: 'Home',
    breadcrumbCurrent: 'MBBS in China',
    eyebrow: 'GUIDE · MEDICINE',
    h1: 'MBBS in China for International Students (2026 Guide)',
    subhead:
      'English-medium Bachelor of Medicine & Bachelor of Surgery programs at MOE-listed Chinese universities — duration, tuition, scholarships, and the full admissions path.',
    leadParagraph:
      'China is one of the most popular destinations for international students pursuing MBBS. All programs on this page are 6-year clinical medicine tracks taught in English at universities recognized by the World Health Organization (WDOMS) and most national medical councils (PMC, NMC, HPCSA, etc.). Tuition typically runs ¥30,000-45,000/year — a fraction of US/UK private medical school fees — and most programs accept international students without requiring HSK Chinese proficiency at intake (you learn medical Chinese during the first year).',
    sectionTable: 'MBBS programs at MOE-listed Chinese universities',
    sectionFaq: 'Frequently asked questions',
    sectionFaqHint:
      'Click any question to expand the answer. The same Q&A appears in the JSON-LD FAQPage schema at the bottom of this page.',
    ctaTitle: 'Ready to apply for MBBS in China?',
    ctaBody:
      'SICA counselors help you shortlist MOE-listed universities, prepare your application package, and apply for medical school scholarships. Free initial consultation.',
    ctaAssessment: 'Start free assessment',
    ctaContact: 'Talk to a counselor',
    ctaBrowse: 'Browse all programs',
    badgeScholarship: 'Scholarship',
    colProgram: 'Program',
    colUniversity: 'University',
    colDuration: 'Duration',
    colTuition: 'Tuition',
    colLanguage: 'Language',
    emptyState: 'No MBBS programs are currently listed in the SICA catalog.',
    emptyStateLink: 'Browse all programs',
    footerFactsTitle: 'Why study MBBS in China',
    factRecognizedTitle: 'WHO + PMC + NMC recognized',
    factRecognizedBody:
      'Every university on this page is on the WHO World Directory of Medical Schools (WDOMS) and recognized by the Pakistan Medical Commission, India National Medical Commission, and South Africa HPCSA, so you can sit licensing exams in your home country after graduation.',
    factEnglishTitle: 'Full 6-year track in English',
    factEnglishBody:
      'All MBBS programs listed are taught in English for the full 6 years (including the 1-year clinical internship). HSK Chinese is taught alongside, so you can communicate with patients during clinical rotations.',
    factInternshipTitle: 'Hands-on clinical rotations',
    factInternshipBody:
      'Years 4-6 are spent in affiliated teaching hospitals. SICA partner universities operate 8-18 affiliated hospitals with thousands of beds, so you graduate with substantial clinical exposure — not just classroom theory.',
    programPageLink: 'View program',
  },
  zh: {
    breadcrumbHome: '首页',
    breadcrumbCurrent: '临床医学（MBBS）',
    eyebrow: '指南 · 医学',
    h1: '来华攻读临床医学学士（MBBS）2026 完整指南',
    subhead:
      '教育部认可的全英文临床医学本科项目——学制、学费、奖学金、完整申请路径一站搞定。',
    leadParagraph:
      '中国是国际学生攻读 MBBS 最热门的目的地之一。本页面所列均为 6 年制英文授课的临床医学项目，由获世界卫生组织（WDOMS）及各国医学会（PMC、NMC、HPCSA 等）认证的大学开设。学费通常为 ¥30,000-45,000/年，仅为美英私立医学院的一小部分；多数项目入学时不要求 HSK 中文水平（第一年同步学习医学汉语）。',
    sectionTable: '教育部认可大学的 MBBS 项目',
    sectionFaq: '常见问题',
    sectionFaqHint:
      '点击问题展开答案。同一组问答以 JSON-LD FAQPage 结构化数据嵌入页面底部，便于 AI 引擎直接抓取。',
    ctaTitle: '准备好申请来华 MBBS 了吗？',
    ctaBody:
      'SICA 顾问可帮你筛选教育部认可大学、准备申请材料、申请医学院奖学金。首次咨询免费。',
    ctaAssessment: '开始免费评估',
    ctaContact: '联系顾问',
    ctaBrowse: '浏览全部项目',
    badgeScholarship: '可申请奖学金',
    colProgram: '项目',
    colUniversity: '大学',
    colDuration: '学制',
    colTuition: '学费',
    colLanguage: '授课语言',
    emptyState: 'SICA 目录中暂无 MBBS 项目。',
    emptyStateLink: '浏览全部项目',
    footerFactsTitle: '为什么选择来华攻读 MBBS',
    factRecognizedTitle: 'WHO + PMC + NMC 认证',
    factRecognizedBody:
      '本页所有大学均位列 WHO 世界医学院名录（WDOMS），并获巴基斯坦医学会、印度国家医学会、南非 HPCSA 认证。毕业后可在回国参加本国执业医师考试。',
    factEnglishTitle: '六年制全英文教学',
    factEnglishBody:
      '所列 MBBS 项目均为 6 年制全英文授课（含 1 年临床实习）。同步学习医学汉语，实习阶段可与患者顺畅沟通。',
    factInternshipTitle: '临床实习扎实',
    factInternshipBody:
      '第 4-6 年在附属教学医院完成实习。SICA 合作大学附属医院达 8-18 所，床位充足，毕业生具备扎实的临床经验。',
    programPageLink: '查看项目',
  },
};

const FAQS: Record<Locale, FAQItem[]> = {
  en: [
    {
      question: 'How long is MBBS in China?',
      answer:
        'MBBS in China is a 6-year program: 5 years of classroom + lab instruction (anatomy, physiology, biochemistry, pathology, pharmacology, internal medicine, surgery, etc.) followed by a 1-year clinical internship at an affiliated teaching hospital. The internship is hands-on patient care under licensed Chinese physicians.',
    },
    {
      question: 'Is MBBS in China taught in English?',
      answer:
        'Yes — all MBBS programs on this page are full 6-year English-medium tracks. HSK Chinese is taught as a separate subject (typically 3-4 hours/week in years 1-3) so you can communicate with patients during clinical rotations. You do NOT need to submit an HSK score for admission, only for graduation (some universities require HSK 4 by year 6).',
    },
    {
      question: 'Is MBBS in China recognized internationally?',
      answer:
        'MBBS degrees from MOE-listed Chinese universities are recognized by the WHO World Directory of Medical Schools (WDOMS), the Pakistan Medical Commission (PMC), the India National Medical Commission (NMC), the South African Health Professions Council (HPCSA), the Medical Councils of Bangladesh, Sri Lanka, Nepal, and most African/Asian medical councils. After graduation you can sit the USMLE (US), PLAB (UK), AMC (Australia), or your home-country licensing exam.',
    },
    {
      question: 'What is the tuition for MBBS in China?',
      answer:
        'Tuition for English-medium MBBS programs typically runs ¥30,000-45,000/year (~US$4,200-6,300). The total 6-year cost including tuition, accommodation, insurance, and visa fees is usually under ¥250,000 (~US$35,000) — about one-fifth of a US private medical school. Some provinces (Xinjiang, Guangxi) charge as low as ¥22,000-28,000/year for the same track.',
    },
    {
      question: 'What are the eligibility requirements for MBBS in China?',
      answer:
        'Minimum requirements: non-Chinese citizen, age 18-25, high school diploma with strong science background (biology + chemistry required, physics preferred), minimum GPA 3.0/4.0 (70%+ in most systems). English proficiency: IELTS 6.0+ or TOEFL 70+ if English is not your native language. Some universities require a written entrance exam in biology + chemistry, or an interview. No HSK required at intake.',
    },
    {
      question: 'Can I get a scholarship for MBBS in China?',
      answer:
        'Yes. Three main paths: (1) Chinese Government Scholarship (CSC) — fully funded, covers tuition + dorm + ¥2,500/month stipend, highly competitive, ~30 awards/year for medicine across all Chinese unis; (2) university-specific scholarships — most MBBS-hosting universities waive 50-100% of tuition for top applicants; (3) provincial government scholarships (Beijing, Shanghai, Jiangsu, etc.) — typically 20,000-50,000 RMB/year. SICA helps you apply for all three in parallel.',
    },
    {
      question: 'Do I need to learn Chinese for MBBS in China?',
      answer:
        'You can complete the entire MBBS program in English without speaking Chinese. However, the 1-year clinical internship requires daily patient interaction in Chinese. All MBBS programs include Medical Chinese as a compulsory subject (HSK 4 by graduation is the typical requirement). Plan on 3-4 hours/week of Chinese language classes during years 1-3.',
    },
    {
      question: 'What is the MBBS admission process in China?',
      answer:
        'Six steps: (1) Choose 2-3 MOE-listed universities that fit your budget and ranking goals. (2) Submit the online application via the university portal (or the CSC portal if you are applying for the Chinese Government Scholarship). Typical deadline: April-July for September intake. (3) Receive an admission notice + JW202 visa form within 4-8 weeks. (4) Apply for an X1 student visa at your local Chinese embassy/consulate. (5) Fly to China, complete a mandatory health check, register at the university. (6) Begin classes in early September. SICA handles the entire workflow end-to-end.',
    },
  ],
  zh: [
    {
      question: '来华 MBBS 项目学制多长？',
      answer:
        'MBBS 为 6 年制：5 年课堂 + 实验教学（解剖、生理、生化、病理、药理、内科、外科等），随后 1 年在附属教学医院完成临床实习，由具备中国执业资格的医师带教。',
    },
    {
      question: 'MBBS 是否全英文授课？',
      answer:
        '是——本页所有 MBBS 项目均为 6 年制全英文授课。医学汉语作为单独课程同步教学（第 1-3 年每周 3-4 小时），以便在临床实习阶段与患者沟通。入学时无需提交 HSK 成绩，但毕业前部分大学要求达到 HSK 4 级。',
    },
    {
      question: '来华 MBBS 是否获得国际认证？',
      answer:
        '教育部认可的中国大学 MBBS 学位获 WHO 世界医学院名录（WDOMS）、巴基斯坦医学会（PMC）、印度国家医学会（NMC）、南非卫生职业委员会（HPCSA）及孟加拉国、斯里兰卡、尼泊尔、多数非洲与亚洲国家医学会认证。毕业后可参加 USMLE（美国）、PLAB（英国）、AMC（澳大利亚）或本国执业医师考试。',
    },
    {
      question: '来华 MBBS 学费多少？',
      answer:
        '英文授课 MBBS 学费通常为 ¥30,000-45,000/年（约 4,200-6,300 美元）。含学费、住宿、保险、签证在内的 6 年总费用通常不超过 ¥250,000（约 3.5 万美元），约为美国私立医学院的五分之一。新疆、广西等地部分院校同类型项目学费低至 ¥22,000-28,000/年。',
    },
    {
      question: 'MBBS 入学条件有哪些？',
      answer:
        '基本要求：非中国公民、18-25 岁、高中毕业且理科基础扎实（生物 + 化学为必修，物理优先）、GPA 至少 3.0/4.0（或 70% 以上）。英语要求：母语非英语者需雅思 6.0+ 或托福 70+。部分大学要求生物化学笔试或面试。入学时无 HSK 要求。',
    },
    {
      question: 'MBBS 是否可申请奖学金？',
      answer:
        '可以。三种主要路径：（1）中国政府奖学金（CSC）——全额资助，含学费、住宿、¥2,500/月生活补贴，竞争激烈，全国医学专业每年约 30 个名额；（2）院校奖学金——多数 MBBS 招生院校为优秀申请者减免 50-100% 学费；（3）省市奖学金（北京、上海、江苏等）——通常为 20,000-50,000 RMB/年。SICA 可协助并行申请。',
    },
    {
      question: '攻读 MBBS 是否需要学中文？',
      answer:
        '可不使用中文完成全部课程。但 1 年临床实习要求日常用中文与患者交流。所有 MBBS 项目均将医学汉语列为必修课（毕业前通常要求 HSK 4 级）。建议第 1-3 年每周安排 3-4 小时中文学习。',
    },
    {
      question: '来华 MBBS 完整申请流程？',
      answer:
        '六步走：（1）挑选 2-3 所符合预算与排名的教育部认可大学；（2）通过学校官网（或 CSC 系统申请中国政府奖学金）提交在线申请。9 月入学通常截止于 4-7 月；（3）4-8 周内收到录取通知书 + JW202 签证表；（4）前往本国中国大使馆/领事馆申请 X1 学生签证；（5）抵华后完成强制体检与入学注册；（6）9 月初正式开课。SICA 可全程代办。',
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const c = COPY[locale];
  return {
    title: c.h1,
    description: c.subhead,
    alternates: { canonical: `${SITE_URL}/mbbs-in-china` },
    openGraph: {
      title: c.h1,
      description: c.subhead,
      url: `${SITE_URL}/mbbs-in-china`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: c.h1, description: c.subhead },
  };
}

export default async function MbbsInChinaPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const c = COPY[locale];

  const [programs, universities] = await Promise.all([
    getAllPrograms(),
    getAllUniversities(),
  ]);

  // MBBS filter — discipline = Medicine AND program name contains
  // the canonical MBBS marker. Captures "MBBS in Clinical Medicine",
  // "MBBS", "Clinical Medicine (MBBS)", etc. We intentionally
  // exclude plain "Clinical Medicine" tracks that aren't the
  // English-medium 6-year MBBS — those are listed on the parent
  // /programs page, not here.
  const mbbsPrograms = programs
    .filter(
      (p) =>
        p.discipline === 'Medicine' &&
        /(mbbs|clinical medicine)/i.test(p.name) &&
        !/(chinese medium|chinese-taught|中文)/i.test(p.name),
    )
    .map((p) => ({
      ...p,
      uni: universities.find((u) => u.slug === p.universitySlug),
    }))
    .sort((a, b) => {
      // Stable sort: ranking first (smallest = best), then by name
      const ra = a.uni?.ranking ?? Infinity;
      const rb = b.uni?.ranking ?? Infinity;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });

  const totalPrograms = mbbsPrograms.length;
  const totalUnis = new Set(mbbsPrograms.map((p) => p.universitySlug)).size;
  const englishCount = mbbsPrograms.filter((p) => p.language === 'English').length;
  const scholarshipCount = mbbsPrograms.filter((p) => p.scholarshipAvailable).length;

  const faqs = FAQS[locale];
  const isZh = locale === 'zh';

  // JSON-LD: BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: c.breadcrumbHome, item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: c.breadcrumbCurrent,
        item: `${SITE_URL}/mbbs-in-china`,
      },
    ],
  };

  // JSON-LD: ItemList (the table itself — LLMs cite this)
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: c.h1,
    description: c.subhead,
    numberOfItems: mbbsPrograms.length,
    itemListElement: mbbsPrograms.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: isZh ? p.nameCn : p.name,
      url: `${SITE_URL}/programs/${p.slug}`,
      description: `${(isZh ? p.nameCn : p.name)} · ${p.duration} · ${p.tuition} · ${p.language}`,
    })),
  };

  // JSON-LD: FAQPage
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="min-h-screen bg-[#FAFAF8]">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#9B1B30] transition-colors">
                {c.breadcrumbHome}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-[#1B2A4A] font-medium">{c.breadcrumbCurrent}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-[#1B2A4A] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4A853] mb-3">
              <GraduationCap className="h-4 w-4" />
              {c.eyebrow}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              {c.h1}
            </h1>
            <p className="mt-3 text-lg text-gray-300 max-w-3xl">{c.subhead}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                {totalPrograms} {isZh ? '个项目' : 'programs'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {totalUnis} {isZh ? '所大学' : 'universities'}
              </span>
              {englishCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  {englishCount} {isZh ? '个英文授课' : 'in English'}
                </span>
              )}
              {scholarshipCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-[#D4A853]" />
                  {scholarshipCount}{' '}
                  {isZh ? '个可申请奖学金' : 'with scholarships'}
                </span>
              )}
            </div>
            <p className="mt-3 text-xs text-gray-400">
              {isZh ? '最后更新：' : 'Last updated: '}
              {new Date().toISOString().slice(0, 10)} · SICA Editorial Team
            </p>
          </div>
        </section>

        {/* Lead paragraph */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-base sm:text-lg text-[#374151] leading-relaxed">
            {c.leadParagraph}
          </p>
        </section>

        {/* Programs table */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-5">{c.sectionTable}</h2>
          {mbbsPrograms.length === 0 ? (
            <div className="bg-white border-2 border-gray-200 p-8 text-center">
              <p className="text-gray-600">
                {c.emptyState}{' '}
                <Link href="/programs" className="text-[#9B1B30] hover:underline font-semibold">
                  {c.emptyStateLink}
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="bg-white border-2 border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1B2A4A] text-white">
                    <th className="text-left px-4 py-3 font-semibold">{c.colProgram}</th>
                    <th className="text-left px-4 py-3 font-semibold">{c.colUniversity}</th>
                    <th className="text-left px-4 py-3 font-semibold">{c.colDuration}</th>
                    <th className="text-left px-4 py-3 font-semibold">{c.colTuition}</th>
                    <th className="text-left px-4 py-3 font-semibold">{c.colLanguage}</th>
                    <th className="text-left px-4 py-3 font-semibold w-10" />
                  </tr>
                </thead>
                <tbody>
                  {mbbsPrograms.map((p, i) => (
                    <tr
                      key={p.slug}
                      className={`border-t border-gray-200 hover:bg-[#FAFAF8] transition-colors ${
                        i % 2 === 1 ? 'bg-gray-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/programs/${p.slug}`}
                          className="font-semibold text-[#1B2A4A] hover:text-[#9B1B30] transition-colors"
                        >
                          {isZh ? p.nameCn : p.name}
                        </Link>
                        {p.scholarshipAvailable && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#9B1B30]">
                            <Award className="h-3 w-3" />
                            {c.badgeScholarship}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {p.uni ? (
                          <Link
                            href={`/universities/${p.uni.slug}`}
                            className="hover:text-[#9B1B30] transition-colors"
                          >
                            {isZh && p.uni.nameCn ? p.uni.nameCn : p.uni.name}
                            {p.uni.ranking > 0 && (
                              <span className="ml-1.5 text-xs text-[#9B1B30] font-semibold">
                                #{p.uni.ranking}
                              </span>
                            )}
                          </Link>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        <Clock className="h-3.5 w-3.5 inline mr-1 text-gray-400" />
                        {isZh ? p.durationCn : p.duration}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        <Banknote className="h-3.5 w-3.5 inline mr-1 text-gray-400" />
                        {p.tuition}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        <Globe className="h-3.5 w-3.5 inline mr-1 text-gray-400" />
                        {p.language}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/programs/${p.slug}`}
                          className="text-[#9B1B30] hover:text-[#7A1526]"
                          aria-label={c.programPageLink}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Why study MBBS — three cards */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-5">{c.footerFactsTitle}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white border-2 border-gray-200 p-5">
              <Award className="h-6 w-6 text-[#9B1B30] mb-2" />
              <h3 className="font-bold text-[#1B2A4A] mb-2">{c.factRecognizedTitle}</h3>
              <p className="text-sm text-[#374151] leading-relaxed">
                {c.factRecognizedBody}
              </p>
            </div>
            <div className="bg-white border-2 border-gray-200 p-5">
              <Globe className="h-6 w-6 text-[#9B1B30] mb-2" />
              <h3 className="font-bold text-[#1B2A4A] mb-2">{c.factEnglishTitle}</h3>
              <p className="text-sm text-[#374151] leading-relaxed">{c.factEnglishBody}</p>
            </div>
            <div className="bg-white border-2 border-gray-200 p-5">
              <GraduationCap className="h-6 w-6 text-[#9B1B30] mb-2" />
              <h3 className="font-bold text-[#1B2A4A] mb-2">{c.factInternshipTitle}</h3>
              <p className="text-sm text-[#374151] leading-relaxed">
                {c.factInternshipBody}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-2">{c.sectionFaq}</h2>
          <p className="text-sm text-[#6B7280] mb-5">{c.sectionFaqHint}</p>
          <FAQ items={faqs} />
        </section>

        {/* CTA */}
        <section className="bg-[#1B2A4A] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">{c.ctaTitle}</h2>
            <p className="mt-3 text-gray-300 max-w-2xl mx-auto">{c.ctaBody}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/assessment?major=${encodeURIComponent('Medicine')}`}
                className="inline-flex items-center gap-2 bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold px-6 py-2.5 text-sm transition-colors"
              >
                {c.ctaAssessment}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {c.ctaContact}
              </Link>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {c.ctaBrowse}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
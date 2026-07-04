import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  ArrowRight,
  Banknote,
  Building2,
  ChevronRight,
  GraduationCap,
  MapPin,
} from 'lucide-react';
import { getAllUniversities } from '@/lib/data-fetcher';
import { FAQ, type FAQItem } from '@/components/listicles/faq';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

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
    ctaScholarships: string;
    ctaAllUnis: string;
    colUniversity: string;
    colCity: string;
    colTuitionUg: string;
    colTuitionG: string;
    colRanking: string;
    colType: string;
    emptyState: string;
    emptyStateLink: string;
    footerFactsTitle: string;
    factUnderTitle: string;
    factUnderBody: string;
    factGraduateTitle: string;
    factGraduateBody: string;
    factLivingTitle: string;
    factLivingBody: string;
    scholarshipBadge: string;
    pageNote: string;
  }
> = {
  en: {
    breadcrumbHome: 'Home',
    breadcrumbCurrent: 'Cheapest Universities in China',
    eyebrow: 'GUIDE · BUDGET',
    h1: 'Cheapest Universities in China for International Students (2026)',
    subhead:
      'Sorted by annual tuition — every Chinese university in the SICA catalog ranked by cost, including dorm + insurance estimates.',
    leadParagraph:
      'Studying in China is one of the most affordable paths to a globally-recognized degree. Bachelor programs start at ¥14,000/year (~US$2,000) and most English-medium master\'s programs run ¥20,000-35,000/year. The table below ranks every Chinese university in the SICA catalog by undergraduate tuition, lowest first. All figures are 2025-2026 published rates sourced from each university\'s official admissions page. Dorm costs (¥4,000-12,000/year) and insurance (~¥800/year) are listed separately so you can budget accurately.',
    sectionTable: 'Universities ranked by undergraduate tuition (lowest first)',
    sectionFaq: 'Frequently asked questions',
    sectionFaqHint:
      'Click any question to expand the answer. The same Q&A appears in the JSON-LD FAQPage schema at the bottom of this page.',
    ctaTitle: 'Need help budgeting your China degree?',
    ctaBody:
      'SICA counselors help you compare costs, apply for tuition waivers and CSC scholarships, and plan your living budget city-by-city. Free initial consultation.',
    ctaAssessment: 'Start free assessment',
    ctaContact: 'Talk to a counselor',
    ctaScholarships: 'Browse scholarships',
    ctaAllUnis: 'View all universities',
    colUniversity: 'University',
    colCity: 'City',
    colTuitionUg: 'Tuition (UG/year)',
    colTuitionG: 'Tuition (Grad/year)',
    colRanking: 'Rank',
    colType: 'Type',
    emptyState: 'No universities are currently in the SICA catalog.',
    emptyStateLink: 'Browse all universities',
    footerFactsTitle: 'What "cheap" actually means in China',
    factUnderTitle: 'Undergraduate from ¥14,000/year',
    factUnderBody:
      'The cheapest English-medium bachelor programs in the SICA catalog start at ¥14,000/year — about US$2,000. That covers tuition only; add ¥4,000-8,000/year for an on-campus dorm and ~¥800/year for medical insurance to get a realistic all-in budget of ¥18,800-22,800/year (US$2,650-3,200).',
    factGraduateTitle: 'Graduate from ¥18,000/year',
    factGraduateBody:
      'Most English-medium master\'s programs run ¥20,000-35,000/year. The cheapest graduate programs in the catalog (mostly normal universities outside Tier 1 cities) start at ¥18,000/year. Top-tier programs at Tsinghua / Peking / Fudan run ¥30,000-50,000/year but offset the cost with larger scholarship pools.',
    factLivingTitle: 'Living costs from ¥1,500/month',
    factLivingBody:
      'Outside Beijing/Shanghai/Shenzhen, monthly living costs run ¥1,500-2,500 (dorm + food + transport + phone + entertainment). Tier 1 cities run ¥3,000-4,500/month. SICA can help you pick a city that matches your budget — Wuhan, Xi\'an, Changsha, and Kunming offer flagship-university quality at Tier 2 prices.',
    scholarshipBadge: 'Has scholarships',
    pageNote:
      'Tuition figures are pulled from each university\'s official admissions page. Dorm + insurance estimates added separately. Verify the latest rates with SICA before applying.',
  },
  zh: {
    breadcrumbHome: '首页',
    breadcrumbCurrent: '中国最便宜的大学',
    eyebrow: '指南 · 预算',
    h1: '2026 来华留学最便宜的大学（国际生）',
    subhead:
      '按年学费排序——SICA 目录中所有中国大学按学费由低到高排名，含住宿与保险估算。',
    leadParagraph:
        '来华留学是获得全球认可学位的最经济路径之一。本科项目学费 ¥14,000/年（约 2,000 美元）起，多数英文授课硕士项目为 ¥20,000-35,000/年。下表按本科学费由低到高展示 SICA 目录中的所有中国大学。所有数字为各校官方招生网 2025-2026 学年公布数据。住宿费（¥4,000-12,000/年）和保险费（~¥800/年）单独列出，方便准确预算。',
    sectionTable: '按本科学费由低到高排名',
    sectionFaq: '常见问题',
    sectionFaqHint:
      '点击问题展开答案。同一组问答以 JSON-LD FAQPage 结构化数据嵌入页面底部，便于 AI 引擎直接抓取。',
    ctaTitle: '需要帮你规划留学预算？',
    ctaBody:
      'SICA 顾问可帮你对比费用、申请学费减免与 CSC 奖学金、按城市规划生活费。首次咨询免费。',
    ctaAssessment: '开始免费评估',
    ctaContact: '联系顾问',
    ctaScholarships: '浏览奖学金',
    ctaAllUnis: '查看全部大学',
    colUniversity: '大学',
    colCity: '城市',
    colTuitionUg: '本科年学费',
    colTuitionG: '研究生年学费',
    colRanking: '排名',
    colType: '类型',
    emptyState: 'SICA 目录中暂无大学数据。',
    emptyStateLink: '浏览全部大学',
    footerFactsTitle: '"便宜"在中国的真正含义',
    factUnderTitle: '本科 ¥14,000/年起',
    factUnderBody:
        'SICA 目录中最便宜的英文授课本科项目学费 ¥14,000/年（约 2,000 美元），仅含学费。校内住宿 ¥4,000-8,000/年 + 医疗保险 ~¥800/年，全部费用预算 ¥18,800-22,800/年（2,650-3,200 美元）。',
    factGraduateTitle: '研究生 ¥18,000/年起',
    factGraduateBody:
        '多数英文授课硕士项目学费 ¥20,000-35,000/年。目录中最便宜的研究生项目（多为一二线城市外的普通高校）学费 ¥18,000/年起。清华、北大、复旦等顶尖项目学费 ¥30,000-50,000/年，但奖学金池更大可抵消部分费用。',
    factLivingTitle: '生活费 ¥1,500/月起',
    factLivingBody:
        '北京、上海、深圳以外城市月生活费 ¥1,500-2,500（住宿 + 餐饮 + 交通 + 手机 + 娱乐）。一线城市 ¥3,000-4,500/月。SICA 可帮你挑选预算匹配的城市——武汉、西安、长沙、昆明能以二线城市价格提供一流大学质量。',
    scholarshipBadge: '可申请奖学金',
    pageNote:
        '学费数据取自各校官方招生网。住宿与保险费用单独列出。申请前请联系 SICA 核实最新数据。',
  },
};

const FAQS: Record<Locale, FAQItem[]> = {
  en: [
    {
      question: 'What is the cheapest university in China for international students?',
      answer:
        'Among universities in the SICA catalog, China Jiliang University, Zhejiang International Studies University, and several Hunan/Guangxi regional universities offer English-medium bachelor programs starting at ¥14,000-18,000/year — the lowest in the country. All are MOE-recognized, all accept international students, and all teach in English at the bachelor level.',
    },
    {
      question: 'How much does it cost to study in China per year (all-in)?',
      answer:
        'A realistic all-in budget for a low-cost Chinese university: ¥14,000-22,000 tuition + ¥4,000-8,000 dorm + ¥800 insurance + ¥18,000-30,000 living = ¥36,800-60,800/year (~US$5,200-8,600). Tier 1 city universities (Tsinghua, Peking, Fudan, Shanghai Jiao Tong) run ¥80,000-130,000/year all-in. Apply early — most universities waive 30-100% of tuition for top applicants.',
    },
    {
      question: 'Are there scholarships for low-tuition universities?',
      answer:
        'Yes. Three layers stack: (1) Chinese Government Scholarship (CSC) — full tuition + dorm + ¥2,500/month stipend, awarded regardless of which university hosts you; (2) university-specific tuition waivers — most low-cost universities waive 50-100% of tuition for students with GPA 3.5+; (3) provincial government scholarships (Beijing, Shanghai, Jiangsu, Zhejiang, etc.) — typically ¥20,000-50,000/year. SICA helps you stack all three.',
    },
    {
      question: 'Is a cheap Chinese university still good quality?',
      answer:
        'For most disciplines, yes. Many "cheap" universities in the SICA catalog are MOE-recognized, English-medium, and graduate thousands of international students each year. The cheapest options are typically outside Tier 1 cities — Wuhan University, Xi\'an Jiaotong, Central South, Huazhong University of Science and Technology, and others routinely appear in global QS / ARWU rankings at top-500 positions. The deciding factors are usually fit (program + city) and English-medium availability, not the headline tuition.',
    },
    {
      question: 'Do cheap Chinese universities teach in English?',
      answer:
        'It depends on the program, not the price. Most bachelor programs at low-tuition regional universities are taught in Chinese (you\'ll need HSK 4-5). Several — including Zhejiang International Studies, China Jiliang, and a handful of Guangxi/Hunan medical universities — offer fully English-medium programs at low tuition. Filter by "language: English" on the /programs page to see only English-medium options.',
    },
    {
      question: 'What is included in the tuition fee?',
      answer:
        'Tuition covers academic instruction, use of campus facilities (library, labs, gym), and access to student services. It does NOT typically include: dorm (¥4,000-12,000/year extra), textbooks (¥500-1,500/year), medical insurance (~¥800/year), visa/residence permit (~¥400-800/year), or meals (¥600-1,200/month). A handful of "package" programs (especially MBBS) bundle dorm + insurance + visa — check the program page for the breakdown.',
    },
    {
      question: 'How much does living cost in China on a budget?',
      answer:
        'Outside Beijing/Shanghai/Shenzhen: ¥1,500-2,500/month covers dorm + 3 meals/day in the cafeteria + bus/metro + phone + occasional entertainment. Tier 1 cities: ¥3,000-4,500/month. Cooking for yourself (rather than eating all meals in the cafeteria) cuts the food bill by 30-50%. Many universities also offer part-time library / lab / admin assistant jobs for international students (legal under X1 visa with school permission) that cover another 30-50% of your living costs.',
    },
    {
      question: 'Can I work part-time while studying at a cheap Chinese university?',
      answer:
        'Yes — under the X1 student visa, you can work part-time (≤20 hours/week) on campus with permission from your university\'s international student office. Typical on-campus roles: library assistant, lab assistant, dorm RA, research assistant, Chinese-language tutor (for incoming Chinese students learning English), cafeteria cashier. Off-campus work is restricted but possible with prior approval. Most international students earn ¥1,500-3,000/month this way — enough to cover 30-50% of living costs.',
    },
  ],
  zh: [
    {
      question: '中国最便宜的大学是哪所？',
      answer:
        '在 SICA 目录中，中国计量大学、浙江外国语学院及湖南、广西的若干地方高校开设有学费 ¥14,000-18,000/年的英文授课本科项目，是全国最低价位。所有学校均获教育部认可、招收国际生、本科阶段提供英文授课。',
    },
    {
      question: '来华留学一年的全部费用大概多少？',
      answer:
        '低费用大学的真实预算：学费 ¥14,000-22,000 + 住宿 ¥4,000-8,000 + 保险 ¥800 + 生活费 ¥18,000-30,000 = 合计 ¥36,800-60,800/年（约 5,200-8,600 美元）。一线城市顶尖高校（清华、北大、复旦、上海交大）合计 ¥80,000-130,000/年。尽早申请——多数大学为优秀申请者减免 30-100% 学费。',
    },
    {
      question: '学费低的大学也有奖学金吗？',
      answer:
        '有。三层叠加：（1）中国政府奖学金（CSC）——全额学费 + 住宿 + ¥2,500/月生活补贴，与所在学校无关；（2）院校学费减免——多数低学费大学为 GPA 3.5+ 申请者减免 50-100% 学费；（3）省市奖学金（北京、上海、江苏、浙江等）——通常 ¥20,000-50,000/年。SICA 可协助并行申请。',
    },
    {
      question: '便宜的大学教学质量有保障吗？',
      answer:
        '对大多数学科来说，有保障。SICA 目录中的许多"便宜"大学均获教育部认可、提供英文授课、每年毕业数千名国际生。最便宜的选项通常位于一线城市之外——武汉大学、西安交大、中南大学、华中科技大学等常年位列 QS / ARWU 全球前 500 名。决定因素通常是匹配度（专业 + 城市）与英文授课可得性，而非学费数字本身。',
    },
    {
      question: '学费低的大学是否英文授课？',
      answer:
        '取决于具体专业，与价格无关。多数低学费地方大学的本科项目为中文授课（需 HSK 4-5）。但部分学校——包括浙江外国语学院、中国计量大学及广西、湖南的少数医学院——在低学费下提供全英文授课项目。在 /programs 页面按"语言：English"筛选即可查看所有英文授课选项。',
    },
    {
      question: '学费包含哪些内容？',
      answer:
        '学费覆盖课堂教学、校园设施使用（图书馆、实验室、健身房）、学生服务。通常不含：住宿（¥4,000-12,000/年）、教材（¥500-1,500/年）、医疗保险（~¥800/年）、签证/居留许可（~¥400-800/年）、餐饮（¥600-1,200/月）。少数"套餐"项目（尤其 MBBS）会打包住宿 + 保险 + 签证——具体见项目页面说明。',
    },
    {
      question: '中国低预算生活成本如何？',
      answer:
        '北京、上海、深圳以外：¥1,500-2,500/月可覆盖住宿 + 食堂三餐 + 公交地铁 + 手机 + 偶尔娱乐。一线城市：¥3,000-4,500/月。自己做饭（而非全部食堂）可节省 30-50% 餐饮开支。多数大学还提供校内兼职（图书馆助理、实验室助理、宿舍 RA、研究助理、中文家教等），合法且收入 ¥1,500-3,000/月，可覆盖 30-50% 生活费。',
    },
    {
      question: '在便宜的中国大学可以兼职吗？',
      answer:
        '可以。持 X1 学生签证经学校国际学生办公室批准后可做 ≤20 小时/周的校内兼职。常见岗位：图书馆助理、实验室助理、宿舍 RA、研究助理、中文家教（教来华学英语的中国学生）、食堂收银员。校外工作受限但可申请提前批准。多数国际生月收入 ¥1,500-3,000，可覆盖 30-50% 生活费。',
    },
  ],
};

// Parse tuition out of the `tuitionUndergrad` / `tuitionGraduate`
// strings for sorting. The DB stores values like "¥30,000/year",
// "RMB 25,000/year", "14000 元/年", etc. We just grab the first
// integer — sorting by "lowest known tuition" is good enough for
// a listicle; the table itself shows the full string so users
// see the exact rate.
function parseTuition(s: string | undefined): number {
  if (!s) return Infinity;
  const m = s.match(/(\d[\d,]*)/);
  if (!m) return Infinity;
  return parseInt(m[1].replace(/,/g, ''), 10);
}

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const c = COPY[locale];
  return {
    title: c.h1,
    description: c.subhead,
    alternates: { canonical: `${SITE_URL}/cheapest-universities-china` },
    openGraph: {
      title: c.h1,
      description: c.subhead,
      url: `${SITE_URL}/cheapest-universities-china`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: c.h1, description: c.subhead },
  };
}

export default async function CheapestUniversitiesPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const c = COPY[locale];

  const universities = await getAllUniversities();

  // Filter: drop rows that have neither tuition field populated
  // (incomplete data shouldn't appear at the top of a "cheapest"
  // listicle). Then sort ascending by undergrad tuition.
  const withTuition = universities
    .filter((u) => u.tuitionUndergrad || u.tuitionGraduate)
    .sort((a, b) => parseTuition(a.tuitionUndergrad) - parseTuition(b.tuitionGraduate));

  const lowest = withTuition[0]?.tuitionUndergrad ?? '—';
  const undergradCount = withTuition.filter((u) => u.tuitionUndergrad).length;
  const publicCount = withTuition.filter((u) => u.type === 'Public').length;

  const faqs = FAQS[locale];
  const isZh = locale === 'zh';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: c.breadcrumbHome, item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: c.breadcrumbCurrent,
        item: `${SITE_URL}/cheapest-universities-china`,
      },
    ],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: c.h1,
    description: c.subhead,
    numberOfItems: withTuition.length,
    itemListElement: withTuition.map((u, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: isZh && u.nameCn ? u.nameCn : u.name,
      url: `${SITE_URL}/universities/${u.slug}`,
      description: `${(isZh && u.nameCn ? u.nameCn : u.name)} · ${u.city} · ${u.tuitionUndergrad}`,
    })),
  };

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
              <Banknote className="h-4 w-4" />
              {c.eyebrow}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              {c.h1}
            </h1>
            <p className="mt-3 text-lg text-gray-300 max-w-3xl">{c.subhead}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300">
              <span className="flex items-center gap-1.5">
                <Banknote className="h-4 w-4" />
                {isZh ? '本科从 ¥' : 'From '}
                {parseTuition(lowest).toLocaleString()}
                {isZh ? '/年起' : '/year UG'}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {withTuition.length} {isZh ? '所大学' : 'universities'}
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                {undergradCount} {isZh ? '个本科报价' : 'UG rates listed'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {publicCount} {isZh ? '所公立' : 'public'}
              </span>
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
          <p className="mt-4 text-xs text-[#6B7280] italic">{c.pageNote}</p>
        </section>

        {/* Universities table */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-5">{c.sectionTable}</h2>
          {withTuition.length === 0 ? (
            <div className="bg-white border-2 border-gray-200 p-8 text-center">
              <p className="text-gray-600">
                {c.emptyState}{' '}
                <Link href="/universities" className="text-[#9B1B30] hover:underline font-semibold">
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
                    <th className="text-left px-4 py-3 font-semibold w-10">#</th>
                    <th className="text-left px-4 py-3 font-semibold">{c.colUniversity}</th>
                    <th className="text-left px-4 py-3 font-semibold">{c.colCity}</th>
                    <th className="text-left px-4 py-3 font-semibold">{c.colTuitionUg}</th>
                    <th className="text-left px-4 py-3 font-semibold">{c.colTuitionG}</th>
                    <th className="text-left px-4 py-3 font-semibold">{c.colRanking}</th>
                    <th className="text-left px-4 py-3 font-semibold">{c.colType}</th>
                    <th className="text-left px-4 py-3 font-semibold w-10" />
                  </tr>
                </thead>
                <tbody>
                  {withTuition.map((u, i) => (
                    <tr
                      key={u.slug}
                      className={`border-t border-gray-200 hover:bg-[#FAFAF8] transition-colors ${
                        i % 2 === 1 ? 'bg-gray-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/universities/${u.slug}`}
                          className="font-semibold text-[#1B2A4A] hover:text-[#9B1B30] transition-colors"
                        >
                          {isZh && u.nameCn ? u.nameCn : u.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        <MapPin className="h-3.5 w-3.5 inline mr-1 text-gray-400" />
                        {isZh && u.cityCn ? u.cityCn : u.city}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-semibold">
                        {u.tuitionUndergrad || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {u.tuitionGraduate || '—'}
                      </td>
                      <td className="px-4 py-3 text-[#9B1B30] font-semibold whitespace-nowrap">
                        {u.ranking > 0 ? `#${u.ranking}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {isZh && u.typeCn ? u.typeCn : u.type}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/universities/${u.slug}`}
                          className="text-[#9B1B30] hover:text-[#7A1526]"
                          aria-label={(isZh && u.nameCn) || u.name}
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

        {/* What "cheap" actually means */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-5">{c.footerFactsTitle}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white border-2 border-gray-200 p-5">
              <Banknote className="h-6 w-6 text-[#9B1B30] mb-2" />
              <h3 className="font-bold text-[#1B2A4A] mb-2">{c.factUnderTitle}</h3>
              <p className="text-sm text-[#374151] leading-relaxed">{c.factUnderBody}</p>
            </div>
            <div className="bg-white border-2 border-gray-200 p-5">
              <GraduationCap className="h-6 w-6 text-[#9B1B30] mb-2" />
              <h3 className="font-bold text-[#1B2A4A] mb-2">{c.factGraduateTitle}</h3>
              <p className="text-sm text-[#374151] leading-relaxed">{c.factGraduateBody}</p>
            </div>
            <div className="bg-white border-2 border-gray-200 p-5">
              <MapPin className="h-6 w-6 text-[#9B1B30] mb-2" />
              <h3 className="font-bold text-[#1B2A4A] mb-2">{c.factLivingTitle}</h3>
              <p className="text-sm text-[#374151] leading-relaxed">{c.factLivingBody}</p>
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
                href="/assessment"
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
                href="/scholarships"
                className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {c.ctaScholarships}
              </Link>
              <Link
                href="/universities"
                className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {c.ctaAllUnis}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
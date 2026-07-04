import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  ArrowRight,
  Award,
  Building2,
  ChevronRight,
  Globe,
  GraduationCap,
  MapPin,
  Users,
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
    ctaCompare: string;
    ctaAllUnis: string;
    colUniversity: string;
    colCity: string;
    colCnRank: string;
    colQsRank: string;
    colIntl: string;
    colType: string;
    emptyState: string;
    emptyStateLink: string;
    footerFactsTitle: string;
    factDualRankTitle: string;
    factDualRankBody: string;
    factIntlTitle: string;
    factIntlBody: string;
    factEnglishTitle: string;
    factEnglishBody: string;
    scholarshipBadge: string;
  }
> = {
  en: {
    breadcrumbHome: 'Home',
    breadcrumbCurrent: 'Best Universities in China',
    eyebrow: 'GUIDE · RANKINGS',
    h1: 'Best Universities in China for International Students (2026 Ranking)',
    subhead:
      'Every Chinese university in the SICA catalog ranked by domestic ranking, with QS World Ranking, international student population, and city.',
    leadParagraph:
        'Choosing where to study in China means balancing three things: domestic ranking (how the university is viewed by Chinese employers), QS World Ranking (how it looks on a global CV), and the size of its international student community (which determines English-medium program availability, support services, and your day-to-day peer group). This list ranks every university in the SICA catalog by domestic ranking, lowest (= best) first. For a deeper look at any school, follow the link to its full profile.',
    sectionTable: 'All universities ranked by domestic ranking',
    sectionFaq: 'Frequently asked questions',
    sectionFaqHint:
      'Click any question to expand the answer. The same Q&A appears in the JSON-LD FAQPage schema at the bottom of this page.',
    ctaTitle: 'Need help choosing?',
    ctaBody:
      'SICA counselors help you match the right university to your goals, budget, and English/Chinese language level. Free initial consultation.',
    ctaAssessment: 'Start free assessment',
    ctaContact: 'Talk to a counselor',
    ctaCompare: 'Compare universities side-by-side',
    ctaAllUnis: 'View all universities',
    colUniversity: 'University',
    colCity: 'City',
    colCnRank: 'CN Rank',
    colQsRank: 'QS World',
    colIntl: 'Intl. Students',
    colType: 'Type',
    emptyState: 'No universities are currently in the SICA catalog.',
    emptyStateLink: 'Browse all universities',
    footerFactsTitle: 'How "best" is decided',
    factDualRankTitle: 'Domestic + QS World',
    factDualRankBody:
        'We rank by domestic ranking (Ministry of Education / CUSR consensus) because that is what determines employer perception inside China. QS World Ranking is surfaced as a secondary column for global CV visibility — most flagship Chinese universities sit in the QS top 500, with ~15 in the top 200.',
    factIntlTitle: 'International student population',
    factIntlBody:
        'A larger international student body typically means more English-medium programs, a stronger international student office, English-speaking counselors, and a more diverse peer group. Universities with 3,000+ international students (Zhejiang, Xiamen, Wuhan, Fudan, etc.) tend to have the smoothest onboarding for new arrivals.',
    factEnglishTitle: 'English-medium availability',
    factEnglishBody:
        'All universities on this page offer at least some English-medium programs at the master\'s level. Bachelor\'s English-medium availability is more selective — top research universities (Tsinghua, Peking, Fudan, Shanghai Jiao Tong) and joint-venture programs (University of Nottingham Ningbo, Xi\'an Jiaotong-Liverpool) are the safest picks.',
    scholarshipBadge: 'Has scholarships',
  },
  zh: {
    breadcrumbHome: '首页',
    breadcrumbCurrent: '中国最好的大学',
    eyebrow: '指南 · 排名',
    h1: '2026 来华留学最好的大学（排名）',
    subhead:
      'SICA 目录中所有中国大学按国内排名排序，含 QS 世界排名、国际学生人数与城市。',
    leadParagraph:
        '选择来华大学需平衡三件事：国内排名（中国雇主如何看）、QS 世界排名（全球简历上的呈现）、以及国际学生社区规模（决定英文授课项目可得性、支持服务、你的日常同伴群体）。本页按国内排名由低到高展示 SICA 目录中的所有大学。深入了解请进入各校详细页面。',
    sectionTable: '所有大学按国内排名排序',
    sectionFaq: '常见问题',
    sectionFaqHint:
      '点击问题展开答案。同一组问答以 JSON-LD FAQPage 结构化数据嵌入页面底部，便于 AI 引擎直接抓取。',
    ctaTitle: '需要帮你选校？',
    ctaBody:
      'SICA 顾问可帮你根据目标、预算、英文/中文水平匹配合适大学。首次咨询免费。',
    ctaAssessment: '开始免费评估',
    ctaContact: '联系顾问',
    ctaCompare: '并排对比大学',
    ctaAllUnis: '查看全部大学',
    colUniversity: '大学',
    colCity: '城市',
    colCnRank: '国内排名',
    colQsRank: 'QS 世界',
    colIntl: '国际生人数',
    colType: '类型',
    emptyState: 'SICA 目录中暂无大学数据。',
    emptyStateLink: '浏览全部大学',
    footerFactsTitle: '"最好"的判定标准',
    factDualRankTitle: '国内 + QS 世界',
    factDualRankBody:
        '我们按国内排名（教育部 / CUSR 共识）排序，因为这决定中国雇主的认可度。QS 世界排名作为副列展示，便于全球简历呈现——多数中国一流大学位列 QS 前 500，约 15 所进入前 200。',
    factIntlTitle: '国际学生群体',
    factIntlBody:
        '更大的国际学生群体通常意味着更多英文授课项目、更强的国际学生办公室、英文辅导员、更国际化的同伴群体。国际生超过 3,000 人的大学（浙大、厦大、武大、复旦等）通常为新生提供最顺畅的过渡。',
    factEnglishTitle: '英文授课可得性',
    factEnglishBody:
        '本页所有大学至少提供部分英文授课硕士项目。本科英文授课可得性更挑剔——顶尖研究型大学（清华、北大、复旦、上海交大）与中外合办项目（宁波诺丁汉、西交利物浦）是最稳妥的选择。',
    scholarshipBadge: '可申请奖学金',
  },
};

const FAQS: Record<Locale, FAQItem[]> = {
  en: [
    {
      question: 'What is the #1 university in China for international students?',
      answer:
        'By combined domestic ranking + international student community + English-medium program availability, Tsinghua University and Peking University consistently top the list. Both rank in the QS World top 20 and accept 3,000-4,000 international students per year. For international students specifically (rather than Chinese applicants), Fudan, Shanghai Jiao Tong, Zhejiang, and Wuhan are also excellent picks — all ranked in the QS top 200, all with 5,000+ international students, all with strong English-medium master\'s programs.',
    },
    {
      question: 'How are Chinese universities ranked?',
      answer:
        'Three independent ranking systems matter: (1) domestic ranking from the Ministry of Education / CUSR (used for government funding + Chinese employer perception); (2) QS World University Ranking (used for global CV + immigration points in many countries); (3) ARWU Shanghai Ranking (used for research output). The same university can rank differently across the three — Tsinghua is #1 domestically, #20 in QS, #22 in ARWU. For international students, we recommend using domestic ranking as the primary signal (since it determines job-market perception in China) and QS as the secondary (since it determines global recognition).',
    },
    {
      question: 'Are the best universities in China taught in English?',
      answer:
        'Yes — Tsinghua, Peking, Fudan, Shanghai Jiao Tong, Zhejiang, Nanjing, USTC, Wuhan, Sun Yat-sen, and all other QS-top-200 Chinese universities offer at least 20-40 English-medium programs each at the master\'s level. Bachelor\'s English-medium availability is narrower (typically 5-15 programs per top university). For maximum English-medium flexibility at the bachelor\'s level, consider the joint-venture programs: University of Nottingham Ningbo China (UNNC), Xi\'an Jiaotong-Liverpool University (XJTLU), Wenzhou-Kean University, and UIC (Beijing Normal-Hong Kong Baptist).',
    },
    {
      question: 'How much does it cost to attend a top Chinese university?',
      answer:
        'Bachelor tuition at Tsinghua / Peking / Fudan runs ¥30,000-50,000/year for English-medium programs (Chinese-medium tracks are cheaper, ¥20,000-26,000/year). Master\'s tuition runs ¥30,000-60,000/year for English-medium programs. All-in budget including dorm + insurance + living costs: ¥80,000-130,000/year at Tier 1 universities vs ¥40,000-65,000/year at Tier 2. Apply early — top universities waive 50-100% of tuition for outstanding applicants via their own scholarship programs.',
    },
    {
      question: 'Do top Chinese universities offer scholarships to international students?',
      answer:
        'Yes, and they are generous. (1) Chinese Government Scholarship (CSC) — covers tuition + dorm + ¥2,500-3,500/month stipend; ~3,000 awards per year across all Chinese universities; Tsinghua/Peking/Fudan get the largest share. (2) University-specific scholarships — Tsinghua\'s Schwarzman Scholars (fully funded 1-year master\'s), Peking\'s Yenching Academy, Fudan\'s Excellence Fellowship, Shanghai Jiao Tong\'s various named awards — typically waive 50-100% of tuition + monthly stipend for top applicants. (3) Confucius Institute Scholarship — for Chinese language and culture programs.',
    },
    {
      question: 'Which Chinese university is best for engineering / business / medicine?',
      answer:
        'Engineering: Tsinghua, Zhejiang, Shanghai Jiao Tong, Harbin Institute of Technology, Huazhong University of Science and Technology — all in QS top 100 for Engineering. Business: Peking (GSM), Tsinghua (SEM), Fudan, Shanghai Jiao Tong (Antai), CEIBS, Lingnan (Sun Yat-sen) — joint-venture MBAs (CEIBS, Antai) are particularly strong. Medicine (English-medium MBBS): Fudan, Zhengzhou, Yangzhou, Xuzhou Medical — all MOE-listed, all WHO-recognized, all 6-year English tracks.',
    },
    {
      question: 'How hard is it to get into a top Chinese university?',
      answer:
        'Harder than you might think for the very top schools (Tsinghua, Peking). Acceptance rates for international applicants sit around 10-15% for English-medium programs at top-5 schools. For Fudan / Shanghai Jiao Tong / Zhejiang / Nanjing / Wuhan, acceptance rates are 25-40% — comparable to a strong US public university. Strong academics (GPA 3.5+), English proficiency (IELTS 6.5+ / TOEFL 90+), and a clear statement of purpose are the deciding factors. Apply to 3-5 schools in parallel to maximize your chances.',
    },
    {
      question: 'Do employers recognize degrees from top Chinese universities?',
      answer:
        'Yes — and increasingly so. C9 League universities (the Chinese Ivy League: Peking, Tsinghua, Fudan, Shanghai Jiao Tong, Zhejiang, USTC, Nanjing, Harbin Institute of Technology, Xi\'an Jiaotong) are recognized by every Fortune 500 employer in Asia. QS-top-200 Chinese universities are widely recognized by multinationals globally. For immigration / further study purposes, Chinese bachelor\'s degrees from MOE-listed universities are accepted in the US, UK, Canada, Australia, EU, Singapore, and most Asian countries for further study and skilled-immigration points.',
    },
  ],
  zh: [
    {
      question: '中国最好的大学是哪所？',
      answer:
        '综合国内排名、国际学生群体、英文授课项目可得性，清华大学与北京大学始终位居榜首。两校均位列 QS 世界前 20，每年招收 3,000-4,000 名国际生。专就国际生而言（而非中国考生），复旦、上海交大、浙江大学、武汉大学也是极佳选择——均位列 QS 前 200，国际生均超 5,000 人，英文授课硕士项目实力雄厚。',
    },
    {
      question: '中国大学排名怎么算？',
      answer:
        '三套独立排名体系值得关注：（1）国内排名（教育部 / CUSR 共识），用于政府拨款 + 中国雇主认可；（2）QS 世界大学排名，用于全球简历 + 多个国家移民加分；（3）ARWU 上海交大排名，用于研究产出。同一所大学在不同体系下排名不同——清华国内第 1、QS 第 20、ARWU 第 22。对国际生，建议以国内排名为主信号（决定在中国就业市场的认可度），QS 为副（决定全球认可度）。',
    },
    {
      question: '最好的中国大学是英文授课吗？',
      answer:
        '是——清华、北大、复旦、上海交大、浙大、南大、中科大、武大、中山大学等 QS 前 200 中国大学每所至少提供 20-40 个英文授课硕士项目。本科英文授课可得性更窄（顶尖大学通常 5-15 个）。若本科阶段希望最大英文授课灵活性，可考虑中外合办项目：宁波诺丁汉大学（UNNC）、西交利物浦大学（XJTLU）、温州肯恩大学、北师香港浸大（UIC）。',
    },
    {
      question: '就读中国顶尖大学要多少钱？',
      answer:
        '清华、北大、复旦本科英文授课项目学费 ¥30,000-50,000/年（中文授课项目较便宜，¥20,000-26,000/年）。英文授课硕士 ¥30,000-60,000/年。含住宿 + 保险 + 生活费的合计预算：Tier 1 大学 ¥80,000-130,000/年，Tier 2 ¥40,000-65,000/年。尽早申请——顶尖大学通过自有奖学金项目为优秀申请者减免 50-100% 学费。',
    },
    {
      question: '中国顶尖大学有国际生奖学金吗？',
      answer:
        '有，且非常丰厚。（1）中国政府奖学金（CSC）——覆盖学费 + 住宿 + ¥2,500-3,500/月生活补贴；每年约 3,000 个名额；清华/北大/复旦占比最大。（2）院校奖学金——清华苏世民学者（1 年制全额硕士）、北大燕京学堂、复旦卓越奖学金、上海交大各类冠名奖学金——通常减免 50-100% 学费 + 月度补贴。（3）孔子学院奖学金——针对中文与文化项目。',
    },
    {
      question: '工科 / 商科 / 医学哪个中国大学最好？',
      answer:
        '工科：清华、浙大、上海交大、哈工大、华中科技大学——均位列 QS 工科前 100。商科：北大光华、清华经管、复旦、上海交大安泰、中欧国际工商学院（CEIBS）、中山大学岭南——合办 MBA（CEIBS、安泰）尤为突出。医学（英文授课 MBBS）：复旦、郑州、扬州、徐州医科大学——均教育部认可、WHO 认证、6 年制英文授课。',
    },
    {
      question: '考入中国顶尖大学难吗？',
      answer:
        '前 5 名（清华、北大）比想象中难。国际申请者录取率约 10-15%（英文授课项目）。复旦、上海交大、浙大、南大、武大录取率 25-40%——与美国强公立大学相当。决定因素是优秀学业（GPA 3.5+）、英语水平（雅思 6.5+ / 托福 90+）、清晰的个人陈述。建议同时申请 3-5 所以最大化录取概率。',
    },
    {
      question: '中国顶尖大学学历雇主认可吗？',
      answer:
        '认可，且越来越被认可。C9 联盟大学（中国版常春藤：北大、清华、复旦、上海交大、浙大、中科大、南大、哈工大、西安交大）被亚洲所有财富 500 强雇主认可。QS 前 200 中国大学被全球跨国公司广泛认可。就移民 / 升学而言，教育部认可中国大学的学士学位在美国、英国、加拿大、澳大利亚、欧盟、新加坡及多数亚洲国家都被接受用于深造与技能移民加分。',
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
    alternates: { canonical: `${SITE_URL}/best-universities-china` },
    openGraph: {
      title: c.h1,
      description: c.subhead,
      url: `${SITE_URL}/best-universities-china`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: c.h1, description: c.subhead },
  };
}

export default async function BestUniversitiesPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const c = COPY[locale];

  const universities = await getAllUniversities();

  // Sort by domestic ranking (smallest = best). Rows with ranking=0
  // (unranked) sink to the bottom. Stable secondary sort by name.
  const ranked = [...universities]
    .filter((u) => u.ranking > 0 || u.qsWorldRanking > 0)
    .sort((a, b) => {
      const ra = a.ranking > 0 ? a.ranking : Infinity;
      const rb = b.ranking > 0 ? b.ranking : Infinity;
      if (ra !== rb) return ra - rb;
      return (a.qsWorldRanking || Infinity) - (b.qsWorldRanking || Infinity);
    });

  const topRanked = ranked[0];
  const topQs = ranked.find((u) => u.qsWorldRanking > 0)?.qsWorldRanking ?? null;
  const qsTop100Count = ranked.filter((u) => u.qsWorldRanking > 0 && u.qsWorldRanking <= 100).length;
  const qsTop500Count = ranked.filter((u) => u.qsWorldRanking > 0 && u.qsWorldRanking <= 500).length;

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
        item: `${SITE_URL}/best-universities-china`,
      },
    ],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: c.h1,
    description: c.subhead,
    numberOfItems: ranked.length,
    itemListElement: ranked.map((u, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: isZh && u.nameCn ? u.nameCn : u.name,
      url: `${SITE_URL}/universities/${u.slug}`,
      description: `${(isZh && u.nameCn ? u.nameCn : u.name)} · ${u.city} · #${u.ranking} CN · QS #${u.qsWorldRanking}`,
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
              <Award className="h-4 w-4" />
              {c.eyebrow}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              {c.h1}
            </h1>
            <p className="mt-3 text-lg text-gray-300 max-w-3xl">{c.subhead}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {ranked.length} {isZh ? '所大学' : 'universities'}
              </span>
              {topRanked && (
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-[#D4A853]" />
                  {isZh ? '第 1 名：' : '#1: '}
                  {(isZh && topRanked.nameCn) || topRanked.name}
                </span>
              )}
              {topQs !== null && (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  {qsTop100Count} {isZh ? '所进入 QS 前 100' : 'in QS top 100'}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                {qsTop500Count} {isZh ? '所进入 QS 前 500' : 'in QS top 500'}
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
        </section>

        {/* Universities table */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-5">{c.sectionTable}</h2>
          {ranked.length === 0 ? (
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
                    <th className="text-left px-4 py-3 font-semibold">{c.colCnRank}</th>
                    <th className="text-left px-4 py-3 font-semibold">{c.colQsRank}</th>
                    <th className="text-left px-4 py-3 font-semibold">{c.colIntl}</th>
                    <th className="text-left px-4 py-3 font-semibold">{c.colType}</th>
                    <th className="text-left px-4 py-3 font-semibold w-10" />
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((u, i) => (
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
                      <td className="px-4 py-3 text-[#9B1B30] font-semibold whitespace-nowrap">
                        {u.ranking > 0 ? `#${u.ranking}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {u.qsWorldRanking > 0 ? `#${u.qsWorldRanking}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        <Users className="h-3.5 w-3.5 inline mr-1 text-gray-400" />
                        {u.intlStudents || '—'}
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

        {/* How "best" is decided */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-5">{c.footerFactsTitle}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white border-2 border-gray-200 p-5">
              <Award className="h-6 w-6 text-[#9B1B30] mb-2" />
              <h3 className="font-bold text-[#1B2A4A] mb-2">{c.factDualRankTitle}</h3>
              <p className="text-sm text-[#374151] leading-relaxed">{c.factDualRankBody}</p>
            </div>
            <div className="bg-white border-2 border-gray-200 p-5">
              <Users className="h-6 w-6 text-[#9B1B30] mb-2" />
              <h3 className="font-bold text-[#1B2A4A] mb-2">{c.factIntlTitle}</h3>
              <p className="text-sm text-[#374151] leading-relaxed">{c.factIntlBody}</p>
            </div>
            <div className="bg-white border-2 border-gray-200 p-5">
              <Globe className="h-6 w-6 text-[#9B1B30] mb-2" />
              <h3 className="font-bold text-[#1B2A4A] mb-2">{c.factEnglishTitle}</h3>
              <p className="text-sm text-[#374151] leading-relaxed">{c.factEnglishBody}</p>
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
                href="/universities/compare"
                className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {c.ctaCompare}
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
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { guideCards } from '@/lib/guides/hub-data';
import { GuideIcons } from '@/components/guides/guide-page';

import { SITE_URL } from '@/lib/site-url';
export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const isZh = locale === 'zh';
  return {
    title: isZh
      ? '中国留学完整指南：申请、签证、生活全攻略'
      : 'Guides to Studying in China: applications, visas, and student life',
    description: isZh
      ? 'SICA指南库：系统讲解来华留学的申请流程、签证办理、奖学金、校园生活与职业发展。'
      : 'SICA\'s definitive guides to studying in China: applications, visas, scholarships, student life, and career outcomes.',
    alternates: { canonical: `${SITE_URL}/guides` },
    openGraph: {
      title: isZh ? '中国留学完整指南' : 'SICA Guides',
      description: isZh
        ? '系统讲解来华留学的申请流程、签证办理、奖学金、校园生活与职业发展。'
        : 'The SICA guide library: applications, visas, scholarships, student life.',
      url: `${SITE_URL}/guides`,
      type: 'website',
    },
  };
}

export default async function GuidesHubPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const cards = guideCards[locale];
  const isZh = locale === 'zh';

  // JSON-LD: ItemList so the hub itself can surface in search results
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: cards.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.title,
      description: c.subtitle,
      url: `${SITE_URL}${c.href}`,
    })),
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Hero — same bg-image + left-to-right navy gradient overlay
          as the /about page hero so the visual treatment is
          consistent across the public surface. */}
      <section className="relative overflow-hidden text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero-bg.avif)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A] via-[#1B2A4A]/80 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 mb-6">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {isZh ? '指南库' : 'GUIDE LIBRARY'}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              {isZh ? '中国留学完整指南' : 'The SICA Guide Library'}
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              {isZh
                ? '从录取到入学，从校园到职业——每一步的权威指南。'
                : 'Authoritative, up-to-date guides for every step of your study-in-China journey: from application to arrival, campus to career.'}
            </p>
          </div>
        </div>
      </section>

      {/* Cards grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <h2 className="text-2xl font-bold text-[#1B2A4A] mb-2">
          {isZh ? '6篇核心指南' : '6 essential guides'}
        </h2>
        <p className="text-[#4B5563] mb-8">
          {isZh
            ? '每篇都含 2,000+ 字深度内容、8+ 个常见问答、8 步实操流程，以及问答片段（FAQ schema）、步骤片段（HowTo schema）和文章元数据，便于 AI 引擎和搜索引擎抓取。'
            : 'Each guide ships with 2,000+ words of in-depth content, 8+ FAQs, 8-step process, plus FAQPage and HowTo structured data so search engines and AI assistants can extract the answers directly.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = GuideIcons[card.icon] ?? BookOpen;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col bg-white border-2 border-gray-200 hover:border-[#9B1B30] p-6 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#1B2A4A] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#D4A853]" />
                  </div>
                  <span className="text-xs text-[#6B7280] uppercase tracking-wider">
                    {card.readTime}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-[#4B5563] leading-relaxed mb-4 flex-1">
                  {card.subtitle}
                </p>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9B1B30]">
                    {card.highlight}
                  </span>
                  <span className="text-sm font-medium text-[#9B1B30] flex items-center gap-1 group-hover:gap-2 transition-all">
                    {isZh ? '阅读' : 'Read'} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* What's inside (GEO/AEO transparency note) */}
      <section className="bg-white border-t-2 border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-3">
            {isZh ? '指南里有什么' : "What's inside every guide"}
          </h2>
          <p className="text-[#4B5563] mb-6 max-w-3xl">
            {isZh
              ? '每篇指南都是为搜索引擎和 AI 引擎（ChatGPT、Perplexity、Gemini、Google AI Overviews）优化过的：'
              : 'Every guide is engineered for both classic search and AI engines (ChatGPT, Perplexity, Gemini, Google AI Overviews):'}
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(isZh
              ? [
                  '顶部 100 字 TL;DR 直接答案',
                  '关键要点侧边栏',
                  '目录锚点',
                  '结构化 H2/H3 标题',
                  '表格与编号列表',
                  '8+ 步 HowTo 流程',
                  '6-8 个 FAQ 含 Q&A',
                  'Article / FAQPage / HowTo schema',
                  '中英双语版本',
                ]
              : [
                  '100-word TL;DR direct answer at the top',
                  'Key takeaways sidebar',
                  'Anchor-linked table of contents',
                  'H2/H3 heading hierarchy',
                  'Tables and numbered lists',
                  '8+ step HowTo process',
                  '6-8 Q&A FAQ block',
                  'Article + FAQPage + HowTo JSON-LD',
                  'Bilingual EN/ZH versions',
                ]
            ).map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-[#374151] leading-relaxed"
              >
                <span className="shrink-0 w-5 h-5 bg-[#9B1B30] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <GraduationCap className="w-10 h-10 text-[#D4A853] mx-auto mb-3" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              {isZh ? '不想自己 DIY？让 SICA 帮你走完流程' : 'Prefer not to DIY? Let SICA handle the workflow.'}
            </h2>
            <p className="text-gray-300 mb-6">
              {isZh
                ? 'SICA 顾问会帮你筛选学校、整理材料、申请奖学金、办签证。从匹配项目到入学，我们全程跟进。'
                : 'SICA counselors help you shortlist universities, compile documents, apply for scholarships, and handle the visa. From matching to enrollment, we are with you every step.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#9B1B30] hover:bg-[#7A1526] text-white text-sm font-semibold uppercase tracking-wider transition-colors"
              >
                {isZh ? '开始免费评估' : 'Start free assessment'} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 hover:border-white text-white text-sm font-semibold uppercase tracking-wider transition-colors"
              >
                {isZh ? '联系顾问' : 'Talk to a counselor'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

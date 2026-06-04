import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Info,
  Compass,
  ClipboardList,
  Stamp,
  Award,
  Wallet,
  BedDouble,
  type LucideIcon,
} from 'lucide-react';
import type { Guide, GuideBlock } from '@/lib/guides/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sica.com.cn';

/**
 * Render a single guide block. Pure presentation — the page passes
 * in the data, this component just decides how to format it.
 */
function GuideBlockRenderer({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case 'p':
      return (
        <p className="text-[#374151] leading-relaxed text-base">{block.text}</p>
      );
    case 'h3':
      return (
        <div className="mt-6">
          <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">{block.text}</h3>
          <p className="text-[#374151] leading-relaxed text-base">{block.body}</p>
        </div>
      );
    case 'ul':
      return (
        <ul className="space-y-2 my-4">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[#374151] leading-relaxed">
              <CheckCircle2 className="w-5 h-5 text-[#9B1B30] shrink-0 mt-0.5" />
              <span dangerouslySetInnerHTML={{ __html: inlineMd(item) }} />
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="space-y-2 my-4 list-decimal pl-6 marker:text-[#9B1B30] marker:font-semibold">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="text-[#374151] leading-relaxed pl-2"
              dangerouslySetInnerHTML={{ __html: inlineMd(item) }}
            />
          ))}
        </ol>
      );
    case 'table':
      return (
        <div className="my-6 overflow-x-auto border-2 border-gray-200">
          <table className="w-full text-sm">
            <caption className="text-left p-3 bg-[#1B2A4A] text-white text-sm font-semibold">
              {block.caption}
            </caption>
            <thead className="bg-[#FAFAF8] border-b-2 border-gray-200">
              <tr>
                {block.columns.map((c, i) => (
                  <th
                    key={i}
                    className="text-left p-3 font-bold text-[#1B2A4A] text-xs uppercase tracking-wider"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className={ri % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]/50'}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`p-3 text-[#374151] ${ci === 0 ? 'font-semibold text-[#1B2A4A]' : ''}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'callout':
      return <Callout tone={block.tone} text={block.text} />;
  }
}

function Callout({ tone, text }: { tone: 'info' | 'success' | 'warning'; text: string }) {
  const styles = {
    info: { bg: 'bg-[#1B2A4A]/5', border: 'border-[#1B2A4A]', icon: Info, color: 'text-[#1B2A4A]' },
    success: { bg: 'bg-[#9B1B30]/5', border: 'border-[#9B1B30]', icon: CheckCircle2, color: 'text-[#9B1B30]' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-500', icon: AlertTriangle, color: 'text-amber-700' },
  };
  const s = styles[tone];
  const Icon = s.icon;
  return (
    <div className={`${s.bg} ${s.border} border-l-4 p-4 my-6 flex gap-3`}>
      <Icon className={`w-5 h-5 ${s.color} shrink-0 mt-0.5`} />
      <p className={`text-sm leading-relaxed ${s.color}`}>{text}</p>
    </div>
  );
}

/**
 * Convert `**bold**` markdown inline syntax to <strong> tags.
 * Kept intentionally simple — we only render this in trusted
 * (authored-in-repo) strings, never user input.
 */
function inlineMd(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-[#1B2A4A]">$1</strong>');
}

export interface GuidePageProps {
  guide: Guide;
  /** Path segment used for the canonical URL and JSON-LD id. */
  pathSegment: string;
}

/**
 * Shared layout used by all three long-form guide pages. Renders:
 *   1. Hero with H1 + stats
 *   2. Quick answer (TL;DR — AEO/GEO extraction target)
 *   3. Key takeaways
 *   4. Table of contents
 *   5. Sections (rendered as H2 + intro + blocks)
 *   6. FAQ with FAQPage JSON-LD
 *   7. How-to with HowTo JSON-LD
 *   8. Related guides
 *   9. Bottom CTA
 *
 * JSON-LD is injected inline via a <script type="application/ld+json">
 * so search engines, ChatGPT, Perplexity, and Gemini can extract the
 * FAQ answers, step lists, and metadata in a single hop.
 */
export function GuidePage({ guide, pathSegment }: GuidePageProps) {
  const url = `${SITE_URL}/guides/${pathSegment}`;

  // Article schema for E-E-A-T signals
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    author: {
      '@type': 'Organization',
      name: 'SICA Editorial Team',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SICA',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    datePublished: '2026-01-01',
    dateModified: new Date().toISOString().slice(0, 10),
    inLanguage: 'en',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  // FAQPage schema — the strongest GEO/AEO signal we can ship
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  // HowTo schema — extracted by Google and surfaced as step-by-step
  // rich results
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: guide.title,
    description: guide.description,
    totalTime: 'PT30M',
    step: guide.howToSteps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* JSON-LD: Article + FAQPage + HowTo. Inlined so crawlers pick
          them up in the initial HTML response, no JS required. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1B2A4A] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,#D4A853_0%,transparent_50%),radial-gradient(circle_at_70%_80%,#9B1B30_0%,transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 mb-6">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {guide.eyebrow}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              {guide.title}
            </h1>
            <p className="mt-4 text-lg text-gray-300 leading-relaxed">
              {guide.subtitle}
            </p>
            {/* Last-updated timestamp. Visible to both users and LLM
                crawlers (dateModified is already in the Article JSON-LD;
                a visible date reinforces freshness for human readers
                and gives GEO/AEO engines a clear signal). */}
            <p className="mt-3 text-xs text-gray-400">
              Last updated: {new Date().toISOString().slice(0, 10)}
            </p>
          </div>

          {/* Hero stats — at-a-glance numbers near the top, also useful
              for AI engines summarizing the page. */}
          <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl">
            {guide.stats.map((s, i) => (
              <div key={i} className="border-l-2 border-[#D4A853] pl-3 py-1">
                <dt className="text-xs text-gray-400 uppercase tracking-wider">
                  {s.label}
                </dt>
                <dd className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Main content column */}
        <article className="lg:col-span-2 space-y-12">
          {/* Quick answer (TL;DR) — AEO/GEO extraction target */}
          <section className="bg-white border-2 border-[#1B2A4A] p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#9B1B30]">
                Quick answer
              </div>
            </div>
            <p className="text-[#1B2A4A] leading-relaxed text-base font-medium">
              {guide.quickAnswer}
            </p>
          </section>

          {/* Key takeaways */}
          <section className="bg-[#1B2A4A]/5 border-l-4 border-[#9B1B30] p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#9B1B30] mb-3">
              Key takeaways
            </h2>
            <ul className="space-y-2">
              {guide.keyTakeaways.map((k, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[#1B2A4A] text-sm leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#9B1B30] shrink-0 mt-0.5" />
                  <span>{k}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Sections */}
          {guide.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] mb-3">
                {section.h2}
              </h2>
              <p className="text-[#4B5563] leading-relaxed mb-6 text-lg">
                {section.intro}
              </p>
              <div className="space-y-2">
                {section.blocks.map((block, i) => (
                  <GuideBlockRenderer key={i} block={block} />
                ))}
              </div>
            </section>
          ))}

          {/* How-to steps */}
          <section className="bg-[#1B2A4A] text-white p-6 sm:p-8">
            <div className="text-xs font-bold uppercase tracking-wider text-[#D4A853] mb-2">
              Step-by-step
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              How to {guide.title.toLowerCase().replace(/\?.*$/, '').trim()}
            </h2>
            <ol className="space-y-4">
              {guide.howToSteps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <div className="shrink-0 w-9 h-9 bg-[#9B1B30] text-white font-bold text-base flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{step.name}</h3>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-24">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9B1B30] mb-2">
              FAQ
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] mb-6">
              Frequently asked questions
            </h2>
            <div className="space-y-3">
              {guide.faqs.map((f, i) => (
                <details
                  key={i}
                  className="group bg-white border-2 border-gray-200 hover:border-[#1B2A4A] transition-colors"
                >
                  <summary className="cursor-pointer p-4 sm:p-5 font-semibold text-[#1B2A4A] flex items-start gap-3 list-none">
                    <span className="shrink-0 w-7 h-7 bg-[#1B2A4A] text-white text-xs font-bold flex items-center justify-center">
                      Q
                    </span>
                    <span className="flex-1">{f.q}</span>
                    <span className="text-[#9B1B30] text-xl group-open:rotate-45 transition-transform shrink-0">
                      +
                    </span>
                  </summary>
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2 pl-12 sm:pl-14 text-[#374151] leading-relaxed text-sm">
                    {f.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </article>

        {/* Sidebar — sticky on desktop */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Table of contents */}
            <nav className="bg-white border-2 border-gray-200 p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#9B1B30] mb-3">
                On this page
              </div>
              <ul className="space-y-1.5 text-sm">
                {guide.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-[#1B2A4A] hover:text-[#9B1B30] hover:underline leading-snug"
                    >
                      {s.h2}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#faq"
                    className="text-[#1B2A4A] hover:text-[#9B1B30] hover:underline leading-snug"
                  >
                    Frequently asked questions
                  </a>
                </li>
              </ul>
            </nav>

            {/* Quick apply CTA */}
            <div className="bg-[#9B1B30] text-white p-5">
              <h3 className="font-bold mb-2">Ready to start?</h3>
              <p className="text-sm text-white/90 mb-4 leading-relaxed">
                {guide.ctaSubtitle}
              </p>
              <Link
                href="/assessment"
                className="block text-center px-4 py-2.5 bg-white text-[#9B1B30] text-sm font-semibold uppercase tracking-wider hover:bg-[#FAFAF8] transition-colors"
              >
                {guide.ctaApplyLabel}
              </Link>
              <Link
                href="/contact"
                className="block text-center px-4 py-2.5 mt-2 border-2 border-white/40 text-white text-sm font-semibold uppercase tracking-wider hover:border-white transition-colors"
              >
                {guide.ctaContactLabel}
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Related guides */}
      <section className="bg-white border-t-2 border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#9B1B30] mb-2">
            Related guides
          </div>
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-6">
            Keep reading
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {guide.related.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="group block bg-[#FAFAF8] border-2 border-gray-200 hover:border-[#9B1B30] p-5 transition-colors"
              >
                <h3 className="font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors mb-1">
                  {r.label}
                </h3>
                <p className="text-sm text-[#4B5563] leading-relaxed mb-3">
                  {r.description}
                </p>
                <div className="text-sm font-medium text-[#9B1B30] flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read guide <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Re-export the icon map so the hub page can pick the right
 * icon for each card without re-declaring the lucide imports.
 */
export const GuideIcons: Record<string, LucideIcon> = {
  compass: Compass,
  'clipboard-list': ClipboardList,
  passport: Stamp,
  award: Award,
  wallet: Wallet,
  bed: BedDouble,
};

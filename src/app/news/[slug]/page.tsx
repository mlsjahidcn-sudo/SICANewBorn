import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ChevronRight, Tag, User, ArrowLeft, ArrowRight, Share2, ListChecks, HelpCircle, BookOpen, ExternalLink, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import { getServerLocale, t } from '@/lib/server-t';
import { buildLanguageAlternates } from '@/lib/alternates';

import { SITE_URL } from '@/lib/site-url';
/** S36: structured FAQ pair used for FAQPage JSON-LD + visible accordion. */
interface FaqItem {
  question: string;
  answer: string;
}

/** S36: a single {label, value} fact row rendered as a 2-col table cell. */
interface GlanceItem {
  label: string;
  value: string;
}

/** S36: a citation in the post footer + Article JSON-LD isBasedOn. */
interface SourceItem {
  label: string;
  url: string;
}

interface NewsRow {
  id: string;
  slug: string;
  title_en: string;
  title_zh: string | null;
  excerpt_en: string | null;
  excerpt_zh: string | null;
  content_en: string;
  content_zh: string | null;
  cover_image: string | null;
  category: string;
  tags: string[];
  author: string;
  ai_prompt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  updated_at: string;
  read_time_minutes: number | null;
  // S36: SEO + AEO + GEO structured fields. All nullable — the
  // public page degrades gracefully when they're absent.
  faq: FaqItem[] | null;
  key_takeaways: string[] | null;
  at_a_glance: GlanceItem[] | null;
  sources: SourceItem[] | null;
}

const CATEGORY_LABEL: Record<string, string> = {
  announcement: 'Announcement',
  partnership: 'Partnership',
  scholarship: 'Scholarship',
  university: 'University news',
  event: 'Event',
  guide: 'Study guide',
};

export const dynamic = 'force-dynamic';

async function fetchPostBySlug(slug: string): Promise<NewsRow | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const { data } = await supabase
    .from('news_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  return (data as NewsRow | null) ?? null;
}

async function fetchRelatedPosts(currentId: string, category: string, limit = 3): Promise<NewsRow[]> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data } = await supabase
    .from('news_posts')
    .select('id, slug, title_en, title_zh, excerpt_en, excerpt_zh, cover_image, category, tags, author, published_at, read_time_minutes')
    .eq('status', 'published')
    .eq('category', category)
    .neq('id', currentId)
    .order('published_at', { ascending: false })
    .limit(limit);
  return (data as NewsRow[] | null) ?? [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [post, locale] = await Promise.all([
    fetchPostBySlug(slug),
    getServerLocale(),
  ]);
  if (!post) {
    return { title: t(locale, 'seo.dynamic.notFoundTitle') };
  }

  const title = locale === 'zh'
    ? (post.title_zh || post.seo_title || post.title_en)
    : (post.seo_title || post.title_en);
  // S36: when no SEO description is set, prefer the key_takeaways
  // (1-2 of them joined) over the raw first-paragraph excerpt —
  // the takeaways are distilled for snippet capture so they
  // typically read better as a meta description.
  let description = '';
  if (locale === 'zh' && post.excerpt_zh) {
    description = post.excerpt_zh;
  } else {
    description = post.seo_description
      || (Array.isArray(post.key_takeaways) && post.key_takeaways.length > 0
        ? post.key_takeaways.slice(0, 2).join(' ')
        : post.excerpt_en)
      || post.content_en.slice(0, 155);
  }
  description = description.slice(0, 160);
  const canonical = `${SITE_URL}/news/${post.slug}`;
  const ogImage = post.cover_image || undefined;
  return {
    title,
    description,
    alternates: buildLanguageAlternates(canonical),
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      authors: [post.author],
      tags: post.tags,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      // S36: explicit Twitter card. Without this Next falls back
      // to OG, but the spec wants twitter-specific fields for
      // LLMs that read meta tags and for X / Twitter crawler
      // rendering.
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);
  if (!post) notFound();
  const [related, locale] = await Promise.all([
    fetchRelatedPosts(post.id, post.category),
    getServerLocale(),
  ]);

  const title =
    locale === 'zh'
      ? (post.title_zh || post.title_en)
      : (post.seo_title || post.title_en);
  let description = '';
  if (locale === 'zh' && post.excerpt_zh) {
    description = post.excerpt_zh;
  } else {
    description =
      post.seo_description ||
      (Array.isArray(post.key_takeaways) && post.key_takeaways.length > 0
        ? post.key_takeaways.slice(0, 2).join(' ')
        : post.excerpt_en) ||
      post.content_en.slice(0, 155);
  }
  description = description.slice(0, 160);

  // S36: schema.org JSON-LD. We layer three things:
  //   1. Article with `about` + `citation` + `isBasedOn` (GEO signal)
  //   2. BreadcrumbList (same as before)
  //   3. FAQPage when the post has FAQ pairs (AEO — Google rich result)
  const articleSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: { '@id': `${SITE_URL}/#editorial-team` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    inLanguage: locale === 'zh' ? 'zh' : 'en',
    keywords: post.tags.join(', '),
    articleSection: CATEGORY_LABEL[post.category] || post.category,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/news/${post.slug}` },
  };
  // S36: when the post has sources, attach them as isBasedOn. This
  // is the schema.org way to say "this article is grounded in
  // these references" — Google uses it for fact-check signals and
  // LLMs weight it heavily when deciding to cite a page.
  if (Array.isArray(post.sources) && post.sources.length > 0) {
    articleSchema.isBasedOn = post.sources.map((s) => ({
      '@type': 'CreativeWork',
      name: s.label,
      url: s.url,
    }));
  }
  // S36: when the post has at_a_glance facts, surface them as
  // `about` entities. Each fact becomes a Thing with a name; LLMs
  // pull from these directly when composing answers.
  if (Array.isArray(post.at_a_glance) && post.at_a_glance.length > 0) {
    articleSchema.about = post.at_a_glance.map((g) => ({
      '@type': 'Thing',
      name: `${g.label}: ${g.value}`,
    }));
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'News', item: `${SITE_URL}/news` },
      { '@type': 'ListItem', position: 3, name: title },
    ],
  };
  // S36: FAQPage schema. Only emit when there are FAQ pairs —
  // Google ignores empty FAQPage schemas, and emitting a half-empty
  // one can hurt trust. The schema's mainEntity references the
  // exact same questions/answers that render visibly below, which
  // is the rich-result policy.
  const faqSchema =
    Array.isArray(post.faq) && post.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faq.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <main className="min-h-screen bg-[#FAFAF8]">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#9B1B30] transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/news" className="hover:text-[#9B1B30] transition-colors">News</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-[#1B2A4A] font-medium truncate max-w-[200px]">{post.title_en}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <article>
          <header className="bg-white border-b border-gray-200">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9B1B30] mb-4">
                {CATEGORY_LABEL[post.category] || post.category}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B2A4A] leading-tight">
                {post.title_en}
              </h1>
              {post.title_zh && (
                <h2 className="mt-3 text-xl text-gray-500">{post.title_zh}</h2>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {post.author}
                </span>
                {post.published_at && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
                 {post.read_time_minutes ? (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {post.read_time_minutes} min read
                  </span>
                ) : null}
                 <span className="flex items-center gap-1.5">
                   <History className="h-4 w-4" />
                   Last updated: {new Date(post.updated_at).toISOString().slice(0, 10)}
                 </span>
              </div>
            </div>
          </header>

          {/* Body */}
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <div className="prose prose-lg max-w-none text-[#374151] leading-relaxed
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#1B2A4A] [&_h2]:mt-10 [&_h2]:mb-4
              [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[#1B2A4A] [&_h3]:mt-8 [&_h3]:mb-3
              [&_p]:mb-5
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:space-y-1.5
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:space-y-1.5
              [&_li]:leading-relaxed
              [&_a]:text-[#9B1B30] [&_a]:underline
              [&_strong]:font-bold [&_strong]:text-[#1B2A4A]
              [&_blockquote]:border-l-4 [&_blockquote]:border-[#9B1B30] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-5
              [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono
              [&_h2+a]:mt-0 [&_h3+a]:mt-0
            ">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {post.content_en}
              </ReactMarkdown>
            </div>

            {/* Chinese version, if present */}
            {post.content_zh && (
              <div className="mt-12 pt-10 border-t border-gray-200">
                <p className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] mb-4">
                  中文版本
                </p>
                <div className="prose max-w-none text-[#374151] leading-relaxed
                  [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#1B2A4A] [&_h2]:mt-6 [&_h2]:mb-3
                  [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[#1B2A4A] [&_h3]:mt-5 [&_h3]:mb-2
                  [&_p]:mb-4
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                  [&_a]:text-[#9B1B30] [&_a]:underline
                  [&_strong]:font-bold [&_strong]:text-[#1B2A4A]
                  [&_blockquote]:border-l-4 [&_blockquote]:border-[#9B1B30] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4
                ">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                  >
                    {post.content_zh}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* S36 AEO: Key takeaways (TL;DR box). Sits at the
                bottom of the body so a reader who finished the
                article sees the distilled facts, AND search
                engines / LLMs that scrape the post pick them up
                before any other content. We also use these as
                the fallback meta description when the admin
                didn't set a custom SEO description. */}
            {Array.isArray(post.key_takeaways) && post.key_takeaways.length > 0 && (
              <section
                aria-label="Key takeaways"
                className="mt-10 bg-[#1B2A4A]/5 border-l-4 border-[#1B2A4A] p-5 lg:p-6"
              >
                <div className="flex items-center gap-2 text-[#1B2A4A] font-semibold text-sm uppercase tracking-wider mb-3">
                  <ListChecks className="h-4 w-4" />
                  Key takeaways
                </div>
                <ul className="space-y-2 text-[#1F2937]">
                  {post.key_takeaways.map((t, i) => (
                    <li key={i} className="flex gap-2 text-sm lg:text-base leading-relaxed">
                      <span className="text-[#9B1B30] font-bold mt-0.5">›</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* S36 GEO: At-a-glance fact table. Two-column
                key/value table; the format LLMs (ChatGPT /
                Perplexity / Claude / Gemini) love to extract
                from when composing an answer. Each row is a
                short, atomic fact — not a sentence. */}
            {Array.isArray(post.at_a_glance) && post.at_a_glance.length > 0 && (
              <section aria-label="At a glance" className="mt-10">
                <div className="flex items-center gap-2 text-[#1B2A4A] font-semibold text-sm uppercase tracking-wider mb-3">
                  <BookOpen className="h-4 w-4" />
                  At a glance
                </div>
                <div className="border border-gray-200">
                  <table className="w-full text-sm">
                    <tbody>
                      {post.at_a_glance.map((g, i) => (
                        <tr
                          key={i}
                          className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}
                        >
                          <th
                            scope="row"
                            className="text-left align-top px-4 py-3 font-medium text-[#1B2A4A] w-1/3 border-r border-gray-200"
                          >
                            {g.label}
                          </th>
                          <td className="align-top px-4 py-3 text-[#374151]">
                            {g.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* S36 AEO: FAQ block. Same Q&As that power the
                FAQPage JSON-LD above are rendered here as a
                visible accordion. Using <details>/<summary>
                for accordion behavior — no JS required, and the
                content is indexable by crawlers even when
                collapsed. */}
            {Array.isArray(post.faq) && post.faq.length > 0 && (
              <section id="faq" aria-label="Frequently asked questions" className="mt-10">
                <div className="flex items-center gap-2 text-[#1B2A4A] font-semibold text-sm uppercase tracking-wider mb-3">
                  <HelpCircle className="h-4 w-4" />
                  Frequently asked questions
                </div>
                <div className="border border-gray-200 divide-y divide-gray-200">
                  {post.faq.map((f, i) => (
                    <details
                      key={i}
                      className="group bg-white [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex items-start gap-3 cursor-pointer px-4 py-4 hover:bg-gray-50 transition-colors list-none">
                        <span className="text-[#9B1B30] font-semibold text-sm mt-0.5 shrink-0">
                          Q{i + 1}
                        </span>
                        <span className="font-medium text-[#1B2A4A] flex-1">
                          {f.question}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400 mt-1 shrink-0 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="px-4 pb-4 pl-11 text-[#374151] text-sm leading-relaxed">
                        {f.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* S36 GEO: Sources footer. Every claim in the body
                should be traceable to a public source. The list
                doubles as the Article JSON-LD `isBasedOn` block,
                which Google uses for fact-check signals. */}
            {Array.isArray(post.sources) && post.sources.length > 0 && (
              <section aria-label="Sources" className="mt-10 pt-6 border-t border-gray-200">
                <h2 className="text-sm font-semibold text-[#1B2A4A] uppercase tracking-wider mb-3">
                  Sources
                </h2>
                <ol className="space-y-1.5 text-sm">
                  {post.sources.map((s, i) => (
                    <li key={i} className="text-[#4B5563]">
                      <span className="text-[#9B1B30] font-medium mr-1.5">
                        [{i + 1}]
                      </span>
                      <span className="text-[#1F2937]">{s.label}</span>
                      <span className="mx-1.5 text-gray-400">—</span>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#9B1B30] hover:underline inline-flex items-center gap-0.5"
                      >
                        {s.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Tags + share */}
            <div className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                {post.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/news?tag=${encodeURIComponent(t)}`}
                    className="text-xs font-semibold uppercase tracking-wider text-[#1B2A4A] bg-[#1B2A4A]/10 hover:bg-[#9B1B30] hover:text-white px-2 py-1 transition-colors"
                  >
                    {t}
                  </Link>
                ))}
              </div>
              <Link
                href={`/news/${post.slug}#share`}
                className="text-sm font-semibold text-[#1B2A4A] hover:text-[#9B1B30] flex items-center gap-1.5"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Link>
            </div>

            {/* CTA */}
            <div className="mt-10 bg-[#1B2A4A] text-white p-6 lg:p-8 text-center">
              <p className="text-lg font-semibold mb-2">Ready to study in China?</p>
              <p className="text-gray-300 text-sm mb-5">
                SICA's team helps you find the right university, apply for
                scholarships, and navigate the visa process. Free initial
                consultation.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/assessment?major=${encodeURIComponent(post.category)}`}
                  className="inline-flex items-center gap-2 bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold px-6 py-2.5 text-sm transition-colors"
                >
                  Get free assessment
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Talk to an advisor
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="border-t border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
              <h2 className="text-2xl font-bold text-[#1B2A4A] mb-6">
                Related news
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/news/${r.slug}`}
                    className="group block bg-[#FAFAF8] border border-gray-200 hover:border-[#9B1B30] p-4 transition-colors"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#9B1B30] mb-1">
                      {CATEGORY_LABEL[r.category] || r.category}
                    </p>
                    <h3 className="font-semibold text-sm text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors line-clamp-2">
                      {r.title_en}
                    </h3>
                    {r.published_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(r.published_at).toLocaleDateString()}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#9B1B30] hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  All news
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

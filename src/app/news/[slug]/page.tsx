import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ChevronRight, Tag, User, ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sica.com.cn';

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
  const post = await fetchPostBySlug(slug);
  if (!post) return { title: 'Not Found' };

  const title = post.seo_title || post.title_en;
  const description = post.seo_description || post.excerpt_en || post.content_en.slice(0, 155);
  const canonical = `${SITE_URL}/news/${post.slug}`;
  const ogImage = post.cover_image || undefined;
  return {
    title,
    description,
    alternates: { canonical },
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
  const related = await fetchRelatedPosts(post.id, post.category);

  const description = post.seo_description || post.excerpt_en || post.content_en.slice(0, 155);
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title_en,
    description,
    author: { '@id': `${SITE_URL}/#editorial-team` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    inLanguage: 'en',
    keywords: post.tags.join(', '),
    articleSection: CATEGORY_LABEL[post.category] || post.category,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/news/${post.slug}` },
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'News', item: `${SITE_URL}/news` },
      { '@type': 'ListItem', position: 3, name: post.title_en },
    ],
  };

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
                  Last updated: {new Date(post.updated_at).toISOString().slice(0, 10)}
                </span>
              </div>
            </div>
            {post.cover_image && (
              <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-10">
                <div className="relative aspect-[1200/630] bg-gray-100">
                  <Image
                    src={post.cover_image}
                    alt={post.title_en}
                    fill
                    sizes="(max-width: 896px) 100vw, 896px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            )}
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

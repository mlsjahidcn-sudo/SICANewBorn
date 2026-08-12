import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Clock, ChevronRight, Newspaper, X, Tag } from 'lucide-react';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import { buildLanguageAlternates } from '@/lib/alternates';

import { SITE_URL } from '@/lib/site-url';
interface NewsRow {
  id: string;
  slug: string;
  title_en: string;
  title_zh: string | null;
  excerpt_en: string | null;
  excerpt_zh: string | null;
  cover_image: string | null;
  category: string;
  tags: string[];
  author: string;
  published_at: string | null;
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

async function fetchPublishedPosts(limit = 100): Promise<NewsRow[]> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data } = await supabase
    .from('news_posts')
    .select('id, slug, title_en, title_zh, excerpt_en, excerpt_zh, cover_image, category, tags, author, published_at, read_time_minutes')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);
  return (data as NewsRow[] | null) ?? [];
}

export async function generateMetadata(
  // S37: include ?tag= in the canonical URL when a tag filter is
  // active, and use the tag in the title so the page heading
  // doesn't get out of sync with the query string.
  props: { searchParams: Promise<{ tag?: string }> },
): Promise<Metadata> {
  const sp = await props.searchParams;
  const tag = sp.tag;
  const title = tag
    ? `SICA News — "${tag}" articles`
    : 'SICA News — Study in China Updates';
  const description = tag
    ? `SICA news posts tagged "${tag}". Updates on Chinese universities, scholarships, partnerships, and study-in-China guides.`
    : 'Latest news on Chinese universities, scholarships, partnerships, and study-in-China guides. Curated by the SICA Editorial Team.';
  const canonical = tag
    ? `${SITE_URL}/news?tag=${encodeURIComponent(tag)}`
    : `${SITE_URL}/news`;
  return {
    title,
    description,
    alternates: buildLanguageAlternates(canonical),
    openGraph: { title, description, type: 'website' },
  };
}

export default async function NewsIndexPage(
  // S37: read `?tag=` and `?q=` (free-text) from the query string.
  // We over-fetch then JS-filter (in this server component) because
  // matching `tags` (text[]) with a contains-filter is a simple
  // `.includes()` in JS but a `cs` PostgREST call on the wire.
  // The dataset is bounded (one page = ~30 posts), so JS filter
  // is fine.
  props: { searchParams: Promise<{ tag?: string; q?: string }> },
) {
  const sp = await props.searchParams;
  const activeTag = (sp.tag || '').trim();
  const activeQuery = (sp.q || '').trim();
  const allPosts = await fetchPublishedPosts();

  // Apply tag + free-text filters. When a tag is set, the post's
  // tags array must contain it (case-insensitive). To keep the
  // /news?tag=tsinghua URL forgiving we also accept a substring
  // match against the normalized tag (spaces / dashes stripped).
  // When a query is set, it must hit the title / excerpt / category.
  const norm = (s: string) => s.toLowerCase().replace(/[\s_-]+/g, '');
  const posts = allPosts.filter((p) => {
    if (activeTag) {
      const target = norm(activeTag);
      const hit = p.tags.some(
        (t) => norm(t) === target || norm(t).includes(target) || target.includes(norm(t)),
      );
      if (!hit) return false;
    }
    if (activeQuery) {
      const q = activeQuery.toLowerCase();
      const hay = `${p.title_en} ${p.title_zh || ''} ${p.excerpt_en || ''} ${p.category}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Build the tag cloud from the unfiltered set so the user can
  // switch between popular tags without losing context.
  const tagCounts = new Map<string, number>();
  for (const p of allPosts) {
    for (const t of p.tags) {
      tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
    }
  }
  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'News' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="min-h-screen bg-[#FAFAF8]">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#9B1B30] transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-[#1B2A4A] font-medium">News</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-[#1B2A4A] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4A853] mb-3">
              <Newspaper className="h-4 w-4" />
              Newsroom
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              {activeTag ? (
                <>SICA News · <span className="text-[#D4A853]">"{activeTag}"</span></>
              ) : (
                'SICA News'
              )}
            </h1>
            <p className="mt-3 text-lg text-gray-300 max-w-3xl">
              Updates on Chinese universities, scholarships, partnerships, and
              study-in-China guides — written by the SICA Editorial Team.
            </p>
            <p className="mt-3 text-xs text-gray-400">
              {posts.length} {posts.length === 1 ? 'article' : 'articles'}
              {activeTag ? ` tagged "${activeTag}"` : ''}
              {activeQuery ? ` matching "${activeQuery}"` : ''}
            </p>
          </div>
        </section>

        {/* Tag cloud + active-filter pill */}
        {topTags.length > 0 && (
          <section className="border-b border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                  <Tag className="h-3.5 w-3.5" />
                  <span className="font-semibold uppercase tracking-wider">Topics:</span>
                </div>
                {topTags.map(([tag, n]) => {
                  const isActive = tag.toLowerCase() === activeTag.toLowerCase();
                  return (
                    <Link
                      key={tag}
                      href={`/news?tag=${encodeURIComponent(tag)}`}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        isActive
                          ? 'bg-[#9B1B30] text-white'
                          : 'bg-[#1B2A4A]/10 text-[#1B2A4A] hover:bg-[#9B1B30] hover:text-white'
                      }`}
                    >
                      {tag}
                      <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                        {n}
                      </span>
                    </Link>
                  );
                })}
                {activeTag && (
                  <Link
                    href="/news"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-500 hover:text-[#9B1B30] transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Posts grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          {posts.length === 0 ? (
            <div className="bg-white border-2 border-gray-200 p-12 text-center">
              <Newspaper className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {activeTag
                  ? `No articles tagged "${activeTag}" yet.`
                  : 'No news posts yet. Check back soon.'}
              </p>
              {activeTag && (
                <Link
                  href="/news"
                  className="inline-block mt-3 text-sm font-semibold text-[#9B1B30] hover:underline"
                >
                  See all news →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group bg-white border-2 border-gray-200 hover:border-[#9B1B30] transition-colors flex flex-col"
                >
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span className="font-semibold uppercase tracking-wider text-[#9B1B30]">
                        {CATEGORY_LABEL[post.category] || post.category}
                      </span>
                      {post.published_at && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.published_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </>
                      )}
                      {post.read_time_minutes ? (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.read_time_minutes} min read
                          </span>
                        </>
                      ) : null}
                    </div>
                    <h2 className="font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors leading-snug">
                      <Link href={`/news/${post.slug}`} className="hover:text-[#9B1B30]">
                        {post.title_en}
                      </Link>
                    </h2>
                    {post.excerpt_en && (
                      <Link href={`/news/${post.slug}`} className="block">
                        <p className="mt-2 text-sm text-gray-600 line-clamp-3 flex-1 hover:text-gray-800">
                          {post.excerpt_en}
                        </p>
                      </Link>
                    )}
                    {post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map((t) => {
                          const isActive = t.toLowerCase() === activeTag.toLowerCase();
                          return (
                            <Link
                              key={t}
                              href={`/news?tag=${encodeURIComponent(t)}`}
                              className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 transition-colors ${
                                isActive
                                  ? 'bg-[#9B1B30] text-white'
                                  : 'bg-[#1B2A4A]/10 text-[#1B2A4A] hover:bg-[#9B1B30] hover:text-white'
                              }`}
                            >
                              {t}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                    <Link
                      href={`/news/${post.slug}`}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#9B1B30] hover:underline self-start"
                    >
                      Read more
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

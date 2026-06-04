import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Clock, ChevronRight, Newspaper } from 'lucide-react';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sica.com.cn';

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

async function fetchPublishedPosts(limit = 30): Promise<NewsRow[]> {
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

export async function generateMetadata(): Promise<Metadata> {
  const title = 'SICA News — Study in China Updates';
  const description =
    'Latest news on Chinese universities, scholarships, partnerships, and study-in-China guides. Curated by the SICA Editorial Team.';
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/news` },
    openGraph: { title, description, type: 'website' },
  };
}

export default async function NewsIndexPage() {
  const posts = await fetchPublishedPosts();

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
              SICA News
            </h1>
            <p className="mt-3 text-lg text-gray-300 max-w-3xl">
              Updates on Chinese universities, scholarships, partnerships, and
              study-in-China guides — written by the SICA Editorial Team.
            </p>
            <p className="mt-3 text-xs text-gray-400">
              Last updated: {new Date().toISOString().slice(0, 10)} · SICA Editorial Team
            </p>
          </div>
        </section>

        {/* Posts grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          {posts.length === 0 ? (
            <div className="bg-white border-2 border-gray-200 p-12 text-center">
              <Newspaper className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No news posts yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  className="group bg-white border-2 border-gray-200 hover:border-[#9B1B30] transition-colors overflow-hidden flex flex-col"
                >
                  {post.cover_image && (
                    <div className="relative h-44 bg-gray-100">
                      <Image
                        src={post.cover_image}
                        alt={post.title_en}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
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
                      {post.title_en}
                    </h2>
                    {post.excerpt_en && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-3 flex-1">
                        {post.excerpt_en}
                      </p>
                    )}
                    {post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-semibold uppercase tracking-wider text-[#1B2A4A] bg-[#1B2A4A]/10 px-1.5 py-0.5"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#9B1B30] group-hover:underline">
                      Read more
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

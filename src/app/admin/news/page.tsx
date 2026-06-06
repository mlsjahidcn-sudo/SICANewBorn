'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Newspaper,
  Eye,
  EyeOff,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api-client';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

interface NewsPost {
  id: string;
  slug: string;
  title_en: string;
  title_zh: string | null;
  excerpt_en: string | null;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  author: string;
  published_at: string | null;
  updated_at: string;
  read_time_minutes: number | null;
}

const CATEGORIES = [
  { value: 'announcement', label: 'Announcement' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'university', label: 'University news' },
  { value: 'event', label: 'Event' },
  { value: 'guide', label: 'Study guide' },
];

/**
 * Sub-nav used by both /admin/news and /admin/news/automation so the
 * admin can flip between the post list and the automation dashboard
 * with a single click. Active state is derived from the current path.
 */
function NewsSubNav({ active }: { active: 'posts' | 'automation' }) {
  const base = 'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors';
  const inactive = 'border-transparent text-gray-500 hover:text-[#1B2A4A] hover:border-gray-200';
  const activeCls = 'border-[#9B1B30] text-[#1B2A4A]';
  return (
    <div className="border-b border-gray-200 mb-6 flex items-center gap-1">
      <Link href="/admin/news" className={`${base} ${active === 'posts' ? activeCls : inactive}`}>
        <Newspaper className="w-4 h-4" />
        Posts
      </Link>
      <Link
        href="/admin/news/automation"
        className={`${base} ${active === 'automation' ? activeCls : inactive}`}
      >
        <Sparkles className="w-4 h-4" />
        Automation
      </Link>
    </div>
  );
}

function NewsListInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [deleteTarget, setDeleteTarget] = useState<NewsPost | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/admin/login');
  }, [user, loading, router]);

  const fetchPosts = useCallback(async () => {
    const res = await apiFetch('/api/admin/news');
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts || []);
    }
  }, []);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user, fetchPosts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await apiFetch(`/api/admin/news/${deleteTarget.id}`, { method: 'DELETE' });
    if (res.ok) {
      addToast('Post deleted', 'success');
      setDeleteTarget(null);
      fetchPosts();
    } else {
      addToast('Failed to delete', 'error');
    }
  };

  const handlePublishToggle = async (post: NewsPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const res = await apiFetch(`/api/admin/news/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      addToast(
        newStatus === 'published' ? 'Post published' : 'Post unpublished',
        'success',
      );
      fetchPosts();
    } else {
      addToast('Failed to update status', 'error');
    }
  };

  const filtered = posts.filter((p) => {
    const matchSearch =
      !search ||
      p.title_en.toLowerCase().includes(search.toLowerCase()) ||
      (p.title_zh ?? '').toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading || !user) {
    return <div className="p-12 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <NewsSubNav active="posts" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">News</h1>
          <p className="text-sm text-[#4B5563] mt-1">
            AI-assisted blog posts. Each post is reviewed and explicitly
            published by an admin before going live.
          </p>
        </div>
        <Link
          href="/admin/news/new"
          className="inline-flex items-center gap-2 bg-[#9B1B30] hover:bg-[#7A1526] text-white px-4 py-2 text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'draft', 'published', 'archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={[
                'px-3 py-2 text-xs font-semibold uppercase tracking-wider border transition-colors',
                statusFilter === s
                  ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <Newspaper className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">
            {posts.length === 0
              ? 'No news posts yet. Click "New Post" to write the first one.'
              : 'No posts match your filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200">
          <table className="w-full">
            <thead className="bg-[#FAFAF8] border-b border-gray-200">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden md:table-cell">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id} className="border-b border-gray-100 hover:bg-[#FAFAF8]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/news/${post.id}/edit`}
                      className="font-semibold text-[#1B2A4A] hover:text-[#9B1B30] block"
                    >
                      {post.title_en}
                    </Link>
                    {post.title_zh && (
                      <p className="text-xs text-gray-500 mt-0.5">{post.title_zh}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">
                      {CATEGORIES.find((c) => c.value === post.category)?.label || post.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5',
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : post.status === 'archived'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-amber-100 text-amber-800',
                      ].join(' ')}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                    {new Date(post.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {post.status === 'published' && (
                        <Link
                          href={`/news/${post.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-500 hover:text-[#1B2A4A]"
                          title="View live"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                      <button
                        onClick={() => handlePublishToggle(post)}
                        className="p-1.5 text-gray-500 hover:text-[#1B2A4A]"
                        title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        {post.status === 'published' ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <Link
                        href={`/admin/news/${post.id}/edit`}
                        className="p-1.5 text-gray-500 hover:text-[#1B2A4A]"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(post)}
                        className="p-1.5 text-gray-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete post?"
        message={
          deleteTarget
            ? `"${deleteTarget.title_en}" will be permanently deleted. This cannot be undone.`
            : ''
        }
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </div>
  );
}

export { NewsSubNav };
export default function NewsListPage() {
  return (
    <ToastProvider>
      <NewsListInner />
    </ToastProvider>
  );
}

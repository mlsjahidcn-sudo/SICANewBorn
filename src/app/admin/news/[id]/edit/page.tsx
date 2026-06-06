'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api-client';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { StructuredFieldsEditor } from '@/components/admin/StructuredFieldsEditor';

const CATEGORIES = [
  { value: 'announcement', label: 'Announcement' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'university', label: 'University news' },
  { value: 'event', label: 'Event' },
  { value: 'guide', label: 'Study guide' },
];

interface NewsPost {
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
  status: 'draft' | 'published' | 'archived';
  author: string;
  ai_prompt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  updated_at: string;
  // S36: structured SEO + AEO + GEO fields. JSONB from the DB
  // — null on posts created before this migration. The editor
  // below handles missing values gracefully.
  key_takeaways: string[] | null;
  at_a_glance: { label: string; value: string }[] | null;
  faq: { question: string; answer: string }[] | null;
  sources: { label: string; url: string }[] | null;
}

function EditPostInner() {
  const params = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Form mirror so we can detect unsaved changes
  const [form, setForm] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (!loading && !user) router.push('/admin/login');
  }, [user, loading, router]);

  const fetchPost = useCallback(async () => {
    if (!params?.id) return;
    const res = await apiFetch(`/api/admin/news/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setPost(data.post);
      setForm(data.post);
    } else if (res.status === 404) {
      addToast('Post not found', 'error');
      router.push('/admin/news');
    } else {
      addToast('Failed to load post', 'error');
    }
  }, [params?.id, router, addToast]);

  useEffect(() => {
    if (user && params?.id) fetchPost();
  }, [user, params?.id, fetchPost]);

  const update = useCallback((field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async (publish?: 'draft' | 'published') => {
    if (!post) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (publish) payload.status = publish;
      // Convert tags array to comma-string for the form
      if (Array.isArray(payload.tags)) {
        payload.tags = (payload.tags as string[]).join(', ');
      }
      // Recompute read time
      const content = (payload.content_en as string) || '';
      payload.read_time_minutes = Math.max(1, Math.round(content.split(/\s+/).length / 220));
      const res = await apiFetch(`/api/admin/news/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Save failed');
      }
      addToast(publish === 'published' ? 'Post published' : 'Post updated', 'success');
      fetchPost();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    const res = await apiFetch(`/api/admin/news/${post.id}`, { method: 'DELETE' });
    if (res.ok) {
      addToast('Post deleted', 'success');
      router.push('/admin/news');
    } else {
      addToast('Delete failed', 'error');
    }
  };

  if (loading || !user) {
    return <div className="p-12 text-center text-gray-500">Loading...</div>;
  }
  if (!post) {
    return <div className="p-12 text-center text-gray-500">Loading post…</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/news" className="p-2 text-[#1B2A4A] hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Edit Post</h1>
            <p className="text-sm text-gray-500 mt-1">/{post.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post.status === 'published' && (
            <Link
              href={`/news/${post.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#1B2A4A] border border-gray-300 hover:bg-gray-50"
            >
              <ExternalLink className="w-4 h-4" />
              View live
            </Link>
          )}
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-2 text-gray-500 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="bg-white border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Title</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">English *</label>
              <input
                type="text"
                value={(form.title_en as string) || ''}
                onChange={(e) => update('title_en', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Chinese (optional)</label>
              <input
                type="text"
                value={(form.title_zh as string) || ''}
                onChange={(e) => update('title_zh', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Metadata</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Slug *</label>
              <input
                type="text"
                value={(form.slug as string) || ''}
                onChange={(e) => update('slug', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-sm font-mono focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Category</label>
              <select
                value={(form.category as string) || 'announcement'}
                onChange={(e) => update('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#9B1B30]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={(form.status as string) || 'draft'}
                onChange={(e) => update('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#9B1B30]"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Excerpt (EN)</label>
              <textarea
                value={(form.excerpt_en as string) || ''}
                onChange={(e) => update('excerpt_en', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30] resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Excerpt (ZH)</label>
              <textarea
                value={(form.excerpt_zh as string) || ''}
                onChange={(e) => update('excerpt_zh', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30] resize-none"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs text-gray-500 mb-1">Cover image URL</label>
            <input
              type="text"
              value={(form.cover_image as string) || ''}
              onChange={(e) => update('cover_image', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Content (Markdown)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">English body *</label>
              <textarea
                value={(form.content_en as string) || ''}
                onChange={(e) => update('content_en', e.target.value)}
                rows={18}
                className="w-full px-3 py-2 border border-gray-300 text-sm font-mono focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Chinese body (optional)</label>
              <textarea
                value={(form.content_zh as string) || ''}
                onChange={(e) => update('content_zh', e.target.value)}
                rows={14}
                className="w-full px-3 py-2 border border-gray-300 text-sm font-mono focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
          </div>
        </div>

        <details className="bg-white border border-gray-200 p-5">
          <summary className="text-sm font-semibold text-[#1B2A4A] cursor-pointer">SEO meta</summary>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">SEO title</label>
              <input
                type="text"
                value={(form.seo_title as string) || ''}
                onChange={(e) => update('seo_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">SEO description</label>
              <textarea
                value={(form.seo_description as string) || ''}
                onChange={(e) => update('seo_description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30] resize-none"
              />
            </div>
          </div>
        </details>

        {/* S36: SEO + AEO + GEO structured fields editor. The
            same component used in the new-post form, here
            bound to the loaded post's values (or empty arrays
            for posts created before this migration). */}
        <StructuredFieldsEditor
          field="key_takeaways"
          value={Array.isArray(form.key_takeaways) ? form.key_takeaways : []}
          onChange={(v) => update('key_takeaways', v)}
        />
        <StructuredFieldsEditor
          field="at_a_glance"
          value={Array.isArray(form.at_a_glance) ? form.at_a_glance : []}
          onChange={(v) => update('at_a_glance', v)}
        />
        <StructuredFieldsEditor
          field="faq"
          value={Array.isArray(form.faq) ? form.faq : []}
          onChange={(v) => update('faq', v)}
        />
        <StructuredFieldsEditor
          field="sources"
          value={Array.isArray(form.sources) ? form.sources : []}
          onChange={(v) => update('sources', v)}
        />

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-[#1B2A4A] border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          {(form.status as string) !== 'published' && (
            <button
              type="button"
              onClick={() => handleSave('published')}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#9B1B30] text-white font-semibold text-sm hover:bg-[#7A1526] transition-colors disabled:opacity-50"
            >
              <Eye className="h-4 w-4" />
              {saving ? 'Publishing…' : 'Publish'}
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete post?"
        message={`"${post.title_en}" will be permanently deleted. This cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        variant="danger"
      />
    </div>
  );
}

export default function EditPostPage() {
  return (
    <ToastProvider>
      <EditPostInner />
    </ToastProvider>
  );
}

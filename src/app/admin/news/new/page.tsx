'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Sparkles, Loader2, X, AlertCircle, CheckCircle } from 'lucide-react';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api-client';
import { StructuredFieldsEditor } from '@/components/admin/StructuredFieldsEditor';

const CATEGORIES = [
  { value: 'announcement', label: 'Announcement' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'university', label: 'University news' },
  { value: 'event', label: 'Event' },
  { value: 'guide', label: 'Study guide' },
];

interface AIGenerated {
  title_en: string;
  title_zh: string;
  slug: string;
  excerpt_en: string;
  excerpt_zh: string;
  content_en: string;
  content_zh: string;
  category: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
  read_time_minutes: number;
  // S36: SEO + AEO + GEO fields the AI now produces.
  key_takeaways?: string[];
  at_a_glance?: { label: string; value: string }[];
  faq?: { question: string; answer: string }[];
  sources?: { label: string; url: string }[];
}

function NewPostInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    title_en: '',
    title_zh: '',
    slug: '',
    excerpt_en: '',
    excerpt_zh: '',
    content_en: '',
    content_zh: '',
    cover_image: '',
    category: 'announcement',
    tags: '',
    status: 'draft' as 'draft' | 'published',
    author: 'SICA Editorial Team',
    ai_prompt: '',
    seo_title: '',
    seo_description: '',
    // S36: structured SEO + AEO + GEO fields. Stored as the
    // exact JSONB shape the API expects; the editor above
    // handles add/remove/reorder UX.
    key_takeaways: [] as string[],
    at_a_glance: [] as { label: string; value: string }[],
    faq: [] as { question: string; answer: string }[],
    sources: [] as { label: string; url: string }[],
  });
  const [saving, setSaving] = useState(false);

  // AI generation modal state
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState('announcement');
  const [aiLength, setAiLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [aiLanguage, setAiLanguage] = useState<'en' | 'zh' | 'both'>('en');
  const [aiTone, setAiTone] = useState('informational');
  const [aiKeyword, setAiKeyword] = useState('');
  const [aiStatus, setAiStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [aiProgress, setAiProgress] = useState('');
  const [aiRawContent, setAiRawContent] = useState('');
  const [aiError, setAiError] = useState('');
  const aiAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/admin/login');
  }, [user, loading, router]);

  const update = useCallback((field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async (publish: boolean) => {
    if (!form.title_en.trim() || !form.slug.trim() || !form.content_en.trim()) {
      addToast('Title (EN), slug, and content (EN) are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        status: publish ? 'published' : 'draft',
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const res = await apiFetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to save (${res.status})`);
      }
      const data = await res.json();
      addToast(publish ? 'Post published' : 'Saved as draft', 'success');
      router.push(`/admin/news/${data.post.id}/edit`);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) {
      setAiError('Topic is required');
      return;
    }
    aiAbortRef.current = new AbortController();
    setAiStatus('generating');
    setAiProgress('Connecting to AI...');
    setAiError('');
    setAiRawContent('');

    try {
      const res = await fetch('/api/ai/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          category: aiCategory,
          length: aiLength,
          language: aiLanguage,
          tone: aiTone,
          targetKeyword: aiKeyword,
        }),
        signal: aiAbortRef.current.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Generation failed');
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullContent = '';
      let serverParsed: AIGenerated | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.parsed) serverParsed = parsed.parsed as AIGenerated;
            if (parsed.content) {
              fullContent += parsed.content;
              setAiProgress(`Generating... ${fullContent.length} chars`);
              setAiRawContent(fullContent);
            }
          } catch {
            // skip unparseable lines
          }
        }
      }

      const finalData = serverParsed ?? tryParseClient(fullContent);
      if (!finalData) {
        throw new Error('Failed to parse AI response. Please try again.');
      }
      // Prefill the form with the AI's output
      setForm((prev) => ({
        ...prev,
        title_en: finalData.title_en || prev.title_en,
        title_zh: finalData.title_zh || prev.title_zh,
        slug: finalData.slug || prev.slug,
        excerpt_en: finalData.excerpt_en || prev.excerpt_en,
        excerpt_zh: finalData.excerpt_zh || prev.excerpt_zh,
        content_en: finalData.content_en || prev.content_en,
        content_zh: finalData.content_zh || prev.content_zh,
        category: finalData.category || prev.category,
        tags: (finalData.tags || []).join(', '),
        seo_title: finalData.seo_title || prev.seo_title,
        seo_description: finalData.seo_description || prev.seo_description,
        // S36: the AI's structured fields land here verbatim. The
        // editor in the form below lets the admin tweak any of
        // these before publishing.
        key_takeaways: finalData.key_takeaways ?? prev.key_takeaways,
        at_a_glance: finalData.at_a_glance ?? prev.at_a_glance,
        faq: finalData.faq ?? prev.faq,
        sources: finalData.sources ?? prev.sources,
        ai_prompt: JSON.stringify({ topic: aiTopic, category: aiCategory, length: aiLength, tone: aiTone, language: aiLanguage, targetKeyword: aiKeyword }),
      }));
      setAiStatus('success');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setAiStatus('idle');
        return;
      }
      setAiStatus('error');
      setAiError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleAICancel = () => {
    aiAbortRef.current?.abort();
    setAiStatus('idle');
  };

  const handleApplyAIAndClose = () => {
    setShowAIModal(false);
    setAiStatus('idle');
  };

  if (loading || !user) {
    return <div className="p-12 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/news" className="p-2 text-[#1B2A4A] hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">New Post</h1>
          <p className="text-[#4B5563] text-sm mt-1">
            Write the post manually, or use AI to draft from a topic. AI output
            is editable before you publish.
          </p>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        {/* AI generation panel */}
        <div className="bg-gradient-to-r from-[#9B1B30] to-[#7A1526] text-white p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h2 className="font-semibold text-base">Generate with AI</h2>
              <p className="text-sm text-white/80 mt-0.5">
                Describe a topic and the AI will draft a full SICA news post
                (title, excerpt, markdown body, tags, SEO meta). You can
                review and edit before publishing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAIModal(true)}
              className="inline-flex items-center gap-2 bg-white text-[#9B1B30] px-4 py-2 text-sm font-semibold hover:bg-gray-100 transition-colors shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              Generate
            </button>
          </div>
        </div>

        {/* Title (EN + ZH) */}
        <div className="bg-white border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Title</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">English *</label>
              <input
                type="text"
                value={form.title_en}
                onChange={(e) => update('title_en', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
                placeholder="SICA Partners with Tsinghua to Launch 2026 Scholarship Program"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Chinese (optional)</label>
              <input
                type="text"
                value={form.title_zh}
                onChange={(e) => update('title_zh', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
                placeholder="SICA与清华大学合作启动2026奖学金项目"
              />
            </div>
          </div>
        </div>

        {/* Slug + category + tags */}
        <div className="bg-white border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Metadata</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => update('slug', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-sm font-mono focus:outline-none focus:border-[#9B1B30]"
                placeholder="sica-tsinghua-partnership-2026"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#9B1B30]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => update('tags', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
                placeholder="tsinghua, scholarship, 2026"
              />
            </div>
          </div>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Excerpt (EN)</label>
              <textarea
                value={form.excerpt_en}
                onChange={(e) => update('excerpt_en', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30] resize-none"
                placeholder="1-2 sentence summary (max 200 chars)"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Excerpt (ZH)</label>
              <textarea
                value={form.excerpt_zh}
                onChange={(e) => update('excerpt_zh', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30] resize-none"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs text-gray-500 mb-1">Cover image URL (optional, 1200x630 recommended)</label>
            <input
              type="text"
              value={form.cover_image}
              onChange={(e) => update('cover_image', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Content (Markdown)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">English body *</label>
              <textarea
                value={form.content_en}
                onChange={(e) => update('content_en', e.target.value)}
                rows={16}
                className="w-full px-3 py-2 border border-gray-300 text-sm font-mono focus:outline-none focus:border-[#9B1B30]"
                placeholder="## Headline&#10;&#10;First paragraph...&#10;&#10;## Section 2&#10;&#10;..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Use standard Markdown. The post is sanitized before save to
                strip dangerous HTML; only safe markdown renders publicly.
              </p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Chinese body (optional)</label>
              <textarea
                value={form.content_zh}
                onChange={(e) => update('content_zh', e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 text-sm font-mono focus:outline-none focus:border-[#9B1B30]"
                placeholder="## 标题&#10;&#10;第一段..."
              />
            </div>
          </div>
        </div>

        {/* SEO meta */}
        <details className="bg-white border border-gray-200 p-5">
          <summary className="text-sm font-semibold text-[#1B2A4A] cursor-pointer">
            SEO meta (optional overrides)
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">SEO title (60-70 chars)</label>
              <input
                type="text"
                value={form.seo_title}
                onChange={(e) => update('seo_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">SEO description (140-160 chars)</label>
              <textarea
                value={form.seo_description}
                onChange={(e) => update('seo_description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30] resize-none"
              />
            </div>
          </div>
        </details>

        {/* S36: SEO + AEO + GEO structured fields. The AI
            pre-fills these; the admin can tweak any of them
            before publishing. Each section is independently
            saveable through the form's `update` setter. */}
        <StructuredFieldsEditor
          field="key_takeaways"
          value={form.key_takeaways}
          onChange={(v) => update('key_takeaways', v)}
        />
        <StructuredFieldsEditor
          field="at_a_glance"
          value={form.at_a_glance}
          onChange={(v) => update('at_a_glance', v)}
        />
        <StructuredFieldsEditor
          field="faq"
          value={form.faq}
          onChange={(v) => update('faq', v)}
        />
        <StructuredFieldsEditor
          field="sources"
          value={form.sources}
          onChange={(v) => update('sources', v)}
        />

        {/* Save buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-[#1B2A4A] border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#9B1B30] text-white font-semibold text-sm hover:bg-[#7A1526] transition-colors disabled:opacity-50"
          >
            <Eye className="h-4 w-4" />
            {saving ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </form>

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#1F2937] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#9B1B30]" />
                AI Post Generator
              </h2>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {aiStatus === 'idle' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Describe a topic and the AI will draft a full SICA news
                    post — title, excerpt, markdown body, tags, SEO meta.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1">
                      Topic *
                    </label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="e.g. SICA's new partnership with Tsinghua University for 2026 scholarships"
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-1">Category</label>
                      <select
                        value={aiCategory}
                        onChange={(e) => setAiCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#9B1B30]"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-1">Length</label>
                      <select
                        value={aiLength}
                        onChange={(e) => setAiLength(e.target.value as 'short' | 'medium' | 'long')}
                        className="w-full px-3 py-2 border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#9B1B30]"
                      >
                        <option value="short">Short (400-600 words)</option>
                        <option value="medium">Medium (800-1200 words)</option>
                        <option value="long">Long (1500-2200 words)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-1">Language</label>
                      <select
                        value={aiLanguage}
                        onChange={(e) => setAiLanguage(e.target.value as 'en' | 'zh' | 'both')}
                        className="w-full px-3 py-2 border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#9B1B30]"
                      >
                        <option value="en">English only</option>
                        <option value="zh">Chinese only</option>
                        <option value="both">Both (full bilingual)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-1">Tone</label>
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#9B1B30]"
                      >
                        <option value="informational">Informational</option>
                        <option value="celebratory">Celebratory</option>
                        <option value="instructional">Instructional / how-to</option>
                        <option value="urgent">Urgent / deadline</option>
                        <option value="analytical">Analytical</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1">
                      Target SEO keyword (optional)
                    </label>
                    <input
                      type="text"
                      value={aiKeyword}
                      onChange={(e) => setAiKeyword(e.target.value)}
                      placeholder="e.g. Tsinghua scholarship 2026"
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The AI will weave this keyword naturally into the title,
                      first paragraph, and 1-2 other places.
                    </p>
                  </div>
                </div>
              )}

              {aiStatus === 'generating' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Loader2 className="h-4 w-4 text-[#9B1B30] animate-spin" />
                    <span className="text-sm text-gray-600">{aiProgress}</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-3 max-h-72 overflow-y-auto">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                      {aiRawContent || 'Waiting for response...'}
                    </pre>
                  </div>
                </div>
              )}

              {aiStatus === 'success' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      Post generated and pre-filled in the form below.
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Review the title, content, and SEO meta below. Edit
                    anything you'd like, then click "Apply & Edit" to close
                    this dialog and start refining.
                  </p>
                </div>
              )}

              {aiStatus === 'error' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-red-600">Generation failed</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{aiError}</p>
                  <button
                    type="button"
                    onClick={() => setAiStatus('idle')}
                    className="text-sm text-[#9B1B30] hover:underline"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
              {aiStatus === 'idle' && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowAIModal(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-[#1F2937]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={!aiTopic.trim()}
                    className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </button>
                </>
              )}
              {aiStatus === 'generating' && (
                <button
                  type="button"
                  onClick={handleAICancel}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-[#1F2937]"
                >
                  Cancel
                </button>
              )}
              {aiStatus === 'success' && (
                <button
                  type="button"
                  onClick={handleApplyAIAndClose}
                  className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Apply &amp; Edit
                </button>
              )}
              {aiStatus === 'error' && (
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-[#1F2937]"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function tryParseClient(raw: string): AIGenerated | null {
  try {
    let s = raw.trim();
    s = s.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    const first = s.indexOf('{');
    const last = s.lastIndexOf('}');
    if (first === -1 || last === -1 || last <= first) return null;
    s = s.slice(first, last + 1).replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(s) as AIGenerated;
  } catch {
    return null;
  }
}

export default function NewPostPage() {
  return (
    <ToastProvider>
      <NewPostInner />
    </ToastProvider>
  );
}

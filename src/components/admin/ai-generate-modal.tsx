'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Sparkles, X, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Called with the AI's parsed JSON output. The parent decides
   * whether to POST (create) or PUT (regenerate) based on `mode`.
   */
  onGenerated: (data: Record<string, unknown>, mode: 'create' | 'regenerate') => void;
  /**
   * - 'create' (default): modal opens empty, button says "Create".
   * - 'regenerate': modal pre-fills with the existing name, button
   *   says "Re-generate". Parent should PUT to the existing slug.
   */
  mode?: 'create' | 'regenerate';
  /** Pre-fill the input. Used in 'regenerate' mode. */
  initialName?: string;
}

interface GenerationState {
  status: 'idle' | 'generating' | 'success' | 'error';
  progress: string;
  error: string;
  generatedData: Record<string, unknown> | null;
  rawContent: string;
}

export function AIGenerateModal({
  isOpen,
  onClose,
  onGenerated,
  mode = 'create',
  initialName = '',
}: AIGenerateModalProps) {
  const { t } = useI18n();
  const [universityName, setUniversityName] = useState(initialName);
  const [state, setState] = useState<GenerationState>({
    status: 'idle',
    progress: '',
    error: '',
    generatedData: null,
    rawContent: '',
  });
  const abortRef = useRef<AbortController | null>(null);

  // Reset the input + state whenever the modal opens, so the
  // initialName from the parent actually takes effect (and a stale
  // preview from a previous session doesn't leak in).
  useEffect(() => {
    if (isOpen) {
      setUniversityName(initialName);
      setState({ status: 'idle', progress: '', error: '', generatedData: null, rawContent: '' });
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!universityName.trim()) return;

    abortRef.current = new AbortController();
    setState({ status: 'generating', progress: t('adminUniversities.aiModal.generating', { n: 0 }), error: '', generatedData: null, rawContent: '' });

    try {
      // Phase 36: apiFetch attaches Bearer token automatically so the
      // route's `getRequestAuth` gate accepts the admin caller. Per-admin
      // rate limiting + AI failure capture only work when the caller is
      // authenticated, so this matters.
      const response = await apiFetch('/api/ai/generate-university', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: universityName.trim() }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error || 'Failed to generate');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullContent = '';
      let serverParsedData: Record<string, unknown> | null = null;
      // Phase 71: buffer partial SSE lines across network chunks.
      // Previously each read() was split on '\n' independently — a
      // `data: {...}` line split across two chunks (common for the
      // final multi-KB `parsed` event) failed JSON.parse on both
      // halves and was silently skipped, so the server-validated
      // payload was lost and the client fell back to reparsing the
      // raw text (often itself truncated by a split content chunk).
      let sseBuffer = '';

      const handleSseLine = (line: string) => {
        if (!line.startsWith('data: ')) return;
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.parsed) {
            // Server-side validated JSON - use directly
            serverParsedData = parsed.parsed as Record<string, unknown>;
          }
          if (parsed.content) {
            fullContent += parsed.content;
            setState(prev => ({
              ...prev,
              progress: t('adminUniversities.aiModal.generating', { n: fullContent.length }),
              rawContent: fullContent,
            }));
          }
        } catch (err) {
          // Provider/stream errors are real failures — rethrow so the
          // outer catch shows them. Only genuinely unparseable lines
          // (shouldn't happen with buffering) are skipped.
          if (err instanceof Error && !(err instanceof SyntaxError)) throw err;
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split('\n');
        // Last element is a partial line (or '' if the chunk ended
        // on a newline) — keep it for the next chunk.
        sseBuffer = lines.pop() ?? '';
        for (const line of lines) handleSseLine(line);
      }
      // Flush any trailing line that arrived without a final newline.
      if (sseBuffer.trim()) handleSseLine(sseBuffer);

      // Use server-parsed data first, then fall back to client parsing
      let generatedData: Record<string, unknown>;

      if (serverParsedData) {
        generatedData = serverParsedData;
      } else {
        // Client-side fallback JSON parsing
        let jsonStr = fullContent.trim();
        // Remove markdown code blocks if present
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        // Extract JSON object from the content (find first { to last })
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
        }
        // Remove trailing commas
        const fixed = jsonStr.replace(/,\s*([}\]])/g, '$1');

        try {
          generatedData = JSON.parse(fixed);
        } catch {
          throw new Error(t('adminUniversities.aiModal.parseFailed'));
        }
      }

      setState(prev => ({
        ...prev,
        status: 'success',
        progress: t('adminUniversities.aiModal.generating', { n: fullContent.length }),
        generatedData,
      }));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setState(prev => ({ ...prev, status: 'idle', progress: '' }));
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({ ...prev, status: 'error', error: errorMessage }));
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setState({ status: 'idle', progress: '', error: '', generatedData: null, rawContent: '' });
  };

  const handleUseGenerated = () => {
    if (state.generatedData) {
      onGenerated(state.generatedData, mode);
      handleClose();
    }
  };

  const handleClose = () => {
    abortRef.current?.abort();
    setUniversityName(initialName);
    setState({ status: 'idle', progress: '', error: '', generatedData: null, rawContent: '' });
    onClose();
  };

  const isRegenerate = mode === 'regenerate';

  const renderFieldPreview = (key: string, value: unknown) => {
    if (value === null || value === undefined || value === '') return null;
    if (Array.isArray(value)) {
      return (
        <div key={key} className="mb-2">
          <span className="text-xs font-medium text-[#1B2A4A]">{key}:</span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {value.map((item: unknown, i: number) => (
              <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 text-[#4B5563]">
                {String(item)}
              </span>
            ))}
          </div>
        </div>
      );
    }
    if (typeof value === 'object') return null;
    return (
      <div key={key} className="mb-2">
        <span className="text-xs font-medium text-[#1B2A4A]">{key}:</span>{' '}
        <span className="text-xs text-[#4B5563]">
          {String(value).length > 120 ? String(value).slice(0, 120) + '...' : String(value)}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {isRegenerate ? (
              <RefreshCw className="w-5 h-5 text-[#9B1B30]" />
            ) : (
              <Sparkles className="w-5 h-5 text-[#9B1B30]" />
            )}
            <h2 className="text-lg font-semibold text-[#1F2937]">
              {isRegenerate ? t('adminUniversities.aiModal.titleRegenerate') : t('adminUniversities.aiModal.titleCreate')}
            </h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {state.status === 'idle' && (
            <div>
              <p className="text-sm text-[#4B5563] mb-4">
                {isRegenerate ? t('adminUniversities.aiModal.bodyRegenerate') : t('adminUniversities.aiModal.bodyCreate')}
              </p>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminUniversities.aiModal.universityNameLabel')}</label>
              <input
                type="text"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                placeholder={t('adminUniversities.aiModal.universityNamePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
                onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); }}
              />
            </div>
          )}

          {state.status === 'generating' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Spinner size="sm" className="text-[#9B1B30]" />
                <span className="text-sm text-[#4B5563]">{state.progress}</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-3 max-h-60 overflow-y-auto">
                <pre className="text-xs text-[#4B5563] whitespace-pre-wrap font-mono">
                  {state.rawContent || t('adminUniversities.aiModal.generating', { n: 0 })}
                </pre>
              </div>
            </div>
          )}

          {state.status === 'error' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-600">{t('adminUniversities.aiModal.failed')}</span>
              </div>
              <p className="text-sm text-[#4B5563] mb-4">{state.error}</p>
              <button
                onClick={() => setState({ status: 'idle', progress: '', error: '', generatedData: null, rawContent: '' })}
                className="text-sm text-[#9B1B30] hover:underline"
              >
                {t('adminUniversities.aiModal.tryAgain')}
              </button>
            </div>
          )}

          {state.status === 'success' && state.generatedData && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  {t('adminUniversities.aiModal.createdFor', { name: String(state.generatedData.name || universityName) })}
                </span>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-3 max-h-80 overflow-y-auto">
                {Object.entries(state.generatedData).map(([key, value]) => renderFieldPreview(key, value))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          {state.status === 'idle' && (
            <>
              <button onClick={handleClose} className="px-4 py-2 text-sm text-[#4B5563] hover:text-[#1F2937]">
                {t('adminUniversities.aiModal.cancel')}
              </button>
              <button
                onClick={handleGenerate}
                disabled={!universityName.trim()}
                className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                {t('adminUniversities.aiModal.generate')}
              </button>
            </>
          )}

          {state.status === 'generating' && (
            <button onClick={handleCancel} className="px-4 py-2 text-sm text-[#4B5563] hover:text-[#1F2937]">
              {t('adminUniversities.aiModal.cancel')}
            </button>
          )}

          {state.status === 'success' && state.generatedData && (
            <>
              <button onClick={handleClose} className="px-4 py-2 text-sm text-[#4B5563] hover:text-[#1F2937]">
                {t('adminUniversities.aiModal.discard')}
              </button>
              <button
                onClick={handleUseGenerated}
                className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                {isRegenerate ? t('adminUniversities.aiModal.updateSubmit') : t('adminUniversities.aiModal.createSubmit')}
              </button>
            </>
          )}

          {state.status === 'error' && (
            <button onClick={handleClose} className="px-4 py-2 text-sm text-[#4B5563] hover:text-[#1F2937]">
              {t('adminUniversities.aiModal.close')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

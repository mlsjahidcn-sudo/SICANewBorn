'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (data: Record<string, unknown>) => void;
}

interface GenerationState {
  status: 'idle' | 'generating' | 'success' | 'error';
  progress: string;
  error: string;
  generatedData: Record<string, unknown> | null;
  rawContent: string;
}

export function AIGenerateModal({ isOpen, onClose, onGenerated }: AIGenerateModalProps) {
  const [universityName, setUniversityName] = useState('');
  const [state, setState] = useState<GenerationState>({
    status: 'idle',
    progress: '',
    error: '',
    generatedData: null,
    rawContent: '',
  });
  const abortRef = useRef<AbortController | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!universityName.trim()) return;

    abortRef.current = new AbortController();
    setState({ status: 'generating', progress: 'Connecting to AI...', error: '', generatedData: null, rawContent: '' });

    try {
      const response = await fetch('/api/ai/generate-university', {
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

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
                  progress: `Generating... ${fullContent.length} chars`,
                  rawContent: fullContent,
                }));
              }
            } catch {
              // skip unparseable lines
            }
          }
        }
      }

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
          throw new Error('Failed to parse AI response as JSON. Please try again.');
        }
      }

      setState(prev => ({
        ...prev,
        status: 'success',
        progress: `Generated successfully!`,
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
      onGenerated(state.generatedData);
      handleClose();
    }
  };

  const handleClose = () => {
    abortRef.current?.abort();
    setUniversityName('');
    setState({ status: 'idle', progress: '', error: '', generatedData: null, rawContent: '' });
    onClose();
  };

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
            <Sparkles className="w-5 h-5 text-[#9B1B30]" />
            <h2 className="text-lg font-semibold text-[#1F2937]">AI University Generator</h2>
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
                Enter a Chinese university name and AI will generate all the information automatically — description, programs, rankings, accommodation, and more.
              </p>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">University Name</label>
              <input
                type="text"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                placeholder="e.g. Sichuan University, 四川大学, Beijing Normal University"
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
                onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); }}
              />
            </div>
          )}

          {state.status === 'generating' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Loader2 className="w-4 h-4 text-[#9B1B30] animate-spin" />
                <span className="text-sm text-[#4B5563]">{state.progress}</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-3 max-h-60 overflow-y-auto">
                <pre className="text-xs text-[#4B5563] whitespace-pre-wrap font-mono">
                  {state.rawContent || 'Waiting for response...'}
                </pre>
              </div>
            </div>
          )}

          {state.status === 'error' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-600">Generation failed</span>
              </div>
              <p className="text-sm text-[#4B5563] mb-4">{state.error}</p>
              <button
                onClick={() => setState({ status: 'idle', progress: '', error: '', generatedData: null, rawContent: '' })}
                className="text-sm text-[#9B1B30] hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {state.status === 'success' && state.generatedData && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Generated info for {String(state.generatedData.name || universityName)}
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
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!universityName.trim()}
                className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                Generate
              </button>
            </>
          )}

          {state.status === 'generating' && (
            <button onClick={handleCancel} className="px-4 py-2 text-sm text-[#4B5563] hover:text-[#1F2937]">
              Cancel
            </button>
          )}

          {state.status === 'success' && state.generatedData && (
            <>
              <button onClick={handleClose} className="px-4 py-2 text-sm text-[#4B5563] hover:text-[#1F2937]">
                Discard
              </button>
              <button
                onClick={handleUseGenerated}
                className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Create University
              </button>
            </>
          )}

          {state.status === 'error' && (
            <button onClick={handleClose} className="px-4 py-2 text-sm text-[#4B5563] hover:text-[#1F2937]">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

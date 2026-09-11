'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Send,
  Square,
  MessageSquare,
  Minimize2,
  ChevronDown,
  ChevronUp,
  UserPlus,
  CheckCircle2,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Message } from './Message';
import { track } from '@/lib/analytics';
import { useI18n } from '@/lib/i18n';
import { pickSuggestedPrompts, type SuggestedPrompt } from '@/lib/ai/suggested-prompts';
import { useSmartScroll } from '@/lib/ai/use-smart-scroll';
import { registerAbort, abortStream, clearAbort } from '@/lib/ai/chat-abort';
import { persistMessages } from '@/lib/ai/chat-history';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
  /** True if the assistant bubble is showing an error string (enables Retry). */
  isError?: boolean;
  /** Phase 81: trailing "(stopped)" suffix added when user clicked Stop mid-stream. */
  stopped?: boolean;
}

interface LeadForm {
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  interested_degree: '' | 'Bachelor' | 'Master' | 'PhD' | 'Language' | 'Other';
  interested_program: string;
  interested_university: string;
}

interface LeadFormState {
  // 'collapsed' — show only a small "Save my progress" pill
  // 'open'     — show the full form
  // 'submitted'— show a thank-you message
  // 'skipped'  — user dismissed it; don't show the pill anymore
  panel: 'collapsed' | 'open' | 'submitted' | 'skipped';
  data: LeadForm;
  saving: boolean;
  error: string;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

const STORAGE_PREFIX = 'sica_chat_v1';

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const newSessionToken = () => {
  const raw =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return raw.replace(/-/g, '').slice(0, 64);
};

/**
 * Best-effort name extraction from the visitor's chat messages.
 * Matches common self-introduction patterns ("my name is X", "I'm X",
 * "this is X", "call me X", "name: X") in user-typed messages, latest
 * first. Returns the most recent match. Returns null if no match.
 *
 * Filters common false positives ("I am looking for...", "I am
 * interested in...") via a small stop-word list on the first captured
 * word, plus a length sanity check (2-40 chars).
 *
 * Used to pre-fill the "Save your progress" form so leads land in the
 * admin inbox with a real name instead of "(no name)" — the LLM doesn't
 * ask for the name explicitly, so this is the only signal we get.
 */
export function extractNameFromMessages(messages: ReadonlyArray<Pick<ChatMessage, 'role' | 'content'>>): string | null {
  const userMsgs = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .reverse(); // latest first

  const patterns: RegExp[] = [
    /(?:my name(?:'s|\s+is))\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/,
    /(?:calls?\s+me|just\s+calls?\s+me|they\s+call\s+me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
    /(?:this is|i'?m|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
  ];

  const STOP_FIRST_WORDS = new Set([
    'looking', 'interested', 'a', 'the', 'from', 'in', 'at', 'currently',
    'student', 'graduate', 'planning', 'hoping', 'trying', 'wondering',
    'considering', 'researching', 'exploring', 'applying', 'searching',
  ]);

  for (const content of userMsgs) {
    for (const pat of patterns) {
      const m = content.match(pat);
      if (!m || !m[1]) continue;
      const candidate = m[1].trim();
      const firstWord = candidate.split(/\s+/)[0].toLowerCase();
      if (STOP_FIRST_WORDS.has(firstWord)) continue;
      if (candidate.length < 2 || candidate.length > 40) continue;
      return candidate;
    }
  }
  return null;
}

/**
 * Best-effort email extraction from the visitor's chat messages.
 * Returns the first email-looking string in any user message, or null.
 */
export function extractEmailFromMessages(messages: ReadonlyArray<Pick<ChatMessage, 'role' | 'content'>>): string | null {
  const emailRe = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  for (const m of messages) {
    if (m.role !== 'user') continue;
    const match = m.content.match(emailRe);
    if (match) return match[0];
  }
  return null;
}

export function ChatWindow({ isOpen, onClose, onMinimize }: ChatWindowProps) {
  const { t, locale } = useI18n();

  // ====== Conversation state ======
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [restoredFromLocal, setRestoredFromLocal] = useState(false);
  const [restoredFromBackend, setRestoredFromBackend] = useState(false);
  const [chatReady, setChatReady] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Phase 81: smart-scroll — only follows tail when user is near bottom
  const { ref: scrollContainerRef, followTail, scrollToBottom } = useSmartScroll();

  // Phase 81: suggested prompts (i18n'd)
  const suggestedPrompts = useMemo(() => pickSuggestedPrompts(locale), [locale]);

  // ====== Lead capture state ======
  const [lead, setLead] = useState<LeadFormState>({
    panel: 'collapsed',
    data: {
      name: '',
      email: '',
      whatsapp: '',
      country: '',
      interested_degree: '',
      interested_program: '',
      interested_university: '',
    },
    saving: false,
    error: '',
  });

  // Phase 81: hold the last user message so the Retry button can
  // re-send it without the visitor having to retype.
  const lastUserMessageRef = useRef<string>('');
  // How many times the user has retried the same message. Increments
  // each time Retry is clicked; reset when a new message is sent.
  const retryCountRef = useRef(0);
  // Phase 81: New Chat confirmation dialog
  const [confirmNewChat, setConfirmNewChat] = useState(false);

  // ====== On mount: restore today's conversation + session token ======
  useEffect(() => {
    const today = todayKey();

    const TOKEN_KEY = `${STORAGE_PREFIX}_session_token`;
    let token = '';
    try {
      token = localStorage.getItem(TOKEN_KEY) ?? '';
      if (!token) {
        token = newSessionToken();
        localStorage.setItem(TOKEN_KEY, token);
      }
    } catch {
      token = newSessionToken();
    }
    setSessionToken(token);

    // Today's conversation history (localStorage, same-day only).
    const MESSAGES_KEY = `${STORAGE_PREFIX}_messages_${today}`;
    let restoredMessages: ChatMessage[] | null = null;
    try {
      const raw = localStorage.getItem(MESSAGES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          restoredMessages = parsed;
        }
      }
    } catch {
      // Ignore parse errors — start fresh
    }

    if (restoredMessages && restoredMessages.length > 0) {
      setMessages(restoredMessages);
      setRestoredFromLocal(true);
    } else {
      // No local copy today — show the welcome message. If a 7-day
      // backend history exists, it'll prepend on top of this in the
      // effect below.
      setMessages([{ id: 'welcome', role: 'assistant', content: t('chat.welcomeMessage') }]);
    }

    // Lead form partial data — preserve in-progress fills across
    // page loads within the same browser.
    const LEAD_KEY = `${STORAGE_PREFIX}_lead`;
    try {
      const raw = localStorage.getItem(LEAD_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setLead((prev) => ({
            ...prev,
            panel: parsed.panel === 'skipped' ? 'collapsed' : prev.panel,
            data: { ...prev.data, ...(parsed.data ?? {}) },
          }));
        }
      }
    } catch {
      // ignore
    }

    setChatReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase 81: when the locale changes AFTER mount, refresh the welcome
  // message in place (so a zh visitor who flips to en gets the en greeting).
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length !== 1 || prev[0].id !== 'welcome') return prev;
      return [{ ...prev[0], content: t('chat.welcomeMessage') }];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // Phase 82: backend history hydration. Fires once after the token
  // is known. Skips when the localStorage copy already has today's
  // conversation (local wins for same-day; backend fills the gap
  // for days 1-6).
  useEffect(() => {
    if (!chatReady || !sessionToken) return;
    if (restoredFromLocal) return; // today's copy already wins
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/chat/session/messages?session_token=${encodeURIComponent(sessionToken)}`,
          { headers: { Accept: 'application/json' } },
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { messages: Array<{ role: string; content: string; created_at: string }> };
        if (!data.messages || data.messages.length === 0 || cancelled) return;
        // Prepend the backend history + a divider on top of the welcome
        const restored: ChatMessage[] = data.messages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .map((m, i) => ({
            id: `hist-${i}-${m.created_at}`,
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));
        const oldest = data.messages[0]?.created_at;
        const daysAgo = oldest ? Math.max(0, Math.floor((Date.now() - new Date(oldest).getTime()) / 86400000)) : 0;
        const divider: ChatMessage = {
          id: 'hist-divider',
          role: 'assistant',
          content:
            daysAgo > 0
              ? t('chat.restoredFromDaysAgo', { count: daysAgo })
              : t('chat.restoredBanner'),
        };
        setMessages((prev) => {
          // Only prepend if we still have just the welcome message
          if (prev.length === 1 && prev[0].id === 'welcome') {
            return [divider, ...restored, prev[0]];
          }
          return prev;
        });
        setRestoredFromBackend(true);
      } catch {
        // best-effort
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatReady, sessionToken, restoredFromLocal]);

  // ====== On every messages change: persist to localStorage ======
  useEffect(() => {
    if (!chatReady) return;
    const today = todayKey();
    const MESSAGES_KEY = `${STORAGE_PREFIX}_messages_${today}`;
    try {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    } catch {
      // localStorage quota / private mode — fail silently
    }
  }, [messages, chatReady]);

  // ====== Persist lead form partial state to localStorage ======
  useEffect(() => {
    if (!chatReady) return;
    const LEAD_KEY = `${STORAGE_PREFIX}_lead`;
    try {
      localStorage.setItem(
        LEAD_KEY,
        JSON.stringify({ panel: lead.panel, data: lead.data }),
      );
    } catch {
      // ignore
    }
  }, [lead, chatReady]);

  // ====== On every new user/assistant message: persist to chat_sessions via API ======
  useEffect(() => {
    if (!chatReady || !sessionToken || messages.length < 2) return;
    const persistable = messages
      .filter((m) => m.id !== 'welcome' && m.id !== 'hist-divider' && !m.id.startsWith('hist-') && !m.isLoading)
      .map((m) => ({
        role: m.role,
        content: m.content,
        client_sent_at: new Date().toISOString(),
      }));
    if (persistable.length === 0) return;

    fetch('/api/chat/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_token: sessionToken,
        messages: persistable,
        source_page: typeof window !== 'undefined' ? window.location.pathname : null,
      }),
    }).catch(() => {
      // Non-fatal — local copy is the source of truth.
    });

    // Phase 82: parallel-write to the 7-day backend history table.
    // This is what makes a returning visitor see their old
    // conversation instead of "Hi there! 👋" again. Fire-and-forget
    // — same posture as the PATCH above.
    persistMessages(sessionToken, persistable);
  }, [messages, chatReady, sessionToken]);

  // ====== Upsert the session row on first mount ======
  useEffect(() => {
    if (!chatReady || !sessionToken) return;
    fetch('/api/chat/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_token: sessionToken,
        source_page: typeof window !== 'undefined' ? window.location.pathname : null,
        locale: typeof document !== 'undefined' ? document.documentElement.lang : null,
      }),
    }).catch(() => {
      // Non-fatal — local copy is the source of truth
    });
  }, [chatReady, sessionToken]);

  // Phase 81: smart-scroll. Follows the tail when user is near the
  // bottom; leaves them alone when they've scrolled up to read history.
  useEffect(() => {
    if (followTail) {
      scrollToBottom(messages.length > 1 ? 'smooth' : 'auto');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, followTail]);

  // ====== Send message (or start a stoppable stream) ======
  const handleSend = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
      if (!text || isLoading) return;

      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text,
      };
      lastUserMessageRef.current = text;
      retryCountRef.current = 0;

      const lang = typeof document !== 'undefined' ? document.documentElement.lang : 'en';
      const localeTag: 'en' | 'zh' = lang === 'zh' ? 'zh' : 'en';
      track('chatbot_message_sent', {
        locale: localeTag,
        message_length: userMessage.content.length,
      });

      setMessages((prev) => [...prev, userMessage]);
      if (!overrideText) setInput('');
      setIsLoading(true);

      const assistantMessage: ChatMessage = {
        id: `a-${Date.now() + 1}`,
        role: 'assistant',
        content: '',
        isLoading: true,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Track typing-label visibility for analytics (throttled).
      let typingLabelFired = false;
      const fireTypingLabelOnce = () => {
        if (typingLabelFired) return;
        typingLabelFired = true;
        track('chatbot_typing_label_visible', { locale: localeTag });
      };

      const controller = registerAbort(sessionToken);

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messages.concat(userMessage).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          let serverMessage = 'Failed to send message';
          try {
            const errBody = (await response.json()) as { error?: string };
            if (errBody?.error) serverMessage = errBody.error;
          } catch {
            // server returned non-JSON; fall back to generic copy
          }
          throw new Error(serverMessage);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  fireTypingLabelOnce();
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id
                        ? { ...m, content: fullContent, isLoading: false }
                        : m,
                    ),
                  );
                }
              } catch {
                // skip unparseable SSE line
              }
            }
          }
        }
      } catch (error) {
        // Aborted by Stop — keep the partial response and tag it.
        if (error instanceof DOMException && error.name === 'AbortError') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? {
                    ...m,
                    content: m.content
                      ? `${m.content} ${t('chat.stoppedSuffix')}`
                      : t('chat.stoppedSuffix'),
                    isLoading: false,
                    stopped: true,
                  }
                : m,
            ),
          );
          return;
        }
        console.error('Error sending message:', error);
        const friendly =
          error instanceof Error
            ? error.message
            : 'Sorry, I encountered an error. Please try again or contact SICA directly for assistance.';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: friendly, isLoading: false, isError: true }
              : m,
          ),
        );
      } finally {
        clearAbort(sessionToken);
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, sessionToken, t],
  );

  // Phase 81: Stop button mid-stream
  const handleStop = useCallback(() => {
    abortStream(sessionToken);
    track('chatbot_stop_clicked', {
      locale: (typeof document !== 'undefined' && document.documentElement.lang === 'zh') ? 'zh' : 'en',
    });
  }, [sessionToken]);

  // Phase 81: Retry the last user message after an error
  const handleRetry = useCallback(async () => {
    const text = lastUserMessageRef.current;
    if (!text) return;
    retryCountRef.current += 1;
    track('chatbot_message_retry_clicked', {
      locale: (typeof document !== 'undefined' && document.documentElement.lang === 'zh') ? 'zh' : 'en',
      attempt_number: retryCountRef.current,
    });
    // Drop the last error assistant bubble before re-sending so the
    // list doesn't double up.
    setMessages((prev) => prev.filter((m) => !m.isError));
    await handleSend(text);
  }, [handleSend]);

  // Phase 81: textarea auto-resize + keyboard handling
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // ====== Suggested prompt click ======
  const handleSuggestedPrompt = useCallback(
    (prompt: SuggestedPrompt, index: number) => {
      track('chatbot_suggested_prompt_clicked', {
        locale: (typeof document !== 'undefined' && document.documentElement.lang === 'zh') ? 'zh' : 'en',
        prompt_index: index,
      });
      void handleSend(prompt.starter);
    },
    [handleSend],
  );

  // ====== Lead form submit ======
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const d = lead.data;
    if (!d.email.trim()) {
      setLead((prev) => ({ ...prev, error: 'Email is required' }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) {
      setLead((prev) => ({ ...prev, error: 'Invalid email' }));
      return;
    }
    setLead((prev) => ({ ...prev, saving: true, error: '' }));
    try {
      const recentMessages = messages
        .filter((m) => m.id !== 'welcome' && !m.id.startsWith('hist-') && m.id !== 'hist-divider' && !m.isLoading)
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 500) }));
      const res = await fetch('/api/leads/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...d,
          session_token: sessionToken,
          source_page: typeof window !== 'undefined' ? window.location.pathname : null,
          conversation_context: recentMessages,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save');
      }
      setLead((prev) => ({
        ...prev,
        panel: 'submitted',
        saving: false,
        error: '',
      }));
    } catch (err) {
      setLead((prev) => ({
        ...prev,
        saving: false,
        error: err instanceof Error ? err.message : 'Save failed',
      }));
    }
  };

  // ====== New conversation (clears today's localStorage copy + generates a new session token) ======
  const handleNewConversation = () => {
    const today = todayKey();
    const MESSAGES_KEY = `${STORAGE_PREFIX}_messages_${today}`;
    try {
      localStorage.removeItem(MESSAGES_KEY);
    } catch {
      // ignore
    }
    const newToken = newSessionToken();
    try {
      localStorage.setItem(`${STORAGE_PREFIX}_session_token`, newToken);
    } catch {
      // ignore
    }
    setSessionToken(newToken);
    setMessages([{ id: 'welcome', role: 'assistant', content: t('chat.welcomeMessage') }]);
    setRestoredFromLocal(false);
    setRestoredFromBackend(false);
    setLead((prev) => ({
      ...prev,
      panel: 'collapsed',
      data: {
        name: '',
        email: '',
        whatsapp: '',
        country: '',
        interested_degree: '',
        interested_program: '',
        interested_university: '',
      },
    }));
    lastUserMessageRef.current = '';
    retryCountRef.current = 0;
    setConfirmNewChat(false);
    track('chatbot_new_chat_clicked', {
      locale: (typeof document !== 'undefined' && document.documentElement.lang === 'zh') ? 'zh' : 'en',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 z-50 w-full sm:w-[380px] sm:max-w-[90vw] h-full sm:h-[640px] sm:max-h-[85vh] bg-white sm:rounded-none shadow-2xl border-0 sm:border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-[#9B1B30]">
        <div className="flex items-center gap-2 text-white">
          <MessageSquare size={20} />
          <h3 className="font-semibold">{t('chat.header')}</h3>
        </div>
        <div className="flex items-center gap-1">
          {/* Phase 81: New Chat always visible */}
          <button
            onClick={() => setConfirmNewChat(true)}
            className="p-1.5 text-white hover:bg-white/20 transition-colors"
            aria-label={t('chat.newChatButton')}
            title={t('chat.newChatButton')}
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onMinimize}
            className="p-1.5 text-white hover:bg-white/20 transition-colors"
            aria-label="Minimize"
            title="Minimize"
          >
            <Minimize2 size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Lead capture panel — collapsible, above the conversation */}
      <LeadPanel lead={lead} setLead={setLead} onSubmit={handleLeadSubmit} messages={messages} t={t} />

      {/* Conversation history badge — shows for both local + backend restore */}
      {(restoredFromLocal || restoredFromBackend) && (
        <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
          <span>{t('chat.restoredBanner')}</span>
        </div>
      )}

      {/* Messages */}
      <div
        ref={(node) => {
          scrollContainerRef.current = node;
          messagesEndRef.current = node;
        }}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAF8]"
      >
        {/* Phase 81: suggested prompts on first open (no messages yet) */}
        {messages.length <= 1 && messages[0]?.id === 'welcome' && !isLoading && (
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
              {t('chat.suggestedPromptsHeader')}
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={prompt.id}
                  onClick={() => handleSuggestedPrompt(prompt, index)}
                  className="text-xs px-3 py-1.5 border border-[#9B1B30]/30 text-[#1B2A4A] bg-white hover:bg-[#9B1B30]/5 hover:border-[#9B1B30] transition-colors text-left"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <Message
            key={message.id}
            role={message.role}
            content={message.content}
            isLoading={message.isLoading}
            isError={message.isError}
          />
        ))}
        <div ref={messagesEndRef} />
        {/* Phase 81: Retry button on error assistant bubble.
            Rendered as a sibling so we can re-use the last user message
            from the parent component's lastUserMessageRef. */}
        {messages.some((m) => m.isError) && lastUserMessageRef.current && !isLoading && (
          <div className="flex justify-start pl-1">
            <button
              onClick={() => void handleRetry()}
              className="inline-flex items-center gap-1 text-xs text-[#9B1B30] hover:underline"
            >
              <RotateCcw size={12} />
              {t('chat.retryButton')}
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.inputPlaceholder')}
            disabled={false}
            rows={1}
            aria-label={t('chat.inputPlaceholder')}
            className="flex-1 min-h-[40px] max-h-[160px] resize-none px-3 py-2 border border-gray-300 bg-white text-sm focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
          />
          {isLoading ? (
            <Button
              onClick={handleStop}
              aria-label={t('chat.stopButton')}
              className="bg-[#9B1B30] hover:bg-[#7A1526] text-white"
              shape="square"
            >
              <Square size={18} fill="currentColor" />
            </Button>
          ) : (
            <Button
              onClick={() => void handleSend()}
              disabled={!input.trim()}
              aria-label={t('chat.sendButton')}
              className="bg-[#9B1B30] hover:bg-[#7A1526] disabled:opacity-50 text-white"
              shape="square"
            >
              <Send size={18} />
            </Button>
          )}
        </div>
      </div>

      {/* Phase 81: New Chat confirmation dialog */}
      {confirmNewChat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-sm w-full border border-gray-300 shadow-xl">
            <div className="px-5 py-4">
              <h3 className="font-semibold text-[#1B2A4A] text-base">
                {t('chat.newChatConfirmTitle')}
              </h3>
              <p className="text-sm text-[#4B5563] mt-2">
                {t('chat.newChatConfirmBody')}
              </p>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-[#FAFAF8]">
              <button
                onClick={() => setConfirmNewChat(false)}
                className="px-3 py-1.5 text-sm text-[#4B5563] hover:text-[#1B2A4A]"
              >
                Cancel
              </button>
              <button
                onClick={handleNewConversation}
                className="px-3 py-1.5 text-sm bg-[#9B1B30] hover:bg-[#7A1526] text-white"
              >
                {t('chat.newChatButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal local Button (the one in src/components/ui doesn't expose shape).
// Phase 81: rounded-none + supports square shape for the Stop button.
function Button({
  onClick,
  disabled,
  'aria-label': ariaLabel,
  className,
  children,
  shape,
}: {
  onClick: () => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
  children: React.ReactNode;
  shape?: 'square';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed ${shape === 'square' ? 'rounded-none' : ''} ${className ?? ''}`}
    >
      {children}
    </button>
  );
}

/**
 * Lead capture panel — shown above the conversation. Three
 * states: collapsed (pill), open (form), submitted (thank-you).
 */
function LeadPanel({
  lead,
  setLead,
  onSubmit,
  messages,
  t,
}: {
  lead: LeadFormState;
  setLead: React.Dispatch<React.SetStateAction<LeadFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  messages: ChatMessage[];
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const { panel, data, saving, error } = lead;

  const detectedName = useMemo(
    () => extractNameFromMessages(messages),
    [messages],
  );
  const detectedEmail = useMemo(
    () => extractEmailFromMessages(messages),
    [messages],
  );

  useEffect(() => {
    if (panel !== 'open') return;
    if (!detectedName && !detectedEmail) return;
    setLead((prev) => {
      if (prev.panel !== 'open') return prev;
      const updates: Partial<LeadForm> = {};
      if (detectedName && !prev.data.name.trim()) updates.name = detectedName;
      if (detectedEmail && !prev.data.email.trim()) updates.email = detectedEmail;
      if (Object.keys(updates).length === 0) return prev;
      return { ...prev, data: { ...prev.data, ...updates } };
    });
  }, [panel, detectedName, detectedEmail, setLead]);

  const updateField = <K extends keyof LeadForm>(k: K, v: LeadForm[K]) => {
    setLead((prev) => ({ ...prev, data: { ...prev.data, [k]: v } }));
  };

  if (panel === 'submitted') {
    return (
      <div className="px-4 py-3 bg-green-50 border-b border-green-200 text-xs text-green-800 flex items-start gap-2">
        <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold">{t('chat.leadPanelSubmitted')}</div>
          <div className="text-green-700 mt-0.5">
            A counselor will WhatsApp you with personalized program suggestions.
          </div>
        </div>
      </div>
    );
  }

  if (panel === 'skipped' || panel === 'collapsed') {
    if (data.email) {
      return (
        <div className="px-4 py-2 bg-[#FAFAF8] border-b border-gray-200 text-[11px] text-[#4B5563] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-green-600" />
            {t('chat.leadPanelSkipped')} ({data.email})
          </span>
          <button
            onClick={() => setLead((p) => ({ ...p, panel: 'open' }))}
            className="text-[#9B1B30] hover:underline font-medium"
          >
            {t('chat.leadPanelEdit')}
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => setLead((p) => ({ ...p, panel: 'open' }))}
        className="w-full px-4 py-2.5 bg-gradient-to-r from-[#9B1B30]/5 to-[#D4A853]/5 border-b border-[#9B1B30]/20 text-xs text-[#1B2A4A] hover:from-[#9B1B30]/10 hover:to-[#D4A853]/10 transition-colors flex items-center justify-between"
      >
        <span className="flex items-center gap-2 font-medium">
          <UserPlus size={14} className="text-[#9B1B30]" />
          {t('chat.leadPanelPill')}
        </span>
        <ChevronDown size={14} />
      </button>
    );
  }

  // panel === 'open'
  return (
    <form
      onSubmit={onSubmit}
      className="bg-[#FAFAF8] border-b border-gray-200 px-4 py-3 space-y-2.5"
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-[#1B2A4A] flex items-center gap-1.5">
          <UserPlus size={13} className="text-[#9B1B30]" />
          {t('chat.leadPanelOpen')}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLead((p) => ({ ...p, panel: 'skipped', error: '' }))}
            className="text-[10px] text-[#4B5563] hover:underline"
          >
            {t('chat.leadPanelSkip')}
          </button>
          <button
            type="button"
            onClick={() => setLead((p) => ({ ...p, panel: 'collapsed' }))}
            className="text-[#4B5563] hover:text-[#1B2A4A]"
            aria-label="Collapse"
          >
            <ChevronUp size={14} />
          </button>
        </div>
      </div>
      <p className="text-[10px] text-[#4B5563] leading-snug">
        Share a few details and a SICA counselor will follow up with personalized program suggestions. Just{' '}
        <span className="font-semibold text-[#9B1B30]">email</span> is required.
      </p>

      {error && (
        <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 px-2 py-1">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <input
            aria-label={t('chat.leadPanelFields.name')}
            placeholder={t('chat.leadPanelFields.namePlaceholder')}
            value={data.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
          />
          {data.name && detectedName && data.name === detectedName && (
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-medium text-[#1B2A4A] bg-[#D4A853]/30 px-1.5 py-0.5 pointer-events-none">
              {t('chat.leadPanelFromChat')}
            </span>
          )}
        </div>
        <div className="relative">
          <input
            aria-label={t('chat.leadPanelFields.email')}
            type="email"
            placeholder={t('chat.leadPanelFields.emailPlaceholder')}
            value={data.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
          />
          {data.email && detectedEmail && data.email === detectedEmail && (
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-medium text-[#1B2A4A] bg-[#D4A853]/30 px-1.5 py-0.5 pointer-events-none">
              {t('chat.leadPanelFromChat')}
            </span>
          )}
        </div>
        <input
          aria-label={t('chat.leadPanelFields.whatsapp')}
          placeholder={t('chat.leadPanelFields.whatsapp')}
          value={data.whatsapp}
          onChange={(e) => updateField('whatsapp', e.target.value)}
          className="px-2.5 py-1.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
        />
        <select
          aria-label={t('chat.leadPanelFields.country')}
          value={data.country}
          onChange={(e) => updateField('country', e.target.value)}
          className="px-2.5 py-1.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
        >
          <option value="">{t('chat.leadPanelFields.countryPlaceholder')}</option>
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c.code} value={c.code}>
              {t(c.i18nKey)}
            </option>
          ))}
        </select>
        <select
          aria-label={t('chat.leadPanelFields.degree')}
          value={data.interested_degree}
          onChange={(e) => updateField('interested_degree', e.target.value as LeadForm['interested_degree'])}
          className="px-2.5 py-1.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
        >
          <option value="">{t('chat.leadPanelFields.degreePlaceholder')}</option>
          <option value="Bachelor">{t('chat.degreeBachelor')}</option>
          <option value="Master">{t('chat.degreeMaster')}</option>
          <option value="PhD">{t('chat.degreePhd')}</option>
          <option value="Language">{t('chat.degreeLanguage')}</option>
          <option value="Other">{t('chat.degreeOther')}</option>
        </select>
        <input
          aria-label={t('chat.leadPanelFields.program')}
          placeholder={t('chat.leadPanelFields.programPlaceholder')}
          value={data.interested_program}
          onChange={(e) => updateField('interested_program', e.target.value)}
          className="px-2.5 py-1.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
        />
        <input
          aria-label={t('chat.leadPanelFields.university')}
          placeholder={t('chat.leadPanelFields.universityPlaceholder')}
          value={data.interested_university}
          onChange={(e) => updateField('interested_university', e.target.value)}
          className="col-span-2 px-2.5 py-1.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
        />
      </div>

      <button
        type="submit"
        disabled={saving || !data.email.trim()}
        className="w-full bg-[#9B1B30] hover:bg-[#7A1526] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-2 transition-colors flex items-center justify-center gap-1.5"
      >
        {saving ? (
          'Saving…'
        ) : (
          <>
            <UserPlus size={13} />
            {t('chat.leadPanelSubmit')}
          </>
        )}
      </button>
    </form>
  );
}

/**
 * Phase 81: country dropdown options. Code + i18n label. The code
 * (e.g. 'ng') is what gets sent to the API; the label is what the
 * visitor sees. Using codes instead of free-text keeps the admin lead
 * inbox normalized for filtering.
 */
const COUNTRY_OPTIONS: ReadonlyArray<{ code: string; i18nKey: string }> = [
  { code: 'ng', i18nKey: 'chat.countries.ng' },
  { code: 'gh', i18nKey: 'chat.countries.gh' },
  { code: 'ke', i18nKey: 'chat.countries.ke' },
  { code: 'za', i18nKey: 'chat.countries.za' },
  { code: 'eg', i18nKey: 'chat.countries.eg' },
  { code: 'ma', i18nKey: 'chat.countries.ma' },
  { code: 'in', i18nKey: 'chat.countries.in' },
  { code: 'bd', i18nKey: 'chat.countries.bd' },
  { code: 'pk', i18nKey: 'chat.countries.pk' },
  { code: 'ph', i18nKey: 'chat.countries.ph' },
  { code: 'id', i18nKey: 'chat.countries.id' },
  { code: 'vn', i18nKey: 'chat.countries.vn' },
  { code: 'th', i18nKey: 'chat.countries.th' },
  { code: 'my', i18nKey: 'chat.countries.my' },
  { code: 'kz', i18nKey: 'chat.countries.kz' },
  { code: 'uz', i18nKey: 'chat.countries.uz' },
  { code: 'ru', i18nKey: 'chat.countries.ru' },
  { code: 'tr', i18nKey: 'chat.countries.tr' },
  { code: 'br', i18nKey: 'chat.countries.br' },
  { code: 'mx', i18nKey: 'chat.countries.mx' },
  { code: 'us', i18nKey: 'chat.countries.us' },
  { code: 'gb', i18nKey: 'chat.countries.gb' },
  { code: 'other', i18nKey: 'chat.countries.other' },
];
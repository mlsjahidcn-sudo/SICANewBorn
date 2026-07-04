'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Minimize2,
  ChevronDown,
  ChevronUp,
  UserPlus,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from './Message';
import { track } from '@/lib/analytics';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
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

const WELCOME_MESSAGE = `Hi there! 👋 I'm SICA AI Assistant, your personal guide to studying in China!

I can help you with:
• Finding the right university and program
• Understanding the application process
• Scholarship information
• Visa preparation
• Student life in China

How can I assist you today? Feel free to ask any questions about studying in China! 🎓🇨🇳`;

const STORAGE_PREFIX = 'sica_chat_v1';

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const newSessionToken = () => {
  // Use crypto.randomUUID() if available; fall back to a manual
  // 32-char hex string. Strip dashes to keep within the 64-char
  // VARCHAR limit and to make the token URL-safe.
  const raw =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return raw.replace(/-/g, '').slice(0, 64);
};

const COUNTRY_OPTIONS = [
  'India', 'Pakistan', 'Bangladesh', 'Indonesia', 'Nigeria', 'Vietnam',
  'Thailand', 'Philippines', 'Egypt', 'Kenya', 'Ghana', 'Nepal',
  'Sri Lanka', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Russia', 'Brazil', 'Mexico', 'Other',
];

/**
 * Best-effort name extraction from the visitor's chat messages.
 *
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

  // Order matters: more specific patterns first so "my name is John"
  // wins over the generic "this is John".
  const patterns: RegExp[] = [
    /(?:my name(?:'s|\s+is))\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/,
    /(?:calls?\s+me|just\s+calls?\s+me|they\s+call\s+me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
    /(?:this is|i'?m|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
  ];

  // First-word stop list — common verbs that look like names but aren't
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
  // ====== Conversation state ======
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [restoredFromLocal, setRestoredFromLocal] = useState(false);
  const [chatReady, setChatReady] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // ====== On mount: restore today's conversation + session token ======
  useEffect(() => {
    const today = todayKey();

    // Session token — persist across visits (one per browser, not
    // reset at midnight; reset on "Start new conversation").
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

    // Today's conversation history
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
  }, []);

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

  // ====== On every new user/assistant message: append to chat_sessions via API ======
  useEffect(() => {
    if (!chatReady || !sessionToken || messages.length < 2) return;
    // Skip the welcome message (it was pre-baked, not from the server).
    // Send only the substantive conversation.
    const persistable = messages
      .filter((m) => m.id !== 'welcome' && !m.isLoading)
      .map((m) => ({
        role: m.role,
        content: m.content,
        client_sent_at: new Date().toISOString(),
      }));
    if (persistable.length === 0) return;

    // Fire and forget. The endpoint is idempotent (computes diff
    // by message_count), so we can safely re-send.
    fetch('/api/chat/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_token: sessionToken,
        messages: persistable,
        source_page: typeof window !== 'undefined' ? window.location.pathname : null,
      }),
    }).catch(() => {
      // Network error / API down — don't break the UX. The
      // localStorage copy is still the source of truth for the
      // "same day" persistence requirement.
    });
  }, [messages, chatReady, sessionToken]);

  // ====== Upsert the session row on first mount so chat_sessions
  //       exists in the DB even before the visitor sends anything. ======
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

  // ====== Scroll to bottom on new messages ======
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ====== Send message ======
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: input.trim(),
    };

    // Phase 29: fire chatbot_message_sent BEFORE the API
    // call (so the event survives a network failure —
    // we still want to know the user *tried* to send).
    // `message_length` is the user's typed char count,
    // useful for "are long questions more or less likely
    // to convert?" analysis. Locale from <html lang>
    // matches the Chatbot.tsx readLocale pattern.
    const lang = typeof document !== 'undefined' ? document.documentElement.lang : 'en';
    track('chatbot_message_sent', {
      locale: lang === 'zh' ? 'zh' : 'en',
      message_length: userMessage.content.length,
    });

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessage: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      isLoading: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Conversation context for the lead capture (snapshot of the
    // last few user messages + the latest AI reply). Sent to the
    // lead API if the visitor fills in the form.
    const lastFewUser = messages
      .filter((m) => m.role === 'user')
      .slice(-3)
      .map((m) => ({ role: m.role, content: m.content }));
    if (lastFewUser.length < 3) {
      lastFewUser.push({ role: 'user', content: userMessage.content });
    }

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
      });

      if (!response.ok) {
        // Phase 36: surface the server's actual error message so the
        // end-user sees "Too many messages. Wait 30s before trying
        // again." instead of the generic "Failed to send message".
        // The server returns JSON {error, code, retryAfterSec} for
        // both 429 (rate-limited) and 500 (AI provider failure).
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
      console.error('Error sending message:', error);
      // Phase 36: surface the server's actual error message from
      // the throw above. For 429 the server returns "You're sending
      // messages too quickly. Please wait 30s before trying again."
      // so the end-user gets a useful retry countdown instead of a
      // generic apology. For 500 the server returns the AI provider
      // error text — the user gets to tell us what happened.
      const friendly =
        error instanceof Error
          ? error.message
          : 'Sorry, I encountered an error. Please try again or contact SICA directly for assistance.';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? {
                ...m,
                content: friendly,
                isLoading: false,
              }
            : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
        .filter((m) => m.id !== 'welcome' && !m.isLoading)
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

  // ====== Start a new conversation (clears today's localStorage
  //       copy + generates a new session token). ======
  const handleNewConversation = () => {
    if (!confirm('Start a new conversation? Today\'s chat will be cleared.')) {
      return;
    }
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
    setMessages([{ id: 'welcome', role: 'assistant', content: WELCOME_MESSAGE }]);
    setRestoredFromLocal(false);
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 z-50 w-full sm:w-[380px] sm:max-w-[90vw] h-full sm:h-[640px] sm:max-h-[85vh] bg-white sm:rounded-lg shadow-2xl border-0 sm:border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-[#9B1B30]">
        <div className="flex items-center gap-2 text-white">
          <MessageSquare size={20} />
          <h3 className="font-semibold">SICA AI Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="p-1.5 text-white hover:bg-white/20 rounded transition-colors"
            aria-label="Minimize"
            title="Minimize"
          >
            <Minimize2 size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-white hover:bg-white/20 rounded transition-colors"
            aria-label="Close"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Lead capture panel — collapsible, above the conversation */}
      <LeadPanel lead={lead} setLead={setLead} onSubmit={handleLeadSubmit} messages={messages} />

      {/* Conversation history badge */}
      {restoredFromLocal && (
        <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
          <span>✓ Restored today's conversation</span>
          <button
            onClick={handleNewConversation}
            className="inline-flex items-center gap-1 hover:underline"
            title="Start a new conversation"
          >
            <Trash2 size={11} />
            New chat
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAF8]">
        {messages.map((message) => (
          <Message
            key={message.id}
            role={message.role}
            content={message.content}
            isLoading={message.isLoading}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-[#9B1B30] hover:bg-[#7a1526] text-white"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
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
}: {
  lead: LeadFormState;
  setLead: React.Dispatch<React.SetStateAction<LeadFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  messages: ChatMessage[];
}) {
  const { panel, data, saving, error } = lead;

  // Best-effort extraction from the conversation. Recomputes whenever
  // messages change so a late self-introduction still surfaces.
  const detectedName = useMemo(
    () => extractNameFromMessages(messages),
    [messages],
  );
  const detectedEmail = useMemo(
    () => extractEmailFromMessages(messages),
    [messages],
  );

  // Pre-fill any empty field when the panel opens (or when new
  // messages arrive while it's open). Only fills empty fields — never
  // overwrites what the visitor has already typed.
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
          <div className="font-semibold">Saved — SICA will reach out within 24h.</div>
          <div className="text-green-700 mt-0.5">
            A counselor will WhatsApp you with personalized program
            suggestions.
          </div>
        </div>
      </div>
    );
  }

  if (panel === 'skipped' || panel === 'collapsed') {
    if (data.email) {
      // If they already filled in an email, just show a brief
      // confirmation rather than the full pill.
      return (
        <div className="px-4 py-2 bg-[#FAFAF8] border-b border-gray-200 text-[11px] text-[#4B5563] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-green-600" />
            Details saved as {data.email}
          </span>
          <button
            onClick={() => setLead((p) => ({ ...p, panel: 'open' }))}
            className="text-[#9B1B30] hover:underline font-medium"
          >
            Edit
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
          Save my progress — get personalized advice
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
          Save your progress
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLead((p) => ({ ...p, panel: 'skipped', error: '' }))}
            className="text-[10px] text-[#4B5563] hover:underline"
          >
            Skip
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
        Share a few details and a SICA counselor will follow up with
        personalized program suggestions. Just <span className="font-semibold text-[#9B1B30]">email</span> is required.
      </p>

      {error && (
        <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 px-2 py-1">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <input
            aria-label="Name"
            placeholder="Name"
            value={data.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
          />
          {data.name && detectedName && data.name === detectedName && (
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-medium text-[#1B2A4A] bg-[#D4A853]/30 px-1.5 py-0.5 pointer-events-none">
              ✓ from chat
            </span>
          )}
        </div>
        <div className="relative">
          <input
            aria-label="Email"
            type="email"
            placeholder="Email *"
            value={data.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
          />
          {data.email && detectedEmail && data.email === detectedEmail && (
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-medium text-[#1B2A4A] bg-[#D4A853]/30 px-1.5 py-0.5 pointer-events-none">
              ✓ from chat
            </span>
          )}
        </div>
        <input
          aria-label="WhatsApp"
          placeholder="WhatsApp"
          value={data.whatsapp}
          onChange={(e) => updateField('whatsapp', e.target.value)}
          className="px-2.5 py-1.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
        />
        <select
          aria-label="Country"
          value={data.country}
          onChange={(e) => updateField('country', e.target.value)}
          className="px-2.5 py-1.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
        >
          <option value="">Country</option>
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          aria-label="Interested degree"
          value={data.interested_degree}
          onChange={(e) => updateField('interested_degree', e.target.value as LeadForm['interested_degree'])}
          className="px-2.5 py-1.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
        >
          <option value="">Degree</option>
          <option value="Bachelor">Bachelor</option>
          <option value="Master">Master</option>
          <option value="PhD">PhD</option>
          <option value="Language">Language</option>
          <option value="Other">Other</option>
        </select>
        <input
          aria-label="Interested program"
          placeholder="Program of interest"
          value={data.interested_program}
          onChange={(e) => updateField('interested_program', e.target.value)}
          className="px-2.5 py-1.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
        />
        <input
          aria-label="Interested university"
          placeholder="University (optional)"
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
            Save & Get Personalized Help
          </>
        )}
      </button>
    </form>
  );
}

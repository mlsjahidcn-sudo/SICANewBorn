'use client';

/**
 * One application's message thread — used by the student, partner and admin
 * portals. The endpoint decides who is allowed in; this component only shows
 * the conversation and sends messages.
 *
 * - Your own side's messages sit on the right (navy), the other side's on the left.
 * - Sending shows the message straight away; if the send fails it is removed
 *   again and the text is put back in the box.
 * - While mounted and the browser tab is visible, it refreshes every 30s and
 *   marks the other side's messages as read.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import {
  MESSAGE_MAX_LENGTH,
  type ApplicationMessage,
  type MessageSenderRole,
} from '@/lib/application-messages';

const POLL_MS = 30_000;

interface ThreadResponse {
  messages: ApplicationMessage[];
  canSend: boolean;
  disabledReason: 'no_portal_account' | null;
}

interface PendingMessage extends ApplicationMessage {
  pending?: boolean;
}

export interface ApplicationThreadProps {
  /** e.g. `/api/student/applications/<id>/messages` */
  endpoint: string;
  viewerRole: MessageSenderRole;
  /** Called after each load with the thread, e.g. to clear a tab badge. */
  onLoaded?: (messages: ApplicationMessage[]) => void;
}

export function ApplicationThread({ endpoint, viewerRole, onLoaded }: ApplicationThreadProps) {
  const { t, locale } = useI18n();
  const [messages, setMessages] = useState<PendingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [canSend, setCanSend] = useState(true);
  const [disabledReason, setDisabledReason] = useState<ThreadResponse['disabledReason']>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const onLoadedRef = useRef(onLoaded);
  // Keep `load` stable: a new `t` or `onLoaded` identity on re-render must
  // not restart polling or refetch the thread.
  const tRef = useRef(t);
  useEffect(() => {
    onLoadedRef.current = onLoaded;
    tRef.current = t;
  }, [onLoaded, t]);

  const load = useCallback(
    async (silent: boolean) => {
      if (!silent) setLoading(true);
      try {
        const data = await apiFetchJson<ThreadResponse>(`${endpoint}?markRead=1`);
        if (!data || !Array.isArray(data.messages)) throw new Error('Malformed response');
        setMessages((prev) => [...data.messages, ...prev.filter((m) => m.pending)]);
        setCanSend(data.canSend);
        setDisabledReason(data.disabledReason);
        setLoadError(null);
        onLoadedRef.current?.(data.messages);
      } catch (err) {
        if (!silent) setLoadError(err instanceof ApiError ? err.message : tRef.current('appMessages.errorLoad'));
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [endpoint],
  );

  useEffect(() => {
    void load(false);
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load(true);
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setSendError(null);
    const tempId = `pending-${Date.now()}`;
    const optimistic: PendingMessage = {
      id: tempId,
      senderRole: viewerRole,
      senderName: '',
      body,
      readAt: null,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft('');
    try {
      const { message } = await apiFetchJson<{ message: ApplicationMessage }>(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      setMessages((prev) => prev.map((m) => (m.id === tempId ? message : m)));
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(body);
      setSendError(err instanceof ApiError && err.message ? err.message : t('appMessages.errorSend'));
    } finally {
      setSending(false);
    }
  };

  const senderLabel = (m: PendingMessage): string => {
    if (m.senderRole === viewerRole) return t('appMessages.you');
    if (m.senderRole === 'admin') return t('appMessages.sicaTeam');
    if (m.senderName) return m.senderName;
    return m.senderRole === 'student' ? t('appMessages.student') : t('appMessages.partner');
  };

  const formatTime = (iso: string): string =>
    new Date(iso).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  const introKey =
    viewerRole === 'admin'
      ? 'appMessages.introAdmin'
      : viewerRole === 'partner'
        ? 'appMessages.introPartner'
        : 'appMessages.introStudent';

  return (
    <section aria-label={t('appMessages.title')} className="border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
        <MessageSquare size={16} className="text-[#1B2A4A]" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-[#1B2A4A]">{t('appMessages.title')}</h2>
      </div>
      <p className="px-4 pt-3 text-xs text-[#4B5563]">{t(introKey)}</p>

      <div
        ref={listRef}
        className="max-h-[480px] min-h-[160px] space-y-3 overflow-y-auto px-4 py-4"
        aria-live="polite"
      >
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            {t('appMessages.loading')}
          </div>
        ) : loadError ? (
          <div className="text-sm text-red-700">
            {loadError}{' '}
            <button type="button" className="underline" onClick={() => void load(false)}>
              {t('appMessages.retry')}
            </button>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-[#6B7280]">{t('appMessages.empty')}</p>
        ) : (
          messages.map((m) => {
            const own = m.senderRole === viewerRole;
            return (
              <div key={m.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%] sm:max-w-[75%]">
                  <div className={`mb-1 text-[11px] text-[#6B7280] ${own ? 'text-right' : ''}`}>
                    <span className="font-medium text-[#1F2937]">{senderLabel(m)}</span>
                    {' · '}
                    {m.pending ? t('appMessages.sending') : formatTime(m.createdAt)}
                  </div>
                  <div
                    className={`whitespace-pre-wrap break-words px-3 py-2 text-sm ${
                      own ? 'bg-[#1B2A4A] text-white' : 'border border-gray-200 bg-[#F3F4F6] text-[#1F2937]'
                    } ${m.pending ? 'opacity-60' : ''}`}
                  >
                    {m.body}
                  </div>
                  {own && !m.pending && m.readAt ? (
                    <div className="mt-0.5 text-right text-[11px] text-[#6B7280]">{t('appMessages.read')}</div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-gray-200 p-4">
        {!canSend ? (
          <p className="text-sm text-amber-800">
            {disabledReason === 'no_portal_account' ? t('appMessages.noPortalAccount') : t('appMessages.cannotSend')}
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <label htmlFor={`message-${endpoint}`} className="sr-only">
              {t('appMessages.placeholder')}
            </label>
            <Textarea
              id={`message-${endpoint}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder={t('appMessages.placeholder')}
              rows={3}
              className="rounded-none text-sm"
            />
            {sendError ? <p className="mt-2 text-sm text-red-700">{sendError}</p> : null}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[#6B7280]">
                {t('appMessages.shortcutHint')} · {draft.length.toLocaleString()}/{MESSAGE_MAX_LENGTH.toLocaleString()}
              </span>
              <Button
                type="submit"
                size="sm"
                disabled={sending || !draft.trim()}
                className="rounded-none bg-[#9B1B30] text-white hover:bg-[#7a1626]"
              >
                {sending ? (
                  <Loader2 size={14} className="mr-1.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Send size={14} className="mr-1.5" aria-hidden="true" />
                )}
                {sending ? t('appMessages.sending') : t('appMessages.send')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

/** Small hook for a tab label badge: unread messages from the other side. */
export function useUnreadMessageCount(endpoint: string | null): [number, (n: number) => void] {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!endpoint) return;
    let cancelled = false;
    apiFetchJson<{ unreadCount: number }>(`${endpoint}?summary=1`)
      .then((d) => {
        if (!cancelled) setCount(d.unreadCount || 0);
      })
      .catch(() => {
        /* badge is decorative — ignore (e.g. before the migration is applied) */
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint]);
  return [count, setCount];
}

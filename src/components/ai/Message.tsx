'use client';

import React from 'react';
import { User, Bot } from 'lucide-react';
import { AssistantContent } from './ChatCards';
import { useI18n } from '@/lib/i18n';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
  /** Phase 81: marks the bubble as an error so the parent can render a Retry button. */
  isError?: boolean;
}

export function Message({ role, content, isLoading, isError }: MessageProps) {
  const isUser = role === 'user';
  const { t } = useI18n();

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 flex items-center justify-center ${
          isUser
            ? 'bg-[#9B1B30] text-white'
            : 'bg-[#1B2A4A] text-white'
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-3 ${
            isUser
              ? 'bg-[#9B1B30] text-white'
              : isError
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-white border border-gray-200 text-gray-800'
          }`}
        >
          {isLoading ? (
            <div className="flex gap-1.5 items-center">
              <span className="text-xs mr-1">{t('chat.typingLabel')}</span>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : isUser ? (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{content}</div>
          ) : (
            <AssistantContent text={content} />
          )}
        </div>
      </div>
    </div>
  );
}
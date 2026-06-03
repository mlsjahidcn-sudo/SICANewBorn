'use client';

import React from 'react';
import { User, Bot } from 'lucide-react';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

export function Message({ role, content, isLoading }: MessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-[#9B1B30] text-white' 
          : 'bg-[#1B2A4A] text-white'
      }`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`px-4 py-3 rounded-lg ${
          isUser 
            ? 'bg-[#9B1B30] text-white rounded-br-sm' 
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
        }`}>
          {isLoading ? (
            <div className="flex gap-1.5 items-center">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

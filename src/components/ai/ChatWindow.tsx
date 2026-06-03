'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from './Message';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
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

export function ChatWindow({ isOpen, onClose, onMinimize }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: WELCOME_MESSAGE
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      isLoading: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

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
                setMessages(prev => prev.map(m => 
                  m.id === assistantMessage.id 
                    ? { ...m, content: fullContent, isLoading: false }
                    : m
                ));
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(m => 
        m.id === assistantMessage.id 
          ? { 
              ...m, 
              content: 'Sorry, I encountered an error. Please try again or contact SICA directly for assistance.', 
              isLoading: false 
            }
          : m
      ));
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

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[380px] max-w-[90vw] h-[600px] max-h-[80vh] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
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
          >
            <Minimize2 size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-white hover:bg-white/20 rounded transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAF8]">
        {messages.map(message => (
          <Message
            key={message.id}
            role={message.role}
            content={message.content}
            isLoading={message.isLoading}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

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

'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Minimize2 } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-[#9B1B30] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        aria-label="Open chat"
      >
        <MessageSquare size={24} className="sm:hidden" />
        <MessageSquare size={28} className="hidden sm:block" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <button
        onClick={handleRestore}
        className="fixed bottom-4 right-4 z-50 px-3 py-2 sm:px-4 sm:py-3 bg-[#9B1B30] text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-sm"
      >
        <MessageSquare size={18} className="sm:hidden" />
        <MessageSquare size={20} className="hidden sm:block" />
        <span className="font-medium">SICA AI Assistant</span>
        <div className="flex-1" />
        <X size={18} onClick={(e) => { e.stopPropagation(); handleClose(); }} className="hover:text-red-200" />
      </button>
    );
  }

  return (
    <ChatWindow
      isOpen={isOpen}
      onClose={handleClose}
      onMinimize={handleMinimize}
    />
  );
}

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
        className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-[#9B1B30] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        aria-label="Open chat"
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <button
        onClick={handleRestore}
        className="fixed bottom-4 right-4 z-50 px-4 py-3 bg-[#9B1B30] text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
      >
        <MessageSquare size={20} />
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

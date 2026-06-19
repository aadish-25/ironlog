import React, { type ChangeEvent, type KeyboardEvent } from "react";
import { Send, Mic } from "lucide-react";

interface ChatInputBarProps {
  chatInput: string;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: (text: string) => void;
}

export function ChatInputBar({ chatInput, onInputChange, onSendMessage }: ChatInputBarProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && chatInput.trim()) {
      onSendMessage(chatInput);
    }
  };

  return (
    <div className="fixed bottom-20.5 left-1/2 -translate-x-1/2 w-full max-w-107.5 px-4 py-2.5 bg-bg/97 border-t border-card flex items-center gap-2 z-50">
      <input
        type="text"
        value={chatInput}
        onChange={onInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask your coach..."
        className="flex-1 bg-card border border-border rounded-[10px] py-2.75 px-3.5 text-[13px] text-white outline-none font-body placeholder:text-ghost"
        aria-label="Chat message input"
      />
      <button
        className="w-10 h-10 bg-card border border-border rounded-[10px] flex items-center justify-center cursor-pointer hover:bg-raised transition-colors"
        aria-label="Voice input"
      >
        <Mic size={16} className="text-ghost" />
      </button>
      <button
        onClick={() => chatInput.trim() && onSendMessage(chatInput)}
        className="w-10 h-10 bg-heat border-none rounded-[10px] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
        aria-label="Send message"
      >
        <Send size={16} className="text-white" />
      </button>
    </div>
  );
}

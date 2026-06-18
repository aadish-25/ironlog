import React from "react";

export interface ChatMessage {
  role: "user" | "ai";
  text: string;
  citation?: string;
}

interface ChatTabProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onChipClick: (text: string) => void;
  suggestionChips: readonly { icon: string; text: string }[];
}

export function ChatTab({ messages, isTyping, onChipClick, suggestionChips }: ChatTabProps) {
  if (messages.length === 0) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center px-[30px] relative pb-[100px]"
        id="panel-chat"
        role="tabpanel"
      >
        {/* IRONLOG watermark */}
        <div
          className="absolute font-display text-[72px] tracking-[4px] text-border/60 select-none text-center leading-none pointer-events-none"
          aria-hidden="true"
        >
          IRON
          <br />
          LOG
        </div>

        <div className="relative z-10 flex flex-col items-start gap-4 w-full">
          {/* Coach greeting bubble */}
          <div className="bg-card border border-border rounded-[14px_14px_14px_4px] p-[14px_16px] max-w-[85%]">
            <p className="text-[13px] text-ghost leading-relaxed">
              <strong className="text-dim">
                Ready to analyze your training.
              </strong>{" "}
              Ask me anything about your progress, patterns, or what to
              work on next.
            </p>
          </div>

          <p className="text-[10px] tracking-[2px] text-ghost/40 uppercase self-start mt-2">
            Try asking
          </p>

          <div className="flex flex-col gap-[7px] w-full">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => onChipClick(chip.text)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-card border border-border rounded-[10px] cursor-pointer text-xs text-ghost text-left font-body hover:bg-raised transition-colors"
              >
                <span className="text-sm" aria-hidden="true">
                  {chip.icon}
                </span>
                {chip.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 pb-[100px]"
      id="panel-chat"
      role="tabpanel"
    >
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`max-w-[${msg.role === "user" ? "80" : "85"}%] ${
            msg.role === "user" ? "self-end" : "self-start"
          }`}
        >
          <div
            className={`px-3.5 py-[11px] text-[13px] leading-relaxed ${
              msg.role === "user"
                ? "bg-heat text-white rounded-[14px_14px_4px_14px]"
                : "bg-card border border-border text-ghost rounded-[14px_14px_14px_4px]"
            }`}
          >
            {msg.text}
          </div>
          {msg.citation && (
            <div className="mt-2 pt-2 border-t border-border text-[10px] text-ghost/40 tracking-[0.5px]">
              Based on{" "}
              <span className="text-ghost/60">{msg.citation}</span>
            </div>
          )}
        </div>
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="self-start bg-card border border-border rounded-[14px_14px_14px_4px] px-4 py-3 flex gap-1 items-center">
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className="w-1.5 h-1.5 bg-ghost rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

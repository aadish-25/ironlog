import React from "react";
import { ChevronLeft } from "lucide-react";

interface EmptySessionStateProps {
  onBack: () => void;
  onCreateSplit: () => void;
}

export function EmptySessionState({ onBack, onCreateSplit }: EmptySessionStateProps) {
  return (
    <section
      className="min-h-screen bg-bg text-white font-body flex flex-col items-center justify-center px-8 text-center relative"
      aria-label="Active session"
    >
      <button
        onClick={onBack}
        className="absolute top-12 left-5 w-8 h-8 rounded bg-raised border border-border flex items-center justify-center cursor-pointer hover:bg-border transition-colors"
        aria-label="Go back"
      >
        <ChevronLeft size={16} className="text-dim" strokeWidth={2} />
      </button>

      <div className="text-[56px] opacity-40 mb-5">🏋️</div>
      <h1 className="font-display text-[32px] tracking-[3px] text-dim mb-3">
        NO ACTIVE SESSION
      </h1>
      <p className="text-[13px] text-ghost leading-relaxed mb-10 max-w-[260px]">
        You don't have an active training split. Head over to the Splits page to build your routine before starting a session.
      </p>

      <button
        onClick={onCreateSplit}
        className="w-full max-w-[220px] py-[15px] bg-[#141414] border border-border rounded-xl text-white font-display text-[22px] tracking-[3px] cursor-pointer hover:bg-raised transition-colors flex items-center justify-center gap-2"
      >
        CREATE SPLIT
      </button>
    </section>
  );
}

import React from "react";
import { ArrowLeft } from "lucide-react";

// ─── Sub-component: Back button ───────────────────────────────────────────────
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 bg-card rounded-lg flex items-center justify-center border-none cursor-pointer hover:bg-raised transition-colors"
      aria-label="Go back"
    >
      <ArrowLeft size={16} className="text-ghost" />
    </button>
  );
}

interface CreateSplitViewProps {
  onBack: () => void;
  splitName: string;
  onSplitNameChange: (name: string) => void;
  onSubmit: () => void;
}

export function CreateSplitView({
  onBack,
  splitName,
  onSplitNameChange,
  onSubmit,
}: CreateSplitViewProps) {
  return (
    <div className="overflow-y-auto pb-[90px] no-scrollbar">
      <div className="flex items-center gap-2.5 px-5 pt-4 pb-3">
        <BackButton onClick={onBack} />
        <span className="font-display text-[18px] tracking-[2px] text-white uppercase">
          NEW SPLIT
        </span>
      </div>
      <div className="px-5">
        <div className="text-[11px] text-ghost tracking-[1.5px] uppercase mb-2">
          Split name
        </div>
        <input
          value={splitName}
          onChange={(e) => onSplitNameChange(e.target.value.toUpperCase())}
          placeholder="E.G. SUMMER PPL"
          maxLength={30}
          className="w-full bg-[#1a1a1a] rounded-xl px-[18px] py-4 font-display text-[28px] tracking-[2px] text-white outline-none mb-5 box-border"
          style={{
            border: `1px solid ${
              splitName.trim() ? "var(--color-heat)" : "#2a2a2a"
            }`,
          }}
          autoFocus
        />
        <div className="bg-[#141414] rounded-xl px-4 py-[14px] mb-6">
          <div className="text-xs text-[#888] font-medium mb-1.5">
            What happens next
          </div>
          <div className="text-xs text-[#444] leading-[1.6]">
            IronLog will create 7 days automatically — Monday through Sunday. You'll then assign labels and exercises to each day, and mark any rest days.
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={!splitName.trim()}
          className="w-full py-4 border-none rounded-xl font-display text-[22px] tracking-[2px] cursor-pointer disabled:cursor-default transition-colors"
          style={{
            background: splitName.trim() ? "var(--color-heat)" : "#1a1a1a",
            color: splitName.trim() ? "#fff" : "#333",
          }}
        >
          CREATE SPLIT →
        </button>
      </div>
    </div>
  );
}

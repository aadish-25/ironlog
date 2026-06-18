import React from "react";

interface CoachHeaderProps {
  sessionsAnalyzed: number | null;
}

export function CoachHeader({ sessionsAnalyzed }: CoachHeaderProps) {
  return (
    <header className="px-5 pt-4 shrink-0">
      <div className="flex items-center gap-2.5 mb-1">
        <h1 className="font-display text-[32px] tracking-[2px] text-white">
          AI Coach
        </h1>
        <span className="bg-[#1a1a00] border border-[#3a3a00] rounded-[5px] px-2 py-[3px] text-[10px] text-gold tracking-[1.5px] uppercase">
          BETA
        </span>
      </div>
      <p className="text-xs text-ghost">
        {sessionsAnalyzed
          ? `${sessionsAnalyzed} sessions analyzed`
          : "Analyzing your training data..."}
      </p>
      <p className="text-[11px] text-ghost/30">Last updated just now</p>
    </header>
  );
}

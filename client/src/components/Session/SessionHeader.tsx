import React from "react";
import { ChevronLeft } from "lucide-react";

interface SessionHeaderProps {
  splitDayName: string | null;
  completedSets: number;
  totalSets: number;
  progressPercent: number;
  onEndSession: () => void;
}

export function SessionHeader({
  splitDayName,
  completedSets,
  totalSets,
  progressPercent,
  onEndSession,
}: SessionHeaderProps) {
  return (
    <>
      <header className="flex items-center justify-between px-5 pt-[52px] pb-3.5 border-b border-border shrink-0">
        <button
          onClick={onEndSession}
          className="w-8 h-8 rounded bg-raised border border-border flex items-center justify-center cursor-pointer"
          aria-label="End session"
        >
          <ChevronLeft size={16} className="text-dim" strokeWidth={2} />
        </button>

        <h1 className="font-display text-base font-bold tracking-widest">
          {splitDayName ?? "SESSION"}
        </h1>

        {/* Sets counter */}
        <div className="text-right leading-none" aria-label="Sets progress">
          <span className="font-display text-[22px] text-white tracking-[1px]">
            {completedSets}
          </span>
          <small className="font-body text-[10px] text-ghost/50 tracking-[1px] uppercase ml-0.5">
            / {totalSets} SETS
          </small>
        </div>
      </header>

      {/* ── Progress bar ── */}
      <div className="h-0.5 bg-raised shrink-0" role="progressbar" aria-valuenow={progressPercent}>
        <div
          className="h-full bg-heat transition-[width] duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </>
  );
}

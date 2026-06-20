import React from "react";
import { ChevronLeft } from "lucide-react";

interface SessionHeaderProps {
  splitDayName: string | null;
  completedSets: number;
  totalSets: number;
  progressPercent: number;
  onEndSession: () => void;
  onFinishWorkout: () => void;
}

export function SessionHeader({
  splitDayName,
  completedSets,
  totalSets,
  progressPercent,
  onEndSession,
  onFinishWorkout,
}: SessionHeaderProps) {
  return (
    <>
      <header className="flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-border shrink-0">
        <button
          onClick={onEndSession}
          className="w-8 h-8 rounded bg-raised border border-border flex items-center justify-center cursor-pointer hover:bg-raised/80"
          aria-label="Exit session"
        >
          <ChevronLeft size={16} className="text-dim" strokeWidth={2} />
        </button>

        <div className="flex flex-col items-center">
          <h1 className="font-display text-base font-bold tracking-widest leading-none">
            {splitDayName ?? "SESSION"}
          </h1>
          <span className="font-body text-[10px] text-ghost mt-1.5 tracking-wider uppercase">
            {completedSets} / {totalSets} SETS
          </span>
        </div>

        <button
          onClick={onFinishWorkout}
          className="h-8 px-3 rounded bg-done text-[#0f0f0f] font-display text-xs tracking-[1.5px] font-bold cursor-pointer hover:opacity-90 flex items-center justify-center shadow-md shadow-done/20"
        >
          FINISH
        </button>
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

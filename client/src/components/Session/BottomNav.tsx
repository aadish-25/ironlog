import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BottomNavProps {
  currentExerciseIndex: number;
  activeSetsLogged: number;
  activeSetsTotal: number;
  onSwapExercise: () => void;
  onAddExercise: () => void;
  onPrevExercise: () => void;
  onNextExercise: () => void;
}

export function BottomNav({
  currentExerciseIndex,
  activeSetsLogged,
  activeSetsTotal,
  onSwapExercise,
  onAddExercise,
  onPrevExercise,
  onNextExercise,
}: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border p-[12px_20px_34px] flex flex-col gap-2 z-50">
      {/* Swap / Add buttons */}
      <div className="flex gap-2">
        <button
          onClick={onSwapExercise}
          className="flex-1 py-[11px] bg-[#141414] border border-border rounded-[10px] text-ghost font-display text-[15px] tracking-[1.5px] cursor-pointer flex items-center justify-center gap-1.5 hover:bg-raised transition-colors"
        >
          ⇄ SWAP
        </button>
        <button
          onClick={onAddExercise}
          className="flex-1 py-[11px] bg-[#141414] border border-border rounded-[10px] text-ghost font-display text-[15px] tracking-[1.5px] cursor-pointer flex items-center justify-center gap-1.5 hover:bg-raised transition-colors"
        >
          + ADD EXERCISE
        </button>
      </div>

      {/* Navigation row */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevExercise}
          disabled={currentExerciseIndex === 0}
          className={`w-11 h-11 rounded-[10px] border-none flex items-center justify-center shrink-0 transition-opacity ${
            currentExerciseIndex > 0
              ? "bg-heat cursor-pointer"
              : "bg-card opacity-35 cursor-default"
          }`}
          aria-label="Previous exercise"
        >
          <ChevronLeft
            size={20}
            className={currentExerciseIndex > 0 ? "text-white" : "text-ghost/30"}
            strokeWidth={2}
          />
        </button>

        {/* Center pill */}
        <div className="flex-1 h-11 bg-card rounded-[10px] flex items-center justify-center">
          <span className="font-display text-lg tracking-[2px] text-ghost">
            <b className="font-display text-white font-normal">
              {activeSetsLogged}
            </b>
            /{activeSetsTotal} SETS
          </span>
        </div>

        <button
          onClick={onNextExercise}
          className="w-11 h-11 rounded-[10px] bg-heat border-none flex items-center justify-center cursor-pointer shrink-0"
          aria-label="Next exercise"
        >
          <ChevronRight size={20} className="text-white" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

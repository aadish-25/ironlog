import React from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface BottomNavProps {
  currentExerciseIndex: number;
  totalExercises: number;
  activeSetsLogged: number;
  activeSetsTotal: number;
  sessionSetsLogged: number;
  onSwapExercise: () => void;
  onAddExercise: () => void;
  onPrevExercise: () => void;
  onNextExercise: () => void;
}

export function BottomNav({
  currentExerciseIndex,
  totalExercises,
  activeSetsLogged,
  activeSetsTotal,
  sessionSetsLogged,
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
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={onPrevExercise}
          disabled={currentExerciseIndex === 0}
          className={`w-[44px] h-[44px] rounded-[10px] bg-heat border-none flex items-center justify-center shrink-0 transition-opacity ${
            currentExerciseIndex === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-90"
          }`}
          aria-label="Previous exercise"
        >
          <ChevronLeft size={22} className="text-white" strokeWidth={2.5} />
        </button>

        {/* Center pill */}
        <div className="flex-1 h-[44px] bg-[#1a1a1a] rounded-[10px] flex items-center justify-center border border-[#333]">
          <span className="font-display text-lg tracking-[2px] text-ghost">
            <b className="font-display text-white font-normal">
              {activeSetsLogged}
            </b>
            /{activeSetsTotal} SETS
          </span>
        </div>

        {currentExerciseIndex >= totalExercises - 1 ? (
          <button
            onClick={onNextExercise}
            disabled={sessionSetsLogged === 0}
            className={`w-[44px] h-[44px] rounded-[10px] border-none flex items-center justify-center shrink-0 transition-opacity ${
              sessionSetsLogged === 0 
                ? "bg-[#333] cursor-not-allowed opacity-50" 
                : "bg-done cursor-pointer hover:opacity-90"
            }`}
            aria-label="Finish session"
          >
            <Check size={22} className={sessionSetsLogged === 0 ? "text-ghost" : "text-[#0f0f0f]"} strokeWidth={3} />
          </button>
        ) : (
          <button
            onClick={onNextExercise}
            className="w-[44px] h-[44px] rounded-[10px] bg-heat border-none flex items-center justify-center shrink-0 transition-opacity cursor-pointer hover:opacity-90"
            aria-label="Next exercise"
          >
            <ChevronRight size={22} className="text-white" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}

import React from "react";
import { BottomSheet } from "../ui/BottomSheet";
import type { SessionExercise } from "../../types";

interface AllExercisesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: SessionExercise[];
  currentExerciseIndex: number;
  onSelectExercise: (index: number) => void;
}

export function AllExercisesSheet({
  isOpen,
  onClose,
  exercises,
  currentExerciseIndex,
  onSelectExercise,
}: AllExercisesSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="ALL EXERCISES">
      <div className="flex flex-col gap-0.5">
        {exercises.map((exercise, index) => {
          const isCurrent = index === currentExerciseIndex;
          const setsTotal = exercise.sets.length;
          const setsDone = exercise.sets.filter((s) => s.is_logged).length;
          const allDone = setsTotal > 0 && setsDone === setsTotal;

          return (
            <button
              key={`${exercise.name}-${index}`}
              onClick={() => {
                onSelectExercise(index);
                onClose();
              }}
              className={`w-full text-left flex items-center justify-between p-[13px_0] bg-transparent border-b ${
                index < exercises.length - 1 ? "border-[#1f1f1f]" : "border-transparent"
              } cursor-pointer hover:bg-raised/30 transition-colors`}
              aria-label={`Jump to ${exercise.name}`}
            >
              <div className="flex items-center gap-2.5">
                {/* Status Dot */}
                <div
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    allDone
                      ? "bg-done"
                      : isCurrent
                      ? "bg-heat"
                      : "bg-[#2a2a2a]"
                  }`}
                />
                <span
                  className={`font-display text-base tracking-[1px] uppercase transition-colors ${
                    isCurrent
                      ? "text-heat"
                      : allDone
                      ? "text-done"
                      : "text-[#aaa]"
                  }`}
                >
                  {exercise.name}
                </span>
              </div>
              
              {/* Progress */}
              <span className="text-[11px] text-[#444] tracking-[1px]">
                {setsDone}/{setsTotal}
              </span>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

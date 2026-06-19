import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { SetList } from "./SetList";
import type { SessionExercise } from "../../types";

interface ExerciseViewProps {
  currentExerciseIndex: number;
  totalExercises: number;
  exercise: SessionExercise;
  previousBest: string | null;
  onRemoveSet: (index: number) => void;
  onLogSet: (index: number) => void;
  onAddSet: () => void;
  onViewAllExercises: () => void;
  onWeightChange: (index: number, val: number) => void;
  onRepChange: (index: number, val: number) => void;
  onEditSet: (index: number) => void;
}

export function ExerciseView({
  currentExerciseIndex,
  totalExercises,
  exercise,
  previousBest,
  onRemoveSet,
  onLogSet,
  onAddSet,
  onViewAllExercises,
  onWeightChange,
  onRepChange,
  onEditSet,
}: ExerciseViewProps) {
  return (
    <div className="flex-1 overflow-y-auto px-5 pb-[160px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExerciseIndex}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, x: -18, transition: { duration: 0.12 } }}
        >
          {/* Exercise title */}
          <div className="pt-6 pb-1.5">
            <p className="text-[10px] tracking-[2px] text-ghost uppercase mb-1.5">
              Exercise {currentExerciseIndex + 1} of {totalExercises}
            </p>
            <h2 className="font-display text-[44px] tracking-[2px] leading-[0.95] text-white">
              {exercise.name.toUpperCase()}
            </h2>
            {previousBest && (
              <p className="mt-1.5 text-xs text-ghost">
                Last: {previousBest}
              </p>
            )}
            {/* View all exercises */}
            <button
              onClick={onViewAllExercises}
              className="mt-1.5 bg-transparent border-none cursor-pointer p-0 inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <span className="text-[11px] text-heat tracking-[0.5px]">
                ☰ View all exercises
              </span>
            </button>
          </div>

          <SetList
            sets={exercise.sets}
            onRemoveSet={onRemoveSet}
            onLogSet={onLogSet}
            onAddSet={onAddSet}
            onWeightChange={onWeightChange}
            onRepChange={onRepChange}
            onEditSet={onEditSet}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

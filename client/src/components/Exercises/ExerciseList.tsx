import { ChevronDown, ChevronRight } from "lucide-react";
import { MuscleBadge } from "../../components/ui/MuscleBadge";
import type { Exercise, MuscleGroup } from "./types";

interface ExerciseListProps {
  exercises: Exercise[];
  grouped: MuscleGroup[];
  isSearching: boolean;

  collapsedSections: Set<string>;
  onSelectExercise: (ex: Exercise) => void;
  onToggleSection: (muscle: string) => void;
}

export function ExerciseList({
  exercises,
  grouped,
  isSearching,
  collapsedSections,
  onSelectExercise,
  onToggleSection,
}: ExerciseListProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-[90px]">
      {exercises.length === 0 ? (
        <div className="mx-5 mt-4 bg-[#111111] border border-dashed border-[#333333] rounded-[14px] p-8 flex flex-col items-center gap-3 text-center">
          <div className="text-[32px] opacity-50 grayscale">🏋️</div>
          <p className="text-[13px] text-zinc-400 leading-relaxed">
            {isSearching
              ? "Try a different search term."
              : "Loading exercise library..."}
          </p>
        </div>
      ) : isSearching ? (
        /* Flat search results */
        exercises.map((ex) => (
          <button
            key={ex.id}
            onClick={() => onSelectExercise(ex)}
            className="w-full flex items-center gap-3 px-5 py-3 border-b border-[#141414] bg-transparent border-none cursor-pointer text-left hover:bg-raised transition-colors"
            aria-label={`${ex.name} — ${ex.muscle}`}
          >
            <MuscleBadge muscle={ex.muscle} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-200 font-medium truncate">{ex.name}</p>
            </div>
            {ex.prKg !== null ? (
              <div className="flex items-center gap-[5px] shrink-0">
                <span className="text-xs text-zinc-400">🏆</span>
                <span className="font-display text-lg text-white tracking-[1px]">
                  {ex.prKg} kg
                </span>
              </div>
            ) : (
              <span className="text-[13px] text-zinc-500">No data</span>
            )}
            <ChevronRight size={16} className="text-zinc-600 ml-1 shrink-0" />
          </button>
        ))
      ) : (
        /* Grouped by muscle */
        grouped.map(({ muscle, exercises: items }) => {
          const isCollapsed = collapsedSections.has(muscle);
          return (
            <div key={muscle}>
              <button
                onClick={() => onToggleSection(muscle)}
                className="w-full flex items-center justify-between px-5 pt-3.5 pb-1.5 bg-transparent border-none cursor-pointer"
                aria-expanded={!isCollapsed}
                aria-label={`${muscle} section`}
              >
                <span className="text-[10px] tracking-[2px] text-zinc-400 font-semibold uppercase">
                  {muscle}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-zinc-500 transition-transform ${
                    isCollapsed ? "-rotate-90" : ""
                  }`}
                />
              </button>

              {!isCollapsed &&
                items.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => onSelectExercise(ex)}
                    className="w-full flex items-center gap-3 px-5 py-3 border-b border-[#141414] bg-transparent border-none cursor-pointer text-left hover:bg-raised transition-colors"
                    aria-label={`${ex.name} — ${ex.muscle}`}
                  >
                    <MuscleBadge muscle={ex.muscle} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 font-medium truncate">
                        {ex.name}
                      </p>
                    </div>
                    {ex.prKg !== null ? (
                      <div className="flex items-center gap-[5px] shrink-0">
                        <span className="text-xs text-zinc-400">🏆</span>
                        <span className="font-display text-lg text-white tracking-[1px]">
                          {ex.prKg} kg
                        </span>
                      </div>
                    ) : (
                      <span className="text-[13px] text-zinc-500">No data</span>
                    )}
                    <ChevronRight
                      size={16}
                      className="text-zinc-600 ml-1 shrink-0"
                    />
                  </button>
                ))}
            </div>
          );
        })
      )}
    </div>
  );
}

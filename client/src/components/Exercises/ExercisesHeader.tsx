import React from "react";
import { SlidersHorizontal } from "lucide-react";

interface ExercisesHeaderProps {
  activeFilterCount: number;
  onOpenFilters: () => void;
}

export function ExercisesHeader({ activeFilterCount, onOpenFilters }: ExercisesHeaderProps) {
  return (
    <header className="px-5 pt-4 pb-2.5 flex items-center justify-between shrink-0">
      <h1 className="font-display text-[32px] tracking-[2px] text-white">
        Exercises
      </h1>
      <button
        onClick={onOpenFilters}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs cursor-pointer font-body border transition-colors ${
          activeFilterCount > 0
            ? "bg-heat-dim border-heat text-heat"
            : "bg-card border-border text-zinc-400 hover:text-zinc-200"
        }`}
        aria-label={`Filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ""}`}
      >
        <SlidersHorizontal size={12} />
        Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
      </button>
    </header>
  );
}

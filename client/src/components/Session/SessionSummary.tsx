import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import type { SessionExercise } from "../../types";

interface SessionSummaryProps {
  splitDayName: string | null;
  exercises: SessionExercise[];
  onBack: () => void;
  onEdit: () => void;
}

export function SessionSummary({ splitDayName, exercises, onBack, onEdit }: SessionSummaryProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-body">
      <header className="flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-border shrink-0">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded bg-raised border border-border flex items-center justify-center cursor-pointer hover:bg-[#222] transition-colors"
          aria-label="Back"
        >
          <ChevronLeft size={16} className="text-dim" />
        </button>
        <h1 className="font-display text-base font-bold tracking-widest text-white uppercase">
          {splitDayName ? `${splitDayName} SUMMARY` : "SESSION SUMMARY"}
        </h1>
        <button onClick={onEdit} className="font-display text-heat tracking-widest text-sm uppercase cursor-pointer hover:opacity-80 transition-opacity">
          Edit
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-5 pb-[40px] flex flex-col gap-6">
        {exercises.map((ex, i) => {
            const loggedSets = ex.sets.filter(s => s.is_logged);
            
            return (
                <div key={ex.id} className="flex flex-col gap-3">
                    <h2 className="font-display text-lg tracking-[1.5px] text-white uppercase flex items-center gap-2">
                    <span className="text-dim text-sm">{i + 1}.</span> {ex.name}
                    </h2>
                    <div className="flex flex-col bg-[#141414] rounded-2xl p-4 border border-border">
                    {loggedSets.map((set, setIdx) => (
                        <div key={set.id} className="flex items-center justify-between py-2 border-b border-[#222] last:border-0">
                            <div className="flex items-center gap-2">
                                <span className="text-ghost text-xs tracking-[2px] font-display">SET {set.set_number}</span>
                                {set.pr_hit && (
                                    <div className="px-1 py-0.5 bg-[#4a3410] border border-[#a67c00] rounded text-[8px] text-[#ffd700] font-bold tracking-widest uppercase leading-none">
                                        PR
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-6 font-display text-lg tracking-[1.5px] text-[#eee]">
                                <span>{ex.is_bodyweight && set.weight === 0 ? "BW" : <>{set.weight} <span className="text-ghost text-xs">KG</span></>}</span>
                                <span>{set.reps} <span className="text-ghost text-xs">REPS</span></span>
                            </div>
                        </div>
                    ))}
                    {loggedSets.length === 0 && (
                        <span className="text-ghost text-xs italic tracking-widest py-2">No sets logged</span>
                    )}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}

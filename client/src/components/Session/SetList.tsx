import React from "react";
import { Trash2 } from "lucide-react";
import { Stepper } from "./Stepper";

export interface SetRecord {
  weight: number;
  reps: number;
  logged: boolean;
  isOverload?: boolean;
}

interface SetListProps {
  sets: SetRecord[];
  onRemoveSet: (index: number) => void;
  onLogSet: (index: number) => void;
  onAddSet: () => void;
  // Passing down stepper changes requires passing index as well. For now, since they are stubbed as empty functions in SessionPage, we will stub them here or pass a generic onChange.
  onWeightChange?: (index: number, value: number) => void;
  onRepChange?: (index: number, value: number) => void;
}

export function SetList({
  sets,
  onRemoveSet,
  onLogSet,
  onAddSet,
  onWeightChange,
  onRepChange,
}: SetListProps) {
  return (
    <>
      <div className="flex flex-col gap-1.5 mt-4">
        {sets.map((set, setIdx) => {
          const isActive =
            !set.logged && setIdx === sets.findIndex((s) => !s.logged);

          return (
            <div key={setIdx}>
              <div
                className={`rounded-[10px] overflow-hidden border transition-all ${
                  set.logged
                    ? "bg-[#0d1f0d] border-[#1a3a1a]"
                    : isActive
                    ? "bg-card border-border"
                    : "bg-card border-border opacity-45"
                }`}
              >
                {/* Set header */}
                <div className="flex items-center px-3.5 py-3 gap-2 border-b border-transparent">
                  {!set.logged && (
                    <button
                      onClick={() => onRemoveSet(setIdx)}
                      disabled={sets.length <= 1}
                      className="bg-transparent border-none cursor-pointer p-1 flex items-center disabled:opacity-25"
                      aria-label={`Remove set ${setIdx + 1}`}
                    >
                      <Trash2 size={13} className="text-dim" strokeWidth={1.8} />
                    </button>
                  )}

                  <span className="text-[11px] tracking-[1px] uppercase text-ghost flex-1">
                    {set.isOverload ? "↑ OVERLOAD SET" : `SET ${setIdx + 1}`}
                  </span>

                  {set.logged && (
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg text-done tracking-[1px]">
                        {set.weight} kg × {set.reps}
                      </span>
                      <div className="w-[18px] h-[18px] bg-[#1a3a1a] rounded-full flex items-center justify-center text-[11px] text-done">
                        ✓
                      </div>
                    </div>
                  )}

                  {!set.logged && !isActive && (
                    <span className="font-display text-lg text-ghost/30 tracking-[1px]">
                      {set.weight} kg × {set.reps}
                    </span>
                  )}
                </div>

                {/* Active set: weight/rep editors */}
                {isActive && (
                  <div className="px-3.5 py-3">
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <Stepper
                        value={set.weight}
                        onChange={(v) => onWeightChange?.(setIdx, v)}
                        step={2.5}
                        label="Weight (kg)"
                      />
                      <Stepper
                        value={set.reps}
                        onChange={(v) => onRepChange?.(setIdx, v)}
                        step={1}
                        label="Reps"
                      />
                    </div>
                    <button
                      onClick={() => onLogSet(setIdx)}
                      className="w-full py-[15px] bg-heat border-none rounded-[10px] text-white font-display text-[22px] tracking-[2px] cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      ✓ LOG SET
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add set link */}
      <button
        onClick={onAddSet}
        className="mt-2.5 bg-transparent border-none cursor-pointer p-[6px_0] flex items-center gap-1"
      >
        <span className="text-[13px] text-ghost">+ Add set</span>
      </button>
    </>
  );
}

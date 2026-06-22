import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Stepper } from "./Stepper";

import type { SetRecord } from "../../types";

interface SetListProps {
  sets: SetRecord[];
  onRemoveSet: (index: number) => void;
  onLogSet: (index: number) => void;
  onAddSet: () => void;
  // Passing down stepper changes requires passing index as well. For now, since they are stubbed as empty functions in SessionPage, we will stub them here or pass a generic onChange.
  onWeightChange?: (index: number, value: number) => void;
  onRepChange?: (index: number, value: number) => void;
  onEditSet?: (index: number) => void;
}

export function SetList({
  sets,
  onRemoveSet,
  onLogSet,
  onAddSet,
  onWeightChange,
  onRepChange,
  onEditSet,
}: SetListProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogClick = (index: number) => {
    const targetSet = sets[index];
    if (targetSet.weight <= 0) {
      setErrorMsg("Weight must be greater than 0");
      return;
    }
    if (targetSet.reps <= 0) {
      setErrorMsg("Reps must be greater than 0");
      return;
    }
    setErrorMsg(null);
    onLogSet(index);
  };

  return (
    <>
      <div className="flex flex-col gap-1.5 mt-4">
        {sets.map((set, setIdx) => {
          const isActive =
            !set.is_logged && setIdx === sets.findIndex((s) => !s.is_logged);

          return (
            <div key={setIdx}>
              <div
                className={`rounded-[10px] overflow-hidden border transition-all ${
                  set.is_logged
                    ? "bg-[#0d1f0d] border-[#1a3a1a]"
                    : isActive
                    ? "bg-card border-border"
                    : "bg-card border-border opacity-45"
                }`}
              >
                {/* Set header */}
                <div className="flex items-center px-3.5 py-3 gap-2 border-b border-transparent">
                  {!set.is_logged && (
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
                    {set.is_overload ? "↑ OVERLOAD SET" : `SET ${setIdx + 1}`}
                  </span>

                    {set.is_logged && (
                    <div className="flex items-center gap-2 text-left">
                        {set.pr_hit && (
                            <div className="px-1.5 py-0.5 bg-[#4a3410] border border-[#a67c00] rounded text-[9px] text-[#ffd700] font-bold tracking-widest uppercase">
                                PR
                            </div>
                        )}
                        <button
                        onClick={() => onEditSet?.(setIdx)}
                        className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0 hover:opacity-80 transition-opacity"
                        >
                        <span className="font-display text-lg text-done tracking-[1px]">
                            {Number(set.weight).toString()} kg × {set.reps}
                        </span>
                        <div className="w-[18px] h-[18px] bg-[#1a3a1a] rounded-full flex items-center justify-center text-[11px] text-done shrink-0">
                            ✓
                        </div>
                        </button>
                    </div>
                  )}

                  {!set.is_logged && !isActive && (
                    <span className="font-display text-lg text-ghost/30 tracking-[1px]">
                      {Number(set.weight).toString()} kg × {set.reps}
                    </span>
                  )}
                </div>

                {/* Active set: weight/rep editors */}
                {isActive && (
                  <div className="px-3.5 py-3">
                    <div className="flex gap-3 mt-4">
                      <div className="flex-1">
                        <Stepper
                          value={set.weight}
                          onChange={(v) => {
                            setErrorMsg(null);
                            onWeightChange?.(setIdx, v);
                          }}
                          step={0.5}
                          label="Weight (kg)"
                        />
                      </div>
                      <div className="flex-1">
                        <Stepper
                          value={set.reps}
                          onChange={(v) => {
                            setErrorMsg(null);
                            onRepChange?.(setIdx, v);
                          }}
                          step={1}
                          label="Reps"
                        />
                      </div>
                    </div>

                    {errorMsg && (
                      <p className="text-heat text-xs tracking-wider text-center mt-3 font-body font-medium animate-pulse">
                        {errorMsg}
                      </p>
                    )}

                    <button
                      onClick={() => handleLogClick(setIdx)}
                      className="w-full mt-4 h-[50px] bg-heat text-white font-display text-base tracking-[2px] rounded-[10px] border-none cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      LOG SET
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

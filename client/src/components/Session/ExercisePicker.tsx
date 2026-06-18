import { useState } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { BottomSheet } from "../ui/BottomSheet";

// ─── Mock Exercise Data ────────────────────────────────────────────────────────
const EXERCISES_BY_MUSCLE: Record<string, string[]> = {
  Chest: ["Bench Press", "Incline DB Press", "Cable Fly", "Dips", "Push Up"],
  Back: ["Deadlift", "Pull Up", "Bent Over Row", "Lat Pulldown", "Cable Row"],
  Shoulders: ["Overhead Press", "Lateral Raises", "Front Raises", "Face Pull", "Arnold Press"],
  Biceps: ["Barbell Curl", "Hammer Curl"],
  Triceps: ["Tricep Pushdown", "Skull Crushers", "Close Grip BP"],
  Legs: ["Squat", "Leg Press", "Romanian DL", "Leg Curl", "Calf Raises"],
  Core: ["Plank", "Russian Twist", "Leg Raises", "Ab Wheel"],
};

interface ExercisePickerProps {
  isOpen: boolean;
  mode: "add" | "swap" | null;
  currentName: string | null;
  onClose: () => void;
  onAdd: (name: string) => void;
  onSwap: (name: string) => void;
}

export function ExercisePicker({
  isOpen,
  mode,
  currentName,
  onClose,
  onAdd,
  onSwap,
}: ExercisePickerProps) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  if (!isOpen || !mode) return null;

  const groups = Object.entries(EXERCISES_BY_MUSCLE);
  const flatAll = groups.flatMap(([, names]) => names);
  const isFlat = query.trim().length > 0;
  
  // Filter out the current exercise we are swapping from
  const flat = flatAll.filter(
    (n) =>
      n.toLowerCase().includes(query.toLowerCase()) &&
      (mode === "add" || n !== currentName)
  );

  function toggle(muscle: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(muscle)) next.delete(muscle);
      else next.add(muscle);
      return next;
    });
  }

  function pick(name: string) {
    if (mode === "add") onAdd(name);
    else onSwap(name);
    
    // Reset state for next time
    setQuery("");
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "ADD EXERCISE" : `SWAP · ${currentName?.toUpperCase() || ""}`}
    >
      <div className="flex flex-col h-full">
        {/* Search */}
        <div className="relative mb-3 shrink-0">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost pointer-events-none"
            strokeWidth={1.5}
          />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises…"
            className="w-full h-10 rounded bg-raised border border-border text-ink text-[13px] pl-8 pr-3 outline-none font-body transition-colors focus:border-dim"
          />
        </div>

        {/* List */}
        <div className="flex-1 -mx-5 px-5">
          {isFlat ? (
            // Flat search results
            flat.map((name, i) => (
              <button
                key={name}
                onClick={() => pick(name)}
                className={`w-full text-left flex items-center justify-between p-[12px_0] bg-transparent border-b ${
                  i < flat.length - 1 ? "border-border" : "border-transparent"
                } cursor-pointer hover:bg-raised/50 transition-colors`}
              >
                <span className="text-[13px] text-ink font-body">{name}</span>
                <ChevronRight size={13} className="text-ghost" strokeWidth={1.5} />
              </button>
            ))
          ) : (
            // Grouped by muscle with collapsible headers
            groups.map(([muscle, names]) => {
              const visible = names.filter(
                (n) => mode === "add" || n !== currentName
              );
              if (visible.length === 0) return null;
              
              const isCollapsed = collapsed.has(muscle);
              return (
                <div key={muscle}>
                  <button
                    onClick={() => toggle(muscle)}
                    className="w-full flex items-center justify-between p-[10px_20px] bg-raised border-b border-border cursor-pointer hover:bg-raised/80 transition-colors -mx-5 px-5 box-content"
                  >
                    <span className="text-[10px] tracking-[2px] text-ghost uppercase font-semibold m-0">
                      {muscle}
                    </span>
                    <ChevronDown
                      size={13}
                      className="text-ghost transition-transform duration-200"
                      strokeWidth={2}
                      style={{
                        transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                  
                  {!isCollapsed &&
                    visible.map((name, i) => (
                      <button
                        key={name}
                        onClick={() => pick(name)}
                        className={`w-full text-left flex items-center justify-between py-3 pl-2 pr-0 bg-transparent border-b ${
                          i < visible.length - 1
                            ? "border-border"
                            : "border-transparent"
                        } cursor-pointer hover:bg-raised/50 transition-colors`}
                      >
                        <span className="text-[13px] text-ink font-body">
                          {name}
                        </span>
                        <ChevronRight
                          size={13}
                          className="text-ghost"
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </BottomSheet>
  );
}

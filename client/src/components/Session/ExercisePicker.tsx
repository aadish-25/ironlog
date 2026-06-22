import { useState } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { BottomSheet } from "../ui/BottomSheet";
import { useExercises } from "../../hooks/useExercises";

interface ExercisePickerProps {
  isOpen: boolean;
  mode: "add" | "swap" | null;
  currentName: string | null;
  existingExercises: string[];
  onClose: () => void;
  onAdd: (id: string, name: string) => void;
  onSwap: (id: string, name: string) => void;
}

export function ExercisePicker({
  isOpen,
  mode,
  currentName,
  existingExercises,
  onClose,
  onAdd,
  onSwap,
}: ExercisePickerProps) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const { exercisesList } = useExercises();

  if (!isOpen || !mode) return null;

  const groupsRecord: Record<string, typeof exercisesList> = {};
  for (const ex of exercisesList) {
      const muscle = ex.muscles[0] || "Other";
      if (!groupsRecord[muscle]) groupsRecord[muscle] = [];
      groupsRecord[muscle].push(ex);
  }
  const groups = Object.entries(groupsRecord);
  const flatAll = exercisesList;
  const isFlat = query.trim().length > 0;
  
  // Filter out exercises that are already in the session
  const flat = flatAll.filter(
    (ex) =>
      ex.name.toLowerCase().includes(query.toLowerCase()) &&
      !existingExercises.includes(ex.name)
  );

  function toggle(muscle: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(muscle)) next.delete(muscle);
      else next.add(muscle);
      return next;
    });
  }

  function pick(id: string, name: string) {
    if (mode === "add") onAdd(id, name);
    else onSwap(id, name);
    
    // Reset state for next time
    setQuery("");
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "ADD EXERCISE" : `SWAP · ${currentName?.toUpperCase() || ""}`}
      fixedHeight={true}
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
            flat.map((ex, i) => (
              <button
                key={ex.id}
                onClick={() => pick(ex.id, ex.name)}
                className={`w-full text-left flex items-center justify-between p-[12px_0] bg-transparent border-b ${
                  i < flat.length - 1 ? "border-border" : "border-transparent"
                } cursor-pointer hover:bg-raised/50 transition-colors`}
              >
                <span className="text-[13px] text-ink font-body">{ex.name}</span>
                <ChevronRight size={13} className="text-ghost" strokeWidth={1.5} />
              </button>
            ))
          ) : (
            // Grouped by muscle with collapsible headers
            groups.map(([muscle, exercises]) => {
              const visible = exercises.filter(
                (ex) => !existingExercises.includes(ex.name)
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
                    visible.map((ex, i) => (
                      <button
                        key={ex.id}
                        onClick={() => pick(ex.id, ex.name)}
                        className={`w-full text-left flex items-center justify-between py-3 pl-2 pr-0 bg-transparent border-b ${
                          i < visible.length - 1
                            ? "border-border"
                            : "border-transparent"
                        } cursor-pointer hover:bg-raised/50 transition-colors`}
                      >
                        <span className="text-[13px] text-ink font-body">
                          {ex.name}
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

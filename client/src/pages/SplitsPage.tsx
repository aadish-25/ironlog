import { useState } from "react";
import { SplitsHeader } from "../components/Splits/SplitsHeader";
import { ActiveSplitCard } from "../components/Splits/ActiveSplitCard";
import { SplitList } from "../components/Splits/SplitList";
import { CreateSplitView } from "../components/Splits/CreateSplitView";
import type { Split } from "../components/Splits/types";

// ─── Component ────────────────────────────────────────────────────────────────
export function SplitsPage() {
  // ─── SPLITS DATA ────────────────────────────────────────────────────────────
  // TODO: This component needs the list of all splits created by the user.
  const splits: Split[] = [];

  // TODO: This component needs to know which split is currently active.
  const activeSplit = splits.find((s) => s.isActive) ?? null;
  const otherSplits = splits.filter((s) => !s.isActive);

  // ─── NAVIGATION STATE ───────────────────────────────────────────────────────
  const [view, setView] = useState<"list" | "create">("list");
  const [newSplitName, setNewSplitName] = useState("");

  // ─── EVENT HANDLERS ─────────────────────────────────────────────────────────
  const handleCreateSplitSubmit = () => {
    if (!newSplitName.trim()) return;
    
    // TODO: Perform API call here
    console.log("Creating split:", newSplitName.trim());
    
    // Go back to list after success
    setView("list");
    setNewSplitName("");
  };

  // TODO: Handle selecting a split to view its details or set it as active.
  const handleSelectSplit = () => {};

  return (
    <section
      className="min-h-screen bg-bg text-white font-body"
      aria-label="Training splits"
    >
      {view === "list" && (
        <div className="overflow-y-auto pb-[90px] no-scrollbar">
          {/* ── Header ── */}
          <SplitsHeader onOpenCreateModal={() => setView("create")} />

          <p className="px-5 pb-4 text-xs text-ghost">
            Manage your training programmes
          </p>

          {/* ── Active split ── */}
          {activeSplit && (
            <ActiveSplitCard
              split={activeSplit}
              onSelectSplit={handleSelectSplit}
            />
          )}

          {/* ── Other splits / Empty State ── */}
          <SplitList
            splits={otherSplits.length > 0 ? otherSplits : splits}
            onSelectSplit={handleSelectSplit}
          />
        </div>
      )}

      {/* ── Create Split View ── */}
      {view === "create" && (
        <CreateSplitView
          onBack={() => setView("list")}
          splitName={newSplitName}
          onSplitNameChange={setNewSplitName}
          onSubmit={handleCreateSplitSubmit}
        />
      )}
    </section>
  );
}

/*
─────────────────────────────────────────
ANSWERS (read only after you've thought through the TODOs above)
─────────────────────────────────────────
splits              → GET /api/splits (returns all user splits with nested split_days and exercise counts)
activeSplit         → filter splits array where is_active === true (only one can be active at a time)
handleCreateSplit   → POST /api/splits { name: string }, backend auto-creates 7 split_days (MON–SUN)
handleSelectSplit   → local state transition to detail view, passing split.id; or navigate to /splits/:id
handleActivateSplit → PATCH /api/splits/:id/activate — backend sets is_active = true for this split and false for all others
─────────────────────────────────────────
*/

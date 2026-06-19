import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SplitsHeader } from "../components/Splits/SplitsHeader";
import { ActiveSplitCard } from "../components/Splits/ActiveSplitCard";
import { SplitList } from "../components/Splits/SplitList";
import { CreateSplitView } from "../components/Splits/CreateSplitView";
import type { Split } from "../components/Splits/types";
import { useSplit } from "../hooks/useSplit";

// ─── Component ────────────────────────────────────────────────────────────────
export function SplitsPage() {
    const { splits, loading, createUserSplit, activateUserSplit } = useSplit();
    // ─── SPLITS DATA ────────────────────────────────────────────────────────────
    // TODO: This component needs the list of all splits created by the user.
    const currentUserSplits: Split[] = splits ?? [];

    // TODO: This component needs to know which split is currently active.
    const activeSplit = currentUserSplits.find((s) => s.is_active) ?? null;
    const otherSplits = currentUserSplits.filter((s) => !s.is_active);

    // ─── NAVIGATION STATE ───────────────────────────────────────────────────────
    const [view, setView] = useState<"list" | "create">("list");
    const [newSplitName, setNewSplitName] = useState("");
    const navigate = useNavigate();

    // ─── EVENT HANDLERS ─────────────────────────────────────────────────────────
    const handleCreateSplitSubmit = async () => {
        if (!newSplitName.trim()) return;

        const newSplit = await createUserSplit(newSplitName.trim());
        setView("list");
        setNewSplitName("");
        if (newSplit) {
            navigate(`/splits/${newSplit.id}`);
        }
    };

    // Handle selecting a split to view its details.
    const handleSelectSplit = (split: Split) => {
        navigate(`/splits/${split.id}`);
    };

    // Handle setting a split as active.
    const handleActivateSplit = async (split: Split) => {
        await activateUserSplit(split.id);
    };

    return (
        <section
            className="min-h-screen bg-bg text-white font-body"
            aria-label="Training splits"
        >
            {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <span className="text-white text-opacity-50 tracking-widest text-xs uppercase animate-pulse">
                        Loading splits...
                    </span>
                </div>
            ) : view === "list" ? (
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
                        splits={otherSplits}
                        onSelectSplit={handleSelectSplit}
                        onActivateSplit={handleActivateSplit}
                        hasActiveSplit={!!activeSplit}
                    />
                </div>
            ) : view === "create" ? (
                <CreateSplitView
                    onBack={() => setView("list")}
                    splitName={newSplitName}
                    onSplitNameChange={setNewSplitName}
                    onSubmit={handleCreateSplitSubmit}
                />
            ) : null}
        </section>
    );
}

/*
─────────────────────────────────────────
ANSWERS (read only after you've thought through the TODOs above)
─────────────────────────────────────────
activeSplit         → filter splits array where is_active === true (only one can be active at a time)
handleCreateSplit   → POST /api/splits { name: string }, backend auto-creates 7 split_days (MON–SUN)
handleSelectSplit   → local state transition to detail view, passing split.id; or navigate to /splits/:id
handleActivateSplit → PATCH /api/splits/:id/activate — backend sets is_active = true for this split and false for all others
─────────────────────────────────────────
*/

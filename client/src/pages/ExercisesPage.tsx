import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomSheet } from "../components/ui/BottomSheet";
import { ExercisesHeader } from "../components/Exercises/ExercisesHeader";
import { SearchBar } from "../components/Exercises/SearchBar";
import { ExerciseList } from "../components/Exercises/ExerciseList";
import { MUSCLE_ORDER, EQUIPMENT_OPTIONS } from "../components/Exercises/types";
import type { Exercise, MuscleGroup } from "../components/Exercises/types";
import { useExercises } from "../hooks/useExercises";

// ─── Component ────────────────────────────────────────────────────────────────
export function ExercisesPage() {
    const { exercisesList } = useExercises();
    const navigate = useNavigate();
    // ─── EXERCISE DATA ──────────────────────────────────────────────────────────
    // TODO: This component needs the full list of exercises the user has added.
    const exercises: Exercise[] = exercisesList ?? [];

    // ─── SEARCH & FILTER STATE ──────────────────────────────────────────────────

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMuscles, setSelectedMuscles] = useState<Set<string>>(
        new Set(),
    );
    const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(
        new Set(["All"]),
    );

    const filteredExercises = exercises.filter((ex) => {
        if (
            searchQuery &&
            !ex.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
            return false;
        if (selectedMuscles.size > 0 && !ex.muscles.some(m => selectedMuscles.has(m)))
            return false;
        if (
            !selectedEquipment.has("All") &&
            !ex.equipments.some(e => selectedEquipment.has(e))
        ) {
            return false;
        }
        return true;
    });

    // TODO: This component needs collapsible sections by muscle group.
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
        new Set(),
    );

    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

    // ─── DERIVED DATA ───────────────────────────────────────────────────────────
    const isSearching = searchQuery.trim().length > 0;
    const activeFilterCount =
        selectedMuscles.size +
        (selectedEquipment.has("All") ? 0 : selectedEquipment.size);

    // Group exercises by muscle (preserving display order)
    const grouped: MuscleGroup[] = MUSCLE_ORDER.map((muscle) => ({
        muscle,
        exercises: filteredExercises.filter((ex) => ex.muscles.includes(muscle)),
    })).filter((group) => group.exercises.length > 0);

    // ─── EVENT HANDLERS ─────────────────────────────────────────────────────────
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleOpenFilters = () => setIsFilterSheetOpen(true);
    const handleCloseFilters = () => setIsFilterSheetOpen(false);

    const toggleMuscleFilter = (muscle: string) => {
        setSelectedMuscles((prev) => {
            const next = new Set(prev);
            if (next.has(muscle)) next.delete(muscle);
            else next.add(muscle);
            return next;
        });
    };

    const toggleEquipmentFilter = (eq: string) => {
        setSelectedEquipment((prev) => {
            const next = new Set(prev);
            if (eq === "All") {
                return new Set(["All"]);
            }
            next.delete("All");
            if (next.has(eq)) {
                next.delete(eq);
                if (next.size === 0) next.add("All");
            } else {
                next.add(eq);
            }
            return next;
        });
    };

    // TODO: Implement viewing exercise details (bottom sheet or new page)
    const handleSelectExercise = (ex: Exercise) => {
        navigate(`/exercises/${ex.id}`);
    };

    // TODO: Implement toggling collapsed state of a muscle group section.
    const handleToggleSection = (muscle: string) => {
        setCollapsedSections((prev) => {
            const next = new Set(prev);
            if (next.has(muscle)) {
                next.delete(muscle);
            } else {
                next.add(muscle);
            }
            return next;
        });
    };

    return (
        <section
            className="min-h-screen bg-bg text-white font-body flex flex-col"
            aria-label="Exercises library"
        >
            {/* ── Header ── */}
            <ExercisesHeader
                activeFilterCount={activeFilterCount}
                onOpenFilters={handleOpenFilters}
            />
            {/* ── Search bar ── */}
            <SearchBar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
            />
            {/* ── Count ── */}
            <p className="px-5 py-1 text-[11px] text-ghost/50 shrink-0">
                {isSearching
                    ? `${exercises.length} results for "${searchQuery}"`
                    : `${exercises.length} exercises`}
            </p>
            {/* ── Exercise list ── */}
            <ExerciseList
                exercises={filteredExercises}
                grouped={grouped}
                isSearching={isSearching}
                collapsedSections={collapsedSections}
                onSelectExercise={handleSelectExercise}
                onToggleSection={handleToggleSection}
            />
            {/* ── Exercise Filters Bottom Sheet ── */}
            <BottomSheet
                isOpen={isFilterSheetOpen}
                onClose={handleCloseFilters}
                title="FILTER"
            >
                <div className="flex flex-col">
                    {/* Muscles */}
                    <div className="mb-2.5">
                        <h3 className="text-[10px] tracking-[2px] text-ghost uppercase mb-2.5">
                            Muscle Group
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-5">
                            {MUSCLE_ORDER.map((muscle) => (
                                <button
                                    key={muscle}
                                    onClick={() => toggleMuscleFilter(muscle)}
                                    className={`px-[14px] py-2 rounded-lg text-xs font-body border cursor-pointer transition-colors ${
                                        selectedMuscles.has(muscle)
                                            ? "bg-[#1a0800] border-heat text-white"
                                            : "bg-[#1a1a1a] border-[#1f1f1f] text-dim hover:text-white"
                                    }`}
                                >
                                    {muscle}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Equipment */}
                    <div className="mb-6">
                        <h3 className="text-[10px] tracking-[2px] text-ghost uppercase mb-2.5">
                            Equipment
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {EQUIPMENT_OPTIONS.map((eq) => (
                                <button
                                    key={eq}
                                    onClick={() => toggleEquipmentFilter(eq)}
                                    className={`px-[14px] py-2 rounded-lg text-xs font-body border cursor-pointer transition-colors ${
                                        selectedEquipment.has(eq)
                                            ? "bg-[#1a0800] border-heat text-white"
                                            : "bg-[#1a1a1a] border-[#1f1f1f] text-dim hover:text-white"
                                    }`}
                                >
                                    {eq}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <button
                        onClick={() => {
                            // Apply is basically just closing since state updates immediately
                            handleCloseFilters();
                        }}
                        className="w-full py-[15px] rounded-xl bg-heat text-white font-display text-xl tracking-[2px] border-none cursor-pointer hover:opacity-90 transition-opacity"
                    >
                        APPLY FILTERS
                    </button>
                </div>
            </BottomSheet>
        </section>
    );
}

/*
─────────────────────────────────────────
ANSWERS (read only after you've thought through the TODOs above)
─────────────────────────────────────────
exercises             → GET /api/exercises (returns all exercises for this user, with muscle, equipment, and latest PR weight)
searchQuery           → local state: useState(''), filter exercises client-side by name.toLowerCase().includes(query)
selectedMuscles       → local state: useState<Set<string>>(new Set()), filter exercises where muscle is in the set
selectedEquipment     → local state: useState<Set<string>>(new Set(['All'])), filter exercises where equipment matches
collapsedSections     → local state: useState<Set<string>>(new Set()), toggle muscle group visibility
handleSearchChange    → (e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)
handleOpenFilters     → local state: setShowFilterSheet(true) — renders a bottom sheet overlay
handleSelectExercise  → navigate to /exercises/:id or set local state to show ExerciseDetail sub-view
handleToggleSection   → toggle muscle string in collapsedSections Set
─────────────────────────────────────────
*/

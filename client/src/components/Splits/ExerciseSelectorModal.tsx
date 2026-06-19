import { useState } from "react";
import { SearchBar } from "../Exercises/SearchBar";
import { MUSCLE_ORDER, EQUIPMENT_OPTIONS } from "../Exercises/types";
import type { Exercise, MuscleGroup } from "../Exercises/types";
import { MuscleBadge } from "../ui/MuscleBadge";
import { ChevronDown } from "lucide-react";
import { BottomSheet } from "../ui/BottomSheet";

interface ExerciseSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    exercisesList: Exercise[];
    onAddExercises: (exerciseIds: string[]) => void;
}

export function ExerciseSelectorModal({
    isOpen,
    onClose,
    exercisesList,
    onAddExercises
}: ExerciseSelectorModalProps) {
    const exercises: Exercise[] = exercisesList ?? [];

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMuscles, setSelectedMuscles] = useState<Set<string>>(new Set());
    const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(new Set(["All"]));
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
    
    // Multi-select state
    const [selectedExerciseIds, setSelectedExerciseIds] = useState<Set<string>>(new Set());

    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

    if (!isOpen) return null;

    const filteredExercises = exercises.filter((ex) => {
        if (searchQuery && !ex.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedMuscles.size > 0 && !ex.muscles.some(m => selectedMuscles.has(m))) return false;
        if (!selectedEquipment.has("All") && !ex.equipments.some(e => selectedEquipment.has(e))) return false;
        return true;
    });

    const isSearching = searchQuery.trim().length > 0;
    const activeFilterCount = selectedMuscles.size + (selectedEquipment.has("All") ? 0 : selectedEquipment.size);

    const grouped: MuscleGroup[] = MUSCLE_ORDER.map((muscle) => ({
        muscle,
        exercises: filteredExercises.filter((ex) => ex.muscles.includes(muscle)),
    })).filter((group) => group.exercises.length > 0);

    const handleToggleExercise = (exId: string) => {
        setSelectedExerciseIds(prev => {
            const next = new Set(prev);
            if (next.has(exId)) next.delete(exId);
            else next.add(exId);
            return next;
        });
    };

    const handleToggleSection = (muscle: string) => {
        setCollapsedSections((prev) => {
            const next = new Set(prev);
            if (next.has(muscle)) next.delete(muscle);
            else next.add(muscle);
            return next;
        });
    };

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
            if (eq === "All") return new Set(["All"]);
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

    const handleAdd = () => {
        if (selectedExerciseIds.size > 0) {
            onAddExercises(Array.from(selectedExerciseIds));
        }
        setSelectedExerciseIds(new Set());
        onClose();
    };

    const handleClose = () => {
        setSelectedExerciseIds(new Set());
        onClose();
    };

    const renderExercise = (ex: Exercise) => {
        const isSelected = selectedExerciseIds.has(ex.id);
        return (
            <button
                key={ex.id}
                onClick={() => handleToggleExercise(ex.id)}
                className={`w-full flex items-center gap-3 px-5 py-3 border-b border-[#141414] bg-transparent border-none cursor-pointer text-left transition-colors ${isSelected ? 'bg-[#1a0800]' : 'hover:bg-raised'}`}
            >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-heat bg-heat' : 'border-[#444] bg-transparent'}`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <MuscleBadge muscle={ex.muscles?.[0] || 'Unknown'} />
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-zinc-200'}`}>{ex.name}</p>
                </div>
            </button>
        );
    };

    return (
        <div className="fixed inset-0 z-50 w-full max-w-[430px] mx-auto border-x border-border/10 bg-bg text-white flex flex-col font-body animate-in slide-in-from-bottom-full duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f] bg-bg sticky top-0 shrink-0">
                <button onClick={handleClose} className="text-[#888] hover:text-white text-sm tracking-wide">
                    CANCEL
                </button>
                <div className="text-[13px] tracking-[2px] uppercase font-semibold">Add Exercises</div>
                <button 
                    onClick={handleAdd} 
                    disabled={selectedExerciseIds.size === 0}
                    className={`text-sm font-semibold tracking-wide ${selectedExerciseIds.size > 0 ? 'text-heat' : 'text-[#444]'}`}
                >
                    ADD ({selectedExerciseIds.size})
                </button>
            </div>

            {/* Filter and Search */}
            <div className="shrink-0 bg-bg border-b border-[#1f1f1f] pb-3">
                <div className="flex items-center gap-2 px-5 py-3">
                    <div className="flex-1">
                        <SearchBar searchQuery={searchQuery} onSearchChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <button 
                        onClick={() => setIsFilterSheetOpen(true)}
                        className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border transition-colors ${activeFilterCount > 0 ? 'bg-[#1a0800] border-heat text-heat' : 'bg-[#161616] border-[#1f1f1f] text-[#666]'}`}
                    >
                        F
                    </button>
                </div>
                <p className="px-5 text-[11px] text-ghost/50 shrink-0">
                    {isSearching ? `${filteredExercises.length} results` : `${exercises.length} exercises`}
                </p>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pb-6">
                {filteredExercises.length === 0 ? (
                    <div className="text-center p-10 text-ghost text-sm">No exercises found.</div>
                ) : isSearching ? (
                    filteredExercises.map(renderExercise)
                ) : (
                    grouped.map(({ muscle, exercises: items }) => {
                        const isCollapsed = collapsedSections.has(muscle);
                        return (
                            <div key={muscle}>
                                <button
                                    onClick={() => handleToggleSection(muscle)}
                                    className="w-full flex items-center justify-between px-5 pt-3.5 pb-1.5 bg-transparent border-none cursor-pointer"
                                >
                                    <span className="text-[10px] tracking-[2px] text-zinc-400 font-semibold uppercase">{muscle}</span>
                                    <ChevronDown size={13} className={`text-zinc-500 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                                </button>
                                {!isCollapsed && items.map(renderExercise)}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Filters Sheet */}
            <BottomSheet isOpen={isFilterSheetOpen} onClose={() => setIsFilterSheetOpen(false)} title="FILTER">
                <div className="flex flex-col">
                    <div className="mb-2.5">
                        <h3 className="text-[10px] tracking-[2px] text-ghost uppercase mb-2.5">Muscle Group</h3>
                        <div className="flex flex-wrap gap-2 mb-5">
                            {MUSCLE_ORDER.map((m) => (
                                <button key={m} onClick={() => toggleMuscleFilter(m)} className={`px-[14px] py-2 rounded-lg text-xs font-body border cursor-pointer transition-colors ${selectedMuscles.has(m) ? "bg-[#1a0800] border-heat text-white" : "bg-[#1a1a1a] border-[#1f1f1f] text-dim hover:text-white"}`}>{m}</button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-[10px] tracking-[2px] text-ghost uppercase mb-2.5">Equipment</h3>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {EQUIPMENT_OPTIONS.map((eq) => (
                                <button key={eq} onClick={() => toggleEquipmentFilter(eq)} className={`px-[14px] py-2 rounded-lg text-xs font-body border cursor-pointer transition-colors ${selectedEquipment.has(eq) ? "bg-[#1a0800] border-heat text-white" : "bg-[#1a1a1a] border-[#1f1f1f] text-dim hover:text-white"}`}>{eq}</button>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => setIsFilterSheetOpen(false)} className="w-full py-[15px] rounded-xl bg-heat text-white font-display text-xl tracking-[2px] border-none cursor-pointer hover:opacity-90 transition-opacity">
                        APPLY FILTERS
                    </button>
                </div>
            </BottomSheet>
        </div>
    );
}

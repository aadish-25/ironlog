import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, GripVertical, Plus, Trash2 } from "lucide-react";
import { useSplitDetail } from "../hooks/useSplitDetail";
import { useExercises } from "../hooks/useExercises";
import { ExerciseSelectorModal } from "../components/Splits/ExerciseSelectorModal";
import type { SplitDayExercise } from "../types";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Sortable Exercise Item ──────────────────────────────────────────────
interface SortableExerciseItemProps {
    ex: SplitDayExercise;
    index: number;
    onRemoveExercise: (exerciseId: string) => void;
}

function SortableExerciseItem({ ex, index, onRemoveExercise }: SortableExerciseItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: ex.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 0,
        position: 'relative' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 bg-raised border border-[#2a2a2a] rounded-[10px] p-3 mb-2 transition-colors ${isDragging ? 'opacity-75 shadow-2xl border-heat' : 'opacity-100'}`}
        >
            <div 
                {...attributes} 
                {...listeners} 
                className="cursor-grab active:cursor-grabbing text-[#555] hover:text-white p-1 touch-none"
            >
                <GripVertical size={16} />
            </div>
            <div className="w-8 h-8 rounded-full bg-bg border border-[#333] flex items-center justify-center text-[11px] font-bold text-heat shrink-0">
                {index + 1}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{ex.name}</p>
            </div>
            {ex.muscle_groups && ex.muscle_groups.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-sm bg-[#222] border border-[#333] text-ghost text-[9px] uppercase font-semibold tracking-wider shrink-0">
                    {ex.muscle_groups[0]}
                </span>
            )}
            <button
                onClick={() => onRemoveExercise(ex.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2a0f00] text-heat hover:bg-heat hover:text-white transition-colors"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
}

// ─── Warning Dialog Removed ───────────────────────────────────────────────────

// ─── Main Page ──────────────────────────────────────────────────────────────
export function SplitDayDetailPage() {
    const { splitId, dayId } = useParams<{ splitId: string, dayId: string }>();
    const navigate = useNavigate();
    
    const {
        split,
        loading,
        error,
        updateDay,
        addExercises,
        removeExercise,
        reorderExercise
    } = useSplitDetail(splitId!);

    const { exercisesList } = useExercises();

    const day = split?.days.find(d => d.id === dayId);

    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [editLabelValue, setEditLabelValue] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (day && !isEditingLabel) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEditLabelValue(day.label);
        }
    }, [day, isEditingLabel]);

    const isRestDay = day?.is_rest || false;

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <span className="text-white text-opacity-50 text-xs tracking-widest uppercase animate-pulse">Loading...</span>
            </div>
        );
    }

    if (error || !split || !day) {
        return (
            <div className="bg-bg min-h-screen text-white p-5 pt-20">
                <p className="text-[#e05252]">{error || "Day not found"}</p>
                <button 
                    onClick={() => navigate(`/splits/${splitId}`)}
                    className="mt-4 text-heat text-sm font-semibold tracking-wide"
                >
                    &larr; GO BACK
                </button>
            </div>
        );
    }

    const handleSaveLabel = () => {
        if (editLabelValue.trim() && editLabelValue !== day.label) {
            updateDay(day.id, { label: editLabelValue.trim() });
        } else {
            setEditLabelValue(day.label);
        }
        setIsEditingLabel(false);
    };

    const handleToggleRestDay = async () => {
        await updateDay(day.id, { is_rest: !isRestDay });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const newIndex = day.exercises!.findIndex((ex) => ex.id === over.id);
            reorderExercise(day.id, active.id as string, newIndex);
        }
    };



    return (
        <section className="min-h-screen bg-bg text-white font-body flex flex-col pb-24">

            {/* Header */}
            <div className="flex items-center gap-4 px-5 py-3.5 bg-bg sticky top-0 z-20 shrink-0 border-b border-[#1f1f1f]">
                <button 
                    onClick={() => navigate(`/splits/${splitId}`)}
                    className="w-10 h-10 bg-card rounded-[10px] flex items-center justify-center text-[#888] cursor-pointer hover:bg-[#1f1f1f] transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col flex-1">
                    <div className="text-[10px] tracking-[2px] text-heat uppercase font-semibold">Day {day.day_of_week + 1}</div>
                    {isEditingLabel ? (
                        <input
                            type="text"
                            autoFocus
                            value={editLabelValue}
                            onChange={(e) => setEditLabelValue(e.target.value)}
                            onBlur={handleSaveLabel}
                            onKeyDown={(e) => e.key === "Enter" && handleSaveLabel()}
                            className="bg-transparent border-b border-heat text-white font-display text-2xl tracking-[1px] m-0 outline-none w-full"
                        />
                    ) : (
                        <div className="flex items-center gap-2" onClick={() => setIsEditingLabel(true)}>
                            <h1 className="font-display text-2xl tracking-[1px] m-0 leading-none">{day.label}</h1>
                            <Edit2 size={14} className="text-[#666]" />
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pt-6">
                
                {/* Rest Day Toggle */}
                <div className="flex items-center justify-between bg-raised border border-[#1f1f1f] rounded-[14px] p-4 mb-8">
                    <div>
                        <h3 className="text-white font-medium mb-1">Rest Day</h3>
                        <p className="text-xs text-ghost">Take a break and recover</p>
                    </div>
                    <button 
                        onClick={handleToggleRestDay}
                        className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${isRestDay ? 'bg-heat' : 'bg-[#333]'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isRestDay ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {!isRestDay ? (
                    <div className="space-y-2">
                        {day.exercises && day.exercises.length > 0 ? (
                            <DndContext 
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext 
                                    items={day.exercises.map(ex => ex.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {day.exercises.map((ex, index) => (
                                        <SortableExerciseItem 
                                            key={ex.id}
                                            ex={ex}
                                            index={index}
                                            onRemoveExercise={(exId) => removeExercise(day.id, exId)}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <div className="text-center py-10">
                                <div className="text-[32px] opacity-20 mb-3">📋</div>
                                <p className="text-[13px] text-ghost">No exercises added yet.</p>
                            </div>
                        )}

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full mt-4 py-3.5 border border-dashed border-[#444] rounded-[10px] text-[13px] font-semibold text-ghost tracking-wide hover:border-white hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={16} />
                            ADD EXERCISE
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center mt-10 px-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-raised border border-[#2a2a2a] flex items-center justify-center mb-5">
                            <span className="text-2xl">🔋</span>
                        </div>
                        <h3 className="text-white font-display text-xl tracking-[1px] mb-2">Rest Day</h3>
                        <p className="text-[#888] text-[13px] leading-relaxed max-w-65">
                            This day is marked as a rest day. Toggle the switch above if you want to train.
                        </p>
                    </div>
                )}
            </div>

            {/* Exercise Selector */}
            <ExerciseSelectorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                exercisesList={exercisesList || []}
                onAddExercises={(exerciseIds) => {
                    addExercises(day.id, exerciseIds);
                    setIsModalOpen(false);
                }}
            />
        </section>
    );
}

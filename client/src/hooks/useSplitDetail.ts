import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getSplitById, updateSplit } from "../services/splits";
import { 
    updateSplitDay, 
    addExercisesToDay, 
    removeExerciseFromDay, 
    reorderExerciseInDay 
} from "../services/splitDays";
import type { Split } from "../types";

export function useSplitDetail(splitId: string) {
    const [split, setSplit] = useState<Split | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchSplit = useCallback(async (background = false) => {
        try {
            if (!background) setLoading(true);
            setError(null);
            const result = await getSplitById(splitId);
            setSplit(result);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? err.message);
            } else {
                setError((err as Error).message);
            }
        } finally {
            setLoading(false);
        }
    }, [splitId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (splitId) fetchSplit();
    }, [fetchSplit, splitId]);

    const updateDay = async (dayId: string, updates: { label?: string, is_rest?: boolean }) => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            // Optimistic update
            setSplit(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    days: prev.days.map(d => d.id === dayId ? { ...d, ...updates } : d)
                };
            });
            await updateSplitDay(dayId, updates);
        } catch (err) {
            console.error(err);
            fetchSplit(); // rollback on error
        } finally {
            setActionLoading(false);
        }
    };

    const addExercises = async (dayId: string, exerciseIds: string[], exercisesList?: any[]) => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            const day = split?.days.find(d => d.id === dayId);
            if (!day) return;
            const startingIndex = day.exercises?.length || 0;
            
            // Optimistic Update
            if (exercisesList) {
                const newExercises = exerciseIds.map((exId, i) => {
                    const exDetails = exercisesList.find(e => e.id === exId);
                    return {
                        id: `temp-${Date.now()}-${i}`,
                        exercise_id: exId,
                        name: exDetails?.name || "Loading...",
                        sets: 3, // Default sets
                        reps: 10, // Default reps
                        order_index: startingIndex + i,
                        muscle_groups: exDetails?.muscles || []
                    };
                });
                
                setSplit(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        days: prev.days.map(d => d.id === dayId ? {
                            ...d,
                            exercises: [...(d.exercises || []), ...newExercises]
                        } : d)
                    };
                });
            }

            await addExercisesToDay(dayId, exerciseIds, startingIndex);
            await fetchSplit(true); // Background re-fetch
        } catch (err) {
            console.error(err);
            fetchSplit(true); // Rollback optimistic update
        } finally {
            setActionLoading(false);
        }
    };

    const removeExercise = async (dayId: string, splitDayExerciseId: string) => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            // Optimistic update
            setSplit(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    days: prev.days.map(d => {
                        if (d.id === dayId) {
                            return {
                                ...d,
                                exercises: d.exercises.filter(e => e.id !== splitDayExerciseId)
                            };
                        }
                        return d;
                    })
                };
            });
            await removeExerciseFromDay(splitDayExerciseId);
        } catch (err) {
            console.error(err);
            fetchSplit();
        } finally {
            setActionLoading(false);
        }
    };

    const reorderExercise = async (dayId: string, splitDayExerciseId: string, newIndex: number) => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            await reorderExerciseInDay(splitDayExerciseId, newIndex);
            await fetchSplit(true); // Background re-fetch
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const updateSplitName = async (newName: string) => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            setSplit(prev => prev ? { ...prev, name: newName } : prev);
            await updateSplit(splitId, newName);
        } catch (err) {
            console.error(err);
            fetchSplit();
        } finally {
            setActionLoading(false);
        }
    };

    return {
        split,
        loading,
        error,
        updateDay,
        updateSplitName,
        addExercises,
        removeExercise,
        reorderExercise,
        refresh: fetchSplit
    };
}

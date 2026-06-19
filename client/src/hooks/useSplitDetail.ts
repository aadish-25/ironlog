import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getSplitById, updateSplit } from "../services/splits";
import { 
    updateSplitDay, 
    addExercisesToDay, 
    removeExerciseFromDay, 
    reorderExerciseInDay 
} from "../services/splitDays";
import { type Split, type SplitDay } from "../types";

export function useSplitDetail(splitId: string) {
    const [split, setSplit] = useState<Split | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSplit = useCallback(async () => {
        try {
            setLoading(true);
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
        if (splitId) fetchSplit();
    }, [fetchSplit, splitId]);

    const updateDay = async (dayId: string, updates: { label?: string, is_rest?: boolean }) => {
        try {
            await updateSplitDay(dayId, updates);
            // Optimistic update
            setSplit(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    days: prev.days.map(d => d.id === dayId ? { ...d, ...updates } : d)
                };
            });
        } catch (err) {
            console.error(err);
            fetchSplit(); // rollback on error
        }
    };

    const addExercises = async (dayId: string, exerciseIds: string[]) => {
        try {
            const day = split?.days.find(d => d.id === dayId);
            if (!day) return;
            const startingIndex = day.exercises?.length || 0;
            await addExercisesToDay(dayId, exerciseIds, startingIndex);
            await fetchSplit(); // Re-fetch to get all the joined exercise details (name, muscles etc)
        } catch (err) {
            console.error(err);
        }
    };

    const removeExercise = async (dayId: string, splitDayExerciseId: string) => {
        try {
            await removeExerciseFromDay(splitDayExerciseId);
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
        } catch (err) {
            console.error(err);
            fetchSplit();
        }
    };

    const reorderExercise = async (dayId: string, splitDayExerciseId: string, newIndex: number) => {
        try {
            await reorderExerciseInDay(splitDayExerciseId, newIndex);
            await fetchSplit(); // Backend handles shifting other items, so just re-fetch
        } catch (err) {
            console.error(err);
        }
    };

    const updateSplitName = async (newName: string) => {
        try {
            await updateSplit(splitId, newName);
            setSplit(prev => prev ? { ...prev, name: newName } : prev);
        } catch (err) {
            console.error(err);
            fetchSplit();
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

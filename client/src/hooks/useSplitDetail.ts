import { useState, useRef } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import axios from "axios";
import { fetcher } from "../services/api";
import { updateSplit } from "../services/splits";
import { 
    updateSplitDay, 
    addExercisesToDay, 
    removeExerciseFromDay, 
    reorderExerciseInDay 
} from "../services/splitDays";
import type { Split } from "../types";

export function useSplitDetail(splitId: string) {
    const { data: split, error: swrError, isLoading: loading, mutate: mutateSplit } = useSWR<Split>(splitId ? `/splits/${splitId}` : null, fetcher);
    
    let error: string | null = null;
    if (swrError) {
        error = axios.isAxiosError(swrError) ? swrError.response?.data?.message ?? swrError.message : (swrError as Error).message;
    }

    const [actionLoading, setActionLoading] = useState(false);
    const deletingIdsRef = useRef<Set<string>>(new Set());
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

    const updateDay = async (dayId: string, updates: { label?: string, is_rest?: boolean }) => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            // Optimistic update for single split
            mutateSplit(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    days: prev.days.map(d => d.id === dayId ? { ...d, ...updates } : d)
                };
            }, false);

            // Optimistic update for global splits list (/splits)
            globalMutate(
                "/splits",
                (prevSplits: Split[] | undefined) => {
                    if (!prevSplits) return prevSplits;
                    return prevSplits.map(s => {
                        if (s.id !== splitId) return s;
                        return {
                            ...s,
                            days: s.days.map(d => d.id === dayId ? { ...d, ...updates } : d)
                        };
                    });
                },
                false
            );

            await updateSplitDay(dayId, updates);
            mutateSplit();
            globalMutate("/splits");
            globalMutate("/sessions");
        } catch (err) {
            console.error(err);
            mutateSplit(); // rollback on error
            globalMutate("/splits");
            globalMutate("/sessions");
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
                
                mutateSplit(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        days: prev.days.map(d => d.id === dayId ? {
                            ...d,
                            exercises: [...(d.exercises || []), ...newExercises]
                        } : d)
                    };
                }, false);

                // Optimistically update global /splits so Home dashboard gets new exercise count instantly (0 ms!)
                globalMutate(
                    "/splits",
                    (prevSplits: Split[] | undefined) => {
                        if (!prevSplits) return prevSplits;
                        return prevSplits.map(s => {
                            if (s.id !== splitId) return s;
                            return {
                                ...s,
                                days: s.days.map(d => {
                                    if (d.id !== dayId) return d;
                                    return {
                                        ...d,
                                        exercises: [...(d.exercises || []), ...newExercises]
                                    };
                                })
                            };
                        });
                    },
                    false
                );
            }

            const created = await addExercisesToDay(dayId, exerciseIds, startingIndex);

            // Replace temporary optimistic items with real DB records immediately
            if (created && Array.isArray(created) && created.length > 0) {
                mutateSplit(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        days: prev.days.map(d => {
                            if (d.id !== dayId) return d;
                            const nonTemp = (d.exercises || []).filter(e => !e.id.startsWith("temp-"));
                            return {
                                ...d,
                                exercises: [...nonTemp, ...created]
                            };
                        })
                    };
                }, false);

                globalMutate(
                    "/splits",
                    (prevSplits: Split[] | undefined) => {
                        if (!prevSplits) return prevSplits;
                        return prevSplits.map(s => {
                            if (s.id !== splitId) return s;
                            return {
                                ...s,
                                days: s.days.map(d => {
                                    if (d.id !== dayId) return d;
                                    const nonTemp = (d.exercises || []).filter(e => !e.id.startsWith("temp-"));
                                    return {
                                        ...d,
                                        exercises: [...nonTemp, ...created]
                                    };
                                })
                            };
                        });
                    },
                    false
                );
            }

            mutateSplit(); // Background re-fetch
            globalMutate("/splits");
            globalMutate("/sessions");
        } catch (err) {
            console.error(err);
            mutateSplit(); // Rollback optimistic update
            globalMutate("/splits");
            globalMutate("/sessions");
        } finally {
            setActionLoading(false);
        }
    };

    const removeExercise = async (dayId: string, splitDayExerciseId: string) => {
        if (deletingIdsRef.current.has(splitDayExerciseId)) return;
        deletingIdsRef.current.add(splitDayExerciseId);
        setDeletingIds(new Set(deletingIdsRef.current));

        try {
            // Optimistic update in split detail
            mutateSplit(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    days: prev.days.map(d => {
                        if (d.id === dayId) {
                            return {
                                ...d,
                                exercises: (d.exercises || []).filter(e => e.id !== splitDayExerciseId)
                            };
                        }
                        return d;
                    })
                };
            }, false);

            // Optimistic update in global /splits
            globalMutate(
                "/splits",
                (prevSplits: Split[] | undefined) => {
                    if (!prevSplits) return prevSplits;
                    return prevSplits.map(s => {
                        if (s.id !== splitId) return s;
                        return {
                            ...s,
                            days: s.days.map(d => {
                                if (d.id !== dayId) return d;
                                return {
                                    ...d,
                                    exercises: (d.exercises || []).filter(e => e.id !== splitDayExerciseId)
                                };
                            })
                        };
                    });
                },
                false
            );

            // Only send DELETE to DB if it's a real persisted UUID
            if (!splitDayExerciseId.startsWith("temp-")) {
                await removeExerciseFromDay(splitDayExerciseId);
            }
            mutateSplit();
            globalMutate("/splits");
            globalMutate("/sessions");
        } catch (err) {
            console.error(err);
            mutateSplit();
            globalMutate("/splits");
            globalMutate("/sessions");
        } finally {
            deletingIdsRef.current.delete(splitDayExerciseId);
            setDeletingIds(new Set(deletingIdsRef.current));
        }
    };

    const reorderExercise = async (dayId: string, splitDayExerciseId: string, newIndex: number) => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            await reorderExerciseInDay(splitDayExerciseId, newIndex);
            mutateSplit(); // Backend handles shifting other items, so just re-fetch
            globalMutate("/splits");
            globalMutate("/sessions");
        } catch (err) {
            console.error(err);
            mutateSplit();
            globalMutate("/splits");
            globalMutate("/sessions");
        } finally {
            setActionLoading(false);
        }
    };

    const updateSplitName = async (newName: string) => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            mutateSplit(prev => prev ? { ...prev, name: newName } : prev, false);
            globalMutate(
                "/splits",
                (prevSplits: Split[] | undefined) => {
                    if (!prevSplits) return prevSplits;
                    return prevSplits.map(s => (s.id === splitId ? { ...s, name: newName } : s));
                },
                false
            );
            await updateSplit(splitId, newName);
            mutateSplit();
            globalMutate("/splits");
            globalMutate("/sessions");
        } catch (err) {
            console.error(err);
            mutateSplit();
            globalMutate("/splits");
            globalMutate("/sessions");
        } finally {
            setActionLoading(false);
        }
    };

    return {
        split,
        loading,
        error,
        deletingIds,
        updateDay,
        updateSplitName,
        addExercises,
        removeExercise,
        reorderExercise,
        refresh: () => mutateSplit()
    };
}

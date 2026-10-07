import { useState } from "react";
import axios from "axios";
import { createSet, updateSet, deleteSet } from "../services/sets";
import { type SetRecord, type SessionExercise } from "../types";

export function useSet(
    setExercises: React.Dispatch<React.SetStateAction<SessionExercise[]>>,
) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function addUserSet(exerciseId: string) {
        const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `temp-${Date.now()}`;
        setExercises((prev) =>
            prev.map((ex) => {
                if (ex.exercise_id === exerciseId) {
                    const lastSet = ex.sets[ex.sets.length - 1];
                    const newSet: SetRecord = {
                        id: newId,
                        set_number: ex.sets.length + 1,
                        weight: lastSet ? lastSet.weight : 0,
                        reps: lastSet ? lastSet.reps : 0,
                        is_logged: false,
                        is_overload: false,
                        pr_hit: false,
                    };
                    return { ...ex, sets: [...ex.sets, newSet] };
                }
                return ex;
            }),
        );
    }

    async function saveUserSet(
        sessionId: string,
        exerciseId: string,
        setId: string,
        setNumber: number,
        weightKg: number,
        reps: number,
    ) {
        // 1. Instant optimistic update to local UI (0 ms!)
        setExercises((prev) =>
            prev.map((ex) => {
                if (ex.exercise_id === exerciseId) {
                    const newSets = ex.sets.map((s) => {
                        if (s.id === setId) {
                            return {
                                ...s,
                                weight: weightKg,
                                reps,
                                set_number: setNumber,
                                is_logged: true,
                            };
                        }
                        return s;
                    });
                    return { ...ex, sets: newSets };
                }
                return ex;
            }),
        );

        // 2. Silent background sync (non-blocking)
        try {
            if (setId.startsWith("temp-")) {
                const savedRecord = await createSet(
                    sessionId,
                    exerciseId,
                    setNumber,
                    weightKg,
                    reps,
                );
                if (savedRecord?.id) {
                    setExercises((prev) =>
                        prev.map((ex) =>
                            ex.exercise_id === exerciseId
                                ? {
                                      ...ex,
                                      sets: ex.sets.map((s) =>
                                          s.id === setId
                                              ? { ...s, id: savedRecord.id }
                                              : s,
                                      ),
                                  }
                                : ex,
                        ),
                    );
                }
                return savedRecord;
            } else {
                return await updateSet(setId, {
                    set_number: setNumber,
                    weight: weightKg,
                    reps,
                });
            }
        } catch (err) {
            // Even if network fails or phone is offline, local draft preserves the set
            console.warn("Background set sync paused, preserved in local workout draft", err);
            return null;
        }
    }

    async function removeUserSet(exerciseId: string, setId: string) {
        try {
            setLoading(true);
            setError(null);

            // Only call the DB if it's a real set that has been saved
            if (!setId.startsWith("temp-")) {
                await deleteSet(setId);
            }

            // Remove it from the UI immediately and recalculate set numbers
            setExercises((prev) =>
                prev.map((ex) => {
                    if (ex.exercise_id === exerciseId) {
                        const newSets = ex.sets.filter((s) => s.id !== setId);
                        const renumberedSets = newSets.map((s, index) => ({
                            ...s,
                            set_number: index + 1,
                        }));
                        return { ...ex, sets: renumberedSets };
                    }
                    return ex;
                }),
            );

            return true;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? err.message);
            } else {
                setError((err as Error).message);
            }
            return false;
        } finally {
            setLoading(false);
        }
    }

    return {
        addUserSet,
        saveUserSet,
        removeUserSet,
        loading,
        error,
    };
}

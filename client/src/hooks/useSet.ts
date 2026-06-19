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
        setExercises((prev) =>
            prev.map((ex) => {
                if (ex.exercise_id === exerciseId) {
                    const lastSet = ex.sets[ex.sets.length - 1];
                    const newSet: SetRecord = {
                        id: `temp-${Date.now()}`,
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
        try {
            setLoading(true);
            setError(null);

            let savedRecord: SetRecord;

            // If it's a temporary ID, it means it hasn't been created in the DB yet
            if (setId.startsWith("temp-")) {
                savedRecord = await createSet(
                    sessionId,
                    exerciseId,
                    setNumber,
                    weightKg,
                    reps,
                );
            } else {
                // Otherwise it exists, so we update it
                savedRecord = await updateSet(setId, {
                    set_number: setNumber,
                    weight: weightKg,
                    reps,
                });
            }

            // Update the UI by replacing the old set with the fresh one from the DB
            setExercises((prev) =>
                prev.map((ex) => {
                    if (ex.exercise_id === exerciseId) {
                        const newSets = ex.sets.map((s) => {
                            if (s.id === setId) {
                                // The backend might return weight_kg, map it back to weight
                                const mappedRecord = {
                                    ...savedRecord,
                                    weight:
                                        (savedRecord as any).weight_kg ??
                                        weightKg,
                                    is_logged: true,
                                };
                                return mappedRecord;
                            }
                            return s;
                        });
                        return { ...ex, sets: newSets };
                    }
                    return ex;
                }),
            );

            return savedRecord;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? err.message);
            } else {
                setError((err as Error).message);
            }
            return null;
        } finally {
            setLoading(false);
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

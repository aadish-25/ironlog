import { useState, useEffect } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import axios from "axios";
import { fetcher } from "../services/api";
import { completeSession } from "../services/sessions";
import type { Session, SessionExercise } from "../types";

export function useSession(sessionId: string | null) {
    const { data: sessionData, error: swrError, isLoading, mutate } = useSWR<Session & { exercises: SessionExercise[] }>(
        sessionId ? `/sessions/${sessionId}` : null,
        fetcher
    );

    // Session page uses local state for exercises during the workout
    const [exercises, setExercises] = useState<SessionExercise[]>([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

    // Sync exercises when session loads (only once per session ID to prevent overwriting active workout state)
    useEffect(() => {
        if (sessionData && sessionData.exercises) {
            setExercises(sessionData.exercises);
        }
    }, [sessionData?.id]);

    let error: string | null = null;
    if (swrError) {
        error = axios.isAxiosError(swrError) ? swrError.response?.data?.message ?? swrError.message : (swrError as Error).message;
    }

    async function completeUserSession(id: string) {
        try {
            const result = await completeSession(id);
            mutate((currentData) => currentData ? { ...currentData, ...result } : undefined, false);

            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

            // Invalidate all affected caches in parallel to guarantee real-time data freshness
            const invalidationPromises: Promise<unknown>[] = [
                globalMutate("/sessions"),
                globalMutate("/users/me/stats"),
                globalMutate("/exercise"),
                globalMutate(`/sessions/summary?month=${currentMonthStr}`),
                globalMutate("/sessions/history?limit=10&offset=0"),
            ];

            exercises.forEach((ex) => {
                if (ex.exercise_id) {
                    invalidationPromises.push(globalMutate(`/exercise/${ex.exercise_id}/progress`));
                    invalidationPromises.push(globalMutate(`/exercise/${ex.exercise_id}`));
                }
            });

            await Promise.allSettled(invalidationPromises);

            return result;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    return {
        session: sessionData || null,
        exercises,
        setExercises,
        currentExerciseIndex,
        setCurrentExerciseIndex,
        loading: isLoading,
        error,
        completeUserSession,
        refetch: mutate,
    };
}

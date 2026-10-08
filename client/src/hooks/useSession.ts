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

    // Sync exercises when session loads: check localStorage draft first, fallback to DB
    useEffect(() => {
        if (!sessionId) return;
        const draftKey = `ironlog_draft_${sessionId}`;
        try {
            const raw = localStorage.getItem(draftKey);
            if (raw) {
                const draft = JSON.parse(raw);
                if (Array.isArray(draft) && draft.length > 0) {
                    setExercises(draft);
                    return;
                }
            }
        } catch (e) {
            console.warn("Could not parse draft", e);
        }

        if (sessionData && sessionData.exercises) {
            setExercises(sessionData.exercises);
        }
    }, [sessionId, sessionData?.id]);

    // Persist draft to localStorage whenever exercises state changes
    useEffect(() => {
        if (!sessionId || exercises.length === 0) return;
        const draftKey = `ironlog_draft_${sessionId}`;
        try {
            localStorage.setItem(draftKey, JSON.stringify(exercises));
        } catch (e) {
            // Ignore quota errors
        }
    }, [sessionId, exercises]);

    // Ensure draft is saved when user minimizes or closes the tab
    useEffect(() => {
        if (!sessionId) return;
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden" && exercises.length > 0) {
                try {
                    localStorage.setItem(`ironlog_draft_${sessionId}`, JSON.stringify(exercises));
                } catch (e) {}
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [sessionId, exercises]);

    // Auto-complete if session date is in the past and has logged sets (midnight passed)
    useEffect(() => {
        if (!sessionData || sessionData.is_completed || !sessionId) return;
        const sDate = sessionData.date || (sessionData as any).started_at;
        if (!sDate) return;
        const d = new Date(sDate);
        const now = new Date();
        const isPastDay =
            d.getFullYear() < now.getFullYear() ||
            d.getMonth() < now.getMonth() ||
            d.getDate() < now.getDate();

        if (isPastDay && exercises.some((ex) => ex.sets.some((s) => s.is_logged))) {
            completeUserSession(sessionId);
        }
    }, [sessionId, sessionData?.date, sessionData?.is_completed, exercises]);

    let error: string | null = null;
    if (swrError) {
        error = axios.isAxiosError(swrError) ? swrError.response?.data?.message ?? swrError.message : (swrError as Error).message;
    }

    async function completeUserSession(id: string) {
        try {
            // 1. Immediately update SWR cache so Home page says "Finished" without any lag!
            globalMutate(
                "/sessions",
                (prev: any) => {
                    if (!Array.isArray(prev)) return prev;
                    return prev.map((s) => (s.id === id ? { ...s, is_completed: true } : s));
                },
                false
            );

            // 2. Immediately update /users/me/stats optimistically so CompletionScreen & Home show the new streak!
            globalMutate(
                "/users/me/stats",
                (prev: any) => {
                    if (!prev) return prev;
                    const newStreak = (prev.currentStreak || 0) + 1;
                    return {
                        ...prev,
                        totalSessions: (prev.totalSessions || 0) + 1,
                        monthlySessions: (prev.monthlySessions || 0) + 1,
                        weeklySessions: (prev.weeklySessions || 0) + 1,
                        currentStreak: newStreak,
                        bestStreak: Math.max(prev.bestStreak || 0, newStreak),
                    };
                },
                false
            );

            // 2. Collect all logged sets from the session to batch sync to server
            const allLoggedSets = exercises.flatMap((ex) =>
                ex.sets
                    .filter((s) => s.is_logged)
                    .map((s) => ({
                        id: s.id,
                        exercise_id: ex.exercise_id,
                        set_number: s.set_number,
                        weight_kg: s.weight,
                        reps: s.reps,
                    }))
            );

            // 3. Complete session on server with all sets in one batch
            const result = await completeSession(id, allLoggedSets);

            // 4. Clean up the local workout draft now that it's permanently saved
            localStorage.removeItem(`ironlog_draft_${id}`);

            mutate((currentData) => currentData ? { ...currentData, ...result } : undefined, false);

            // Optimistically update /sessions so Home page sees it completed in 0ms
            globalMutate(
                "/sessions",
                (current: any) => {
                    if (!current || !Array.isArray(current)) return current;
                    return current.map((s: any) =>
                        s.id === id
                            ? {
                                  ...s,
                                  is_completed: true,
                                  is_skipped: false,
                                  sets_logged: allLoggedSets.length,
                              }
                            : s
                    );
                },
                false
            );

            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

            // 5. Invalidate all affected caches in parallel in background
            const invalidationPromises: Promise<unknown>[] = [
                globalMutate("/sessions"),
                globalMutate("/users/me/stats"),
                globalMutate("/users/me/prs"),
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

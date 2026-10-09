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
    const [exercises, setExercises] = useState<SessionExercise[]>(() => {
        if (!sessionId) return [];
        const draftKey = `ironlog_draft_${sessionId}`;
        try {
            const raw = localStorage.getItem(draftKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch {
            // Ignore parse error
        }
        return [];
    });
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

    // Reconcile exercises when session loads:
    // Merges local draft sets with latest split plan from sessionData
    useEffect(() => {
        if (!sessionId) return;
        const draftKey = `ironlog_draft_${sessionId}`;
        let draft: SessionExercise[] | null = null;
        try {
            const raw = localStorage.getItem(draftKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    draft = parsed;
                }
            }
        } catch (e) {
            console.warn("Could not parse draft", e);
        }

        // Before sessionData loads, render draft optimistically if available
        if (!sessionData) {
            if (draft && draft.length > 0) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setExercises(draft);
            }
            return;
        }

        const serverExercises = sessionData.exercises || [];

        // If the session is already completed, the server database is the single source of truth!
        if (sessionData.is_completed) {
            localStorage.removeItem(draftKey);
            setExercises((prev) => {
                const hasLogged = prev.some((e) => e.sets?.some((s) => s.is_logged));
                if (hasLogged) return prev;
                return serverExercises;
            });
            return;
        }

        const hasDraftLoggedSets = draft?.some(ex => ex.sets?.some(s => s.is_logged)) ?? false;

        // If split day has 0 exercises configured on server:
        if (serverExercises.length === 0) {
            if (!hasDraftLoggedSets) {
                // Completely empty session with no logged sets: clean up stale draft and show empty state
                localStorage.removeItem(draftKey);
                setExercises([]);
                return;
            } else if (draft) {
                // User logged sets on exercises that were subsequently deleted from the split day:
                // Preserve ONLY exercises that have at least one logged set!
                const kept = draft.filter(ex => ex.sets?.some(s => s.is_logged));
                localStorage.setItem(draftKey, JSON.stringify(kept));
                setExercises(kept);
                return;
            }
        }

        // Split day has exercises configured:
        if (!draft || draft.length === 0) {
            setExercises(serverExercises);
            return;
        }

        // Reconcile draft with server exercises
        const draftMap = new Map<string, SessionExercise>();
        for (const ex of draft) {
            draftMap.set(ex.exercise_id, ex);
        }

        const reconciled: SessionExercise[] = [];

        // 1. Keep planned server exercises (latest split plan)
        for (const serverEx of serverExercises) {
            const draftEx = draftMap.get(serverEx.exercise_id);
            if (draftEx && draftEx.sets && draftEx.sets.length > 0) {
                // Merge draft's user-entered sets while keeping server metadata
                reconciled.push({
                    ...serverEx,
                    sets: draftEx.sets,
                });
            } else {
                reconciled.push(serverEx);
            }
            draftMap.delete(serverEx.exercise_id);
        }

        // 2. Any exercise in draft that was removed from split is ONLY kept if it has logged sets
        for (const [, draftEx] of draftMap.entries()) {
            if (draftEx.sets?.some(s => s.is_logged)) {
                reconciled.push(draftEx);
            }
        }

        setExercises(reconciled);
        if (reconciled.length > 0) {
            localStorage.setItem(draftKey, JSON.stringify(reconciled));
        } else {
            localStorage.removeItem(draftKey);
        }
    }, [sessionId, sessionData?.id, sessionData?.is_completed, sessionData?.exercises]);

    // Persist draft to localStorage whenever exercises state changes (ONLY for active/incomplete workouts)
    useEffect(() => {
        if (!sessionId || sessionData?.is_completed) return;
        const draftKey = `ironlog_draft_${sessionId}`;
        try {
            if (exercises.length === 0) {
                localStorage.removeItem(draftKey);
            } else {
                localStorage.setItem(draftKey, JSON.stringify(exercises));
            }
        } catch {
            // Ignore quota errors
        }
    }, [sessionId, exercises, sessionData?.is_completed]);

    // Ensure draft is saved or cleaned when user minimizes or closes the tab (ONLY for active workouts)
    useEffect(() => {
        if (!sessionId || sessionData?.is_completed) return;
        const draftKey = `ironlog_draft_${sessionId}`;
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                try {
                    if (exercises.length > 0) {
                        localStorage.setItem(draftKey, JSON.stringify(exercises));
                    } else {
                        localStorage.removeItem(draftKey);
                    }
                } catch {
                    // Ignore quota errors
                }
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [sessionId, exercises, sessionData?.is_completed]);

    // Auto-complete if session date is in the past and has logged sets (midnight passed)
    useEffect(() => {
        if (!sessionData || sessionData.is_completed || !sessionId) return;
        const sDate = sessionData.date || (sessionData as { started_at?: string }).started_at;
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
    }, [sessionId, sessionData, exercises]);

    let error: string | null = null;
    if (swrError) {
        error = axios.isAxiosError(swrError) ? swrError.response?.data?.message ?? swrError.message : (swrError as Error).message;
    }

    async function completeUserSession(id: string) {
        try {
            // 1. Immediately update SWR cache so Home page says "Finished" without any lag!
            globalMutate(
                "/sessions",
                (prev: Array<{ id: string; is_completed?: boolean }> | undefined) => {
                    if (!Array.isArray(prev)) return prev;
                    return prev.map((s) => (s.id === id ? { ...s, is_completed: true } : s));
                },
                false
            );

            // 2. Immediately update /users/me/stats optimistically so CompletionScreen & Home show the new streak!
            globalMutate(
                "/users/me/stats",
                (prev: { currentStreak?: number; totalSessions?: number; monthlySessions?: number; weeklySessions?: number; bestStreak?: number } | undefined) => {
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

            mutate((currentData) => currentData ? { ...currentData, ...result, exercises } : undefined, false);

            // Optimistically update /sessions so Home page sees it completed in 0ms
            globalMutate(
                "/sessions",
                (current: Array<{ id: string; is_completed?: boolean; is_skipped?: boolean; sets_logged?: number }> | undefined) => {
                    if (!current || !Array.isArray(current)) return current;
                    return current.map((s) =>
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

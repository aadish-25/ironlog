import { useState, useEffect, useCallback } from "react";
import {
    createSession,
    getSessions,
    getSessionById,
    getMissedSessions,
    deleteSession,
    completeSession,
} from "../services/sessions";
import type { Session, SessionExercise } from "../types";
import axios from "axios";

export function useSession(sessionId: string | null) {
    const [session, setSession] = useState<Session | null>(null);
    const [allSessions, setAllSessions] = useState<Session[] | null>([]);
    const [missedSessions, setMissedSessions] = useState<Session[] | null>([]);
    const [exercises, setExercises] = useState<SessionExercise[]>([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSession = useCallback(async () => {
        if (!sessionId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Call the service we wrote earlier!
            const data = await getSessionById(sessionId);

            // The backend returns the session AND its nested exercises
            setSession(data);
            setExercises(data.exercises || []);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const backendMsg = err.response?.data?.message;
                const axiosMsg = err.message;
                setError(backendMsg ?? axiosMsg);
            } else {
                setError((err as Error).message);
            }
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    async function createUserSession(splitDayId: string, date?: string) {
        // HINT: Call `createSession(splitDayId, date)` from `../services/sessions.ts`.
        // Remember to wrap in try-catch to catch any errors.
        // Since it returns a newly created session, you might want to return it from this function.

        try {
            const result = await createSession(splitDayId, date);
            setSession(result);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const backendMsg = err.response?.data?.message;
                const axiosMsg = err.message;
                setError(backendMsg ?? axiosMsg);
            } else {
                setError((err as Error).message);
            }
        }
    }

    async function fetchUserSession() {
        // HINT: The user passed an `id` here, but `getSessions` fetches ALL sessions.
        // Call `getSessions()` from `../services/sessions.ts` inside a try-catch.
        // If you want to use this to display a list, you'll need to create a new state like `const [allSessions, setAllSessions] = useState([])` at the top!
        try {
            setLoading(true);
            setError(null);
            const result = await getSessions();
            setAllSessions(result);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? err.message);
            } else {
                setError((err as Error).message);
            }
        } finally {
            setLoading(false);
        }
    }

    async function fetchUserSessionById(id: string) {
        try {
            setLoading(true);
            setError(null);
            const data = await getSessionById(id);
            setSession(data);
            setExercises(data.exercises || []);
            return data;
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

    async function fetchUserMiseedSession() {
        try {
            setLoading(true);
            setError(null);
            const data = await getMissedSessions();
            setMissedSessions(data);
            return data;
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

    async function deleteUserSession(id: string) {
        try {
            setError(null);
            await deleteSession(id);
            
            // If the deleted session was in our lists, remove it so the UI updates
            setAllSessions((prev) => prev ? prev.filter((s) => s.id !== id) : null);
            setMissedSessions((prev) => prev ? prev.filter((s) => s.id !== id) : null);
            
            // If the deleted session is the one currently loaded, clear the screen
            if (session?.id === id) {
                setSession(null);
                setExercises([]);
            }
            return true;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? err.message);
            } else {
                setError((err as Error).message);
            }
            return false;
        }
    }

    async function completeUserSession(id: string) {
        try {
            setError(null);
            const result = await completeSession(id);
            setSession(result);
            return result;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? err.message);
            } else {
                setError((err as Error).message);
            }
            return null;
        }
    }

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    return {
        session,
        allSessions,
        missedSessions,
        exercises,
        setExercises,
        currentExerciseIndex,
        setCurrentExerciseIndex,
        loading,
        error,
        createUserSession,
        fetchUserSession,
        fetchUserSessionById,
        fetchUserMiseedSession,
        deleteUserSession,
        completeUserSession,
        refetch: fetchSession,
    };
}

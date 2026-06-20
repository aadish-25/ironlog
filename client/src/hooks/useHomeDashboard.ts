import { useState, useEffect, useCallback } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { useSplit } from "./useSplit";
import { getSessions, createSession, deleteSession } from "../services/sessions";
import { getUserStats, type UserStats } from "../services/users";
import type { Session } from "../types";

export function useHomeDashboard() {
    const { user, loading: userLoading } = useCurrentUser();
    const { splits, loading: splitsLoading } = useSplit();
    const activeSplit = splits?.find(s => s.is_active) || null;
    
    const [sessions, setSessions] = useState<Session[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchSessions = useCallback(async () => {
        try {
            setSessionsLoading(true);
            const [sessionsData, statsData] = await Promise.all([
                getSessions(),
                getUserStats()
            ]);
            setSessions(sessionsData);
            setStats(statsData);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch sessions"));
        } finally {
            setSessionsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    // ─── DERIVED DATA ──────────────────────────────────────────────────────────

    // 1. Date calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];

    // DB day_of_week: 0 = Mon, ..., 6 = Sun
    // JS getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dbDayOfWeek = (today.getDay() + 6) % 7;
    const tomorrowDbDayOfWeek = (dbDayOfWeek + 1) % 7;

    // 2. Active Split Day
    const activeSplitDay = activeSplit?.days?.find((d: any) => d.day_of_week === dbDayOfWeek) || null;
    const tomorrowSplitDay = activeSplit?.days?.find((d: any) => d.day_of_week === tomorrowDbDayOfWeek) || null;

    // 3. Today's Session
    const todaySession = sessions.find(s => {
        const sDate = (s as any).date || s.started_at;
        if (!sDate) return false;
        const d = new Date(sDate);
        return d.getDate() === today.getDate() &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
    });
    const workoutDone = !!todaySession && !todaySession.is_skipped && todaySession.is_completed;
    const skipped = !!todaySession && todaySession.is_skipped;
    const inProgress = !!todaySession && !skipped && !todaySession.is_completed;

    // 4. Week History (Current week Mon-Sun)
    const weekHistory = [0, 1, 2, 3, 4, 5, 6].map((dbDay) => {
        const labels = ["M", "T", "W", "T", "F", "S", "S"];
        let type: "done" | "rest" | "today" | "future" = "future";

        if (dbDay === dbDayOfWeek) {
            type = "today";
        } else if (dbDay > dbDayOfWeek) {
            type = "future";
        } else {
            // Past day
            const daysAgo = dbDayOfWeek - dbDay;
            const pastDate = new Date(today);
            pastDate.setDate(today.getDate() - daysAgo);
            const pastDateStr = new Date(pastDate.getTime() - pastDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
            
            const sessionOnDay = sessions.find(s => {
                const sDate = (s as any).date || s.started_at;
                if (!sDate) return false;
                const d = new Date(sDate);
                return d.getDate() === pastDate.getDate() &&
                       d.getMonth() === pastDate.getMonth() &&
                       d.getFullYear() === pastDate.getFullYear();
            });
            
            if (sessionOnDay && !sessionOnDay.is_skipped) {
                type = "done";
            } else {
                // Was it a rest day?
                const splitDayForPast = activeSplit?.days?.find((d: any) => d.day_of_week === dbDay);
                if (splitDayForPast?.type === "rest") {
                    type = "rest";
                } else {
                    // It was a training day, but no session found (missed)
                    // The UI 'rest' dot represents a missed day or rest day based on design.
                    type = "rest";
                }
            }
        }

        return { label: labels[dbDay], type };
    });

    // 5. Stats
    const setsLogged = todaySession?.sets_logged || 0;
    const volumeKg = todaySession?.total_volume || 0;
    
    // Group newPRs by name and take the max kg
    const rawPRs = (todaySession as any)?.pr_details || [];
    const uniquePRsMap = rawPRs.reduce((acc: any, pr: any) => {
        if (!acc[pr.name] || pr.kg > acc[pr.name].kg) {
            acc[pr.name] = pr;
        }
        return acc;
    }, {});
    const newPRs = Object.values(uniquePRsMap) as {name: string, kg: number}[];

    // TODO: Coach Nudge
    const coachNudge = null;

    // 6. Lifetime Stats & Recent Activity
    const completedSessions = sessions.filter(s => s.is_completed && !s.is_skipped);
    
    const lifetimeStats = {
        sessions: completedSessions.length,
        prsHit: completedSessions.reduce((acc, s) => acc + ((s as any).prs_hit || 0), 0),
        daysActive: new Set(completedSessions.map(s => (s as any).date ? (s as any).date.split('T')[0] : '')).size
    };

    const recentSessions = completedSessions.slice(0, 3).map((s: any) => ({
        day: s.split_day_name || "Workout",
        date: s.date ? new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
        sets: s.sets_logged || 0,
        volume: `${s.total_volume || 0} kg`,
        pr: s.prs_hit > 0
    }));

    // ─── ACTIONS ───────────────────────────────────────────────────────────────

    const startWorkout = async () => {
        if (!activeSplitDay) return null;
        try {
            const session = await createSession(activeSplitDay.id, todayStr);
            await fetchSessions();
            return session;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const skipWorkout = async () => {
        if (!activeSplitDay) return null;
        try {
            await createSession(activeSplitDay.id, todayStr, true);
            await fetchSessions();
        } catch (err) {
            console.error(err);
        }
    };

    const undoSkip = async () => {
        if (todaySession) {
            await deleteSession(todaySession.id);
            await fetchSessions();
        }
    };

    const handleStartWorkoutClick = async () => {
        if (inProgress && todaySession) {
            return todaySession;
        }
        return startWorkout();
    };

    const loading = userLoading || splitsLoading || sessionsLoading;

    const getMusclesStr = (day: any) => {
        if (!day || !day.exercises || day.exercises.length === 0) return null;
        const muscles = new Set<string>();
        day.exercises.forEach((ex: any) => {
            if (ex.muscle_groups && ex.muscle_groups.length > 0) {
                muscles.add(ex.muscle_groups[0]);
            }
        });
        const arr = Array.from(muscles);
        return arr.length > 0 ? arr.join(" · ") : null;
    };

    return {
        user,
        activeSplitDayName: activeSplitDay?.label || "Rest",
        activeSplitDayMuscles: getMusclesStr(activeSplitDay) || "Rest and Recover",
        exerciseCount: activeSplitDay?.exercises?.length || 0,
        tomorrowWorkout: tomorrowSplitDay ? {
            name: tomorrowSplitDay.label,
            muscles: getMusclesStr(tomorrowSplitDay) || "No specific muscles",
            exercisesCount: tomorrowSplitDay.exercises?.length || 0
        } : null,
        workoutDone,
        inProgress,
        skipped,
        setsLogged,
        volumeKg,
        weekHistory,
        newPRs,
        coachNudge,
        loading,
        error,
        startWorkout,
        skipWorkout,
        undoSkip,
        activeSplitDayId: activeSplitDay?.id || null,
        todaySessionId: todaySession?.id || null,
        lifetimeStats,
        recentSessions,
        isRestDay: activeSplitDay?.type === "rest",
        streak: stats?.currentStreak ?? 0,
        hasActiveSplit: !!activeSplit
    };
}

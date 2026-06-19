import { useNavigate } from "react-router-dom";
import { HeroCard } from "../components/Home/HeroCard";
import { CoachNudge } from "../components/Home/CoachNudge";
import { QuickStats } from "../components/Home/QuickStats";
import { RecentActivity } from "../components/Home/RecentActivity";
import { useHomeDashboard } from "../hooks/useHomeDashboard";

export function HomePage() {
    const navigate = useNavigate();
    const {
        user,
        activeSplitDayName,
        activeSplitDayMuscles,
        exerciseCount,
        tomorrowWorkout,
        workoutDone,
        inProgress,
        skipped,
        setsLogged,
        volumeKg,
        weekHistory,
        newPRs,
        coachNudge,
        loading,
        startWorkout,
        skipWorkout,
        undoSkip,
        activeSplitDayId,
        todaySessionId,
        lifetimeStats,
        recentSessions,
        isRestDay,
        streak
    } = useHomeDashboard();

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";

    const userName = user?.name;
    const formattedDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const handleStartWorkout = async () => {
        // If a session already exists for today and wasn't skipped, just navigate.
        if ((workoutDone || inProgress) && todaySessionId) {
            navigate(`/session/${todaySessionId}`);
            return;
        }
        
        // Otherwise create a new session
        if (activeSplitDayId) {
            const session = await startWorkout();
            if (session) {
                // Navigate with the new session ID
                navigate(`/session/${session.id}`);
            } else {
                // Fallback (this shouldn't happen but just in case)
                navigate("/");
            }
        } else {
            navigate("/splits");
        }
    };

    const handleSkipToday = async () => {
        await skipWorkout();
    };

    const handleUndoSkip = async () => {
        await undoSkip();
    };

    if (loading) {
        return (
            <div className="bg-bg min-h-screen text-ink font-body flex items-center justify-center">
                <span className="text-white text-opacity-50 tracking-widest text-xs uppercase animate-pulse">
                    Loading dashboard...
                </span>
            </div>
        );
    }

    return (
        <div className="bg-bg min-h-screen text-ink font-body">
            <div className="overflow-y-auto pb-[90px] no-scrollbar">
                {/* ── Top bar ── */}
                <div className="flex items-center justify-between px-5 py-[14px] pb-2.5 relative">
                    <div className="flex items-center gap-2">
                        <div className="w-[30px] h-[30px] bg-heat rounded-lg flex items-center justify-center font-display text-[13px] text-white tracking-[0.5px]">
                            IL
                        </div>
                        <span className="font-display text-xl tracking-[3px] text-white">
                            IRONLOG
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate("/profile")}
                            className="w-[34px] h-[34px] rounded-full bg-raised border-[1.5px] border-border flex items-center justify-center text-[13px] font-semibold text-dim cursor-pointer"
                        >
                            {userName ? String(userName)[0].toUpperCase() : "U"}
                        </button>
                    </div>
                </div>
                {/* ── Greeting ── */}
                <div className="px-5 pt-0.5 pb-[18px]">
                    <div className="font-display text-[32px] leading-none tracking-[1px] text-white">
                        {greeting},{" "}
                        <em className="not-italic text-heat">
                            {userName || "Lifter"}.
                        </em>
                    </div>
                    <div className="text-[10px] text-ghost tracking-[2px] uppercase mt-1">
                        {formattedDate}
                    </div>
                </div>
                {/* ── Main hero card ── */}
                <HeroCard
                    skipped={skipped}
                    workoutDone={workoutDone}
                    inProgress={inProgress}
                    streak={streak}
                    activeSplitDayName={activeSplitDayName}
                    activeSplitDayMuscles={activeSplitDayMuscles}
                    exerciseCount={exerciseCount}
                    weekHistory={weekHistory as any}
                    setsLogged={setsLogged}
                    volumeKg={volumeKg}
                    newPRs={newPRs}
                    tomorrowWorkout={tomorrowWorkout}
                    isRestDay={isRestDay}
                    onStartWorkout={handleStartWorkout}
                    onSkipToday={handleSkipToday}
                    onUndoSkip={handleUndoSkip}
                />
                {/* ── Coach nudge ── */}
                <CoachNudge
                    skipped={skipped}
                    workoutDone={workoutDone}
                    coachNudge={coachNudge}
                />
                {/* ── Quick Stats ── */}
                <QuickStats lifetimeStats={lifetimeStats} />
                {/* ── Recent Activity ── */}
                <RecentActivity recentSessions={recentSessions} />
            </div>
        </div>
    );
}
/*
─────────────────────────────────────────
ANSWERS (read only after you've thought through the TODOs above)
─────────────────────────────────────────


streak              → GET /api/users/me, read "created_at" membership age or calculate via consecutive logged days in "sessions" table
activeSplitDayName     → GET /api/splits, find split where is_active === true, then map split_days by matching day_of_week with today's JS day (new Date().getDay())
activeSplitDayMuscles  → nested in GET /api/splits (joined via split_days, split_day_exercises, and exercises to list targeted muscle groups)
exerciseCount       → nested in GET /api/splits (count of records in split_day_exercises for the active split_day_id)
weekHistory         → GET /api/sessions (filter for current week's dates), match dates to weekday index (0 = Monday, 6 = Sunday) to output WeekDot types
workoutDone         → GET /api/sessions, check if completed session exists for today's date with is_skipped = false
skipped             → GET /api/sessions, check if session exists for today's date with is_skipped = true
setsLogged          → GET /api/sessions/:id or GET /api/sessionsPLAN SPLIT/today, count rows in "sets" table joined to today's session
volumeKg            → GET /api/sessions/:id or GET /api/sessions/today, calculate SUM(weight_kg * reps) from "sets" table joined to today's session
newPRs              → GET /api/sessions/:id, filter "sets" table where session_id === today's session and is_pr = true, grouped by exercise_id
tomorrowWorkout     → GET /api/splits, find split where is_active === true, filter split_days by day_of_week = (new Date().getDay() + 1) % 7
coachNudge          → GET /api/ai/insights, retrieve proactive insight strings generated by RAG engine
handleStartWorkout  → POST /api/sessions, body: { split_day_id, date: 'YYYY-MM-DD' }
handleSkipToday     → POST /api/sessions, body: { split_day_id, date: 'YYYY-MM-DD', is_skipped: true }
handleUndoSkip      → DELETE /api/sessions/:id (delete today's skipped session record)
─────────────────────────────────────────
*/

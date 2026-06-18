import { useNavigate } from "react-router-dom";
import { HeroCard } from "../components/Home/HeroCard";
import { CoachNudge } from "../components/Home/CoachNudge";
import { QuickStats } from "../components/Home/QuickStats";
import { RecentActivity } from "../components/Home/RecentActivity";

export function HomePage() {
  const navigate = useNavigate();

  // ─── USER DATA & PROFILE ───────────────────────────────────────────────────
  // TODO: This component needs to know the user's name.
  // Think about: where is this stored? Is it in Clerk or your local DB?
  // Which database table contains this, and how does the frontend fetch it?
  const userName = null;

  // TODO: This component needs today's date formatted (e.g. "Monday · Jun 16, 2026").
  // Think about: is today's date fetched from the server or generated on the client?
  const formattedDate = null;

  // ─── TIME OF DAY GREETING ───────────────────────────────────────────────────
  const hour = new Date().getHours();
  let timeGreeting = "Evening";
  if (hour >= 5 && hour < 12) timeGreeting = "Morning";
  else if (hour >= 12 && hour < 17) timeGreeting = "Afternoon";

  // TODO: This component needs to show the user's current workout streak.
  // Think about: where does the streak number come from? Is it computed in backend SQL?
  const streak = null;

  // ─── ACTIVE SPLIT / WORKOUT PLAN ──────────────────────────────────────────
  // TODO: This component needs to know the active split day label for today.
  // Think about: how do we determine today's split day?
  const activeSplitName = null;

  // TODO: This component needs to know target muscles for today's active split day.
  const activeSplitMuscles = null;

  // TODO: This component needs to know how many exercises are planned for today's active split day.
  const exerciseCount = null;

  // TODO: This component needs the weekly history data showing which days were trained, rest, today, or future.
  const weekHistory: { label: string; type: "done" | "rest" | "today" | "future" }[] | null = [
    { label: "M", type: "done" },
    { label: "T", type: "done" },
    { label: "W", type: "done" },
    { label: "T", type: "today" },
    { label: "F", type: "future" },
    { label: "S", type: "future" },
    { label: "S", type: "future" },
  ];

  // ─── SESSION STATS & PROGRESS ─────────────────────────────────────────────
  // TODO: This component needs to know if today's session has already been completed.
  const workoutDone = null;

  // TODO: This component needs to know if today's session has been skipped.
  const skipped = null;

  // TODO: This component needs to know the number of sets logged in today's session.
  const setsLogged = null;

  // TODO: This component needs to know the total weight volume in kg lifted in today's session.
  const volumeKg = null;

  // TODO: This component needs to list personal records (PRs) achieved in today's session.
  const newPRs: { name: string; kg: number }[] | null = null;

  // ─── FUTURE PREVIEW & AI COACH ────────────────────────────────────────────
  // TODO: This component needs to display tomorrow's planned workout details.
  const tomorrowWorkout: { name: string; muscles: string; exercisesCount: number } | null = null;

  // TODO: This component needs to show an AI coach nudge message.
  const coachNudge = null;

  // ─── EVENT HANDLERS ────────────────────────────────────────────────────────
  // TODO: Handle starting today's session.
  const handleStartWorkout = () => navigate("/session");

  // TODO: Handle skipping today's session.
  const handleSkipToday = null;

  // TODO: Handle undoing today's skipped session.
  const handleUndoSkip = null;

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
            {timeGreeting}, <em className="not-italic text-heat">{userName || "Lifter"}.</em>
          </div>
          <div className="text-[10px] text-ghost tracking-[2px] uppercase mt-1">
            {formattedDate || "Date Loading..."}
          </div>
        </div>
        {/* ── Main hero card ── */}
        <HeroCard
          skipped={skipped}
          workoutDone={workoutDone}
          streak={streak}
          activeSplitName={activeSplitName}
          activeSplitMuscles={activeSplitMuscles}
          exerciseCount={exerciseCount}
          weekHistory={weekHistory}
          setsLogged={setsLogged}
          volumeKg={volumeKg}
          newPRs={newPRs}
          tomorrowWorkout={tomorrowWorkout}
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
        <QuickStats />
        {/* ── Recent Activity ── */}
        <RecentActivity recentSessions={null} />
      </div>
    </div>
  );
}
/*
─────────────────────────────────────────
ANSWERS (read only after you've thought through the TODOs above)
─────────────────────────────────────────
userName            → GET /api/users/me, read "name" field from "users" table
formattedDate       → client-side: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
streak              → GET /api/users/me, read "created_at" membership age or calculate via consecutive logged days in "sessions" table
activeSplitName     → GET /api/splits, find split where is_active === true, then map split_days by matching day_of_week with today's JS day (new Date().getDay())
activeSplitMuscles  → nested in GET /api/splits (joined via split_days, split_day_exercises, and exercises to list targeted muscle groups)
exerciseCount       → nested in GET /api/splits (count of records in split_day_exercises for the active split_day_id)
weekHistory         → GET /api/sessions (filter for current week's dates), match dates to weekday index (0 = Monday, 6 = Sunday) to output WeekDot types
workoutDone         → GET /api/sessions, check if completed session exists for today's date with is_skipped = false
skipped             → GET /api/sessions, check if session exists for today's date with is_skipped = true
setsLogged          → GET /api/sessions/:id or GET /api/sessions/today, count rows in "sets" table joined to today's session
volumeKg            → GET /api/sessions/:id or GET /api/sessions/today, calculate SUM(weight_kg * reps) from "sets" table joined to today's session
newPRs              → GET /api/sessions/:id, filter "sets" table where session_id === today's session and is_pr = true, grouped by exercise_id
tomorrowWorkout     → GET /api/splits, find split where is_active === true, filter split_days by day_of_week = (new Date().getDay() + 1) % 7
coachNudge          → GET /api/ai/insights, retrieve proactive insight strings generated by RAG engine
handleStartWorkout  → POST /api/sessions, body: { split_day_id, date: 'YYYY-MM-DD' }
handleSkipToday     → POST /api/sessions, body: { split_day_id, date: 'YYYY-MM-DD', is_skipped: true }
handleUndoSkip      → DELETE /api/sessions/:id (delete today's skipped session record)
─────────────────────────────────────────
*/
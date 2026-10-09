import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, Dumbbell } from "lucide-react";
import { WeekDot } from "../ui/WeekDot";

interface HeroCardProps {
  skipped: boolean | null;
  workoutDone: boolean | null;
  inProgress: boolean | null;
  streak: number | null;
  activeSplitDayName: string | null;
  activeSplitDayMuscles: string | null;
  exerciseCount: number | null;
  weekHistory: { label: string; type: "done" | "rest" | "today" | "future" }[] | null;
  setsLogged: number | null;
  volumeKg: number | null;
  newPRs: { name: string; kg: number }[] | null;
  tomorrowWorkout: {
    name: string;
    muscles: string;
    exercisesCount: number;
    isRestDay?: boolean;
    headerBadge?: string;
    dayLabel?: string;
    dayName?: string;
    dateStr?: string;
    nextWorkoutSummary?: string;
  } | null;
  isRestDay?: boolean;
  hasActiveSplit?: boolean;
  activeSplitId?: string | null;
  activeSplitDayId?: string | null;
  onStartWorkout: () => void;
  onSkipToday: (() => void) | null;
  onUndoSkip: (() => void) | null;
}

export function HeroCard({
  skipped,
  workoutDone,
  inProgress,
  streak,
  activeSplitDayName,
  activeSplitDayMuscles,
  exerciseCount,
  weekHistory,
  setsLogged,
  volumeKg,
  newPRs,
  tomorrowWorkout,
  isRestDay = false,
  hasActiveSplit = true,
  activeSplitId,
  activeSplitDayId,
  onStartWorkout,
  onSkipToday,
  onUndoSkip,
}: HeroCardProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence mode="wait">
      {skipped ? (
        /* ─── SKIPPED state ─── */
        <motion.div
          key="skipped"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col gap-3"
        >
          <div className="mx-5 bg-card rounded-[18px] border border-border p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-skip" />
            <div className="absolute top-4 right-4 text-center">
              <div className="font-display text-[28px] leading-none text-skip">
                {streak ?? 0}
              </div>
              <div className="text-[7px] text-ghost tracking-[1.5px] uppercase">
                Day Streak
              </div>
            </div>
            <div className="pt-1">
              <div className="text-[9px] tracking-[2px] text-skip uppercase mb-1">
                Today
              </div>
              <div className="font-display text-[36px] leading-[0.93] tracking-[2px] text-skip mb-2 pr-16 truncate">
                SKIPPED<br />TODAY.
              </div>
              <p className="text-[12px] text-ghost leading-relaxed mb-4 max-w-[300px]">
                Rest up. You're back at it tomorrow. Recovery is part of the process.
              </p>
              <button
                onClick={onUndoSkip || undefined}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-raised border border-border text-[11px] font-semibold text-dim hover:text-white hover:border-skip/40 transition-colors cursor-pointer uppercase tracking-[1px]"
              >
                <RotateCcw size={12} className="text-skip" />
                <span>Undo Skip</span>
              </button>
            </div>
          </div>

          {/* ── Standalone Up Next Themed Preview Card (on Skipped) ── */}
          <div className="mx-5 bg-card rounded-[18px] border border-border p-[15px_18px] relative overflow-hidden flex items-center justify-between">
            {/* Left 3.5px accent line */}
            <div className="absolute top-0 bottom-0 left-0 w-[3.5px] bg-[#38bdf8]" />

            <div className="flex-1 min-w-0 pr-3 pt-0.5 pl-1.5">
              <div className="text-[9px] tracking-[2px] uppercase font-semibold mb-1 text-[#38bdf8]">
                {tomorrowWorkout?.headerBadge || "UP NEXT"}
              </div>
              <div className="font-display text-[24px] text-white tracking-[1px] uppercase truncate leading-tight">
                {tomorrowWorkout ? tomorrowWorkout.name : "REST DAY"}
              </div>
              {tomorrowWorkout?.muscles ? (
                <div className="text-[11px] text-ghost mt-0.5 truncate leading-snug">
                  {tomorrowWorkout.muscles}
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      ) : !workoutDone ? (
        /* ─── PRE-WORKOUT state ─── */
        <motion.div
          key="pre"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={isRestDay ? "flex flex-col gap-3" : undefined}
        >
          {!hasActiveSplit ? (
            <div className="mx-5 bg-card rounded-[18px] border border-border p-6 relative overflow-hidden text-center shadow-lg">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-heat" />
              <div className="w-12 h-12 rounded-2xl bg-heat/10 border border-heat/25 text-heat flex items-center justify-center mx-auto mb-3 mt-1">
                <Dumbbell size={24} />
              </div>
              <div className="font-display text-[22px] text-white tracking-[1.5px] mb-2 uppercase">
                Welcome to IronLog
              </div>
              <div className="text-[12px] text-ghost leading-relaxed mb-6 px-2">
                Your journey starts here. Build your first workout split to begin tracking your progress.
              </div>
              <button
                onClick={onStartWorkout}
                className="tour-create-split block w-full py-[12px] bg-heat border-none rounded-xl text-white font-display text-[15px] tracking-[2px] cursor-pointer hover:opacity-90 transition-opacity"
              >
                CREATE SPLIT &nbsp;→
              </button>
            </div>
          ) : (
          <>
            <div className="mx-5 bg-card rounded-[18px] border border-border p-5 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-[3px] ${isRestDay ? "bg-skip" : "bg-heat"}`} />
              <div className="absolute top-4 right-4 text-center">
                <div className={`font-display text-[28px] leading-none ${isRestDay ? "text-skip" : "text-heat"}`}>
                  {streak ?? 0}
                </div>
                <div className="text-[7px] text-ghost tracking-[1.5px] uppercase">
                  Day Streak
                </div>
              </div>
              <div className="pt-1">
                <div className={`text-[9px] tracking-[2px] uppercase mb-1 ${isRestDay ? "text-skip font-semibold" : "text-ghost"}`}>
                  Today
                </div>
                <div className="font-display text-[36px] leading-[0.93] tracking-[2px] text-white uppercase pr-16 truncate mb-1.5">
                  {isRestDay ? "REST DAY" : (activeSplitDayName || "PLAN SPLIT")}
                </div>
                {isRestDay ? (
                  <div className="text-[11px] text-ghost mb-3">
                    Recovery is part of progress. Streak is protected today.
                  </div>
                ) : exerciseCount === 0 && (!inProgress || !setsLogged || setsLogged === 0) ? (
                  <div className="text-[11px] text-ghost mb-3">
                    No exercises configured
                  </div>
                ) : (
                  <div className="text-[11px] text-ghost mb-3">
                    <strong className="text-dim font-medium">
                      {activeSplitDayMuscles || "Workout in progress"}
                    </strong>{" "}
                    &nbsp;·&nbsp; {exerciseCount ?? 0} exercises
                  </div>
                )}
                {/* Week tracker */}
                <div className="flex justify-between mb-3">
                  {weekHistory ? (
                    weekHistory.map((d, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <WeekDot type={d.type} />
                        <span className={`text-[8px] tracking-[1px] uppercase ${
                          d.type === "today" ? (isRestDay ? "text-skip font-semibold" : "text-white") : d.type === "done" ? "text-dim" : "text-ghost"
                        }`}>
                          {d.label}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="h-[38px]" />
                  )}
                </div>
                
                {!isRestDay && (
                  exerciseCount === 0 && (!inProgress || !setsLogged || setsLogged === 0) ? (
                    <>
                      <p className="text-[12px] text-ghost text-center mb-3">
                        Head over to your split to add exercises or mark as rest.
                      </p>
                      <button
                        onClick={() => {
                          if (activeSplitId && activeSplitDayId) {
                            navigate(`/splits/${activeSplitId}/day/${activeSplitDayId}`);
                          } else {
                            navigate("/splits");
                          }
                        }}
                        className="block w-full py-[10px] bg-heat border-none rounded-xl text-white font-display text-[16px] tracking-[3px] cursor-pointer hover:opacity-90 transition-opacity uppercase text-center"
                      >
                        ADD EXERCISES
                      </button>
                      <button
                        type="button"
                        onClick={activeSplitDayName ? (onSkipToday || undefined) : undefined}
                        className={`block w-full mt-2.5 py-[9px] bg-transparent border border-border rounded-xl text-dim hover:text-white hover:border-zinc-700 transition-colors font-display text-[14px] tracking-[2px] uppercase text-center cursor-pointer ${activeSplitDayName ? '' : 'opacity-0 pointer-events-none'}`}
                      >
                        SKIP TODAY
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={onStartWorkout}
                        className="block w-full py-[10px] bg-heat border-none rounded-xl text-white font-display text-[16px] tracking-[3px] cursor-pointer hover:opacity-90 transition-opacity uppercase text-center"
                      >
                        {inProgress ? "RESUME WORKOUT \u00a0\u2192" : activeSplitDayName ? "START WORKOUT \u00a0\u2192" : "CREATE SPLIT \u00a0\u2192"}
                      </button>
                      <button
                        type="button"
                        onClick={activeSplitDayName ? (onSkipToday || undefined) : undefined}
                        className={`block w-full mt-2.5 py-[9px] bg-transparent border border-border rounded-xl text-dim hover:text-white hover:border-zinc-700 transition-colors font-display text-[14px] tracking-[2px] uppercase text-center cursor-pointer ${activeSplitDayName ? '' : 'opacity-0 pointer-events-none'}`}
                      >
                        SKIP TODAY
                      </button>
                    </>
                  )
                )}
              </div>
            </div>

            {/* ── Standalone Up Next Themed Preview Card (on Rest Day) ── */}
            {isRestDay && (
              <div className="mx-5 bg-card rounded-[18px] border border-border p-[15px_18px] relative overflow-hidden flex items-center justify-between">
                {/* Left 3.5px accent line */}
                <div className="absolute top-0 bottom-0 left-0 w-[3.5px] bg-[#38bdf8]" />

                <div className="flex-1 min-w-0 pr-3 pt-0.5 pl-1.5">
                  <div className="text-[9px] tracking-[2px] uppercase font-semibold mb-1 text-[#38bdf8]">
                    {tomorrowWorkout?.headerBadge || "UP NEXT"}
                  </div>
                  <div className="font-display text-[24px] text-white tracking-[1px] uppercase truncate leading-tight">
                    {tomorrowWorkout ? tomorrowWorkout.name : "REST DAY"}
                  </div>
                  {tomorrowWorkout?.muscles ? (
                    <div className="text-[11px] text-ghost mt-0.5 truncate leading-snug">
                      {tomorrowWorkout.muscles}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </>
          )}
        </motion.div>
      ) : (
        /* ─── POST-WORKOUT state ─── */
        <motion.div
          key="post"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col gap-3"
        >
          <div className="mx-5 bg-card rounded-[18px] border border-border p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-done" />
            <div className="absolute top-4 right-4 text-center">
              <div className="font-display text-[28px] leading-none text-done">
                {streak ?? 0}
              </div>
              <div className="text-[7px] text-ghost tracking-[1.5px] uppercase">
                Day Streak
              </div>
            </div>
            <div className="pt-1">
              <div className="text-[9px] tracking-[2px] text-done uppercase mb-1">
                Completed · Today
              </div>
              <div className="font-display text-[36px] leading-[0.93] tracking-[2px] text-white mb-3 uppercase pr-16 truncate">
                {activeSplitDayName || "WORKOUT"}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-bg rounded-[10px] p-[10px_12px]">
                  <div className="font-display text-2xl leading-none text-white tracking-[1px]">
                    {setsLogged ?? 0}
                  </div>
                  <div className="text-[9px] text-ghost tracking-[1px] uppercase mt-0.5">
                    Sets logged
                  </div>
                </div>
                <div className="bg-bg rounded-[10px] p-[10px_12px]">
                  <div className="font-display text-2xl leading-none text-white tracking-[1px]">
                    {volumeKg ? volumeKg.toLocaleString() : 0}
                  </div>
                  <div className="text-[9px] text-ghost tracking-[1px] uppercase mt-0.5">
                    kg volume
                  </div>
                </div>
              </div>
              <div className="text-[9px] tracking-[2px] text-ghost uppercase mb-1.5">
                New PRs
              </div>
              {newPRs && newPRs.length > 0 ? (
                <div className="max-h-[156px] overflow-y-auto subtle-scrollbar pr-1 flex flex-col gap-1.5">
                  {newPRs.map((pr) => (
                    <div
                      key={pr.name}
                      className="bg-bg rounded-[10px] py-[8px] pl-3 pr-[10px] flex items-center justify-between"
                    >
                      <span className="text-[12px] text-dim">{pr.name}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[8px] tracking-[1px] text-heat uppercase">PR</span>
                        <span className="font-display text-lg text-heat tracking-[1px]">
                          {pr.kg} kg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-ghost italic mb-2">
                  No PRs logged in today's session.
                </div>
              )}

              <button
                onClick={onStartWorkout}
                className="mt-4 block w-full py-[11px] bg-[#1a1a1c] border border-[#333] rounded-xl text-[#ccc] font-display text-[14px] tracking-[2px] cursor-pointer hover:bg-[#252528] hover:text-white transition-colors uppercase text-center"
              >
                VIEW SESSION &nbsp;→
              </button>
            </div>
          </div>

          {/* ── Standalone Up Next Themed Preview Card ── */}
          <div className="mx-5 bg-card rounded-[18px] border border-border p-[15px_18px] relative overflow-hidden flex items-center justify-between">
            {/* Left 3.5px accent line */}
            <div className="absolute top-0 bottom-0 left-0 w-[3.5px] bg-[#38bdf8]" />

            <div className="flex-1 min-w-0 pr-3 pt-0.5 pl-1.5">
              <div className="text-[9px] tracking-[2px] uppercase font-semibold mb-1 text-[#38bdf8]">
                {tomorrowWorkout?.headerBadge || "UP NEXT"}
              </div>
              <div className="font-display text-[24px] text-white tracking-[1px] uppercase truncate leading-tight">
                {tomorrowWorkout ? tomorrowWorkout.name : "REST DAY"}
              </div>
              {tomorrowWorkout?.muscles ? (
                <div className="text-[11px] text-ghost mt-0.5 truncate leading-snug">
                  {tomorrowWorkout.muscles}
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

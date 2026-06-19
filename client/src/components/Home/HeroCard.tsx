import React from "react";
import { motion, AnimatePresence } from "motion/react";
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
  tomorrowWorkout: { name: string; muscles: string; exercisesCount: number } | null;
  isRestDay?: boolean;
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
  onStartWorkout,
  onSkipToday,
  onUndoSkip,
}: HeroCardProps) {
  return (
    <AnimatePresence mode="wait">
      {skipped ? (
        /* ─── SKIPPED state ─── */
        <motion.div
          key="skipped"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
                Today · {activeSplitDayName || "Rest Day"}
              </div>
              <div className="font-display text-[36px] leading-[0.93] tracking-[2px] text-skip mb-3 pr-16 truncate">
                SKIPPED<br />TODAY.
              </div>
              <div className="bg-bg rounded-[10px] p-[10px_13px] mb-3 border border-raised">
                <div className="text-[12px] font-semibold text-dim mb-0.5">
                  Today's session skipped.
                </div>
                <div className="text-[11px] text-ghost leading-[1.55]">
                  Rest up — you're back at it tomorrow. Recovery is part of the process.
                </div>
                <button
                  onClick={onUndoSkip || undefined}
                  className="text-[11px] text-skip bg-none border-none cursor-pointer underline underline-offset-2 inline-block mt-1.5 p-0"
                >
                  Undo skip →
                </button>
              </div>
              <div className="pt-3 border-t border-raised">
                <div className="text-[9px] tracking-[2px] text-ghost uppercase mb-0.5">
                  Tomorrow
                </div>
                <div className="font-display text-[22px] text-dim tracking-[1px] uppercase">
                  {tomorrowWorkout ? tomorrowWorkout.name : "REST DAY"}
                </div>
                <div className="text-[11px] text-ghost mt-0.5">
                  {tomorrowWorkout
                    ? `${tomorrowWorkout.muscles} · ${tomorrowWorkout.exercisesCount} exercises`
                    : "Take it easy."}
                </div>
              </div>
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
        >
          <div className="mx-5 bg-card rounded-[18px] border border-border p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-heat" />
            <div className="absolute top-4 right-4 text-center">
              <div className="font-display text-[28px] leading-none text-heat">
                {streak ?? 0}
              </div>
              <div className="text-[7px] text-ghost tracking-[1.5px] uppercase">
                Day Streak
              </div>
            </div>
            <div className="pt-1">
              <div className="text-[9px] tracking-[2px] text-ghost uppercase mb-1">
                Today · {activeSplitDayName || "Workout Plan"}
              </div>
              <div className="font-display text-[36px] leading-[0.93] tracking-[2px] text-white mb-1.5 uppercase pr-16 truncate">
                {activeSplitDayName || "PLAN SPLIT"}
              </div>
              <div className="text-[11px] text-ghost mb-3">
                <strong className="text-dim font-medium">
                  {activeSplitDayMuscles || "No training days scheduled"}
                </strong>{" "}
                &nbsp;·&nbsp; {exerciseCount ?? 0} exercises
              </div>
              {/* Week tracker */}
              <div className="flex justify-between mb-3">
                {weekHistory ? (
                  weekHistory.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <WeekDot type={d.type} />
                      <span className={`text-[8px] tracking-[1px] uppercase ${
                        d.type === "today" ? "text-white" : d.type === "done" ? "text-dim" : "text-ghost"
                      }`}>
                        {d.label}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="h-[38px]" />
                )}
              </div>
              
              {isRestDay ? (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 text-center mt-3">
                  <div className="text-[24px] mb-2">🔋</div>
                  <p className="text-[13px] text-white font-medium mb-1">
                    Scheduled Rest Day
                  </p>
                  <p className="text-[11px] text-[#666] leading-relaxed">
                    Take time to recover. Your streak is protected today.
                  </p>
                </div>
              ) : exerciseCount === 0 ? (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 text-center mt-3">
                  <div className="text-[20px] mb-2">📋</div>
                  <p className="text-[12px] text-ghost leading-relaxed mb-3">
                    No exercises added to this training day yet.
                  </p>
                  <p className="text-[11px] text-[#555] leading-relaxed">
                    Head over to your split to add exercises or explicitly mark this day as a Rest Day.
                  </p>
                </div>
              ) : (
                <button
                  onClick={onStartWorkout}
                  className="block w-full py-[10px] bg-heat border-none rounded-xl text-white font-display text-[16px] tracking-[3px] cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {inProgress ? "RESUME WORKOUT \u00a0\u2192" : activeSplitDayName ? "START WORKOUT \u00a0\u2192" : "CREATE SPLIT \u00a0\u2192"}
                </button>
              )}

              {!isRestDay && (
                <div
                  onClick={activeSplitDayName ? (onSkipToday || undefined) : undefined}
                  className={`text-center mt-2.5 text-[12px] text-ghost tracking-[0.3px] transition-colors ${activeSplitDayName ? 'cursor-pointer hover:text-white' : 'opacity-0 pointer-events-none'}`}
                >
                  skip today
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        /* ─── POST-WORKOUT state ─── */
        <motion.div
          key="post"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
                newPRs.map((pr) => (
                  <div key={pr.name} className="bg-bg rounded-[10px] p-[9px_12px] mb-1.5 flex items-center justify-between">
                    <span className="text-[12px] text-dim">{pr.name}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[8px] tracking-[1px] text-heat uppercase">PR</span>
                      <span className="font-display text-lg text-heat tracking-[1px]">{pr.kg} kg</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-ghost italic mb-2">
                  No PRs logged in today's session.
                </div>
              )}
              <button
                onClick={onUndoSkip || undefined}
                className="w-full mt-1 mb-2 py-2 border border-heat/30 text-heat rounded-[10px] text-[11px] font-semibold tracking-wide uppercase hover:bg-heat/10 transition-colors"
              >
                TEMP: Reset Session
              </button>
              <div className="mt-3 pt-3 border-t border-raised">
                <div className="text-[9px] tracking-[2px] text-ghost uppercase mb-0.5">
                  Tomorrow
                </div>
                <div className="font-display text-[22px] text-white tracking-[1px] uppercase">
                  {tomorrowWorkout ? tomorrowWorkout.name : "REST DAY"}
                </div>
                <div className="text-[11px] text-ghost mt-0.5">
                  {tomorrowWorkout
                    ? `${tomorrowWorkout.muscles} · ${tomorrowWorkout.exercisesCount} exercises`
                    : "Take it easy."}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

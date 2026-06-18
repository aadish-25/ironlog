import React from "react";
import { Sparkles } from "lucide-react";

interface CoachNudgeProps {
  skipped: boolean | null;
  workoutDone: boolean | null;
  coachNudge: string | null;
}

export function CoachNudge({ skipped, workoutDone, coachNudge }: CoachNudgeProps) {
  if (skipped) return null;

  return (
    <div
      className={`mx-5 mt-3 bg-bg border-l-2 rounded-r-[10px] p-[12px_14px] flex items-start gap-2.5 ${
        workoutDone ? "border-done" : "border-heat"
      }`}
    >
      <div className="w-6 h-6 rounded-md bg-raised border border-border flex items-center justify-center shrink-0 mt-0.25">
        <Sparkles size={12} className={workoutDone ? "text-done" : "text-heat"} />
      </div>
      <p className="text-[12.5px] text-dim leading-[1.55] m-0">
        {coachNudge ? (
          <span>{coachNudge}</span>
        ) : workoutDone ? (
          <>
            <strong className="text-ghost font-semibold">Solid session.</strong>{" "}
            Your lifts are logged successfully. Rest well tonight.
          </>
        ) : (
          <>
            <strong className="text-ghost font-semibold">Get ready.</strong>{" "}
            Consult your exercises list and prepare for your lifts today.
          </>
        )}
      </p>
    </div>
  );
}

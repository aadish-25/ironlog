import { Check } from "lucide-react";
import type { SessionExercise } from "./ExerciseView";

interface CompletionScreenProps {
  exercises: SessionExercise[];
  onComplete: () => void;
  onBackToWorkout: () => void;
}

// ─── Mock PREV_BEST Data ───────────────────────────────────────────────────
// This should ideally come from backend logic when integrating, 
// for now we'll mock PR calculation to match the reference design structure.
const PREV_BEST: Record<string, string> = {
  "Bench Press": "100 kg × 8",
  "Incline DB Press": "28 kg × 10",
  "Cable Fly": "14 kg × 12",
  "Overhead Press": "57.5 kg × 8",
  "Lateral Raises": "11 kg × 15",
  "Front Raises": "9 kg × 12",
  "Tricep Pushdown": "22.5 kg × 12",
  "Skull Crushers": "27.5 kg × 10",
};

function parsePrevKg(s: string): number {
  const m = s.match(/^([\d.]+)/);
  return m ? parseFloat(m[1]) : 0;
}

export function CompletionScreen({
  exercises,
  onComplete,
  onBackToWorkout,
}: CompletionScreenProps) {
  // Compute totals
  const totalSetsLogged = exercises.reduce(
    (n, e) => n + e.sets.filter((s) => s.logged).length,
    0
  );
  const totalVolume = exercises.reduce(
    (n, e) =>
      n +
      e.sets
        .filter((s) => s.logged)
        .reduce((m, s) => m + s.weight * s.reps, 0),
    0
  );

  // Compute PRs (mock logic)
  const prMap: Record<string, number> = {};
  for (const ex of exercises) {
    const prev = PREV_BEST[ex.name];
    if (!prev) continue;
    const prevKg = parsePrevKg(prev);
    const maxLogged = Math.max(
      ...ex.sets.filter((s) => s.logged).map((s) => s.weight),
      0
    );
    if (maxLogged > prevKg) prMap[ex.name] = maxLogged;
  }
  const prs = Object.entries(prMap).map(([name, kg]) => ({ name, kg }));

  return (
    <div className="min-h-screen bg-bg text-ink font-body p-[52px_20px_120px] flex flex-col">
      <div className="flex-1 flex flex-col justify-center">
        {/* Header Icon & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0a1a0a] rounded-full mx-auto mb-4 flex items-center justify-center border border-[#143314]">
            <Check size={32} className="text-done" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-[44px] text-white tracking-[2px] leading-none mb-2">
            SESSION
            <br />
            COMPLETE
          </h1>
          <p className="text-[13px] text-ghost m-0">
            You crushed it today. Rest up.
          </p>
        </div>

        {/* Stats card */}
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-[24px_20px] mb-6">
          <div className="flex">
            <div className="flex-1 border-r border-[#222]">
              <div className="font-display text-[32px] text-white tracking-[1px] leading-none mb-1">
                {totalSetsLogged}
              </div>
              <div className="text-[10px] tracking-[1.5px] text-[#666] uppercase">
                Sets logged
              </div>
            </div>
            <div className="flex-1 pl-5">
              <div className="font-display text-[32px] text-white tracking-[1px] leading-none mb-1">
                {totalVolume.toLocaleString()}
              </div>
              <div className="text-[10px] tracking-[1.5px] text-[#666] uppercase">
                Kg Volume
              </div>
            </div>
          </div>

          {prs.length > 0 && (
            <div className="mt-6 pt-5 border-t border-[#222]">
              <div className="text-[10px] tracking-[1.5px] text-[#666] uppercase mb-3">
                New Personal Records
              </div>
              {prs.map((pr) => (
                <div
                  key={pr.name}
                  className="flex items-center justify-between bg-raised p-[12px_14px] rounded-[10px] mb-2"
                >
                  <span className="text-[13px] text-white">{pr.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-heat tracking-[1px] bg-[#2a1a0d] p-[2px_6px] rounded font-semibold uppercase">
                      PR
                    </span>
                    <span className="font-display text-lg text-heat tracking-[1px]">
                      {pr.kg} kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={onComplete}
        className="w-full p-4 bg-heat border-none rounded-xl text-white font-display text-lg tracking-[1.5px] cursor-pointer mb-3 transition-opacity hover:opacity-90"
      >
        FINISH & RETURN
      </button>
      <button
        onClick={onBackToWorkout}
        className="w-full p-4 bg-transparent border border-[#2a2a2a] rounded-xl text-dim font-display text-base tracking-[1.5px] cursor-pointer transition-colors hover:bg-raised/50"
      >
        BACK TO WORKOUT
      </button>
    </div>
  );
}

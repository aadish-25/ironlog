import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Zap, Eye } from "lucide-react";
import { useProfile } from "../../hooks/useProfile";
import type { SessionExercise } from "../../types";

interface CompletionScreenProps {
  splitDayName?: string | null;
  exercises: SessionExercise[];
  onComplete: () => void;
  onBackToWorkout: () => void;
}

const MOTIVATIONAL_MESSAGES = [
  "Consistency is the magic bullet. Great work today.",
  "Another day, another step closer to your goals.",
  "You're building the foundation. Rest up and recover.",
  "Discipline over motivation. Way to show up today.",
  "The only bad workout is the one that didn't happen.",
];

export function CompletionScreen({
  splitDayName,
  exercises,
  onComplete,
  onBackToWorkout,
}: CompletionScreenProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { stats } = useProfile();
  const streak = Math.max(1, stats?.currentStreak ?? 1);
  const [motivation] = useState(() => MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]);

  // Compute totals
  const safeExercises = exercises || [];
  const totalSetsLogged = safeExercises.reduce(
    (n, e) => n + (e.sets || []).filter((s) => s.is_logged).length,
    0
  );
  const totalVolume = safeExercises.reduce(
    (n, e) =>
      n +
      (e.sets || [])
        .filter((s) => s.is_logged)
        .reduce((m, s) => m + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0),
    0
  );

  // Compute PRs dynamically
  const prMap: Record<string, number> = {};
  for (const ex of safeExercises) {
    const prSets = (ex.sets || []).filter((s) => s.is_logged && s.pr_hit);
    if (prSets.length > 0) {
      const maxLogged = Math.max(...prSets.map((s) => Number(s.weight) || 0));
      prMap[ex.name] = maxLogged;
    }
  }
  const prs = Object.entries(prMap).map(([name, kg]) => ({ name, kg }));

  return (
    <div className="min-h-screen bg-bg text-ink font-body p-[20px_18px_24px] flex flex-col justify-between overflow-y-auto no-scrollbar">
      <div>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start mb-5 relative mt-1"
        >
          <div className="flex flex-col relative z-10 flex-1">
            <span className="text-[10px] tracking-[2px] text-[#c55f26] uppercase font-semibold mb-1.5">
              Session Complete
            </span>
            <h1 className="font-display text-[46px] text-white tracking-[1px] leading-[0.85] m-0">
              {splitDayName ? splitDayName.toUpperCase() : "WORKOUT"}
            </h1>
            <h1 className="font-display text-[46px] text-heat tracking-[1px] leading-[0.85] m-0">
              COMPLETE.
            </h1>
            <p className="text-[12px] text-[#aaa] mt-2 mb-0 leading-[1.4] font-medium tracking-[0.3px]">
              {motivation}
            </p>
            {/* View Session Pill placed organically in header */}
            <button
              onClick={onBackToWorkout}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e1e20] border border-[#333] text-[11px] text-zinc-300 font-medium hover:text-white hover:bg-[#28282b] transition-colors cursor-pointer w-fit"
            >
              <Eye size={12} className="text-[#c55f26]" />
              <span>View Session Details</span>
            </button>
          </div>
          <Zap size={22} className="text-[#c55f26] opacity-80 absolute top-0 right-0 mt-[-2px]" />
        </motion.div>

        {/* Streak Box - compact padding */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#33221a] to-[#241710] border border-[#6b351d] rounded-xl p-[10px_16px] mb-3.5 flex items-center gap-3 shadow-md"
        >
          <span className="text-[22px]">🔥</span>
          <div className="flex flex-col">
            <span className="font-display text-[22px] text-white tracking-[1px] leading-none mb-0.5">
              {streak} {streak === 1 ? 'DAY' : 'DAYS'}
            </span>
            <span className="text-[11px] text-[#888]">
              Streak continues - {streak} in a row
            </span>
          </div>
        </motion.div>

        {/* Stats row - compact padding */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2.5 mb-4"
        >
          <div className="flex-1 bg-[#28282b] border border-[#444448] rounded-xl p-[10px_14px] flex flex-col shadow-sm">
            <span className="font-display text-[28px] text-white tracking-[1px] leading-none mb-0.5">
              {totalSetsLogged}
            </span>
            <span className="text-[9px] tracking-[1.5px] text-[#999] uppercase font-semibold">
              Sets Logged
            </span>
          </div>
          <div className="flex-1 bg-[#28282b] border border-[#444448] rounded-xl p-[10px_14px] flex flex-col shadow-sm">
            <span className="font-display text-[28px] text-white tracking-[1px] leading-none mb-0.5">
              {totalVolume.toLocaleString()}
            </span>
            <span className="text-[9px] tracking-[1.5px] text-[#999] uppercase font-semibold">
              Kg Volume
            </span>
          </div>
        </motion.div>

        {/* PRs Section - uniform row spacing */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-5"
        >
          <span className="text-[10px] tracking-[1.5px] text-[#888] uppercase font-semibold mb-2 block">
            New PRs This Session
          </span>
          
          {prs.length > 0 ? (
            <div className="bg-gradient-to-b from-[#2a1b14] to-[#1c120c] border border-[#5c2b17] rounded-xl px-4 py-1 shadow-md divide-y divide-[#3a1a0c]">
              {prs.map((pr) => (
                <div
                  key={pr.name}
                  className="flex items-center justify-between py-2.5"
                >
                  <span className="text-[13px] text-[#eee] font-medium tracking-[0.3px]">{pr.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-heat tracking-[1px] border border-heat/30 bg-[#2a1a0d] p-[1px_5px] rounded font-semibold uppercase">
                      PR
                    </span>
                    <span className="font-display text-[22px] text-heat tracking-[1px]">
                      {pr.kg} KG
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#28282b] rounded-xl p-[12px] text-center border border-[#444448]">
               <span className="text-[12px] text-[#aaa]">No new PRs this session. Keep pushing!</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Pinned Back to Home Action */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pt-2"
      >
        <button
          onClick={onComplete}
          className="w-full h-[48px] bg-heat border-none rounded-xl text-white font-display text-[18px] tracking-[1.5px] cursor-pointer transition-opacity hover:opacity-90 flex items-center justify-center font-bold shadow-lg shadow-heat/20"
        >
          BACK TO HOME
        </button>
      </motion.div>
    </div>
  );
}

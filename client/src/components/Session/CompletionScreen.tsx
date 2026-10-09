import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Zap } from "lucide-react";
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
    <div className="min-h-screen bg-bg text-ink font-body p-[24px_20px_32px] flex flex-col overflow-y-auto no-scrollbar">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start mb-6 relative mt-2"
      >
        <div className="flex flex-col relative z-10">
          <span className="text-[10px] tracking-[2px] text-[#c55f26] uppercase font-semibold mb-2">
            Session Complete
          </span>
          <h1 className="font-display text-[52px] text-white tracking-[1px] leading-[0.85] m-0">
            {splitDayName ? splitDayName.toUpperCase() : "WORKOUT"}
          </h1>
          <h1 className="font-display text-[52px] text-heat tracking-[1px] leading-[0.85] m-0">
            COMPLETE.
          </h1>
          <p className="text-[13px] text-[#aaa] mt-2 mb-0 leading-[1.5] font-medium tracking-[0.5px]">
            {motivation}
          </p>
        </div>
        <Zap size={24} className="text-[#c55f26] opacity-80 absolute top-0 right-0 mt-[-4px]" />
      </motion.div>

      {/* Streak Box */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-[#33221a] to-[#241710] border border-[#6b351d] rounded-2xl p-[14px_18px] mb-5 flex items-center gap-4 shadow-lg"
      >
        <span className="text-[26px]">🔥</span>
        <div className="flex flex-col">
          <span className="font-display text-[26px] text-white tracking-[1px] leading-none mb-1">
            {streak} {streak === 1 ? 'DAY' : 'DAYS'}
          </span>
          <span className="text-[11px] text-[#888]">
            Streak continues - {streak} in a row
          </span>
        </div>
      </motion.div>

      {/* Stats row - reduced padding and height */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3 mb-6"
      >
        <div className="flex-1 bg-[#28282b] border border-[#444448] rounded-2xl p-[14px_16px] flex flex-col shadow-md">
          <span className="font-display text-[32px] text-white tracking-[1px] leading-none mb-1">
            {totalSetsLogged}
          </span>
          <span className="text-[10px] tracking-[1.5px] text-[#999] uppercase font-semibold">
            Sets Logged
          </span>
        </div>
        <div className="flex-1 bg-[#28282b] border border-[#444448] rounded-2xl p-[14px_16px] flex flex-col shadow-md">
          <span className="font-display text-[32px] text-white tracking-[1px] leading-none mb-1">
            {totalVolume.toLocaleString()}
          </span>
          <span className="text-[10px] tracking-[1.5px] text-[#999] uppercase font-semibold">
            Kg Volume
          </span>
        </div>
      </motion.div>

      {/* PRs Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <span className="text-[10px] tracking-[1.5px] text-[#888] uppercase font-semibold mb-3 block">
          New PRs This Session
        </span>
        
        {prs.length > 0 ? (
          <div className="bg-gradient-to-b from-[#2a1b14] to-[#1c120c] border border-[#5c2b17] rounded-2xl p-[16px_18px] shadow-lg">
            {prs.map((pr, i) => (
              <div
                key={pr.name}
                className={`flex items-center justify-between pb-3 mb-3 ${
                  i < prs.length - 1 ? "border-b border-[#33180b]" : ""
                }`}
              >
                <span className="text-[14px] text-[#eee] font-medium tracking-[0.5px]">{pr.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-heat tracking-[1px] border border-heat/30 bg-[#2a1a0d] p-[2px_6px] rounded font-semibold uppercase">
                    PR
                  </span>
                  <span className="font-display text-[26px] text-heat tracking-[1px]">
                    {pr.kg} KG
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#28282b] rounded-2xl p-[16px] text-center border border-[#444448] shadow-md">
             <span className="text-[13px] text-[#aaa]">No new PRs this session. Keep pushing!</span>
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-auto flex flex-col gap-3 pt-4"
      >
        <button
          onClick={onComplete}
          className="w-full h-[56px] bg-heat border-none rounded-xl text-white font-display text-[20px] tracking-[1.5px] cursor-pointer transition-opacity hover:opacity-90 flex items-center justify-center font-bold"
        >
          BACK TO HOME
        </button>
        <button
          onClick={onBackToWorkout}
          className="w-full h-[56px] bg-transparent border border-[#444] rounded-xl text-[#ccc] font-display text-[20px] tracking-[1.5px] cursor-pointer transition-colors hover:bg-[#2a2a2a] flex items-center justify-center font-bold"
        >
          VIEW SESSION
        </button>
      </motion.div>
    </div>
  );
}

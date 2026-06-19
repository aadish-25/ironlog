import React from "react";

interface QuickStatsProps {
  lifetimeStats?: {
    sessions: number;
    prsHit: number;
    daysActive: number;
  };
}

export function QuickStats({ lifetimeStats }: QuickStatsProps) {
  return (
    <div className="mx-5 mt-4">
      <div className="text-[9px] tracking-[2px] text-ghost uppercase mb-2">
        Your Lifetime
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card rounded-[12px] border border-border p-3 text-center">
          <div className="font-display text-[22px] leading-none text-white tracking-[1px]">
            {lifetimeStats ? lifetimeStats.daysActive : "--"}
          </div>
          <div className="text-[8px] text-ghost tracking-[1px] uppercase mt-1">
            Days Active
          </div>
        </div>
        <div className="bg-card rounded-[12px] border border-border p-3 text-center">
          <div className="font-display text-[22px] leading-none text-heat tracking-[1px]">
            {lifetimeStats ? lifetimeStats.sessions : "--"}
          </div>
          <div className="text-[8px] text-ghost tracking-[1px] uppercase mt-1">
            Sessions
          </div>
        </div>
        <div className="bg-card rounded-[12px] border border-border p-3 text-center">
          <div className="font-display text-[22px] leading-none text-done tracking-[1px]">
            {lifetimeStats ? lifetimeStats.prsHit : "--"}
          </div>
          <div className="text-[8px] text-ghost tracking-[1px] uppercase mt-1">
            PRs Hit
          </div>
        </div>
      </div>
    </div>
  );
}

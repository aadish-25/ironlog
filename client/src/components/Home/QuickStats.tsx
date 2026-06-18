import React from "react";

// For now, these use placeholder values like in the original page.
// These could be passed as props later when actual API data is wired up.
export function QuickStats() {
  return (
    <div className="mx-5 mt-4">
      <div className="text-[9px] tracking-[2px] text-ghost uppercase mb-2">
        Your Lifetime
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card rounded-[12px] border border-border p-3 text-center">
          <div className="font-display text-[22px] leading-none text-white tracking-[1px]">
            --
          </div>
          <div className="text-[8px] text-ghost tracking-[1px] uppercase mt-1">
            Days Active
          </div>
        </div>
        <div className="bg-card rounded-[12px] border border-border p-3 text-center">
          <div className="font-display text-[22px] leading-none text-heat tracking-[1px]">
            --
          </div>
          <div className="text-[8px] text-ghost tracking-[1px] uppercase mt-1">
            Sessions
          </div>
        </div>
        <div className="bg-card rounded-[12px] border border-border p-3 text-center">
          <div className="font-display text-[22px] leading-none text-done tracking-[1px]">
            --
          </div>
          <div className="text-[8px] text-ghost tracking-[1px] uppercase mt-1">
            PRs Hit
          </div>
        </div>
      </div>
    </div>
  );
}

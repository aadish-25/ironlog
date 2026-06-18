import type { StatCard } from "./types";

interface MonthlyStatsProps {
  stats: StatCard[];
}

export function MonthlyStats({ stats }: MonthlyStatsProps) {
  return (
    <div>
      <p className="text-[11px] font-display tracking-[2.5px] text-ghost uppercase mb-2">
        This Month
      </p>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl p-[14px_12px] text-center border border-border"
          >
            <div className="text-lg mb-1.5" aria-hidden="true">
              {stat.icon}
            </div>
            <div className="font-display text-[28px] text-white tracking-[1px] leading-none">
              {stat.value}
            </div>
            <div className="text-[10px] text-ghost mt-1 uppercase tracking-[1px]">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

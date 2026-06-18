import { TrendingUp } from "lucide-react";
import type { MonthSummary as MonthSummaryType } from "./types";

interface MonthSummaryProps {
  summary: MonthSummaryType | null;
}

export function MonthSummary({ summary }: MonthSummaryProps) {
  return (
    <div className="bg-card border-[1.5px] border-border rounded p-[18px_20px]">
      <p className="text-[10px] tracking-[2px] text-ghost uppercase mb-4">
        {summary?.label ?? "This Month"}
      </p>

      <div className="flex">
        {/* Sessions count */}
        <div className="flex-1 pr-5 border-r border-border text-left">
          <div className="text-2xl font-extrabold leading-none tabular-nums">
            {summary?.sessions ?? 0}
          </div>
          <div className="text-[9px] tracking-[2px] text-ghost uppercase mt-1.5">
            Sessions
          </div>
        </div>

        {/* Total volume */}
        <div className="flex-1 pl-5 text-right">
          <div className="text-2xl font-extrabold leading-none tabular-nums">
            {summary?.totalVolumeKg
              ? `${summary.totalVolumeKg.toLocaleString()} kg`
              : "0 kg"}
          </div>
          <div className="text-[9px] tracking-[2px] text-ghost uppercase mt-1.5">
            Total volume
          </div>
        </div>
      </div>

      {/* Month-over-month comparison */}
      {summary?.comparisonText && (
        <div className="flex items-center gap-[5px] mt-4 pt-3.5 border-t border-border">
          <TrendingUp size={11} className="text-heat" strokeWidth={2} />
          <span className="text-[11px] text-heat">
            {summary.comparisonText}
          </span>
        </div>
      )}
    </div>
  );
}

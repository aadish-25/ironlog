import type { Split } from "./types";
import { DayPips } from "./DayPips";

interface ActiveSplitCardProps {
  split: Split;
  onSelectSplit: (split: Split) => void;
}

export function ActiveSplitCard({ split, onSelectSplit }: ActiveSplitCardProps) {
  return (
    <>
      <p className="text-[10px] tracking-[2px] text-ghost/50 uppercase px-5 mb-2">
        Active
      </p>
      <article
        onClick={() => onSelectSplit(split)}
        className="mx-5 mb-2.5 bg-[#0d1f0d] rounded-[14px] border border-done p-[16px_18px] cursor-pointer relative overflow-hidden hover:bg-[#0f230f] transition-colors"
        role="button"
        tabIndex={0}
        aria-label={`Active split: ${split.name}`}
      >
        {/* Green top strip */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-done" />

        <div className="flex items-center justify-between mb-1.5">
          <span className="font-display text-[22px] tracking-[1.5px] text-white">
            {split.name}
          </span>
          <span className="text-[9px] text-done tracking-[1.5px] uppercase bg-[#0d2a0d] px-2 py-0.75 rounded border border-[#1a4a1a]">
            ● ACTIVE
          </span>
        </div>

        <p className="text-xs text-ghost">
          {split.days.filter((d) => !d.is_rest).length} training days ·{" "}
          {split.days.filter((d) => d.is_rest).length} rest day
          {split.days.filter((d) => d.is_rest).length !== 1 ? "s" : ""}
        </p>

        <DayPips days={split.days} />
      </article>
    </>
  );
}

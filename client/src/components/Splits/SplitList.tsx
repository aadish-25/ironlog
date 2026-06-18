import type { Split } from "./types";
import { DayPips } from "./DayPips";

interface SplitListProps {
  splits: Split[];
  onSelectSplit: (split: Split) => void;
  onActivateSplit: (split: Split) => void;
  hasActiveSplit?: boolean;
}

export function SplitList({ splits, onSelectSplit, onActivateSplit, hasActiveSplit = false }: SplitListProps) {
  if (splits.length === 0 && !hasActiveSplit) {
    return (
      <div className="mx-5 mt-4 bg-[#111111] border border-dashed border-[#333333] rounded-[14px] p-8 flex flex-col items-center gap-3 text-center">
        <div className="text-[32px] opacity-50 grayscale">📋</div>
        <p className="text-[13px] text-[#666666] leading-relaxed">
          No splits created yet.
          <br />
          Tap <strong className="text-heat font-semibold">+ NEW</strong> to build your
          first training programme.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-[10px] tracking-[2px] text-ghost/50 uppercase px-5 pt-5 mb-2">
        Other Splits
      </p>
      {splits.map((split) => (
        <article
          key={split.id}
          onClick={() => onSelectSplit(split)}
          className="mx-5 mb-2.5 bg-card rounded-[14px] border border-border p-[16px_18px] cursor-pointer hover:bg-raised transition-colors"
          role="button"
          tabIndex={0}
          aria-label={`Split: ${split.name}`}
        >
          <h2 className="font-display text-[22px] tracking-[1.5px] text-white mb-1.5">
            {split.name}
          </h2>
          <p className="text-xs text-ghost">
            {split.days.filter((d) => d.type === "train").length} training
            days ·{" "}
            {split.days.filter((d) => d.type === "rest").length} rest days
          </p>
          <DayPips days={split.days} />
          <button
            onClick={(e) => { e.stopPropagation(); onActivateSplit(split); }}
            className="mt-3 text-[11px] tracking-[1.5px] uppercase text-done border border-done/40 bg-done/5 px-3 py-1.5 rounded-lg hover:bg-done/10 transition-colors"
          >
            Set as Active
          </button>
        </article>
      ))}
    </>
  );
}

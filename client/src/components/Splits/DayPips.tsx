import type { SplitDay } from "./types";

interface DayPipsProps {
  days: SplitDay[];
}

export function DayPips({ days }: DayPipsProps) {
  return (
    <div className="flex gap-[5px] mt-2.5" aria-label="Weekly day indicators">
      {days.map((day, idx) => (
        <div
          key={idx}
          className={`w-7 h-7 rounded-md flex items-center justify-center text-[9px] tracking-[0.5px] uppercase font-semibold ${
            day.type === "train"
              ? "bg-raised text-ghost"
              : "bg-[#141414] text-ghost/40"
          }`}
          aria-label={`${day.abbr} — ${day.type}`}
        >
          {day.abbr.slice(0, 1)}
        </div>
      ))}
    </div>
  );
}

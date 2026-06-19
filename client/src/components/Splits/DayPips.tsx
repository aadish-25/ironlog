import type { SplitDay } from "./types";

interface DayPipsProps {
  days: SplitDay[];
}

const DAY_ABBRS = ["M", "T", "W", "T", "F", "S", "S"];

export function DayPips({ days }: DayPipsProps) {
  return (
    <div className="flex gap-[5px] mt-2.5" aria-label="Weekly day indicators">
      {days.map((day, idx) => {
        const abbr = DAY_ABBRS[day.day_of_week] ?? "?";
        return (
          <div
            key={idx}
            className={`w-7 h-7 rounded-md flex items-center justify-center text-[9px] tracking-[0.5px] uppercase font-semibold ${
              !day.is_rest
                ? "bg-raised text-ghost"
                : "bg-[#141414] text-ghost/40"
            }`}
            aria-label={`${abbr} — ${day.is_rest ? "rest" : "train"}`}
          >
            {abbr}
          </div>
        );
      })}
    </div>
  );
}

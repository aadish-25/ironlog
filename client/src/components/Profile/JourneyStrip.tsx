interface JourneyStripProps {
  memberSince: string | null;
  daysSinceJoined: number | null;
}

export function JourneyStrip({ memberSince, daysSinceJoined }: JourneyStripProps) {
  return (
    <div className="bg-card rounded-[14px] p-4 border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-ghost">
          {memberSince ? `Day 1 · ${memberSince}` : "Day 1"}
        </span>
        <span className="text-[11px] text-heat font-medium">
          Today · Day {daysSinceJoined ?? 0}
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-raised rounded-sm mb-2.5 relative overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-heat to-heat rounded-sm"
          style={{ width: "100%" }}
          role="progressbar"
          aria-valuenow={daysSinceJoined ?? 0}
          aria-label="Journey progress"
        />
      </div>
      <p className="text-lg font-display tracking-[1px] text-white">
        {daysSinceJoined ?? 0} days of showing up.
      </p>
    </div>
  );
}

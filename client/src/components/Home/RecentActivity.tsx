import React from "react";

interface SessionData {
  day: string;
  date: string;
  sets: number;
  volume: string;
  pr: boolean;
}

interface RecentActivityProps {
  recentSessions: SessionData[] | null;
}

export function RecentActivity({ recentSessions }: RecentActivityProps) {
  return (
    <div className="mx-5 mt-4 mb-2">
      <div className="text-[9px] tracking-[2px] text-ghost uppercase mb-2">
        Recent Sessions
      </div>
      {!recentSessions || recentSessions.length === 0 ? (
        <div className="bg-card rounded-[10px] border border-dashed border-border px-3.5 py-4 text-center">
          <div className="text-[11px] text-ghost/50">
            No sessions logged yet. Start your first workout!
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {recentSessions.map((session, i) => (
            <div
              key={i}
              className="bg-card rounded-[10px] border border-border px-3.5 py-2.5 flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] text-dim font-medium truncate">
                    {session.day}
                  </span>
                  {session.pr && (
                    <span className="text-[7px] tracking-[1px] text-heat bg-heat/10 px-1.5 py-[1px] rounded uppercase font-semibold shrink-0">
                      PR
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-ghost tracking-[0.5px]">
                  {session.date}
                </span>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="font-display text-[15px] text-white tracking-[0.5px] leading-none">
                  {session.sets} sets
                </div>
                <div className="text-[9px] text-ghost mt-0.5">
                  {session.volume}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

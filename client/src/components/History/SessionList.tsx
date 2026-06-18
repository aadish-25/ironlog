import { ChevronDown } from "lucide-react";
import type { SessionSummary } from "./types";

interface SessionListProps {
  sessions: SessionSummary[];
  hasMore: boolean;
  onLoadMore: () => void;
}

export function SessionList({ sessions, hasMore, onLoadMore }: SessionListProps) {
  return (
    <div className="px-5">
      <p className="text-[10px] tracking-[2px] text-ghost uppercase mb-2.5">
        Recent Sessions
      </p>

      {sessions.length === 0 ? (
        <div className="bg-card border-[1.5px] border-border rounded-lg p-8 text-center">
          <p className="text-sm text-ghost">
            No sessions logged yet. Start a workout to see your history here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {sessions.map((session, idx) => (
            <article
              key={`${session.date}-${idx}`}
              className={`bg-card border-[1.5px] border-border p-[14px_16px] flex items-center gap-3 cursor-pointer hover:bg-raised transition-colors ${
                idx === 0
                  ? "rounded-t rounded-b-sm"
                  : idx === sessions.length - 1
                  ? "rounded-b rounded-t-sm"
                  : "rounded-sm"
              }`}
              role="button"
              tabIndex={0}
              aria-label={`${session.name} on ${session.date}`}
            >
              {/* Color indicator strip */}
              <div
                className="w-[3px] self-stretch rounded-sm shrink-0 bg-heat"
                aria-hidden="true"
              />

              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold truncate">
                  {session.name}
                </div>
                <div className="text-[11px] text-ghost mt-[3px]">
                  {session.date}
                </div>
              </div>

              <div className="text-[13px] font-semibold text-dim tabular-nums shrink-0">
                {session.volumeKg.toLocaleString()} kg
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <button
          onClick={onLoadMore}
          className="w-full mt-2.5 py-3 bg-transparent border-[1.5px] border-border rounded text-ghost text-[11px] font-semibold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-[5px] hover:text-dim transition-colors"
          aria-label="Load more sessions"
        >
          <ChevronDown size={13} strokeWidth={2} />
          Load More
        </button>
      )}
    </div>
  );
}

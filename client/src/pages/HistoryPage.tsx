import { MonthSummary as MonthSummaryComponent } from "../components/History/MonthSummary";
import { SessionList } from "../components/History/SessionList";
import type { MonthSummary, SessionSummary } from "../components/History/types";

// ─── Component ────────────────────────────────────────────────────────────────
export function HistoryPage() {
  // ─── MONTH SUMMARY ──────────────────────────────────────────────────────────
  // TODO: This component needs the current month's aggregated session stats.
  // Think about: which API endpoint returns monthly totals?
  // How do you compute total volume (SUM of weight_kg × reps across all sets)?
  // How do you get the comparison delta vs the previous month?
  const monthSummary: MonthSummary | null = null;

  // ─── SESSION LIST ───────────────────────────────────────────────────────────
  // TODO: This component needs a paginated list of recent workout sessions.
  // Think about: which endpoint returns sessions ordered by date descending?
  // Does pagination use offset/limit or cursor-based?
  const sessions: SessionSummary[] = [];

  // ─── PAGINATION ─────────────────────────────────────────────────────────────
  // TODO: This component needs to know if more sessions exist to load.
  // Think about: does the API return a `hasMore` flag or a total count?
  const hasMore = false;

  // TODO: Handle loading more sessions when the user clicks "Load More".
  // Think about: how do you append new results to the existing list?
  const handleLoadMore = () => {};

  return (
    <section
      className="min-h-screen bg-bg text-ink font-body"
      aria-label="Session history"
    >
      <div className="overflow-y-auto pb-[120px]">
        {/* ── Page header ── */}
        <header className="px-5 pt-[54px] pb-4">
          <h1 className="text-[22px] font-extrabold tracking-tight mb-4">
            History
          </h1>

          {/* Month summary card */}
          <MonthSummaryComponent summary={monthSummary} />
        </header>

        {/* ── Recent sessions list ── */}
        <SessionList 
          sessions={sessions} 
          hasMore={hasMore} 
          onLoadMore={handleLoadMore} 
        />
      </div>
    </section>
  );
}

/*
─────────────────────────────────────────
ANSWERS (read only after you've thought through the TODOs above)
─────────────────────────────────────────
monthSummary       → GET /api/sessions?month=YYYY-MM (aggregate: COUNT(*) for sessions, SUM(weight_kg × reps) from sets for totalVolumeKg)
                     Comparison: subtract previous month's session count from current month's count
sessions           → GET /api/sessions?limit=10&offset=0 (ordered by date DESC), returns { date, split_day.name, SUM(weight_kg × reps) as volumeKg }
hasMore            → API response includes `total` count or `hasMore` boolean; compare offset + limit < total
handleLoadMore     → increment offset by limit, call GET /api/sessions again, append results to sessions array
─────────────────────────────────────────
*/

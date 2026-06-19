import { MonthSummary as MonthSummaryComponent } from "../components/History/MonthSummary";
import { SessionList } from "../components/History/SessionList";
import { useHistory } from "../hooks/useHistory";

// ─── Component ────────────────────────────────────────────────────────────────
export function HistoryPage() {
  const { 
    sessions, 
    monthSummary, 
    loading, 
    hasMore, 
    loadMore 
  } = useHistory();

  if (loading && sessions.length === 0) {
    return (
      <div className="bg-bg min-h-screen flex items-center justify-center">
        <span className="text-white text-opacity-50 text-xs tracking-widest uppercase animate-pulse">Loading history...</span>
      </div>
    );
  }

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
          onLoadMore={loadMore} 
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

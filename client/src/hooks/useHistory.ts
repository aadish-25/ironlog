import { useState, useEffect, useCallback } from "react";
import { getSessionsHistory, getSessionsSummary } from "../services/sessions";
import type { SessionSummary, MonthSummary } from "../components/History/types";

export function useHistory() {
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [monthSummary, setMonthSummary] = useState<MonthSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);

    const LIMIT = 10;

    const fetchInitialData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch current month summary
            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
            const summaryData = await getSessionsSummary(currentMonthStr);
            setMonthSummary(summaryData);

            // Fetch first page of history
            const historyData = await getSessionsHistory(LIMIT, 0);
            setSessions(historyData);
            setOffset(LIMIT);
            setHasMore(historyData.length === LIMIT);

        } catch (err: any) {
            setError(err.message || "Failed to load history");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const loadMore = async () => {
        if (loadingMore || !hasMore) return;
        
        try {
            setLoadingMore(true);
            const moreData = await getSessionsHistory(LIMIT, offset);
            setSessions(prev => [...prev, ...moreData]);
            setOffset(prev => prev + LIMIT);
            setHasMore(moreData.length === LIMIT);
        } catch (err: any) {
            console.error("Failed to load more sessions:", err);
        } finally {
            setLoadingMore(false);
        }
    };

    return {
        sessions,
        monthSummary,
        loading,
        loadingMore,
        error,
        hasMore,
        loadMore,
        refetch: fetchInitialData
    };
}

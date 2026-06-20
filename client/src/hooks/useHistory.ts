import { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import axios from "axios";
import { fetcher } from "../services/api";
import { getSessionsHistory } from "../services/sessions";
import type { SessionSummary, MonthSummary } from "../components/History/types";

export function useHistory() {
    const LIMIT = 10;
    
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const { data: monthSummary, error: summaryError, isLoading: loadingSummary, mutate: mutateSummary } = useSWR<MonthSummary>(
        `/sessions/summary?month=${currentMonthStr}`,
        fetcher
    );

    const { data: initialHistory, error: historyError, isLoading: loadingHistory, mutate: mutateHistory } = useSWR<SessionSummary[]>(
        `/sessions/history?limit=${LIMIT}&offset=0`,
        fetcher
    );

    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);

    // Sync SWR cache to local state for pagination
    useEffect(() => {
        if (initialHistory && offset === 0) {
            setSessions(initialHistory);
            setOffset(LIMIT);
            setHasMore(initialHistory.length === LIMIT);
        }
    }, [initialHistory, offset, LIMIT]);

    let error: string | null = null;
    const combinedError = summaryError || historyError;
    if (combinedError) {
        error = axios.isAxiosError(combinedError) ? combinedError.response?.data?.message ?? combinedError.message : (combinedError as Error).message;
    }

    const loadMore = async () => {
        if (loadingMore || !hasMore || offset === 0) return;
        
        try {
            setLoadingMore(true);
            const moreData = await getSessionsHistory(LIMIT, offset);
            setSessions(prev => {
                const existingIds = new Set(prev.map(s => s.id));
                const uniqueNewData = moreData.filter(s => !existingIds.has(s.id));
                return [...prev, ...uniqueNewData];
            });
            setOffset(prev => prev + LIMIT);
            setHasMore(moreData.length === LIMIT);
        } catch (err: any) {
            console.error("Failed to load more sessions:", err);
        } finally {
            setLoadingMore(false);
        }
    };

    const refetch = useCallback(() => {
        setOffset(0);
        mutateSummary();
        mutateHistory();
    }, [mutateSummary, mutateHistory]);

    return {
        sessions: offset === 0 && initialHistory ? initialHistory : sessions,
        monthSummary: monthSummary || null,
        loading: loadingSummary || loadingHistory,
        loadingMore,
        error,
        hasMore,
        loadMore,
        refetch
    };
}

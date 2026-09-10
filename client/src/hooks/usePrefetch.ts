import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { mutate } from "swr";
import { fetcher } from "../services/api";

const PREFETCH_KEY = "ironlog_prefetch_timestamp";
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function usePrefetchOnLogin() {
  const { isLoaded, isSignedIn } = useAuth();
  const hasPrefetchedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasPrefetchedRef.current) {
      return;
    }

    // Check if valid prefetch timestamp exists in localStorage (persists across tabs & sessions)
    const storedTimestamp = localStorage.getItem(PREFETCH_KEY);
    if (storedTimestamp) {
      const timeElapsed = Date.now() - Number(storedTimestamp);
      if (!isNaN(timeElapsed) && timeElapsed < TWENTY_FOUR_HOURS_MS) {
        return;
      }
    }

    hasPrefetchedRef.current = true;

    // Delay background prefetch by 1.5 seconds so the active dashboard page gets
    // 100% of browser network connections and database pool bandwidth with zero contention.
    const timer = setTimeout(async () => {
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      const endpoints = [
        "/exercise",
        "/splits",
        "/sessions",
        "/users/me",
        "/users/me/stats",
        `/sessions/summary?month=${currentMonthStr}`,
        "/sessions/history?limit=10&offset=0",
      ];

      try {
        await Promise.allSettled(
          endpoints.map((endpoint) =>
            mutate(endpoint, fetcher(endpoint), false)
          )
        );
        localStorage.setItem(PREFETCH_KEY, Date.now().toString());
      } catch (err) {
        console.error("Failed to prefetch initial data", err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn]);
}

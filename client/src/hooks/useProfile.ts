import { useMemo } from "react";
import useSWR from "swr";
import axios from "axios";
import { fetcher } from "../services/api";
import { type UserStats } from "../services/users";
import { useCurrentUser } from "./useCurrentUser";

export function useProfile() {
    const { user, loading: userLoading } = useCurrentUser();
    
    const { data: stats, error: swrError, isLoading: loadingStats } = useSWR<UserStats>(
        user ? "/users/me/stats" : null,
        fetcher
    );

    let error: string | null = null;
    if (swrError) {
        error = axios.isAxiosError(swrError) ? swrError.response?.data?.message ?? swrError.message : (swrError as Error).message;
    }

    // Calculate days since joined
    const daysSinceJoined = useMemo(() => {
        return user?.created_at 
            ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000) 
            : null;
    }, [user?.created_at]);

    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" })
        : null;

    return {
        user,
        stats: stats || null,
        daysSinceJoined,
        memberSince,
        loading: userLoading || loadingStats,
        error
    };
}

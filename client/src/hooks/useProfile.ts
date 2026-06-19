import { useState, useEffect } from "react";
import { getUserStats, type UserStats } from "../services/users";
import { useCurrentUser } from "./useCurrentUser";

export function useProfile() {
    const { user, loading: userLoading } = useCurrentUser();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchStats = async () => {
            try {
                setLoadingStats(true);
                const data = await getUserStats();
                if (isMounted) {
                    setStats(data);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || "Failed to load profile stats");
                }
            } finally {
                if (isMounted) {
                    setLoadingStats(false);
                }
            }
        };

        if (user) {
            fetchStats();
        }
        
        return () => {
            isMounted = false;
        };
    }, [user]);

    // Calculate days since joined
    const daysSinceJoined = user?.created_at 
        ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000) 
        : null;

    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" })
        : null;

    return {
        user,
        stats,
        daysSinceJoined,
        memberSince,
        loading: userLoading || loadingStats,
        error
    };
}

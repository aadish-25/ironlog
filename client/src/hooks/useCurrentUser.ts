import { useState, useEffect } from "react";
import axios from "axios";
import { getUser, updateUser } from "../services/users";
import { type User } from "../types";

export function useCurrentUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCurrentUser() {
            try {
                const result = await getUser();
                setUser(result);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    const backendMsg = err.response?.data?.message;
                    const axiosMsg = err.message;
                    setError(backendMsg ?? axiosMsg);
                } else {
                    setError((err as Error).message);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchCurrentUser();
    }, []);

    async function updateCurrentUser(data: Partial<User>) {
        try {
            const result = await updateUser(data);
            setUser(result);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const backendMsg = err.response?.data?.message;
                const axiosMsg = err.message;
                setError(backendMsg ?? axiosMsg);
            } else {
                setError((err as Error).message);
            }
        }
    }

    return { user, loading, error, updateCurrentUser };
}

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
    getSplits,
    createSplit,
    activateSplit,
    deleteSplit,
    updateSplit,
} from "../services/splits";
import { type Split } from "../types";

export function useSplit() {
    const [splits, setSplits] = useState<Split[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserSplits = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getSplits();
            setSplits(result);
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
    }, []);

    useEffect(() => {
        fetchUserSplits();
    }, [fetchUserSplits]);

    async function createUserSplit(name: string) {
        try {
            const result = await createSplit(name);
            setSplits((prev) => (prev ? [...prev, result] : [result]));
            return result;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? err.message);
            } else {
                setError((err as Error).message);
            }
        }
    }

    async function activateUserSplit(id: string) {
        try {
            await activateSplit(id);
            setSplits((prev) =>
                prev
                    ? prev.map((s) => ({ ...s, is_active: s.id === id }))
                    : prev,
            );
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? err.message);
            } else {
                setError((err as Error).message);
            }
        }
    }

    async function deleteUserSplit(id: string) {
        try {
            await deleteSplit(id);
            setSplits((prev) =>
                prev ? prev.filter((s) => s.id !== id) : prev,
            );
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? err.message);
            } else {
                setError((err as Error).message);
            }
        }
    }

    async function updateUserSplit(id: string, name: string) {
        try {
            const result = await updateSplit(id, name);
            setSplits((prev) =>
                prev ? prev.map((s) => (s.id === id ? result : s)) : prev,
            );
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? err.message);
            } else {
                setError((err as Error).message);
            }
        }
    }

    return {
        splits,
        loading,
        error,
        createUserSplit,
        activateUserSplit,
        deleteUserSplit,
        updateUserSplit,
    };
}

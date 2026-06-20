import useSWR from "swr";
import axios from "axios";
import { fetcher } from "../services/api";
import {
    createSplit,
    activateSplit,
    deleteSplit,
    updateSplit,
} from "../services/splits";
import { type Split } from "../types";

export function useSplit() {
    const { data: splits, error: swrError, isLoading: loading, mutate } = useSWR<Split[]>("/splits", fetcher);

    let error: string | null = null;
    if (swrError) {
        if (axios.isAxiosError(swrError)) {
            error = swrError.response?.data?.message ?? swrError.message;
        } else {
            error = (swrError as Error).message;
        }
    }

    async function createUserSplit(name: string) {
        try {
            const result = await createSplit(name);
            mutate((prev) => (prev ? [...prev, result] : [result]), false);
            return result;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error(err.response?.data?.message ?? err.message);
            } else {
                console.error((err as Error).message);
            }
        }
    }

    async function activateUserSplit(id: string) {
        try {
            mutate((prev) =>
                prev
                    ? prev.map((s) => ({ ...s, is_active: s.id === id }))
                    : prev,
                false
            );
            await activateSplit(id);
            mutate();
        } catch (err) {
            console.error(err);
        }
    }

    async function deleteUserSplit(id: string) {
        try {
            mutate((prev) =>
                prev ? prev.filter((s) => s.id !== id) : prev,
                false
            );
            await deleteSplit(id);
            mutate();
        } catch (err) {
            console.error(err);
        }
    }

    async function updateUserSplit(id: string, name: string) {
        try {
            const result = await updateSplit(id, name);
            mutate((prev) =>
                prev ? prev.map((s) => (s.id === id ? result : s)) : prev,
                false
            );
        } catch (err) {
            console.error(err);
        }
    }

    return {
        splits: splits || null,
        loading,
        error,
        createUserSplit,
        activateUserSplit,
        deleteUserSplit,
        updateUserSplit,
    };
}

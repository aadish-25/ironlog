import useSWR from "swr";
import axios from "axios";
import { fetcher } from "../services/api";
import { updateUser } from "../services/users";
import { type User } from "../types";

export function useCurrentUser() {
    const { data: user, error: swrError, isLoading: loading, mutate } = useSWR<User>("/users/me", fetcher);

    let error: string | null = null;
    if (swrError) {
        if (axios.isAxiosError(swrError)) {
            error = swrError.response?.data?.message ?? swrError.message;
        } else {
            error = (swrError as Error).message;
        }
    }

    async function updateCurrentUser(data: Partial<User>) {
        try {
            const result = await updateUser(data);
            mutate(result, false);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error(err.response?.data?.message ?? err.message);
            } else {
                console.error((err as Error).message);
            }
        }
    }

    return { user: user || null, loading, error, updateCurrentUser };
}

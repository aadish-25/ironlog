import { api } from "./api";
import type { Session, SessionExercise } from "../types";

export const createSession = async (
    splitDayId: string,
    date?: string,
    isSkipped?: boolean
): Promise<Session> => {
    const response = await api.post("/sessions", {
        split_day_id: splitDayId,
        date,
        is_skipped: isSkipped
    });
    return response.data.data as Session;
};

export const getSessions = async (): Promise<Session[]> => {
    const response = await api.get("/sessions");
    return response.data.data as Session[];
};

export const getMissedSessions = async (): Promise<Session[]> => {
    const response = await api.get("/sessions/missed");
    return response.data.data as Session[];
};

export const getSessionsHistory = async (limit: number, offset: number): Promise<any[]> => {
    const response = await api.get(`/sessions/history?limit=${limit}&offset=${offset}`);
    return response.data.data;
};

export const getSessionsSummary = async (month: string): Promise<any> => {
    const response = await api.get(`/sessions/summary?month=${month}`);
    return response.data.data;
};

export const getSessionById = async (
    id: string,
): Promise<Session & { exercises: SessionExercise[] }> => {
    const response = await api.get(`/sessions/${id}`);
    const rawData = response.data.data;

    return rawData as Session & { exercises: SessionExercise[] };
};

export const deleteSession = async (id: string): Promise<void> => {
    await api.delete(`/sessions/${id}`);
};

export const completeSession = async (id: string): Promise<Session> => {
    const response = await api.patch(`/sessions/${id}/complete`);
    return response.data.data as Session;
};

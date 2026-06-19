import { api } from "./api";
import type { SetRecord } from "../types";

export const createSet = async (
    sessionId: string,
    exerciseId: string,
    setNumber: number,
    weightKg: number,
    reps: number,
): Promise<SetRecord> => {
    const response = await api.post("/sets", {
        session_id: sessionId,
        exercise_id: exerciseId,
        set_number: setNumber,
        weight_kg: weightKg,
        reps,
    });
    return response.data.data as SetRecord;
};

export const updateSet = async (
    id: string,
    data: Partial<SetRecord>,
): Promise<SetRecord> => {
    // Backend only allows updating weight_kg and reps
    const backendData: any = {};
    if (data.weight !== undefined) backendData.weight_kg = data.weight;
    if (data.reps !== undefined) backendData.reps = data.reps;
    
    const response = await api.put(`/sets/${id}`, backendData);
    return response.data.data as SetRecord;
};

export const deleteSet = async (id: string): Promise<void> => {
    await api.delete(`/sets/${id}`);
};

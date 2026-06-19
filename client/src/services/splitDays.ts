import { api } from "./api";
import { type SplitDay, type SplitDayExercise } from "../types";

export const updateSplitDay = async (id: string, updates: { label?: string, is_rest?: boolean }): Promise<SplitDay> => {
    const response = await api.put(`/split-days/${id}`, updates);
    return response.data.data;
};

export const addExercisesToDay = async (
    splitDayId: string, 
    exerciseIds: string[], 
    startingOrderIndex: number
): Promise<SplitDayExercise[]> => {
    const response = await api.post("/split-day-exercises", {
        split_day_id: splitDayId,
        exercise_ids: exerciseIds,
        order_index: startingOrderIndex
    });
    return response.data.data;
};

export const removeExerciseFromDay = async (id: string): Promise<void> => {
    await api.delete(`/split-day-exercises/${id}`);
};

export const reorderExerciseInDay = async (id: string, newOrderIndex: number): Promise<SplitDayExercise> => {
    const response = await api.patch(`/split-day-exercises/${id}`, {
        order_index: newOrderIndex
    });
    return response.data.data;
};

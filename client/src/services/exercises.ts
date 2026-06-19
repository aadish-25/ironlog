import { api } from "./api";
import { type Exercise, type ExerciseProgress } from "../types";

export const getExercises = async (): Promise<any[]> => {
    const response = await api.get("/exercise");
    return response.data.data;
};

export const getExerciseById = async (id: string): Promise<any> => {
    const response = await api.get(`/exercise/${id}`);
    return response.data.data;
};

export const getExerciseProgress = async (id: string): Promise<any[]> => {
    const response = await api.get(`/exercise/${id}/progress`);
    return response.data.data;
};

import { api } from "./api";
import { type Exercise, type ExerciseProgress } from "../types";

export const getExercises = async (): Promise<Exercise[]> => {
    const response = await api.get("/exercise");
    return response.data.data as Exercise[];
};

export const getExerciseById = async (id: string): Promise<Exercise> => {
    const response = await api.get(`/exercise/${id}`);
    return response.data.data as Exercise;
};

export const getExerciseProgress = async (id: string): Promise<ExerciseProgress[]> => {
    const response = await api.get(`/exercise/${id}/progress`);
    return response.data.data as ExerciseProgress[];
};

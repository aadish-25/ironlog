import { useState, useEffect } from "react";
import axios from "axios";
import {
    getExercises,
    getExerciseById,
    getExerciseProgress,
} from "../services/exercises";
import { type Exercise } from "../components/Exercises/types";
import { type ExerciseProgress } from "../types";

export function useExercises() {
    const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<ExerciseProgress[]>([]);

    async function fetchAllExercises() {
        try {
            setLoading(true);
            setError(null);
            const data = await getExercises();

            const mapped: Exercise[] = data.map((ex: any) => {
                const rawMuscles = Array.isArray(ex.muscle_groups)
                    ? ex.muscle_groups
                    : (ex.muscle_group ? [ex.muscle_group] : []);
                
                const muscles = rawMuscles.map((m: string) => 
                    m.charAt(0).toUpperCase() + m.slice(1)
                );

                const rawEquipments = Array.isArray(ex.equipment)
                    ? ex.equipment
                    : (ex.equipment ? [ex.equipment] : []);
                
                const equipments = rawEquipments.map((e: string) =>
                    e.charAt(0).toUpperCase() + e.slice(1)
                );

                return {
                    id: ex.id,
                    name: ex.name,
                    muscles,
                    equipments,
                    prKg: ex.pr_kg ?? null,
                };
            });

            setExercisesList(mapped);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? err.message);
            } else {
                setError((err as Error).message);
            }
        } finally {
            setLoading(false);
        }
    }

    async function fetchExerciseById(id: string) {
        try {
            setLoading(true);
            const data = await getExerciseById(id);

            const rawMuscles = Array.isArray(data.muscle_groups) 
                ? data.muscle_groups 
                : (data.muscle_group ? [data.muscle_group] : []);
            const muscles = rawMuscles.map((m: string) => m.charAt(0).toUpperCase() + m.slice(1));
            
            const rawEquipments = Array.isArray(data.equipment)
                ? data.equipment
                : (data.equipment ? [data.equipment] : []);
            const equipments = rawEquipments.map((e: string) => e.charAt(0).toUpperCase() + e.slice(1));

            const mapped = {
                id: data.id,
                name: data.name,
                muscles,
                equipments,
                prKg: null,
                formGuide: Array.isArray(data.form_guide) ? data.form_guide : [],
            };

            setExercise(mapped as any);
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

    async function fetchExerciseProgress(id: string) {
        try {
            setLoading(true);
            setError(null);
            const data = await getExerciseProgress(id);

            const mapped = data.map((item: any) => ({
                session_date: item.date || item.session_date,
                max_weight: Number(item.max_weight) || 0,
                total_volume: Number(item.volume || item.total_volume) || 0,
                pr_hit: item.pr_hit ?? false,
            }));

            setProgress(mapped);
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

    useEffect(() => {
        fetchAllExercises();
    }, []);

    return {
        exercisesList,
        exercise,
        progress,
        loading,
        error,
        refetch: fetchAllExercises,
        fetchExerciseById,
        fetchExerciseProgress,
    };
}

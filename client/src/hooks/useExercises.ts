import { useCallback } from "react";
import useSWR from "swr";
import axios from "axios";
import { fetcher } from "../services/api";
import { type Exercise } from "../components/Exercises/types";
import { type ExerciseProgress } from "../types";

export function useExercises(exerciseId?: string) {
    const { data: exercisesData, error: exercisesError, isLoading: loadingExercises, mutate: mutateExercises } = useSWR<any[]>(
        "/exercise",
        fetcher
    );

    const { data: exerciseData, error: exerciseError, isLoading: loadingExercise, mutate: mutateExercise } = useSWR<any>(
        exerciseId ? `/exercise/${exerciseId}` : null,
        fetcher
    );

    const { data: progressData, error: progressError, isLoading: loadingProgress, mutate: mutateProgress } = useSWR<any[]>(
        exerciseId ? `/exercise/${exerciseId}/progress` : null,
        fetcher
    );

    const exercisesList: Exercise[] = exercisesData ? exercisesData.map((ex: any) => {
        const rawMuscles = Array.isArray(ex.muscle_groups)
            ? ex.muscle_groups
            : (ex.muscle_group ? [ex.muscle_group] : []);
        const muscles = rawMuscles.map((m: string) => m.charAt(0).toUpperCase() + m.slice(1));
        
        const rawEquipments = Array.isArray(ex.equipment)
            ? ex.equipment
            : (ex.equipment ? [ex.equipment] : []);
        const equipments = rawEquipments.map((e: string) => e.charAt(0).toUpperCase() + e.slice(1));

        return {
            id: ex.id,
            name: ex.name,
            muscles,
            equipments,
            prKg: ex.pr_kg ?? null,
            is_bodyweight: ex.is_bodyweight ?? false,
        };
    }) : [];

    const exercise: Exercise | null = exerciseData ? (() => {
        const rawMuscles = Array.isArray(exerciseData.muscle_groups) 
            ? exerciseData.muscle_groups 
            : (exerciseData.muscle_group ? [exerciseData.muscle_group] : []);
        const muscles = rawMuscles.map((m: string) => m.charAt(0).toUpperCase() + m.slice(1));
        
        const rawEquipments = Array.isArray(exerciseData.equipment)
            ? exerciseData.equipment
            : (exerciseData.equipment ? [exerciseData.equipment] : []);
        const equipments = rawEquipments.map((e: string) => e.charAt(0).toUpperCase() + e.slice(1));

        return {
            id: exerciseData.id,
            name: exerciseData.name,
            muscles,
            equipments,
            prKg: null,
            formGuide: Array.isArray(exerciseData.form_guide) ? exerciseData.form_guide : [],
            is_bodyweight: exerciseData.is_bodyweight ?? false,
        };
    })() : null;

    const progress: ExerciseProgress[] = progressData ? progressData.map((item: any) => ({
        session_date: item.date || item.session_date,
        max_weight: Number(item.max_weight) || 0,
        total_volume: Number(item.volume || item.total_volume) || 0,
        pr_hit: item.pr_hit ?? false,
    })) : [];

    const loading = loadingExercises || loadingExercise || loadingProgress;
    const combinedError = exercisesError || exerciseError || progressError;
    
    let error: string | null = null;
    if (combinedError) {
        error = axios.isAxiosError(combinedError) ? combinedError.response?.data?.message ?? combinedError.message : (combinedError as Error).message;
    }

    const refetch = useCallback(() => {
        mutateExercises();
        if (exerciseId) {
            mutateExercise();
            mutateProgress();
        }
    }, [mutateExercises, mutateExercise, mutateProgress, exerciseId]);

    return {
        exercisesList,
        exercise,
        progress,
        loading,
        error,
        refetch,
    };
}

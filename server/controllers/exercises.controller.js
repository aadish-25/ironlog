import {
    getExercisesService,
    getExerciseByIdService,
    getExerciseProgressService,
    createExerciseService,
    updateExerciseService,
    deleteExerciseService,
} from "../services/exercises.services.js";

async function getExercises(req, res) {
    const { muscle_group, equipment } = req.query;
    const userId = req.user?.id;

    const muscleGroups = muscle_group?.split(",") || undefined;
    const equipmentList = equipment?.split(",") || undefined;

    try {
        const result = await getExercisesService(
            muscleGroups,
            equipmentList,
        );
        res.set(
            "Cache-Control",
            "public, max-age=86400, stale-while-revalidate=604800",
        );
        res.status(200).json({
            message: "Exercises fetched successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while fetching exercises",
            error: error.message,
        });
    }
}

async function getExerciseById(req, res) {
    const { id } = req.params;
    try {
        const result = await getExerciseByIdService(id);
        if (!result) {
            return res.status(404).json({ message: "Exercise not found" });
        }
        res.set(
            "Cache-Control",
            "public, max-age=86400, stale-while-revalidate=604800",
        );
        res.status(200).json({
            message: "Exercise fetched successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while fetching exercise",
            error: error.message,
        });
    }
}

async function getExerciseProgress(req, res) {
    const user = req.user;
    const id = user.id;
    const exerciseId = req.params.id;

    try {
        const result = await getExerciseProgressService(id, exerciseId);
        if (!result) {
            return res
                .status(404)
                .json({ message: "No progress to be fetched" });
        }
        res.status(200).json({
            message: "Progress fetched successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while fetching progress",
            error: error.message,
        });
    }
}

async function createExercise(req, res) {
    try {
        const result = await createExerciseService(req.body);
        res.status(201).json({
            message: "Exercise created successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while creating exercise",
            error: error.message,
        });
    }
}

async function updateExercise(req, res) {
    const { id } = req.params;
    try {
        const result = await updateExerciseService(id, req.body);
        res.status(200).json({
            message: "Exercise updated successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while updating exercise",
            error: error.message,
        });
    }
}

async function deleteExercise(req, res) {
    const { id } = req.params;
    try {
        const result = await deleteExerciseService(id);
        res.status(200).json({
            message: "Exercise deleted successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while deleting exercise",
            error: error.message,
        });
    }
}

export {
    getExercises,
    getExerciseById,
    getExerciseProgress,
    createExercise,
    updateExercise,
    deleteExercise,
};

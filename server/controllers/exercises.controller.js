import {
    getExercisesService,
    getExerciseByIdService,
    getExerciseProgressService,
} from "../services/exercises.services.js";

async function getExercises(req, res) {
    const { muscle_group, equipment } = req.query;

    const muscleGroups = muscle_group?.split(",") || undefined;
    const equipmentList = equipment?.split(",") || undefined;

    try {
        const result = await getExercisesService(muscleGroups, equipmentList);
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
    const id = id;
    const { exerciseId } = req.params;

    try {
        const result = getExerciseProgressService(id, exerciseId);
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

export { getExercises, getExerciseById, getExerciseProgress };

import {
    addExerciseService,
    removeExerciseService,
    reorderExerciseService,
} from "../services/splitDayExercises.services.js";

async function addExercise(req, res) {
    const { split_day_id, exercise_id, order_index } = req.body;

    try {
        const result = await addExerciseService(
            split_day_id,
            exercise_id,
            order_index,
        );
        res.status(200).json({
            message: "Exercise added succesfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while adding exercise",
            error: error.message,
        });
    }
}

async function removeExercise(req, res) {
    const { id } = req.params;
    try {
        await removeExerciseService(id);
        res.status(200).json({
            message: "Exercise deleted succesfully",
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while deleting exercise",
            error: error.message,
        });
    }
}

async function reorderExercise(req, res) {
    const { id } = req.params;
    const { order_index } = req.body;
    try {
        const result = await reorderExerciseService(id, order_index);
        res.status(200).json({
            message: "Exercise reordered successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while reordering exercise",
            error: error.message,
        });
    }
}

export { addExercise, removeExercise, reorderExercise };

import {
    createSetService,
    updateSetService,
    deleteSetService,
} from "../services/sets.services.js";

async function createSet(req, res) {
    const { id } = req.user;
    const { session_id, exercise_id, set_number, weight_kg, reps } = req.body;

    try {
        const result = await createSetService(
            id,
            session_id,
            exercise_id,
            set_number,
            weight_kg,
            reps,
        );

        res.status(201).json({
            message: "Set logged successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while logging set",
            error: error.message,
        });
    }
}

async function updateSet(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const data = req.body;

    try {
        const result = await updateSetService(id, userId, data);

        res.status(200).json({
            message: "Set updated successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while updating set",
            error: error.message,
        });
    }
}

async function deleteSet(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        await deleteSetService(id, userId);

        res.status(200).json({
            message: "Set deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while deleting set",
            error: error.message,
        });
    }
}

export { createSet, updateSet, deleteSet };

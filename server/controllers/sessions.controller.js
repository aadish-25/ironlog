import {
    createSessionService,
    getSessionsService,
    getSessionByIdService,
    deleteSessionService,
} from "../services/sessions.services.js";

async function createSession(req, res) {
    const user = req.user;
    const id = user.id;

    const { split_day_id, date } = req.body;

    try {
        const result = await createSessionService(id, split_day_id, date);
        res.status(200).json({
            message: "Session created successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while creating session",
            error: error.message,
        });
    }
}

async function getSessions(req, res) {
    const user = req.user;
    const userId = user.id;

    try {
        const result = await getSessionsService(userId);
        res.status(200).json({
            message: "Sessions retrieved successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while fetching sessions",
            error: error.message,
        });
    }
}

async function getSessionById(req, res) {
    const user = req.user;
    const userId = user.id;
    const { id } = req.params;

    try {
        const result = await getSessionByIdService(id, userId);
        res.status(200).json({
            message: "Session retrieved successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while fetching session",
            error: error.message,
        });
    }
}

async function deleteSession(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await deleteSessionService(id, userId);

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Session not found or not authorized",
            });
        }

        res.status(200).json({
            message: "Session deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while deleting session",
            error: error.message,
        });
    }
}

export { createSession, getSessions, getSessionById, deleteSession };

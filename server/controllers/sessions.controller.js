import {
    createSessionService,
    getSessionsService,
    getSessionByIdService,
    deleteSessionService,
    getMissedSessionsService,
    getSessionsHistoryService,
    getSessionsSummaryService,
    completeSessionService
} from "../services/sessions.services.js";

async function createSession(req, res) {
    const user = req.user;
    const id = user.id;

    const { split_day_id, date, is_skipped } = req.body;

    try {
        const result = await createSessionService(id, split_day_id, date, is_skipped);
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

async function getMissedSessions(req, res) {
    try {
        const result = await getMissedSessionsService(req.user.id);
        res.status(200).json({
            message: "Missed sessions retrieved successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while fetching missed sessions",
            error: error.message,
        });
    }
}

async function getSessionsHistory(req, res) {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const result = await getSessionsHistoryService(userId, limit, offset);
        res.status(200).json({
            message: "History retrieved successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while fetching history",
            error: error.message,
        });
    }
}

async function getSessionsSummary(req, res) {
    const userId = req.user.id;
    const { month } = req.query; // YYYY-MM
    
    if (!month) {
        return res.status(400).json({ message: "Month parameter is required (YYYY-MM)" });
    }

    try {
        const result = await getSessionsSummaryService(userId, month);
        res.status(200).json({
            message: "Summary retrieved successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while fetching summary",
            error: error.message,
        });
    }
}

async function completeSession(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await completeSessionService(id, userId);
        res.status(200).json({
            message: "Session completed successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error completing session",
            error: error.message,
        });
    }
}

export { 
    createSession, 
    getSessions, 
    getSessionById, 
    deleteSession, 
    getMissedSessions,
    getSessionsHistory,
    getSessionsSummary,
    completeSession
};

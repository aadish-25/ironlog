import pool from "../db/connection.js";

const createSessionService = async (userId, splitDayId, date) => {
    try {
        const result = await pool.query(
            "INSERT INTO sessions (user_id, split_day_id, date) VALUES ($1, $2, $3) RETURNING *",
            [userId, splitDayId, date],
        );
        return result.rows[0];
    } catch (error) {
        throw new Error("Error while creating session");
    }
};

const getSessionsService = async (userId) => {
    try {
        const result = await pool.query(
            "SELECT * FROM sessions WHERE user_id = $1 ORDER BY date DESC",
            [userId],
        );
        return result.rows;
    } catch (error) {
        throw new Error("Error while fetching sessions list for a user");
    }
};

const getSessionByIdService = async (sessionId, userId) => {
    try {
        const session = await pool.query(
            "SELECT * FROM sessions WHERE id = $1 AND user_id = $2",
            [sessionId, userId],
        );
        if (session.rows.length === 0) throw new Error("Session not found");

        const setDetailsOfSession = await pool.query(
            `SELECT sets.*, exercises.name
            FROM sets 
            JOIN exercises
            ON sets.exercise_id = exercises.id
            WHERE sets.session_id = $1 AND sets.user_id = $2`,
            [sessionId, userId],
        );

        return {
            ...session.rows[0],
            sets: setDetailsOfSession.rows,
        };
    } catch (error) {
        throw new Error(
            "Error while fetching complete session details with sets and exercises",
        );
    }
};

const deleteSessionService = async (sessionId, userId) => {
    try {
        const result = await pool.query(
            "DELETE FROM sessions WHERE id = $1 AND user_id = $2",
            [sessionId, userId],
        );

        return result;
    } catch (error) {
        throw new Error("Error while deleting session");
    }
};

export {
    createSessionService,
    getSessionsService,
    getSessionByIdService,
    deleteSessionService,
};

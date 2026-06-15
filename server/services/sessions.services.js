import pool from "../db/connection.js";

const createSessionService = async (userId, splitDayId, date, isSkipped = false) => {
    try {
        const result = await pool.query(
            "INSERT INTO sessions (user_id, split_day_id, date, is_skipped) VALUES ($1, $2, $3, $4) RETURNING *",
            [userId, splitDayId, date, isSkipped],
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

const getMissedSessionsService = async (userId) => {
    try {
        // 1. Get the user's active split's non-Rest split_days
        const splitDaysResult = await pool.query(
            `SELECT split_days.*
            FROM split_days
            JOIN splits ON split_days.split_id = splits.id
            WHERE splits.user_id = $1 AND splits.is_active = true AND split_days.label != 'Rest'`,
            [userId],
        );
        const splitDays = splitDaysResult.rows;

        if (splitDays.length === 0) return [];

        // 2. For each split_day, check if its day_of_week has already occurred
        //    this week (Monday through today). If it hasn't happened yet, skip it.
        //    day_of_week: 0=Monday..6=Sunday (DB schema)
        //    JS Date.getDay(): 0=Sunday..6=Saturday
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Convert JS day (0=Sun..6=Sat) to DB day (0=Mon..6=Sun)
        const todayDbDay = (today.getDay() + 6) % 7;

        const missedDays = [];

        for (const sd of splitDays) {
            // Skip days that haven't occurred yet this week (upcoming, not missed)
            if (sd.day_of_week > todayDbDay) continue;

            // daysAgo = how many days ago this day_of_week occurred (0 = today)
            const daysAgo = todayDbDay - sd.day_of_week;

            const missedDate = new Date(today);
            missedDate.setDate(today.getDate() - daysAgo);

            // Format as YYYY-MM-DD for SQL comparison
            const dateStr = missedDate.toISOString().split("T")[0];

            // 3. Check if a session exists for this split_day_id on the calculated date
            const sessionResult = await pool.query(
                `SELECT 1 FROM sessions
                WHERE user_id = $1 AND split_day_id = $2 AND date = $3
                LIMIT 1`,
                [userId, sd.id, dateStr],
            );

            if (sessionResult.rows.length === 0) {
                missedDays.push({ ...sd, missed_date: dateStr });
            }
        }

        return missedDays;
    } catch (error) {
        throw new Error("Error while fetching missed sessions");
    }
};

export {
    createSessionService,
    getSessionsService,
    getSessionByIdService,
    deleteSessionService,
    getMissedSessionsService,
};

import pool from "../db/connection.js";

const createSessionService = async (
    userId,
    splitDayId,
    date,
    isSkipped = false,
) => {
    try {
        const splitDayResult = await pool.query(
            `SELECT sd.is_rest 
             FROM split_days sd
             JOIN splits s ON sd.split_id = s.id
             WHERE sd.id = $1 AND s.user_id = $2`,
            [splitDayId, userId],
        );

        if (splitDayResult.rows.length === 0) {
            throw new Error("Split day not found or not authorized");
        }

        if (splitDayResult.rows[0].is_rest) {
            throw new Error("Cannot create a session for a rest day");
        }

        const result = await pool.query(
            `INSERT INTO sessions (user_id, split_day_id, date, is_skipped) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (user_id, split_day_id, date) 
             DO UPDATE SET is_skipped = EXCLUDED.is_skipped, updated_at = now() 
             RETURNING *`,
            [userId, splitDayId, date, isSkipped],
        );
        return result.rows[0];
    } catch (error) {
        throw new Error("Could not create session", { cause: error });
    }
};

const getSessionsService = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT sessions.*,
             split_days.label as split_day_name,
             COUNT(sets.id) as sets_logged,
             SUM(CASE WHEN sets.is_pr THEN 1 ELSE 0 END) as prs_hit,
             COALESCE(SUM(sets.weight_kg * sets.reps), 0) as total_volume,
             (
                 SELECT json_agg(json_build_object('name', e.name, 'kg', s.weight_kg))
                 FROM sets s
                 JOIN exercises e ON s.exercise_id = e.id
                 WHERE s.session_id = sessions.id AND s.is_pr = true
             ) as pr_details
             FROM sessions
             LEFT JOIN split_days ON sessions.split_day_id = split_days.id
             LEFT JOIN sets ON sets.session_id = sessions.id
             WHERE sessions.user_id = $1 
             GROUP BY sessions.id, split_days.label
             ORDER BY sessions.date DESC`,
            [userId],
        );
        return result.rows.map((r) => ({
            ...r,
            sets_logged: Number(r.sets_logged),
            prs_hit: Number(r.prs_hit),
            total_volume: Number(r.total_volume),
            pr_details: r.pr_details || [],
        }));
    } catch (error) {
        throw new Error("Could not fetch sessions", { cause: error });
    }
};

const getSessionByIdService = async (sessionId, userId) => {
    try {
        const sessionResult = await pool.query(
            "SELECT * FROM sessions WHERE id = $1 AND user_id = $2",
            [sessionId, userId],
        );
        if (sessionResult.rows.length === 0)
            throw new Error("Session not found");
        const session = sessionResult.rows[0];

        // 1. Fetch split day exercises (the plan)
        const planResult = await pool.query(
            `SELECT sde.id, sde.exercise_id, e.name,
             (
                 SELECT CONCAT(weight_kg, ' kg × ', reps)
                 FROM sets
                 WHERE user_id = $2 AND exercise_id = sde.exercise_id
                 ORDER BY weight_kg DESC, reps DESC
                 LIMIT 1
             ) as previous_best
             FROM split_day_exercises sde
             JOIN exercises e ON sde.exercise_id = e.id
             WHERE sde.split_day_id = $1
             ORDER BY sde.order_index ASC`,
            [session.split_day_id, userId],
        );

        // 2. Fetch actually logged sets for this session
        const setsResult = await pool.query(
            `SELECT sets.*, exercises.name
            FROM sets 
            JOIN exercises ON sets.exercise_id = exercises.id
            WHERE sets.session_id = $1 AND sets.user_id = $2
            ORDER BY sets.set_number ASC`,
            [sessionId, userId],
        );

        // Group sets by exercise_id
        const setsByExercise = {};
        for (const set of setsResult.rows) {
            if (!setsByExercise[set.exercise_id])
                setsByExercise[set.exercise_id] = [];
            setsByExercise[set.exercise_id].push({
                id: set.id,
                set_number: set.set_number,
                weight: Number(set.weight_kg),
                reps: set.reps,
                is_logged: true,
                is_overload: set.is_overload || false,
                pr_hit: set.is_pr || false,
            });
        }

        const exerciseMap = new Map();

        for (const planEx of planResult.rows) {
            exerciseMap.set(planEx.exercise_id, {
                id: planEx.id,
                exercise_id: planEx.exercise_id,
                name: planEx.name,
                previous_best: planEx.previous_best || null,
                sets: setsByExercise[planEx.exercise_id] || [],
            });
        }

        for (const set of setsResult.rows) {
            if (!exerciseMap.has(set.exercise_id)) {
                exerciseMap.set(set.exercise_id, {
                    id: `extra-${set.exercise_id}`,
                    exercise_id: set.exercise_id,
                    name: set.name,
                    previous_best: null, // Extra exercises added on the fly won't have previous best cached easily unless we do another query
                    sets: setsByExercise[set.exercise_id],
                });
            }
        }

        const exercises = Array.from(exerciseMap.values());

        for (const ex of exercises) {
            if (ex.sets.length === 0) {
                for (let i = 1; i <= 3; i++) {
                    ex.sets.push({
                        id: `temp-${Date.now()}-${Math.random()}`,
                        set_number: i,
                        weight: 30,
                        reps: 10,
                        is_logged: false,
                        is_overload: false,
                        pr_hit: false,
                    });
                }
            }
        }

        return {
            ...session,
            exercises,
        };
    } catch (error) {
        throw new Error("Could not fetch session details", { cause: error });
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
        throw new Error("Could not delete session", { cause: error });
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
        throw new Error("Could not fetch missed sessions", { cause: error });
    }
};

const getSessionsHistoryService = async (userId, limit, offset) => {
    try {
        const result = await pool.query(
            `SELECT sessions.date, split_days.label as name, 
            COALESCE(SUM(sets.weight_kg * sets.reps), 0) as "volumeKg"
            FROM sessions
            LEFT JOIN split_days ON sessions.split_day_id = split_days.id
            LEFT JOIN sets ON sets.session_id = sessions.id
            WHERE sessions.user_id = $1 AND sessions.is_skipped = false
            GROUP BY sessions.id, split_days.label, sessions.date
            ORDER BY sessions.date DESC
            LIMIT $2 OFFSET $3`,
            [userId, limit, offset],
        );
        return result.rows.map((row) => ({
            ...row,
            volumeKg: Number(row.volumeKg),
        }));
    } catch (error) {
        throw new Error("Could not fetch sessions history", { cause: error });
    }
};

const getSessionsSummaryService = async (userId, monthStr) => {
    // monthStr format: YYYY-MM
    try {
        const [year, month] = monthStr.split("-");
        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 0, 23, 59, 59).toISOString(); // last day of month

        // previous month
        const prevMonthDate = new Date(year, month - 2, 1);
        const prevStartDate = new Date(
            prevMonthDate.getFullYear(),
            prevMonthDate.getMonth(),
            1,
        ).toISOString();
        const prevEndDate = new Date(
            prevMonthDate.getFullYear(),
            prevMonthDate.getMonth() + 1,
            0,
            23,
            59,
            59,
        ).toISOString();

        const currentResult = await pool.query(
            `SELECT COUNT(DISTINCT sessions.id) as sessions, 
             COALESCE(SUM(sets.weight_kg * sets.reps), 0) as "totalVolumeKg"
             FROM sessions
             LEFT JOIN sets ON sets.session_id = sessions.id
             WHERE sessions.user_id = $1 AND sessions.is_skipped = false
             AND sessions.date >= $2 AND sessions.date <= $3`,
            [userId, startDate, endDate],
        );

        const prevResult = await pool.query(
            `SELECT COUNT(DISTINCT sessions.id) as sessions
             FROM sessions
             WHERE user_id = $1 AND is_skipped = false
             AND date >= $2 AND date <= $3`,
            [userId, prevStartDate, prevEndDate],
        );

        const currentCount = parseInt(currentResult.rows[0].sessions, 10);
        const prevCount = parseInt(prevResult.rows[0].sessions, 10);

        const diff = currentCount - prevCount;
        let comparisonText = null;
        if (diff > 0) comparisonText = `${diff} more than last month`;
        else if (diff < 0)
            comparisonText = `${Math.abs(diff)} less than last month`;
        else comparisonText = "Same as last month";

        return {
            label: monthStr, // Can be formatted on client
            sessions: currentCount,
            totalVolumeKg: Number(currentResult.rows[0].totalVolumeKg),
            comparisonText,
        };
    } catch (error) {
        throw new Error("Could not fetch sessions summary", { cause: error });
    }
};

const completeSessionService = async (sessionId, userId) => {
    try {
        const result = await pool.query(
            "UPDATE sessions SET is_completed = true WHERE id = $1 AND user_id = $2 RETURNING *",
            [sessionId, userId],
        );
        return result.rows[0];
    } catch (error) {
        throw new Error("Could not complete session", { cause: error });
    }
};

export {
    createSessionService,
    getSessionsService,
    getSessionByIdService,
    deleteSessionService,
    getMissedSessionsService,
    getSessionsHistoryService,
    getSessionsSummaryService,
    completeSessionService,
};

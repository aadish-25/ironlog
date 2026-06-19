import pool from "../db/connection.js";

const createSplitWithDaysService = async (userId, name) => {
    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const countResult = await client.query(
            "SELECT COUNT(*) FROM splits WHERE user_id = $1",
            [userId],
        );
        const isFirstSplit = parseInt(countResult.rows[0].count) === 0;

        const created_split = await client.query(
            "INSERT INTO splits(user_id, name, is_active) VALUES($1, $2, $3) RETURNING *;",
            [userId, name, isFirstSplit],
        );

        const split = created_split.rows[0];
        const days = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ];

        const values = [];
        const rows = days
            .map((day, i) => {
                values.push(split.id, i, day);
                return `($${values.length - 2}, $${values.length - 1}, $${values.length})`;
            })
            .join(",");

        await client.query(
            `INSERT INTO split_days (split_id, day_of_week, label) VALUES ${rows}`,
            values,
        );

        await client.query("COMMIT");

        return { ...split, days: [] };
    } catch (error) {
        if (client) await client.query("ROLLBACK");
        throw new Error("Could not create split", { cause: error });
    } finally {
        if (client) client.release();
    }
};

const getSplitsByUserService = async (userId) => {
    try {
        const splitsResult = await pool.query(
            "SELECT * FROM splits WHERE user_id = $1 ORDER BY created_at ASC",
            [userId],
        );

        const splits = splitsResult.rows;
        if (splits.length === 0) return [];

        // Fetch all days for all user splits in a single query
        const splitIds = splits.map((s) => s.id);
        const daysResult = await pool.query(
            "SELECT * FROM split_days WHERE split_id = ANY($1) ORDER BY day_of_week",
            [splitIds],
        );

        // Group days by split_id
        const daysBySplit = {};
        for (const day of daysResult.rows) {
            if (!daysBySplit[day.split_id]) daysBySplit[day.split_id] = [];
            daysBySplit[day.split_id].push(day);
        }

        const exercisesResult = await pool.query(
            `SELECT sde.*, e.name, e.muscle_groups, e.equipment
            FROM split_day_exercises sde
            JOIN exercises e ON sde.exercise_id = e.id
            JOIN split_days sd ON sde.split_day_id = sd.id
            WHERE sd.split_id = ANY($1)
            ORDER BY sde.split_day_id, sde.order_index`,
            [splitIds]
        );

        const exercisesByDay = {};
        for (const ex of exercisesResult.rows) {
            if (!exercisesByDay[ex.split_day_id]) exercisesByDay[ex.split_day_id] = [];
            exercisesByDay[ex.split_day_id].push(ex);
        }

        return splits.map((split) => {
            const days = (daysBySplit[split.id] ?? []).map(day => {
                const dayExercises = exercisesByDay[day.id] || [];
                return {
                    ...day,
                    type: day.is_rest ? "rest" : "train",
                    exercises: dayExercises
                };
            });
            return { ...split, days };
        });
    } catch (error) {
        throw new Error("Could not retrieve splits for user", { cause: error });
    }
};

// BELONGS TO SPLITS_DAYS OR SPLITS_DAYS_EXERCISE
// const getSplitWithDetails = async (splitId) => {
//     // nested query: split + split_days + split_day_exercises + exercises
//     // q2: do we even need split_day_exercies and exercises here, assuming hwo the UI will look the user will mostl click the split_day which will
//     // take it to a page dedicated to that day and in that we will show the exercises n details, so this shud be a part of
//     // split_day service not split service
// };

const getSplitByIdService = async (splitId) => {
    try {
        const splitResult = await pool.query(
            "SELECT * FROM splits WHERE id = $1",
            [splitId],
        );

        if (!splitResult.rows[0]) {
            return null;
        }

        const daysResult = await pool.query(
            "SELECT * FROM split_days WHERE split_id = $1 ORDER BY day_of_week",
            [splitId],
        );

        const exercisesResult = await pool.query(
            `SELECT sde.*, e.name, e.muscle_groups, e.equipment
            FROM split_day_exercises sde
            JOIN exercises e ON sde.exercise_id = e.id
            JOIN split_days sd ON sde.split_day_id = sd.id
            WHERE sd.split_id = $1
            ORDER BY sde.split_day_id, sde.order_index`,
            [splitId]
        );

        const exercisesByDay = {};
        for (const ex of exercisesResult.rows) {
            if (!exercisesByDay[ex.split_day_id]) exercisesByDay[ex.split_day_id] = [];
            exercisesByDay[ex.split_day_id].push(ex);
        }

        const days = daysResult.rows.map(day => {
            const dayExercises = exercisesByDay[day.id] || [];
            return {
                ...day,
                type: day.is_rest ? "rest" : "train",
                exercises: dayExercises
            };
        });

        return { ...splitResult.rows[0], days };
    } catch (error) {
        throw new Error("Could not retrieve split", { cause: error });
    }
};

const updateSplitService = async (splitId, name) => {
    try {
        const result = await pool.query(
            "UPDATE splits SET name = $1 WHERE id = $2 RETURNING *",
            [name, splitId],
        );

        return result.rows[0];
    } catch (error) {
        throw new Error("Could not update split", { cause: error });
    }
};

const deleteSplitService = async (splitId) => {
    try {
        await pool.query("DELETE FROM splits WHERE id = $1", [splitId]);
    } catch (error) {
        throw new Error("Could not delete split", { cause: error });
    }
};

const setActiveSplitService = async (userId, splitId) => {
    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");
        await client.query(
            "UPDATE splits SET is_active = false WHERE user_id = $1",
            [userId],
        );

        const result = await client.query(
            "UPDATE splits SET is_active = true WHERE id = $1 RETURNING *",
            [splitId],
        );

        await client.query("COMMIT");

        return result.rows[0];
    } catch (error) {
        if (client) await client.query("ROLLBACK");
        throw new Error("Could not set active split", { cause: error });
    } finally {
        if (client) client.release();
    }
};

export {
    createSplitWithDaysService,
    getSplitsByUserService,
    getSplitByIdService,
    updateSplitService,
    deleteSplitService,
    setActiveSplitService,
};

import pool from "../db/connection.js";

// Creates a new split AND auto-generates 7 split_day rows (Mon-Sun) for it.
// Uses a transaction so both inserts succeed or both are rolled back.
const createSplitWithDaysService = async (userId, name) => {
    let client;
    try {
        // Get a dedicated connection from the pool for the transaction
        client = await pool.connect();
        await client.query("BEGIN");

        // If this is the user's very first split, auto-set it as active
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

        // Build a single bulk INSERT for all 7 days instead of 7 separate queries.
        // Each iteration pushes 3 values (split_id, day_of_week index, label) into the
        // flat `values` array and returns a placeholder string like ($1, $2, $3).
        // Final query looks like: INSERT INTO split_days ... VALUES ($1,$2,$3), ($4,$5,$6), ...
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

        // Return the new split with an empty days array (days will be fetched separately when needed)
        return { ...split, days: [] };
    } catch (error) {
        if (client) await client.query("ROLLBACK");
        throw new Error("Could not create split", { cause: error });
    } finally {
        // Always release the connection back to the pool, even if an error occurred
        if (client) client.release();
    }
};

// Fetches all splits for a user, with their days and exercises nested inside.
// In short: fetches all of a user's splits, each with its 7 days, and each day with the exercises assigned to it, all nested and ready for the frontend.
// Uses only 3 total DB queries (no matter how many splits the user has) by
// fetching everything in bulk and grouping it in JS.
const getSplitsByUserService = async (userId) => {
    try {
        // Query 1: Get all splits for this user
        const splitsResult = await pool.query(
            "SELECT * FROM splits WHERE user_id = $1 ORDER BY created_at ASC",
            [userId],
        );

        const splits = splitsResult.rows;
        if (splits.length === 0) return [];

        // Query 2: Fetch all split_days for ALL splits in one shot using ANY($1).
        // ANY($1) is Postgres's way of saying WHERE split_id IN (1, 2, 3, ...).
        const splitIds = splits.map((s) => s.id);
        const daysResult = await pool.query(
            "SELECT * FROM split_days WHERE split_id = ANY($1) ORDER BY day_of_week",
            [splitIds],
        );

        // Group the flat days array into an object keyed by split_id.
        // e.g. { 1: [day1, day2, ...], 2: [day1, day2, ...] }
        // This lets us instantly look up days for any split without looping.
        const daysBySplit = {};
        for (const day of daysResult.rows) {
            if (!daysBySplit[day.split_id]) daysBySplit[day.split_id] = [];
            daysBySplit[day.split_id].push(day);
        }

        // Query 3: Fetch all exercises for ALL split days in one shot.
        // JOINs split_day_exercises → exercises (to get name/muscles/equipment)
        //                           → split_days  (to filter by split_id via ANY)
        // Result is flat rows: each row = one exercise assignment with exercise details merged in.
        const exercisesResult = await pool.query(
            `SELECT sde.*, e.name, e.muscle_groups, e.equipment
            FROM split_day_exercises sde
            JOIN exercises e ON sde.exercise_id = e.id
            JOIN split_days sd ON sde.split_day_id = sd.id
            WHERE sd.split_id = ANY($1)
            ORDER BY sde.split_day_id, sde.order_index`,
            [splitIds],
        );

        // Group the flat exercises array into an object keyed by split_day_id.
        // e.g. { 3: [benchPress, inclinePress], 5: [squat] }
        // Allows O(1) lookup of exercises for any given day when assembling the response.
        const exercisesByDay = {};
        for (const ex of exercisesResult.rows) {
            if (!exercisesByDay[ex.split_day_id])
                exercisesByDay[ex.split_day_id] = [];
            exercisesByDay[ex.split_day_id].push(ex);
        }

        // Assemble the final nested structure:
        // split → days[] → exercises[]
        // Also adds a derived `type` field ("rest" | "train") based on is_rest flag.
        return splits.map((split) => {
            const days = (daysBySplit[split.id] ?? []).map((day) => {
                const dayExercises = exercisesByDay[day.id] || [];
                return {
                    ...day,
                    type: day.is_rest ? "rest" : "train",
                    exercises: dayExercises,
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

// Fetches a single split by id with its days and exercises nested inside.
// Also verifies ownership via AND user_id = $2 so users can't fetch other users' splits.
// Same 3-query + grouping pattern as getSplitsByUserService, but scoped to one split.
const getSplitByIdService = async (splitId, userId) => {
    try {
        // Ownership check: only return if this split belongs to the requesting user
        const splitResult = await pool.query(
            "SELECT * FROM splits WHERE id = $1 AND user_id = $2",
            [splitId, userId],
        );

        if (!splitResult.rows[0]) {
            return null;
        }

        const daysResult = await pool.query(
            "SELECT * FROM split_days WHERE split_id = $1 ORDER BY day_of_week",
            [splitId],
        );

        // Join split_day_exercises with exercises to get exercise details (name, muscles, equipment)
        // alongside the assignment details (order_index, etc.)
        const exercisesResult = await pool.query(
            `SELECT sde.*, e.name, e.muscle_groups, e.equipment
            FROM split_day_exercises sde
            JOIN exercises e ON sde.exercise_id = e.id
            JOIN split_days sd ON sde.split_day_id = sd.id
            WHERE sd.split_id = $1
            ORDER BY sde.split_day_id, sde.order_index`,
            [splitId],
        );

        // Group flat exercise rows by split_day_id for O(1) lookup below
        const exercisesByDay = {};
        for (const ex of exercisesResult.rows) {
            if (!exercisesByDay[ex.split_day_id])
                exercisesByDay[ex.split_day_id] = [];
            exercisesByDay[ex.split_day_id].push(ex);
        }

        // Build each day object with its exercises array and derived `type` field
        const days = daysResult.rows.map((day) => {
            const dayExercises = exercisesByDay[day.id] || [];
            return {
                ...day,
                type: day.is_rest ? "rest" : "train",
                exercises: dayExercises,
            };
        });

        return { ...splitResult.rows[0], days };
    } catch (error) {
        throw new Error("Could not retrieve split", { cause: error });
    }
};

// Updates the name of a split. AND user_id = $3 ensures ownership check.
const updateSplitService = async (splitId, name, userId) => {
    try {
        const result = await pool.query(
            "UPDATE splits SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
            [name, splitId, userId],
        );

        return result.rows[0];
    } catch (error) {
        throw new Error("Could not update split", { cause: error });
    }
};

// Deletes a split by id. AND user_id = $2 ensures ownership check.
// Associated split_days and split_day_exercises are cascade-deleted by the DB schema.
const deleteSplitService = async (splitId, userId) => {
    try {
        await pool.query("DELETE FROM splits WHERE id = $1 AND user_id = $2", [
            splitId,
            userId,
        ]);
    } catch (error) {
        throw new Error("Could not delete split", { cause: error });
    }
};

// Sets a split as the active one for a user.
// Uses a transaction to ensure atomicity: first deactivate ALL splits,
// then activate the chosen one. If step 2 fails, step 1 is rolled back
// so the user is never left with zero active splits.
const setActiveSplitService = async (userId, splitId) => {
    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");

        // Step 1: Deactivate all splits for this user
        await client.query(
            "UPDATE splits SET is_active = false WHERE user_id = $1",
            [userId],
        );

        // Step 2: Activate the chosen split
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

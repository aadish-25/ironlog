import pool from "../db/connection.js";

// TODO 1: check the count of splits, if no split then make it active
const createSplitWithDays = async (userId, name) => {
    let client;

    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const created_split = await client.query(
            "INSERT INTO splits(user_id, name) VALUES($1, $2) RETURNING id;",
            [userId, name],
        );

        const splitId = created_split.rows[0].id;
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
                values.push(splitId, i, day);
                return `($${values.length - 2}, $${values.length - 1}, $${values.length})`;
            })
            .join(",");

        await client.query(
            `INSERT INTO split_days (split_id, day_of_week, label) VALUES ${rows}`,
            values,
        );

        await client.query("COMMIT");

        return { id: splitId, name };
    } catch (error) {
        if (client) await client.query("ROLLBACK");
        throw new Error("Could not create split, faced an issue");
    } finally {
        if (client) client.release();
    }
};

const getSplitsByUser = async (userId) => {
    try {
        const result = await pool.query(
            "SELECT * FROM splits WHERE user_id = $1",
            [userId],
        );
        return result.rows;
    } catch (error) {
        throw new Error("Could not retrieve splits for user");
    }
};

// BELONGS TO SPLITS_DAYS OR SPLITS_DAYS_EXERCISE
// const getSplitWithDetails = async (splitId) => {
//     // nested query: split + split_days + split_day_exercises + exercises
//     // q2: do we even need split_day_exercies and exercises here, assuming hwo the UI will look the user will mostl click the split_day which will
//     // take it to a page dedicated to that day and in that we will show the exercises n details, so this shud be a part of
//     // split_day service not split service
// };

const getSplitById = async (splitId) => {
    try {
        const splitResult = await pool.query(
            "SELECT * FROM splits WHERE id = $1",
            [splitId],
        );

        const daysResult = await pool.query(
            "SELECT * FROM split_days WHERE split_id = $1 ORDER BY day_of_week",
            [splitId],
        );

        return { ...splitResult.rows[0], days: daysResult.rows };
    } catch (error) {
        throw new Error("Could not retrieve split");
    }
};

const updateSplit = async (splitId, name) => {
    try {
        const result = await pool.query(
            "UPDATE splits SET name = $1 WHERE id = $2 RETURNING *",
            [name, splitId],
        );

        return result.rows[0];
    } catch (error) {
        throw new Error("Could not update split");
    }
};

const deleteSplit = async (splitId) => {
    try {
        await pool.query("DELETE FROM splits WHERE id = $1", [splitId]);
    } catch (error) {
        throw new Error("Could not delete split");
    }
};

const setActiveSplit = async (userId, splitId) => {
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
        throw new Error("Could not set active split");
    } finally {
        if (client) client.release();
    }
};

export {
    createSplitWithDays,
    getSplitsByUser,
    getSplitById,
    updateSplit,
    deleteSplit,
    setActiveSplit,
};

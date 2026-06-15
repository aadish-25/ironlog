import pool from "../db/connection.js";

const checkIsPR = async (userId, exerciseId, weightKg) => {
    const result = await pool.query(
        `SELECT MAX(weight_kg) AS max_weight 
         FROM sets 
         WHERE user_id = $1 AND exercise_id = $2`,
        [userId, exerciseId]
    );

    const currentMaxWeight = result.rows[0].max_weight;
    return currentMaxWeight === null || weightKg > currentMaxWeight;
};

const createSetService = async (
    userId,
    sessionId,
    exerciseId,
    setNumber,
    weightKg,
    reps
) => {
    try {
        const isPR = await checkIsPR(userId, exerciseId, weightKg);

        const result = await pool.query(
            `INSERT INTO sets 
            (session_id, exercise_id, user_id, set_number, weight_kg, reps, is_pr)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [sessionId, exerciseId, userId, setNumber, weightKg, reps, isPR]
        );

        return result.rows[0];
    } catch (error) {
        throw new Error("Could not log set");
    }
};

const updateSetService = async (setId, updateData) => {
    try {
        const allowedFields = ["weight_kg", "reps"];
        const updateKeys = Object.keys(updateData);

        const invalidKey = updateKeys.find(
            (key) => !allowedFields.includes(key)
        );

        if (invalidKey) {
            throw new Error(`Invalid update parameter: ${invalidKey}`);
        }

        if (updateKeys.length === 0) {
            throw new Error("No valid fields provided");
        }

        const setClauses = [];
        const values = [];

        updateKeys.forEach((key, index) => {
            setClauses.push(`${key} = $${index + 1}`);
            values.push(updateData[key]);
        });

        values.push(setId);

        const result = await pool.query(
            `UPDATE sets 
             SET ${setClauses.join(", ")}
             WHERE id = $${values.length}
             RETURNING *`,
            values
        );

        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

const deleteSetService = async (setId) => {
    try {
        await pool.query(`DELETE FROM sets WHERE id = $1`, [setId]);
    } catch (error) {
        throw new Error("Could not delete set");
    }
};

export { createSetService, updateSetService, deleteSetService };
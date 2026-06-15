import pool from "../db/connection.js";

const addExerciseService = async (splitDayId, exerciseId, orderIndex) => {
    try {
        const result = await pool.query(
            `
            INSERT INTO split_day_exercises (
                split_day_id,
                exercise_id,
                order_index
            )
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [splitDayId, exerciseId, orderIndex],
        );
        return result.rows[0];
    } catch (error) {
        throw new Error("Could not add exercise to split day", { cause: error });
    }
};

const removeExerciseService = async (exerciseId) => {
    try {
        const result = await pool.query(
            `DELETE FROM split_day_exercises WHERE id = $1`,
            [exerciseId],
        );
    } catch (error) {
        throw new Error("Could not remove exercise from split day", { cause: error });
    }
};

const reorderExerciseService = async (splitDayExerciseId, newOrderIndex) => {
    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const currentResult = await client.query(
            `
            SELECT *
            FROM split_day_exercises
            WHERE id = $1
            `,
            [splitDayExerciseId],
        );

        const row = currentResult.rows[0];

        if (!row) {
            throw new Error("Exercise not found");
        }

        const currentOrderIndex = row.order_index;
        const splitDayId = row.split_day_id;

        if (currentOrderIndex === newOrderIndex) {
            await client.query("COMMIT");
            return row;
        }

        if (newOrderIndex < currentOrderIndex) {
            await client.query(
                `
                UPDATE split_day_exercises
                SET order_index = order_index + 1
                WHERE split_day_id = $1
                  AND order_index >= $2
                  AND order_index < $3
                `,
                [splitDayId, newOrderIndex, currentOrderIndex],
            );
        } else {
            await client.query(
                `
                UPDATE split_day_exercises
                SET order_index = order_index - 1
                WHERE split_day_id = $1
                  AND order_index > $2
                  AND order_index <= $3
                `,
                [splitDayId, currentOrderIndex, newOrderIndex],
            );
        }

        const result = await client.query(
            `
            UPDATE split_day_exercises
            SET order_index = $1
            WHERE id = $2
            RETURNING *
            `,
            [newOrderIndex, splitDayExerciseId],
        );

        await client.query("COMMIT");

        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export { addExerciseService, removeExerciseService, reorderExerciseService };

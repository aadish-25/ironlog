import pool from "../db/connection.js";

const addExerciseService = async (splitDayId, exerciseIds, startingOrderIndex) => {
    let client;
    try {
        // If single ID passed, convert to array
        const ids = Array.isArray(exerciseIds) ? exerciseIds : [exerciseIds];
        
        client = await pool.connect();
        await client.query("BEGIN");

        const splitDayResult = await client.query(
            "SELECT is_rest FROM split_days WHERE id = $1",
            [splitDayId]
        );

        if (splitDayResult.rows.length === 0) {
            throw new Error("Split day not found");
        }

        if (splitDayResult.rows[0].is_rest) {
            throw new Error("Cannot add exercises to a rest day");
        }
        
        const results = [];
        for (let i = 0; i < ids.length; i++) {
            const result = await client.query(
                `
                INSERT INTO split_day_exercises (
                    split_day_id,
                    exercise_id,
                    order_index
                )
                VALUES ($1, $2, $3)
                RETURNING *
                `,
                [splitDayId, ids[i], startingOrderIndex + i],
            );
            results.push(result.rows[0]);
        }
        
        await client.query("COMMIT");
        return results;
    } catch (error) {
        if (client) await client.query("ROLLBACK");
        throw new Error("Could not add exercises to split day", { cause: error });
    } finally {
        if (client) client.release();
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

        const splitDayResult = await client.query(
            "SELECT is_rest FROM split_days WHERE id = $1",
            [splitDayId]
        );
        if (splitDayResult.rows.length > 0 && splitDayResult.rows[0].is_rest) {
            throw new Error("Cannot reorder exercises on a rest day");
        }

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

import pool from "../db/connection.js";
import { delCache } from "../lib/redis.js";

const addExerciseService = async (
    splitDayId,
    exerciseIds,
    startingOrderIndex,
    userId,
) => {
    let client;
    try {
        // If single ID passed, convert to array
        const ids = Array.isArray(exerciseIds) ? exerciseIds : [exerciseIds];

        client = await pool.connect();
        await client.query("BEGIN");

        const splitDayResult = await client.query(
            `SELECT sd.is_rest 
             FROM split_days sd
             JOIN splits s ON sd.split_id = s.id
             WHERE sd.id = $1 AND s.user_id = $2`,
            [splitDayId, userId],
        );

        if (splitDayResult.rows.length === 0) {
            throw new Error("Split day not found");
        }

        if (splitDayResult.rows[0].is_rest) {
            throw new Error("Cannot add exercises to a rest day");
        }

        if (ids.length === 0) {
            await client.query("COMMIT");
            return [];
        }

        // Build a single bulk INSERT statement:
        // INSERT INTO split_day_exercises (split_day_id, exercise_id, order_index)
        // VALUES ($1, $2, $3), ($1, $4, $5), ...
        const valueClauses = [];
        const params = [splitDayId];
        for (let i = 0; i < ids.length; i++) {
            const exParam = params.length + 1;
            const orderParam = params.length + 2;
            params.push(ids[i], startingOrderIndex + i);
            valueClauses.push(`($1, $${exParam}, $${orderParam})`);
        }

        const insertQuery = `
            INSERT INTO split_day_exercises (
                split_day_id,
                exercise_id,
                order_index
            )
            VALUES ${valueClauses.join(", ")}
            RETURNING *
        `;

        const result = await client.query(insertQuery, params);
        await client.query("COMMIT");
        await delCache(`splits:${userId}`);
        return result.rows;
    } catch (error) {
        if (client) await client.query("ROLLBACK");
        throw new Error("Could not add exercises to split day", {
            cause: error,
        });
    } finally {
        if (client) client.release();
    }
};

const removeExerciseService = async (exerciseId, userId) => {
    try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(exerciseId);
        if (!isUuid) {
            return;
        }
        const result = await pool.query(
            `DELETE FROM split_day_exercises sde
             USING split_days sd, splits s
             WHERE sde.split_day_id = sd.id 
               AND sd.split_id = s.id 
               AND sde.id = $1 
               AND s.user_id = $2`,
            [exerciseId, userId],
        );
        await delCache(`splits:${userId}`);
    } catch (error) {
        throw new Error("Could not remove exercise from split day", {
            cause: error,
        });
    }
};

const reorderExerciseService = async (
    splitDayExerciseId,
    newOrderIndex,
    userId,
) => {
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
        await delCache(`splits:${userId}`);

        return result.rows[0];
    } catch (error) {
        if (client) await client.query("ROLLBACK");
        throw error;
    } finally {
        if (client) client.release();
    }
};

export { addExerciseService, removeExerciseService, reorderExerciseService };

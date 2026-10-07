import pool from "../db/connection.js";
import { getCache, setCache } from "../lib/redis.js";

const getExercisesService = async (muscleGroups, equipment) => {
    try {
        const hasFilters =
            (muscleGroups && muscleGroups.length > 0) ||
            (equipment && equipment.length > 0);
        const cacheKey = "exercises:all";

        // If no filter parameters, check Redis cache first (0 DB queries!)
        if (!hasFilters) {
            const cached = await getCache(cacheKey);
            if (cached) return cached;
        }

        const values = [];
        let query = "SELECT * FROM exercises";

        const conditions = [];

        if (muscleGroups && muscleGroups.length > 0) {
            values.push(muscleGroups);
            conditions.push(`muscle_groups && $${values.length}`);
        }

        if (equipment && equipment.length > 0) {
            values.push(equipment);
            conditions.push(`equipment && $${values.length}`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += " ORDER BY name ASC";

        const result = await pool.query(query, values);

        // Cache the unfiltered master exercise list for 7 days
        if (!hasFilters && result.rows.length > 0) {
            await setCache(cacheKey, result.rows, 86400 * 7);
        }

        return result.rows;
    } catch (error) {
        throw new Error("Could not fetch exercises", { cause: error });
    }
};

const getExerciseByIdService = async (id) => {
    try {
        const result = await pool.query(
            "SELECT * FROM exercises WHERE id = $1",
            [id],
        );
        return result.rows[0];
    } catch (error) {
        throw new Error("Could not fetch exercise by id", { cause: error });
    }
};

const getExerciseProgressService = async (userId, exerciseId) => {
    try {
        const result = await pool.query(
            `SELECT 
                sessions.date AS session_date, 
                MAX(sets.weight_kg) AS max_weight, 
                SUM(sets.weight_kg * sets.reps) AS total_volume,
                BOOL_OR(sets.is_pr) AS pr_hit
            FROM sets 
            JOIN sessions ON sets.session_id = sessions.id 
            WHERE sets.exercise_id = $1 AND sets.user_id = $2 
            GROUP BY sessions.date 
            ORDER BY sessions.date ASC;`,
            [exerciseId, userId],
        );
        return result.rows.map((r) => ({
            ...r,
            max_weight: Number(r.max_weight),
            total_volume: Number(r.total_volume),
        }));
    } catch (error) {
        throw new Error("Could not fetch exercise progress", { cause: error });
    }
};

export {
    getExercisesService,
    getExerciseByIdService,
    getExerciseProgressService,
};

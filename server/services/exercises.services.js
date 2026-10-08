import crypto from "crypto";
import pool from "../db/connection.js";
import { getCache, setCache, delCache } from "../lib/redis.js";

const rebuildExercisesCache = async () => {
    await delCache("exercises:all");
    const result = await pool.query("SELECT * FROM exercises ORDER BY name ASC");
    if (result.rows.length > 0) {
        await setCache("exercises:all", result.rows);
    }
    return result.rows;
};

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

        // Cache the unfiltered master exercise list with unlimited TTL
        if (!hasFilters && result.rows.length > 0) {
            await setCache(cacheKey, result.rows);
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

const createExerciseService = async (data) => {
    try {
        const id = data.id || crypto.randomUUID();
        const {
            name,
            muscle_groups = [],
            equipment = [],
            description = "",
            form_guide = [],
            picture_url = null,
            demo_url = null,
            demo_type = null,
        } = data;

        if (!name) throw new Error("Exercise name is required");

        const result = await pool.query(
            `INSERT INTO exercises (
                id, name, muscle_groups, equipment, description, form_guide, picture_url, demo_url, demo_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
                id,
                name,
                muscle_groups,
                equipment,
                description,
                JSON.stringify(form_guide),
                picture_url,
                demo_url,
                demo_type,
            ],
        );

        // Delete cache and immediately rebuild
        await rebuildExercisesCache();

        return result.rows[0];
    } catch (error) {
        throw new Error("Could not create exercise", { cause: error });
    }
};

const updateExerciseService = async (id, data) => {
    try {
        const allowedFields = [
            "name",
            "muscle_groups",
            "equipment",
            "description",
            "form_guide",
            "picture_url",
            "demo_url",
            "demo_type",
        ];

        const setClauses = [];
        const values = [];

        for (const [key, val] of Object.entries(data)) {
            if (allowedFields.includes(key)) {
                values.push(key === "form_guide" ? JSON.stringify(val) : val);
                setClauses.push(`${key} = $${values.length}`);
            }
        }

        if (setClauses.length === 0) {
            throw new Error("No valid fields provided for update");
        }

        values.push(id);
        const query = `
            UPDATE exercises
            SET ${setClauses.join(", ")}, updated_at = now()
            WHERE id = $${values.length}
            RETURNING *
        `;

        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            throw new Error("Exercise not found");
        }

        // Delete cache and immediately rebuild
        await rebuildExercisesCache();

        return result.rows[0];
    } catch (error) {
        throw new Error("Could not update exercise", { cause: error });
    }
};

const deleteExerciseService = async (id) => {
    try {
        const result = await pool.query(
            "DELETE FROM exercises WHERE id = $1 RETURNING *",
            [id],
        );

        if (result.rows.length === 0) {
            throw new Error("Exercise not found");
        }

        // Delete cache and immediately rebuild
        await rebuildExercisesCache();

        return result.rows[0];
    } catch (error) {
        throw new Error("Could not delete exercise", { cause: error });
    }
};

export {
    getExercisesService,
    getExerciseByIdService,
    getExerciseProgressService,
    createExerciseService,
    updateExerciseService,
    deleteExerciseService,
    rebuildExercisesCache,
};

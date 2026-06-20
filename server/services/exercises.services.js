import pool from "../db/connection.js";

const getExercisesService = async (muscleGroups, equipment, userId) => {
    try {
        const values = [];
        let query = "";

        if (userId) {
            values.push(userId);
            query =
                "SELECT exercises.*, (SELECT MAX(weight_kg) FROM sets WHERE exercise_id = exercises.id AND user_id = $1) AS pr_kg FROM exercises";
        } else {
            query = "SELECT exercises.*, NULL as pr_kg FROM exercises";
        }

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

        const result = await pool.query(query, values);
        return result.rows.map((r) => ({
            ...r,
            pr_kg: r.pr_kg ? Number(r.pr_kg) : null,
        }));
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

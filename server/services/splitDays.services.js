import pool from "../db/connection.js";

const updateSplitDayService = async (id, label, is_rest, userId) => {
    try {
        const result = await pool.query(
            `UPDATE split_days 
             SET label = COALESCE($1, split_days.label), 
                 is_rest = COALESCE($2, split_days.is_rest) 
             FROM splits 
             WHERE split_days.split_id = splits.id 
               AND split_days.id = $3 
               AND splits.user_id = $4 
             RETURNING split_days.*`,
            [label !== undefined ? label : null, is_rest !== undefined ? is_rest : null, id, userId],
        );
        if (!result.rows[0]) throw new Error("Split day not found, or not authorized");
        return result.rows[0];
    } catch (error) {
        throw new Error("Could not update split day", { cause: error });
    }
};

export { updateSplitDayService };

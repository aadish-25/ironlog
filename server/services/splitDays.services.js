import pool from "../db/connection.js";

const updateSplitDayService = async (id, label, is_rest) => {
    try {
        const result = await pool.query(
            "UPDATE split_days SET label = COALESCE($1, label), is_rest = COALESCE($2, is_rest) WHERE id = $3 RETURNING *",
            [label !== undefined ? label : null, is_rest !== undefined ? is_rest : null, id],
        );
        if (!result.rows[0]) throw new Error("Split day not found, invalid ID");
        return result.rows[0];
    } catch (error) {
        throw new Error("Could not update split day", { cause: error });
    }
};

export { updateSplitDayService };

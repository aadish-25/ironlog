import pool from "../db/connection.js";

const updateSplitDay = async (id, label) => {
    try {
        const result = await pool.query(
            "UPDATE split_days SET label = $1 WHERE id = $2 RETURNING *",
            [label, id],
        );
        if (!result.rows[0]) throw new Error("Split day not found, invalid ID");
        return result.rows[0];
    } catch (error) {
        throw new Error(`Error while updating/renaming label: ${error}`);
    }
};

export { updateSplitDay };

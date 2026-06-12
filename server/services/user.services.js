const getUserById = async (id) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
};

const updateUser = async (id, data) => {
    const allowList = ["name", "profile_picture_url", "preferred_workout_time"];
    const keys = Object.keys(data);

    const invalidKey = reqKeys.find((key) => !allowList.includes(key));

    if (invalidKey) {
        throw new Error(`Invalid update parameter: ${invalidKey}`);
    }

    if (keys.length === 0) {
        throw new Error("No valid fields provided for update");
    }

    // building sql query
    const setClauses = [];
    const values = [];

    keys.forEach((key, index) => {
        setClauses.push(`${key} = $${index + 1}`);
        values.push(data[key]);
    });

    // Keys are valid, extract and query

    const query = `
        UPDATE users
        SET ${setClauses.join(", ")}
        WHERE id = $${values.length}
        RETURNING *;
    `;

    const result = await pool.query(query, values);

    return result.rows[0];
};

export { getUserById, updateUser };

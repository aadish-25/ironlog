import { getAuth } from "@clerk/express";
import pool from "../db/connection.js";

const auth = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({
                message: "Unathorized",
            });
        }

        let result = await pool.query(
            "SELECT id, clerk_id from users WHERE clerk_id = $1",
            [userId],
        );
        let user = result.rows[0];

        if (!user) {
            await pool.query(
                "INSERT INTO users (clerk_id) VALUES ($1) ON CONFLICT (clerk_id) DO NOTHING",
                [userId],
            );

            let new_result = await pool.query(
                "SELECT id, clerk_id from users WHERE clerk_id = $1",
                [userId],
            );
            user = new_result.rows[0];
        }

        req.auth = { userId };
        req.user = user;

        next();
    } catch (err) {
        console.error("Auth middleware error: ", err);

        return res.status(500).json({ message: "Internal server error" });
    }
};

export default auth;

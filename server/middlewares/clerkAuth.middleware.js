import { getAuth, clerkClient } from "@clerk/express";
import pool from "../db/connection.js";

const auth = async (req, res, next) => {
    try {
        // Clerk attaches this "userId" automatically from the token to the request headers
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({
                message: "Unathorized",
            });
        }

        let result = await pool.query(
            "SELECT * FROM users WHERE clerk_id = $1",
            [userId],
        );
        let user = result.rows[0];

        if (!user) {
            const clerkUser = await clerkClient.users.getUser(userId);

            const name =
                `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();

            await pool.query(
                "INSERT INTO users (clerk_id, name) VALUES ($1, $2) ON CONFLICT (clerk_id) DO NOTHING",
                [userId, name],
            );

            let new_result = await pool.query(
                "SELECT * FROM users WHERE clerk_id = $1",
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

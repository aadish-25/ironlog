import { getAuth, clerkClient } from "@clerk/express";
import pool from "../db/connection.js";

// In-memory user cache to avoid round-trips to remote Neon DB on every request
const userCache = new Map();
const USER_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export const invalidateUserCache = (clerkId) => {
    if (clerkId) userCache.delete(clerkId);
};

const auth = async (req, res, next) => {
    try {
        // Clerk attaches this "userId" automatically from the token to the request headers
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const cached = userCache.get(userId);
        if (cached && Date.now() - cached.timestamp < USER_CACHE_TTL_MS) {
            req.auth = { userId };
            req.user = cached.user;
            return next();
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

        if (user) {
            userCache.set(userId, { user, timestamp: Date.now() });
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

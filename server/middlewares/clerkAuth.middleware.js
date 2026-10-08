import { getAuth, clerkClient } from "@clerk/express";
import pool from "../db/connection.js";
import { getCache, setCache, delCache } from "../lib/redis.js";

export const invalidateUserCache = async (clerkId) => {
    if (clerkId) {
        await delCache(`user:${clerkId}`);
    }
};

const auth = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // 1. Check Upstash Redis (~1 ms)
        const cachedUser = await getCache(`user:${userId}`);
        if (cachedUser) {
            req.auth = { userId };
            req.user = cachedUser;
            return next();
        }

        // 2. Fallback: Query Neon Database
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

            const newResult = await pool.query(
                "SELECT * FROM users WHERE clerk_id = $1",
                [userId],
            );
            user = newResult.rows[0];
        }

        // 3. Save to Redis (TTL = 24 hours)
        if (user) {
            await setCache(`user:${userId}`, user, 86400);
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

import { getAuth, clerkClient } from "@clerk/express";
import pool from "../db/connection.js";
import { getCache, setCache, delCache } from "../lib/redis.js";

// Level 1: In-memory cache for ultra-fast hits during the same serverless invocation
const memoryUserCache = new Map();
const MEMORY_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const invalidateUserCache = async (clerkId) => {
    if (clerkId) {
        memoryUserCache.delete(clerkId);
        await delCache(`user:${clerkId}`);
    }
};

const auth = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // 1. Check Level 1 In-Memory Cache (0 ms)
        const inMemory = memoryUserCache.get(userId);
        if (inMemory && Date.now() - inMemory.timestamp < MEMORY_TTL_MS) {
            req.auth = { userId };
            req.user = inMemory.user;
            return next();
        }

        // 2. Check Level 2 Upstash Redis (~1 ms)
        const cachedUser = await getCache(`user:${userId}`);
        if (cachedUser) {
            memoryUserCache.set(userId, {
                user: cachedUser,
                timestamp: Date.now(),
            });
            req.auth = { userId };
            req.user = cachedUser;
            return next();
        }

        // 3. Fallback: Query Neon Database
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

        // 4. Save to both caches (Redis TTL = 1 hour)
        if (user) {
            memoryUserCache.set(userId, { user, timestamp: Date.now() });
            await setCache(`user:${userId}`, user, 3600);
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

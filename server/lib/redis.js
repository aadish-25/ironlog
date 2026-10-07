import { Redis } from "@upstash/redis";

let redisClient = null;

if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
) {
    redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
} else {
    console.warn("[Redis] Credentials missing. Running in bypass mode.");
}

/**
 * Retrieve JSON value from Redis. Returns null on miss or error.
 */
export async function getCache(key) {
    if (!redisClient) return null;
    try {
        const data = await redisClient.get(key);
        return data ?? null;
    } catch (err) {
        console.warn(`[Redis] GET error for "${key}":`, err.message);
        return null;
    }
}

/**
 * Store JSON value in Redis with optional TTL (in seconds).
 */
export async function setCache(key, value, ttlSeconds = null) {
    if (!redisClient) return;
    try {
        if (ttlSeconds && ttlSeconds > 0) {
            await redisClient.set(key, value, { ex: ttlSeconds });
        } else {
            await redisClient.set(key, value);
        }
    } catch (err) {
        console.warn(`[Redis] SET error for "${key}":`, err.message);
    }
}

/**
 * Delete one or more keys from Redis.
 */
export async function delCache(key) {
    if (!redisClient) return;
    try {
        await redisClient.del(key);
    } catch (err) {
        console.warn(`[Redis] DEL error for "${key}":`, err.message);
    }
}

export default redisClient;

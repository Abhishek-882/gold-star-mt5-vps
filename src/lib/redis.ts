/**
 * Upstash Redis client — shared singleton for the Gold Star MT5 dashboard.
 *
 * Uses @upstash/redis (the official Upstash SDK) which works natively in
 * Next.js Edge / Serverless runtimes with zero Node.js dependencies.
 *
 * Required env vars (set in Vercel project settings + .env.local for local dev):
 *   UPSTASH_REDIS_REST_URL   — e.g. https://trusting-moose-99977.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN — REST token from Upstash console
 */

import { Redis } from '@upstash/redis';

let _redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (_redis) return _redis;

  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/+$/, '');
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      '[redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. ' +
        'State will fall back to in-memory (not suitable for production).'
    );
    return null;
  }

  _redis = new Redis({ url, token });
  return _redis;
}

/**
 * Convenience: get a typed value from Redis.
 * Returns null if Redis is unavailable or key doesn't exist.
 */
export async function redisGet<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) return null;
  try {
    return await redis.get<T>(key);
  } catch (err) {
    console.error(`[redis] GET ${key} failed:`, err);
    return null;
  }
}

/**
 * Convenience: set a value in Redis with optional TTL (seconds).
 * Silent no-op if Redis is unavailable.
 */
export async function redisSet(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  try {
    if (ttlSeconds) {
      await redis.set(key, value, { ex: ttlSeconds });
    } else {
      await redis.set(key, value);
    }
  } catch (err) {
    console.error(`[redis] SET ${key} failed:`, err);
  }
}

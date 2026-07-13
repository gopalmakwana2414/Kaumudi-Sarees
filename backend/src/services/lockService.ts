import { getRedisClient, checkRedisConnection } from "../config/redis.js";
import logger from "../utils/logger.js";
import crypto from "crypto";

// Unique token for this instance's locking requests
const lockTokens = new Map<string, string>();

// Local in-memory lock fallback structure
interface LocalLock {
  token: string;
  expiresAt: number;
}
const localLocks = new Map<string, LocalLock>();

// Lua script to release a Redis lock atomically if the value matches
const RELEASE_LUA_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

/**
 * Attempts to acquire a lock for a given resource key
 * @param resource The resource to lock (e.g. Razorpay Order ID)
 * @param ttlMs Time-to-live in milliseconds
 * @returns boolean indicating success
 */
export const acquireLock = async (resource: string, ttlMs: number = 30000): Promise<boolean> => {
  const lockKey = `lock:payment:${resource}`;
  const token = crypto.randomBytes(16).toString("hex");
  const isProd = process.env.NODE_ENV === "production";

  if (checkRedisConnection()) {
    const redis = getRedisClient();
    if (redis) {
      try {
        // SET key value PX ttl NX -> Atomic lock acquisition
        const result = await redis.set(lockKey, token, "PX", ttlMs, "NX");
        if (result === "OK") {
          lockTokens.set(lockKey, token);
          logger.info(`🔒 [Redis Lock] Acquired lock for ${resource}`);
          return true;
        }
        logger.warn(`⚠️ [Redis Lock] Failed to acquire lock for ${resource} (busy)`);
        return false;
      } catch (err: any) {
        logger.error(`❌ [Redis Lock] Error acquiring lock: ${err.message}`);
        if (isProd) {
          throw new Error(`Locking service unavailable (Redis error: ${err.message})`);
        }
      }
    }
  }

  // If in production and Redis is not connected, fail immediately to prevent race conditions.
  if (isProd) {
    logger.error(`❌ [Redis Lock] Lock acquisition blocked: Redis is disconnected in production`);
    throw new Error("Locking service unavailable (Redis disconnected)");
  }

  // Local In-Memory Fallback for development/testing
  const now = Date.now();
  const existing = localLocks.get(lockKey);

  if (existing && existing.expiresAt > now) {
    logger.warn(`⚠️ [Local Lock] Failed to acquire lock for ${resource} (busy)`);
    return false;
  }

  // Either no lock exists, or the lock has expired
  localLocks.set(lockKey, {
    token,
    expiresAt: now + ttlMs,
  });
  lockTokens.set(lockKey, token);
  logger.info(`🔒 [Local Lock] Acquired lock for ${resource}`);
  return true;
};

/**
 * Releases the lock for a given resource key
 * @param resource The resource to unlock
 * @returns boolean indicating success
 */
export const releaseLock = async (resource: string): Promise<boolean> => {
  const lockKey = `lock:payment:${resource}`;
  const token = lockTokens.get(lockKey);
  const isProd = process.env.NODE_ENV === "production";

  if (!token) {
    logger.warn(`⚠️ No lock token found locally for ${resource}`);
    return false;
  }

  if (checkRedisConnection()) {
    const redis = getRedisClient();
    if (redis) {
      try {
        // Execute Lua script to release lock atomically
        const result = await redis.eval(RELEASE_LUA_SCRIPT, 1, lockKey, token);
        lockTokens.delete(lockKey);
        logger.info(`🔓 [Redis Lock] Released lock for ${resource}`);
        return Number(result) === 1;
      } catch (err: any) {
        logger.error(`❌ [Redis Lock] Error releasing lock: ${err.message}`);
        if (isProd) {
          lockTokens.delete(lockKey);
          return false;
        }
      }
    }
  }

  if (isProd) {
    logger.error(`❌ [Redis Lock] Failed to release lock for ${resource}: Redis is disconnected`);
    lockTokens.delete(lockKey);
    return false;
  }

  // Local In-Memory Fallback
  const existing = localLocks.get(lockKey);
  if (existing && existing.token === token) {
    localLocks.delete(lockKey);
    lockTokens.delete(lockKey);
    logger.info(`🔓 [Local Lock] Released lock for ${resource}`);
    return true;
  }

  logger.warn(`⚠️ [Local Lock] Lock token mismatch or already expired for ${resource}`);
  return false;
};

export default {
  acquireLock,
  releaseLock,
};

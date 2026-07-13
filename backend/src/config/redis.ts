import Redis from "ioredis";
import { env } from "./env.js";
import logger from "../utils/logger.js";

let redis: Redis | null = null;
let isRedisConnected = false;

const initRedis = () => {
  const connectionString = env.REDIS_URL;
  const options: any = {
    maxRetriesPerRequest: null, // Required for BullMQ compatibility
    retryStrategy(times: number) {
      // Exponential backoff, capping at 5 seconds
      return Math.min(times * 100, 5000);
    },
  };

  if (connectionString) {
    logger.info("Initializing Redis with connection URL...");
    redis = new Redis(connectionString, options);
  } else if (env.REDIS_HOST) {
    logger.info(`Initializing Redis on ${env.REDIS_HOST}:${env.REDIS_PORT}...`);
    redis = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      ...options,
    });
  }

  if (redis) {
    redis.on("connect", () => {
      isRedisConnected = true;
      logger.info("📡 Redis Connected Successfully");
    });

    let lastLoggedErrorTime = 0;
    const ERROR_LOG_THROTTLE_MS = 60000;
    let lastErrorMsg = "";

    redis.on("error", (err: any) => {
      const wasConnected = isRedisConnected;
      isRedisConnected = false;
      
      const now = Date.now();
      if (wasConnected || err.message !== lastErrorMsg || now - lastLoggedErrorTime > ERROR_LOG_THROTTLE_MS) {
        logger.warn(`⚠️ Redis Connection Error: ${err.message}. Degrading to local memory fallbacks.`);
        lastLoggedErrorTime = now;
        lastErrorMsg = err.message;
      }
    });
  } else {
    logger.warn("⚠️ No Redis host or URL configured. Running on local memory fallbacks.");
  }
};

initRedis();

export const getRedisClient = (): Redis | null => {
  return redis;
};

export const checkRedisConnection = (): boolean => {
  return isRedisConnected;
};

export default redis;

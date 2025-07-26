
import redisClient from '../config/redis.js';
import { createQueryHash } from '../utils/index.js';
import { CACHE_TTL } from '../constants/index.js';

/**
 * Caches responses based on the request URL and query parameters
 * @param {number} ttl - Cache time-to-live in seconds
 */
export const cacheMiddleware = (ttl = CACHE_TTL) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from request URL and query params
    const cacheKey = `cache:${req.originalUrl}:${createQueryHash(req.query)}`;

    try {
      const cachedResponse = await redisClient.get(cacheKey);

      if (cachedResponse) {
        return res.status(200).json(JSON.parse(cachedResponse));
      }

      // Store the original send function
      const originalSend = res.send;

      // Override res.send to cache the response before sending
      res.send = function (body) {
        try {
          // Only cache successful responses
          if (res.statusCode >= 200 && res.statusCode < 300) {
            redisClient.setEx(cacheKey, ttl, body);
          }
        } catch (err) {
          console.error('Redis cache error:', err);
        }

        // Call the original send function
        return originalSend.call(this, body);
      };

      next();
    } catch (err) {
      console.error('Cache middleware error:', err);
      next(); // Continue without caching
    }
  };
};

/**
 * Clears cache by pattern
 * @param {string} pattern - Pattern to match cache keys
 */
export const clearCache = async (pattern) => {
  try {
    const keys = [];
    for await (const key of redisClient.scanIterator({ MATCH: pattern })) {
      keys.push(key);
    }
    if (keys.length) {
      await redisClient.del(keys);
      console.log(`Cleared ${keys.length} cache entries matching ${pattern}`);
    }
  } catch (err) {
    console.error('Clear cache error:', err);
  }
};

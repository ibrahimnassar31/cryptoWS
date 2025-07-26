import { createClient } from 'redis';
import { REDIS_URL } from '../constants/index.js';


const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('reconnecting', () => {
  console.log('Redis client reconnecting...');
});


export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('Connected to Redis');
    }
  } catch (err) {
    console.error('Redis connection error:', err);
  }
};


export const invalidateCacheByPattern = async (pattern) => {
  if (!redisClient.isOpen) return 0;

  try {
    const keys = [];
    for await (const key of redisClient.scanIterator({ MATCH: pattern })) {
      keys.push(key);
    }

    if (keys.length) {
      await redisClient.del(keys);
      return keys.length;
    }
    return 0;
  } catch (error) {
    console.error('Error invalidating cache:', error);
    return 0;
  }
};


export const invalidateByTag = async (tag) => {
  return await invalidateCacheByPattern(`${tag}*`);
};

export default redisClient;

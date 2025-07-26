
export const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
export const JWT_EXPIRY = '7d';

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ibrahimnassar870:ibrahim2003@crypto-tracker.h184cbj.mongodb.net/';

export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const CACHE_TTL = 30; 

export const COINPAPRIKA_API_URL = 'https://api.coinpaprika.com/v1/tickers';

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; 
export const RATE_LIMIT_MAX_REQUESTS = 100;

export const WS_UPDATE_INTERVAL = 10000; 

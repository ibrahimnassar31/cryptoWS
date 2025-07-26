import CryptoTicker from '../models/CryptoTicker.js';
import { fetchCryptoTickers } from './coinpaprikaService.js';
import redisClient from '../config/redis.js';
import { createQueryHash, createCacheKey, createPaginationMeta } from '../utils/index.js';
import { CACHE_TTL } from '../constants/index.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * Get paginated, filtered, sorted list of tickers
 * @param {Object} query - Query parameters for filtering and pagination
 * @returns {Object} Paginated ticker response
 */
export const getTickers = async (query) => {
  const { page = 1, limit = 20, sort = 'rank', symbol } = query;

  // Generate cache key based on query parameters
  const cacheKey = createCacheKey('tickers', createQueryHash({ page, limit, sort, symbol }));

  // Check cache first
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    // Make sure we have updated data
    await updateTickers();

    // Build filter
    const filter = {};
    if (symbol) {
      filter.symbol = { $regex: `^${symbol}$`, $options: 'i' };
    }

    // Build sort options
    const sortOptions = {};
    if (['price', 'market_cap', 'rank'].includes(sort)) {
      sortOptions[sort] = 1;
    } else {
      sortOptions['rank'] = 1;
    }

    // Fetch data with pagination
    const total = await CryptoTicker.countDocuments(filter);
    const dbTickers = await CryptoTicker.find(filter)
      .sort(sortOptions)
      .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
      .limit(parseInt(limit, 10));

    // Build response with pagination metadata
    const response = {
      data: dbTickers,
      ...createPaginationMeta(query, total)
    };

    // Cache results
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(response));
    return response;
  } catch (error) {
    console.error('Error fetching tickers:', error);
    throw new ApiError('Failed to fetch tickers', 500);
  }
};

/**
 * Get a single ticker by ID
 * @param {string} id - Ticker ID
 * @returns {Object|null} Ticker or null if not found
 */
export const getTickerById = async (id) => {
  if (!id) {
    throw new ApiError('Ticker ID is required', 400);
  }

  const cacheKey = createCacheKey('ticker', id);

  // Check cache first
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const ticker = await CryptoTicker.findOne({ id });
    if (!ticker) {
      return null;
    }

    // Cache result
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(ticker));
    return ticker;
  } catch (error) {
    console.error(`Error fetching ticker ${id}:`, error);
    throw new ApiError('Failed to fetch ticker', 500);
  }
};

/**
 * Update tickers from external API
 * @returns {Promise<void>}
 */
export const updateTickers = async () => {
  try {
    const tickers = await fetchCryptoTickers();
    if (tickers.length) {
      await Promise.all(
        tickers.map(async (ticker) => {
          await CryptoTicker.findOneAndUpdate(
            { id: ticker.id },
            { $set: ticker },
            { upsert: true, new: true }
          );
        })
      );
    }
  } catch (error) {
    console.error('Error updating tickers:', error);
    throw new ApiError('Failed to update tickers from external API', 500);
  }
};

/**
 * Update a single ticker (placeholder for future implementation)
 * @param {string} id - Ticker ID
 * @param {Object} data - Updated ticker data
 * @returns {Object|null} Updated ticker or null if not found
 */
export const updateTicker = async (id, data) => {
  try {
    const ticker = await CryptoTicker.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true }
    );

    if (ticker) {
      // Invalidate caches
      await redisClient.del(createCacheKey('ticker', id));
      await invalidateByTag('tickers');
    }

    return ticker;
  } catch (error) {
    console.error(`Error updating ticker ${id}:`, error);
    throw new ApiError('Failed to update ticker', 500);
  }
};
